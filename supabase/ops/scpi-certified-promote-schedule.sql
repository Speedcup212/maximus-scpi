-- MaximusSCPI: certified-only automatic promotions, every half hour.
-- Bulletin watcher: :00/:30. Page evidence: :15/:45. Promotion: :20/:50.
-- No secret is stored in source: secret resolved at runtime from Supabase Vault.
-- The worker enforces issuer allowlist, PDF SHA256, exact period, 100% page
-- evidence, per-metric certificates, plausibility, optimistic concurrency,
-- readback verification and atomic publish queue intent.
SELECT cron.schedule(
  'scpi-certified-promote-30m',
  '20,50 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/scpi-certified-promote',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'x-cron-token',(SELECT decrypted_secret FROM vault.decrypted_secrets
                      WHERE name='scpi_bulletin_cron_token' LIMIT 1)
    ),
    body := '{"dry_run":false,"limit":3}'::jsonb,
    timeout_milliseconds := 120000
  );
  $$
);
