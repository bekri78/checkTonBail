import React from "react";

export default function ArticleDepotDeGarantie({ onCTAClick }) {
  return (
    <article>
      <p className="fr-text--lead" style={{ color: "#444", marginBottom: "2rem" }}>
        Le dépôt de garantie — souvent appelé "caution" — est l'une des sources de litige les plus fréquentes
        entre locataires et propriétaires. Montant trop élevé, retenue injustifiée, délai de restitution
        dépassé… Voici exactement ce que la loi autorise, et ce qu'elle interdit.
      </p>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Quel montant le propriétaire peut-il exiger ?
      </h2>
      <p>
        La loi fixe un plafond strict selon le type de logement :
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: "1.5rem 0" }}>
        <div style={{ background: "#f0f0fb", border: "1px solid #000091", borderRadius: "8px", padding: "1.25rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#000091" }}>1 mois</div>
          <div style={{ fontWeight: 600, marginTop: "0.5rem" }}>Logement vide</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem" }}>de loyer hors charges</div>
        </div>
        <div style={{ background: "#f0f0fb", border: "1px solid #000091", borderRadius: "8px", padding: "1.25rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#000091" }}>2 mois</div>
          <div style={{ fontWeight: 600, marginTop: "0.5rem" }}>Logement meublé</div>
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem" }}>de loyer hors charges</div>
        </div>
      </div>
      <p>
        Toute clause exigeant un dépôt supérieur à ces plafonds est nulle. Si votre propriétaire a encaissé
        une somme supérieure, vous pouvez en exiger le remboursement immédiat.
      </p>
      <div style={{ background: "#f0f0fb", borderLeft: "4px solid #000091", padding: "1rem 1.5rem", margin: "1.5rem 0", borderRadius: "0 4px 4px 0" }}>
        <strong>Exception :</strong> Le dépôt de garantie ne peut pas être demandé si le loyer est versé
        d'avance pour une période supérieure à 2 mois (bail à terme). Cette règle est souvent méconnue.
      </div>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Dans quel délai doit-il être restitué ?
      </h2>
      <p>
        Le délai de restitution dépend de l'état des lieux de sortie :
      </p>
      <ul className="fr-list" style={{ paddingLeft: "1.5rem", lineHeight: "2.2" }}>
        <li>
          <strong>1 mois</strong> si l'état des lieux de sortie est conforme à l'état des lieux d'entrée
        </li>
        <li>
          <strong>2 mois</strong> si l'état des lieux de sortie révèle des dégradations imputables au
          locataire
        </li>
      </ul>
      <p>
        Le délai commence à courir à partir de la <strong>restitution des clés</strong> au propriétaire,
        en main propre ou par lettre recommandée.
      </p>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Que peut-il déduire du dépôt de garantie ?
      </h2>
      <p>
        Le propriétaire peut retenir une partie du dépôt uniquement pour couvrir :
      </p>
      <ul className="fr-list" style={{ paddingLeft: "1.5rem", lineHeight: "2.2" }}>
        <li>
          Les <strong>loyers impayés</strong> et charges locatives dues
        </li>
        <li>
          Les <strong>réparations locatives</strong> à la charge du locataire (liste fixée par le décret
          n°87-712 du 26 août 1987) : remplacement de joints, menues réparations, papier peint dégradé
          au-delà de l'usure normale…
        </li>
        <li>
          Le <strong>solde de charges</strong> non encore régularisé, à condition de justifier d'une
          régularisation en cours (copropriété)
        </li>
      </ul>

      <div style={{ background: "#fff4e5", border: "1px solid #ff9800", padding: "1rem 1.5rem", margin: "2rem 0", borderRadius: "4px" }}>
        <strong>⚠️ Important :</strong> Toute retenue doit être justifiée par des documents : devis,
        factures, photos. Un propriétaire ne peut pas retenir forfaitairement sans preuve.
      </div>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Ce que le propriétaire ne peut PAS déduire
      </h2>
      <p>
        C'est là que la plupart des abus se produisent. Le propriétaire ne peut pas retenir :
      </p>
      <ul className="fr-list" style={{ paddingLeft: "1.5rem", lineHeight: "2.2" }}>
        <li>
          L'<strong>usure normale</strong> du logement liée au temps et à l'occupation (peintures
          jaunies, parquet légèrement rayé, joints de robinetterie usés…)
        </li>
        <li>
          Les travaux de <strong>remise aux normes</strong> ou de confort (changement d'une vieille
          chaudière, réfection d'une salle de bain vétuste)
        </li>
        <li>
          Les <strong>dégradations préexistantes</strong> à votre entrée dans les lieux (notées sur
          l'état des lieux d'entrée)
        </li>
        <li>
          Les travaux liés à la <strong>vétusté</strong> : la loi prévoit une grille de vétusté
          (décret du 30 mars 2016) qui réduit progressivement la part imputable au locataire selon l'âge
          des équipements
        </li>
      </ul>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Que faire si le propriétaire ne restitue pas dans les délais ?
      </h2>
      <p>
        Si le délai légal est dépassé, vous avez droit à une <strong>pénalité de 10 % du loyer mensuel
        hors charges par mois de retard commencé</strong> (article 22 de la loi du 6 juillet 1989).
      </p>

      <h3 className="fr-h4" style={{ color: "#1a1a1a", marginTop: "2rem" }}>
        Les étapes à suivre
      </h3>
      <ol style={{ paddingLeft: "1.5rem", lineHeight: "2.2" }}>
        <li>
          <strong>Mise en demeure par LRAR</strong> : envoyez un courrier recommandé rappelant le dépassement
          du délai et réclamant la restitution sous 8 jours.
        </li>
        <li>
          <strong>Commission Départementale de Conciliation (CDC)</strong> : gratuite, obligatoire avant
          toute action judiciaire pour les litiges liés à la restitution du dépôt.
        </li>
        <li>
          <strong>Tribunal judiciaire</strong> : en dernier recours, le juge peut condamner le bailleur
          à restituer le dépôt majoré des pénalités, voire des dommages et intérêts.
        </li>
      </ol>

      <div style={{ background: "#e8f5e9", border: "1px solid #4caf50", padding: "1rem 1.5rem", margin: "2rem 0", borderRadius: "4px" }}>
        <strong>✅ Conseil pratique :</strong> Conservez toujours une copie de votre état des lieux
        d'entrée et de sortie, ainsi que les photos horodatées prises le jour du déménagement. Ce sont
        vos meilleures preuves en cas de litige.
      </div>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Le cas particulier de la vente du bien en cours de bail
      </h2>
      <p>
        Si votre propriétaire vend le logement pendant votre location, c'est le <strong>nouveau
        propriétaire</strong> qui hérite de l'obligation de vous restituer le dépôt de garantie. L'ancien
        propriétaire doit lui transférer la somme lors de la vente. Votre dépôt ne peut en aucun cas
        être "perdu" lors d'une transaction immobilière.
      </p>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg, #000091 0%, #1212ff 100%)", color: "white", padding: "2.5rem", borderRadius: "8px", marginTop: "3rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          Votre bail contient-il des clauses abusives sur la caution ?
        </p>
        <p style={{ opacity: 0.9, marginBottom: "1.5rem", fontSize: "1rem" }}>
          Analysez votre bail en PDF et obtenez un rapport complet sur toutes les clauses
          problématiques, y compris celles relatives au dépôt de garantie.
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
