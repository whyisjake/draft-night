import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Draft Night</h1>
        <p className="text-gray-600">Little League Draft Management</p>

        <div className="space-y-4 pt-8">
          <Link
            href="/admin"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Admin Login
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">or</span>
            </div>
          </div>

          <form action="/draft" method="GET" className="space-y-3">
            <input
              type="text"
              name="key"
              placeholder="Enter access key to view draft"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              View Draft
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
