'use client';

import { useEffect, useMemo, useState } from 'react';

type NetworkKey =
  | 'Rompetrol'
  | 'Lukoil'
  | 'Bemol'
  | 'TLX'
  | 'Avante'
  | 'Vento'
  | 'Petrom'
  | 'NOW OIL';

type FuelAverage = {
  network: NetworkKey;
  gasoline: number | null;
  diesel: number | null;
  stations: number;
};

function formatPrice(value: number | null) {
  return value === null || Number.isNaN(value) ? 'N/A' : value.toFixed(2);
}

export default function FuelPricesSection() {
  const [averages, setAverages] = useState<FuelAverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPrices() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/fuel-prices', {
          signal: controller.signal,
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('Unable to fetch fuel prices');
        }

        const json = await response.json();
        const data = Array.isArray(json?.data) ? (json.data as FuelAverage[]) : [];
        setAverages(data);
      } catch (err) {
        const error = err as Error & { name?: string };
        if (error.name !== 'AbortError') {
          setError('Nu s-au putut încărca prețurile combustibililor.');
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

  const cards = useMemo(() => {
    if (loading || error) {
      return [];
    }

    return averages;
  }, [averages, error, loading]);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-glow">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Fuel prices overview</h2>
          <p className="mt-2 text-sm text-slate-400">Average benzina and motorina prices for major networks in MDL/L.</p>
        </div>
        <p className="text-sm text-slate-500">
          {loading ? 'Loading latest fuel prices...' : error ? 'Unable to load fuel prices.' : 'Updated from internal fuel prices API.'}
        </p>
      </div>

      {error ? (
        <div className="rounded-3xl border border-red-500/20 bg-slate-950/80 p-6 text-red-300">{error}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-3xl border border-white/10 bg-slate-950/70 p-6" />
            ))
          ) : (
            cards.map((network) => (
              <div
                key={network.network}
                className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-glow transition hover:border-cyan-400/30 hover:bg-slate-900"
              >
                <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-[0.22em] text-slate-500">
                  <span>{network.network}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] font-semibold text-slate-300">
                    {network.stations} stații
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Benzină</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{formatPrice(network.gasoline)} <span className="text-sm font-medium text-slate-400">MDL/L</span></p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Motorină</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{formatPrice(network.diesel)} <span className="text-sm font-medium text-slate-400">MDL/L</span></p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
