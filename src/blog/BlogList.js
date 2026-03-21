import React, { useEffect } from "react";
import { ARTICLES } from "./articles/data";

const SITE_URL = "https://www.check-ton-bail.fr";

export default function BlogList({ navigate }) {
  useEffect(() => {
    document.title = "Blog CheckTonBail — Conseils bail locatif & droits du locataire";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc)
      metaDesc.setAttribute(
        "content",
        "Conseils pratiques sur le bail locatif, vos droits de locataire, les clauses abusives et les arnaques à éviter. Articles rédigés par des spécialistes du droit locatif."
      );
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", `${SITE_URL}/blog/`);

    return () => {
      document.title = "CheckTonBail - Analysez votre bail locatif et détectez les clauses abusives | IA";
      if (metaDesc)
        metaDesc.setAttribute(
          "content",
          "Analysez votre contrat de location en 30 secondes grâce à l'IA. Détectez les clauses abusives, illégales ou déséquilibrées. Protégez-vous dès maintenant."
        );
      if (canonical) canonical.setAttribute("href", `${SITE_URL}/`);
    };
  }, []);

  return (
    <div className="fr-container" style={{ maxWidth: "900px", padding: "2rem 1rem 4rem" }}>
      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" style={{ marginBottom: "1.5rem" }}>
        <ol style={{ display: "flex", gap: "0.5rem", listStyle: "none", padding: 0, margin: 0, fontSize: "0.875rem", color: "#666" }}>
          <li>
            <button onClick={() => navigate("analyse")} style={{ background: "none", border: "none", color: "#000091", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
              Accueil
            </button>
          </li>
          <li style={{ color: "#999" }}>›</li>
          <li style={{ color: "#444" }}>Blog</li>
        </ol>
      </nav>

      {/* Header */}
      <header style={{ marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#1a1a1a", margin: "0 0 0.75rem" }}>
          Conseils bail & droits du locataire
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#555", maxWidth: "600px" }}>
          Tout ce que vous devez savoir sur votre bail locatif, vos droits et les clauses abusives à repérer.
        </p>
      </header>

      {/* Article grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {ARTICLES.map((article) => (
          <ArticleCard key={article.slug} article={article} navigate={navigate} />
        ))}
      </div>

      {/* CTA banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #000091 0%, #1212ff 100%)",
          color: "white",
          padding: "2rem",
          borderRadius: "8px",
          marginTop: "3.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ fontWeight: 700, fontSize: "1.15rem", margin: "0 0 0.25rem" }}>
            Prêt à vérifier votre bail ?
          </p>
          <p style={{ opacity: 0.85, fontSize: "0.95rem", margin: 0 }}>
            Analyse complète en moins d'une minute, 9,90 €.
          </p>
        </div>
        <button
          onClick={() => navigate("analyse")}
          style={{
            background: "white",
            color: "#000091",
            border: "none",
            padding: "0.75rem 1.5rem",
            fontWeight: 700,
            fontSize: "1rem",
            borderRadius: "4px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Analyser mon bail →
        </button>
      </div>
    </div>
  );
}

function ArticleCard({ article, navigate }) {
  const isAvailable = article.slug === "clause-bail-illegale";

  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        padding: "1.5rem",
        cursor: isAvailable ? "pointer" : "default",
        transition: "box-shadow 0.15s ease, transform 0.15s ease",
        background: "white",
        opacity: isAvailable ? 1 : 0.7,
      }}
      onClick={() => isAvailable && navigate("blog-article", article.slug)}
      onMouseEnter={(e) => {
        if (!isAvailable) return;
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,145,0.12)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      <span
        style={{
          display: "inline-block",
          background: "#e8e8f8",
          color: "#000091",
          fontSize: "0.75rem",
          fontWeight: 600,
          padding: "0.2rem 0.6rem",
          borderRadius: "100px",
          marginBottom: "0.75rem",
        }}
      >
        {article.category}
      </span>
      {!isAvailable && (
        <span
          style={{
            display: "inline-block",
            background: "#f0f0f0",
            color: "#888",
            fontSize: "0.7rem",
            fontWeight: 600,
            padding: "0.2rem 0.6rem",
            borderRadius: "100px",
            marginBottom: "0.75rem",
            marginLeft: "0.5rem",
          }}
        >
          Bientôt
        </span>
      )}
      <h2
        style={{
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "#1a1a1a",
          margin: "0 0 0.75rem",
          lineHeight: 1.4,
        }}
      >
        {article.title}
      </h2>
      <p style={{ fontSize: "0.875rem", color: "#666", margin: "0 0 1rem", lineHeight: 1.6 }}>
        {article.excerpt}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#999" }}>
        <span>⏱ {article.readTime}</span>
        {isAvailable && (
          <span style={{ color: "#000091", fontWeight: 600 }}>Lire →</span>
        )}
      </div>
    </div>
  );
}
