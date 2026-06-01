# Rapport de rapprochement — 71 dossiers MaximusSCPI 2026

**Date :** 1er juin 2026  
**Version :** 1.0  
**Agent :** 03 — Data SCPI  
**Sources :** `master_scpi_71_dossiers_maximusscpi_2026_v4.json` × `extraction_47_scpi_enriched.json`

---

## 1. Résolution de l'écart 47 → 46

**Question posée :** Pourquoi l'objectif indiquait 47 dossiers à traiter mais seulement 46 SCPI ont été extraites ?

**Réponse :**

La liste `to_extract` du fichier maître contient **47 entrées**, dont :
- **46** avec statut `to_extract_47` → 46 SCPI classiques, toutes extraites
- **1** avec statut `non_scpi_to_check` → **Kyaneos Denormandie 4**

**Kyaneos Denormandie 4** est un produit d'investissement immobilier fiscal (dispositif **Denormandie**), géré par Kyaneos AM. Il n'est **pas une SCPI** au sens de l'agrément AMF. Il a donc été exclu de l'extraction SCPI.

> **Conclusion : l'écart 47 → 46 est justifié. Il n'y a aucune SCPI oubliée.**  
> 46 SCPI réelles ont été traitées. 46/46 ont été extraites (dont 1 partiellement — Remake UK 2025).

---

## 2. Bilan global des 71 dossiers

| Catégorie | Nb | Description |
|---|---|---|
| **Extracted complet T1 2026** | **45** | BT T1 2026 lu et extrait — ≥35 indicateurs |
| **Extracted partiel T1 2026** | **1** | Remake UK 2025 — BT axé marché UK, prix non extrait |
| **Processed V3** | **18** | Traitées dans la version V3 du projet — données non ré-extraites T1 2026 |
| **Already in system** | **6** | Déjà présentes dans MaximusSCPI — pas de recréation |
| **Non-SCPI (exclu)** | **1** | Kyaneos Denormandie 4 — produit Denormandie, pas une SCPI |
| **TOTAL** | **71** | |

---

## 3. Tableau de rapprochement complet — 71 dossiers

### Groupe 1 : Extraites T1 2026 (46 SCPI)

