import { test, expect } from '@playwright/test';
import { setupTestContext, loginAs } from '../fixtures/auth';
import { seedProduct } from '../fixtures/api';

let ctx: Awaited<ReturnType<typeof setupTestContext>>;

test.beforeAll(async ({ request }) => {
  ctx = await setupTestContext(request);
  await seedProduct(request, ctx.owner.token, ctx.branchId, {
    name: 'Lapicero BIC Azul', sku: 'LAP-001', barcode: '7701234567890',
    costPrice: 500, price: 1200, minStock: 0, maxStock: 100,
  });
  await seedProduct(request, ctx.owner.token, ctx.branchId, {
    name: 'Cuaderno Norma 100H', sku: 'CUA-001', barcode: '7709876543210',
    costPrice: 2500, price: 5000, minStock: 0, maxStock: 50,
  });
});

test.describe('POS Flows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ctx.cashier.token);
  });

  test('1. Open cash register (Abrir Caja)', async ({ page }) => {
    await page.goto('/caja');
    await expect(page.getByText('Caja Cerrada')).toBeVisible();
    await page.getByRole('button', { name: 'Abrir Caja' }).click();

    const amountInput = page.getByPlaceholder('Monto inicial en efectivo');
    await amountInput.fill('1000000');
    await page.getByRole('button', { name: 'Confirmar' }).click();

    await expect(page.getByText('Caja Abierta')).toBeVisible({ timeout: 5000 });
  });

  test('2. Complete sale with customer, payment and receipt', async ({ page }) => {
    await page.goto('/caja');
    if (await page.getByText('Caja Cerrada').isVisible()) {
      await page.getByRole('button', { name: 'Abrir Caja' }).click();
      await page.getByPlaceholder('Monto inicial en efectivo').fill('1000000');
      await page.getByRole('button', { name: 'Confirmar' }).click();
      await expect(page.getByText('Caja Abierta')).toBeVisible({ timeout: 5000 });
    }

    await page.goto('/pos/1');
    await expect(page.getByRole('heading', { name: /Punto de Venta/ })).toBeVisible();

    await page.waitForSelector('text=Carrito', { timeout: 10000 });

    const searchInput = page.getByPlaceholder('Buscar por nombre o SKU...');
    await searchInput.fill('Lapicero');
    await page.waitForTimeout(1000);

    const addButtons = page.locator('button:has-text("Lapicero")').first();
    await addButtons.click();

    await expect(page.getByText('Carrito (1)')).toBeVisible({ timeout: 3000 });

    const customerInput = page.getByPlaceholder('Buscar cliente...');
    await customerInput.fill('Cliente Ocasional');
    await page.waitForTimeout(500);

    const customerDropdown = page.locator('button:has-text("Cliente Ocasional")').first();
    if (await customerDropdown.isVisible()) {
      await customerDropdown.click();
    } else {
      await page.getByRole('button', { name: 'Crear' }).click();
      await page.getByPlaceholder('Nombre del cliente').fill('Cliente Ocasional');
      await page.getByPlaceholder('Teléfono (opcional)').fill('3001234567');
      await page.getByRole('button', { name: 'Guardar' }).click();
    }

    await expect(page.locator('text=Cliente Ocasional')).toBeVisible({ timeout: 3000 });

    await page.getByRole('button', { name: 'Cobrar' }).click();
    await page.waitForTimeout(500);

    const amountField = page.getByPlaceholder('0');
    if (await amountField.isVisible()) {
      await amountField.fill('2000');
    }

    const confirmBtn = page.getByRole('button', { name: /Cobrar|Confirmar pago/ });
    await confirmBtn.click();
    await page.waitForTimeout(1000);

    await expect(page.locator('[class*="Receipt"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('3. Close cash register and verify receipt', async ({ page }) => {
    await page.goto('/caja');
    if (await page.getByText('Caja Cerrada').isVisible()) {
      await page.getByRole('button', { name: 'Abrir Caja' }).click();
      await page.getByPlaceholder('Monto inicial en efectivo').fill('500000');
      await page.getByRole('button', { name: 'Confirmar' }).click();
      await expect(page.getByText('Caja Abierta')).toBeVisible({ timeout: 5000 });
    }

    await page.getByRole('button', { name: 'Cerrar Caja' }).click();
    await page.getByRole('button', { name: 'Cerrar Caja' }).last().click();

    await expect(page.locator('text=Ventas del Día')).toBeVisible({ timeout: 5000 });
  });

  test('4. POS blocked without open shift', async ({ page, context }) => {
    await page.evaluate(() => localStorage.clear());
    await loginAs(page, ctx.cashier.token);
    await page.goto('/caja');

    const isOpen = await page.getByText('Caja Abierta').isVisible().catch(() => false);
    if (isOpen) {
      await page.getByRole('button', { name: 'Cerrar Caja' }).click();
      await page.getByRole('button', { name: 'Cerrar Caja' }).last().click();
      await page.waitForTimeout(1000);
    }

    await page.goto('/pos/1');
    await expect(page.getByText('Caja no abierta')).toBeVisible({ timeout: 5000 });
  });

  test('5. Customer clears after sale completion', async ({ page }) => {
    await page.goto('/caja');
    if (await page.getByText('Caja Cerrada').isVisible()) {
      await page.getByRole('button', { name: 'Abrir Caja' }).click();
      await page.getByPlaceholder('Monto inicial en efectivo').fill('1000000');
      await page.getByRole('button', { name: 'Confirmar' }).click();
      await expect(page.getByText('Caja Abierta')).toBeVisible({ timeout: 5000 });
    }

    await page.goto('/pos/1');
    await page.waitForSelector('text=Carrito', { timeout: 10000 });

    const searchInput = page.getByPlaceholder('Buscar por nombre o SKU...');
    await searchInput.fill('Lapicero');
    await page.waitForTimeout(1000);
    const addButtons = page.locator('button:has-text("Lapicero")').first();
    await addButtons.click();

    const customerInput = page.getByPlaceholder('Buscar cliente...');
    await customerInput.fill('Cliente Ocasional');
    await page.waitForTimeout(500);

    const customerDropdown = page.locator('button:has-text("Cliente Ocasional")').first();
    if (await customerDropdown.isVisible()) {
      await customerDropdown.click();
    } else {
      await page.getByRole('button', { name: 'Crear' }).click();
      await page.getByPlaceholder('Nombre del cliente').fill('Cliente Ocasional');
      await page.getByRole('button', { name: 'Guardar' }).click();
    }
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Cobrar' }).click();
    await page.waitForTimeout(300);

    const confirmBtn = page.getByRole('button', { name: /Cobrar|Confirmar pago/ });
    await confirmBtn.click();
    await page.waitForTimeout(1000);

    await expect(page.getByPlaceholder('Buscar cliente...')).toBeVisible({ timeout: 5000 });
  });
});
