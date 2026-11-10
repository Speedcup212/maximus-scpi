# RECOVERY-200 — Livrable du 10 novembre 2026 (seconde passe)

Remplace le livrable du 9 novembre pour les chiffres. Tableau par SCPI : `RECOVERY-200-69-scpi-table.md` (et `.csv`), généré par `scripts/industrial/fees/report_69_scpi.py` à partir des fichiers versionnés ; recoupé avec la base le 10/11 (aucun écart).

## A — Frais réglementaires

| `scpi_indicators` | Avant mission | 09/11 | **10/11** |
|---|---:|---:|---:|
| `frais_souscription` renseigné | 9 / 69 | 33 / 69 | **41 / 69** (dont 3 zéros explicites) |
| Souscription « non applicable » prouvée | 0 | 0 | **8 / 69** |
| `frais_gestion` renseigné | 4 / 69 | 19 / 69 | **34 / 69** |
| Valeurs renseignées avec provenance complète | 3 | 47 | **70** (38 souscription + 32 gestion) |

- Registre privé `scpi_fee_evidence`, relevé 42773336564 : 138 lignes, **87 `verified`** (84 taux + 3 zéros explicites), 45 `partial` (dont 8 non applicables), 6 `blocked`. Le relevé du 09/11 reste en base pour l'audit ; la vue `scpi_fee_evidence_current` donne la dernière décision.
- Relevé documentaire v2 : 60 DIC et 66 notes d'identité vérifiée (52 et 46 au 09/11), aucune perte. Les 63 décisions du 09/11 ont été rejouées par empreinte SHA-256 : les 63 documents sont inchangés.
- Chargement contrôlé par empreinte : lignes `6de36d82…a943`, patchs `4d15b14f…d9a7` (commit `a37d4fa`).
- **Non applicable ≠ zéro ≠ inconnu.** Huit SCPI dont la variabilité du capital est suspendue n'ont plus de souscription au marché primaire : Perial Grand Paris, Perial O2, Primovie, Patrimmo Commerce, Patrimmo Croissance Impact, Crédit Mutuel Pierre 1, Selectinvest 1, LF Grand Paris Patrimoine. Leur frais de souscription est vide, avec une provenance `not_applicable` datée et sourcée. Pour Primovie et Patrimmo Commerce, cela retire le 9 % que j'avais projeté le 09/11.
- Catalogue statique : 18 valeurs modifiées dans la seconde passe, dont 6 taux HT stockés sous un libellé TTC et 1 taux TTC stocké sous un libellé HT. Exemples : Épargne Foncière 7,5 → 9 % TTC ; Perial Opportunités Europe 9,5 → 11,4 % TTC ; Iroko Zen gestion 14,4 % TTC → 12 % HT.
- Revue sémantique outillée, réalisée par la session Claude, **non humaine**.

Restent à arbitrer (inchangés) :
- Accimmo Pierre : 10,72 % contre 10,716 %.
- Accès Valeur Pierre gestion.

Restent bloqués :
- Amundi ×2 : aucun document trouvé.
- ESG Pierre Capitale : le site renvoie 403.

## Correctif urgent — faux zéros en production (10/11)

**Cause.** `refresh_scpi_metric_certifications` re-dérive toutes les certifications non manuelles à chaque mise à jour d'indicateur. Le rapprocheur prouvait un zéro par simple proximité d'un « 0 ». Exemple : le dividende de 0 € de Ficommerce Proximité au T3 2026 était « prouvé » par un « 0,00 % » de revenus non récurrents. Un rejet manuel redevenait donc automatiquement une certification.

**Correctifs en base** (migrations `recovery200_metric_rejection_registry` et `_ncap`) :
- Registre `scpi_internal.metric_certification_rejections`.
- Trigger `trg_zzzzzz_reviewed_metric_rejection` : un rejet revu est rejoué tant que la valeur extraite ne change pas.
- Un zéro auto-certifié sur un dividende, un prix ou un nombre de parts passe en `review_required_zero_value`.
- Persistance prouvée : la fonction de rafraîchissement a été relancée sur les 7 SCPI, et les 9 rejets ont tenu.
- Contrôle exécutable `scripts/industrial/sql/recovery200_rejection_guard_check.sql` : 5/5 PASS, sans résidu.

**Données corrigées :**
- Ficommerce Proximité et Selectipierre 2 : dividende T3 → inconnu (il était à 0).
- Primovie : parts en attente T2 → non applicable (il était à 0). Après la suspension du 23/06, le bulletin affiche « - », contre 1 438 276 parts au trimestre précédent.
- Certifications rejetées, jamais publiées : Buroboutic, Paref Hexa, Aestiam ×3, NCap Éducation Santé 2019-T3.
- Lecture avec le rôle `anon` (celui du site) : aucun dividende T3 à 0 et aucune preuve Primovie n'est encore exposé.

**Rapprocheur** (`supabase/functions/scpi-evidence-certify/matcher.mjs`, 14 tests) :
- Il ne retient un zéro que sur une formulation explicite.
- Il écarte les unités incohérentes.
- L'ancienne logique reproduisait les 5 faux zéros testés ; la nouvelle n'en reproduit aucun.
- **Non déployé.**
- Coût assumé : certains « 0 part en attente » exacts ne seront plus prouvés automatiquement (mises en page Sogenial, tableau Activimmo).

## B — T3 2026

Le blocage atomique par bulletin est confirmé. Pour Buroboutic, Paref Hexa, Comète et Perial O2, la retenue est **justifiée** : les extractions T3 contiennent des erreurs (détail dans le tableau). Aucun T3 n'a été promu. La promotion par métrique reste soumise à décision.

## C et D

- C : les trois états publics ne sont pas encore affichés. La règle « un rejet n'est jamais retransformé automatiquement en validation » est désormais appliquée par la base.
- D : le registre des sociétés de gestion n'est pas construit. Débit de découverte documentaire mesuré : 69 SCPI en 6 min 38 s (relevé v2, 8 en parallèle). **Capacité d'intégration de nouvelles SCPI publiées par jour ouvré : non mesurée.**

## Production

- Sont en base, lus en direct : frais, faux zéros corrigés, rejets.
- Restent sur la branche, **non publiés** : catalogue statique, `selectProvenFee` non applicable, rapprocheur. Il faut la fusion de la PR #391 et un build Netlify.
- Tant que ce n'est pas fait, les SCPI hors base gardent les frais hérités du catalogue déployé. Exemple : le catalogue de `main` donne 11,5 % de souscription à Perial O2, qui est en réalité son taux de gestion HT. L'affichage réel de la page reste à contrôler.
