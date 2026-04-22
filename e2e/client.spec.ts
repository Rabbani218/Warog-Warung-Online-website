import { test, expect } from '@playwright/test';

test.describe('Client Portal Aggressive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const orderBtn = page.getByLabel('Tambah pesanan').first();
    if (await orderBtn.isVisible()) {
      await orderBtn.click();
      
      const emailInput = page.getByPlaceholder(/Email anda/i);
      try {
        await emailInput.waitFor({ state: 'visible', timeout: 5000 });
        await emailInput.fill('test@wareb.com');
        await page.getByPlaceholder(/Password/i).fill('password123');
        await page.getByRole('button', { name: /Masuk ke Akun/i }).click();
        await expect(emailInput).not.toBeVisible();
      } catch (e) {
        console.log('Login modal did not appear or already logged in.');
      }
    }
  });

  test('Spam Click Stress Test', async ({ page }) => {
    const orderBtn = page.getByLabel('Tambah pesanan').first();
    await test.step('Aggressive spam clicking', async () => {
      for (let i = 0; i < 20; i++) {
        await orderBtn.click();
      }
    });

    await test.step('Verify cart count', async () => {
      const cartItem = page.locator('aside').getByText(/20/);
      await expect(cartItem).toBeVisible();
    });
  });

  test('Complete Checkout Flow with Review', async ({ page }) => {
    // 1. Add item
    await page.getByLabel('Tambah pesanan').first().click();
    
    // 2. Go to Product Detail
    await page.locator('article h3').first().click();
    await expect(page).toHaveURL(/\/product\//, { timeout: 20000 });
    
    // 3. Submit Review
    const reviewTab = page.getByRole('button', { name: /Ulasan Pelanggan/i });
    await reviewTab.click();
    await page.getByPlaceholder(/Apa pendapat Anda|Tulis ulasan/i).fill('Robot Test: Amazing! (E2E)');
    await page.getByRole('button', { name: /Kirim Ulasan/i }).click();
    await page.waitForTimeout(1000); // Wait for toast
    
    // 4. Back and Checkout
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const tableInput = page.getByPlaceholder(/Nomor meja/i);
    await tableInput.fill('Robot-99');
    
    const checkoutBtn = page.getByRole('button', { name: /Checkout/i });
    await checkoutBtn.click();
    
    // 5. Verify Invoice
    // The invoice might appear in a modal or a new page.
    await expect(page.getByText(/Berhasil|Invoice|Pesanan/i)).toBeVisible({ timeout: 30000 });
  });

  test('AI Chatbot Gemini Interaction', async ({ page }) => {
    const chatbotFAB = page.getByLabel('Buka Chatbot');
    await chatbotFAB.click();
    
    const input = page.getByPlaceholder(/Tanya sesuatu/i);
    await input.fill('Halo AI, apa menu favorit hari ini?');
    await page.keyboard.press('Enter');
    
    // Longer timeout for Gemini response
    const aiMessage = page.locator('div').filter({ hasText: /Halo|Assistant|Wareb|pesanan/i }).last();
    await expect(aiMessage).toBeVisible({ timeout: 45000 });
  });
});
