import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const draftTeams = await db.select().from(teams).where(eq(teams.draftId, id)).orderBy(teams.draftPosition);
  return NextResponse.json(draftTeams);
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { coachNames } = await request.json();

  // Get current max position
  const existingTeams = await db.select().from(teams).where(eq(teams.draftId, id));
  const maxPosition = existingTeams.reduce((max, t) => Math.max(max, t.draftPosition), 0);

  const team = {
    id: uuidv4(),
    draftId: id,
    coachNames,
    draftPosition: maxPosition + 1,
  };

  await db.insert(teams).values(team);
  return NextResponse.json(team);
}
