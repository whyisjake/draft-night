import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Draft Night Help',
  description: 'Frequently asked questions about Draft Night. Get answers about draft management, troubleshooting, and features.',
};

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'Is Draft Night free to use?',
        a: 'Yes! Draft Night is completely free for Little League and youth sports drafts. Create an account with your Google login and start drafting.',
      },
      {
        q: 'Do coaches need to create accounts?',
        a: 'No. Coaches access the draft using a shared link. No account or login required for the coach view.',
      },
      {
        q: 'What browsers are supported?',
        a: 'Draft Night works in all modern browsers including Chrome, Safari, Firefox, and Edge. It also works great on mobile browsers.',
      },
      {
        q: 'Can I run a draft on my phone?',
        a: 'Yes! The draft administrator can run the draft from a phone or tablet, though a larger screen is recommended for the best experience.',
      },
    ],
  },
  {
    category: 'Draft Setup',
    questions: [
      {
        q: 'How many teams can I have in a draft?',
        a: 'There\'s no hard limit. Draft Night has been tested with up to 16 teams. Add as many teams as your division needs.',
      },
      {
        q: 'How many rounds can a draft have?',
        a: 'You can set any number of rounds, from 1 to 20 or more. The default is 12 rounds.',
      },
      {
        q: 'What spreadsheet formats are supported for import?',
        a: 'You can paste directly from Google Sheets (tab-separated) or upload a CSV file. Both formats work the same way.',
      },
      {
        q: 'Can I edit players after importing?',
        a: 'Yes! Click on any player to edit their rating, ranking, or other information. You can edit before or during the draft.',
      },
    ],
  },
  {
    category: 'Running the Draft',
    questions: [
      {
        q: 'How does snake draft order work?',
        a: 'In snake order, the draft direction reverses each round. Round 1 goes 1→8, Round 2 goes 8→1, Round 3 goes 1→8, and so on. This keeps the draft fair.',
      },
      {
        q: 'Can I pause the draft?',
        a: 'There\'s no formal pause button, but you can simply stop making picks. The timer can be reset if needed. Everyone stays connected and will see updates when you resume.',
      },
      {
        q: 'What happens if a coach loses connection?',
        a: 'The coach view will automatically try to reconnect. If they refresh the page or come back later, it will sync with the current draft state.',
      },
      {
        q: 'Can multiple people run the draft?',
        a: 'Yes! Add collaborators from the Settings tab. Collaborators can make picks and add notes, but only the owner can change settings or delete the draft.',
      },
    ],
  },
  {
    category: 'Coach Kids & Pre-assignments',
    questions: [
      {
        q: 'What are "pre-assigned" players?',
        a: 'Pre-assigned players (often coach kids) are automatically placed on a specific team when the draft starts. They don\'t go through the normal draft process.',
      },
      {
        q: 'Can I specify which round a coach kid counts as?',
        a: 'Yes! When pre-assigning a player, you can set the draft round they count as. For example, setting Round 3 means they fill that team\'s Round 3 slot.',
      },
      {
        q: 'What if I need to change a pre-assignment?',
        a: 'Before the draft starts, you can edit the player and change or remove their pre-assignment. After the draft starts, use the Remove from Board and Manual Place features.',
      },
    ],
  },
  {
    category: 'Fixing Mistakes',
    questions: [
      {
        q: 'I drafted the wrong player. How do I fix it?',
        a: 'If it just happened, click "Undo Last Pick." If it was earlier, hover over the player on the board, click the info icon, and click "Remove from Board."',
      },
      {
        q: 'Can I trade players after they\'re drafted?',
        a: 'Yes! Click on one player, then Cmd+Click (Mac) or Ctrl+Click (Windows) on another player. A trade panel will appear to swap them.',
      },
      {
        q: 'How do I fill an empty slot on the board?',
        a: 'Click on the empty cell. A player selection modal will appear. Choose the player you want to place in that slot.',
      },
      {
        q: 'Can I reset and start the draft over?',
        a: 'Yes. Click "Reset Draft" and choose whether to keep pre-assigned players or do a complete reset. This cannot be undone.',
      },
    ],
  },
  {
    category: 'Coach View & Notifications',
    questions: [
      {
        q: 'Why aren\'t notifications working?',
        a: 'Make sure you\'ve allowed notifications in your browser settings. Try clicking "Test" after enabling alerts. Some browsers block notifications by default.',
      },
      {
        q: 'Can coaches see each other\'s notes?',
        a: 'No. Notes are only visible to the draft administrator and collaborators. Coaches in the coach view cannot see notes.',
      },
      {
        q: 'The coach view says "Disconnected" - what do I do?',
        a: 'This usually means a temporary network issue. The page will try to reconnect automatically. Refreshing the page will also restore the connection.',
      },
    ],
  },
  {
    category: 'Multiple Drafts & Divisions',
    questions: [
      {
        q: 'Can I run multiple drafts at the same time?',
        a: 'Yes, you can have multiple drafts set up. However, it\'s recommended to run them one at a time so you can focus and coaches don\'t get confused.',
      },
      {
        q: 'How do I move undrafted players to another division?',
        a: 'On the destination draft, go to Players → Import from Another Draft. Select the source draft and choose which undrafted players to import.',
      },
      {
        q: 'Can I reuse the same coach link for a new draft?',
        a: 'No, each draft has its own unique access link. Share the new link with coaches for each draft.',
      },
    ],
  },
  {
    category: 'Data & Privacy',
    questions: [
      {
        q: 'Who can see my draft?',
        a: 'Only you (the owner), collaborators you add, and anyone with the coach access link can see your draft. Drafts are not public.',
      },
      {
        q: 'Can I export my draft results?',
        a: 'Currently there\'s no export button, but you can view the complete draft board and player list to record results manually.',
      },
      {
        q: 'How long are drafts stored?',
        a: 'Drafts are stored indefinitely. You can access past drafts anytime from your dashboard.',
      },
      {
        q: 'Can I delete a draft?',
        a: 'Currently drafts cannot be deleted through the UI. Contact support if you need a draft removed.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>

      <p className="text-lg text-gray-600 mb-8">
        Find answers to common questions about Draft Night. Can't find what you're looking for?
        Check our other help guides for detailed walkthroughs.
      </p>

      <div className="space-y-12">
        {faqs.map((section) => (
          <section key={section.category}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{section.category}</h2>
            <div className="space-y-6">
              {section.questions.map((item, index) => (
                <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{item.q}</h3>
                  <p className="text-gray-600">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Still Need Help */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Still Have Questions?</h2>
        <p className="text-gray-600 mb-6">
          Check out our detailed guides for step-by-step instructions:
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/help/getting-started" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-center">
            <span className="text-2xl mb-2 block">🚀</span>
            <span className="font-medium text-gray-900">Getting Started</span>
          </Link>
          <Link href="/help/running-a-draft" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-center">
            <span className="text-2xl mb-2 block">⏱️</span>
            <span className="font-medium text-gray-900">Running a Draft</span>
          </Link>
          <Link href="/help/trading-corrections" className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-center">
            <span className="text-2xl mb-2 block">🔄</span>
            <span className="font-medium text-gray-900">Trading & Corrections</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
