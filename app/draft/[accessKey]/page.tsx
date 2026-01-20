import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/lib/db';
import { drafts, teams, players } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import CoachView from './CoachView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ accessKey: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { accessKey } = await params;
  const [draft] = await db.select().from(drafts).where(eq(drafts.accessKey, accessKey));

  if (!draft) {
    return { title: 'Draft Not Found' };
  }

  const title = `${draft.year} ${draft.division} Draft`;
  const description = `Watch the ${draft.year} ${draft.division} Little League draft live. See available players, track picks, and follow along in real-time.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Draft Night',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
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
