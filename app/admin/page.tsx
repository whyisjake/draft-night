import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { drafts, collaborators, users } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import SignOutButton from '@/components/SignOutButton';
import DeleteDraftButton from '@/components/DeleteDraftButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Drafts',
  description: 'Manage your Little League drafts. Create new drafts, configure teams, and run draft night.',
};

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Always filter drafts by user - super admins can see all drafts on /super-admin
  const userDrafts = await db
    .select()
    .from(drafts)
    .where(eq(drafts.userId, session.user.id))
    .orderBy(drafts.league, desc(drafts.year), drafts.division);

  // Get drafts shared with the user (where they are a collaborator)
  const sharedDrafts = await db
    .select({
      id: drafts.id,
      league: drafts.league,
      division: drafts.division,
      year: drafts.year,
      status: drafts.status,
      accessKey: drafts.accessKey,
      ownerName: users.name,
      ownerEmail: users.email,
    })
    .from(collaborators)
    .innerJoin(drafts, eq(collaborators.draftId, drafts.id))
    .innerJoin(users, eq(drafts.userId, users.id))
    .where(eq(collaborators.userId, session.user.id))
    .orderBy(drafts.league, desc(drafts.year), drafts.division);

  return (
    <main className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with user menu */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Drafts</h1>
            <p className="text-gray-600 text-sm md:text-base">Welcome, {session.user.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {session.user.isSuperAdmin && (
              <Link
                href="/super-admin"
                className="py-2 px-3 sm:px-4 rounded-lg font-medium border border-purple-300 text-purple-600 hover:bg-purple-50 transition text-sm"
              >
                Super Admin
              </Link>
            )}
            <Link
              href="/admin/drafts/new"
              className="py-2 px-3 sm:px-4 rounded-lg font-medium border border-blue-300 text-blue-600 hover:bg-blue-50 transition text-sm"
            >
              New Draft
            </Link>
            <SignOutButton />
          </div>
        </div>

        {userDrafts.length === 0 ? (
          <div className="text-center py-8 md:py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No drafts yet. Create your first draft!</p>
            <Link
              href="/admin/drafts/new"
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Create Draft
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      League
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Division
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Coach Link
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userDrafts.map((draft) => (
                    <tr key={draft.id}>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {draft.league || <span className="text-gray-400 italic">No League</span>}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-500">
                        {draft.division}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-500">
                        {draft.year}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            draft.status === 'setup'
                              ? 'bg-yellow-100 text-yellow-800'
                              : draft.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {draft.status}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        <Link
                          href={`/draft/${draft.accessKey}`}
                          target="_blank"
                          className="bg-gray-100 px-2 py-1 rounded text-xs font-mono hover:bg-gray-200 hover:text-gray-700 transition"
                        >
                          /draft/{draft.accessKey}
                        </Link>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          <Link
                            href={`/admin/drafts/${draft.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Setup
                          </Link>
                          {draft.status !== 'setup' && (
                            <Link
                              href={`/admin/drafts/${draft.id}/run`}
                              className="text-green-600 hover:text-green-800"
                            >
                              Run
                            </Link>
                          )}
                          <DeleteDraftButton
                            draftId={draft.id}
                            draftName={`${draft.league ? draft.league + ' ' : ''}${draft.year} ${draft.division}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Shared Drafts Section */}
        {sharedDrafts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shared with me</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        League
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Division
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sharedDrafts.map((draft) => (
                      <tr key={draft.id}>
                        <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {draft.league || <span className="text-gray-400 italic">No League</span>}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-500">
                          {draft.division}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-500">
                          {draft.year}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-500">
                          {draft.ownerName || draft.ownerEmail}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              draft.status === 'setup'
                                ? 'bg-yellow-100 text-yellow-800'
                                : draft.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {draft.status}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/draft/${draft.accessKey}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View & Edit Notes
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
