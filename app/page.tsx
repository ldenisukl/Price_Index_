'use client';

import { useEffect, useState } from 'react';
import AiChat from '@/components/AiChat';
import FuelPricesSection from '@/components/FuelPricesSection';
import Header from '@/components/Header';
import PriceCard from '@/components/PriceCard';
import Sidebar from '@/components/Sidebar';
import type { PriceItem } from '@/lib/data';

const tabKeys = ['all', 'product', 'service', 'currency', 'fuel'] as const;
export type TabKey = (typeof tabKeys)[number];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
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
        if ((fetchError as any).name !== 'AbortError') {
          setError('Unable to load price data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();

    return () => controller.abort();
  }, [activeTab, searchQuery]);

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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading ? (
                  <div className="col-span-full rounded-2xl border border-white/10 bg-slate-950/80 p-10 text-center text-slate-400">
                    Loading price data...
                  </div>
                ) : error ? (
                  <div className="col-span-full rounded-2xl border border-red-500/20 bg-slate-950/80 p-10 text-center text-red-300">
                    {error}
                  </div>
                ) : cards.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-white/10 bg-slate-950/80 p-10 text-center text-slate-400">
                    No prices available for this category.
                  </div>
                ) : (
                  cards.map((item) => <PriceCard key={item.id} item={item} />)
                )}
              </div>
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
