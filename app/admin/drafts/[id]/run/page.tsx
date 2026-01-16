import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { drafts, teams, players } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import LiveDraft from './LiveDraft';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DraftRunPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
  if (!draft) {
    notFound();
  }

  // Check ownership (unless super admin)
  if (!session.user.isSuperAdmin && draft.userId !== session.user.id) {
    notFound();
  }

  const draftTeams = await db.select().from(teams).where(eq(teams.draftId, id)).orderBy(teams.draftPosition);
  const draftPlayers = await db.select().from(players).where(eq(players.draftId, id));

  return <LiveDraft draft={draft} teams={draftTeams} players={draftPlayers} />;
}
