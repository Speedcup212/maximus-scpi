import { isNewsEditoriallyValid } from './scpiNewsEditorialGate.mjs';
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'');
const safe=x=>x&&x.sourceOfficial===true&&x.investmentRelated===true&&
 x.dataQuality!=='weak'&&Number(x.editorialPriority)>0&&isNewsEditoriallyValid(x);
const signature=x=>[normalize(x.scpi),x.date,normalize(x.city),normalize(x.country),normalize(x.assetType)].join('|');
const sourceKey=x=>String(x.sourceUrl||'').trim().replace(/\/+$/,'').toLowerCase();
/**
 * Keep editorially approved current entries as the authority; audit history is not
 * publication authority. Only append independently validated, non-duplicate news.
 */
export function reconcileScpiNewsSnapshot(approved,newCandidates){
 const result=[],ids=new Set(),sources=new Set(),events=new Set();
 for(const x of [...(Array.isArray(approved)?approved:[]),...(Array.isArray(newCandidates)?newCandidates:[])]){
  if(!safe(x))continue;
  const identity=signature(x),source=sourceKey(x);
  if(!source||ids.has(x.id)||sources.has(source)||events.has(identity))continue;
  ids.add(x.id);sources.add(source);events.add(identity);result.push(x);
 }
 return result.sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(a.scpi).localeCompare(String(b.scpi),'fr'));
}
