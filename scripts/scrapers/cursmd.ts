import axios from 'axios';
import { load } from 'cheerio';
import type { ScrapeResult, ScrapeRow, ProviderType } from './utils.ts';
import { launchBrowser } from './utils.ts';

const provider = 'CursMD';
const url = 'https://www.curs.md/ro/curs_valutar_banci';
const SUPPORTED = ['EUR', 'USD', 'GBP', 'RON'];

const normalizeText = (value: string | null | undefined): string =>
  (value ?? '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();

const normalizeProviderType = (raw: string): ProviderType => {
  const text = normalizeText(raw).toLowerCase();
  if (/\bbnm\b/.test(text)) return 'bnm';
  if (/\bcasa|change|chimb|câș|casa de schimb|cash/.test(text)) return 'exchange';
  if (/\bcsv\b/.test(text)) return 'csv';
  if (/\bbanc|bank|banca\b/.test(text)) return 'bank';
  return 'other';
};

const extractLocation = (text: string): string | undefined => {
  const normalized = normalizeText(text);
  if (!normalized) return undefined;
  const known = normalized.match(/\b(Chi[sș]inau|Chisinau|Bălți|Balti|Cahul|Orhei|Ungheni|Soroca|Tiraspol|Comrat|Dubasari|Rezina|Chișinău)\b/i);
  if (known) return known[0];
  const afterDash = normalized.split(/[-–—]/)[1]?.trim();
  if (afterDash && afterDash.length < 40) return afterDash;
  const afterComma = normalized.split(',').slice(1).join(',').trim();
  return afterComma || undefined;
};

const parseNumber = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const cleaned = normalizeText(value).replace(/,/g, '.').replace(/[^0-9.]/g, '').trim();
  const match = cleaned.match(/[0-9]+(?:\.[0-9]+)?/);
  if (!match) return undefined;
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export async function scrapeCursMd(): Promise<ScrapeResult> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    await page.waitForSelector('tbody tr', { timeout: 15000 });

    const rows = await page.evaluate((supported, pageUrl) => {
      const normalizeText = (value: string | null | undefined) =>
        (value ?? '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
      const parseNumber = (value: string | null | undefined) => {
        if (!value) return undefined;
        const cleaned = normalizeText(value).replace(/,/g, '.').replace(/[^0-9.]/g, '').trim();
        const match = cleaned.match(/[0-9]+(?:\.[0-9]+)?/);
        if (!match) return undefined;
        const parsed = Number.parseFloat(match[0]);
        return Number.isFinite(parsed) ? parsed : undefined;
      };
      const detectProviderType = (text: string | null | undefined): ProviderType => {
        const normalized = normalizeText(text).toLowerCase();
        if (/\bbnm\b/.test(normalized)) return 'bnm';
        if (/\bcasa|change|chimb|câș|casa de schimb|cash/.test(normalized)) return 'exchange';
        if (/\bcsv\b/.test(normalized)) return 'csv';
        if (/\bbanc|bank|banca\b/.test(normalized)) return 'bank';
        return 'other';
      };
      const extractLocation = (text: string | null | undefined) => {
        const normalized = normalizeText(text);
        if (!normalized) return undefined;
        const match = normalized.match(/\b(Chi[sș]inau|Chisinau|Bălți|Balti|Cahul|Orhei|Ungheni|Soroca|Tiraspol|Comrat|Dubasari|Rezina|Chișinău)\b/i);
        if (match) return match[0];
        const afterDash = normalized.split(/[-–—]/)[1]?.trim();
        if (afterDash && afterDash.length < 40) return afterDash;
        const afterComma = normalized.split(',').slice(1).join(',').trim();
        return afterComma || undefined;
      };
      const currencyClassRegex = /column-([A-Za-z]+)/i;

      return Array.from(document.querySelectorAll('tbody tr')).map((row) => {
        const bankNameElement = row.querySelector('.bank_name a');
        const bankName = normalizeText(bankNameElement?.textContent || row.querySelector('.bank_name')?.textContent || '');
        const badge = normalizeText(row.querySelector('.bank_name .badge')?.textContent || '');
        const note = normalizeText(row.querySelector('.bank_name sup')?.textContent || '');
        const address = normalizeText(bankNameElement?.getAttribute('title') || '');
        const providerType = detectProviderType(badge || note || bankName);
        const location = extractLocation(address || note || bankName);

        const rates: Record<string, { buy: number; sell?: number }> = {};
        const cells = Array.from(row.querySelectorAll('td[class*="column-"]'));
        for (const cell of cells) {
          const className = Array.from(cell.classList).find((cls) => cls.startsWith('column-'));
          const match = className?.match(currencyClassRegex);
          if (!match) return undefined;
          const currency = match[1].toUpperCase();
          if (!currency || !supported.includes(currency)) return undefined;
          const raw = normalizeText(cell.textContent || '');
          const value = parseNumber(raw);
          if (!value || value <= 0) return undefined;
          if (!rates[currency]) {
            rates[currency] = { buy: value };
          } else if (rates[currency].buy !== undefined && rates[currency].sell === undefined) {
            rates[currency].sell = value;
          }
        }

        return {
          provider: bankName,
          subtitle: note || address ? note || address : undefined,
          badge,
          providerType,
          location,
          href: pageUrl,
          note,
          rates
        };
      });
    }, SUPPORTED as any, url);

    let parsedRows: ScrapeRow[] = (rows ?? [])
      .filter((row): row is NonNullable<typeof row> => Boolean(row && row.provider && Object.keys(row.rates || {}).length > 0))
      .map((row) => ({
        provider: row.provider,
        rates: row.rates,
        badge: row.badge || 'Bancă',
        providerType: row.providerType || 'other',
        location: row.location,
        href: row.href || url,
        subtitle: row.subtitle,
        note: row.note
      }));

    if (!parsedRows.length) {
      try {
        const res = await axios.get(url, { responseType: 'text', headers: { 'User-Agent': 'Mozilla/5.0 (scraper)' }, timeout: 15000 });
        const $ = load(res.data);
        const cheerioRows: ScrapeRow[] = [];

        const detectProviderType = (text: string) => {
          const normalized = normalizeText(text).toLowerCase();
          if (/\bbnm\b/.test(normalized)) return 'bnm';
          if (/\bcasa|change|chimb|câș|casa de schimb|cash/.test(normalized)) return 'exchange';
          if (/\bcsv\b/.test(normalized)) return 'csv';
          if (/\bbanc|bank|banca\b/.test(normalized)) return 'bank';
          return 'other';
        };

        const extractLocationFallback = (text: string) => {
          const normalized = normalizeText(text);
          if (!normalized) return undefined;
          const match = normalized.match(/\b(Chi[sș]inau|Chisinau|Bălți|Balti|Cahul|Orhei|Ungheni|Soroca|Tiraspol|Comrat|Dubasari|Rezina|Chișinău)\b/i);
          if (match) return match[0];
          const afterDash = normalized.split(/[-–—]/)[1]?.trim();
          if (afterDash && afterDash.length < 40) return afterDash;
          const afterComma = normalized.split(',').slice(1).join(',').trim();
          return afterComma || undefined;
        };

        const table = $('table')
          .filter((_: unknown, el: any) => {
            const text = $(el).text();
            return SUPPORTED.every((c) => text.includes(c));
          })
          .first();
        const sourceTable = table.length ? table : $('table').first();

        sourceTable.find('tbody tr').each((_: unknown, tr: any) => {
          const row = $(tr);
          const firstCell = row.find('td, th').first();
          const badge = normalizeText(firstCell.find('.badge').text() || '');
          const bankName = normalizeText(firstCell.find('a').first().text() || firstCell.text());
          const note = normalizeText(firstCell.find('sup').text() || '');
          const address = normalizeText(firstCell.find('a').attr('title') || '');
          const providerType = detectProviderType(badge || note || bankName);
          const location = extractLocationFallback(address || note || bankName);

          if (!bankName) return;

          const values = row
            .find('td, th')
            .toArray()
            .slice(1, 9)
            .map((t: any) => normalizeText($(t).text()).replace(/,/g, '.').replace(/[^0-9.]/g, ''));

          const ratePairs: Record<string, { buy?: number; sell?: number }> = {};
          const mapIndex: Record<string, number[]> = { EUR: [0, 1], USD: [2, 3], GBP: [4, 5], RON: [6, 7] };

          for (const code of SUPPORTED) {
            const idx = mapIndex[code];
            const buy = Number(values[idx[0]]) || undefined;
            const sell = Number(values[idx[1]]) || undefined;
            if (buy || sell) ratePairs[code] = { buy, sell };
          }

          if (Object.keys(ratePairs).length) {
            cheerioRows.push({
              provider: bankName,
              rates: ratePairs,
              badge: badge || 'Bancă',
              providerType,
              location,
              href: url,
              subtitle: note || address ? note || address : undefined,
              note
            });
          }
        });

        if (cheerioRows.length) parsedRows = cheerioRows;
      } catch (e: any) {
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
