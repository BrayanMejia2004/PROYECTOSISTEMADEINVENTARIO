import { z } from 'zod';

export const productSchema = z.object({
  sku: z.string().min(1, 'SKU requerido'),
  barcode: z.string().min(1, 'Código de barras requerido'),
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  description: z.string().optional(),
  departmentId: z.string().min(1, 'Departamento requerido'),
  brandId: z.string().min(1, 'Marca requerida'),
  supplierId: z.string().optional(),
  image: z.string().optional(),
  costPrice: z.number().min(0, 'Precio costo debe ser positivo'),
  profitPercent: z.number().min(0).max(100).default(0),
  price: z.number().min(0, 'Precio venta debe ser positivo'),
  wholesalePrice: z.number().min(0).optional(),
  specialPrice: z.number().min(0).optional(),
  applyTax: z.boolean().default(true),
  taxPercentage: z.number().min(0).max(100).default(0),
  allowsDiscount: z.boolean().default(true),
  maxDiscount: z.number().min(0).max(100).default(0),
  stock: z.number().min(0, 'Stock inicial debe ser positivo'),
  minStock: z.number().min(0).optional().default(0),
  maxStock: z.number().min(0).optional().default(0),
  sellOutOfStock: z.boolean().default(false),
  unit: z.string().min(1, 'Unidad requerida'),
});

export const stockInitSchema = z.object({
  productId: z.string().min(1, 'Producto requerido'),
  price: z.number().min(0, 'Precio debe ser positivo'),
  quantity: z.number().min(0).default(0),
  branchId: z.string().optional(),
});

export const stockAdjustSchema = z.object({
  quantity: z.number().min(0, 'Cantidad debe ser positiva'),
  note: z.string().min(1, 'Nota requerida'),
});

export type ProductForm = z.infer<typeof productSchema>;
export type StockInitForm = z.infer<typeof stockInitSchema>;
export type StockAdjustForm = z.infer<typeof stockAdjustSchema>;
