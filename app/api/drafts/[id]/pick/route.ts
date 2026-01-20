import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drafts, players, teams } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { broadcast } from '@/lib/events';
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
  let nextRound = draft.currentRound;
  let nextPick = draft.currentPick;

  // Get all players once for coach kid checking
  const allPlayers = await db.select().from(players).where(eq(players.draftId, id));

  // Helper to get team position from pick number and round
  const getTeamPosition = (round: number, pick: number) => {
    const isForward = round % 2 === 1;
    return isForward ? pick : totalTeams - pick + 1;
  };

  // Advance to next pick, skipping pre-filled slots (coach kids or already drafted)
  do {
    // Move to next pick
    if (nextPick < totalTeams) {
      nextPick++;
    } else {
      // End of round, move to next round
      nextRound++;
      nextPick = 1;
    }

    // Check if this slot is already filled
    if (nextRound <= draft.totalRounds) {
      const nextTeamPosition = getTeamPosition(nextRound, nextPick);
      const nextTeam = draftTeams.find((t) => t.draftPosition === nextTeamPosition);

      const preFilledSlot = allPlayers.find(
        (p) =>
          p.isDrafted &&
          p.draftedByTeamId === nextTeam?.id &&
          p.roundDrafted === nextRound
      );

      if (!preFilledSlot) break; // Found an open slot
    }
  } while (nextRound <= draft.totalRounds);

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
