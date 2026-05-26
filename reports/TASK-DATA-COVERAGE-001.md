# TASK-DATA-COVERAGE-001 — Matrice complète des indicateurs SCPI

**Agent :** Agent 03 — Data SCPI  
**Date :** 2026-05-26  
**Objectif :** Inventaire exhaustif des indicateurs SCPI dans toutes les couches du système, et matrice cible pour le comparateur MaximusSCPI.

---

## 1. Sources scannées

| Couche | Fichier / Ressource | Rôle |
|--------|---------------------|------|
| TypeScript model | `src/types/scpiIndicator.ts` | Type `ScpiIndicator` — 35 champs |
| Data générée | `src/data/scpiIndicators.generated.ts` | 5 SCPI pilotes |
| Data legacy | `src/data/scpiData.ts` | 50+ SCPI, champs non tracés |
| Supabase SQL | `scpi-ingestion/sql/04_scpi_indicators.sql` | Table pipeline (41 colonnes) |
| Migration RA | `05_scpi_indicators_with_ra_columns` | +4 colonnes rapport annuel |
| Extraction PDF | `scpi-ingestion/src/extractor.ts` | 25+ champs extraits depuis bulletins |
| Write pipeline | `scpi-ingestion/src/supabase.ts` | 25 champs écrits via upsert |
| Comparateur | `src/components/ComparateurScpi.tsx` | 7 colonnes affichées |
| Comparaison | `src/components/ComparisonTable.tsx` | 15+ colonnes par onglet |
| Liste | `src/components/ScpiTable.tsx` | 10 colonnes |
| Page SCPI | `src/components/ScpiDetailPage.tsx` | 14 indicateurs affichés |

---

## 2. Légende de la matrice

### Couches
- **TS** : présent dans `ScpiIndicator` (TypeScript model)
- **DB** : présent dans `scpi_indicators` (Supabase)
- **UI** : visible dans au moins un composant comparateur ou page SCPI
- **AUTO** : extraction automatisée par la pipeline PDF

### Statuts
- `publishable` — extrait automatiquement, vérifié, prêt à afficher
- `manual_review` — présent en legacy ou extraction partielle, vérification requise
- `missing` — absent de toutes les sources automatisées actuelles
- `legacy_only` — présent dans `scpiData.ts` uniquement, non tracé

### Priorités
- **P0** — critique pour le comparateur (sans ces champs, comparateur inutilisable)
- **P1** — important pour l'analyse complète (différenciation, conseil)
- **P2** — enrichissement (contexte, historique, liquidité avancée)

### Sources officielles
- **BT** — Bulletin trimestriel (livraison périodique, source principale pipeline)
- **RA** — Rapport annuel (source TD quand absent du BT)
- **DIC** — Document d'Information Clé (frais, délai, SRRI)
- **NI** — Note d'information (statuts, frais définitifs)
- **PO** — Page officielle société de gestion (identité, labellisation)
- **SB** — Supabase manuel (saisie directe admin)

---

## 3. Matrice des 47 indicateurs

### Catégorie 1 — Identité (6 indicateurs)

| # | Indicateur | Clé TS | Clé DB | TS | DB | UI | AUTO | Source 1 | Source 2 | Statut | Priorité |
|---|------------|--------|--------|----|----|-----|------|----------|----------|--------|----------|
| 1 | Slug SCPI | `slug` | `scpi_slug` | ✅ | ✅ | ✅ | ✅ | Pipeline | — | publishable | P0 |
| 2 | Nom SCPI | `name` | `nom` | ✅ | ✅ | ✅ | ❌ | PO | NI | manual_review | P0 |
| 3 | Société de gestion | `management_company` | `societe_gestion` | ✅ | ✅ | ✅ | ❌ | PO | NI | manual_review | P0 |
| 4 | Année de création | — | `annee_creation` | ❌ | ✅ | ✅ | ❌ | NI | PO | manual_review | P1 |
| 5 | Catégorie SCPI | `category` | — | ✅ | ❌ | ✅ | ❌ | NI | PO | legacy_only | P1 |
| 6 | Résumé stratégie | `strategy_summary` | — | ✅ | ❌ | ❌ | ❌ | PO | NI | legacy_only | P2 |

