# Clôture du pilote historique CORUM — 18 octobre 2026

## Résultat opérationnel en Supabase

**30 exercices annuels sur 30, 90 contrôles financiers sur 90**, couvrant trois séries par exercice : distribution brute annuelle par part, valeur de réalisation par part, valeur de reconstitution par part.

| SCPI | Lancement | Premier exercice clos | Exercices certifiés | Statut noyau |
| --- | ---: | ---: | ---: | --- |
| CORUM Origin | 2012 | 2012 | 2012–2025, **14/14** | CORE_HISTORY_VERIFIED |
| CORUM XL | 2017 | 2017 | 2017–2025, **9/9** | CORE_HISTORY_VERIFIED |
| CORUM Eurion | 2020 | 2020 | 2020–2025, **6/6** | CORE_HISTORY_VERIFIED |
| CORUM USA | 2024 | **2025** | 2025, **1/1** | CORE_HISTORY_VERIFIED |

**CORUM USA :** premier exercice social de quinze mois clos au 31/12/2025, établi dans le rapport annuel 2025. La création en 2024 ne produit pas un exercice annuel 2024 imaginaire. `scpi_history_scope.start_year=2024`, `first_fiscal_year=2025`, queue 2024 `not_applicable`. La migration `supabase/migrations/20261018_first_fiscal_year_is_not_creation_year.sql` est appliquée ; les vues annuelles lisent désormais le début des exercices, pas la date commerciale.

**CORUM Origin 2019 :** le texte éditorial du rapport 2019 affiche 67,53 € alors que ses comptes annuels et les trois rapports suivants reprennent **67,88 €** comme dividende brut versé. L'arbitrage conserve les deux nombres, cite les quatre documents et définit explicitement que la série financière réglementaire prévaut ; aucun remplacement silencieux. Valeurs de réalisation **935,49 €** et de reconstitution **1 133,51 €** au 31/12/2019. Script `scripts/scpi-history/reconcile-origin-2019-financial-tables.sql`.

**Exercices de lancement :** Origin 2012 et XL 2017 sont des années partielles réelles (dividendes effectivement distribués, non annualisés en euros). Eurion 2020 contient une *référence de rendement annualisée* explicitement indiquée. Aucune de ces trois méthodes n'est normalisée artificiellement.

## Scripts de reconstruction et contrôles

- `scripts/scpi-history/backfill-origin-2012-2018-xl-2022.sql` — 8 exercices, valeur/page/exercice (transactionnel, conflit bloquant).
- `scripts/scpi-history/reconcile-origin-2019-financial-tables.sql` — 1 exercice, arbitrage financier et recoupements officiels.
- Les historiques plus récents sont déjà couverts par les scripts des PR #200 et #201.
- `scripts/scpi-history/verify_corum_core_20261018.sql` — **exécuté avec succès** : 4 fonds prêts, 30/30 exercices annuels, 90 métriques, 0 exercice encore `to_discover`, 0 faux exercice USA 2024, arbitrage Origin 2019 présent. À exécuter après les prochains traitements.

## Leçon industrielle pour 211–225 SCPI

1. Séparer `launch_year` et `first_fiscal_year` (durées exceptionnelles à la création).
2. Vérifier par tableau financier **et par colonne d'année**, sans mélanger dividende brut et dividende comptable, réalisations annuelles et dernières valeurs trimestrielles.
3. Utiliser les tableaux historiques multi-années des rapports officiels avant toute recherche de 1 PDF/année.
4. Conserver tout conflit de définition avec ses valeurs concurrentes et le critère d'arbitrage, même lorsqu'une série stable et recoupée est retenue.
5. Un contrôle strict se fonde sur le nombre de mesures dotées de `value`, `page`, `fiscal_year_column` et URL source (non sur le nombre de PDF ou d'appels API).
6. Une migration de début d'exercice concerne tous les fonds : les futurs cas de premier exercice exceptionnel exigent une date et une preuve spécifiques.
7. Le build Netlify `scripts/exportScpiAnnualHistory.ts` lit uniquement les vues annuelles validées, pagine les résultats au-delà des 1 000 lignes par défaut, publie un snapshot **sans clé de service** et fait échouer les ambiguïtés non arbitrées.
8. Le graphique Valorisation utilise uniquement les clôtures annuelles ; **un seul point** est montré comme tel et ne crée pas une courbe artificielle à partir des trimestres.
9. La certification du **noyau annuel** n'est **jamais** un `PASS_100` de la SCPI entière : TOF, dette, liquidité, frais, WALT/WALB et cohérence entre tous les modules nécessitent encore leurs propres contrôles.

## État de publication

Migration et 30 exercices sont **effectifs en base Supabase**. Le snapshot GitHub et le front corrigés sont sur la branche de la PR de clôture ; ils ne seront en production qu'après compilation préproduction, fusion, puis déploiement Netlify explicite. La limitation d'un déploiement de production par jour reste applicable.
