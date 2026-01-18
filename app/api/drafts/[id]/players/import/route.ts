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
  'Draft Scores'?: string;
  'LL Age'?: string;
  'Little League Age (Baseball)'?: string;
  'Previous Manager'?: string;
  'Previous Coach'?: string;
  'What team did you play for last year?'?: string;
  Notes?: string;
  'Team Name'?: string;
  'Team'?: string;
  'Will the player be on a swim team this year?'?: string;
  'Will this player be on another sports team or participating in another activity during the baseball/softball season?'?: string;
  'Will the player be available for 80% of baseball / softball?'?: string;
  'Teammate Request'?: string;
  'Special Player Request'?: string;
  'Pitch Count'?: string;
}

type ImportMode = 'replace' | 'addNew' | 'update';

interface PlayerData {
  fullName: string;
  rating: number | null;
  llAge: number | null;
  previousManager: string | null;
  previousTeam: string | null;
  notes: string | null;
  rankingNumber: number | null;
  isCoachKid: boolean;
  coachKidRound: number | null;
  coachKidTeamId: string | null;
  swimTeam: boolean;
  otherSports: boolean;
  availability80: boolean;
  teammateRequest: string | null;
  specialRequest: string | null;
  pitchCount: number | null;
}

interface DiffEntry {
  type: 'add' | 'update' | 'delete' | 'skip';
  player: PlayerData & { id?: string };
  existing?: PlayerData & { id: string };
  changes?: { field: string; from: string | number | boolean | null; to: string | number | boolean | null }[];
}

interface ParseResult {
  parsedPlayers: PlayerData[];
  existingByName: Map<string, any>;
  presentFields: Set<string>;
}

function parseImportData(text: string, draftId: string, draftTeams: any[], existingPlayers: any[]): ParseResult {
  // Auto-detect delimiter
  const firstLine = text.split('\n')[0] || '';
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  const { data, meta } = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true, delimiter });

  // Track which fields are present in the CSV headers
  const headers = new Set((meta.fields || []).map(h => h.toLowerCase().trim()));
  const presentFields = new Set<string>();


  // Map CSV headers to our field names
  if (headers.has('rating') || headers.has('draft scores')) presentFields.add('rating');
  if (headers.has('ll age') || headers.has('little league age (baseball)')) presentFields.add('llAge');
  if (headers.has('previous manager') || headers.has('previous coach')) presentFields.add('previousManager');
  if (headers.has('what team did you play for last year?')) presentFields.add('previousTeam');
  if (headers.has('notes')) presentFields.add('notes');
  if (headers.has('number')) presentFields.add('rankingNumber');
  if (headers.has('coach kid')) presentFields.add('isCoachKid');
  if (headers.has('round')) presentFields.add('coachKidRound');
  // Only add coachKidTeamId if explicitly "Team Name" or "Team" column exists (exact match)
  for (const h of headers) {
    if (h === 'team name' || h === 'team') {
      presentFields.add('coachKidTeamId');
      break;
    }
  }
  if (headers.has('will the player be on a swim team this year?')) presentFields.add('swimTeam');
  if (headers.has('will this player be on another sports team or participating in another activity during the baseball/softball season?')) presentFields.add('otherSports');
  if (headers.has('will the player be available for 80% of baseball / softball?')) presentFields.add('availability80');
  if (headers.has('teammate request')) presentFields.add('teammateRequest');
  if (headers.has('special player request')) presentFields.add('specialRequest');
  if (headers.has('pitch count')) presentFields.add('pitchCount');

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
    if (teamNameValue) {
      const team = teamByName.get(teamNameValue) || teamByCoach.get(teamNameValue);
      if (team) {
        coachKidTeamId = team.id;
      }
    }

    // Parse rating from either 'Rating' or 'Draft Scores'
    const ratingStr = row.Rating || row['Draft Scores'] || '0';
    const rating = parseFloat(ratingStr) || null;

    // Parse age from either 'LL Age' or 'Little League Age (Baseball)'
    const ageStr = row['LL Age'] || row['Little League Age (Baseball)'] || '0';
    const llAge = parseInt(ageStr) || null;

    // Parse previous manager/coach
    const previousManager = row['Previous Manager']?.trim() || row['Previous Coach']?.trim() || null;

    // Parse previous team
    const previousTeam = row['What team did you play for last year?']?.trim() || null;

    // Parse boolean fields
    const swimTeamStr = row['Will the player be on a swim team this year?']?.toLowerCase() || '';
    const swimTeam = swimTeamStr === 'yes' || swimTeamStr === 'true';

    const otherSportsStr = row['Will this player be on another sports team or participating in another activity during the baseball/softball season?']?.toLowerCase() || '';
    const otherSports = otherSportsStr === 'yes' || otherSportsStr === 'true';

    const availability80Str = row['Will the player be available for 80% of baseball / softball?']?.toLowerCase() || '';
    const availability80 = availability80Str === 'yes' || availability80Str === 'true' || availability80Str === '';

    // Parse text fields
    const teammateRequest = row['Teammate Request']?.trim() || null;
    const specialRequest = row['Special Player Request']?.trim() || row.Notes?.trim() || null;

    // Parse pitch count
    const pitchCount = parseInt(row['Pitch Count'] || '0') || null;

    parsedPlayers.push({
      fullName,
      rating,
      llAge,
      previousManager,
      previousTeam,
      notes: row.Notes?.trim() || null,
      rankingNumber,
      isCoachKid,
      coachKidRound,
      coachKidTeamId,
      swimTeam,
      otherSports,
      availability80,
      teammateRequest,
      specialRequest,
      pitchCount,
    });
  }

  return { parsedPlayers, existingByName, presentFields };
}