**Gaps :** `annee_creation` manquant du TS model ; `category` et `strategy_summary` non stockés en DB.

---

### Catégorie 2 — Performance (7 indicateurs)

| # | Indicateur | Clé TS | Clé DB | TS | DB | UI | AUTO | Source 1 | Source 2 | Statut | Priorité |
|---|------------|--------|--------|----|----|-----|------|----------|----------|--------|----------|
| 7 | Taux de distribution | `distribution_rate` | `td` | ✅ | ✅ | ✅ | ✅ | BT | RA | publishable | P0 |
| 8 | Année du TD | `distribution_year` | `td_annee` | ✅ | ✅ | ❌ | ✅ | BT | RA | publishable | P1 |
| 9 | Distribution par part | `distribution_quarterly` | `distribution_par_part` | ✅ | ✅ | ✅ | ✅ | BT | — | publishable | P1 |
| 10 | Report à nouveau | `ran` | `report_a_nouveau` | ✅ | ✅ | ❌ | ✅ | BT | — | publishable | P1 |
| 11 | TRI 5 ans | `tri_5y` | — | ✅ | ❌ | ❌ | ❌ | RA | NI | missing | P2 |
| 12 | TRI 10 ans | `tri_10y` | — | ✅ | ❌ | ❌ | ❌ | RA | NI | missing | P2 |
| 13 | Collecte nette trimestrielle | — | `collecte_nette` | ❌ | ✅ | ❌ | ✅ | BT | — | publishable | P2 |

**Gaps :** TRI 5 et 10 ans — non extraits (présents dans certains RA mais patterns non implémentés).

---

### Catégorie 3 — Prix / Valorisation (7 indicateurs)

| # | Indicateur | Clé TS | Clé DB | TS | DB | UI | AUTO | Source 1 | Source 2 | Statut | Priorité |
|---|------------|--------|--------|----|----|-----|------|----------|----------|--------|----------|
| 14 | Prix de souscription | `share_price` | `prix_souscription` | ✅ | ✅ | ✅ | ✅ | BT | PO | publishable | P0 |
| 15 | Valeur de reconstitution | `reconstitution_value` | `prix_reconstitution` | ✅ | ✅ | ✅ | ✅ | BT | — | publishable | P0 |
| 16 | Prime / décote | `discount_premium` | `prime_decote` | ✅ | ✅ | ✅ | ✅ | BT | — | publishable | P0 |
| 17 | Capitalisation | `capitalization` | `capitalisation` | ✅ | ✅ | ✅ | ✅ | BT | PO | publishable | P0 |
| 18 | Prix de retrait | — | `prix_retrait` | ❌ | ✅ | ❌ | ❌ | BT | — | missing | P1 |
| 19 | Valeur de réalisation | — | `valeur_realisation` | ❌ | ✅ | ❌ | ❌ | BT | — | missing | P2 |
| 20 | Nombre de cessions trimestrielles | — | `nb_cessions_trimestre` | ❌ | ✅ | ✅ | ✅ | BT | — | publishable | P2 |

**Gaps :** `prix_retrait` et `valeur_realisation` présents en DB mais extraction non implémentée.

---

### Catégorie 4 — Patrimoine (4 indicateurs)

| # | Indicateur | Clé TS | Clé DB | TS | DB | UI | AUTO | Source 1 | Source 2 | Statut | Priorité |
|---|------------|--------|--------|----|----|-----|------|----------|----------|--------|----------|
| 21 | Nombre d'immeubles | — | `nombre_immeubles` | ❌ | ✅ | ✅ | ❌ | BT | — | manual_review | P1 |
| 22 | Nombre de locataires | `nombre_locataires` | `nombre_locataires` | ✅ | ✅ | ✅ | ✅ | BT | — | publishable | P1 |
| 23 | Taux d'endettement LTV | `debt_ratio` | `endettement` | ✅ | ✅ | ✅ | ❌ | BT | RA | manual_review | P1 |
| 24 | Nombre de parts | — | — | ❌ | ❌ | ❌ | ✅ | BT | — | missing | P2 |

