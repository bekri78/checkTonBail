import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, 'users.json');

// Lire les données utilisateurs
async function loadUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { users: {} };
  }
}

// Sauvegarder les données utilisateurs
async function saveUsers(data) {
  await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2));
}

// Obtenir les crédits d'un utilisateur (identifié par email ou sessionId)
export async function getCredits(userId) {
  const data = await loadUsers();
  return data.users[userId]?.credits || 0;
}

// Ajouter des crédits à un utilisateur
export async function addCredits(userId, amount) {
  const data = await loadUsers();
  if (!data.users[userId]) {
    data.users[userId] = { credits: 0, history: [] };
  }
  data.users[userId].credits += amount;
  data.users[userId].history.push({
    date: new Date().toISOString(),
    type: 'purchase',
    amount: amount
  });
  await saveUsers(data);
  return data.users[userId].credits;
}

// Consommer un crédit
export async function useCredit(userId) {
  const data = await loadUsers();
  if (!data.users[userId] || data.users[userId].credits <= 0) {
    return false; // Pas assez de crédits
  }
  data.users[userId].credits -= 1;
  data.users[userId].history.push({
    date: new Date().toISOString(),
    type: 'usage',
    amount: -1
  });
  await saveUsers(data);
  return true;
}

// Créer un utilisateur avec des crédits gratuits (première visite)
export async function createUser(userId, freeCredits = 1) {
  const data = await loadUsers();
  if (!data.users[userId]) {
    data.users[userId] = {
      credits: freeCredits,
      history: [{
        date: new Date().toISOString(),
        type: 'welcome',
        amount: freeCredits
      }]
    };
    await saveUsers(data);
  }
  return data.users[userId];
}
