import { NextResponse } from 'next/server';
import { aiExpectations } from '@/lib/data';

export async function POST(request: Request) {
  const body = await request.json();
  const query = (body.query || '').toString().trim().toLowerCase();

  if (!query) {
    return NextResponse.json({ answer: 'Te rog scrie o întrebare.' }, { status: 400 });
  }

  const matched = aiExpectations.find((item) => query.includes(item.question.toLowerCase()));
  if (matched) {
    return NextResponse.json({ answer: matched.answer });
  }

  return NextResponse.json({ answer: 'Nu avem suficiente date pentru această categorie. Poți verifica o categorie similară sau media generală.' });
}