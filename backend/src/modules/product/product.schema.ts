import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z.string().min(1, 'SKU requerido').max(100),
  barcode: z.string().min(1, 'Código de barras requerido').max(100),
  name: z.string().min(2, 'Nombre mínimo 2 caracteres').max(200),
  description: z.string().max(2000).optional(),
  departmentId: z.string().min(1, 'Departamento requerido'),
  brandId: z.string().optional().transform(v => v === '' ? undefined : v),
  supplierId: z.string().optional().transform(v => v === '' ? undefined : v),
  image: z.string().optional(),
  costPrice: z.number().min(0, 'Precio costo debe ser positivo'),
  price: z.number().min(0, 'Precio venta debe ser positivo'),
  wholesalePrice: z.number().min(0).optional(),
  specialPrice: z.number().min(0).optional(),
  applyTax: z.boolean().optional(),
  taxPercentage: z.number().min(0).max(100).optional(),
  allowsDiscount: z.boolean().optional(),
  maxDiscount: z.number().min(0).max(100).optional(),
  minStock: z.number().min(0, 'Stock mínimo debe ser positivo'),
  maxStock: z.number().min(0, 'Stock máximo debe ser positivo'),
  sellOutOfStock: z.boolean().optional(),
  stock: z.number().min(0).optional(),
  unit: z.string().min(1, 'Unidad requerida'),
});

export const updateProductSchema = z.object({
  sku: z.string().min(1).max(100).optional(),
  barcode: z.string().max(100).optional(),
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
  departmentId: z.string().optional().transform(v => v === '' ? undefined : v),
  brandId: z.string().optional().transform(v => v === '' ? undefined : v),
  supplierId: z.string().optional().transform(v => v === '' ? undefined : v),
  image: z.string().optional(),
  costPrice: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  wholesalePrice: z.number().min(0).optional(),
  specialPrice: z.number().min(0).optional(),
  applyTax: z.boolean().optional(),
  taxPercentage: z.number().min(0).max(100).optional(),
  allowsDiscount: z.boolean().optional(),
  maxDiscount: z.number().min(0).max(100).optional(),
  minStock: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
  sellOutOfStock: z.boolean().optional(),
  stock: z.number().min(0).optional(),
  unit: z.string().optional(),
});

export const importProductsSchema = z.object({
  products: z.array(z.any()).min(1, 'Al menos un producto requerido').max(5000, 'Máximo 5000 productos'),
  skipDuplicates: z.boolean().optional(),
});
