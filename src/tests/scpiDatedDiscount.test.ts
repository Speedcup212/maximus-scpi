import {describe,it,expect} from 'vitest';
import {scpiData} from '../data/scpiData';
import {getScpiDatedDiscount} from '../utils/scpiDatedDiscount';

describe('indicative historical valuation facts without granting certification',()=>{
 const sofidynamic=scpiData.find(scpi=>scpi.name==='Sofidynamic');
 it('calculates 4.97% dated discount with both official reference dates',()=>{
  expect(sofidynamic).toBeDefined();
  const dated=getScpiDatedDiscount(sofidynamic!);
  expect(dated?.value).toBeCloseTo(-4.973,2);
  expect(dated?.formatted).toBe('4,97 %');
  expect(dated?.label).toBe('Décote indicative');
  expect(dated?.priceDate).toBe('30/06/2026');
  expect(dated?.valuationDate).toBe('31/12/2025');
  expect(sofidynamic?.discountQaStatus).toBe('manual_review');
  expect(sofidynamic?.isRecommended).toBe(false);
 });
 it('keeps an equally dated indicative value visible without promoting financial QA (synthetic fixture)',()=>{
  if(!sofidynamic)throw Error('Missing Sofidynamic');
  // Synthetic dates and values exercise only the UI formatter; they are not source certification.
  const provenance=sofidynamic.metricProvenance||{};
  const base={
    ...sofidynamic,
    valeurReconstitution:340.38,
    metricProvenance:{
      ...provenance,
      prix_reconstitution:{
        ...provenance.prix_reconstitution,
        value_numeric:340.38,
        reference_date:'2026-06-30',
      },
    },
  };
  const result=getScpiDatedDiscount(base);
  expect(result?.formatted).toBe('5,99 %');
  expect(result?.label).toBe('Décote indicative');
  expect(result?.comparisonLabel).toContain('valeur de reconstitution au 30/06/2026');
  expect(base.discountQaStatus).toBe('manual_review');
  expect(base.isRecommended).toBe(false);
  // A valuation from after the observed subscription price must not be compared.
  const future={...base,metricProvenance:{
    ...base.metricProvenance,
    prix_reconstitution:{...base.metricProvenance.prix_reconstitution,reference_date:'2026-12-31'}
  }};
  expect(getScpiDatedDiscount(future)).toBeNull();
 });
 it('requires original source SHA, date and numeric agreement',()=>{
  if(!sofidynamic)throw Error('Missing Sofidynamic');
  expect(getScpiDatedDiscount({...sofidynamic,metricProvenance:undefined})).toBeNull();
  expect(getScpiDatedDiscount({...sofidynamic,price:310})).toBeNull();
  expect(getScpiDatedDiscount({...sofidynamic,maximusDisabledFeatures:[]})).toBeNull();
  expect(getScpiDatedDiscount({...sofidynamic,maximusPublicationStatus:'certified'})).toBeNull();
  expect(getScpiDatedDiscount({...sofidynamic,liquidityRegimeChanged:true})).toBeNull();
 });
 it('country normalization and essential issuer facts remain available in the actual public catalogue',()=>{
  expect(sofidynamic?.repartitionGeo).toEqual([
    {name:'France',value:54.8},
    {name:'Pays-Bas',value:36.9},
    {name:'Espagne',value:8.2}
  ]);
  expect(sofidynamic?.fees).toBe(2.4);
  expect(sofidynamic?.fraisGestion).toBe(12);
  expect(sofidynamic?.distribution).toBe(5.52);
  expect(sofidynamic?.nombreAssocies).toBe(8380);
  expect(sofidynamic?.nbImmeubles).toBe(37);
 });
 it('missing WALT, WALB, tenants remain missing; units are distinct',()=>{
  expect(sofidynamic?.nombreUnitesLocatives).toBe(681);
  expect(sofidynamic?.nombreLocataires).toBeUndefined();
  expect(sofidynamic?.walb).toBeUndefined();
  expect(sofidynamic?.walt).toBeUndefined();
  expect(sofidynamic?.partsAttenteRetrait).toBe(0);
 });
});
