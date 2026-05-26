'use client';

import { type FormEvent, useState } from 'react';
import { aiExpectations } from '@/lib/data';

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

const defaultMessages: ChatMessage[] = [
  {
    role: 'user',
    text: 'What is the average price for an electrician in Chisinau and how does it compare to oil and currency trends?'
  },
  {
    role: 'assistant',
    text: 'The average hourly price for an electrician in Chisinau is 450 MDL, up 7.1% over the past 30 days. This increase aligns with rising operational costs and a strengthening EUR. WTI oil is trading at 78.64 USD (+1.25%), which may pressure service costs through higher transport and material expenses. Both EUR and USD have appreciated vs MDL (+0.61% and +0.28% respectively), contributing to imported equipment cost increases.'
  }
];

const quickActions = ['Compare categories', 'Price forecast', 'Regional trend'];

export default function AiChat() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [error, setError] = useState('');

  const handleAsk = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const trimmed = query.trim();
    if (!trimmed) {
      setError('Te rog scrie o întrebare.');
      return;
    }

    const userMessage: ChatMessage = { role: 'user', text: trimmed };
    const matched = aiExpectations.find((item) => trimmed.toLowerCase().includes(item.question.toLowerCase()));
    const assistantText = matched
      ? matched.answer
      : 'Nu avem suficiente date pentru această cerere exactă. Încearcă o întrebare similară sau verifică o altă categorie.';

    const assistantMessage: ChatMessage = { role: 'assistant', text: assistantText };
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setQuery('');
  };

  const handleQuickAction = (action: string) => {
    const quickQuery = action === 'Compare categories'
      ? 'Compare service, currency and fuel trends in Moldova.'
      : action === 'Price forecast'
      ? 'What is the short term price forecast for EUR/MDL and oil?'
      : 'Show the regional trend for electrician prices in Chisinau.';

    setQuery(quickQuery);
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-glow backdrop-blur-xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Ask AI about market prices</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">What would you like to know?</h2>
        </div>
        <button className="rounded-3xl border border-white/10 bg-slate-900/80 px-3 py-3 text-slate-300 transition hover:border-slate-500">
          <span className="sr-only">Menu</span>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>

      <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-900/80 p-4 shadow-inner">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[90%] rounded-3xl px-5 py-4 text-sm leading-6 ${message.role === 'assistant' ? 'bg-slate-950 text-slate-200' : 'bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-lg'} ${message.role === 'assistant' ? 'rounded-bl-none' : 'rounded-br-none'}`}>
              <p>{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {quickActions.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => handleQuickAction(action)}
            className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300 transition hover:bg-slate-800"
          >
            {action}
          </button>
        ))}
      </div>

      <form onSubmit={handleAsk} className="mt-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask about prices, services, oil, currency..."
            className="flex-1 rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-300"
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-3xl bg-indigo-500 px-6 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            <span className="mr-2">Send</span>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </form>

      <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-400">
        AI can make mistakes. Verify important information.
      </div>
    </div>
  );
}
