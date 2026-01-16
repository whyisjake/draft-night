import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { shuffleArray } from '@/lib/draft-logic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  const draftTeams = await db.select().from(teams).where(eq(teams.draftId, id));
  const shuffled = shuffleArray(draftTeams);

  // Update positions
  for (let i = 0; i < shuffled.length; i++) {
    await db.update(teams).set({ draftPosition: i + 1 }).where(eq(teams.id, shuffled[i].id));
  }

  // Return updated teams in order
  const updated = await db.select().from(teams).where(eq(teams.draftId, id)).orderBy(teams.draftPosition);
  return NextResponse.json(updated);
}
