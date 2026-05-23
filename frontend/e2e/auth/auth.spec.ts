import { test, expect } from '@playwright/test';
import { setupTestContext, loginAs } from '../fixtures/auth';

let ctx: Awaited<ReturnType<typeof setupTestContext>>;

test.beforeAll(async ({ request }) => {
  ctx = await setupTestContext(request);
});

test.describe('Auth Flows', () => {
  test('1. Register a new tenant via UI', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Registrar');

    await page.getByLabel('Nombre').fill('Test');
    await page.getByLabel('Apellido').fill('User');
    await page.getByLabel('Nombre de la Empresa').fill('Mi Empresa');
    await page.getByLabel('Slug (identificador único)').fill(`comp-${Date.now()}`);
    await page.getByLabel('Email').fill(`reg-${Date.now()}@test.com`);
    await page.getByLabel('Contraseña', { exact: true }).fill('password123');
    await page.getByLabel('Confirmar Contraseña').fill('password123');

    await page.getByRole('button', { name: 'Crear Cuenta' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('2. Login as owner and verify full sidebar', async ({ page }) => {
    await loginAs(page, ctx.owner.token);
    await expect(page.getByRole('link', { name: 'Inicio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Reportes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Configuración' })).toBeVisible();
  });

  test('3. Login as admin and verify restricted sidebar', async ({ page }) => {
    await loginAs(page, ctx.admin.token);
    await expect(page.getByRole('link', { name: 'Inicio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Inventario' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Reportes' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Configuración' })).toHaveCount(0);
  });

  test('4. Login as cashier and verify minimal sidebar', async ({ page }) => {
    await loginAs(page, ctx.cashier.token);
    await expect(page.getByRole('link', { name: 'Inicio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Gestión de Caja' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Punto de Venta' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Inventario' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Reportes' })).toHaveCount(0);
  });

  test('5. Invalid login shows error message', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Slug del Tenant').fill('no-existe');
    await page.getByLabel('Email').fill('fake@test.com');
    await page.getByLabel('Contraseña').fill('wrong');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.locator('.bg-red-50')).toBeVisible();
  });

  test('6. Protected route redirects to /login when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('7. Logout redirects to /login and clears token', async ({ page }) => {
    await loginAs(page, ctx.owner.token);
    await page.getByText('Cerrar sesión').click();
    await expect(page).toHaveURL(/\/login/);
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
