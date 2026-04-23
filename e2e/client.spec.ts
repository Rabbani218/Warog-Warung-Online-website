import { test, expect } from '@playwright/test';

test.describe('Client Portal Flow', () => {
  test('can browse homepage, open chatbot, and add a menu item to cart', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30000 });
    await expect(page.locator('article').first()).toBeVisible({ timeout: 30000 });

    await page.getByLabel(/Layanan Customer Service/i).click();
    await expect(page.getByText(/Wareb AI Assistant/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByPlaceholder(/Ketik pesan Anda/i)).toBeVisible({ timeout: 15000 });

    const addToCartButton = page.getByLabel(/Tambah pesanan/i).first();
    await addToCartButton.waitFor({ state: 'visible', timeout: 20000 });
    await addToCartButton.click();

    await expect(page.getByRole('heading', { name: /Keranjang/i })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('aside')).toBeVisible({ timeout: 15000 });
  });
});
