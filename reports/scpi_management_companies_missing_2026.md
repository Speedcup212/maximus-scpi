# Sociétés de gestion SCPI manquantes — MaximusSCPI

**Date :** Juin 2026
**Objectif :** Audit des sociétés de gestion SCPI présentes dans le référentiel interne mais sans page dédiée dans MaximusSCPI.

---

## 1. Résumé exécutif

| Indicateur | Valeur |
|---|---|
| Sociétés de gestion déjà configurées (pages existantes) | 47 |
| Sociétés de gestion cible (référentiel ASPIM 2025 ≈ 55) | ~55 |
| Sociétés manquantes réellement identifiées (référentiel interne) | 3 |
| Sociétés à vérifier ultérieurement | ~5-8 (hors périmètre actuel) |

**Source utilisée :** Confrontation entre `data-import/scpi_management_companies_master_2026.json` (68 entrées), `src/data/scpi_complet.json` (SCPI internes), et `src/data/managementCompanyArticlesConfig.ts` (47 pages configurées).

---

## 2. Sociétés déjà présentes (47 pages)

| # | Slug | Nom |
|---|---|---|
| 1 | `aew` | AEW |
| 2 | `aestiam` | Aestiam |
| 3 | `alderan` | Alderan |
| 4 | `allianz-immovalor` | Allianz Immovalor |
| 5 | `altixia-reim` | Altixia REIM |
| 6 | `amundi-immobilier` | Amundi Immobilier |
| 7 | `arkea-reim` | Arkéa REIM |
| 8 | `aroxys` | Aroxys |
| 9 | `atland-voisin` | Atland Voisin |
| 10 | `atream` | Atream |
| 11 | `axipit-real-estate-partners` | Axipit Real Estate Partners |
| 12 | `bagan-asset-management` | Bagan Asset Management |
| 13 | `balzac-reim` | Balzac REIM |
| 14 | `bnp-paribas-reim-france` | BNP Paribas REIM France |
| 15 | `clubfunding-am` | ClubFunding AM |
| 16 | `consultim-am` | Consultim AM |
| 17 | `corum-am` | Corum AM |
| 18 | `darwin-invest` | Darwin Invest |
| 19 | `elevation-capital-partners` | Elevation Capital Partners |
| 20 | `euryale-am` | Euryale AM |
| 21 | `fiducial-gerance` | Fiducial Gérance |
| 22 | `foncieres-et-territoires` | Foncières & Territoires |
| 23 | `greenman-arth` | Greenman Arth |
| 24 | `groupama-gan-reim` | Groupama Gan REIM |
| 25 | `hsbc-reim-france` | HSBC REIM France |
| 26 | `inter-gestion-reim` | Inter Gestion REIM |
| 27 | `iroko` | Iroko |
| 28 | `kyaneos-am` | Kyaneos AM |
| 29 | `la-francaise-rem` | La Française REM |
| 30 | `magellim-reim` | Magellim REIM |
| 31 | `mata-capital-im` | Mata Capital IM |
| 32 | `midi-2i` | MIDI 2i |
| 33 | `mnk-partners` | MNK Partners |
| 34 | `mysharecompany` | MyShareCompany |
| 35 | `norma-capital` | Norma Capital |
| 36 | `novaxia-investissement` | Novaxia Investissement |
| 37 | `ofi-invest-real-estate` | Ofi Invest Real Estate |
| 38 | `otoktone-3i` | Otoktone 3i |
| 39 | `paref-gestion` | Paref Gestion |
| 40 | `perial-asset-management` | Perial Asset Management |
| 41 | `praemia-reim` | Praemia REIM |
| 42 | `remake-am` | Remake AM |
| 43 | `sofidy` | Sofidy |
| 44 | `sogenial-immobilier` | Sogenial Immobilier |
| 45 | `swiss-life-asset-managers-france` | Swiss Life AM France |
| 46 | `telamon` | Telamon |
| 47 | `unofi-gestion-dactifs` | Unofi Gestion d'Actifs |
| 48 | `urban-premium` | Urban Premium |
| 49 | `wemo-reim` | Wemo REIM |

---

## 3. Sociétés manquantes identifiées (à ajouter)

Ces 3 sociétés sont présentes dans le référentiel interne (`scpi_complet.json`) avec des SCPI vérifiées (`confidence: verified`, `source_type: internal_data`). Des pages doivent être créées.

| # | Société | Slug proposé | SCPI associée | Statut |
|---|---|---|---|---|
| 1 | **Altarea Investment Managers** | `altarea-investment-managers` | Alta Convictions | ✅ verified (référentiel interne) |
| 2 | **Epsicap** | `epsicap` | Epsicap Nano | ✅ verified (référentiel interne) |
| 3 | **Theoreim** | `theoreim` | Log In | ✅ verified (référentiel interne) |

---

## 4. Notes de segmentation

### Variantes de noms traitées
| Variante | Slug retenu |
|---|---|
| BNP Paribas REIM / BNP Paribas REIM France | `bnp-paribas-reim-france` |
| Praemia REIM / Primonial REIM | `praemia-reim` |
| La Française REM / La Française Real Estate Managers | `la-francaise-rem` |
| Perial AM / Perial Asset Management | `perial-asset-management` |
| Swisss Life AM / Swiss Life Asset Managers France | `swiss-life-asset-managers-france` |
| Remake AM / Remake Asset Management | `remake-am` |
| Consultim AM / Consultim Asset Management | `consultim-am` |
| Kyaneos AM / Kyaneos Asset Management | `kyaneos-am` |

### Sociétés présentes dans `scpi_complet.json` sous forme de doublon de casse
- `SOFIDY` / `Sofidy` → déjà couvert par `sofidy`
- `Prémia REIM France` / `Praemia REIM France` → déjà couvert par `praemia-reim`

### Sociétés en `scpi_complet.json` mais déjà couvertes
- Toutes les sociétés de la liste "déjà présentes" ci-dessus sont couvertes.

---

## 5. Sociétés non ajoutées (hors périmètre / à vérifier)

Les sociétés suivantes ont été identifiées comme candidates potentielles mais ne sont pas ajoutées dans cette passe car :
- absentes du référentiel interne
- activité SCPI non confirmée
- nécessitent une vérification manuelle

| Société | Raison |
|---|---|
| Sociétés Batch 4-5 déjà configurées (Allianz Immovalor, Axipit, Darwin, etc.) | Pages existantes avec statut `no_internal_scpi_found` |
| Toute autre SGP AMF sans SCPI confirmée | Hors périmètre SCPI — ne pas ajouter |

---

## 6. Source utilisée

- `data-import/scpi_management_companies_master_2026.json` (68 entrées, juin 2026)
- `src/data/scpi_complet.json` (63 SCPI internes MaximusSCPI)
- `src/data/managementCompanyArticlesConfig.ts` (49 pages configurées)
- `src/data/articleTemplatesConfig.ts` (134+ templates)

---

## 7. Log des ajouts effectués

| Date | Société | Slug | Action |
|---|---|---|---|
| 2026-06-09 | Altarea Investment Managers | `altarea-investment-managers` | ✅ Ajoutée |
| 2026-06-09 | Epsicap | `epsicap` | ✅ Ajoutée |
| 2026-06-09 | Theoreim | `theoreim` | ✅ Ajoutée |
