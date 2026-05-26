import * as fs from 'fs/promises';
import * as path from 'path';
import Link from 'next/link';

type BankRate = {
  buy: string;
  sell: string;
};

type SupportedCurrency = 'EUR' | 'USD' | 'GBP' | 'RON';

type BankRow = {
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

const supportedCurrencies: SupportedCurrency[] = ['EUR', 'USD', 'GBP', 'RON'];

const STATUS_FILE = path.resolve(process.cwd(), 'scripts', 'last-scrape.json');

const formatValue = (value: number | null | undefined) => {
  if (value == null) return undefined;
  return value.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
};

type RawCursMdRow = {
  provider: string;
  subtitle?: string;
  badge?: string;
  providerType?: string;
  location?: string;
  href?: string;
  rates: Partial<Record<SupportedCurrency, { buy?: number; sell?: number }>>;
};

type CursMdResult = {
  provider?: string;
  url?: string;
  rows?: RawCursMdRow[];
  rates?: Record<string, number>;
};

type CursMdStatus = {
  results?: CursMdResult[];
};

async function getBankRates(): Promise<BankRow[]> {
  try {
    const raw = await fs.readFile(STATUS_FILE, 'utf-8');
    const status = JSON.parse(raw) as CursMdStatus;
    const results = status.results ?? [];

    const bankRows: BankRow[] = [];

    for (const result of results) {
      if (Array.isArray(result.rows) && result.rows.length) {
        for (const row of result.rows) {
          const rates: Partial<Record<SupportedCurrency, BankRate>> = {};

          for (const currency of supportedCurrencies) {
            const pair = row.rates?.[currency];
            if (!pair) continue;
            const buy = formatValue(pair.buy ?? pair.sell);
            const sell = formatValue(pair.sell ?? pair.buy);
            if (!buy && !sell) continue;
            rates[currency] = { buy: buy ?? sell ?? '-', sell: sell ?? buy ?? '-' };
          }

          if (Object.keys(rates).length === 0) continue;

          const selectedCurrency = supportedCurrencies.find((code) => rates[code]) ?? 'EUR';
          const selectedRate = rates[selectedCurrency];

          bankRows.push({
            name: row.provider,
            subtitle: row.subtitle || (row.location ? `Locație: ${row.location}` : undefined),
            badge: row.badge === 'BNM' ? 'BNM' : row.badge === 'CSV' ? 'CSV' : 'Bancă',
            href: row.href || result.url || 'https://www.curs.md/ro/curs_valutar_banci',
            autoCurrency: selectedCurrency,
            rates: {
              EUR: rates.EUR,
              USD: rates.USD,
              GBP: rates.GBP,
              RON: rates.RON,
              AUTO: selectedRate ? { buy: selectedRate.buy ?? '-', sell: selectedRate.sell ?? '-' } : undefined
            }
          });
        }
        continue;
      }

      if (result.rates && typeof result.provider === 'string') {
        const ratesObj = result.rates;
        const rates: Partial<Record<SupportedCurrency, BankRate>> = {};

        for (const currency of supportedCurrencies) {
          const value = ratesObj[currency];
          if (value == null) continue;
          const formatted = formatValue(value) ?? '-';
          rates[currency] = { buy: formatted, sell: formatted };
        }

        if (Object.keys(rates).length === 0) continue;

        const selectedCurrency = supportedCurrencies.find((code) => rates[code]) ?? 'EUR';

        bankRows.push({
          name: result.provider,
          subtitle: undefined,
          badge: 'Bancă',
          href: result.url || '#',
          autoCurrency: selectedCurrency,
          rates: {
            EUR: rates.EUR,
            USD: rates.USD,
            GBP: rates.GBP,
            RON: rates.RON,
            AUTO: rates[selectedCurrency]
          }
        });
      }
    }

    return bankRows;
  } catch {
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function BanciPage() {
  const bankRates = await getBankRates();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-8">
      <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-black/20">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Tabel bănci</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Curs valutar de pe curs.md</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Acest tabel afișează cursurile din <span className="text-white">curs.md</span> pentru bănci și case de schimb.
              Coloanele sunt organizate conform structurii de pe site: EUR, USD, GBP, RON și o coloană auto care poate reflecta moneda selectată.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Înapoi la dashboard
          </Link>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/80 p-1">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th rowSpan={2} className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">
                  Banca / casă
                </th>
                <th colSpan={2} className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">
                  EUR
                </th>
                <th colSpan={2} className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">
                  USD
                </th>
                <th colSpan={2} className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">
                  GBP
                </th>
                <th colSpan={2} className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">
                  RON
                </th>
                <th colSpan={3} className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">
                  Monedă selectată
                </th>
              </tr>
              <tr>
                <th className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">cump.</th>
                <th className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">vanz.</th>
                <th className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">cump.</th>
                <th className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">vanz.</th>
                <th className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">cump.</th>
                <th className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">vanz.</th>
                <th className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">cump.</th>
                <th className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">vanz.</th>
                <th className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">cump.</th>
                <th className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">monedă</th>
                <th className="sticky top-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-left font-semibold">vanz.</th>
              </tr>
            </thead>
            <tbody>
              {bankRates.length === 0 ? (
                <tr>
                  <td colSpan={12} className="border-b border-white/10 px-4 py-8 text-center text-slate-500">
                    Nu există date disponibile încă. Rulează scraperul și reîncarcă pagina.
                  </td>
                </tr>
              ) : (
                bankRates.map((bank, index) => (
                  <tr
                    key={bank.name}
                    className={index % 2 === 0 ? 'bg-slate-950/50' : 'bg-slate-900/40'}
                  >
                    <td className="border-b border-white/10 px-4 py-4 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                              bank.badge === 'BNM'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : bank.badge === 'Bancă'
                                ? 'bg-blue-500/10 text-blue-200'
                                : 'bg-slate-500/15 text-slate-200'
                            }`}
                          >
                            {bank.badge}
                          </span>
                          {bank.href.startsWith('http') ? (
                            <a href={bank.href} target="_blank" rel="noreferrer" className="font-semibold text-slate-100 hover:text-white">
                              {bank.name}
                            </a>
                          ) : (
                            <Link href={bank.href} className="font-semibold text-slate-100 hover:text-white">
                              {bank.name}
                            </Link>
                          )}
                        </div>
                        {bank.subtitle ? <span className="text-xs text-slate-500">{bank.subtitle}</span> : null}
                      </div>
                    </td>
                    <td className="border-b border-white/10 px-4 py-4 align-top text-slate-200">
                      {bank.rates.EUR?.buy ?? '-'}
                    </td>
                    <td className="border-b border-white/10 px-4 py-4 align-top text-slate-200">
                      {bank.rates.EUR?.sell ?? '-'}
                    </td>
                    <td className="border-b border-white/10 px-4 py-4 align-top text-slate-200">
                      {bank.rates.USD?.buy ?? '-'}
                    </td>
                    <td className="border-b border-white/10 px-4 py-4 align-top text-slate-200">
                      {bank.rates.USD?.sell ?? '-'}
                    </td>
                    <td className="border-b border-white/10 px-4 py-4 align-top text-slate-200">
                      {bank.rates.GBP?.buy ?? '-'}
                    </td>
                    <td className="border-b border-white/10 px-4 py-4 align-top text-slate-200">
                      {bank.rates.GBP?.sell ?? '-'}
                    </td>
                    <td className="border-b border-white/10 px-4 py-4 align-top text-slate-200">
                      {bank.rates.RON?.buy ?? '-'}
                    </td>
                    <td className="border-b border-white/10 px-4 py-4 align-top text-slate-200">
                      {bank.rates.RON?.sell ?? '-'}
                    </td>
                    <td className="border-b border-white/10 px-4 py-4 align-top text-slate-200">
                      {bank.rates.AUTO?.buy ?? '-'}
                    </td>
                    <td className="border-b border-white/10 px-4 py-4 align-top text-slate-200">
                      {bank.autoCurrency}
                    </td>
                    <td className="border-b border-white/10 px-4 py-4 align-top text-slate-200">
                      {bank.rates.AUTO?.sell ?? '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-slate-950/80 p-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-white">Sursa datelor</p>
            <p className="mt-2 text-sm text-slate-400">
              Datele provin de pe <span className="text-white">https://www.curs.md/ro/curs_valutar_banci</span> și sunt bazate pe structura tabelului de pe pagina de cursuri pentru bănci.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Ce urmează</p>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-300">
              <li>Adăugarea extragerii automate din `curs.md` în backend</li>
              <li>Maparea fiecărei bănci și case de schimb din tabelul complet</li>
              <li>Filtrare după monedă, tip bancă și locație</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
