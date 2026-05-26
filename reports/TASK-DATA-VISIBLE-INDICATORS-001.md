# TASK-DATA-VISIBLE-INDICATORS-001 — Inventaire des indicateurs visibles

**Date :** 2026-05-26  
**Branche :** `claude/issue-1-20260515-1418`  
**Statut :** ✅ Complété (audit uniquement — aucun fichier modifié)

---

## Résumé exécutif

**Constat principal :** Supabase `scpi_indicators` ne contient que `td` + `td_annee` pour 4 SCPI pilotes (Remake Live absent). Toutes les autres colonnes sont `NULL`. Le snapshot (`scpiIndicators.generated.ts`) est bien plus riche (13 indicateurs pour 3–4 pilotes) mais n'est consommé en dehors du bloc `ScpiPublicIndicators` que par `ComparateurScpi`. Les zones UI les plus visibles (cartes métriques `ScpiDetailPage`, colonnes `ScpiTable`, `AnalysisDetailModal`) lisent encore le legacy JSON pour TOF, capitalisation, prix, décote, WALT, WALB.

---

## État de la table Supabase `scpi_indicators` (requête directe)

| Champ Supabase | activimmo | comete | iroko-zen | transitions-europe | remake-live |
|---|---|---|---|---|---|
| `td` | 0.055 | 0.1062 | 0.0732 | 0.0825 | **absent** |
| `td_annee` | 2024 | 2024 | 2024 | 2024 | **absent** |
| `tof` | NULL | NULL | NULL | NULL | — |
| `capitalisation` | NULL | NULL | NULL | NULL | — |
| `prix_souscription` | NULL | NULL | NULL | NULL | — |
| `prix_reconstitution` | NULL | NULL | NULL | NULL | — |
| `prime_decote` | NULL | NULL | NULL | NULL | — |
| `endettement` | NULL | NULL | NULL | NULL | — |
| `frais_souscription` | NULL | NULL | NULL | NULL | — |
| `frais_gestion` | NULL | NULL | NULL | NULL | — |
| `delai_jouissance` | NULL | NULL | NULL | NULL | — |
| `walt` | NULL | NULL | NULL | NULL | — |
| `walb` | NULL | NULL | NULL | NULL | — |
| `nombre_locataires` | NULL | NULL | NULL | NULL | — |
| `distribution_par_part` | NULL | NULL | NULL | NULL | — |
| `srri` | NULL | NULL | NULL | NULL | — |
| `sfdr` | NULL | NULL | NULL | NULL | — |

> **Conclusion :** Supabase est opérationnel uniquement pour le TD annuel. Tout le reste repose sur le snapshot ou le legacy JSON.

---

## État du snapshot (`scpiIndicators.generated.ts`) — 5 pilotes

| Champ snapshot | activimmo | comete | iroko-zen | remake-live | transitions-europe |
|---|---|---|---|---|---|
| `distribution_rate` | 5.50 | 10.62 | 7.32 | 7.50 | 8.25 |
| `distribution_year` | 2024 | 2024 | 2024 | 2024 | 2024 |
| `share_price` | null | null | **204** | **204** | **200** |
| `capitalization` | null | null | **1237** | **806** | **948** |
| `tof` | null | null | **98.1** | **99.3** | **97.54** |
| `reconstitution_value` | null | null | **213.65** | **203.52** | **207.02** |
| `discount_premium` | null | null | null | **0.24** | **-3.4** |
| `debt_ratio` | null | **0.1** | **30.1** | **18.64** | **0** |
| `subscription_fees` | null | null | **0** | **0** | null |
| `enjoyment_delay` | null | null | **1** | null | null |
| `walt` | null | **10.4** | **9.1** | **10.3** | **11.3** |
| `walb` | null | **8.4** | **7.6** | null | **6.5** |
| `nombre_locataires` | null | **67** | **378** | **77** | **290** |
| `distribution_quarterly` | null | null | **3.03** | **3.57** | **3.0** |

