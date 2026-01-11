// ==========================================
// 🌍 TRADUCTIONS MULTILINGUES
// ==========================================

export const COUNTRIES = [
  { code: 'FR', name: { fr: 'France', en: 'France', es: 'Francia', de: 'Frankreich', pt: 'França' }, flag: '🇫🇷' },
  { code: 'ES', name: { fr: 'Espagne', en: 'Spain', es: 'España', de: 'Spanien', pt: 'Espanha' }, flag: '🇪🇸' },
  { code: 'PT', name: { fr: 'Portugal', en: 'Portugal', es: 'Portugal', de: 'Portugal', pt: 'Portugal' }, flag: '🇵🇹' },
  { code: 'BE', name: { fr: 'Belgique', en: 'Belgium', es: 'Bélgica', de: 'Belgien', pt: 'Bélgica' }, flag: '🇧🇪' },
  { code: 'DE', name: { fr: 'Allemagne', en: 'Germany', es: 'Alemania', de: 'Deutschland', pt: 'Alemanha' }, flag: '🇩🇪' },
  { code: 'UK', name: { fr: 'Royaume-Uni', en: 'United Kingdom', es: 'Reino Unido', de: 'Vereinigtes Königreich', pt: 'Reino Unido' }, flag: '🇬🇧' },
];

export const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

