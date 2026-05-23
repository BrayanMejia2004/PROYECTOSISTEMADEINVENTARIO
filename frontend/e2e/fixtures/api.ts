import { APIRequestContext } from '@playwright/test';

const API_BASE = 'http://localhost:3000/api/v1';

async function api(ctx: APIRequestContext, path: string, options?: { method?: string; data?: any; token?: string }) {
  const method = options?.method || 'get';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;
  return ctx.fetch(`${API_BASE}${path}`, { method, headers, data: options?.data });
}

export async function seedProduct(
  request: APIRequestContext,
  token: string,
  branchId: string,
  overrides: Partial<{
    sku: string; barcode: string; name: string; costPrice: number; price: number;
    minStock: number; maxStock: number; unit: string; departmentName: string; brandName: string;
  }> = {},
) {
  const departmentName = overrides.departmentName || 'General';
  const brandName = overrides.brandName || 'Generica';

  const deptRes = await api(request, '/departments', {
    method: 'post',
    token,
    data: { name: departmentName, branchId },
  });
  const deptData = deptRes.ok() ? (await deptRes.json()).data : null;
  const deptId = deptData?.id || deptData?._id;

  const brandRes = await api(request, '/brands', {
    method: 'post',
    token,
    data: { name: brandName, branchId },
  });
  const brandData = brandRes.ok() ? (await brandRes.json()).data : null;
  const brandId2 = brandData?.id || brandData?._id;

  const id = Date.now();
  const productData = {
    sku: overrides.sku || `SKU-${id}`,
    barcode: overrides.barcode || String(id),
    name: overrides.name || `Producto ${id}`,
    costPrice: overrides.costPrice ?? 1000,
    price: overrides.price ?? 2000,
    minStock: overrides.minStock ?? 0,
    maxStock: overrides.maxStock ?? 100,
    unit: overrides.unit || 'unit',
    departmentId: deptId || '000000000000000000000000',
    brandId: brandId2 || '000000000000000000000000',
  };

  const res = await api(request, '/products', { method: 'post', token, data: productData });
  if (!res.ok()) throw new Error(`Product seed failed: ${await res.text()}`);
  const data = (await res.json()).data;
  return { id: data.id || data._id, name: productData.name, sku: productData.sku };
}
