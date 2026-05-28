# TASK-DATA-INTEGRATE-CREDIT-MUTUEL-PIERRE-1-001 — Rapport final

**Date :** 2026-05-28
**Branche :** `claude/issue-1-20260515-1418`
**Statut :** ✅ Complété — en attente de validation git

---

## Objectif

Intégrer les données structurées de Crédit Mutuel Pierre 1 dans MaximusSCPI à partir du package bulletin T1 2026, sans relire les PDF source, sans modifier le design, sans casser les mappings existants, et sans publier les données incertaines.

---

## Fichiers modifiés

| Fichier | Nature | Changement |
|---|---|---|
| `src/data/scpi_complet.json` | Source comparateur | Entrée CMP1 mise à jour (12 champs corrigés) |
| `src/data/scpiIndicators.generated.ts` | Snapshot indicateurs | Entrée `credit-mutuel-pierre-1` ajoutée (83 lignes) |
| `data-import/processed/credit-mutuel-pierre-1/document-inventory.json` | Package | Créé |
| `data-import/processed/credit-mutuel-pierre-1/indicator-matrix.json` | Package | Créé (62 indicateurs) |
| `data-import/processed/credit-mutuel-pierre-1/anomalies.json` | Package | Créé (7 anomalies) |
| `data-import/processed/credit-mutuel-pierre-1/rapport-extraction.md` | Package | Créé |
| `reports/TASK-DATA-INTEGRATE-CREDIT-MUTUEL-PIERRE-1-001.md` | Ce rapport | Créé |

**Non modifiés :** design, composants UI, types TypeScript, architecture.

---

## Données intégrées (publishable)

### Comparateur (`scpi_complet.json`) — corrections T1 2026

| Champ | Avant (legacy) | Après (T1 2026) |
|---|---|---|
| Société de gestion | La Française REM | **La Française Real Estate Managers** |
| Prix de souscription | 210 € | **215 €** |
| Taux de distribution | 4,52 % | **4,49 %** (TD 2025) |
| Capitalisation | 2 154,2 M€ | **800,35 M€** |
| TOF | 93,8 % | **82,3 %** |
| Endettement | 25,6 % | **21,78 %** |
| Valeur de reconstitution | 219,67 € | **219,50 €** |
| Valeur de réalisation | 185,57 € | **179,26 €** |
| Surcote/décote | -4,31 % | **-2,05 %** |
| Frais de souscription TTC | 10,2 % | **9,60 %** |
| Délai de jouissance | 6 mois | **1 mois** |
| SRRI | 3/7 | **4/7** |
| Durée détention | 10 ans | **9 ans** |
| Frais de gestion HT | 9 % | **10 %** |
| Nombre d'immeubles | 132 | **119** |
| SFDR | (absent) | **Article 9** |
| Label ISR | Oui | **null** (manual_review) |
| Répartition sectorielle | Bureaux 80,1%, Commerces 19,9% | **Bureaux 84,94%, Commerces 13,10%, Hôtels 1,96%** |
| Répartition géographique | Paris/IDF/Régions/Allemagne | **Paris 21,84%, IDF 51,53%, Régions 22,63%, Allemagne 3,91%, Espagne 0,09%** |

### Indicateurs (`scpiIndicators.generated.ts`) — entrée `credit-mutuel-pierre-1`

| Indicateur | Valeur | Source |
|---|---|---|
| `distribution_rate` | 4,49 % | Bulletin T1 2026 — TD 2025 |
| `distribution_year` | 2025 | — |
| `share_price` | 215 € | Bulletin T1 2026 |
| `capitalization` | 800,35 M€ | Bulletin T1 2026 |
| `tof` | 82,3 % | Bulletin T1 2026 |
| `occupancy_rate` | 77,1 % (TOP) | Bulletin T1 2026 |
| `subscription_fees` | 9,60 % TTC | Note d'information |
| `management_fees` | 10,00 % HT | Note d'information |
| `enjoyment_delay` | 1 mois | Note d'information |
| `reconstitution_value` | 219,50 € | Bulletin T1 2026 |
| `discount_premium` | -2,05 % | Bulletin T1 2026 |
| `debt_ratio` | 21,78 % | Bulletin T1 2026 |
| `tri_5y` | -2,74 % | Bulletin T1 2026 |
| `tri_10y` | 0,97 % | Bulletin T1 2026 |
| `distribution_quarterly` | 1,08 €/part | Bulletin T1 2026 — T1 2026, versé le 29/04/2026 |
| `nombre_locataires` | 439 (baux) | Bulletin T1 2026 |
| `sector_breakdown` | Bureaux 84,94%, Commerces 13,10%, Hôtels 1,96% | Bulletin T1 2026 |
| `geography_breakdown` | IDF 51,53%, Régions 22,63%, Paris 21,84%, Allem. 3,91%, Esp. 0,09% | Bulletin T1 2026 |

---

## Point d'attention liquidité (visible dans la fiche SCPI)

