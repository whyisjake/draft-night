import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Player Management - Draft Night Help',
  description: 'Learn how to import players from spreadsheets, edit player information, and pre-assign coach kids in Draft Night.',
};

export default function PlayerManagementPage() {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Player Management</h1>

      <p className="text-lg text-gray-600 mb-8">
        Draft Night makes it easy to import your player list from a spreadsheet and manage player information
        before and during the draft.
      </p>

      <div className="space-y-12">
        {/* Importing Players */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Importing Players</h2>
          <p className="text-gray-600 mb-4">
            There are two ways to import your player list:
          </p>

          <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Option 1: Paste from Google Sheets</h3>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li>Open your spreadsheet in Google Sheets</li>
            <li>Select all your data including the header row</li>
            <li>Copy (Ctrl+C or Cmd+C)</li>
            <li>In Draft Night, click "Paste from Sheets" and paste into the text area</li>
            <li>Click "Preview Changes" to see what will be imported</li>
            <li>Click "Confirm Import" to add the players</li>
          </ol>

          <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Option 2: Upload a CSV File</h3>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li>Export your spreadsheet as a CSV file</li>
            <li>In Draft Night, click "Upload CSV"</li>
            <li>Select your file</li>
            <li>Click "Preview Changes" to review</li>
            <li>Click "Confirm Import" to add the players</li>
          </ol>
        </section>

        {/* Supported Columns */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Supported Column Names</h2>
          <p className="text-gray-600 mb-4">
            Draft Night automatically recognizes these column headers (case-insensitive):
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-4 py-2 text-left font-medium">Field</th>
                  <th className="border px-4 py-2 text-left font-medium">Recognized Headers</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr>
                  <td className="border px-4 py-2 font-medium">Full Name</td>
                  <td className="border px-4 py-2">Full Name, Name, Player Name, Player</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Rating</td>
                  <td className="border px-4 py-2">Rating, Draft Score, Score, Draft Scores</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Age</td>
                  <td className="border px-4 py-2">LL Age, Age, League Age</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Ranking</td>
                  <td className="border px-4 py-2">Ranking, Ranking #, Rank</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Previous Team</td>
                  <td className="border px-4 py-2">Previous Team, Last Team, Prior Team</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Previous Coach</td>
                  <td className="border px-4 py-2">Previous Manager, Previous Coach, Last Coach</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">School</td>
                  <td className="border px-4 py-2">School, Elementary School</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Pitch Count</td>
                  <td className="border px-4 py-2">Pitch Count, Pitches, IP</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Swim Team</td>
                  <td className="border px-4 py-2">Swim Team, Swim, Swimming</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Other Sports</td>
                  <td className="border px-4 py-2">Other Sports, Other Sport Commitments</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Teammate Request</td>
                  <td className="border px-4 py-2">Teammate Request, Buddy Request, Carpool</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-medium">Special Request</td>
                  <td className="border px-4 py-2">Special Request, Notes, Comments</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Import Modes */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Import Modes</h2>
          <p className="text-gray-600 mb-4">
            When you already have players in the draft, you can choose how the import behaves:
          </p>
          <ul className="space-y-4 ml-4">
            <li>
              <strong className="text-gray-900">Replace All</strong>
              <p className="text-gray-600">Deletes all existing players and imports fresh. Use this when you have a completely new list.</p>
            </li>
            <li>
              <strong className="text-gray-900">Add New Only</strong>
              <p className="text-gray-600">Only adds players that don't already exist (matched by name). Existing players are unchanged.</p>
            </li>
            <li>
              <strong className="text-gray-900">Update Existing</strong>
              <p className="text-gray-600">Updates existing players with new data and adds any new players. Best for refreshing ratings or fixing info.</p>
            </li>
          </ul>
        </section>

        {/* Editing Players */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Editing Player Information</h2>
          <p className="text-gray-600 mb-4">
            To edit a player's information:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li>Find the player in the Players tab</li>
            <li>Click on their name to open the detail modal</li>
            <li>Edit the rating, ranking, or other fields</li>
            <li>Click "Save Changes"</li>
          </ol>
          <p className="text-gray-600 mt-4">
            You can edit players both during setup and during the live draft.
          </p>
        </section>

        {/* Pre-assigning Coach Kids */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pre-Assigning Coach Kids</h2>
          <p className="text-gray-600 mb-4">
            Many leagues allow coaches to have their children on their team. To pre-assign a player:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li>Click on the player in the Players tab</li>
            <li>In the modal, find the "Pre-Assigned" dropdown</li>
            <li>Select the coach's team</li>
            <li>Optionally set the "Draft Round" - which round this pick counts as</li>
            <li>Click "Save Changes"</li>
          </ol>
          <p className="text-gray-600 mt-4">
            Pre-assigned players show with a <span className="text-green-600 font-medium">green highlight</span> in the player list.
            When the draft starts, they'll automatically be placed on their assigned teams.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-blue-800 text-sm">
              <strong>Tip:</strong> If you set a draft round (e.g., Round 3), the coach kid will be placed in that round
              and the draft will skip that slot when it gets there.
            </p>
          </div>
        </section>

        {/* Deleting Players */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Deleting Players</h2>
          <p className="text-gray-600 mb-4">
            To remove a player from the draft entirely:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li>Click on the player to open their detail modal</li>
            <li>Click the red "Delete" button</li>
            <li>Confirm the deletion</li>
          </ol>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-amber-800 text-sm">
              <strong>Note:</strong> Deleting a player is permanent and cannot be undone. You would need to re-import them.
            </p>
          </div>
        </section>

        {/* Must Draft Age */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Must Draft Age Setting</h2>
          <p className="text-gray-600 mb-4">
            Some leagues require that players of a certain age must be drafted. To set this:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li>Go to the Settings tab</li>
            <li>Enter the age in the "Must Draft Age" field</li>
            <li>Click "Save Settings"</li>
          </ol>
          <p className="text-gray-600 mt-4">
            The draft board will show a counter of how many players of that age remain undrafted,
            helping coaches track who still needs to be picked.
          </p>
        </section>
      </div>

      {/* Next Steps */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/help/getting-started" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
            <h3 className="font-medium text-gray-900">Getting Started →</h3>
            <p className="text-sm text-gray-600">Full setup guide from start to finish</p>
          </Link>
          <Link href="/help/moving-players" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
            <h3 className="font-medium text-gray-900">Moving Players Between Drafts →</h3>
            <p className="text-sm text-gray-600">Transfer undrafted players to another division</p>
          </Link>
        </div>
      </div>
    </article>
  );
}
