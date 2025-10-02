import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVisitSchema, insertClickSchema, insertUserSchema, insertShortLinkSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";

const MemorySession = MemoryStore(session);

declare module "express-session" {
  interface SessionData {
    userId?: string;
    isAuthenticated?: boolean;
    discordUser?: {
      id: string;
      username: string;
      avatar?: string;
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    throw new Error("Discord OAuth credentials are required");
  }

  if (!process.env.AUTHORIZED_DISCORD_ID) {
    throw new Error("AUTHORIZED_DISCORD_ID environment variable is required");
  }

  // Configure session middleware
  app.use(
    session({
      store: new MemorySession({
        checkPeriod: 86400000 // prune expired entries every 24h
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

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Discord Strategy
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_REDIRECT_URI || "http://localhost:3001/auth/discord/callback",
    scope: ['identify']
  }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Check if user is authorized
      if (profile.id !== process.env.AUTHORIZED_DISCORD_ID) {
        return done(null, false, { message: 'Unauthorized Discord user' });
      }

      // Check if user exists or create new one
      let user = await storage.getUserByDiscordId(profile.id);
      
      if (!user) {
        user = await storage.createUser({
          username: profile.username,
          discordId: profile.id,
          discordUsername: profile.username,
          discordAvatar: profile.avatar,
        });
      } else {
        // Update user info
        user = await storage.updateUserDiscordInfo(profile.id, {
          discordUsername: profile.username,
          discordAvatar: profile.avatar,
          lastLogin: new Date(),
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Discord OAuth routes
  app.get('/auth/discord', passport.authenticate('discord'));

  // Ruta de prueba para verificar configuración
  app.get('/auth/test', (req: Request, res: Response) => {
    res.json({
      discordClientId: process.env.DISCORD_CLIENT_ID ? 'Configurado' : 'No configurado',
      discordSecret: process.env.DISCORD_CLIENT_SECRET ? 'Configurado' : 'No configurado',
      redirectUri: process.env.DISCORD_REDIRECT_URI,
      authorizedId: process.env.AUTHORIZED_DISCORD_ID,
      currentUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`
    });
  });

  app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/admin?error=unauthorized' }),
    async (req: Request, res: Response) => {
      // Successful authentication
      if (req.user) {
        req.session.isAuthenticated = true;
        req.session.userId = (req.user as any).id;
        req.session.discordUser = {
          id: (req.user as any).discordId,
          username: (req.user as any).discordUsername,
          avatar: (req.user as any).discordAvatar,
        };
        
        // Redirigir al dashboard
        res.redirect('/admin/dashboard');
      } else {
        res.redirect('/admin?error=unauthorized');
      }
    }
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

  app.get("/api/analytics/stats", async (req: Request, res: Response) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : undefined;
      
      const [clickStats, visitStats, totalClicks, totalVisits, visitsByDay, previousVisits, clicksByDay, previousClicks] = await Promise.all([
        storage.getClickStats(days),
        storage.getVisitStats(days),
        storage.getTotalClicks(days),
        storage.getTotalVisits(days),
        days ? storage.getVisitsByDay(days) : Promise.resolve([]),
        days ? storage.getPreviousVisits(days) : Promise.resolve(0),
        days ? storage.getClicksByDay(days) : Promise.resolve([]),
        days ? storage.getPreviousClicks(days) : Promise.resolve(0),
      ]);

      res.json({
        clickStats,
        visitStats,
        totalClicks,
        totalVisits,
        visitsByDay,
        previousVisits,
        clicksByDay,
        previousClicks,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/clicks", async (req: Request, res: Response) => {
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

  app.get("/api/analytics/users", async (req: Request, res: Response) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      
      // Obtener usuarios únicos por IP en los últimos días
      const uniqueUsers = await storage.getUniqueUsers(days);
      
      // Obtener usuarios únicos por día para la gráfica
      const usersByDay = await storage.getUsersByDay(days);
      
      res.json({
        totalUniqueUsers: uniqueUsers,
        usersByDay
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user analytics" });
    }
  });

  app.get("/api/analytics/clicks-by-day", async (req: Request, res: Response) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      
      // Obtener clics por día para la gráfica
      const clicksByDay = await storage.getClicksByDay(days);
      
      // Obtener total de clics
      const totalClicks = await storage.getTotalClicks(days);
      
      // Obtener clics del período anterior para calcular porcentaje
      const previousClicks = await storage.getPreviousClicks(days);
      
      res.json({
        totalClicks,
        clicksByDay,
        previousClicks
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clicks by day" });
    }
  });

  // Endpoint para descargar métricas completas en CSV/JSON
  app.get("/api/analytics/export", async (req: Request, res: Response) => {
    try {
      const format = req.query.format as string || 'csv';
      const days = req.query.days ? parseInt(req.query.days as string) : 365;
      
      // Obtener todos los datos detallados
      const [
        visitsByDay, 
        clicksByDay, 
        usersByDay,
        clickStats,
        visitStats,
        allClicks,
        allVisits
      ] = await Promise.all([
        storage.getVisitsByDay(days),
        storage.getClicksByDay(days),
        storage.getUsersByDay(days),
        storage.getClickStats(days),
        storage.getVisitStats(days),
        storage.getAllClicks(),
        storage.getAllVisits()
      ]);
      
      // Calcular métricas totales
      const totalVisits = await storage.getTotalVisits(days);
      const totalClicks = await storage.getTotalClicks(days);
      const totalUsers = await storage.getUniqueUsers(days);
      const previousVisits = await storage.getPreviousVisits(days);
      const previousClicks = await storage.getPreviousClicks(days);
      
      // Calcular porcentajes de cambio
      const visitsChangePercent = previousVisits > 0 ? ((totalVisits - previousVisits) / previousVisits * 100) : (totalVisits > 0 ? 100 : 0);
      const clicksChangePercent = previousClicks > 0 ? ((totalClicks - previousClicks) / previousClicks * 100) : (totalClicks > 0 ? 100 : 0);
      
      // Filtrar clics recientes para el período
      const recentClicks = allClicks.filter(click => {
        const clickTime = Number(click.timestamp) * 1000;
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        return clickTime >= cutoffTime;
      });
      
      // Filtrar visitas recientes para el período
      const recentVisits = allVisits.filter(visit => {
        const visitTime = Number(visit.timestamp) * 1000;
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        return visitTime >= cutoffTime;
      });
      
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-completo-${new Date().toISOString().split('T')[0]}.json"`);
        res.json({
          metadata: {
            exportDate: new Date().toISOString(),
            period: `${days} días`,
            totalRecords: {
              visits: recentVisits.length,
              clicks: recentClicks.length,
              uniqueUsers: totalUsers
            }
          },
          summary: {
            totalVisits,
            totalClicks,
            totalUsers,
            previousVisits,
            previousClicks,
            visitsChangePercent: Math.round(visitsChangePercent * 100) / 100,
            clicksChangePercent: Math.round(clicksChangePercent * 100) / 100
          },
          chartData: {
            visitsByDay,
            clicksByDay,
            usersByDay
          },
          platformBreakdown: clickStats,
          referrerBreakdown: visitStats,
          rawData: {
            clicks: recentClicks.map(click => ({
              platform: click.platform,
              url: click.url,
              timestamp: Number(click.timestamp),
              date: new Date(Number(click.timestamp) * 1000).toISOString().split('T')[0],
              referrer: click.referrer
            })),
            visits: recentVisits.map(visit => ({
              referrer: visit.referrer,
              userAgent: visit.userAgent,
              timestamp: Number(visit.timestamp),
              date: new Date(Number(visit.timestamp) * 1000).toISOString().split('T')[0]
            }))
          }
        });
      } else {
        // CSV format expandido
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-completo-${new Date().toISOString().split('T')[0]}.csv"`);
        
        let csv = '';
        
        // Sección 1: Resumen Ejecutivo
        csv += 'RESUMEN EJECUTIVO\n';
        csv += 'Métrica,Valor,Período Anterior,Cambio %\n';
        csv += `Total Visitas,${totalVisits},${previousVisits},${Math.round(visitsChangePercent * 100) / 100}%\n`;
        csv += `Total Clics,${totalClicks},${previousClicks},${Math.round(clicksChangePercent * 100) / 100}%\n`;
        csv += `Usuarios Únicos,${totalUsers},N/A,N/A\n`;
        csv += `Período Analizado,${days} días,${new Date().toISOString().split('T')[0]},N/A\n`;
        csv += '\n';
        
        // Sección 2: Datos para Gráfica de Visitas por Día
        csv += 'DATOS GRÁFICA - VISITAS POR DÍA\n';
        csv += 'Fecha,Visitas,Día Semana\n';
        visitsByDay.forEach(visit => {
          const date = new Date(visit.date);
          const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
          csv += `${visit.date},${visit.count},${dayName}\n`;
        });
        csv += '\n';
        
        // Sección 3: Datos para Gráfica de Clics por Día
        csv += 'DATOS GRÁFICA - CLICS POR DÍA\n';
        csv += 'Fecha,Clics,Día Semana\n';
        clicksByDay.forEach(click => {
          const date = new Date(click.date);
          const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
          csv += `${click.date},${click.count},${dayName}\n`;
        });
        csv += '\n';
        
        // Sección 4: Datos para Gráfica de Usuarios por Día
        csv += 'DATOS GRÁFICA - USUARIOS ÚNICOS POR DÍA\n';
        csv += 'Fecha,Usuarios Únicos,Día Semana\n';
        usersByDay.forEach(user => {
          const date = new Date(user.date);
          const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
          csv += `${user.date},${user.count},${dayName}\n`;
        });
        csv += '\n';
        
        // Sección 5: Desglose por Plataforma
        csv += 'DESGLOSE POR PLATAFORMA\n';
        csv += 'Plataforma,Total Clics,URL Destino\n';
        clickStats.forEach(stat => {
          csv += `${stat.platform},${stat.count},${stat.url}\n`;
        });
        csv += '\n';
        
        // Sección 6: Desglose por Fuente de Tráfico
        csv += 'FUENTES DE TRÁFICO\n';
        csv += 'Referrer,Total Visitas\n';
        visitStats.forEach(stat => {
          const referrer = stat.referrer || 'Directo';
          csv += `${referrer},${stat.count}\n`;
        });
        csv += '\n';
        
        // Sección 7: Datos Raw para Análisis Avanzado
        csv += 'DATOS DETALLADOS - CLICS\n';
        csv += 'Fecha,Hora,Plataforma,URL,Referrer\n';
        recentClicks.forEach(click => {
          const date = new Date(Number(click.timestamp) * 1000);
          const dateStr = date.toISOString().split('T')[0];
          const timeStr = date.toISOString().split('T')[1].split('.')[0];
          csv += `${dateStr},${timeStr},${click.platform},${click.url},${click.referrer || 'N/A'}\n`;
        });
        csv += '\n';
        
        csv += 'DATOS DETALLADOS - VISITAS\n';
        csv += 'Fecha,Hora,Referrer,User Agent\n';
        recentVisits.forEach(visit => {
          const date = new Date(Number(visit.timestamp) * 1000);
          const dateStr = date.toISOString().split('T')[0];
          const timeStr = date.toISOString().split('T')[1].split('.')[0];
          const referrer = visit.referrer || 'Directo';
          const userAgent = (visit.userAgent || 'N/A').replace(/,/g, ';'); // Escapar comas
          csv += `${dateStr},${timeStr},${referrer},${userAgent}\n`;
        });
        
        res.send(csv);
      }
    } catch (error) {
      console.error('Error al exportar datos:', error);
      res.status(500).json({ error: "Error al exportar datos completos" });
    }
  });

  // Endpoint para limpiar datos antiguos
  app.post("/api/analytics/cleanup", async (req: Request, res: Response) => {
    try {
      const result = await storage.cleanOldData();
      res.json({
        success: true,
        message: "Limpieza completada",
        deletedVisits: result.deletedVisits,
        deletedClicks: result.deletedClicks
      });
    } catch (error) {
      res.status(500).json({ error: "Error al limpiar datos antiguos" });
    }
  });

  // Short links routes
  app.post("/api/short-links", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = insertShortLinkSchema.parse(req.body);
      const shortLink = await storage.createShortLink(data);
      res.json({ success: true, shortLink });
    } catch (error) {
      res.status(400).json({ error: "Failed to create short link" });
    }
  });

  app.get("/api/short-links", async (req: Request, res: Response) => {
    try {
      const shortLinks = await storage.getAllShortLinks();
      res.json(shortLinks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch short links" });
    }
  });

  app.put("/api/short-links/:shortCode", requireAuth, async (req: Request, res: Response) => {
    try {
      const { shortCode } = req.params;
      const updates = insertShortLinkSchema.partial().parse(req.body);
      const shortLink = await storage.updateShortLink(shortCode, updates);
      res.json({ success: true, shortLink });
    } catch (error) {
      res.status(400).json({ error: "Failed to update short link" });
    }
  });

  app.delete("/api/short-links/:shortCode", requireAuth, async (req: Request, res: Response) => {
    try {
      const { shortCode } = req.params;
      await storage.deleteShortLink(shortCode);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete short link" });
    }
  });

  // Public redirect route for short links
  app.get("/go/:shortCode", async (req: Request, res: Response) => {
    try {
      const { shortCode } = req.params;
      const shortLink = await storage.getShortLink(shortCode);
      
      if (!shortLink || !shortLink.isActive) {
        return res.status(404).json({ error: "Link not found" });
      }

      // Update click count
      await storage.updateShortLinkClicks(shortCode);
      
      // Track the click
      await storage.createClick({
        platform: shortLink.platform,
        url: shortLink.originalUrl,
        referrer: req.headers.referer || null,
      });

      // También registrar una visita cuando alguien accede a través de enlaces cortos
      // Esto cuenta las visitas que llevan al apartado de redes sociales
      await storage.createVisit({
        referrer: req.headers.referer || null,
        userAgent: req.headers["user-agent"] || null,
      });

      // Redirect to original URL
      res.redirect(301, shortLink.originalUrl);
    } catch (error) {
      res.status(500).json({ error: "Redirect failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
