import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import Groq from "groq-sdk";
import multer from "multer";
import { createRequire } from "module";
import { pdfToPng } from "pdf-to-png-converter";
import Stripe from "stripe";
import { getCredits, addCredits, useCredit, createUser } from "./credits.js";
import { canAnalyze, trackAnalysis, getMonthlyStats } from "./usage-tracker.js";
import fs from "fs";
import vision from "@google-cloud/vision";
import { getCountryPrompt, getCountryInfo, getSupportedCountries } from "./country-prompts.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Multer setup for file upload
const upload = multer({ storage: multer.memoryStorage() });

// CORS - Autoriser le frontend (localhost en dev, domaine en prod)
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ["http://localhost:3000"];

app.use(cors({
  origin: corsOrigins,
}));
app.use(express.json());

// ==========================================
// � SECURITY HEADERS
// ==========================================
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// ==========================================
// �🚦 RATE LIMITING - Teasers gratuits par IP
// ==========================================
const RATE_LIMIT_FILE = "./rate-limits.json";
const MAX_FREE_TEASERS_PER_DAY = 3; // Limite par IP par jour

function loadRateLimits() {
  try {
    if (fs.existsSync(RATE_LIMIT_FILE)) {
      return JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Erreur lecture rate-limits.json:", err.message);
  }
  return {};
}

function saveRateLimits(data) {
  fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(data, null, 2));
}

function getClientIP(req) {
  // Récupérer l'IP réelle même derrière un proxy
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.ip || 
         'unknown';
}

function checkRateLimit(ip) {
  const limits = loadRateLimits();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Nettoyer les anciennes entrées (pas d'aujourd'hui)
  const cleanedLimits = {};
  for (const [key, value] of Object.entries(limits)) {
    if (value.date === today) {
      cleanedLimits[key] = value;
    }
  }
  
  // Vérifier la limite pour cette IP
  if (cleanedLimits[ip]) {
    if (cleanedLimits[ip].count >= MAX_FREE_TEASERS_PER_DAY) {
      return { 
        allowed: false, 
        remaining: 0,
        message: `Vous avez atteint la limite de ${MAX_FREE_TEASERS_PER_DAY} analyses gratuites par jour. Passez à l'analyse complète pour 1.99€ !`
      };
    }
    return { 
      allowed: true, 
      remaining: MAX_FREE_TEASERS_PER_DAY - cleanedLimits[ip].count 
    };
  }
  
  return { allowed: true, remaining: MAX_FREE_TEASERS_PER_DAY };
}

function incrementRateLimit(ip) {
  const limits = loadRateLimits();
  const today = new Date().toISOString().split('T')[0];
  
  // Nettoyer les anciennes entrées
  const cleanedLimits = {};
  for (const [key, value] of Object.entries(limits)) {
    if (value.date === today) {
      cleanedLimits[key] = value;
    }
  }
  
  if (cleanedLimits[ip]) {
    cleanedLimits[ip].count += 1;
  } else {
    cleanedLimits[ip] = { date: today, count: 1 };
  }
  
  saveRateLimits(cleanedLimits);
  return MAX_FREE_TEASERS_PER_DAY - cleanedLimits[ip].count;
}
// ==========================================

