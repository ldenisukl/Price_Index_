import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

const PRODUCT_TARGETS = [
  {
    product: 'iPhone 17 Pro',
    targets: [
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
    ]
  },
   {
    product: 'Samsung Galaxy S26 Ultra',
    targets: [
      {
        store: 'darwin',
        label: 'Darwin',
        url: 'https://darwin.md/smartphone-samsung-galaxy-s26-ultra-s948-12-gb-256-gb-dual-sim-5g-black.html'
      },
      {
        store: 'cactus',
        label: 'Cactus',
        url: 'https://www.cactus.md/ro/catalogue/electronice/telefone/mobilnye-telefony/s26-ultra-12-256gb-black/'
      }
    ]
  },
  {
    product: 'ASUS ROG Strix G18',
    targets: [
      {
        store: 'darwin',
        label: 'Darwin',
        url: 'https://darwin.md/laptop-asus-rog-strix-g18-g814pp-ryzen-9-8940hx-16-gb-1-tb-geforce-rtx-5070-gray-freedos.html'
      },
      {
        store: 'smart',
        label: 'Smart',
        url: 'https://www.smart.md/laptop-gaming-asus-rog-strix-g18-g815lp-cu-procesor-intel-core-i9-14900hx-la-58ghz-18-25k-wqxga-ips-240hz-16gb-ddr5-ram-1tb-ssd-nvidia-geforce-rtx-5060-8gb-gddr7-no-os-eclipse-gray?q=laptop-gaming-asus-rog-strix-g18-g815lp'
      }
    ]
  },
  {
    product: 'MacBook Air 15 (2025)',
    targets: [
      {
        store: 'darwin',
        label: 'Darwin',
        url: 'https://darwin.md/laptop-apple-macbook-air-15-2025-m4-10c10g-16-gb-512-gb-vga-integrata-starlight.html'
      },
      {
        store: 'maximum',
        label: 'Maximum',
        url: 'https://maximum.md/ro/6899939/'
      }
    ]
  },
  {
    product: 'Samsung Frigider RB33J3515WW',
    targets: [
      {
        store: 'darwin',
        label: 'Darwin',
        url: 'https://darwin.md/frigider-samsung-rb33j3515wwef-cu-2-camere-white.html'
      },
      {
        store: 'cactus',
        label: 'Cactus',
        url: 'https://www.cactus.md/ro/catalogue/bytovaya-tehnika/krupnaya-bytovaya-tehnika/holodilniki-i-morozilniki/holodil-nik-samsung-rb33j3515ww-ef/'
      }
    ]
  },
  {
    product: 'Apple Watch Ultra 2 49mm Titanium',
    targets: [
      {
        store: 'cactus',
        label: 'Cactus',
        url: 'https://www.cactus.md/ro/catalogue/electronice/gadgets/intelligente-uhrenarmbander/apple-watch-2-gps-lte-49mm-btitanium-Alpine-loop-m/'
      },
      {
        store: 'moldcell',
        label: 'Moldcell',
        url: 'https://eshop.moldcell.md/ro/gadget-uri/ceasuri-inteligente/ceas-inteligent-apple-watch-ultra-2-2024-natural-titanium-3'
      }
    ]
  },
  {
    product: 'LG F4WR511S2M Washing Machine',
    targets: [
      {
        store: 'smadshop',
        label: 'SmadShop',
        url: 'https://smadshop.md/bytovaya-tehnika/lg-f4wr511s2m-grey-anthracite-stiralnaya-mashina.html'
      },
      {
        store: 'titan',
        label: 'Titan Electronic',
        url: 'https://titanelectronic.md/f4wr511s2m/'
      }
    ]
  },
  {
    product: 'Samsung Clothes Dryer DV90DB8845GHU4',
    targets: [
      {
        store: 'cactus',
        label: 'Cactus',
        url: 'https://www.cactus.md/ro/catalogue/bytovaya-tehnika/krupnaya-bytovaya-tehnika/sushilnye-mashiny/sushil-naya-mashina-samsung-dv90db8845ghu4/'
      },
      {
        store: 'maximum',
        label: 'Maximum',
        url: 'https://maximum.md/ro/6951310/'
      }
    ]
  },
  {
    product: 'Samsung Dishwasher DW50DG430B00LE',
    targets: [
      {
        store: 'darwin',
        label: 'Darwin',
        url: 'https://darwin.md/masina-de-spalat-vase-samsung-dw50dg430b00le-white.html'
      },
      {
        store: 'maximum',
        label: 'Maximum',
        url: 'https://maximum.md/ro/6883493/'
      }
    ]
  },
  {
    product: 'LG OLED65C54LA TV 65 inch',
    targets: [
      {
        store: 'cactus',
        label: 'Cactus',
        url: 'https://www.cactus.md/ro/catalogue/electronice/televizory/televizory/televizor-lg-oled65c54la/'
      },
      {
        store: 'atehno',
        label: 'Atehno',
        url: 'https://atehno.md/products/65-oled-smart-tv-lg-oled65c54la-perfect-black-4k-uhd-webos-black-diagonala-ecranului-65-rezolutia-displayului-3840x2160-4k-uhd-tip-panou-oled-telecomanda-da-platforma-software-webos-wifi-da-u-9857902395373'
      }
    ]
  }
] as const;

