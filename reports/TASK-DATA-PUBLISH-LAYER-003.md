# TASK-DATA-PUBLISH-LAYER-003 — Rapport final

**Date :** 2026-05-26  
**Branche :** `claude/issue-1-20260515-1418`  
**Statut :** ✅ Complété

---

## Objectif

Vérifier visuellement et techniquement que toutes les zones UI affichent le TD publishable correct pour les 5 SCPI pilotes, et corriger les zones lisant encore les valeurs legacy.

TD publishables de référence :

| SCPI | TD publié |
|---|---|
| Iroko Zen | **7,32%** |
| Comète | **10,62%** |
| Transitions Europe | **8,25%** |
| Activimmo | **5,50%** |
| Remake Live | **7,50%** |

---

## Audit des zones UI

### Zones correctes — via couche publishable (LAYER-002)

| Zone | Composant | Mécanisme | Statut |
|---|---|---|---|
| Comparateur / tableau | `ScpiTable.tsx` | `usePublishedTds` + `scpi.yield` enrichi | ✅ Correct |
| Page détail — carte overview | `ScpiDetailPage.tsx` | `usePublishedTds` | ✅ Correct |
| Page détail — simulation | `ScpiDetailPage.tsx` | `scpi.yield` enrichi | ✅ Correct |
| Page détail — FAQ / SEO | `ScpiDetailPage.tsx` | `scpi.yield` enrichi | ✅ Correct |
| Bloc indicateurs publiés | `ScpiPublicIndicators` | `scpiIndicators.generated.ts` | ✅ Correct |
| Comparateur FintechComparator | `FintechComparator.tsx` | `enrichScpiExtended` → `matchingScpi.yield` | ✅ Correct |
| Carte SCPI (SCPICardDark) | `SCPICardDark.tsx` | `enrichScpiExtended` → `matchingScpi.yield` | ✅ Correct |
| Tableau FintechComparator | `SCPITableRow.tsx` | `enrichScpiExtended` → `matchingScpi.yield` | ✅ Correct |
| Landing page optimisée | `OptimizedScpiLandingPage.tsx` | `realScpiData.yield` enrichi | ✅ Correct |
| Thematic landing page | `ThematicLandingPage.tsx` | `scpiData.yield` enrichi | ✅ Correct |
| Toutes simulations/portfolio | composants divers | reçoivent `Scpi` enrichi | ✅ Correct |
| `scpiAnalysis.ts` | utils | `scpi.yield` en props | ✅ Correct |

### Zones corrigées dans cette tâche (LAYER-003)

#### `src/data/landingPagesData.ts`

Valeurs statiques `rendement` et textes descriptifs non connectés au pipeline `scpiData.ts` :

| SCPI | Champ | Avant | Après |
|---|---|---|---|
| Comète | `rendement` | `"9,00%"` | `"10,62%"` |
| Comète | `avantages[0]` | `"Taux de distribution 2025 de 9,00%"` | `"Taux de distribution 2024 de 10,62%"` |
| Comète | `description_courte` | `"...2025 de 9,00%..."` | `"...2024 de 10,62%..."` |
| Comète | `description_longue` | `"...2025 de 9,00%..."` | `"...2024 de 10,62%..."` |
| Comète | `pourquoi_investir[0]` | `"Taux de distribution 2025 : 9,00%..."` | `"Taux de distribution 2024 : 10,62%..."` |
| Iroko Zen | `rendement` | `"6,01%"` | `"7,32%"` |
| Iroko Zen | `avantages[0]` | `"Rendement attractif de 6,01%"` | `"Rendement attractif de 7,32%"` |
| Iroko Zen | `description_courte` | `"...6,01%..."` | `"...7,32%..."` |
| Iroko Zen | `pourquoi_investir[3]` | `"Rendement solide : 6,01%..."` | `"Rendement solide : 7,32%..."` |

Utilisé par : `ScpiLandingPage.tsx` (ligne 204 `{scpiData.rendement}`), `GenericScpiLandingPage.tsx` (ligne 212).

#### `src/components/IrokoZenLandingPage.tsx`

Page landing dédiée Iroko Zen avec valeurs hardcodées :

