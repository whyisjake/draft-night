import { redirect, notFound } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/lib/db';
import { drafts, teams, players } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import LiveDraft from './LiveDraft';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));

  if (!draft) {
    return { title: 'Draft Not Found | Draft Night' };
  }

  const title = `${draft.year} ${draft.division} Draft | Draft Night`;
  const description = `Live draft board for the ${draft.year} ${draft.division} Little League draft. Make picks, track progress, and manage the draft in real-time.`;

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
