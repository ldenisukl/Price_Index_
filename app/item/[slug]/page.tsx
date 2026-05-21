import { notFound } from 'next/navigation';
import { sampleCards } from '@/lib/data';

type Props = {
  params: {
    slug: string;
  };
};

export default function ItemPage({ params }: Props) {
  const item = sampleCards.find((card) => card.id === params.slug);
  if (!item) return notFound();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-glow">
        <h1 className="text-4xl font-semibold text-white">{item.title}</h1>
        <p className="mt-3 text-slate-300">{item.subtitle}</p>
        <div className="mt-8 space-y-4 text-slate-200">
          <p>Price: {item.price}</p>
          <p className="text-slate-300">Trend: {item.trendPercent}</p>
          <p className="text-slate-300">Status: {item.status}</p>
          {item.high && <p>High: {item.high}</p>}
          {item.low && <p>Low: {item.low}</p>}
        </div>
      </div>
    </main>
  );
}
