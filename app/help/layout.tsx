import Link from 'next/link';

const helpTopics = [
  { href: '/help/methodology', title: 'Draft Methodology', description: 'Philosophy and best practices' },
  { href: '/help/getting-started', title: 'Getting Started', description: 'Create your first draft' },
  { href: '/help/running-a-draft', title: 'Running a Live Draft', description: 'Making picks and managing the draft' },
  { href: '/help/player-management', title: 'Player Management', description: 'Import, edit, and organize players' },
  { href: '/help/trading-corrections', title: 'Trading & Corrections', description: 'Fix mistakes and trade players' },
  { href: '/help/coach-view', title: 'Coach View', description: 'How coaches follow along' },
  { href: '/help/moving-players', title: 'Moving Players Between Drafts', description: 'Transfer undrafted players' },
  { href: '/help/faq', title: 'FAQ', description: 'Common questions answered' },
];

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/help" className="text-xl font-bold text-gray-900">
            Draft Night Help
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              Back to App
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-800">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden md:block">
          <nav className="sticky top-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Documentation
            </h3>
            <ul className="space-y-1">
              {helpTopics.map((topic) => (
                <li key={topic.href}>
                  <Link
                    href={topic.href}
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    {topic.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>Draft Night - Free draft management for Little League and youth sports</p>
          <p className="mt-2 text-sm">
            <Link href="/help" className="text-blue-600 hover:text-blue-800">Help Center</Link>
            {' · '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800">Sign In</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