---

## Inventaire complet des indicateurs visibles par zone UI

### Zone 1 — `ScpiTable.tsx` (comparateur principal)

| Indicateur visible | Champ UI | Source actuelle | Champ Supabase | Statut | Action minimale |
|---|---|---|---|---|---|
| Taux de distribution | `resolvedTds[id].displayYield` via `usePublishedTds` | snapshot → Supabase.td (async) | `td` | **publishable** | ✅ OK |
| Secteur | `scpi.sector` | legacy JSON calculé | `secteur_principal` (NULL) | **legacy_only** | — |
| Géographie | `scpi.geography` | legacy JSON calculé | `geographie_principale` (NULL) | **legacy_only** | — |
| Capitalisation | `scpi.capitalization` | legacy JSON | `capitalisation` (NULL) | **legacy_only** | Peupler Supabase ou lire snapshot |
| Taux d'occupation (TOF) | `scpi.tof` | legacy JSON | `tof` (NULL) | **legacy_only** | Peupler Supabase ou lire snapshot |
| Prix de souscription | `scpi.price` | legacy JSON | `prix_souscription` (NULL) | **legacy_only** | Peupler Supabase ou lire snapshot |
| Décote/Surcote | `scpi.discount` | legacy JSON | `prime_decote` (NULL) | **legacy_only** | Peupler Supabase ou lire snapshot |
| Minimum de souscription | `scpi.minInvest` | legacy JSON | absent | **legacy_only** | — |
| Badge ISR | `scpi.isr` | legacy JSON | `label_isr` (NULL) | **legacy_only** | — |
| Badge frais 0% | `scpi.fees === 0` | legacy JSON | `frais_souscription` (NULL) | **legacy_only** | — |
| Note MaximusSCPI (étoiles) | via `ScpiTable` → non affiché ici | — | — | — | — |

---

### Zone 2 — `ComparateurScpi.tsx` (tableau public /comparateur)

| Indicateur visible | Champ UI | Source actuelle | Champ Supabase | Statut | Action minimale |
|---|---|---|---|---|---|
| Taux de distribution | `indicator?.distribution_rate ?? scpi.yield` | snapshot → legacy JSON | `td` | **publishable** (5 pilotes) | ✅ OK |
| Année TD | `indicator?.distribution_year` | snapshot | `td_annee` | **publishable** (5 pilotes) | ✅ OK |
| TOF | `indicator?.tof ?? scpi.tof` | snapshot (3 pilotes) → legacy JSON | `tof` (NULL) | **mixte** | ✅ snapshot couvre 3 pilotes |
| Prix de souscription | `indicator?.share_price ?? scpi.price` | snapshot (3 pilotes) → legacy JSON | `prix_souscription` (NULL) | **mixte** | ✅ snapshot couvre 3 pilotes |
| Frais souscription | `indicator?.subscription_fees ?? scpi.fees` | snapshot (2 pilotes) → legacy JSON | `frais_souscription` (NULL) | **mixte** | ✅ snapshot couvre 2 pilotes |
| Capitalisation | `indicator?.capitalization × 1M ?? scpi.capitalization` | snapshot (3 pilotes) → legacy JSON | `capitalisation` (NULL) | **mixte** | ✅ snapshot couvre 3 pilotes |
| Délai jouissance | `indicator?.enjoyment_delay ?? scpi.delaiJouissance` | snapshot (Iroko Zen) → legacy JSON | `delai_jouissance` (NULL) | **mixte** | ✅ snapshot couvre 1 pilote |
| Badge data_status | `indicator?.data_status` | snapshot | — | **publishable** (5 pilotes) | ✅ OK |

> **Note :** `ComparateurScpi` est la zone la plus enrichie : elle lit le snapshot en priorité pour 6 indicateurs.

---

### Zone 3 — `ScpiDetailPage.tsx` — onglet Vue d'ensemble

#### Cartes métriques (4 cartes visibles)

