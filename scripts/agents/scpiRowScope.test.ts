import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { onlyCurrentScpiRow } from '../../src/utils/scpiRowScope';
import { resolveCertifiedLiquidity } from '../../src/utils/certifiedLiquidity';

const gate = (scpi_slug: string) => ({
  scpi_slug,
  data_gate:'PASS', structural_gate:'PASS', semantic_gate:'PASS',
  liquidity_gate:'PASS', liquidity_signal_eligible:true,
});
const liquidity = (scpi_slug: string, percentage: number) => ({
  scpi_slug, source_period:'2026-T2',
  liquidity_basis:'withdrawal_queue',
  retrait_attente_pct:percentage, prev_pct:percentage-1,
  signal_certification:'trajectory_certified',
  parts_attente_retrait:scpi_slug==='scpi-a'?500:8,
  nombre_parts:10000,
});
const history = (scpi_slug: string, value: number) => ({
  scpi_slug, previous_period:'2026-T1',current_period:'2026-T2',
  previous_tof:value-1,current_tof:value,tof_delta:1,
});
const provenance = (scpi_slug: string) => ({
  scpi_slug,source_period:'2026-T2',source_document:'Official '+scpi_slug,
});

test('A to B: no prior fund history, liquidity, gates or provenance may be displayed while B loads',()=>{
  const stateA={data:history('scpi-a',89),liquidity:liquidity('scpi-a',12),
    gate:gate('scpi-a'),source:provenance('scpi-a')};
  for(const row of Object.values(stateA)){
    assert.equal(onlyCurrentScpiRow(row,'scpi-b'),null);
  }
  assert.equal(resolveCertifiedLiquidity(
    onlyCurrentScpiRow(stateA.liquidity,'scpi-b'),
    onlyCurrentScpiRow(stateA.gate,'scpi-b')
  ).currentPct,null);
  assert.equal(onlyCurrentScpiRow(stateA.data,'scpi-a')?.current_tof,89);
});

test('B gate before B liquidity: prior A liquidation must not leak through B certified status',()=>{
  const scopedA=onlyCurrentScpiRow(liquidity('scpi-a',18),'scpi-b');
  const scopedB=onlyCurrentScpiRow(gate('scpi-b'),'scpi-b');
  const certified=resolveCertifiedLiquidity(scopedA,scopedB);
  assert.equal(scopedA,null);
  assert.equal(certified.currentPct,null);
  assert.equal(certified.publishableLevel,false);
  assert.equal(certified.reason,'gate_blocked');
});

test('B liquidity before B gate: prior A approval cannot certify B liquidity',()=>{
  const scopedB=onlyCurrentScpiRow(liquidity('scpi-b',2),'scpi-b');
  const scopedA=onlyCurrentScpiRow(gate('scpi-a'),'scpi-b');
  const certified=resolveCertifiedLiquidity(scopedB,scopedA);
  assert.equal(scopedA,null);
  assert.equal(certified.currentPct,null);
  assert.equal(certified.publishableLevel,false);
});

test('Complete B response only yields B values, B gate and B source',()=>{
  const scopedL=onlyCurrentScpiRow(liquidity('scpi-b',2),'scpi-b');
  const scopedG=onlyCurrentScpiRow(gate('scpi-b'),'scpi-b');
  const scopedS=onlyCurrentScpiRow(provenance('scpi-b'),'scpi-b');
  const result=resolveCertifiedLiquidity(scopedL,scopedG);
  assert.equal(result.currentPct,2);
  assert.equal(result.previousPct,1);
  assert.equal(result.withdrawalParts,8);
  assert.equal(result.publishableLevel,true);
  assert.equal(scopedS?.source_document,'Official scpi-b');
});

test('Unknown or missing slug never inherits another SCPI financial row',()=>{
  assert.equal(onlyCurrentScpiRow(undefined,'scpi-b'),null);
  assert.equal(onlyCurrentScpiRow(null,'scpi-b'),null);
  assert.equal(onlyCurrentScpiRow({source_period:'2026-T2'},'scpi-b'),null);
  assert.equal(onlyCurrentScpiRow({scpi_slug:'',source_period:'2026-T2'},'scpi-b'),null);
});

test('UI contract: every indicator and provenance path consumes only fund-scoped rows',()=>{
  const component=readFileSync(new URL('../../src/components/ScpiIndicatorHistory.tsx',import.meta.url),'utf8');
  for(const name of ['data','liquidity','gate','source']){
    assert.match(component,new RegExp('const current'+name[0].toUpperCase()+name.slice(1)+' = onlyCurrentScpiRow\\('+name+', scpiSlug\\)'));
  }
  assert.match(component,/const metrics = useMemo<Metric\[\]>\(\(\) => \{\s*if \(!currentData\) return \[\]/);
  assert.match(component,/\}, \[currentData\]\);/);
  assert.match(component,/resolveCertifiedLiquidity\(currentLiquidity, currentGate\)/);
  assert.match(component,/currentGate\?\.liquidity_gate/);
  assert.match(component,/currentLiquidity\?\.source_period \|\| currentSource\?\.source_period/);
  assert.match(component,/currentSource\?\.source_document/);
  assert.match(component,/currentData\?\.previous_period/);
  const render=component.slice(component.lastIndexOf('  return (\n    <section'));
  assert.ok(render.length>0,'Financial render subtree must be present');
  assert.doesNotMatch(render,/(?<!current)\b(?:data|liquidity|gate|source)\?\./);
});
