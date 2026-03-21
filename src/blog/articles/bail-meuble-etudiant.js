import React from "react";

function InfoBox({ color, bg, border, icon, children }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: "4px", padding: "1rem 1.5rem", margin: "1.5rem 0", fontSize: "0.95rem" }}>
      <strong style={{ color }}>{icon} </strong>{children}
    </div>
  );
}

export default function ArticleBailMeubleEtudiant({ onCTAClick }) {
  return (
    <article>
      <p className="fr-text--lead" style={{ color: "#444", marginBottom: "2rem" }}>
        Chaque rentrée, des milliers d'étudiants signent un bail meublé sans savoir ce qu'il implique
        vraiment. Durée, préavis, mobilier obligatoire, dépôt de garantie… La loi est précise. Voici
        tout ce que vous devez savoir avant de signer.
      </p>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Bail meublé vs bail vide : quelles différences ?
      </h2>
      <div style={{ overflowX: "auto", marginTop: "1rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ background: "#000091", color: "white" }}>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Critère</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Bail vide</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Bail meublé</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Durée minimale", "3 ans", "1 an (9 mois étudiant)"],
              ["Préavis locataire", "3 mois (1 mois zone tendue)", "1 mois"],
              ["Préavis bailleur", "6 mois", "3 mois"],
              ["Dépôt de garantie", "1 mois", "2 mois max"],
              ["Loi applicable", "Loi du 6 juillet 1989", "Loi du 6 juillet 1989 (Titre Ier bis)"],
            ].map(([critere, vide, meuble], i) => (
              <tr key={i} style={{ borderBottom: "1px solid #e5e5e5", background: i % 2 === 0 ? "white" : "#f8f8f8" }}>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{critere}</td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>{vide}</td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: "#000091", fontWeight: 600 }}>{meuble}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Le bail meublé étudiant : une durée de 9 mois
      </h2>
      <p>
        Si vous êtes étudiant, vous pouvez signer un <strong>bail meublé d'une durée de 9 mois</strong>,
        correspondant à l'année universitaire. Ce bail a une particularité majeure :{" "}
        <strong>il ne se renouvelle pas automatiquement</strong>. À l'issue des 9 mois, il prend fin sans
        que le propriétaire ait à donner congé.
      </p>
      <InfoBox color="#000091" bg="#f0f0fb" border="#c0c0e0" icon="ℹ️">
        Si vous souhaitez rester dans le logement après les 9 mois, il faut conclure un nouveau bail.
        Le propriétaire n'est pas obligé de renouveler — mais s'il ne vous donne pas congé à la fin
        et que vous continuez à occuper les lieux, le bail se transforme en bail meublé classique d'1 an.
      </InfoBox>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Le préavis : 1 mois pour le locataire
      </h2>
      <p>
        C'est l'un des grands avantages du bail meublé : le locataire peut donner congé avec seulement{" "}
        <strong>1 mois de préavis</strong>, quelle que soit la zone géographique. Ce délai court à partir
        de la réception de votre lettre recommandée par le propriétaire.
      </p>
      <p>
        Pour le bailleur, c'est l'inverse : il doit respecter un préavis de <strong>3 mois</strong> et
        ne peut donner congé que pour trois motifs légaux :
      </p>
      <ul className="fr-list" style={{ paddingLeft: "1.5rem", lineHeight: "2" }}>
        <li><strong>Reprise personnelle :</strong> pour habiter le logement lui-même ou un proche</li>
        <li><strong>Vente du bien</strong></li>
        <li><strong>Motif légitime et sérieux :</strong> notamment le non-paiement des loyers</li>
      </ul>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        La liste obligatoire du mobilier
      </h2>
      <p>
        Pour qu'un logement soit légalement qualifié de "meublé", il doit contenir{" "}
        <strong>au minimum les éléments listés dans le décret du 31 juillet 2015</strong>. Si votre
        logement ne contient pas ces éléments, il peut être requalifié en bail vide — avec toutes les
        protections supplémentaires que cela implique.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem", margin: "1.5rem 0" }}>
        {[
          "🛏️ Literie avec couette ou couverture",
          "🪟 Volets ou rideaux dans les chambres",
          "🍳 Plaques de cuisson",
          "🥡 Four ou four micro-ondes",
          "❄️ Réfrigérateur avec compartiment congélateur",
          "🍽️ Vaisselle en quantité suffisante",
          "🧹 Ustensiles de cuisine",
          "🪑 Table et chaises",
          "📚 Étagères de rangement",
          "💡 Luminaires",
          "🧼 Matériel d'entretien ménager",
        ].map((item, i) => (
          <div key={i} style={{ background: "#f8f8f8", border: "1px solid #e5e5e5", borderRadius: "6px", padding: "0.6rem 0.9rem", fontSize: "0.875rem" }}>
            {item}
          </div>
        ))}
      </div>
      <InfoBox color="#CE0500" bg="#fff5f5" border="#ffcccc" icon="⚠️">
        Vérifiez que votre bail liste explicitement ces éléments dans un inventaire du mobilier,
        joint en annexe. Sans inventaire, vous ne pourrez pas prouver que certains équipements étaient
        présents à votre entrée dans les lieux.
      </InfoBox>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Les charges : forfait ou provisions ?
      </h2>
      <p>
        En bail meublé, les charges peuvent être fixées de deux manières :
      </p>
      <ul className="fr-list" style={{ paddingLeft: "1.5rem", lineHeight: "2.2" }}>
        <li>
          <strong>Forfait de charges :</strong> montant fixe inclus dans le loyer, non révisable en
          cours de bail. Pratique mais potentiellement à votre désavantage si le forfait est gonflé.
        </li>
        <li>
          <strong>Provisions sur charges avec régularisation annuelle :</strong> le propriétaire
          estime les charges, vous payez des provisions, et une régularisation est faite chaque année
          avec justificatifs à l'appui. Plus transparent.
        </li>
      </ul>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Les droits spécifiques des étudiants
      </h2>
      <ul className="fr-list" style={{ paddingLeft: "1.5rem", lineHeight: "2.2" }}>
        <li>
          <strong>Garant personne physique ou Visale :</strong> si vous n'avez pas de garant familial,
          le dispositif Visale (Action Logement) garantit gratuitement votre loyer auprès du bailleur.
        </li>
        <li>
          <strong>APL / ALS :</strong> la plupart des étudiants en bail meublé peuvent bénéficier des
          aides au logement de la CAF. Vérifiez votre éligibilité sur caf.fr.
        </li>
        <li>
          <strong>Résiliation anticipée sans pénalité :</strong> en cas de perte d'emploi, de premier
          emploi ou de mutation professionnelle, vous pouvez donner congé avec 1 mois de préavis même
          si ces cas ne correspondent pas à votre situation initiale.
        </li>
      </ul>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Les pièges courants à éviter
      </h2>
      <ol style={{ paddingLeft: "1.5rem", lineHeight: "2.2" }}>
        <li>
          <strong>Un bail "meublé" sans inventaire</strong> : sans liste précise du mobilier, vous
          serez responsable de tout à votre départ.
        </li>
        <li>
          <strong>Un dépôt de garantie supérieur à 2 mois</strong> : illégal, exigez le remboursement
          du trop-perçu.
        </li>
        <li>
          <strong>Une clause de préavis de 3 mois imposée au locataire</strong> : illégale en bail
          meublé, votre préavis est de 1 mois.
        </li>
        <li>
          <strong>Un logement "meublé" avec seulement un lit et un réfrigérateur</strong> : il ne
          répond pas aux critères légaux. Vous pouvez demander sa requalification en bail vide.
        </li>
      </ol>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg, #000091 0%, #1212ff 100%)", color: "white", padding: "2.5rem", borderRadius: "8px", marginTop: "3rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          Votre bail meublé est-il conforme à la loi ?
        </p>
        <p style={{ opacity: 0.9, marginBottom: "1.5rem", fontSize: "1rem" }}>
          Analysez votre contrat en PDF et obtenez en quelques secondes un rapport complet
          sur les clauses abusives et vos droits réels de locataire.
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
