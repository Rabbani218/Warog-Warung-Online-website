import { test, expect } from '@playwright/test';

test('admin page is accessible', async ({ page, baseURL }) => {
  console.log(`Testing access to ${baseURL}/admin`);
  const response = await page.goto(`${baseURL}/admin`, { waitUntil: 'networkidle' });
  console.log(`Response status: ${response.status()}`);
  expect(response.status()).toBe(200);
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByText(/Kelola Operasional Warung/i)).toBeVisible();
});
