import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coach View - Draft Night Help',
  description: 'Learn how coaches can follow along with the draft in real-time, get turn alerts, and view player information in Draft Night.',
};

export default function CoachViewPage() {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Coach View</h1>

      <p className="text-lg text-gray-600 mb-8">
        The Coach View lets coaches follow along with the draft in real-time from their own device.
        They can see the draft board, browse players, and get alerts when it's their turn to pick.
      </p>

      <div className="space-y-12">
        {/* Accessing Coach View */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accessing the Coach View</h2>
          <p className="text-gray-600 mb-4">
            The draft administrator shares a special link with coaches. This link looks like:
          </p>
          <div className="bg-gray-100 rounded-lg px-4 py-3 font-mono text-sm text-gray-700 mb-4">
            https://draft-night.vercel.app/draft/abc123xy
          </div>
          <p className="text-gray-600 mb-4">
            Coaches can access this link on any device - phone, tablet, or computer. No account or login required.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>For Administrators:</strong> Find the Coach Access Link at the top of your draft setup page.
              Copy it and share via email, text, or your team communication app.
            </p>
          </div>
        </section>

        {/* Real-time Updates */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Real-Time Updates</h2>
          <p className="text-gray-600 mb-4">
            The coach view updates automatically as the draft progresses:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>The draft board shows all picks in real-time</li>
            <li>The "On the Clock" indicator shows which team is currently picking</li>
            <li>The timer counts down for each pick</li>
            <li>The player list updates as players are drafted</li>
          </ul>
          <p className="text-gray-600 mt-4">
            A <span className="text-green-600 font-medium">green "Live" indicator</span> in the header shows when you're connected.
            If it turns red, the page will automatically try to reconnect.
          </p>
        </section>

        {/* Turn Alerts */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Turn Alerts</h2>
          <p className="text-gray-600 mb-4">
            Coaches can enable notifications to know when it's their turn to pick:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li>Click the <strong>"Enable alerts for..."</strong> dropdown in the header</li>
            <li>Select your team</li>
            <li>Allow notifications when your browser asks</li>
          </ol>
          <p className="text-gray-600 mt-4">
            When it's your turn, you'll receive a notification even if you're in another tab or app.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-blue-800 text-sm">
              <strong>Tip:</strong> Click "Test" after enabling alerts to make sure notifications are working on your device.
            </p>
          </div>
        </section>

        {/* Sound Alerts */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sound Countdown</h2>
          <p className="text-gray-600 mb-4">
            Enable sound alerts to hear audio countdown when it's your turn:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li>Click <strong>"Sound Off"</strong> button to toggle sound on</li>
            <li>Select your team for alerts (if not already selected)</li>
            <li>When it's your turn and time is running low, you'll hear beeps</li>
          </ol>
          <p className="text-gray-600 mt-4">
            The sound plays at 10 seconds, then counts down 5-4-3-2-1 with increasing urgency.
          </p>
        </section>

        {/* Viewing Players */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Viewing Player Information</h2>
          <p className="text-gray-600 mb-4">
            The coach view includes a player list on the right side:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Toggle between <strong>Available</strong> and <strong>Drafted</strong> players</li>
            <li>Search for players by name</li>
            <li>Sort by ranking, rating, name, or age</li>
            <li>Click the <strong>info icon (ⓘ)</strong> to see full player details</li>
          </ul>
          <p className="text-gray-600 mt-4">
            Click <strong>"Expand"</strong> to see a full-screen view of all players with more detailed information.
          </p>
        </section>

        {/* Finding Drafted Players */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Finding Drafted Players on the Board</h2>
          <p className="text-gray-600 mb-4">
            To quickly find where a player was drafted:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li>Switch to the <strong>"Drafted"</strong> tab in the player list</li>
            <li>Click on a player's name</li>
            <li>Their cell on the draft board will highlight blue</li>
          </ol>
          <p className="text-gray-600 mt-4">
            This makes it easy to see which team got a particular player and in which round.
          </p>
        </section>

        {/* Adding Notes */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Adding Notes (Collaborators)</h2>
          <p className="text-gray-600 mb-4">
            If you're a collaborator on the draft (invited by the administrator), you can add notes to players:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
            <li>Click <strong>"Sign in to edit"</strong> in the header</li>
            <li>Sign in with your Google account</li>
            <li>Click "Add note..." on any player</li>
            <li>Type your note and press Enter to save</li>
          </ol>
          <p className="text-gray-600 mt-4">
            Notes are shared with the draft administrator and other collaborators, but not with other coaches.
          </p>
        </section>

        {/* Mobile Tips */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tips for Mobile Devices</h2>
          <p className="text-gray-600 mb-4">
            The coach view works great on phones and tablets:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>The draft board scrolls horizontally - swipe to see all teams</li>
            <li>The player list is at the bottom on mobile screens</li>
            <li>Use the "Expand" button for a better view of available players</li>
            <li>Enable notifications to get alerts even when your screen is off</li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-blue-800 text-sm">
              <strong>Tip:</strong> Keep the coach view open in your browser during the draft.
              If you navigate away, just come back to the same URL - it will sync automatically.
            </p>
          </div>
        </section>
      </div>

      {/* Next Steps */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/help/running-a-draft" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
            <h3 className="font-medium text-gray-900">Running a Live Draft →</h3>
            <p className="text-sm text-gray-600">Guide for draft administrators</p>
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