// OpenAI client (pour analyse payante)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Groq client (GRATUIT pour le teaser)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Helper: appel GPT-4o pour analyse juridique - MULTILINGUE
async function analyseBailWithGPT(bailText, countryCode = 'FR') {
  const countryInfo = getCountryInfo(countryCode);
  console.log(`🔍 ANALYSE COMPLÈTE GPT-4o - Pays: ${countryInfo.name} (${countryCode})`);
  const systemPrompt = `
Tu es un juriste expert en droit immobilier français, spécialisé dans l'analyse des baux d'habitation régis par la loi du 6 juillet 1989, les lois ALUR et ELAN, le Code civil, le Code de la construction et de l'habitation, ainsi que les textes et obligations actuellement en vigueur.

Ton rôle : analyser un bail d'habitation (vide ou meublé) et identifier :
- les clauses illégales (contraires à une disposition impérative ou d'ordre public),
- les clauses déséquilibrées au sens de l'article 1171 du Code civil (déséquilibre significatif),
- les clauses ambiguës, trompeuses, imprécises ou contraires à la jurisprudence récente,
- les incohérences sur les obligations bailleur / locataire,
- les risques spécifiques liés à la restitution du dépôt de garantie,
- les manques obligatoires (diagnostics, liste du mobilier en meublé, etc.),
- les obligations minimales du logement (salubrité, sécurité, décence, équipements obligatoires),
- les erreurs liées à la révision du loyer (indices, modalités, périodicité).

---

### ✔ MÉTHODOLOGIE D’ANALYSE

Tu suis mentalement ces étapes avant de répondre :

#### **ÉTAPE 1 — Qualifier le bail**
Identifier si le bail paraît être :
- un bail meublé (1 an, 9 mois étudiant) ou un bail vide (3 ans / 6 ans),
- usage résidence principale,
- bail individuel / colocation,
- logement meublé conforme (liste obligatoire du mobilier – décret 31 juillet 2015),
- logement vide conforme (logement décent – décret 2002-120).

Noter les éléments manquants.

---

#### **ÉTAPE 2 — Vérification des éléments obligatoires dans un bail**
Détecter l’absence ou la mauvaise formulation de :
- identité bailleur / locataire,
- description précise du logement,
- destination “habitation”,
- durée du bail,
- montant du loyer + provisions / forfait charges,
- modalités de révision du loyer (IRL, périodicité, date anniversaire),
- dépôt de garantie (montant légal, plafonds),
- état des lieux d’entrée et de sortie,
- diagnostics obligatoires (DPE, ERNMT, plomb, électricité/gaz si concernés),
- pour un **meublé** : liste complète du mobilier obligatoire (lit ou canapé-lit, table, sièges, plaques de cuisson, réfrigérateur, ustensiles de cuisine, luminaires, étagères, vaisselle minimale, etc.),
- pour un **logement vide** : critères de décence (eau potable, WC intérieurs, chauffage normal, absence d'humidité majeure, sécurité électrique, ventilation, fenêtres, surface minimale, etc.).

**⚠️ IMPORTANT - Distinction honoraires vs complément de loyer :**
- **Honoraires d'agence / de location** : somme UNIQUE versée à l'agence immobilière pour la mise en location (frais de dossier, état des lieux, rédaction du bail). C'est un paiement PONCTUEL, PAS un supplément de loyer mensuel.
- **Complément de loyer** : supplément MENSUEL ajouté au loyer de référence majoré, justifié UNIQUEMENT par des caractéristiques exceptionnelles du logement (vue panoramique exceptionnelle, équipements très haut de gamme, localisation ultra-premium). En zone tendue, il doit être strictement justifié.

⚠️ **Ne confonds JAMAIS les honoraires d'agence avec un complément de loyer !**
Si le document mentionne "honoraires", "frais d'agence", "honoraires de location", "frais de mise en location", c'est un paiement UNIQUE à l'agence, pas un supplément de loyer mensuel. Ne le signale PAS comme clause abusive ou complément de loyer injustifié.

Si une mention essentielle semble absente → ajouter dans "points_a_surveiller".

---

#### **ÉTAPE 3 — Clauses illégales**
Détecter les clauses manifestement illicites, par ex. :
- dépôt de garantie supérieur au plafond légal (1 mois nu / 2 mois meublé),
- interdiction totale d’héberger des proches,
- pénalités financières automatiques ou forfaitaires,
- transfert au locataire d’obligations relevant du bailleur,
- exonération totale de responsabilité du bailleur,
- clause empêchant le locataire de résilier avec préavis légal,
- clause imposant des frais abusifs (relance, quittance, etc.),
- clause imposant au locataire les grosses réparations (réservées au bailleur).

Donner *référence légale* (ex. loi 1989 art. 22, Code civil art. 1719, etc.).

---

#### **ÉTAPE 4 — Clauses abusives (article 1171 Code civil)**
Détecter les clauses créant un **déséquilibre significatif** :
- obligations disproportionnées d’entretien,
- délais de préavis incorrects ou déséquilibrés,
- retenues de caution floues ou non justifiées,
- charges imputées au locataire sans justification,
- interdictions excessives (animaux, invités, etc.),
- frais ou obligations “automatiques” non basés sur constat réel.

Pour chaque clause : expliquer le problème + donner un conseil simple au locataire.

---

#### **ÉTAPE 5 — Obligations d’entretien**
Identifier les erreurs concernant l’entretien :

**À charge du locataire (loyers/usage normal) – Exemples :**
- entretien courant (ménage, joints, petites réparations),
- remplacement petites pièces (ampoules, fusibles),
- entretien robinetterie simple (ex : détartrage),
- entretien chaudière quand mentionné et respectant la loi,
- débouchage simple de siphon.

**À charge du bailleur (réparations majeures) – Exemples :**
- travaux structurels (murs, toiture, planchers),
- remplacement équipements vétustes,
- réparation chauffage / chaudière en cas de panne,
- problèmes d’infiltration, humidité, isolation,
- réseaux électriques, plomberie lourde,
- mise en conformité si logement non décent.

Si le bail inverse ces obligations → clause abusive ou illégale.

---

#### **ÉTAPE 6 — Impact sur la CAUTION**
Évaluer :
- risque de retenue abusive,
- clauses douteuses sur l’état des lieux,
- mentions ambigües sur ménage/réparations,
- délais de restitution incorrects,
- risque “faible / moyen / élevé” + liste d’actions concrètes :
  - photos avant / après,
  - état des lieux contradictoire,
  - envoi LRAR,
  - preuve de l’entretien régulier.

---

#### **ÉTAPE 7 — Résumé simple**
En 5–6 phrases max, langage simple, tu expliques :
- risques détectés,
- clauses problématiques,
- obligations manquantes,
- conseils immédiats pour se protéger,
- impact possible sur la caution.

---

### ✔ FORMAT DE RÉPONSE (OBLIGATOIRE)

Tu dois RENVOYER EXCLUSIVEMENT ce JSON :

{
  "clauses_abusives": [
    { 
      "extrait": "citation exacte de la clause problématique", 
      "probleme": "explication claire du problème juridique", 
      "base_legale": "référence légale précise (loi, article, décret)",
      "recommandation": "conseil concret pour le locataire"
    }
  ],
  "clauses_desequilibrees": [
    { 
      "extrait": "citation exacte de la clause", 
      "probleme": "explication du déséquilibre", 
      "recommandation": "conseil pour le locataire"
    }
  ],
  "points_a_surveiller": [
    { 
      "extrait": "citation exacte ou description", 
      "explication": "pourquoi c'est à surveiller", 
      "recommandation": "action recommandée"
    }
  ],
  "elements_favorables_locataire": [
    { 
      "extrait": "citation exacte de la clause favorable", 
      "pourquoi_c_est_favorable": "explication de l'avantage pour le locataire"
    }
  ],
  "recommandations_generales": [
    "conseil 1",
    "conseil 2"
  ],
  "impact_sur_caution": {
    "risque_perte_caution": "élevé|moyen|faible",
    "explication": "explication du risque",
    "actions_concretes_pour_proteger_la_caution": [
      "action 1",
      "action 2"
    ]
  },
  "resume_simple": "résumé en 5-6 phrases maximum, langage simple."
}

⚠️ IMPORTANT : Chaque clause DOIT avoir TOUS les champs remplis. Ne laisse JAMAIS un champ vide !
- "probleme" : OBLIGATOIRE, explique le problème
- "base_legale" : OBLIGATOIRE pour clauses_abusives, cite la loi ou l'article
- "recommandation" : OBLIGATOIRE, donne un conseil concret

NE PRODUIS AUCUN TEXTE avant ou après le JSON.
NE CHANGE PAS les clés.
NE CHANGE PAS la structure.
`.trim();


  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0, // Résultats déterministes et reproductibles
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: bailText }
    ]
  });

  // Calcul du coût
  const usage = completion.usage;
  const inputTokens = usage.prompt_tokens;
  const outputTokens = usage.completion_tokens;
  const totalTokens = usage.total_tokens;
  
  // Tarifs GPT-4o (novembre 2024)
  const inputCost = (inputTokens / 1_000_000) * 2.50;  // $2.50 / 1M tokens
  const outputCost = (outputTokens / 1_000_000) * 10.00; // $10.00 / 1M tokens
  const totalCost = inputCost + outputCost;
  
  console.log(`💰 COÛT DE L'ANALYSE:`);
  console.log(`   Input:  ${inputTokens.toLocaleString()} tokens → $${inputCost.toFixed(4)}`);
  console.log(`   Output: ${outputTokens.toLocaleString()} tokens → $${outputCost.toFixed(4)}`);
  console.log(`   TOTAL:  ${totalTokens.toLocaleString()} tokens → $${totalCost.toFixed(4)} (≈ ${(totalCost * 0.93).toFixed(4)}€)\n`);

  const content = completion.choices[0].message.content;
  
  // Retourner le coût pour tracking
  return {
    analysis: JSON.parse(content),
    cost: totalCost * 0.93 // Conversion USD → EUR approximative
  };
}

