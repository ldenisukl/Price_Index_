import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const normalizeCategory = (value: string | null) => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (['service', 'servicii'].includes(normalized)) return 'service';
  if (['fuel', 'carburanți', 'energie'].includes(normalized)) return 'fuel';
  if (['currency', 'valută'].includes(normalized)) return 'currency';
  if (['product', 'produse'].includes(normalized)) return 'product';
  return null;
};

export async function POST(request: Request) {
  const body = await request.json();
  const {
    categoryType,
    itemName,
    regionName,
    submittedPrice,
    priceType,
    sourceNote,
    noteOptional,
    contactOptional
  } = body;

  if (!categoryType || !itemName || !regionName || submittedPrice === undefined || submittedPrice === null || !priceType || !sourceNote) {
    return NextResponse.json(
      {
        error:
          'Categoria, itemul, orașul, prețul, tipul prețului și sursa sunt obligatorii.'
      },
      { status: 400 }
    );
  }

  const normalizedCategory = normalizeCategory(categoryType);
  if (!normalizedCategory) {
    return NextResponse.json({ error: 'Categoria selectată nu este validă.' }, { status: 400 });
  }

  const price = Number(submittedPrice);
  if (Number.isNaN(price) || price <= 0) {
    return NextResponse.json({ error: 'Prețul trebuie să fie un număr valid mai mare decât zero.' }, { status: 400 });
  }

  const submission = await prisma.userSubmission.create({
    data: {
      categoryType: normalizedCategory,
      itemName: itemName.trim(),
      regionId: regionName.trim(),
      submittedPrice: price,
      priceType: priceType.trim(),
      sourceNote: sourceNote.trim(),
      noteOptional: noteOptional?.trim() || null,
      contactOptional: contactOptional?.trim() || null,
      status: 'pending'
    }
  });

  return NextResponse.json({ submission }, { status: 201 });
}
