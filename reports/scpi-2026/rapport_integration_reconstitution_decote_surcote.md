# Rapport d'intégration — décote/surcote reconstitution

_Source UNIQUE autorisée : `data-import/scpi-agent/scpi_reconstitution_discount_validated.json`._
_Aucune valeur issue directement du full run ou du retry. Aucun appel API._

> Information générale, non personnalisée. Performances passées ≠ performances futures. Pas de promesse de rendement.
> Risque de perte en capital, revenus non garantis, liquidité limitée.

## 1. Synthèse intégration

| Indicateur | Valeur |
|---|---|
| SCPI publishable (QA) | 65 |
| → **intégrées avec décote/surcote** (présentes au catalogue front) | **55** |
| → publishable absentes du catalogue front (non intégrables sans fiche complète) | 10 |
| SCPI **neutralisées** `manual_review` (présentes au catalogue) | 5 |
| `manual_review` absente du catalogue | 1 (Primopierre) |
| `excluded_non_scpi` | 1 (Kyaneos Denormandie 4) |

Fichiers mis à jour : `src/data/scpi_complet.json`, `public/SCPI_complet_avec_SFDR_Profil.json` (champs `Surcote/décote (%)` + `Décote/Surcote QA`). Affichage QA-aware ajouté dans les composants.

## 2. Les 65 SCPI publishable

Triées par décote/surcote croissante. Colonne « Intégrée » = présence au catalogue front du comparateur.

| SCPI | Décote/Surcote | Intégrée au catalogue |
|---|---|---|
| LinaClub | -9.59 % | non (absente du catalogue) |
| EDR Europa | -9.36 % | non (absente du catalogue) |
| Europa | -9.36 % | non (absente du catalogue) |
| WEMO ONE | -8.47 % | oui |
| Cristal Life | -8.24 % | oui |
| Epsicap Nano | -8.07 % | oui |
| Cœur Avenir | -8.03 % | non (absente du catalogue) |
| Alta Convictions | -7.7 % | oui |
| Cœur d'Europe | -7.05 % | oui |
| Elialys | -6.76 % | non (absente du catalogue) |
| Coeur de ville | -6.37 % | oui |
| Europimmo | -6.3 % | oui (LF Europimmo) |
| Atream Hotel | -6.04 % | oui |
| Selectiinvest 1 | -5.52 % | oui (Selectinvest 1) |
| LF Opportunité Immo | -5.42 % | oui (Opportunité Immo) |
| Cristal Rente | -5.06 % | oui |
| Épargne Foncière | -4.85 % | oui |
| IrokoZen | -4.65 % | oui (Iroko Zen) |
| Aestiam Agora | -4.55 % | oui |
| Log In | -4.4 % | oui |
| Sofiprime | -3.25 % | oui |
| Coeur de régions | -2.9 % | oui (Coeur de Région) |
| Transition Europe | -2.65 % | oui (Transitions Europe) |
| Epargne Pierre Europe | -2.63 % | oui |
| Iroko Atlas | -2.38 % | oui |
| NCap Régions | -2.33 % | oui |
| NCAP Continent | -2.27 % | oui |
| Crédit Mutuel Pierre 1 | -2.05 % | oui |
| Selectipierre 2 Paris | -1.53 % | oui (Selectipierre 2) |
| Comete | -1.51 % | oui |
| Mistral Sélection | -1.2 % | non (absente du catalogue) |
| Remake UK 2025 | -1.17 % | oui |
| Activimmo | -1.07 % | oui |
| GMA Essentialis | -0.98 % | oui |
| Kyaneos | -0.97 % | oui (Kyaneos Pierre) |
| Lf Avenir Sante | -0.76 % | oui |
| Momentime | -0.75 % | non (absente du catalogue) |
| Altixia Commerces | -0.24 % | oui |
| Patrimmo Croissance Impact | -0.23 % | oui |
| Eurovalys | -0.13 % | non (absente du catalogue) |
| Urban Coeur Commerce | 0 % | oui (Urban Coeur de Commerce) |
| Altixia Cadence XII | +0.3 % | oui (Altixia Cadence 12) |
| Epargne Pierre | +0.38 % | oui |
| LF Grand Paris Patrimoine | +0.48 % | oui |
| Buroboutic | +0.54 % | oui (split ×3 appliqué) |
| Aestiam Horizon | +0.68 % | oui |
| Eden | +1.01 % | non (absente du catalogue) |
| Ficommerce Proximité | +1.02 % | oui (split ×3 appliqué) |
| HEXA | +1.03 % | oui (Paref Hexa, split ×5 NON appliqué) |
| Praemia Hotels Europe | +1.28 % | oui |
| Novapierre 1 | +1.36 % | oui |
| NCAP Education Santé | +1.84 % | oui |
| Osmo Energie | +1.97 % | non (absente du catalogue) |
| Paref Evo | +2.02 % | oui |
| Pierval Santé | +2.41 % | oui |
| Opportunités Europe | +2.49 % | oui (Perial Opportunités Europe, split ×20 appliqué) |
| Perial Hospitalité Europe | +2.57 % | oui |
| Foncière des praticiens | +4.9 % | oui |
| Patrimmo Commerce | +5.71 % | oui |
| Immorente | +5.91 % | oui |
| Primovie | +7.37 % | oui |
| Grand Paris Résidentiels | +7.38 % | oui (Grand Paris Résidentiel) |
| Efimmo 1 | +7.44 % | oui |
| Perial Grand Paris | +8.19 % | oui |
| Perial O2 | +8.8 % | oui |

