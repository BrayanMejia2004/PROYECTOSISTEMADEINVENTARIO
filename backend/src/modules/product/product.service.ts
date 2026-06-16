import mongoose from 'mongoose';
import Product from '../../shared/models/product/product.model';
import Department from '../../shared/models/department/department.model';
import Stock from '../../shared/models/stock/stock.model';
import StockMovement from '../../shared/models/stockMovement/stockMovement.model';
import Brand from '../../shared/models/brand/brand.model';
import * as stockService from '../stock/stock.service';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import ExcelJS from 'exceljs';
import { ProductImportFacade } from './productImportFacade';
import type { ImportProductInput, ImportResult } from './productImportFacade';

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
  branchId?: string;
  stock?: number;
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
    { $sort: { name: 1 } },
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
      totalPages: Math.ceil(total / limit),
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
  const { branchId, stock, ...productFields } = input;

  if (productFields.brandId && !mongoose.Types.ObjectId.isValid(productFields.brandId)) {
    let brand = await Brand.findOne({ tenantId: input.tenantId, name: productFields.brandId });
    if (!brand) {
      brand = await Brand.create({ tenantId: input.tenantId, name: productFields.brandId });
    }
    productFields.brandId = brand._id.toString();
  }

  const duplicate = await Product.findOne({
    tenantId: input.tenantId,
    isActive: true,
    $or: [
      { name: productFields.name },
      { sku: productFields.sku },
      ...(productFields.barcode ? [{ barcode: productFields.barcode }] : []),
    ],
  });

  if (duplicate) {
    if (duplicate.name === productFields.name) {
      throw ApiError.conflict('Ya existe un producto activo con este nombre');
    }
    if (duplicate.sku === productFields.sku) {
      throw ApiError.conflict('Ya existe un producto activo con este SKU');
    }
    if (productFields.barcode && duplicate.barcode === productFields.barcode) {
      throw ApiError.conflict('Ya existe un producto activo con este código de barras');
    }
  }

  const product = new Product(productFields);
  await product.save();

  if (stock && stock > 0 && branchId) {
    const { tenantId } = input;
    const existingStock = await Stock.findOne({ tenantId, branchId, productId: product._id.toString() });
    if (!existingStock) {
      const newStock = new Stock({
        tenantId,
        branchId,
        productId: product._id,
        quantity: stock,
        price: product.price,
        isLowStock: stock <= (product.minStock || 0),
      });
      await newStock.save();

      await StockMovement.create({
        tenantId,
        branchId,
        productId: product._id,
        type: 'adjustment' as any,
        quantity: stock,
        previousQuantity: 0,
        newQuantity: stock,
        note: 'Initial stock',
      });
    }
  }

  return product;
};

const OBJECT_ID_FIELDS = ['supplierId', 'departmentId', 'brandId'];

export const updateProduct = async (productId: string, tenantId: string, branchId: string | undefined, updates: Partial<CreateProductInput> & { stock?: number }) => {
  const product = await Product.findOne({ _id: productId, tenantId });
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const cleanUpdates: Record<string, any> = { ...updates };
  const stockValue = cleanUpdates.stock;
  delete cleanUpdates.stock;

  for (const field of OBJECT_ID_FIELDS) {
    if (cleanUpdates[field] === '' || cleanUpdates[field] === null) {
      delete cleanUpdates[field];
    }
  }

  if (cleanUpdates.name || cleanUpdates.sku || cleanUpdates.barcode !== undefined) {
    const orConditions: any[] = [];
    if (cleanUpdates.name) orConditions.push({ name: cleanUpdates.name });
    if (cleanUpdates.sku) orConditions.push({ sku: cleanUpdates.sku });
    if (cleanUpdates.barcode !== undefined) orConditions.push({ barcode: cleanUpdates.barcode });

    const duplicate = await Product.findOne({
      tenantId,
      _id: { $ne: productId },
      isActive: true,
      $or: orConditions,
    });

    if (duplicate) {
      if (cleanUpdates.name && duplicate.name === cleanUpdates.name) {
        throw ApiError.conflict('Ya existe otro producto activo con este nombre');
      }
      if (cleanUpdates.sku && duplicate.sku === cleanUpdates.sku) {
        throw ApiError.conflict('Ya existe otro producto activo con este SKU');
      }
      if (cleanUpdates.barcode !== undefined && duplicate.barcode === cleanUpdates.barcode) {
        throw ApiError.conflict('Ya existe otro producto activo con este código de barras');
      }
    }
  }

  Object.assign(product, cleanUpdates);
  await product.save();

  if (stockValue !== undefined && branchId) {
    const minStock = cleanUpdates.minStock !== undefined ? cleanUpdates.minStock : product.minStock;
    const existingStock = await Stock.findOne({ tenantId, branchId, productId: product._id.toString() });
    if (existingStock) {
      existingStock.quantity = stockValue;
      existingStock.price = product.price;
      existingStock.isLowStock = stockValue <= minStock;
      await existingStock.save();
    } else {
      await Stock.create({
        tenantId,
        branchId,
        productId: product._id,
        quantity: stockValue,
        price: product.price,
        minStock,
        isLowStock: stockValue <= minStock,
      });
    }
  }

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

export const importProducts = async (
  tenantId: string,
  products: ImportProductInput[],
  branchId?: string,
  skipDuplicates = false
): Promise<ImportResult> => {
  const facade = new ProductImportFacade();
  return facade.import(tenantId, products, branchId, skipDuplicates);
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
