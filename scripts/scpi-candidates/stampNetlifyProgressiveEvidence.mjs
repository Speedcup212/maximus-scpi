// RECOVERY-081: immutable, public, non-secret proof of what the Netlify
// production build actually rendered. Never stores privileged keys.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {validateChromiumReport,validateProvisionalCatalog}
 from './autonomousProgressiveRelease.mjs';

const root=process.cwd();
const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const cohort=JSON.parse(fs.readFileSync('src/data/certified_scpi_cohort.json','utf8'));
const catalog=JSON.parse(fs.readFileSync('src/data/scpi_complet.json','utf8'));
const {sourceSha}=validateProvisionalCatalog(cohort,catalog,'sofidynamic');
const reportBytes=fs.readFileSync('test-results/scpi-progressive-public/report.json');
const report=JSON.parse(reportBytes.toString('utf8'));
validateChromiumReport(report,sha);
const browserReportSha=crypto.createHash('sha256').update(reportBytes).digest('hex');
const evidence={
 schema_version:1,
 project:'maximusscpi',
 environment:'production',
 candidate:'sofidynamic',
 source_period:'2026-T2',
 commit:sha,
 source_pdf_sha256:sourceSha,
 browser_report_sha256:browserReportSha,
 browser_report:report,
 verified_reference_dates:{quarter:'2026-06-30',annual:'2025-12-31'},
 full_certification_claim:false,
};
const target=path.join(root,'dist','.well-known','scpi-progressive-evidence.json');
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,JSON.stringify(evidence,null,2)+'\n');
console.log('NETLIFY_PROGRESSIVE_PROOF_READY',JSON.stringify({sha,cases:report.cases.length,sourcePeriod:evidence.source_period,browserReportSha}));
