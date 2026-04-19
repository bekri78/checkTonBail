import React, { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import "@gouvfr/dsfr/dist/dsfr.min.css";
import "@gouvfr/dsfr/dist/utility/icons/icons.min.css";
import "./App.css";
import BlogList from "./blog/BlogList";
import BlogArticle from "./blog/BlogArticle";

const translations = {
  tagline: "Analysez votre bail en 30 secondes",
  heroTitle: "Votre bail cache-t-il des clauses abusives ?",
  heroSubtitle: "Déposez votre bail et découvrez instantanément les clauses problématiques",
  dropzoneText: "Glissez-déposez votre bail ici",
  dropzoneTextDragging: "Déposez votre fichier ici",
  dropzoneClickText: "ou cliquez pour sélectionner un fichier",
  dropzoneFormat: "PDF uniquement • 10 Mo max",
  dropzoneChangeFile: "Cliquez pour changer de fichier",
  analyzeButton: "🔍 Analyser mon bail",
  analyzingButton: "⏳ Analyse en cours...",
  preparingButton: "⏳ Préparation...",
  downloadReport: "📥 Télécharger le rapport PDF",
  newAnalysis: "🔄 Nouvelle analyse",
  preparingService: "⏳ Préparation du service d'analyse... (quelques secondes)",
  analyzingProgress: "Analyse en cours... (peut prendre 1-2 minutes)",
  resultsTitle: "Analyse complète de votre bail",
  abusiveClauses: "Clauses abusives détectées",
  unbalancedClauses: "Clauses déséquilibrées",
  watchPoints: "Points à surveiller",
  favorableElements: "Éléments favorables au locataire",
  recommendations: "Recommandations générales",
  depositImpact: "Impact sur la caution",
  simpleSummary: "Résumé simple",
  problem: "Problème",
  legalBasis: "Base légale",
  recommendation: "Recommandation",
  explanation: "Explication",
  whyFavorable: "Pourquoi c'est favorable",
  riskLevel: "Niveau de risque",
  concreteActions: "Actions concrètes pour protéger votre caution",
  paymentTitle: "Finaliser le paiement",
  paymentReassurance: "Paiement sécurisé par Stripe",
  trustPayment: "Paiement sécurisé",
  trustDelete: "Fichier supprimé après analyse",
  trustRefund: "Satisfait ou remboursé",
  errorFileType: "Seuls les fichiers PDF sont acceptés.",
  errorFileSize: "Le fichier ne doit pas dépasser 10 Mo.",
  errorNoFile: "Merci de sélectionner un fichier de bail.",
  errorServer: "Impossible de contacter le serveur. Vérifiez votre connexion ou réessayez.",
  errorUnknown: "Erreur inconnue",
  legalNotice: "Mentions légales",
  privacy: "Confidentialité",
  terms: "CGV",
  contact: "Contact",
  emailLabel: "Votre email (optionnel)",
  emailPlaceholder: "exemple@email.com",
  emailHelp: "Pour recevoir votre rapport par email",
  faqConfidential: "Mon bail est-il confidentiel ?",
  faqConfidentialAnswer: "Oui, votre fichier est supprimé immédiatement après analyse.",
  faqTypes: "Quels types de baux sont analysés ?",
  faqTypesAnswer: "Baux d'habitation vides et meublés, régis par la loi du 6 juillet 1989.",
  faqDuration: "Combien de temps dure l'analyse ?",
  faqDurationAnswer: "L'analyse prend généralement moins d'une minute.",
  faqIllegal: "Que se passe-t-il si une clause illégale est trouvée ?",
  faqIllegalAnswer: "Nous vous indiquons la base légale et nos recommandations pour vous protéger.",
  faqRefund: "Puis-je être remboursé ?",
  faqRefundAnswer: "Oui, contactez-nous sous 24h si vous n'êtes pas satisfait.",
};

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

// ==========================================
// CONSTANTES GLOBALES
// ==========================================
/* eslint-disable no-unused-vars */
const PRICE = "9,90\u20ac";
const PRICE_NUMERIC = 9.90;
const SS_KEYS = {
  extractedText: 'ctb_extractedText',
  fileName: 'ctb_fileName',
  userEmail: 'ctb_userEmail',
};
/* eslint-enable no-unused-vars */

// Stripe - Chargement différé
let stripePromise = null;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || "pk_test_S453tNJo0VGUC7Y6qNVxldgX00vo9ixxkp");
  }
  return stripePromise;
};

// Google Analytics
const trackEvent = (eventName, params = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// ==========================================
// BANNIERE COOKIES RGPD
// ==========================================
function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie_consent", "all");
    localStorage.setItem("cookie_consent_date", new Date().toISOString());
    setShowBanner(false);
    if (window.gtag) {
      window.gtag('consent', 'update', { 'analytics_storage': 'granted' });
    }
  };

  const acceptEssential = () => {
    localStorage.setItem("cookie_consent", "essential");
    localStorage.setItem("cookie_consent_date", new Date().toISOString());
    setShowBanner(false);
    if (window.gtag) {
      window.gtag('consent', 'update', { 'analytics_storage': 'denied' });
    }
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "#fff", borderTop: "3px solid #000091",
      padding: "20px", boxShadow: "0 -4px 20px rgba(0,0,0,0.15)", zIndex: 10000
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#000091" }}>Gestion des cookies</h3>
            <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#333" }}>
              Nous utilisons des cookies pour am&eacute;liorer votre exp&eacute;rience et analyser le trafic de notre site.
            </p>
            {showDetails && (
              <div style={{ background: "#f6f6f6", padding: "15px", borderRadius: "8px", marginBottom: "10px", fontSize: "13px" }}>
                <p style={{ margin: "0 0 10px 0" }}><strong>Cookies essentiels</strong> (toujours actifs)</p>
                <ul style={{ margin: "0 0 15px 20px", padding: 0 }}>
                  <li>M&eacute;morisation de vos pr&eacute;f&eacute;rences de cookies</li>
                  <li>Fonctionnement du paiement Stripe</li>
                  <li>Identifiant de session anonyme</li>
                </ul>
                <p style={{ margin: "0 0 10px 0" }}><strong>Cookies analytiques</strong> (optionnels)</p>
                <ul style={{ margin: "0 0 0 20px", padding: 0 }}>
                  <li>Google Analytics : mesure d'audience anonyme</li>
                </ul>
              </div>
            )}
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{ background: "none", border: "none", color: "#000091", textDecoration: "underline", cursor: "pointer", padding: 0, fontSize: "13px" }}
            >
              {showDetails ? "Masquer les d\u00e9tails" : "En savoir plus"}
            </button>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={acceptEssential} style={{
              padding: "12px 24px", background: "#fff", color: "#000091",
              border: "1px solid #000091", borderRadius: "4px", cursor: "pointer", fontWeight: "500", fontSize: "14px"
            }}>
              Cookies essentiels uniquement
            </button>
            <button onClick={acceptAll} style={{
              padding: "12px 24px", background: "#000091", color: "#fff",
              border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "500", fontSize: "14px"
            }}>
              Accepter tout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PDF GENERATION
