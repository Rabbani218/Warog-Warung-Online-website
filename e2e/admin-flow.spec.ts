import { test, expect } from "@playwright/test";

test.describe("Admin Flow Simulation", () => {
  test("Admin can login and navigate through dashboard and products", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    await page.getByPlaceholder(/Email/i).fill("admin@wareb.com");
    await page.getByPlaceholder(/Password/i).fill("admin123");

    const loginSubmit = page.locator("form button[type='submit']").filter({ hasText: /Masuk ke Dashboard|Login/i });

    await Promise.all([
      page.waitForURL(/\/admin\/dashboard/, { timeout: 30000 }),
      loginSubmit.first().click(),
    ]);

    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Dashboard Overview|Visualisasi Analitik|Ringkasan/i)).toBeVisible({ timeout: 30000 });

    await page.getByRole("link", { name: /Inventory|Produk|Menu/i }).first().click();

    await page.waitForURL(/\/admin\/products/, { timeout: 30000 });
    await expect(page.getByRole("heading", { name: /Kelola Produk & Banner|Kelola Produk|Daftar Menu/i })).toBeVisible({ timeout: 30000 });

    await expect(page.locator("body")).not.toContainText(/Unexpected Error|Application Error|ReferenceError/i);
  });
});
