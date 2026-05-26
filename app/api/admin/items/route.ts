import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const items = await prisma.priceItem.findMany({
    include: { category: true },
    orderBy: { updatedAt: 'desc' }
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, categoryId, description, unit, providerName } = body;

  if (!name || !categoryId || !unit) {
    return NextResponse.json({ error: 'Name, category and unit are required.' }, { status: 400 });
  }

  const item = await prisma.priceItem.create({
    data: {
      name,
      categoryId,
      description: description ?? null,
      unit,
      providerName: providerName ?? null
    }
  });

  return NextResponse.json({ item });
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, cascadeDelete = false } = body;

    console.log('[DELETE /api/admin/items] Attempting to delete item:', id, 'cascadeDelete:', cascadeDelete);

    if (!id) {
      console.error('[DELETE] Missing item ID');
      return NextResponse.json({ error: 'Item ID is required.' }, { status: 400 });
    }

    const item = await prisma.priceItem.findUnique({
      where: { id },
      include: { priceEntries: true }
    });

    console.log('[DELETE] Found item:', item?.id, 'with', item?.priceEntries.length, 'price entries');

    if (!item) {
      console.error('[DELETE] Item not found:', id);
      return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
    }

    if (item.priceEntries && item.priceEntries.length > 0 && !cascadeDelete) {
      console.warn('[DELETE] Item has price entries, cannot delete without cascade flag');
      return NextResponse.json(
        {
          error: 'Item-ul are prețuri asociate. Trebuie să ștergi mai întâi prețurile.',
          hasPriceEntries: true,
          priceCount: item.priceEntries.length
        },
        { status: 409 }
      );
    }

    if (cascadeDelete && item.priceEntries && item.priceEntries.length > 0) {
      console.log('[DELETE] Cascade deleting', item.priceEntries.length, 'price entries');
      await prisma.priceEntry.deleteMany({
        where: { priceItemId: id }
      });
    }

    await prisma.priceItem.delete({
      where: { id }
    });

    console.log('[DELETE] Item deleted successfully:', id);
    return NextResponse.json({ message: 'Item deleted successfully.' }, { status: 200 });
  } catch (error) {
    const err = error as Error & { code?: string; meta?: unknown; stack?: string };

    console.error('[DELETE] Error details:', {
      code: err.code,
      message: err.message,
      meta: err.meta,
      stack: err.stack
    });

    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
    }

    return NextResponse.json(
      { error: `Eroare internă: ${err.message}` },
      { status: 500 }
    );
  }
}
