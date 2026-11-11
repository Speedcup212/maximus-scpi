import { describe,it,expect } from 'vitest';
import published from '../../data/news/scpi-investment-news-latest.json';
import history from '../../data/news/scpi-investment-news-history.json';
import { reconcileScpiNewsSnapshot } from './scpiNewsSnapshotMerge.mjs';

describe('Actualités — aucun retour arrière du collecteur',()=>{
 const enriched={
  ...published[0],id:'synthetic-new',scpi:'SCPI Exemple',title:'SCPI Exemple acquiert des bureaux à Lyon',
  summary:'La SCPI Exemple acquiert un immeuble de bureaux de 3 000 mètres carrés à Lyon, selon son communiqué officiel daté et signé. Cette donnée est utilisée uniquement comme fixture de test.',
  sourceUrl:'https://example.org/scpi-exemple-acquisition-lyon',date:'2026-11-10',
  city:'Lyon',country:'France',assetType:'bureaux',
 };
 it('conserve les 31 actualités corrigées et écarte le contenu historique non certifié',()=>{
  const baseline=reconcileScpiNewsSnapshot(published,[]);
  expect(baseline).toHaveLength(published.length);
  const merged=reconcileScpiNewsSnapshot(published,history);
  for(const entry of published) expect(merged.find(x=>x.id===entry.id)).toEqual(entry);
  expect(merged.find(x=>x.scpi==='Optimale')?.city).toBe('Belz et Le Plessis-Robinson');
  expect(merged.filter(x=>x.scpi==='Transitions Europe')).toHaveLength(7);
  expect(merged.some(x=>!x.date)).toBe(false);
 });
 it('préserve deux acquisitions distinctes couvertes par un même communiqué',()=>{
  const merged=reconcileScpiNewsSnapshot(published,[]);
  expect(merged.some(x=>x.scpi==='Ficommerce Proximité')).toBe(true);
  expect(merged.some(x=>x.scpi==='Buroboutic Métropoles')).toBe(true);
 });
 it('ajoute une nouvelle source documentée mais ignore le doublon et une nouvelle sans date',()=>{
  const added=reconcileScpiNewsSnapshot(published,[enriched,{...enriched,id:'duplicate'},{...enriched,id:'undated',sourceUrl:'https://example.org/undated',date:''}]);
  expect(added.length).toBe(published.length+1);
  expect(added.filter(x=>x.scpi==='SCPI Exemple')).toHaveLength(1);
 });
});
