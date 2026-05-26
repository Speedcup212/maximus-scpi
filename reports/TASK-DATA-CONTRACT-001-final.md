# TASK-DATA-CONTRACT-001 — Rapport final

**Date :** 2026-05-26  
**Branche :** `claude/issue-1-20260515-1418`  
**Statut :** ✅ Complété (P0 uniquement, conformément aux contraintes)

---

## Objectif

Aligner le contrat de données SCPI entre TypeScript, Supabase, pipeline d'extraction et UI comparateur — P0 gaps identifiés dans TASK-DATA-COVERAGE-001.

---

## Gaps P0 traités

### G3 — `source_period` absent du modèle TypeScript

**Symptôme :** Le champ `source_period` (ex: `"T3 2025"`) était utilisé dans Supabase et le pipeline mais absent de `ScpiIndicator`. TypeScript aurait rejeté toute assignation.

**Fichiers modifiés :**
- `src/types/scpiIndicator.ts` — ajout de `source_period: string | null` après `source_publication_date`
- `src/data/scpiIndicators.generated.ts` — ajout de `source_period: null` dans les 5 entrées pilotes (replace_all)

---

### G1 — `nom` / `societe_gestion` non propagés dans la chaîne pipeline

**Symptôme :** Ces champs étaient déclarés dans `IndicatorsPayload` (supabase.ts) mais :
1. Non lus depuis `sources.yaml`
2. Non présents dans l'interface `Source`
3. Non wirés dans `indicatorsPayload` dans `index.ts`
4. Non renseignés dans `sources.yaml` pour les pilotes

**Fichiers modifiés :**
- `scpi-ingestion/src/types.ts` — ajout de `nom?` et `societe_gestion?` à `Source`
- `scpi-ingestion/src/loadSources.ts` — lecture de `nom`/`societe_gestion` depuis le YAML
- `scpi-ingestion/src/supabase.ts` — ajout à `IndicatorsPayload` + écriture conditionnelle dans la row
- `scpi-ingestion/src/index.ts` — wiring dans `indicatorsPayload` (lignes ~539–561)
- `scpi-ingestion/sources.yaml` — 5 entrées pilotes enrichies :

| SCPI | nom | societe_gestion |
|---|---|---|
| iroko-zen | "Iroko Zen" | "Iroko" |
| remake-live | "Remake Live" | "Remake Asset Management" |
| transitions-europe | "Transitions Europe" | "Arkéa REIM" |
| comete | "Comète" | "Alderan" |
| activimmo | "Activimmo" | "Alderan" |

---

### G2 — `categorie` absent de Supabase

**Symptôme :** La colonne `categorie` existait dans le modèle TypeScript et dans `IndicatorsPayload` mais n'était pas dans la table `scpi_indicators`.

**Migration appliquée :** `06_add_categorie_to_scpi_indicators`
```sql
ALTER TABLE public.scpi_indicators ADD COLUMN IF NOT EXISTS categorie text;
```

---

## Vérifications

| Étape | Résultat |
|---|---|
| `npx tsc --noEmit` (scpi-ingestion) | ✅ 0 erreur |
| `npx tsc --noEmit` (frontend root) | ✅ 0 erreur |
| `npm run build` (Vite) | ✅ Build complet (3163 modules) |
| Migration Supabase `categorie` | ✅ Appliquée (`success: true`) |

> Note : le script post-build `inject-env-vars.js` échoue sur `Missing SUPABASE_URL` — problème d'environnement local préexistant (`.env` non configuré), sans rapport avec cette tâche.

---

## Contraintes respectées

- ✅ Aucun champ existant supprimé
- ✅ Aucune modification de design
- ✅ Aucune nouvelle SCPI extraite
- ✅ Aucun `git add/commit/push` effectué sans validation explicite

---

## État du contrat post-001

### Couverture par couche (P0 gaps résolus)

| Layer | Avant | Après |
|---|---|---|
| TypeScript (`ScpiIndicator`) | `source_period` absent | ✅ présent |
| Supabase (`scpi_indicators`) | `categorie` absent | ✅ présent |
| Pipeline (`index.ts`) | `nom`/`societe_gestion` non wirés | ✅ wirés |
| Sources YAML | `nom`/`societe_gestion` manquants | ✅ renseignés (5 pilotes) |

### Gaps P1 non traités (hors scope)

- `management_fees`, `tri_5y`, `tri_10y`, `ran`, `walt`, `walb` — extraction PDF requise
- `enjoyment_delay` en mois vs jours — conversion déjà présente dans pipeline
- Rapport annuel : TD non écrit pour 4 SCPIs (URLs non vérifiées)

---

## Prochaines étapes recommandées

1. **Valider et committer** les 8 fichiers modifiés
2. **Tester le pipeline** sur iroko-zen : `npx tsx src/index.ts --slug iroko-zen` — vérifier que `nom` et `societe_gestion` s'écrivent dans Supabase
3. **TASK-DATA-PUBLISH-001G** (optionnel) : tester les 4 rapports annuels restants (transitions-europe, comete, activimmo, remake-live:ra)
