# Publication du noyau historique CORUM — 19/10/2026

## Lot validé
- PR #200 (trajectoires annuelles) et #201 (archives complémentaires) et #202 (historique complet) fusionnées dans `main`.
- Source : 30 exercices annuels officiellement documentés de CORUM Origin, XL, Eurion, USA ; 90 métriques fondamentales (distribution brute, réalisation et reconstitution).
- CORUM USA : création 2024, premier exercice social clos 2025. Aucun exercice 2024 artificiel.
- CORUM Origin 2019 : arbitrage documentaire 67,88 €/part contre mention éditoriale 67,53 €/part, divergences affichées et conservées.
- Valeurs trimestrielles 2026 distinctes des observations historiques au 31 décembre.

## Prépublication
- Netlify deploy preview #202 : `6ad47d6bfefd44bf689d02b0`, `ready` sur le code `e17ad726c03782345dd97eba6a8d3610e5cc8428`.
- Code fusionné : `43fa0b789165c54b8061add9f3fbf8a746a89e88`.
- Garde-fou : un seul déploiement de production Netlify explicitement déclenché par ce commit.
- Pas de statut `PASS_100` global attribué par la seule réussite de l'historique annuel.

## Contrôle de sortie
Ne confirmer « en ligne » qu'après état Netlify `ready` du nouveau commit `main` et comparaison de son SHA au build de production. Vérifier les graphes de valorisation annuelle et les dates ; un build réussi ne remplace pas un contrôle visuel navigateur.
