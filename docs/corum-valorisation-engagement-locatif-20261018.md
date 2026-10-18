# CORUM — réconciliation documentaire valeur de réalisation / durée d'engagement (18/10/2026)

## Données à afficher sur les fiches

| SCPI | Réalisation (€/part) au 31/12/2025 | Durée d'engagement au 30/06/2026 (années) | Reconstitution au 30/06/2026 (€/part) |
| --- | ---: | ---: | ---: |
| CORUM Eurion | 177,10 | 6,36 | 224,07 |
| CORUM Origin | 959,47 | 6,05 | 1 186,30 |
| CORUM USA | 177,04 | 8,88 | 216,34 |
| CORUM XL | 153,86 | 7,45 | 194,27 |

- Valeur de réalisation : rapport annuel 2025, confirmée dans le bulletin T2 2026, référence effective **31 décembre 2025**. Source : liens `maximus_valeur_realisation_source_url` du catalogue.
- Durée d'engagement locatif : bulletin T2 2026, p. 4, référence effective **30 juin 2026**. Source : liens `maximus_walb_source_url` du catalogue.
- CORUM ne décrit pas dans ces pages la formule de pondération de la durée. La durée d'engagement est un **proxy WALB**. WALT reste indisponible / non publiée.
- Valeur de reconstitution : arrêtée au **30 juin 2026**, ne pas la rétrograder à la valeur du rapport annuel.
- Vérifications : affichage du montant et de sa période dans le composant `AnalysisDetailModal` ; aucun changement pour les 63 autres lignes du catalogue ; tests d'extraction WALT/WALB.

## Critère de publication

Ne pas annoncer « en ligne » tant que le déploiement Netlify `production` n'est pas `ready` pour le commit GitHub exact et que le site public n'affiche pas les valeurs de ces quatre fiches.
