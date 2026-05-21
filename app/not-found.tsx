import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="max-w-xl rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 text-center shadow-glow">
        <p className="text-slate-500">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Pagina nu a fost găsită</h1>
        <p className="mt-4 text-slate-300">Este posibil ca linkul să fie greșit sau pagina să fi fost mutată.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-400">
          Înapoi la dashboard
        </Link>
      </div>
    </main>
  );
}
