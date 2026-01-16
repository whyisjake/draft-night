import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drafts } from '@/lib/schema';
import { v4 as uuidv4 } from 'uuid';

function generateAccessKey(): string {
  return Math.random().toString(36).substring(2, 10);
}

export async function POST(request: Request) {
  const { division, year, totalRounds } = await request.json();

  const id = uuidv4();
  const accessKey = generateAccessKey();

  await db.insert(drafts).values({
    id,
    division,
    year,
    totalRounds: totalRounds || 12,
    accessKey,
    status: 'setup',
    currentRound: 1,
    currentPick: 1,
  });

  return NextResponse.json({ id, accessKey });
}

export async function GET() {
  const allDrafts = await db.select().from(drafts);
  return NextResponse.json(allDrafts);
}
