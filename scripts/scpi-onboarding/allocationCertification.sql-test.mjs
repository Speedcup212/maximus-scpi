// Execute the real allocation gate and migration in an ephemeral PostgreSQL engine.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const {PGlite}=await import(process.env.SCPI_SQL_TEST_MODULE||'@electric-sql/pglite');
const read=p=>fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8');
const old=read('supabase/migrations/20261017_candidate_allocation_certification_release_gate.sql').split('-- Fail-closed financial/product release:')[0];
const migration=read('supabase/migrations/20261104090844_reconcile_allocation_rounding_views.sql');
test('real PostgreSQL allocation gates: rounding, completeness, source integrity and private grants',async()=>{
 const db=new PGlite();
 try {
 await db.exec(`create schema maximus_agents;
 create role anon;create role authenticated;create role service_role;
 create table public.scpi_indicators(scpi_slug text,source_period text,repartition_geographique jsonb,repartition_sectorielle jsonb);
 create table maximus_agents.scpi_candidate_release_members(scpi_slug text);
 create table maximus_agents.scpi_universe(scpi_slug text);
 create table maximus_agents.scpi_candidate_allocations(scpi_slug text,source_period text,allocation_type text,label text,pct numeric,qa_status text,source_page int,source_url text,source_sha256 text,evidence_excerpt text);
 create table public.scpi_bulletins(scpi_slug text,period text,source_url text,pdf_sha256 text,qa_status text);
 create table maximus_agents.scpi_candidate_pdf_validation(scpi_slug text,source_period text,source_url text,document_kind text,page_count int,document_identity_verified boolean,pdf_sha256 text);
 create function public.scpi_is_strong_qa(text) returns boolean language sql immutable as $$select $1='qa_pass'$$;`);
 const snapshot=JSON.parse(read('scripts/scpi-onboarding/fixtures/sofidynamic-69-staging-2026-t2.json'));
 const slug='sofidynamic',period=snapshot.source_period,sha=snapshot.source_pdf_sha256,url='https://www.sofidy.com/source.pdf';
 await db.query('insert into public.scpi_indicators values ($1,$2,$3,$4)',[slug,period,snapshot.geography_values,snapshot.sector_values]);
 await db.query('insert into maximus_agents.scpi_candidate_release_members values ($1)',[slug]);
 await db.query('insert into maximus_agents.scpi_universe values ($1)',[slug]);
 await db.query('insert into public.scpi_bulletins values ($1,$2,$3,$4,$5)',[slug,period,url,sha,'qa_pass']);
 await db.query('insert into maximus_agents.scpi_candidate_pdf_validation values ($1,$2,$3,$4,6,true,$5)',[slug,period,url,'quarterly_bulletin',sha]);
 for(const [type,values] of [['geography',snapshot.geography_values],['sector',snapshot.sector_values]])
  for(const [label,pct] of Object.entries(values))await db.query('insert into maximus_agents.scpi_candidate_allocations values ($1,$2,$3,$4,$5,$6,2,$7,$8,$9)',[slug,period,type,label,pct,'qa_pass',url,sha,'Documented issuer allocation exact label and percentage, page 2.']);
 const gate=async()=> (await db.query('select * from maximus_agents.scpi_candidate_allocation_certification_v1')).rows[0];
 await db.exec(old);assert.equal((await gate()).geography_verified,false,'Reproduce original 99.9 rejection');
 await db.exec(migration);assert.equal((await gate()).allocations_verified,true);
 await db.exec(migration);assert.equal((await gate()).allocations_verified,true,'Idempotent migration');
 // Every original blocking predicate must still deny the entire certification.
 for(const mutation of [
  "update maximus_agents.scpi_candidate_allocations set qa_status='needs_review' where label='Paris'",
  "update maximus_agents.scpi_candidate_allocations set source_page=7 where label='Paris'",
  "update maximus_agents.scpi_candidate_allocations set source_sha256=repeat('0',64) where label='Paris'",
  "update maximus_agents.scpi_candidate_allocations set source_period='2026-T1' where label='Paris'",
  "delete from maximus_agents.scpi_candidate_allocations where label='Paris'",
  "insert into maximus_agents.scpi_candidate_allocations select * from maximus_agents.scpi_candidate_allocations where label='Paris'",
  "update public.scpi_bulletins set qa_status='pending'",
  "update maximus_agents.scpi_candidate_pdf_validation set document_identity_verified=false",
  "update maximus_agents.scpi_candidate_allocations set pct=9.8 where label='Paris'",
 ]) {
  await db.exec('begin');await db.exec(mutation);assert.equal((await gate()).allocations_verified,false,mutation);await db.exec('rollback');
 }
 // Reject values with undocumented hundredths even if numerically within tolerance.
 await db.exec(`begin;update maximus_agents.scpi_candidate_allocations set pct=9.89 where label='Paris';
 update public.scpi_indicators set repartition_geographique=jsonb_set(repartition_geographique,'{Paris}','9.89');`);
 assert.equal((await gate()).geography_verified,false);await db.exec('rollback');
 const grants=await db.query("select has_table_privilege('anon','maximus_agents.scpi_candidate_allocation_certification_v1','SELECT') a, has_table_privilege('authenticated','maximus_agents.scpi_candidate_allocation_certification_v1','SELECT') b");
 assert.equal(grants.rows[0].a,false);assert.equal(grants.rows[0].b,false);
 const opts=await db.query("select reloptions from pg_class where oid='maximus_agents.scpi_candidate_allocation_certification_v1'::regclass");
 assert.ok(opts.rows[0].reloptions.includes('security_invoker=true'));
 } finally {await db.close()}
});