// Helper: Analyse TEASER gratuite avec GROQ (100% GRATUIT) - MULTILINGUE
async function analyseBailTeaser(bailText, countryCode = 'FR') {
  const countryInfo = getCountryInfo(countryCode);
  const systemPrompt = getCountryPrompt(countryCode, 'teaser') || `
Tu es un juriste expert en droit immobilier français.

ÉTAPE 1 : Vérifie d'abord si ce document est bien un bail d'habitation (contrat de location).

Si ce n'est PAS un bail d'habitation (ex: facture, CV, article, contrat de travail, autre document), réponds :
{
  "est_bail": false,
  "type_document_detecte": "description courte du type de document",
  "message_erreur": "Ce document ne semble pas être un bail d'habitation. Nous avons détecté [type]. Veuillez uploader votre contrat de location."
}

Si c'est bien un bail d'habitation, analyse-le TRÈS ATTENTIVEMENT et EXTRAIS les informations suivantes :

{
  "est_bail": true,
  "type_bail": "meublé ou vide (cherche 'meublé', 'non meublé', 'vide', 'logement meublé')",
  "adresse_bien": "CHERCHE l'adresse complète du logement (rue, numéro, code postal, ville)",
  "surface": "CHERCHE la surface en m² (m2, mètres carrés)",
  "loyer_mensuel": "CHERCHE le montant du loyer mensuel en euros (hors charges). Regarde 'loyer', 'montant mensuel', 'loyer de base', 'loyer mensuel hors charges'. Format: '850€'",
  "charges": "CHERCHE le montant des charges (provisions sur charges, charges forfaitaires). Format: '50€' ou 'Non précisé'",
  "depot_garantie": "CHERCHE le dépôt de garantie. Regarde 'dépôt de garantie', 'caution', 'garantie', 'dépôt'. ATTENTION: cherche le MONTANT EXACT EN EUROS (40€, 700€, 1400€, etc.). Format: '700€' ou '1 mois de loyer'",
  "duree_bail": "CHERCHE la durée. Regarde 'durée du bail', 'durée de la location', '1 an', '3 ans', '9 mois'",
  "score_risque": "nombre de 1 à 10 (10 = très risqué)",
  "niveau_risque": "faible|modéré|élevé|critique",
  "nb_clauses_problematiques": "nombre entier",
  "nb_points_attention": "nombre entier",
  "resume": "2-3 phrases résumant le bail (type, surface, loyer, dépôt de garantie) ET les risques principaux détectés"
}

⚠️ IMPORTANT - Recherche ACTIVE des informations :
- Parcours TOUT le texte pour trouver les montants (€, euros, EUR)
- Le loyer peut être écrit : "loyer mensuel de 850€", "850 euros par mois", "loyer : 850€"
- Le dépôt peut être écrit : "dépôt de garantie : 700€", "dépôt de 40 euros", "caution d'un montant de...", "deux mois de loyer", "garantie de 40€"
- La durée peut être écrite : "pour une durée de 1 an", "bail de 3 ans", "9 mois (étudiant)"
- NE METS PAS "Non précisé" si l'information est présente quelque part dans le texte !
- Pour le dépôt de garantie, cherche TOUS les nombres près des mots "dépôt", "garantie", "caution"

RÉPONDS UNIQUEMENT EN JSON STRICT. Aucun texte avant ou après.
`.trim();

  // Augmenter le texte pour mieux analyser (15000 caractères pour capturer plus d'infos)
  const limitedText = bailText.slice(0, 15000);
  
  console.log(`📝 TEASER - Pays: ${countryInfo.name} (${countryCode})`);
  console.log(`   Texte analysé: ${limitedText.length} caractères sur ${bailText.length} total`);
  
  // Debug: chercher le dépôt de garantie dans le texte
  const depotMatch = bailText.match(/(?:dépôt|depot|garantie|caution|fianza|kaution|caução)[^\d]*(\d+)/gi);
  if (depotMatch) {
    console.log(`   🔍 Mentions trouvées pour dépôt/garantie: ${depotMatch.join(', ')}`);
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant", // Modèle Groq rapide et GRATUIT
    temperature: 0, // Résultats déterministes et reproductibles
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: limitedText }
    ]
  });

  console.log(`🆓 TEASER GROQ - 100% GRATUIT (Llama 3.1 8B)`);
  console.log(`   Tokens utilisés: ${completion.usage?.total_tokens || 'N/A'}`);
  console.log(`   COÛT: 0€ !\n`);

  const content = completion.choices[0].message.content;
  
  return {
    teaser: JSON.parse(content),
    cost: 0, // GRATUIT !
    country: countryCode
  };
}

