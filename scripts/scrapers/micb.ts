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
      const result: Record<string, { buy?: number; sell?: number }> = {};

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

      const buyCells = document.querySelectorAll<HTMLElement>(".col[class*='buy_']");
      buyCells.forEach((cell) => {
        const className = Array.from(cell.classList).find((cls) => cls.startsWith("buy_"));
        const code = className?.replace("buy_", "").toUpperCase();

        if (!code || !["EUR", "USD", "GBP", "RON"].includes(code)) {
          return;
        }

        const buy = parseValue(cell.dataset.sell || cell.innerText);
        const sellCell = document.querySelector<HTMLElement>(`.sell_${code}`);
        const sell = parseValue(sellCell?.dataset.sell || sellCell?.innerText);

        if ((buy && buy > 0) || (sell && sell > 0)) {
          result[code] = { buy, sell };
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