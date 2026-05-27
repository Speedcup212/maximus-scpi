# TASK-DATA-LEGACY-XLSX-IMPORT-001 — Rapport final

**Date :** 2026-05-27
**Branche :** `claude/issue-1-20260515-1418`
**Statut :** ✅ Complété

---

## Objectif

Importer, analyser et normaliser le fichier `SCPI_complet_avec_SFDR_Profil (1).xlsx` comme base `legacy_master_dataset` pour accélérer le remplissage du comparateur MaximusSCPI.

**Ce fichier n'est pas une source officielle publishable.** Statut par défaut de toutes les données : `legacy_fallback` / `legacy_dataset`.

---

## Fichier source

| Propriété | Valeur |
|---|---|
| Chemin | `C:\Users\ericb\Desktop\SCPI_complet_avec_SFDR_Profil (1).xlsx` |
| Feuille | `Sheet1` |
| Lignes | 51 SCPI |
| Colonnes | 26 |
| Doublons | **0** |
| Valeurs manquantes | **0** (toutes colonnes renseignées) |

---

## Colonnes disponibles et mapping

| # | Colonne Excel | Champ normalisé CSV | Champ TypeScript (`Scpi`) | Colonne Supabase (`scpi_indicators`) | Snapshot | Statut |
|---|---|---|---|---|---|---|
| 0 | Nom SCPI | `nom_scpi` | `name` | — | `slug` | ✅ |
| 1 | Société de gestion | `societe_gestion` | `company` | — | — | ✅ |
| 2 | Année de création | `annee_creation` | — | — | — | legacy |
| 3 | Profil de risque | `profil_risque` | `profilRisque` | — | — | legacy |
| 4 | Label ISR | `label_isr` | `isr` | — | — | legacy |
| 5 | Capitalisation (M€) | `capitalisation_m` | `capitalization` (×1M) | `capitalization` | `capitalization` | legacy |
| 6 | Prix de souscription (€) | `prix_souscription` | `price` | `share_price` | `share_price` | legacy |
| 7 | Valeur de retrait (€) | `valeur_retrait` | `valeurRetrait` | — | — | legacy |
| 8 | Surcote/décote (%) | `surcote_decote_pct` | calculé via `valeurReconstitution` | `discount_premium` | `discount_premium` | legacy |
| 9 | Valeur de reconstitution (€) | `valeur_reconstitution` | `valeurReconstitution` | `reconstitution_value` | `reconstitution_value` | legacy |
| 10 | Valeur de réalisation (€) | `valeur_realisation` | `valeurRealisation` | — | — | legacy |
| 11 | Taux de distribution (%) | `taux_distribution_pct` | `yield` | `td` | `distribution_rate` | ⚠️ legacy (voir divergences pilotes) |
| 12 | Distribution (€/part) | `distribution_par_part` | `distribution` | — | `distribution_quarterly` (trimestriel) | legacy |
| 13 | Endettement (%) | `endettement_pct` | `debt` | `debt_ratio` | `debt_ratio` | legacy |
| 14 | TOF (%) | `tof_pct` | `tof` | `tof` | `tof` | legacy |
| 15 | Nombre d'immeubles | `nombre_immeubles` | `nbImmeubles` | — | — | legacy |
| 16 | Minimum de souscription € | `minimum_souscription` | `minInvestment` | — | — | legacy |
| 17 | Délai de jouissance (mois) | `delai_jouissance_mois` | `delaiJouissance` | `enjoyment_delay` | `enjoyment_delay` | legacy |
| 18 | Versement des loyers | `versement_loyers` | `versementLoyers` | — | — | legacy |
| 19 | Durée détention recommandée (ans) | `duree_detention_recommandee_ans` | — | — | — | legacy |
| 20 | Frais de souscription (HT/%) | `frais_souscription_pct` | `fees` | `subscription_fees` | `subscription_fees` | legacy |
| 21 | SFDR | `sfdr` | `sfdr` | — | — | legacy |
| 22 | Profil cible | `profil_cible` | — | — | — | legacy |
| 23 | Frais de gestion (HT/%) | `frais_gestion_pct` | `fraisGestion` | — | — | legacy |
| 24 | Répartition Sectorielle | `repartition_sectorielle_json` | `repartitionSectorielle` | `sector_breakdown` | `sector_breakdown` | ⚠️ texte brut → parsé |
| 25 | Répartition Géographique | `repartition_geo_json` | `repartitionGeo` | `geography_breakdown` | `geography_breakdown` | ⚠️ JSON parfois malformé → réparé |

---

## Détection des anomalies

### Doublons de SCPI
**Aucun doublon détecté** (51 noms uniques).

### Valeurs manquantes
**Aucune colonne entièrement vide.** Les seuls cas particuliers :
- `Distribution (€/part)` : 0 null (mais 4 SCPI à TD=0 donc distribution=0)
- `Délai de jouissance` : 1 occurrence `NC` (Novaxia NEO)

### TD = 0 (suspect — SCPI en capital / lancement récent)

| SCPI | TD | Note |
|---|---|---|
| Patrimmo Croissance Impact | 0,0% | SCPI résidentielle en capital |
| Novapierre Résidentiel | 0,0% | SCPI résidentielle |
| GMA Essentialis | 0,0% | SCPI en cours de lancement |
| Grand Paris Résidentiel | 0,0% | SCPI résidentielle |

Ces valeurs ne sont pas des erreurs — ces SCPI distribuent peu ou pas de revenus courants.

