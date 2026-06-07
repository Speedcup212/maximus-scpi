# Rapport complet — DeepSeek reconstitution SCPI

**Date :** 2026-06-06
**Provider :** deepseek (deepseek-v4-pro)
**SCPI analysées :** 71

## Synthèse statuts

| Statut | Nombre |
|--------|--------|
| verified | 54 |
| verified_adjusted_split | 3 |
| manual_review | 6 |
| rejected | 8 |

## Tokens & coût

- Prompt tokens : 398970
- Completion tokens : 145160
- Total tokens : 544130
- Coût estimé (indicatif) : ~0.5441 USD

## SCPI non vérifiées

| SCPI | Statut | Raison |
|------|--------|--------|
| Coeur Avenir | `rejected` | api_error |
| Coeur de ville | `rejected` | api_error |
| Edissimmo | `manual_review` | données partielles ou non fiables |
| Efimmo 1 | `manual_review` | prix de souscription non fiable ou absent |
| HEXA | `rejected` | api_error |
| Novaxia NEO | `manual_review` | valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié |
| Optimale | `manual_review` | valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié |
| Praemia | `rejected` | api_error |
| Praemia Hotels Europe | `rejected` | api_error |
| Primopierre | `rejected` | api_error |
| Primovie | `rejected` | api_error |
| Remake Live | `manual_review` | valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié |
| Rivoli Avenir Patrimoine | `rejected` | api_error |
| Urban Coeur Commerce | `manual_review` | valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié |

## Anomalies détectées

