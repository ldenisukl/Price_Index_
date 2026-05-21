import Link from 'next/link';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/categories', label: 'Categorii' },
  { href: '/admin/items', label: 'Itemuri' },
  { href: '/admin/prices', label: 'Prețuri' },
  { href: '/admin/submissions', label: 'Contribuții pending' },
  { href: '/admin/login', label: 'Logout' }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto min-h-screen max-w-[1700px] px-4 py-6 sm:px-6 xl:px-0">
        <div className="grid min-h-[calc(100vh-48px)] gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-glow">
            <div className="mb-10">
              <Link href="/admin/dashboard" className="text-2xl font-semibold text-white hover:text-indigo-300">
                Admin Panel
              </Link>
              <p className="mt-2 text-sm text-slate-400">
                Gestionare conținut, categorii și aprobări.
              </p>
            </div>
            <nav className="space-y-2 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-2xl px-4 py-3 text-slate-200 transition hover:bg-slate-800 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-10 rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300">
              <h2 className="text-sm font-semibold text-white">Notă</h2>
              <p className="mt-3 text-slate-400">
                Folosește secțiunea de contribuții pentru a aproba sau respinge date noi.
              </p>
            </div>
          </aside>

          <div className="space-y-6">
            <main>{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
