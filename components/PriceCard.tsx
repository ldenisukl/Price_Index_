import { PriceItem } from '@/lib/data';

const categoryIcon = {
  service: '✓',
  fuel: '⛽',
  currency: '$',
  product: '📦'
};

const categoryColor = {
  service: 'from-amber-500 to-orange-500',
  fuel: 'from-yellow-500 to-amber-500',
  currency: 'from-emerald-500 to-teal-500',
  product: 'from-violet-500 to-fuchsia-500'
};

const statusColor = {
  Live: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  Rising: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' },
  Stable: { bg: 'bg-slate-500/10', text: 'text-slate-400', dot: 'bg-slate-500' },
  Old: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' }
};

function MiniChart({ data }: { data?: number[] }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 40" className="h-10 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke="url(#chartGradient)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function PriceCard({ item }: { item: PriceItem }) {
  const trendIsPositive = item.trend > 0;
  const colors = statusColor[item.status];

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-glow transition hover:border-blue-500/30 hover:shadow-[0_20px_60px_rgba(59,130,246,0.1)] ${colors.bg}`}>
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded bg-gradient-to-r ${categoryColor[item.category]} text-xs font-bold text-white`}>
              {categoryIcon[item.category]}
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider text-slate-500">{item.subtitle}</p>
          {item.provider === 'BNM' ? (
            <p className="text-xs font-semibold text-emerald-300">Curs BNM</p>
          ) : null}
          <h3 className="text-xl font-semibold text-white">{item.title}</h3>
        </div>
        <button className="text-slate-400 transition hover:text-slate-200">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>

      <div className="mb-4 space-y-2">
        <p className="text-3xl font-bold text-white">{item.price}</p>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${trendIsPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {trendIsPositive ? '↗' : '↘'} {item.trendPercent}
          </span>
        </div>
      </div>

      {item.chartData && (
        <div className="mb-4 h-10">
          <MiniChart data={item.chartData} />
        </div>
      )}

      {item.high && item.low && (
        <div className="mb-4 flex justify-between text-xs text-slate-400">
          <span>High {item.high}</span>
          <span>Low {item.low}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <span className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${colors.text}`}>
          <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
          {item.status}
        </span>
      </div>
    </div>
  );
}
