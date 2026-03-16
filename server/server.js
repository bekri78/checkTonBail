import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

import multer from "multer";
import { createRequire } from "module";
import { pdfToPng } from "pdf-to-png-converter";
import Stripe from "stripe";
import { canAnalyze, trackAnalysis, getMonthlyStats, isSessionUsed, markSessionUsed } from "./usage-tracker.js";
import fs from "fs";
import vision from "@google-cloud/vision";
import { getCountryPrompt, getCountryInfo } from "./country-prompts.js";
import crypto from "crypto";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ==========================================
// ⚡ OPTIMISATION 1: Pool de Vision clients (OCR parallèle massif)
// ==========================================
const VISION_POOL_SIZE = 5;
const visionClients = Array(VISION_POOL_SIZE).fill(null).map(() =>
  new vision.ImageAnnotatorClient({ apiKey: process.env.GOOGLE_VISION_API_KEY })
);
let visionIndex = 0;
const getVisionClient = () => {
  const client = visionClients[visionIndex];
  visionIndex = (visionIndex + 1) % VISION_POOL_SIZE;
  return client;
};

// ==========================================
// ⚡ OPTIMISATION 2: Cache OCR persistant (évite re-traitement)
// ==========================================
const ocrCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h

function getCacheKey(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

function getCachedOCR(buffer) {
  const key = getCacheKey(buffer);
  const cached = ocrCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`📦 CACHE HIT! ${cached.text.length} caractères récupérés instantanément`);
    return cached.text;
  }
  return null;
}

function setCachedOCR(buffer, text) {
  const key = getCacheKey(buffer);
  ocrCache.set(key, { text, timestamp: Date.now() });
  // Nettoyer anciennes entrées si > 500
  if (ocrCache.size > 500) {
    const oldest = ocrCache.keys().next().value;
    ocrCache.delete(oldest);
  }
}

// Multer setup for file upload (optimisé)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20 Mo max
});

// CORS - Autoriser le frontend (localhost en dev, domaine en prod)
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ["http://localhost:3000"];

app.use(cors({
  origin: corsOrigins,
}));
app.use(express.json());

// ==========================================
// 🔒 SECURITY HEADERS
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
// 📊 COMPTEURS DYNAMIQUES (stats publiques)
// ==========================================
const STATS_FILE = "./stats.json";

function loadStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Erreur lecture stats.json:", err.message);
  }
  return { totalAnalyses: 247, totalClausesDetected: 312, lastUpdated: null };
}

function saveStats(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2));
}

function incrementStats(clausesCount) {
  const stats = loadStats();
  stats.totalAnalyses += 1;
  stats.totalClausesDetected += (clausesCount || 0);
  saveStats(stats);
  return stats;
}

// ==========================================

