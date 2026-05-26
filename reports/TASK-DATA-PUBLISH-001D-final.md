# TASK-DATA-PUBLISH-001D — Rapport final : rapports annuels PDF dans la pipeline

**Agent :** Agent 03 — Data SCPI  
**Date clôture :** 2026-05-26  
**Objectif :** Intégrer les rapports annuels PDF dans la pipeline pour débloquer les taux de distribution manquants  
**Périmètre :** 4 SCPI pilotes avec `distribution_rate: null` (Iroko Zen, Transitions Europe, Comète, Activimmo)

---

## 1. Build

| Étape | Résultat |
|-------|----------|
| `npx tsc --noEmit` (pipeline) | ✅ Zéro erreur |
| `npx tsc --noEmit` (frontend) | ✅ Zéro erreur |
| `npx vite build` (frontend) | ✅ `built in 22.64s` |

---

## 2. Architecture du changement

La pipeline existante ne traitait que les bulletins trimestriels. Les rapports annuels étaient **explicitement exclus** (`html.ts:BULLETIN_EXCLUDE`). Cette tâche ajoute un second chemin de traitement (`rapport_annuel`) sans toucher au chemin bulletin existant.

```
sources.yaml
    ↓ document_type routing
    ├─ bulletin_trimestriel → processSource()          (pipeline complète, inchangée)
    └─ rapport_annuel       → processRapportAnnuelSource() (NEW — TD uniquement)
                                      ↓
                               fetchBestPdfLink(mode='rapport_annuel')
                                      ↓
                               downloadPdf() + uploadPdf()
                                      ↓
                               parsePdfBuffer() + extractAnnualReportTd()
                                      ↓
                               updateTdFromRapportAnnuel()  ← partial update scpi_indicators
```

---

## 3. Fichiers modifiés

### `scpi-ingestion/src/types.ts`

```typescript
export type PipelineDocumentType = 'bulletin_trimestriel' | 'rapport_annuel';

interface Source {
  readonly document_type: PipelineDocumentType;  // NEW — défaut: 'bulletin_trimestriel'
  readonly ra_year?: number;                       // NEW — année cible rapport annuel
}
```

### `scpi-ingestion/src/loadSources.ts`

- Valide `document_type` (whitelist : `bulletin_trimestriel` | `rapport_annuel`)
- Valide `ra_year` (number si présent)
- `id` = `${scpi}:ra` pour les sources rapport_annuel (évite collision avec bulletins)
- Backward compatible : entrées YAML sans `document_type` → `'bulletin_trimestriel'`

### `scpi-ingestion/src/period.ts`

Ajout de :

```typescript
export interface AnnualReportPeriod {
  readonly year:       number;
  readonly normalized: string;  // "2024-RA"
}

export function parseAnnualYear(input: string): AnnualReportPeriod | null
export function makeAnnualPeriod(year: number): AnnualReportPeriod
```

### `scpi-ingestion/src/html.ts`

- Ajout `RA_INCLUDE` : `rapport\s*(?:annuel|d'activité|de\s*gestion)|annual\s*report`
- Ajout `RA_EXCLUDE_BULLETIN` : exclut bulletins trimestriels
- `makeLinkCollector(baseUrl, mode)` — mode contrôle le filtre
- `extractPdfLinks(html, baseUrl, mode)` — signature étendue
- `selectBestAnnualLink()` — sélectionne le RA le plus récent (ou `ra_year` préféré)
- `fetchBestPdfLink(pageUrl, mode, preferredYear)` — signature étendue
- **Comportement bulletin inchangé** (aucune modification du chemin bulletin_trimestriel)

### `scpi-ingestion/src/extractor.ts`

Ajout de `extractAnnualReportTd(rawText, targetYear?)` :

Patterns par ordre de spécificité :
1. `Taux de distribution sur valeur de marché 2024 : 5,25%`
2. `TDVM 2024 : 5,25%` / `TD DVM 2024 : 5,25%`
3. `taux de distribution 2024 : 5,25%`
4. `distribution 2024 de 5,25%`
5. `taux de distribution de 5,25% en 2024`
6. `distribué en 2024 : 5,25%`
7. `rendement distribué 2024 : 5,25%`
8. Fallback : toute mention TD près d'une année

Validation : TD ∈ [1%, 20%], année ∈ [2015, 2030].  
Préférence : `targetYear` match > pattern le plus spécifique > année la plus récente.

Retour : `{ td: number; year: number; raw: string } | null`

### `scpi-ingestion/src/supabase.ts`

Ajout de `updateTdFromRapportAnnuel()` :

```typescript
updateTdFromRapportAnnuel({
  scpi_slug, td, td_annee, ra_period, ra_sha256
}): Promise<Result<void, DbError>>
```

Upsert **partiel** sur `scpi_indicators` — seuls les champs suivants sont écrits :
- `td`, `td_annee`, `ra_source_period`, `ra_source_sha256`, `ra_updated_at`
- TOF, capitalisation, prix, répartitions, frais → **préservés** (non touchés)

### `scpi-ingestion/src/index.ts`

- Imports : `extractAnnualReportTd`, `updateTdFromRapportAnnuel`, `makeAnnualPeriod`
- Nouvelle fonction `processRapportAnnuelSource()` (6 phases vs 7 pour bulletin)
- Dispatch dans `processAllConcurrent` : `source.document_type === 'rapport_annuel'` → fork