| Indicateur visible | Champ UI | Source actuelle | Champ Supabase | Statut | Action minimale |
|---|---|---|---|---|---|
| Taux de distribution | `getYieldDisplayInfo(scpi)` → `scpi.yield` | snapshot → Supabase.td (async) | `td` | **publishable** | ✅ OK |
| Label net/brut + legal notice | `yieldDisplayInfo.primaryLabel` | calculé depuis `scpi.geography` + `actualitesTrimestrielles` | — | **legacy_only** (données taux net extraites du bulletin) | — |
| Taux net (SCPI EU) | parsé depuis `scpi.actualitesTrimestrielles` | legacy JSON (bulletin texte) | absent | **incohérent** | Structurer le taux net dans snapshot |
| TOF | `scpi.tof` | legacy JSON | `tof` (NULL) | **legacy_only** | Snapshot disponible (3 pilotes) — non utilisé ici |
| Capitalisation | `scpi.capitalization` | legacy JSON | `capitalisation` (NULL) | **legacy_only** | Snapshot disponible (3 pilotes) — non utilisé ici |
| Score qualité (nb/100) | `getLatestScore(slug)` → Supabase `scpi_bulletins.maximus_score_value` | Supabase async | `maximus_score_value` | **supabase** | ✅ OK |

#### Bloc Caractéristiques financières

| Indicateur visible | Champ UI | Source actuelle | Champ Supabase | Statut | Action minimale |
|---|---|---|---|---|---|
| Prix/part | `scpi.price` | legacy JSON | `prix_souscription` (NULL) | **legacy_only** | Snapshot disponible (3 pilotes) — non utilisé ici |
| Décote | `scpi.discount` | legacy JSON | `prime_decote` (NULL) | **legacy_only** | Snapshot disponible (2 pilotes) — non utilisé ici |
| Frais souscription | `scpi.fees` | legacy JSON | `frais_souscription` (NULL) | **legacy_only** | Snapshot disponible (2 pilotes) — non utilisé ici |

#### Bloc Informations générales

| Indicateur visible | Champ UI | Source actuelle | Champ Supabase | Statut | Action minimale |
|---|---|---|---|---|---|
| Secteur principal | `scpi.sector` | legacy JSON calculé | `secteur_principal` (NULL) | **legacy_only** | — |
| Zone géographique | `scpi.geography` | legacy JSON calculé | `geographie_principale` (NULL) | **legacy_only** | — |
| Année de création | `scpi.creation` | legacy JSON | absent | **legacy_only** | — |

#### Bloc Simulation

| Indicateur visible | Champ UI | Source actuelle | Statut | Action minimale |
|---|---|---|---|---|
| Revenus mensuels calculés | `scpi.yield / 100 × montant / 12` | snapshot enrichi | **publishable** | ✅ OK (utilise yield enrichi) |

---

### Zone 4 — `ScpiDetailPage.tsx` — onglet Répartitions

| Indicateur visible | Champ UI | Source actuelle | Champ Supabase | Statut | Action minimale |
|---|---|---|---|---|---|
| % par secteur (camembert) | `scpi.repartitionSector` | legacy JSON | `repartition_sectorielle` (NULL) | **legacy_only** | Snapshot a données pour Remake Live + TE |
| % par pays (camembert) | `scpi.repartitionGeo` | legacy JSON | `repartition_geographique` (NULL) | **legacy_only** | Snapshot a données pour Remake Live + TE |

> **Incohérence :** Le snapshot contient `sector_breakdown` et `geography_breakdown` pour Remake Live et Transitions Europe, mais ces données ne sont PAS transmises aux camemberts de `ScpiDetailPage` — les camemberts lisent `scpi.repartitionSector` depuis le legacy JSON.

---

### Zone 5 — `ScpiDetailPage.tsx` — Bloc "Indicateurs publiés" (`ScpiPublicIndicators`)

