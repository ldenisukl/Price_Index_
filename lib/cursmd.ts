import axios from 'axios';
import { load } from 'cheerio';

export type BankRate = {
  buy: string;
  sell: string;
};

export type SupportedCurrency = 'EUR' | 'USD' | 'GBP' | 'RON';

export type BankRow = {
  name: string;
  subtitle?: string;
  badge: 'BNM' | 'Bancă' | 'CSV';
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
  return /EUR|USD|GBP|RON/i.test(text) && /banca|casă|banci|curs/i.test(text);
};

export async function getCursMdBankRates(): Promise<BankRow[]> {
  const response = await axios.get(SOURCE_URL, { responseType: 'text' });
  const $ = load(response.data);

  let table = $('table')
    .filter((_, element) => {
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
  table.find('tbody tr').each((_, row) => {
    const cells = $(row)
      .find('td, th')
      .toArray()
      .map((cell) => $(cell).text().replace(/\s+/g, ' ').trim());

    if (cells.length < 2) return;

    const bankName = cells[0].trim();
    if (!bankName || isHeaderRow(bankName)) return;

    const values = cells.slice(1, 9).map(parseRateValue);
    const rates = buildRates(values);
    if (Object.keys(rates).length === 0) return;

    const selectedCurrency = (SUPPORTED_CURRENCIES.find((code) => rates[code]) ?? 'EUR') as SupportedCurrency;
    const selectedRate = rates[selectedCurrency];

    bankRows.push({
      name: bankName,
      subtitle: undefined,
      badge: 'Bancă',
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
