# TASK-DATA-PUBLISH-001 — Audit rapide architecture data SCPI

**Agent :** Agent 03 — Data SCPI  
**Date :** 2026-05-22  
**Type :** Audit lecture seule pré-implémentation

---

## Architecture existante

### Stockage des données

| Source | Chemin | Contenu | Usage |
|--------|--------|---------|-------|
| `scpi_complet.json` | `src/data/` | 62 SCPI, ~40 champs/SCPI | Source principale frontend |
| `SCPI_complet_avec_SFDR_Profil.json` | `src/data/` | Enrichissement SFDR | Fusionné dans scpiData.ts |
| `scpi_complet.json` (racine) | `src/data/` | Données maîtres | Merge dans scpiData.ts |
| `scpiData.ts` | `src/data/` | Export `Scpi[]` mappé | Consommé par comparateur + pages |

### Pipeline data actuel

- **Scripts** : 120+ scripts `.cjs` dans `scripts/` — un par SCPI, non structurés
- **Bulletins trimestriels JSON** : disponibles pour Iroko Zen, Remake Live, Transitions Europe, Comète (T3 2025)
- **Activimmo** : mis à jour via `updateActivimmoT3.cjs` — pas de bulletin JSON dédié
- **Supabase** : `scores_scpi` + `scpi_bulletins` — scoring existant, non modifié

### Comparateur (`ComparateurScpi.tsx`)

Champs affichés avant : rendement, secteur, TOF, capitalisation, prix, frais.  
Pas d'année de rendement, pas de délai de jouissance, pas de statut de donnée.

### Pages SCPI (`ScpiDetailPage.tsx`)

Affichait déjà : overview, charts, analysis. Pas de bloc indicateurs sourcés, pas de bloc conformité structuré.

---

## Les 5 SCPI pilotes

| SCPI | Slug | TD | Prix | Capi | TOF | Bulletin T3 2025 |
|------|------|----|------|------|-----|-----------------|
| Activimmo | activimmo | 5.5% | 610€ | 1400 M€ | 92.8% | Non (updateActivimmoT3.cjs) |
| Comète | comete | 9% | 250€ | 519.6 M€ | 99.1% | Oui (partiel) |
| Iroko Zen | iroko-zen | 7.12% | 204€ | 1237 M€ | 98.1% | Oui (complet) |
| Remake Live | remake-live | 7.5% | 204€ | 806 M€ | 99.3% | Oui (complet) |
| Transitions Europe | transitions-europe | 8.6% | 200€ | 948 M€ | 97.54% | Oui (complet) |

---

## Champs manquants

- RAN (report à nouveau) : absent de tous les 5
- TRI 5 ans / TRI 10 ans : absent de tous les 5
- Taux de distribution par année : absent (pas d'historique)
- URLs sources : toutes null dans `scpi_source_registry_seed.json`

---

## Risques bloquants

Aucun bloquant identifié. Données suffisantes pour une première boucle.

---

## Plan d'action

1. Créer `src/types/scpiIndicator.ts`
2. Créer `src/data/scpiIndicators.generated.ts` (5 pilotes)
3. Créer `scripts/data/` (collect, normalize, diff, publish)
4. Modifier `ComparateurScpi.tsx` (branchement indicators + colonnes)
5. Modifier `ScpiDetailPage.tsx` (2 nouveaux blocs)
6. Build + rapport final