Le champ `warning` est affiché en amber dans `ScpiDetailPage.tsx` (`ScpiPublicIndicators`) :

> **Point d'attention liquidité :** le marché des parts est suspendu depuis le 12 février 2026. 396 756 parts sont en attente de retrait, représentant 10,7 % du total des parts (≈ 78,5 M€). Première confrontation prévue au 31 juillet 2026. Collecte brute T1 2026 : 1 100 €. TRI 5 ans : −2,74 % — performance négative sur 5 ans.

---

## Champs bloqués (manual_review — non publiés)

| Indicateur | Raison |
|---|---|
| `walt` | Libellés à vérifier vs convention ASPIM avant publication |
| `walb` | Même ambiguïté — règle ASPIM applicable |
| `label_isr` | Non confirmé bulletin T1 2026 (legacy = Oui, non vérifié) |
| `date_dissolution` | Conflit entre sources |
| `collecte_nette_t1_2026` | Tiret dans le bulletin — valeur non publiée |

---

## Champs hors modèle (gaps identifiés)

Ces données sont publishable selon le package mais n'ont pas de champ correspondant dans `ScpiIndicator` ni `Scpi`. Documentées dans `indicator-matrix.json` pour intégration future.

| Donnée | Valeur | Champ absent du modèle |
|---|---|---|
| Nombre d'associés | 18 413 | `nombre_associes` |
| Nombre de parts | 3 722 553 | `nombre_parts` |
| Surface en exploitation | 253 825 m² | `surface_exploitation` |
| Parts en attente de retrait | 396 756 | `parts_en_attente_retrait` |
| Montant parts en attente | 78 500 000 € | `montant_parts_en_attente` |
| Ratio parts en attente | 10,7 % | `ratio_parts_en_attente` |
| Marché suspendu depuis | 2026-02-12 | `marche_suspendu_depuis` |
| Première confrontation prévue | 2026-07-31 | `premiere_confrontation_prevue` |
| Loyers du trimestre | 9 000 000 € | `loyers_trimestre` |
| Surface locaux vacants | 58 233 m² | `surface_vacants` |
| Surface en restructuration | 24 396 m² | `surface_restructuration` |
| TRI 15 ans | 2,52 % | `tri_15y` dans `ScpiIndicator` |
| Note dans l'UI : `distribution_quarterly` | Label affiché "Acompte T3 2025" — hardcodé dans `ScpiDetailPage.tsx:45` | Mismatch label/période |

---

## Anomalies conservées

| ID | Sévérité | Champ | Type |
|---|---|---|---|
| anomalie-001 | critical | liquidite | Marché des parts suspendu depuis 12/02/2026 |
| anomalie-002 | warning | walt, walb | manual_review — convention ASPIM à vérifier |
| anomalie-003 | warning | label_isr | Non confirmé bulletin T1 2026 |
| anomalie-004 | warning | date_dissolution | Conflit entre sources |
| anomalie-005 | info | tof | Baisse matérielle 93,8% → 82,3% |
| anomalie-006 | info | capitalisation | Baisse majeure 2154 M€ → 800 M€ |
| anomalie-007 | info | collecte_nette_t1_2026 | Affichée avec tiret dans le bulletin |

---

## Contrôles

| Contrôle | Résultat |
|---|---|
| `git status` avant modif | ✅ Propre |
| `npx tsc --noEmit` | ✅ 0 erreur |
| `npm run build` | ✅ Build complet — dist/credit-mutuel-pierre-1/index.html généré |
| `git diff --stat` | ✅ 4 fichiers modifiés, 192 insertions, 105 suppressions |
| Design modifié | ✅ Non |
| Composants UI modifiés | ✅ Non |
| Données `verified` publiées | ✅ Non — tous `to_verify` |
| Données manual_review publiées | ✅ Non |

---

## Risques de régression

| Risque | Évaluation |
|---|---|
| Rupture du comparateur | Faible — entrée existante mise à jour, pas ajoutée |
| Rupture du slug | Aucun — slug dérivé automatiquement depuis "Crédit Mutuel Pierre 1" → `credit-mutuel-pierre-1` |
| Rupture du build | Aucun — TypeScript 0 erreur, build ✅ |
| Données plus anciennes écrasant plus récentes | Aucun — toutes les mises à jour sont des données T1 2026 plus récentes que le legacy |

---

## Recommandation

Les 11 champs gap (hors modèle) — notamment les données de marché des parts (`parts_en_attente_retrait`, `ratio_parts_en_attente`, `marche_suspendu_depuis`) — sont des informations critiques pour les investisseurs dans le contexte actuel. Une extension du modèle `ScpiIndicator` / `Scpi` pourrait les accueillir lors d'un prochain sprint.

Le label hardcodé "Acompte T3 2025" dans `ScpiDetailPage.tsx:45` devrait être rendu dynamique (ex. utiliser `source_period` de l'indicateur) pour éviter l'incohérence avec les données T1 2026.