// Client Google Vision pour OCR ultra-rapide
const visionClient = new vision.ImageAnnotatorClient({
  apiKey: process.env.GOOGLE_VISION_API_KEY
});

// Fonction pour extraire le texte du PDF avec OCR si nécessaire
async function extractTextFromPDF(buffer) {
  try {
    // Essayer d'abord l'extraction native
    const data = await pdfParse(buffer);
    const text = data.text.trim();
    
    if (text.length > 100) { 
      console.log(`✅ Texte natif extrait: ${text.length} caractères`);
      return text;
    } else {
      // PDF scanné, utiliser Google Vision OCR (ultra-rapide !)
      console.log("⚠️ PDF scanné détecté, conversion en images + Google Vision OCR...");
      
      const startTime = Date.now();
      
      // Convertir PDF en images PNG
      const pngPages = await pdfToPng(buffer, {
        disableFontFace: false,
        useSystemFonts: false,
        viewportScale: 2.0,
      });
      
      console.log(`   ${pngPages.length} pages à traiter avec Google Vision...`);
      
      // OCR en PARALLÈLE avec Google Vision (beaucoup plus rapide !)
      const ocrPromises = pngPages.map((page, i) => {
        console.log(`   🔄 Lancement OCR page ${i + 1}...`);
        return visionClient.textDetection({
          image: { content: page.content.toString('base64') }
        }).then(([result]) => {
          const text = result.fullTextAnnotation?.text || '';
          console.log(`   ✓ Page ${i + 1} terminée (${text.length} chars)`);
          return { index: i, text };
        });
      });
      
      // Attendre toutes les pages en parallèle
      const results = await Promise.all(ocrPromises);
      
      // Reconstituer le texte dans l'ordre des pages
      results.sort((a, b) => a.index - b.index);
      const fullText = results.map(r => r.text).join("\n");
      
      const ocrText = fullText.trim();
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Google Vision OCR terminé en ${duration}s: ${ocrText.length} caractères extraits`);
      
      if (ocrText.length < 100) {
        throw new Error("Impossible d'extraire suffisamment de texte du PDF");
      }
      
      return ocrText;
    }
  } catch (err) {
    console.error("Erreur extraction texte PDF:", err);
    throw err;
  }
}

// Route de test
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CheckTonBail backend up" });
});

// Route admin : stats d'usage (protège-la en production !)
app.get("/api/stats", async (req, res) => {
  try {
    const stats = await getMonthlyStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// � Route pour récupérer la liste des pays supportés
app.get("/api/countries", (req, res) => {
  res.json({ success: true, countries: getSupportedCountries() });
});

// 🎁 Route TEASER GRATUIT : analyse rapide sans crédit - MULTILINGUE
app.post("/api/analyse-teaser", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Fichier manquant." });
    }

    // 🌍 Récupérer le pays (défaut: France)
    const countryCode = req.body.country || 'FR';
    const validCountries = ['FR', 'ES', 'PT', 'BE', 'DE'];
    const country = validCountries.includes(countryCode) ? countryCode : 'FR';
    const countryInfoRoute = getCountryInfo(country);

    // 🚦 Vérifier rate limit par IP
    const clientIP = getClientIP(req);
    const rateCheck = checkRateLimit(clientIP);
    
    if (!rateCheck.allowed) {
      console.log(`🚫 Rate limit atteint pour IP: ${clientIP}`);
      return res.status(429).json({
        success: false,
        rateLimited: true,
        error: rateCheck.message,
        remaining: 0
      });
    }

    // Vérifier limite mensuelle (même pour gratuit)
    const usageCheck = await canAnalyze();
    if (!usageCheck.allowed) {
      return res.status(503).json({
        success: false,
        error: "Service temporairement indisponible.",
        maintenance: true
      });
    }

    const fileName = req.file.originalname;
    console.log("🎁 TEASER GRATUIT:", fileName);
    console.log(`   🌍 Pays: ${countryInfoRoute.name} (${country})`);
    console.log("   Taille:", req.file.size, "bytes");
    console.log("   IP:", clientIP, "| Analyses restantes:", rateCheck.remaining);

    // Extraire le texte du PDF
    const bailText = await extractTextFromPDF(req.file.buffer);
    console.log("   Caractères extraits:", bailText.length);

    // Analyse TEASER avec le pays sélectionné
    const result = await analyseBailTeaser(bailText, country);
    
    // Vérifier si c'est bien un bail
    if (!result.teaser.est_bail) {
      console.log(`⚠️ Document non reconnu comme bail: ${result.teaser.type_document_detecte}`);
      // Ne pas compter cette tentative dans le rate limit
      return res.json({
        success: false,
        fileName,
        isNotBail: true,
        typeDetecte: result.teaser.type_document_detecte,
        message: result.teaser.message_erreur
      });
    }

    // ✅ Analyse réussie : incrémenter le rate limit
    const remaining = incrementRateLimit(clientIP);

    // Tracker le coût (même si gratuit pour l'utilisateur)
    await trackAnalysis(result.cost, 'teaser_gratuit');

    console.log(`✅ Teaser généré avec succès | Analyses restantes pour cette IP: ${remaining}`);
    
    res.json({
      success: true,
      fileName,
      teaser: result.teaser,
      extractedText: bailText, // 📝 Renvoyer le texte pour éviter de refaire l'OCR
      isTeaser: true,
      country: result.country, // 🌍 Pays de l'analyse
      remaining, // Nombre d'analyses gratuites restantes
      message: remaining > 0 
        ? `Aperçu gratuit - Il vous reste ${remaining} analyse(s) gratuite(s) aujourd'hui`
        : "Dernière analyse gratuite ! Passez à l'analyse complète pour 1.99€"
    });
  } catch (err) {
    console.error("❌ Erreur /api/analyse-teaser:", err.message);
    res.status(500).json({
      success: false,
      error: err.message || "Erreur interne serveur",
    });
  }
});

