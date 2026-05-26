# TASK-DATA-PUBLISH-001F — Rapport final : migration SQL + écriture Supabase Iroko Zen

**Agent :** Agent 03 — Data SCPI  
**Date clôture :** 2026-05-26  
**Objectif :** Appliquer la migration SQL, tester l'écriture Supabase sur Iroko Zen, vérifier l'isolation des champs bulletin  
**Périmètre :** Iroko Zen uniquement (`--slug iroko-zen:ra`)

---

## 1. État initial de la base (avant 001F)

| Table | État |
|-------|------|
| `scpi_indicators` | **Absente** — jamais créée |
| `scpi_bulletins` | Présente (0 lignes) |
| `scpi_source_registry` | Présente (51 lignes) |
| Migrations enregistrées | **Aucune** (`list_migrations: []`) |

---

## 2. Migration appliquée

**Nom :** `05_scpi_indicators_with_ra_columns`  
**Méthode :** `apply_migration` (MCP Supabase — DDL idempotent)

La migration crée la table complète depuis `04_scpi_indicators.sql` puis ajoute les 4 colonnes rapport_annuel :

```sql
CREATE TABLE IF NOT EXISTS public.scpi_indicators (
  scpi_slug  text PRIMARY KEY,
  td         numeric,
  tof        numeric,
  ...        (41 colonnes — voir 04_scpi_indicators.sql)
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index + RLS + politique allow_select_anon

ALTER TABLE public.scpi_indicators
  ADD COLUMN IF NOT EXISTS td_annee          smallint,
  ADD COLUMN IF NOT EXISTS ra_source_period  text,
  ADD COLUMN IF NOT EXISTS ra_source_sha256  text,
  ADD COLUMN IF NOT EXISTS ra_updated_at     timestamptz;
```

**Résultat :** `{ success: true }` — 45 colonnes confirmées par `information_schema.columns`.

---

## 3. Correction : filtre `--slug` par `id`

Le filtre `--slug iroko-zen:ra` échouait car `runIngestion` comparait `s.scpi` (= `"iroko-zen"`) au lieu de `s.id` (= `"iroko-zen:ra"`).

**Correction dans `src/index.ts:686` :**

```typescript
// Avant
sources = sources.filter((s) => s.scpi === slugFilter);

// Après
sources = sources.filter((s) => s.id === slugFilter || s.scpi === slugFilter);
```

Comportement résultant :
- `--slug iroko-zen:ra` → 1 source (rapport_annuel uniquement) ✅
- `--slug iroko-zen` → 2 sources (bulletin + rapport_annuel) ✅ (comportement inchangé)

---

## 4. Run pipeline `--slug iroko-zen:ra`

```
ingestion_run_started   runId: 2e0db93b, slugFilter: iroko-zen:ra
slug_filter_applied     count: 1
source_started          scpi: iroko-zen, document_type: rapport_annuel, ra_year: 2024
page_fetch_done         url: iroko.eu/documentation, linkCount: 7
pdf_selected            Iroko_Zen_rapport_annuel_2024.pdf · period: 2024-RA
download_complete       sizeBytes: 8 672 755 · sha256: 0bd869f2...
pdf_uploaded            path: iroko-zen/2024-RA/0bd869f2...pdf
ra_td_extracted         found: true · td: 0.0732 · year: 2024 · raw: "taux de distribution de 7,32 % en 2024"
ra_td_updated           scpi: iroko-zen · td: 0.0732 · year: 2024 · period: 2024-RA
ingestion_run_complete  durationMs: 10 947 · success: 1 · failed: 0
```

---

## 5. Vérification base de données

Requête après run :

```sql
SELECT scpi_slug, td, td_annee, ra_source_period, ra_source_sha256, ra_updated_at,
       tof, capitalisation, prix_souscription, source_period, source_confidence
  FROM public.scpi_indicators
 WHERE scpi_slug = 'iroko-zen';
```

| Champ | Valeur | Verdict |
|-------|--------|---------|
| `scpi_slug` | `iroko-zen` | ✅ |
| `td` | `0.0732` | ✅ TD rapport annuel |
| `td_annee` | `2024` | ✅ |
| `ra_source_period` | `2024-RA` | ✅ |
| `ra_source_sha256` | `0bd869f232e59304...` | ✅ |
| `ra_updated_at` | `2026-05-26 04:56:01+00` | ✅ |
| `tof` | `null` | ✅ non écrasé |
| `capitalisation` | `null` | ✅ non écrasé |
| `prix_souscription` | `null` | ✅ non écrasé |
| `source_period` | `null` | ✅ non écrasé (champ bulletin) |
| `source_confidence` | `null` | ✅ non écrasé (champ bulletin) |

**Isolation confirmée** : `updateTdFromRapportAnnuel` écrit exactement les 5 champs prévus et ne touche à aucun autre.

---

## 6. Fichiers modifiés (à committer)

| Fichier | Modification |
|---------|-------------|
| `scpi-ingestion/src/index.ts` | Fix filtre `--slug` : `s.id \|\| s.scpi` |
| `reports/TASK-DATA-PUBLISH-001F-final.md` | Ce rapport |

---

## 7. Prochaines étapes

### 7a. Tester les autres SCPI pilotes (001G)

L'infrastructure est validée. Les 3 autres SCPI pilotes de 001D peuvent maintenant être testées :

| SCPI | URL à vérifier | Statut |
|------|---------------|--------|
| Transitions Europe | `arkeaim.com/nos-scpi/transitions-europe/` | 🔍 à tester |
| Comète | `alderan.fr/scpi-comete-documentation/` | 🔍 à tester |
| Activimmo | `alderan.fr/scpi-activimmo-documentation/` | 🔍 à tester |

Procédure : même approche que 001E (debug URL si nécessaire) puis run `--slug <scpi>:ra`.

### 7b. Regénérer `scpiIndicators.generated.ts`

Après run des 4 SCPI pilotes :

```bash
npm run sync   # dans scpi-ingestion/
```

Puis vérifier que `distribution_rate` est renseigné et `status` passe à `verified`.

---

## 8. Conformité CIF

✅ TD = 7,32% extrait du rapport annuel officiel Iroko (document public AMF)  
✅ Texte source `raw` préservé : `"taux de distribution de 7,32 % en 2024"`  
✅ PDF stocké dans Supabase Storage (`iroko-zen/2024-RA/...`) — audit trail complet  
✅ Aucun champ bulletin écrasé — upsert partiel vérifié en base  
✅ SHA-256 dans `ra_source_sha256` permet de retrouver le PDF source exact
