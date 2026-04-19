import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USAGE_FILE = path.join(__dirname, 'usage.json');

// Limite de sécurité : coût max par mois (en euros)
const MAX_MONTHLY_COST = 45;

// Verrou en mémoire pour éviter les race conditions sur le fichier
let fileLock = Promise.resolve();

function withLock(fn) {
  fileLock = fileLock.then(fn).catch(fn);
  return fileLock;
}

// Charger les données d'usage
async function loadUsage() {
  try {
    const data = await fs.readFile(USAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      currentMonth: new Date().toISOString().slice(0, 7),
      totalCost: 0,
      analyses: [],
      usedSessions: {}
    };
  }
}

// Sauvegarder les données d'usage
async function saveUsage(data) {
  await fs.writeFile(USAGE_FILE, JSON.stringify(data, null, 2));
}

// Réinitialiser si nouveau mois et nettoyer les sessions expirées
function maybeRollover(usage) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (usage.currentMonth !== currentMonth) {
    usage.currentMonth = currentMonth;
    usage.totalCost = 0;
    usage.analyses = [];
    usage.usedSessions = {}; // sessions du mois précédent expirent naturellement
  }
  // Migration : tableau → objet si ancienne structure
  if (Array.isArray(usage.usedSessions)) {
    const obj = {};
    for (const id of usage.usedSessions) obj[id] = true;
    usage.usedSessions = obj;
  }
  return usage;
}

// Vérifier si on peut encore faire une analyse
export async function canAnalyze() {
  const usage = await loadUsage();
  maybeRollover(usage);

  if (usage.totalCost >= MAX_MONTHLY_COST) {
    return {
      allowed: false,
      reason: `Limite mensuelle atteinte (${MAX_MONTHLY_COST}€).`,
      currentCost: usage.totalCost
    };
  }

  return { allowed: true };
}

// Vérification + marquage atomiques pour éviter le double-usage (TOCTOU fix)
export async function checkAndMarkSession(sessionId) {
  return withLock(async () => {
    const usage = await loadUsage();
    maybeRollover(usage);

    if (usage.usedSessions[sessionId]) {
      return { allowed: false };
    }

    usage.usedSessions[sessionId] = true;
    await saveUsage(usage);
    return { allowed: true };
  });
}

// Conservés pour compatibilité — préférer checkAndMarkSession
export async function isSessionUsed(sessionId) {
  const usage = await loadUsage();
  maybeRollover(usage);
  if (Array.isArray(usage.usedSessions)) {
    return usage.usedSessions.includes(sessionId);
  }
  return !!usage.usedSessions[sessionId];
}

export async function markSessionUsed(sessionId) {
  return withLock(async () => {
    const usage = await loadUsage();
    maybeRollover(usage);
    usage.usedSessions[sessionId] = true;
    await saveUsage(usage);
  });
}

// Enregistrer une analyse
export async function trackAnalysis(cost, userId) {
  return withLock(async () => {
    const usage = await loadUsage();
    maybeRollover(usage);

    usage.totalCost += cost;
    usage.analyses.push({
      date: new Date().toISOString(),
      cost,
      userId
    });

    await saveUsage(usage);

    console.log(`📊 Usage du mois : ${usage.totalCost.toFixed(2)}€ / ${MAX_MONTHLY_COST}€`);

    if (usage.totalCost > MAX_MONTHLY_COST * 0.8) {
      console.warn(`⚠️ ALERTE : 80% de la limite mensuelle atteinte !`);
    }

    return usage;
  });
}

// Obtenir les stats du mois
export async function getMonthlyStats() {
  const usage = await loadUsage();
  maybeRollover(usage);
  const sessionCount = Object.keys(usage.usedSessions || {}).length;
  return {
    month: usage.currentMonth,
    totalCost: usage.totalCost,
    analysesCount: usage.analyses.length,
    sessionsUsed: sessionCount,
    remainingBudget: MAX_MONTHLY_COST - usage.totalCost,
    averageCostPerAnalysis: usage.analyses.length > 0
      ? usage.totalCost / usage.analyses.length
      : 0
  };
}
