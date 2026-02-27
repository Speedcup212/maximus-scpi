# Ingestion pipeline patches

All changes applied. Summary:

## sources.yaml
- Format: `{ scpi, pageUrl }` only (no `id`, `name`, `url`, `type`)
- No hardcoded PDF URLs

## types.ts
- `Source`: `scpi`, `pageUrl`, `id` (derived from scpi)
- Removed `SourceType`, `bulletin_trimestriel`, etc.

## loadSources.ts
- Validates `scpi` and `pageUrl` only
- `id` derived from `scpi`

## html.ts
- Playwright-first PDF extraction (handles JS-rendered pages)
- Static HTML fallback if Playwright fails

## supabase.ts
- `uploadPdf`: accepts `scpi_slug`, `period`, `buffer`, `sha256` (period from PDF link, not source)
- Removed `derivePeriod(source)`

## index.ts
- CLI: `--slug comete` filters sources
- Always uses `source.pageUrl` with `fetchBestPdfLink` (no direct PDF path)
- Logging: `page_loaded`, `pdf_detected`, `pdf_selected`, `score_computed`, `db_inserted`
- Safe fallback: `no_pdf_detected` + skip (no crash)
- Idempotent: `recordBulletin` handles duplicates via unique constraints
