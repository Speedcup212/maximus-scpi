# Audit de cohérence prix / valeur de reconstitution / décote-surcote

_Généré le 2026-06-07T05:31:48.961Z_

## Méthode

- Périmètre : SCPI **visibles du comparateur** (base `scpiDataExtended` enrichie par `scpiData`).
- Prix affiché = `scpi.price`.
- **Avant correction** : décote = snapshot stocké (`discount`) ; VR affichée = priorité `scpiDataExtended`.
- **Après correction** : décote = recalcul live `(prix - VR)/VR×100` ; VR affichée = priorité VR validée par part ; garde-fou legacy.
- Tolérance : ±0.2 point.

## 1. Anomalies AVANT correction

- SCPI contrôlées : **63**
- OK : **15**
- WARNING (neutralisées QA) : **5**
- **CRITICAL (incohérences détectées) : 43**

## 2. Anomalies APRÈS correction

- SCPI contrôlées : **63**
- OK : **15**
- WARNING (neutralisées QA) : **5**
- FIXED_OR_NEUTRALIZED (corrigées ou masquées) : **43**
- **CRITICAL_REMAINING : 0**

### Condition de validation : CRITICAL_REMAINING = 0 → **VALIDÉ ✅**

## FIXED_OR_NEUTRALIZED — détail

