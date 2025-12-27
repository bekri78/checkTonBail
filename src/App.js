import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./App.css";

// En production: REACT_APP_API_BASE=https://ton-backend.railway.app
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

// Clé publique Stripe - En production: REACT_APP_STRIPE_PUBLIC_KEY=pk_live_xxx
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || "pk_test_S453tNJo0VGUC7Y6qNVxldgX00vo9ixxkp");

function App() {
  const [currentPage, setCurrentPage] = useState("analyse");
  const [userId, setUserId] = useState(null);

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
      {/* Header DSFR */}
      <header role="banner" className="fr-header">
        <div className="fr-header__body">
          <div className="fr-container">
            <div className="fr-header__body-row">
              <div className="fr-header__brand fr-enlarge-link">
                <div className="fr-header__brand-top">
                 <div className="fr-header__logo">
  <a href="/" title="Accueil - CheckTonBail" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
    <img
      src="/logo-checktonbail.svg"
      alt="CheckTonBail"
      style={{ height: "40px", width: "40px" }}
    />
    <span style={{ fontWeight: 700, fontSize: "20px", color: "#000091" }}>
      CheckTonBail
    </span>
  </a>
</div>

                </div>
              <div className="fr-header__service">
  <p className="fr-header__service-tagline">Analysez votre bail en toute confiance</p>
</div>

              </div>
              <div className="fr-header__tools">
                <div className="fr-header__tools-links">
                  <ul className="fr-btns-group">
                    <li>
                      <button 
                        className={`fr-btn ${currentPage === "analyse" ? "" : "fr-btn--secondary"}`}
                        onClick={() => setCurrentPage("analyse")}
                      >
                        Analyser
                      </button>
                    </li>
                    <li>
                      <button 
                        className={`fr-btn ${currentPage === "about" ? "" : "fr-btn--secondary"}`}
                        onClick={() => setCurrentPage("about")}
                      >
                        À propos
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
        <div className="fr-container fr-py-8w">
          {currentPage === "analyse" && <AnalyseBail userId={userId} />}
          {currentPage === "about" && <AboutPage />}
          {currentPage === "mentions" && <MentionsLegales />}
          {currentPage === "cgv" && <CGV />}
          {currentPage === "confidentialite" && <PolitiqueConfidentialite />}
        </div>
      </main>

      {/* Footer DSFR */}
      <footer className="fr-footer" role="contentinfo" id="footer">
        <div className="fr-container">
          <div className="fr-footer__body">
           <div className="fr-footer__brand fr-enlarge-link" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
  <img
    src="/logo-checktonbail.svg"
    alt="CheckTonBail"
    style={{ height: "36px", width: "36px" }}
  />
  <div>
    <div style={{ fontWeight: 700 }}>CheckTonBail</div>
    <div className="fr-text--xs" style={{ color: "#666" }}>Service privé indépendant</div>
  </div>
</div>

            <div className="fr-footer__content">
              <p className="fr-footer__content-desc">
                CheckTonBail analyse votre bail locatif grâce à l'intelligence artificielle
                pour détecter les clauses abusives et vous protéger.
              </p>
            </div>
          </div>
          <div className="fr-footer__bottom">
            <ul className="fr-footer__bottom-list">
              <li className="fr-footer__bottom-item">
                <span className="fr-footer__bottom-link">© {new Date().getFullYear()} CheckTonBail</span>
              </li>
              <li className="fr-footer__bottom-item">
                <button 
                  className="fr-footer__bottom-link" 
                  onClick={() => setCurrentPage("mentions")}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Mentions légales
                </button>
              </li>
              <li className="fr-footer__bottom-item">
                <button 
                  className="fr-footer__bottom-link" 
                  onClick={() => setCurrentPage("cgv")}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  CGV
                </button>
              </li>
              <li className="fr-footer__bottom-item">
                <button 
                  className="fr-footer__bottom-link" 
                  onClick={() => setCurrentPage("confidentialite")}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Confidentialité
                </button>
              </li>
              <li className="fr-footer__bottom-item">
                <a href="mailto:checkTonBail@outlook.com" className="fr-footer__bottom-link">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Loader fullscreen */}
      <LoaderOverlay />
    </>
  );
}

