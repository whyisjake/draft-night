import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let _db: NeonHttpDatabase<typeof schema> | null = null;

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (_db) return _db;

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql: NeonQueryFunction<boolean, boolean> = neon(process.env.DATABASE_URL);
  _db = drizzle(sql, { schema });
  return _db;
}

// Proxy for lazy initialization (for general use)
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
});

export default db;
