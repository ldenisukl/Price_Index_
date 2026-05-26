import axios from 'axios';
import { load, type Element } from 'cheerio';

export type BankRate = {
  buy: string;
  sell: string;
};

export type SupportedCurrency = 'EUR' | 'USD' | 'GBP' | 'RON';

export type ProviderType = 'BNM' | 'Bancă' | 'CSV' | 'Casă schimb' | 'Other';

export type BankRow = {
  name: string;
  subtitle?: string;
  badge: 'BNM' | 'Bancă' | 'CSV';
  providerType?: ProviderType;
  location?: string;
  href: string;
  autoCurrency: SupportedCurrency;
  rates: {
    EUR?: BankRate;
    USD?: BankRate;
    GBP?: BankRate;
    RON?: BankRate;
    AUTO?: BankRate;
  };
};

const SOURCE_URL = 'https://www.curs.md/ro/curs_valutar_banci';
const SUPPORTED_CURRENCIES: SupportedCurrency[] = ['EUR', 'USD', 'GBP', 'RON'];

const parseRateValue = (raw: string | undefined | null): string | undefined => {
  if (!raw) return undefined;
  const cleaned = raw
    .replace(/\u00A0/g, ' ')
    .replace(/,/g, '.')
    .replace(/[^0-9.]/g, '')
    .trim();
  const value = parseFloat(cleaned);
  if (!Number.isFinite(value)) return undefined;
  return value.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
};

const buildRates = (values: Array<string | undefined>): Partial<Record<SupportedCurrency, BankRate>> => {
  const rates: Partial<Record<SupportedCurrency, BankRate>> = {};

  if (values[0]) {
    rates.EUR = { buy: values[0], sell: values[1] ?? values[0] };
  }
  if (values[2]) {
    rates.USD = { buy: values[2], sell: values[3] ?? values[2] };
  }
  if (values[4]) {
    rates.GBP = { buy: values[4], sell: values[5] ?? values[4] };
  }
  if (values[6]) {
    rates.RON = { buy: values[6], sell: values[7] ?? values[6] };
  }

  return rates;
};

const isHeaderRow = (text: string) => {
  return /\x08EUR\x08|\x08USD\x08|\x08GBP\x08|\x08RON\x08/i.test(text) && /banca|casă|banci|curs/i.test(text);
};

const detectProviderType = (badge: string) => {
  const raw = (badge || '').toLowerCase();
  if (/\bbnm\b/.test(raw)) return 'BNM' as const;
  if (/\bcasa|change|chimb|câș|casa de schimb|cash/.test(raw)) return 'Casă schimb' as const;
  if (/\bcsv\b/.test(raw)) return 'CSV' as const;
  if (/\bbanc|bank|banca\b/.test(raw)) return 'Bancă' as const;
  return 'Other' as const;
};

const extractLocation = (text: string) => {
  const normalized = text.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  const match = normalized.match(/\b(Chi[sș]inau|Chisinau|Bălți|Balti|Cahul|Orhei|Ungheni|Soroca|Tiraspol|Comrat|Dubasari|Rezina|Chișinău)\b/i);
  if (match) return match[0];
  const afterDash = normalized.split(/[-–—]/)[1]?.trim();
  if (afterDash && afterDash.length < 40) return afterDash;
  const afterComma = normalized.split(',').slice(1).join(',').trim();
  return afterComma || undefined;
};

export async function getCursMdBankRates(): Promise<BankRow[]> {
  const response = await axios.get(SOURCE_URL, { responseType: 'text' });
  const $ = load(response.data);

  let table = $('table')
    .filter((_: number, element: Element) => {
      const text = $(element).text();
      return SUPPORTED_CURRENCIES.every((code) => text.includes(code));
    })
    .first();

  if (!table.length) {
    table = $('table').first();
  }

  if (!table.length) {
    return [];
  }

  const bankRows: BankRow[] = [];
  table.find('tbody tr').each((_: number, row: Element) => {
    const cells = $(row)
      .find('td, th')
      .toArray()
      .map((cell: Element) => $(cell).text().replace(/\s+/g, ' ').trim());

    if (cells.length < 2) return;

    const bankName = cells[0].trim();
    if (!bankName || isHeaderRow(bankName)) return;

    const values = cells.slice(1, 9).map(parseRateValue);
    const rates = buildRates(values);
    if (Object.keys(rates).length === 0) return;

    const selectedCurrency = (SUPPORTED_CURRENCIES.find((code) => rates[code]) ?? 'EUR') as SupportedCurrency;
    const selectedRate = rates[selectedCurrency];
    const providerType = detectProviderType('');
    const location = extractLocation(bankName);

    bankRows.push({
      name: bankName,
      subtitle: location ? `Locație: ${location}` : undefined,
      badge: providerType === 'BNM' ? 'BNM' : 'Bancă',
      providerType,
      location,
      href: SOURCE_URL,
      autoCurrency: selectedCurrency,
      rates: {
        ...rates,
        AUTO: selectedRate
      }
    });
  });

  return bankRows;
}
