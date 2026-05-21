export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-glow">
        <h1 className="text-4xl font-semibold text-white">Categorii</h1>
        <p className="mt-4 text-slate-300">Vezi categoriile de servicii, carburant, valută și produse disponibile în MVP.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {['Services', 'Fuel', 'Currency', 'Products'].map((name) => (
            <div key={name} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
              <h2 className="text-xl font-semibold text-white">{name}</h2>
              <p className="mt-3 text-slate-400">Filtrează și compară prețuri pentru această categorie.</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
