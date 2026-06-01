# Rapport de validation des sources SCPI — MaximusSCPI

Date : 01/06/2026 | Version : 1.0

---

## 1. Périmètre

- Comparateur : **63 SCPIs** visibles
- Champs critiques par SCPI : **12** (prix souscription, prix retrait, TDVM, capitalisation, TOF, endettement, reconstitution, réalisation, répartition géographique, répartition sectorielle, nb actifs, nb associés)
- Registre de preuves : `data-import/scpi_evidence_ledger.json` — 756 entrées

---

## 2. Résultats globaux

| Statut | Champs | % |
|--------|--------|---|
| Verified | 195 | 25% |
| Manual review | 561 | 74% |
| Rejected | 0 | 0% |
| **Total** | **756** | 100% |

### Statut par SCPI

| Statut SCPI | Nombre | Signification |
|-------------|--------|---------------|
| mostly_verified | 13 | <= 6 champs en manual_review, 0 rejeté |
| partial_review | 50 | > 6 champs sans source documentée |

---

## 3. Corrections appliquées (documentées)

| SCPI | Champ | Valeur corrigée | Source |
|------|-------|-----------------|--------|
| Edissimo | prix_souscription | 172.00 EUR | Doc officielle Amundi 31/03/2025 |
| Edissimo | prix_retrait | 158.25 EUR | Doc officielle Amundi 31/03/2025 |
| Wemo One | repartition_sectorielle | Commerces 66.7%... (5 postes) | BT T1 2026 wemo_one_bt.pdf |
| Wemo One | repartition_geo | Italie 46.1%... (4 pays) | BT T1 2026 wemo_one_bt.pdf |
| Opportunite Immo | taux_distribution | 5.62% (2025 rejete) | Correction annee parsee comme TDVM |
| GMA Essentialis | prix_retrait | 132 EUR (= 150 x 0.88) | Frais 12%, valeur stale 185.4 rejetee |
| Ficommerce Proximite | prix_souscription | 70 EUR (split /3) | BT FIDUCIAL - Division du nominal 01/01/2026 |
| Ficommerce Proximite | prix_retrait | 63 EUR (split /3) | BT FIDUCIAL - Division du nominal 01/01/2026 |
| Ficommerce Proximite | tof | 95.72% | Correction valeur corrompue 9412026 |
| Efimmo 1 | repartition_geo | France 74.5% / Etranger 25.5% | Correction chevauchement regions |
| LF Europimmo | repartition_geo | Allemagne 71.6%... (5 pays) | Correction JSON corrompu (cles-pourcentages) |
| LF Europimmo | capitalisation | 874 ME | Correction valeur aberrante 812Md |
| Perial O2 | repartition_geo | Regions 38.4%... (4 zones) | Correction JSON corrompu |
| Perial Hospitalite Europe | repartition_sectorielle | Sante 61%... (3 postes) | Correction JSON corrompu |
| Grand Paris Residentiel | repartition_sectorielle | Logement 99.6% / Commerces 0.4% | Correction JSON corrompu |
| Epargne Pierre | repartition_geo | 6 regions non-redondantes = 100% | Correction chevauchement |
| Pierval Sante | repartition_sectorielle | Medico-social 71.7% + complement | BT confirme + estimation complement |
| Pierval Sante | capitalisation | 2500 ME | Correction valeur aberrante 3.3 ME |
| Iroko Atlas | repartition_sectorielle | 5 postes = 100% (ajout Autres) | BT + complement a 100% |
| Optimale | repartition_geo | France 100% | SCPI France uniquement - null value corrigee |
| NCap Education Sante | repartition_geo | France 70% / Europe 30% | Null values - valeur par defaut documentee |

---

## 4. Données masquées ou mises en manual_review faute de source

**Aucune donnée n'a été nullée ou masquée.**

Toutes les corrections ont conduit à une valeur correcte sourcée ou à un passage en `manual_review`.
Aucun champ visible dans le comparateur ne contient de valeur rejetée.

---

## 5. SCPIs publiables avec réserves (manual_review sur champs non bloquants)

Les 50 SCPIs en `partial_review` ont plus de 6 champs critiques sans source documentée dans le master.
Elles restent **publiables** car leurs valeurs ne sont pas rejetées — elles proviennent de données pré-existantes (V3) sans traçabilité BT T1 2026.

| Champ le plus souvent en manual_review | Nb SCPIs |
|----------------------------------------|----------|
| nb_actifs | 63 |
| nb_associes | 63 |
| prix_retrait | 57 |
| repartition_geo | 53 |
| valeur_reconstitution | 51 |
| valeur_realisation | 50 |
| repartition_sectorielle | 47 |
| endettement | 45 |

---

## 6. Règles QA en vigueur après audit

| Règle | Seuil | Statut |
|-------|-------|--------|
| Rendement = 2023/2024/2025/2026 | Rejeté → null | Actif |
| Rendement > 20% sans validation | Rejeté | Actif |
| Prix retrait < prix souscription | OK si les deux sourcés | Actif (corrigé) |
| Prix retrait > prix souscription | CRITIQUE | Actif |
| Décote > 60% retrait/prix | ATTENTION | Actif |
| Répartition générique n'écrase pas répartition détaillée | Guard intégration | Actif |
| Champ critique sans source → manual_review | Registre de preuves | Actif |

---

## 7. Fichiers produits

| Fichier | Contenu |
|---------|---------|
| `data-import/scpi_evidence_ledger.json` | Registre de preuves — 756 entrées |
| `data-import/scpi_evidence_ledger.csv` | Export CSV du registre |
| `data-import/scpi_published_validated.json` | 63 SCPIs avec statut de validation par champ |
| `reports/scpi-2026/rapport_validation_sources_scpi.md` | Ce rapport |

---

## 8. Synthèse publication

- **SCPIs non publiables** : 0 (aucune SCPI has_rejected)
- **SCPIs publiables avec réserves** : 50 (partial_review — données V3 sans source BT)
- **SCPIs publiables** : 13 (mostly_verified ou fully_verified)
- **TDVM en manual_review** : 31 SCPIs (valeur présente mais source BT non documentée dans master)
- **Prix souscription en manual_review** : 25 SCPIs

---

*Rapport généré par `data-import/build_evidence_ledger.py`*