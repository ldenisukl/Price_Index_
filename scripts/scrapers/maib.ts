import { launchBrowser, type ScrapeResult } from "./utils.ts";

export async function scrapeMAIB(): Promise<ScrapeResult> {
  const provider = "MAIB";
  const url = "https://www.maib.md/";

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const rates = await page.evaluate(() => {
      const result: Record<string, number> = {};

      // Target the specific exchange rate table
      const table = document.querySelector("table.exchange__table");
      if (!table) return result;

      const rows = table.querySelectorAll("tbody tr");

      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 2) return;

        const currencyCode = cells[0]?.innerText?.trim() || "";
        const buyValue = cells[1]?.innerText?.trim() || "";

        if ((currencyCode === "EUR" || currencyCode === "USD") && buyValue) {
          const val = parseFloat(buyValue.replace(",", "."));
          if (val && val > 5 && val < 50) {
            result[currencyCode] = val;
          }
        }
      });

      return result;
    });
    return { provider, url, rates };
  } finally {
    await browser.close();
  }
}