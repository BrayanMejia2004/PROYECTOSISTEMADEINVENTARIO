import mongoose from 'mongoose';
import Product from '../../shared/models/product/product.model';
import Department from '../../shared/models/department/department.model';
import Stock from '../../shared/models/stock/stock.model';
import StockMovement from '../../shared/models/stockMovement/stockMovement.model';
import Brand from '../../shared/models/brand/brand.model';
import * as stockService from '../stock/stock.service';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import ExcelJS from 'exceljs';

interface GetProductsOptions {
  tenantId: string;
  branchId?: string;
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  supplierId?: string;
}

interface CreateProductInput {
  tenantId: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  departmentId?: string;
  brandId?: string;
  supplierId?: string;
  image?: string;
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
  unit?: string;
}

export const getProducts = async (options: GetProductsOptions) => {
  const { tenantId, branchId, page = 1, limit = 20, search, departmentId, supplierId } = options;

  const query: any = { tenantId: new mongoose.Types.ObjectId(tenantId), isActive: true };

  if (branchId) {
    const stockRecords = await Stock.find({ tenantId, branchId }).select('productId').lean();
    const productIds = stockRecords.map(s => s.productId);
    if (productIds.length === 0) {
      return { data: [], meta: { total: 0, page, limit } };
    }
    query._id = { $in: productIds };
  }

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exactBarcode = /^\d{8,}$/.test(search);
    if (exactBarcode) {
      query.barcode = search;
    } else {
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { sku: { $regex: `^${escaped}`, $options: 'i' } },
        { barcode: { $regex: `^${escaped}`, $options: 'i' } },
      ];
    }
  }
  if (departmentId) query.departmentId = new mongoose.Types.ObjectId(departmentId);
  if (supplierId) query.supplierId = new mongoose.Types.ObjectId(supplierId);

  const total = await Product.countDocuments(query);

  const pipeline: any[] = [
    { $match: query },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const stockLookupPipeline: any[] = [
    { $match: { $expr: { $eq: [{ $toString: '$productId' }, { $toString: '$$productId' }] } } },
  ];
  if (branchId) {
    stockLookupPipeline.push({ $match: { branchId: new mongoose.Types.ObjectId(branchId) } });
  }

  pipeline.push(
    {
      $lookup: {
        from: 'stocks',
        let: { productId: '$_id' },
        pipeline: stockLookupPipeline,
        as: 'stockInfo',
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'department',
      },
    },
    {
      $addFields: {
        departmentName: { $arrayElemAt: ['$department.name', 0] },
        stock: {
          $cond: [
            { $gt: [{ $size: '$stockInfo' }, 0] },
            { $sum: '$stockInfo.quantity' },
            0,
          ],
        },
      },
    },
    {
      $project: {
        department: 0,
        stockInfo: 0,
      },
    },
  );

  const products = await Product.aggregate(pipeline).allowDiskUse(true);

  const data = products.map(p => ({
    id: p._id.toString(),
    _id: p._id.toString(),
    tenantId: p.tenantId,
    sku: p.sku,
    barcode: p.barcode,
    name: p.name,
    description: p.description,
    departmentId: p.departmentId,
    departmentName: p.departmentName,
    brandId: p.brandId,
    supplierId: p.supplierId,
    image: p.image,
    costPrice: p.costPrice,
    price: p.price,
    wholesalePrice: p.wholesalePrice,
    specialPrice: p.specialPrice,
    applyTax: p.applyTax,
    taxPercentage: p.taxPercentage,
    allowsDiscount: p.allowsDiscount,
    maxDiscount: p.maxDiscount,
    minStock: p.minStock,
    maxStock: p.maxStock,
    sellOutOfStock: p.sellOutOfStock,
    unit: p.unit,
    isActive: p.isActive,
    stock: p.stock,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  return {
    data,
    meta: {
      total,
      page,
      limit,
    },
  };
};

const enrichSingleProduct = async (product: any, tenantId: string, branchId?: string) => {
  let departmentName: string | null = null;
  if (product.departmentId) {
    const dept = await Department.findById(product.departmentId).select('name').lean();
    departmentName = dept?.name || null;
  }

  let stock = 0;
  if (branchId) {
    const stockDoc = await Stock.findOne({ tenantId, branchId, productId: product._id.toString() }).lean();
    stock = stockDoc?.quantity ?? 0;
  } else {
    const stocks = await Stock.find({ tenantId, productId: product._id.toString() }).lean();
    stock = stocks.reduce((sum, s) => sum + s.quantity, 0);
  }

  return {
    id: product._id.toString(),
    _id: product._id.toString(),
    tenantId: product.tenantId,
    sku: product.sku,
    barcode: product.barcode,
    name: product.name,
    description: product.description,
    departmentId: product.departmentId,
    departmentName,
    brandId: product.brandId,
    supplierId: product.supplierId,
    image: product.image,
    costPrice: product.costPrice,
    price: product.price,
    wholesalePrice: product.wholesalePrice,
    specialPrice: product.specialPrice,
    applyTax: product.applyTax,
    taxPercentage: product.taxPercentage,
    allowsDiscount: product.allowsDiscount,
    maxDiscount: product.maxDiscount,
    minStock: product.minStock,
    maxStock: product.maxStock,
    sellOutOfStock: product.sellOutOfStock,
    unit: product.unit,
    isActive: product.isActive,
    stock,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

export const getProductByBarcode = async (barcode: string, tenantId: string, branchId?: string) => {
  const product = await Product.findOne({ tenantId, barcode, isActive: true }).lean();
  if (!product) return null;
  return enrichSingleProduct(product, tenantId, branchId);
};

export const getProductById = async (productId: string, tenantId: string, branchId?: string) => {
  const product = await Product.findOne({ _id: productId, tenantId });
  if (!product) {
    throw ApiError.notFound('Product not found');
  }
  return enrichSingleProduct(product.toObject(), tenantId, branchId);
};

export const createProduct = async (input: CreateProductInput) => {
  const product = new Product(input);
  await product.save();
  return product;
};

export const updateProduct = async (productId: string, tenantId: string, updates: Partial<CreateProductInput>) => {
  const product = await Product.findOne({ _id: productId, tenantId });
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  Object.assign(product, updates);
  await product.save();
  return product;
};

export const deleteProduct = async (productId: string, tenantId: string) => {
  const product = await Product.findOne({ _id: productId, tenantId });
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  product.isActive = false;
  await product.save();
  return product;
};

interface ImportProductInput {
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
  minStock: number;
  maxStock: number;
  sellOutOfStock?: boolean;
  unit: string;
  initialStock?: number;
}

export const importProducts = async (tenantId: string, products: ImportProductInput[], branchId?: string, skipDuplicates = false) => {
  const errors: Array<{ row: number; message: string }> = [];
  let createdCount = 0;

  const departmentNames = [...new Set(products.map(p => p.categoryName).filter(Boolean))];
  const existingDepartments = await Department.find({ tenantId, name: { $in: departmentNames } });
  const departmentMap = new Map(existingDepartments.map(d => [d.name, d._id.toString()]));

  for (const name of departmentNames) {
    if (!departmentMap.has(name)) {
      const dept = await Department.create({ tenantId, branchId, name });
      departmentMap.set(name, dept._id.toString());
    }
  }

  const brandNames = [...new Set(products.map(p => p.brandId).filter(Boolean))] as string[];
  const brandMap = new Map<string, string>();

  for (const name of brandNames) {
    if (mongoose.Types.ObjectId.isValid(name)) {
      const existingBrand = await Brand.findOne({ tenantId, _id: name });
      if (existingBrand) {
        brandMap.set(name, existingBrand._id.toString());
        continue;
      }
    }
    if (!brandMap.has(name)) {
      const existingBrand = await Brand.findOne({ tenantId, name });
      if (existingBrand) {
        brandMap.set(name, existingBrand._id.toString());
      } else {
        const brand = await Brand.create({ tenantId, branchId, name });
        brandMap.set(name, brand._id.toString());
      }
    }
  }

  const existingSKUs = new Set<string>(
    (await Product.find({ tenantId }).select('sku').lean()).map(p => p.sku)
  );

  const UNIT_MAP: Record<string, string> = {
    unidad: 'unit', unidades: 'unit',
    kilo: 'kg', kilos: 'kg',
    gramo: 'g', gramos: 'g',
    litro: 'l', litros: 'l',
    mililitro: 'ml', mililitros: 'ml',
    caja: 'box', cajas: 'box',
    paquete: 'pack', paquetes: 'pack',
  };

  interface ValidProduct {
    row: number;
    data: Record<string, any>;
    original: ImportProductInput;
  }

  const validProducts: ValidProduct[] = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const row = i + 2;

    if (!p.sku) { errors.push({ row, message: 'SKU requerido' }); continue; }
    if (!p.name || p.name.length < 2) { errors.push({ row, message: 'Nombre mínimo 2 caracteres' }); continue; }
    if (!p.barcode) { errors.push({ row, message: 'Código de barras requerido' }); continue; }
    if (!p.categoryName) { errors.push({ row, message: 'Categoría requerida' }); continue; }
    if (p.costPrice == null || p.costPrice < 0) { errors.push({ row, message: 'Precio costo inválido' }); continue; }
    if (p.price == null || p.price < 0) { errors.push({ row, message: 'Precio venta inválido' }); continue; }
    if (p.minStock == null || p.minStock < 0) { errors.push({ row, message: 'Stock mínimo inválido' }); continue; }
    if (p.maxStock == null || p.maxStock < 0) { errors.push({ row, message: 'Stock máximo inválido' }); continue; }
    if (!p.unit) { errors.push({ row, message: 'Unidad requerida' }); continue; }
    if (p.initialStock == null || p.initialStock < 0) { errors.push({ row, message: 'Stock inicial inválido' }); continue; }

    if (existingSKUs.has(p.sku)) {
      if (skipDuplicates) continue;
      errors.push({ row, message: `SKU "${p.sku}" ya existe` });
      continue;
    }
    existingSKUs.add(p.sku);

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
        departmentId: departmentMap.get(p.categoryName),
        brandId: p.brandId ? (brandMap.get(p.brandId) || undefined) : undefined,
        costPrice: p.costPrice,
        price: p.price,
        wholesalePrice: p.wholesalePrice,
        specialPrice: p.specialPrice,
        applyTax: p.applyTax ?? false,
        taxPercentage: p.taxPercentage ?? 0,
        allowsDiscount: p.allowsDiscount ?? false,
        maxDiscount: p.maxDiscount ?? 0,
        minStock: p.minStock,
        maxStock: p.maxStock,
        sellOutOfStock: p.sellOutOfStock ?? false,
        unit,
      },
    });
  }

  const BATCH_SIZE = 500;
  for (let i = 0; i < validProducts.length; i += BATCH_SIZE) {
    const batch = validProducts.slice(i, i + BATCH_SIZE);
    const operations = batch.map(vp => ({
      insertOne: { document: vp.data },
    }));

    try {
      const result = await Product.bulkWrite(operations, { ordered: false });
      const insertedIds = Object.values(result.insertedIds).map((id: any) => id.toString());

      if (branchId && branchId.trim()) {
        const stockDocs = batch.map((vp, idx) => ({
          tenantId,
          branchId,
          productId: insertedIds[idx],
          quantity: vp.original.initialStock || 0,
          price: vp.original.price,
          isLowStock: (vp.original.initialStock || 0) <= (vp.original.minStock || 0),
        }));
        const stockFiltered = stockDocs.filter(s => s.productId);
        if (stockFiltered.length > 0) {
          try {
            await Stock.insertMany(stockFiltered, { ordered: false });

            const movements = stockFiltered
              .filter(s => s.quantity > 0)
              .map(s => ({
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
          } catch {
            batch.forEach(vp => errors.push({ row: vp.row, message: `Producto creado pero no se pudo inicializar stock: ${vp.data.name}` }));
          }
        }
      }

      createdCount += batch.length;
    } catch (err: any) {
      batch.forEach(vp => errors.push({ row: vp.row, message: err.message || 'Error al insertar producto' }));
    }
  }

  return { created: createdCount, errors };
};

const BATCH_SIZE = 500;

const addProductRowsToSheet = (sheet: ExcelJS.Worksheet, products: any[], departmentNameMap: Map<string, string>) => {
  for (const product of products) {
    sheet.addRow({
      sku: product.sku,
      barcode: product.barcode || '',
      name: product.name,
      description: product.description || '',
      categoryName: product.departmentId ? (departmentNameMap.get(product.departmentId.toString()) || '') : '',
      brandId: product.brandId || '',
      costPrice: product.costPrice,
      price: product.price,
      wholesalePrice: product.wholesalePrice ?? '',
      specialPrice: product.specialPrice ?? '',
      applyTax: product.applyTax ? 'Sí' : 'No',
      taxPercentage: product.taxPercentage || 0,
      allowsDiscount: product.allowsDiscount ? 'Sí' : 'No',
      maxDiscount: product.maxDiscount || 0,
      minStock: product.minStock,
      maxStock: product.maxStock,
      sellOutOfStock: product.sellOutOfStock ? 'Sí' : 'No',
      initialStock: 0,
      unit: product.unit,
    });
  }
};

export const exportProducts = async (tenantId: string) => {
  const departments = await Department.find({ tenantId });
  const departmentNameMap = new Map(departments.map(d => [d._id.toString(), d.name]));

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Productos');

  sheet.columns = [
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Código Barras', key: 'barcode', width: 18 },
    { header: 'Nombre', key: 'name', width: 35 },
    { header: 'Descripción', key: 'description', width: 30 },
    { header: 'Categoría', key: 'categoryName', width: 20 },
    { header: 'Marca', key: 'brandId', width: 15 },
    { header: 'Precio Costo', key: 'costPrice', width: 14 },
    { header: 'Precio Venta', key: 'price', width: 14 },
    { header: 'Precio Mayorista', key: 'wholesalePrice', width: 16 },
    { header: 'Precio Especial', key: 'specialPrice', width: 15 },
    { header: 'Aplica IVA', key: 'applyTax', width: 12 },
    { header: '% IVA', key: 'taxPercentage', width: 8 },
    { header: 'Permite Descuento', key: 'allowsDiscount', width: 16 },
    { header: '% Desc Máx', key: 'maxDiscount', width: 11 },
    { header: 'Stock Mín', key: 'minStock', width: 10 },
    { header: 'Stock Máx', key: 'maxStock', width: 10 },
    { header: 'Stock Inicial', key: 'initialStock', width: 12 },
    { header: 'Vender Sin Stock', key: 'sellOutOfStock', width: 16 },
    { header: 'Unidad', key: 'unit', width: 10 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 11 };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F0E8' } };

  const cursor = Product.find({ tenantId, isActive: true })
    .sort({ name: 1 })
    .cursor();

  let batch: any[] = [];
  for await (const product of cursor) {
    batch.push(product);
    if (batch.length >= BATCH_SIZE) {
      addProductRowsToSheet(sheet, batch, departmentNameMap);
      batch = [];
    }
  }
  if (batch.length > 0) {
    addProductRowsToSheet(sheet, batch, departmentNameMap);
  }

  return workbook;
};
