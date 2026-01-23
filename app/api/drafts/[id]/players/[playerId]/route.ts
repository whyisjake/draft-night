import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { players, drafts, collaborators } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { broadcast } from '@/lib/events';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string; playerId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, playerId } = await params;

  // Check if user is owner or collaborator
  const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  const isOwner = draft.userId === session.user.id;
  const isSuperAdmin = session.user.isSuperAdmin;

  if (!isOwner && !isSuperAdmin) {
    // Check if collaborator
    const [collab] = await db
      .select()
      .from(collaborators)
      .where(and(eq(collaborators.draftId, id), eq(collaborators.userId, session.user.id)));

    if (!collab) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const updates = await request.json();

  // Note: Pre-assigned players (coachKidTeamId set) will be auto-drafted when the draft starts
  // During setup, we just store the team assignment

  await db.update(players).set(updates).where(and(eq(players.id, playerId), eq(players.draftId, id)));

  const [updated] = await db.select().from(players).where(eq(players.id, playerId));

  // Broadcast player update to coach view
  broadcast(id, 'playerUpdate', { player: updated });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, playerId } = await params;

  // Check if user is owner or super admin (no collaborators for delete)
  const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  const isOwner = draft.userId === session.user.id;
  const isSuperAdmin = session.user.isSuperAdmin;

  if (!isOwner && !isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Delete the player
  await db.delete(players).where(and(eq(players.id, playerId), eq(players.draftId, id)));

  // Broadcast player deletion to coach view
  broadcast(id, 'playerDeleted', { playerId });

  return NextResponse.json({ success: true });
}
