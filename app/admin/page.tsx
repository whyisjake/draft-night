import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { drafts } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import SignOutButton from '@/components/SignOutButton';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Filter drafts by user (unless super admin, then show all)
  const userDrafts = session.user.isSuperAdmin
    ? await db.select().from(drafts).orderBy(desc(drafts.year), drafts.division)
    : await db
        .select()
        .from(drafts)
        .where(eq(drafts.userId, session.user.id))
        .orderBy(desc(drafts.year), drafts.division);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with user menu */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Drafts</h1>
            <p className="text-gray-600">Welcome, {session.user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            {session.user.isSuperAdmin && (
              <Link
                href="/super-admin"
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Super Admin
              </Link>
            )}
            <Link
              href="/admin/drafts/new"
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              New Draft
            </Link>
            <SignOutButton />
          </div>
        </div>

        {userDrafts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Division
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coach View Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userDrafts.map((draft) => (
                  <tr key={draft.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {draft.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {draft.division}
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
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        /draft/{draft.accessKey}
                      </code>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
