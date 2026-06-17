import mongoose from 'mongoose';
import Product from '../../shared/models/product/product.model';
import Department from '../../shared/models/department/department.model';
import Stock from '../../shared/models/stock/stock.model';
import StockMovement from '../../shared/models/stockMovement/stockMovement.model';
import Brand from '../../shared/models/brand/brand.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';

export interface ImportProductInput {
  sku: string;
  barcode: string;
  name: string;
  description?: string;
  categoryName: string;
  brandId?: string;
  costPrice: number;
  price: number;
  wholesalePrice?: number;
  specialPrice?: number;
  applyTax?: boolean;
  taxPercentage?: number;
  allowsDiscount?: boolean;
  maxDiscount?: number;
  minStock?: number;
  maxStock?: number;
  sellOutOfStock?: boolean;
  unit: string;
  initialStock?: number;
  historicalSales?: number;
}

export interface ImportResult {
  created: number;
  errors: Array<{ row: number; message: string }>;
}

const BATCH_SIZE = 500;

const UNIT_MAP: Record<string, string> = {
  unidad: 'unit', unidades: 'unit',
  kilo: 'kg', kilos: 'kg',
  gramo: 'g', gramos: 'g',
  litro: 'l', litros: 'l',
  mililitro: 'ml', mililitros: 'ml',
  caja: 'box', cajas: 'box',
  paquete: 'pack', paquetes: 'pack',
};

class DepartmentResolver {
  private departmentMap = new Map<string, string>();

  async initialize(tenantId: string, names: string[], branchId?: string): Promise<void> {
    const existing = await Department.find({ tenantId, name: { $in: names } });
    for (const d of existing) {
      this.departmentMap.set(d.name, d._id.toString());
    }
    for (const name of names) {
      if (!this.departmentMap.has(name)) {
        const dept = await Department.create({ tenantId, branchId, name });
        this.departmentMap.set(name, dept._id.toString());
      }
    }
  }

  resolve(name: string): string | undefined {
    return this.departmentMap.get(name);
  }
}

class BrandResolver {
  private brandMap = new Map<string, string>();

  async initialize(tenantId: string, names: string[], branchId?: string): Promise<void> {
    for (const name of names) {
      if (mongoose.Types.ObjectId.isValid(name)) {
        const existing = await Brand.findOne({ tenantId, _id: name });
        if (existing) {
          this.brandMap.set(name, existing._id.toString());
          continue;
        }
      }
      if (!this.brandMap.has(name)) {
        const existing = await Brand.findOne({ tenantId, name });
        if (existing) {
          this.brandMap.set(name, existing._id.toString());
        } else {
          const brand = await Brand.create({ tenantId, branchId, name });
          this.brandMap.set(name, brand._id.toString());
        }
      }
    }
  }

  resolve(name?: string): string | undefined {
    return name ? this.brandMap.get(name) : undefined;
  }
}

class ProductValidator {
  private existingSKUs: Set<string>;

  constructor(existingSKUs: Set<string>) {
    this.existingSKUs = existingSKUs;
  }

  validate(product: ImportProductInput, row: number): string | null {
    if (!product.sku) return 'SKU requerido';
    if (!product.name || product.name.length < 2) return 'Nombre mínimo 2 caracteres';
    if (!product.barcode) return 'Código de barras requerido';
    if (!product.categoryName) return 'Categoría requerida';
    if (product.costPrice == null || product.costPrice < 0) return 'Precio costo inválido';
    if (product.price == null || product.price < 0) return 'Precio venta inválido';
    if (product.minStock != null && product.minStock < 0) return 'Stock mínimo inválido';
    if (product.maxStock != null && product.maxStock < 0) return 'Stock máximo inválido';
    if (!product.unit) return 'Unidad requerida';
    if (product.initialStock == null || product.initialStock < 0) return 'Stock inicial inválido';

    if (this.existingSKUs.has(product.sku)) {
      return `SKU "${product.sku}" ya existe`;
    }
    this.existingSKUs.add(product.sku);

    return null;
  }
}

