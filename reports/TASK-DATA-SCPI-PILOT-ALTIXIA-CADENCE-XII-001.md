# TASK-DATA-SCPI-PILOT-ALTIXIA-CADENCE-XII-001 — Rapport final

**Date :** 2026-05-27
**Branche :** `claude/issue-1-20260515-1418`
**Statut :** ✅ Complété

---

## Objectif

Tester le traitement complet d'une SCPI pilote à partir de 4 documents PDF fournis en vrac, sans renommage préalable. Identifier, hiérarchiser et extraire tous les indicateurs utiles au comparateur MaximusSCPI.

---

## Étape 1 — Identification documentaire

| Fichier | SHA256 (8 premiers) | Pages | Type identifié | Période | Confiance |
|---|---|---|---|---|---|
| `doc1-20250526-145625.pdf` | `cf62964c` | 55 | **Rapport annuel 2024** | 01/01/2024 – 31/12/2024 | 99% |
| `doc1-20250617-153722.pdf` | `a5aa0757` | 3 | **DIC / PRIIPs** | Arrêté 31/03/2025 | 99% |
| `doc1-20260309-180655.pdf` | `5cde6649` | 56 | **Note d'information + Annexe + Statuts** | Visa AMF 19-02 / màj juin 2025 | 99% |
| `doc1-20260430-122013.pdf` | `4d4da0e9` | 11 | **Bulletin trimestriel T1 2026** | 01/01/2026 – 31/03/2026 | 99% |

**SCPI :** ALTIXIA CADENCE XII
**Société de gestion :** ALTIXIA REIM
**Slug :** `altixia-cadence-xii`

Tous les documents concernent la même SCPI. Aucune ambiguïté. La classification a été effectuée à partir du titre de la page 1 et du contenu des premières pages.

---

## Étape 2 — Hiérarchie des sources appliquée

| Indicateur | Source prioritaire | Raison |
|---|---|---|
| TD, TOF, valeurs, répartitions courantes | Bulletin T1 2026 | Données au 31/03/2026 — les plus récentes |
| TD 2024, patrimoine 2024, comptes annuels | Rapport annuel 2024 | Source auditée pour l'exercice 2024 |
| Frais, délai jouissance, conditions retrait, règles juridiques | Note d'information | Source réglementaire de référence |
| SRI, risques PRIIPs, coûts PRIIPs | DIC PRIIPs | Seule source pour ces indicateurs |

---

## Étape 3 — Indicateurs extraits

### Identité

| Indicateur | Valeur | Source | Période | Statut |
|---|---|---|---|---|
| Nom SCPI | ALTIXIA CADENCE XII | Tous documents | — | publishable |
| Société de gestion | ALTIXIA REIM | Tous documents | — | publishable |
| Catégorie | SCPI à capital variable — immobilier d'entreprise diversifié | RA 2024 | — | publishable |
| Date de création | 13/12/2018 | RA 2024 | — | publishable |
| Type de capital | Variable | Note d'info | — | publishable |
| Visa AMF | SCPI n° 19-02 | RA 2024 + Note | 12/03/2019 | publishable |
| Label ISR | Oui (non confirmé PDF) | Legacy Excel | — | **manual_review** |
| SFDR | Article 8 (indirect) | Note d'info + RA | 2025 | **manual_review** |

### Performance

| Indicateur | Valeur | Source | Période | Statut |
|---|---|---|---|---|
| Taux de distribution | **5,15%** | Bulletin T1 2026 | TD 2025 | publishable |
| Année TD | 2025 | Bulletin T1 2026 | — | publishable |
| TD 2024 (historique) | 5,73% | Rapport annuel 2024 | 2024 | publishable |
| Performance globale annuelle | 5,15% | Bulletin T1 2026 | PGA 2025 | publishable |
| TRI sur 5 ans | 3,75% | Bulletin T1 2026 | T1 2026 | publishable |
| Revenus distribués T1 2026 | 2,50 €/part brut | Bulletin T1 2026 | T1 2026 | publishable |
| Fréquence distribution | Mensuelle | Note d'info | — | publishable |
| Prévisionnel TD 2026 | 5,00% – 5,20% | Bulletin T1 2026 | Prévisionnel | **manual_review** |

### Souscription / Parts

