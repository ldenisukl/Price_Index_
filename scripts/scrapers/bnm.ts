import axios from "axios";
import xml2js from "xml2js";
import type { ScrapeResult } from "./utils.ts";

export async function scrapeBNM(): Promise<ScrapeResult> {
  const provider = "BNM";
  const today = new Date().toISOString().split("T")[0];
  const urlWithDate = `https://www.bnm.md/en/official_exchange_rates?get_xml=1&date=${today}`;
  const urlNoDate = `https://www.bnm.md/en/official_exchange_rates?get_xml=1`;

  let res;
  const candidates = [urlWithDate, urlNoDate, urlWithDate.replace('/en/', '/'), urlNoDate.replace('/en/', '/')];
  let lastErr: any = null;
  for (const candidate of candidates) {
    try {
      const r = await axios.get(candidate, { responseType: 'text', headers: { 'User-Agent': 'Mozilla/5.0 (scraper)' } });
      res = r;
      break;
    } catch (err: any) {
      lastErr = err;
      // continue to next candidate on 404 or other network errors
    }
  }
  if (!res) {
    throw lastErr;
  }

  const parsed = await xml2js.parseStringPromise(res.data);

  const rates: Record<string, number> = {};

  parsed.ValCurs?.Valute?.forEach((currency: any) => {
    const code = currency.CharCode?.[0];
    const value = parseFloat(currency.Value?.[0]?.replace(",", ".") ?? "");
    if (code && Number.isFinite(value)) {
      rates[code] = value;
    }
  });

  return { provider, url: res.config.url ?? urlNoDate, rates };
}