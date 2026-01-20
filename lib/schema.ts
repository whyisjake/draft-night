import { pgTable, text, integer, real, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core';

// NextAuth.js tables
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  isSuperAdmin: boolean('is_super_admin').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const accounts = pgTable('accounts', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => [
  primaryKey({ columns: [account.provider, account.providerAccountId] }),
]);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (vt) => [
  primaryKey({ columns: [vt.identifier, vt.token] }),
]);

// Application tables
export const drafts = pgTable('drafts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  league: text('league'),
  division: text('division').notNull(),
  year: integer('year').notNull(),
  status: text('status').notNull().default('setup'),
  accessKey: text('access_key').unique().notNull(),
  currentRound: integer('current_round').notNull().default(1),
  currentPick: integer('current_pick').notNull().default(1),
  totalRounds: integer('total_rounds').notNull().default(12),
  pickStartedAt: timestamp('pick_started_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const teams = pgTable('teams', {
  id: text('id').primaryKey(),
  draftId: text('draft_id').notNull().references(() => drafts.id),
  name: text('name'),
  coachNames: text('coach_names').notNull(),
  draftPosition: integer('draft_position').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const players = pgTable('players', {
  id: text('id').primaryKey(),
  draftId: text('draft_id').notNull().references(() => drafts.id),
  fullName: text('full_name').notNull(),
  rating: real('rating'),
  llAge: integer('ll_age'),
  previousManager: text('previous_manager'),
  previousTeam: text('previous_team'),
  notes: text('notes'),
  rankingNumber: integer('ranking_number'),
  isCoachKid: boolean('is_coach_kid').notNull().default(false),
  coachKidTeamId: text('coach_kid_team_id').references(() => teams.id),
  coachKidRound: integer('coach_kid_round'),
  isDrafted: boolean('is_drafted').notNull().default(false),
  draftedByTeamId: text('drafted_by_team_id').references(() => teams.id),
  roundDrafted: integer('round_drafted'),
  pickNumber: integer('pick_number'),
  // Additional player info fields
  swimTeam: boolean('swim_team').default(false),
  otherSports: boolean('other_sports').default(false),
  availability80: boolean('availability_80').default(true),
  teammateRequest: text('teammate_request'),
  specialRequest: text('special_request'),
  pitchCount: integer('pitch_count'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Draft = typeof drafts.$inferSelect;
export type NewDraft = typeof drafts.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
