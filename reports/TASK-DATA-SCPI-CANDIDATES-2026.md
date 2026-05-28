# TASK-DATA-SCPI-CANDIDATES-2026 — Rapport final

**Date :** 2026-05-28
**Mise à jour :** 2026-05-28 — NCap Education Santé reclassée (validation utilisateur)
**Branche :** `claude/issue-1-20260515-1418`
**Statut :** ✅ Complété — en attente de validation git

---

## Objectif

Cartographier les emplacements SCPI dans le projet, détecter les doublons, et préparer un fichier seed privé pour les SCPI candidates 2026 sans modifier le comparateur public.

---

## Cartographie des sources SCPI dans le projet

| Fichier | Rôle | Entrées |
|---|---|---|
| `src/data/scpi_complet.json` | Source primaire du comparateur — driver de `scpiData.ts` | 62 entrées (dont doublons) |
| `src/data/SCPI_complet_avec_SFDR_Profil.json` | Source legacy de secours (fallback si `scpi_complet.json` non array) | 51 entrées |
| `src/data/scpiDataExtended.ts` | Source étendue pour certains composants UI | ~30 SCPI nommées |
| `src/data/scpiIndicators.generated.ts` | Snapshot indicateurs officiels (pipeline d'extraction) | 6 entrées |
| `src/data/landingPagesData.ts` | Métadonnées SEO pages SCPI | Toutes les SCPI avec page statique |
| `scripts/bulletin_*.json` | Données brutes bulletins trimestriels extraits | 10 bulletins T3 2025 |

**Règle de priorité dans `scpiData.ts` :**
```js
const sourceData = Array.isArray(scpiCompletJson) ? scpiCompletJson : (scpiCompleteJson.Sheet1 || scpiCompleteJson);
```
→ `scpi_complet.json` est utilisé en priorité (car array). L'ancien fichier est ignoré.

---

## 1 — SCPI existantes absentes du comparateur

### Épargne Pierre Europe

| Paramètre | Valeur |
|---|---|
| `slug` | `epargne-pierre-europe` |
| `status_data` | `existing_scpi_missing_from_comparator` |
| `visibility` | `private` |
| `comparator_status` | `pending_integration` |
| `data_quality` | `pending_validation` |

**Présence dans le projet :**
- `scpi_complet.json` ✅ — données T3 2025 complètes (TD 5,5%, TOF 100%, cap 479 M€, 16 immeubles)
- `landingPagesData.ts` ✅ — page SEO configurée
- `scripts/bulletin_epargne_pierre_europe_t3_2025.json` ✅ — bulletin T3 2025 disponible
- `scpiDataExtended.ts` ❌
- `scpiIndicators.generated.ts` ❌

**Raison probable d'absence du comparateur :** Absence d'entrée dans `scpiIndicators.generated.ts` (pipeline d'extraction non exécuté) et/ou absence de page statique générée. À clarifier avant intégration.

**Action requise :** Valider les données T3 2025, puis ajouter une entrée dans `scpiIndicators.generated.ts`.

### NCap Education Santé *(reclassée — validation utilisateur 2026-05-28)*

| Paramètre | Valeur |
|---|---|
| `slug` | `ncap-education-sante` |
| `status_data` | `existing_scpi_missing_from_comparator` |
| `visibility` | `private` |
| `comparator_status` | `pending_integration` |
| `data_quality` | `pending_validation` |

**Présence dans le projet :**
- `scpi_complet.json` ✅ — données legacy (TD 4,85%, TOF 96,5%, cap 110 M€, 51 immeubles)
- `scpiDataExtended.ts` ✅
- `landingPagesData.ts` ✅ — page SEO configurée
- `scpiIndicators.generated.ts` ❌
- `scripts/bulletin_*.json` ❌ — aucun bulletin disponible

**Décision :** Confirmée existante par l'utilisateur. Ne pas créer de nouvelle entrée. Le slug `ncap-education-sante` est le slug canonique à utiliser. Aucune confusion avec "SCPI NCAP Éducation Santé" (même fonds, même société Norma Capital).

**Action requise :** Collecter un bulletin trimestriel récent, puis ajouter une entrée dans `scpiIndicators.generated.ts`.

---

## 2 — SCPI existantes — ne pas recréer

| SCPI | Slug | Présence |
|---|---|---|
| GMA Essentialis | `gma-essentialis` | `scpi_complet.json` + `scpiDataExtended.ts:1268` |
| LF Avenir Santé | `lf-avenir-sante` | `scpi_complet.json` + `scpiDataExtended.ts:1517` |
| Perial Hospitalité Europe | `perial-hospitalite-europe` | `scpi_complet.json` + `scpiDataExtended.ts:2222` |
| Grand Paris Résidentiel | `grand-paris-residentiel` | `scpi_complet.json` + `scpiDataExtended.ts:1304` |
| Foncière des Praticiens | `fonciere-des-praticiens` | `scpi_complet.json` + `scpiDataExtended.ts:1228` |

Aucune action sur ces 5 SCPI. Elles sont déjà intégrées dans les deux sources principales.

---

## 3 — SCPI candidates créées en brouillon privé

16 entrées créées dans `data-import/scpi_candidates_seed_2026.json` *(SCPI NCAP Éducation Santé retirée — reclassée en section 1)* :

| # | SCPI | Slug proposé | Conflit |
|---|---|---|---|
| 1 | SCPI NCAP Continent | `scpi-ncap-continent` | ✅ Aucun |
| 2 | Wemo One | `wemo-one` | ✅ Aucun |
| 3 | Iroko Atlas | `iroko-atlas` | ✅ Aucun (distinct d'Iroko Zen) |
| 4 | SCPI Remake UK 2025 | `scpi-remake-uk-2025` | ✅ Aucun (distinct de Remake Live) |
| 5 | SCPI Momentime | `scpi-momentime` | ✅ Aucun |
| 6 | SCPI Mistral Sélection | `scpi-mistral-selection` | ✅ Aucun |
| 7 | SCPI Cœur Avenir | `scpi-coeur-avenir` | ✅ Aucun (distinct de Coeur d'Europe/Région/ville) |
| 8 | SCPI EDR Europa | `scpi-edr-europa` | ✅ Aucun |
| 9 | SCPI Osmo Énergie | `scpi-osmo-energie` | ✅ Aucun |
| 10 | SCPI Eden | `scpi-eden` | ✅ Aucun |
| 11 | SCPI LinaClub | `scpi-linaclub` | ✅ Aucun |
| 12 | Epsicap Nano | `epsicap-nano` | ✅ Aucun |
| 13 | SCPI Eliays | `scpi-eliays` | ✅ Aucun |
| 14 | SCPI Eurova | `scpi-eurova` | ✅ Aucun |
| 15 | SCPI Alt Convictions | `scpi-alt-convictions` | ✅ Aucun |
| 16 | Kyaneos Denormandie 4 | `kyaneos-denormandie-4` | ✅ Aucun (distinct de Kyaneos Pierre) |

---

## 4 — SCPI à vérifier manuellement

*Aucune — le seul conflit identifié (NCap Education Santé) a été résolu par validation utilisateur (section 1).*

---

## 5 — Fichier créé

```
data-import/scpi_candidates_seed_2026.json
```

Structure du seed :
- `_meta` : métadonnées, date, task, avertissement d'usage
- `existing_scpi_missing_from_comparator` : [Épargne Pierre Europe]
- `existing_scpi_do_not_recreate` : [5 SCPI déjà intégrées]
- `candidates_new_scpi` : [17 nouvelles candidates]

---

## 6 — Fichiers modifiés

| Fichier | Nature |
|---|---|
| `data-import/scpi_candidates_seed_2026.json` | **Créé** — seed privé |
| `reports/TASK-DATA-SCPI-CANDIDATES-2026.md` | **Créé** — ce rapport |

**Non modifiés :**
- `src/data/scpi_complet.json` ✅
- `src/data/scpiIndicators.generated.ts` ✅
- `src/data/scpiDataExtended.ts` ✅
- Aucun composant UI ✅
- Aucune page publique ✅

---

## 7 — Notes techniques

### Slugification
La dérivation de slug applique :
1. Remplacement des ligatures (`œ` → `oe`, `æ` → `ae`) **avant** NFD
2. `toLowerCase()`
3. `NFD + strip combining chars` (diacritiques)
4. `[^a-z0-9]+ → -`
5. Trim `-`

Le cas "SCPI Cœur Avenir" → `scpi-coeur-avenir` est traité correctement (sans le bug `c-ur` que produit NFD seul sur `œ`).

### Doublons dans scpi_complet.json
Le fichier source contient des doublons (NCap Régions × 3, Log In × 3, Iroko Zen × 2, etc.) traités par `mergeScpiEntries()` dans `scpiData.ts`. Ces doublons ne créent pas de problème dans la comparaison anti-doublon effectuée pour ce seed.

---

## Contraintes respectées

- ✅ Aucune modification du comparateur public
- ✅ Aucune donnée publiée en production
- ✅ Toutes les entrées du seed : `visibility = "private"`
- ✅ Anti-doublon vérifié sur scpi_complet.json + SCPI_complet_avec_SFDR_Profil.json
- ✅ Conflit NCAP Éducation Santé documenté et signalé
- ✅ Pas de git push
