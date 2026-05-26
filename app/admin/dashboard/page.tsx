'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Counts = {
  categories: number;
  items: number;
  prices: number;
  submissions: number;
};

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Counts>({ categories: 0, items: 0, prices: 0, submissions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [categoriesRes, itemsRes, pricesRes, submissionsRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/items'),
          fetch('/api/admin/prices'),
          fetch('/api/admin/submissions')
        ]);

        if (!categoriesRes.ok || !itemsRes.ok || !pricesRes.ok || !submissionsRes.ok) {
          throw new Error('Unable to load admin counts.');
        }

        const categoriesData = await categoriesRes.json();
        const itemsData = await itemsRes.json();
        const pricesData = await pricesRes.json();
        const submissionsData = await submissionsRes.json();

        setCounts({
          categories: categoriesData.categories.length,
          items: itemsData.items.length,
          prices: pricesData.entries.length,
          submissions: submissionsData.submissions.length
        });
      } catch {
        setError('Nu s-au putut încărca datele de administrare.');
      } finally {
        setLoading(false);
      }
    };

    loadCounts();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-glow">
          <h1 className="text-4xl font-semibold text-white">Dashboard</h1>
          <p className="mt-3 text-slate-300">Vizualizare rapidă a datelor și acces direct la secțiunile administrative.</p>
        </section>

        <section className="grid gap-6 xl:grid-cols-4">
          {loading ? (
            <div className="col-span-full rounded-3xl border border-white/10 bg-slate-950/70 p-8 text-slate-400">Se încarcă...</div>
          ) : error ? (
            <div className="col-span-full rounded-3xl border border-red-500/20 bg-slate-950/70 p-8 text-red-300">{error}</div>
          ) : (
            [
              { label: 'Categorii', value: counts.categories, href: '/admin/categories' },
              { label: 'Itemuri', value: counts.items, href: '/admin/items' },
              { label: 'Prețuri', value: counts.prices, href: '/admin/prices' },
              { label: 'Contribuții pending', value: counts.submissions, href: '/admin/submissions' }
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 transition hover:border-indigo-400 hover:bg-slate-900"
              >
                <p className="text-sm uppercase tracking-[0.18em] text-indigo-300">{item.label}</p>
                <p className="mt-4 text-4xl font-semibold text-white">{item.value}</p>
              </Link>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
