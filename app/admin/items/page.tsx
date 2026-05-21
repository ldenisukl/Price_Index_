'use client';

import { FormEvent, useEffect, useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Item = {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  providerName: string | null;
  isActive: boolean;
  category: Category;
};

export default function AdminItemsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', categoryId: '', description: '', unit: '', providerName: '' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, itemId: '', itemName: '', priceCount: 0, cascade: false });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, itemsRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/items')
        ]);

        if (!categoriesRes.ok || !itemsRes.ok) {
          throw new Error('Unable to load items or categories.');
        }

        const categoriesData = await categoriesRes.json();
        const itemsData = await itemsRes.json();

        setCategories(categoriesData.categories ?? []);
        setItems(itemsData.items ?? []);
        setForm((prev) => ({ ...prev, categoryId: categoriesData.categories?.[0]?.id ?? '' }));
      } catch (err) {
        setError('Nu am putut încărca itemurile sau categoriile.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    try {
      const response = await fetch('/api/admin/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Eroare la creare item');
      }

      setItems([result.item, ...items]);
      setForm({ name: '', categoryId: categories[0]?.id ?? '', description: '', unit: '', providerName: '' });
      setStatus('Item creat cu succes.');
    } catch (err) {
      setStatus((err as Error).message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    console.log('Opening delete dialog for item:', { id, name });
    setStatus(null);
    setConfirmDialog({ isOpen: true, itemId: id, itemName: name, priceCount: 0, cascade: false });
  };

  const handleConfirmDelete = async () => {
    const { itemId, cascade } = confirmDialog;
    console.log('Confirming delete for itemId:', itemId, 'cascade:', cascade);
    setConfirmDialog({ isOpen: false, itemId: '', itemName: '', priceCount: 0, cascade: false });

    if (!itemId) {
      setStatus('Eroare: ID itemului nu este valid.');
      return;
    }

    setStatus('Se șterge...');

    try {
      const response = await fetch('/api/admin/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, cascadeDelete: cascade })
      });

      console.log('Delete response status:', response.status);

      const result = await response.json();
      console.log('Delete response body:', result);

      if (response.status === 409 && result.hasPriceEntries) {
        console.log('Item has prices, asking for confirmation');
        setStatus(null);
        setConfirmDialog({
          isOpen: true,
          itemId,
          itemName: confirmDialog.itemName,
          priceCount: result.priceCount,
          cascade: true
        });
        return;
      }

      if (!response.ok) {
        const errorMsg = result.error || 'Eroare la ștergere item';
        setStatus(`❌ ${errorMsg}`);
        console.error('Delete error:', result);
        return;
      }

      setItems(items.filter((item) => item.id !== itemId));
      setStatus('✅ Item șters cu succes.');
      console.log('Item deleted successfully, updated items list');
    } catch (err) {
      const errorMsg = (err as Error).message;
      setStatus(`❌ ${errorMsg}`);
      console.error('Delete exception:', err);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, itemId: '', itemName: '', priceCount: 0, cascade: false });
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        {status && (
          <div className={`rounded-[2rem] border p-4 ${
            status.includes('❌')
              ? 'border-red-500/30 bg-red-500/10 text-red-200'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
          }`}>
            <p className="text-sm font-semibold">{status}</p>
          </div>
        )}

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-glow">
          <h1 className="text-4xl font-semibold text-white">Itemuri</h1>
          <p className="mt-4 text-slate-300">Adaugă și vizualizează produsele sau serviciile monitorizate.</p>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-glow">
            <h2 className="text-2xl font-semibold text-white">Listă Itemuri</h2>
            {loading ? (
              <p className="mt-4 text-slate-400">Se încarcă...</p>
            ) : error ? (
              <p className="mt-4 text-red-300">{error}</p>
            ) : (
              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">{item.name}</p>
                        <p className="text-sm text-slate-400">Categorie: {item.category.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">
                          {item.isActive ? 'Activ' : 'Inactiv'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-500/30"
                        >
                          Șterge
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-slate-400">{item.description}</p>
                    <p className="mt-2 text-sm text-slate-400">Unitate: {item.unit} {item.providerName ? `· Provider: ${item.providerName}` : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-glow">
            <h2 className="text-2xl font-semibold text-white">Adaugă Item</h2>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm text-slate-300">
                Nume item
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              </label>
              <label className="block text-sm text-slate-300">
                Categorie
                <select
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.categoryId}
                  onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-300">
                Unit
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  value={form.unit}
                  onChange={(event) => setForm({ ...form, unit: event.target.value })}
                  required
                />
              </label>
              <label className="block text-sm text-slate-300">
                Descriere
                <textarea
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  rows={4}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
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
              <button type="submit" className="inline-flex rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400">
                Creează item
              </button>
              {status ? <p className="mt-2 text-slate-300">{status}</p> : null}
            </form>
          </div>
        </section>

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.cascade ? 'Șterge item și prețurile asociate' : 'Șterge item'}
          message={
            confirmDialog.cascade
              ? `Itemul "${confirmDialog.itemName}" are ${confirmDialog.priceCount} preț(uri) asociat(e). Vrei să le ștergi și pe acelea?\n\n⚠️ Această acțiune nu poate fi anulată.`
              : `Ești sigur că vrei să ștergi itemul "${confirmDialog.itemName}"? Această acțiune nu poate fi anulată.`
          }
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          confirmText={confirmDialog.cascade ? 'Șterge totul' : 'Șterge'}
          cancelText="Anulare"
          isDangerous={true}
        />
      </div>
    </main>
  );
}
