import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drafts, players } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;

  const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  const allPlayers = await db.select().from(players).where(eq(players.draftId, id));

  return NextResponse.json({ draft, players: allPlayers }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