| SCPI | QA | Prix | VR avant | Décote avant | VR après | Affichée après | Écart avant (pt) | Décision |
|---|---|---|---|---|---|---|---|---|
| Activimmo | publishable | 610 € | 609.65 € | -1.1% | 616.58 € | -1.1% | 1.13 | corrigé (recalcul live) |
| Aestiam Cap'Hebergimmo | — | 252 € | 268 € | -5.8% | 238.51 € | À vérifier | 0.21 | neutralisé (à vérifier) |
| Aestiam Pierre Rendement | — | 922 € | 1026 € | -3.2% | 952.51 € | -3.2% | 6.93 | neutralisé (à vérifier) |
| Aestiam Horizon | publishable | 350 € | 346 € | +0.7% | 347.63 € | +0.7% | 0.48 | corrigé (recalcul live) |
| Altixia Cadence 12 | publishable | 200 € | 200.54 € | +0.3% | 199.4 € | +0.3% | 0.57 | corrigé (recalcul live) |
| Altixia Commerces | publishable | 203 € | 190 € | -0.2% | 203.48 € | -0.2% | 7.08 | corrigé (recalcul live) |
| Atream Hotel | publishable | 1000 € | 993 € | -6.0% | 1064.33 € | -6.0% | 6.74 | corrigé (recalcul live) |
| Buroboutic Métropoles | publishable | 77 € | 213 € | +0.5% | 76.59 € | +0.5% | 64.39 | corrigé (recalcul live) |
| Coeur d'Europe | publishable | 204 € | 209 € | -7.0% | 219.47 € | -7.0% | 4.66 | corrigé (recalcul live) |
| Coeur de Région | publishable | 664 € | 640 € | -2.9% | 683.82 € | -2.9% | 6.65 | corrigé (recalcul live) |
| Coeur de ville | publishable | 210 € | 237 € | -6.4% | 224.28 € | -6.4% | 5.02 | corrigé (recalcul live) |
| Comète | publishable | 250 € | 255 € | -1.5% | 253.83 € | -1.5% | 0.45 | corrigé (recalcul live) |
| Cristal Life | publishable | 208 € | 257 € | -8.2% | 226.69 € | -8.2% | 10.83 | corrigé (recalcul live) |
| Efimmo 1 | publishable | 212 € | 202.65 € | +7.4% | 197.32 € | +7.4% | 2.83 | corrigé (recalcul live) |
| Épargne Foncière | publishable | 670 € | 672 € | -4.8% | 704.15 € | -4.8% | 4.55 | corrigé (recalcul live) |
| Épargne Pierre | publishable | 208 € | 208.64 € | +0.4% | 207.22 € | +0.4% | 0.69 | corrigé (recalcul live) |
| Épargne Pierre Europe | publishable | 200 € | 206.51 € | -2.6% | 205.4 € | -2.6% | 0.52 | corrigé (recalcul live) |
| Ficommerce Proximité | publishable | 70 € | 238 € | +1.0% | 69.29 € | +1.0% | 71.61 | corrigé (recalcul live) |
| Foncière des Praticiens | publishable | 1100 € | 1069 € | +4.9% | 1048.65 € | +4.9% | 2 | corrigé (recalcul live) |
| GMA Essentialis | publishable | 206 € | 167 € | -1.0% | 208.04 € | -1.0% | 24.33 | corrigé (recalcul live) |
| Immorente | publishable | 340 € | 328 € | +5.9% | 321.03 € | +5.9% | 2.25 | corrigé (recalcul live) |
| Kyaneos Pierre | publishable | 224 € | 263 € | -1.0% | 226.2 € | -1.0% | 13.86 | corrigé (recalcul live) |
| LF Avenir Santé | publishable | 300 € | 321 € | -0.8% | 302.3 € | -0.8% | 5.78 | corrigé (recalcul live) |
| LF Grand Paris Patrimoine | publishable | 218 € | 225 € | +0.5% | 216.96 € | +0.5% | 3.59 | corrigé (recalcul live) |
| Log In | publishable | 255 € | 270 € | -4.4% | 266.73 € | -4.4% | 1.16 | corrigé (recalcul live) |
| NCap Education Santé | publishable | 202 € | 206 € | +1.8% | 198.35 € | +1.8% | 3.78 | corrigé (recalcul live) |
| NCap Régions | publishable | 682 € | 701.49 € | -2.3% | 698.26 € | -2.3% | 0.45 | corrigé (recalcul live) |
| Novapierre 1 | publishable | 442 € | 462 € | +1.4% | 436.06 € | +1.4% | 5.69 | corrigé (recalcul live) |
| Novapierre Résidentiel | — | 1664 € | 1549 € | +5.2% | 1562.52 € | À vérifier | 2.2 | neutralisé (à vérifier) |
| Opportunité Immo | publishable | 203 € | 215.4 € | -5.4% | 214.64 € | -5.4% | 0.34 | corrigé (recalcul live) |
| Paref Evo | publishable | 250 € | 248 € | +2.0% | 245.04 € | +2.0% | 1.21 | corrigé (recalcul live) |
| Paref Hexa | publishable | 172 € | 196.02 € | +1.0% | 170.24 € | +1.0% | 13.28 | corrigé (recalcul live) |
| Patrimmo Croissance Impact | publishable | 677 € | 717 € | -0.2% | 678.58 € | -0.2% | 5.35 | corrigé (recalcul live) |
| Perial Grand Paris | publishable | 458 € | 451 € | +8.2% | 423.34 € | +8.2% | 6.64 | corrigé (recalcul live) |
| Perial Hospitalité Europe | publishable | 181 € | 211 € | +2.6% | 176.47 € | +2.6% | 16.79 | corrigé (recalcul live) |
| Perial O2 | publishable | 164 € | 175 € | +8.8% | 150.73 € | +8.8% | 15.09 | corrigé (recalcul live) |
| Perial Opportunités Europe | publishable | 44 € | 43.5 € | +2.5% | 42.93 € | +2.5% | 1.34 | corrigé (recalcul live) |
| Selectinvest 1 | publishable | 530 € | 566 € | -5.5% | 560.96 € | -5.5% | 0.84 | corrigé (recalcul live) |
| Selectipierre 2 | publishable | 773 € | 813 € | -1.5% | 785 € | -1.5% | 3.39 | corrigé (recalcul live) |
| Sofiprime | publishable | 280 € | 273 € | -3.3% | 289.4 € | -3.2% | 5.81 | corrigé (recalcul live) |
| Transitions Europe | publishable | 202 € | 210 € | -2.6% | 207.49 € | -2.6% | 1.16 | corrigé (recalcul live) |
| Urban Coeur de Commerce | publishable | 303 € | 284 € | 0.0% | 303 € | 0.0% | 6.69 | corrigé (recalcul live) |
| Wemo One | publishable | 210 € | 218.5 € | -8.5% | 218.5 € | -3.9% | 4.58 | corrigé (recalcul live) |