// ==========================================
const generatePDFReport = async (analysisData, fileName) => {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const addText = (text, x, currentY, options = {}) => {
    const { fontSize = 12, fontStyle = 'normal', color = [0, 0, 0], maxWidth = pageWidth - 40 } = options;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach(line => {
      if (currentY > 275) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(line, x, currentY);
      currentY += fontSize * 0.5;
    });
    return currentY;
  };

  const addSection = (title, currentY) => {
    if (currentY > 260) { doc.addPage(); currentY = 20; }
    currentY += 5;
    doc.setDrawColor(0, 0, 145);
    doc.setLineWidth(0.5);
    doc.line(20, currentY, pageWidth - 20, currentY);
    currentY += 8;
    currentY = addText(title, 20, currentY, { fontSize: 14, fontStyle: 'bold', color: [0, 0, 145] });
    currentY += 3;
    return currentY;
  };

  // Header
  doc.setFillColor(0, 0, 145);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CheckTonBail - Rapport d\'analyse', 20, 22);
  doc.setFontSize(10);
  doc.text(`Fichier: ${fileName} | Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 30);
  y = 45;

  const a = analysisData;

  // Clauses abusives
  if (a.clauses_abusives?.length > 0) {
    y = addSection(`CLAUSES ABUSIVES (${a.clauses_abusives.length})`, y);
    a.clauses_abusives.forEach((clause, i) => {
      y = addText(`${i + 1}. ${clause.extrait}`, 22, y, { fontStyle: 'italic', color: [180, 0, 0] });
      y = addText(`Probleme: ${clause.probleme}`, 26, y, { fontSize: 10 });
      y = addText(`Base legale: ${clause.base_legale}`, 26, y, { fontSize: 10, color: [100, 100, 100] });
      y = addText(`Recommandation: ${clause.recommandation}`, 26, y, { fontSize: 10, color: [0, 100, 0] });
      y += 4;
    });
  }

  // Clauses desequilibrees
  if (a.clauses_desequilibrees?.length > 0) {
    y = addSection(`CLAUSES DESEQUILIBREES (${a.clauses_desequilibrees.length})`, y);
    a.clauses_desequilibrees.forEach((clause, i) => {
      y = addText(`${i + 1}. ${clause.extrait}`, 22, y, { fontStyle: 'italic', color: [200, 120, 0] });
      y = addText(`Probleme: ${clause.probleme}`, 26, y, { fontSize: 10 });
      y = addText(`Recommandation: ${clause.recommandation}`, 26, y, { fontSize: 10, color: [0, 100, 0] });
      y += 4;
    });
  }

  // Points a surveiller
  if (a.points_a_surveiller?.length > 0) {
    y = addSection(`POINTS A SURVEILLER (${a.points_a_surveiller.length})`, y);
    a.points_a_surveiller.forEach((point, i) => {
      y = addText(`${i + 1}. ${point.extrait}`, 22, y, { fontStyle: 'italic' });
      y = addText(`Explication: ${point.explication}`, 26, y, { fontSize: 10 });
      y = addText(`Recommandation: ${point.recommandation}`, 26, y, { fontSize: 10, color: [0, 100, 0] });
      y += 4;
    });
  }

  // Elements favorables
  if (a.elements_favorables_locataire?.length > 0) {
    y = addSection(`ELEMENTS FAVORABLES (${a.elements_favorables_locataire.length})`, y);
    a.elements_favorables_locataire.forEach((elem, i) => {
      y = addText(`${i + 1}. ${elem.extrait}`, 22, y, { color: [0, 120, 0] });
      y = addText(`${elem.pourquoi_c_est_favorable}`, 26, y, { fontSize: 10 });
      y += 4;
    });
  }

  // Impact caution
  if (a.impact_sur_caution) {
    y = addSection('IMPACT SUR LA CAUTION', y);
    y = addText(`Risque: ${a.impact_sur_caution.risque_perte_caution}`, 22, y, { fontStyle: 'bold' });
    y = addText(a.impact_sur_caution.explication, 22, y, { fontSize: 10 });
    if (a.impact_sur_caution.actions_concretes_pour_proteger_la_caution) {
      y += 2;
      y = addText('Actions concretes:', 22, y, { fontStyle: 'bold', fontSize: 10 });
      a.impact_sur_caution.actions_concretes_pour_proteger_la_caution.forEach(action => {
        y = addText(`- ${action}`, 26, y, { fontSize: 10 });
      });
    }
  }

  // Recommandations
  if (a.recommandations_generales?.length > 0) {
    y = addSection('RECOMMANDATIONS GENERALES', y);
    a.recommandations_generales.forEach(rec => {
      y = addText(`- ${rec}`, 22, y, { fontSize: 10 });
    });
  }

  // Resume
  if (a.resume_simple) {
    y = addSection('RESUME', y);
    y = addText(a.resume_simple, 22, y, { fontSize: 11 });
  }

  // Footer
  if (y > 260) { doc.addPage(); y = 20; }
  y += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Ce rapport est genere automatiquement par CheckTonBail. Il ne constitue pas un avis juridique.', 20, y);
  y += 4;
  doc.text('www.check-ton-bail.fr | checkTonBail@outlook.com', 20, y);

  doc.save(`CheckTonBail-Rapport-${fileName.replace('.pdf', '')}.pdf`);
};

// ==========================================
// COMPOSANT PRINCIPAL AnalyseBail
// ==========================================
function AnalyseBail({ userId, t }) {
  // Tunnel state
  const [currentStep, setCurrentStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Analysis data
  // eslint-disable-next-line no-unused-vars
  const [extractedText, setExtractedText] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisFileName, setAnalysisFileName] = useState("");

  // Payment state
  const [checkoutClientSecret, setCheckoutClientSecret] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [checkoutSessionId, setCheckoutSessionId] = useState(null);

  // Stats
  // eslint-disable-next-line no-unused-vars
  const [publicStats, setPublicStats] = useState({ totalAnalyses: 247, totalClausesDetected: 312 });

  // FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Warm-up server
  useEffect(() => {
    const warmUp = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`, { method: 'GET', signal: AbortSignal.timeout(60000) });
        if (res.ok) setServerReady(true);
      } catch {
        setTimeout(warmUp, 5000);
      }
    };
    warmUp();
  }, []);

  // Fetch public stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public-stats`);
        if (res.ok) {
          const data = await res.json();
          if (data.totalAnalyses) setPublicStats(data);
        }
      } catch { /* silently fail */ }
    };
    fetchStats();
  }, []);

  // Handle return from Stripe 3D Secure / redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (!sessionId) return;
    if (!userId) return; // Attendre que userId soit chargé

    // Nettoyer l'URL immédiatement pour éviter un double appel
    window.history.replaceState({}, document.title, window.location.pathname);

    const handleReturn = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/checkout-session-status?session_id=${sessionId}`);
        const data = await res.json();

        if (data.payment_status === 'paid') {
          // Restore from sessionStorage
          const savedText = sessionStorage.getItem(SS_KEYS.extractedText);
          const savedFileName = sessionStorage.getItem(SS_KEYS.fileName);

          if (savedText) {
            setCurrentStep('analyzing');

            const analysisRes = await fetch(`${API_BASE}/api/analyse-bail-text`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bailText: savedText,
                fileName: savedFileName || "bail.pdf",
                userId,
                checkoutSessionId: sessionId
              })
            });

            const analysisData = await analysisRes.json();
            if (analysisData.success) {
              setAnalysis(analysisData);
              setAnalysisFileName(analysisData.fileName || savedFileName || "bail.pdf");
              setCurrentStep('report');
      trackEvent('purchase', { event_category: 'conversion', value: PRICE_NUMERIC, currency: 'EUR' });
            } else {
              setError(analysisData.error || "Erreur lors de l'analyse");
              setCurrentStep('upload');
            }
          }
        }
      } catch (err) {
        setError("Erreur lors de la v\u00e9rification du paiement");
        setCurrentStep('upload');
      }

      // URL déjà nettoyée au début du useEffect
    };

    handleReturn();
  }, [userId]);

  // File handling
  const processFile = (selectedFile) => {
    if (selectedFile.type !== "application/pdf") {
      setError(t('errorFileType'));
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(t('errorFileSize'));
      return;
    }
    setFile(selectedFile);
    setError("");
    trackEvent('file_upload', { event_category: 'engagement', file_size: Math.round(selectedFile.size / 1024) });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) processFile(selectedFile);
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  };

  // Start: extract text then go to payment
  const handleStartAnalysis = async () => {
    if (!file) { setError(t('errorNoFile')); return; }

    setError("");
    setCurrentStep('preparing');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Lancer l'extraction PDF et la création de session Stripe en parallèle
      // (elles sont indépendantes : la session ne dépend pas du contenu du bail)
      const [prepRes, checkoutRes] = await Promise.all([
        fetch(`${API_BASE}/api/prepare-analysis`, { method: "POST", body: formData }),
        fetch(`${API_BASE}/api/create-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, email: userEmail || undefined })
        })
      ]);

      const [prepData, checkoutData] = await Promise.all([
        prepRes.json(),
        checkoutRes.json()
      ]);

      if (!prepRes.ok || !prepData.success) {
        throw new Error(prepData.error || t('errorUnknown'));
      }

      const text = prepData.extractedText;
      const fileName = prepData.fileName || file.name || "bail.pdf";

      // Save to sessionStorage for post-payment recovery
      sessionStorage.setItem(SS_KEYS.extractedText, text);
      sessionStorage.setItem(SS_KEYS.fileName, fileName);
      if (userEmail) sessionStorage.setItem(SS_KEYS.userEmail, userEmail);
      setExtractedText(text);
      setAnalysisFileName(fileName);

      trackEvent('begin_checkout', { event_category: 'funnel', value: PRICE_NUMERIC, currency: 'EUR' });

      if (checkoutData.success && checkoutData.clientSecret) {
        setCheckoutClientSecret(checkoutData.clientSecret);
        setCheckoutSessionId(checkoutData.sessionId);
        setCurrentStep('payment');
      } else {
        throw new Error("Erreur lors de l'initialisation du paiement");
      }
    } catch (err) {
      setError(err.message || t('errorServer'));
      setCurrentStep('upload');
    }
  };

  // Handle checkout complete — Stripe redirige vers return_url?session_id=xxx
  // Le useEffect ci-dessus gère l'analyse, pas besoin de le faire ici
  const handleCheckoutComplete = useCallback(() => {
    setCurrentStep('analyzing');
  }, []);

  // Reset
  const handleReset = () => {
    setCurrentStep('upload');
    setFile(null);
    setExtractedText(null);
    setAnalysis(null);
    setAnalysisFileName("");
    setCheckoutClientSecret(null);
    setCheckoutSessionId(null);
    setError("");
  };

  // ==========================================
  // STEP 2: PREPARING (extraction PDF)
  // ==========================================
  if (currentStep === 'preparing') {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "#f5f5fe", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px"
      }}>
        <div style={{
          width: "60px", height: "60px", border: "4px solid #e5e5e5",
          borderTop: "4px solid #000091", borderRadius: "50%",
          animation: "spin 1s linear infinite", marginBottom: "2rem"
        }} />
        <p style={{ color: "#000091", fontSize: "1.2rem", fontWeight: "bold" }}>
          Préparation de votre analyse...
        </p>
        <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          PDF scanné détecté — l'extraction peut prendre 1 à 3 minutes
        </p>
      </div>
    );
  }

  // ==========================================
  // STEP 3: ANALYZING (after payment)
  // ==========================================
  if (currentStep === 'analyzing') {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "#f5f5fe", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px"
      }}>
        <div style={{
          width: "60px", height: "60px", border: "4px solid #e5e5e5",
          borderTop: "4px solid #000091", borderRadius: "50%",
          animation: "spin 1s linear infinite", marginBottom: "2rem"
        }} />
        <p style={{ color: "#000091", fontSize: "1.2rem", fontWeight: "bold" }}>
          {t('analyzingProgress')}
        </p>
      </div>
    );
  }

  // ==========================================
  // STEP 4: PAYMENT
  // ==========================================
  if (currentStep === 'payment' && checkoutClientSecret) {
    return (
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-lg-8">
          <button
            className="fr-btn fr-btn--tertiary-no-outline fr-mb-4w"
            onClick={() => setCurrentStep('upload')}
          >
            &larr; Retour
          </button>

          <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>{t('paymentTitle')}</h2>
          <p style={{ textAlign: "center", color: "#666", marginBottom: "2rem" }}>
            {t('paymentReassurance')}
          </p>

          <div style={{
            background: "#fff", borderRadius: "12px", padding: "2rem",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)", maxWidth: "600px", margin: "0 auto"
          }}>
            <EmbeddedCheckoutProvider
              stripe={getStripe()}
              options={{
                clientSecret: checkoutClientSecret,
                onComplete: handleCheckoutComplete
              }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>

          <div style={{
            display: "flex", justifyContent: "center", gap: "2rem",
            marginTop: "2rem", flexWrap: "wrap"
          }}>
            {[t('trustPayment'), t('trustDelete'), t('trustRefund')].map((text, i) => (
              <span key={i} style={{ color: "#666", fontSize: "0.85rem" }}>
                {["&#x1F512;", "&#x1F5D1;", "&#x2705;"][i]} {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STEP 5: REPORT
  // ==========================================
  if (currentStep === 'report' && analysis) {
    const a = analysis.analysis;

    return (
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-lg-10">
          <button
            className="fr-btn fr-btn--tertiary-no-outline fr-mb-4w"
            onClick={handleReset}
          >
            &larr; {t('newAnalysis')}
          </button>

          <div className="fr-callout fr-callout--green-emeraude fr-mb-4w">
            <h2 className="fr-callout__title">{t('resultsTitle')}</h2>
            <p>Fichier : {analysisFileName}</p>
          </div>

          {/* Download PDF */}
          <div style={{ textAlign: "right", marginBottom: "1.5rem" }}>
            <button
              className="fr-btn fr-btn--secondary"
              onClick={() => generatePDFReport(a, analysisFileName)}
            >
              {t('downloadReport')}
            </button>
          </div>

          {/* Clauses abusives */}
          {a.clauses_abusives?.length > 0 && (
            <div className="fr-mb-4w">
              <h3>{t('abusiveClauses')} ({a.clauses_abusives.length})</h3>
              {a.clauses_abusives.map((clause, i) => (
                <div key={i} className="fr-alert fr-alert--error fr-mb-2w">
                  <p><strong>{t('problem')} :</strong> {clause.probleme}</p>
                  <p style={{ fontStyle: "italic", color: "#666" }}>"{clause.extrait}"</p>
                  <p><strong>{t('legalBasis')} :</strong> {clause.base_legale}</p>
                  <p><strong>{t('recommendation')} :</strong> {clause.recommandation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Clauses desequilibrees */}
          {a.clauses_desequilibrees?.length > 0 && (
            <div className="fr-mb-4w">
              <h3>{t('unbalancedClauses')} ({a.clauses_desequilibrees.length})</h3>
              {a.clauses_desequilibrees.map((clause, i) => (
                <div key={i} className="fr-alert fr-alert--warning fr-mb-2w">
                  <p><strong>{t('problem')} :</strong> {clause.probleme}</p>
                  <p style={{ fontStyle: "italic", color: "#666" }}>"{clause.extrait}"</p>
                  <p><strong>{t('recommendation')} :</strong> {clause.recommandation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Points a surveiller */}
          {a.points_a_surveiller?.length > 0 && (
            <div className="fr-mb-4w">
              <h3>{t('watchPoints')} ({a.points_a_surveiller.length})</h3>
              {a.points_a_surveiller.map((point, i) => (
                <div key={i} className="fr-alert fr-alert--info fr-mb-2w">
                  <p style={{ fontStyle: "italic", color: "#666" }}>"{point.extrait}"</p>
                  <p><strong>{t('explanation')} :</strong> {point.explication}</p>
                  <p><strong>{t('recommendation')} :</strong> {point.recommandation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Elements favorables */}
          {a.elements_favorables_locataire?.length > 0 && (
            <div className="fr-mb-4w">
              <h3>{t('favorableElements')} ({a.elements_favorables_locataire.length})</h3>
              {a.elements_favorables_locataire.map((elem, i) => (
                <div key={i} className="fr-alert fr-alert--success fr-mb-2w">
                  <p style={{ fontStyle: "italic" }}>"{elem.extrait}"</p>
                  <p><strong>{t('whyFavorable')} :</strong> {elem.pourquoi_c_est_favorable}</p>
                </div>
              ))}
            </div>
          )}

          {/* Impact caution */}
          {a.impact_sur_caution && (
            <section className="fr-mb-4w" style={{ background: '#f6f6f6', padding: '1.5rem', borderRadius: '8px' }}>
              <h3>{t('depositImpact')}</h3>
              <p>
                <strong>{t('riskLevel')} : </strong>
                <span style={{
                  fontWeight: "bold",
                  color: a.impact_sur_caution.risque_perte_caution === '\u00e9lev\u00e9' ? '#CE0500'
                    : a.impact_sur_caution.risque_perte_caution === 'moyen' ? '#B34000' : '#18753C'
                }}>
                  {a.impact_sur_caution.risque_perte_caution}
                </span>
              </p>
              <p>{a.impact_sur_caution.explication}</p>
              {a.impact_sur_caution.actions_concretes_pour_proteger_la_caution?.length > 0 && (
                <>
                  <h4>{t('concreteActions')} :</h4>
                  <ul>
                    {a.impact_sur_caution.actions_concretes_pour_proteger_la_caution.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}

          {/* Recommandations */}
          {a.recommandations_generales?.length > 0 && (
            <section className="fr-mb-4w" style={{ background: '#f6f6f6', padding: '1.5rem', borderRadius: '8px' }}>
              <h3>{t('recommendations')}</h3>
              <ul>
                {a.recommandations_generales.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Resume */}
          <div className="fr-callout">
            <h3 className="fr-callout__title">{t('simpleSummary')}</h3>
            <p className="fr-callout__text">{a.resume_simple}</p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "2rem" }}>
            <button className="fr-btn fr-btn--secondary" onClick={() => generatePDFReport(a, analysisFileName)}>
              {t('downloadReport')}
            </button>
            <button className="fr-btn" onClick={handleReset}>
              {t('newAnalysis')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STEP 1: UPLOAD / LANDING PAGE
  // ==========================================
  const faqItems = [
    { q: t('faqConfidential'), a: t('faqConfidentialAnswer') },
    { q: t('faqTypes'), a: t('faqTypesAnswer') },
    { q: t('faqDuration'), a: t('faqDurationAnswer') },
    { q: t('faqIllegal'), a: t('faqIllegalAnswer') },
    { q: t('faqRefund'), a: t('faqRefundAnswer') }
  ];

  return (
    <div>
      {/* ── 01 Hero Section ──────────────────────────────────── */}
      <div className="ctb-hero-b" style={{ marginBottom: '3rem' }}>

        {/* Left — texte accroche */}
        <div className="ctb-hero-b__left">

          <h1 style={{
            fontSize: 'clamp(2.6rem, 5vw, 4rem)',
            fontWeight: 800, lineHeight: 1.05,
            color: '#1e1e1e', margin: '0 0 1.1rem',
            letterSpacing: '-0.03em'
          }}>
            Votre bail cache-t-il<br/>
            <span style={{ color: '#000091' }}>des clauses abusives&nbsp;?</span>
          </h1>

          <p style={{
            fontSize: 17, color: '#555', lineHeight: 1.7,
            margin: '0 0 1.5rem', maxWidth: 420
          }}>
            50&nbsp;% des baux fran&ccedil;ais contiennent une clause ill&eacute;gale.
            En&nbsp;30&nbsp;secondes, CheckTonBail d&eacute;tecte celles qui vous co&ucirc;tent de l&rsquo;argent — et vous dit exactement quoi faire.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {['R\u00e9sultat en 30 secondes', '9,90\u20ac par analyse'].map((label) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: '#e4f5eb', border: '1px solid #18753c',
                borderRadius: 2, padding: '5px 12px'
              }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 6.5l3 3L11 2.5" stroke="#18753c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#18753c' }}>{label}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
            Paiement s&eacute;curis&eacute; &middot; RGPD &middot; Donn&eacute;es supprim&eacute;es apr&egrave;s analyse
          </p>
        </div>

        {/* Right — zone de dépôt */}
        <div className="ctb-hero-b__right">

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload').click()}
            style={{
              border: `2px dashed ${isDragging ? '#000091' : file ? '#18753c' : '#9898d6'}`,
              borderRadius: 4, padding: '32px 24px', textAlign: 'center',
              cursor: 'pointer',
              background: isDragging ? 'rgba(0,0,145,0.04)' : file ? '#e4f5eb' : '#fff',
              transition: 'all 0.15s', marginBottom: 14
            }}
          >
            <input type="file" id="file-upload" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
            {file ? (
              <>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>&#x2705;</div>
                <p style={{ fontWeight: 700, color: '#18753c', marginBottom: '0.3rem', fontSize: '0.93rem' }}>{file.name}</p>
                <p style={{ color: '#666', fontSize: '0.83rem' }}>{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
                <p style={{ color: '#888', fontSize: '0.77rem', marginTop: '0.35rem' }}>{t('dropzoneChangeFile')}</p>
              </>
            ) : (
              <>
                <svg width="52" height="60" viewBox="0 0 56 64" fill="none" style={{ marginBottom: 16 }}>
                  <rect width="56" height="64" rx="4" fill="#e8e8f8"/>
                  <rect x="8" y="10" width="28" height="4" rx="1" fill="#c0c0d8"/>
                  <rect x="8" y="18" width="32" height="4" rx="1" fill="#c0c0d8"/>
                  <rect x="8" y="26" width="24" height="4" rx="1" fill="#c0c0d8"/>
                  <rect x="8" y="34" width="28" height="4" rx="1" fill="#c0c0d8"/>
                  <rect x="8" y="42" width="20" height="4" rx="1" fill="#c0c0d8"/>
                  <rect x="0" y="46" width="56" height="18" rx="4" fill="#CE0500"/>
                  <text x="28" y="59" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="11" fill="white">PDF</text>
                </svg>
                <p style={{ fontWeight: 700, color: '#000091', marginBottom: 6, fontSize: '0.95rem' }}>
                  {isDragging ? t('dropzoneTextDragging') : 'D\u00e9posez votre bail ici'}
                </p>
                <p style={{ color: '#6b7280', fontSize: '0.84rem', margin: '0 0 18px' }}>
                  Glissez votre contrat PDF ou cliquez pour parcourir
                </p>
                <div style={{
                  background: '#000091', color: '#fff',
                  fontWeight: 700, fontSize: 14,
                  padding: '11px', borderRadius: 2,
                  cursor: 'pointer'
                }}>
                  Choisir un fichier PDF
                </div>
              </>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: 12 }}>
            <input
              type="email"
              id="email-input"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              style={{
                width: '100%', padding: '10px 14px', fontSize: 14,
                borderRadius: 2, border: '1px solid #ccc',
                boxSizing: 'border-box', color: '#333'
              }}
            />
            <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: 4 }}>{t('emailHelp')}</p>
          </div>

          {error && (
            <div className="fr-alert fr-alert--error fr-mb-2w"><p>{error}</p></div>
          )}

          {!serverReady && (
            <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 8 }}>
              &#x23F3; Connexion au service...
            </p>
          )}

          <button
            className="fr-btn fr-btn--lg"
            onClick={handleStartAnalysis}
            disabled={!file || !serverReady}
            style={{ width: '100%', padding: '13px', fontSize: '1rem', borderRadius: 2 }}
          >
            {!serverReady ? t('preparingButton') : t('analyzeButton')}
          </button>

        </div>
      </div>

      {/* ── Infographie 50% — full-width band ───────────────── */}
      <div style={{ background: "#f5f5fe", margin: "0 -2rem", padding: "3rem 2rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

          {/* Stat principale avec donut */}
          <div style={{
            background: '#fff', borderRadius: 4, border: '1px solid #e5e5e5',
            padding: '2rem 2.5rem', display: 'flex', alignItems: 'center',
            gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem'
          }}>
            {/* Donut SVG */}
            <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
              <svg width="110" height="110" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e8e8f8" strokeWidth="18"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#CE0500" strokeWidth="18"
                  strokeDasharray="157 157" strokeDashoffset="39" strokeLinecap="butt"
                  transform="rotate(-90 60 60)"/>
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#CE0500', lineHeight: 1 }}>50%</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontWeight: 800, color: '#1e1e1e', margin: '0 0 0.5rem', lineHeight: 1.2 }}>
                1 bail sur 2 contient au moins une clause ill&eacute;gale
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                Source&nbsp;: &Eacute;tudes ANIL / CLCV 2023 &mdash; Analyse de 12&nbsp;000 baux fran&ccedil;ais
              </p>
            </div>
          </div>

          {/* Grille 4 stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {[
              { stat: '76%',   label: "des locataires ne lisent pas leur bail en entier",          color: '#B34000' },
              { stat: '1 200\u20ac', label: "perdus en moyenne sur la caution \u00e0 cause de clauses abusives", color: '#CE0500' },
              { stat: '30s',   label: "pour analyser votre bail complet avec CheckTonBail",        color: '#000091' },
              { stat: publicStats.totalAnalyses, label: "baux d\u00e9j\u00e0 analys\u00e9s sur la plateforme",      color: '#18753c' },
            ].map(({ stat, label, color }) => (
              <div key={label} style={{
                background: '#fff', borderRadius: 4, padding: '1.25rem 1.25rem',
                borderLeft: `4px solid ${color}`, border: `1px solid #e5e5e5`,
                borderLeftWidth: 4, borderLeftColor: color, borderLeftStyle: 'solid'
              }}>
                <div style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 800, color }}>{stat}</div>
                <div style={{ fontSize: '0.82rem', color: '#555', marginTop: 4, lineHeight: 1.5 }}>{label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* 5 clauses illegales — grid layout */}
      <div className="fr-container" style={{ margin: "3rem auto" }}>
        <h2 style={{ textAlign: "center", color: "#000091", marginBottom: "2rem" }}>
          Les 5 clauses ill&eacute;gales les plus courantes
        </h2>
        <div className="fr-grid-row fr-grid-row--gutters">
          {[
            { icon: "fr-icon-money-euro-circle-line", title: "D\u00e9p\u00f4t de garantie excessif", desc: "Le d\u00e9p\u00f4t ne peut pas d\u00e9passer 1 mois de loyer (vide) ou 2 mois (meubl\u00e9). Tout montant sup\u00e9rieur est ill\u00e9gal." },
            { icon: "fr-icon-file-text-line", title: "Frais de quittance de loyer", desc: "Le bailleur ne peut pas facturer l'envoi des quittances. C'est une obligation gratuite pr\u00e9vue par la loi." },
            { icon: "fr-icon-home-4-line", title: "Interdiction d'h\u00e9berger", desc: "Le bailleur ne peut pas interdire au locataire d'h\u00e9berger des membres de sa famille ou des proches." },
            { icon: "fr-icon-time-line", title: "P\u00e9nalit\u00e9s de retard", desc: "Les clauses pr\u00e9voyant des p\u00e9nalit\u00e9s forfaitaires ou des int\u00e9r\u00eats de retard sont ill\u00e9gales." },
            { icon: "fr-icon-tools-line", title: "Travaux \u00e0 charge du locataire", desc: "Les grosses r\u00e9parations (toiture, fa\u00e7ade, plomberie) sont \u00e0 la charge du propri\u00e9taire." }
          ].map((clause, i) => (
            <div key={i} className="fr-col-12 fr-col-md-6">
              <div className="fr-card fr-card--vertical fr-mb-2w ctb-card-illegal">
                <div className="fr-card__body">
                  <div className="fr-card__content">
                    <h3 className="fr-card__title fr-h6">{clause.title}</h3>
                    <div className="fr-card__start">
                      <ul className="fr-badges-group">
                        <li><p className="fr-badge fr-badge--error">Clause ill&eacute;gale</p></li>
                      </ul>
                    </div>
                    <div className="fr-card__end">
                      <p className="fr-card__detail">{clause.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ce que contient le rapport — full-width band + liste features */}
      <div style={{ background: "#f5f5fe", margin: "0 -2rem", padding: "3rem 2rem" }}>
        <div className="fr-container">
          <h2 style={{ textAlign: "center", color: "#000091", marginTop: 0, marginBottom: "2rem" }}>
            Ce que contient votre rapport
          </h2>
          <div className="fr-grid-row fr-grid-row--gutters">
            {[
              { icon: "fr-icon-alert-fill",              title: "Clauses abusives",        desc: "Chaque clause ill\u00e9gale identifi\u00e9e avec la r\u00e9f\u00e9rence de loi pr\u00e9cise" },
              { icon: "fr-icon-warning-line",             title: "Clauses d\u00e9s\u00e9quilibr\u00e9es",  desc: "Les clauses l\u00e9gales mais d\u00e9favorables au locataire" },
              { icon: "fr-icon-eye-line",              title: "Points \u00e0 surveiller",   desc: "Les zones d'attention \u00e0 conna\u00eetre avant de signer" },
              { icon: "fr-icon-thumb-up-line",            title: "\u00c9l\u00e9ments favorables",  desc: "Ce qui vous prot\u00e8ge dans votre bail" },
              { icon: "fr-icon-shield-line",              title: "Impact sur la caution",   desc: "Risque de perte du d\u00e9p\u00f4t de garantie et actions concr\u00e8tes" },
              { icon: "fr-icon-download-line",            title: "Rapport PDF",             desc: "T\u00e9l\u00e9chargeable et partageable avec votre propri\u00e9taire" }
            ].map((item, i) => (
              <div key={i} className="fr-col-12 fr-col-md-6">
                <div className="ctb-feature">
                  <span className={`${item.icon} fr-icon--lg ctb-feature__icon`} aria-hidden="true"></span>
                  <div className="ctb-feature__body">
                    <p className="ctb-feature__title">{item.title}</p>
                    <p className="ctb-feature__desc">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Temoignages — 3 columns */}
      <div style={{ maxWidth: "1000px", margin: "3rem auto", padding: "0 1rem" }}>
        <h2 style={{ textAlign: "center", color: "#000091", marginBottom: "2rem" }}>
          Ils ont analys&eacute; leur bail
        </h2>
        <div className="testimonials-scroll">
          {[
            {
              name: "Marie L.",
              city: "Paris, \u00cele-de-France",
              bail: "T2 vide \u00b7 850\u20ac/mois",
              clauses: 1,
              text: "Mon propri\u00e9taire demandait 2 mois de caution pour un logement vide. Gr\u00e2ce \u00e0 CheckTonBail, j\u2019ai su que c\u2019\u00e9tait ill\u00e9gal et j\u2019ai obtenu la r\u00e9duction \u00e0 1 mois."
            },
            {
              name: "Thomas R.",
              city: "Lyon, Rh\u00f4ne-Alpes",
              bail: "T3 vide \u00b7 720\u20ac/mois",
              clauses: 3,
              text: "3 clauses abusives d\u00e9tect\u00e9es dans mon bail, dont des frais de quittance. J\u2019ai montr\u00e9 le rapport \u00e0 mon bailleur qui les a retir\u00e9es sans discuter."
            },
            {
              name: "Sophie M.",
              city: "Bordeaux, Gironde",
              bail: "Studio \u00b7 610\u20ac/mois",
              clauses: 2,
              text: "Avant de signer, j\u2019ai fait analyser le bail. R\u00e9sultat : une clause obligeait \u00e0 repeindre l\u2019appartement en sortant, m\u00eame apr\u00e8s 6 mois. Clause supprim\u00e9e avant la signature."
            }
          ].map((avis, i) => (
            <div key={i} style={{
              background: '#fff',
              border: '1px solid #e5e5e5',
              borderTop: '4px solid #000091',
              borderRadius: 4,
              padding: '1.5rem',
              display: 'flex', flexDirection: 'column',
              position: 'relative'
            }}>
              {/* Guillemet décoratif */}
              <div style={{
                fontFamily: 'Georgia, serif', fontSize: 72, color: '#f0f0fc',
                lineHeight: 1, position: 'absolute', top: 12, left: 18,
                userSelect: 'none', pointerEvents: 'none'
              }}>"</div>

              {/* Étoiles */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="15" height="15" viewBox="0 0 16 16" fill="#000091">
                    <path d="M8 1l1.9 4 4.3.6-3.1 3 .7 4.3L8 11l-3.8 1.9.7-4.3-3.1-3 4.3-.6z"/>
                  </svg>
                ))}
              </div>

              <p style={{
                fontStyle: 'italic', color: '#3a3a3a', lineHeight: 1.7,
                margin: '0 0 1.25rem', fontSize: '0.93rem',
                position: 'relative', zIndex: 1, whiteSpace: 'normal', wordBreak: 'break-word'
              }}>
                &laquo; {avis.text} &raquo;
              </p>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                <p style={{ margin: '0 0 2px', fontSize: '0.9rem', fontWeight: 700, color: '#1e1e1e' }}>{avis.name}</p>
                <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: '#6b7280' }}>{avis.city}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11, color: '#6b7280',
                    background: '#f5f5f5', padding: '2px 8px', borderRadius: 2
                  }}>{avis.bail}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#CE0500',
                    background: '#fee9e7', padding: '2px 8px', borderRadius: 2
                  }}>{avis.clauses} clause{avis.clauses > 1 ? 's' : ''} ill&eacute;gale{avis.clauses > 1 ? 's' : ''} d&eacute;tect&eacute;e{avis.clauses > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Second CTA — full-width band */}
      <div style={{ background: "#000091", margin: "0 -2rem", padding: "3rem 2rem", textAlign: "center" }}>
        <h2 style={{ color: "#fff", marginTop: 0, marginBottom: "0.5rem", fontSize: "1.4rem" }}>
          Pr&ecirc;t &agrave; analyser votre bail ?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "1.5rem", fontSize: "1rem" }}>
          D&eacute;tectez les clauses ill&eacute;gales de votre bail
        </p>
        <button
          className="fr-btn fr-btn--lg"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            padding: "16px 40px", fontSize: "1.1rem",
            background: "#fff", color: "#000091", border: "none", fontWeight: "700"
          }}
        >
          Analyser mon bail - {PRICE}
        </button>
      </div>

      {/* FAQ — wider */}
      <div style={{ maxWidth: "900px", margin: "3rem auto", padding: "0 1rem" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#000091" }}>FAQ</h2>
        {faqItems.map((item, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <button
              onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              style={{
                width: '100%', textAlign: 'left', padding: '14px 18px',
                background: openFaqIndex === index ? '#000091' : '#fff',
                color: openFaqIndex === index ? '#fff' : '#000',
                border: '1px solid #ddd',
                borderRadius: openFaqIndex === index ? '8px 8px 0 0' : '8px',
                cursor: 'pointer', fontSize: '15px', fontWeight: 600,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <span>{item.q}</span>
              <span style={{ fontSize: '18px' }}>{openFaqIndex === index ? '\u2212' : '+'}</span>
            </button>
            {openFaqIndex === index && (
              <div style={{
                padding: '16px 18px', background: '#f6f6f6',
                borderRadius: '0 0 8px 8px', border: '1px solid #ddd',
                borderTop: 'none', lineHeight: 1.7, color: '#333', fontSize: '0.95rem'
              }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// APP PRINCIPALE
// ==========================================
function pageFromPath(path) {
  if (path === "/blog" || path === "/blog/") return { page: "blog-list", slug: null };
  if (path.startsWith("/blog/")) {
    const slug = path.replace("/blog/", "").replace(/\/$/, "");
    return { page: "blog-article", slug };
  }
  return { page: "analyse", slug: null };
}

function App() {
  const initial = pageFromPath(window.location.pathname);
  const [currentPage, setCurrentPage] = useState(initial.page);
  const [blogSlug, setBlogSlug] = useState(initial.slug);
  const [userId, setUserId] = useState(null);

  const t = (key) => translations[key] || key;

  // URL sync: navigate function
  const navigate = useCallback((page, slug = null) => {
    let url = "/";
    if (page === "blog-list") url = "/blog/";
    else if (page === "blog-article" && slug) url = `/blog/${slug}/`;
    window.history.pushState({}, "", url);
    setCurrentPage(page);
    setBlogSlug(slug);
    window.scrollTo(0, 0);
  }, []);

  // Back/forward browser navigation
  useEffect(() => {
    const handlePop = () => {
      const { page, slug } = pageFromPath(window.location.pathname);
      setCurrentPage(page);
      setBlogSlug(slug);
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  useEffect(() => {
    let id = localStorage.getItem("checktonbail_userId");
    if (!id) {
      id = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("checktonbail_userId", id);
    }
    setUserId(id);
  }, []);

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>

      {/* Header DSFR */}
      <header role="banner" className="fr-header">
        <div className="fr-header__body">
          <div className="fr-container">
            <div className="fr-header__body-row">
              <div className="fr-header__brand fr-enlarge-link">
                <div className="fr-header__brand-top">
                  <div className="fr-header__logo">
                    <a href="/" onClick={(e) => { e.preventDefault(); navigate("analyse"); }} title="Accueil - CheckTonBail" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
                      <img src="/logo-checktonbail.svg" alt="CheckTonBail" style={{ height: "40px", width: "40px" }} />
                      <span style={{ fontWeight: 700, fontSize: "20px", color: "#000091" }}>CheckTonBail</span>
                    </a>
                  </div>
                </div>
                <div className="fr-header__service">
                  <p className="fr-header__service-tagline">{t('tagline')}</p>
                </div>
              </div>
              <div className="fr-header__tools">
                <div className="fr-header__tools-links">
                  <ul className="fr-btns-group" style={{ alignItems: 'center' }}>
                    <li>
                      <button
                        className={`fr-btn ${currentPage === "analyse" ? "" : "fr-btn--secondary"}`}
                        onClick={() => navigate("analyse")}
                      >
                        Analyse
                      </button>
                    </li>
                    <li>
                      <button
                        className={`fr-btn ${currentPage === "blog-list" || currentPage === "blog-article" ? "" : "fr-btn--secondary"}`}
                        onClick={() => navigate("blog-list")}
                      >
                        Blog
                      </button>
                    </li>
                    <li>
                      <button
                        className={`fr-btn ${currentPage === "about" ? "" : "fr-btn--secondary"}`}
                        onClick={() => setCurrentPage("about")}
                      >
                        &Agrave; propos
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main role="main" id="content">
        {currentPage === "blog-list" && <BlogList navigate={navigate} />}
        {currentPage === "blog-article" && <BlogArticle slug={blogSlug} navigate={navigate} />}
        {currentPage !== "blog-list" && currentPage !== "blog-article" && (
          <div className="fr-container fr-pb-8w" style={{ paddingTop: 0 }}>
            {currentPage === "analyse" && (
              <AnalyseBail
                userId={userId}
                t={t}
              />
            )}
            {currentPage === "about" && <AboutPage />}
            {currentPage === "faq" && <FAQ />}
            {currentPage === "mentions" && <MentionsLegales />}
            {currentPage === "cgv" && <CGV />}
            {currentPage === "confidentialite" && <PolitiqueConfidentialite />}
          </div>
        )}
      </main>

      {/* Footer DSFR */}
      <footer className="fr-footer" role="contentinfo" id="footer">
        <div className="fr-container">
          <div className="fr-footer__body">
            <div className="fr-footer__brand fr-enlarge-link" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img src="/logo-checktonbail.svg" alt="CheckTonBail" style={{ height: "36px", width: "36px" }} />
              <div>
                <div style={{ fontWeight: 700 }}>CheckTonBail</div>
                <div className="fr-text--xs" style={{ color: "#666" }}>Service priv&eacute; ind&eacute;pendant</div>
              </div>
            </div>
            <div className="fr-footer__content">
              <p className="fr-footer__content-desc">
                CheckTonBail analyse votre bail locatif gr&acirc;ce &agrave; l'intelligence artificielle
                pour d&eacute;tecter les clauses abusives et vous prot&eacute;ger.
              </p>
            </div>
          </div>
          <div className="fr-footer__bottom">
            <ul className="fr-footer__bottom-list">
              <li className="fr-footer__bottom-item">
                <span className="fr-footer__bottom-link">&copy; {new Date().getFullYear()} CheckTonBail</span>
              </li>

              <li className="fr-footer__bottom-item">
                <button className="fr-footer__bottom-link" onClick={() => navigate("blog-list")}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Blog</button>
              </li>
              <li className="fr-footer__bottom-item">
                <button className="fr-footer__bottom-link" onClick={() => setCurrentPage("mentions")}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>{t('legalNotice')}</button>
              </li>
              <li className="fr-footer__bottom-item">
                <button className="fr-footer__bottom-link" onClick={() => setCurrentPage("cgv")}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>{t('terms')}</button>
              </li>
              <li className="fr-footer__bottom-item">
                <button className="fr-footer__bottom-link" onClick={() => setCurrentPage("confidentialite")}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>{t('privacy')}</button>
              </li>
              <li className="fr-footer__bottom-item">
                <a href="mailto:checkTonBail@outlook.com" className="fr-footer__bottom-link">{t('contact')}</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}

// ==========================================
// PAGES STATIQUES
// ==========================================
function AboutPage() {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <div className="fr-col-12 fr-col-lg-8">
        <h1>&Agrave; propos de CheckTonBail</h1>

        <section className="fr-mb-4w">
          <h2>Notre mission</h2>
          <p>
            CheckTonBail utilise l'intelligence artificielle pour analyser les baux d'habitation
            et d&eacute;tecter les clauses abusives ou ill&eacute;gales. Notre objectif : prot&eacute;ger les locataires
            en leur donnant acc&egrave;s &agrave; une expertise juridique accessible et abordable.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Comment &ccedil;a marche ?</h2>
          <ol className="fr-ml-2w">
            <li className="fr-mb-2w">
              <strong>D&eacute;posez votre bail</strong> &mdash; Uploadez votre contrat de location au format PDF
            </li>
            <li className="fr-mb-2w">
              <strong>Analyse rapide</strong> &mdash; Recevez un aper&ccedil;u des points cl&eacute;s et du niveau de risque
            </li>
            <li className="fr-mb-2w">
              <strong>Rapport complet</strong> &mdash; Pour {PRICE}, acc&eacute;dez au d&eacute;tail de chaque clause
            </li>
          </ol>
        </section>

        <div className="fr-callout fr-mb-4w">
          <h3 className="fr-callout__title">Base l&eacute;gale</h3>
          <p className="fr-callout__text">
            Notre analyse se base sur la loi du 6 juillet 1989, les lois ALUR et ELAN,
            le Code civil (article 1171), et la jurisprudence r&eacute;cente en mati&egrave;re de baux d'habitation.
          </p>
        </div>

        <div className="fr-alert fr-alert--info">
          <p>
            <strong>Avertissement :</strong> CheckTonBail fournit une analyse automatis&eacute;e &agrave; titre informatif.
            Elle ne remplace pas l'avis d'un professionnel du droit. En cas de litige,
            consultez un avocat ou une association de d&eacute;fense des locataires.
          </p>
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = React.useState(null);

  const faqItems = [
    {
      question: "Comment fonctionne CheckTonBail ?",
      answer: "En 3 \u00e9tapes : (1) D\u00e9posez votre bail au format PDF. (2) Recevez gratuitement un aper\u00e7u avec le score de risque et le nombre de clauses probl\u00e9matiques d\u00e9tect\u00e9es. (3) Pour 9,90\u20ac, acc\u00e9dez au rapport complet avec le d\u00e9tail de chaque clause, les bases l\u00e9gales et les recommandations personnalis\u00e9es."
    },
    {
      question: "C\u2019est quoi l\u2019aper\u00e7u gratuit ?",
      answer: "L\u2019aper\u00e7u gratuit vous donne : le score de risque de votre bail sur 10, le nombre de clauses probl\u00e9matiques d\u00e9tect\u00e9es, et les titres des clauses concern\u00e9es. Le d\u00e9tail (texte exact, base l\u00e9gale, recommandation) est accessible dans le rapport complet."
    },
    {
      question: "Que contient le rapport complet \u00e0 9,90\u20ac ?",
      answer: "Le rapport complet comprend : chaque clause abusive avec son extrait exact et la r\u00e9f\u00e9rence de loi pr\u00e9cise, les clauses d\u00e9s\u00e9quilibr\u00e9es (l\u00e9gales mais d\u00e9favorables), les points \u00e0 surveiller avant de signer, les \u00e9l\u00e9ments qui vous prot\u00e8gent, l\u2019\u00e9valuation du risque de perte de votre d\u00e9p\u00f4t de garantie, et des recommandations concr\u00e8tes. Le tout est t\u00e9l\u00e9chargeable en PDF."
    },
    {
      question: "Quels types de baux analysez-vous ?",
      answer: "Nous analysons tous les baux d\u2019habitation r\u00e9gis par la loi fran\u00e7aise : baux vides (non meubl\u00e9s), baux meubl\u00e9s, baux \u00e9tudiants (9 mois) et baux mobilit\u00e9. L\u2019analyse s\u2019appuie sur la loi du 6 juillet 1989, les lois ALUR et ELAN, et le Code civil."
    },
    {
      question: "Mes documents sont-ils s\u00e9curis\u00e9s ?",
      answer: "Oui. Votre bail est transmis via une connexion chiffr\u00e9e (SSL), analys\u00e9 en temps r\u00e9el, puis imm\u00e9diatement supprim\u00e9 de nos serveurs. Nous ne conservons aucune copie de votre document. Vos donn\u00e9es bancaires sont trait\u00e9es exclusivement par Stripe. Traitement conforme au RGPD."
    },
    {
      question: "L\u2019analyse remplace-t-elle un avocat ?",
      answer: "Non. CheckTonBail fournit une analyse informative bas\u00e9e sur l\u2019intelligence artificielle pour vous aider \u00e0 comprendre votre bail et identifier les points probl\u00e9matiques. Pour un litige actif ou une situation complexe, consultez un avocat sp\u00e9cialis\u00e9 en droit immobilier ou une association de d\u00e9fense des locataires."
    },
    {
      question: "Que faire si mon bail contient des clauses abusives ?",
      answer: "Les clauses abusives sont r\u00e9put\u00e9es non \u00e9crites par la loi, m\u00eame si vous avez sign\u00e9 le bail. Vous pouvez exiger leur suppression par courrier recommand\u00e9 avec accus\u00e9 de r\u00e9ception en citant la base l\u00e9gale (fournie dans votre rapport). En cas de refus, saisissez la Commission D\u00e9partementale de Conciliation ou le tribunal judiciaire."
    },
    {
      question: "Satisfait ou rembours\u00e9 ?",
      answer: "Si vous n\u2019\u00eates pas satisfait de votre analyse, contactez-nous dans les 7 jours suivant votre achat \u00e0 checkTonBail@outlook.com. Nous proc\u00e9dons au remboursement int\u00e9gral, sans question."
    }
  ];

  return (
    <div className="fr-grid-row fr-grid-row--center">
      <div className="fr-col-12 fr-col-lg-8">
        <h1>Questions Fr&eacute;quentes</h1>
        <p className="fr-text--lead fr-mb-4w">
          Tout ce que vous devez savoir sur CheckTonBail et l'analyse de votre bail locatif.
        </p>

        <div>
          {faqItems.map((item, index) => (
            <div key={index} style={{ marginBottom: '12px' }}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{
                  width: '100%', textAlign: 'left', padding: '16px 20px',
                  background: openIndex === index ? '#000091' : '#fff',
                  color: openIndex === index ? '#fff' : '#000',
                  border: '1px solid #ddd',
                  borderRadius: openIndex === index ? '8px 8px 0 0' : '8px',
                  cursor: 'pointer', fontSize: '16px', fontWeight: 600,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <span>{item.question}</span>
                <span style={{ fontSize: '20px' }}>{openIndex === index ? '\u2212' : '+'}</span>
              </button>
              {openIndex === index && (
                <div style={{
                  padding: '20px', background: '#f6f6f6',
                  borderRadius: '0 0 8px 8px', border: '1px solid #ddd',
                  borderTop: 'none', lineHeight: 1.7, color: '#333'
                }}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="fr-callout fr-mt-4w">
          <h3 className="fr-callout__title">Une autre question ?</h3>
          <p className="fr-callout__text">
            Contactez-nous par email &agrave; <a href="mailto:checkTonBail@outlook.com">checkTonBail@outlook.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function MentionsLegales() {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <div className="fr-col-12 fr-col-lg-8">
        <h1>Mentions L&eacute;gales</h1>

        <section className="fr-mb-4w">
          <h2>&Eacute;diteur du site</h2>
          <p>
            <strong>CheckTonBail SAS</strong><br />
            Email : <a href="mailto:checkTonBail@outlook.com">checkTonBail@outlook.com</a>
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>H&eacute;bergement</h2>
          <p>
            Les informations relatives &agrave; l'h&eacute;bergeur sont disponibles sur demande &agrave; l'adresse :
            <a href="mailto:checkTonBail@outlook.com"> checkTonBail@outlook.com</a>
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Propri&eacute;t&eacute; intellectuelle</h2>
          <p>
            L'ensemble du contenu de ce site est la propri&eacute;t&eacute; exclusive de CheckTonBail SAS.
            Toute reproduction sans autorisation est interdite.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Limitation de responsabilit&eacute;</h2>
          <p>
            CheckTonBail fournit une analyse automatis&eacute;e &agrave; titre informatif uniquement.
            Ce service ne constitue pas un conseil juridique et ne remplace pas la consultation
            d'un professionnel du droit.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Contact</h2>
          <p>
            Pour toute question concernant le site ou nos services :<br />
            <a href="mailto:checkTonBail@outlook.com">checkTonBail@outlook.com</a>
          </p>
        </section>

        <p className="fr-text--sm" style={{ color: '#666' }}>
          Derni&egrave;re mise &agrave; jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
}

function CGV() {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <div className="fr-col-12 fr-col-lg-8">
        <h1>Conditions G&eacute;n&eacute;rales de Vente</h1>

        <section className="fr-mb-4w">
          <h2>Objet</h2>
          <p>
            Les pr&eacute;sentes CGV r&eacute;gissent la vente du service d'analyse de baux propos&eacute; par CheckTonBail SAS.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Services</h2>
          <p>
            CheckTonBail propose un service d'analyse de baux d'habitation.
            Un aper&ccedil;u gratuit et une analyse compl&egrave;te payante sont disponibles.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Prix et paiement</h2>
          <p>
            Le prix de l'analyse compl&egrave;te est de {PRICE} TTC. Le paiement s'effectue en ligne
            de mani&egrave;re s&eacute;curis&eacute;e via Stripe. Le service est d&eacute;livr&eacute; imm&eacute;diatement apr&egrave;s paiement.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Garantie de satisfaction</h2>
          <p>
            Si vous n'&ecirc;tes pas satisfait de votre analyse, contactez-nous dans les 7 jours
            suivant votre achat &agrave; checkTonBail@outlook.com pour obtenir un remboursement int&eacute;gral.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Responsabilit&eacute;</h2>
          <p>
            CheckTonBail fournit une analyse &agrave; titre informatif. Ce service ne constitue pas
            un conseil juridique professionnel.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Contact</h2>
          <p>
            Pour toute question ou r&eacute;clamation :<br />
            <a href="mailto:checkTonBail@outlook.com">checkTonBail@outlook.com</a>
          </p>
        </section>

        <p className="fr-text--sm" style={{ color: '#666' }}>
          Derni&egrave;re mise &agrave; jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
}

function PolitiqueConfidentialite() {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <div className="fr-col-12 fr-col-lg-8">
        <h1>Politique de Confidentialit&eacute;</h1>

        <section className="fr-mb-4w">
          <h2>Responsable du traitement</h2>
          <p>
            <strong>CheckTonBail SAS</strong><br />
            Email : <a href="mailto:checkTonBail@outlook.com">checkTonBail@outlook.com</a>
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Donn&eacute;es collect&eacute;es</h2>
          <p>
            Nous collectons uniquement les donn&eacute;es n&eacute;cessaires au fonctionnement du service.
            Les documents que vous uploadez sont analys&eacute;s puis supprim&eacute;s imm&eacute;diatement.
            Vos donn&eacute;es bancaires sont trait&eacute;es de mani&egrave;re s&eacute;curis&eacute;e par notre prestataire de paiement.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Utilisation des donn&eacute;es</h2>
          <p>
            Vos donn&eacute;es sont utilis&eacute;es exclusivement pour fournir le service d'analyse.
            Nous ne vendons pas vos donn&eacute;es et ne les utilisons pas &agrave; des fins publicitaires.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Vos droits</h2>
          <p>
            Conform&eacute;ment au RGPD, vous disposez d'un droit d'acc&egrave;s, de rectification, de suppression
            et de portabilit&eacute; de vos donn&eacute;es. Pour exercer ces droits, contactez-nous &agrave; :
            <a href="mailto:checkTonBail@outlook.com"> checkTonBail@outlook.com</a>
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>S&eacute;curit&eacute;</h2>
          <p>
            Nous mettons en oeuvre des mesures de s&eacute;curit&eacute; appropri&eacute;es pour prot&eacute;ger vos donn&eacute;es.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Contact</h2>
          <p>
            Pour toute question relative &agrave; la protection de vos donn&eacute;es :<br />
            <a href="mailto:checkTonBail@outlook.com">checkTonBail@outlook.com</a>
          </p>
          <p>
            Vous pouvez &eacute;galement contacter la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
          </p>
        </section>

        <p className="fr-text--sm" style={{ color: '#666' }}>
          Derni&egrave;re mise &agrave; jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
}

function AppWithCookies() {
  return (
    <>
      <App />
      <CookieBanner />
    </>
  );
}

export default AppWithCookies;
