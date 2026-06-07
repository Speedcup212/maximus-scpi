# Rapport reprise ciblée — DeepSeek reconstitution SCPI non vérifiées

**Date :** 2026-06-06
**Provider :** deepseek (deepseek-v4-pro)
**Source :** data-import/scpi-agent/deepseek_reconstitution_full.json
**SCPI retraitées :** 14

## Bilan de la reprise

| Évolution | Nombre |
|-----------|--------|
| Devenues verified | 9 |
| Devenues verified_adjusted_split | 0 |
| Restées manual_review | 5 |
| Restées rejected | 0 |

## Statuts finaux (lot retraité)

| Statut | Nombre |
|--------|--------|
| verified | 9 |
| verified_adjusted_split | 0 |
| manual_review | 5 |
| rejected | 0 |

## Tokens & coût supplémentaire

- Prompt tokens : 127410
- Completion tokens : 48422
- Total tokens : 175832
- Coût supplémentaire estimé (indicatif) : ~0.1758 USD

## SCPI encore non publiables

| SCPI | Statut | Raison |
|------|--------|--------|
| Novaxia NEO | `manual_review` | données partielles ou non fiables |
| Optimale | `manual_review` | valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié |
| Primopierre | `manual_review` | données partielles ou non fiables |
| Remake Live | `manual_review` | valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié |
| Rivoli Avenir Patrimoine | `manual_review` | données partielles ou non fiables |

## Détail par SCPI

### Cœur Avenir

- **Évolution :** rejected → verified
- **Dossier :** `SCPI Coeur Avenir`
- **Document :** SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T1-2026.pdf + Rapport-annuel-2025-–-Coeur-dAvenir.pdf + Note-dinformation-–-Coeur-dAvenir.pdf
- **Pages LLM :** 8 (SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T1-2026.pdf p.9, Rapport-annuel-2025-–-Coeur-dAvenir.pdf p.19, Note-dinformation-–-Coeur-dAvenir.pdf p.12, Note-dinformation-–-Coeur-dAvenir.pdf p.13, Note-dinformation-–-Coeur-dAvenir.pdf p.16, SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T1-2026.pdf p.4, Rapport-annuel-2025-–-Coeur-dAvenir.pdf p.12, Rapport-annuel-2025-–-Coeur-dAvenir.pdf p.24)
- **Prix souscription :** 200 € (p.12)
- **VR :** 217.47 € (p.19)
- **VR ajustée :** — 
- **Réalisation :** 176.58 € (p.19)
- **Division :** non
- **Décote/surcote :** -8.03 % (decote)
- **Statut final :** `verified`
- **Commentaire :** Prix: Le prix de la part de Cœur d’Avenir est aujourd’hui de 200 € | VR: Valeur de reconstitution 10 299 494,41 €  217,47 € | Écart: -8.03 % (decote) | Statut: verified
- **Tokens :** 11373

### Coeur de ville

- **Évolution :** rejected → verified
- **Dossier :** `SCPI Coeur de ville`
- **Document :** Bulletin-Trimestriel-1T-2026-–-Coeur-de-Ville.pdf + Rapport-annuel-2025-–-Coeur-de-Ville.pdf + Note-dinformation-–-Coeur-de-Ville.pdf + Statuts-–-Coeur-de-Ville.pdf
- **Pages LLM :** 8 (Bulletin-Trimestriel-1T-2026-–-Coeur-de-Ville.pdf p.5, Bulletin-Trimestriel-1T-2026-–-Coeur-de-Ville.pdf p.9, Rapport-annuel-2025-–-Coeur-de-Ville.pdf p.24, Note-dinformation-–-Coeur-de-Ville.pdf p.9, Note-dinformation-–-Coeur-de-Ville.pdf p.12, Statuts-–-Coeur-de-Ville.pdf p.4, Bulletin-Trimestriel-1T-2026-–-Coeur-de-Ville.pdf p.2, Rapport-annuel-2025-–-Coeur-de-Ville.pdf p.16)
- **Prix souscription :** 210 € (p.5)
- **VR :** 224.28 € (p.5)
- **VR ajustée :** — 
- **Réalisation :** 178.63 € (p.5)
- **Division :** non
- **Décote/surcote :** -6.37 % (decote)
- **Statut final :** `verified`
- **Commentaire :** Prix: Prix de souscription210 € | VR: Valeur de reconstitution224,28 € | Écart: -6.37 % (decote) | Statut: verified
- **Tokens :** 11930

