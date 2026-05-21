import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeRefs = url.searchParams.get('refs') === 'true';

  const entries = await prisma.priceEntry.findMany({
    include: {
      priceItem: { include: { category: true } },
      region: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  if (includeRefs) {
    const [items, regions] = await Promise.all([
      prisma.priceItem.findMany({ include: { category: true }, orderBy: { name: 'asc' } }),
      prisma.region.findMany({ orderBy: { name: 'asc' } })
    ]);

    return NextResponse.json({ entries, items, regions });
  }

  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    priceItemId,
    regionId,
    priceMin,
    priceAvg,
    priceMax,
    currency,
    priceType,
    qualificationLevel,
    sourceType,
    sourceConfidence,
    providerName,
    status
  } = body;

  if (!priceItemId || !regionId || !currency || !priceType) {
    return NextResponse.json({ error: 'Item, region, currency and price type are required.' }, { status: 400 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);

  const existingEntry = await prisma.priceEntry.findFirst({
    where: {
      priceItemId,
      regionId,
      providerName: providerName ?? null,
      priceType,
      dateCollected: {
        gte: todayStart,
        lt: tomorrowStart
      }
    }
  });

  const numericMin = priceMin ? Number(priceMin) : null;
  const numericAvg = priceAvg ? Number(priceAvg) : null;
  const numericMax = priceMax ? Number(priceMax) : null;

  if (existingEntry) {
    const updatedMin = existingEntry.priceMin != null && numericMin != null ? Math.min(existingEntry.priceMin, numericMin) : numericMin ?? existingEntry.priceMin;
    const updatedMax = existingEntry.priceMax != null && numericMax != null ? Math.max(existingEntry.priceMax, numericMax) : numericMax ?? existingEntry.priceMax;
    const updatedAvg = numericAvg ?? existingEntry.priceAvg ?? numericMin ?? numericMax;

    const entry = await prisma.priceEntry.update({
      where: { id: existingEntry.id },
      data: {
        priceMin: updatedMin,
        priceAvg: updatedAvg,
        priceMax: updatedMax,
        currency,
        priceType,
        qualificationLevel: qualificationLevel ?? undefined,
        sourceType: sourceType ?? undefined,
        sourceConfidence: sourceConfidence !== undefined ? (sourceConfidence !== null ? Number(sourceConfidence) : null) : undefined,
        providerName: providerName ?? undefined,
        status: status ?? existingEntry.status
      },
      include: {
        priceItem: { include: { category: true } },
        region: true
      }
    });

    return NextResponse.json({ entry });
  }

  const entry = await prisma.priceEntry.create({
    data: {
      priceItemId,
      regionId,
      priceMin: numericMin,
      priceAvg: numericAvg,
      priceMax: numericMax,
      currency,
      priceType,
      qualificationLevel: qualificationLevel ?? null,
      sourceType: sourceType ?? null,
      sourceConfidence: sourceConfidence ? Number(sourceConfidence) : null,
      providerName: providerName ?? null,
      status: status ?? 'pending'
    },
    include: {
      priceItem: { include: { category: true } },
      region: true
    }
  });

  return NextResponse.json({ entry });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const {
    id,
    priceMin,
    priceAvg,
    priceMax,
    currency,
    priceType,
    qualificationLevel,
    sourceType,
    sourceConfidence,
    providerName,
    status
  } = body;

  if (!id) {
    return NextResponse.json({ error: 'Price entry ID is required.' }, { status: 400 });
  }

  const entry = await prisma.priceEntry.update({
    where: { id },
    data: {
      priceMin: priceMin !== undefined ? (priceMin !== null ? Number(priceMin) : null) : undefined,
      priceAvg: priceAvg !== undefined ? (priceAvg !== null ? Number(priceAvg) : null) : undefined,
      priceMax: priceMax !== undefined ? (priceMax !== null ? Number(priceMax) : null) : undefined,
      currency: currency ?? undefined,
      priceType: priceType ?? undefined,
      qualificationLevel: qualificationLevel ?? undefined,
      sourceType: sourceType ?? undefined,
      sourceConfidence: sourceConfidence !== undefined ? (sourceConfidence !== null ? Number(sourceConfidence) : null) : undefined,
      providerName: providerName ?? undefined,
      status: status ?? undefined
    },
    include: {
      priceItem: { include: { category: true } },
      region: true
    }
  });

  return NextResponse.json({ entry });
}