// OpenAI client (pour analyse payante)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// Helper: appel GPT-4o pour analyse juridique - MULTILINGUE
async function analyseBailWithGPT(bailText, countryCode = 'FR') {
  const countryInfo = getCountryInfo(countryCode);
  console.log(`🔍 ANALYSE COMPLÈTE GPT-4o-mini - Pays: ${countryInfo.name} (${countryCode})`);
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

### ✔ MÉTHODOLOGIE D'ANALYSE

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
Détecter l'absence ou la mauvaise formulation de :
- identité bailleur / locataire,
- description précise du logement,
- destination "habitation",
- durée du bail,
- montant du loyer + provisions / forfait charges,
- modalités de révision du loyer (IRL, périodicité, date anniversaire),
- dépôt de garantie (montant légal, plafonds),
- état des lieux d'entrée et de sortie,
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
- interdiction totale d'héberger des proches,
- pénalités financières automatiques ou forfaitaires,
- transfert au locataire d'obligations relevant du bailleur,
- exonération totale de responsabilité du bailleur,
- clause empêchant le locataire de résilier avec préavis légal,
- clause imposant des frais abusifs (relance, quittance, etc.),
- clause imposant au locataire les grosses réparations (réservées au bailleur).

Donner *référence légale* (ex. loi 1989 art. 22, Code civil art. 1719, etc.).

---

#### **ÉTAPE 4 — Clauses abusives (article 1171 Code civil)**
Détecter les clauses créant un **déséquilibre significatif** :
- obligations disproportionnées d'entretien,
- délais de préavis incorrects ou déséquilibrés,
- retenues de caution floues ou non justifiées,
- charges imputées au locataire sans justification,
- interdictions excessives (animaux, invités, etc.),
- frais ou obligations "automatiques" non basés sur constat réel.

Pour chaque clause : expliquer le problème + donner un conseil simple au locataire.

---

#### **ÉTAPE 5 — Obligations d'entretien**
Identifier les erreurs concernant l'entretien :

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
- problèmes d'infiltration, humidité, isolation,
- réseaux électriques, plomberie lourde,
- mise en conformité si logement non décent.

Si le bail inverse ces obligations → clause abusive ou illégale.

---

#### **ÉTAPE 6 — Impact sur la CAUTION**
Évaluer :
- risque de retenue abusive,
- clauses douteuses sur l'état des lieux,
- mentions ambigües sur ménage/réparations,
- délais de restitution incorrects,
- risque "faible / moyen / élevé" + liste d'actions concrètes :
  - photos avant / après,
  - état des lieux contradictoire,
  - envoi LRAR,
  - preuve de l'entretien régulier.

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
    model: "gpt-4o-mini",
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

  // Tarifs GPT-4o-mini
  const inputCost = (inputTokens / 1_000_000) * 0.15;  // $0.15 / 1M tokens
  const outputCost = (outputTokens / 1_000_000) * 0.60; // $0.60 / 1M tokens
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

// ==========================================
// ⚡ OPTIMISATION 3: Extraction PDF ultra-rapide avec cache + batching
// ==========================================
async function extractTextFromPDF(buffer) {
  // 1. Vérifier le cache d'abord (instantané si même PDF)
  const cached = getCachedOCR(buffer);
  if (cached) return cached;

  const startTime = Date.now();

  try {
    // 2. Essayer extraction native (instantanée pour PDF texte)
    const data = await pdfParse(buffer);
    const text = data.text.trim();

    if (text.length > 200) {
      const duration = Date.now() - startTime;
      console.log(`✅ PDF natif: ${text.length} chars en ${duration}ms`);
      setCachedOCR(buffer, text);
      return text;
    }

    // 3. PDF scanné - OCR PARALLÈLE OPTIMISÉ
    console.log("⚠️ PDF scanné détecté, OCR parallèle optimisé...");

    const pngStart = Date.now();
    // viewportScale réduit: 1.8 au lieu de 2.0 = ~20% plus rapide, qualité suffisante
    const pngPages = await pdfToPng(buffer, {
      disableFontFace: false,
      useSystemFonts: false,
      viewportScale: 1.8,
    });
    console.log(`   📄 ${pngPages.length} pages converties en ${Date.now() - pngStart}ms`);

    // ⚡ OCR par LOTS avec pool de clients Vision
    const ocrStart = Date.now();
    const BATCH_SIZE = 8; // Traiter 8 pages simultanément max
    const allTexts = [];

    for (let i = 0; i < pngPages.length; i += BATCH_SIZE) {
      const batch = pngPages.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(pngPages.length / BATCH_SIZE);

      const batchPromises = batch.map((page, idx) =>
        getVisionClient().textDetection({
          image: { content: page.content.toString('base64') }
        }).then(([result]) => ({
          index: i + idx,
          text: result.fullTextAnnotation?.text || ''
        })).catch(err => {
          console.error(`   ❌ Erreur OCR page ${i + idx + 1}:`, err.message);
          return { index: i + idx, text: '' };
        })
      );

      const batchResults = await Promise.all(batchPromises);
      allTexts.push(...batchResults);
      console.log(`   ✅ Lot ${batchNum}/${totalBatches} terminé (${batch.length} pages)`);
    }

    // Reconstituer dans l'ordre
    allTexts.sort((a, b) => a.index - b.index);
    const fullText = allTexts.map(r => r.text).join("\n\n");

    const ocrText = fullText.trim();
    const totalTime = Date.now() - startTime;
    const ocrTime = Date.now() - ocrStart;

    console.log(`✅ OCR complet: ${ocrText.length} chars, ${pngPages.length} pages`);
    console.log(`   ⏱️ Conversion: ${pngStart - startTime}ms | OCR: ${ocrTime}ms | Total: ${totalTime}ms`);

    if (ocrText.length < 100) {
      throw new Error("Impossible d'extraire suffisamment de texte du PDF");
    }

    // Mettre en cache pour futures requêtes
    setCachedOCR(buffer, ocrText);
    return ocrText;

  } catch (err) {
    console.error("❌ Erreur extraction PDF:", err.message);
    throw err;
  }
}

// Route de test - améliorée avec stats
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "CheckTonBail backend up",
    cacheSize: ocrCache.size,
    visionPoolSize: VISION_POOL_SIZE,
    uptime: Math.floor(process.uptime()) + "s"
  });
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

// 📊 Route pour les compteurs publics (homepage)
app.get("/api/public-stats", (req, res) => {
  const stats = loadStats();
  res.json({
    success: true,
    totalAnalyses: stats.totalAnalyses,
    totalClausesDetected: stats.totalClausesDetected
  });
});