### Justification

- **Activimmo** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -1.1% incohérente (VR affichée 609.65 €). Après : VR validée par part 616.58 €, décote recalculée -1.1% cohérente avec le prix 610 €.
- **Aestiam Cap'Hebergimmo** (QA indéfini) — décision : **neutralisé (à vérifier)**
  - Avant : décote -5.8% incohérente (VR affichée 268 €, statut QA indéfini). Après : valeurs source non comparables → décote neutralisée (À vérifier).
- **Aestiam Pierre Rendement** (QA indéfini) — décision : **neutralisé (à vérifier)**
  - Avant : décote -3.2% incohérente (VR affichée 1026 €, statut QA indéfini). Après : valeurs source non comparables → décote neutralisée (-3.2%).
- **Aestiam Horizon** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +0.7% incohérente (VR affichée 346 €). Après : VR validée par part 347.63 €, décote recalculée +0.7% cohérente avec le prix 350 €.
- **Altixia Cadence 12** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +0.3% incohérente (VR affichée 200.54 €). Après : VR validée par part 199.4 €, décote recalculée +0.3% cohérente avec le prix 200 €.
- **Altixia Commerces** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -0.2% incohérente (VR affichée 190 €). Après : VR validée par part 203.48 €, décote recalculée -0.2% cohérente avec le prix 203 €.
- **Atream Hotel** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -6.0% incohérente (VR affichée 993 €). Après : VR validée par part 1064.33 €, décote recalculée -6.0% cohérente avec le prix 1000 €.
- **Buroboutic Métropoles** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +0.5% incohérente (VR affichée 213 €). Après : VR validée par part 76.59 €, décote recalculée +0.5% cohérente avec le prix 77 €.
- **Coeur d'Europe** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -7.0% incohérente (VR affichée 209 €). Après : VR validée par part 219.47 €, décote recalculée -7.0% cohérente avec le prix 204 €.
- **Coeur de Région** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -2.9% incohérente (VR affichée 640 €). Après : VR validée par part 683.82 €, décote recalculée -2.9% cohérente avec le prix 664 €.
- **Coeur de ville** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -6.4% incohérente (VR affichée 237 €). Après : VR validée par part 224.28 €, décote recalculée -6.4% cohérente avec le prix 210 €.
- **Comète** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -1.5% incohérente (VR affichée 255 €). Après : VR validée par part 253.83 €, décote recalculée -1.5% cohérente avec le prix 250 €.
- **Cristal Life** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -8.2% incohérente (VR affichée 257 €). Après : VR validée par part 226.69 €, décote recalculée -8.2% cohérente avec le prix 208 €.
- **Efimmo 1** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +7.4% incohérente (VR affichée 202.65 €). Après : VR validée par part 197.32 €, décote recalculée +7.4% cohérente avec le prix 212 €.
- **Épargne Foncière** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -4.8% incohérente (VR affichée 672 €). Après : VR validée par part 704.15 €, décote recalculée -4.8% cohérente avec le prix 670 €.
- **Épargne Pierre** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +0.4% incohérente (VR affichée 208.64 €). Après : VR validée par part 207.22 €, décote recalculée +0.4% cohérente avec le prix 208 €.
- **Épargne Pierre Europe** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -2.6% incohérente (VR affichée 206.51 €). Après : VR validée par part 205.4 €, décote recalculée -2.6% cohérente avec le prix 200 €.
- **Ficommerce Proximité** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +1.0% incohérente (VR affichée 238 €). Après : VR validée par part 69.29 €, décote recalculée +1.0% cohérente avec le prix 70 €.
- **Foncière des Praticiens** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +4.9% incohérente (VR affichée 1069 €). Après : VR validée par part 1048.65 €, décote recalculée +4.9% cohérente avec le prix 1100 €.
- **GMA Essentialis** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -1.0% incohérente (VR affichée 167 €). Après : VR validée par part 208.04 €, décote recalculée -1.0% cohérente avec le prix 206 €.
- **Immorente** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +5.9% incohérente (VR affichée 328 €). Après : VR validée par part 321.03 €, décote recalculée +5.9% cohérente avec le prix 340 €.
- **Kyaneos Pierre** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -1.0% incohérente (VR affichée 263 €). Après : VR validée par part 226.2 €, décote recalculée -1.0% cohérente avec le prix 224 €.
- **LF Avenir Santé** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -0.8% incohérente (VR affichée 321 €). Après : VR validée par part 302.3 €, décote recalculée -0.8% cohérente avec le prix 300 €.
- **LF Grand Paris Patrimoine** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +0.5% incohérente (VR affichée 225 €). Après : VR validée par part 216.96 €, décote recalculée +0.5% cohérente avec le prix 218 €.
- **Log In** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -4.4% incohérente (VR affichée 270 €). Après : VR validée par part 266.73 €, décote recalculée -4.4% cohérente avec le prix 255 €.
- **NCap Education Santé** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +1.8% incohérente (VR affichée 206 €). Après : VR validée par part 198.35 €, décote recalculée +1.8% cohérente avec le prix 202 €.
- **NCap Régions** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -2.3% incohérente (VR affichée 701.49 €). Après : VR validée par part 698.26 €, décote recalculée -2.3% cohérente avec le prix 682 €.
- **Novapierre 1** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +1.4% incohérente (VR affichée 462 €). Après : VR validée par part 436.06 €, décote recalculée +1.4% cohérente avec le prix 442 €.
- **Novapierre Résidentiel** (QA indéfini) — décision : **neutralisé (à vérifier)**
  - Avant : décote +5.2% incohérente (VR affichée 1549 €, statut QA indéfini). Après : valeurs source non comparables → décote neutralisée (À vérifier).
