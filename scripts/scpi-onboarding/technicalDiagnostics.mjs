// Technical repair adapter for the existing remediation pipeline. Never handles data QA.
import ts from 'typescript';
import crypto from 'node:crypto';

export function parseTypeScriptDiagnostics(log) {
  return [...log.matchAll(/^(.+?)\((\d+),(\d+)\): error TS(\d+): (.*)$/gm)]
    .map(([,file,line,column,code,message])=>({file,line:+line,column:+column,code:+code,message,
      category:'TECHNICAL', cause:[6133,6192,6196].includes(+code)?'UNUSED_SYMBOL':
        [18047,18048,18049].includes(+code)?'NULLABILITY_CONTRACT':
        +code===2307?'MISSING_MODULE':+code===2556?'NON_TUPLE_SPREAD':'TYPE_CONTRACT'}));
}

export function diagnosticDelta(before,after) {
  const key=d=>JSON.stringify([d.file,d.code,d.message.replaceAll(/\/[^\s"']*\/maximus-scpi\//g,'<ROOT>/')
    .replaceAll(/\.\.\. \d+ more \.\.\./g,'... more ...')]);
  const tally=rows=>{const m=new Map();for(const d of rows)m.set(key(d),(m.get(key(d))||0)+1);return m;};
  const a=tally(before),b=tally(after);
  return {before:before.length,after:after.length,
    removed:[...a].reduce((s,[k,n])=>s+Math.max(0,n-(b.get(k)||0)),0),
    introduced:[...b].reduce((s,[k,n])=>s+Math.max(0,n-(a.get(k)||0)),0)};
}

export function repairUnusedImports(source,file,diagnostics) {
  const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,
    file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  const ds=diagnostics.filter(d=>d.file===file&&[6133,6192].includes(d.code));
  const starts=ast.getLineStarts();
  // Old diagnostics may refer to lines removed by an earlier repair pass.
  // Ignore invalid coordinates; they cannot justify an edit or crash a batch.
  const positions=ds.flatMap(d=>{
    const start=starts[d.line-1],end=starts[d.line]??source.length;
    return start!==undefined&&d.column>=1&&start+d.column-1<=end
      ?[{...d,position:start+d.column-1}]:[];
  });
  const printer=ts.createPrinter();const edits=[];
  for(const node of ast.statements) {
    if(!ts.isImportDeclaration(node)||!node.importClause)continue;
    const all=positions.some(d=>d.code===6192&&d.position>=node.getStart(ast)&&d.position<node.end);
    const unused=id=>!!id&&(all||positions.some(d=>d.code===6133&&
      d.position>=id.getStart(ast)&&d.position<id.end&&d.message.includes("'"+id.text+"'")));
    const clause=node.importClause;
    const name=unused(clause.name)?undefined:clause.name;
    let bindings=clause.namedBindings;
    if(bindings&&ts.isNamespaceImport(bindings)&&unused(bindings.name))bindings=undefined;
    if(bindings&&ts.isNamedImports(bindings)) {
      const keep=bindings.elements.filter(e=>!unused(e.name));
      if(keep.length!==bindings.elements.length)
        bindings=keep.length?ts.factory.updateNamedImports(bindings,keep):undefined;
    }
    if(name===clause.name&&bindings===clause.namedBindings)continue;
    const replacement=!name&&!bindings?'':printer.printNode(ts.EmitHint.Unspecified,
      ts.factory.updateImportDeclaration(node,node.modifiers,
        ts.factory.updateImportClause(clause,clause.isTypeOnly,name,bindings),node.moduleSpecifier,node.attributes),ast);
    edits.push({start:node.getStart(ast),end:node.end,replacement});
  }
  let output=source;
  for(const e of [...edits].reverse())output=output.slice(0,e.start)+e.replacement+output.slice(e.end);
  const emitted=s=>ts.transpileModule(s,{fileName:file,compilerOptions:{
    target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX,
  }}).outputText;
  const equivalent=emitted(source)===emitted(output);
  const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
  return {output:equivalent?output:source,report:{file,category:'TECHNICAL',
    cause:'UNUSED_IMPORT_BINDING',correction:'REMOVE_COMPILER_PROVEN_UNUSED_IMPORT',
    applied:equivalent&&output!==source,imports_rewritten:equivalent?edits.length:0,
    emitted_javascript_identical:equivalent,javascript_sha256:hash(emitted(source)),source_before_sha256:hash(source),
    source_after_sha256:hash(equivalent?output:source),publication_authorized:false}};
}
