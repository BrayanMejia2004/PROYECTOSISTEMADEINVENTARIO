import { z } from 'zod';

export const productSchema = z.object({
  sku: z.string().min(1, 'SKU requerido'),
  barcode: z.string().min(1, 'Código de barras requerido'),
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  description: z.string().optional(),
  departmentId: z.string().min(1, 'Departamento requerido'),
  brandId: z.string().optional(),
  supplierId: z.string().optional(),
  image: z.string().url('URL inválida').or(z.literal('')).optional(),
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
}).superRefine((data, ctx) => {
  if (data.costPrice > 0 && data.price > 0 && data.costPrice >= data.price) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El precio de venta debe ser mayor al precio de costo',
      path: ['price'],
    });
  }
  if (data.minStock > 0 && data.maxStock > 0 && data.minStock >= data.maxStock) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El stock mínimo debe ser menor al stock máximo',
      path: ['maxStock'],
    });
  }
});

export type ProductForm = z.infer<typeof productSchema>;
