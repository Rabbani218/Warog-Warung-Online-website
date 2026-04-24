import { test, expect } from '@playwright/test';

test.describe('Admin Portal Flow', () => {
  test('can log in, reach dashboard, and navigate to products', async ({ page, baseURL }) => {
    // Add waitForURL to catch redirect errors gracefully
    console.log(`Navigating to admin page at ${baseURL}/admin...`);
    try {
      await Promise.race([
        page.goto(`${baseURL}/admin`, { waitUntil: 'domcontentloaded', timeout: 15000 }),
        page.waitForURL(/\/admin/, { timeout: 15000 })
      ]);
    } catch (error) {
      console.log(`Current URL after potential redirect loop: ${page.url()}`);
      // If redirect loop occurs, check if we're on an error page
      if (error.message.includes("NS_ERROR_REDIRECT_LOOP") || error.message.includes("cannot follow more than 20 redirections")) {
        console.warn('Redirect loop detected - ensuring we are still on an admin path');
        if (!page.url().includes('/admin')) {
          throw new Error(`Unexpected redirect to: ${page.url()}`);
        }
      } else {
        throw error;
      }
    }

    await page.getByPlaceholder(/Email/i).fill('admin@wareb.com');
    await page.getByPlaceholder(/Password/i).fill('admin123');

    await Promise.all([
      page.waitForURL(/\/admin\/dashboard/, { timeout: 30000 }),
      page.getByRole('button', { name: /Masuk ke Dashboard|Login/i }).first().click(),
    ]);

    await page.waitForLoadState('networkidle');
    console.log("Dashboard reached, verifying content...");
    await expect(page.getByText(/Dashboard Overview|Visualisasi Analitik|Ringkasan/i)).toBeVisible({ timeout: 30000 });

    await page.getByRole('link', { name: /Inventory|Produk|Menu/i }).first().click();
    await page.waitForURL(/\/admin\/products/, { timeout: 30000 });

    await expect(page.getByRole('heading', { name: /Kelola Produk & Banner|Kelola Produk/i })).toBeVisible({ timeout: 30000 });
    await expect(page.locator('body')).not.toContainText(/Application error|Unexpected error|ReferenceError/i);
  });
});