**10 publishable absentes du catalogue front** (non intégrées) : LinaClub, EDR Europa, Europa, Cœur Avenir, Elialys, Mistral Sélection, Momentime, Eurovalys, Eden, Osmo Energie. Ces SCPI ont été extraites et QA-validées depuis les documents, mais n'existent pas dans le catalogue du comparateur (rendement, capitalisation, secteur, SFDR, profil de risque… manquants). Leur intégration nécessite la création d'une fiche complète — données non couvertes par la seule extraction de reconstitution.

## 3. Les 6 SCPI manual_review (indicateur neutralisé → « À vérifier »)

| SCPI | Écart calculé (non publié) | Décision QA | Au catalogue |
|---|---|---|---|
| Edissimmo | +6.48 % | VR globale (2 846 M€) ramenée par part — source nb de parts à valider | oui (Edissimo) → neutralisée |
| Novaxia NEO | +24.33 % | Écart > 20 % — justification documentaire requise | oui → neutralisée |
| Optimale | — | VR non exprimée par part / absente | oui → neutralisée |
| Remake Live | — | VR non exprimée par part / absente | oui → neutralisée |
| Rivoli Avenir Patrimoine | +5.27 % | VR globale (2 780 M€) ramenée par part — source nb de parts à valider | oui → neutralisée |
| Primopierre | -25.54 % | Écart > 20 % — justification documentaire requise | non (absente du catalogue) |

## 4. Confirmations

- ✅ **Source unique** : seule `scpi_reconstitution_discount_validated.json` a alimenté l'intégration. Aucune valeur lue directement depuis `deepseek_reconstitution_full.json` ou `…retry_non_verified.json`.
- ✅ **Décote/surcote affichée uniquement si `qa_status = publishable`** (champ `Décote/Surcote QA = publishable`).
- ✅ **`manual_review` jamais affichées comme fiables** : libellé « À vérifier », style neutre (gris). Composants rendus QA-aware :
  - `ScpiTable`, `ComparisonTable`, `ScpiDetailPage`, `AnalysisModal`, `OptimizedScpiLandingPage` (modèle `Scpi` via `discountQaStatus`) ;
  - `fintech/AnalysisDetailModal` (modèle `SCPIExtended`, propagation via `enrichScpiExtended`).
  - Helpers ajoutés dans `src/utils/formatters.ts` : `isDiscountReliable`, `formatDiscountQa`, `getDiscountQaColor`.
- ✅ **`excluded_non_scpi`** : Kyaneos Denormandie 4 exclu du périmètre, non intégré. (À distinguer de « Kyaneos » / Kyaneos Pierre, SCPI légitime intégrée à -0,97 %.)
- ✅ **Build Vite OK** : `✓ built in ~26 s`, 3164 modules transformés, 51 pages SCPI + 37 landing pages générées. La compilation TypeScript passe avec les nouveaux champs.
  - ⚠️ La toute dernière étape post-build (`inject-env-vars.js`) s'arrête sur `Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env` — limitation d'environnement local préexistante (clés Supabase absentes), sans rapport avec l'intégration décote/surcote.
- ℹ️ `public/sitemap.xml` / `public/robots.txt` régénérés automatiquement par le prebuild (effet de bord de `npm run build`) ; aucune édition manuelle, contenu inchangé.

## 5. Point de décision (à valider)

Les **10 SCPI publishable absentes du catalogue front** ne sont pas intégrées car elles n'ont pas de fiche complète. Deux options possibles :
1. Les laisser hors comparateur (état actuel) ;
2. Créer des fiches complètes (nécessite rendement, capitalisation, secteur, géographie, SFDR, profil de risque — données hors périmètre reconstitution, à sourcer).