type AvailabilityStatus = 'in-stock' | 'out-of-stock' | 'unknown';

type ElectroOffer = {
  product: (typeof PRODUCT_TARGETS)[number]['product'];
  store: 'enter' | 'gorilla' | 'darwin' | 'smart' | 'maximum' | 'cactus' | 'moldcell' | 'smadshop' | 'titan' | 'atehno';
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

function extractDarwinPrice(html: string) {
  const priceMatch = html.match(/<div[^>]*class=["'][^"']*fw-600[^"']*fs-24[^"']*text-green[^"']*["'][^>]*>\s*([0-9]{1,3}(?:[\s\.][0-9]{3})+)\s*lei\s*<\/div>/i)
    ?? html.match(/<div[^>]*>\s*([0-9]{1,3}(?:[\s\.][0-9]{3})+)\s*lei\s*<\/div>/i);

  const raw = priceMatch?.[1];
  if (!raw) {
    return null;
  }

  const numeric = parseNumber(raw);
  if (!numeric) {
    return null;
  }

  return formatCurrency(numeric, 'MDL');
}

function extractSmartPrice(html: string) {
  const priceMatch = html.match(/<p[^>]*class=["'][^"']*text-\[20px\][^"']*md:text-\[28px\][^"']*["'][^>]*>\s*([0-9]{1,3}(?:[\s\.][0-9]{3})+)\s*<!-- -->\s*<!-- -->\s*lei\s*<\/p>/i)
    ?? html.match(/<p[^>]*>\s*([0-9]{1,3}(?:[\s\.][0-9]{3})+)\s*<!-- -->\s*<!-- -->\s*lei\s*<\/p>/i)
    ?? html.match(/<p[^>]*>\s*([0-9]{1,3}(?:[\s\.][0-9]{3})+)\s*lei\s*<\/p>/i);

  const raw = priceMatch?.[1];
  if (!raw) {
    return null;
  }

  const numeric = parseNumber(raw);
  if (!numeric) {
    return null;
  }

  return formatCurrency(numeric, 'MDL');
}

function extractMaximumPrice(html: string) {
  const priceMatch = html.match(/<[^>]*class=["'][^"']*\bcurrent-price\b[^"']*["'][^>]*>[\s\S]*?([0-9]{1,6}(?:[\s\.][0-9]{3})*)[\s\S]*?<span[^>]*class=["'][^"']*\bcurrent-mdl\b[^"']*["'][^>]*>\s*lei\s*<\/span>/i)
    ?? html.match(/<[^>]*class=["'][^"']*\bcurrent-price\b[^"']*["'][^>]*>\s*([0-9]{1,6}(?:[\s\.][0-9]{3})*)\s*<span[^>]*>\s*lei\s*<\/span>/i)
    ?? html.match(/<[^>]*class=["'][^"']*\bcurrent-price\b[^"']*["'][^>]*>\s*([0-9]{1,6}(?:[\s\.][0-9]{3})*)\s*<\/[a-z]+>/i)
    ?? html.match(/<[^>]*class=["'][^"']*\bcurrent-price\b[^"']*["'][^>]*>\s*([0-9]{1,6}(?:[\s\.][0-9]{3})*)/i);

  const raw = priceMatch?.[1];
  if (!raw) {
    return null;
  }

  const numeric = parseNumber(raw);
  if (!numeric) {
    return null;
  }

  return formatCurrency(numeric, 'MDL');
}
function extractCactusPrice(html: string) {
  // Try multiple patterns to find the price (prioritizing reliable sources)
  const patterns = [
    // JSON-LD schema in offers block (most reliable)
    /"offers"\s*:\s*\{[\s\S]*?"price"\s*:\s*"(\d+)"/i,
    
    // JSON-LD price fallback
    /"price"\s*:\s*"(\d{4,6})"/i,
    
    // Data attributes on price elements
    /data-price\s*=\s*["']?(\d{4,6})/i,
    /data-current-price\s*=\s*["']?(\d{4,6})/i,
    /data-product-price\s*=\s*["']?(\d{4,6})/i,
    
    // Price in span/strong with price class 
    /<span[^>]*class=['"]*[^'"]*price[^'"]*['"]*[^>]*>\s*([0-9]{1,3}(?:[\s\.][0-9]{3})*)\s*</i,
    /<strong[^>]*class=['"]*[^'"]*price[^'"]*['"]*[^>]*>\s*([0-9]{1,3}(?:[\s\.][0-9]{3})*)\s*lei/i,
    
    // Sale/discount price patterns with lei
    /<span[^>]*class=['"]*[^'"]*sale-price[^'"]*['"]*[^>]*>[\s\S]*?([0-9]{1,3}(?:[\s\.][0-9]{3})+)\s*lei/i,
    /<span[^>]*class=['"]*[^'"]*discount[^'"]*['"]*[^>]*>[\s\S]*?([0-9]{1,3}(?:[\s\.][0-9]{3})+)\s*lei/i,
  ];

  let raw: string | undefined;
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      raw = match[1];
      
      // Validate that we have a reasonable price (>1000)
      const numericValue = parseNumber(raw);
      if (numericValue && numericValue > 1000) {
        break;
      }
    }
  }

  if (!raw) {
    return null;
  }

  const numeric = parseNumber(raw);
  if (!numeric || numeric < 1000) {
    return null;
  }

  return formatCurrency(numeric, 'MDL');
}

function extractMoldcellPrice(html: string) {
  // Try to extract from JSON-LD schema
  const jsonLdMatch = html.match(/"price"\s*:\s*"(\d{1,6})"/i);
  if (jsonLdMatch?.[1]) {
    const numeric = parseInt(jsonLdMatch[1], 10);
    if (Number.isFinite(numeric) && numeric > 0) {
      return formatCurrency(numeric, 'MDL');
    }
  }

  // Fallback to text pattern
  const priceMatch = html.match(/([0-9]{1,3}(?:[\s\.][0-9]{3})+)\s*MDL/i)
    ?? html.match(/<h3[^>]*>\s*([0-9]{1,3}(?:[\s][0-9]{3})+)\s*<\/h3>/i);

  const raw = priceMatch?.[1];
  if (!raw) {
    return null;
  }

  const numeric = parseNumber(raw);
  if (!numeric) {
    return null;
  }

  return formatCurrency(numeric, 'MDL');
}

function extractSmadshopPrice(html: string) {
  // SmadShop uses JSON-LD schema
  const patterns = [
    // JSON-LD schema offers
    /"offers"\s*:\s*\{[\s\S]*?"price"\s*:\s*"([0-9.]+)"/i,
    // Fallback: direct price pattern
    /"price"\s*:\s*"([0-9.]+)"/i,
  ];

  let raw: string | undefined;
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      raw = match[1];
      const numeric = parseNumber(raw);
      if (numeric && numeric > 1000) {
        break;
      }
    }
  }

  if (!raw) {
    return null;
  }

  const numeric = parseNumber(raw);
  if (!numeric || numeric < 1000) {
    return null;
  }

  return formatCurrency(numeric, 'MDL');
}

function extractTitanPrice(html: string) {
  // Titan Electronic - try multiple patterns
  const patterns = [
    // JSON-LD price
    /"price"\s*:\s*"?([0-9.]+)"?/i,
    // Data attributes
    /data-price\s*=\s*["']?([0-9.]+)/i,
    // Price in spans/divs
    /([0-9]{1,3}(?:[\s\.][0-9]{3})+)\s*lei/i,
    // Current price classes
    /<[^>]*class=['"]*[^'"]*price[^'"]*['"]*[^>]*>[\s\S]*?([0-9]{1,3}(?:[\s\.][0-9]{3})+)/i,
  ];

  let raw: string | undefined;
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      raw = match[1];
      const numeric = parseNumber(raw);
      if (numeric && numeric > 1000) {
        break;
      }
    }
  }

  if (!raw) {
    return null;
  }

  const numeric = parseNumber(raw);
  if (!numeric || numeric < 1000) {
    return null;
  }

  return formatCurrency(numeric, 'MDL');
}

function extractAtehnoPrice(html: string) {
  // Atehno uses JSON-LD schema with numeric price (no quotes)
  const patterns = [
    // JSON-LD offers with numeric price (most common)
    /"offers"\s*:\s*\{[\s\S]*?"price"\s*:\s*(\d{4,6})/i,
    // Direct price pattern (numeric, no quotes)
    /"price"\s*:\s*(\d{4,6})/i,
    // Fallback: price in text format
    /([0-9]{1,3}(?:[\s\.][0-9]{3})+)\s*(?:lei|leu)/i,
  ];

  let raw: string | undefined;
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      raw = match[1];
      const numeric = parseNumber(raw);
      if (numeric && numeric > 1000) {
        break;
      }
    }
  }

  if (!raw) {
    return null;
  }

  const numeric = parseNumber(raw);
  if (!numeric || numeric < 1000) {
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
  gorilla: extractGorillaPrice,
  darwin: extractDarwinPrice,
  smart: extractSmartPrice,
  maximum: extractMaximumPrice,
  cactus: extractCactusPrice,
  moldcell: extractMoldcellPrice,
  smadshop: extractSmadshopPrice,
  titan: extractTitanPrice,
  atehno: extractAtehnoPrice
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

async function fetchHtmlWithPuppeteer(url: string, timeoutMs: number = 60000): Promise<string> {
  let browser;
  try {
    console.log(`[Puppeteer] Starting for: ${url.substring(0, 60)}...`);
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    try {
      console.log('[Puppeteer] Navigating...');
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: timeoutMs 
      });
      console.log('[Puppeteer] Navigation complete');
    } catch (navigationError) {
      console.warn('[Puppeteer] Navigation timeout or error, continuing:', (navigationError as Error).message);
    }
    
    // Wait for dynamic content
    console.log('[Puppeteer] Waiting for render...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const html = await page.content();
    console.log(`[Puppeteer] Got HTML, length: ${html.length}`);
    return html;
  } catch (error) {
    console.error('[Puppeteer] Fatal error:', (error as Error).message);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Ignore close errors
      }
    }
  }
}

async function fetchHtml(url: string, store: string): Promise<string> {
  // Use Puppeteer for JS-heavy sites
  if (store === 'cactus' || store === 'titan') {
    return fetchHtmlWithPuppeteer(url, 30000);
  }

  // Use regular fetch for other sites
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; PriceIndexBot/1.0)'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

export async function GET() {
  const results: ElectroOffer[] = [];
  const errors: string[] = [];
  const updatedAt = formatUpdatedAt(new Date());

  for (const product of PRODUCT_TARGETS) {
    for (const target of product.targets) {
      try {
        const html = await fetchHtml(target.url, target.store);
        const price = extractors[target.store](html);
        const stock = extractStockStatus(html);

        if (!price) {
          throw new Error('Could not extract price');
        }

        console.log(`Extracted price for ${target.store}:`, price);
        console.log(`Extracted stock status for ${target.store}:`, stock);

        results.push({
          product: product.product,
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
  }

  if (!results.length) {
    return NextResponse.json({
      error: 'Unable to fetch comparison prices.',
      errors
    }, { status: 502 });
  }

  return NextResponse.json({
    data: results,
    errors
  });
}
