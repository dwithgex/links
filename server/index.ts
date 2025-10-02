import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use(express.static("dist"));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error(err);
    });

    // setup vite in development
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = parseInt(process.env.PORT || '3001', 10);
    server.listen(port, '0.0.0.0', async () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
      log(`serving on port ${port}`);
      
      // Limpiar datos antiguos al iniciar el servidor
      try {
        const cleanupResult = await storage.cleanOldData();
        if (cleanupResult.deletedVisits > 0 || cleanupResult.deletedClicks > 0) {
          console.log(`🧹 Limpieza automática completada: ${cleanupResult.deletedVisits} visitas y ${cleanupResult.deletedClicks} clics antiguos eliminados`);
        }
      } catch (error) {
        console.error('❌ Error en limpieza automática:', error);
      }
    });

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
})();
