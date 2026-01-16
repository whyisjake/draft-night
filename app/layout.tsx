import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Draft Night - Little League Draft Manager',
  description: 'Real-time Little League baseball draft management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
