import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { players, drafts } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { broadcast } from '@/lib/events';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { player1Id, player2Id } = await request.json();

  if (!player1Id || !player2Id) {
    return NextResponse.json({ error: 'Both player IDs required' }, { status: 400 });
  }

  // Check ownership
  const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  const isOwner = draft.userId === session.user.id;
  const isSuperAdmin = session.user.isSuperAdmin;

  if (!isOwner && !isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get both players
  const [p1] = await db.select().from(players).where(eq(players.id, player1Id));
  const [p2] = await db.select().from(players).where(eq(players.id, player2Id));

  if (!p1 || !p2) {
    return NextResponse.json({ error: 'Players not found' }, { status: 404 });
  }

  if (p1.draftId !== id || p2.draftId !== id) {
    return NextResponse.json({ error: 'Players do not belong to this draft' }, { status: 400 });
  }

  // Swap their draft positions
  const p1Team = p1.draftedByTeamId;
  const p1Round = p1.roundDrafted;
  const p1Pick = p1.pickNumber;

  const p2Team = p2.draftedByTeamId;
  const p2Round = p2.roundDrafted;
  const p2Pick = p2.pickNumber;

  // Update player 1 with player 2's position
  await db.update(players).set({
    draftedByTeamId: p2Team,
    roundDrafted: p2Round,
    pickNumber: p2Pick,
  }).where(eq(players.id, player1Id));

  // Update player 2 with player 1's position
  await db.update(players).set({
    draftedByTeamId: p1Team,
    roundDrafted: p1Round,
    pickNumber: p1Pick,
  }).where(eq(players.id, player2Id));

  // Get updated players
  const [updated1] = await db.select().from(players).where(eq(players.id, player1Id));
  const [updated2] = await db.select().from(players).where(eq(players.id, player2Id));

  // Broadcast updates to coach view
  broadcast(id, 'playerUpdate', { player: updated1 });
  broadcast(id, 'playerUpdate', { player: updated2 });

  return NextResponse.json({ player1: updated1, player2: updated2 });
}
