import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { players } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { broadcast } from '@/lib/events';

interface RouteParams {
  params: Promise<{ id: string; playerId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id, playerId } = await params;
  const updates = await request.json();

  // Note: Pre-assigned players (coachKidTeamId set) will be auto-drafted when the draft starts
  // During setup, we just store the team assignment

  await db.update(players).set(updates).where(and(eq(players.id, playerId), eq(players.draftId, id)));

  const [updated] = await db.select().from(players).where(eq(players.id, playerId));

  // Broadcast player update to coach view
  broadcast(id, 'playerUpdate', { player: updated });

  return NextResponse.json(updated);
}
