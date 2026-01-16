import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams } from '@/lib/schema';
import { eq } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { teamIds } = await request.json();

  if (!Array.isArray(teamIds)) {
    return NextResponse.json({ error: 'teamIds must be an array' }, { status: 400 });
  }

  // Update each team's draft position based on the new order
  const updates = teamIds.map((teamId: string, index: number) =>
    db
      .update(teams)
      .set({ draftPosition: index + 1 })
      .where(eq(teams.id, teamId))
  );

  await Promise.all(updates);

  // Return the updated teams in new order
  const updatedTeams = await db
    .select()
    .from(teams)
    .where(eq(teams.draftId, id))
    .orderBy(teams.draftPosition);

  return NextResponse.json(updatedTeams);
}
