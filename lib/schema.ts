import { pgTable, text, integer, real, boolean, timestamp } from 'drizzle-orm/pg-core';

export const drafts = pgTable('drafts', {
  id: text('id').primaryKey(),
  division: text('division').notNull(),
  year: integer('year').notNull(),
  status: text('status').notNull().default('setup'),
  accessKey: text('access_key').unique().notNull(),
  currentRound: integer('current_round').notNull().default(1),
  currentPick: integer('current_pick').notNull().default(1),
  totalRounds: integer('total_rounds').notNull().default(12),
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
  notes: text('notes'),
  rankingNumber: integer('ranking_number'),
  isCoachKid: boolean('is_coach_kid').notNull().default(false),
  coachKidTeamId: text('coach_kid_team_id').references(() => teams.id),
  coachKidRound: integer('coach_kid_round'),
  isDrafted: boolean('is_drafted').notNull().default(false),
  draftedByTeamId: text('drafted_by_team_id').references(() => teams.id),
  roundDrafted: integer('round_drafted'),
  pickNumber: integer('pick_number'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Draft = typeof drafts.$inferSelect;
export type NewDraft = typeof drafts.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
