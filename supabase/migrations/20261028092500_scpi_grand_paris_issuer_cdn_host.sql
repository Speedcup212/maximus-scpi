-- Direct publisher Grand Paris Resid entiels page embeds and serves the same corpocdn host.
-- Do not authorize this CDN globally; allow it only for the issuer-linked SCPI.
DO $guard$
BEGIN
IF NOT EXISTS (
 SELECT 1 FROM public.scpi_source_registry
 WHERE scpi_slug='grand-paris-residentiel'
 AND official_scpi_page_url='https://www.inter-gestion.com/corpo/scpi-gerees/grand-paris-residentiels'
) THEN RAISE EXCEPTION 'Grand Paris official source page not verified'; END IF;
UPDATE public.scpi_source_connectors
SET allowed_hosts=(
 SELECT array_agg(DISTINCT v.host ORDER BY v.host)
 FROM unnest(coalesce(allowed_hosts,array[]::text[]) || ARRAY['corpocdn.blob.core.windows.net']) v(host)
),updated_at=now()
WHERE scpi_slug='grand-paris-residentiel';
END $guard$;