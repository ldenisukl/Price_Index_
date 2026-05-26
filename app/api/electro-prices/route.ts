import { NextResponse } from 'next/server';

const TARGETS = [
  {
    store: 'enter',
    label: 'Enter',
    url: 'https://enter.online/telefoane/smartphone-uri/apple-iphone-17-pro-12-gb-256-gb-5g-single-sim-silver'
  },
  {
    store: 'gorilla',
    label: 'Gorilla',
    url: 'https://gorilla.md/produs/apple-iphone-17-pro-12-256gb-silver/'
  }
] as const;

type AvailabilityStatus = 'in-stock' | 'out-of-stock' | 'unknown';

type ElectroOffer = {
  store: (typeof TARGETS)[number]['store'];
  label: string;
  price: string;
  link: string;
  stock: AvailabilityStatus;
  stockLabel: string;
  updatedAt: string;
};

function formatCurrency(value: number, currency = 'MDL') {
  return `${new Intl.NumberFormat('ro-MD', { maximumFractionDigits: 0 }).format(value)} ${currency}`;
}

function parseNumber(value: string) {
  const cleaned = value.replace(/[^0-9,.-]/g, '').trim();

  if (!cleaned) {
    return null;
  }

  if (cleaned.includes(',') && cleaned.includes('.')) {
    return Number(cleaned.replace(/\./g, '').replace(',', '.'));
  }

  if (cleaned.includes(',')) {
    return Number(cleaned.replace(',', '.'));
  }

  return Number(cleaned);
}

function extractEnterPrice(html: string) {
  const productPrice = html.match(/fs-20[^>]*>\s*([0-9]{1,3}(?:\s[0-9]{3})+)\s*<\/span>\s*<span[^>]*>lei<\/span>/i)?.[1];
  const priceMatch = html.match(/"price"\s*:\s*(\d{4,6})(?:\D|$)/i);
  const valueMatch = html.match(/"value"\s*:\s*(\d{4,6})(?:\D|$)/i);
  const raw = productPrice?.replace(/\s/g, '') ?? priceMatch?.[1] ?? valueMatch?.[1];

  if (!raw) {
    return null;
  }

  const numeric = parseNumber(raw);
  if (!numeric) {
    return null;
  }

  return formatCurrency(numeric, 'MDL');
}

function extractGorillaPrice(html: string) {
  const priceSpecification = html.match(/"priceSpecification"\s*:\s*\{[\s\S]*?"price"\s*:\s*"([0-9]+(?:\.[0-9]+)?)"/i);
  const raw = priceSpecification?.[1] ?? html.match(/<bdi>([0-9]+(?:[\.,][0-9]{3})?)\s*<\/bdi>[^\n]{0,120}woocommerce-Price-currencySymbol">MDL<\/span>/i)?.[1];

  if (!raw) {
    return null;
  }

  const numeric = parseNumber(raw);
  if (!numeric) {
    return null;
  }

  return formatCurrency(numeric, 'MDL');
}

function extractStockStatus(html: string): { stock: AvailabilityStatus; stockLabel: string } {
  const normalized = html.toLowerCase();

  if (/(în stoc|in stoc|disponibil|available|in stock)/i.test(normalized)) {
    return { stock: 'in-stock', stockLabel: 'În stoc' };
  }

  if (/(indisponibil|out of stock|stoc epuizat|temporar indisponibil|sold out)/i.test(normalized)) {
    return { stock: 'out-of-stock', stockLabel: 'Indisponibil' };
  }

  return { stock: 'unknown', stockLabel: 'Stare necunoscută' };
}

const extractors: Record<ElectroOffer['store'], (html: string) => string | null> = {
  enter: extractEnterPrice,
  gorilla: extractGorillaPrice
};

function formatUpdatedAt(date: Date) {
  return new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export async function GET() {
  const results: ElectroOffer[] = [];
  const errors: string[] = [];
  const updatedAt = formatUpdatedAt(new Date());

  for (const target of TARGETS) {
    try {
      const response = await fetch(target.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PriceIndexBot/1.0)'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const price = extractors[target.store](html);
      const stock = extractStockStatus(html);

      if (!price) {
        throw new Error('Could not extract price');
      }

      console.log(`Extracted price for ${target.store}:`, price);
      console.log(`Extracted stock status for ${target.store}:`, stock);

      results.push({
        store: target.store,
        label: target.label,
        price,
        link: target.url,
        stock: stock.stock,
        stockLabel: stock.stockLabel,
        updatedAt
      });
    } catch (error) {
      errors.push(`${target.label}: ${(error as Error).message}`);
    }
  }

  if (!results.length) {
    return NextResponse.json({
      error: 'Unable to fetch iPhone 17 Pro prices.',
      errors
    }, { status: 502 });
  }

  return NextResponse.json({
    data: results,
    errors
  });
}
