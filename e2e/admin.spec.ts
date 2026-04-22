import { test, expect } from '@playwright/test';

test.describe('Admin Portal Stress Tests', () => {
  
  test('Login Brute-Force & Error Boundary Test', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    
    await test.step('Attempt login with wrong credentials 5 times', async () => {
      for (let i = 0; i < 5; i++) {
        await page.getByPlaceholder(/Email/i).fill('wrong@robot.com');
        await page.getByPlaceholder(/Password/i).fill('wrongpassword');
        await page.getByRole('button', { name: /Masuk ke Dashboard/i }).click();
        await expect(page.locator('body')).toContainText(/gagal|salah|error/i, { timeout: 10000 });
      }
    });
  });

  test('KDS Kanban Quick Transition Stress', async ({ page }) => {
    await page.goto('/admin');
    await page.getByPlaceholder(/Email/i).fill('admin@wareb.com');
    await page.getByPlaceholder(/Password/i).fill('admin123');
    await page.getByRole('button', { name: /Masuk ke Dashboard/i }).click();
    
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 20000 });
    
    await page.goto('/admin/kds');
    await page.waitForLoadState('domcontentloaded');
    
    const ticket = page.locator('article, .glass-card').filter({ hasText: /NEW/i }).first();
    if (await ticket.isVisible()) {
      await ticket.getByRole('button', { name: /Mulai|Masak/i }).click();
      await page.waitForTimeout(1000);
      await ticket.getByRole('button', { name: /Siap|Selesai/i }).click();
    }
  });

  test('BOM Stock Deduction Verification', async ({ page }) => {
    await page.goto('/admin');
    await page.getByPlaceholder(/Email/i).fill('admin@wareb.com');
    await page.getByPlaceholder(/Password/i).fill('admin123');
    await page.getByRole('button', { name: /Masuk ke Dashboard/i }).click();
    
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 20000 });
    await page.waitForLoadState('domcontentloaded');
    
    const stockSection = page.locator('article, .panel').filter({ hasText: /Stok|Inventory/i }).first();
    const initialStock = await stockSection.innerText();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const orderBtn = page.getByLabel('Tambah pesanan').first();
    await orderBtn.click();
    
    const emailInput = page.getByPlaceholder(/Email anda/i);
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@wareb.com');
      await page.getByPlaceholder(/Password/i).fill('password123');
      await page.getByRole('button', { name: /Masuk ke Akun/i }).click();
      await expect(emailInput).not.toBeVisible();
    }

    await page.getByPlaceholder(/Nomor meja/i).fill('BOM-STRESS');
    await page.getByRole('button', { name: /Checkout/i }).click();
    await expect(page.getByText(/Berhasil|Invoice/i)).toBeVisible({ timeout: 20000 });
    
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('domcontentloaded');
    const updatedStock = await stockSection.innerText();
    expect(updatedStock).not.toBe(initialStock);
  });
});
