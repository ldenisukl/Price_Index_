import { launchBrowser, type ScrapeResult } from "./utils.ts";

export async function scrapeMICB(): Promise<ScrapeResult> {
  const provider = "MICB";
  const url = "https://micb.md/";

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

      const parseValue = (raw: string | null | undefined): number | undefined => {
        if (!raw) return undefined;
        const cleaned = raw
          .replace(/\u00A0/g, " ")
          .replace(/,/g, ".")
          .replace(/[^0-9.]/g, "")
          .trim();
        const value = parseFloat(cleaned);
        return Number.isFinite(value) ? value : undefined;
      };

      const cashTable = document.querySelector(".exchange-table.exchange_numerar");
      if (!cashTable) return result;

      for (const code of ["EUR", "USD"]) {
        const buyCell = cashTable.querySelector(`.buy_${code}`) as HTMLElement | null;
        const sellCell = cashTable.querySelector(`.sell_${code}`) as HTMLElement | null;

        const buyValue = parseValue(buyCell?.innerText);
        const sellValue = parseValue(sellCell?.innerText);
        const value = buyValue ?? sellValue;

        if (value && value > 5 && value < 50) {
          result[code] = value;
        }
      }

      return result;
    });
    return { provider, url, rates };
  } finally {
    await browser.close();
  }
}