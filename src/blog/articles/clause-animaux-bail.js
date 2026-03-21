import React from "react";

export default function ArticleClauseAnimaux({ onCTAClick }) {
  return (
    <article>
      <p className="fr-text--lead" style={{ color: "#444", marginBottom: "2rem" }}>
        "Aucun animal ne sera toléré dans ce logement." Cette phrase figure dans des milliers de baux
        en France. Est-elle vraiment légale ? La réponse est non — du moins pas entièrement. Voici
        ce que dit réellement la loi sur les animaux en location.
      </p>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Le principe : vous avez le droit d'avoir un animal
      </h2>
      <p>
        La <strong>loi du 9 mars 1948</strong> (article 10), toujours en vigueur, interdit aux
        propriétaires d'inclure dans un bail toute clause interdisant la détention d'un animal
        domestique. Ce principe a été renforcé par la <strong>loi ELAN du 23 novembre 2018</strong>,
        qui l'a inscrit dans la loi du 6 juillet 1989.
      </p>
      <div style={{ background: "#e8f5e9", border: "1px solid #4caf50", borderRadius: "4px", padding: "1rem 1.5rem", margin: "1.5rem 0", fontSize: "0.95rem" }}>
        <strong style={{ color: "#2e7d32" }}>✅ En clair :</strong> Une clause de votre bail qui interdit
        "tout animal" est <strong>nulle de plein droit</strong>. Vous n'avez pas à la respecter. Le
        propriétaire ne peut pas vous donner congé pour ce motif.
      </div>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        L'exception : les animaux dangereux
      </h2>
      <p>
        La loi prévoit une exception importante. Le propriétaire peut légalement interdire la
        détention d'<strong>animaux classés "dangereux"</strong> par la législation française :
      </p>
      <ul className="fr-list" style={{ paddingLeft: "1.5rem", lineHeight: "2.2" }}>
        <li>
          <strong>Chiens de catégorie 1</strong> (dits "d'attaque") : Staffordshire terrier, American
          Staffordshire terrier, Mastiff, Tosa. Ces chiens sont d'ailleurs soumis à des règles très
          strictes (détention interdite dans les lieux publics, etc.)
        </li>
        <li>
          <strong>Chiens de catégorie 2</strong> (dits "de garde et de défense") : Rottweiler,
          American Staffordshire terrier inscrit au LOF, Tosa inscrit au LOF
        </li>
      </ul>
      <div style={{ background: "#fff4e5", border: "1px solid #ff9800", borderRadius: "4px", padding: "1rem 1.5rem", margin: "1.5rem 0", fontSize: "0.95rem" }}>
        <strong style={{ color: "#e65100" }}>⚠️ Attention :</strong> Un bailleur ne peut pas interdire
        tous les chiens sous prétexte que certaines races sont classifiées. Il ne peut interdire que
        les races spécifiquement listées comme dangereuses. Interdire "tout chien" reste illégal.
      </div>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Cas par cas : chats, chiens, NAC, rongeurs…
      </h2>
      <div style={{ display: "grid", gap: "1rem", marginTop: "1.25rem" }}>
        {[
          {
            animal: "🐱 Chat",
            statut: "Autorisé",
            couleur: "#e8f5e9",
            detail: "La clause interdisant les chats est nulle. Vous pouvez en avoir un sans autorisation du propriétaire.",
          },
          {
            animal: "🐶 Chien (hors catégorie 1 et 2)",
            statut: "Autorisé",
            couleur: "#e8f5e9",
            detail: "La clause interdisant les chiens ordinaires est nulle. Vous êtes libre d'en avoir un.",
          },
          {
            animal: "🐕 Chien catégorie 1",
            statut: "Interdit possible",
            couleur: "#fff4e5",
            detail: "Le propriétaire peut légalement refuser les chiens d'attaque de catégorie 1.",
          },
          {
            animal: "🐰 Rongeurs, lapins, oiseaux",
            statut: "Autorisé (en cage)",
            couleur: "#e8f5e9",
            detail: "Les animaux tenus en cage ou en aquarium ne peuvent pas être interdits.",
          },
          {
            animal: "🐍 Reptiles, animaux exotiques",
            statut: "Zone grise",
            couleur: "#f3f3f3",
            detail: "La loi vise les \"animaux domestiques\". Un serpent ou un crocodile peut faire l'objet d'un refus légitime.",
          },
        ].map(({ animal, statut, couleur, detail }, i) => (
          <div key={i} style={{ background: couleur, border: "1px solid #e0e0e0", borderRadius: "6px", padding: "1rem 1.25rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>{animal.split(" ")[0]}</div>
            <div>
              <strong>{animal.substring(2)}</strong>{" "}
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: statut === "Autorisé" ? "#2e7d32" : statut === "Interdit possible" ? "#e65100" : "#555" }}>
                — {statut}
              </span>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "#444" }}>{detail}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Ce que vous devez tout de même respecter
      </h2>
      <p>
        Avoir le droit de détenir un animal ne vous exonère pas de toutes vos responsabilités. En
        tant que locataire, vous restez tenu de :
      </p>
      <ul className="fr-list" style={{ paddingLeft: "1.5rem", lineHeight: "2.2" }}>
        <li>
          <strong>Réparer les dégradations causées par votre animal</strong> : griffures de parquet,
          trous dans les cloisons, moquette abîmée. Ces frais peuvent être déduits de votre dépôt
          de garantie.
        </li>
        <li>
          <strong>Ne pas causer de troubles de voisinage</strong> : aboiements excessifs, odeurs
          persistantes, saleté dans les parties communes. Ces nuisances peuvent constituer un motif
          légitime de résiliation du bail.
        </li>
        <li>
          <strong>Prévenir votre assurance habitation</strong> : certains contrats excluent les
          dommages causés par des animaux ou imposent des franchises spécifiques.
        </li>
      </ul>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        La caution supplémentaire pour animaux : autorisée ?
      </h2>
      <p>
        Non. Le propriétaire ne peut pas exiger un <strong>dépôt de garantie supplémentaire</strong>
        spécifiquement lié à la présence d'un animal. Le dépôt de garantie légal (1 mois de loyer HC
        pour un logement vide, 2 mois pour un meublé) est le maximum autorisé, point final.
      </p>
      <p>
        En revanche, si votre bail ne comprend pas de garant, certains propriétaires essaient de
        négocier une "assurance risque locatif renforcée" — ce n'est pas non plus une obligation légale.
      </p>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Que faire si votre propriétaire refuse votre animal ?
      </h2>
      <ol style={{ paddingLeft: "1.5rem", lineHeight: "2.2" }}>
        <li>
          <strong>Citez la loi</strong> par écrit (e-mail ou courrier) : loi du 9 mars 1948, article
          10, confirmé par la loi ELAN 2018. Précisez que la clause est réputée non écrite.
        </li>
        <li>
          <strong>Ne donnez pas suite</strong> à une éventuelle menace de congé : un congé donné pour
          le seul motif de la présence d'un animal domestique légal est nul.
        </li>
        <li>
          <strong>Contactez l'ADIL</strong> de votre département pour un accompagnement juridique
          gratuit.
        </li>
        <li>
          <strong>Saisissez la CDC</strong> si la situation dégénère en litige.
        </li>
      </ol>

      <div style={{ background: "#f0f0fb", borderLeft: "4px solid #000091", padding: "1rem 1.5rem", margin: "2rem 0", borderRadius: "0 4px 4px 0" }}>
        <strong>Bon à savoir :</strong> Si votre bail contient une clause interdisant les animaux et
        que vous l'avez signée, cela ne change rien. Vous n'avez pas renoncé à votre droit légal. La
        clause est nulle, signature ou pas.
      </div>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg, #000091 0%, #1212ff 100%)", color: "white", padding: "2.5rem", borderRadius: "8px", marginTop: "3rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          Votre bail contient une clause interdisant les animaux ?
        </p>
        <p style={{ opacity: 0.9, marginBottom: "1.5rem", fontSize: "1rem" }}>
          Analysez votre bail complet pour identifier toutes les clauses nulles ou abusives
          et savoir exactement quels sont vos droits.
        </p>
        <button
          onClick={onCTAClick}
          style={{ background: "white", color: "#000091", border: "none", padding: "0.875rem 2rem", fontSize: "1.05rem", fontWeight: 700, borderRadius: "4px", cursor: "pointer" }}
        >
          Analyser mon bail maintenant →
        </button>
        <p style={{ fontSize: "0.8rem", opacity: 0.75, marginTop: "0.75rem", marginBottom: 0 }}>
          9,90 € · Rapport complet · Satisfait ou remboursé
        </p>
      </div>
    </article>
  );
}
