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
  'Team Name'?: string;
  'Team'?: string;
}

type ImportMode = 'replace' | 'addNew' | 'update';

interface PlayerData {
  fullName: string;
  rating: number | null;
  llAge: number | null;
  previousManager: string | null;
  notes: string | null;
  rankingNumber: number | null;
  isCoachKid: boolean;
  coachKidRound: number | null;
  coachKidTeamId: string | null;
}

interface DiffEntry {
  type: 'add' | 'update' | 'delete' | 'skip';
  player: PlayerData & { id?: string };
  existing?: PlayerData & { id: string };
  changes?: { field: string; from: string | number | boolean | null; to: string | number | boolean | null }[];
}

function parseImportData(text: string, draftId: string, draftTeams: any[], existingPlayers: any[]) {
  // Auto-detect delimiter
  const firstLine = text.split('\n')[0] || '';
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  const { data } = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true, delimiter });

  const totalTeams = draftTeams.length || 14;

  // Create team lookup maps
  const teamByName = new Map<string, typeof draftTeams[0]>();
  const teamByCoach = new Map<string, typeof draftTeams[0]>();
  for (const team of draftTeams) {
    if (team.name) {
      teamByName.set(team.name.toLowerCase(), team);
    }
    if (team.coachNames) {
      teamByCoach.set(team.coachNames.toLowerCase(), team);
      team.coachNames.split(',').forEach((name: string) => {
        teamByCoach.set(name.trim().toLowerCase(), team);
      });
    }
  }

  const existingByName = new Map(existingPlayers.map(p => [p.fullName.toLowerCase(), p]));

  const parsedPlayers: PlayerData[] = [];

  for (const row of data) {
    const fullName = row['Full Name']?.trim();
    if (!fullName) continue;

    const rankingNumber = parseInt(row.Number || '0') || null;
    const isCoachKid = row['Coach Kid']?.toLowerCase() === 'yes' || row['Coach Kid']?.toLowerCase() === 'true';
    const coachKidRound = parseInt(row.Round || '0') || (rankingNumber ? Math.ceil(rankingNumber / totalTeams) : null);

    const teamNameValue = (row['Team Name'] || row['Team'] || '').trim().toLowerCase();
    let coachKidTeamId: string | null = null;
    if (isCoachKid && teamNameValue) {
      const team = teamByName.get(teamNameValue) || teamByCoach.get(teamNameValue);
      if (team) {
        coachKidTeamId = team.id;
      }
    }

    parsedPlayers.push({
      fullName,
      rating: parseFloat(row.Rating || '0') || null,
      llAge: parseInt(row['LL Age'] || '0') || null,
      previousManager: row['Previous Manager']?.trim() || null,
      notes: row.Notes?.trim() || null,
      rankingNumber,
      isCoachKid,
      coachKidRound: isCoachKid ? coachKidRound : null,
      coachKidTeamId,
    });
  }

  return { parsedPlayers, existingByName };
}

function computeDiff(
  parsedPlayers: PlayerData[],
  existingPlayers: any[],
  existingByName: Map<string, any>,
  importMode: ImportMode
): DiffEntry[] {
  const diff: DiffEntry[] = [];
  const importedNames = new Set<string>();

  for (const playerData of parsedPlayers) {
    importedNames.add(playerData.fullName.toLowerCase());
    const existing = existingByName.get(playerData.fullName.toLowerCase());

    if (importMode === 'replace') {
      if (existing) {
        // Check for changes
        const changes = getChanges(existing, playerData);
        if (changes.length > 0) {
          diff.push({ type: 'update', player: playerData, existing, changes });
        } else {
          diff.push({ type: 'skip', player: playerData, existing });
        }
      } else {
        diff.push({ type: 'add', player: playerData });
      }
    } else if (importMode === 'addNew') {
      if (!existing) {
        diff.push({ type: 'add', player: playerData });
      } else {
        diff.push({ type: 'skip', player: playerData, existing });
      }
    } else if (importMode === 'update') {
      if (existing) {
        const changes = getChanges(existing, playerData);
        if (changes.length > 0) {
          diff.push({ type: 'update', player: playerData, existing, changes });
        } else {
          diff.push({ type: 'skip', player: playerData, existing });
        }
      } else {
        diff.push({ type: 'add', player: playerData });
      }
    }
  }

  // In replace mode, existing players not in import will be deleted
  if (importMode === 'replace') {
    for (const existing of existingPlayers) {
      if (!importedNames.has(existing.fullName.toLowerCase())) {
        diff.push({ type: 'delete', player: existing, existing });
      }
    }
  }

  return diff;
}