### Efimmo 1

- **Évolution :** manual_review → verified
- **Dossier :** `SCPI Efimmo 1`
- **Document :** EFIMMO-BT-1T-2026.pdf + NI-EF-042026.pdf + DIC-EF-042026.pdf
- **Pages LLM :** 8 (EFIMMO-BT-1T-2026.pdf p.5, NI-EF-042026.pdf p.7, NI-EF-042026.pdf p.12, NI-EF-042026.pdf p.13, NI-EF-042026.pdf p.9, NI-EF-042026.pdf p.15, DIC-EF-042026.pdf p.1, EFIMMO-BT-1T-2026.pdf p.6)
- **Prix souscription :** 212 € (p.9)
- **VR :** 197.32 € (p.5)
- **VR ajustée :** — 
- **Réalisation :** 164.04 € (p.5)
- **Division :** non
- **Décote/surcote :** 7.44 % (surcote)
- **Statut final :** `verified`
- **Commentaire :** Prix: Prix de souscription 212 € | VR: Valeur de reconstitution 197,32 € | Écart: 7.44 % (surcote) | Statut: verified
- **Tokens :** 11637

### Elialys

- **Évolution :** manual_review → verified
- **Dossier :** `SCPI Elialys`
- **Document :** Elialys-BT-1T-2026.pdf + Elialys-AG-2026-Rapport-Annuel-2025.pdf + SCPI_Elialys_Note_d_information.pdf
- **Pages LLM :** 8 (Elialys-BT-1T-2026.pdf p.10, Elialys-BT-1T-2026.pdf p.2, Elialys-BT-1T-2026.pdf p.3, Elialys-AG-2026-Rapport-Annuel-2025.pdf p.2, Elialys-AG-2026-Rapport-Annuel-2025.pdf p.14, Elialys-AG-2026-Rapport-Annuel-2025.pdf p.75, Elialys-AG-2026-Rapport-Annuel-2025.pdf p.15, SCPI_Elialys_Note_d_information.pdf p.10)
- **Prix souscription :** 204 € (p.10)
- **VR :** 218.8 € (p.2)
- **VR ajustée :** — 
- **Réalisation :** 179.68 € (p.2)
- **Division :** oui (×5)
- **Décote/surcote :** -6.76 % (decote)
- **Statut final :** `verified`
- **Anomalies :** Division nominale ×5 détectée (1er janvier 2025) — valeurs à harmoniser. / Split détecté mais valeur de reconstitution ajustée non calculable.
- **Commentaire :** Prix: Prix de souscription : 204 € | VR: valeur de reconstitution à 218,80 € | Division nominale ×5 (1er janvier 2025) | Écart: -6.76 % (decote) | Statut: verified
- **Tokens :** 13098

### HEXA