| # | Dossier source | SCPI canonique | Société de gestion | Lot | Statut extraction | CS | Alerte |
|---|---|---|---|---|---|---|---|
| 1 | Iroko Atlas | Iroko Atlas | Iroko | 1 | extracted_complete | 0.88 | — |
| 2 | Iroko Zen | Iroko Zen | Iroko | 1 | extracted_complete | 0.90 | — |
| 3 | SCPI Comète | Comète | Alderan | 1 | extracted_complete | 0.88 | — |
| 4 | SCPI Activimmo | Activimmo | Alderan | 1 | extracted_complete | 0.90 | — |
| 5 | SCPI NCAP Continent | NCap Continent | Norma Capital | 1 | extracted_complete | 0.90 | — |
| 6 | Urban Cœur Commerce | Urban Cœur Commerce | Urban Premium | 1 | extracted_complete | 0.93 | — |
| 7 | SCPI Aestiam Agora | Aestiam Agora | Aestiam | 1 | extracted_complete | 0.93 | — |
| 8 | SCPI Aestiam Horizon | Aestiam Horizon | Aestiam | 1 | extracted_complete | 0.88 | — |
| 9 | SCPI Efimmo 1 | Efimmo 1 | Sofidy | 1 | extracted_complete | 0.92 | TOF 86 % |
| 10 | SCPI Pierval Santé | Pierval Santé | Euryale AM | 1 | extracted_complete (chemin corrigé) | 0.93 | — |
| 11 | SCPI Sofiprime | Sofiprime | Sofidy | 2 | extracted_complete | 0.90 | TOF 79 % / TD 0,54 % |
| 12 | SCPI Immorente | Immorente | Sofidy | 2 | extracted_complete | 0.93 | — |
| 13 | SCPI Épargne Pierre | Épargne Pierre | Atland Voisin | 2 | extracted_complete | 0.93 | — |
| 14 | SCPI Épargne Foncière | Épargne Foncière | La Française REM | 2 | extracted_complete | 0.90 | TRI 5 ans -0,80 % |
| 15 | SCPI Cœur Europe | Cœur Europe | Sogenial Immobilier | 2 | extracted_complete (chemin corrigé) | 0.92 | — |
| 16 | SCPI Cœur de Ville | Cœur de Ville | Sogenial Immobilier | 2 | extracted_complete (chemin corrigé) | 0.92 | — |
| 17 | SCPI Log In | Log In | Theoreim | 2 | extracted_complete | 0.93 | — |
| 18 | SCPI Optimale | Optimale | Consultim AM | 2 | extracted_complete (BT fourni manuellement) | 0.95 | Capi +21 % 1 an |
| 19 | SCPI Cristal Life | Cristal Life | Inter Gestion REIM | 2 | extracted_complete | 0.93 | — |
| 20 | SCPI Cristal Rente | Cristal Rente | Inter Gestion REIM | 3 | extracted_complete | 0.92 | — |
| 21 | Paref Evo | Paref Evo | Paref Gestion | 3 | extracted_complete | 0.92 | — |
| 22 | NCap Régions | NCap Régions | Norma Capital | 3 | extracted_complete (chemin corrigé) | 0.92 | — |
| 23 | SCPI Remake Live | Remake Live | Remake AM | 3 | extracted_complete | 0.93 | — |
| 24 | SCPI Remake UK 2025 | Remake UK 2025 | Remake AM | 3 | **extracted_partial** | 0.75 | Durée limitée / risque change |
| 25 | SCPI Alta Convictions | Alta Convictions | Altarea IM | 3 | extracted_complete | 0.92 | — |
| 26 | SCPI Wemo One | Wemo One | Wemo REIM | 3 | extracted_complete | 0.88 | TD élevé lié jeunesse SCPI |
| 27 | SCPI Kyaneos | Kyaneos Pierre | Kyaneos AM | 3 | extracted_complete | 0.90 | — |
| 28 | Epsicap Nano | Epsicap Nano | Epsicap | 3 | extracted_complete | 0.92 | — |
| 29 | SCPI Primovie | Primovie | Praemia REIM France | 4 | extracted_complete | 0.95 | PGA -7,31 % / Retraits |
| 30 | SCPI Praemia | Patrimmo Commerce | Praemia REIM France | 4 | extracted_complete (dossier Praemia→Patrimmo Commerce) | 0.95 | PGA -5,71 % / Retraits |
| 31 | SCPI Patrimmo Croissance Impact | Patrimmo Croissance Impact | Praemia REIM France | 4 | extracted_complete | 0.95 | PGA -7,68 % / Pas de distribution |
| 32 | SCPI Rivoli Avenir Patrimoine | Rivoli Avenir Patrimoine | Amundi Immobilier | 4 | extracted_complete (BS S2 2025) | 0.90 | Distribution en baisse |
| 33 | PERIAL O2 | PERIAL O2 | PERIAL AM | 4 | extracted_complete | 0.95 | Variabilité suspendue |
| 34 | SCPI PERIAL Grand Paris | PERIAL Grand Paris | PERIAL AM | 4 | extracted_complete | 0.95 | Variabilité suspendue |
| 35 | SCPI Opportunités Europe | PERIAL Opportunités Europe | PERIAL AM | 4 | extracted_complete (chemin corrigé) | 0.95 | Split ×20 01/01/2026 |
| 36 | SCPI Praemia Hôtels Europe | Praemia Hôtels Europe | Praemia REIM France | 4 | extracted_complete | 0.95 | Pivot hôtellerie ex-Primofamily |
| 37 | SCPI Atream Hôtels | Atream Hôtels | Atream | 4 | extracted_complete | 0.97 | — |
| 38 | SCPI HEXA | PAREF Hexa | PAREF Gestion | 5 | extracted_complete | 0.95 | PGA -12,10 % |
| 39 | SCPI Novapierre 1 | Novapierre 1 | PAREF Gestion | 5 | extracted_complete | 0.95 | — |
| 40 | SCPI LF Opportunité Immo | LF Opportunité Immo | La Française REM | 5 | extracted_complete (chemin corrigé) | 0.95 | — |
| 41 | LF Grand Paris Patrimoine | LF Grand Paris Patrimoine | La Française REM | 5 | extracted_complete | 0.95 | Marché suspendu |
| 42 | SCPI Europimmo | LF Europimmo | La Française REM | 5 | extracted_complete | 0.95 | Prix -23,28 % en 2025 |
| 43 | SCPI Novaxia | Novaxia Néo | Novaxia Investissement | 5 | extracted_complete | 0.92 | — |
| 44 | SCPI Ficommerce Proximité | Ficommerce Proximité | Fiducial Gérance | 5 | extracted_complete (chemin corrigé) | 0.95 | Division nominale ×3 |
| 45 | SCPI Selectipierre 2 Paris | Selectipierre 2 Paris | Fiducial Gérance | 5 | extracted_complete | 0.97 | — |
| 46 | SCPI Altixia Cadence XII | Altixia Cadence XII | Altixia REIM | 5 | extracted_complete | 0.93 | — |

---

### Groupe 2 : Traitées dans V3 — données non ré-extraites T1 2026 (18 SCPI)

