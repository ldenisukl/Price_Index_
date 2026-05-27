'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { PriceItem } from '@/lib/data';

type NavItem = {
  label: string;
  href?: string;
  kind?: 'link' | 'action';
  description?: string;
};

type SidebarProps = {
  savedCards: PriceItem[];
  onClearSaved: () => void;
  onRemoveSaved: (id: string) => void;
};

const defaultNavItems: NavItem[] = [
  { label: 'Overview', href: '/', kind: 'link', description: 'Dashboard principal' },
  { label: 'Markets', href: '/banci', kind: 'link', description: 'Cursuri și bănci' },
  { label: 'Services', href: '/categories', kind: 'link', description: 'Categorii active' },
  { label: 'Insights', href: '/about', kind: 'link', description: 'Despre proiect' },
  { label: 'Saved', kind: 'action', description: 'Salvează și revino la favorite' },
  { label: 'Settings', kind: 'action', description: 'Preferințe locale' }
];

const settingsStorageKey = 'price-index-sidebar-settings';

type SidebarSettings = {
  defaultCurrency: string;
  defaultLocation: string;
  liveUpdates: boolean;
};

const defaultSettings: SidebarSettings = {
  defaultCurrency: 'EUR',
  defaultLocation: 'Chișinău',
  liveUpdates: true
};

export default function Sidebar({ savedCards, onClearSaved, onRemoveSaved }: SidebarProps) {
  const pathname = usePathname();
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SidebarSettings>(defaultSettings);

  useEffect(() => {
    try {
      const storedSettings = window.localStorage.getItem(settingsStorageKey);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings) as Partial<SidebarSettings>;
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
    } catch {
      // localStorage unavailable
    }
  }, [settings]);

  const savedPreview = useMemo(() => {
    if (savedCards.length === 0) {
      return 'Nu ai încă elemente salvate.';
    }

    return savedCards.slice(0, 3).map((item) => item.title).join(', ');
  }, [savedCards]);

  const handleSavedToggle = () => {
    setIsSettingsOpen(false);
    setIsSavedOpen((current) => !current);
  };

  const handleSettingsToggle = () => {
    setIsSavedOpen(false);
    setIsSettingsOpen((current) => !current);
  };

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
              {defaultNavItems.map((item) => {
                const isActive = item.href ? pathname === item.href : false;

                if (item.kind === 'link') {
                  return (
                    <Link
                      key={item.label}
                      href={item.href ?? '/'}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${
                        isActive
                          ? 'border-transparent bg-indigo-500 text-white'
                          : 'border-white/10 text-slate-300 hover:bg-white/5 hover:text-slate-100'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.label === 'Saved' ? handleSavedToggle : handleSettingsToggle}
                    className="whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-slate-100"
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="hidden xl:block space-y-2">
              {defaultNavItems.map((item) => {
                const isActive = item.href ? pathname === item.href : false;

                if (item.kind === 'link') {
                  return (
                    <Link
                      key={item.label}
                      href={item.href ?? '/'}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-left transition ${
                        isActive
                          ? 'bg-indigo-500/10 text-white shadow-sm shadow-indigo-500/20'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-xs text-slate-500">{item.description}</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.label === 'Saved' ? handleSavedToggle : handleSettingsToggle}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-slate-100"
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-slate-500">{item.description}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {isSavedOpen ? (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-slate-100">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">Saved items</p>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[0.65rem] font-semibold text-emerald-100">
                  {savedCards.length}
                </span>
              </div>

              {savedCards.length === 0 ? (
                <p className="mt-3 text-sm text-slate-200">Nu ai încă elemente salvate.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {savedCards.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-slate-400">{item.subtitle}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveSaved(item.id)}
                        className="rounded-full border border-white/10 px-2.5 py-1 text-[0.65rem] font-semibold text-slate-100 transition hover:bg-white/5"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-3 text-xs text-slate-300">{savedPreview}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onClearSaved}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/5"
                >
                  Curăță lista
                </button>
              </div>
            </div>
          ) : null}

          {isSettingsOpen ? (
            <div className="mt-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-slate-100">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-200">Sidebar settings</p>
              <label className="mt-3 block text-sm text-slate-200">
                Monedă preferată
                <select
                  value={settings.defaultCurrency}
                  onChange={(event) => setSettings((current) => ({ ...current, defaultCurrency: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 outline-none"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="RON">RON</option>
                </select>
              </label>

              <label className="mt-3 block text-sm text-slate-200">
                Oraș implicit
                <input
                  value={settings.defaultLocation}
                  onChange={(event) => setSettings((current) => ({ ...current, defaultLocation: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 outline-none"
                  placeholder="Chișinău"
                />
              </label>

              <label className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
                <span>Actualizări live</span>
                <input
                  type="checkbox"
                  checked={settings.liveUpdates}
                  onChange={(event) => setSettings((current) => ({ ...current, liveUpdates: event.target.checked }))}
                  className="h-4 w-4 rounded border-white/10 bg-slate-900 text-indigo-500"
                />
              </label>
            </div>
          ) : null}
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
