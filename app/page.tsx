'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AiChat from '@/components/AiChat';
import ElectroPriceSection from '@/components/ElectroPriceSection';
import FuelPricesSection from '@/components/FuelPricesSection';
import Header from '@/components/Header';
import PriceCard from '@/components/PriceCard';
import Sidebar from '@/components/Sidebar';
import type { PriceItem } from '@/lib/data';

export type TabKey = 'all' | 'product' | 'service' | 'currency' | 'fuel';

const dashboardProviderWhitelist = new Set(['MAIB', 'MICB']);

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [providerTypeFilter, setProviderTypeFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [cards, setCards] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPrices = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = `/api/prices`;
        const params = new URLSearchParams();
        
        if (activeTab !== 'all') {
          params.append('category', activeTab);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        if (currencyFilter !== 'all') {
          params.append('currency', currencyFilter);
        }
        if (providerTypeFilter !== 'all') {
          params.append('providerType', providerTypeFilter);
        }
        if (locationFilter) {
          params.append('location', locationFilter);
        }
        
        if (params.size > 0) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Failed to load prices');
        }

        const result = await response.json();
        setCards(result.data ?? []);
      } catch (fetchError) {
        const error = fetchError as Error & { name?: string };
        if (error.name !== 'AbortError') {
          setError('Unable to load price data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();

    return () => controller.abort();
  }, [activeTab, searchQuery, currencyFilter, providerTypeFilter, locationFilter]);

  const dashboardCards = cards.filter((item) => {
    const provider = item.provider?.toUpperCase();
    return provider ? dashboardProviderWhitelist.has(provider) : false;
  });

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#05070f_0%,#090b12_60%,#111827_100%)]">
      <Header activeTab={activeTab} onTabChange={setActiveTab} onSearch={setSearchQuery} />
      <main className="flex-1 text-slate-100">
        <div className="w-full px-4 py-8 sm:px-6 xl:px-0">
          <div className="grid gap-6 xl:grid-cols-[320px_420px_1fr]">
            <div className="space-y-6">
              <Sidebar />
            </div>
            <div className="space-y-6">
              <AiChat />
            </div>
            <div className="space-y-6">
              <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-200 sm:grid-cols-3">
                <label className="flex flex-col gap-2">
                  <span className="text-slate-400">Monedă</span>
                  <select
                    value={currencyFilter}
                    onChange={(event) => setCurrencyFilter(event.target.value)}
                    className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="all">Toate</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="RON">RON</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-slate-400">Tip provider</span>
                  <select
                    value={providerTypeFilter}
                    onChange={(event) => setProviderTypeFilter(event.target.value)}
                    className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="all">Toate</option>
                    <option value="banca">Bancă</option>
                    <option value="casa">Casă schimb</option>
                    <option value="bnm">BNM</option>
                    <option value="csv">CSV</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-slate-400">Locație</span>
                  <input
                    value={locationFilter}
                    onChange={(event) => setLocationFilter(event.target.value)}
                    placeholder="Chișinău, Orhei..."
                    className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading ? (
                  <div className="col-span-full rounded-2xl border border-white/10 bg-slate-950/80 p-10 text-center text-slate-400">
                    Loading price data...
                  </div>
                ) : error ? (
                  <div className="col-span-full rounded-2xl border border-red-500/20 bg-slate-950/80 p-10 text-center text-red-300">
                    {error}
                  </div>
                ) : dashboardCards.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-white/10 bg-slate-950/80 p-10 text-center text-slate-400">
                    No prices available for this category.
                  </div>
                ) : (
                  dashboardCards.map((item) => <PriceCard key={item.id} item={item} />)
                )}
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Secțiune separat pentru toate băncilе și CSV-urile</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Dashboard-ul arată doar cursurile MAIB și MICB, pentru restul surselor folosește tabelul complet.
                    </p>
                  </div>
                  <Link
                    href="/banci"
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    Vezi tabelul complet
                  </Link>
                </div>
              </div>
              <ElectroPriceSection />
              <FuelPricesSection />
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6">
                <h2 className="text-base font-semibold text-slate-300">
                  All prices in MDL unless stated otherwise. Data updated in real time
                </h2>
                <p suppressHydrationWarning className="mt-3 text-xs text-slate-500">Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · 🟢 Live</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
