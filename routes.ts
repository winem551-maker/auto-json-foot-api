import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import path from "path";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Servir le dossier static pour que le fichier pronostics.json soit accessible publiquement
  app.use('/static', express.static(path.join(process.cwd(), 'static')));
  
  // Route API pour obtenir les pronostics (optionnelle, pour faciliter l'accès)
  app.get('/api/pronostics', async (_req, res) => {
    try {
      const fs = await import('fs/promises');
      const pronosticsPath = path.join(process.cwd(), 'static', 'pronostics.json');
      const data = await fs.readFile(pronosticsPath, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ 
        error: 'Impossible de lire les pronostics',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  });

  return httpServer;
}
