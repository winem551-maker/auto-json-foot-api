import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { writeFile } from "fs/promises";
import path from "path";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("fr-FR", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

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

      log(logLine);
    }
  });

  next();
});

// Interface pour les matchs API-Football
interface Match {
  fixture: {
    id: number;
    date: string;
  };
  teams: {
    home: { name: string };
    away: { name: string };
  };
  league: {
    name: string;
    country: string;
  };
}

interface Prediction {
  match: string;
  league: string;
  pronostic: string;
  cote: number;
}

interface PronosticsResult {
  cote_sure: number;
  sure_combined: Prediction[];
  cote_risky: number;
  risky_combined: Prediction[];
}

// Données de démonstration en cas d'échec de l'API
function getMockMatches(): Match[] {
  const mockMatches: Match[] = [
    {
      fixture: { id: 1, date: new Date().toISOString() },
      teams: { home: { name: "Paris Saint-Germain" }, away: { name: "Olympique Marseille" } },
      league: { name: "Ligue 1", country: "France" }
    },
    {
      fixture: { id: 2, date: new Date().toISOString() },
      teams: { home: { name: "Manchester City" }, away: { name: "Liverpool" } },
      league: { name: "Premier League", country: "England" }
    },
    {
      fixture: { id: 3, date: new Date().toISOString() },
      teams: { home: { name: "Real Madrid" }, away: { name: "Barcelona" } },
      league: { name: "La Liga", country: "Spain" }
    },
    {
      fixture: { id: 4, date: new Date().toISOString() },
      teams: { home: { name: "Bayern Munich" }, away: { name: "Borussia Dortmund" } },
      league: { name: "Bundesliga", country: "Germany" }
    },
    {
      fixture: { id: 5, date: new Date().toISOString() },
      teams: { home: { name: "Juventus" }, away: { name: "Inter Milan" } },
      league: { name: "Serie A", country: "Italy" }
    },
    {
      fixture: { id: 6, date: new Date().toISOString() },
      teams: { home: { name: "Arsenal" }, away: { name: "Chelsea" } },
      league: { name: "Premier League", country: "England" }
    },
    {
      fixture: { id: 7, date: new Date().toISOString() },
      teams: { home: { name: "Atletico Madrid" }, away: { name: "Sevilla" } },
      league: { name: "La Liga", country: "Spain" }
    },
    {
      fixture: { id: 8, date: new Date().toISOString() },
      teams: { home: { name: "Lyon" }, away: { name: "Monaco" } },
      league: { name: "Ligue 1", country: "France" }
    },
  ];
  
  log("Utilisation de données de démonstration", "API-Football");
  return mockMatches;
}