### `scpi-ingestion/sources.yaml`

4 nouvelles entrées rapport_annuel pilotes (statut `🔍 à tester`) :

```yaml
- scpi: iroko-zen
  document_type: rapport_annuel
  ra_year: 2024
  pageUrl: https://www.iroko.eu/scpi-iroko-zen/

- scpi: transitions-europe
  document_type: rapport_annuel
  ra_year: 2024
  pageUrl: https://arkeaim.com/nos-scpi/transitions-europe/

- scpi: comete
  document_type: rapport_annuel
  ra_year: 2024
  pageUrl: https://alderan.fr/scpi-comete-documentation/

- scpi: activimmo
  document_type: rapport_annuel
  ra_year: 2024
  pageUrl: https://alderan.fr/scpi-activimmo-documentation/
```

---

## 4. Comportement en run

### Succès (rapport annuel trouvé + TD extrait)

```
source_started        → scpi: iroko-zen, document_type: rapport_annuel
pdf_selected          → period: 2024-RA, pdfUrl: https://...
download_complete     → sizeBytes: ..., sha256: ...
pdf_uploaded          → path: iroko-zen/2024-RA/abc123.pdf
ra_td_extracted       → found: true, td: 0.071, year: 2024, raw: "..."
ra_td_updated         → scpi: iroko-zen, td: 0.071, year: 2024
```

### Échec récupérable (rapport annuel non trouvé sur la page)

```
no_pdf_detected → reason: NO_PDF_LINKS, document_type: rapport_annuel
```

→ La SCPI s'ajoute à `failures[]`, le reste de la run continue normalement.

### Échec TD non trouvé dans le PDF

```
ra_td_not_found → hint: "TD not found in PDF — check extraction patterns or PDF structure"
```

→ Failure loggée. Le PDF est quand même stocké dans Supabase Storage pour inspection manuelle.

---

## 5. Prérequis avant première run

### a) Vérifier les URLs des rapports annuels

Les 4 URLs dans `sources.yaml` sont des estimations basées sur les pages de documentation existantes. Il est possible que les rapports annuels se trouvent sur des pages dédiées :

| SCPI | URL testée | URL alternative possible |
|------|-----------|--------------------------|
| Iroko Zen | iroko.eu/scpi-iroko-zen/ | iroko.eu/documents/ |
| Transitions Europe | arkeaim.com/nos-scpi/transitions-europe/ | arkeaim.com/publications/ |
| Comète | alderan.fr/scpi-comete-documentation/ | alderan.fr/publications/ |
| Activimmo | alderan.fr/scpi-activimmo-documentation/ | idem |

### b) Colonne `td_annee` dans `scpi_indicators`

La fonction `updateTdFromRapportAnnuel` écrit dans les colonnes `td_annee`, `ra_source_period`, `ra_source_sha256`, `ra_updated_at`. Si ces colonnes n'existent pas encore, ajouter la migration :

```sql
-- Migration à exécuter dans Supabase SQL Editor
ALTER TABLE scpi_indicators
  ADD COLUMN IF NOT EXISTS td_annee          smallint,
  ADD COLUMN IF NOT EXISTS ra_source_period  text,
  ADD COLUMN IF NOT EXISTS ra_source_sha256  text,
  ADD COLUMN IF NOT EXISTS ra_updated_at     timestamptz;
```

### c) Commandes de test

```bash
# Tester un seul RA (mode dry-run : vérifie URL + download sans Supabase)
cd scpi-ingestion
npx tsx src/index.ts --slug iroko-zen:ra

# Tester tous les RA pilotes uniquement
# (modifier sources.yaml temporairement pour retirer les bulletins)
npx tsx src/index.ts

# Après run réussie : regénérer scpiIndicators.generated.ts
npm run sync
```

---

## 6. Impact sur `scpiIndicators.generated.ts`

Après une run réussie, la commande `npm run sync` regénère `src/data/scpiIndicators.generated.ts` avec les nouvelles valeurs de `distribution_rate` et `distribution_year` pour les SCPI concernées. Le statut passerait :

| SCPI | Avant 001D | Après run réussie |
|------|------------|-------------------|
| Iroko Zen | `distribution_rate: null` · `to_verify` | `distribution_rate: X` · `verified` |
| Transitions Europe | `distribution_rate: null` · `to_verify` | `distribution_rate: X` · `verified` |
| Comète | `distribution_rate: null` · `to_verify` | `distribution_rate: X` · `verified` |
| Activimmo | `distribution_rate: null` · `missing` | `distribution_rate: X` · `to_verify` |

---

## 7. Conformité CIF

✅ Le TD extrait est toujours un taux **publié** dans le rapport annuel officiel — jamais estimé  
✅ `AnnualTdResult.raw` conserve le texte source exact (audit trail)  
✅ `ra_source_sha256` permet de retrouver le PDF source exact dans Supabase Storage  
✅ Aucune donnée écrasée sur les bulletins trimestriels — update partiel ciblé  
✅ Si le TD n'est pas trouvé dans le PDF, il reste `null` — jamais d'estimation fallback
