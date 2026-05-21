import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { runAll } from '@/scripts/scraper-runner';

const LOCK_FILE = path.resolve(process.cwd(), 'scripts', 'scrape.lock');
const STATUS_FILE = path.resolve(process.cwd(), 'scripts', 'last-scrape.json');

export async function GET() {
  try {
    const data = await fs.readFile(STATUS_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (err) {
    return NextResponse.json({ message: 'No status available' }, { status: 404 });
  }
}

export async function POST() {
  // Prevent concurrent runs
  try {
    await fs.access(LOCK_FILE);
    return NextResponse.json({ message: 'Scrape already running' }, { status: 409 });
  } catch (e) {
    // lock does not exist
  }

  // run the scraper
  try {
    const res = await runAll();
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
