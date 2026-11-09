import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drafts, players, teams } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { track } from '@vercel/analytics/server';
import { findNextOpenSlot } from '@/lib/draft-logic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  // Get draft settings
  const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  const draftTeams = await db.select().from(teams).where(eq(teams.draftId, id));
  const allPlayers = await db.select().from(players).where(eq(players.draftId, id));

  // Track which rounds are filled for each team
  const teamRounds = new Map<string, Set<number>>();
  for (const team of draftTeams) {
    teamRounds.set(team.id, new Set());
  }

  // Get pre-assigned players sorted by their preferred round
  const preAssigned = allPlayers
    .filter((p) => p.coachKidTeamId)
    .sort((a, b) => (a.coachKidRound || 999) - (b.coachKidRound || 999));

  let pickNumber = 0;

  // Place each pre-assigned player in the first available round for their team
  for (const player of preAssigned) {
    const teamId = player.coachKidTeamId!;
    const filledRounds = teamRounds.get(teamId) || new Set();

    // Start from their preferred round and find the first available slot
    let targetRound = player.coachKidRound || 1;
    while (filledRounds.has(targetRound) && targetRound <= draft.totalRounds) {
      targetRound++;
    }

    // If we've exceeded total rounds, we can't place this player
    if (targetRound > draft.totalRounds) {
      console.warn(`Cannot place ${player.fullName} - no available rounds for team ${teamId}`);
      continue;
    }

    // Mark this round as filled for the team
    filledRounds.add(targetRound);

    pickNumber++;
    await db
      .update(players)
      .set({
        isDrafted: true,
        draftedByTeamId: teamId,
        roundDrafted: targetRound,
        pickNumber,
      })
      .where(eq(players.id, player.id));
  }

  // The opening slot(s) may belong to teams whose coach kid was just placed
  // there, so start at the first open slot rather than always round 1, pick 1.
  const placedPlayers = await db.select().from(players).where(eq(players.draftId, id));
  const firstOpen = findNextOpenSlot(1, 1, {
    teams: draftTeams,
    draftedPlayers: placedPlayers,
    totalRounds: draft.totalRounds,
    inclusive: true,
  });

  // Update draft status and start timer
  await db
    .update(drafts)
    .set({
      status: 'active',
      currentRound: firstOpen.round,
      currentPick: firstOpen.pick,
      pickStartedAt: new Date(),
    })
    .where(eq(drafts.id, id));

  await track('draft_started', {
    division: draft.division,
    year: draft.year,
    teamCount: draftTeams.length,
    playerCount: allPlayers.length,
    preAssignedCount: preAssigned.length,
  });

  return NextResponse.json({ success: true });
}