Ce bloc est le seul à lire **directement le snapshot** pour tous les indicateurs. Il est visible uniquement sur les 5 SCPI pilotes.

| Indicateur visible | Champ snapshot | Disponible pour | Champ Supabase | Statut |
|---|---|---|---|---|
| Taux de distribution | `distribution_rate` + `distribution_year` | 5/5 | `td`, `td_annee` | **publishable** |
| Acompte T3 2025 (€/part) | `distribution_quarterly` | 3/5 (Iroko, Remake, TE) | `distribution_par_part` (NULL) | **publishable** (partiel) |
| Prix de souscription | `share_price` | 3/5 (Iroko, Remake, TE) | `prix_souscription` (NULL) | **publishable** (partiel) |
| Capitalisation | `capitalization` | 3/5 (Iroko, Remake, TE) | `capitalisation` (NULL) | **publishable** (partiel) |
| TOF | `tof` | 3/5 (Iroko, Remake, TE) | `tof` (NULL) | **publishable** (partiel) |
| Valeur de reconstitution | `reconstitution_value` | 3/5 (Iroko, Remake, TE) | `prix_reconstitution` (NULL) | **publishable** (partiel) |
| Surcote/Décote | `discount_premium` | 2/5 (Remake, TE) | `prime_decote` (NULL) | **publishable** (partiel) |
| Endettement | `debt_ratio` | 4/5 (sauf Activimmo) | `endettement` (NULL) | **publishable** (partiel) |
| Frais souscription | `subscription_fees` | 2/5 (Iroko, Remake) | `frais_souscription` (NULL) | **publishable** (partiel) |
| Délai de jouissance | `enjoyment_delay` | 1/5 (Iroko) | `delai_jouissance` (NULL) | **publishable** (partiel) |
| WALT | `walt` | 4/5 (sauf Activimmo) | `walt` (NULL) | **publishable** (partiel) |
| WALB | `walb` | 3/5 (Comète, Iroko, TE) | `walb` (NULL) | **publishable** (partiel) |
| Nombre de locataires | `nombre_locataires` | 4/5 (sauf Activimmo) | `nombre_locataires` (NULL) | **publishable** (partiel) |
| Source, date, statut | `management_company`, `extraction_date`, `data_status` | 5/5 | — | **publishable** |

---

### Zone 6 — `ScpiDetailPage.tsx` — onglet Analyse détaillée

| Indicateur visible | Champ UI | Source actuelle | Champ Supabase | Statut | Action minimale |
|---|---|---|---|---|---|
| Actualité trimestrielle (texte) | `scpi.actualitesTrimestrielles` | legacy JSON (pipeline bulletin) | absent | **legacy_only** | — |
| Période bulletin | `scpi.periodeBulletinTrimestriel` | legacy JSON | absent | **legacy_only** | — |
| Texte analyse experte | `getScpiAnalysis(scpi)` | généré depuis champs `scpi` | — | **semi-publishable** | TD enrichi, TOF legacy |
| Avantages générés | `getScpiAdvantages(scpi)` | généré depuis `scpi.yield`, `scpi.tof` | — | **semi-publishable** | TD enrichi, TOF legacy |
| Points d'attention | `getScpiPointsAttention(scpi)` | généré depuis `scpi.*` | — | **semi-publishable** | — |

---

### Zone 7 — `FintechComparator` — `SCPICardDark` + `SCPITableRow`

