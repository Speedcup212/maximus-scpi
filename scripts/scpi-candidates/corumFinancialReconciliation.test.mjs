import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync(new URL('../../supabase/migrations/20261016_corum_financial_source_reconciliation_and_unapproved_audits.sql',import.meta.url),'utf8');

test('Financial source reconciliation accepts only the four unapproved CORUM with 69 reviewed proofs',()=>{
 assert.match(sql,/n<>69/);
 assert.match(sql,/e\.independently_reviewed_at IS NOT NULL/);
 assert.match(sql,/e\.source_page>0/);
 assert.match(sql,/u?.?publication_authorized|publication_authorized/);
 assert.match(sql,/i\.td_annee=2025/);
 assert.match(sql,/abs\(i\.capitalisation-\(i\.nombre_parts\*i\.prix_souscription\/1000000\.0\)\)/);
});
test('No invented global blended fee: CORUM USA and XL use territory-split costs',()=>{
 assert.match(sql,/management_fee_euro_zone_ht/);
 assert.match(sql,/management_fee_non_euro_zone_ht/);
 assert.match(sql,/12\.40::numeric/);
 assert.match(sql,/15\.90::numeric/);
 assert.match(sql,/frais_gestion=NULL/);
 assert.match(sql,/CORUM XL T2 54,340 associates/);
 assert.match(sql,/e\.numeric_value=54340/);
 assert.doesNotMatch(sql,/weighted.average/i);
});
test('Existing history refreshes and financial auditors never self-approve final review',()=>{
 assert.match(sql,/PERFORM public\.refresh_scpi_bulletin_analysis\(slug\)/);
 assert.match(sql,/previous_snapshot->>'distribution_par_part'/);
 assert.match(sql,/audit_status='pending'/);
 assert.match(sql,/INTO maximus_agents\.scpi_candidate_final_audit/);
 assert.match(sql,/NULL,NULL,NULL,NULL/);
 assert.doesNotMatch(sql,/SET\s+publication_authorized\s*=\s*true/i);
 assert.doesNotMatch(sql,/SET\s+analysis_certified\s*=\s*true/i);
 assert.doesNotMatch(sql,/SET\s+qa_status\s*=\s*'manual_verified_official'/i);
});
