import { test, expect } from '@playwright/test';

test.describe('Admin Portal Flow', () => {
  test('can log in, reach dashboard, and navigate to products', async ({ page }) => {
    // Add waitForURL to catch redirect errors gracefully
    try {
      await Promise.race([
        page.goto('/admin', { waitUntil: 'domcontentloaded' }),
        page.waitForURL(/\/admin/, { timeout: 15000 })
      ]);
    } catch (error) {
      // If redirect loop occurs, check if we're on an error page
      if (page.url().includes('error') || page.url().includes('redirect')) {
        console.error('Redirect loop detected:', page.url());
        throw new Error('Admin page inaccessible due to redirect loop');
      }
      // Re-throw if it's a real timeout
      if (!page.url().includes('/admin')) throw error;
    }

    await page.getByPlaceholder(/Email/i).fill('admin@wareb.com');
    await page.getByPlaceholder(/Password/i).fill('admin123');

    await Promise.all([
      page.waitForURL(/\/admin\/dashboard/, { timeout: 30000 }),
      page.getByRole('button', { name: /Masuk ke Dashboard|Login/i }).first().click(),
    ]);

    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Dashboard Overview|Visualisasi Analitik|Ringkasan/i)).toBeVisible({ timeout: 30000 });

    await page.getByRole('link', { name: /Inventory|Produk|Menu/i }).first().click();
    await page.waitForURL(/\/admin\/products/, { timeout: 30000 });

    await expect(page.getByRole('heading', { name: /Kelola Produk & Banner|Kelola Produk/i })).toBeVisible({ timeout: 30000 });
    await expect(page.locator('body')).not.toContainText(/Application error|Unexpected error|ReferenceError/i);
  });
});
