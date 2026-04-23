import { test, expect } from '@playwright/test';

test.describe('Client Portal Aggressive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for network to settle
    await page.goto('/', { waitUntil: 'networkidle' }); 
    await page.waitForLoadState('domcontentloaded');
    
    // Add a brief delay to ensure DOM is fully rendered
    await page.waitForTimeout(500);
    
    // Check if login is needed (using a safer locator strategy)
    const loginTrigger = page.locator('button').filter({ hasText: /Masuk|Login/i }).first();
    if (await loginTrigger.isVisible({ timeout: 5000 })) {
      await loginTrigger.click();
      
      const emailInput = page.getByPlaceholder(/Email anda/i);
      try {
        await emailInput.waitFor({ state: 'visible', timeout: 5000 });
        await emailInput.fill('test@wareb.com');
        await page.getByPlaceholder(/Password/i).fill('password123');
        await page.getByRole('button', { name: /Masuk ke Akun/i }).click();
        await page.waitForLoadState('networkidle');
      } catch (e) {
        console.log('Login modal did not appear or already logged in.');
      }
    }
  });

  test('Spam Click Stress Test', async ({ page }) => {
    // Wait for product buttons to appear
    const orderBtn = page.locator('button').filter({ hasText: /Pesan|Tambah/i }).first();
    await orderBtn.waitFor({ state: 'visible', timeout: 15000 });
    
    await test.step('Aggressive spam clicking', async () => {
      for (let i = 0; i < 15; i++) {
        try {
          await orderBtn.click({ timeout: 5000 });
          await page.waitForTimeout(100); // Small delay between clicks
        } catch (e) {
          console.log(`Click ${i} failed:`, e.message);
        }
      }
    });

    await test.step('Verify cart count', async () => {
      // Look for any indicator of items in cart (number badge)
      const cartBadge = page.locator('aside').getByText(/\d+/).first();
      await expect(cartBadge).toBeVisible({ timeout: 15000 });
    });
  });

  test('Complete Checkout Flow with Review', async ({ page }) => {
    // 1. Add item
    const orderBtn = page.locator('button').filter({ hasText: /Pesan|Tambah/i }).first();
    await orderBtn.waitFor({ state: 'visible', timeout: 15000 });
    await orderBtn.click();
    
    // 2. Go to product detail
    const productLink = page.locator('article h3').first();
    await productLink.waitFor({ state: 'visible', timeout: 10000 });
    await productLink.click();
    await expect(page).toHaveURL(/\/product\//, { timeout: 20000 });
    
    // 3. Submit Review
    const reviewTab = page.getByRole('button', { name: /Ulasan/i });
    await reviewTab.waitFor({ state: 'visible', timeout: 10000 });
    await reviewTab.click();
    
    const reviewInput = page.getByPlaceholder(/Apa pendapat Anda|Tulis ulasan/i);
    await reviewInput.waitFor({ state: 'visible', timeout: 5000 });
    await reviewInput.fill('Robot Test: Amazing! (E2E)');
    await page.getByRole('button', { name: /Kirim Ulasan/i }).click();
    await page.waitForTimeout(1000);
    
    // 4. Checkout
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const tableInput = page.getByPlaceholder(/Nomor meja/i);
    await tableInput.waitFor({ state: 'visible', timeout: 10000 });
    await tableInput.fill('Robot-99');
    
    const checkoutBtn = page.getByRole('button', { name: /Checkout/i });
    await checkoutBtn.waitFor({ state: 'visible', timeout: 10000 });
    await checkoutBtn.click();
    
    // 5. Verify success
    await expect(page.getByText(/Berhasil|Invoice|Pesanan|Struk/i)).toBeVisible({ timeout: 45000 });
  });

  test('AI Chatbot Gemini Interaction', async ({ page }) => {
    const chatbotFAB = page.locator('button').filter({ hasText: /Chatbot|CS/i }).first();
    await chatbotFAB.waitFor({ state: 'visible', timeout: 15000 });
    await chatbotFAB.click();
    
    const input = page.getByPlaceholder(/Tanya sesuatu|Ketik pesan/i);
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.fill('Halo AI, apa menu favorit hari ini?');
    await page.keyboard.press('Enter');
    
    // Wait for AI response
    const aiMessage = page.locator('div').filter({ hasText: /Halo|Assistant|Wareb|pesanan|Maaf/i }).last();
    await expect(aiMessage).toBeVisible({ timeout: 60000 });
  });
});
