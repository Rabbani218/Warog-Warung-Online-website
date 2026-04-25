import { test, expect } from '@playwright/test';

test.describe('Admin Portal Flow', () => {
  test('can log in, reach dashboard, and navigate to products', async ({ page, baseURL }) => {
    console.log(`Navigating to admin page at ${baseURL}/admin...`);
    try {
      await Promise.race([
        page.goto(`${baseURL}/admin`, { waitUntil: 'domcontentloaded', timeout: 15000 }),
        page.waitForURL(/\/admin/, { timeout: 15000 })
      ]);
    } catch (error) {
      const currentUrl = page.url();
      console.log(`Navigation attempt resulted in URL: ${currentUrl}`);
      
      // Handle redirect loop errors
      if (error.message.includes("NS_ERROR_REDIRECT_LOOP") || error.message.includes("cannot follow more than 20 redirections")) {
        console.warn('Redirect loop detected');
        if (currentUrl === 'about:blank') {
          throw new Error(`Page redirected to about:blank - possible auth or config issue. Check if admin endpoint is properly configured.`);
        }
        if (!currentUrl.includes('/admin')) {
          throw new Error(`Unexpected redirect to: ${currentUrl}`);
        }
      } else {
        throw error;
      }
    }

    // Verify we're actually on an admin page, not about:blank
    const currentUrl = page.url();
    if (currentUrl === 'about:blank') {
      throw new Error(`After navigation, page is at about:blank. Admin page may not exist or is misconfigured.`);
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