- **Opportunité Immo** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -5.4% incohérente (VR affichée 215.4 €). Après : VR validée par part 214.64 €, décote recalculée -5.4% cohérente avec le prix 203 €.
- **Paref Evo** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +2.0% incohérente (VR affichée 248 €). Après : VR validée par part 245.04 €, décote recalculée +2.0% cohérente avec le prix 250 €.
- **Paref Hexa** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +1.0% incohérente (VR affichée 196.02 €). Après : VR validée par part 170.24 €, décote recalculée +1.0% cohérente avec le prix 172 €.
- **Patrimmo Croissance Impact** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -0.2% incohérente (VR affichée 717 €). Après : VR validée par part 678.58 €, décote recalculée -0.2% cohérente avec le prix 677 €.
- **Perial Grand Paris** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +8.2% incohérente (VR affichée 451 €). Après : VR validée par part 423.34 €, décote recalculée +8.2% cohérente avec le prix 458 €.
- **Perial Hospitalité Europe** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +2.6% incohérente (VR affichée 211 €). Après : VR validée par part 176.47 €, décote recalculée +2.6% cohérente avec le prix 181 €.
- **Perial O2** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +8.8% incohérente (VR affichée 175 €). Après : VR validée par part 150.73 €, décote recalculée +8.8% cohérente avec le prix 164 €.
- **Perial Opportunités Europe** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote +2.5% incohérente (VR affichée 43.5 €). Après : VR validée par part 42.93 €, décote recalculée +2.5% cohérente avec le prix 44 €.
- **Selectinvest 1** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -5.5% incohérente (VR affichée 566 €). Après : VR validée par part 560.96 €, décote recalculée -5.5% cohérente avec le prix 530 €.
- **Selectipierre 2** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -1.5% incohérente (VR affichée 813 €). Après : VR validée par part 785 €, décote recalculée -1.5% cohérente avec le prix 773 €.
- **Sofiprime** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -3.3% incohérente (VR affichée 273 €). Après : VR validée par part 289.4 €, décote recalculée -3.2% cohérente avec le prix 280 €.
- **Transitions Europe** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -2.6% incohérente (VR affichée 210 €). Après : VR validée par part 207.49 €, décote recalculée -2.6% cohérente avec le prix 202 €.
- **Urban Coeur de Commerce** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote 0.0% incohérente (VR affichée 284 €). Après : VR validée par part 303 €, décote recalculée 0.0% cohérente avec le prix 303 €.
- **Wemo One** (publishable) — décision : **corrigé (recalcul live)**
  - Avant : décote -8.5% incohérente (VR affichée 218.5 €). Après : VR validée par part 218.5 €, décote recalculée -3.9% cohérente avec le prix 210 €.

