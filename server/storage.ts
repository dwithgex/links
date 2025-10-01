import { 
  users, 
  visits, 
  clicks,
  type User, 
  type InsertUser,
  type Visit,
  type InsertVisit,
  type Click,
  type InsertClick
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createVisit(visit: InsertVisit): Promise<Visit>;
  createClick(click: InsertClick): Promise<Click>;
  getAllClicks(): Promise<Click[]>;
  getAllVisits(): Promise<Visit[]>;
  getClickStats(): Promise<{ platform: string; count: number; url: string }[]>;
  getVisitStats(): Promise<{ referrer: string; count: number }[]>;
  getTotalClicks(): Promise<number>;
  getTotalVisits(): Promise<number>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
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

  async getClickStats(): Promise<{ platform: string; count: number; url: string }[]> {
    const result = await db
      .select({
        platform: clicks.platform,
        url: clicks.url,
        count: sql<number>`count(*)::int`,
      })
      .from(clicks)
      .groupBy(clicks.platform, clicks.url);
    return result;
  }

  async getVisitStats(): Promise<{ referrer: string; count: number }[]> {
    const result = await db
      .select({
        referrer: sql<string>`COALESCE(${visits.referrer}, 'Direct')`,
        count: sql<number>`count(*)::int`,
      })
      .from(visits)
      .groupBy(visits.referrer);
    return result;
  }

  async getTotalClicks(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(clicks);
    return result[0]?.count || 0;
  }

  async getTotalVisits(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(visits);
    return result[0]?.count || 0;
  }
}

export const storage = new DatabaseStorage();
