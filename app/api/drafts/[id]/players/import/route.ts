import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { players, teams } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
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
  'Team Name'?: string;
  'Team'?: string; // Alternative column name
}

type ImportMode = 'replace' | 'addNew' | 'update';

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  let text: string;
  let importMode: ImportMode = 'replace';
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    // Handle pasted data
    const body = await request.json();
    text = body.data;
    importMode = body.importMode || 'replace';
    if (!text) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }
  } else {
    // Handle file upload
    const formData = await request.formData();
    const file = formData.get('file') as File;
    importMode = (formData.get('importMode') as ImportMode) || 'replace';
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    text = await file.text();
  }

  // Auto-detect delimiter (tab for Google Sheets paste, comma for CSV)
  const firstLine = text.split('\n')[0] || '';
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  const { data } = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true, delimiter });

  // Get teams to calculate round from ranking and for coach kid assignment
  const draftTeams = await db.select().from(teams).where(eq(teams.draftId, id));
  const totalTeams = draftTeams.length || 14; // Default to 14 if no teams yet

  // Create team lookup maps (by team name and by coach names, case-insensitive)
  const teamByName = new Map<string, typeof draftTeams[0]>();
  const teamByCoach = new Map<string, typeof draftTeams[0]>();
  for (const team of draftTeams) {
    if (team.name) {
      teamByName.set(team.name.toLowerCase(), team);
    }
    if (team.coachNames) {
      teamByCoach.set(team.coachNames.toLowerCase(), team);
      // Also try individual coach names if comma-separated
      team.coachNames.split(',').forEach(name => {
        teamByCoach.set(name.trim().toLowerCase(), team);
      });
    }
  }

  // Get existing players for this draft
  const existingPlayers = await db.select().from(players).where(eq(players.draftId, id));
  const existingByName = new Map(existingPlayers.map(p => [p.fullName.toLowerCase(), p]));

  // Only delete all if replacing
  if (importMode === 'replace') {
    await db.delete(players).where(eq(players.draftId, id));
  }

  const resultPlayers = [];
  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of data) {
    const fullName = row['Full Name']?.trim();
    if (!fullName) continue;

    const rankingNumber = parseInt(row.Number || '0') || null;
    const isCoachKid = row['Coach Kid']?.toLowerCase() === 'yes' || row['Coach Kid']?.toLowerCase() === 'true';
    const coachKidRound = parseInt(row.Round || '0') || (rankingNumber ? Math.ceil(rankingNumber / totalTeams) : null);

    // Look up team for coach kid assignment
    const teamNameValue = (row['Team Name'] || row['Team'] || '').trim().toLowerCase();
    let coachKidTeamId: string | null = null;
    if (isCoachKid && teamNameValue) {
      // Try to find team by name first, then by coach name
      const team = teamByName.get(teamNameValue) || teamByCoach.get(teamNameValue);
      if (team) {
        coachKidTeamId = team.id;
      }
    }

    const playerData = {
      fullName,
      rating: parseFloat(row.Rating || '0') || null,
      llAge: parseInt(row['LL Age'] || '0') || null,
      previousManager: row['Previous Manager']?.trim() || null,
      notes: row.Notes?.trim() || null,
      rankingNumber,
      isCoachKid,
      coachKidRound: isCoachKid ? coachKidRound : null,
      coachKidTeamId,
    };

    const existing = existingByName.get(fullName.toLowerCase());

    if (importMode === 'replace') {
      // Always insert (we already deleted all)
      const player = {
        id: uuidv4(),
        draftId: id,
        ...playerData,
        isDrafted: false,
      };
      await db.insert(players).values(player);
      resultPlayers.push(player);
      added++;
    } else if (importMode === 'addNew') {
      // Only add if doesn't exist
      if (!existing) {
        const player = {
          id: uuidv4(),
          draftId: id,
          ...playerData,
          isDrafted: false,
        };
        await db.insert(players).values(player);
        resultPlayers.push(player);
        added++;
      } else {
        resultPlayers.push(existing);
        skipped++;
      }
    } else if (importMode === 'update') {
      // Update if exists, add if new
      if (existing) {
        // Don't update drafted status or team assignment
        const [updatedPlayer] = await db
          .update(players)
          .set(playerData)
          .where(eq(players.id, existing.id))
          .returning();
        resultPlayers.push(updatedPlayer);
        updated++;
      } else {
        const player = {
          id: uuidv4(),
          draftId: id,
          ...playerData,
          isDrafted: false,
        };
        await db.insert(players).values(player);
        resultPlayers.push(player);
        added++;
      }
    }
  }

  // For addNew and update modes, include existing players not in import
  if (importMode !== 'replace') {
    const importedNames = new Set(data.map(r => r['Full Name']?.trim().toLowerCase()).filter(Boolean));
    for (const existing of existingPlayers) {
      if (!importedNames.has(existing.fullName.toLowerCase())) {
        resultPlayers.push(existing);
      }
    }
  }

  return NextResponse.json({
    players: resultPlayers,
    stats: { added, updated, skipped },
  });
}