// Contexte global pour le loader
const LoaderContext = React.createContext();

function LoaderOverlay() {
  return null; // On gère dans chaque composant
}

function AnalyseBail({ userId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [teaser, setTeaser] = useState(null);
  const [extractedText, setExtractedText] = useState(null);
  const [error, setError] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0] || null;
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile) => {
    if (selectedFile.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Le fichier ne doit pas dépasser 10 Mo.");
      return;
    }
    setFile(selectedFile);
    setAnalysis(null);
    setTeaser(null);
    setError("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleTeaserAnalysis = async () => {
    if (!file) {
      setError("Merci de sélectionner un fichier de bail.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);
    setTeaser(null);
    setExtractedText(null);

    try {
      console.log("🎁 Demande de teaser gratuit...");
      setProgress("Analyse rapide en cours...");
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/api/analyse-teaser`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      // Vérifier le rate limiting
      if (data.rateLimited) {
        setProgress("");
        setError(data.error || "Vous avez atteint la limite d'analyses gratuites. Passez à l'analyse complète !");
        setIsRateLimited(true);
        // On garde le fichier pour permettre le paiement direct
        return;
      }
      
      // Vérifier si ce n'est pas un bail
      if (data.isNotBail) {
        setProgress("");
        setError(data.message || "Ce document ne semble pas être un bail d'habitation.");
        setFile(null);
        return;
      }
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de l'analyse");
      }

      setProgress("");
      setIsRateLimited(false);
      setTeaser(data);
      if (data.extractedText) {
        setExtractedText(data.extractedText);
        console.log("📝 Texte extrait stocké:", data.extractedText.length, "caractères");
      }
      if (data.remaining !== undefined) {
        console.log(`📊 Analyses gratuites restantes: ${data.remaining}`);
      }
    } catch (err) {
      console.error(err);
      setProgress("");
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const runPaidAnalysis = async () => {
    console.log("🚀 runPaidAnalysis appelé");
    
    setShowPaymentModal(false);
    setClientSecret(null);
    
    if (!extractedText) {
      setError("Texte du bail manquant. Veuillez réanalyser le document.");
      return;
    }

    setLoading(true);
    setError("");
    setProgress("Paiement validé ! Analyse complète  en cours...");

    try {
      const res = await fetch(`${API_BASE}/api/analyse-bail-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bailText: extractedText,
          fileName: teaser?.fileName || file?.name || "bail.pdf",
          userId
        })
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de l'analyse");
      }

      console.log("✅ Analyse payante terminée !");
      setProgress("");
      setAnalysis(data);
      setTeaser(null);
    } catch (err) {
      console.error(err);
      setProgress("");
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = async () => {
    if (!file || !userId) {
      setError("Erreur: fichier ou utilisateur non identifié");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();
      if (data.success && data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPaymentModal(true);
      } else {
        setError("Erreur lors de l'initialisation du paiement");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion au serveur");
    }
  };

  // Paiement direct (sans teaser, pour les utilisateurs rate limited)
  const handleOpenPaymentDirect = async () => {
    if (!file || !userId) {
      setError("Erreur: fichier ou utilisateur non identifié");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();
      if (data.success && data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPaymentModal(true);
      } else {
        setError("Erreur lors de l'initialisation du paiement");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion au serveur");
    }
  };

  // Analyse payante directe (avec OCR car pas de teaser préalable)
  const runPaidAnalysisDirect = async () => {
    console.log("🚀 runPaidAnalysisDirect appelé (avec OCR)");
    
    setShowPaymentModal(false);
    setClientSecret(null);
    
    if (!file) {
      setError("Fichier manquant. Veuillez réessayer.");
      return;
    }

    setLoading(true);
    setError("");
    setProgress("Paiement validé ! Extraction du texte en cours...");

    try {
      // Upload du fichier pour analyse complète avec OCR
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const res = await fetch(`${API_BASE}/api/analyse-bail`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de l'analyse");
      }

      console.log("✅ Analyse payante directe terminée !");
      setProgress("");
      setAnalysis(data);
      setIsRateLimited(false);
    } catch (err) {
      console.error(err);
      setProgress("");
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // Loader fullscreen avec slides de stats
  const [slideIndex, setSlideIndex] = useState(0);
  
  const loaderSlides = [
    {
      emoji: "🏠",
      stat: "40%",
      text: "des baux contiennent au moins une clause abusive en France"
    },
    {
      emoji: "💰",
      stat: "3,9 milliards €",
      text: "de dépôts de garantie non restitués chaque année en France"
    },
    {
      emoji: "⚖️",
      stat: "1 locataire sur 4",
      text: "ne récupère pas l'intégralité de sa caution"
    },
    {
      emoji: "📋",
      stat: "68%",
      text: "des locataires ne lisent pas entièrement leur bail avant de signer"
    },
    {
      emoji: "🔍",
      stat: "2 mois",
      text: "délai maximum légal pour restituer le dépôt de garantie"
    },
    {
      emoji: "📝",
      stat: "23 clauses",
      text: "sont réputées abusives selon la loi ALUR de 2014"
    }
  ];

  // Effet pour changer les slides automatiquement
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setSlideIndex(prev => (prev + 1) % loaderSlides.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading, loaderSlides.length]);

  if (loading) {
    const currentSlide = loaderSlides[slideIndex];
    return (
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "#f5f5fe",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px"
      }}>
        {/* Spinner */}
        <div style={{
          width: "60px",
          height: "60px",
          border: "4px solid #e5e5e5",
          borderTop: "4px solid #000091",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "2rem"
        }}></div>
        
        {/* Message de progression */}
        <p className="fr-text--lg fr-text--bold" style={{ color: "#000091", marginBottom: "2rem" }}>
          {progress || "Analyse en cours..."}
        </p>

        {/* Slide de stats animée */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "2.5rem 2rem",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,145,0.1)",
          animation: "fadeIn 0.5s ease-in-out"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>
            {currentSlide.emoji}
          </div>
          <div style={{ 
            fontSize: "2.5rem", 
            fontWeight: "bold", 
            color: "#000091",
            marginBottom: "1rem"
          }}>
            {currentSlide.stat}
          </div>
          <p style={{ 
            color: "#666", 
            fontSize: "1.1rem",
            margin: 0,
            lineHeight: "1.6",
            padding: "0 1rem"
          }}>
            {currentSlide.text}
          </p>
        </div>

        {/* Indicateurs de slides */}
        <div style={{ display: "flex", gap: "8px", marginTop: "1.5rem" }}>
          {loaderSlides.map((_, i) => (
            <div 
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: i === slideIndex ? "#000091" : "#ccc",
                transition: "background-color 0.3s"
              }}
            />
          ))}
        </div>

        {/* Petit message */}
        <p className="fr-text--xs" style={{ color: "#666", marginTop: "2rem" }}>
          💡 Le saviez-vous ? CheckTonBail analyse chaque clause de votre contrat.
        </p>
      </div>
    );
  }

  // === AFFICHAGE UPLOAD ===
  if (!analysis && !teaser) {
    return (
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
          {/* Hero */}
          <div className="fr-mb-6w" style={{ textAlign: "center" }}>
            <h1>Analysez votre bail gratuitement</h1>
            <p className="fr-text--lead">
              Déposez votre bail et découvrez instantanément les clauses problématiques
            </p>
          </div>

          {/* Upload avec Drag & Drop */}
          <div 
            className={`drop-zone ${isDragging ? 'drop-zone--active' : ''} ${file ? 'drop-zone--success' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload').click()}
            style={{
              border: `2px dashed ${isDragging ? '#000091' : file ? '#18753C' : '#cecece'}`,
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragging ? '#f5f5fe' : file ? '#b8fec9' : '#fafafa',
              transition: 'all 0.2s ease'
            }}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            {file ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✅</div>
                <p className="fr-text--bold" style={{ color: '#18753C', marginBottom: '0.5rem' }}>
                  {file.name}
                </p>
                <p className="fr-text--sm" style={{ color: '#666' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} Mo
                </p>
                <p className="fr-text--xs" style={{ color: '#666', marginTop: '0.5rem' }}>
                  Cliquez pour changer de fichier
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>📄</div>
                <p className="fr-text--bold" style={{ marginBottom: '0.75rem' }}>
                  {isDragging ? 'Déposez votre fichier ici' : 'Glissez-déposez votre bail ici'}
                </p>
                <p className="fr-text--sm" style={{ color: '#666', marginBottom: '0.5rem' }}>
                  ou cliquez pour sélectionner un fichier
                </p>
                <p className="fr-text--xs" style={{ color: '#666', marginTop: '0.5rem' }}>
                  PDF uniquement • 10 Mo max
                </p>
              </>
            )}
          </div>

          {error && (
            <div className="fr-alert fr-alert--error fr-mt-2w">
              <p>{error}</p>
            </div>
          )}

          {/* Boutons selon l'état */}
          <div className="fr-mt-4w">
            {isRateLimited && file ? (
              <>
                {/* CTA Paiement direct quand rate limited */}
                <div className="fr-callout fr-callout--blue-france fr-mb-2w">
                  <h3 className="fr-callout__title">🔓 Passez à l'analyse complète</h3>
                  <p className="fr-callout__text">
                    Vous avez utilisé vos 3 analyses gratuites du jour. 
                    Obtenez l'analyse détaillée de votre bail avec toutes les clauses problématiques.
                  </p>
                </div>
                <button
                  className="fr-btn fr-btn--lg"
                  onClick={handleOpenPaymentDirect}
                  disabled={loading}
                  style={{ width: "100%" }}
                >
                  💳 Analyser mon bail - 1.99€
                </button>
                <p className="fr-text--xs" style={{ textAlign: 'center', marginTop: '0.5rem', color: '#666' }}>
                  Paiement sécurisé par Stripe
                </p>
              </>
            ) : (
              <button
                className="fr-btn fr-btn--lg"
                onClick={handleTeaserAnalysis}
                disabled={!file || loading}
                style={{ width: "100%" }}
              >
                🔍 Analyser mon bail gratuitement
              </button>
            )}
          </div>

          {/* Callout info */}
          <div className="fr-callout fr-mt-6w">
            <h3 className="fr-callout__title">💡 Comment ça marche ?</h3>
            <p className="fr-callout__text">
              1. Déposez votre bail au format PDF<br />
              2. Recevez un aperçu gratuit des points clés<br />
              3. Débloquez l'analyse complète pour 1.99€
            </p>
          </div>

          {/* Modal Paiement (pour rate limited) */}
          {showPaymentModal && clientSecret && (
            <div style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px"
            }}>
              <div style={{
                backgroundColor: "#fff",
                padding: "32px",
                borderRadius: "8px",
                maxWidth: "500px",
                width: "100%",
                position: "relative"
              }}>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer"
                  }}
                >
                  ✕
                </button>
                <h2 className="fr-mb-2w">💳 Paiement sécurisé</h2>
                <p className="fr-text--lg fr-mb-4w">Analyse complète : <strong>1.99€</strong></p>
                
                <Elements stripe={stripePromise} options={{ 
                  clientSecret, 
                  appearance: { theme: 'stripe' }
                }}>
                  <CheckoutForm 
                    onSuccess={runPaidAnalysisDirect} 
                    onCancel={() => setShowPaymentModal(false)} 
                  />
                </Elements>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === AFFICHAGE TEASER ===
  if (teaser) {
    const t = teaser.teaser;
    const riskColor = t.niveau_risque === "élevé" ? "error" : t.niveau_risque === "modéré" ? "warning" : "success";
    
    return (
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-lg-10">
          {/* Retour */}
          <button 
            className="fr-btn fr-btn--tertiary-no-outline fr-mb-4w"
            onClick={() => { setTeaser(null); setFile(null); }}
          >
            ← Analyser un autre bail
          </button>

          {/* Header teaser */}
          <div className="fr-callout fr-mb-4w">
            <h2 className="fr-callout__title">🎁 Aperçu gratuit de votre bail</h2>
            <p>Fichier : {teaser.fileName}</p>
          </div>

          {/* Infos clés */}
          <div className="fr-grid-row fr-grid-row--gutters fr-mb-4w">
            <div className="fr-col-6 fr-col-md-3">
              <div className="fr-tile fr-tile--horizontal">
                <div className="fr-tile__body">
                  <div className="fr-tile__content">
                    <h3 className="fr-tile__title" style={{fontSize: "0.9rem"}}>Type de bail</h3>
                    <p className="fr-tile__desc">{t.type_bail}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="fr-col-6 fr-col-md-3">
              <div className="fr-tile fr-tile--horizontal">
                <div className="fr-tile__body">
                  <div className="fr-tile__content">
                    <h3 className="fr-tile__title" style={{fontSize: "0.9rem"}}>Loyer mensuel</h3>
                    <p className="fr-tile__desc">{t.loyer_mensuel}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="fr-col-6 fr-col-md-3">
              <div className="fr-tile fr-tile--horizontal">
                <div className="fr-tile__body">
                  <div className="fr-tile__content">
                    <h3 className="fr-tile__title" style={{fontSize: "0.9rem"}}>Dépôt garantie</h3>
                    <p className="fr-tile__desc">{t.depot_garantie}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="fr-col-6 fr-col-md-3">
              <div className="fr-tile fr-tile--horizontal">
                <div className="fr-tile__body">
                  <div className="fr-tile__content">
                    <h3 className="fr-tile__title" style={{fontSize: "0.9rem"}}>Durée</h3>
                    <p className="fr-tile__desc">{t.duree_bail}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score de risque */}
          <div className={`fr-alert fr-alert--${riskColor} fr-mb-4w`}>
            <h3 className="fr-alert__title">
              Niveau de risque : {t.niveau_risque?.toUpperCase()}
            </h3>
            <p>
              {t.nb_clauses_problematiques} clause(s) problématique(s) détectée(s)
            </p>
          </div>

          {/* Résumé */}
          <section className="fr-mb-4w" style={{ 
            backgroundColor: '#f6f6f6', 
            padding: '1.5rem', 
            borderRadius: '8px' 
          }}>
            <h3>📋 Résumé de l'analyse</h3>
            <p>{t.resume}</p>
          </section>

          {/* Section floutée */}
          <div className="fr-mb-4w" style={{ 
            position: "relative", 
            overflow: "hidden",
            backgroundColor: '#f6f6f6',
            padding: '1.5rem',
            borderRadius: '8px'
          }}>
            <div style={{ filter: "blur(5px)", userSelect: "none" }}>
              <h3>Détail des clauses problématiques</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...</p>
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur...</p>
            </div>
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.85)"
            }}>
              <span style={{ fontSize: "2.5rem" }}>🔒</span>
              <p className="fr-text--bold fr-mt-2w">Contenu réservé à l'analyse complète</p>
            </div>
          </div>

          {/* Info analyses restantes */}
          {teaser.remaining !== undefined && (
            <div className={`fr-alert fr-alert--${teaser.remaining === 0 ? 'warning' : 'info'} fr-mb-4w`}>
              <p>
                {teaser.remaining > 0 
                  ? `📊 Il vous reste ${teaser.remaining} analyse(s) gratuite(s) aujourd'hui.`
                  : "⚠️ C'était votre dernière analyse gratuite de la journée !"}
              </p>
            </div>
          )}

          {/* CTA Paiement */}
          <div className="fr-callout fr-callout--blue-france">
            <h3 className="fr-callout__title">🔓 Débloquer l'analyse complète</h3>
            <p className="fr-callout__text">
              Accédez à l'analyse détaillée de chaque clause, aux recommandations personnalisées
              et aux actions concrètes pour protéger votre caution.
            </p>
            <button className="fr-btn fr-btn--lg" onClick={handleOpenPayment}>
              Obtenir l'analyse complète - 1.99€
            </button>
          </div>

          {error && (
            <div className="fr-alert fr-alert--error fr-mt-4w">
              <p>{error}</p>
            </div>
          )}

          {/* Modal Paiement */}
          {showPaymentModal && clientSecret && (
            <div style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px"
            }}>
              <div style={{
                backgroundColor: "#fff",
                padding: "32px",
                maxWidth: "500px",
                width: "100%",
                position: "relative"
              }}>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer"
                  }}
                >
                  ✕
                </button>
                <h2 className="fr-mb-2w">💳 Paiement sécurisé</h2>
                <p className="fr-text--lg fr-mb-4w">Analyse complète : <strong>1.99€</strong></p>
                
                <Elements stripe={stripePromise} options={{ 
                  clientSecret, 
                  appearance: { theme: 'stripe' }
                }}>
                  <CheckoutForm 
                    onSuccess={extractedText ? runPaidAnalysis : runPaidAnalysisDirect} 
                    onCancel={() => setShowPaymentModal(false)} 
                  />
                </Elements>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === AFFICHAGE ANALYSE COMPLÈTE ===
  if (analysis) {
    const a = analysis.analysis;
    
    return (
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-lg-10">
          {/* Retour */}
          <button 
            className="fr-btn fr-btn--tertiary-no-outline fr-mb-4w"
            onClick={() => { setAnalysis(null); setTeaser(null); setFile(null); }}
          >
            ← Analyser un autre bail
          </button>

          {/* Header */}
          <div className="fr-callout fr-callout--green-emeraude fr-mb-4w">
            <h2 className="fr-callout__title">✅ Analyse complète de votre bail</h2>
            <p>Fichier : {analysis.fileName}</p>
          </div>

          {/* Clauses abusives */}
          {a.clauses_abusives?.length > 0 && (
            <div className="fr-mb-4w">
              <h3>🚨 Clauses abusives ({a.clauses_abusives.length})</h3>
              {a.clauses_abusives.map((clause, i) => (
                <div key={i} className="fr-alert fr-alert--error fr-mb-2w">
                  <p><strong>Extrait :</strong> "{clause.extrait}"</p>
                  <p><strong>Problème :</strong> {clause.probleme}</p>
                  <p><strong>Base légale :</strong> {clause.base_legale}</p>
                  <p><strong>Recommandation :</strong> {clause.recommandation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Clauses déséquilibrées */}
          {a.clauses_desequilibrees?.length > 0 && (
            <div className="fr-mb-4w">
              <h3>⚠️ Clauses déséquilibrées ({a.clauses_desequilibrees.length})</h3>
              {a.clauses_desequilibrees.map((clause, i) => (
                <div key={i} className="fr-alert fr-alert--warning fr-mb-2w">
                  <p><strong>Extrait :</strong> "{clause.extrait}"</p>
                  <p><strong>Problème :</strong> {clause.probleme}</p>
                  <p><strong>Recommandation :</strong> {clause.recommandation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Points à surveiller */}
          {a.points_a_surveiller?.length > 0 && (
            <div className="fr-mb-4w">
              <h3>👁️ Points à surveiller ({a.points_a_surveiller.length})</h3>
              {a.points_a_surveiller.map((point, i) => (
                <div key={i} className="fr-alert fr-alert--info fr-mb-2w">
                  <p><strong>Extrait :</strong> "{point.extrait}"</p>
                  <p><strong>Explication :</strong> {point.explication}</p>
                  <p><strong>Recommandation :</strong> {point.recommandation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Éléments favorables */}
          {a.elements_favorables_locataire?.length > 0 && (
            <div className="fr-mb-4w">
              <h3>✅ Points favorables ({a.elements_favorables_locataire.length})</h3>
              {a.elements_favorables_locataire.map((elem, i) => (
                <div key={i} className="fr-alert fr-alert--success fr-mb-2w">
                  <p><strong>Extrait :</strong> "{elem.extrait}"</p>
                  <p><strong>Pourquoi c'est bien :</strong> {elem.pourquoi_c_est_favorable}</p>
                </div>
              ))}
            </div>
          )}

          {/* Impact sur caution */}
          {a.impact_sur_caution && (
            <section className="fr-mb-4w" style={{ 
              backgroundColor: '#f6f6f6', 
              padding: '1.5rem', 
              borderRadius: '8px' 
            }}>
              <h3>💰 Impact sur votre caution</h3>
              <p><strong>Risque :</strong> {a.impact_sur_caution.risque_perte_caution}</p>
              <p>{a.impact_sur_caution.explication}</p>
              <h4>Actions concrètes :</h4>
              <ul>
                {a.impact_sur_caution.actions_concretes_pour_proteger_la_caution?.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Recommandations */}
          {a.recommandations_generales?.length > 0 && (
            <section className="fr-mb-4w" style={{ 
              backgroundColor: '#f6f6f6', 
              padding: '1.5rem', 
              borderRadius: '8px' 
            }}>
              <h3>📋 Recommandations générales</h3>
              <ul>
                {a.recommandations_generales.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Résumé */}
          <div className="fr-callout">
            <h3 className="fr-callout__title">📝 Résumé</h3>
            <p className="fr-callout__text">{a.resume_simple}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Composant CheckoutForm Stripe
function CheckoutForm({ onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
          payment_method_data: {
            billing_details: {
              name: 'Client CheckTonBail',
              email: 'client@checktonbail.fr',
              phone: '',
              address: {
                country: 'FR'
              }
            }
          }
        },
        redirect: "if_required"
      });

      if (error) {
        setPaymentError(error.message);
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("✅ Paiement réussi !");
        setIsProcessing(false);
        onSuccess();
      } else {
        setPaymentError("Le paiement n'a pas pu être confirmé");
        setIsProcessing(false);
      }
    } catch (err) {
      setPaymentError(err.message || "Erreur lors du paiement");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement 
        options={{ 
          layout: "tabs",
          fields: {
            billingDetails: {
              name: 'never',
              email: 'never',
              phone: 'never',
              address: 'never'
            }
          }
        }} 
      />
      
      {paymentError && (
        <div className="fr-alert fr-alert--error fr-alert--sm fr-mt-2w">
          <p>{paymentError}</p>
        </div>
      )}
      
      <div className="fr-btns-group fr-mt-4w" style={{ display: "flex", gap: "12px" }}>
        <button 
          type="button" 
          className="fr-btn fr-btn--secondary"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Annuler
        </button>
        <button 
          type="submit" 
          className="fr-btn"
          disabled={!stripe || isProcessing}
          style={{ flex: 1 }}
        >
          {isProcessing ? "Traitement..." : "Payer 1.99€"}
        </button>
      </div>
    </form>
  );
}

// Page À propos
function AboutPage() {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <div className="fr-col-12 fr-col-lg-8">
        <h1>À propos de CheckTonBail</h1>
        
        <section className="fr-mb-4w">
          <h2>Notre mission</h2>
          <p>
            CheckTonBail utilise l'intelligence artificielle pour analyser les baux d'habitation
            et détecter les clauses abusives ou illégales. Notre objectif : protéger les locataires
            en leur donnant accès à une expertise juridique accessible et abordable.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Comment ça marche ?</h2>
          <ol className="fr-ml-2w">
            <li className="fr-mb-2w">
              <strong>Déposez votre bail</strong> — Uploadez votre contrat de location au format PDF
            </li>
            <li className="fr-mb-2w">
              <strong>Analyse gratuite</strong> — Recevez un aperçu des points clés et du niveau de risque
            </li>
            <li className="fr-mb-2w">
              <strong>Analyse complète</strong> — Pour 1.99€, accédez au détail de chaque clause
            </li>
          </ol>
        </section>

        <div className="fr-callout fr-mb-4w">
          <h3 className="fr-callout__title">⚖️ Base légale</h3>
          <p className="fr-callout__text">
            Notre analyse se base sur la loi du 6 juillet 1989, les lois ALUR et ELAN,
            le Code civil (article 1171), et la jurisprudence récente en matière de baux d'habitation.
          </p>
        </div>

        <div className="fr-alert fr-alert--info">
          <p>
            <strong>Avertissement :</strong> CheckTonBail fournit une analyse automatisée à titre informatif.
            Elle ne remplace pas l'avis d'un professionnel du droit. En cas de litige,
            consultez un avocat ou une association de défense des locataires.
          </p>
        </div>
      </div>
    </div>
  );
}

// Page Mentions Légales
function MentionsLegales() {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <div className="fr-col-12 fr-col-lg-8">
        <h1>Mentions Légales</h1>
        
        <section className="fr-mb-4w">
          <h2>Éditeur du site</h2>
          <p>
            <strong>CheckTonBail SAS</strong><br />
            Email : <a href="mailto:checkTonBail@outlook.com">checkTonBail@outlook.com</a>
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Hébergement</h2>
          <p>
            Les informations relatives à l'hébergeur sont disponibles sur demande à l'adresse : 
            <a href="mailto:checkTonBail@outlook.com"> checkTonBail@outlook.com</a>
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Propriété intellectuelle</h2>
          <p>
            L'ensemble du contenu de ce site est la propriété exclusive de CheckTonBail SAS. 
            Toute reproduction sans autorisation est interdite.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Limitation de responsabilité</h2>
          <p>
            CheckTonBail fournit une analyse automatisée à titre informatif uniquement. 
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
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
}

// Page CGV
function CGV() {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <div className="fr-col-12 fr-col-lg-8">
        <h1>Conditions Générales de Vente</h1>
        
        <section className="fr-mb-4w">
          <h2>Objet</h2>
          <p>
            Les présentes CGV régissent la vente du service d'analyse de baux proposé par CheckTonBail SAS.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Services</h2>
          <p>
            CheckTonBail propose un service d'analyse de baux d'habitation. 
            Une version gratuite limitée et une version complète payante sont disponibles.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Prix et paiement</h2>
          <p>
            Le prix de l'analyse complète est de 1.99€ TTC. Le paiement s'effectue en ligne 
            de manière sécurisée. Le service est délivré immédiatement après paiement.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Droit de rétractation</h2>
          <p>
            Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation 
            ne s'applique pas aux contenus numériques fournis immédiatement. En validant le paiement, 
            vous acceptez l'exécution immédiate du service.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Responsabilité</h2>
          <p>
            CheckTonBail fournit une analyse à titre informatif. Ce service ne constitue pas 
            un conseil juridique professionnel.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Contact</h2>
          <p>
            Pour toute question ou réclamation :<br />
            <a href="mailto:checkTonBail@outlook.com">checkTonBail@outlook.com</a>
          </p>
        </section>

        <p className="fr-text--sm" style={{ color: '#666' }}>
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
}

// Page Politique de Confidentialité
function PolitiqueConfidentialite() {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <div className="fr-col-12 fr-col-lg-8">
        <h1>Politique de Confidentialité</h1>
        
        <section className="fr-mb-4w">
          <h2>Responsable du traitement</h2>
          <p>
            <strong>CheckTonBail SAS</strong><br />
            Email : <a href="mailto:checkTonBail@outlook.com">checkTonBail@outlook.com</a>
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Données collectées</h2>
          <p>
            Nous collectons uniquement les données nécessaires au fonctionnement du service. 
            Les documents que vous uploadez sont analysés puis supprimés immédiatement.
            Vos données bancaires sont traitées de manière sécurisée par notre prestataire de paiement.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Utilisation des données</h2>
          <p>
            Vos données sont utilisées exclusivement pour fournir le service d'analyse. 
            Nous ne vendons pas vos données et ne les utilisons pas à des fins publicitaires.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression 
            et de portabilité de vos données. Pour exercer ces droits, contactez-nous à :
            <a href="mailto:checkTonBail@outlook.com"> checkTonBail@outlook.com</a>
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données.
          </p>
        </section>

        <section className="fr-mb-4w">
          <h2>Contact</h2>
          <p>
            Pour toute question relative à la protection de vos données :<br />
            <a href="mailto:checkTonBail@outlook.com">checkTonBail@outlook.com</a>
          </p>
          <p>
            Vous pouvez également contacter la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
          </p>
        </section>

        <p className="fr-text--sm" style={{ color: '#666' }}>
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
}

export default App;
