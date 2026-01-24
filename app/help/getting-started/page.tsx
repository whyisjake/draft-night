import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Getting Started - Draft Night Help',
  description: 'Learn how to create your first Little League draft, add teams, and import players. Step-by-step guide to setting up Draft Night.',
};

export default function GettingStartedPage() {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Getting Started with Draft Night</h1>

      <p className="text-lg text-gray-600 mb-8">
        Draft Night helps you run a smooth, organized draft for your Little League or youth sports league.
        This guide will walk you through creating your first draft from start to finish.
      </p>

      <div className="space-y-12">
        {/* Step 1 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Sign In
          </h2>
          <p className="text-gray-600 mb-4">
            Visit <Link href="/login" className="text-blue-600 hover:underline">the login page</Link> and sign in with your Google account.
            No separate account creation needed - just click "Sign in with Google" and you're ready to go.
          </p>
        </section>

        {/* Step 2 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Create a New Draft
          </h2>
          <p className="text-gray-600 mb-4">
            From your dashboard, click <strong>"New Draft"</strong>. You'll need to provide:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li><strong>League name</strong> (optional) - e.g., "Walnut Creek Little League"</li>
            <li><strong>Division</strong> - e.g., "Majors", "AAA", "AA"</li>
            <li><strong>Year</strong> - The season year</li>
            <li><strong>Number of rounds</strong> - How many rounds in your draft (default is 12)</li>
          </ul>
        </section>

        {/* Step 3 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            Add Your Teams
          </h2>
          <p className="text-gray-600 mb-4">
            On the <strong>Teams</strong> tab, add each team that will be drafting:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Enter the coach name(s) and click "Add Team"</li>
            <li>Optionally assign MLB team names (Dodgers, Yankees, etc.)</li>
            <li>Drag and drop to set the draft order, or click "Randomize Order"</li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-blue-800 text-sm">
              <strong>Tip:</strong> The draft uses snake order - Round 1 goes 1→8, Round 2 goes 8→1, and so on.
              The team in position #1 picks first in odd rounds and last in even rounds.
            </p>
          </div>
        </section>

        {/* Step 4 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
            Import Your Players
          </h2>
          <p className="text-gray-600 mb-4">
            On the <strong>Players</strong> tab, import your player list. You have two options:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li><strong>Paste from Sheets</strong> - Copy your data from Google Sheets and paste directly</li>
            <li><strong>Upload CSV</strong> - Upload a CSV file exported from your spreadsheet</li>
          </ul>
          <p className="text-gray-600 mt-4">
            Draft Night recognizes common column names automatically:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-2">
            <li>Full Name, Rating/Draft Score, LL Age</li>
            <li>Previous Team, Previous Coach/Manager</li>
            <li>School, Pitch Count</li>
            <li>Swim Team, Other Sports, Teammate Request</li>
          </ul>
          <p className="text-gray-600 mt-4">
            See <Link href="/help/player-management" className="text-blue-600 hover:underline">Player Management</Link> for more details on importing.
          </p>
        </section>

        {/* Step 5 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
            Pre-Assign Coach Kids (Optional)
          </h2>
          <p className="text-gray-600 mb-4">
            If coaches have children who are pre-assigned to their team, you can set this up before the draft:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Find the player in the Players tab</li>
            <li>Click on them to open the detail view</li>
            <li>Select their coach's team from the "Pre-Assigned" dropdown</li>
            <li>Optionally set which round they count as being drafted in</li>
          </ul>
          <p className="text-gray-600 mt-4">
            When the draft starts, pre-assigned players will automatically be placed on their teams.
          </p>
        </section>

        {/* Step 6 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">6</span>
            Share the Coach Link
          </h2>
          <p className="text-gray-600 mb-4">
            At the top of your draft page, you'll see a <strong>Coach Access Link</strong>. Share this with your coaches
            so they can follow along during the draft. Coaches can:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Watch the draft board update in real-time</li>
            <li>Browse the player list</li>
            <li>Get alerts when it's their turn to pick</li>
          </ul>
          <p className="text-gray-600 mt-4">
            See <Link href="/help/coach-view" className="text-blue-600 hover:underline">Coach View</Link> for more details.
          </p>
        </section>

        {/* Step 7 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">7</span>
            Start the Draft!
          </h2>
          <p className="text-gray-600 mb-4">
            When you're ready, click <strong>"Start Draft"</strong> on the setup page. This will:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Lock in your teams and draft order</li>
            <li>Place pre-assigned coach kids on their teams</li>
            <li>Take you to the live draft board</li>
          </ul>
          <p className="text-gray-600 mt-4">
            See <Link href="/help/running-a-draft" className="text-blue-600 hover:underline">Running a Live Draft</Link> for how to manage the draft once it's started.
          </p>
        </section>
      </div>

      {/* Next Steps */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/help/running-a-draft" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
            <h3 className="font-medium text-gray-900">Running a Live Draft →</h3>
            <p className="text-sm text-gray-600">Learn how to make picks and manage the draft</p>
          </Link>
          <Link href="/help/player-management" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
            <h3 className="font-medium text-gray-900">Player Management →</h3>
            <p className="text-sm text-gray-600">Detailed guide to importing and editing players</p>
          </Link>
        </div>
      </div>
    </article>
  );
}