| # | Dossier source | SCPI canonique | Société de gestion | Note |
|---|---|---|---|---|
| 47 | SCPI Momentime | Momentime | Theoreim | Données V3 à mettre à jour si BT T1 2026 disponible |
| 48 | SCPI Mistral Sélection | Mistral Sélection | Fiducial Gérance | Données V3 |
| 49 | SCPI Cœur Avenir | Cœur Avenir | Sogenial Immobilier | Données V3 |
| 50 | SCPI EDR Europa | EDR Europa | Edmond de Rothschild REIM | Données V3 |
| 51 | SCPI Osmo Énergie | Osmo Énergie | Mata Capital | Données V3 |
| 52 | SCPI Eden | Eden | Alderan | Données V3 |
| 53 | SCPI LinaClub | LinaClub | Inter Gestion REIM | Données V3 |
| 54 | SCPI Transitions Europe | Transitions Europe | Arkéa REIM | Données V3 |
| 55 | SCPI Elialys | Elialys | Elixis AM | Données V3 |
| 56 | SCPI Eurovalys | Eurovalys | Advenis REIM | Données V3 |
| 57 | Épargne Pierre Europe | Épargne Pierre Europe | Atland Voisin | Données V3 |
| 58 | SCPI NCAP Éducation Santé | NCap Éducation Santé | Norma Capital | Données V3 |
| 59 | SCPI Sélectinvest 1 | Sélectinvest 1 | Fiducial Gérance | Données V3 |
| 60 | SCPI Primopierre | Primopierre | Praemia REIM France | Données V3 |
| 61 | SCPI Edissimmo | Edissimmo | Amundi Immobilier | Données V3 |
| 62 | SCPI Cœur de Régions | Cœur de Régions | Sogenial Immobilier | Données V3 |
| 63 | SCPI Buroboutic | Buroboutic | Theoreim | Données V3 |
| 64 | SCPI Altixia Commerces | Altixia Commerces | Altixia REIM | Données V3 |

> **Note :** Les 18 SCPI V3 ont été traitées dans une version antérieure du projet (V3). Leurs données ne sont pas incluses dans `extraction_47_scpi_enriched.json`. Si une mise à jour T1 2026 est souhaitée, il faudra un lot d'extraction dédié.

---

### Groupe 3 : Déjà présentes dans MaximusSCPI (6 dossiers)

| # | Dossier source | Nom canonique | Société de gestion | Note |
|---|---|---|---|---|
| 65 | SCPI Foncière des Praticiens | Foncière des Praticiens | Fiducial Gérance | Fiche existante — pas de recréation |
| 66 | SCPI GMA Essentialis | GMA Essentialis | GMA REIM | Fiche existante |
| 67 | SCPI LF Avenir Santé | LF Avenir Santé | La Française REM | Fiche existante (hub validé partiel en TASK-DATA-003) |
| 68 | Grand Paris Résidentiel | Grand Paris Résidentiel | Foncière Magellan | Fiche existante |
| 69 | SCPI PERIAL Hospitalité Europe | PERIAL Hospitalité Europe | PERIAL AM | Fiche existante |
| 70 | Crédit Mutuel Pierre 1 | Crédit Mutuel Pierre 1 | La Française REM | Fiche existante |

---

### Groupe 4 : Non-SCPI exclu (1 dossier)

| # | Dossier source | Nature | Société | Motif exclusion |
|---|---|---|---|---|
| 71 | Kyaneos Denormandie 4 | Produit fiscal Denormandie | Kyaneos AM | Pas une SCPI — dispositif de défiscalisation Denormandie. Exclu de l'extraction SCPI. Peut faire l'objet d'un traitement séparé si MaximusSCPI couvre les produits Denormandie. |

---

## 4. Problèmes techniques résolus

| Problème | Dossiers concernés | Solution |
|---|---|---|
| Encodage de chemin (accents Windows) | Pierval Santé, Cœur Europe, Cœur de Ville, NCap Régions, PERIAL Opportunités Europe, LF Opportunité Immo, Ficommerce Proximité | Copie vers chemin temporaire sans accent |
| Bulletin manquant lors de l'extraction initiale | Optimale | BT fourni manuellement le 01/06/2026 |
| Seul BS S2 2025 disponible (pas de BT T1 2026) | Rivoli Avenir Patrimoine | Extraction depuis BS S2 2025 — mentionné explicitement |
| Fichiers génériquement nommés | Remake Live, Remake UK 2025, Altixia Cadence XII | Identification manuelle |
| Dossier nommé différemment du nom de la SCPI | SCPI Praemia → Patrimmo Commerce | Correspondance établie manuellement |
| BT partiel (prix non extrait) | Remake UK 2025 | Statut `extracted_partial` — confidence 0.75 |

---

## 5. Prochaines actions recommandées

| Priorité | Action | Périmètre |
|---|---|---|
| P1 | Lancer un lot d'extraction V3→T1 2026 pour les 18 SCPI `processed_v3` | 18 SCPI |
| P1 | Compléter les données Remake UK 2025 (prix de souscription) depuis le DIC | 1 SCPI |
| P2 | Statuer sur Kyaneos Denormandie 4 : inclure dans un périmètre Denormandie séparé ou exclure définitivement | 1 produit |
| P2 | Mettre à jour les 6 fiches `already_in_system` avec les données T1 2026 | 6 SCPI |
| P3 | Validation Agent 04 (CIF/AMF) avant toute publication site | Toutes |
| P4 | Intégration Supabase (nécessite validation explicite) | Après P3 |

---

*Rapport généré par Agent 03 — Data SCPI — MaximusSCPI — 01/06/2026*
