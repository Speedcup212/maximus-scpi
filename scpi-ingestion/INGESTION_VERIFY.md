# Ingestion pipeline — test & verification

## Test command

```powershell
# Single SCPI (comete)
npm run dev -- --slug comete

# All sources
npm run dev

# Ensure Playwright chromium is installed
npm run playwright:install
```

Requires:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` in `.env` or environment
- Node 20+ with `tsx`

---

## SQL verification queries

```sql
-- Count bulletins per SCPI
SELECT scpi_slug, period, pdf_path, maximus_score->>'score_total' AS score
FROM public.scpi_bulletins
ORDER BY scpi_slug, period DESC;

-- Comete only
SELECT * FROM public.scpi_bulletins
WHERE scpi_slug = 'comete';

-- Latest bulletin per SCPI
SELECT DISTINCT ON (scpi_slug)
  scpi_slug, period, pdf_path, pdf_sha256
FROM public.scpi_bulletins
ORDER BY scpi_slug, period DESC;

-- Idempotency check: no duplicate (scpi_slug, period)
SELECT scpi_slug, period, COUNT(*) AS n
FROM public.scpi_bulletins
GROUP BY scpi_slug, period
HAVING COUNT(*) > 1;
-- Expected: 0 rows
```