// 💰 Route ANALYSE PAYANTE avec texte déjà extrait (pas d'OCR) - MULTILINGUE
app.post("/api/analyse-bail-text", async (req, res) => {
  try {
    const { bailText, fileName, userId, paymentIntentId, country: reqCountry } = req.body;
    
    // 🌍 Récupérer le pays (défaut: France)
    const validCountries = ['FR', 'ES', 'PT', 'BE', 'DE'];
    const country = validCountries.includes(reqCountry) ? reqCountry : 'FR';
    const countryInfo = getCountryInfo(country);
    
    if (!bailText || bailText.length < 100) {
      return res.status(400).json({ error: "Texte du bail manquant ou trop court." });
    }

    // 🛡️ Vérifier le paiement Stripe
    if (!paymentIntentId) {
      return res.status(402).json({
        success: false,
        error: "Paiement requis",
        needsPayment: true
      });
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        console.error(`❌ PaymentIntent ${paymentIntentId} non validé: ${paymentIntent.status}`);
        return res.status(402).json({
          success: false,
          error: "Paiement non validé",
          needsPayment: true
        });
      }
      console.log(`✅ Paiement vérifié: ${paymentIntentId}`);
    } catch (stripeErr) {
      console.error(`❌ Erreur vérification Stripe:`, stripeErr.message);
      return res.status(402).json({
        success: false,
        error: "Impossible de vérifier le paiement",
        needsPayment: true
      });
    }

    // 🛡️ Vérifier limite mensuelle
    const usageCheck = await canAnalyze();
    if (!usageCheck.allowed) {
      console.error(`🚨 LIMITE MENSUELLE ATTEINTE : ${usageCheck.currentCost}€`);
      return res.status(503).json({
        success: false,
        error: "Service temporairement indisponible. Réessayez demain.",
        maintenance: true
      });
    }

    console.log("📄 Analyse PAYANTE (texte pré-extrait):", fileName);
    console.log(`   🌍 Pays: ${countryInfo.name} (${country})`);
    console.log("   Caractères:", bailText.length);
    console.log("   Utilisateur:", userId);

    // Analyse GPT complète avec le pays
    const result = await analyseBailWithGPT(bailText, country);
    
    // 📊 Tracker le coût
    await trackAnalysis(result.cost, userId);

    console.log(`✅ Analyse payante terminée avec succès`);
    
    res.json({
      success: true,
      fileName,
      analysis: result.analysis,
      country: country // 🌍 Pays de l'analyse
    });
  } catch (err) {
    console.error("❌ Erreur /api/analyse-bail-text:", err.message);
    res.status(500).json({
      success: false,
      error: err.message || "Erreur interne serveur",
    });
  }
});

