import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drafts, players, teams } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { broadcast } from '@/lib/events';
import { findNextOpenSlot } from '@/lib/draft-logic';
import { track } from '@vercel/analytics/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { playerId, teamId } = await request.json();

  const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
  const draftTeams = await db.select().from(teams).where(eq(teams.draftId, id));

  if (!draft || draft.status !== 'active') {
    return NextResponse.json({ error: 'Draft not active' }, { status: 400 });
  }

  const totalTeams = draftTeams.length;
  const overallPick = (draft.currentRound - 1) * totalTeams + draft.currentPick;

  // Update player
  await db
    .update(players)
    .set({
      isDrafted: true,
      draftedByTeamId: teamId,
      roundDrafted: draft.currentRound,
      pickNumber: overallPick,
    })
    .where(eq(players.id, playerId));

  // Calculate next pick (snake draft)
  // nextPick = pick number within round (1 to totalTeams)
  // Team position is calculated from pick + direction
  // Advance to next pick, skipping pre-filled slots (coach kids or already drafted)
  const allPlayers = await db.select().from(players).where(eq(players.draftId, id));
  const { round: nextRound, pick: nextPick } = findNextOpenSlot(draft.currentRound, draft.currentPick, {
    teams: draftTeams,
    draftedPlayers: allPlayers,
    totalRounds: draft.totalRounds,
  });

  // Update draft position and reset timer
  await db
    .update(drafts)
    .set({ currentRound: nextRound, currentPick: nextPick, pickStartedAt: new Date() })
    .where(eq(drafts.id, id));

  const [updatedDraft] = await db.select().from(drafts).where(eq(drafts.id, id));
  const [updatedPlayer] = await db.select().from(players).where(eq(players.id, playerId));

  // Broadcast update to coach view
  broadcast(id, 'pick', { draft: updatedDraft, player: updatedPlayer });

  // Track analytics
  await track('pick_made', {
    round: draft.currentRound,
    pickNumber: overallPick,
  });

  // Track draft completion
  if (nextRound > draft.totalRounds) {
    await track('draft_completed', {
      division: draft.division,
      year: draft.year,
      totalPicks: overallPick,
      teamCount: totalTeams,
    });
  }

  return NextResponse.json({ draft: updatedDraft, player: updatedPlayer });
}
