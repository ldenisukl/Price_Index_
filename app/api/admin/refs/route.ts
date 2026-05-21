import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [categories, items, regions] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.priceItem.findMany({ include: { category: true }, orderBy: { name: 'asc' } }),
    prisma.region.findMany({ orderBy: { name: 'asc' } })
  ]);

  return NextResponse.json({ categories, items, regions });
}
