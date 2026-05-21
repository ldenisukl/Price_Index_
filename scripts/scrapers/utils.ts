import type { Page } from "puppeteer";
import puppeteer from "puppeteer";

export type RateMap = Record<string, number>;

export type BankRateMap = Record<string, { buy?: number; sell?: number }>;

export interface ScrapeRow {
  provider: string;
  rates: BankRateMap;
  subtitle?: string;
  badge?: string;
  href?: string;
  note?: string;
}

export interface ScrapeResult {
  provider: string;
  url: string;
  rates?: RateMap;
  rows?: ScrapeRow[];
}

export function parseRateValue(raw: string | undefined | null): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw
    .toString()
    .replace(/\u00A0/g, " ")
    .replace(/,/g, ".")
    .replace(/[^0-9.]/g, "")
    .trim();
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : undefined;
}

export async function launchBrowser() {
  return await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

export async function extractRatesFromPage(page: Page, currencyCodes: string[]): Promise<RateMap> {
  return await page.evaluate((codes) => {
    const parse = (text: string): number | undefined => {
      if (!text) return undefined;
      const cleaned = text.trim().replace(/\u00A0/g, " ").replace(/,/g, ".");
      const match = cleaned.match(/[0-9]+(?:\.[0-9]+)?/);
      return match ? parseFloat(match[0]) : undefined;
    };

    const normalizeLine = (line: string) => line.replace(/\u00A0/g, " ").replace(/\t+/g, " ").trim();
    const lines = normalizeLine(document.body.innerText || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

    const result: Record<string, number> = {};
    const currencyRegex = (code: string) => new RegExp(`\\b${code}\\b`, "i");

    for (const line of lines) {
      for (const code of codes) {
        if (result[code]) continue;
        if (!currencyRegex(code).test(line)) continue;

        const afterMatch = line.match(new RegExp(`${code}[^0-9]*([0-9]+[.,][0-9]+)`, "i"));
        const beforeMatch = line.match(new RegExp("([0-9]+[.,][0-9]+)[^0-9]*" + code, "i"));
        const valueText = afterMatch?.[1] ?? beforeMatch?.[1];
        const value = valueText ? parse(valueText) : undefined;
        if (value && value > 0) {
          result[code] = value;
        }
      }
    }

    return result;
  }, currencyCodes);
}