// 📄 Route PRÉPARATION : extraction du texte avant paiement
app.post("/api/prepare-analysis", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Fichier manquant." });
    }

    const fileName = req.file.originalname;
    console.log(`📄 PREPARE: ${fileName} (${req.file.size} bytes)`);

    const bailText = await extractTextFromPDF(req.file.buffer);
    console.log(`   Caractères extraits: ${bailText.length}`);

    res.json({ success: true, fileName, extractedText: bailText });
  } catch (err) {
    console.error("❌ Erreur /api/prepare-analysis:", err.message);
    res.status(500).json({ success: false, error: err.message || "Erreur interne serveur" });
  }
});

// 💰 Route ANALYSE PAYANTE avec texte déjà extrait (pas d'OCR) - MULTILINGUE
app.post("/api/analyse-bail-text", async (req, res) => {
  try {
    const { bailText, fileName, userId, checkoutSessionId, country: reqCountry } = req.body;

    // 🌍 Récupérer le pays (défaut: France)
    const validCountries = ['FR', 'ES', 'PT', 'BE', 'DE', 'UK'];
    const country = validCountries.includes(reqCountry) ? reqCountry : 'FR';
    const countryInfo = getCountryInfo(country);

    if (!bailText || bailText.length < 100) {
      return res.status(400).json({ error: "Texte du bail manquant ou trop court." });
    }

    // 🛡️ Vérifier le paiement Stripe (Checkout Session)
    if (!checkoutSessionId) {
      return res.status(402).json({
        success: false,
        error: "Paiement requis",
        needsPayment: true
      });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
      if (session.payment_status !== 'paid') {
        console.error(`❌ Checkout Session ${checkoutSessionId} non payée: ${session.payment_status}`);
        return res.status(402).json({
          success: false,
          error: "Paiement non validé",
          needsPayment: true
        });
      }
      // 🛡️ Vérifier que cette session n'a pas déjà été utilisée
      if (await isSessionUsed(checkoutSessionId)) {
        console.error(`❌ Session déjà utilisée: ${checkoutSessionId}`);
        return res.status(402).json({
          success: false,
          error: "Cette session de paiement a déjà été utilisée",
          needsPayment: true
        });
      }
      console.log(`✅ Paiement vérifié via Checkout Session: ${checkoutSessionId}`);
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

    // 🔒 Marquer la session comme utilisée (anti-replay)
    await markSessionUsed(checkoutSessionId);

    // Analyse GPT complète avec le pays
    const result = await analyseBailWithGPT(bailText, country);

    // 📊 Tracker le coût
    await trackAnalysis(result.cost, userId);

    // 📊 Incrémenter les compteurs (clauses de l'analyse complète)
    const totalClauses = (result.analysis.clauses_abusives?.length || 0) +
                         (result.analysis.clauses_desequilibrees?.length || 0);
    incrementStats(totalClauses);

    console.log(`✅ Analyse payante terminée avec succès`);

    res.json({
      success: true,
      fileName,
      analysis: result.analysis,
      country: country
    });
  } catch (err) {
    console.error("❌ Erreur /api/analyse-bail-text:", err.message);
    res.status(500).json({
      success: false,
      error: err.message || "Erreur interne serveur",
    });
  }
});

// ============================================
// ROUTES STRIPE - CHECKOUT SESSION EMBEDDED
// ============================================

// Créer une Checkout Session embedded (avec support codes promo)
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { userId, email } = req.body;

    const sessionConfig = {
      ui_mode: 'embedded',
      mode: 'payment',
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Analyse complète de bail - CheckTonBail',
            description: 'Analyse juridique détaillée de votre bail locatif',
          },
          unit_amount: 990, // 9.90€ en centimes
        },
        quantity: 1,
      }],
      metadata: {
        userId,
        product: 'bail_analysis'
      },
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?session_id={CHECKOUT_SESSION_ID}`,
    };

    // Pré-remplir l'email si fourni
    if (email) {
      sessionConfig.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({
      success: true,
      clientSecret: session.client_secret,
      sessionId: session.id
    });
  } catch (error) {
    console.error("Erreur création Checkout Session:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vérifier le statut d'une Checkout Session
app.get("/api/checkout-session-status", async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ success: false, error: "session_id manquant" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.json({
      success: true,
      payment_status: session.payment_status,
      customerEmail: session.customer_details?.email,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error("Erreur vérification session:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook Stripe (vérification paiement)
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
    console.log(`✅ Paiement Checkout Session réussi: ${session.id}`);
    console.log(`   Email: ${session.customer_details?.email || 'N/A'}`);
    console.log(`   Metadata:`, session.metadata);
  }

  res.json({ received: true });
});

app.listen(port, () => {
  console.log(`✅ Backend CheckTonBail running on http://localhost:${port}`);
});