class StockInitializer {
  async initialize(
    tenantId: string,
    branchId: string | undefined,
    products: Array<{ productId: string; original: ImportProductInput; row: number }>,
    errors: Array<{ row: number; message: string }>
  ): Promise<void> {
    if (!branchId || !branchId.trim() || products.length === 0) return;

    const stockDocs = products.map((p) => ({
      tenantId,
      branchId,
      productId: p.productId,
      quantity: p.original.initialStock || 0,
      price: p.original.price,
      isLowStock: (p.original.initialStock || 0) <= (p.original.minStock || 0),
    }));

    const stockFiltered = stockDocs.filter((s) => s.productId);
    if (stockFiltered.length === 0) return;

    try {
      await Stock.insertMany(stockFiltered, { ordered: false });

      const movements = stockFiltered
        .filter((s) => s.quantity > 0)
        .map((s) => ({
          tenantId: s.tenantId,
          branchId: s.branchId,
          productId: s.productId,
          type: 'adjustment' as const,
          quantity: s.quantity,
          previousQuantity: 0,
          newQuantity: s.quantity,
          note: 'Initial stock (import)',
        }));

      if (movements.length > 0) {
        await StockMovement.insertMany(movements, { ordered: false });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      for (const p of products) {
        errors.push({ row: p.row, message: `Producto creado pero no se pudo inicializar stock: ${msg}` });
      }
    }
  }
}

export class ProductImportFacade {
  private departmentResolver = new DepartmentResolver();
  private brandResolver = new BrandResolver();
  private validator!: ProductValidator;
  private stockInitializer = new StockInitializer();

  async import(
    tenantId: string,
    products: ImportProductInput[],
    branchId?: string,
    skipDuplicates = false
  ): Promise<ImportResult> {
    const errors: Array<{ row: number; message: string }> = [];
    let createdCount = 0;

    const departmentNames = [...new Set(products.map((p) => p.categoryName).filter(Boolean))];
    await this.departmentResolver.initialize(tenantId, departmentNames, branchId);

    const brandNames = [...new Set(products.map((p) => p.brandId).filter(Boolean))] as string[];
    await this.brandResolver.initialize(tenantId, brandNames, branchId);

    const existingSKUs = new Set<string>(
      (await Product.find({ tenantId }).select('sku').lean()).map((p) => p.sku)
    );
    this.validator = new ProductValidator(existingSKUs);

    interface ValidProduct {
      row: number;
      data: Record<string, any>;
      original: ImportProductInput;
    }

    const validProducts: ValidProduct[] = [];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const row = i + 2;

      if (skipDuplicates && existingSKUs.has(p.sku)) continue;

      const error = this.validator.validate(p, row);
      if (error) {
        errors.push({ row, message: error });
        continue;
      }

      const normalized = p.unit?.toLowerCase().trim();
      const unit = UNIT_MAP[normalized] || p.unit;

      validProducts.push({
        row,
        original: p,
        data: {
          tenantId,
          sku: p.sku,
          barcode: p.barcode,
          name: p.name,
          description: p.description,
          departmentId: this.departmentResolver.resolve(p.categoryName),
          brandId: this.brandResolver.resolve(p.brandId),
          costPrice: p.costPrice,
          price: p.price,
          wholesalePrice: p.wholesalePrice,
          specialPrice: p.specialPrice,
          applyTax: p.applyTax ?? false,
          taxPercentage: p.taxPercentage ?? 0,
          allowsDiscount: p.allowsDiscount ?? false,
          maxDiscount: p.maxDiscount ?? 0,
          minStock: p.minStock ?? 0,
          maxStock: p.maxStock ?? 0,
          sellOutOfStock: p.sellOutOfStock ?? false,
          unit,
          historicalSales: p.historicalSales ?? 0,
        },
      });
    }

    for (let i = 0; i < validProducts.length; i += BATCH_SIZE) {
      const batch = validProducts.slice(i, i + BATCH_SIZE);
      const operations = batch.map((vp) => ({
        insertOne: { document: vp.data },
      }));

      try {
        const result = await Product.bulkWrite(operations, { ordered: false });
        const insertedIds = Object.values(result.insertedIds).map((id: any) => id.toString());

        const stockProducts = batch.map((vp, idx) => ({
          productId: insertedIds[idx],
          original: vp.original,
          row: vp.row,
        }));

        await this.stockInitializer.initialize(tenantId, branchId, stockProducts, errors);
        createdCount += batch.length;
      } catch (err: any) {
        for (const vp of batch) {
          errors.push({ row: vp.row, message: err.message || 'Error al insertar producto' });
        }
      }
    }

    return { created: createdCount, errors };
  }
}
