import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { drafts, users } from '@/lib/schema';
import { desc, eq, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function SuperAdminDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.isSuperAdmin) {
    redirect('/admin');
  }

  // Get all users with their draft counts
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

  // Get draft counts per user
  const draftCounts = await db
    .select({
      userId: drafts.userId,
      count: count(),
    })
    .from(drafts)
    .groupBy(drafts.userId);

  const draftCountMap = new Map(draftCounts.map((d) => [d.userId, d.count]));

  // Get all drafts with user info
  const allDrafts = await db
    .select({
      draft: drafts,
      user: users,
    })
    .from(drafts)
    .leftJoin(users, eq(drafts.userId, users.id))
    .orderBy(desc(drafts.createdAt));

  return (
    <main className="flex-1 p-4 md:p-8 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600">Manage all users and drafts</p>
          </div>
          <Link href="/admin" className="text-blue-600 hover:text-blue-800">
            &larr; Back to My Drafts
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">{allUsers.length}</div>
            <div className="text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">{allDrafts.length}</div>
            <div className="text-gray-600">Total Drafts</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600">
              {allDrafts.filter((d) => d.draft.status === 'active').length}
            </div>
            <div className="text-gray-600">Active Drafts</div>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Drafts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.image && (
                          <img
                            src={user.image}
                            alt=""
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        )}
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {draftCountMap.get(user.id) || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isSuperAdmin ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Super Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt?.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drafts Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">All Drafts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Draft
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Access Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allDrafts.map(({ draft, user }) => (
                  <tr key={draft.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {draft.year} {draft.division}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user?.name || user?.email || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Round {draft.currentRound} / {draft.totalRounds}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {draft.accessKey}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
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
                      <Link
                        href={`/draft/${draft.accessKey}`}
                        className="text-purple-600 hover:text-purple-800"
                        target="_blank"
                      >
                        Coach View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
