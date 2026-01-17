import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drafts, players, teams } from '@/lib/schema';
import { eq, desc, and } from 'drizzle-orm';
import { broadcast } from '@/lib/events';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  // Find the last pick that wasn't pre-assigned
  const allPlayers = await db
    .select()
    .from(players)
    .where(and(eq(players.draftId, id), eq(players.isDrafted, true)))
    .orderBy(desc(players.pickNumber));

  const lastPick = allPlayers.find((p) => !p.coachKidTeamId);

  if (!lastPick) {
    return NextResponse.json({ error: 'No picks to undo' }, { status: 400 });
  }

  // Undo the pick
  await db
    .update(players)
    .set({
      isDrafted: false,
      draftedByTeamId: null,
      roundDrafted: null,
      pickNumber: null,
    })
    .where(eq(players.id, lastPick.id));

  // Move draft position back
  const draftTeams = await db.select().from(teams).where(eq(teams.draftId, id));
  const totalTeams = draftTeams.length;

  // Calculate previous position from the last pick's round and team
  const lastRound = lastPick.roundDrafted!;
  const lastTeam = draftTeams.find((t) => t.id === lastPick.draftedByTeamId);
  const lastTeamPosition = lastTeam?.draftPosition || 1;

  // Calculate pick position within round based on team position and direction
  const wasForward = lastRound % 2 === 1;
  const lastPickInRound = wasForward ? lastTeamPosition : totalTeams - lastTeamPosition + 1;

  await db
    .update(drafts)
    .set({ currentRound: lastRound, currentPick: lastPickInRound, pickStartedAt: new Date() })
    .where(eq(drafts.id, id));

  const [updatedDraft] = await db.select().from(drafts).where(eq(drafts.id, id));
  const [updatedPlayer] = await db.select().from(players).where(eq(players.id, lastPick.id));

  // Broadcast update
  broadcast(id, 'undo', { draft: updatedDraft, player: updatedPlayer });

  return NextResponse.json({ draft: updatedDraft, player: updatedPlayer });
}