| SCPI | Anomalie |
|------|----------|
| Ficommerce Proximité | Division nominale ×3 détectée (2026-01-01) — valeurs à harmoniser. |
| Epsicap Nano | Valeur de réalisation introuvable. |
| IrokoZen | Valeur de réalisation introuvable. |
| Buroboutic | Division nominale ×3 détectée (2026-01-01) — valeurs à harmoniser. |
| Coeur Avenir | Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Coeur Avenir",
  "source_periode": "2025",
  "prix_souscription": {
    "value": 200,
    "unit": "EUR/part",
    "confidence": 1,
    "extract": "Le prix de souscription de 200 € s’e |
| Coeur de ville | Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Coeur de ville",
  "source_periode": "1T 2026",
  "prix_souscription": {
    "value": 210,
    "unit": "EUR/part",
    "confidence": 1.0,
    "extract": "Prix de souscription210 €",
  |
| Efimmo 1 | Prix de souscription introuvable. |
| Elialys | Division nominale ×5 détectée (2025-01-01) — valeurs à harmoniser. |
| Elialys | Split détecté mais valeur de reconstitution ajustée non calculable. |
| HEXA | Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "HEXA",
  "source_periode": "T1-2026",
  "prix_souscription": {
    "value": 172,
    "unit": "EUR/part",
    "confidence": 1,
    "extract": "Valeur de la part : 172€",
    "source_do |
| Novaxia NEO | Valeur de reconstitution introuvable. |
| Novaxia NEO | Valeur de réalisation introuvable. |
| Opportunités Europe | Division nominale ×20 détectée (2026-01-01) — valeurs à harmoniser. |
| Optimale | Valeur de reconstitution introuvable. |
| Optimale | Valeur de réalisation introuvable. |
| Pierval Santé | Valeur de réalisation introuvable. |
| Praemia | Erreur API: DeepSeek API returned an empty response. |
| Praemia Hotels Europe | Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Praemia Hotels Europe",
  "source_periode": "1er trimestre 2026",
  "prix_souscription": {
    "value": 204.00,
    "unit": "EUR/part",
    "confidence": 1,
    "extract": "Le prix de |
| Primopierre | Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Primopierre",
  "source_periode": "31/12/2024",
  "prix_souscription": {
    "value": 126.0,
    "unit": "EUR/part",
    "confidence": 1.0,
    "extract": "Prix de souscription (3) 12 |
| Primovie | Erreur API: DeepSeek API returned an empty response. |
| Remake Live | Valeur de reconstitution introuvable. |
| Remake Live | Valeur de réalisation introuvable. |
| Rivoli Avenir Patrimoine | Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Rivoli Avenir Patrimoine",
  "source_periode": "31/12/2025",
  "prix_souscription": {
    "value": 228.00,
    "unit": "EUR/part",
    "confidence": 1.0,
    "extract": "228,00 € par  |
| Urban Coeur Commerce | Valeur de reconstitution introuvable. |
| Urban Coeur Commerce | Valeur de réalisation introuvable. |

## Tableau récapitulatif

| SCPI | Prix | VR | VR ajustée | Réalisation | Split | Décote/surcote | Statut |
|------|------|----|-----------|-------------|-------|----------------|--------|
| Ficommerce Proximité | 70 | 207.88 | 69.29 | 173.35 | ×3 | 1.02 % | `verified_adjusted_split` |
| Crédit Mutuel Pierre 1 | 215 | 219.5 | — | 179.26 | — | -2.05 % | `verified` |
| Epargne Pierre Europe | 200 | 205.4 | — | 172.14 | — | -2.63 % | `verified` |
| Epsicap Nano | 257 | 279.57 | — | — | — | -8.07 % | `verified` |
| Grand Paris Résidentiels | 200 | 186.25 | — | 155.56 | — | 7.38 % | `verified` |
| Iroko Atlas | 200 | 204.87 | — | 188.27 | — | -2.38 % | `verified` |
| IrokoZen | 204 | 213.94 | — | — | — | -4.65 % | `verified` |
| LF Grand Paris Patrimoine | 218 | 216.96 | — | 173.4 | — | 0.48 % | `verified` |
| NCap Régions | 682 | 698.26 | — | 570.64 | — | -2.33 % | `verified` |
| Paref Evo | 250 | 245.04 | — | 213.42 | — | 2.02 % | `verified` |
| Perial O2 | 164 | 150.73 | — | 119.24 | — | 8.8 % | `verified` |
| Europa | 200 | 220.66 | — | 179.28 | — | -9.36 % | `verified` |
| Activimmo | 610 | 616.58 | — | 513.68 | — | -1.07 % | `verified` |
| Aestiam Agora | 922 | 965.93 | — | 795.94 | — | -4.55 % | `verified` |
| Aestiam Horizon | 350 | 347.63 | — | 287.23 | — | 0.68 % | `verified` |
| Alta Convictions | 308 | 333.68 | — | 281.63 | — | -7.7 % | `verified` |
| Altixia Cadence XII | 200 | 199.4 | — | 163.8 | — | 0.3 % | `verified` |
| Altixia Commerces | 203 | 203.48 | — | 181.35 | — | -0.24 % | `verified` |
| Atream Hotel | 1000 | 1064.33 | — | 874.72 | — | -6.04 % | `verified` |
| Buroboutic | 77 | 229.76 | 76.59 | 192.69 | ×3 | 0.54 % | `verified_adjusted_split` |
| Coeur Avenir | — | — | — | — | — | — | `rejected` |
| Coeur de régions | 664 | 683.82 | — | 548.77 | — | -2.9 % | `verified` |
| Coeur de ville | — | — | — | — | — | — | `rejected` |
| Cœur d'Europe | 204 | 219.47 | — | 180.78 | — | -7.05 % | `verified` |
| Comete | 250 | 253.83 | — | 217.05 | — | -1.51 % | `verified` |
| Cristal Life | 208 | 226.69 | — | 186.88 | — | -8.24 % | `verified` |
| Cristal Rente | 255.68 | 269.32 | — | 218.89 | — | -5.06 % | `verified` |
| Eden | 50 | 49.5 | — | 43.54 | — | 1.01 % | `verified` |
| Edissimmo | 172 | 161.54 | — | 140.49 | — | 6.48 % | `manual_review` |
| EDR Europa | 200 | 220.66 | — | 179.28 | — | -9.36 % | `verified` |
| Efimmo 1 | — | 197.32 | — | 164.04 | — | — | `manual_review` |
| Elialys | 204 | 218.8 | — | 179.68 | ×5 | -6.76 % | `verified` |
| Épargne Foncière | 670 | 704.15 | — | 581.52 | — | -4.85 % | `verified` |
| Epargne Pierre | 208 | 207.22 | — | 168.1 | — | 0.38 % | `verified` |
| Europimmo | 725 | 773.78 | — | 639.53 | — | -6.3 % | `verified` |
| Eurovalys | 960 | 961.23 | — | 749.06 | — | -0.13 % | `verified` |
| Foncière des praticiens | 1100 | 1048.65 | — | 920.89 | — | 4.9 % | `verified` |
| GMA Essentialis | 206 | 208.04 | — | 160.42 | — | -0.98 % | `verified` |
| HEXA | — | — | — | — | — | — | `rejected` |
| Immorente | 340 | 321.03 | — | 266.94 | — | 5.91 % | `verified` |
| Kyaneos | 224 | 226.2 | — | 187.1 | — | -0.97 % | `verified` |
| Lf Avenir Sante | 300 | 302.3 | — | 244.18 | — | -0.76 % | `verified` |
| LF Opportunité Immo | 203 | 214.64 | — | 174 | — | -5.42 % | `verified` |
| LinaClub | 200 | 221.21 | — | 192.83 | — | -9.59 % | `verified` |
| Log In | 255 | 266.73 | — | 225.19 | — | -4.4 % | `verified` |
| Mistral Sélection | 180 | 182.19 | — | 171.18 | — | -1.2 % | `verified` |
| Momentime | 200 | 201.52 | — | 167.41 | — | -0.75 % | `verified` |
| NCAP Continent | 210 | 214.87 | — | 174.28 | — | -2.27 % | `verified` |
| NCAP Education Santé | 202 | 198.35 | — | 166.49 | — | 1.84 % | `verified` |
| Novapierre 1 | 442 | 436.06 | — | 361.24 | — | 1.36 % | `verified` |
| Novaxia NEO | 187 | — | — | — | — | — | `manual_review` |
| Opportunités Europe | 44 | 858.51 | 42.93 | 671.23 | ×20 | 2.49 % | `verified_adjusted_split` |
| Optimale | 255 | — | — | — | — | — | `manual_review` |
| Osmo Energie | 300 | 294.19 | — | 243.46 | — | 1.97 % | `verified` |
| Patrimmo Croissance Impact | 677 | 678.58 | — | 566.77 | — | -0.23 % | `verified` |
| Perial Grand Paris | 458 | 423.34 | — | 327.65 | — | 8.19 % | `verified` |
| Perial Hospitalité Europe | 181 | 176.47 | — | 142.38 | — | 2.57 % | `verified` |
| Pierval Santé | 204 | 199.2 | — | — | — | 2.41 % | `verified` |
| Praemia | — | — | — | — | — | — | `rejected` |
| Praemia Hotels Europe | — | — | — | — | — | — | `rejected` |
| Primopierre | — | — | — | — | — | — | `rejected` |
| Primovie | — | — | — | — | — | — | `rejected` |
| Remake Live | 204 | — | — | — | — | — | `manual_review` |
| Remake UK 2025 | 1025 | 1037.16 | — | 870.93 | — | -1.17 % | `verified` |
| Rivoli Avenir Patrimoine | — | — | — | — | — | — | `rejected` |
| Selectiinvest 1 | 530 | 560.96 | — | 464.91 | — | -5.52 % | `verified` |
| Selectipierre 2 Paris | 773 | 785 | — | 652.21 | — | -1.53 % | `verified` |
| Sofiprime | 280 | 289.4 | — | 234 | — | -3.25 % | `verified` |
| Transition Europe | 202 | 207.49 | — | 177.87 | — | -2.65 % | `verified` |
| WEMO ONE | 200 | 218.5 | — | 187.3 | — | -8.47 % | `verified` |
| Urban Coeur Commerce | 303 | — | — | — | — | — | `manual_review` |

## Détail par SCPI

### Ficommerce Proximité

- **Dossier :** `SCPI FiCommerce Proximité`
- **Document :** BTI Ficommerce T1 2026.pdf + Ficommerce Proximité - Rapport Annuel 2025.pdf + Note d'information et statuts Ficommerce - 01.2026.pdf
- **Pages LLM :** 7 (BTI Ficommerce T1 2026.pdf p.2, Ficommerce Proximité - Rapport Annuel 2025.pdf p.5, Ficommerce Proximité - Rapport Annuel 2025.pdf p.41, Note d'information et statuts Ficommerce - 01.2026.pdf p.29, Ficommerce Proximité - Rapport Annuel 2025.pdf p.24, Note d'information et statuts Ficommerce - 01.2026.pdf p.47, Note d'information et statuts Ficommerce - 01.2026.pdf p.48)
- **Prix souscription :** 70 € (p.2)
- **VR :** 207.88 € (p.2)
- **VR ajustée :** 69.29 (207.88 / 3 = 69.29)
- **Réalisation :** 173.35 € (p.2)
- **Division :** oui (×3)
- **Décote/surcote :** 1.02 % (surcote)
- **Statut :** `verified_adjusted_split`
- **Anomalies :** Division nominale ×3 détectée (2026-01-01) — valeurs à harmoniser.
- **Commentaire :** Prix: 70 € | VR: 207,88 € | Division nominale ×3 (2026-01-01) | VR ajustée: 207.88 / 3 = 69.29 | Écart: 1.02 % (surcote) | Statut: verified_adjusted_split
- **Tokens :** 10180

### Crédit Mutuel Pierre 1

- **Dossier :** `Credit Mutuel Pierre 1`
- **Document :** A7_note_statuts.pdf + A7_BT_20260331.pdf
- **Pages LLM :** 6 (A7_note_statuts.pdf p.5, A7_note_statuts.pdf p.46, A7_BT_20260331.pdf p.4, A7_BT_20260331.pdf p.12, A7_note_statuts.pdf p.9, A7_note_statuts.pdf p.10)
- **Prix souscription :** 215 € (p.4)
- **VR :** 219.5 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** 179.26 € (p.4)
- **Division :** non
- **Décote/surcote :** -2.05 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription = 215,00 € | VR: Valeur de reconstitution = 219,50 € | Écart: -2.05 % (decote) | Statut: verified
- **Tokens :** 7937

### Epargne Pierre Europe

- **Dossier :** `Epargne Pierre Europe`
- **Document :** 20250624-EPE-Note-dinformation.pdf + 20250624_EPE_Statuts.pdf + BPI1T2026-EPE-web-2.pdf
- **Pages LLM :** 6 (20250624-EPE-Note-dinformation.pdf p.20, 20250624_EPE_Statuts.pdf p.6, BPI1T2026-EPE-web-2.pdf p.5, 20250624-EPE-Note-dinformation.pdf p.16, 20250624_EPE_Statuts.pdf p.5, BPI1T2026-EPE-web-2.pdf p.6)
- **Prix souscription :** 200 € (p.5)
- **VR :** 205.4 € (p.5)
- **VR ajustée :** — 
- **Réalisation :** 172.14 € (p.5)
- **Division :** non
- **Décote/surcote :** -2.63 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription*200,00 € 200,00 € | VR: Valeur de reconstitution*206,51 €205,40 € | Écart: -2.63 % (decote) | Statut: verified
- **Tokens :** 8693

### Epsicap Nano

- **Dossier :** `Epsicap Nano`
- **Document :** Epsicap-Nano-Note-dinformation-2026.05.pdf + Bulletin-trimestriel-1T-2026-Epsicap-Nano-1.pdf
- **Pages LLM :** 6 (Epsicap-Nano-Note-dinformation-2026.05.pdf p.11, Epsicap-Nano-Note-dinformation-2026.05.pdf p.14, Bulletin-trimestriel-1T-2026-Epsicap-Nano-1.pdf p.4, Bulletin-trimestriel-1T-2026-Epsicap-Nano-1.pdf p.5, Epsicap-Nano-Note-dinformation-2026.05.pdf p.15, Bulletin-trimestriel-1T-2026-Epsicap-Nano-1.pdf p.6)
- **Prix souscription :** 257 € (p.11)
- **VR :** 279.57 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** -8.07 % (decote)
- **Statut :** `verified`
- **Anomalies :** Valeur de réalisation introuvable.
- **Commentaire :** Prix: À compter du 1er juillet 2025, le prix de souscription d'un part est de 257 € | VR: Au 31/12/2025, la valeur de reconstitution par part d’Epsicap Nano s’établit à 279,57€ | Écart: -8.07 % (decote) | Statut: verified
- **Tokens :** 7764

### Grand Paris Résidentiels

- **Dossier :** `Grans Paris Résidentiel`
- **Document :** IG_GPRBulletin_Semestriel2025_S1.pdf + IG_RapportAnnuel_2025GPR.pdf + IGGPRNoteInfo_StatutsAMFEurope20260115.pdf
- **Pages LLM :** 6 (IG_GPRBulletin_Semestriel2025_S1.pdf p.2, IG_RapportAnnuel_2025GPR.pdf p.16, IGGPRNoteInfo_StatutsAMFEurope20260115.pdf p.8, IGGPRNoteInfo_StatutsAMFEurope20260115.pdf p.10, IG_RapportAnnuel_2025GPR.pdf p.15, IG_RapportAnnuel_2025GPR.pdf p.35)
- **Prix souscription :** 200 € (p.16)
- **VR :** 186.25 € (p.16)
- **VR ajustée :** — 
- **Réalisation :** 155.56 € (p.15)
- **Division :** non
- **Décote/surcote :** 7.38 % (surcote)
- **Statut :** `verified`
- **Commentaire :** Prix: Le prix de souscription d’une part est fixé à 200 €. | VR: 2025 200 € 186,25 € | Écart: 7.38 % (surcote) | Statut: verified
- **Tokens :** 9293

### Iroko Atlas

- **Dossier :** `Iroko Atlas`
- **Document :** Iroko_Atlas_rapport_annuel_2025.pdf + Iroko_Atlas_statuts_scpi.pdf
- **Pages LLM :** 6 (Iroko_Atlas_rapport_annuel_2025.pdf p.18, Iroko_Atlas_rapport_annuel_2025.pdf p.39, Iroko_Atlas_rapport_annuel_2025.pdf p.3, Iroko_Atlas_statuts_scpi.pdf p.9, Iroko_Atlas_rapport_annuel_2025.pdf p.57, Iroko_Atlas_rapport_annuel_2025.pdf p.63)
- **Prix souscription :** 200 € (p.18)
- **VR :** 204.87 € (p.18)
- **VR ajustée :** — 
- **Réalisation :** 188.27 € (p.57)
- **Division :** non
- **Décote/surcote :** -2.38 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: prix de souscription de 200 € | VR: Valeur de reconstitution par part  204,87 € | Écart: -2.38 % (decote) | Statut: verified
- **Tokens :** 6922

### IrokoZen

- **Dossier :** `IrokoZen`
- **Document :** Iroko_Zen_Rapport_annuel_2025.pdf + Iroko_Zen_statuts_scpi.pdf
- **Pages LLM :** 6 (Iroko_Zen_Rapport_annuel_2025.pdf p.56, Iroko_Zen_statuts_scpi.pdf p.8, Iroko_Zen_statuts_scpi.pdf p.6, Iroko_Zen_Rapport_annuel_2025.pdf p.3, Iroko_Zen_statuts_scpi.pdf p.7, Iroko_Zen_Rapport_annuel_2025.pdf p.25)
- **Prix souscription :** 204 € (p.56)
- **VR :** 213.94 € (p.25)
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** -4.65 % (decote)
- **Statut :** `verified`
- **Anomalies :** Valeur de réalisation introuvable.
- **Commentaire :** Prix: revalorisation de la part à 204 € intervenue le 1er août 2025. | VR: 213,94 € | Écart: -4.65 % (decote) | Statut: verified
- **Tokens :** 8804

### LF Grand Paris Patrimoine

- **Dossier :** `LF Grand Paris Patrimoine`
- **Document :** Z2_note_statuts.pdf + Z2_BT_20260331.pdf + Z2_rapportannuel.pdf
- **Pages LLM :** 6 (Z2_note_statuts.pdf p.5, Z2_note_statuts.pdf p.43, Z2_BT_20260331.pdf p.4, Z2_BT_20260331.pdf p.12, Z2_rapportannuel.pdf p.5, Z2_rapportannuel.pdf p.7)
- **Prix souscription :** 218 € (p.4)
- **VR :** 216.96 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** 173.4 € (p.4)
- **Division :** non
- **Décote/surcote :** 0.48 % (surcote)
- **Statut :** `verified`
- **Commentaire :** Prix: Minimum de souscription fixé à 1 part, soit (A)218,00 € | VR: Valeur de reconstitution 216,96 € | Écart: 0.48 % (surcote) | Statut: verified
- **Tokens :** 8128

### NCap Régions

- **Dossier :** `NCAPRégions`
- **Document :** bt_ncap_regions_t1_2026.pdf + rapport_annuel_ncapregions_2025-1.pdf
- **Pages LLM :** 6 (bt_ncap_regions_t1_2026.pdf p.3, bt_ncap_regions_t1_2026.pdf p.4, rapport_annuel_ncapregions_2025-1.pdf p.22, rapport_annuel_ncapregions_2025-1.pdf p.31, bt_ncap_regions_t1_2026.pdf p.9, rapport_annuel_ncapregions_2025-1.pdf p.3)
- **Prix souscription :** 682 € (p.4)
- **VR :** 698.26 € (p.3)
- **VR ajustée :** — 
- **Réalisation :** 570.64 € (p.4)
- **Division :** non
- **Décote/surcote :** -2.33 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription 682,00 € | VR: 698,26 € Valeur de reconstitution (par part) au 31/12/2025 | Écart: -2.33 % (decote) | Statut: verified
- **Tokens :** 7542

### Paref Evo

- **Dossier :** `Paref Evo`
- **Document :** 8a9a6304-115c-4362-a792-09d176a013bf-BTI-T1-2026-PAREF-Evo.pdf + aad4f57d-cf78-4c7d-b647-274dd8c1a010-Rapport-annuel-SCPI-PAREF-Evo-2024.pdf + 6cdf12dc-8b42-4a57-98e9-09b938d94494-28.06.2024-Statuts-PAREF-Evo-clean2.pdf
- **Pages LLM :** 6 (8a9a6304-115c-4362-a792-09d176a013bf-BTI-T1-2026-PAREF-Evo.pdf p.7, 8a9a6304-115c-4362-a792-09d176a013bf-BTI-T1-2026-PAREF-Evo.pdf p.8, aad4f57d-cf78-4c7d-b647-274dd8c1a010-Rapport-annuel-SCPI-PAREF-Evo-2024.pdf p.6, 8a9a6304-115c-4362-a792-09d176a013bf-BTI-T1-2026-PAREF-Evo.pdf p.3, aad4f57d-cf78-4c7d-b647-274dd8c1a010-Rapport-annuel-SCPI-PAREF-Evo-2024.pdf p.18, 6cdf12dc-8b42-4a57-98e9-09b938d94494-28.06.2024-Statuts-PAREF-Evo-clean2.pdf p.6)
- **Prix souscription :** 250 € (p.3)
- **VR :** 245.04 € (p.3)
- **VR ajustée :** — 
- **Réalisation :** 213.42 € (p.3)
- **Division :** non
- **Décote/surcote :** 2.02 % (surcote)
- **Statut :** `verified`
- **Commentaire :** Prix: Valeur de la part : 250 € | VR: Valeur de reconstitution au 31/12/2025 : 245,04 € | Écart: 2.02 % (surcote) | Statut: verified
- **Tokens :** 10125

### Perial O2

- **Dossier :** `Perial O2`
- **Document :** 6a1701a2bd2947234367b710_Rapport annuel_PO2_sfdr_2025.pdf + 69f20de2eab70a16dc8ef27f_PO2 BTI 2026 T1 VDEF.pdf
- **Pages LLM :** 6 (6a1701a2bd2947234367b710_Rapport annuel_PO2_sfdr_2025.pdf p.12, 6a1701a2bd2947234367b710_Rapport annuel_PO2_sfdr_2025.pdf p.31, 6a1701a2bd2947234367b710_Rapport annuel_PO2_sfdr_2025.pdf p.17, 69f20de2eab70a16dc8ef27f_PO2 BTI 2026 T1 VDEF.pdf p.7, 6a1701a2bd2947234367b710_Rapport annuel_PO2_sfdr_2025.pdf p.10, 6a1701a2bd2947234367b710_Rapport annuel_PO2_sfdr_2025.pdf p.24)
- **Prix souscription :** 164 € (p.12)
- **VR :** 150.73 € (p.12)
- **VR ajustée :** — 
- **Réalisation :** 119.24 € (p.12)
- **Division :** non
- **Décote/surcote :** 8.8 % (surcote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription au 01/01 *196,00196,00196,00164,00164,00 | VR: Valeur de reconstitution 2 207 311 543 150,73100% | Écart: 8.8 % (surcote) | Statut: verified
- **Tokens :** 11369

### Europa

- **Dossier :** `SCPI  Europa`
- **Document :** SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T1-2026.pdf + SCPI-Edmond-de-Rothschild-Europa-Rapport-annuel-31-12-2024.pdf + SCPI-Edmond-de-Rothschild-Europa-Statuts-1.pdf
- **Pages LLM :** 6 (SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T1-2026.pdf p.9, SCPI-Edmond-de-Rothschild-Europa-Rapport-annuel-31-12-2024.pdf p.51, SCPI-Edmond-de-Rothschild-Europa-Statuts-1.pdf p.5, SCPI-Edmond-de-Rothschild-Europa-Rapport-annuel-31-12-2024.pdf p.5, SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T1-2026.pdf p.4, SCPI-Edmond-de-Rothschild-Europa-Statuts-1.pdf p.16)
- **Prix souscription :** 200 € (p.4)
- **VR :** 220.66 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** 179.28 € (p.4)
- **Division :** non
- **Décote/surcote :** -9.36 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: 200 € PRIX DE PART | VR: 220,66 € VALEUR DE RECONSTITUTION | Écart: -9.36 % (decote) | Statut: verified
- **Tokens :** 8347

### Activimmo

- **Dossier :** `SCPI Activimmo`
- **Document :** 20250410-Rapport-annuel-2025-ActivImmo.pdf + 20260507-BTI-ActivImmo.pdf + 20260414-Plaquette-Commerciale-ActivImmo-2026.pdf
- **Pages LLM :** 6 (20250410-Rapport-annuel-2025-ActivImmo.pdf p.6, 20260507-BTI-ActivImmo.pdf p.9, 20260414-Plaquette-Commerciale-ActivImmo-2026.pdf p.5, 20250410-Rapport-annuel-2025-ActivImmo.pdf p.58, 20250410-Rapport-annuel-2025-ActivImmo.pdf p.78, 20260507-BTI-ActivImmo.pdf p.10)
- **Prix souscription :** 610 € (p.6)
- **VR :** 616.58 € (p.6)
- **VR ajustée :** — 
- **Réalisation :** 513.68 € (p.6)
- **Division :** non
- **Décote/surcote :** -1.07 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: 610,00€/part | VR: 616,58€ | Écart: -1.07 % (decote) | Statut: verified
- **Tokens :** 6581

### Aestiam Agora

- **Dossier :** `SCPI Aestiam Agora`
- **Document :** 2026-1t-bti-aestiam-agora.pdf + 2025-rapport-annuel-aestiam-agora.pdf + AestiamAgora-Statuts.pdf
- **Pages LLM :** 6 (2026-1t-bti-aestiam-agora.pdf p.5, 2026-1t-bti-aestiam-agora.pdf p.7, 2025-rapport-annuel-aestiam-agora.pdf p.9, 2025-rapport-annuel-aestiam-agora.pdf p.54, AestiamAgora-Statuts.pdf p.7, AestiamAgora-Statuts.pdf p.6)
- **Prix souscription :** 922 € (p.5)
- **VR :** 965.93 € (p.5)
- **VR ajustée :** — 
- **Réalisation :** 795.94 € (p.5)
- **Division :** non
- **Décote/surcote :** -4.55 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: T1 2026 922 € Prix de souscription | VR: Valeur de reconstitution .................................... 965,93 € | Écart: -4.55 % (decote) | Statut: verified
- **Tokens :** 8870

### Aestiam Horizon

- **Dossier :** `SCPI Aestiam Horizon`
- **Document :** 2026-1t-bti-aestiam-horizon.pdf + 2025-rapport-annuel-aestiam-horizon.pdf + AestiamHorizon-Statuts.pdf
- **Pages LLM :** 6 (2026-1t-bti-aestiam-horizon.pdf p.5, 2026-1t-bti-aestiam-horizon.pdf p.7, 2025-rapport-annuel-aestiam-horizon.pdf p.9, 2025-rapport-annuel-aestiam-horizon.pdf p.51, AestiamHorizon-Statuts.pdf p.7, AestiamHorizon-Statuts.pdf p.6)
- **Prix souscription :** 350 € (p.5)
- **VR :** 347.63 € (p.5)
- **VR ajustée :** — 
- **Réalisation :** 287.23 € (p.5)
- **Division :** non
- **Décote/surcote :** 0.68 % (surcote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription 350 € | VR: Valeur de reconstitution  ....................................  347,63 € | Écart: 0.68 % (surcote) | Statut: verified
- **Tokens :** 6678

### Alta Convictions

- **Dossier :** `SCPI Alta Convictions`
- **Document :** 24032026_ALTA_BUL_TRIMESTRIEL_T1_26_PPP_WEB.pdf + Alta-Convictions-Rapport-annuel-2024-Web-PAP.pdf + SCPI-Alta-Convictions-Statuts-au-16-05-2025.pdf
- **Pages LLM :** 6 (24032026_ALTA_BUL_TRIMESTRIEL_T1_26_PPP_WEB.pdf p.5, Alta-Convictions-Rapport-annuel-2024-Web-PAP.pdf p.15, SCPI-Alta-Convictions-Statuts-au-16-05-2025.pdf p.6, SCPI-Alta-Convictions-Statuts-au-16-05-2025.pdf p.7, Alta-Convictions-Rapport-annuel-2024-Web-PAP.pdf p.27, Alta-Convictions-Rapport-annuel-2024-Web-PAP.pdf p.33)
- **Prix souscription :** 308 € (p.5)
- **VR :** 333.68 € (p.5)
- **VR ajustée :** — 
- **Réalisation :** 281.63 € (p.5)
- **Division :** non
- **Décote/surcote :** -7.7 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: 308 € Prix de la part | VR: 333,68 € Valeur de reconstitution | Écart: -7.7 % (decote) | Statut: verified
- **Tokens :** 9473

### Altixia Cadence XII

- **Dossier :** `SCPI Altixia Cadence 12`
- **Document :** doc1-20260430-122013.pdf + doc1-20260309-180655.pdf + doc1-20250526-145625.pdf
- **Pages LLM :** 6 (doc1-20260430-122013.pdf p.11, doc1-20260309-180655.pdf p.11, doc1-20260309-180655.pdf p.43, doc1-20260430-122013.pdf p.4, doc1-20250526-145625.pdf p.13, doc1-20260309-180655.pdf p.19)
- **Prix souscription :** 200 € (p.11)
- **VR :** 199.4 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** 163.8 € (p.4)
- **Division :** non
- **Décote/surcote :** 0.3 % (surcote)
- **Statut :** `verified`
- **Commentaire :** Prix: Le prix de souscription de la part d’Altixia Cadence XII s’élève à 200 € | VR: VALEUR DE RECONSTITUTION AU 31.12.2025: 199,40€ Par part | Écart: 0.3 % (surcote) | Statut: verified
- **Tokens :** 9414

### Altixia Commerces

- **Dossier :** `SCPI Altixia Commerce`
- **Document :** doc1-20260430-110640.pdf + doc1-20260203-160314.pdf
- **Pages LLM :** 6 (doc1-20260430-110640.pdf p.11, doc1-20260203-160314.pdf p.13, doc1-20260203-160314.pdf p.52, doc1-20260430-110640.pdf p.4, doc1-20260203-160314.pdf p.22, doc1-20260203-160314.pdf p.54)
- **Prix souscription :** 203 € (p.4)
- **VR :** 203.48 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** 181.35 € (p.4)
- **Division :** non
- **Décote/surcote :** -0.24 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: PRIX DE SOUSCRIPTION 203€ Par part | VR: VALEUR DE RECONSTITUTION AU 31.12.2025 203,48€ Par part | Écart: -0.24 % (decote) | Statut: verified
- **Tokens :** 9455

### Atream Hotel

- **Dossier :** `SCPI Atream Hotel`
- **Document :** Bulletin-N2026_1T-SCPI_Atream_Hotels_WEB_10-PAGES-1.pdf + Rapport-Annuel-SCPI-Atream-Hotels-2025-Web_114-pages_compressed.pdf + 2026-01-SCPI-AH-NI.pdf
- **Pages LLM :** 6 (Bulletin-N2026_1T-SCPI_Atream_Hotels_WEB_10-PAGES-1.pdf p.2, Bulletin-N2026_1T-SCPI_Atream_Hotels_WEB_10-PAGES-1.pdf p.8, Rapport-Annuel-SCPI-Atream-Hotels-2025-Web_114-pages_compressed.pdf p.7, Rapport-Annuel-SCPI-Atream-Hotels-2025-Web_114-pages_compressed.pdf p.29, 2026-01-SCPI-AH-NI.pdf p.13, 2026-01-SCPI-AH-NI.pdf p.16)
- **Prix souscription :** 1000 € (p.2)
- **VR :** 1064.33 € (p.2)
- **VR ajustée :** — 
- **Réalisation :** 874.72 € (p.2)
- **Division :** non
- **Décote/surcote :** -6.04 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription (4) 1 000,00 € 1 000,00 € | VR: Valeur de reconstitution (1) 1 064,33 € (5) 1 064,33 € (5) | Écart: -6.04 % (decote) | Statut: verified
- **Tokens :** 9051

### Buroboutic

- **Dossier :** `SCPI Buroboutic`
- **Document :** BTI Buroboutic T1 2026.pdf + Buroboutic Métropoles - Rapport annuel 2025.pdf + Note d'information et statuts Buroboutic - 01.2026.pdf
- **Pages LLM :** 6 (BTI Buroboutic T1 2026.pdf p.2, Buroboutic Métropoles - Rapport annuel 2025.pdf p.5, Buroboutic Métropoles - Rapport annuel 2025.pdf p.41, Buroboutic Métropoles - Rapport annuel 2025.pdf p.44, Note d'information et statuts Buroboutic - 01.2026.pdf p.30, Buroboutic Métropoles - Rapport annuel 2025.pdf p.24)
- **Prix souscription :** 77 € (p.2)
- **VR :** 229.76 € (p.2)
- **VR ajustée :** 76.59 (229.76 / 3 = 76.59)
- **Réalisation :** 192.69 € (p.2)
- **Division :** oui (×3)
- **Décote/surcote :** 0.54 % (surcote)
- **Statut :** `verified_adjusted_split`
- **Anomalies :** Division nominale ×3 détectée (2026-01-01) — valeurs à harmoniser.
- **Commentaire :** Prix: Prix de souscription à compter du 01.01.2026 77 € | VR: Valeur de reconstitution (2) par part au 31.12.2025 229,76 € | Division nominale ×3 (2026-01-01) | VR ajustée: 229.76 / 3 = 76.59 | Écart: 0.54 % (surcote) | Statut: verified_adjusted_split
- **Tokens :** 10507

### Coeur Avenir

- **Dossier :** `SCPI Coeur Avenir`
- **Document :** SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T1-2026.pdf + Rapport-annuel-2025-–-Coeur-dAvenir.pdf + Note-dinformation-–-Coeur-dAvenir.pdf
- **Pages LLM :** 6 (SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T1-2026.pdf p.9, Rapport-annuel-2025-–-Coeur-dAvenir.pdf p.19, Note-dinformation-–-Coeur-dAvenir.pdf p.12, Note-dinformation-–-Coeur-dAvenir.pdf p.13, Note-dinformation-–-Coeur-dAvenir.pdf p.16, SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T1-2026.pdf p.4)
- **Prix souscription :** —
- **VR :** —
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Coeur Avenir",
  "source_periode": "2025",
  "prix_souscription": {
    "value": 200,
    "unit": "EUR/part",
    "confidence": 1,
    "extract": "Le prix de souscription de 200 € s’e
- **Statut :** `rejected`
- **Anomalies :** Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Coeur Avenir",
  "source_periode": "2025",
  "prix_souscription": {
    "value": 200,
    "unit": "EUR/part",
    "confidence": 1,
    "extract": "Le prix de souscription de 200 € s’e
- **Commentaire :** Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Coeur Avenir",
  "source_periode": "2025",
  "prix_souscription": {
    "value": 200,
    "unit": "EUR/part",
    "confidence": 1,
    "extract": "Le prix de souscription de 200 € s’e

### Coeur de régions

- **Dossier :** `SCPI Coeur de régions`
- **Document :** Bulletin-Trimestriel-1T-2026-–-Coeur-de-Regions.pdf + Rapport-annuel-2025-–-Coeur-de-Regions.pdf + Note-dinformation-–-Coeur-de-Regions.pdf
- **Pages LLM :** 6 (Bulletin-Trimestriel-1T-2026-–-Coeur-de-Regions.pdf p.5, Bulletin-Trimestriel-1T-2026-–-Coeur-de-Regions.pdf p.9, Rapport-annuel-2025-–-Coeur-de-Regions.pdf p.33, Note-dinformation-–-Coeur-de-Regions.pdf p.10, Note-dinformation-–-Coeur-de-Regions.pdf p.13, Bulletin-Trimestriel-1T-2026-–-Coeur-de-Regions.pdf p.2)
- **Prix souscription :** 664 € (p.5)
- **VR :** 683.82 € (p.5)
- **VR ajustée :** — 
- **Réalisation :** 548.77 € (p.5)
- **Division :** non
- **Décote/surcote :** -2.9 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription 664 € | VR: Valeur de reconstitution 683,82 € | Écart: -2.9 % (decote) | Statut: verified
- **Tokens :** 7993

### Coeur de ville

- **Dossier :** `SCPI Coeur de ville`
- **Document :** Bulletin-Trimestriel-1T-2026-–-Coeur-de-Ville.pdf + Rapport-annuel-2025-–-Coeur-de-Ville.pdf + Note-dinformation-–-Coeur-de-Ville.pdf
- **Pages LLM :** 6 (Bulletin-Trimestriel-1T-2026-–-Coeur-de-Ville.pdf p.5, Bulletin-Trimestriel-1T-2026-–-Coeur-de-Ville.pdf p.9, Rapport-annuel-2025-–-Coeur-de-Ville.pdf p.24, Note-dinformation-–-Coeur-de-Ville.pdf p.9, Note-dinformation-–-Coeur-de-Ville.pdf p.12, Bulletin-Trimestriel-1T-2026-–-Coeur-de-Ville.pdf p.2)
- **Prix souscription :** —
- **VR :** —
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Coeur de ville",
  "source_periode": "1T 2026",
  "prix_souscription": {
    "value": 210,
    "unit": "EUR/part",
    "confidence": 1.0,
    "extract": "Prix de souscription210 €",
 
- **Statut :** `rejected`
- **Anomalies :** Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Coeur de ville",
  "source_periode": "1T 2026",
  "prix_souscription": {
    "value": 210,
    "unit": "EUR/part",
    "confidence": 1.0,
    "extract": "Prix de souscription210 €",
 
- **Commentaire :** Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Coeur de ville",
  "source_periode": "1T 2026",
  "prix_souscription": {
    "value": 210,
    "unit": "EUR/part",
    "confidence": 1.0,
    "extract": "Prix de souscription210 €",
 

### Cœur d'Europe

- **Dossier :** `scpi coeur europe`
- **Document :** Bulletin-Trimestriel-1T-2026-–-Coeur-dEurope.pdf + Rapport-annuel-2025-–-Coeur-dEurope-1.pdf + Note-dinformation-–-Coeur-dEurope.pdf
- **Pages LLM :** 6 (Bulletin-Trimestriel-1T-2026-–-Coeur-dEurope.pdf p.5, Bulletin-Trimestriel-1T-2026-–-Coeur-dEurope.pdf p.9, Rapport-annuel-2025-–-Coeur-dEurope-1.pdf p.28, Note-dinformation-–-Coeur-dEurope.pdf p.13, Rapport-annuel-2025-–-Coeur-dEurope-1.pdf p.20, Rapport-annuel-2025-–-Coeur-dEurope-1.pdf p.34)
- **Prix souscription :** 204 € (p.5)
- **VR :** 219.47 € (p.5)
- **VR ajustée :** — 
- **Réalisation :** 180.78 € (p.5)
- **Division :** non
- **Décote/surcote :** -7.05 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription204 € | VR: Valeur de reconstitution219,47 € | Écart: -7.05 % (decote) | Statut: verified
- **Tokens :** 10586

### Comete

- **Dossier :** `SCPI Comete`
- **Document :** 20260410-Rapport-annuel-2025-Comete-1.pdf + 20260506-BTI-T1-2026-Comete.pdf + 20250429-Statuts-Comete.pdf
- **Pages LLM :** 6 (20260410-Rapport-annuel-2025-Comete-1.pdf p.6, 20260506-BTI-T1-2026-Comete.pdf p.11, 20250429-Statuts-Comete.pdf p.5, 20260410-Rapport-annuel-2025-Comete-1.pdf p.58, 20260410-Rapport-annuel-2025-Comete-1.pdf p.71, 20250429-Statuts-Comete.pdf p.13)
- **Prix souscription :** 250 € (p.6)
- **VR :** 253.83 € (p.6)
- **VR ajustée :** — 
- **Réalisation :** 217.05 € (p.6)
- **Division :** non
- **Décote/surcote :** -1.51 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: 250,00 €/part prix de souscription | VR: 253,83 € valeur de reconstitution | Écart: -1.51 % (decote) | Statut: verified
- **Tokens :** 7042

### Cristal Life

- **Dossier :** `SCPI Cristal Life`
- **Document :** IG_CLBulletin_Trimestriel2026_T1.pdf + IG_RapportAnnuel_2025CL.pdf + IGCLNoteInfo_StatutsAMFEurope20260115.pdf
- **Pages LLM :** 6 (IG_CLBulletin_Trimestriel2026_T1.pdf p.2, IG_RapportAnnuel_2025CL.pdf p.7, IG_RapportAnnuel_2025CL.pdf p.53, IGCLNoteInfo_StatutsAMFEurope20260115.pdf p.8, IGCLNoteInfo_StatutsAMFEurope20260115.pdf p.10, IG_RapportAnnuel_2025CL.pdf p.25)
- **Prix souscription :** 208 € (p.2)
- **VR :** 226.69 € (p.2)
- **VR ajustée :** — 
- **Réalisation :** 186.88 € (p.2)
- **Division :** non
- **Décote/surcote :** -8.24 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription 208 € | VR: Valeur de reconstitution (5) 226,69 € | Écart: -8.24 % (decote) | Statut: verified
- **Tokens :** 8415

### Cristal Rente

- **Dossier :** `SCPI Cristal Rente`
- **Document :** IG_CRBulletin_Trimestriel2026_T1.pdf + IG_RapportAnnuel_2025CR.pdf + IGCRNoteInfo_StatutsAMFEurope20260115.pdf
- **Pages LLM :** 6 (IG_CRBulletin_Trimestriel2026_T1.pdf p.2, IG_RapportAnnuel_2025CR.pdf p.7, IGCRNoteInfo_StatutsAMFEurope20260115.pdf p.7, IGCRNoteInfo_StatutsAMFEurope20260115.pdf p.8, IGCRNoteInfo_StatutsAMFEurope20260115.pdf p.22, IG_RapportAnnuel_2025CR.pdf p.32)
- **Prix souscription :** 255.68 € (p.2)
- **VR :** 269.32 € (p.2)
- **VR ajustée :** — 
- **Réalisation :** 218.89 € (p.2)
- **Division :** non
- **Décote/surcote :** -5.06 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription 255,68 € | VR: Valeur de reconstitution (5) 269,32 € | Écart: -5.06 % (decote) | Statut: verified
- **Tokens :** 8487

### Eden

- **Dossier :** `SCPI Eden`
- **Document :** Eden-BT-1T-2026.pdf + Eden-AG-2026-Rapport-Annuel-2025.pdf + SCPI-Eden-Note-dInformation.pdf
- **Pages LLM :** 6 (Eden-BT-1T-2026.pdf p.8, Eden-BT-1T-2026.pdf p.3, Eden-AG-2026-Rapport-Annuel-2025.pdf p.67, SCPI-Eden-Note-dInformation.pdf p.13, Eden-AG-2026-Rapport-Annuel-2025.pdf p.25, Eden-AG-2026-Rapport-Annuel-2025.pdf p.57)
- **Prix souscription :** 50 € (p.8)
- **VR :** 49.5 € (p.25)
- **VR ajustée :** — 
- **Réalisation :** 43.54 € (p.25)
- **Division :** non
- **Décote/surcote :** 1.01 % (surcote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription : 50 € soit une valeur nominale de 40 € et une prime d’émission de 10€. | VR: Valeur de reconstitution 41 745 639 49,50 100,00% | Écart: 1.01 % (surcote) | Statut: verified
- **Tokens :** 8585

### Edissimmo

- **Dossier :** `SCPI Edissimmo`
- **Document :** EDISSIMMO - Bulletin Semestriel 2025 S2.pdf + EDISSIMMO- Rapport Annuel - 2024.pdf + EDISSIMMO-Note Information- Statuts 08082025-1.pdf
- **Pages LLM :** 6 (EDISSIMMO - Bulletin Semestriel 2025 S2.pdf p.1, EDISSIMMO- Rapport Annuel - 2024.pdf p.6, EDISSIMMO- Rapport Annuel - 2024.pdf p.102, EDISSIMMO-Note Information- Statuts 08082025-1.pdf p.4, EDISSIMMO-Note Information- Statuts 08082025-1.pdf p.6, EDISSIMMO-Note Information- Statuts 08082025-1.pdf p.8)
- **Prix souscription :** 172 € (p.1)
- **VR :** 161.54 € (p.1)
- **VR ajustée :** — 
- **Réalisation :** 140.49 € (p.1)
- **Division :** non
- **Décote/surcote :** 6.48 % (surcote)
- **Statut :** `manual_review`
- **Commentaire :** Prix: Prix de souscription : 172,00 € par part | VR: Valeur de reconstitution (4) : 2 846 M€ | Écart: 6.48 % (surcote) | Statut: manual_review
- **Tokens :** 10067

### EDR Europa

- **Dossier :** `SCPI EDR Europa`
- **Document :** SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T1-2026.pdf + SCPI-Edmond-de-Rothschild-Europa-Rapport-annuel-31-12-2024.pdf + SCPI-Edmond-de-Rothschild-Europa-Note-dinformation-1.pdf
- **Pages LLM :** 6 (SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T1-2026.pdf p.9, SCPI-Edmond-de-Rothschild-Europa-Rapport-annuel-31-12-2024.pdf p.51, SCPI-Edmond-de-Rothschild-Europa-Note-dinformation-1.pdf p.12, SCPI-Edmond-de-Rothschild-Europa-Rapport-annuel-31-12-2024.pdf p.5, SCPI-Edmond-de-Rothschild-Europa-Note-dinformation-1.pdf p.15, SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T1-2026.pdf p.4)
- **Prix souscription :** 200 € (p.4)
- **VR :** 220.66 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** 179.28 € (p.4)
- **Division :** non
- **Décote/surcote :** -9.36 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: PRIX DE PART
200 € | VR: VALEUR DE RECONSTITUTION
220,66 € | Écart: -9.36 % (decote) | Statut: verified
- **Tokens :** 6677

### Efimmo 1

- **Dossier :** `SCPI Efimmo 1`
- **Document :** EFIMMO-BT-1T-2026.pdf + NI-EF-042026.pdf
- **Pages LLM :** 6 (EFIMMO-BT-1T-2026.pdf p.5, NI-EF-042026.pdf p.7, NI-EF-042026.pdf p.12, NI-EF-042026.pdf p.13, NI-EF-042026.pdf p.9, NI-EF-042026.pdf p.15)
- **Prix souscription :** —
- **VR :** 197.32 € (p.5)
- **VR ajustée :** — 
- **Réalisation :** 164.04 € (p.5)
- **Division :** non
- **Décote/surcote :** prix de souscription non fiable ou absent
- **Statut :** `manual_review`
- **Anomalies :** Prix de souscription introuvable.
- **Commentaire :** VR: Valeur de reconstitution 197,32 € | prix de souscription non fiable ou absent | Statut: manual_review
- **Tokens :** 8232

### Elialys

- **Dossier :** `SCPI Elialys`
- **Document :** Elialys-BT-1T-2026.pdf + Elialys-AG-2026-Rapport-Annuel-2025.pdf
- **Pages LLM :** 6 (Elialys-BT-1T-2026.pdf p.10, Elialys-BT-1T-2026.pdf p.2, Elialys-BT-1T-2026.pdf p.3, Elialys-AG-2026-Rapport-Annuel-2025.pdf p.2, Elialys-AG-2026-Rapport-Annuel-2025.pdf p.14, Elialys-AG-2026-Rapport-Annuel-2025.pdf p.75)
- **Prix souscription :** 204 € (p.2)
- **VR :** 218.8 € (p.2)
- **VR ajustée :** — 
- **Réalisation :** 179.68 € (p.2)
- **Division :** oui (×5)
- **Décote/surcote :** -6.76 % (decote)
- **Statut :** `verified`
- **Anomalies :** Division nominale ×5 détectée (2025-01-01) — valeurs à harmoniser. / Split détecté mais valeur de reconstitution ajustée non calculable.
- **Commentaire :** Prix: prix de souscription, soit 204€ par part | VR: valeur de reconstitution à 218,80 € | Division nominale ×5 (2025-01-01) | Écart: -6.76 % (decote) | Statut: verified
- **Tokens :** 9489

### Épargne Foncière

- **Dossier :** `SCPI epargne fonciere`
- **Document :** EE_rapportannuel.pdf + EE_BT_20260331.pdf + EE_note_statuts.pdf
- **Pages LLM :** 6 (EE_rapportannuel.pdf p.40, EE_BT_20260331.pdf p.4, EE_BT_20260331.pdf p.12, EE_rapportannuel.pdf p.5, EE_rapportannuel.pdf p.7, EE_note_statuts.pdf p.8)
- **Prix souscription :** 670 € (p.4)
- **VR :** 704.15 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** 581.52 € (p.4)
- **Division :** non
- **Décote/surcote :** -4.85 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription = 670,00 € | VR: Valeur de reconstitution 704,15 € | Écart: -4.85 % (decote) | Statut: verified
- **Tokens :** 8340

### Epargne Pierre

- **Dossier :** `SCPI Epargne Pierre`
- **Document :** 20250625_EP_Statuts.pdf + BPI1T2026-EP.pdf
- **Pages LLM :** 6 (20250625_EP_Statuts.pdf p.5, BPI1T2026-EP.pdf p.5, BPI1T2026-EP.pdf p.6, 20250625_EP_Statuts.pdf p.4, 20250625_EP_Statuts.pdf p.12, 20250625_EP_Statuts.pdf p.16)
- **Prix souscription :** 208 € (p.5)
- **VR :** 207.22 € (p.5)
- **VR ajustée :** — 
- **Réalisation :** 168.1 € (p.5)
- **Division :** non
- **Décote/surcote :** 0.38 % (surcote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription à partir du 01/01/2023 * 208 € 208 € | VR: Valeur de reconstitution * 208,64 € 207,22 € | Écart: 0.38 % (surcote) | Statut: verified
- **Tokens :** 9714

### Europimmo

- **Dossier :** `SCPI Europimmo`
- **Document :** D1_rapportannuel.pdf + D1_BT_20260331.pdf + D1_note_statuts.pdf
- **Pages LLM :** 6 (D1_rapportannuel.pdf p.36, D1_BT_20260331.pdf p.4, D1_BT_20260331.pdf p.12, D1_rapportannuel.pdf p.5, D1_rapportannuel.pdf p.7, D1_note_statuts.pdf p.9)
- **Prix souscription :** 725 € (p.4)
- **VR :** 773.78 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** 639.53 € (p.4)
- **Division :** non
- **Décote/surcote :** -6.3 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription = 725,00 € | VR: Valeur de reconstitution = 773,78 € | Écart: -6.3 % (decote) | Statut: verified
- **Tokens :** 8691

### Eurovalys

- **Dossier :** `SCPI Eurovalys`
- **Document :** Eurovalys-BT-16-2026.pdf + Eurovalys-AG-2026-Rapport-Annuel-2025.pdf + EUROVALYS-Statuts.pdf
- **Pages LLM :** 6 (Eurovalys-BT-16-2026.pdf p.10, Eurovalys-BT-16-2026.pdf p.3, Eurovalys-AG-2026-Rapport-Annuel-2025.pdf p.75, EUROVALYS-Statuts.pdf p.5, EUROVALYS-Statuts.pdf p.6, Eurovalys-AG-2026-Rapport-Annuel-2025.pdf p.32)
- **Prix souscription :** 960 € (p.10)
- **VR :** 961.23 € (p.3)
- **VR ajustée :** — 
- **Réalisation :** 749.06 € (p.3)
- **Division :** non
- **Décote/surcote :** -0.13 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription : 960 € | VR: VALEUR DE RECONSTITUTION (1)* : 961,23 € | Écart: -0.13 % (decote) | Statut: verified
- **Tokens :** 7919

### Foncière des praticiens

- **Dossier :** `SCPI Foncière des praticiens`
- **Document :** BT-1T-2026-Fonciere-des-Praticiens.pdf + 2025.02.10-Note-dinformation-SCPI-Fonciere-des-Praticiens-V4.pdf
- **Pages LLM :** 6 (BT-1T-2026-Fonciere-des-Praticiens.pdf p.7, 2025.02.10-Note-dinformation-SCPI-Fonciere-des-Praticiens-V4.pdf p.14, 2025.02.10-Note-dinformation-SCPI-Fonciere-des-Praticiens-V4.pdf p.15, 2025.02.10-Note-dinformation-SCPI-Fonciere-des-Praticiens-V4.pdf p.20, 2025.02.10-Note-dinformation-SCPI-Fonciere-des-Praticiens-V4.pdf p.2, 2025.02.10-Note-dinformation-SCPI-Fonciere-des-Praticiens-V4.pdf p.21)
- **Prix souscription :** 1100 € (p.7)
- **VR :** 1048.65 € (p.7)
- **VR ajustée :** — 
- **Réalisation :** 920.89 € (p.7)
- **Division :** non
- **Décote/surcote :** 4.9 % (surcote)
- **Statut :** `verified`
- **Commentaire :** Prix: 1 100 € | VR: 1 048,65 € | Écart: 4.9 % (surcote) | Statut: verified
- **Tokens :** 7635

### GMA Essentialis

- **Dossier :** `SCPI GMA Essentialis`
- **Document :** SCPI_GMA_Essentialis_-_Bulletin_dInformation_P3_2025.pdf + GMA-Essentialis-STATUTS-CONSTITUTIFS-2025.pdf + Rapport-Annuel-SCPI-GMA-Essentialis-2024.pdf
- **Pages LLM :** 6 (SCPI_GMA_Essentialis_-_Bulletin_dInformation_P3_2025.pdf p.3, GMA-Essentialis-STATUTS-CONSTITUTIFS-2025.pdf p.9, Rapport-Annuel-SCPI-GMA-Essentialis-2024.pdf p.4, Rapport-Annuel-SCPI-GMA-Essentialis-2024.pdf p.78, Rapport-Annuel-SCPI-GMA-Essentialis-2024.pdf p.22, Rapport-Annuel-SCPI-GMA-Essentialis-2024.pdf p.23)
- **Prix souscription :** 206 € (p.3)
- **VR :** 208.04 € (p.3)
- **VR ajustée :** — 
- **Réalisation :** 160.42 € (p.3)
- **Division :** non
- **Décote/surcote :** -0.98 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription depuis 14 juillet 2024 206,00 € | VR: Valeur de reconstitution (par part) 208,04 € | Écart: -0.98 % (decote) | Statut: verified
- **Tokens :** 7487

### HEXA

- **Dossier :** `SCPI HEXA`
- **Document :** d5acee18-1994-48e5-ac76-d343abbcf566-BTI-T1-2026-PAREF-Hexa.pdf + be276c50-22c0-40de-af46-658831ee520d-Rapport-annuel-SCPI-PAREF-Hexa-2024.pdf
- **Pages LLM :** 6 (d5acee18-1994-48e5-ac76-d343abbcf566-BTI-T1-2026-PAREF-Hexa.pdf p.7, d5acee18-1994-48e5-ac76-d343abbcf566-BTI-T1-2026-PAREF-Hexa.pdf p.8, be276c50-22c0-40de-af46-658831ee520d-Rapport-annuel-SCPI-PAREF-Hexa-2024.pdf p.6, be276c50-22c0-40de-af46-658831ee520d-Rapport-annuel-SCPI-PAREF-Hexa-2024.pdf p.22, d5acee18-1994-48e5-ac76-d343abbcf566-BTI-T1-2026-PAREF-Hexa.pdf p.3, be276c50-22c0-40de-af46-658831ee520d-Rapport-annuel-SCPI-PAREF-Hexa-2024.pdf p.21)
- **Prix souscription :** —
- **VR :** —
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "HEXA",
  "source_periode": "T1-2026",
  "prix_souscription": {
    "value": 172,
    "unit": "EUR/part",
    "confidence": 1,
    "extract": "Valeur de la part : 172€",
    "source_do
- **Statut :** `rejected`
- **Anomalies :** Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "HEXA",
  "source_periode": "T1-2026",
  "prix_souscription": {
    "value": 172,
    "unit": "EUR/part",
    "confidence": 1,
    "extract": "Valeur de la part : 172€",
    "source_do
- **Commentaire :** Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "HEXA",
  "source_periode": "T1-2026",
  "prix_souscription": {
    "value": 172,
    "unit": "EUR/part",
    "confidence": 1,
    "extract": "Valeur de la part : 172€",
    "source_do

### Immorente

- **Dossier :** `SCPI Immorente`
- **Document :** IMMORENTE-BT-1T-2026-1.pdf + NI-IR-042026.pdf
- **Pages LLM :** 6 (IMMORENTE-BT-1T-2026-1.pdf p.5, NI-IR-042026.pdf p.8, NI-IR-042026.pdf p.15, NI-IR-042026.pdf p.12, NI-IR-042026.pdf p.14, NI-IR-042026.pdf p.9)
- **Prix souscription :** 340 € (p.5)
- **VR :** 321.03 € (p.5)
- **VR ajustée :** — 
- **Réalisation :** 266.94 € (p.5)
- **Division :** non
- **Décote/surcote :** 5.91 % (surcote)
- **Statut :** `verified`
- **Commentaire :** Prix: 340 € PRIX DE SOUSCRIPTION DE LA PART D’IMMORENTE pour tout nouvel associé depuis le 1er novembre 2021. | VR: 321,03 € | Écart: 5.91 % (surcote) | Statut: verified
- **Tokens :** 8140

### Kyaneos

- **Dossier :** `SCPI Kyaneos`
- **Document :** BT-T1-2026-KP.pdf + SCPI-KP-Note-dinformation-01072025.pdf + SCPI-KP-Statuts-05-04-2024.pdf
- **Pages LLM :** 6 (BT-T1-2026-KP.pdf p.4, BT-T1-2026-KP.pdf p.7, SCPI-KP-Note-dinformation-01072025.pdf p.6, SCPI-KP-Statuts-05-04-2024.pdf p.7, SCPI-KP-Statuts-05-04-2024.pdf p.2, SCPI-KP-Note-dinformation-01072025.pdf p.9)
- **Prix souscription :** 224 € (p.4)
- **VR :** 226.2 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** 187.1 € (p.4)
- **Division :** non
- **Décote/surcote :** -0.97 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription
224 € | VR: Valeur de reconstitution*
226,20 € | Écart: -0.97 % (decote) | Statut: verified
- **Tokens :** 8410

### Lf Avenir Sante

- **Dossier :** `SCPI Lf Avenir Sante`
- **Document :** Q1_BT_20260331.pdf + Q1_rapportannuel.pdf + Q1_note_statuts.pdf
- **Pages LLM :** 6 (Q1_BT_20260331.pdf p.4, Q1_BT_20260331.pdf p.12, Q1_rapportannuel.pdf p.5, Q1_rapportannuel.pdf p.7, Q1_note_statuts.pdf p.13, Q1_note_statuts.pdf p.14)
- **Prix souscription :** 300 € (p.4)
- **VR :** 302.3 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** 244.18 € (p.4)
- **Division :** non
- **Décote/surcote :** -0.76 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription = 300,00 € | VR: Valeur de reconstitution = 302,30 € | Écart: -0.76 % (decote) | Statut: verified
- **Tokens :** 7732

### LF Opportunité Immo

- **Dossier :** `SCPI LF Opportunité Immo`
- **Document :** G0_BT_20260331.pdf + G0_rapportannuel.pdf + G0_note_statuts.pdf
- **Pages LLM :** 6 (G0_BT_20260331.pdf p.4, G0_BT_20260331.pdf p.12, G0_rapportannuel.pdf p.5, G0_rapportannuel.pdf p.6, G0_note_statuts.pdf p.9, G0_note_statuts.pdf p.10)
- **Prix souscription :** 203 € (p.4)
- **VR :** 214.64 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** 174 € (p.4)
- **Division :** non
- **Décote/surcote :** -5.42 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription = 203,00 € | VR: Valeur de reconstitution 214,64 € | Écart: -5.42 % (decote) | Statut: verified
- **Tokens :** 7171

### LinaClub

- **Dossier :** `SCPI LinaClub`
- **Document :** 2026-1t-bti-linaclub.pdf + 2025-rapport-annuel-linaclub.pdf + Linaclub-Statuts.pdf
- **Pages LLM :** 6 (2026-1t-bti-linaclub.pdf p.5, 2026-1t-bti-linaclub.pdf p.7, 2025-rapport-annuel-linaclub.pdf p.7, 2025-rapport-annuel-linaclub.pdf p.40, Linaclub-Statuts.pdf p.7, 2026-1t-bti-linaclub.pdf p.1)
- **Prix souscription :** 200 € (p.5)
- **VR :** 221.21 € (p.5)
- **VR ajustée :** — 
- **Réalisation :** 192.83 € (p.5)
- **Division :** non
- **Décote/surcote :** -9.59 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription 200 € | VR: Valeur de reconstitution ....................................  221,21 € | Écart: -9.59 % (decote) | Statut: verified
- **Tokens :** 7203

### Log In

- **Dossier :** `SCPI Log In`
- **Document :** SCPI-LOG-IN-Rapport-Annuel-2025.pdf + SCPI-LOG-IN-Statuts-2062025.pdf + Bulletin-Trimestriel-LOG-IN-T1-2026.pdf
- **Pages LLM :** 6 (SCPI-LOG-IN-Rapport-Annuel-2025.pdf p.6, SCPI-LOG-IN-Rapport-Annuel-2025.pdf p.25, SCPI-LOG-IN-Statuts-2062025.pdf p.5, Bulletin-Trimestriel-LOG-IN-T1-2026.pdf p.2, Bulletin-Trimestriel-LOG-IN-T1-2026.pdf p.6, SCPI-LOG-IN-Rapport-Annuel-2025.pdf p.38)
- **Prix souscription :** 255 € (p.2)
- **VR :** 266.73 € (p.2)
- **VR ajustée :** — 
- **Réalisation :** 225.19 € (p.2)
- **Division :** non
- **Décote/surcote :** -4.4 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: PRIX DE SOUSCRIPTION 255 € | VR: VALEUR DE RECONSTITUTION / PART 266,73 € | Écart: -4.4 % (decote) | Statut: verified
- **Tokens :** 9192

### Mistral Sélection

- **Dossier :** `SCPI Mistral Sélection`
- **Document :** Bulletin_Trimestriel_SCPI_Mistral_Sélection_Mars_26.pdf + Rapport-annuel-2024-SCPI-Mistral-Selection.pdf + SCPI_Mistral_Selection_ NI_Annexe_SFDR_Statuts_01082025.pdf
- **Pages LLM :** 6 (Bulletin_Trimestriel_SCPI_Mistral_Sélection_Mars_26.pdf p.4, Bulletin_Trimestriel_SCPI_Mistral_Sélection_Mars_26.pdf p.8, Rapport-annuel-2024-SCPI-Mistral-Selection.pdf p.91, SCPI_Mistral_Selection_ NI_Annexe_SFDR_Statuts_01082025.pdf p.24, Rapport-annuel-2024-SCPI-Mistral-Selection.pdf p.23, SCPI_Mistral_Selection_ NI_Annexe_SFDR_Statuts_01082025.pdf p.20)
- **Prix souscription :** 180 € (p.4)
- **VR :** 182.19 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** 171.18 € (p.4)
- **Division :** non
- **Décote/surcote :** -1.2 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: 180€ Prix de souscription | VR: 182,19 € Valeur de reconstitution au 31.12.25 | Écart: -1.2 % (decote) | Statut: verified
- **Tokens :** 7303

### Momentime

- **Dossier :** `SCPI Momentime`
- **Document :** arkea-reim_momentime-ra-2025_2026-05-18_18-57-3_262.pdf + scpi_momentime_-_note_dinformations.pdf + scpi_momentime_statuts.pdf
- **Pages LLM :** 6 (arkea-reim_momentime-ra-2025_2026-05-18_18-57-3_262.pdf p.18, arkea-reim_momentime-ra-2025_2026-05-18_18-57-3_262.pdf p.19, scpi_momentime_-_note_dinformations.pdf p.17, scpi_momentime_statuts.pdf p.6, arkea-reim_momentime-ra-2025_2026-05-18_18-57-3_262.pdf p.37, scpi_momentime_-_note_dinformations.pdf p.14)
- **Prix souscription :** 200 € (p.18)
- **VR :** 201.52 € (p.18)
- **VR ajustée :** — 
- **Réalisation :** 167.41 € (p.18)
- **Division :** non
- **Décote/surcote :** -0.75 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: 200 € Prix de souscription | VR: 201,52 € Valeur de Reconstitution | Écart: -0.75 % (decote) | Statut: verified
- **Tokens :** 8647

### NCAP Continent

- **Dossier :** `SCPI NCAP Continent`
- **Document :** bt_ncap_continent_t1_2026.pdf + rapport_annuel_ncapcontinent_2025.pdf + ncap_continent_statuts_19062025.pdf
- **Pages LLM :** 6 (bt_ncap_continent_t1_2026.pdf p.3, bt_ncap_continent_t1_2026.pdf p.4, rapport_annuel_ncapcontinent_2025.pdf p.20, ncap_continent_statuts_19062025.pdf p.4, ncap_continent_statuts_19062025.pdf p.6, rapport_annuel_ncapcontinent_2025.pdf p.25)
- **Prix souscription :** 210 € (p.4)
- **VR :** 214.87 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** 174.28 € (p.4)
- **Division :** non
- **Décote/surcote :** -2.27 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription 210,00 € | VR: Valeur de reconstitution (par part) au 31/12/2025 214,87 € | Écart: -2.27 % (decote) | Statut: verified
- **Tokens :** 7273

### NCAP Education Santé

- **Dossier :** `SCPI NCAP Education Santé`
- **Document :** bt_ncap_education_sante_t1_2026.pdf + rapport_annuel_ncapeducationsante_2025.pdf + rapport_annuel_ncapeducationsante_2024.pdf
- **Pages LLM :** 6 (bt_ncap_education_sante_t1_2026.pdf p.3, bt_ncap_education_sante_t1_2026.pdf p.4, rapport_annuel_ncapeducationsante_2025.pdf p.24, rapport_annuel_ncapeducationsante_2024.pdf p.19, rapport_annuel_ncapeducationsante_2025.pdf p.29, rapport_annuel_ncapeducationsante_2024.pdf p.24)
- **Prix souscription :** 202 € (p.4)
- **VR :** 198.35 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** 166.49 € (p.4)
- **Division :** non
- **Décote/surcote :** 1.84 % (surcote)
- **Statut :** `verified`
- **Commentaire :** Prix: 202,00 € | VR: 198,35 € | Écart: 1.84 % (surcote) | Statut: verified
- **Tokens :** 8513

### Novapierre 1

- **Dossier :** `SCPI Novapierre 1`
- **Document :** 5d377050-5149-4b11-9968-ac9cecb2c92c-BTI-T1-2026-Novapierre-1.pdf + ac7d4470-0f82-4043-bd24-6e1acce6a906-01.01.2026-NI-Novapierre-1.pdf + b6f5a3f7-33ea-42f2-b038-577839639ef8-Rapport-annuel-SCPI-Novapierre-1-2024.pdf
- **Pages LLM :** 6 (5d377050-5149-4b11-9968-ac9cecb2c92c-BTI-T1-2026-Novapierre-1.pdf p.7, 5d377050-5149-4b11-9968-ac9cecb2c92c-BTI-T1-2026-Novapierre-1.pdf p.8, ac7d4470-0f82-4043-bd24-6e1acce6a906-01.01.2026-NI-Novapierre-1.pdf p.22, b6f5a3f7-33ea-42f2-b038-577839639ef8-Rapport-annuel-SCPI-Novapierre-1-2024.pdf p.6, 5d377050-5149-4b11-9968-ac9cecb2c92c-BTI-T1-2026-Novapierre-1.pdf p.3, ac7d4470-0f82-4043-bd24-6e1acce6a906-01.01.2026-NI-Novapierre-1.pdf p.17)
- **Prix souscription :** 442 € (p.3)
- **VR :** 436.06 € (p.3)
- **VR ajustée :** — 
- **Réalisation :** 361.24 € (p.3)
- **Division :** non
- **Décote/surcote :** 1.36 % (surcote)
- **Statut :** `verified`
- **Commentaire :** Prix: 442 € | VR: 436,06 € | Écart: 1.36 % (surcote) | Statut: verified
- **Tokens :** 8816

### Novaxia NEO

- **Dossier :** `SCPI Novaxia`
- **Document :** NOVAXIA-NEO-Statuts-V06.2023.pdf + Novaxia-NEO-Reporting-31_03_2026.pdf + NOVAXIA-NEO-Note-dInformation-V23.04.2026.pdf
- **Pages LLM :** 6 (NOVAXIA-NEO-Statuts-V06.2023.pdf p.7, Novaxia-NEO-Reporting-31_03_2026.pdf p.13, NOVAXIA-NEO-Note-dInformation-V23.04.2026.pdf p.19, NOVAXIA-NEO-Note-dInformation-V23.04.2026.pdf p.20, NOVAXIA-NEO-Statuts-V06.2023.pdf p.15, NOVAXIA-NEO-Statuts-V06.2023.pdf p.21)
- **Prix souscription :** 187 € (p.20)
- **VR :** —
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié
- **Statut :** `manual_review`
- **Anomalies :** Valeur de reconstitution introuvable. / Valeur de réalisation introuvable.
- **Commentaire :** Prix: Nominal de la part Cent cinquante (150) euros, Prime d’émission Trente-sept (37) euros, Prix de souscription Cent quatre | valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié | Statut: manual_review
- **Tokens :** 6970

### Opportunités Europe

- **Dossier :** `SCPI Opportunités Europe`
- **Document :** 69f34e5194509a2ff583710d_POE BTI T1 2026.pdf + 695be6d69d4f14c9454b079d_POE Statuts Janv2026.pdf + 6a16ff98070156fbb255ec8c_Rapport annuel_POE_sfdr_2025.pdf
- **Pages LLM :** 6 (69f34e5194509a2ff583710d_POE BTI T1 2026.pdf p.7, 695be6d69d4f14c9454b079d_POE Statuts Janv2026.pdf p.6, 6a16ff98070156fbb255ec8c_Rapport annuel_POE_sfdr_2025.pdf p.10, 6a16ff98070156fbb255ec8c_Rapport annuel_POE_sfdr_2025.pdf p.13, 6a16ff98070156fbb255ec8c_Rapport annuel_POE_sfdr_2025.pdf p.32, 6a16ff98070156fbb255ec8c_Rapport annuel_POE_sfdr_2025.pdf p.24)
- **Prix souscription :** 44 € (p.7)
- **VR :** 858.51 € (p.7)
- **VR ajustée :** 42.93 (858.51 / 20 = 42.93)
- **Réalisation :** 671.23 € (p.7)
- **Division :** oui (×20)
- **Décote/surcote :** 2.49 % (surcote)
- **Statut :** `verified_adjusted_split`
- **Anomalies :** Division nominale ×20 détectée (2026-01-01) — valeurs à harmoniser.
- **Commentaire :** Prix: Depuis le 1er janvier 2026, le prix de souscription d’une part passe de 880 € à 44 €, soit une division par 20. | VR: PAR PART 870,06 € 858,51 € | Division nominale ×20 (2026-01-01) | VR ajustée: 858.51 / 20 = 42.93 | Écart: 2.49 % (surcote) | Statut: verified_adjusted_split
- **Tokens :** 11530

### Optimale

- **Dossier :** `SCPI Optimale`
- **Document :** 2025.12.11-SCPI-OPTIMALE-Note-information-MAJ-PRIX-PART.pdf + 8.-SCPI-OPTIMALE-Statuts-mis-a-jour-AGM-3008-2024-verison-transfert_sign-EGuy.pdf + PLAQUETTE_SCPI_2026_Fev_V2.pdf
- **Pages LLM :** 6 (2025.12.11-SCPI-OPTIMALE-Note-information-MAJ-PRIX-PART.pdf p.8, 8.-SCPI-OPTIMALE-Statuts-mis-a-jour-AGM-3008-2024-verison-transfert_sign-EGuy.pdf p.6, 8.-SCPI-OPTIMALE-Statuts-mis-a-jour-AGM-3008-2024-verison-transfert_sign-EGuy.pdf p.7, PLAQUETTE_SCPI_2026_Fev_V2.pdf p.2, 2025.12.11-SCPI-OPTIMALE-Note-information-MAJ-PRIX-PART.pdf p.9, 8.-SCPI-OPTIMALE-Statuts-mis-a-jour-AGM-3008-2024-verison-transfert_sign-EGuy.pdf p.19)
- **Prix souscription :** 255 € (p.8)
- **VR :** —
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié
- **Statut :** `manual_review`
- **Anomalies :** Valeur de reconstitution introuvable. / Valeur de réalisation introuvable.
- **Commentaire :** Prix: A la date de délivrance du visa de l’AMF le 21 juillet 2020, le prix de souscription de 255 € se décompose ainsi : | valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié | Statut: manual_review
- **Tokens :** 8526

### Osmo Energie

- **Dossier :** `SCPI Osmo Energie`
- **Document :** Rapport annuel 2024 SCPI Osmo Energie.pdf + 20240513_Osmo Energie - Statuts-2.pdf + BTI OSMO ENERGIE T3 2025.pdf
- **Pages LLM :** 6 (Rapport annuel 2024 SCPI Osmo Energie.pdf p.5, Rapport annuel 2024 SCPI Osmo Energie.pdf p.19, 20240513_Osmo Energie - Statuts-2.pdf p.7, BTI OSMO ENERGIE T3 2025.pdf p.2, Rapport annuel 2024 SCPI Osmo Energie.pdf p.10, Rapport annuel 2024 SCPI Osmo Energie.pdf p.20)
- **Prix souscription :** 300 € (p.2)
- **VR :** 294.19 € (p.2)
- **VR ajustée :** — 
- **Réalisation :** 243.46 € (p.2)
- **Division :** non
- **Décote/surcote :** 1.97 % (surcote)
- **Statut :** `verified`
- **Commentaire :** Prix: 300€ Valeur de part, au 01/10/2025 | VR: Valeur de reconstitution (2) 294,19€/part | Écart: 1.97 % (surcote) | Statut: verified
- **Tokens :** 9375

### Patrimmo Croissance Impact

- **Dossier :** `SCPI Patrimmo Croissance Impact`
- **Document :** PRAEMIA_BTI_Patrimmo Croissance_T1_2026.pdf + Rapport Annuel 2024 Patrimmo Croissance Impact.pdf + SCPI Patrimmo Croissance - Note d'information.pdf
- **Pages LLM :** 6 (PRAEMIA_BTI_Patrimmo Croissance_T1_2026.pdf p.4, Rapport Annuel 2024 Patrimmo Croissance Impact.pdf p.6, Rapport Annuel 2024 Patrimmo Croissance Impact.pdf p.40, Rapport Annuel 2024 Patrimmo Croissance Impact.pdf p.47, Rapport Annuel 2024 Patrimmo Croissance Impact.pdf p.63, SCPI Patrimmo Croissance - Note d'information.pdf p.13)
- **Prix souscription :** 677 € (p.40)
- **VR :** 678.58 € (p.40)
- **VR ajustée :** — 
- **Réalisation :** 566.77 € (p.40)
- **Division :** non
- **Décote/surcote :** -0.23 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Depuis le 21 janvier 2025, le prix de souscription des parts de la SCPI a été modifié. Il est passé de 733,35 euros à 67 | VR: Valeur de reconstitution 190 131 885,44 678,58 | Écart: -0.23 % (decote) | Statut: verified
- **Tokens :** 8892

### Perial Grand Paris

- **Dossier :** `SCPI Perial grand Paris`
- **Document :** 6a170142eee56f95d9d2e1e9_Rapport annuel_PGP_sfdr_2025.pdf + 69f21276045720608dcec789_PGP BTI T1 2026.pdf
- **Pages LLM :** 6 (6a170142eee56f95d9d2e1e9_Rapport annuel_PGP_sfdr_2025.pdf p.10, 6a170142eee56f95d9d2e1e9_Rapport annuel_PGP_sfdr_2025.pdf p.18, 6a170142eee56f95d9d2e1e9_Rapport annuel_PGP_sfdr_2025.pdf p.32, 69f21276045720608dcec789_PGP BTI T1 2026.pdf p.7, 6a170142eee56f95d9d2e1e9_Rapport annuel_PGP_sfdr_2025.pdf p.12, 6a170142eee56f95d9d2e1e9_Rapport annuel_PGP_sfdr_2025.pdf p.25)
- **Prix souscription :** 458 € (p.7)
- **VR :** 423.34 € (p.10)
- **VR ajustée :** — 
- **Réalisation :** 327.65 € (p.10)
- **Division :** non
- **Décote/surcote :** 8.19 % (surcote)
- **Statut :** `verified`
- **Commentaire :** Prix: Capitalisation 1 051 871 654 €, Nombre de parts 2 296 663 → Prix = 458,00 € | VR: valeur de reconstitution a atteint 423,34 € par part | Écart: 8.19 % (surcote) | Statut: verified
- **Tokens :** 11575

### Perial Hospitalité Europe

- **Dossier :** `SCPI Perial Hospitalité Europe`
- **Document :** 6a1700ee719f7ecaa2547fb8_Rapport annuel_PHE_sfdr_2025.pdf + 69f211f2615fb9af629c1495_PHE BTI T1 2026.pdf
- **Pages LLM :** 6 (6a1700ee719f7ecaa2547fb8_Rapport annuel_PHE_sfdr_2025.pdf p.12, 6a1700ee719f7ecaa2547fb8_Rapport annuel_PHE_sfdr_2025.pdf p.28, 69f211f2615fb9af629c1495_PHE BTI T1 2026.pdf p.11, 69f211f2615fb9af629c1495_PHE BTI T1 2026.pdf p.10, 69f211f2615fb9af629c1495_PHE BTI T1 2026.pdf p.8, 6a1700ee719f7ecaa2547fb8_Rapport annuel_PHE_sfdr_2025.pdf p.9)
- **Prix souscription :** 181 € (p.10)
- **VR :** 176.47 € (p.8)
- **VR ajustée :** — 
- **Réalisation :** 142.38 € (p.8)
- **Division :** non
- **Décote/surcote :** 2.57 % (surcote)
- **Statut :** `verified`
- **Commentaire :** Prix: PRIX DE SOUSCRIPTION D’UNE PART 181,00 € | VR: VALEUR DE RECONSTITUTION PAR PART 176,47 € | Écart: 2.57 % (surcote) | Statut: verified
- **Tokens :** 8414

### Pierval Santé

- **Dossier :** `SCPI Pierval Santé`
- **Document :** Statuts-SCPI-Pierval-Sante_MAJ-AGE-30-06-2025.pdf + Note-information-SCPI-PIERVAL-SANTE-032026-annexes.pdf + BT_PIERVAL_SANTE_2026_T1.pdf
- **Pages LLM :** 6 (Statuts-SCPI-Pierval-Sante_MAJ-AGE-30-06-2025.pdf p.6, Note-information-SCPI-PIERVAL-SANTE-032026-annexes.pdf p.19, Statuts-SCPI-Pierval-Sante_MAJ-AGE-30-06-2025.pdf p.5, Statuts-SCPI-Pierval-Sante_MAJ-AGE-30-06-2025.pdf p.9, Note-information-SCPI-PIERVAL-SANTE-032026-annexes.pdf p.23, BT_PIERVAL_SANTE_2026_T1.pdf p.4)
- **Prix souscription :** 204 € (p.4)
- **VR :** 199.2 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** 2.41 % (surcote)
- **Statut :** `verified`
- **Anomalies :** Valeur de réalisation introuvable.
- **Commentaire :** Prix: 204 € | VR: 199,20 € | Écart: 2.41 % (surcote) | Statut: verified
- **Tokens :** 9401

### Praemia

- **Dossier :** `SCPI Praemia`
- **Document :** PRAEMIA_BTI_Patrimmo Commerce_T1_2026.pdf + Rapport Annuel 2024 Patrimmo Commerce.pdf + SCPI Patrimmo Commerce - Note d'information.pdf
- **Pages LLM :** 6 (PRAEMIA_BTI_Patrimmo Commerce_T1_2026.pdf p.3, PRAEMIA_BTI_Patrimmo Commerce_T1_2026.pdf p.6, Rapport Annuel 2024 Patrimmo Commerce.pdf p.6, Rapport Annuel 2024 Patrimmo Commerce.pdf p.75, SCPI Patrimmo Commerce - Note d'information.pdf p.13, SCPI Patrimmo Commerce - Note d'information.pdf p.14)
- **Prix souscription :** —
- **VR :** —
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** DeepSeek API returned an empty response.
- **Statut :** `rejected`
- **Anomalies :** Erreur API: DeepSeek API returned an empty response.
- **Commentaire :** Erreur API: DeepSeek API returned an empty response.

### Praemia Hotels Europe

- **Dossier :** `scpi Praemia Hotels Europe`
- **Document :** PRAEMIA_BTI_Praemia_Hotels_Europe_T1_2026.pdf + 2026 02 10 Praemia Hotels Europe - NI v3c.pdf
- **Pages LLM :** 6 (PRAEMIA_BTI_Praemia_Hotels_Europe_T1_2026.pdf p.3, PRAEMIA_BTI_Praemia_Hotels_Europe_T1_2026.pdf p.6, 2026 02 10 Praemia Hotels Europe - NI v3c.pdf p.12, PRAEMIA_BTI_Praemia_Hotels_Europe_T1_2026.pdf p.2, PRAEMIA_BTI_Praemia_Hotels_Europe_T1_2026.pdf p.7, 2026 02 10 Praemia Hotels Europe - NI v3c.pdf p.15)
- **Prix souscription :** —
- **VR :** —
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Praemia Hotels Europe",
  "source_periode": "1er trimestre 2026",
  "prix_souscription": {
    "value": 204.00,
    "unit": "EUR/part",
    "confidence": 1,
    "extract": "Le prix de
- **Statut :** `rejected`
- **Anomalies :** Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Praemia Hotels Europe",
  "source_periode": "1er trimestre 2026",
  "prix_souscription": {
    "value": 204.00,
    "unit": "EUR/part",
    "confidence": 1,
    "extract": "Le prix de
- **Commentaire :** Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Praemia Hotels Europe",
  "source_periode": "1er trimestre 2026",
  "prix_souscription": {
    "value": 204.00,
    "unit": "EUR/part",
    "confidence": 1,
    "extract": "Le prix de

### Primopierre

- **Dossier :** `scpi Primopierre`
- **Document :** SCPI Primopierre - Note d'information.pdf + PRAEMIA_BTI_Primopierre_T1_2026.pdf + Rapport Annuel 2024 Primopierre.pdf
- **Pages LLM :** 6 (SCPI Primopierre - Note d'information.pdf p.13, SCPI Primopierre - Note d'information.pdf p.22, PRAEMIA_BTI_Primopierre_T1_2026.pdf p.6, Rapport Annuel 2024 Primopierre.pdf p.6, Rapport Annuel 2024 Primopierre.pdf p.55, Rapport Annuel 2024 Primopierre.pdf p.75)
- **Prix souscription :** —
- **VR :** —
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Primopierre",
  "source_periode": "31/12/2024",
  "prix_souscription": {
    "value": 126.0,
    "unit": "EUR/part",
    "confidence": 1.0,
    "extract": "Prix de souscription (3) 12
- **Statut :** `rejected`
- **Anomalies :** Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Primopierre",
  "source_periode": "31/12/2024",
  "prix_souscription": {
    "value": 126.0,
    "unit": "EUR/part",
    "confidence": 1.0,
    "extract": "Prix de souscription (3) 12
- **Commentaire :** Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Primopierre",
  "source_periode": "31/12/2024",
  "prix_souscription": {
    "value": 126.0,
    "unit": "EUR/part",
    "confidence": 1.0,
    "extract": "Prix de souscription (3) 12

### Primovie

- **Dossier :** `SCPI Primovie`
- **Document :** PRAEMIA_BTI_Primovie_T1_2026.pdf + Rapport Annuel 2024 Primovie.pdf
- **Pages LLM :** 6 (PRAEMIA_BTI_Primovie_T1_2026.pdf p.3, PRAEMIA_BTI_Primovie_T1_2026.pdf p.6, Rapport Annuel 2024 Primovie.pdf p.6, Rapport Annuel 2024 Primovie.pdf p.61, Rapport Annuel 2024 Primovie.pdf p.77, Rapport Annuel 2024 Primovie.pdf p.81)
- **Prix souscription :** —
- **VR :** —
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** DeepSeek API returned an empty response.
- **Statut :** `rejected`
- **Anomalies :** Erreur API: DeepSeek API returned an empty response.
- **Commentaire :** Erreur API: DeepSeek API returned an empty response.

### Remake Live

- **Dossier :** `SCPI Remake Live`
- **Document :** documen2t.pdf + document1.pdf
- **Pages LLM :** 6 (documen2t.pdf p.17, documen2t.pdf p.21, document1.pdf p.11, documen2t.pdf p.3, documen2t.pdf p.10, documen2t.pdf p.15)
- **Prix souscription :** 204 € (p.17)
- **VR :** —
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié
- **Statut :** `manual_review`
- **Anomalies :** Valeur de reconstitution introuvable. / Valeur de réalisation introuvable.
- **Commentaire :** Prix: À dater du 1er juin 2023 et jusqu’à nouvel avis, le prix de souscription d’une part de la SCPI se décompose de la manièr | valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié | Statut: manual_review
- **Tokens :** 8080

### Remake UK 2025

- **Dossier :** `SCPI Remake UK 2025`
- **Document :** documen1t.pdf + document.2pdf.pdf + document.pdf
- **Pages LLM :** 6 (documen1t.pdf p.21, document.2pdf.pdf p.6, document.pdf p.18, document.2pdf.pdf p.15, document.2pdf.pdf p.22, documen1t.pdf p.20)
- **Prix souscription :** 1025 € (p.18)
- **VR :** 1037.16 € (p.18)
- **VR ajustée :** — 
- **Réalisation :** 870.93 € (p.18)
- **Division :** non
- **Décote/surcote :** -1.17 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Tranche 2 (en cours) ... Prix par part 1 025 € / part | VR: Valeur de reconstitution Au 31/12/2025 1 037,16 € | Écart: -1.17 % (decote) | Statut: verified
- **Tokens :** 7920

### Rivoli Avenir Patrimoine

- **Dossier :** `SCPI Rivoli Avenir Patrimoine`
- **Document :** RIVOLI AVENIR PATRIMOINE - Bulletin Semestriel 2025 S2-1.pdf + RIVOLI AVENIR PATRIMOINE - Bulletin Semestriel 2025 S2.pdf + RIVOLI AVENIR PATRIMOINE - Rapport Annuel - 2024.pdf
- **Pages LLM :** 6 (RIVOLI AVENIR PATRIMOINE - Bulletin Semestriel 2025 S2-1.pdf p.1, RIVOLI AVENIR PATRIMOINE - Bulletin Semestriel 2025 S2.pdf p.1, RIVOLI AVENIR PATRIMOINE - Rapport Annuel - 2024.pdf p.6, RIVOLI AVENIR PATRIMOINE - Rapport Annuel - 2024.pdf p.94, RIVOLI AVENIR PATRIMOINE - Rapport Annuel - 2024.pdf p.97, RIVOLI AVENIR PATRIMOINE - Rapport Annuel - 2024.pdf p.8)
- **Prix souscription :** —
- **VR :** —
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Rivoli Avenir Patrimoine",
  "source_periode": "31/12/2025",
  "prix_souscription": {
    "value": 228.00,
    "unit": "EUR/part",
    "confidence": 1.0,
    "extract": "228,00 € par 
- **Statut :** `rejected`
- **Anomalies :** Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Rivoli Avenir Patrimoine",
  "source_periode": "31/12/2025",
  "prix_souscription": {
    "value": 228.00,
    "unit": "EUR/part",
    "confidence": 1.0,
    "extract": "228,00 € par 
- **Commentaire :** Erreur API: DeepSeek response is not valid JSON. Raw content: {
  "nom_scpi": "Rivoli Avenir Patrimoine",
  "source_periode": "31/12/2025",
  "prix_souscription": {
    "value": 228.00,
    "unit": "EUR/part",
    "confidence": 1.0,
    "extract": "228,00 € par 

### Selectiinvest 1

- **Dossier :** `SCPI Selectiinvest 1`
- **Document :** I9_note_statuts.pdf + I9_BT_20260331.pdf + I9_rapportannuel.pdf
- **Pages LLM :** 6 (I9_note_statuts.pdf p.5, I9_note_statuts.pdf p.43, I9_BT_20260331.pdf p.4, I9_BT_20260331.pdf p.12, I9_rapportannuel.pdf p.5, I9_rapportannuel.pdf p.7)
- **Prix souscription :** 530 € (p.4)
- **VR :** 560.96 € (p.4)
- **VR ajustée :** — 
- **Réalisation :** 464.91 € (p.4)
- **Division :** non
- **Décote/surcote :** -5.52 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Minimum de souscription fixé à 1 part, soit (A)530,00 € | VR: Valeur de reconstitution 560,96 € | Écart: -5.52 % (decote) | Statut: verified
- **Tokens :** 8552

### Selectipierre 2 Paris

- **Dossier :** `SCPI Selectipierre 2 Paris`
- **Document :** Selectipierre 2 Paris - Rapport annuel 2025.pdf + BTI Selectipierre 2 T1 2026.pdf + Note d'information SELECTIPIERRE 2 01.2026.pdf
- **Pages LLM :** 6 (Selectipierre 2 Paris - Rapport annuel 2025.pdf p.5, BTI Selectipierre 2 T1 2026.pdf p.2, Selectipierre 2 Paris - Rapport annuel 2025.pdf p.27, Note d'information SELECTIPIERRE 2 01.2026.pdf p.39, Note d'information SELECTIPIERRE 2 01.2026.pdf p.56, Note d'information SELECTIPIERRE 2 01.2026.pdf p.41)
- **Prix souscription :** 773 € (p.5)
- **VR :** 785 € (p.5)
- **VR ajustée :** — 
- **Réalisation :** 652.21 € (p.5)
- **Division :** non
- **Décote/surcote :** -1.53 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: Prix de souscription (1) 773,00 € | VR: Valeur de reconstitution par part 785,00 € | Écart: -1.53 % (decote) | Statut: verified
- **Tokens :** 8959

### Sofiprime

- **Dossier :** `SCPI Sofiprime`
- **Document :** SOFIPRIME-BT-1T-2026.pdf + NI-SFP-042026.pdf
- **Pages LLM :** 6 (SOFIPRIME-BT-1T-2026.pdf p.5, NI-SFP-042026.pdf p.8, NI-SFP-042026.pdf p.9, NI-SFP-042026.pdf p.19, NI-SFP-042026.pdf p.4, NI-SFP-042026.pdf p.7)
- **Prix souscription :** 280 € (p.5)
- **VR :** 289.4 € (p.5)
- **VR ajustée :** — 
- **Réalisation :** 234 € (p.5)
- **Division :** non
- **Décote/surcote :** -3.25 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: 280 € | VR: 289,40 € | Écart: -3.25 % (decote) | Statut: verified
- **Tokens :** 10746

### Transition Europe

- **Dossier :** `SCPI Transition Europe`
- **Document :** arkea-reim-transition-europe-ra-2025_2026-05-18_18-57-3_193.pdf + 250630_scpi_transitions_europe_-_statuts.pdf + scpi_transitions_europe_-_note_d_information.pdf
- **Pages LLM :** 6 (arkea-reim-transition-europe-ra-2025_2026-05-18_18-57-3_193.pdf p.27, arkea-reim-transition-europe-ra-2025_2026-05-18_18-57-3_193.pdf p.28, 250630_scpi_transitions_europe_-_statuts.pdf p.6, scpi_transitions_europe_-_note_d_information.pdf p.16, arkea-reim-transition-europe-ra-2025_2026-05-18_18-57-3_193.pdf p.47, 250630_scpi_transitions_europe_-_statuts.pdf p.17)
- **Prix souscription :** 202 € (p.27)
- **VR :** 207.49 € (p.27)
- **VR ajustée :** — 
- **Réalisation :** 177.87 € (p.27)
- **Division :** non
- **Décote/surcote :** -2.65 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: 202 € Prix de souscription | VR: 207,49 € Valeur de reconstitution | Écart: -2.65 % (decote) | Statut: verified
- **Tokens :** 8286

### WEMO ONE

- **Dossier :** `scpi Wemo OIne`
- **Document :** BULLETIN-TRIMESTRIEL-N07-1T-2026-VFINALE-ok.pdf + RAPPORT-ANNUEL-N02-JANV-2026-Fina13_04_26.pdf
- **Pages LLM :** 6 (BULLETIN-TRIMESTRIEL-N07-1T-2026-VFINALE-ok.pdf p.7, BULLETIN-TRIMESTRIEL-N07-1T-2026-VFINALE-ok.pdf p.18, RAPPORT-ANNUEL-N02-JANV-2026-Fina13_04_26.pdf p.9, RAPPORT-ANNUEL-N02-JANV-2026-Fina13_04_26.pdf p.61, BULLETIN-TRIMESTRIEL-N07-1T-2026-VFINALE-ok.pdf p.9, RAPPORT-ANNUEL-N02-JANV-2026-Fina13_04_26.pdf p.21)
- **Prix souscription :** 200 € (p.7)
- **VR :** 218.5 € (p.7)
- **VR ajustée :** — 
- **Réalisation :** 187.3 € (p.7)
- **Division :** non
- **Décote/surcote :** -8.47 % (decote)
- **Statut :** `verified`
- **Commentaire :** Prix: PRIX DE SOUSCRIPTION D’UNE PART 200 € (1) commission de souscription incluse | VR: VALEUR DE RECONSTITUTION 218,5 € (au 31/12/2025) | Écart: -8.47 % (decote) | Statut: verified
- **Tokens :** 8622

### Urban Coeur Commerce

- **Dossier :** `Urban Coeur Commerce`
- **Document :** Urban-Coeur-Commerce_NI-Statuts-public.pdf + UCC_BT_1T2026.pdf
- **Pages LLM :** 6 (Urban-Coeur-Commerce_NI-Statuts-public.pdf p.14, UCC_BT_1T2026.pdf p.7, Urban-Coeur-Commerce_NI-Statuts-public.pdf p.6, UCC_BT_1T2026.pdf p.8, Urban-Coeur-Commerce_NI-Statuts-public.pdf p.7, Urban-Coeur-Commerce_NI-Statuts-public.pdf p.15)
- **Prix souscription :** 303 € (p.8)
- **VR :** —
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié
- **Statut :** `manual_review`
- **Anomalies :** Valeur de reconstitution introuvable. / Valeur de réalisation introuvable.
- **Commentaire :** Prix: Le prix de souscription de la part est de 303 € | valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié | Statut: manual_review
- **Tokens :** 9390

---

Données extraites automatiquement depuis documents officiels. Performances passées ne préjugent pas des performances futures. Pas de promesse de rendement.
