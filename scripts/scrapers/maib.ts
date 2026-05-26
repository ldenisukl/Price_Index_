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
      const result: Record<string, { buy?: number; sell?: number }> = {};
      const table = document.querySelector("table.exchange__table");
      if (!table) return result;

      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 3) return;

        const currencyCode = cells[0]?.textContent?.trim()?.toUpperCase();
        const buyValue = cells[1]?.textContent?.trim();
        const sellValue = cells[2]?.textContent?.trim();

        if (!currencyCode || !["EUR", "USD", "GBP", "RON"].includes(currencyCode)) {
          return;
        }

        const buy = buyValue ? Number.parseFloat(buyValue.replace(",", ".")) : undefined;
        const sell = sellValue ? Number.parseFloat(sellValue.replace(",", ".")) : undefined;

        if ((buy && buy > 0) || (sell && sell > 0)) {
          result[currencyCode] = {
            buy: Number.isFinite(buy) ? buy : undefined,
            sell: Number.isFinite(sell) ? sell : undefined
          };
        }
      });

      return result;
    });

    return {
      provider,
      url,
      rows: [{
        provider,
        rates,
        providerType: "bank",
        location: "Moldova"
      }]
    };
  } finally {
    await browser.close();
  }
}