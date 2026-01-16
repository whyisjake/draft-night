import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { players } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string; playerId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id, playerId } = await params;
  const updates = await request.json();

  // Get current player state
  const [currentPlayer] = await db.select().from(players).where(eq(players.id, playerId));

  // If changing coach kid team assignment, also update drafted team if already drafted
  if (updates.coachKidTeamId !== undefined && currentPlayer?.isCoachKid) {
    if (updates.coachKidTeamId) {
      // Assigning to a team - mark as drafted in their round
      updates.isDrafted = true;
      updates.draftedByTeamId = updates.coachKidTeamId;
      updates.roundDrafted = currentPlayer.coachKidRound;
    } else {
      // Unassigning - remove from draft board
      updates.isDrafted = false;
      updates.draftedByTeamId = null;
      updates.roundDrafted = null;
      updates.pickNumber = null;
    }
  }

  await db.update(players).set(updates).where(and(eq(players.id, playerId), eq(players.draftId, id)));

  const [updated] = await db.select().from(players).where(eq(players.id, playerId));
  return NextResponse.json(updated);
}