| Indicateur visible | Champ UI | Source actuelle | Champ Supabase | Statut | Action minimale |
|---|---|---|---|---|---|
| Taux de distribution brut | `scpi.yield.toFixed(2)` | `enrichScpiExtended` → `scpiData.yield` (snapshot) | `td` | **publishable** | ✅ OK |
| Prix de la part | `scpi.price` | legacy JSON | `prix_souscription` (NULL) | **legacy_only** | — |
| Investissement minimum | `scpi.minInvestment` | legacy JSON | absent | **legacy_only** | — |
| Note MaximusSCPI (étoiles) | `scoreToStars(score)` → Supabase `scpi_bulletins` | Supabase async | `maximus_score_value` | **supabase** | ✅ OK |
| TOF (étendu) | `scpi.tof` | legacy JSON | `tof` (NULL) | **legacy_only** | — |
| Capitalisation (étendu) | `scpi.capitalization` | legacy JSON | `capitalisation` (NULL) | **legacy_only** | — |
| Secteurs principaux (étendu) | `scpi.sectors` | `enrichScpiExtended` → legacy JSON | `repartition_sectorielle` (NULL) | **legacy_only** | — |
| Stratégie (étendu) | `scpi.strategy` | `scpiDataExtended` (hardcodé) | absent | **hardcoded** | — |
| Badge catégorie | `scpi.category` | `scpiDataExtended` (hardcodé) | absent | **hardcoded** | — |

---

### Zone 8 — `AnalysisDetailModal.tsx` (FintechComparator)

#### Chiffres clés

| Indicateur visible | Champ UI | Source actuelle | Champ Supabase | Statut | Action minimale |
|---|---|---|---|---|---|
| Taux de distribution brut | `scpiForAnalysis?.yield ?? scpi.yield` | snapshot via `scpiData` | `td` | **publishable** | ✅ OK |
| TOF | `scpiForAnalysis?.tof ?? scpi.tof` | legacy JSON | `tof` (NULL) | **legacy_only** | — |
| Décote/Surcote (calculé) | `(price − reconstitutionValue) / reconstitutionValue × 100` | legacy JSON (valeurs reconstitution) | `prix_reconstitution` (NULL) | **legacy_only** | Snapshot disponible (3 pilotes) |
| Capitalisation | `scpiForAnalysis?.capitalization ?? scpi.capitalization` | legacy JSON | `capitalisation` (NULL) | **legacy_only** | — |
| Note (étoiles) | Supabase `scpi_bulletins.maximus_score_value` | Supabase async | `maximus_score_value` | **supabase** | ✅ OK |

#### Section technique / Profil SCPI

| Indicateur visible | Champ UI | Source actuelle | Champ Supabase | Statut | Action minimale |
|---|---|---|---|---|---|
| Frais de gestion | `scpi.managementFees ?? scpi.fraisGestion` | legacy JSON | `frais_gestion` (NULL) | **legacy_only** | — |
| Délai de jouissance | `scpi.delaiJouissance` | legacy JSON (snapshot plus fiable pour Iroko) | `delai_jouissance` (NULL) | **incohérent** | Lire snapshot.enjoyment_delay |
| Fréquence de versement | `scpi.versementLoyers` | legacy JSON | `versement_loyers` (NULL) | **legacy_only** | — |
| SFDR | `scpi.sfdr` | legacy JSON | `sfdr` (NULL) | **legacy_only** | — |
| Profil de risque (SRRI, barre visuelle) | `scpi.profilRisque` | legacy JSON | `srri` (NULL) | **legacy_only** | — |
| Valeur de reconstitution | `scpi.reconstitutionValue ?? scpi.valeurReconstitution` | legacy JSON | `prix_reconstitution` (NULL) | **incohérent** | Snapshot disponible (3 pilotes) |
| Valeur de retrait | `scpi.valeurRetrait` | legacy JSON | `prix_retrait` (NULL) | **legacy_only** | — |
| Distribution par part | `scpi.distribution` | legacy JSON | `distribution_par_part` (NULL) | **legacy_only** | Snapshot a `distribution_quarterly` (3 pilotes) |
| WALT | `scpi.walt ?? scpiForAnalysis?.walt` | bulletin JSON via `scpiData` (legacy pipeline) | `walt` (NULL) | **legacy_only** | — |
| WALB | `scpi.walb ?? scpiForAnalysis?.walb` | bulletin JSON via `scpiData` | `walb` (NULL) | **legacy_only** | — |
| Nombre de locataires | `nombreLocataires` | bulletin JSON via `scpiData` | `nombre_locataires` (NULL) | **legacy_only** | — |
| Nombre d'immeubles | `scpiForAnalysis?.nbImmeubles ?? scpi.assetsCount` | legacy JSON | `nombre_immeubles` (NULL) | **legacy_only** | — |
| Collecte nette trimestre | `collecteNetteTrimestre` | legacy JSON | `collecte_nette` (NULL) | **legacy_only** | — |
| Nb cessions trimestre | `nbCessionsTrimestre` | legacy JSON | `nb_cessions_trimestre` (NULL) | **legacy_only** | — |