// Fonction pour récupérer les matchs du jour depuis l'API Football
async function fetchTodayMatches(): Promise<Match[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  
  if (!apiKey) {
    log("RAPIDAPI_KEY non définie - utilisation des données de démonstration", "API-Football");
    return getMockMatches();
  }

  const today = new Date().toISOString().split('T')[0];
  
  log(`Récupération des matchs pour le ${today}...`, "API-Football");

  try {
    const response = await fetch(
      `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
          'x-rapidapi-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      log(`Erreur API ${response.status} - utilisation des données de démonstration`, "API-Football");
      return getMockMatches();
    }

    const data = await response.json();
    
    if (!data.response || !Array.isArray(data.response) || data.response.length === 0) {
      log("Aucun match trouvé pour aujourd'hui - utilisation des données de démonstration", "API-Football");
      return getMockMatches();
    }

    log(`${data.response.length} matchs récupérés depuis l'API`, "API-Football");
    return data.response;
  } catch (error) {
    log(`Erreur lors de la récupération: ${error} - utilisation des données de démonstration`, "API-Football");
    return getMockMatches();
  }
}

// Fonction d'analyse pour générer les pronostics
function analyzeMatches(matches: Match[]): PronosticsResult {
  log("Analyse des matchs en cours...", "Analyseur");

  if (matches.length === 0) {
    return {
      cote_sure: 1.00,
      sure_combined: [],
      cote_risky: 1.00,
      risky_combined: [],
    };
  }

  const sureBets: Prediction[] = [];
  const riskyBets: Prediction[] = [];

  // Analyse simplifiée : sélectionner les matchs et générer des pronostics
  // Cette logique peut être améliorée avec des algorithmes plus sophistiqués
  matches.slice(0, 10).forEach((match, index) => {
    const matchName = `${match.teams.home.name} vs ${match.teams.away.name}`;
    const league = `${match.league.name} (${match.league.country})`;
    
    // Générer des pronostics variés avec des cotes simulées
    const predictions = [
      { type: "1X2 - Domicile", cote: 1.5 + Math.random() * 1.5 },
      { type: "1X2 - Match Nul", cote: 2.8 + Math.random() * 1.2 },
      { type: "1X2 - Extérieur", cote: 2.0 + Math.random() * 2.0 },
      { type: "Plus de 2.5 buts", cote: 1.6 + Math.random() * 0.8 },
      { type: "Moins de 2.5 buts", cote: 1.8 + Math.random() * 0.9 },
    ];

    // Sélectionner un pronostic "sûr" (cote plus basse)
    const safePred = predictions[0];
    sureBets.push({
      match: matchName,
      league: league,
      pronostic: safePred.type,
      cote: parseFloat(safePred.cote.toFixed(2)),
    });

    // Sélectionner un pronostic "risqué" (cote plus haute)
    if (index < 5) {
      const riskyPred = predictions[2];
      riskyBets.push({
        match: matchName,
        league: league,
        pronostic: riskyPred.type,
        cote: parseFloat(riskyPred.cote.toFixed(2)),
      });
    }
  });

  // Calculer les cotes combinées
  const coteSure = sureBets.reduce((acc, bet) => acc * bet.cote, 1.0);
  const coteRisky = riskyBets.reduce((acc, bet) => acc * bet.cote, 1.0);

  log(`Combiné sûr: ${sureBets.length} paris, cote totale: ${coteSure.toFixed(2)}`, "Analyseur");
  log(`Combiné risqué: ${riskyBets.length} paris, cote totale: ${coteRisky.toFixed(2)}`, "Analyseur");

  return {
    cote_sure: parseFloat(coteSure.toFixed(2)),
    sure_combined: sureBets,
    cote_risky: parseFloat(coteRisky.toFixed(2)),
    risky_combined: riskyBets,
  };
}

// Fonction pour sauvegarder le JSON dans le dossier static
async function savePronostics(pronostics: PronosticsResult): Promise<void> {
  const filePath = path.join(process.cwd(), "static", "pronostics.json");
  
  try {
    await writeFile(filePath, JSON.stringify(pronostics, null, 2), "utf-8");
    log(`Pronostics sauvegardés dans ${filePath}`, "Sauvegarde");
  } catch (error) {
    log(`Erreur lors de la sauvegarde: ${error}`, "Sauvegarde");
    throw error;
  }
}

// Fonction principale d'automatisation
async function runAutomaticAnalysis(): Promise<void> {
  log("=== DÉMARRAGE DE L'ANALYSE AUTOMATIQUE ===", "Système");
  
  try {
    // 1. Récupérer les matchs du jour
    const matches = await fetchTodayMatches();
    
    // 2. Analyser et générer les pronostics
    const pronostics = analyzeMatches(matches);
    
    // 3. Sauvegarder le résultat dans pronostics.json
    await savePronostics(pronostics);
    
    log("=== ANALYSE TERMINÉE AVEC SUCCÈS ===", "Système");
    log(`Fichier pronostics.json généré avec ${pronostics.sure_combined.length} paris sûrs et ${pronostics.risky_combined.length} paris risqués`, "Système");
  } catch (error) {
    log(`=== ERREUR LORS DE L'ANALYSE: ${error} ===`, "Système");
  }
}

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    async () => {
      log(`Serveur démarré sur le port ${port}`, "express");
      
      // EXÉCUTION AUTOMATIQUE AU DÉMARRAGE
      log("Lancement de l'analyse automatique...", "express");
      await runAutomaticAnalysis();
    },
  );
})();
