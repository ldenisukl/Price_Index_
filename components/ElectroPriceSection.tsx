'use client';

import { useEffect, useState } from 'react';

type AvailabilityStatus = 'in-stock' | 'out-of-stock' | 'unknown';

type ElectroOffer = {
  store: 'enter' | 'gorilla';
  label: string;
  price: string;
  link: string;
  stock: AvailabilityStatus;
  stockLabel: string;
  updatedAt: string;
};

const statusStyles: Record<AvailabilityStatus, string> = {
  'in-stock': 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  'out-of-stock': 'border-rose-500/40 bg-rose-500/10 text-rose-200',
  unknown: 'border-amber-500/40 bg-amber-500/10 text-amber-100'
};

export default function ElectroPriceSection() {
  const [offers, setOffers] = useState<ElectroOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPrices() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/electro-prices', {
          signal: controller.signal,
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('Unable to fetch phone prices');
        }

        const json = await response.json();
        setOffers(Array.isArray(json?.data) ? json.data : []);

        if (Array.isArray(json?.errors) && json.errors.length > 0) {
          setError('Unele surse nu au putut fi actualizate.');
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Nu s-au putut încărca prețurile pentru iPhone 17 Pro.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadPrices();
    const intervalId = window.setInterval(loadPrices, 300000);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  const lastUpdated = offers[0]?.updatedAt ?? null;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-glow">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Comparare rapidă</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">iPhone 17 Pro</h2>
        </div>
        <p className="text-sm text-slate-500">
          {loading
            ? 'Se încarcă...'
            : error
              ? 'Actualizare parțială'
              : lastUpdated
                ? `Actualizat la ${lastUpdated}`
                : 'Actualizat automat'}
        </p>
      </div>

      {error && !loading ? (
        <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {loading
          ? Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-3xl border border-white/10 bg-slate-950/70 p-6">
                <div className="h-4 w-24 rounded-full bg-white/10" />
                <div className="mt-5 h-8 w-32 rounded bg-white/10" />
                <div className="mt-6 h-10 w-full rounded-full bg-white/10" />
              </div>
            ))
          : offers.map((offer) => (
              <div
                key={offer.store}
                className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-glow transition hover:border-cyan-400/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-slate-500">{offer.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{offer.price}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                    {offer.store}
                  </span>
                </div>
                <div className="mt-4">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusStyles[offer.stock]}`}>
                    {offer.stockLabel}
                  </span>
                </div>
                <a
                  href={offer.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Vizitează magazinul
                </a>
              </div>
            ))}
      </div>
    </section>
  );
}