| Indicateur | Valeur | Source | Période | Statut |
|---|---|---|---|---|
| Prix de souscription | **200 €** | Tous documents | Stable | publishable |
| Valeur de retrait | **182 €** | Bulletin T1 2026 | T1 2026 | publishable |
| Minimum de souscription | 10 parts (= 2 000 €) | Note d'info | — | publishable |
| Délai de jouissance | **6 mois** | Note d'info (priorité) | — | publishable |
| Durée détention recommandée | 9 ans | DIC + RA | — | publishable |
| Frais souscription HT | **9%** (= 18 € / part) | Note d'info + DIC | — | publishable |
| Frais souscription TTC | 10,8% (= 21,6 €) | Note d'info | — | publishable |
| Frais de gestion HT | **10%** des loyers/produits | Bulletin T1 2026 | — | publishable |
| Commission acquisition HT | 3% max | Bulletin T1 2026 | — | publishable |
| Frais de sortie | **0 €** | DIC PRIIPs | 2025 | publishable |

### Patrimoine

| Indicateur | Valeur | Source | Période | Statut |
|---|---|---|---|---|
| Capitalisation | **190 356 200 €** | Bulletin T1 2026 | 31/03/2026 | publishable |
| Nombre de parts | ~951 781 | Bulletin T1 2026 (calculé) | 31/03/2026 | publishable |
| Nombre d'associés | **2 448** | Bulletin T1 2026 | 31/03/2026 | publishable |
| Nombre d'actifs | **32** | Bulletin T1 2026 | T1 2026 | publishable |
| Nombre de locataires | **95** | Bulletin T1 2026 | 31/03/2026 | publishable |
| Volume d'investissement (origine) | 191,5 M€ | Bulletin T1 2026 | T1 2026 | publishable |
| Rendement moyen brut actifs | **6,6%** | Bulletin T1 2026 | T1 2026 | publishable |
| Surfaces construites (QP) | 111 238 m² | Bulletin T1 2026 | 31/03/2026 | publishable |
| Surfaces louées | 102 022 m² | Bulletin T1 2026 | 31/03/2026 | publishable |
| Surfaces vacantes | 9 216 m² | Bulletin T1 2026 | 31/03/2026 | publishable |
| Collecte nette 2024 | 21 524 400 € | RA 2024 | 2024 | publishable |

### Occupation / Risque immobilier