- **Évolution :** rejected → verified
- **Dossier :** `SCPI HEXA`
- **Document :** d5acee18-1994-48e5-ac76-d343abbcf566-BTI-T1-2026-PAREF-Hexa.pdf + be276c50-22c0-40de-af46-658831ee520d-Rapport-annuel-SCPI-PAREF-Hexa-2024.pdf + b108e992-030c-4618-9f9e-5ee9b1ace93e-01.01.2026NI-PAREF-Hexa.pdf + 9f42e78c-a44c-46b5-af0e-67a3f1b6fd94-2025StatutsPAREFHexa.pdf
- **Pages LLM :** 8 (d5acee18-1994-48e5-ac76-d343abbcf566-BTI-T1-2026-PAREF-Hexa.pdf p.7, d5acee18-1994-48e5-ac76-d343abbcf566-BTI-T1-2026-PAREF-Hexa.pdf p.8, be276c50-22c0-40de-af46-658831ee520d-Rapport-annuel-SCPI-PAREF-Hexa-2024.pdf p.6, b108e992-030c-4618-9f9e-5ee9b1ace93e-01.01.2026NI-PAREF-Hexa.pdf p.24, be276c50-22c0-40de-af46-658831ee520d-Rapport-annuel-SCPI-PAREF-Hexa-2024.pdf p.22, d5acee18-1994-48e5-ac76-d343abbcf566-BTI-T1-2026-PAREF-Hexa.pdf p.3, be276c50-22c0-40de-af46-658831ee520d-Rapport-annuel-SCPI-PAREF-Hexa-2024.pdf p.21, 9f42e78c-a44c-46b5-af0e-67a3f1b6fd94-2025StatutsPAREFHexa.pdf p.12)
- **Prix souscription :** 172 € (p.3)
- **VR :** 170.24 € (p.3)
- **VR ajustée :** — 
- **Réalisation :** 137.95 € (p.3)
- **Division :** oui (×5)
- **Décote/surcote :** 1.03 % (surcote)
- **Statut final :** `verified`
- **Anomalies :** Division nominale ×5 détectée (01/10/2023) — valeurs à harmoniser. / Split détecté mais valeur de reconstitution ajustée non calculable.
- **Commentaire :** Prix: Valeur de la part : 172 € | VR: Valeur de reconstitution au 31/12/2025 : 170,24 € | Division nominale ×5 (01/10/2023) | Écart: 1.03 % (surcote) | Statut: verified
- **Tokens :** 13954

### Novaxia NEO

- **Évolution :** manual_review → manual_review
- **Dossier :** `SCPI Novaxia`
- **Document :** NOVAXIA-NEO-Statuts-V06.2023.pdf + Novaxia-NEO-Reporting-31_03_2026.pdf + NOVAXIA-NEO-Note-dInformation-V23.04.2026.pdf
- **Pages LLM :** 8 (NOVAXIA-NEO-Statuts-V06.2023.pdf p.7, Novaxia-NEO-Reporting-31_03_2026.pdf p.13, NOVAXIA-NEO-Note-dInformation-V23.04.2026.pdf p.19, NOVAXIA-NEO-Note-dInformation-V23.04.2026.pdf p.20, NOVAXIA-NEO-Statuts-V06.2023.pdf p.15, NOVAXIA-NEO-Statuts-V06.2023.pdf p.21, Novaxia-NEO-Reporting-31_03_2026.pdf p.7, NOVAXIA-NEO-Note-dInformation-V23.04.2026.pdf p.13)
- **Prix souscription :** 187 € (p.20)
- **VR :** 150.41 € (p.7)
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** 24.33 % (surcote)
- **Statut final :** `manual_review`
- **Anomalies :** Valeur de réalisation introuvable. / Écart décote/surcote inhabituel (24.33 %, > |15| %) — vérifier split ou erreur de saisie.
- **Commentaire :** Prix: Prix de souscription Cent quatre-vingt-sept (187) euros | VR: Valeur de reconstitution 2 par part 3 150,41 € | Écart: 24.33 % (surcote) | Statut: manual_review
- **Tokens :** 13664

### Optimale

