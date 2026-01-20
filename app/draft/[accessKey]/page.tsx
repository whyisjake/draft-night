import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/lib/db';
import { drafts, teams, players, collaborators } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
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

  const draftName = draft.league
    ? `${draft.league} ${draft.year} ${draft.division}`
    : `${draft.year} ${draft.division}`;
  const title = `${draftName} Draft`;
  const description = `Watch the ${draftName} Little League draft live. See available players, track picks, and follow along in real-time.`;

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

  // Check if current user can edit notes (owner or collaborator)
  const session = await auth();
  let canEditNotes = false;
  if (session?.user?.id) {
    // Check if user is owner
    if (draft.userId === session.user.id) {
      canEditNotes = true;
    } else {
      // Check if user is a collaborator
      const [collab] = await db
        .select()
        .from(collaborators)
        .where(and(eq(collaborators.draftId, draft.id), eq(collaborators.userId, session.user.id)));
      canEditNotes = !!collab;
    }
  }

  return <CoachView draft={draft} teams={draftTeams} players={draftPlayers} canEditNotes={canEditNotes} />;
}
