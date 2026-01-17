import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drafts, players } from '@/lib/schema';
import { eq, and, isNull, isNotNull } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { keepCoachKids } = await request.json().catch(() => ({ keepCoachKids: false }));

  // Reset all non-pre-assigned players to undrafted
  await db
    .update(players)
    .set({
      isDrafted: false,
      draftedByTeamId: null,
      roundDrafted: null,
      pickNumber: null,
    })
    .where(and(eq(players.draftId, id), isNull(players.coachKidTeamId)));

  // Reset draft to round 1, pick 1, status back to setup
  await db
    .update(drafts)
    .set({
      currentRound: 1,
      currentPick: 1,
      status: 'setup',
      pickStartedAt: null,
    })
    .where(eq(drafts.id, id));

  // Reset pre-assigned players unless keeping them
  // (they'll be re-placed on start based on their coachKidTeamId/coachKidRound)
  if (!keepCoachKids) {
    // Clear pre-assigned team assignments completely
    await db
      .update(players)
      .set({
        isDrafted: false,
        draftedByTeamId: null,
        roundDrafted: null,
        pickNumber: null,
        coachKidTeamId: null,
        coachKidRound: null,
      })
      .where(and(eq(players.draftId, id), isNotNull(players.coachKidTeamId)));
  } else {
    // Just reset their drafted status, keep the team assignment
    await db
      .update(players)
      .set({
        isDrafted: false,
        draftedByTeamId: null,
        roundDrafted: null,
        pickNumber: null,
      })
      .where(and(eq(players.draftId, id), isNotNull(players.coachKidTeamId)));
  }

  const [updatedDraft] = await db.select().from(drafts).where(eq(drafts.id, id));

  return NextResponse.json({ draft: updatedDraft, message: 'Draft has been reset' });
}
