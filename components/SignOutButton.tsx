'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="py-2 px-4 rounded-lg font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
    >
      Sign Out
    </button>
  );
}
