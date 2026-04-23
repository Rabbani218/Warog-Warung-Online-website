import { test, expect } from "@playwright/test";

test.describe("Client Flow", () => {
  test("customer can browse, open chatbot, and add menu to cart", async ({ page }) => {
    await page.goto("/");

    // Store title / hero content should render (not blank)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const menuCards = page.locator("article");
    await expect(menuCards.first()).toBeVisible();

    // Open chatbot and ensure dialog area is rendered
    await page.getByLabel(/Layanan Customer Service/i).click();
    await expect(page.getByText(/Wareb AI Assistant/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Ketik pesan Anda/i)).toBeVisible();

    // Add one menu item to cart
    await page.getByLabel(/Tambah pesanan/i).first().click();

    // Cart should reflect at least one item
    await expect(page.getByRole("heading", { name: /Keranjang/i })).toBeVisible();
    await expect(page.getByText(/1 Item|Item/i)).toBeVisible();
  });
});