- **Évolution :** manual_review → manual_review
- **Dossier :** `SCPI Optimale`
- **Document :** 2025.12.11-SCPI-OPTIMALE-Note-information-MAJ-PRIX-PART.pdf + 8.-SCPI-OPTIMALE-Statuts-mis-a-jour-AGM-3008-2024-verison-transfert_sign-EGuy.pdf + PLAQUETTE_SCPI_2026_Fev_V2.pdf
- **Pages LLM :** 8 (2025.12.11-SCPI-OPTIMALE-Note-information-MAJ-PRIX-PART.pdf p.8, 8.-SCPI-OPTIMALE-Statuts-mis-a-jour-AGM-3008-2024-verison-transfert_sign-EGuy.pdf p.6, 8.-SCPI-OPTIMALE-Statuts-mis-a-jour-AGM-3008-2024-verison-transfert_sign-EGuy.pdf p.7, PLAQUETTE_SCPI_2026_Fev_V2.pdf p.2, 2025.12.11-SCPI-OPTIMALE-Note-information-MAJ-PRIX-PART.pdf p.9, 8.-SCPI-OPTIMALE-Statuts-mis-a-jour-AGM-3008-2024-verison-transfert_sign-EGuy.pdf p.19, 8.-SCPI-OPTIMALE-Statuts-mis-a-jour-AGM-3008-2024-verison-transfert_sign-EGuy.pdf p.22, 8.-SCPI-OPTIMALE-Statuts-mis-a-jour-AGM-3008-2024-verison-transfert_sign-EGuy.pdf p.23)
- **Prix souscription :** 255 € (p.2)
- **VR :** —
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié
- **Statut final :** `manual_review`
- **Anomalies :** Valeur de reconstitution introuvable. / Valeur de réalisation introuvable.
- **Commentaire :** Prix: Prix de souscription : 255 € / part | valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié | Statut: manual_review
- **Tokens :** 11649

### Patrimmo Commerce

- **Évolution :** rejected → verified
- **Dossier :** `SCPI Praemia`
- **Document :** PRAEMIA_BTI_Patrimmo Commerce_T1_2026.pdf + Rapport Annuel 2024 Patrimmo Commerce.pdf + SCPI Patrimmo Commerce - Note d'information.pdf
- **Pages LLM :** 8 (PRAEMIA_BTI_Patrimmo Commerce_T1_2026.pdf p.3, PRAEMIA_BTI_Patrimmo Commerce_T1_2026.pdf p.6, Rapport Annuel 2024 Patrimmo Commerce.pdf p.6, Rapport Annuel 2024 Patrimmo Commerce.pdf p.75, SCPI Patrimmo Commerce - Note d'information.pdf p.13, SCPI Patrimmo Commerce - Note d'information.pdf p.14, PRAEMIA_BTI_Patrimmo Commerce_T1_2026.pdf p.2, PRAEMIA_BTI_Patrimmo Commerce_T1_2026.pdf p.7)
- **Prix souscription :** 160 € (p.3)
- **VR :** 151.36 € (p.3)
- **VR ajustée :** — 
- **Réalisation :** 126.9 € (p.3)
- **Division :** non
- **Décote/surcote :** 5.71 % (surcote)
- **Statut final :** `verified`
- **Commentaire :** Prix: RésidentsPrix de souscription: 160,00 € | VR: Valeur de reconstitution* au 31/12/2025: 151,36 € | Écart: 5.71 % (surcote) | Statut: verified
- **Tokens :** 14206

### Praemia Hotels Europe

- **Évolution :** rejected → verified
- **Dossier :** `scpi Praemia Hotels Europe`
- **Document :** PRAEMIA_BTI_Praemia_Hotels_Europe_T1_2026.pdf + 2026 02 10 Praemia Hotels Europe - NI v3c.pdf + Primofamily -Rapport annuel 2024.pdf
- **Pages LLM :** 8 (PRAEMIA_BTI_Praemia_Hotels_Europe_T1_2026.pdf p.3, PRAEMIA_BTI_Praemia_Hotels_Europe_T1_2026.pdf p.6, 2026 02 10 Praemia Hotels Europe - NI v3c.pdf p.12, Primofamily -Rapport annuel 2024.pdf p.6, Primofamily -Rapport annuel 2024.pdf p.47, Primofamily -Rapport annuel 2024.pdf p.67, PRAEMIA_BTI_Praemia_Hotels_Europe_T1_2026.pdf p.2, PRAEMIA_BTI_Praemia_Hotels_Europe_T1_2026.pdf p.7)
- **Prix souscription :** 204 € (p.3)
- **VR :** 201.43 € (p.3)
- **VR ajustée :** — 
- **Réalisation :** 170.19 € (p.3)
- **Division :** non
- **Décote/surcote :** 1.28 % (surcote)
- **Statut final :** `verified`
- **Commentaire :** Prix: 204,00 € | VR: 201,43 € | Écart: 1.28 % (surcote) | Statut: verified
- **Tokens :** 11574

