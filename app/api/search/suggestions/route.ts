import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.toLowerCase().trim();

  if (!query || query.length < 1) {
    return NextResponse.json({ suggestions: [] });
  }

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
        return { ...item, category };
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
    }),
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
    }),
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
    })
  ]).catch(() => [[], [], [], []]);

  const suggestions = [
    ...items.map((item: any) => ({
      type: 'item',
      label: item.name,
      category: item.category?.type || 'Unknown',
      value: item.name
    })),
    ...regions.map((region: any) => ({
      type: 'region',
      label: region.name,
      value: region.name
    })),
    ...types.map((t: any) => ({
      type: 'priceType',
      label: t.priceType || 'Unknown price type',
      value: t.priceType
    })),
    ...sources
      .filter((s: any) => s.sourceType)
      .map((s: any) => ({
        type: 'source',
        label: s.sourceType,
        value: s.sourceType
      }))
  ];

  return NextResponse.json({ suggestions: suggestions.slice(0, 12) });
}
