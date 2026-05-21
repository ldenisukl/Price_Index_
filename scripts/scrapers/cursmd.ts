import axios from 'axios';
import { load } from 'cheerio';
import type { ScrapeResult, ScrapeRow } from './utils.ts';
import { launchBrowser } from './utils.ts';

const provider = 'CursMD';
const url = 'https://www.curs.md/ro/curs_valutar_banci';

const SUPPORTED = ['EUR', 'USD', 'GBP', 'RON'];

export async function scrapeCursMd(): Promise<ScrapeResult> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    await page.waitForSelector('tbody tr', { timeout: 15000 });

    const rows = await page.evaluate((supported) => {
      const currencyClassRegex = /column-([A-Za-z]+)/i;
      const normalizeText = (value: string | null): string => (value ?? '').replace(/\u00A0/g, ' ').trim();
      const parseNumber = (value: string | null): number | undefined => {
        if (!value) return undefined;
        const cleaned = value.replace(/\u00A0/g, ' ').replace(/,/g, '.').replace(/[^0-9.]/g, '').trim();
        const match = cleaned.match(/[0-9]+(?:\.[0-9]+)?/);
        if (!match) return undefined;
        const parsed = Number.parseFloat(match[0]);
        return Number.isFinite(parsed) ? parsed : undefined;
      };

      const rows = Array.from(document.querySelectorAll('tbody tr'));
      return rows.map((row) => {
        const bankNameElement = row.querySelector('.bank_name a');
        const bankName = normalizeText(bankNameElement?.textContent || row.querySelector('.bank_name')?.textContent || '');
        const badge = normalizeText(row.querySelector('.bank_name .badge')?.textContent || '');
        const note = normalizeText(row.querySelector('.bank_name sup')?.textContent || '');
        const address = bankNameElement?.getAttribute('title') || '';

        const rates: Record<string, { buy?: number; sell?: number }> = {};
        const cells = Array.from(row.querySelectorAll('td[class*="column-"]'));

        for (const cell of cells) {
          const className = Array.from(cell.classList).find((cls) => cls.startsWith('column-'));
          const match = className?.match(currencyClassRegex);
          if (!match) continue;

          const currency = match[1].toUpperCase();
          if (!currency || !supported.includes(currency)) continue;

          const raw = normalizeText(cell.textContent || '');
          const value = parseNumber(raw);
          if (!value || value <= 0) continue;

          if (!rates[currency]) {
            rates[currency] = { buy: value };
          } else if (rates[currency].buy !== undefined && rates[currency].sell === undefined) {
            rates[currency].sell = value;
          }
        }

        return {
          provider: bankName,
          subtitle: undefined,
          badge,
          href: url,
          note,
          rates
        };
      });
    }, SUPPORTED as any);

    let parsedRows: ScrapeRow[] = rows
      .filter((row) => row.provider && Object.keys(row.rates).length > 0)
      .map((row) => ({
        provider: row.provider,
        rates: row.rates,
        badge: row.badge || 'Bancă',
        href: url,
        subtitle: row.note ? row.note : undefined,
        note: row.note
      }));

    // Fallback: if Puppeteer yields no rows, try a lightweight cheerio parse
    if (!parsedRows.length) {
      try {
        const res = await axios.get(url, { responseType: 'text', headers: { 'User-Agent': 'Mozilla/5.0 (scraper)' }, timeout: 15000 });
        const $ = load(res.data);
        let table = $('table').filter((_, el) => {
          const text = $(el).text();
          return SUPPORTED.every((c) => text.includes(c));
        }).first();
        if (!table.length) table = $('table').first();

        const cheerioRows: ScrapeRow[] = [];
        table.find('tbody tr').each((_, tr) => {
          const cells = $(tr).find('td, th').toArray().map((t) => $(t).text().replace(/\s+/g, ' ').trim());
          if (cells.length < 2) return;
          const bankName = cells[0].trim();
          if (!bankName) return;
          const values = cells.slice(1, 9).map((v) => v.replace(/\u00A0/g, ' ').replace(/,/g, '.').replace(/[^0-9.]/g, '').trim());
          const ratePairs: Record<string, { buy?: number; sell?: number }> = {};
          const mapIndex: Record<string, number[]> = { EUR: [0, 1], USD: [2, 3], GBP: [4, 5], RON: [6, 7] };
          for (const code of SUPPORTED) {
            const idx = mapIndex[code];
            const buy = Number(values[idx[0]]) || undefined;
            const sell = Number(values[idx[1]]) || undefined;
            if (buy || sell) ratePairs[code] = { buy, sell };
          }
          if (Object.keys(ratePairs).length) {
            cheerioRows.push({ provider: bankName, rates: ratePairs, badge: 'Bancă', href: url });
          }
        });

        if (cheerioRows.length) parsedRows = cheerioRows;
      } catch (e) {
        console.error('[scrapeCursMd] cheerio fallback failed', e?.message || e);
      }
    }

    return { provider, url, rows: parsedRows };
  } catch (error: any) {
    console.error('[scrapeCursMd] failed', error?.message || error);
    return { provider, url, rows: [] };
  } finally {
    await browser.close();
  }
}

export default scrapeCursMd;
