CREATE TABLE IF NOT EXISTS scpi_internal.tof_policy_quarantine_audit_20261028 (
 certificate_id uuid PRIMARY KEY,
 scpi_slug text NOT NULL,
 source_period text NOT NULL,
 rejection_reason text NOT NULL,
 original_certification jsonb NOT NULL,
 original_history jsonb,
 original_live jsonb,
 quarantined_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON scpi_internal.tof_policy_quarantine_audit_20261028 FROM PUBLIC,anon,authenticated;
CREATE INDEX IF NOT EXISTS idx_tof_policy_quarantine_slug_period
 ON scpi_internal.tof_policy_quarantine_audit_20261028(scpi_slug,source_period);