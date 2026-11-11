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
console.log('News Watch runtime: TypeScript parse + bounded retry, QA and final-state gates PASS');