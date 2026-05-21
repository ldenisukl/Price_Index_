export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-glow">
        <h1 className="text-4xl font-semibold text-white">Despre proiect</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          Price Index Moldova AI este construit pentru a oferi o imagine clară a prețurilor din Moldova pe servicii, carburant, valută și produse.
          MVP-ul arată cum utilizatorii pot compara rapid prețuri, pot căuta între categorii și pot obține răspunsuri simple dintr-un chat AI bazat pe datele disponibile.
        </p>
      </div>
    </main>
  );
}
