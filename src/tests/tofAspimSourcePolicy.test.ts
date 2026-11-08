import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('RECOVERY-193 — TOF ASPIM source evidence, no blanket ban', () => {
  const sql = read('supabase/migrations/20261108_recovery193_issuer_aspim_tof_source_policy.sql');
  const edge = read('supabase/functions/scpi-bulletin-watch/index.ts');
  const netlify = read('netlify/functions/utils/scpi-bulletin-ingestion.ts');

  it('retains exact issuer host and derived-value rejection in SQL', () => {
    expect(sql).toContain('OUTSIDE_ISSUER_OFFICIAL_HOSTS');
    expect(sql).toContain('scpi_source_connectors');
    expect(sql).toContain('TOF_NOT_DIRECT_FROM_ISSUER_BULLETIN');
    expect(sql).toContain('RECOVERY193_ISSUER_ASPIM_WRONGLY_BLOCKED');
    expect(sql).toContain('RECOVERY193_THIRD_PARTY_SOURCE_ACCEPTED');
    expect(sql).toContain('RECOVERY193_DERIVED_TOF_ACCEPTED');
    expect(sql).not.toContain("THEN 'TOF_ASPIM_FORBIDDEN'");
  });

  it('retains historical quarantines and explicit-vacancy guard', () => {
    expect(sql).not.toMatch(/(?:UPDATE|DELETE\s+FROM|TRUNCATE)\s+(?:scpi_internal\.)?tof_policy_quarantine_audit_20261028/i);
    expect(sql).not.toContain('DROP TRIGGER');
    expect(sql).toContain('RECOVERY193_VACANCY_SUBCOMPONENT_GUARD_MISSING');
    const vacancy = read('supabase/migrations/20261108_recovery189_tof_explicit_vacancy_guard.sql');
    expect(vacancy).toContain('trg_zzzz_tof_explicit_vacancy');
    expect(vacancy).toContain('scpi_internal.tof_explicit_vacancy_conflict');
  });

  it('never drops issuer ASPIM TOF from the Netlify staging payload', () => {
    expect(netlify).toContain('aspimTofCandidate');
    expect(netlify).not.toContain('delete rawPatch.tof');
    expect(netlify).not.toContain('forbiddenAspimTof');
    expect(netlify).toContain("rejected.length > 0 || aspimTofCandidate ? 'auto_partial_review'");
    expect(netlify).toContain('The separate page-evidence/certification pipeline');
    expect(netlify).toContain('stage-only');
  });

  it('never drops issuer ASPIM TOF in the Edge extractor or auto-verifies it', () => {
    expect(edge).not.toContain('rejectAspimTof');
    expect(edge).not.toContain('delete metrics.tof');
    expect(edge).toContain('ASPIM_TOF_LABEL.test(text)');
    expect(edge).toContain('QA indépendante');
    expect(edge).toContain('crawler ONLY stages issuer documents');
  });
});
