import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { drafts, teams, players } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import CoachView from './CoachView';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ accessKey: string }>;
}

export default async function CoachViewPage({ params }: Props) {
  const { accessKey } = await params;

  const [draft] = await db.select().from(drafts).where(eq(drafts.accessKey, accessKey));
  if (!draft) {
    notFound();
  }

  const draftTeams = await db.select().from(teams).where(eq(teams.draftId, draft.id)).orderBy(teams.draftPosition);
  const draftPlayers = await db.select().from(players).where(eq(players.draftId, draft.id));

  return <CoachView draft={draft} teams={draftTeams} players={draftPlayers} />;
}
