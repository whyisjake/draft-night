import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trading & Corrections - Draft Night Help',
  description: 'Learn how to trade players between teams, remove players from the draft board, and manually place players in Draft Night.',
};

export default function TradingCorrectionsPage() {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Trading & Corrections</h1>

      <p className="text-lg text-gray-600 mb-8">
        Mistakes happen during a draft. Draft Night gives you powerful tools to fix errors and make trades
        without having to reset the entire draft.
      </p>

      <div className="space-y-12">
        {/* Trading Players */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Trading Two Players</h2>
          <p className="text-gray-600 mb-4">
            To swap two players between their positions on the draft board:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li><strong>Click</strong> on the first player's cell on the draft board (it will highlight blue)</li>
            <li><strong>Command+Click</strong> (Mac) or <strong>Ctrl+Click</strong> (Windows) on the second player (it will highlight orange)</li>
            <li>A <strong>"Trade Players"</strong> panel will appear in the bottom-right corner</li>
            <li>Review the trade and click <strong>"Trade Players"</strong> to confirm</li>
          </ol>
          <p className="text-gray-600 mt-4">
            The two players will swap their team assignments, rounds, and pick numbers. All connected coach views
            will update automatically.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-blue-800 text-sm">
              <strong>Example:</strong> Player A was picked in Round 2 by the Dodgers. Player B was picked in Round 5 by the Giants.
              After the trade, Player A is now on the Giants (Round 5) and Player B is on the Dodgers (Round 2).
            </p>
          </div>
        </section>

        {/* Removing from Board */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Removing a Player from the Board</h2>
          <p className="text-gray-600 mb-4">
            If a player was drafted by mistake, you can remove them from the board and return them to the available pool:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li>Hover over the player's cell on the draft board</li>
            <li>Click the <strong>info icon (ⓘ)</strong> that appears</li>
            <li>In the player detail modal, click <strong>"Remove from Board"</strong></li>
            <li>Confirm the removal</li>
          </ol>
          <p className="text-gray-600 mt-4">
            The player will be marked as undrafted and will appear in the available players list again.
            The cell on the draft board will become empty.
          </p>
        </section>

        {/* Manual Placement */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Manually Placing a Player</h2>
          <p className="text-gray-600 mb-4">
            Need to fill an empty slot on the board? You can manually place any available player:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li>Click on an <strong>empty cell</strong> on the draft board</li>
            <li>A player selection modal will appear</li>
            <li>Find and click on the player you want to place</li>
            <li>The player will be assigned to that team and round</li>
          </ol>
          <p className="text-gray-600 mt-4">
            This is useful for:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-2">
            <li>Filling gaps after removing a player</li>
            <li>Correcting a pick that was made for the wrong team</li>
            <li>Handling trades that happened outside the normal draft flow</li>
          </ul>
        </section>

        {/* Undo Last Pick */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Undoing the Last Pick</h2>
          <p className="text-gray-600 mb-4">
            For simple mistakes on the most recent pick, use the <strong>"Undo Last Pick"</strong> button:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Click "Undo Last Pick" in the draft controls</li>
            <li>The last drafted player returns to the available pool</li>
            <li>The draft position goes back one pick</li>
          </ul>
          <p className="text-gray-600 mt-4">
            This is the quickest fix when you catch a mistake immediately after making it.
          </p>
        </section>

        {/* Deleting a Player */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Deleting a Player Entirely</h2>
          <p className="text-gray-600 mb-4">
            If a player should not be in the draft at all (e.g., they moved away or aren't eligible), you can delete them:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li>Click the info icon on the player (in the list or on the board)</li>
            <li>Click the red <strong>"Delete"</strong> button</li>
            <li>Confirm the deletion</li>
          </ol>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-amber-800 text-sm">
              <strong>Warning:</strong> Deleting is permanent. The player will be completely removed from the draft.
              If they were drafted, their slot will become empty.
            </p>
          </div>
        </section>

        {/* When to Use Each */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Reference: When to Use Each Tool</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-4 py-2 text-left font-medium">Situation</th>
                  <th className="border px-4 py-2 text-left font-medium">Solution</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr>
                  <td className="border px-4 py-2">Wrong player just picked</td>
                  <td className="border px-4 py-2"><strong>Undo Last Pick</strong></td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Need to swap two players</td>
                  <td className="border px-4 py-2"><strong>Trade</strong> (click + cmd-click)</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Player picked for wrong team (earlier)</td>
                  <td className="border px-4 py-2"><strong>Remove from Board</strong> + <strong>Manual Place</strong></td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Empty slot needs to be filled</td>
                  <td className="border px-4 py-2"><strong>Manual Place</strong> (click empty cell)</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Player shouldn't be in draft</td>
                  <td className="border px-4 py-2"><strong>Delete Player</strong></td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Need to start completely over</td>
                  <td className="border px-4 py-2"><strong>Reset Draft</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Next Steps */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/help/running-a-draft" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
            <h3 className="font-medium text-gray-900">Running a Live Draft →</h3>
            <p className="text-sm text-gray-600">Complete guide to managing your draft</p>
          </Link>
          <Link href="/help/faq" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
            <h3 className="font-medium text-gray-900">FAQ →</h3>
            <p className="text-sm text-gray-600">Common questions and answers</p>
          </Link>
        </div>
      </div>
    </article>
  );
}
