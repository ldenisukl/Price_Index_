'use client';

import { useEffect, useState } from 'react';

type Submission = {
  id: string;
  categoryType: string;
  itemName: string;
  regionId: string;
  submittedPrice: number;
  priceType: string;
  sourceNote: string | null;
  contactOptional: string | null;
  status: string;
  createdAt: string;
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const response = await fetch('/api/admin/submissions');
        const data = await response.json();
        setSubmissions(data.submissions ?? []);
      } catch {
        setError('Nu s-au putut încărca contribuțiile.');
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  const updateSubmission = async (id: string, newStatus: string) => {
    setStatus(null);

    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Eroare la actualizarea contribuției.');
      }

      setSubmissions(submissions.map((submission) => (submission.id === id ? result.submission : submission)));
      setStatus(`Contribuția a fost marcată ca ${newStatus}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Eroare la actualizarea contribuției.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-glow">
          <h1 className="text-4xl font-semibold text-white">Contribuții pending</h1>
          <p className="mt-4 text-slate-300">Aici adminul poate aproba sau respinge prețurile trimise de utilizatori.</p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-glow">
          {loading ? (
            <p className="text-slate-400">Se încarcă...</p>
          ) : error ? (
            <p className="text-red-300">{error}</p>
          ) : submissions.length === 0 ? (
            <p className="text-slate-400">Nu există contribuții în așteptare.</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{submission.itemName}</p>
                      <p className="mt-1 text-sm text-slate-400">Categorie: {submission.categoryType} · Regiune: {submission.regionId}</p>
                    </div>
                    <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs uppercase tracking-[0.12em] text-amber-200">
                      {submission.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-slate-300">Preț propus: {submission.submittedPrice}</p>
                      <p className="text-slate-300">Tip preț: {submission.priceType}</p>
                    </div>
                    <div>
                      <p className="text-slate-300">Notă sursă: {submission.sourceNote ?? 'N/A'}</p>
                      <p className="text-slate-300">Contact: {submission.contactOptional ?? 'N/A'}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => updateSubmission(submission.id, 'live')}
                      className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
                    >
                      Aprobă
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSubmission(submission.id, 'old')}
                      className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
                    >
                      Respinge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {status ? <p className="mt-4 text-slate-300">{status}</p> : null}
        </section>
      </div>
    </main>
  );
}