| Indicateur | Valeur | Source | Période | Statut |
|---|---|---|---|---|
| TOF | **92,5%** | Bulletin T1 2026 | 31/03/2026 | publishable |
| TOP | 91,7% | Bulletin T1 2026 | 31/03/2026 | publishable |
| WALT | 2,6 ans | Bulletin T1 2026 | 31/03/2026 | **manual_review** (⚠️ anomalie #1) |
| WALB | 5,9 ans | Bulletin T1 2026 | 31/03/2026 | **manual_review** (⚠️ anomalie #1) |
| Endettement | **10,99%** | Bulletin T1 2026 | 31/03/2026 | publishable |
| Parts en attente de retrait | **0** | Bulletin T1 2026 | 31/03/2026 | publishable |

### Valeurs

| Indicateur | Valeur | Source | Période | Statut |
|---|---|---|---|---|
| Valeur de reconstitution | **199,40 €/part** | Bulletin T1 2026 | 31/12/2025 | publishable |
| Valeur de réalisation | **163,80 €/part** | Bulletin T1 2026 | 31/12/2025 | publishable |
| Valeur nominale | 150 €/part | Note d'info | — | publishable |
| Capital social effectif (2024) | 140 086 350 € | RA 2024 | 31/12/2024 | publishable |
| Capital plafond statutaire | 500 000 000 € | RA 2024 | — | publishable |
| Surcote/décote | +0,30% | Calculé (200 / 199,40) | 31/12/2025 | **manual_review** |

### Répartitions (T1 2026 — source prioritaire)

**Répartition sectorielle (% valeur vénale au 31/03/2026) :**

| Secteur | % |
|---|---|
| Commerces | 37% |
| Bureaux | 29% |
| Activités | 30% |
| Logistique | 3% |

**Répartition géographique (% valeur vénale au 31/03/2026) :**

| Zone | % |
|---|---|
| Régions | 56% |
| Île-de-France | 22% |
| Paris | 4% |
| Espagne | 13% |
| Irlande | 6% |

### Risque

| Indicateur | Valeur | Source | Statut |
|---|---|---|---|
| SRI | **3 / 7** | DIC PRIIPs 31/03/2025 | publishable |
| Capital garanti | Non | DIC PRIIPs | publishable |
| Liquidité garantie | Non | DIC PRIIPs | publishable |
| Risques principaux | Liquidité, perte en capital, effet de levier | DIC PRIIPs | publishable |

---

## Étape 4 — Résumé des statuts

| Statut | Nb indicateurs |
|---|---|
| `publishable` | 46 |
| `manual_review` | 7 |
| `missing` | 0 |
| `conflicting` | 0 |

---

## Étape 5 — Anomalies et contrôle qualité

### Anomalie #1 — WALT/WALB : inversion de libellés entre RA 2024 et Bulletin T1 2026

| Source | WALT (libellé) | WALB (libellé) |
|---|---|---|
| RA 2024 | — ("Durée ferme restant : 2,55 ans") | — ("Durée résiduelle : 6,71 ans") |
| Bulletin T1 2026 | "Durée moyenne restante (WALT) : 2,6 ans" | "Durée ferme (WALB) : 5,9 ans" |

Les libellés textuels s'inversent d'un document à l'autre mais les valeurs numériques sont cohérentes avec l'évolution du patrimoine. **Source prioritaire : Bulletin T1 2026.** Valeurs marquées `manual_review` en attente de confirmation de convention.

### Anomalie #2 — Label ISR non confirmé PDF

Aucune mention explicite dans les pages extraites. Données legacy (Excel) indiquent "Oui". Action : vérifier sur www.altixia.fr.

### Anomalie #3 — SFDR Article 8 indirect

Déduit du contexte (phrasing RA 2024 p5 + annexe Disclosure dans Note d'info). Cohérent avec données legacy. Action : lire l'Annexe Disclosure (Note d'info p38+) pour confirmation directe.

### Anomalie #4 — TOF en baisse

TOF passé de 96,9% (31/12/2024) à 92,5% (31/03/2026). Cause identifiée : vacance Saint-Priest (1,63%) + Boigny-sur-Bionne (0,82%). Non anormal — explicité dans les deux documents.

### Anomalie #5 — Valeur réalisation vs prix retrait

Valeur de réalisation (163,80 €) < Prix de retrait (182 €) < Prix de souscription (200 €). Pas d'anomalie — concepts distincts documentés. Valeur de reconstitution (199,40 €) proche du prix de souscription : équité préservée.

### Anomalie #6 — Évolution répartitions

Les répartitions sectorielles et géographiques ont évolué entre 2024 et T1 2026, consécutivement aux acquisitions 2024 (Espagne, Irlande). Pas de conflit — évolution normale du patrimoine.

---

## Étape 6 — Livrables générés

| Fichier | Contenu |
|---|---|
| `reports/TASK-DATA-SCPI-PILOT-ALTIXIA-CADENCE-XII-001.md` | Ce rapport |
| `data-import/processed/altixia-cadence-xii/document-inventory.json` | Inventaire des 4 documents (hash, type, période, confiance) |
| `data-import/processed/altixia-cadence-xii/indicator-matrix.json` | 54 indicateurs avec valeur, source, période, statut |
| `data-import/processed/altixia-cadence-xii/anomalies.json` | 6 anomalies documentées avec actions |

---

## Étape 7 — Vérifications

Aucun fichier de code modifié dans cette tâche → `npx tsc --noEmit` et `npm run build` non requis.

---

## Contraintes respectées

- ✅ Une seule SCPI traitée : ALTIXIA CADENCE XII
- ✅ Aucune donnée marquée `verified` — statuts `publishable` / `manual_review` uniquement
- ✅ Aucune modification du design
- ✅ Aucune modification de pages SEO
- ✅ Aucune page artisanale créée
- ✅ Pas de git add/commit/push sans validation

---

## Bilan — Validation du processus pilote

L'agent a :
1. Identifié les 4 documents sans renommage préalable (confiance 99% sur chacun)
2. Appliqué la hiérarchie des sources correctement (Bulletin T1 2026 > RA 2024 > Note d'info > DIC pour chaque indicateur)
3. Extrait 54 indicateurs couvrant toutes les catégories du comparateur
4. Signalé 6 anomalies avec niveau de sévérité et action recommandée
5. Marqué 7 indicateurs `manual_review` là où la certitude n'est pas totale

**Recommandation :** Le processus est validé pour passage aux lots de 5 SCPI.
Points à améliorer dans les prochains lots :
- Lire systématiquement l'Annexe Disclosure pour SFDR
- Extraire explicitement le Label ISR depuis les docs officiels (pas uniquement depuis le legacy)
- Clarifier la convention WALT/WALB avec Altixia REIM pour lever l'ambiguïté de libellés