function getChanges(existing: any, newData: PlayerData) {
  const changes: { field: string; from: any; to: any }[] = [];
  const fields: (keyof PlayerData)[] = ['rating', 'llAge', 'previousManager', 'notes', 'rankingNumber', 'isCoachKid', 'coachKidRound', 'coachKidTeamId'];

  for (const field of fields) {
    const oldVal = existing[field];
    const newVal = newData[field];
    // Compare values (handle null/undefined)
    if (oldVal !== newVal && !(oldVal == null && newVal == null)) {
      changes.push({ field, from: oldVal, to: newVal });
    }
  }

  return changes;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  let text: string;
  let importMode: ImportMode = 'replace';
  let preview = false;
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await request.json();
    text = body.data;
    importMode = body.importMode || 'replace';
    preview = body.preview || false;
    if (!text) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }
  } else {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    importMode = (formData.get('importMode') as ImportMode) || 'replace';
    preview = formData.get('preview') === 'true';
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    text = await file.text();
  }

  const draftTeams = await db.select().from(teams).where(eq(teams.draftId, id));
  const existingPlayers = await db.select().from(players).where(eq(players.draftId, id));

  const { parsedPlayers, existingByName } = parseImportData(text, id, draftTeams, existingPlayers);

  // Compute diff
  const diff = computeDiff(parsedPlayers, existingPlayers, existingByName, importMode);

  // If preview mode, return the diff without making changes
  if (preview) {
    const stats = {
      add: diff.filter(d => d.type === 'add').length,
      update: diff.filter(d => d.type === 'update').length,
      delete: diff.filter(d => d.type === 'delete').length,
      skip: diff.filter(d => d.type === 'skip').length,
    };
    return NextResponse.json({ preview: true, diff, stats });
  }

  // Execute the import
  if (importMode === 'replace') {
    await db.delete(players).where(eq(players.draftId, id));
  }

  const resultPlayers = [];
  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const entry of diff) {
    if (entry.type === 'add') {
      const player = {
        id: uuidv4(),
        draftId: id,
        ...entry.player,
        isDrafted: false,
      };
      await db.insert(players).values(player);
      resultPlayers.push(player);
      added++;
    } else if (entry.type === 'update' && entry.existing) {
      if (importMode === 'replace') {
        // In replace mode, we deleted all and re-insert
        const player = {
          id: uuidv4(),
          draftId: id,
          ...entry.player,
          isDrafted: false,
        };
        await db.insert(players).values(player);
        resultPlayers.push(player);
        added++;
      } else {
        // In update mode, actually update the existing record
        const [updatedPlayer] = await db
          .update(players)
          .set(entry.player)
          .where(eq(players.id, entry.existing.id))
          .returning();
        resultPlayers.push(updatedPlayer);
        updated++;
      }
    } else if (entry.type === 'skip' && entry.existing) {
      if (importMode === 'replace') {
        // Re-insert in replace mode
        const player = {
          id: uuidv4(),
          draftId: id,
          ...entry.player,
          isDrafted: false,
        };
        await db.insert(players).values(player);
        resultPlayers.push(player);
      } else {
        resultPlayers.push(entry.existing);
      }
      skipped++;
    }
    // 'delete' entries are already handled by the delete statement in replace mode
  }

  // For addNew and update modes, include existing players not in import
  if (importMode !== 'replace') {
    const importedNames = new Set(parsedPlayers.map(p => p.fullName.toLowerCase()));
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
