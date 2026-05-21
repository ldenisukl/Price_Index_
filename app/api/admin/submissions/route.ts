import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const submissions = await prisma.userSubmission.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ submissions });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: 'Submission ID and status are required.' }, { status: 400 });
  }

  const existingSubmission = await prisma.userSubmission.findUnique({ where: { id } });
  if (!existingSubmission) {
    return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
  }

  if (status === 'live') {
    const category = await prisma.category.findFirst({ where: { type: existingSubmission.categoryType } });
    if (!category) {
      return NextResponse.json({ error: 'Categoria asociată contribuției nu este disponibilă.' }, { status: 400 });
    }

    let priceItem = await prisma.priceItem.findFirst({
      where: {
        name: existingSubmission.itemName,
        categoryId: category.id
      }
    });

    if (!priceItem) {
      priceItem = await prisma.priceItem.create({
        data: {
          categoryId: category.id,
          name: existingSubmission.itemName,
          description: 'Item creat din contribuția unui utilizator',
          unit: 'MDL',
          isActive: true
        }
      });
    }

    const region = await prisma.region.upsert({
      where: { name: existingSubmission.regionId },
      update: {},
      create: {
        name: existingSubmission.regionId,
        type: 'city',
        isActive: true
      }
    });

    await prisma.priceEntry.create({
      data: {
        priceItemId: priceItem.id,
        regionId: region.id,
        priceMin: existingSubmission.submittedPrice,
        priceAvg: existingSubmission.submittedPrice,
        priceMax: existingSubmission.submittedPrice,
        currency: 'MDL',
        priceType: existingSubmission.priceType,
        sourceType: existingSubmission.sourceNote ?? undefined,
        providerName: existingSubmission.contactOptional ?? undefined,
        status: 'live'
      }
    });
  }

  const submission = await prisma.userSubmission.update({
    where: { id },
    data: { status }
  });

  return NextResponse.json({ submission });
}