export const translations = {
  fr: {
    // Header
    siteTitle: "CheckTonBail",
    tagline: "Analysez votre bail en 30 secondes",
    
    // Hero
    heroTitle: "Analysez votre bail gratuitement",
    heroSubtitle: "Déposez votre bail et découvrez instantanément les clauses problématiques",
    
    // Country selector
    selectCountry: "Dans quel pays est situé le logement ?",
    countryHelp: "Sélectionnez le pays pour une analyse juridique adaptée",
    
    // Upload
    dropzoneText: "Glissez-déposez votre bail ici",
    dropzoneTextDragging: "Déposez votre fichier ici",
    dropzoneClickText: "ou cliquez pour sélectionner un fichier",
    dropzoneFormat: "PDF uniquement • 10 Mo max",
    dropzoneChangeFile: "Cliquez pour changer de fichier",
    
    // Buttons
    analyzeButton: "🔍 Analyser mon bail gratuitement",
    analyzingButton: "⏳ Analyse en cours...",
    preparingButton: "⏳ Préparation...",
    payButton: "💳 Analyser mon bail - 1.99€",
    downloadReport: "📥 Télécharger le rapport PDF",
    newAnalysis: "🔄 Nouvelle analyse",
    
    // Progress
    preparingService: "⏳ Préparation du service d'analyse... (quelques secondes)",
    analyzingProgress: "Analyse rapide en cours...",
    paymentValidated: "Paiement validé ! Analyse complète en cours...",
    
    // Teaser
    teaserTitle: "Aperçu gratuit de votre bail",
    teaserUnlock: "🔓 Débloquer l'analyse complète",
    teaserUnlockDesc: "Obtenez toutes les clauses problématiques détaillées, les références légales et nos recommandations personnalisées.",
    
    // Results
    resultsTitle: "Analyse complète de votre bail",
    abusiveClauses: "Clauses abusives détectées",
    unbalancedClauses: "Clauses déséquilibrées",
    watchPoints: "Points à surveiller",
    favorableElements: "Éléments favorables au locataire",
    recommendations: "Recommandations générales",
    depositImpact: "Impact sur la caution",
    simpleSummary: "Résumé simple",
    
    // Labels
    problem: "Problème",
    legalBasis: "Base légale",
    recommendation: "Recommandation",
    explanation: "Explication",
    whyFavorable: "Pourquoi c'est favorable",
    riskLevel: "Niveau de risque",
    concreteActions: "Actions concrètes pour protéger votre caution",
    
    // Risk levels
    riskHigh: "Élevé",
    riskMedium: "Moyen",
    riskLow: "Faible",
    
    // How it works
    howItWorksTitle: "💡 Comment ça marche ?",
    howItWorksStep1: "1. Sélectionnez le pays du logement",
    howItWorksStep2: "2. Déposez votre bail au format PDF",
    howItWorksStep3: "3. Recevez un aperçu gratuit des points clés",
    howItWorksStep4: "4. Débloquez l'analyse complète pour 1.99€",
    
    // Rate limit
    rateLimitTitle: "🔓 Passez à l'analyse complète",
    rateLimitDesc: "Vous avez utilisé vos 3 analyses gratuites du jour. Obtenez l'analyse détaillée de votre bail avec toutes les clauses problématiques.",
    
    // Payment
    securePayment: "Paiement sécurisé par Stripe",
    paymentModalTitle: "Finaliser le paiement",
    paymentModalDesc: "Analyse complète de votre bail pour",
    
    // Errors
    errorFileType: "Seuls les fichiers PDF sont acceptés.",
    errorFileSize: "Le fichier ne doit pas dépasser 10 Mo.",
    errorNoFile: "Merci de sélectionner un fichier de bail.",
    errorSelectCountry: "Merci de sélectionner le pays du logement.",
    errorServer: "Impossible de contacter le serveur. Vérifiez votre connexion ou réessayez.",
    errorUnknown: "Erreur inconnue",
    
    // Cookies
    cookieTitle: "🍪 Gestion des cookies",
    cookieDesc: "Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic de notre site.",
    cookieAcceptAll: "Accepter tout",
    cookieAcceptEssential: "Cookies essentiels uniquement",
    cookieDetails: "En savoir plus",
    
    // Footer
    legalNotice: "Mentions légales",
    privacy: "Confidentialité",
    terms: "CGV",
    contact: "Contact",
    
    // Misc
    remaining: "analyses gratuites restantes aujourd'hui",
    lastFreeAnalysis: "Dernière analyse gratuite !",
  },
  
  en: {
    // Header
    siteTitle: "CheckTonBail",
    tagline: "Analyze your lease in 30 seconds",
    
    // Hero
    heroTitle: "Analyze your lease for free",
    heroSubtitle: "Upload your lease and instantly discover problematic clauses",
    
    // Country selector
    selectCountry: "Where is the property located?",
    countryHelp: "Select the country for adapted legal analysis",
    
    // Upload
    dropzoneText: "Drag and drop your lease here",
    dropzoneTextDragging: "Drop your file here",
    dropzoneClickText: "or click to select a file",
    dropzoneFormat: "PDF only • 10 MB max",
    dropzoneChangeFile: "Click to change file",
    
    // Buttons
    analyzeButton: "🔍 Analyze my lease for free",
    analyzingButton: "⏳ Analyzing...",
    preparingButton: "⏳ Preparing...",
    payButton: "💳 Full analysis - €1.99",
    downloadReport: "📥 Download PDF report",
    newAnalysis: "🔄 New analysis",
    
    // Progress
    preparingService: "⏳ Preparing analysis service... (a few seconds)",
    analyzingProgress: "Quick analysis in progress...",
    paymentValidated: "Payment validated! Full analysis in progress...",
    
    // Teaser
    teaserTitle: "Free preview of your lease",
    teaserUnlock: "🔓 Unlock full analysis",
    teaserUnlockDesc: "Get all detailed problematic clauses, legal references and our personalized recommendations.",
    
    // Results
    resultsTitle: "Complete analysis of your lease",
    abusiveClauses: "Abusive clauses detected",
    unbalancedClauses: "Unbalanced clauses",
    watchPoints: "Points to watch",
    favorableElements: "Elements favorable to tenant",
    recommendations: "General recommendations",
    depositImpact: "Impact on deposit",
    simpleSummary: "Simple summary",
    
    // Labels
    problem: "Problem",
    legalBasis: "Legal basis",
    recommendation: "Recommendation",
    explanation: "Explanation",
    whyFavorable: "Why it's favorable",
    riskLevel: "Risk level",
    concreteActions: "Concrete actions to protect your deposit",
    
    // Risk levels
    riskHigh: "High",
    riskMedium: "Medium",
    riskLow: "Low",
    
    // How it works
    howItWorksTitle: "💡 How does it work?",
    howItWorksStep1: "1. Select the property country",
    howItWorksStep2: "2. Upload your lease in PDF format",
    howItWorksStep3: "3. Get a free preview of key points",
    howItWorksStep4: "4. Unlock the full analysis for €1.99",
    
    // Rate limit
    rateLimitTitle: "🔓 Upgrade to full analysis",
    rateLimitDesc: "You've used your 3 free analyses today. Get the detailed analysis of your lease with all problematic clauses.",
    
    // Payment
    securePayment: "Secure payment by Stripe",
    paymentModalTitle: "Complete payment",
    paymentModalDesc: "Full analysis of your lease for",
    
    // Errors
    errorFileType: "Only PDF files are accepted.",
    errorFileSize: "File must not exceed 10 MB.",
    errorNoFile: "Please select a lease file.",
    errorSelectCountry: "Please select the property country.",
    errorServer: "Unable to contact server. Check your connection or try again.",
    errorUnknown: "Unknown error",
    
    // Cookies
    cookieTitle: "🍪 Cookie management",
    cookieDesc: "We use cookies to improve your experience and analyze site traffic.",
    cookieAcceptAll: "Accept all",
    cookieAcceptEssential: "Essential cookies only",
    cookieDetails: "Learn more",
    
    // Footer
    legalNotice: "Legal notice",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
    
    // Misc
    remaining: "free analyses remaining today",
    lastFreeAnalysis: "Last free analysis!",
  },
  
  es: {
    // Header
    siteTitle: "CheckTonBail",
    tagline: "Analiza tu contrato de alquiler en 30 segundos",
    
    // Hero
    heroTitle: "Analiza tu contrato gratis",
    heroSubtitle: "Sube tu contrato y descubre al instante las cláusulas problemáticas",
    
    // Country selector
    selectCountry: "¿Dónde está ubicada la vivienda?",
    countryHelp: "Selecciona el país para un análisis legal adaptado",
    
    // Upload
    dropzoneText: "Arrastra y suelta tu contrato aquí",
    dropzoneTextDragging: "Suelta tu archivo aquí",
    dropzoneClickText: "o haz clic para seleccionar un archivo",
    dropzoneFormat: "Solo PDF • 10 MB máx",
    dropzoneChangeFile: "Haz clic para cambiar el archivo",
    
    // Buttons
    analyzeButton: "🔍 Analizar mi contrato gratis",
    analyzingButton: "⏳ Analizando...",
    preparingButton: "⏳ Preparando...",
    payButton: "💳 Análisis completo - 1,99€",
    downloadReport: "📥 Descargar informe PDF",
    newAnalysis: "🔄 Nuevo análisis",
    
    // Progress
    preparingService: "⏳ Preparando servicio de análisis... (unos segundos)",
    analyzingProgress: "Análisis rápido en curso...",
    paymentValidated: "¡Pago validado! Análisis completo en curso...",
    
    // Teaser
    teaserTitle: "Vista previa gratuita de tu contrato",
    teaserUnlock: "🔓 Desbloquear análisis completo",
    teaserUnlockDesc: "Obtén todas las cláusulas problemáticas detalladas, referencias legales y nuestras recomendaciones personalizadas.",
    
    // Results
    resultsTitle: "Análisis completo de tu contrato",
    abusiveClauses: "Cláusulas abusivas detectadas",
    unbalancedClauses: "Cláusulas desequilibradas",
    watchPoints: "Puntos a vigilar",
    favorableElements: "Elementos favorables al inquilino",
    recommendations: "Recomendaciones generales",
    depositImpact: "Impacto en la fianza",
    simpleSummary: "Resumen simple",
    
    // Labels
    problem: "Problema",
    legalBasis: "Base legal",
    recommendation: "Recomendación",
    explanation: "Explicación",
    whyFavorable: "Por qué es favorable",
    riskLevel: "Nivel de riesgo",
    concreteActions: "Acciones concretas para proteger tu fianza",
    
    // Risk levels
    riskHigh: "Alto",
    riskMedium: "Medio",
    riskLow: "Bajo",
    
    // How it works
    howItWorksTitle: "💡 ¿Cómo funciona?",
    howItWorksStep1: "1. Selecciona el país de la vivienda",
    howItWorksStep2: "2. Sube tu contrato en formato PDF",
    howItWorksStep3: "3. Recibe una vista previa gratuita de los puntos clave",
    howItWorksStep4: "4. Desbloquea el análisis completo por 1,99€",
    
    // Rate limit
    rateLimitTitle: "🔓 Pasa al análisis completo",
    rateLimitDesc: "Has usado tus 3 análisis gratis de hoy. Obtén el análisis detallado de tu contrato con todas las cláusulas problemáticas.",
    
    // Payment
    securePayment: "Pago seguro con Stripe",
    paymentModalTitle: "Finalizar pago",
    paymentModalDesc: "Análisis completo de tu contrato por",
    
    // Errors
    errorFileType: "Solo se aceptan archivos PDF.",
    errorFileSize: "El archivo no debe superar los 10 MB.",
    errorNoFile: "Por favor, selecciona un archivo de contrato.",
    errorSelectCountry: "Por favor, selecciona el país de la vivienda.",
    errorServer: "No se puede contactar con el servidor. Verifica tu conexión o inténtalo de nuevo.",
    errorUnknown: "Error desconocido",
    
    // Cookies
    cookieTitle: "🍪 Gestión de cookies",
    cookieDesc: "Usamos cookies para mejorar tu experiencia y analizar el tráfico del sitio.",
    cookieAcceptAll: "Aceptar todo",
    cookieAcceptEssential: "Solo cookies esenciales",
    cookieDetails: "Más información",
    
    // Footer
    legalNotice: "Aviso legal",
    privacy: "Privacidad",
    terms: "Términos",
    contact: "Contacto",
    
    // Misc
    remaining: "análisis gratis restantes hoy",
    lastFreeAnalysis: "¡Último análisis gratis!",
  },
  
  de: {
    // Header
    siteTitle: "CheckTonBail",
    tagline: "Analysieren Sie Ihren Mietvertrag in 30 Sekunden",
    
    // Hero
    heroTitle: "Analysieren Sie Ihren Mietvertrag kostenlos",
    heroSubtitle: "Laden Sie Ihren Mietvertrag hoch und entdecken Sie sofort problematische Klauseln",
    
    // Country selector
    selectCountry: "Wo befindet sich die Immobilie?",
    countryHelp: "Wählen Sie das Land für eine angepasste rechtliche Analyse",
    
    // Upload
    dropzoneText: "Ziehen Sie Ihren Mietvertrag hierher",
    dropzoneTextDragging: "Datei hier ablegen",
    dropzoneClickText: "oder klicken Sie, um eine Datei auszuwählen",
    dropzoneFormat: "Nur PDF • max. 10 MB",
    dropzoneChangeFile: "Klicken Sie, um die Datei zu ändern",
    
    // Buttons
    analyzeButton: "🔍 Mietvertrag kostenlos analysieren",
    analyzingButton: "⏳ Analyse läuft...",
    preparingButton: "⏳ Vorbereitung...",
    payButton: "💳 Vollständige Analyse - 1,99€",
    downloadReport: "📥 PDF-Bericht herunterladen",
    newAnalysis: "🔄 Neue Analyse",
    
    // Progress
    preparingService: "⏳ Analysedienst wird vorbereitet... (einige Sekunden)",
    analyzingProgress: "Schnellanalyse läuft...",
    paymentValidated: "Zahlung bestätigt! Vollständige Analyse läuft...",
    
    // Teaser
    teaserTitle: "Kostenlose Vorschau Ihres Mietvertrags",
    teaserUnlock: "🔓 Vollständige Analyse freischalten",
    teaserUnlockDesc: "Erhalten Sie alle detaillierten problematischen Klauseln, rechtliche Referenzen und unsere personalisierten Empfehlungen.",
    
    // Results
    resultsTitle: "Vollständige Analyse Ihres Mietvertrags",
    abusiveClauses: "Missbräuchliche Klauseln erkannt",
    unbalancedClauses: "Unausgewogene Klauseln",
    watchPoints: "Zu beachtende Punkte",
    favorableElements: "Für den Mieter günstige Elemente",
    recommendations: "Allgemeine Empfehlungen",
    depositImpact: "Auswirkung auf die Kaution",
    simpleSummary: "Einfache Zusammenfassung",
    
    // Labels
    problem: "Problem",
    legalBasis: "Rechtsgrundlage",
    recommendation: "Empfehlung",
    explanation: "Erklärung",
    whyFavorable: "Warum es günstig ist",
    riskLevel: "Risikoniveau",
    concreteActions: "Konkrete Maßnahmen zum Schutz Ihrer Kaution",
    
    // Risk levels
    riskHigh: "Hoch",
    riskMedium: "Mittel",
    riskLow: "Niedrig",
    
    // How it works
    howItWorksTitle: "💡 Wie funktioniert es?",
    howItWorksStep1: "1. Wählen Sie das Land der Immobilie",
    howItWorksStep2: "2. Laden Sie Ihren Mietvertrag im PDF-Format hoch",
    howItWorksStep3: "3. Erhalten Sie eine kostenlose Vorschau der wichtigsten Punkte",
    howItWorksStep4: "4. Schalten Sie die vollständige Analyse für 1,99€ frei",
    
    // Rate limit
    rateLimitTitle: "🔓 Zur vollständigen Analyse wechseln",
    rateLimitDesc: "Sie haben Ihre 3 kostenlosen Analysen heute aufgebraucht. Erhalten Sie die detaillierte Analyse Ihres Mietvertrags mit allen problematischen Klauseln.",
    
    // Payment
    securePayment: "Sichere Zahlung über Stripe",
    paymentModalTitle: "Zahlung abschließen",
    paymentModalDesc: "Vollständige Analyse Ihres Mietvertrags für",
    
    // Errors
    errorFileType: "Nur PDF-Dateien werden akzeptiert.",
    errorFileSize: "Die Datei darf 10 MB nicht überschreiten.",
    errorNoFile: "Bitte wählen Sie eine Mietvertragsdatei aus.",
    errorSelectCountry: "Bitte wählen Sie das Land der Immobilie.",
    errorServer: "Server nicht erreichbar. Überprüfen Sie Ihre Verbindung oder versuchen Sie es erneut.",
    errorUnknown: "Unbekannter Fehler",
    
    // Cookies
    cookieTitle: "🍪 Cookie-Verwaltung",
    cookieDesc: "Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und den Website-Verkehr zu analysieren.",
    cookieAcceptAll: "Alle akzeptieren",
    cookieAcceptEssential: "Nur essentielle Cookies",
    cookieDetails: "Mehr erfahren",
    
    // Footer
    legalNotice: "Impressum",
    privacy: "Datenschutz",
    terms: "AGB",
    contact: "Kontakt",
    
    // Misc
    remaining: "kostenlose Analysen heute verbleibend",
    lastFreeAnalysis: "Letzte kostenlose Analyse!",
  },
  
  pt: {
    // Header
    siteTitle: "CheckTonBail",
    tagline: "Analise o seu contrato de arrendamento em 30 segundos",
    
    // Hero
    heroTitle: "Analise o seu contrato gratuitamente",
    heroSubtitle: "Carregue o seu contrato e descubra instantaneamente as cláusulas problemáticas",
    
    // Country selector
    selectCountry: "Onde está localizado o imóvel?",
    countryHelp: "Selecione o país para uma análise legal adaptada",
    
    // Upload
    dropzoneText: "Arraste e solte o seu contrato aqui",
    dropzoneTextDragging: "Solte o seu ficheiro aqui",
    dropzoneClickText: "ou clique para selecionar um ficheiro",
    dropzoneFormat: "Apenas PDF • 10 MB máx",
    dropzoneChangeFile: "Clique para alterar o ficheiro",
    
    // Buttons
    analyzeButton: "🔍 Analisar o meu contrato grátis",
    analyzingButton: "⏳ A analisar...",
    preparingButton: "⏳ A preparar...",
    payButton: "💳 Análise completa - 1,99€",
    downloadReport: "📥 Transferir relatório PDF",
    newAnalysis: "🔄 Nova análise",
    
    // Progress
    preparingService: "⏳ A preparar serviço de análise... (alguns segundos)",
    analyzingProgress: "Análise rápida em curso...",
    paymentValidated: "Pagamento validado! Análise completa em curso...",
    
    // Teaser
    teaserTitle: "Pré-visualização gratuita do seu contrato",
    teaserUnlock: "🔓 Desbloquear análise completa",
    teaserUnlockDesc: "Obtenha todas as cláusulas problemáticas detalhadas, referências legais e as nossas recomendações personalizadas.",
    
    // Results
    resultsTitle: "Análise completa do seu contrato",
    abusiveClauses: "Cláusulas abusivas detetadas",
    unbalancedClauses: "Cláusulas desequilibradas",
    watchPoints: "Pontos a vigiar",
    favorableElements: "Elementos favoráveis ao inquilino",
    recommendations: "Recomendações gerais",
    depositImpact: "Impacto na caução",
    simpleSummary: "Resumo simples",
    
    // Labels
    problem: "Problema",
    legalBasis: "Base legal",
    recommendation: "Recomendação",
    explanation: "Explicação",
    whyFavorable: "Porque é favorável",
    riskLevel: "Nível de risco",
    concreteActions: "Ações concretas para proteger a sua caução",
    
    // Risk levels
    riskHigh: "Alto",
    riskMedium: "Médio",
    riskLow: "Baixo",
    
    // How it works
    howItWorksTitle: "💡 Como funciona?",
    howItWorksStep1: "1. Selecione o país do imóvel",
    howItWorksStep2: "2. Carregue o seu contrato em formato PDF",
    howItWorksStep3: "3. Receba uma pré-visualização gratuita dos pontos-chave",
    howItWorksStep4: "4. Desbloqueie a análise completa por 1,99€",
    
    // Rate limit
    rateLimitTitle: "🔓 Passe para a análise completa",
    rateLimitDesc: "Usou as suas 3 análises gratuitas de hoje. Obtenha a análise detalhada do seu contrato com todas as cláusulas problemáticas.",
    
    // Payment
    securePayment: "Pagamento seguro via Stripe",
    paymentModalTitle: "Finalizar pagamento",
    paymentModalDesc: "Análise completa do seu contrato por",
    
    // Errors
    errorFileType: "Apenas ficheiros PDF são aceites.",
    errorFileSize: "O ficheiro não deve exceder 10 MB.",
    errorNoFile: "Por favor, selecione um ficheiro de contrato.",
    errorSelectCountry: "Por favor, selecione o país do imóvel.",
    errorServer: "Não foi possível contactar o servidor. Verifique a sua ligação ou tente novamente.",
    errorUnknown: "Erro desconhecido",
    
    // Cookies
    cookieTitle: "🍪 Gestão de cookies",
    cookieDesc: "Usamos cookies para melhorar a sua experiência e analisar o tráfego do site.",
    cookieAcceptAll: "Aceitar tudo",
    cookieAcceptEssential: "Apenas cookies essenciais",
    cookieDetails: "Saber mais",
    
    // Footer
    legalNotice: "Aviso legal",
    privacy: "Privacidade",
    terms: "Termos",
    contact: "Contacto",
    
    // Misc
    remaining: "análises gratuitas restantes hoje",
    lastFreeAnalysis: "Última análise gratuita!",
  },
};

// Helper function to get translation
export const getTranslation = (lang, key) => {
  return translations[lang]?.[key] || translations['fr'][key] || key;
};

// Hook for translations
export const useTranslations = (lang) => {
  const t = (key) => getTranslation(lang, key);
  return { t, lang };
};
