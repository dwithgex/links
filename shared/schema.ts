import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  username: text("username").notNull().unique(),
  password: text("password"),
  discordId: text("discord_id").unique(),
  discordUsername: text("discord_username"),
  discordAvatar: text("discord_avatar"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  lastLogin: integer("last_login", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const visits = sqliteTable("visits", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  timestamp: integer("timestamp", { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const clicks = sqliteTable("clicks", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  referrer: text("referrer"),
  timestamp: integer("timestamp", { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const shortLinks = sqliteTable("short_links", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  shortCode: text("short_code").notNull().unique(),
  originalUrl: text("original_url").notNull(),
  platform: text("platform").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  clickCount: integer("click_count").notNull().default(0),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  discordId: true,
  discordUsername: true,
  discordAvatar: true,
});

export const insertVisitSchema = createInsertSchema(visits).omit({
  id: true,
  timestamp: true,
});

export const insertClickSchema = createInsertSchema(clicks).omit({
  id: true,
  timestamp: true,
});

export const insertShortLinkSchema = createInsertSchema(shortLinks).omit({
  id: true,
  clickCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type Visit = typeof visits.$inferSelect;
export type InsertClick = z.infer<typeof insertClickSchema>;
export type Click = typeof clicks.$inferSelect;
export type InsertShortLink = z.infer<typeof insertShortLinkSchema>;
export type ShortLink = typeof shortLinks.$inferSelect;
