import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.toLowerCase().trim();

  if (!query || query.length < 1) {
    return NextResponse.json({ suggestions: [] });
  }

  type SuggestionItem = {
    id: string;
    name: string;
    categoryId: string;
    category?: { type?: string | null } | null;
  };

  type SuggestionRegion = {
    id: string;
    name: string;
  };

  type SuggestionPriceType = {
    priceType: string | null;
  };

  type SuggestionSource = {
    sourceType: string | null;
  };

  const [items, regions, types, sources] = await Promise.all([
    prisma.priceItem.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: { id: true, name: true, categoryId: true },
      take: 5
    }).then(async (items) => {
      const itemsWithCategory = await Promise.all(items.map(async (item) => {
        const category = await prisma.category.findUnique({ where: { id: item.categoryId } });
        return { ...item, category } as SuggestionItem;
      }));
      return itemsWithCategory;
    }),
    prisma.region.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: { id: true, name: true },
      take: 5
    }) as Promise<SuggestionRegion[]>,
    prisma.priceEntry.findMany({
      where: {
        priceType: {
          contains: query,
          mode: 'insensitive'
        }
      },
      distinct: ['priceType'],
      select: { priceType: true },
      take: 3
    }) as Promise<SuggestionPriceType[]>,
    prisma.priceEntry.findMany({
      where: {
        sourceType: {
          contains: query,
          mode: 'insensitive'
        }
      },
      distinct: ['sourceType'],
      select: { sourceType: true },
      take: 3
    }) as Promise<SuggestionSource[]>
  ]).catch(() => [[], [], [], []] as [SuggestionItem[], SuggestionRegion[], SuggestionPriceType[], SuggestionSource[]]);

  const suggestions = [
    ...items.map((item) => ({
      type: 'item',
      label: item.name,
      category: item.category?.type || 'Unknown',
      value: item.name
    })),
    ...regions.map((region) => ({
      type: 'region',
      label: region.name,
      value: region.name
    })),
    ...types.map((t) => ({
      type: 'priceType',
      label: t.priceType || 'Unknown price type',
      value: t.priceType
    })),
    ...sources
      .filter((s) => s.sourceType)
      .map((s) => ({
        type: 'source',
        label: s.sourceType,
        value: s.sourceType
      }))
  ];

  return NextResponse.json({ suggestions: suggestions.slice(0, 12) });
}
