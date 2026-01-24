import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Moving Players Between Drafts - Draft Night Help',
  description: 'Learn how to transfer undrafted players from one division to another in Draft Night. Perfect for moving players down after a draft.',
};

export default function MovingPlayersPage() {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Moving Players Between Drafts</h1>

      <p className="text-lg text-gray-600 mb-8">
        After a draft, some players may not get selected. Draft Night makes it easy to move these
        undrafted players to another division's draft - a common workflow when players move from
        an older division to a younger one.
      </p>

      <div className="space-y-12">
        {/* When to Use */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">When to Use This Feature</h2>
          <p className="text-gray-600 mb-4">
            This feature is perfect for:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Moving undrafted players from Majors to AAA</li>
            <li>Transferring players from AAA to AA after the AAA draft</li>
            <li>Any situation where players need to move to a different division's pool</li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-blue-800 text-sm">
              <strong>Example workflow:</strong> Run your Majors draft first. After it completes, import the
              undrafted Majors players into your AAA draft. Then run the AAA draft with the expanded player pool.
            </p>
          </div>
        </section>

        {/* How to Import */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Import Players from Another Draft</h2>
          <ol className="list-decimal list-inside text-gray-600 space-y-3 ml-4">
            <li>
              <strong>Go to the destination draft</strong>
              <p className="ml-6 text-gray-500">Open the draft where you want to add the players</p>
            </li>
            <li>
              <strong>Open the Players tab</strong>
              <p className="ml-6 text-gray-500">Scroll down to find "Import from Another Draft"</p>
            </li>
            <li>
              <strong>Click "Select Source Draft"</strong>
              <p className="ml-6 text-gray-500">A modal will open with your available drafts</p>
            </li>
            <li>
              <strong>Choose the source draft</strong>
              <p className="ml-6 text-gray-500">Select the draft you want to import from (e.g., "2025 Majors")</p>
            </li>
            <li>
              <strong>Select players to import</strong>
              <p className="ml-6 text-gray-500">By default all undrafted players are selected. Uncheck any you don't want.</p>
            </li>
            <li>
              <strong>Click "Import"</strong>
              <p className="ml-6 text-gray-500">The selected players will be added to your draft's player pool</p>
            </li>
          </ol>
        </section>

        {/* What Gets Imported */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Gets Imported</h2>
          <p className="text-gray-600 mb-4">
            When you import players, the following information is copied:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Full name</li>
            <li>Rating and ranking number</li>
            <li>Age (LL Age)</li>
            <li>School</li>
            <li>Previous team and coach</li>
            <li>Pitch count</li>
            <li>Availability flags (swim team, other sports, etc.)</li>
            <li>Teammate and special requests</li>
          </ul>
        </section>

        {/* What's Reset */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What's Reset</h2>
          <p className="text-gray-600 mb-4">
            Some information is intentionally reset when importing:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li><strong>Draft status</strong> - Players start as undrafted in the new draft</li>
            <li><strong>Pre-assignments</strong> - Coach kid assignments don't carry over (different teams)</li>
            <li><strong>Draft position</strong> - Round and pick number are cleared</li>
          </ul>
        </section>

        {/* Import Note */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tracking Where Players Came From</h2>
          <p className="text-gray-600 mb-4">
            Each imported player gets a note added automatically:
          </p>
          <div className="bg-gray-100 rounded-lg px-4 py-3 text-gray-700 mb-4">
            "Imported from 2025 Majors (WCLL)"
          </div>
          <p className="text-gray-600">
            This helps you remember which players came from another division's draft.
            The note appears in the player's detail view.
          </p>
        </section>

        {/* Selective Import */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Selecting Specific Players</h2>
          <p className="text-gray-600 mb-4">
            You don't have to import all undrafted players. In the import modal:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Use the checkboxes to select/deselect individual players</li>
            <li>Click "Select all" to toggle all players on or off</li>
            <li>Review player ratings and ages before importing</li>
          </ul>
          <p className="text-gray-600 mt-4">
            This is useful if some players have aged out or aren't eligible for the new division.
          </p>
        </section>

        {/* Important Notes */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Important Notes</h2>
          <ul className="space-y-4 ml-4">
            <li>
              <strong className="text-gray-900">Players are copied, not moved</strong>
              <p className="text-gray-600">The original draft's data is not changed. Players remain in the source draft (as undrafted).</p>
            </li>
            <li>
              <strong className="text-gray-900">Only undrafted players can be imported</strong>
              <p className="text-gray-600">Players who were drafted in the source draft won't appear in the import list.</p>
            </li>
            <li>
              <strong className="text-gray-900">You must own both drafts</strong>
              <p className="text-gray-600">You can only import from drafts you created (or if you're a super admin).</p>
            </li>
            <li>
              <strong className="text-gray-900">Duplicates are possible</strong>
              <p className="text-gray-600">If you import the same player twice, you'll have duplicates. Delete the extra if this happens.</p>
            </li>
          </ul>
        </section>

        {/* Typical Workflow */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Typical Multi-Division Workflow</h2>
          <p className="text-gray-600 mb-4">
            Here's a typical workflow for a league with multiple divisions:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-3 ml-4">
            <li>Create and set up your Majors draft</li>
            <li>Import all eligible players for Majors</li>
            <li>Run the Majors draft</li>
            <li>Create your AAA draft</li>
            <li>Import AAA-specific players</li>
            <li>Import undrafted Majors players into AAA</li>
            <li>Run the AAA draft</li>
            <li>Repeat for AA, etc.</li>
          </ol>
        </section>
      </div>

      {/* Next Steps */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/help/player-management" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
            <h3 className="font-medium text-gray-900">Player Management →</h3>
            <p className="text-sm text-gray-600">Import from CSV and edit players</p>
          </Link>
          <Link href="/help/getting-started" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
            <h3 className="font-medium text-gray-900">Getting Started →</h3>
            <p className="text-sm text-gray-600">Set up your first draft</p>
          </Link>
        </div>
      </div>
    </article>
  );
}
