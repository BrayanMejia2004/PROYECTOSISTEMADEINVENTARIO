# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\auth.spec.ts >> Auth Flows >> 1. Register a new tenant via UI
- Location: e2e\auth\auth.spec.ts:11:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel('Nombre')

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - img [ref=e8]
    - heading "Registrar Empresa" [level=1] [ref=e13]
    - paragraph [ref=e14]: Crea tu cuenta para empezar
  - generic [ref=e15]:
    - generic [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]: Nombre
        - textbox [ref=e19]
      - generic [ref=e20]:
        - generic [ref=e21]: Apellido
        - textbox [ref=e22]
    - generic [ref=e23]:
      - generic [ref=e24]: Nombre de la Empresa
      - textbox [ref=e25]
    - generic [ref=e26]:
      - generic [ref=e27]: Slug del Tenant
      - textbox "mi-empresa" [ref=e28]
    - generic [ref=e29]:
      - generic [ref=e30]: Email
      - textbox [ref=e31]
    - generic [ref=e32]:
      - generic [ref=e33]: Contraseña
      - textbox [ref=e34]
    - generic [ref=e35]:
      - generic [ref=e36]: Confirmar Contraseña
      - textbox [ref=e37]
    - button "Registrar" [ref=e38]
  - paragraph [ref=e39]:
    - text: ¿Ya tienes cuenta?
    - link "Inicia Sesión" [ref=e40] [cursor=pointer]:
      - /url: /login
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { setupTestContext, loginAs } from '../fixtures/auth';
  3  | 
  4  | let ctx: Awaited<ReturnType<typeof setupTestContext>>;
  5  | 
  6  | test.beforeAll(async ({ request }) => {
  7  |   ctx = await setupTestContext(request);
  8  | });
  9  | 
  10 | test.describe('Auth Flows', () => {
  11 |   test('1. Register a new tenant via UI', async ({ page }) => {
  12 |     await page.goto('/register');
  13 |     await expect(page.locator('h1')).toContainText('Registrar');
  14 | 
> 15 |     await page.getByLabel('Nombre').fill('Test');
     |                                     ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  16 |     await page.getByLabel('Apellido').fill('User');
  17 |     await page.getByLabel('Nombre de la Empresa').fill('Mi Empresa');
  18 |     await page.getByLabel('Slug (identificador único)').fill(`comp-${Date.now()}`);
  19 |     await page.getByLabel('Email').fill(`reg-${Date.now()}@test.com`);
  20 |     await page.getByLabel('Contraseña', { exact: true }).fill('password123');
  21 |     await page.getByLabel('Confirmar Contraseña').fill('password123');
  22 | 
  23 |     await page.getByRole('button', { name: 'Crear Cuenta' }).click();
  24 |     await expect(page).toHaveURL('/login');
  25 |   });
  26 | 
  27 |   test('2. Login as owner and verify full sidebar', async ({ page }) => {
  28 |     await loginAs(page, ctx.owner.token);
  29 |     await expect(page.getByRole('link', { name: 'Inicio' })).toBeVisible();
  30 |     await expect(page.getByRole('link', { name: 'Reportes' })).toBeVisible();
  31 |     await expect(page.getByRole('link', { name: 'Configuración' })).toBeVisible();
  32 |   });
  33 | 
  34 |   test('3. Login as admin and verify restricted sidebar', async ({ page }) => {
  35 |     await loginAs(page, ctx.admin.token);
  36 |     await expect(page.getByRole('link', { name: 'Inicio' })).toBeVisible();
  37 |     await expect(page.getByRole('link', { name: 'Inventario' })).toBeVisible();
  38 |     await expect(page.getByRole('link', { name: 'Reportes' })).toHaveCount(0);
  39 |     await expect(page.getByRole('link', { name: 'Configuración' })).toHaveCount(0);
  40 |   });
  41 | 
  42 |   test('4. Login as cashier and verify minimal sidebar', async ({ page }) => {
  43 |     await loginAs(page, ctx.cashier.token);
  44 |     await expect(page.getByRole('link', { name: 'Inicio' })).toBeVisible();
  45 |     await expect(page.getByRole('link', { name: 'Gestión de Caja' })).toBeVisible();
  46 |     await expect(page.getByRole('link', { name: 'Punto de Venta' })).toBeVisible();
  47 |     await expect(page.getByRole('link', { name: 'Inventario' })).toHaveCount(0);
  48 |     await expect(page.getByRole('link', { name: 'Reportes' })).toHaveCount(0);
  49 |   });
  50 | 
  51 |   test('5. Invalid login shows error message', async ({ page }) => {
  52 |     await page.goto('/login');
  53 |     await page.getByLabel('Slug del Tenant').fill('no-existe');
  54 |     await page.getByLabel('Email').fill('fake@test.com');
  55 |     await page.getByLabel('Contraseña').fill('wrong');
  56 |     await page.getByRole('button', { name: 'Ingresar' }).click();
  57 |     await expect(page.locator('.bg-red-50')).toBeVisible();
  58 |   });
  59 | 
  60 |   test('6. Protected route redirects to /login when unauthenticated', async ({ page }) => {
  61 |     await page.goto('/');
  62 |     await expect(page).toHaveURL(/\/login/);
  63 |   });
  64 | 
  65 |   test('7. Logout redirects to /login and clears token', async ({ page }) => {
  66 |     await loginAs(page, ctx.owner.token);
  67 |     await page.getByText('Cerrar sesión').click();
  68 |     await expect(page).toHaveURL(/\/login/);
  69 |     const token = await page.evaluate(() => localStorage.getItem('token'));
  70 |     expect(token).toBeNull();
  71 |   });
  72 | });
  73 | 
```