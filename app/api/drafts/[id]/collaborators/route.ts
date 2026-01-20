import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drafts, collaborators, users } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - List collaborators for a draft
export async function GET(request: NextRequest, { params }: RouteParams) {
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

  // Get collaborators with user info
  const draftCollaborators = await db
    .select({
      id: collaborators.id,
      userId: collaborators.userId,
      createdAt: collaborators.createdAt,
      userName: users.name,
      userEmail: users.email,
      userImage: users.image,
    })
    .from(collaborators)
    .innerJoin(users, eq(collaborators.userId, users.id))
    .where(eq(collaborators.draftId, id));

  return NextResponse.json(draftCollaborators);
}

// POST - Add a collaborator by email
export async function POST(request: NextRequest, { params }: RouteParams) {
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

  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Find user by email
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  if (!user) {
    return NextResponse.json(
      { error: 'User not found. They must sign in with Google first.' },
      { status: 404 }
    );
  }

  // Check if already a collaborator
  const [existing] = await db
    .select()
    .from(collaborators)
    .where(and(eq(collaborators.draftId, id), eq(collaborators.userId, user.id)));
  if (existing) {
    return NextResponse.json({ error: 'User is already a collaborator' }, { status: 400 });
  }

  // Don't allow adding the owner as a collaborator
  if (user.id === draft.userId) {
    return NextResponse.json({ error: 'Cannot add owner as collaborator' }, { status: 400 });
  }

  // Add collaborator
  const [newCollaborator] = await db
    .insert(collaborators)
    .values({
      draftId: id,
      userId: user.id,
    })
    .returning();

  return NextResponse.json({
    ...newCollaborator,
    userName: user.name,
    userEmail: user.email,
    userImage: user.image,
  });
}

// DELETE - Remove a collaborator
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

  const { searchParams } = new URL(request.url);
  const collaboratorId = searchParams.get('collaboratorId');
  if (!collaboratorId) {
    return NextResponse.json({ error: 'collaboratorId is required' }, { status: 400 });
  }

  await db
    .delete(collaborators)
    .where(and(eq(collaborators.id, collaboratorId), eq(collaborators.draftId, id)));

  return NextResponse.json({ success: true });
}