function computeDiff(
  parsedPlayers: PlayerData[],
  existingPlayers: any[],
  existingByName: Map<string, any>,
  importMode: ImportMode,
  presentFields: Set<string>
): DiffEntry[] {
  const diff: DiffEntry[] = [];
  const importedNames = new Set<string>();

  for (const playerData of parsedPlayers) {
    importedNames.add(playerData.fullName.toLowerCase());
    const existing = existingByName.get(playerData.fullName.toLowerCase());

    if (importMode === 'replace') {
      if (existing) {
        // Check for changes (compare all fields in replace mode)
        const changes = getChanges(existing, playerData, null);
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
        // Only compare fields that are present in the import
        const changes = getChanges(existing, playerData, presentFields);
        if (changes.length > 0) {
          // Merge: start with existing data, overlay only present fields
          const mergedPlayer = { ...playerData };
          for (const field of Object.keys(existing) as (keyof PlayerData)[]) {
            if (!presentFields.has(field) && field !== 'fullName') {
              (mergedPlayer as any)[field] = existing[field];
            }
          }
          diff.push({ type: 'update', player: mergedPlayer, existing, changes });
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

function getChanges(existing: any, newData: PlayerData, presentFields: Set<string> | null) {
  const changes: { field: string; from: any; to: any }[] = [];
  const allFields: (keyof PlayerData)[] = [
    'rating', 'llAge', 'previousManager', 'previousTeam', 'notes', 'rankingNumber',
    'isCoachKid', 'coachKidRound', 'coachKidTeamId',
    'swimTeam', 'otherSports', 'availability80', 'teammateRequest', 'specialRequest', 'pitchCount'
  ];

  // If presentFields is provided, only compare those fields
  const fieldsToCompare = presentFields
    ? allFields.filter(f => presentFields.has(f))
    : allFields;

  for (const field of fieldsToCompare) {
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

  const { parsedPlayers, existingByName, presentFields } = parseImportData(text, id, draftTeams, existingPlayers);

  // Compute diff
  const diff = computeDiff(parsedPlayers, existingPlayers, existingByName, importMode, presentFields);

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
