import assert from 'node:assert/strict';
import fs from 'node:fs';
import { transformSync } from 'esbuild';
const source=fs.readFileSync('supabase/functions/scpi-news-watch/index.ts','utf8');
assert.ok(source.length>10000,'Unexpectedly empty or replaced crawler');
transformSync(source,{loader:'ts',format:'esm',target:'es2022'});
for(const [label,pattern] of [
 ['checkpoint by URL group',/cursor:end,group_urls:urls,progress:details/],
 ['bounded batches',/start\+2/],
 ['cron resume route',/trigger==="resume"/],
 ['closed completed runs',/finished_at:done\?/],
 ['stale run protection',/4\*3600000/],
 ['error termination',/finished_at:new Date\(\)\.toISOString\(\),status:"error"/],
 ['no generic auto publication',/status:published\?"published":"review"/],
 ['date validity',/Date\.parse\(d\)/],
 ['duplicate key',/onConflict:"fingerprint",ignoreDuplicates:true/],
 ['partial source reporting',/sourceStatus=ok\?"active":r\.partial\?"incomplete":"error"/]
])assert.match(source,pattern,label);
assert.doesNotMatch(source,/for\(let i=0;i<gs\.length;i\+=4\)/,'Unbounded all-groups scan reintroduced');
const certify=fs.readFileSync('supabase/functions/scpi-evidence-certify/index.ts','utf8');
transformSync(certify,{loader:'ts',format:'esm',target:'es2022'});
assert.match(certify,/requestedIds\.length[\s\S]{0,180}row\.period === "2026-T3"/,'Only targeted T3 partial documents can receive field proof');
assert.match(certify,/!\/\^invalid_\|not_bulletin\|wrong_document/,'Invalid source exclusion must remain');
assert.doesNotMatch(certify,/\.update\(\{\s*qa_status:/,'Evidence verifier must never auto-promote the quarter');
console.log('News Watch runtime: TypeScript parse + bounded retry, QA and final-state gates PASS');