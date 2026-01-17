import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drafts, teams, players } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Check ownership
  const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }
  if (!session.user.isSuperAdmin && draft.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { division, year, totalRounds, status } = body;

  const updates: Partial<{ division: string; year: number; totalRounds: number; status: string }> = {};

  if (division !== undefined) {
    updates.division = division;
  }
  if (year !== undefined) {
    updates.year = parseInt(year, 10);
  }
  if (totalRounds !== undefined) {
    updates.totalRounds = parseInt(totalRounds, 10);
  }
  if (status !== undefined) {
    // Only allow valid status values
    if (['setup', 'active', 'completed'].includes(status)) {
      updates.status = status;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const [updated] = await db.update(drafts).set(updates).where(eq(drafts.id, id)).returning();

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Check ownership
  const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }
  if (!session.user.isSuperAdmin && draft.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Delete related records first (players, then teams, then draft)
  await db.delete(players).where(eq(players.draftId, id));
  await db.delete(teams).where(eq(teams.draftId, id));
  await db.delete(drafts).where(eq(drafts.id, id));

  return NextResponse.json({ success: true });
}
