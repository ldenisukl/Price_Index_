'use client';

import { FormEvent, useEffect, useState } from 'react';

type Category = {
  id: string;
  name: string;
  type: string;
  slug: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', type: 'service', slug: '', description: '', icon: '' });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        const data = await response.json();
        setCategories(data.categories ?? []);
      } catch (err) {
        setError('Nu am putut încărca categoriile.');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Eroare la creare categorie');
      }

      setCategories([result.category, ...categories]);
      setForm({ name: '', type: 'service', slug: '', description: '', icon: '' });
      setStatus('Categorie creată cu succes.');
    } catch (err) {
      setStatus((err as Error).message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-glow">
          <h1 className="text-4xl font-semibold text-white">Categorii</h1>
          <p className="mt-4 text-slate-300">Adaugă și vizualizează categoriile disponibile în sistem.</p>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-glow">
            <h2 className="text-2xl font-semibold text-white">Listă Categorii</h2>
            {loading ? (
              <p className="mt-4 text-slate-400">Se încarcă...</p>
            ) : error ? (
              <p className="mt-4 text-red-300">{error}</p>
            ) : (
              <div className="mt-6 space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-white">{category.name}</p>
                        <p className="text-sm text-slate-400">{category.type} · {category.slug}</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">
                        {category.isActive ? 'Activă' : 'Inactivă'}
                      </span>
                    </div>
                    {category.description ? <p className="mt-3 text-slate-400">{category.description}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-glow">
            <h2 className="text-2xl font-semibold text-white">Adaugă Categorie</h2>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm text-slate-300">
                Nume categorie
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              </label>
              <label className="block text-sm text-slate-300">
                Tip categorie
                <select
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value })}
                >
                  <option value="service">Servicii</option>
                  <option value="fuel">Carburanți</option>
                  <option value="currency">Valută</option>
                  <option value="product">Produse</option>
                </select>
              </label>
              <label className="block text-sm text-slate-300">
                Slug
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.slug}
                  onChange={(event) => setForm({ ...form, slug: event.target.value })}
                  required
                />
              </label>
              <label className="block text-sm text-slate-300">
                Descriere
                <textarea
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  rows={4}
                />
              </label>
              <label className="block text-sm text-slate-300">
                Icon
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.icon}
                  onChange={(event) => setForm({ ...form, icon: event.target.value })}
                  placeholder="Ex: ⚙️"
                />
              </label>
              <button type="submit" className="inline-flex rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400">
                Creează categorie
              </button>
              {status ? <p className="mt-2 text-slate-300">{status}</p> : null}
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