// Route principale : analyse du bail (upload du fichier)
app.post("/api/analyse-bail", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Fichier manquant." });
    }

    // 🛡️ PROTECTION 1 : Vérifier limite mensuelle
    const usageCheck = await canAnalyze();
    if (!usageCheck.allowed) {
      console.error(`🚨 LIMITE MENSUELLE ATTEINTE : ${usageCheck.currentCost}€`);
      return res.status(503).json({
        success: false,
        error: "Service temporairement indisponible. Réessayez demain.",
        maintenance: true
      });
    }

    const userId = req.body.userId || 'anonymous';
    const paymentIntentId = req.body.paymentIntentId;
    
    // Créer l'utilisateur s'il n'existe pas
    if (userId !== 'anonymous') {
      const existingCredits = await getCredits(userId);
      if (existingCredits === null) {
        await createUser(userId, 0);
      }
    }
    
    // 🛡️ PROTECTION 2 : Vérifier le paiement Stripe si fourni, sinon vérifier les crédits
    if (paymentIntentId) {
      // Vérifier avec Stripe que le paiement est bien succeeded
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
          console.error(`❌ PaymentIntent ${paymentIntentId} non validé: ${paymentIntent.status}`);
          return res.status(402).json({
            success: false,
            error: "Paiement non validé",
            needsPayment: true
          });
        }
        console.log(`✅ Paiement vérifié: ${paymentIntentId}`);
      } catch (stripeErr) {
        console.error(`❌ Erreur vérification Stripe:`, stripeErr.message);
        return res.status(402).json({
          success: false,
          error: "Impossible de vérifier le paiement",
          needsPayment: true
        });
      }
    } else {
      // Pas de paiement fourni, vérifier les crédits
      const hasCredit = await useCredit(userId);
      if (!hasCredit) {
        return res.status(402).json({
          success: false,
          error: "Crédits insuffisants",
          needsPayment: true
        });
      }
    }

    const fileName = req.file.originalname;
    console.log("📄 Analyse du bail:", fileName);
    console.log("   Taille:", req.file.size, "bytes");
    console.log("   Utilisateur:", userId);

    // Extraire le texte du PDF
    const bailText = await extractTextFromPDF(req.file.buffer);
    console.log("   Caractères extraits:", bailText.length);

    // Analyse GPT
    const result = await analyseBailWithGPT(bailText);
    
    // 📊 Tracker le coût réel
    await trackAnalysis(result.cost, userId);

    const remainingCredits = await getCredits(userId);
    console.log(`✅ Analyse terminée avec succès (${remainingCredits} crédits restants)`);
    
    res.json({
      success: true,
      fileName,
      analysis: result.analysis,
      creditsRemaining: remainingCredits
    });
  } catch (err) {
    console.error("❌ Erreur /api/analyse-bail:", err.message);
    res.status(500).json({
      success: false,
      error: err.message || "Erreur interne serveur",
    });
  }
});

