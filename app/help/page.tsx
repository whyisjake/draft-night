import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center - Draft Night',
  description: 'Learn how to use Draft Night for your Little League or youth sports draft. Guides for draft administrators and coaches.',
};

const helpTopics = [
  {
    href: '/help/methodology',
    title: 'Draft Methodology',
    description: 'Understand the philosophy behind Draft Night, why key decisions were made, and best practices for success.',
    icon: '📋',
  },
  {
    href: '/help/getting-started',
    title: 'Getting Started',
    description: 'Create a draft, add teams, and import your player list. Everything you need to set up your first draft.',
    icon: '🚀',
  },
  {
    href: '/help/running-a-draft',
    title: 'Running a Live Draft',
    description: 'Learn how to make picks, manage the timer, undo mistakes, and keep the draft moving smoothly.',
    icon: '⏱️',
  },
  {
    href: '/help/player-management',
    title: 'Player Management',
    description: 'Import players from a spreadsheet, edit ratings and rankings, and pre-assign coach kids to teams.',
    icon: '👥',
  },
  {
    href: '/help/trading-corrections',
    title: 'Trading & Corrections',
    description: 'Trade players between teams, remove players from the board, and manually place players in slots.',
    icon: '🔄',
  },
  {
    href: '/help/coach-view',
    title: 'Coach View',
    description: 'How coaches can follow along with the draft in real-time, get alerts, and view player information.',
    icon: '📱',
  },
  {
    href: '/help/moving-players',
    title: 'Moving Players Between Drafts',
    description: 'Transfer undrafted players from one division to another - perfect for moving players down after a draft.',
    icon: '📦',
  },
  {
    href: '/help/faq',
    title: 'Frequently Asked Questions',
    description: 'Answers to common questions about Draft Night, troubleshooting tips, and more.',
    icon: '❓',
  },
];

export default function HelpPage() {
  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help?</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Draft Night makes running your Little League or youth sports draft easy.
          Find guides for administrators running the draft and coaches following along.
        </p>
      </div>

      {/* Topic Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {helpTopics.map((topic) => (
          <Link
            key={topic.href}
            href={topic.href}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition group"
          >
            <div className="flex gap-4">
              <span className="text-3xl">{topic.icon}</span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {topic.title}
                </h2>
                <p className="text-gray-600 mt-1">{topic.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 text-center bg-blue-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to run your draft?</h2>
        <p className="text-gray-600 mb-6">Create a free account and set up your draft in minutes.</p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Get Started Free
        </Link>
      </div>
    </div>
  );
}
