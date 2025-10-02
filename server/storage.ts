import { 
  users, 
  visits, 
  clicks,
  shortLinks,
  type User, 
  type InsertUser,
  type Visit,
  type InsertVisit,
  type Click,
  type InsertClick,
  type ShortLink,
  type InsertShortLink
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserDiscordInfo(discordId: string, updates: Partial<InsertUser>): Promise<User>;
  createVisit(visit: InsertVisit): Promise<Visit>;
  createClick(click: InsertClick): Promise<Click>;
  getAllClicks(): Promise<Click[]>;
  getAllVisits(): Promise<Visit[]>;
  getClickStats(days?: number): Promise<{ platform: string; count: number; url: string }[]>;
  getVisitStats(days?: number): Promise<{ referrer: string; count: number }[]>;
  getTotalClicks(days?: number): Promise<number>;
  getTotalVisits(days?: number): Promise<number>;
  getVisitsByDay(days?: number): Promise<{ date: string; count: number }[]>;
  getPreviousVisits(days?: number): Promise<number>;
  getClicksByDay(days?: number): Promise<{ date: string; count: number }[]>;
  getPreviousClicks(days?: number): Promise<number>;
  getUniqueUsers(days?: number): Promise<number>;
  getUsersByDay(days?: number): Promise<{ date: string; count: number }[]>;
  cleanOldData(): Promise<{ deletedVisits: number; deletedClicks: number }>;
  // Short links methods
  createShortLink(shortLink: InsertShortLink): Promise<ShortLink>;
  getShortLink(shortCode: string): Promise<ShortLink | undefined>;
  getAllShortLinks(): Promise<ShortLink[]>;
  updateShortLinkClicks(shortCode: string): Promise<void>;
  updateShortLink(shortCode: string, updates: Partial<InsertShortLink>): Promise<ShortLink>;
  deleteShortLink(shortCode: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserDiscordInfo(discordId: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, lastLogin: sql`(unixepoch())` })
      .where(eq(users.discordId, discordId))
      .returning();
    return user;
  }

  async createVisit(insertVisit: InsertVisit): Promise<Visit> {
    const [visit] = await db.insert(visits).values(insertVisit).returning();
    return visit;
  }

  async createClick(insertClick: InsertClick): Promise<Click> {
    const [click] = await db.insert(clicks).values(insertClick).returning();
    return click;
  }

  async getAllClicks(): Promise<Click[]> {
    return db.select().from(clicks).orderBy(desc(clicks.timestamp));
  }

  async getAllVisits(): Promise<Visit[]> {
    return db.select().from(visits).orderBy(desc(visits.timestamp));
  }

  async getClickStats(days?: number): Promise<{ platform: string; count: number; url: string }[]> {
    if (days) {
      const cutoffTime = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
      const result = await db
        .select({
          platform: clicks.platform,
          url: clicks.url,
          count: sql<number>`count(*)`,
        })
        .from(clicks)
        .where(sql`${clicks.timestamp} >= ${cutoffTime}`)
        .groupBy(clicks.platform, clicks.url);
      return result;
    } else {
      const result = await db
        .select({
          platform: clicks.platform,
          url: clicks.url,
          count: sql<number>`count(*)`,
        })
        .from(clicks)
        .groupBy(clicks.platform, clicks.url);
      return result;
    }
  }

  async getVisitStats(days?: number): Promise<{ referrer: string; count: number }[]> {
    if (days) {
      const cutoffTime = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
      const result = await db
        .select({
          referrer: sql<string>`COALESCE(${visits.referrer}, 'Direct')`,
          count: sql<number>`count(*)`,
        })
        .from(visits)
        .where(sql`${visits.timestamp} >= ${cutoffTime}`)
        .groupBy(visits.referrer);
      return result;
    } else {
      const result = await db
        .select({
          referrer: sql<string>`COALESCE(${visits.referrer}, 'Direct')`,
          count: sql<number>`count(*)`,
        })
        .from(visits)
        .groupBy(visits.referrer);
      return result;
    }
  }

  async getTotalClicks(days?: number): Promise<number> {
    if (days) {
      const cutoffTime = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(clicks)
        .where(sql`${clicks.timestamp} >= ${cutoffTime}`);
      return result[0]?.count || 0;
    } else {
      const result = await db.select({ count: sql<number>`count(*)` }).from(clicks);
      return result[0]?.count || 0;
    }
  }

  async getTotalVisits(days?: number): Promise<number> {
    if (days) {
      const cutoffTime = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(visits)
        .where(sql`${visits.timestamp} >= ${cutoffTime}`);
      return result[0]?.count || 0;
    } else {
      const result = await db.select({ count: sql<number>`count(*)` }).from(visits);
      return result[0]?.count || 0;
    }
  }

  async getVisitsByDay(days: number = 7): Promise<{ date: string; count: number }[]> {
    const cutoffTime = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
    
    const result = await db
      .select({
        date: sql<string>`date(${visits.timestamp}, 'unixepoch')`,
        count: sql<number>`count(*)`,
      })
      .from(visits)
      .where(sql`${visits.timestamp} >= ${cutoffTime}`)
      .groupBy(sql`date(${visits.timestamp}, 'unixepoch')`)
      .orderBy(sql`date(${visits.timestamp}, 'unixepoch')`);
    
    return result;
  }

  async getPreviousVisits(days: number = 7): Promise<number> {
    const endTime = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
    const startTime = endTime - (days * 24 * 60 * 60);
    
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(visits)
      .where(sql`${visits.timestamp} >= ${startTime} AND ${visits.timestamp} < ${endTime}`);
    
    return result[0]?.count || 0;
  }

  async getClicksByDay(days: number = 7): Promise<{ date: string; count: number }[]> {
    const cutoffTime = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
    
    const result = await db
      .select({
        date: sql<string>`date(${clicks.timestamp}, 'unixepoch')`,
        count: sql<number>`count(*)`,
      })
      .from(clicks)
      .where(sql`${clicks.timestamp} >= ${cutoffTime}`)
      .groupBy(sql`date(${clicks.timestamp}, 'unixepoch')`)
      .orderBy(sql`date(${clicks.timestamp}, 'unixepoch')`);
    
    return result;
  }

  async getPreviousClicks(days: number = 7): Promise<number> {
    const endTime = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
    const startTime = endTime - (days * 24 * 60 * 60);
    
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(clicks)
      .where(sql`${clicks.timestamp} >= ${startTime} AND ${clicks.timestamp} < ${endTime}`);
    
    return result[0]?.count || 0;
  }

  // Short links methods
  async createShortLink(insertShortLink: InsertShortLink): Promise<ShortLink> {
    const [shortLink] = await db.insert(shortLinks).values(insertShortLink).returning();
    return shortLink;
  }

  async getShortLink(shortCode: string): Promise<ShortLink | undefined> {
    const [shortLink] = await db.select().from(shortLinks).where(eq(shortLinks.shortCode, shortCode));
    return shortLink || undefined;
  }

  async getAllShortLinks(): Promise<ShortLink[]> {
    return db.select().from(shortLinks).orderBy(desc(shortLinks.createdAt));
  }

  async updateShortLinkClicks(shortCode: string): Promise<void> {
    await db
      .update(shortLinks)
      .set({ 
        clickCount: sql`${shortLinks.clickCount} + 1`,
        updatedAt: sql`(unixepoch())`
      })
      .where(eq(shortLinks.shortCode, shortCode));
  }

  async updateShortLink(shortCode: string, updates: Partial<InsertShortLink>): Promise<ShortLink> {
    const [shortLink] = await db
      .update(shortLinks)
      .set({ ...updates, updatedAt: sql`(unixepoch())` })
      .where(eq(shortLinks.shortCode, shortCode))
      .returning();
    return shortLink;
  }

  async deleteShortLink(shortCode: string): Promise<void> {
    await db.delete(shortLinks).where(eq(shortLinks.shortCode, shortCode));
  }

  async getUniqueUsers(days?: number): Promise<number> {
    const cutoffTime = days ? Date.now() / 1000 - (days * 24 * 60 * 60) : 0;
    
    const result = await db
      .select({ 
        uniqueCount: sql<number>`COUNT(DISTINCT ${visits.userAgent})` 
      })
      .from(visits)
      .where(days ? sql`${visits.timestamp} >= ${cutoffTime}` : sql`1=1`);
    
    return result[0]?.uniqueCount || 0;
  }

  async getUsersByDay(days?: number): Promise<{ date: string; count: number }[]> {
    const cutoffTime = days ? Date.now() / 1000 - (days * 24 * 60 * 60) : 0;
    
    const result = await db
      .select({
        date: sql<string>`date(${visits.timestamp}, 'unixepoch')`,
        count: sql<number>`COUNT(DISTINCT ${visits.userAgent})`
      })
      .from(visits)
      .where(days ? sql`${visits.timestamp} >= ${cutoffTime}` : sql`1=1`)
      .groupBy(sql`date(${visits.timestamp}, 'unixepoch')`)
      .orderBy(sql`date(${visits.timestamp}, 'unixepoch')`);
    
    return result;
  }

  // Función para limpiar datos antiguos (más de 1 año)
  async cleanOldData(): Promise<{ deletedVisits: number; deletedClicks: number }> {
    const oneYearAgo = Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60);
    
    // Eliminar visitas más antiguas de 1 año
    const deletedVisits = await db
      .delete(visits)
      .where(sql`${visits.timestamp} < ${oneYearAgo}`)
      .returning({ id: visits.id });
    
    // Eliminar clics más antiguos de 1 año
    const deletedClicks = await db
      .delete(clicks)
      .where(sql`${clicks.timestamp} < ${oneYearAgo}`)
      .returning({ id: clicks.id });
    
    return {
      deletedVisits: deletedVisits.length,
      deletedClicks: deletedClicks.length
    };
  }
}

export const storage = new DatabaseStorage();
