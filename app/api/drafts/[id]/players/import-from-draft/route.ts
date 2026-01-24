import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { players, drafts } from '@/lib/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: targetDraftId } = await params;
  const { sourceDraftId, playerIds } = await request.json();

  if (!sourceDraftId) {
    return NextResponse.json({ error: 'Source draft ID required' }, { status: 400 });
  }

  // Verify target draft ownership
  const [targetDraft] = await db.select().from(drafts).where(eq(drafts.id, targetDraftId));
  if (!targetDraft) {
    return NextResponse.json({ error: 'Target draft not found' }, { status: 404 });
  }

  const isTargetOwner = targetDraft.userId === session.user.id;
  const isSuperAdmin = session.user.isSuperAdmin;

  if (!isTargetOwner && !isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Verify source draft exists and user has access
  const [sourceDraft] = await db.select().from(drafts).where(eq(drafts.id, sourceDraftId));
  if (!sourceDraft) {
    return NextResponse.json({ error: 'Source draft not found' }, { status: 404 });
  }

  const isSourceOwner = sourceDraft.userId === session.user.id;
  if (!isSourceOwner && !isSuperAdmin) {
    return NextResponse.json({ error: 'No access to source draft' }, { status: 403 });
  }

  // Get undrafted players from source draft
  let sourcePlayers = await db
    .select()
    .from(players)
    .where(and(eq(players.draftId, sourceDraftId), eq(players.isDrafted, false)));

  // Filter to specific players if IDs provided
  if (playerIds && playerIds.length > 0) {
    sourcePlayers = sourcePlayers.filter((p) => playerIds.includes(p.id));
  }

  if (sourcePlayers.length === 0) {
    return NextResponse.json({ error: 'No players to import' }, { status: 400 });
  }

  // Create import note
  const sourceDraftName = `${sourceDraft.year} ${sourceDraft.division}${sourceDraft.league ? ` (${sourceDraft.league})` : ''}`;
  const importNote = `Imported from ${sourceDraftName}`;

  // Import players to target draft
  const importedPlayers = [];
  for (const player of sourcePlayers) {
    const newPlayerId = crypto.randomUUID();
    const existingNotes = player.notes ? `${player.notes}\n${importNote}` : importNote;

    await db.insert(players).values({
      id: newPlayerId,
      draftId: targetDraftId,
      fullName: player.fullName,
      rating: player.rating,
      llAge: player.llAge,
      previousManager: player.previousManager,
      previousTeam: player.previousTeam,
      notes: existingNotes,
      rankingNumber: player.rankingNumber,
      isCoachKid: false,
      coachKidTeamId: null,
      coachKidRound: null,
      isDrafted: false,
      draftedByTeamId: null,
      roundDrafted: null,
      pickNumber: null,
      school: player.school,
      swimTeam: player.swimTeam,
      otherSports: player.otherSports,
      availability80: player.availability80,
      teammateRequest: player.teammateRequest,
      specialRequest: player.specialRequest,
      pitchCount: player.pitchCount,
    });

    const [imported] = await db.select().from(players).where(eq(players.id, newPlayerId));
    importedPlayers.push(imported);
  }

  return NextResponse.json({
    imported: importedPlayers.length,
    players: importedPlayers,
  });
}

// Get undrafted players from a draft (for the modal preview)
export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: draftId } = await params;
  const url = new URL(request.url);
  const sourceDraftId = url.searchParams.get('sourceDraftId');

  if (!sourceDraftId) {
    return NextResponse.json({ error: 'Source draft ID required' }, { status: 400 });
  }

  // Verify source draft exists and user has access
  const [sourceDraft] = await db.select().from(drafts).where(eq(drafts.id, sourceDraftId));
  if (!sourceDraft) {
    return NextResponse.json({ error: 'Source draft not found' }, { status: 404 });
  }

  const isOwner = sourceDraft.userId === session.user.id;
  const isSuperAdmin = session.user.isSuperAdmin;

  if (!isOwner && !isSuperAdmin) {
    return NextResponse.json({ error: 'No access to source draft' }, { status: 403 });
  }

  // Get undrafted players
  const undraftedPlayers = await db
    .select()
    .from(players)
    .where(and(eq(players.draftId, sourceDraftId), eq(players.isDrafted, false)));

  return NextResponse.json({
    draft: sourceDraft,
    players: undraftedPlayers,
  });
}
