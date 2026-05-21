export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-glow">
        <h1 className="text-4xl font-semibold text-white">Contact</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          Pentru întrebări legate de proiect sau contribuții la date, contactează echipa internă.
        </p>
        <div className="mt-8 space-y-4 text-slate-300">
          <p>Email: contact@priceindex.md</p>
          <p>Website: priceindex.md</p>
        </div>
      </div>
    </main>
  );
}
