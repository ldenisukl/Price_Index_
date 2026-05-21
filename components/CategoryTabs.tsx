const tabs = [
  { id: 'all', label: 'Toate' },
  { id: 'service', label: 'Servicii' },
  { id: 'fuel', label: 'Carburanți' },
  { id: 'currency', label: 'Valută' },
  { id: 'product', label: 'Produse' }
];

export default function CategoryTabs({ activeTab, onChange }: { activeTab: string; onChange: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === tab.id
              ? 'bg-indigo-500 text-white shadow-[0_20px_50px_rgba(99,102,241,0.18)]'
              : 'bg-slate-900 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
