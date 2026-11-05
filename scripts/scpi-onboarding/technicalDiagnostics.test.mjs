import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseTypeScriptDiagnostics,diagnosticDelta,repairUnusedImports} from './technicalDiagnostics.mjs';

test('technical diagnostics retain real errors and compare by message rather than shifted lines',()=>{
 const a=parseTypeScriptDiagnostics("src/a.ts(1,8): error TS6133: 'x' is declared but its value is never read.\nsrc/b.ts(2,1): error TS18047: 'client' is possibly 'null'.");
 assert.equal(a[1].cause,'NULLABILITY_CONTRACT');
 assert.deepEqual(diagnosticDelta(a,[{...a[1],line:200}]),{before:2,after:1,removed:1,introduced:0});
 assert.equal(diagnosticDelta(a,[...a,{...a[1],file:'src/c.ts'}]).introduced,1);
});
test('only diagnosed import bindings are repaired, preserving emitted JS and live values',()=>{
 const file='src/fund.ts';
 const source="import { missing, live } from './source';\nconst financialValue=320;\nexport const value=live(financialValue);";
 const ds=[{file,line:1,column:10,code:6133,message:"'missing' is declared but its value is never read."}];
 const r=repairUnusedImports(source,file,ds);
 assert.equal(r.report.applied,true);assert.equal(r.report.emitted_javascript_identical,true);
 assert.ok(!r.output.includes('missing'));assert.ok(r.output.includes('financialValue=320'));
 assert.equal(r.report.publication_authorized,false);
 assert.equal(repairUnusedImports(source,file,[]).output,source);
});
test('side-effect imports and unused executable declarations are never auto-deleted',()=>{
 const file='src/fund.ts';const source="import './register';\nconst unused=registerFund();";
 const r=repairUnusedImports(source,file,[{file,line:2,column:7,code:6133,message:"'unused' is declared but its value is never read."}]);
 assert.equal(r.output,source);assert.equal(r.report.applied,false);
});
test('stale or false diagnostics cannot remove a live import or change emitted JS',()=>{
 const file='src/fund.ts';const source="import { live } from './source';\nexport const value=live(320);";
 const r=repairUnusedImports(source,file,[{file,line:1,column:10,code:6133,message:"'live' is declared but its value is never read."}]);
 assert.equal(r.report.emitted_javascript_identical,false);assert.equal(r.report.applied,false);
 assert.equal(r.output,source);
});
test('unrelated diagnostics produce no formatting repair and no repaired count',()=>{
 const file='src/fund.ts';const source="import {live} from './source';\nconst unused=0;\nexport const value=live(320);";
 const r=repairUnusedImports(source,file,[{file,line:2,column:7,code:6133,message:"'unused' is declared but its value is never read."}]);
 assert.equal(r.output,source);assert.equal(r.report.imports_rewritten,0);assert.equal(r.report.applied,false);
});
test('outdated coordinates are ignored without terminating a repair batch',()=>{
 const r=repairUnusedImports('export const value=320;','src/fund.ts',[
  {file:'src/fund.ts',line:999,column:100,code:6133,message:"'value' is declared but its value is never read."}]);
 assert.equal(r.output,'export const value=320;');assert.equal(r.report.applied,false);
});