### Primopierre

- **Évolution :** rejected → manual_review
- **Dossier :** `scpi Primopierre`
- **Document :** SCPI Primopierre - Note d'information.pdf + SCPI Primopierre - Statuts.pdf + PRAEMIA_BTI_Primopierre_T1_2026.pdf + Rapport Annuel 2024 Primopierre.pdf
- **Pages LLM :** 8 (SCPI Primopierre - Note d'information.pdf p.13, SCPI Primopierre - Note d'information.pdf p.22, SCPI Primopierre - Statuts.pdf p.7, PRAEMIA_BTI_Primopierre_T1_2026.pdf p.6, Rapport Annuel 2024 Primopierre.pdf p.6, Rapport Annuel 2024 Primopierre.pdf p.55, Rapport Annuel 2024 Primopierre.pdf p.75, SCPI Primopierre - Note d'information.pdf p.15)
- **Prix souscription :** 115 € (p.6)
- **VR :** 154.44 € (p.15)
- **VR ajustée :** — 
- **Réalisation :** 129.38 € (p.15)
- **Division :** non
- **Décote/surcote :** -25.54 % (decote)
- **Statut final :** `manual_review`
- **Anomalies :** Écart décote/surcote inhabituel (-25.54 %, > |15| %) — vérifier split ou erreur de saisie.
- **Commentaire :** Prix: À compter du 21 janvier 2025, le prix de souscription est de 115,00 euros | VR: Valeur de reconstitution : 2 926 249 561,00 €, soit 154,44 € par part | Écart: -25.54 % (decote) | Statut: manual_review
- **Tokens :** 12667

### Primovie

- **Évolution :** rejected → verified
- **Dossier :** `SCPI Primovie`
- **Document :** PRAEMIA_BTI_Primovie_T1_2026.pdf + Rapport Annuel 2024 Primovie.pdf + SCPI Primovie - Statuts.pdf
- **Pages LLM :** 8 (PRAEMIA_BTI_Primovie_T1_2026.pdf p.3, PRAEMIA_BTI_Primovie_T1_2026.pdf p.6, Rapport Annuel 2024 Primovie.pdf p.6, Rapport Annuel 2024 Primovie.pdf p.61, Rapport Annuel 2024 Primovie.pdf p.77, Rapport Annuel 2024 Primovie.pdf p.81, SCPI Primovie - Statuts.pdf p.7, PRAEMIA_BTI_Primovie_T1_2026.pdf p.7)
- **Prix souscription :** 164 € (p.3)
- **VR :** 152.74 € (p.3)
- **VR ajustée :** — 
- **Réalisation :** 129.1 € (p.3)
- **Division :** non
- **Décote/surcote :** 7.37 % (surcote)
- **Statut final :** `verified`
- **Commentaire :** Prix: Prix de souscription: 164,00 € | VR: Valeur de reconstitution* au 31/12/2025: 152,74 € | Écart: 7.37 % (surcote) | Statut: verified
- **Tokens :** 14114

### Remake Live

- **Évolution :** manual_review → manual_review
- **Dossier :** `SCPI Remake Live`
- **Document :** documen2t.pdf + documen5t.pdf + document1.pdf
- **Pages LLM :** 8 (documen2t.pdf p.17, documen5t.pdf p.7, documen5t.pdf p.6, documen5t.pdf p.15, documen5t.pdf p.21, documen2t.pdf p.21, document1.pdf p.11, documen2t.pdf p.3)
- **Prix souscription :** 204 € (p.17)
- **VR :** —
- **VR ajustée :** — 
- **Réalisation :** —
- **Division :** non
- **Décote/surcote :** valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié
- **Statut final :** `manual_review`
- **Anomalies :** Valeur de reconstitution introuvable. / Valeur de réalisation introuvable.
- **Commentaire :** Prix: Prix de souscription Deux cent quatre (204) euros | valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié | Statut: manual_review
- **Tokens :** 8364

### Rivoli Avenir Patrimoine

- **Évolution :** rejected → manual_review
- **Dossier :** `SCPI Rivoli Avenir Patrimoine`
- **Document :** RIVOLI AVENIR PATRIMOINE - Bulletin Semestriel 2025 S2-1.pdf + RIVOLI AVENIR PATRIMOINE - Bulletin Semestriel 2025 S2.pdf + RIVOLI AVENIR PATRIMOINE - Rapport Annuel - 2024.pdf + RIVOLI AVENIR PATRIMOINE-Note Information- Statuts 08082025.pdf
- **Pages LLM :** 8 (RIVOLI AVENIR PATRIMOINE - Bulletin Semestriel 2025 S2-1.pdf p.1, RIVOLI AVENIR PATRIMOINE - Bulletin Semestriel 2025 S2.pdf p.1, RIVOLI AVENIR PATRIMOINE - Rapport Annuel - 2024.pdf p.6, RIVOLI AVENIR PATRIMOINE - Rapport Annuel - 2024.pdf p.94, RIVOLI AVENIR PATRIMOINE - Rapport Annuel - 2024.pdf p.97, RIVOLI AVENIR PATRIMOINE-Note Information- Statuts 08082025.pdf p.5, RIVOLI AVENIR PATRIMOINE-Note Information- Statuts 08082025.pdf p.7, RIVOLI AVENIR PATRIMOINE-Note Information- Statuts 08082025.pdf p.9)
- **Prix souscription :** 228 € (p.1)
- **VR :** 216.58 € (p.1)
- **VR ajustée :** — 
- **Réalisation :** 187.67 € (p.1)
- **Division :** non
- **Décote/surcote :** 5.27 % (surcote)
- **Statut final :** `manual_review`
- **Commentaire :** Prix: Prix de souscription : 228,00 € par part | VR: Valeur de reconstitution (4) : 2 780 M€ | Écart: 5.27 % (surcote) | Statut: manual_review
- **Tokens :** 14300

### Urban Coeur Commerce

- **Évolution :** manual_review → verified
- **Dossier :** `Urban Coeur Commerce`
- **Document :** Urban-Coeur-Commerce_NI-Statuts-public.pdf + UCC_BT_1T2026.pdf
- **Pages LLM :** 8 (Urban-Coeur-Commerce_NI-Statuts-public.pdf p.14, UCC_BT_1T2026.pdf p.7, Urban-Coeur-Commerce_NI-Statuts-public.pdf p.6, UCC_BT_1T2026.pdf p.8, Urban-Coeur-Commerce_NI-Statuts-public.pdf p.7, Urban-Coeur-Commerce_NI-Statuts-public.pdf p.15, UCC_BT_1T2026.pdf p.2, Urban-Coeur-Commerce_NI-Statuts-public.pdf p.10)
- **Prix souscription :** 303 € (p.8)
- **VR :** 303 € (p.2)
- **VR ajustée :** — 
- **Réalisation :** 267.15 € (p.2)
- **Division :** non
- **Décote/surcote :** 0 % (parite)
- **Statut final :** `verified`
- **Commentaire :** Prix: Le prix de souscription de la part est de 303 € | VR: VALEUR DE RECONSTITUTION** 303 € | Écart: 0 % (parite) | Statut: verified
- **Tokens :** 13302

---

Données extraites automatiquement depuis documents officiels. Performances passées ne préjugent pas des performances futures. Pas de promesse de rendement.
