import { test, expect } from "@playwright/test";

test.describe("Admin Flow Simulation", () => {
  test("Admin can login and navigate through dashboard and products", async ({ page }) => {
    // 1. Mengunjungi halaman login admin
    await page.goto("/admin");

    // 2. Mengisi input email dan password, lalu Login
    // Menggunakan getByPlaceholder sesuai standar modern Playwright
    await page.getByPlaceholder(/Email/i).fill("owner@wareb.local");
    await page.getByPlaceholder(/Password/i).fill("wareb12345");
    
    // Klik tombol masuk
    await page.getByRole("button", { name: /Masuk ke Dashboard|Login/i }).click();

    // 3. Menunggu pengalihan ke /admin/dashboard
    // Memastikan URL berpindah dan elemen dashboard (grafik/ringkasan) muncul
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
    
    // Verifikasi elemen visual dashboard (misal teks Overview atau Grafik)
    await expect(page.getByText(/Dashboard|Overview|Ringkasan/i).first()).toBeVisible();

    // 4. Berpindah ke tab /admin/products
    // Mencari link navigasi ke produk/inventory
    const productLink = page.getByRole("link", { name: /Produk|Inventory|Menu/i });
    await productLink.click();

    // Memastikan navigasi berhasil tanpa error (layar putih)
    await expect(page).toHaveURL(/\/admin\/products/, { timeout: 10000 });
    await expect(page.getByRole("heading", { name: /Kelola Produk|Daftar Menu/i })).toBeVisible();
    
    // Sanity check: memastikan tidak ada pesan error fatal di layar
    await expect(page.locator("body")).not.toContainText(/Unexpected Error|Application Error/i);
  });
});
