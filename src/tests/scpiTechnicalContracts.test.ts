import {describe,it,expect,vi} from 'vitest';
import {formatFiniteTooltipValue} from '../utils/formatters';
import {isEuropeanScpi} from '../utils/yieldDisplay';
import type {Scpi} from '../types/scpi';
import type {SCPIExtended} from '../data/scpiDataExtended';
import {resolveCertifiedLiquidity} from '../utils/certifiedLiquidity';
import {generatePortfolioPDF} from '../utils/pdfGenerator';
const {save}=vi.hoisted(()=>({save:vi.fn()}));
vi.mock('jspdf',async importOriginal=>{
 const actual=await importOriginal<typeof import('jspdf')>();
 return {...actual,default:class extends actual.default {
  constructor(){super();this.save=save;}
 }};
});

describe('SCPI shared technical contracts',()=>{
 it('preserves genuine numeric zero and refuses missing tooltip values',()=>{
  expect(formatFiniteTooltipValue(0,n=>`${n} €`)).toBe('0 €');
  expect(formatFiniteTooltipValue(320,n=>`${n} €`)).toBe('320 €');
  for(const v of [null,undefined,NaN,Infinity,'320',[320]])
   expect(formatFiniteTooltipValue(v,n=>`${n} €`)).toBe('Non disponible');
 });
 it('supports both geographic source contracts without treating an array as a string enum',()=>{
  expect(isEuropeanScpi({geography:'europe'} as Scpi)).toBe(true);
  expect(isEuropeanScpi({geography:'france'} as Scpi)).toBe(false);
  expect(isEuropeanScpi({geography:[{name:'France',value:70},{name:'Allemagne',value:30}]} as SCPIExtended)).toBe(false);
  expect(isEuropeanScpi({geography:[{name:'France',value:30},{name:'Allemagne',value:70}]} as SCPIExtended)).toBe(true);
  expect(isEuropeanScpi({geography:[]} as unknown as SCPIExtended)).toBe(false);
 });
 it('an absent liquidity gate never permits comparisons or a fabricated zero',()=>{
  for(const gate of [null,undefined]) {
   const r=resolveCertifiedLiquidity({signal_certification:'trajectory_certified',liquidity_basis:'withdrawal_queue',retrait_attente_pct:1,prev_pct:2},gate);
   expect(r.comparableTrend).toBe(false);expect(r.currentPct).toBeNull();
  }
 });
 it('generates the complete portfolio PDF without an out-of-scope capitalization variable',async()=>{
  save.mockClear();
  const fund={id:1,name:'Fixture privée',yield:5,percentage:100,investedAmount:320,
   price:320,capitalization:247588480,sector:'diversifie',geography:'france',tof:97,
   isr:false,european:false,company:'Fixture',creation:2024,fees:2,discount:0,minInvest:320} satisfies Scpi & {percentage:number;investedAmount:number};
  try {await generatePortfolioPDF([fund],null,320);expect(save).toHaveBeenCalledOnce();}
  finally {save.mockClear();}
 });
});
