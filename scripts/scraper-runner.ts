import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeBNM } from './scrapers/bnm.ts';
import { scrapeMAIB } from './scrapers/maib.ts';
import { scrapeMICB } from './scrapers/micb.ts';
import { scrapeCursMd } from './scrapers/cursmd.ts';
import type { ScrapeResult } from './scrapers/utils.ts';
import { prisma } from '../lib/prisma.ts';

const LOCK_FILE = path.resolve(process.cwd(), 'scripts', 'scrape.lock');
const STATUS_FILE = path.resolve(process.cwd(), 'scripts', 'last-scrape.json');

async function ensureCurrencyItem(code: string) {
  // Ensure category of type currency exists
  let category = await prisma.category.findFirst({ where: { type: 'currency' } });
  if (!category) {
    category = await prisma.category.create({ data: { name: 'Currencies', type: 'currency', slug: 'currencies' } });
  }

  let item = await prisma.priceItem.findFirst({ where: { name: code } });
  if (!item) {
    item = await prisma.priceItem.create({ data: { name: code, categoryId: category.id, unit: '1', description: `${code} exchange rate` } });
  }
  return item;
}

async function ensureRegionMoldova() {
  let region = await prisma.region.findUnique({ where: { name: 'Moldova' } as any }).catch(() => null);
  if (!region) {
    region = await prisma.region.create({ data: { name: 'Moldova', type: 'country' } });
  }
  return region;
}

async function storeRate(provider: string, code: string, avg: number, min?: number, max?: number) {
  const item = await ensureCurrencyItem(code);
  const region = await ensureRegionMoldova();

  const priceMin = min ?? avg;
  const priceMax = max ?? avg;
  const priceAvg = avg;
  const priceType = `${code}/MDL`;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);

  const existingEntry = await prisma.priceEntry.findFirst({
    where: {
      priceItemId: item.id,
      regionId: region.id,
      providerName: provider,
      priceType,
      dateCollected: {
        gte: todayStart,
        lt: tomorrowStart
      }
    }
  });

  if (existingEntry) {
    const previousMin = existingEntry.priceMin ?? priceMin;
    const previousMax = existingEntry.priceMax ?? priceMax;
    await prisma.priceEntry.update({
      where: { id: existingEntry.id },
      data: {
        priceMin: Math.min(previousMin, priceMin),
        priceAvg,
        priceMax: Math.max(previousMax, priceMax),
        status: 'live'
      }
    });
    return;
  }

  await prisma.priceEntry.create({ data: {
    priceItemId: item.id,
    regionId: region.id,
    providerName: provider,
    priceMin,
    priceAvg,
    priceMax,
    currency: 'MDL',
    priceType,
    sourceType: 'scraper',
    sourceConfidence: 85,
    status: 'live'
  }});
}

async function runAll() {
  // Acquire lock
  try {
    await fs.access(LOCK_FILE);
    // if exists, abort
    throw new Error('Scrape already running');
  } catch (e) {
    // lock file does not exist -> continue
  }

  await fs.writeFile(LOCK_FILE, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));

  const results: Array<{ url: string; provider: string; rates?: Record<string, number>; rows?: Array<{ provider: string; rates: Record<string, { buy?: number; sell?: number }> }> }> = [];
  const errors: string[] = [];

  const scrapers: Array<() => Promise<ScrapeResult>> = [scrapeBNM, scrapeMAIB, scrapeMICB, scrapeCursMd];
  for (const s of scrapers) {
    try {
      const { url, provider, rates, rows } = await s();
      console.log(`Scraped [${provider}]`, url, { rates, rows: rows?.length ?? 0 });
      results.push({ url, provider, rates, rows });

      if (rates) {
        for (const code of Object.keys(rates)) {
          const rate = rates[code];
          if (rate && rate > 0) {
            await storeRate(provider, code, rate);
            console.log(`✓ Stored ${code}/MDL = ${rate} (from ${provider})`);
          }
        }
      }

      if (rows) {
        for (const row of rows) {
          for (const code of Object.keys(row.rates)) {
            const ratePair = row.rates[code];
            if (!ratePair) continue;
            const buy = ratePair.buy;
            const sell = ratePair.sell;
            const avg = buy ?? sell;
            if (avg && avg > 0) {
              await storeRate(row.provider, code, avg, buy, sell);
              console.log(`✓ Stored ${code}/MDL = ${avg} (from ${row.provider})`);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Scraper error', err);
      errors.push(String(err?.message || err));
    }
  }

  const status = {
    lastRun: new Date().toISOString(),
    success: errors.length === 0,
    results,
    errors
  };

  try {
    await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2));
  } catch (e) {
    console.error('Failed writing status file', e);
  }

  console.log('Done');
  // remove lock
  try { await fs.unlink(LOCK_FILE); } catch (e) { /* ignore */ }
  return status;
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  runAll().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}

export { runAll };
