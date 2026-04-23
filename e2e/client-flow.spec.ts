import { test, expect } from "@playwright/test";

test.describe("Client Flow Simulation", () => {
  test("Customer can browse menu, open chatbot, and add items to cart", async ({ page }) => {
    // 1. Membuka halaman utama
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // 2. Memverifikasi judul toko dan daftar menu (tidak blank)
    // Menggunakan heading level 1 sebagai indikator judul toko
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 30000 });
    
    // Memastikan setidaknya ada satu kartu menu (menggunakan locator modern)
    const menuItems = page.locator("article, .menu-card, [data-testid='menu-item']");
    await menuItems.first().waitFor({ state: "visible", timeout: 30000 });

    // 3. Mengklik tombol "Buka Chatbot CS"
    // Mencari tombol chatbot berdasarkan label atau icon
    const chatbotButton = page.getByRole("button", { name: /Layanan Customer Service|Chatbot/i });
    await chatbotButton.waitFor({ state: "visible", timeout: 20000 });
    await chatbotButton.click();

    // Memastikan modal chatbot muncul
    await expect(page.getByText(/Wareb AI Assistant/i).first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByPlaceholder(/Ketik pesan Anda/i)).toBeVisible({ timeout: 15000 });

    // 4. Menyimulasikan klik tombol "Tambah ke Keranjang"
    // Mencari tombol tambah pesanan pertama
    const addToCartButton = page.getByLabel(/Tambah pesanan|Add to cart/i).first();
    await addToCartButton.waitFor({ state: "visible", timeout: 30000 });
    await addToCartButton.click();

    // Verifikasi indikator keranjang muncul atau bertambah (opsional tapi disarankan)
    await expect(page.getByText(/Keranjang/i).first()).toBeVisible({ timeout: 15000 });
  });
});
