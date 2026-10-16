// Candidate geography is a keyed set of countries, never an unlabeled chart
// sequence. A mere 100% total does not catch country-percentage permutations.
const normalize=(s)=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .replace(/\s+/g,' ').trim().toLowerCase();
export function assertExactGeography(candidate,live){
 const p=candidate?.publishing_fields?.geographic_allocation;
 const c=live?.repartition_geographique;
 if(!p||!c||typeof p!=='object'||typeof c!=='object'||Array.isArray(p)||Array.isArray(c))
   throw Error('Missing geographic source-to-public comparison: '+candidate?.scpi_slug);
 const toMap=(v)=>{
  const out=new Map();
  for(const [label,weight] of Object.entries(v)){
   const name=normalize(label);
   const x=Number(weight);
   if(!name||out.has(name)||!Number.isFinite(x)||x<0||x>100)
     throw Error('Ambiguous geographic label or weight: '+candidate?.scpi_slug+':'+label);
   out.set(name,x);
  }
  if(!out.size||Math.abs([...out.values()].reduce((a,b)=>a+b,0)-100)>0.01)
    throw Error('Geographic weights not 100%: '+candidate?.scpi_slug);
  return out;
 };
 const desired=toMap(p),actual=toMap(c);
 if(desired.size!==actual.size)
   throw Error('Geographic country-count mismatch: '+candidate.scpi_slug);
 for(const [country,weight] of desired){
  if(!actual.has(country)||Math.abs(actual.get(country)-weight)>0.01)
   throw Error('Geographic country percentage mismatch: '+candidate.scpi_slug+':'+country);
 }
 return true;
}