### Frais de gestion > 12% (hors norme)

| SCPI | Frais gestion |
|---|---|
| Altixia Commerces | 15,0% |
| Novaxia NEO | 15,0% |
| Remake Live | 15,0% |
| Iroko Zen | 12,5% |

Note : frais de gestion incluent parfois des commissions de performance. À vérifier case by case.

### Répartition Sectorielle — texte brut (col 24)

Le champ contient du texte non-JSON dans 100% des lignes. Deux patterns identifiés :

- **Pattern 1** (44 SCPI) : `Label (XX%)` ou `Label (XX,XX%)`
  - Exemple : `Entrepôts logistiques (51%), Locaux d'activités (32%)`
- **Pattern 2** (6 SCPI) : `Label : XX %`
  - Exemple : `Bureaux : 65 %, Logistique et locaux d'activités : 15 %`
- **Labels uniquement** (1 SCPI) : NCap Régions — `Bureaux, Activités, Commerces` (pas de pourcentages)

**Action effectuée :** les deux patterns ont été parsés en `{label: pct}`. NCap Régions marqué `labels_only`.

### Répartition Géographique — JSON malformé (col 25)

| Statut | Nb | SCPI concernées |
|---|---|---|
| `ok` | 41 | — |
| `repaired` | 5 | Coeur de Région, LF Europimmo, Remake Live, Perial Opportunités Europe, Perial O2 |
| `labels_only` | 5 | NCap Régions, Novaxia NEO, Optimale, Log In, NCap Education Santé |

**Cas `repaired`** : JSON avec clés splitées sur la virgule décimale, ex. `{"France (24": null, "51%)": null}` → réparé en `{"France": 24.51}`.

**Cas `labels_only`** : JSON avec valeurs null et clés textuelles sans pourcentages → converti en `{"_labels_only": "texte"}`, utilisable pour affichage mais pas pour camembert.

### Délai de jouissance

- 1 occurrence `NC` : **Novaxia NEO** — converti en `null` dans le CSV.

---

## Divergences pilotes : legacy vs publishable

| SCPI | TD legacy (xlsx) | TD publishable (snapshot) | Delta | Interprétation |
|---|---|---|---|---|
| Activimmo | 5,50% | **5,50%** | 0,00 | ✅ Identique |
| Comète | 11,18% | **10,62%** | 0,56 | ⚠️ Données xlsx antérieures (année différente) |
| Iroko Zen | 6,01% | **7,32%** | 1,31 | ⚠️ Données xlsx antérieures (année différente) |
| Remake Live | 7,50% | **7,50%** | 0,00 | ✅ Identique |
| Transitions Europe | 8,25% | **8,25%** | 0,00 | ✅ Identique |

**Conclusion :** les divergences Comète et Iroko Zen s'expliquent par le millésime du fichier xlsx (données 2023/2024 vs TD 2024 publié). Le snapshot reste source de vérité pour le TD publishable.

---

## Nettoyage effectué

| Action | Nb lignes | Détail |
|---|---|---|
| Normalisation noms de colonnes | 26 | snake_case, sans caractères spéciaux |
| Conversion numérique | toutes | `safe_float` / `safe_int` — `NC` → `null` |
| Parse sectorial Pattern 1 | 44 | `Label (XX%)` → `{label: pct}` |
| Parse sectorial Pattern 2 | 6 | `Label : XX %` → `{label: pct}` |
| Parse sectorial labels_only | 1 | NCap Régions → `{_labels_only: texte}` |
| Réparation geo JSON split | 5 | Comma-decimal split → `{country: pct}` |
| Geo labels_only | 5 | Clés textuelles → `{_labels_only: texte}` |
| Ajout colonnes metadata | 4 | `_data_status`, `_source_origin`, `_sect_status`, `_geo_status` |

---

## Fichiers générés

### `data-import/legacy/scpi_master_legacy_normalized.csv`

- 51 lignes × 32 colonnes
- Encodage : UTF-8 BOM (compatible Excel)
- Colonnes metadata préfixées `_` pour distinguer de la donnée métier

### `data-import/legacy/import_errors.csv`

16 entrées classées par sévérité :

| Sévérité | Nb | Types |
|---|---|---|
| `warning` | 4 | TD = 0 |
| `info` | 12 | Geo repaired/labels_only, sectorial labels_only, délai NC |

### `data-import/legacy/normalize.py`

Script de transformation reproductible. Rerun : `python3 data-import/legacy/normalize.py`.

---

## Usage recommandé

| Usage | Action | Statut maximal autorisé |
|---|---|---|
| Préremplir `scpiData.ts` champs manquants | Lecture directe CSV | `legacy_fallback` |
| Alimenter `scpi_indicators` Supabase | Insert avec flag `source_origin='legacy_dataset'` | `to_verify` (jamais `verified`) |
| Répartitions sectorielles comparateur | JSON parsé — affichage uniquement | `legacy_fallback` |
| Répartitions géo camemberts | JSON réparé — affichage uniquement | `legacy_fallback` |
| Comparaison avec extraction officielle | Colonne `taux_distribution_pct` comme baseline | `manual_review` |
| **Publication comme donnée vérifiée** | **Interdit** | — |

---

## Contraintes respectées

- ✅ Aucune donnée marquée `verified`
- ✅ Statut par défaut : `legacy_fallback` / `legacy_dataset`
- ✅ Supabase non écrasé
- ✅ Design non modifié
- ✅ Pas de git add/commit/push sans validation