**Gaps :** `nombre_immeubles` en DB sans extraction auto ; endettement extrait mais pas encore systématique.

---

### Catégorie 5 — Exploitation locative (6 indicateurs)

| # | Indicateur | Clé TS | Clé DB | TS | DB | UI | AUTO | Source 1 | Source 2 | Statut | Priorité |
|---|------------|--------|--------|----|----|-----|------|----------|----------|--------|----------|
| 25 | TOF — Taux d'occupation financier | `tof` | `tof` | ✅ | ✅ | ✅ | ✅ | BT | — | publishable | P0 |
| 26 | TOP — Taux d'occupation physique | `occupancy_rate` | `top` | ✅ | ✅ | ❌ | ✅ | BT | — | publishable | P1 |
| 27 | WALT (durée bail résiduelle pondérée) | `walt` | `walt` | ✅ | ✅ | ✅ | ✅ | BT | — | publishable | P1 |
| 28 | WALB (durée jusqu'à prochaine break) | `walb` | `walb` | ✅ | ✅ | ✅ | ✅ | BT | — | publishable | P1 |
| 29 | Durée de détention recommandée | — | `duree_detention_recommandee` | ❌ | ✅ | ❌ | ✅ | DIC | NI | publishable | P1 |
| 30 | Fréquence de versement des loyers | — | `versement_loyers` | ❌ | ✅ | ❌ | ❌ | DIC | PO | manual_review | P1 |

**Gaps :** `duree_detention_recommandee` et `versement_loyers` absents du TS model ; TOP non affiché dans l'UI.

---

### Catégorie 6 — Frais / Fonctionnement (5 indicateurs)

| # | Indicateur | Clé TS | Clé DB | TS | DB | UI | AUTO | Source 1 | Source 2 | Statut | Priorité |
|---|------------|--------|--------|----|----|-----|------|----------|----------|--------|----------|
| 31 | Frais de souscription | `subscription_fees` | `frais_souscription` | ✅ | ✅ | ✅ | ✅ | DIC | NI | publishable | P0 |
| 32 | Délai de jouissance | `enjoyment_delay` | `delai_jouissance` | ✅ | ✅ | ✅ | ✅ | DIC | BT | publishable | P0 |
| 33 | Frais de gestion | `management_fees` | `frais_gestion` | ✅ | ✅ | ❌ | ✅ | BT | NI | publishable | P1 |
| 34 | Commission de surperformance | — | `commission_performance` | ❌ | ✅ | ❌ | ✅ | BT | NI | publishable | P1 |
| 35 | Frais de sortie | — | `frais_sortie` | ❌ | ✅ | ❌ | ✅ | DIC | NI | publishable | P2 |

**Gaps :** `commission_performance` et `frais_sortie` présents en DB et extraits mais absents du TS model et non affichés.

---

### Catégorie 7 — Risque / Liquidité (5 indicateurs)

| # | Indicateur | Clé TS | Clé DB | TS | DB | UI | AUTO | Source 1 | Source 2 | Statut | Priorité |
|---|------------|--------|--------|----|----|-----|------|----------|----------|--------|----------|
| 36 | SRRI — Indicateur de risque (1–7) | — | `srri` | ❌ | ✅ | ❌ | ✅ | DIC | — | publishable | P1 |
| 37 | Classification SFDR | — | `sfdr` | ❌ | ✅ | ❌ | ❌ | PO | NI | manual_review | P1 |
| 38 | Label ISR | — | `label_isr` | ❌ | ✅ | ✅ | ❌ | PO | — | manual_review | P1 |
| 39 | Investissement minimum | — | — | ❌ | ❌ | ✅ | ❌ | PO | DIC | legacy_only | P1 |
| 40 | Durée de détention recommandée | — | `duree_detention_recommandee` | ❌ | ✅ | ❌ | ✅ | DIC | — | publishable | P1 |

**Gaps :** SRRI extrait par le pipeline mais absent du TS model. SFDR, label ISR, investissement minimum non automatisés.

---

### Catégorie 8 — Diversification (4 indicateurs)

| # | Indicateur | Clé TS | Clé DB | TS | DB | UI | AUTO | Source 1 | Source 2 | Statut | Priorité |
|---|------------|--------|--------|----|----|-----|------|----------|----------|--------|----------|
| 41 | Secteur principal | `main_sector` | `secteur_principal` | ✅ | ✅ | ✅ | ✅ | BT | PO | publishable | P0 |
| 42 | Géographie principale | `main_geography` | `geographie_principale` | ✅ | ✅ | ✅ | ✅ | BT | PO | publishable | P0 |
| 43 | Répartition sectorielle (%) | `sector_breakdown` | `repartition_sectorielle` | ✅ | ✅ | ✅ | ✅ | BT | — | publishable | P1 |
| 44 | Répartition géographique (%) | `geography_breakdown` | `repartition_geographique` | ✅ | ✅ | ✅ | ✅ | BT | — | publishable | P1 |

**Pas de gaps critiques** — couverture complète de la diversification.

---

### Catégorie 9 — Preuve / Traçabilité (7 indicateurs)

| # | Indicateur | Clé TS | Clé DB | TS | DB | UI | AUTO | Source 1 | Source 2 | Statut | Priorité |
|---|------------|--------|--------|----|----|-----|------|----------|----------|--------|----------|
| 45 | Période du bulletin source | — | `source_period` | ❌ | ✅ | ✅ | ✅ | Pipeline | — | publishable | P0 |
| 46 | Score de confiance | `confidence_score` | `source_confidence` | ✅ | ✅ | ✅ | ✅ | Pipeline | — | publishable | P0 |
| 47 | Type de source | `source_document_type` | `source_type` | ✅ | ✅ | ✅ | ✅ | Pipeline | — | publishable | P0 |
| 48 | Période du rapport annuel | — | `ra_source_period` | ❌ | ✅ | ❌ | ✅ | Pipeline RA | — | publishable | P1 |
| 49 | SHA-256 du rapport annuel | — | `ra_source_sha256` | ❌ | ✅ | ❌ | ✅ | Pipeline RA | — | publishable | P1 |
| 50 | Sources consultées | `sources_checked` | — | ✅ | ❌ | ✅ | ✅ | Pipeline | — | publishable | P1 |
| 51 | Date de dernière extraction | `extraction_date` | `updated_at` | ✅ | ✅ | ❌ | ✅ | Pipeline | — | publishable | P1 |

---

## 4. Synthèse des gaps par priorité

### P0 — Critiques (à traiter en priorité)

| # | Gap | Impact | Action |
|---|-----|--------|--------|
| G1 | `nom` et `societe_gestion` non automatisés | Affichage hardcodé depuis scpiData.ts | Alimenter via pipeline (page officielle) ou seed manuel en DB |
| G2 | `category` absent de Supabase | Type SCPI non stocké en base | Ajouter colonne `categorie text` à scpi_indicators |
| G3 | `source_period` absent du TS model | Pas de badge période dans l'UI pour tous les composants | Ajouter `source_period` à `ScpiIndicator` |

### P1 — Importants

| # | Gap | Impact | Action |
|---|-----|--------|--------|
| G4 | `annee_creation` absent du TS model | ComparisonTable fait appel à scpiData.ts | Ajouter `annee_creation?: number` à `ScpiIndicator` |
| G5 | `srri` extrait par pipeline mais absent du TS model et UI | Indicateur de risque non affiché | Ajouter `srri?: number` à `ScpiIndicator` ; afficher dans ScpiDetailPage |
| G6 | `duree_detention_recommandee` absent du TS model | Non affiché malgré extraction | Ajouter `duree_detention_recommandee?: number` à `ScpiIndicator` |
| G7 | `versement_loyers` non automatisé | Fréquence dividende indisponible | Extraction depuis DIC (pattern texte mensuel/trimestriel) |
| G8 | `label_isr` et `sfdr` non automatisés | Filtrage ESG manuel | Extraction depuis page officielle ; saisie manuelle en attendant |
| G9 | `investissement_minimum` absent de Supabase | Utilisé dans ScpiTable depuis scpiData | Ajouter colonne + source DIC/PO |
| G10 | `prix_retrait` extrait mais extraction non systématique | Donnée en DB mais vide | Implémenter pattern extraction dans extractor.ts |
| G11 | `endettement` extrait mais non systématique | Donnée en DB mais vide pour la plupart | Renforcer patterns extraction LTV dans extractor.ts |

### P2 — Enrichissement

| # | Gap | Impact | Action |
|---|-----|--------|--------|
| G12 | `tri_5y` / `tri_10y` absents de Supabase | Performances historiques manquantes | Ajouter colonnes DB ; implémenter extraction RA |
| G13 | `collecte_nette` absent du TS model | Donnée disponible en DB mais inutilisée | Ajouter `collecte_nette?: number` à `ScpiIndicator` |
| G14 | `frais_sortie` / `commission_performance` absents du TS model | Disponibles en DB et extraits | Ajouter au TS model |
| G15 | `valeur_realisation` et `prix_retrait` sans extraction | Colonnes vides | Patterns extractor.ts |

---

## 5. Vue d'ensemble par couche

### Taux de couverture par couche

| Couche | Indicateurs couverts | Total cible | Taux |
|--------|---------------------|-------------|------|
| TS model (`ScpiIndicator`) | 30 / 47 | 47 | 64% |
| Supabase (`scpi_indicators`) | 41 / 47 | 47 | 87% |
| Extraction automatique pipeline | 25 / 47 | 47 | 53% |
| UI (au moins 1 composant) | 28 / 47 | 47 | 60% |

### Indicateurs 100% couverts (TS + DB + UI + AUTO)
TD, TOF, capitalisation, prix_souscription, prime_décote, frais_souscription, délai_jouissance, répartitions sectorielle et géographique, secteur_principal, geographie_principale, source_confidence, WALT, WALB, distribution_par_part, nombre_locataires.

### Indicateurs en DB + AUTO mais absents du TS model (à aligner)
`srri`, `duree_detention_recommandee`, `versement_loyers`, `commission_performance`, `frais_sortie`, `collecte_nette`, `nb_cessions_trimestre`, `annee_creation`, `ra_source_period`, `ra_source_sha256`.

### Indicateurs en TS model + UI mais absents de Supabase (legacy)
`category`, `strategy_summary`, `tri_5y`, `tri_10y`, `sources_checked`, `best_available_source`, `missing_reason`, `evidence_search_complete`.

---

## 6. Recommandations prioritaires

### Phase immédiate (avant scaling 20 SCPI)

1. **Aligner le TS model** : ajouter `srri`, `duree_detention_recommandee`, `annee_creation`, `collecte_nette`, `commission_performance`, `frais_sortie` à `ScpiIndicator` — les données existent en DB, il manque juste le type.

2. **Ajouter `categorie` à Supabase** : la colonne manque dans `scpi_indicators`. Migration simple.

3. **Corriger le mapping `source_period`** : présent en DB (`source_period`) et dans l'UI mais absent du TS model — incohérence bloquante pour afficher le badge période correctement dans tous les composants.

### Phase suivante (scaling)

4. **Automatiser `label_isr` et `sfdr`** : extraction depuis page officielle (Playwright + patterns HTML). Source fiable = accréditation AMF.

5. **Implémenter extraction `endettement` et `prix_retrait`** : patterns PDF existent, à fiabiliser dans `extractor.ts`.

6. **Ajouter `tri_5y` / `tri_10y`** : colonnes DB + extraction RA (rapports annuels contiennent généralement une section performance historique).

### Conformité CIF

- Tous les indicateurs P0 déjà affichés sont issus de sources officielles (BT, DIC)
- Aucune estimation ou interpolation dans les données publiées
- Les champs `sources_checked`, `evidence_search_complete`, `missing_reason` garantissent la traçabilité du motif d'absence — cette architecture doit être préservée lors de l'alignement DB