## WARNING — neutralisées QA

| SCPI | QA | Prix | VR avant | Décote avant | VR après | Affichée après | Écart avant (pt) | Décision |
|---|---|---|---|---|---|---|---|---|
| Edissimo | manual_review | 172 € | 187 € | À vérifier | 364.52 € | À vérifier | — | à vérifier |
| Novaxia NEO | manual_review | 176.68 € | 187 € | À vérifier | 187 € | À vérifier | — | à vérifier |
| Optimale | manual_review | 255 € | 241 € | À vérifier | 268.22 € | À vérifier | — | à vérifier |
| Remake Live | manual_review | 204 € | 203 € | À vérifier | 203.52 € | À vérifier | — | à vérifier |
| Rivoli Avenir Patrimoine | manual_review | 228 € | N/A € | À vérifier | N/A € | À vérifier | — | à vérifier |

## OK — cohérentes

| SCPI | QA | Prix | VR avant | Décote avant | VR après | Affichée après | Écart avant (pt) | Décision |
|---|---|---|---|---|---|---|---|---|
| Crédit Mutuel Pierre 1 | publishable | 215 € | 219.5 € | -2.0% | 219.5 € | -2.1% | 0 | aucune |
| ESG Pierre Capital | — | 188 € | 187.11 € | +0.5% | 187.11 € | +0.5% | 0 | aucune |
| Grand Paris Résidentiel | publishable | 200 € | 186 € | +7.4% | 186.25 € | +7.4% | 0.15 | aucune |
| Iroko Zen | publishable | 204 € | 213.65 € | -4.7% | 213.94 € | -4.6% | 0.13 | aucune |
| LF Europimmo | publishable | 725 € | 774 € | -6.3% | 773.78 € | -6.3% | 0.03 | aucune |
| NCap Continent | publishable | 210 € | 214.87 € | -2.3% | 214.87 € | -2.3% | 0 | aucune |
| Iroko Atlas | publishable | 200 € | 204.87 € | -2.4% | 204.87 € | -2.4% | 0 | aucune |
| Epsicap Nano | publishable | 257 € | 279.57 € | -8.1% | 279.57 € | -8.1% | 0 | aucune |
| Alta Convictions | publishable | 308 € | 333.68 € | -7.7% | 333.68 € | -7.7% | 0 | aucune |
| Cristal Rente | publishable | 255.68 € | 269.32 € | -5.1% | 269.32 € | -5.1% | 0 | aucune |
| Primovie | publishable | 164 € | 152.74 € | +7.4% | 152.74 € | +7.4% | 0 | aucune |
| Praemia Hôtels Europe | publishable | 204 € | 201.43 € | +1.3% | 201.43 € | +1.3% | 0 | aucune |
| Pierval Santé | publishable | 204 € | 199.2 € | +2.4% | 199.2 € | +2.4% | 0 | aucune |
| Patrimmo Commerce | publishable | 160 € | 151.36 € | +5.7% | 151.36 € | +5.7% | 0 | aucune |
| Aestiam Agora | publishable | 922 € | 965.93 € | -4.5% | 965.93 € | -4.5% | 0 | aucune |