---

## Synthèse — Statuts par indicateur

| Indicateur | Nb zones affichant | Source dominante | Statut global |
|---|---|---|---|
| Taux de distribution (TD) | 8 | snapshot → Supabase.td | **publishable** ✅ |
| TOF | 5 | legacy JSON (snapshot disponible) | **legacy_only** ⚠️ |
| Capitalisation | 5 | legacy JSON (snapshot disponible) | **legacy_only** ⚠️ |
| Prix souscription | 4 | legacy JSON (snapshot disponible) | **legacy_only** ⚠️ |
| Décote/Surcote | 4 | legacy JSON (snapshot disponible) | **legacy_only** ⚠️ |
| Frais souscription | 3 | legacy JSON (snapshot disponible) | **legacy_only** ⚠️ |
| Valeur de reconstitution | 3 | legacy JSON (snapshot disponible) | **incohérent** ⚠️ |
| Note qualité (étoiles) | 3 | Supabase `scpi_bulletins` | **supabase** ✅ |
| Répartition sectorielle | 2 | legacy JSON (snapshot partiel) | **legacy_only** ⚠️ |
| Répartition géographique | 2 | legacy JSON (snapshot partiel) | **legacy_only** ⚠️ |
| WALT | 2 | bulletin JSON via `scpiData` | **legacy_only** |
| WALB | 2 | bulletin JSON via `scpiData` | **legacy_only** |
| Nombre locataires | 2 | bulletin JSON via `scpiData` | **legacy_only** |
| Frais de gestion | 1 | legacy JSON | **legacy_only** |
| Délai jouissance | 2 | legacy JSON (snapshot Iroko = 1 mois) | **incohérent** ⚠️ |
| Taux net distribution | 1 | parsé texte `actualitesTrimestrielles` | **incohérent** ⚠️ |
| SFDR | 1 | legacy JSON | **legacy_only** |
| Profil de risque (SRRI) | 1 | legacy JSON | **legacy_only** |
| Distribution par part | 1 | legacy JSON (snapshot a `distribution_quarterly`) | **legacy_only** |
| Actualité trimestrielle | 1 | legacy JSON (bulletin texte) | **legacy_only** |
| Stratégie | 1 | hardcodé `scpiDataExtended` | **hardcoded** |
| Catégorie | 1 | hardcodé `scpiDataExtended` | **hardcoded** |
| Badge ISR | 2 | legacy JSON | **legacy_only** |
| Secteur (catégorie) | 4 | legacy JSON calculé | **legacy_only** |
| Géographie | 4 | legacy JSON calculé | **legacy_only** |
| Année création | 1 | legacy JSON | **legacy_only** |
| Minimum souscription | 2 | legacy JSON | **legacy_only** |
| Score qualité brut (nb/100) | 2 | Supabase `scpi_bulletins` | **supabase** ✅ |

---

## Lacunes et incohérences prioritaires

### 1. Supabase `scpi_indicators` — colonnes non alimentées
La table a 40+ colonnes utiles mais seules `td` et `td_annee` sont populées. Aucun feed de pipeline ne remplit les autres colonnes. L'architecture est prête mais le pipeline d'ingestion n'écrit pas ces champs.

**Action :** Alimenter depuis le snapshot les colonnes disponibles (tof, capitalisation, prix_souscription, etc.) pour les 5 pilotes.

