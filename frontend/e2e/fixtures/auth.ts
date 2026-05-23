import { APIRequestContext, Page } from '@playwright/test';

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'cashier';
  branchId?: string;
  password: string;
  token: string;
}

export interface TestTenant {
  id: string;
  name: string;
  slug: string;
}

export interface TestContext {
  tenant: TestTenant;
  owner: TestUser;
  admin: TestUser;
  cashier: TestUser;
  branchId: string;
}

const API_BASE = 'http://localhost:3000/api/v1';

async function api(ctx: APIRequestContext, path: string, options?: { method?: string; data?: any; token?: string }) {
  const method = options?.method || 'get';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;
  return ctx.fetch(`${API_BASE}${path}`, {
    method,
    headers,
    data: options?.data,
  });
}

export async function setupTestContext(request: APIRequestContext): Promise<TestContext> {
  const ts = Date.now();
  const slug = `test-${ts}`;
  const pw = 'password123';

  const regRes = await api(request, '/auth/register-tenant', {
    method: 'post',
    data: {
      tenantName: `Test ${slug}`,
      tenantSlug: slug,
      email: `o-${ts}@t.com`,
      password: pw,
      firstName: 'Owner',
      lastName: 'Test',
    },
  });
  if (!regRes.ok()) throw new Error(`Register failed: ${await regRes.text()}`);
  const regData = (await regRes.json()).data;

  const tenant: TestTenant = {
    id: regData.tenant.id,
    name: regData.tenant.name,
    slug: regData.tenant.slug,
  };

  const loginRes = await api(request, '/auth/login', {
    method: 'post',
    data: { email: `o-${ts}@t.com`, password: pw, tenantSlug: slug },
  });
  const loginData = (await loginRes.json()).data;

  const ownerToken: string = loginData.token;

  await api(request, '/settings', {
    method: 'patch',
    token: ownerToken,
    data: { plan: 'large' },
  });

  const branchRes = await api(request, '/branches', {
    method: 'post',
    token: ownerToken,
    data: { name: 'Sucursal Principal', address: 'Calle 123', phone: '3001234567' },
  });
  if (!branchRes.ok()) throw new Error(`Branch failed: ${await branchRes.text()}`);
  const branchData = (await branchRes.json()).data;
  const branchId: string = branchData.id || branchData._id;

  async function createUser(email: string, first: string, last: string, role: string): Promise<TestUser> {
    const uRes = await api(request, '/users', {
      method: 'post',
      token: ownerToken,
      data: { email, password: pw, firstName: first, lastName: last, role, branchId },
    });
    if (!uRes.ok()) throw new Error(`User ${role} failed: ${await uRes.text()}`);
    const uData = (await uRes.json()).data;
    const uLoginRes = await api(request, '/auth/login', {
      method: 'post',
      data: { email, password: pw, tenantSlug: slug },
    });
    const uLoginData = (await uLoginRes.json()).data;
    return {
      id: uData.id || uData._id,
      email, firstName: first, lastName: last,
      role: role as TestUser['role'],
      branchId, password: pw,
      token: uLoginData.token,
    };
  }

  const owner: TestUser = {
    id: loginData.user.id,
    email: `o-${ts}@t.com`,
    firstName: 'Owner', lastName: 'Test',
    role: 'owner', branchId, password: pw,
    token: ownerToken,
  };

  const admin = await createUser(`a-${ts}@t.com`, 'Admin', 'Test', 'admin');
  const cashier = await createUser(`c-${ts}@t.com`, 'Cashier', 'Test', 'cashier');

  return { tenant, owner, admin, cashier, branchId };
}

export async function loginAs(page: Page, token: string) {
  await page.goto('/');
  await page.evaluate((t: string) => {
    localStorage.setItem('token', t);
  }, token);
  await page.reload();
}
