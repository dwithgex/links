import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVisitSchema, insertClickSchema, insertUserSchema } from "@shared/schema";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const PgSession = ConnectPgSimple(session);

declare module "express-session" {
  interface SessionData {
    userId?: string;
    isAuthenticated?: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  if (!process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD environment variable is required");
  }

  app.use(
    session({
      store: new PgSession({
        pool,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    })
  );

  app.post("/api/track/visit", async (req: Request, res: Response) => {
    try {
      const data = insertVisitSchema.parse({
        referrer: req.body.referrer || req.headers.referer || null,
        userAgent: req.body.userAgent || req.headers["user-agent"] || null,
      });
      const visit = await storage.createVisit(data);
      res.json({ success: true, visit });
    } catch (error) {
      res.status(400).json({ error: "Failed to track visit" });
    }
  });

  app.post("/api/track/click", async (req: Request, res: Response) => {
    try {
      const data = insertClickSchema.parse({
        platform: req.body.platform,
        url: req.body.url,
        referrer: req.body.referrer || req.headers.referer || null,
      });
      const click = await storage.createClick(data);
      res.json({ success: true, click });
    } catch (error) {
      res.status(400).json({ error: "Failed to track click" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (username === "admin" && password === process.env.ADMIN_PASSWORD) {
        req.session.isAuthenticated = true;
        req.session.userId = "admin";
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: "Logout failed" });
      } else {
        res.json({ success: true });
      }
    });
  });

  app.get("/api/auth/check", async (req: Request, res: Response) => {
    res.json({ isAuthenticated: req.session.isAuthenticated || false });
  });

  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (req.session.isAuthenticated) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  app.get("/api/analytics/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const [clickStats, visitStats, totalClicks, totalVisits] = await Promise.all([
        storage.getClickStats(),
        storage.getVisitStats(),
        storage.getTotalClicks(),
        storage.getTotalVisits(),
      ]);

      res.json({
        clickStats,
        visitStats,
        totalClicks,
        totalVisits,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/clicks", requireAuth, async (req: Request, res: Response) => {
    try {
      const clicks = await storage.getAllClicks();
      res.json(clicks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clicks" });
    }
  });

  app.get("/api/analytics/visits", requireAuth, async (req: Request, res: Response) => {
    try {
      const visits = await storage.getAllVisits();
      res.json(visits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch visits" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
