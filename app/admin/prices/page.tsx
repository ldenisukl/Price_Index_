'use client';

import { FormEvent, useEffect, useState } from 'react';

type Category = {
  id: string;
  name: string;
  type: string;
};

type Item = {
  id: string;
  name: string;
  category: Category;
};

type Region = {
  id: string;
  name: string;
};

type PriceEntry = {
  id: string;
  priceMin: number | null;
  priceAvg: number | null;
  priceMax: number | null;
  currency: string;
  priceType: string;
  qualificationLevel: string | null;
  sourceType: string | null;
  sourceConfidence: number | null;
  providerName: string | null;
  status: string;
  priceItem: Item;
  region: Region;
};

const statusOptions = ['pending', 'live', 'recent', 'old', 'review'];
const qualificationOptions = ['beginner', 'medium', 'experienced', 'premium'];

export default function AdminPricesPage() {
  const [entries, setEntries] = useState<PriceEntry[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<PriceEntry | null>(null);
  const [form, setForm] = useState({
    priceItemId: '',
    regionId: '',
    priceMin: '',
    priceAvg: '',
    priceMax: '',
    currency: 'MDL',
    priceType: '',
    qualificationLevel: 'medium',
    sourceType: '',
    sourceConfidence: '75',
    providerName: '',
    status: 'pending'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/admin/prices?refs=true');
        const data = await response.json();

        if (!response.ok) {
          throw new Error('Nu am putut încărca prețurile.');
        }

        setEntries(data.entries ?? []);
        setItems(data.items ?? []);
        setRegions(data.regions ?? []);
        setForm((prev) => ({
          ...prev,
          priceItemId: data.items?.[0]?.id ?? '',
          regionId: data.regions?.[0]?.id ?? ''
        }));
      } catch {
        setError('Nu am putut încărca datele de prețuri.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    try {
      const response = await fetch('/api/admin/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceItemId: form.priceItemId,
          regionId: form.regionId,
          priceMin: form.priceMin ? Number(form.priceMin) : null,
          priceAvg: form.priceAvg ? Number(form.priceAvg) : null,
          priceMax: form.priceMax ? Number(form.priceMax) : null,
          currency: form.currency,
          priceType: form.priceType,
          qualificationLevel: form.qualificationLevel,
          sourceType: form.sourceType,
          sourceConfidence: form.sourceConfidence ? Number(form.sourceConfidence) : null,
          providerName: form.providerName,
          status: form.status
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Eroare la creare preț.');
      }

      setEntries([result.entry, ...entries]);
      setStatus('Preț adăugat cu succes.');
      setForm((prev) => ({
        ...prev,
        priceMin: '',
        priceAvg: '',
        priceMax: '',
        priceType: '',
        sourceType: '',
        sourceConfidence: '75',
        providerName: ''
      }));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Eroare la creare preț.');
    }
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEntry) return;
    setStatus(null);

    try {
      const response = await fetch('/api/admin/prices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedEntry.id,
          priceMin: form.priceMin ? Number(form.priceMin) : null,
          priceAvg: form.priceAvg ? Number(form.priceAvg) : null,
          priceMax: form.priceMax ? Number(form.priceMax) : null,
          currency: form.currency,
          priceType: form.priceType,
          qualificationLevel: form.qualificationLevel,
          sourceType: form.sourceType,
          sourceConfidence: form.sourceConfidence ? Number(form.sourceConfidence) : null,
          providerName: form.providerName,
          status: form.status
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Eroare la actualizare preț.');
      }

      setEntries(entries.map((entry) => (entry.id === selectedEntry.id ? result.entry : entry)));
      setSelectedEntry(result.entry);
      setStatus('Preț actualizat cu succes.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Eroare la actualizare preț.');
    }
  };

  const handleSelectEntry = (entry: PriceEntry) => {
    if (!entry.priceItem) {
      setStatus('Nu pot edita această intrare: item necunoscut.');
      return;
    }

    setSelectedEntry(entry);
    setForm({
      priceItemId: entry.priceItem.id,
      regionId: entry.region.id,
      priceMin: entry.priceMin?.toString() ?? '',
      priceAvg: entry.priceAvg?.toString() ?? '',
      priceMax: entry.priceMax?.toString() ?? '',
      currency: entry.currency,
      priceType: entry.priceType,
      qualificationLevel: entry.qualificationLevel ?? 'medium',
      sourceType: entry.sourceType ?? '',
      sourceConfidence: entry.sourceConfidence?.toString() ?? '75',
      providerName: entry.providerName ?? '',
      status: entry.status
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-glow">
          <h1 className="text-4xl font-semibold text-white">Prețuri</h1>
          <p className="mt-4 text-slate-300">Adaugă sau editează prețuri, setează surse, nivel de încredere și status.</p>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-glow">
            <h2 className="text-2xl font-semibold text-white">Listă Prețuri</h2>
            {loading ? (
              <p className="mt-4 text-slate-400">Se încarcă...</p>
            ) : error ? (
              <p className="mt-4 text-red-300">{error}</p>
            ) : (
              <div className="mt-6 space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">{entry.priceItem?.name ?? 'Item necunoscut'} · {entry.region.name}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {entry.priceType} · {entry.currency} · {entry.sourceType ?? 'fără sursă'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.12em] text-slate-300">{entry.status}</span>
                        <button
                          type="button"
                          onClick={() => handleSelectEntry(entry)}
                          className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <p className="text-slate-300">Min: {entry.priceMin ?? 'N/A'}</p>
                      <p className="text-slate-300">Avg: {entry.priceAvg ?? 'N/A'}</p>
                      <p className="text-slate-300">Max: {entry.priceMax ?? 'N/A'}</p>
                    </div>
                    <p className="mt-2 text-slate-400">Încredere: {entry.sourceConfidence ?? '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-glow">
            <h2 className="text-2xl font-semibold text-white">{selectedEntry ? 'Editează prețul' : 'Adaugă preț nou'}</h2>
            <form className="mt-6 space-y-4" onSubmit={selectedEntry ? handleUpdate : handleCreate}>
              <label className="block text-sm text-slate-300">
                Item
                <select
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.priceItemId}
                  onChange={(event) => setForm({ ...form, priceItemId: event.target.value })}
                  required
                >
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>{item.name} ({item.category.name})</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-300">
                Region
                <select
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.regionId}
                  onChange={(event) => setForm({ ...form, regionId: event.target.value })}
                  required
                >
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block text-sm text-slate-300">
                  Preț min
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                    value={form.priceMin}
                    onChange={(event) => setForm({ ...form, priceMin: event.target.value })}
                    type="number"
                    step="0.01"
                  />
                </label>
                <label className="block text-sm text-slate-300">
                  Preț avg
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                    value={form.priceAvg}
                    onChange={(event) => setForm({ ...form, priceAvg: event.target.value })}
                    type="number"
                    step="0.01"
                  />
                </label>
                <label className="block text-sm text-slate-300">
                  Preț max
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                    value={form.priceMax}
                    onChange={(event) => setForm({ ...form, priceMax: event.target.value })}
                    type="number"
                    step="0.01"
                  />
                </label>
              </div>
              <label className="block text-sm text-slate-300">
                Monedă
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.currency}
                  onChange={(event) => setForm({ ...form, currency: event.target.value })}
                  required
                />
              </label>
              <label className="block text-sm text-slate-300">
                Tip preț
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.priceType}
                  onChange={(event) => setForm({ ...form, priceType: event.target.value })}
                  required
                />
              </label>
              <label className="block text-sm text-slate-300">
                Sursă
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.sourceType}
                  onChange={(event) => setForm({ ...form, sourceType: event.target.value })}
                />
              </label>
              <label className="block text-sm text-slate-300">
                Nivel încredere %
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.sourceConfidence}
                  onChange={(event) => setForm({ ...form, sourceConfidence: event.target.value })}
                  type="number"
                  min="0"
                  max="100"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Provider
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.providerName}
                  onChange={(event) => setForm({ ...form, providerName: event.target.value })}
                />
              </label>
              <label className="block text-sm text-slate-300">
                Status
                <select
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-300">
                Nivel calificare
                <select
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.qualificationLevel}
                  onChange={(event) => setForm({ ...form, qualificationLevel: event.target.value })}
                >
                  {qualificationOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className="inline-flex rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400">
                {selectedEntry ? 'Salvează modificările' : 'Adaugă preț'}
              </button>
              {selectedEntry ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEntry(null);
                    setForm((prev) => ({
                      ...prev,
                      priceMin: '',
                      priceAvg: '',
                      priceMax: '',
                      priceType: '',
                      sourceType: '',
                      sourceConfidence: '75',
                      providerName: '',
                      status: 'pending'
                    }));
                  }}
                  className="ml-3 inline-flex rounded-full border border-white/10 bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                >
                  Renunță
                </button>
              ) : null}
              {status ? <p className="mt-2 text-slate-300">{status}</p> : null}
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
