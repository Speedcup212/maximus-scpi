import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
test('hero migration is repeatable and replaces both matching card classes',()=>{
 const dir=mkdtempSync(join(tmpdir(),'hero-regression-'));
 try {
  mkdirSync(join(dir,'scripts')); mkdirSync(join(dir,'src'));
  const files=['src/HomeApp.tsx','index.html','scripts/syncHomeStaticHero.mjs'];
  for(const f of files) writeFileSync(join(dir,f),execFileSync('git',['show','HEAD:'+f]));
  writeFileSync(join(dir,'scripts/patchHomeHeroVisuals.mjs'),readFileSync(new URL('./patchHomeHeroVisuals.mjs',import.meta.url)));
  const run=()=>spawnSync(process.execPath,[join(dir,'scripts/patchHomeHeroVisuals.mjs')],{encoding:'utf8'});
  const first=run(); assert.equal(first.status,0,first.stderr);
  const result=files.map(f=>readFileSync(join(dir,f),'utf8'));
  assert.ok(!result[0].includes('absolute bottom-6 right-4'));
  assert.equal(run().status,0);
  assert.deepEqual(files.map(f=>readFileSync(join(dir,f),'utf8')),result);
  writeFileSync(join(dir,'src/HomeApp.tsx'),result[0].replace('Analysez. Comparez.','UNKNOWN TITLE'));
  const before=files.map(f=>readFileSync(join(dir,f),'utf8'));
  assert.notEqual(run().status,0);
  assert.deepEqual(files.map(f=>readFileSync(join(dir,f),'utf8')),before);
 } finally {rmSync(dir,{recursive:true,force:true});}
});
