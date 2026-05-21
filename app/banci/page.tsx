import Link from 'next/link';

import { prisma } from '@/lib/prisma';

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

const supportedPriceTypes = supportedCurrencies.map((currency) => `${currency}/MDL`);

const formatValue = (value: number | null | undefined) => {
  if (value == null) return undefined;
  return value.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
};

const normalizeProviderSlug = (provider: string) =>
  provider
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/^office/, '');

async function getBankRates(): Promise<BankRow[]> {
  const entries = await prisma.priceEntry.findMany({
    where: {
      providerName: { not: null },
      priceType: { in: supportedPriceTypes }
    },
    orderBy: [
      { providerName: 'asc' },
      { priceType: 'asc' },
      { dateCollected: 'desc' }
    ]
  });

  const providerMap = new Map<
    string,
    {
      rates: Partial<Record<SupportedCurrency, BankRate>>;
      subtitle?: string;
      badge: 'BNM' | 'Bancă' | 'CSV';
    }
  >();

  for (const entry of entries) {
    const provider = entry.providerName?.trim();
    if (!provider) continue;

    const code = entry.priceType?.split('/')[0] as SupportedCurrency | undefined;
    if (!code || !supportedCurrencies.includes(code)) continue;

    const buyValue = formatValue(entry.priceMin ?? entry.priceAvg ?? entry.priceMax);
    const sellValue = formatValue(entry.priceMax ?? entry.priceAvg ?? entry.priceMin);
    if (!buyValue || !sellValue) continue;

    const existing = providerMap.get(provider) ?? {
      rates: {},
      subtitle: provider === 'BNM' ? 'BNM' : undefined,
      badge: provider === 'BNM' ? 'BNM' : 'Bancă'
    };

    if (!existing.rates[code]) {
      existing.rates[code] = { buy: buyValue, sell: sellValue };
      providerMap.set(provider, existing);
    }
  }

  return Array.from(providerMap.entries()).map(([provider, { rates, subtitle, badge }]) => {
    const selectedCurrency = supportedCurrencies.find((code) => rates[code]) ?? 'EUR';
    const selectedValue = rates[selectedCurrency]?.buy ?? rates[selectedCurrency]?.sell;

    return {
      name: provider,
      subtitle,
      badge,
      href: `/ro/office/${normalizeProviderSlug(provider)}`,
      autoCurrency: selectedCurrency,
      rates: {
        EUR: rates.EUR,
        USD: rates.USD,
        GBP: rates.GBP,
        RON: rates.RON,
        AUTO: selectedValue ? { buy: selectedValue, sell: selectedValue } : undefined
      }
    };
  });
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
