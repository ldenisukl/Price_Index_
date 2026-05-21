'use client';

import { FormEvent, useState } from 'react';

const categoryOptions = [
  { value: 'service', label: 'Servicii' },
  { value: 'fuel', label: 'Carburanți' },
  { value: 'currency', label: 'Valută' },
  { value: 'product', label: 'Produse' }
];

export default function AddPricePage() {
  const [categoryType, setCategoryType] = useState('service');
  const [itemName, setItemName] = useState('');
  const [regionName, setRegionName] = useState('');
  const [submittedPrice, setSubmittedPrice] = useState('');
  const [priceType, setPriceType] = useState('');
  const [sourceNote, setSourceNote] = useState('');
  const [noteOptional, setNoteOptional] = useState('');
  const [contactOptional, setContactOptional] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryType,
          itemName,
          regionName,
          submittedPrice,
          priceType,
          sourceNote,
          noteOptional,
          contactOptional
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'A apărut o eroare la trimitere.');
      }

      setStatusMessage('Contribuția a fost trimisă. Va fi revizuită de admin înainte de publicare.');
      setItemName('');
      setRegionName('');
      setSubmittedPrice('');
      setPriceType('');
      setSourceNote('');
      setNoteOptional('');
      setContactOptional('');
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-glow">
        <h1 className="text-4xl font-semibold text-white">Adaugă un preț</h1>
        <p className="mt-4 text-slate-300">Completează formularul pentru a trimite un preț. Contribuția intră în status <strong>pending</strong> și va fi aprobată de administratori înainte de a fi publicată.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <form className="rounded-3xl bg-slate-950/80 p-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">
                Categorie
                <select
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none"
                  value={categoryType}
                  onChange={(event) => setCategoryType(event.target.value)}
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-slate-300">
                Tip preț
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none"
                  value={priceType}
                  onChange={(event) => setPriceType(event.target.value)}
                  placeholder="De ex. preț mediu"
                  required
                />
              </label>

              <label className="block text-sm text-slate-300 sm:col-span-2">
                Item / serviciu / produs
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none"
                  value={itemName}
                  onChange={(event) => setItemName(event.target.value)}
                  placeholder="De ex. Internet 100 Mbps"
                  required
                />
              </label>

              <label className="block text-sm text-slate-300">
                Oraș
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none"
                  value={regionName}
                  onChange={(event) => setRegionName(event.target.value)}
                  placeholder="De ex. Chișinău"
                  required
                />
              </label>

              <label className="block text-sm text-slate-300">
                Preț
                <input
                  type="number"
                  step="any"
                  min="0"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none"
                  value={submittedPrice}
                  onChange={(event) => setSubmittedPrice(event.target.value)}
                  placeholder="De ex. 150"
                  required
                />
              </label>

              <label className="block text-sm text-slate-300 sm:col-span-2">
                Sursă
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none"
                  value={sourceNote}
                  onChange={(event) => setSourceNote(event.target.value)}
                  placeholder="De ex. ofertă magazin / website"
                  required
                />
              </label>

              <label className="block text-sm text-slate-300">
                Contact opțional
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none"
                  value={contactOptional}
                  onChange={(event) => setContactOptional(event.target.value)}
                  placeholder="Email, telefon sau website"
                />
              </label>

              <label className="block text-sm text-slate-300">
                Notă opțională
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none"
                  value={noteOptional}
                  onChange={(event) => setNoteOptional(event.target.value)}
                  placeholder="Adaugă detalii adiționale"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? 'Se trimite...' : 'Trimite preț'}
              </button>
              <div className="space-y-1 text-sm text-slate-400 sm:text-right">
                {statusMessage ? <p className="text-emerald-300">{statusMessage}</p> : null}
                {errorMessage ? <p className="text-red-300">{errorMessage}</p> : null}
              </div>
            </div>
          </form>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
            <h2 className="text-xl font-semibold text-white">Ce va verifica adminul?</h2>
            <ul className="mt-4 space-y-3 text-slate-300">
              <li>✅ Categoria și tipul prețului</li>
              <li>✅ Oraș/regiune</li>
              <li>✅ Nivelul sursei</li>
              <li>✅ Validitatea și actualitatea datelor</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
