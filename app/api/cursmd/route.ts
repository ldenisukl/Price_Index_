import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const STATUS_FILE = path.resolve(process.cwd(), 'scripts', 'last-scrape.json');

type CursMdStatus = {
  lastRun?: string;
  success?: boolean;
  results?: Array<{ provider?: string; [key: string]: unknown }>;
};

export async function GET() {
  try {
    const raw = await fs.readFile(STATUS_FILE, 'utf-8');
    const status = JSON.parse(raw) as CursMdStatus;
    const curs = (status.results ?? []).find((result) => result.provider === 'CursMD') ?? null;
    return NextResponse.json({ lastRun: status.lastRun, success: status.success, curs });
  } catch {
    return NextResponse.json({ error: 'cached data not available' }, { status: 503 });
  }
}
