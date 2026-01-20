import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drafts } from '@/lib/schema';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { track } from '@vercel/analytics/server';

function generateAccessKey(): string {
  return Math.random().toString(36).substring(2, 10);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { league, division, year, totalRounds } = await request.json();

  const id = uuidv4();
  const accessKey = generateAccessKey();

  await db.insert(drafts).values({
    id,
    userId: session.user.id,
    league: league || null,
    division,
    year,
    totalRounds: totalRounds || 12,
    accessKey,
    status: 'setup',
    currentRound: 1,
    currentPick: 1,
  });

  await track('draft_created', {
    division,
    year,
    totalRounds: totalRounds || 12,
  });

  return NextResponse.json({ id, accessKey });
}

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return only user's drafts (unless super admin)
  const userDrafts = session.user.isSuperAdmin
    ? await db.select().from(drafts)
    : await db.select().from(drafts).where(eq(drafts.userId, session.user.id));

  return NextResponse.json(userDrafts);
}
