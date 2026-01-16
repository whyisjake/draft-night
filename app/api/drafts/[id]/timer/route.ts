import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { drafts } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { broadcast } from '@/lib/events';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  // Reset timer by updating pickStartedAt
  await db
    .update(drafts)
    .set({ pickStartedAt: new Date() })
    .where(eq(drafts.id, id));

  const [updatedDraft] = await db.select().from(drafts).where(eq(drafts.id, id));

  // Broadcast timer reset to all clients
  broadcast(id, 'timerReset', { draft: updatedDraft });

  return NextResponse.json({ draft: updatedDraft });
}
