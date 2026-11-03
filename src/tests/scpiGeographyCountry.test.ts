import {describe,it,expect} from 'vitest';
import {aggregateCountryGeography} from '../utils/scpiGeography';
import {normalizeGeoLabel} from '../utils/labelNormalization';
describe('source-preserving country geography',()=>{
 it('Sofidynamic: Paris + Île-de-France + Régions = 54.8 France without fake 0.1%',()=>{
  const source={'Paris':9.9,'Région parisienne':15.5,'Régions':29.4,'Pays-Bas':36.9,'Espagne':8.2};
  const copy=JSON.stringify(source), output=aggregateCountryGeography(source);
  expect(output).toEqual({'France':54.8,'Pays-Bas':36.9,'Espagne':8.2});
  expect(Object.values(output).reduce((a,b)=>a+b,0)).toBeCloseTo(99.9,5);
  expect(JSON.stringify(source)).toBe(copy);
 });
 it('various country-level French aliases are grouped, foreign countries unchanged',()=>{
  expect(normalizeGeoLabel('Île-de-France')).toEqual({key:'france',label:'France'});
  expect(normalizeGeoLabel('Région parisienne')).toEqual({key:'france',label:'France'});
  expect(normalizeGeoLabel('Paris et Île-de-France')).toEqual({key:'france',label:'France'});
  expect(aggregateCountryGeography({France:10,Paris:20,'Île-de-France':30,Espagne:40})).toEqual({France:60,Espagne:40});
  expect(aggregateCountryGeography({'Région lombarde':45,Italie:55})).toEqual({Italie:55,'Région lombarde':45});
 });
 it('does not turn missing data into zero, country, or a balancing bucket',()=>{
  expect(aggregateCountryGeography(null)).toEqual({});
  expect(aggregateCountryGeography({'Paris':'12,5','Allemagne':87.4,Inconnue:-3})).toEqual({'Allemagne':87.4,'France':12.5});
 });
});
