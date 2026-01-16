import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { players, teams } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface CsvRow {
  Drafted?: string;
  Number?: string;
  Round?: string;
  'Coach Kid'?: string;
  'Full Name'?: string;
  Rating?: string;
  'LL Age'?: string;
  'Previous Manager'?: string;
  Notes?: string;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const text = await file.text();
  const { data } = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true });

  // Get teams to calculate round from ranking
  const draftTeams = await db.select().from(teams).where(eq(teams.draftId, id));
  const totalTeams = draftTeams.length || 14; // Default to 14 if no teams yet

  // Delete existing players for this draft
  await db.delete(players).where(eq(players.draftId, id));

  const newPlayers = [];

  for (const row of data) {
    const fullName = row['Full Name']?.trim();
    if (!fullName) continue;

    const rankingNumber = parseInt(row.Number || '0') || null;
    const isCoachKid = row['Coach Kid']?.toLowerCase() === 'yes' || row['Coach Kid']?.toLowerCase() === 'true';
    const coachKidRound = parseInt(row.Round || '0') || (rankingNumber ? Math.ceil(rankingNumber / totalTeams) : null);

    const player = {
      id: uuidv4(),
      draftId: id,
      fullName,
      rating: parseFloat(row.Rating || '0') || null,
      llAge: parseInt(row['LL Age'] || '0') || null,
      previousManager: row['Previous Manager']?.trim() || null,
      notes: row.Notes?.trim() || null,
      rankingNumber,
      isCoachKid,
      coachKidRound: isCoachKid ? coachKidRound : null,
      isDrafted: false,
    };

    await db.insert(players).values(player);
    newPlayers.push(player);
  }

  return NextResponse.json(newPlayers);
}
