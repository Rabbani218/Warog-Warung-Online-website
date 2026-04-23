import { chromium } from "playwright";

const TEST_MESSAGE = "Halo, ini tes otomatis chatbot";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 60000 });

    await page.getByLabel("Layanan Customer Service").click({ timeout: 15000 });

    const input = page.getByPlaceholder("Ketik pesan Anda...");
    await input.fill(TEST_MESSAGE);

    await page.locator("form button[type='submit']").click();

    // User message should appear immediately (optimistic UI)
    await page.getByText(TEST_MESSAGE, { exact: false }).waitFor({ timeout: 10000 });

    // Bot response should appear within timeout (Gemini reply or fallback message)
    await page.waitForFunction(() => {
      const bodyText = document.body?.innerText || "";
      return (
        bodyText.includes("Maaf, sistem AI kami sedang istirahat sebentar") ||
        bodyText.includes("Terima kasih") ||
        bodyText.includes("menu") ||
        bodyText.includes("Wareb")
      );
    }, { timeout: 30000 });

    await page.screenshot({ path: "test-results/chatbot-smoke.png", fullPage: true });
    console.log("CHATBOT_SMOKE_TEST:PASS");
  } catch (error) {
    await page.screenshot({ path: "test-results/chatbot-smoke-fail.png", fullPage: true }).catch(() => {});
    console.error("CHATBOT_SMOKE_TEST:FAIL", error?.message || error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run();
