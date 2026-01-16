import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { drafts, teams, players } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import DraftSetup from './DraftSetup';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DraftSetupPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const isAuth = cookieStore.get('admin_auth')?.value === 'true';

  if (!isAuth) {
    redirect('/admin/login');
  }

  const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
  if (!draft) {
    notFound();
  }

  const draftTeams = await db.select().from(teams).where(eq(teams.draftId, id)).orderBy(teams.draftPosition);
  const draftPlayers = await db.select().from(players).where(eq(players.draftId, id));

  return <DraftSetup draft={draft} teams={draftTeams} players={draftPlayers} />;
}
