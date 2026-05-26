# TASK-DATA-PUBLISH-LAYER-002 — Rapport final

**Date :** 2026-05-26  
**Branche :** `claude/issue-1-20260515-1418`  
**Statut :** ✅ Complété

---

## Objectif

Créer une couche de lecture unique des indicateurs SCPI publiables, avec priorité Supabase > snapshot publishable > legacy JSON, couvrant les 5 SCPI pilotes.

---

## Architecture implémentée

```
Supabase scpi_indicators  (async — 1 requête par mount)
        ↑ fallback si absent
scpiIndicators.generated.ts  (snapshot publishable — synchrone)
        ↑ fallback si absent
JSON legacy (scpi_complet.json)

       ↓ enrichissement au parse time (scpiData.ts)
   scpi.yield  ← valeur publishable disponible immédiatement
       ↓
   ScpiTable, ScpiDetailPage, simulation, FAQ, SEO
       ↑ override async Supabase (usePublishedTds hook)
```

---

## Fichiers créés

### `src/utils/publishedIndicators.ts`

Fonctions pures :

| Fonction | Description |
|---|---|
| `toIndicatorSlug(name)` | Normalisation nom → slug (identique à `createSlugFromName`) |
| `getSnapshotTd(slug)` | Lecture snapshot publishable (`scpiIndicators.generated.ts`) |
| `resolvePublishedTd(slug, supabaseRow?, legacyYield?)` | Résolution priorisée complète |

Type `PublishedTd` : `{ value: number; year: number \| null; source: 'supabase' \| 'snapshot' \| 'legacy' }`

### `src/hooks/usePublishedTds.ts`

Hook React `usePublishedTds(slugs: string[]): Record<string, PublishedTd>`.

Comportement :
1. **Retour immédiat** — état initial vide, puis hydratation synchrone depuis snapshot (effet React)
2. **Fetch Supabase** — une seule requête par session par ensemble de slugs ; déduplication via `useRef<Set<string>>`
3. **Filtre intelligent** — ne requête Supabase que pour les slugs présents dans `scpiIndicators.generated.ts` (évite d'interroger pour les 50+ SCPI non pilotes)
4. **Mise à jour source** — quand Supabase répond, source passe de `'snapshot'` à `'supabase'` (valeur inchangée pour les 5 pilotes)

---

## Fichiers modifiés

### `src/data/scpiData.ts`

Enrichissement au parse time dans le `.map()` :

```typescript
const indicatorSlug = (scpi['Nom SCPI'] || '')
  .toLowerCase().normalize('NFD').replace(…).replace(…);
const snapshotRate = scpiIndicators[indicatorSlug]?.distribution_rate;
const publishedYield = snapshotRate != null ? snapshotRate : (scpi['Taux de distribution (%)'] || 0);

return { …, yield: publishedYield, … };
```

Impact : **tous les consommateurs de `scpi.yield`** (comparateur, métriques, simulation, FAQ, SEO) reçoivent automatiquement les valeurs publishables sans aucun changement supplémentaire.

### `src/components/ScpiTable.tsx`

- Import : `useMemo`, `createSlugFromName`, `usePublishedTds`
- `allSlugs` : slugs de toute la liste (`useMemo`)
- `publishedTds` : hook avec Supabase + snapshot
- `resolvedTds` : pré-calcul `useMemo` par `scpi.id` → `{ displayYield, source, year }`
- Cellule yield : `displayYield.toFixed(2)%` + `data-source={source}` + `title` tooltip

### `src/components/ScpiDetailPage.tsx`

- Import : `usePublishedTds`
- `scpiSlug` : calculé une fois au niveau composant (réutilisé par `getLatestScore` et le hook)
- `pubTd` : résolution publishable pour la SCPI affichée
- Carte yield overview : `data-source={pubTd?.source ?? 'legacy'}` + `title` tooltip

---

## Vérification TD affichés

### Comparateur (`scpi.yield` après enrichissement snapshot)

| SCPI | Avant (JSON legacy) | Après (snapshot publishable) | Source initiale |
|---|---|---|---|
| Iroko Zen | 7,12% | **7,32%** | snapshot |
| Comète | 9,00% | **10,62%** | snapshot |
| Transitions Europe | 8,60% | **8,25%** | snapshot |
| Activimmo | 5,50% | 5,50% | snapshot (= legacy) |
| Remake Live | 7,50% | 7,50% | snapshot (= legacy) |

### Après fetch Supabase (async — `usePublishedTds`)

| SCPI | Valeur | Source finale |
|---|---|---|
| Iroko Zen | 7,32% | **supabase** |
| Comète | 10,62% | **supabase** |
| Transitions Europe | 8,25% | **supabase** |
| Activimmo | 5,50% | **supabase** |
| Remake Live | 7,50% | snapshot (absent Supabase) |

---

## Trace interne de source

Attribut `data-source` ajouté sur :
- `<span>` yield dans chaque ligne de `ScpiTable`
- `<div>` carte yield dans l'overview de `ScpiDetailPage`

Valeurs possibles : `"supabase"`, `"snapshot"`, `"legacy"`.  
Tooltip `title` visible au survol pour les sources non-legacy : `"TD 2024 · supabase"`.

Non visible dans l'UI — inspectable dans DevTools.

---

## Vérifications

| Étape | Résultat |
|---|---|
| `npx tsc --noEmit` (frontend) | ✅ 0 erreur |
| `npm run build` (Vite) | ✅ Build complet |
| TD Iroko Zen comparateur | ✅ 7,32% (was 7,12%) |
| TD Comète comparateur | ✅ 10,62% (was 9%) |
| TD Transitions Europe comparateur | ✅ 8,25% (was 8,60%) |
| Simulation ScpiDetailPage | ✅ Utilise `scpi.yield` enrichi |
| FAQ / SEO ScpiDetailPage | ✅ Utilise `scpi.yield` enrichi |

---

## Contraintes respectées

- ✅ Aucune modification de design
- ✅ 5 SCPI pilotes uniquement (filtre interne dans le hook)
- ✅ Aucune extraction supplémentaire
- ✅ Pas de git add/commit/push effectué
