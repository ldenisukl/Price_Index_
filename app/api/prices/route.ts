import type { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type CategoryType = 'service' | 'fuel' | 'currency' | 'product';
type ProviderType = 'bank' | 'exchange' | 'bnm' | 'csv' | 'other';

type PriceEntryWithRelations = {
  id: string;
  priceItemId: string;
  regionId: string;
  providerId: string | null;
  providerName: string | null;
  priceMin: number | null;
  priceAvg: number | null;
  priceMax: number | null;
  currency: string;
  priceType: string;
  sourceType: string | null;
  sourceConfidence: number | null;
  dateCollected: Date;
  status: string;
  priceItem: {
    category: {
      type: CategoryType;
    };
    name: string;
  };
  region: {
    name: string;
  };
  provider: {
    name: string;
    type: ProviderType;
    location?: string | null;
  } | null;
};

const normalizeCategory = (value: string | null): CategoryType | 'all' | null => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === 'products') return 'product';
  if (normalized === 'services') return 'service';
  if (normalized === 'currencies') return 'currency';
  if (normalized === 'energy') return 'fuel';
  if (['service', 'fuel', 'currency', 'product'].includes(normalized)) return normalized as CategoryType;
  if (normalized === 'all') return 'all';
  return null;
};

const mapStatus = (status: string) => {
  switch (status) {
    case 'live':
      return 'Live';
    case 'recent':
      return 'Rising';
    case 'old':
      return 'Old';
    default:
      return 'Stable';
  }
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = normalizeCategory(url.searchParams.get('category'));
  const search = url.searchParams.get('search')?.toLowerCase().trim();
  const currency = url.searchParams.get('currency')?.toUpperCase().trim();
  const providerTypeParam = url.searchParams.get('providerType')?.toLowerCase().trim();
  const location = url.searchParams.get('location')?.trim();

  const providerTypeMapping: Record<string, ProviderType | undefined> = {
    banca: 'bank',
    bancă: 'bank',
    bank: 'bank',
    casa: 'exchange',
    'casă': 'exchange',
    'casă schimb': 'exchange',
    bnm: 'bnm',
    csv: 'csv',
    other: 'other'
  };

  const where: Prisma.PriceEntryWhereInput = {};

  if (category && category !== 'all') {
    where.priceItem = { is: { category: { type: category } } };
  }

  if (search) {
    where.OR = [
      { priceItem: { is: { name: { contains: search, mode: 'insensitive' } } } },
      { region: { is: { name: { contains: search, mode: 'insensitive' } } } }
    ];
  }

  if (currency) {
    where.priceType = { startsWith: `${currency}/` };
  }

  const providerFilter: Prisma.ProviderWhereInput = {};

  if (providerTypeParam) {
    const providerType = providerTypeMapping[providerTypeParam];
    if (providerType) {
      providerFilter.type = providerType;
    }
  }

  if (location) {
    providerFilter.location = { contains: location, mode: 'insensitive' };
  }

  if (Object.keys(providerFilter).length) {
    where.provider = { is: providerFilter };
  }

  const allEntries = await prisma.priceEntry.findMany({
    where,
    include: {
      priceItem: { include: { category: true } },
      region: true,
      provider: true
    },
    orderBy: { dateCollected: 'desc' }
  }) as PriceEntryWithRelations[];

  const latestEntriesByProvider = new Map<string, PriceEntryWithRelations>();
  for (const entry of allEntries) {
    const providerKey = entry.provider?.name ?? entry.providerName ?? 'null';
    const key = `${entry.priceItemId}|${entry.regionId}|${providerKey}|${entry.priceType}`;
    if (!latestEntriesByProvider.has(key)) {
      latestEntriesByProvider.set(key, entry);
    }
  }

  const priceEntries = Array.from(latestEntriesByProvider.values());

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const historyKeys = priceEntries.map((entry) => ({
    priceItemId: entry.priceItemId,
    regionId: entry.regionId,
    providerId: entry.providerId,
    providerName: entry.providerName,
    priceType: entry.priceType
  }));

  const history = priceEntries.length > 0 ? await prisma.priceEntry.findMany({
    where: {
      dateCollected: { gte: sevenDaysAgo },
      OR: historyKeys.map((key) => ({
        priceItemId: key.priceItemId,
        regionId: key.regionId,
        providerId: key.providerId,
        providerName: key.providerName,
        priceType: key.priceType
      }))
    },
    include: {
      priceItem: { include: { category: true } },
      region: true,
      provider: true
    },
    orderBy: { dateCollected: 'asc' }
  }) : [];

  const historyByKey = history.reduce<Record<string, PriceEntryWithRelations[]>>((acc, entry) => {
    const providerKey = entry.provider?.name ?? entry.providerName ?? 'null';
    const key = `${entry.priceItemId}|${entry.regionId}|${providerKey}|${entry.priceType}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry as PriceEntryWithRelations);
    return acc;
  }, {});

  const data = priceEntries.map((entry: PriceEntryWithRelations) => {
    const priceMin = entry.priceMin ?? 0;
    const priceAvg = entry.priceAvg ?? 0;
    const priceMax = entry.priceMax ?? 0;
    const isCurrency = entry.priceItem.category.type === 'currency';
    const trend = Number((priceAvg - priceMin).toFixed(2));
    const trendPercent = priceMin
      ? `${trend >= 0 ? '+' : ''}${trend.toFixed(2)} (${((trend / priceMin) * 100).toFixed(2)}%)`
      : '+0.00%';

    const formatPriceValue = (value: number | null | undefined) => {
      if (value === null || value === undefined || Number.isNaN(value)) {
        return undefined;
      }

      return `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${entry.currency}`;
    };

    const priceString = entry.priceAvg
      ? `${entry.priceAvg.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${entry.currency}`
      : 'N/A';

    const providerLabel = entry.providerName ? `${entry.providerName} · ` : '';
    const providerLocation = entry.provider?.location ? ` · ${entry.provider.location}` : '';
    const subtitle = `${providerLabel}${capitalize(entry.priceItem.category.type)} · ${entry.region?.name ?? 'Unknown'}${providerLocation}`;
    const providerKey = entry.provider?.name ?? entry.providerName ?? 'null';
    const historyKey = `${entry.priceItemId}|${entry.regionId}|${providerKey}|${entry.priceType}`;
    const historyEntries = historyByKey[historyKey] ?? [];

    const sortedHistory = historyEntries
      .slice()
      .sort((a, b) => new Date(a.dateCollected).getTime() - new Date(b.dateCollected).getTime());

    const chartData = sortedHistory
      .map((h) => h.priceAvg ?? h.priceMin ?? h.priceMax)
      .filter((value): value is number => value !== null && value !== undefined && Number.isFinite(value));

    const allValues = sortedHistory.flatMap((h) => [h.priceMin, h.priceAvg, h.priceMax].filter((value): value is number => value !== null && value !== undefined && Number.isFinite(value)));
    const weeklyHigh = allValues.length ? Math.max(...allValues) : priceMax || undefined;
    const weeklyLow = allValues.length ? Math.min(...allValues) : priceMin || undefined;

    return {
      id: entry.id,
      category: entry.priceItem.category,
      title: entry.priceItem.name,
      subtitle,
      provider: entry.providerName ?? undefined,
      providerType: entry.provider?.type ?? undefined,
      location: entry.provider?.location ?? undefined,
      price: priceString,
      buyPrice: isCurrency ? formatPriceValue(entry.priceMin) : undefined,
      sellPrice: isCurrency ? formatPriceValue(entry.priceMax) : undefined,
      trend,
      trendPercent,
      status: mapStatus(entry.status),
      high: weeklyHigh ? `${weeklyHigh}` : undefined,
      low: weeklyLow ? `${weeklyLow}` : undefined,
      chartData: chartData.length > 1 ? chartData : undefined
    };
  });

  return NextResponse.json({ data });
}
