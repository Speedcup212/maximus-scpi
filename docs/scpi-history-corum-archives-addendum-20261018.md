# Archives complémentaires CORUM — lot piloté sans nouveau déploiement

Date : 18 octobre 2026. Uniquement données officielles et contrôles annuels ; aucun nouveau moteur ni coût Netlify.

## Sources et années certifiées

Le rapport annuel CORUM Origin 2021 renseigne les trois séries 2020–2021 ; le rapport 2022 complète 2022. Le rapport annuel CORUM XL 2021 donne les colonnes financières 2018, 2019, 2020 et 2021 ; le rapport 2017 donne son premier exercice 2017. Les chiffres officiels sont dans `scripts/scpi-history/backfill-origin-2020-2022-xl-2017-2021.sql`, avec pages et contrôle des années.

| Fonds | Années certifiées sur la base des 3 métriques |
|---|---|
| CORUM Eurion | 2020–2025 : 6/6 |
| CORUM Origin | 2020–2025 : 6/14 |
| CORUM XL | 2017–2021, 2023–2025 : 8/9 |
| CORUM USA | 2025 : 1/2 |
| **Total** | **21/31** |

Sources publiées :
- CORUM Origin RA 2021 : https://www.corum.fr/sites/default/files/2022-03/CORUM%20Origin%20-%20Rapport%20annuel%202021.pdf
- CORUM Origin RA 2022 : https://www.corum.fr/sites/default/files/2023-04/CORUM%20Origin%20-%20Rapport%20Annuel%202022..pdf
- CORUM XL RA 2017 : https://www.corum.fr/sites/default/files/2019-04/CORUM%20XL%20-%20Rapport%20Annuel%202017.pdf
- CORUM XL RA 2021 : https://www.corum.fr/sites/default/files/2022-03/CORUM%20XL%20-%20Rapport%20annuel%202021.pdf

## Cas à risque évités

1. **CORUM XL 2017** : 9,13 € est le dividende brut publié pour le premier exercice partiel ; le taux de distribution 6,58 % est annualisé, **pas le montant de 9,13 €**. Le `distribution_basis` en garde la trace.
2. **CORUM Origin 2019** : divergences entre rapports officiels : dividende brut publié **67,88 €** (tableau du RA 2022) et **67,53 €** (tableau du RA 2023). Aucun exercice 2019 certifié ; origine/évolution des définitions à arbitrer sur les PDF et annexes avant intégration.
3. **2025/2026** : reconstitution 2025 n'est jamais remplacée par la reconstitution juin 2026. Chaque année vient du rapport officiel correspondant ou d'une colonne comparative explicitée, avec `fiscal_year_column`.

## Reproductibilité

- Les huit insertions et les statuts de file sont transactionnels, protégés contre l'écrasement, **script rejoué avec succès** sans modification de valeurs déjà vérifiées.
- Les trois preuves annuelles passent `scpi_history_year_audit_v1`; la couverture dans `scpi_history_readiness_v1` est Eurion 6/6, Origin 6/14, XL 8/9, USA 1/2.
- Le snapshot GitHub `src/data/scpiAnnualHistory.json` contient désormais les **21** exercices, et l'export Netlify `scripts/exportScpiAnnualHistory.ts` continuera de remplacer le snapshot à chaque build vérifié.
- Aucun second build Netlify déclenché : ce lot suit la PR #200 compilée en preview ; la production publique ne sert le nouveau graphique **qu'après** publication explicite d'un commit release.

## Périmètre restant

- CORUM Origin : **2012–2019** (8 exercices). Bloquer 2019 jusqu'à résolution de la divergence et rechercher les rapports antérieurs.
- CORUM XL : **2022** (1 exercice). Rechercher un rapport CORUM officiel 2022 ou 2023 contenant les trois valeurs dans la même année de clôture. Ne pas prétendre qu'une synthèse secondaire vaut source officielle.
- CORUM USA : **2024** (1 exercice de lancement), sans extrapolation de distributions non publiées.
