import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Draft Night - Little League Draft Manager',
    template: '%s | Draft Night',
  },
  description: 'Real-time Little League baseball draft management. Run snake drafts, track picks live, and keep coaches in the loop.',
  keywords: ['little league', 'draft', 'baseball', 'softball', 'snake draft', 'team management'],
  authors: [{ name: 'Jake Spurlock', url: 'https://jakespurlock.com' }],
  creator: 'Jake Spurlock',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Draft Night',
    title: 'Draft Night - Little League Draft Manager',
    description: 'Real-time Little League baseball draft management. Run snake drafts, track picks live, and keep coaches in the loop.',
  },
  twitter: {
    card: 'summary',
    title: 'Draft Night - Little League Draft Manager',
    description: 'Real-time Little League baseball draft management.',
    creator: '@whyisjake',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <SessionProvider>
          <div className="flex-1">{children}</div>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
