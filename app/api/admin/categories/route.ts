import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, type, slug, description, icon } = body;

  if (!name || !type || !slug) {
    return NextResponse.json({ error: 'Name, type and slug are required.' }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: {
      name,
      type,
      slug,
      description: description ?? null,
      icon: icon ?? null
    }
  });

  return NextResponse.json({ category });
}
