import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, accounts, sessions, verificationTokens } from './schema';
import { eq } from 'drizzle-orm';
import type { Adapter } from 'next-auth/adapters';

// Create database connection for auth
function getAuthDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql);
}

// Emails that should automatically be super admins
const SUPER_ADMIN_EMAILS = ['whyisjake@gmail.com'];

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(getAuthDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user id and super admin status to session
      if (session.user) {
        (session.user as any).id = user.id;
        // Fetch super admin status
        const authDb = getAuthDb();
        const [dbUser] = await authDb.select().from(users).where(eq(users.id, user.id));
        (session.user as any).isSuperAdmin = dbUser?.isSuperAdmin || false;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Automatically set super admin for specific emails
      if (user.email && SUPER_ADMIN_EMAILS.includes(user.email)) {
        const authDb = getAuthDb();
        await authDb.update(users).set({ isSuperAdmin: true }).where(eq(users.id, user.id));
      }
    },
  },
  pages: {
    signIn: '/login',
  },
};

export async function auth() {
  return getServerSession(authOptions);
}

// Type augmentation for session
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isSuperAdmin: boolean;
    };
  }
}
