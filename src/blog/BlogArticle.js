import React, { useEffect } from "react";
import { ARTICLES } from "./articles/data";
import ArticleClauseBailIllegale from "./articles/clause-bail-illegale";
import ArticleDepotDeGarantie from "./articles/depot-de-garantie-bail";
import Article10ClausesInterdites from "./articles/10-clauses-interdites-bail";
import ArticleBailMeubleEtudiant from "./articles/bail-meuble-etudiant";
import ArticleClauseAnimaux from "./articles/clause-animaux-bail";

const ARTICLE_COMPONENTS = {
  "clause-bail-illegale": ArticleClauseBailIllegale,
  "depot-de-garantie-bail": ArticleDepotDeGarantie,
  "10-clauses-interdites-bail": Article10ClausesInterdites,
  "bail-meuble-etudiant": ArticleBailMeubleEtudiant,
  "clause-animaux-bail": ArticleClauseAnimaux,
};

const SITE_URL = "https://www.check-ton-bail.fr";
const DEFAULT_TITLE = "CheckTonBail - Analysez votre bail locatif et détectez les clauses abusives | IA";
const DEFAULT_DESC =
  "Analysez votre contrat de location en 30 secondes grâce à l'IA. Détectez les clauses abusives, illégales ou déséquilibrées. Protégez-vous dès maintenant.";

export default function BlogArticle({ slug, navigate }) {
  const article = ARTICLES.find((a) => a.slug === slug);
  const ArticleContent = ARTICLE_COMPONENTS[slug];

  useEffect(() => {
    if (!article) return;

    // Title
    document.title = `${article.title} | CheckTonBail`;

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", article.metaDescription);

    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", `${SITE_URL}/blog/${slug}/`);

    // OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", `${article.title} | CheckTonBail`);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", article.metaDescription);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", `${SITE_URL}/blog/${slug}/`);

    // JSON-LD Article schema
    const existing = document.getElementById("blog-article-jsonld");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "blog-article-jsonld";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.metaDescription,
      datePublished: article.date,
      dateModified: article.date,
      author: {
        "@type": "Organization",
        name: "CheckTonBail",
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: "CheckTonBail",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo-checktonbail.svg`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/blog/${slug}/`,
      },
      url: `${SITE_URL}/blog/${slug}/`,
    });
    document.head.appendChild(script);

    return () => {
      // Restore defaults on unmount
      document.title = DEFAULT_TITLE;
      if (metaDesc) metaDesc.setAttribute("content", DEFAULT_DESC);
      if (canonical) canonical.setAttribute("href", `${SITE_URL}/`);
      if (ogTitle) ogTitle.setAttribute("content", "CheckTonBail - Détectez les clauses abusives de votre bail");
      if (ogDesc) ogDesc.setAttribute("content", DEFAULT_DESC);
      if (ogUrl) ogUrl.setAttribute("content", `${SITE_URL}/`);
      const s = document.getElementById("blog-article-jsonld");
      if (s) s.remove();
    };
  }, [slug, article]);

  if (!article || !ArticleContent) {
    return (
      <div className="fr-container fr-py-8w" style={{ textAlign: "center" }}>
        <h1>Article introuvable</h1>
        <button className="fr-btn fr-btn--secondary" onClick={() => navigate("blog-list")}>
          ← Retour au blog
        </button>
      </div>
    );
  }

  return (
    <div className="fr-container" style={{ maxWidth: "800px", padding: "2rem 1rem 4rem" }}>

      {/* Article header */}
      <header style={{ marginBottom: "2.5rem" }}>
        <span
          style={{
            display: "inline-block",
            background: "#e8e8f8",
            color: "#000091",
            fontSize: "0.8rem",
            fontWeight: 600,
            padding: "0.25rem 0.75rem",
            borderRadius: "100px",
            marginBottom: "1rem",
          }}
        >
          {article.category}
        </span>
        <h1
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            fontWeight: 800,
            color: "#1a1a1a",
            lineHeight: 1.25,
            margin: "0 0 1rem",
          }}
        >
          {article.title}
        </h1>
        <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem", color: "#666", flexWrap: "wrap" }}>
          <span>
            📅{" "}
            {new Date(article.date).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span>⏱ {article.readTime} de lecture</span>
        </div>
      </header>

      {/* Article content */}
      <ArticleContent onCTAClick={() => navigate("analyse")} />

      {/* Bottom nav */}
      <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #e5e5e5" }}>
        <button
          onClick={() => navigate("blog-list")}
          className="fr-btn fr-btn--secondary"
        >
          ← Tous les articles
        </button>
      </div>
    </div>
  );
}
