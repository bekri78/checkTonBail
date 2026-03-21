import React from "react";

export default function ArticleClauseBailIllegale({ onCTAClick }) {
  return (
    <article>
      <p className="fr-text--lead" style={{ color: "#444", marginBottom: "2rem" }}>
        Vous venez de signer un bail — ou vous êtes sur le point de le faire — et certaines clauses vous semblent
        étranges, voire abusives ? Vous avez raison de vous poser la question. En France, la loi encadre
        strictement ce qu'un propriétaire peut ou non imposer à son locataire. Une clause illégale dans un bail
        est <strong>nulle de plein droit</strong>, même si vous l'avez signée.
      </p>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Le cadre légal : la loi du 6 juillet 1989
      </h2>
      <p>
        La principale loi qui régit les baux d'habitation en France est la{" "}
        <strong>loi n°89-462 du 6 juillet 1989</strong>, dite "loi Mermaz". Elle s'applique à tous les
        logements loués à titre de résidence principale, qu'ils soient vides ou meublés.
      </p>
      <p>
        Cette loi fixe les droits et obligations des deux parties. Surtout, son article 4 établit une{" "}
        <strong>liste noire de clauses réputées non écrites</strong> — c'est-à-dire des clauses que le
        propriétaire ne peut pas inclure dans le bail, quelle que soit la raison.
      </p>
      <p>
        Le <strong>décret n°2015-587 du 29 mai 2015</strong> complète ce dispositif en définissant les
        clauses types qui doivent figurer dans tout contrat de bail.
      </p>

      <div
        style={{
          background: "#f0f0fb",
          borderLeft: "4px solid #000091",
          padding: "1rem 1.5rem",
          margin: "2rem 0",
          borderRadius: "0 4px 4px 0",
        }}
      >
        <strong>Bon à savoir :</strong> Une clause nulle ne rend pas l'ensemble du bail nul. Seule la clause
        en question est réputée non écrite. Le reste du contrat reste valable.
      </div>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Les 5 grandes catégories de clauses illégales
      </h2>

      <h3 className="fr-h4" style={{ color: "#1a1a1a", marginTop: "2rem" }}>
        1. Les clauses financières abusives
      </h3>
      <p>
        Toute clause qui impose au locataire des frais non prévus par la loi est illégale. Par exemple :
      </p>
      <ul className="fr-list" style={{ paddingLeft: "1.5rem", lineHeight: "2" }}>
        <li>
          Faire payer des frais de relance ou de recouvrement au locataire (c'est au propriétaire de les
          assumer)
        </li>
        <li>Exiger le paiement du loyer par prélèvement automatique uniquement (le locataire peut choisir)</li>
        <li>
          Facturer des frais de rédaction du bail au-delà du plafond légal en zone tendue (partagé
          50/50 entre bailleur et locataire)
        </li>
        <li>Imposer une pénalité financière en cas de retard de paiement non prévue par la loi</li>
      </ul>

      <h3 className="fr-h4" style={{ color: "#1a1a1a", marginTop: "2rem" }}>
        2. Les clauses d'interdiction abusives
      </h3>
      <p>
        Un propriétaire ne peut pas vous interdire certaines choses dans votre vie quotidienne :
      </p>
      <ul className="fr-list" style={{ paddingLeft: "1.5rem", lineHeight: "2" }}>
        <li>
          Interdire d'avoir un <strong>animal de compagnie</strong> (chiens et chats uniquement — loi de 1970,
          confirmée par la loi ELAN 2018)
        </li>
        <li>Interdire d'héberger des proches (famille, amis) à titre gratuit</li>
        <li>Interdire l'exercice d'une activité professionnelle libérale à domicile (sous conditions)</li>
        <li>Interdire de recevoir des visiteurs ou d'organiser des repas</li>
      </ul>

      <h3 className="fr-h4" style={{ color: "#1a1a1a", marginTop: "2rem" }}>
        3. Les clauses qui imposent des obligations de réparation illégales
      </h3>
      <p>
        La loi définit précisément la répartition des charges entre bailleur et locataire via le{" "}
        <strong>décret n°87-712 du 26 août 1987</strong>. Sont illégales les clauses qui :
      </p>
      <ul className="fr-list" style={{ paddingLeft: "1.5rem", lineHeight: "2" }}>
        <li>
          Font supporter au locataire des grosses réparations (toiture, structure, chaudière principale,
          etc.) qui incombent normalement au propriétaire
        </li>
        <li>
          Imposent une remise en état à l'identique de l'état neuf du logement (usure normale non prise en
          compte)
        </li>
        <li>
          Incluent une clause de <strong>remise en peinture systématique</strong> à la fin du bail,
          indépendamment de l'état réel
        </li>
      </ul>

      <h3 className="fr-h4" style={{ color: "#1a1a1a", marginTop: "2rem" }}>
        4. Les clauses qui restreignent vos droits légaux
      </h3>
      <p>
        Certains droits sont inaliénables pour le locataire. Toute clause qui y déroge est nulle :
      </p>
      <ul className="fr-list" style={{ paddingLeft: "1.5rem", lineHeight: "2" }}>
        <li>
          Clause qui réduit le <strong>préavis légal</strong> à la charge du bailleur (3 mois pour un
          logement vide, 1 mois pour un meublé)
        </li>
        <li>
          Clause permettant au bailleur de résilier le bail en dehors des motifs légaux (congé pour vente,
          reprise personnelle, motif légitime et sérieux)
        </li>
        <li>
          Clause qui supprime ou réduit l'obligation du bailleur de{" "}
          <strong>délivrer un logement décent</strong>
        </li>
        <li>Clause qui interdit au locataire de sous-louer alors que la loi le permet sous conditions</li>
      </ul>

      <h3 className="fr-h4" style={{ color: "#1a1a1a", marginTop: "2rem" }}>
        5. Les clauses d'entrée dans le logement sans autorisation
      </h3>
      <p>
        Le domicile est inviolable. Est illégale toute clause qui autorise le propriétaire à :
      </p>
      <ul className="fr-list" style={{ paddingLeft: "1.5rem", lineHeight: "2" }}>
        <li>Entrer dans le logement sans l'accord du locataire</li>
        <li>Effectuer des visites de contrôle ou de surveillance à tout moment</li>
        <li>
          Conserver un double des clés pour entrer librement (même "en cas d'urgence" sans définition
          précise)
        </li>
      </ul>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Comment vérifier concrètement votre bail ?
      </h2>
      <p>
        La méthode la plus efficace pour repérer une clause illégale est de la comparer à la{" "}
        <strong>liste noire de l'article 4 de la loi du 6 juillet 1989</strong>. Voici la démarche :
      </p>
      <ol style={{ paddingLeft: "1.5rem", lineHeight: "2.2" }}>
        <li>
          <strong>Lisez chaque clause attentivement</strong>, même les petits paragraphes en bas de page.
        </li>
        <li>
          <strong>Identifiez les obligations imposées</strong> : chaque fois que le bail vous oblige à faire
          quelque chose (ou vous interdit quelque chose), demandez-vous si la loi le permet.
        </li>
        <li>
          <strong>Recherchez la base légale</strong> : si la clause n'a pas de fondement dans la loi du 6
          juillet 1989 ou ses décrets d'application, elle est probablement illégale.
        </li>
        <li>
          <strong>Consultez un professionnel</strong> si vous avez un doute : ADIL (Agence Départementale
          d'Information sur le Logement), associations de locataires, ou utilisez un outil d'analyse
          automatisé.
        </li>
      </ol>

      <div
        style={{
          background: "#fff4e5",
          border: "1px solid #ff9800",
          padding: "1rem 1.5rem",
          margin: "2rem 0",
          borderRadius: "4px",
        }}
      >
        <strong>⚠️ Attention :</strong> Le fait d'avoir signé le bail ne vous engage pas à respecter une
        clause illégale. Vous pouvez à tout moment invoquer la nullité d'une clause abusive, même après
        plusieurs années de location.
      </div>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Que faire si vous trouvez une clause illégale ?
      </h2>
      <p>
        Vous avez repéré une clause qui vous semble contraire à la loi. Voici les étapes à suivre :
      </p>

      <h3 className="fr-h4" style={{ color: "#1a1a1a", marginTop: "1.5rem" }}>
        Étape 1 : Documentez
      </h3>
      <p>
        Conservez une copie de votre bail avec la clause en question. Notez la référence légale qui la
        contredit (article 4 de la loi du 6 juillet 1989, décret de 1987, etc.).
      </p>

      <h3 className="fr-h4" style={{ color: "#1a1a1a", marginTop: "1.5rem" }}>
        Étape 2 : Adressez une mise en demeure amiable
      </h3>
      <p>
        Envoyez un courrier recommandé à votre propriétaire en lui signalant la clause illégale et en
        l'informant qu'elle est réputée non écrite. Dans la plupart des cas, cela suffit à régler le
        problème.
      </p>

      <h3 className="fr-h4" style={{ color: "#1a1a1a", marginTop: "1.5rem" }}>
        Étape 3 : Saisissez la Commission Départementale de Conciliation (CDC)
      </h3>
      <p>
        Si le propriétaire conteste, la CDC est gratuite et obligatoire avant toute procédure judiciaire pour
        les litiges liés au bail. Elle peut forcer la modification du contrat.
      </p>

      <h3 className="fr-h4" style={{ color: "#1a1a1a", marginTop: "1.5rem" }}>
        Étape 4 : Tribunal judiciaire
      </h3>
      <p>
        En dernier recours, le juge des contentieux de la protection (anciennement tribunal d'instance) peut
        déclarer la clause nulle et, selon les cas, condamner le bailleur à des dommages et intérêts.
      </p>

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Les ressources gratuites pour vous aider
      </h2>
      <ul className="fr-list" style={{ paddingLeft: "1.5rem", lineHeight: "2" }}>
        <li>
          <strong>ADIL</strong> (adil.org) : conseils juridiques gratuits par département
        </li>
        <li>
          <strong>Service-Public.fr</strong> : informations officielles sur les baux
        </li>
        <li>
          <strong>Associations de locataires</strong> (UNPI, CLCV, CNL) : accompagnement et modèles de
          courriers
        </li>
      </ul>

      {/* CTA */}
      <div
        style={{
          background: "linear-gradient(135deg, #000091 0%, #1212ff 100%)",
          color: "white",
          padding: "2.5rem",
          borderRadius: "8px",
          marginTop: "3rem",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          Votre bail contient-il des clauses illégales ?
        </p>
        <p style={{ opacity: 0.9, marginBottom: "1.5rem", fontSize: "1rem" }}>
          Déposez votre bail en PDF et obtenez en moins d'une minute un rapport complet avec toutes les
          clauses problématiques, les bases légales et les recommandations personnalisées.
        </p>
        <button
          onClick={onCTAClick}
          style={{
            background: "white",
            color: "#000091",
            border: "none",
            padding: "0.875rem 2rem",
            fontSize: "1.05rem",
            fontWeight: 700,
            borderRadius: "4px",
            cursor: "pointer",
          }}
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
