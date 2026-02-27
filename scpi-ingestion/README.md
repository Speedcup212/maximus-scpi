# SCPI Ingestion Pipeline

Pipeline d'ingestion des bulletins trimestriels SCPI : crawl pages HTML → sélection PDF bulletin → upload Storage → upsert DB → notation.

## Prérequis

- Node 20+
- `tsx` (fourni en devDep)
- Playwright Chromium : `npm run playwright:install`

## Variables d'environnement (.env)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Optionnel :
```env
SUPABASE_STORAGE_BUCKET=scpi-bulletins  # défaut
```

## Exécution

```powershell
# Tous les sources
npm run dev

# Une SCPI uniquement (Phase 1)
npm run dev -- --slug comete

# Phase 2 : comete + novaxia-neo + perial-oportunites-europe
npm run dev
```

## Phases de test

### Phase 1 — Comète uniquement

1. `npm run dev -- --slug comete`
2. Vérifier qu'une ligne est insérée dans `public.scpi_bulletins` pour `scpi_slug='comete'`
3. Contrôles : `source_url` ≠ 'manual-test', `run_id` ≠ 'manual', `pdf_sha256` NOT NULL, `pdf_path` NOT NULL

### Phase 2 — +2 SCPI

Sources : comete, novaxia-neo, perial-oportunites-europe  
Relancer `npm run dev`, vérifier 3 lignes minimum.

### Phase 3 — Catalogue complet

Ajouter les autres SCPI dans `sources.yaml` (voir ci-dessous).

## Ajouter une source

Éditer `sources.yaml` :

```yaml
sources:
  - scpi: mon-slug-scpi
    pageUrl: https://example.com/ma-scpi/documentation/
```

- `scpi` : slug unique (ex. comete, novaxia-neo)
- `pageUrl` : URL de la page documentation (HTML, pas PDF direct)

Le pipeline :
1. Charge `pageUrl` (fetch HTML ou Playwright si JS)
2. Extrait les liens PDF (exclut DIC, KIID, prospectus, rapport annuel, SFDR…)
3. Sélectionne le bulletin le plus récent (année puis trimestre)
4. Télécharge, calcule sha256, uploade vers Storage
5. Upsert `scpi_bulletins` + `maximus_score_value`

## SQL de vérification

```sql
SELECT
  scpi_slug,
  period,
  source_url,
  pdf_path,
  pdf_sha256,
  run_id,
  found_at,
  maximus_score_value
FROM public.scpi_bulletins
ORDER BY scpi_slug, found_at DESC;
```

Vérifications :
- `source_url` ne doit pas être 'manual-test'
- `run_id` ne doit pas être 'manual'
- `pdf_sha256` et `pdf_path` doivent être non NULL