| Section | Avant | Après |
|---|---|---|
| Hero stat card (visible) | `6,01%` | `7,32%` |
| Simulateur `defaultYield` | `6.01` | `7.32` |
| Simulateur `subtitle` | `"...un rendement de 6,01%"` | `"...un rendement de 7,32%"` |
| CTA section | `"...rendement de 6,01%..."` | `"...rendement de 7,32%..."` |

#### `src/components/ScpiExamplePage.tsx`

Page démo/exemple Comète avec valeurs hardcodées :

| Section | Avant | Après |
|---|---|---|
| `scpiData.rendement` | `"9,00%"` | `"10,62%"` |
| FAQ versements (texte) | `"taux de distribution 2025 est de 9,00%"` | `"taux de distribution 2024 est de 10,62%"` |
| FAQ frais (texte) | `"...affiché de 9,00%"` | `"...affiché de 10,62%"` |

#### `src/components/ScpiEuropeennesHubPage.tsx`

Page hub SEO listant les SCPI européennes (Iroko Zen + Comète dans données structurées et textes) :

- `topScpi` arrays Royaume-Uni/Irlande : `rendement: '6.01%'` → `'7.32%'` (×2)
- `topEuropeanScpi` array : `rendement: '9.00%'` → `'10.62%'` (Comète), `rendement: '6.01%'` → `'7.32%'` (Iroko Zen)
- SEO title/description, h1, hero badges : `9.00%` → `10.62%`
- Introduction prose : Comète `(9,00%)` → `(10,62%)`, Iroko Zen `(6,01%)` → `(7,32%)`
- FAQ structured data et rich-text (4 réponses) : Comète `9,00%` → `10,62%`

#### `src/data/thematicLandingPages.ts`

Page thématique SCPI Alderan/Comète et FAQ Top rendements :

- Toutes occurrences `9,00%` (Comète) → `10,62%` (×10)
- Années distribution `2026` → `2024` dans les libellés TD
- Revenu simulé 10k€ : `900€ bruts / 75€ mois` → `1 062€ bruts / 89€ mois`
- Rendement moyen portfolio exemple : `8,03%` → `8,70%`

---

## Traçage de source

Attributs `data-source` en place depuis LAYER-002 :

| Zone | Composant | Valeurs |
|---|---|---|
| Cellule yield comparateur | `ScpiTable.tsx` | `supabase` / `snapshot` / `legacy` |
| Carte overview détail | `ScpiDetailPage.tsx` | `supabase` / `snapshot` / `legacy` |

Non visible dans l'UI — inspectable via DevTools.

---

## Zones hors périmètre (non modifiées)

- **Articles** (`RevendrePartsScpiDelaisMarcheSecondaireArticle.tsx`, `ScpiBureauxTertiaireTeletravail2025Article.tsx`) : références à Novaxia NEO à 6,01% — SCPI hors pilotes, aucun changement requis.
- **`ScpiSecteursHubPage.tsx`** : Novaxia NEO à 6,01% — non pilote.

---

## Vérifications

| Étape | Résultat |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erreur |
| `npm run build` (Vite) | ✅ Build complet (24s) |
| TD Iroko Zen — toutes zones pilotes | ✅ 7,32% |
| TD Comète — toutes zones pilotes | ✅ 10,62% |
| TD Transitions Europe — toutes zones | ✅ 8,25% (inchangé, était correct) |
| TD Activimmo — toutes zones | ✅ 5,50% (inchangé, était correct) |
| TD Remake Live — toutes zones | ✅ 7,50% (inchangé, était correct) |

---

## Fichiers modifiés dans LAYER-003

| Fichier | Type de correction |
|---|---|
| `src/data/landingPagesData.ts` | Valeurs `rendement` + textes Comète et Iroko Zen |
| `src/components/IrokoZenLandingPage.tsx` | Hardcode hero + simulateur + CTA |
| `src/components/ScpiExamplePage.tsx` | Hardcode Comète rendement + FAQ |
| `src/components/ScpiEuropeennesHubPage.tsx` | Données structurées + textes SEO/FAQ |
| `src/data/thematicLandingPages.ts` | Données Alderan/Comète + FAQ Top rendements |

---

## Contraintes respectées

- ✅ Aucune modification de design
- ✅ 5 SCPI pilotes uniquement
- ✅ Aucune extraction supplémentaire
- ✅ Pas de git add/commit/push effectué
- ✅ Toutes les valeurs publiées sont officiellement validées (source Supabase / documents officiels)
