import { test, expect } from "@playwright/test";

test.describe("Admin Flow", () => {
  test("admin can login, open dashboard, and navigate to products", async ({ page }) => {
    await page.goto("/admin");

    await page.getByPlaceholder(/Email/i).fill("admin@wareb.com");
    await page.getByPlaceholder(/Password/i).fill("admin123");
    await page.getByRole("button", { name: /Masuk ke Dashboard/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 30000 });
    await expect(page.getByText(/Dashboard Overview|Visualisasi Analitik|Orders Today/i)).toBeVisible();

    await page.getByRole("link", { name: /Inventory/i }).click();

    await expect(page).toHaveURL(/\/admin\/products/, { timeout: 30000 });
    await expect(page.getByRole("heading", { name: /Kelola Produk & Banner/i })).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/Application error|Unexpected error|ReferenceError/i);
  });
});
