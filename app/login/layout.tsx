import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to Draft Night to create and manage your Little League drafts.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
