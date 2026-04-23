import { test, expect } from '@playwright/test';

test.describe('Admin Portal Flow', () => {
  test('can log in, reach dashboard, and navigate to products', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    await page.getByPlaceholder(/Email/i).fill('admin@wareb.com');
    await page.getByPlaceholder(/Password/i).fill('admin123');

    await Promise.all([
      page.waitForURL(/\/admin\/dashboard/, { timeout: 30000 }),
      page.getByRole('button', { name: /Masuk ke Dashboard/i }).click(),
    ]);

    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Dashboard Overview|Visualisasi Analitik/i)).toBeVisible({ timeout: 30000 });

    await page.getByRole('link', { name: /Inventory/i }).click();
    await page.waitForURL(/\/admin\/products/, { timeout: 30000 });

    await expect(page.getByRole('heading', { name: /Kelola Produk & Banner/i })).toBeVisible({ timeout: 30000 });
    await expect(page.locator('body')).not.toContainText(/Application error|Unexpected error|ReferenceError/i);
  });
});
