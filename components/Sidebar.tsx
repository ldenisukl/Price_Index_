const navItems = [
  { label: 'Overview', active: true },
  { label: 'Markets' },
  { label: 'Services' },
  { label: 'Insights' },
  { label: 'Saved' },
  { label: 'Settings' }
];

export default function Sidebar() {
  return (
    <aside className="block">
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-glow">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-xl font-semibold text-white">PI</div>
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Price Index</p>
              <h1 className="text-xl font-semibold text-white">Moldova AI</h1>
            </div>
          </div>
          <p className="mt-6 text-sm leading-6 text-slate-400">Dashboard pentru prețuri de servicii, carburant, valută și produse.</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-glow">
          <nav>
            <div className="flex gap-2 overflow-x-auto pb-2 xl:hidden">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    item.active ? 'bg-indigo-500 text-white border-transparent' : 'border-white/10 text-slate-300 hover:bg-white/5 hover:text-slate-100'
                  }`}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="hidden xl:block space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-left transition ${
                    item.active ? 'bg-indigo-500/10 text-white shadow-sm shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                  }`}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-glow">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Quick stats</p>
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Orașe monitorizate</p>
              <p className="mt-2 text-xl font-semibold text-white">5</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Categorii</p>
              <p className="mt-2 text-xl font-semibold text-white">4</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
