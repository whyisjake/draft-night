import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Running a Live Draft - Draft Night Help',
  description: 'Learn how to run a live Little League draft with Draft Night. Make picks, manage the timer, undo mistakes, and keep your draft running smoothly.',
};

export default function RunningDraftPage() {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Running a Live Draft</h1>

      <p className="text-lg text-gray-600 mb-8">
        Once you've set up your teams and players, it's time to run the draft. This guide covers
        everything you need to know to keep your draft running smoothly.
      </p>

      <div className="space-y-12">
        {/* The Draft Board */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Draft Board</h2>
          <p className="text-gray-600 mb-4">
            The draft board shows all picks at a glance:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li><strong>Columns</strong> represent teams (in draft position order)</li>
            <li><strong>Rows</strong> represent rounds</li>
            <li><strong>Green highlighting</strong> shows the current pick</li>
            <li><strong>Light green cells</strong> indicate pre-assigned coach kids</li>
          </ul>
          <p className="text-gray-600 mt-4">
            The draft uses <strong>snake order</strong>: Round 1 goes left-to-right (1→8), Round 2 goes right-to-left (8→1), and so on.
          </p>
        </section>

        {/* Making Picks */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Making a Pick</h2>
          <p className="text-gray-600 mb-4">
            To make a pick:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li>Find the player in the <strong>Available Players</strong> list on the right</li>
            <li>Click on the player to select them (they'll be highlighted)</li>
            <li>Click the <strong>"Draft [Player Name]"</strong> button</li>
          </ol>
          <p className="text-gray-600 mt-4">
            The player will be added to the board, and the draft will automatically advance to the next pick.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-blue-800 text-sm">
              <strong>Tip:</strong> Use the search box to quickly find a player by name. You can also sort the player
              list by ranking, rating, name, age, or pitch count.
            </p>
          </div>
        </section>

        {/* The Timer */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Pick Timer</h2>
          <p className="text-gray-600 mb-4">
            Each pick has a 60-second timer displayed in the header. The timer:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Turns <strong>yellow</strong> when under 30 seconds</li>
            <li>Turns <strong>red and pulses</strong> when under 10 seconds</li>
            <li>Resets automatically when a pick is made</li>
          </ul>
          <p className="text-gray-600 mt-4">
            Click the <strong>"Reset"</strong> button next to the timer to restart it (useful if a coach needs more time or if there's a discussion).
          </p>
        </section>

        {/* Undo */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Undoing a Pick</h2>
          <p className="text-gray-600 mb-4">
            Made a mistake? Click the <strong>"Undo Last Pick"</strong> button to reverse the most recent pick.
            The player will be returned to the available list, and the draft will go back one position.
          </p>
          <p className="text-gray-600 mt-4">
            For more complex corrections (like swapping two players), see <Link href="/help/trading-corrections" className="text-blue-600 hover:underline">Trading & Corrections</Link>.
          </p>
        </section>

        {/* Player Info */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Viewing Player Details</h2>
          <p className="text-gray-600 mb-4">
            To see detailed information about any player:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>In the player list, click the <strong>info icon (ⓘ)</strong> next to any player</li>
            <li>On the draft board, hover over a player's cell and click the info icon</li>
          </ul>
          <p className="text-gray-600 mt-4">
            The player detail modal shows:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-2">
            <li>Rating, ranking, and age</li>
            <li>School and previous team/coach</li>
            <li>Pitch count and availability flags</li>
            <li>Teammate and special requests</li>
            <li>Any notes</li>
          </ul>
        </section>

        {/* Expand Player List */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Expanded Player View</h2>
          <p className="text-gray-600 mb-4">
            Click <strong>"Expand"</strong> at the top of the player list to open a full-screen view with:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Larger player cards with more details</li>
            <li>Toggle between Available and Drafted players</li>
            <li>Search across all player fields</li>
            <li>Sort by ranking, rating, name, age, or pitch count</li>
          </ul>
          <p className="text-gray-600 mt-4">
            This view is great for projecting on a screen during the draft so everyone can see the available players.
          </p>
        </section>

        {/* Adding Notes */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Adding Notes During the Draft</h2>
          <p className="text-gray-600 mb-4">
            You can add notes to any player during the draft:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li>Click on a player in the list</li>
            <li>Click "Add note..." below their info</li>
            <li>Type your note and press Enter or click Save</li>
          </ol>
          <p className="text-gray-600 mt-4">
            Notes are visible to you and any collaborators, but not to coaches in the coach view.
          </p>
        </section>

        {/* Draft Complete */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Completing the Draft</h2>
          <p className="text-gray-600 mb-4">
            When all rounds are complete, the draft will show <strong>"Draft Complete!"</strong> in the header.
            At this point you can:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Review the final draft board</li>
            <li>Make any last-minute corrections using the trading feature</li>
            <li>Move undrafted players to another division's draft</li>
          </ul>
          <p className="text-gray-600 mt-4">
            See <Link href="/help/moving-players" className="text-blue-600 hover:underline">Moving Players Between Drafts</Link> for how to transfer undrafted players.
          </p>
        </section>

        {/* Reset Draft */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Resetting the Draft</h2>
          <p className="text-gray-600 mb-4">
            Need to start over? Click <strong>"Reset Draft"</strong> to clear all picks and return to Round 1.
            You can choose to:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li><strong>Keep pre-assigned players</strong> - Coach kids stay on their teams</li>
            <li><strong>Full reset</strong> - Everything goes back to the available pool</li>
          </ul>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-amber-800 text-sm">
              <strong>Warning:</strong> Resetting the draft cannot be undone. Make sure everyone agrees before resetting.
            </p>
          </div>
        </section>
      </div>

      {/* Next Steps */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/help/trading-corrections" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
            <h3 className="font-medium text-gray-900">Trading & Corrections →</h3>
            <p className="text-sm text-gray-600">Fix mistakes and trade players between teams</p>
          </Link>
          <Link href="/help/coach-view" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
            <h3 className="font-medium text-gray-900">Coach View →</h3>
            <p className="text-sm text-gray-600">How coaches follow along with the draft</p>
          </Link>
        </div>
      </div>
    </article>
  );
}
