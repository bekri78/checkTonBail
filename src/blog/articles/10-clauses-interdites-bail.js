import React from "react";

function ClauseCard({ numero, titre, illegal, legal, loi }) {
  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.25rem", borderLeft: "4px solid #CE0500" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
        <span style={{ background: "#CE0500", color: "white", borderRadius: "50%", width: "2rem", height: "2rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem", flexShrink: 0 }}>
          {numero}
        </span>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: "#1a1a1a", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.75rem" }}>
            {titre}
          </h3>
          <div style={{ background: "#fff5f5", border: "1px solid #ffcccc", borderRadius: "4px", padding: "0.75rem 1rem", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
            <strong style={{ color: "#CE0500" }}>❌ Clause illégale : </strong>{illegal}
          </div>
          <div style={{ background: "#f0f0fb", border: "1px solid #c0c0e0", borderRadius: "4px", padding: "0.75rem 1rem", fontSize: "0.9rem" }}>
            <strong style={{ color: "#000091" }}>✅ Ce que dit la loi : </strong>{legal}
          </div>
          {loi && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#888" }}>
              📖 Base légale : {loi}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Article10ClausesInterdites({ onCTAClick }) {
  return (
    <article>
      <p className="fr-text--lead" style={{ color: "#444", marginBottom: "2rem" }}>
        L'article 4 de la loi du 6 juillet 1989 établit une "liste noire" de clauses réputées{" "}
        <strong>non écrites</strong> — c'est-à-dire inexistantes juridiquement, même si vous les avez
        signées. Voici les 10 clauses illégales les plus fréquemment glissées dans les baux locatifs,
        et pourquoi elles ne valent rien.
      </p>

      <div style={{ background: "#f0f0fb", borderLeft: "4px solid #000091", padding: "1rem 1.5rem", margin: "1.5rem 0 2.5rem", borderRadius: "0 4px 4px 0" }}>
        <strong>Rappel :</strong> Une clause réputée non écrite ne rend pas le bail nul dans son
        ensemble. Seule la clause illégale disparaît. Vous n'avez pas à "annuler" votre bail pour vous
        en prévaloir.
      </div>

      <ClauseCard
        numero="1"
        titre="L'interdiction absolue d'héberger des tiers"
        illegal={"\"Le locataire ne peut héberger aucune personne extérieure à son foyer sans l'autorisation écrite du bailleur.\""}
        legal="Vous avez le droit d'héberger qui vous voulez à titre gratuit — famille, amis, conjoint. Le propriétaire ne peut pas s'y opposer ni exiger une autorisation."
        loi="Article 4 (j) de la loi du 6 juillet 1989"
      />

      <ClauseCard
        numero="2"
        titre="L'obligation de payer le loyer exclusivement par prélèvement automatique"
        illegal={"\"Le loyer devra être réglé exclusivement par prélèvement automatique sur le compte bancaire du locataire.\""}
        legal="Le locataire peut choisir librement son mode de paiement (virement, chèque, espèces dans la limite légale). Le propriétaire ne peut pas imposer le prélèvement."
        loi="Article 4 (h) de la loi du 6 juillet 1989"
      />

      <ClauseCard
        numero="3"
        titre="La responsabilité des dégradations causées par des tiers"
        illegal={"\"Le locataire sera tenu responsable de toutes les dégradations survenues dans le logement, quelle qu'en soit la cause, y compris en cas d'effraction ou d'incendie criminel.\""}
        legal="Le locataire n'est responsable que des dégradations qu'il cause lui-même ou celles causées par les personnes dont il répond (famille, visiteurs). Il n'est pas responsable des actes de tiers non invités."
        loi="Article 4 (d) de la loi du 6 juillet 1989, article 1732 du Code civil"
      />

      <ClauseCard
        numero="4"
        titre="L'interdiction de tous les animaux domestiques"
        illegal={"\"Il est formellement interdit au locataire de détenir tout animal dans le logement, y compris les animaux de compagnie.\""}
        legal="Une clause interdisant chiens et chats est nulle. La loi de 1970 (confirmée par la loi ELAN 2018) protège le droit d'avoir un animal de compagnie. Seuls les animaux classés dangereux (catégorie 1) peuvent être interdits."
        loi="Loi du 9 mars 1948, loi ELAN du 23 novembre 2018"
      />

      <ClauseCard
        numero="5"
        titre="La clause résolutoire automatique pour tout manquement"
        illegal={"\"Tout manquement du locataire à ses obligations entraînera la résiliation automatique et immédiate du bail.\""}
        legal="La résiliation du bail ne peut être prononcée que par un juge, après mise en demeure et respect d'un délai. Une résiliation automatique sans intervention judiciaire est illégale."
        loi="Article 4 (a) de la loi du 6 juillet 1989, article 24"
      />

      <ClauseCard
        numero="6"
        titre="L'interdiction d'activité politique, syndicale ou religieuse"
        illegal={"\"Le locataire s'interdit toute activité politique, syndicale, associative ou confessionnelle dans le logement.\""}
        legal="Le domicile est un espace de liberté. Le locataire peut exercer librement ses convictions et activités dans son logement, sous réserve de ne pas troubler le voisinage."
        loi="Article 4 (i) de la loi du 6 juillet 1989"
      />

      <ClauseCard
        numero="7"
        titre="Les frais d'état des lieux entièrement à la charge du locataire"
        illegal={"\"Les frais d'établissement de l'état des lieux seront intégralement supportés par le locataire.\""}
        legal="Les frais d'état des lieux réalisés par un huissier de justice sont partagés à 50/50 entre bailleur et locataire. Le locataire ne peut pas en supporter la totalité."
        loi="Article 5 de la loi du 6 juillet 1989, décret du 30 janvier 2017"
      />

      <ClauseCard
        numero="8"
        titre="L'obligation de souscrire à l'assurance choisie par le propriétaire"
        illegal={"\"Le locataire devra souscrire son assurance habitation auprès de la compagnie désignée par le bailleur.\""}
        legal="Le locataire est libre de choisir sa compagnie d'assurance. Le propriétaire peut exiger une attestation d'assurance, mais pas imposer un assureur spécifique."
        loi="Article 4 (g) de la loi du 6 juillet 1989"
      />

      <ClauseCard
        numero="9"
        titre="Les réparations locatives rédigées de façon excessivement large"
        illegal={"\"Le locataire prendra en charge l'ensemble des réparations et travaux nécessaires au maintien en bon état du logement, sans limitation.\""}
        legal="Les réparations à la charge du locataire sont limitativement listées par le décret de 1987 (réparations locatives). Toute clause étendant cette liste au-delà des textes est nulle."
        loi="Décret n°87-712 du 26 août 1987, article 4 (b) loi du 6 juillet 1989"
      />

      <ClauseCard
        numero="10"
        titre="La clause de remboursement de loyers en cas de départ anticipé du propriétaire"
        illegal={"\"Si le propriétaire est contraint de donner congé pour reprise personnelle ou vente, le locataire ne pourra prétendre à aucune indemnisation.\""}
        legal="Le locataire bénéficie d'un préavis légal (6 mois pour un logement vide, 3 mois pour un meublé). En cas de congé pour vente, il dispose d'un droit de préemption. Ces droits ne peuvent pas être supprimés par contrat."
        loi="Articles 15 et 15-1 de la loi du 6 juillet 1989"
      />

      <h2 className="fr-h3" style={{ color: "#000091", marginTop: "2.5rem" }}>
        Comment réagir si ces clauses figurent dans votre bail ?
      </h2>
      <p>
        Vous n'avez aucune démarche particulière à faire pour "activer" la nullité d'une clause illégale.
        Elle est nulle de plein droit depuis la signature. En pratique :
      </p>
      <ol style={{ paddingLeft: "1.5rem", lineHeight: "2.2" }}>
        <li>
          <strong>Ignorez la clause</strong> si le propriétaire tente de l'appliquer : vous n'avez aucune
          obligation de la respecter.
        </li>
        <li>
          <strong>Rappelez-lui par écrit</strong> (e-mail ou courrier) que la clause est réputée non
          écrite en citant la base légale.
        </li>
        <li>
          <strong>Saisissez la CDC</strong> (Commission Départementale de Conciliation) si le
          propriétaire insiste.
        </li>
        <li>
          <strong>Portez l'affaire en justice</strong> si nécessaire : le tribunal judiciaire peut
          constater la nullité et condamner le bailleur.
        </li>
      </ol>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg, #000091 0%, #1212ff 100%)", color: "white", padding: "2.5rem", borderRadius: "8px", marginTop: "3rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          Votre bail contient l'une de ces 10 clauses ?
        </p>
        <p style={{ opacity: 0.9, marginBottom: "1.5rem", fontSize: "1rem" }}>
          Analysez votre bail en PDF pour obtenir la liste complète des clauses problématiques
          avec les bases légales et les recommandations pour vous défendre.
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
