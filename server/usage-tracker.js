import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USAGE_FILE = path.join(__dirname, 'usage.json');

// Limite de sécurité : coût max par mois (en euros)
// Mis à 45€ pour bloquer AVANT la limite OpenAI (50€)
const MAX_MONTHLY_COST = 45;

// Charger les données d'usage
async function loadUsage() {
  try {
    const data = await fs.readFile(USAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { 
      currentMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
      totalCost: 0,
      analyses: []
    };
  }
}

// Sauvegarder les données d'usage
async function saveUsage(data) {
  await fs.writeFile(USAGE_FILE, JSON.stringify(data, null, 2));
}

// Vérifier si on peut encore faire une analyse
export async function canAnalyze() {
  const usage = await loadUsage();
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  // Réinitialiser si nouveau mois
  if (usage.currentMonth !== currentMonth) {
    usage.currentMonth = currentMonth;
    usage.totalCost = 0;
    usage.analyses = [];
    await saveUsage(usage);
  }
  
  // Vérifier la limite
  if (usage.totalCost >= MAX_MONTHLY_COST) {
    return {
      allowed: false,
      reason: `Limite mensuelle atteinte (${MAX_MONTHLY_COST}€). Service temporairement indisponible.`,
      currentCost: usage.totalCost
    };
  }
  
  return { allowed: true };
}

// Enregistrer une analyse
export async function trackAnalysis(cost, userId) {
  const usage = await loadUsage();
  
  usage.totalCost += cost;
  usage.analyses.push({
    date: new Date().toISOString(),
    cost: cost,
    userId: userId
  });
  
  await saveUsage(usage);
  
  console.log(`📊 Usage du mois : ${usage.totalCost.toFixed(2)}€ / ${MAX_MONTHLY_COST}€`);
  
  // Alerte si proche de la limite
  if (usage.totalCost > MAX_MONTHLY_COST * 0.8) {
    console.warn(`⚠️ ALERTE : 80% de la limite mensuelle atteinte !`);
  }
  
  return usage;
}

// Obtenir les stats du mois
export async function getMonthlyStats() {
  const usage = await loadUsage();
  return {
    month: usage.currentMonth,
    totalCost: usage.totalCost,
    analysesCount: usage.analyses.length,
    remainingBudget: MAX_MONTHLY_COST - usage.totalCost,
    averageCostPerAnalysis: usage.analyses.length > 0 
      ? usage.totalCost / usage.analyses.length 
      : 0
  };
}
