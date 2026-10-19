import test from 'node:test';
import assert from 'node:assert/strict';
import { scpiData } from '../../src/data/scpiData';
import { scpiDataExtended } from '../../src/data/scpiDataExtended';
import { enrichScpiExtendedArray } from '../../src/utils/enrichScpiExtended';
import { buildScpiForAnalysis } from '../../src/utils/buildScpiForAnalysis';
import { getScpiAdvantages, getScpiPointsAttention } from '../../src/utils/scpiAnalysis';
import catalog from '../../src/data/scpi_complet.json';
import cohort from '../../src/data/certified_scpi_cohort.json';

const verified = [
  { name: 'CORUM Eurion', reconstitution: 224.07, buildings: 54, distribution: 5.73, investors: 42702 },
  { name: 'CORUM Origin', reconstitution: 1186.30, buildings: 170, distribution: 6.50, investors: 76169 },
  { name: 'CORUM USA', reconstitution: 216.34, buildings: undefined, distribution: 7.70, investors: 4716 },
  { name: 'CORUM XL', reconstitution: 194.27, buildings: 96, distribution: 5.30, investors: 54340 },
];
const enriched=enrichScpiExtendedArray(scpiDataExtended,scpiData);

test('Crash: production catalog has 65 published SCPI and EXACT source-certified CORUM values',()=>{
  assert.equal(cohort.count,65);
  for(const item of verified){
    const row=catalog.find(r=>r['Nom SCPI']===item.name);
    assert.ok(row,item.name+' absent du catalogue');
    assert.equal(row['Valeur de reconstitution par part (€)'],item.reconstitution,item.name);
    assert.equal(row['Taux de distribution (%)'],item.distribution,item.name);
    assert.equal(row['td_reference_period'],'2025-RA');
    assert.equal(row['debt_reference_period'],'2025-RA');
    assert.equal(row['Période bulletin trimestriel'],'T2 2026');
    assert.equal(row["Nombre d'immeubles"],item.buildings,item.name);
    assert.equal(row['Nombre d’associés'],item.investors,item.name+' 2026-T2 source');
  }
});

test('Crash: full live comparator mapping + modal analysis uses actual production catalog, not private overlay',()=>{
  for(const item of verified){
    const scpi=scpiData.find(s=>s.name===item.name);
    const extended=enriched.find(s=>s.name===item.name);
    assert.ok(scpi,item.name+' missing in scpiData');
    assert.ok(extended,item.name+' missing from comparator extended catalog');
    assert.equal(scpi.valeurReconstitution,item.reconstitution,item.name+' scpiData valuation');
    assert.equal(extended.reconstitutionValue,item.reconstitution,item.name+' comparator valuation');
    assert.equal(scpi.nbImmeubles,item.buildings,item.name+' source property count');
    assert.equal(extended.assetsCount,item.buildings,item.name+' comparator property count');
    assert.equal(scpi.nombreAssocies,item.investors,item.name+' source investors');
    assert.equal(extended.nombreAssocies,item.investors,item.name+' comparator investors');
    const detail=buildScpiForAnalysis(extended!,scpiData);
    assert.ok(detail,item.name+' analysis missing');
    assert.equal(detail.valeurReconstitution,item.reconstitution,item.name+' modal source valuation');
    assert.equal(detail.nbImmeubles,item.buildings,item.name+' modal property count');
    assert.ok(getScpiAdvantages(detail!).length>=2,item.name+' empty favorable analysis');
    assert.ok(getScpiPointsAttention(detail!).length>=2,item.name+' empty risk analysis');
    assert.ok(extended.strategy?.startsWith('Répartition publiée'),item.name+' empty source based portfolio narrative');
  }
});

test('Crash: source-documented CORUM lease commitment is visible as a WALB proxy, never as an invented WALT',()=>{
 const publishedLeaseCommitment: Record<string, number> = {
   'CORUM Eurion': 6.36,
   'CORUM Origin': 6.05,
   'CORUM USA': 8.88,
   'CORUM XL': 7.45,
 };
 for(const item of verified){
  const src=scpiData.find(s=>s.name===item.name)!;
  const row=catalog.find(r=>r['Nom SCPI']===item.name)!;
  assert.equal(src.walb,publishedLeaseCommitment[item.name],item.name+' published lease proxy');
  assert.equal(row.WALB,publishedLeaseCommitment[item.name],item.name+' source catalog parity');
  assert.equal(src.walbReferenceDate,'2026-06-30',item.name+' lease source period');
  assert.match(src.walbSourceUrl || '',/^https:\/\/www\.corum\.fr\//,item.name+' issuer PDF source');
  assert.match(src.walbDefinition || '',/proxy WALB|pondération non communiquée/,item.name+' methodology caveat');
  assert.equal(src.walt,undefined,item.name+' WALT must not be invented');
  for(const key of ['nombreLocataires','collecteNetteTrimestre','nbCessionsTrimestre'] as const){
    assert.equal(src[key],undefined,item.name+' undocumented field must remain missing');
  }
 }
});
