import { test, expect } from "@playwright/test";

test.describe("Client Flow Simulation", () => {
  test("Customer can browse menu, open chatbot, and add items to cart", async ({ page }) => {
    // 1. Membuka halaman utama
    await page.goto("/");

    // 2. Memverifikasi judul toko dan daftar menu (tidak blank)
    // Menggunakan heading level 1 sebagai indikator judul toko
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    
    // Memastikan setidaknya ada satu kartu menu (menggunakan locator modern)
    const menuItems = page.locator("article, .menu-card, [data-testid='menu-item']");
    await expect(menuItems.first()).toBeVisible({ timeout: 10000 });

    // 3. Mengklik tombol "Buka Chatbot CS"
    // Mencari tombol chatbot berdasarkan label atau icon
    const chatbotButton = page.getByLabel(/Layanan Customer Service|Chatbot/i);
    await chatbotButton.click();

    // Memastikan modal chatbot muncul
    await expect(page.getByText(/Wareb AI Assistant/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Ketik pesan Anda/i)).toBeVisible();

    // 4. Menyimulasikan klik tombol "Tambah ke Keranjang"
    // Mencari tombol tambah pesanan pertama
    const addToCartButton = page.getByLabel(/Tambah pesanan|Add to cart/i).first();
    await addToCartButton.click();

    // Verifikasi indikator keranjang muncul atau bertambah (opsional tapi disarankan)
    await expect(page.getByText(/Item|Keranjang/i)).toBeVisible();
  });
});