// ============================================
// ROUTES STRIPE - SYSTÈME DE CRÉDITS
// ============================================

// Obtenir les crédits d'un utilisateur
app.get("/api/credits/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const credits = await getCredits(userId);
    res.json({ success: true, credits });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Créer un PaymentIntent pour paiement intégré (modale)
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { userId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 199, // 1.99€ en centimes
      currency: 'eur',
      payment_method_types: ['card'], // Uniquement carte bancaire, désactive Link
      metadata: {
        userId,
        product: 'bail_analysis'
      }
    });

    res.json({ 
      success: true, 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error) {
    console.error("Erreur création PaymentIntent:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Confirmer le paiement et autoriser l'analyse
app.post("/api/confirm-payment", async (req, res) => {
  try {
    const { paymentIntentId, userId } = req.body;
    
    // Vérifier le paiement
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      console.log(`✅ Paiement confirmé pour ${userId}: ${paymentIntentId}`);
      res.json({ success: true, authorized: true });
    } else {
      res.json({ success: false, authorized: false, status: paymentIntent.status });
    }
  } catch (error) {
    console.error("Erreur confirmation paiement:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Créer une session de paiement Stripe (ancien - pour backup)
app.post("/api/create-checkout", async (req, res) => {
  try {
    const { userId, pack } = req.body; // pack: "1", "5", ou "10"
    
    const packs = {
      "1": { credits: 1, price: 299, name: "1 analyse" },
      "5": { credits: 5, price: 999, name: "Pack 5 analyses" },
      "10": { credits: 10, price: 1499, name: "Pack 10 analyses" }
    };
    
    const selectedPack = packs[pack];
    if (!selectedPack) {
      return res.status(400).json({ error: "Pack invalide" });
    }

    // Créer une session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: selectedPack.name,
            description: `${selectedPack.credits} crédit(s) pour CheckTonBail`,
          },
          unit_amount: selectedPack.price, // Prix en centimes
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/credits`,
      metadata: {
        userId,
        credits: selectedPack.credits
      }
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Erreur création checkout:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook Stripe (vérification paiement + ajout crédits)
app.post("/api/stripe-webhook", express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Traiter l'événement de paiement réussi
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, credits } = session.metadata;

    // Ajouter les crédits à l'utilisateur
    await addCredits(userId, parseInt(credits));
    console.log(`✅ Paiement réussi: +${credits} crédits pour ${userId}`);
  }

  res.json({ received: true });
});

// Store des sessions déjà traitées (en mémoire pour simplifier)
const processedSessions = new Set();

// Vérifier le succès d'un paiement
app.get("/api/verify-payment/:sessionId", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    
    // Vérifier si déjà traité
    if (processedSessions.has(sessionId)) {
      console.log(`⚠️ Session ${sessionId} déjà traitée, pas de double crédit`);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return res.json({
        success: true,
        credits: parseInt(session.metadata.credits),
        userId: session.metadata.userId,
        alreadyProcessed: true
      });
    }
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const { userId, credits } = session.metadata;
      
      // Marquer comme traité AVANT d'ajouter les crédits
      processedSessions.add(sessionId);
      
      await addCredits(userId, parseInt(credits));
      console.log(`✅ Paiement vérifié: +${credits} crédit(s) pour ${userId}`);
      
      res.json({
        success: true,
        credits: parseInt(credits),
        userId
      });
    } else {
      res.json({ success: false, message: "Paiement non finalisé" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend CheckTonBail running on http://localhost:${port}`);
});
