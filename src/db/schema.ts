import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull().unique(),
  username: text('username').notNull(),
  passwordHash: text('password_hash'),
  salt: text('salt'),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default('USER'), // 'OWNER' | 'ADMIN' | 'MODERATOR' | 'USER'
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE' | 'SUSPENDED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastActivityAt: timestamp('last_activity_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorId: integer('actor_id'),
  actorUsername: text('actor_username'),
  action: text('action').notNull(),
  targetId: text('target_id'),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const siteContent = pgTable('site_content', {
  id: text('id').primaryKey(), // 'main_site'
  publishedData: text('published_data').notNull(),
  draftData: text('draft_data'),
  lastUpdatedBy: text('last_updated_by'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const visitorActivity = pgTable('visitor_activity', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  userId: integer('user_id'),
  isAnonymous: boolean('is_anonymous').notNull().default(true),
  pagePath: text('page_path').notNull(),
  userAgent: text('user_agent'),
  durationSeconds: integer('duration_seconds').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  isReviewed: boolean('is_reviewed').notNull().default(false),
  isHidden: boolean('is_hidden').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  authorId: integer('author_id'),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').notNull(),
  isPinned: boolean('is_pinned').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

