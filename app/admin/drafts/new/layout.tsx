import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Draft | Draft Night',
  description: 'Create a new Little League draft. Set up your division, year, and number of rounds.',
};

export default function NewDraftLayout({ children }: { children: React.ReactNode }) {
  return children;
}
