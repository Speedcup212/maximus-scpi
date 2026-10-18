# Pilote de reconstitution historique CORUM — 18 octobre 2026

Objectif : vérifier l'ensemble **archive officielle → année de colonne → preuves → contrôle → Supabase → export privé au build → affichage annuel**, sans confondre données annuelles et trimestrielles.

## Résultats exécutés (Supabase production)

| SCPI | Exercices avec 3 valeurs et pages officielles | Périmètre attendu | Statut |
| --- | ---: | ---: | --- |
| CORUM Eurion | 2020–2025 (6) | 6 | CORE_HISTORY_VERIFIED (noyau annuel uniquement) |
| CORUM Origin | 2023–2025 (3) | 14 | HISTORY_INCOMPLETE |
| CORUM XL | 2023–2025 (3) | 9 | HISTORY_INCOMPLETE |
| CORUM USA | 2025 (1) | 2 | HISTORY_INCOMPLETE |
| **Total** | **13** | **31** | **18 exercices à rechercher/certifier** |

Trois mesures par année, preuve et page PDF pour distribution brute par part, réalisation par part au 31 décembre, reconstitution par part au 31 décembre : **39/93** mesures de base. Il ne s'agit PAS d'une certification intégrale de tous les indicateurs.

Scripts SQL réexécutés avec succès (idempotence, conflits bloquants) :
- `scripts/scpi-history/backfill-eurion-2020-2024.sql`
- `scripts/scpi-history/backfill-origin-xl-2023-2024.sql`
- `scripts/scpi-history/reconcile_corum_2025.sql` (PR #199 déjà déployée).

Sources : rapports annuels CORUM 2021–2025 pour Eurion ; rapport annuel CORUM Origin 2024, CORUM XL 2024, rapports annuels 2025 des quatre fonds. Chaque ligne porte son URL et ses pages de référence dans `scpi_annual_fundamentals.evidence` et `scpi_annual_reports`.

**Exception méthodologique :** EURION 2020 est une année de lancement commercial. La distribution brute de référence (20,79 €/part) correspond à la présentation annualisée CORUM d'une part en jouissance sur toute l'année ; elle ne doit pas être affichée comme un revenu de détention encaissé sur douze mois. La mention figure en base, dans l'export et dans l'interface.

## Chemin technique unique

1. Les mesures validées résident dans `public.scpi_annual_fundamentals`, accessibles via la vue certifiée seulement si la ligne est validée et la confiance ≥0,95.
2. `scpi_history_year_audit_v1` exige les trois valeurs par année et leurs pages, `scpi_history_readiness_v1` distingue une couverture annuelle complète d'une simple collection de fichiers.
3. `scripts/exportScpiAnnualHistory.ts` lit les deux vues avec une clé serveur **pendant le build Netlify** ; ne transmet au navigateur qu'un JSON statique vérifié (valeurs, pages, URL et couverture). Une clé manquante ne crée jamais de faux PASS.
4. `ScpiTrajectoryPanel` utilise les exercices annuels pour les courbes de valorisation si ≥2 points, en dates de référence 31/12. **Les bulletins T1/T2 2026 ne sont pas des années de valorisation**. Les observations non comparables ne sont pas liées.
5. `ScpiAnnualHistorySection` montre séparément le tableau financier annuel et les PDF. Si seulement une année annuelle est disponible, le tableau peut s'afficher même sans courbe annuelle.
6. `scripts/scpi-history/annual-history-pilot.test.mjs` empêche la régression sur 2020/2025 et exige source+pages pour chaque ligne exportée.

## Contrôles nécessaires avant publication

Netlify Deploy Preview : build complet, exécution exporter et tests, validation du statut du commit. Vérifier deux courbes complètes pour Eurion et Origin/XL, un seul exercice USA sans courbe fabriquée, et l'avertissement Eurion 2020. Le site **production** reste inchangé tant que la PR n'est pas fusionnée et que le nouveau commit n'a pas de publication explicite validée ; éviter les micro-déploiements.

## Prochain travail documentaire sans détour

Pour Origin : combler 2012–2022, pour XL : 2017–2022, pour USA : 2024. Les archives pluriannuelles officielles sont prioritaires, et les colonnes/années restent vérifiées avant leur promotion. N'ajouter aucun zéro, interpolation ou pseudo-PASS pour une valeur manquante.
