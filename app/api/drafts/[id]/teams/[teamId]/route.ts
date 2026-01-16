import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string; teamId: string }>;
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id, teamId } = await params;

  await db.delete(teams).where(and(eq(teams.id, teamId), eq(teams.draftId, id)));

  // Renumber remaining teams
  const remainingTeams = await db.select().from(teams).where(eq(teams.draftId, id)).orderBy(teams.draftPosition);

  for (let i = 0; i < remainingTeams.length; i++) {
    await db.update(teams).set({ draftPosition: i + 1 }).where(eq(teams.id, remainingTeams[i].id));
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id, teamId } = await params;
  const updates = await request.json();

  await db.update(teams).set(updates).where(and(eq(teams.id, teamId), eq(teams.draftId, id)));

  const [updated] = await db.select().from(teams).where(eq(teams.id, teamId));
  return NextResponse.json(updated);
}
