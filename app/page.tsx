import Link from 'next/link';
import { Metadata } from 'next';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Draft Night - Little League Draft Manager',
  description: 'Real-time Little League baseball draft management. No more spreadsheet chaos. Run snake drafts, auto-place coach kids, and let coaches follow along live.',
  openGraph: {
    title: 'Draft Night - Little League Draft Manager',
    description: 'Real-time Little League baseball draft management. No more spreadsheet chaos.',
    type: 'website',
  },
};

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Draft Night
          </Link>
          <nav className="flex items-center gap-4">
            {session?.user ? (
              <>
                <span className="text-gray-600 text-sm">Hi, {session.user.name?.split(' ')[0]}</span>
                <Link
                  href="/admin"
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                >
                  My Drafts
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Draft Night</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time Little League draft management. No more spreadsheet chaos.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <Link
            href={session?.user ? "/admin" : "/login"}
            className="block bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Run a Draft</h2>
            <p className="text-gray-600 mb-4">
              Create and manage drafts, import players, control the pick order.
            </p>
            <span className="text-blue-600 font-medium">
              {session?.user ? "Go to My Drafts" : "Sign in to get started"} &rarr;
            </span>
          </Link>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">View a Draft</h2>
            <p className="text-gray-600 mb-4">
              Got an access key? Watch the draft unfold in real-time.
            </p>
            <form action="/draft" method="GET" className="flex gap-2">
              <input
                type="text"
                name="key"
                placeholder="Enter access key"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-Time Updates</h3>
              <p className="text-gray-600 text-sm">
                Coaches see picks instantly. No refreshing needed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Snake Draft Logic</h3>
              <p className="text-gray-600 text-sm">
                Automatic turn order. Coach kids auto-placed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Pick Notifications</h3>
              <p className="text-gray-600 text-sm">
                Desktop alerts keep everyone in the loop.
              </p>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">The Story</h2>
          <p className="text-gray-600 mb-4">
            After 10+ years of running Little League drafts with Google Sheets - copying cells,
            manually tracking snake draft order, and hoping the spreadsheet didn&apos;t break mid-draft -
            I decided to build something better.
          </p>
          <p className="text-gray-600 mb-4">
            Draft Night is the tool I wish I had all those years ago. It handles the snake draft
            logic automatically, pre-places coach kids in their assigned rounds, and lets all the
            coaches follow along in real-time without any risk of someone accidentally editing a cell.
          </p>
          <p className="text-gray-600">
            Built by{' '}
            <a
              href="https://twitter.com/whyisjake"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Jake Spurlock
            </a>
          </p>
        </div>

      </div>
    </main>
  );
}
