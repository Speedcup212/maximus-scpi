import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync(new URL('../../supabase/migrations/20261016_scpi_exact_period_evidence_handoff.sql',import.meta.url),'utf8');
const rewire=fs.readFileSync(new URL('../../supabase/migrations/20261016_scpi_qa_status_trigger_rewire.sql',import.meta.url),'utf8');

test('QA transitions trigger the ORIGINAL analysis chain automatically',()=>{
 assert.match(sql,/CREATE OR REPLACE FUNCTION public\.trg_refresh_analysis_on_scpi_evidence\(\)/);
 assert.match(sql,/OLD\.qa_status IS DISTINCT FROM NEW\.qa_status/);
 assert.match(sql,/OLD\.pdf_sha256 IS DISTINCT FROM NEW\.pdf_sha256/);
 assert.match(sql,/OLD\.source_url IS DISTINCT FROM NEW\.source_url/);
 assert.match(sql,/PERFORM public\.certify_scpi_bulletin_analysis\(NEW\.scpi_slug\)/);
 assert.match(sql,/PERFORM public\.enforce_scpi_metric_evidence_v4_3\(NEW\.scpi_slug\)/);
 assert.match(sql,/PERFORM public\.enforce_scpi_liquidity_doctrine_v5\(NEW\.scpi_slug\)/);
 assert.match(sql,/AFTER INSERT ON public\.scpi_bulletins/);
});

test('A source link requires exact official identity, PDF SHA, period and URL',()=>{
 assert.match(sql,/NEW\.pdf_sha256 ~ '\^\[a-f0-9\]\{64\}\$'/);
 assert.match(sql,/v\.document_identity_verified/);
 assert.match(sql,/v\.pdf_sha256=NEW\.pdf_sha256/);
 assert.match(sql,/p\.pdf_sha256=NEW\.pdf_sha256/);
 assert.match(sql,/i\.source_period=NEW\.period/);
 assert.match(sql,/i\.source_url=NEW\.source_url/);
 assert.match(sql,/i\.bulletin_id IS NULL/);
 assert.match(sql,/u\.lifecycle='candidate'/);
 assert.match(sql,/UPDATE public\.scpi_indicators i/);
});

test('Certifications, public cohort and Netlify deployment remain fail-closed',()=>{
 assert.doesNotMatch(sql,/SET\s+qa_status\s*=/i);
 assert.doesNotMatch(sql,/SET\s+analysis_certified\s*=/i);
 assert.doesNotMatch(sql,/SET\s+publication_authorized\s*=/i);
 assert.doesNotMatch(sql,/UPDATE\s+public\.scpi_bulletins\s+SET/i);
 assert.doesNotMatch(sql,/UPDATE\s+maximus_agents\.scpi_universe\s+SET/i);
 assert.match(sql,/IF EXISTS \(SELECT 1 FROM public\.scpi_bulletin_analysis a/);
 assert.match(sql,/a\.current_source_certified OR a\.comparison_certified/);
 assert.match(sql,/RAISE EXCEPTION 'Refuse to bypass independent SCPI publication gate'/);
});

test('Existing bulletin trigger actually LISTENS to QA-only changes; not merely handler body',()=>{
 assert.match(rewire,/DROP TRIGGER IF EXISTS trg_scpi_bulletin_evidence_refresh_analysis/);
 assert.match(rewire,/AFTER UPDATE OF extraction_json,qa_status,pdf_sha256,source_url,period/);
 assert.match(rewire,/EXECUTE FUNCTION public\.trg_refresh_analysis_on_scpi_evidence\(\)/);
 assert.match(rewire,/AFTER INSERT OR UPDATE OF qa_status,source_url,source_period/);
 assert.match(rewire,/PERFORM public\.certify_scpi_bulletin_analysis\(NEW\.scpi_slug\)/);
 assert.match(rewire,/u\.lifecycle='candidate'/);
 assert.doesNotMatch(rewire,/UPDATE\s+maximus_agents\.scpi_universe/i);
 assert.doesNotMatch(rewire,/SET\s+qa_status\s*=/i);
});