### 2. Snapshot riche, sous-consommé dans les zones principales
Le snapshot contient TOF, capitalisation, prix, valeur reconstitution, décote pour 3–4 pilotes, mais ces valeurs ne remontent pas dans les **cartes métriques** de `ScpiDetailPage`, les colonnes de `ScpiTable`, ni `AnalysisDetailModal`. Seuls `ScpiPublicIndicators` et `ComparateurScpi` les lisent.

**Action :** Étendre `usePublishedTds` (ou créer un hook analogue) pour TOF, capitalisation, prix — utilisable dans les cartes métriques.

### 3. Délai de jouissance incohérent
`AnalysisDetailModal` affiche `scpi.delaiJouissance` (legacy JSON, souvent null ou approximate), alors que le snapshot a `enjoyment_delay: 1` pour Iroko Zen (source DIC officiel).

**Action :** Lire `getSnapshotIndicator(slug)?.enjoyment_delay` en priorité dans la modale.

### 4. Valeur de reconstitution incohérente
`AnalysisDetailModal` calcule la décote depuis `scpi.valeurReconstitution` (legacy), alors que le snapshot a des valeurs extraites des bulletins officiels (Iroko: 213.65€, Remake: 203.52€, TE: 207.02€).

**Action :** Lire `getIndicator(slug)?.reconstitution_value` en priorité.

### 5. Taux net distribution — parsing fragile
`getYieldDisplayInfo` parse le taux net directement dans `scpi.actualitesTrimestrielles` (texte libre) via regex. Aucune structure dédiée. Si le bulletin change de format, le taux net disparaît silencieusement.

**Action :** Ajouter un champ `distribution_rate_net` dans `ScpiIndicator` et le snapshot.

### 6. Répartitions (camemberts) — snapshot sous-utilisé
Le snapshot a `sector_breakdown` et `geography_breakdown` pour Remake Live et Transitions Europe, mais les camemberts de `ScpiDetailPage` lisent `scpi.repartitionSector` / `scpi.repartitionGeo` depuis le legacy JSON.

**Action :** Dans le composant Répartitions, préférer `getIndicator(slug)?.sector_breakdown` si disponible.

### 7. Remake Live absent de Supabase
Supabase `scpi_indicators` contient 4 enregistrements (activimmo, comete, iroko-zen, transitions-europe). Remake Live est absent — le hook `usePublishedTds` ne peut donc jamais upgrader la source de `snapshot` à `supabase` pour cette SCPI.

**Action :** Insérer la ligne Remake Live dans Supabase (td = 0.075, td_annee = 2024).

---

## Actions minimales recommandées (sans redesign, sans extraction)

| Priorité | Action | Fichier cible | Effort |
|---|---|---|---|
| 🔴 P1 | Insérer Remake Live dans Supabase `scpi_indicators` | SQL migration | < 5 min |
| 🔴 P1 | Alimenter Supabase avec données snapshot (tof, prix, capitalization, etc.) pour les 5 pilotes | SQL migration | 1h |
| 🟡 P2 | Lire `getIndicator(slug)?.reconstitution_value` dans `AnalysisDetailModal` décote | `AnalysisDetailModal.tsx` | 30 min |
| 🟡 P2 | Lire `getIndicator(slug)?.enjoyment_delay` en priorité dans `AnalysisDetailModal` | `AnalysisDetailModal.tsx` | 15 min |
| 🟡 P2 | Utiliser `sector_breakdown` / `geography_breakdown` snapshot dans les camemberts `ScpiDetailPage` | `ScpiDetailPage.tsx` | 1h |
| 🟢 P3 | Ajouter `distribution_rate_net` dans `ScpiIndicator` type + snapshot | `scpiIndicator.ts`, `scpiIndicators.generated.ts` | 2h |
| 🟢 P3 | Étendre le hook publishable à TOF/capitalisation/prix pour les cartes métriques | nouveau hook ou extension `usePublishedTds` | 2h |
