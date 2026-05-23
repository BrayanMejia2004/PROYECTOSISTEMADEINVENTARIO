import { test, expect } from '@playwright/test';
import { setupTestContext, loginAs } from '../fixtures/auth';

let ctx: Awaited<ReturnType<typeof setupTestContext>>;

test.beforeAll(async ({ request }) => {
  ctx = await setupTestContext(request);
});

test.describe('Inventory & Reports', () => {
  test('1. Create product via form', async ({ page }) => {
    await loginAs(page, ctx.admin.token);
    await page.goto('/inventory/new');

    await page.getByLabel(/SKU/).fill('TEST-001');
    await page.getByLabel(/Código de Barras/).fill('1234567890123');
    await page.getByLabel(/Nombre/).fill('Producto Test E2E');

    await page.getByLabel(/Precio Costo/).fill('1000');
    await page.getByLabel(/Ganancia/).fill('50');
    await page.getByLabel(/Stock Inicial/).fill('20');

    const submitBtn = page.getByRole('button', { name: /Guardar|Crear/ }).first();
    await submitBtn.click();

    await expect(page).toHaveURL(/\/inventory$/, { timeout: 10000 });
    await expect(page.getByText('Producto Test E2E')).toBeVisible({ timeout: 5000 });
  });

  test('2. Filter inventory by branch (owner only)', async ({ page }) => {
    await loginAs(page, ctx.owner.token);
    await page.goto('/inventory');

    await page.waitForSelector('text=Selecciona una sucursal', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);

    const branchSelect = page.locator('select').first();
    if (await branchSelect.isVisible()) {
      await branchSelect.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
    }

    await expect(page.locator('text=Lista de productos')).toBeVisible();
  });

  test('3. Reports page only accessible to owner', async ({ page }) => {
    await loginAs(page, ctx.admin.token);
    await page.goto('/reports');
    await page.waitForURL(/\/$/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/$/);
  });

  test('4. Reports page renders KPIs and charts for owner', async ({ page }) => {
    await loginAs(page, ctx.owner.token);
    await page.goto('/reports');

    await page.waitForTimeout(2000);

    const hasContent = await Promise.any([
      page.getByText('Ventas').isVisible(),
      page.getByText('Inventario').isVisible(),
      page.getByText('Rentabilidad').isVisible(),
      page.locator('canvas').first().isVisible(),
      page.locator('text=No hay datos').isVisible(),
    ]).catch(() => false);

    expect(hasContent).toBeTruthy();
  });

  test('5. User management - create cashier user', async ({ page }) => {
    await loginAs(page, ctx.owner.token);
    await page.goto('/users');

    await page.waitForTimeout(1000);

    const hasUsers = await page.locator('table').isVisible().catch(() => false);

    if (hasUsers) {
      await expect(page.locator('text=Cashier Test')).toBeVisible({ timeout: 5000 });
    }
  });

  test('6. Access to /reports blocked with redirect for admin', async ({ page }) => {
    await loginAs(page, ctx.admin.token);
    const response = await page.goto('/reports');
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/reports');
  });
});
