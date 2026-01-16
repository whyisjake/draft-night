import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drafts, players, teams } from '@/lib/schema';
import { eq } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  // Pre-place coach kids
  const draftTeams = await db.select().from(teams).where(eq(teams.draftId, id));
  const coachKids = await db.select().from(players).where(eq(players.draftId, id));

  let pickNumber = 0;
  // Filter for coach kids with team assignments
  for (const player of coachKids.filter((p) => p.isCoachKid && p.coachKidTeamId)) {
    pickNumber++;
    await db
      .update(players)
      .set({
        isDrafted: true,
        draftedByTeamId: player.coachKidTeamId,
        roundDrafted: player.coachKidRound,
        pickNumber,
      })
      .where(eq(players.id, player.id));
  }

  // Update draft status
  await db.update(drafts).set({ status: 'active' }).where(eq(drafts.id, id));

  return NextResponse.json({ success: true });
}
