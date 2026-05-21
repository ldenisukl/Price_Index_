'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

type HeaderProps = {
  activeTab: 'all' | 'product' | 'service' | 'currency' | 'fuel';
  onTabChange: (tab: 'all' | 'product' | 'service' | 'currency' | 'fuel') => void;
  onSearch?: (query: string) => void;
};

type Suggestion = {
  type: 'item' | 'region' | 'priceType' | 'source';
  label: string;
  category?: string;
  value: string;
};

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'product', label: 'Products' },
  { key: 'service', label: 'Services' },
  { key: 'currency', label: 'Currencies' },
  { key: 'fuel', label: 'Energy' }
] as const;

export default function Header({ activeTab, onTabChange, onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setIsOpen(data.suggestions?.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [searchQuery]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearchQuery(suggestion.label);
    setIsOpen(false);
    if (onSearch) {
      onSearch(suggestion.value);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-semibold text-white">
            PI
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Service</p>
            <p className="text-lg font-semibold text-white">Price Index AI</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center gap-3">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div 
            ref={searchRef}
            className="relative ml-4 flex-1 max-w-xs"
          >
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900 px-4 py-2">
              <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search markets, services, cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 0 && setIsOpen(true)}
                className="flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder-slate-500"
              />
              {loading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-blue-500" />
              )}
            </div>

            {isOpen && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-white/10 bg-slate-900 shadow-2xl overflow-hidden z-50">
                <div className="max-h-96 overflow-y-auto">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={`${suggestion.type}-${idx}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-800 transition border-b border-white/5 last:border-b-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-100">{suggestion.label}</p>
                          {suggestion.category && (
                            <p className="text-xs text-slate-400 mt-0.5">{suggestion.category}</p>
                          )}
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                          suggestion.type === 'item' ? 'bg-blue-500/20 text-blue-300' :
                          suggestion.type === 'region' ? 'bg-emerald-500/20 text-emerald-300' :
                          suggestion.type === 'priceType' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-orange-500/20 text-orange-300'
                        }`}>
                          {suggestion.type === 'item' ? 'Item' :
                           suggestion.type === 'region' ? 'Region' :
                           suggestion.type === 'priceType' ? 'Type' :
                           'Source'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {[
            { label: 'Tracked items', value: '124' },
            { label: 'Updated today', value: '18' },
            { label: 'Cities', value: '7' },
            { label: 'AI confidence', value: '92%' }
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">{stat.label}</p>
                <p className="text-xl font-semibold text-white">{stat.value}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Link href="/banci" className="rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600">
              Tabel bănci
            </Link>
            <Link href="/add-price" className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400">
              Contribuie preț
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
