import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Eye, Info, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { createSlugFromName } from '../../utils/scpiSlugMapper';

type RiskLevel = 'low' | 'medium' | 'high';
type Signal = { metric?: string; severity?: string; message?: string; [key: string]: unknown };
type BulletinAnalysis = {
  scpi_slug: string; current_period: string | null; previous_period: string | null; status: string | null;
  risk_level: RiskLevel | null; trend_score: number | null; alerts: Signal[] | null;
  improvements: Signal[] | null; deteriorations: Signal[] | null; watch_points: Signal[] | null;
};
type ScpiIndicator = {
  scpi_slug: string; nom: string | null; tof: number | string | null; capitalisation: number | string | null;
  prix_souscription: number | string | null; endettement: number | string | null; walt: number | string | null;
  walb: number | string | null; nombre_locataires: number | string | null; nombre_immeubles: number | string | null;
  nombre_parts: number | string | null; parts_attente_retrait: number | string | boolean | null;
  annee_creation: number | string | null; repartition_sectorielle: unknown; repartition_geographique: unknown;
};
type Rationale = { label: string; intro: string; labelClass: string; favorable: string[]; vigilance: string[]; conclusion: string };
type Context = { tof: number | null; debt: number | null; walb: number | null; materialWaiting: boolean };

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/\s/g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};
const formatNumber = (value: number, digits = 1) => value.toLocaleString('fr-FR', { maximumFractionDigits: digits });
const capM = (value: number | null) => value == null ? null : (value > 100000 ? value / 1000000 : value);
const formatCap = (value: number) => `${formatNumber(capM(value) ?? value, (capM(value) ?? value) >= 100 ? 0 : 1)} M€`;
const parseDistribution = (raw: unknown): Array<{ name: string; value: number }> => {
  let value = raw;
  if (typeof raw === 'string') { try { value = JSON.parse(raw); } catch { return []; } }
  if (Array.isArray(value)) return value.map((item: any) => ({ name: String(item?.name ?? item?.label ?? '').trim(), value: toNumber(item?.value ?? item?.percentage ?? item?.percent ?? item?.part) ?? 0 })).filter(x => x.name && x.value > 0).sort((a,b) => b.value-a.value);
  if (value && typeof value === 'object') return Object.entries(value as Record<string, unknown>).map(([name,v]) => ({ name, value: toNumber(v) ?? 0 })).filter(x => x.value > 0).sort((a,b) => b.value-a.value);
  return [];
};
const push = (arr: string[], message?: string | null) => { if (message && arr.length < 4 && !arr.includes(message)) arr.push(message); };
const clean = (s: Signal) => typeof s.message === 'string' && s.message.trim().length >= 8 ? s.message.replace(/\s+/g,' ').trim() : null;
const strongSignal = (s: Signal, c: Context) => {
  const metric = String(s.metric || '').toLowerCase();
  const severity = String(s.severity || '').toLowerCase();
  const text = `${metric} ${s.message || ''}`.toLowerCase();
  if (/parts_attente_retrait|liquidite_retraits|retraits/.test(metric)) return c.materialWaiting;
  if (metric === 'tof') return c.tof != null && c.tof < 88;
  if (metric === 'endettement') return c.debt != null && c.debt >= 35;
  if (metric === 'walb') return c.walb != null && c.walb < 3;
  if (metric === 'capital_type') return false;
  if (severity === 'high' || severity === 'error') return true;
  if (severity === 'warning') return /(baisse significative|forte baisse|dégradation|degradation|tension|défaut|defaut|impay|vacance élevée|vacance elevee|cession en perte)/.test(text);
  return false;
};

const buildRationale = (analysis: BulletinAnalysis | null, indicator: ScpiIndicator | null): Rationale => {
  const favorable: string[] = [];
  const vigilance: string[] = [];
  const riskLevel = analysis?.risk_level ?? null;
  const tof = toNumber(indicator?.tof);
  const debt = toNumber(indicator?.endettement);
  const walb = toNumber(indicator?.walb);
  const walt = toNumber(indicator?.walt);
  const cap = toNumber(indicator?.capitalisation);
  const capMillions = capM(cap);
  const price = toNumber(indicator?.prix_souscription);
  const tenants = toNumber(indicator?.nombre_locataires);
  const buildings = toNumber(indicator?.nombre_immeubles);
  const shares = toNumber(indicator?.nombre_parts);
  const waiting = toNumber(indicator?.parts_attente_retrait);
  const creationYear = toNumber(indicator?.annee_creation);
  const age = creationYear == null ? null : new Date().getFullYear() - creationYear;
  const sectors = parseDistribution(indicator?.repartition_sectorielle);
  const geographies = parseDistribution(indicator?.repartition_geographique);
  const estimatedShares = shares && shares > 0 ? shares : (capMillions != null && price && price > 0 ? (capMillions * 1_000_000) / price : null);
  const waitingRatio = waiting != null && estimatedShares ? (waiting / estimatedShares) * 100 : null;
  const materialWaiting = waiting != null && waiting > 0 && (waitingRatio != null ? waitingRatio >= 0.10 : waiting >= 500);
  const context: Context = { tof, debt, walb, materialWaiting };

  if (tof != null) { if (tof >= 97) push(favorable, `TOF élevé à ${formatNumber(tof)} %, signe d'une occupation locative solide.`); else if (tof < 88) push(vigilance, `TOF de ${formatNumber(tof)} % : niveau suffisamment bas pour constituer un vrai point de vigilance.`); }
  if (debt != null) { if (debt <= 15) push(favorable, `Endettement contenu à ${formatNumber(debt)} %, ce qui limite l'effet de levier financier.`); else if (debt >= 35) push(vigilance, `Endettement de ${formatNumber(debt)} % : levier financier suffisamment élevé pour être surveillé.`); }
  if (walb != null) { if (walb >= 7) push(favorable, `WALB de ${formatNumber(walb)} ans : bonne visibilité avant prochaines options de rupture.`); else if (walb < 3) push(vigilance, `WALB de ${formatNumber(walb)} ans : échéances locatives proches.`); } else if (walt != null && walt >= 8) push(favorable, `WALT de ${formatNumber(walt)} ans : durée résiduelle des baux favorable.`);

  if (waiting === 0) push(favorable, `Aucune part en attente de retrait dans la dernière donnée disponible.`);
  else if (waiting != null && waiting > 0 && !materialWaiting) {
    const ratio = waitingRatio != null ? `, soit environ ${formatNumber(waitingRatio, 3)} % des parts` : '';
    push(favorable, `${formatNumber(waiting, 0)} part${waiting > 1 ? 's' : ''} en attente de retrait${ratio} : volume non significatif à ce stade.`);
  } else if (materialWaiting && waiting != null) {
    const ratio = waitingRatio != null ? ` (${formatNumber(waitingRatio, 2)} % des parts)` : '';
    push(vigilance, `${formatNumber(waiting, 0)} parts en attente de retrait${ratio} : volume devenu matériel pour la liquidité.`);
  }

  if (capMillions != null && capMillions >= 500) push(favorable, `Capitalisation d'environ ${formatCap(cap!)} : taille favorable à la mutualisation.`);
  if (buildings != null && buildings >= 50) push(favorable, `${formatNumber(buildings,0)} immeubles : patrimoine déjà bien mutualisé.`);
  if (tenants != null && tenants >= 75) push(favorable, `${formatNumber(tenants,0)} locataires : bonne mutualisation du risque locatif.`);

  const smallFund = capMillions != null && capMillions < 150;
  const fewBuildings = buildings != null && buildings < 15;
  const fewTenants = tenants != null && tenants < 15;
  if (smallFund && (fewBuildings || fewTenants)) push(vigilance, `Mutualisation encore limitée : capitalisation d'environ ${formatCap(cap!)}${fewBuildings ? `, ${formatNumber(buildings!,0)} immeubles` : ''}${fewTenants ? `, ${formatNumber(tenants!,0)} locataires` : ''}.`);
  else { if (fewBuildings) push(vigilance, `${formatNumber(buildings!,0)} immeubles seulement : concentration patrimoniale réellement marquée.`); if (fewTenants) push(vigilance, `${formatNumber(tenants!,0)} locataires seulement : concentration locative réellement marquée.`); }
  if (age != null && age >= 0 && age <= 3 && (smallFund || fewBuildings || fewTenants)) push(vigilance, `Historique très court combiné à une mutualisation encore limitée : SCPI créée en ${Math.round(creationYear!)}.`);

  const topSector = sectors[0];
  if (topSector) { if (topSector.value >= 75) push(vigilance, `Concentration sectorielle forte : ${topSector.name} représente environ ${formatNumber(topSector.value,0)} % du patrimoine.`); else if (sectors.length >= 3 && topSector.value <= 45) push(favorable, `Diversification sectorielle correcte : aucun secteur ne dépasse ${formatNumber(topSector.value,0)} %.`); }
  const topGeo = geographies[0];
  if (topGeo) { if (topGeo.value >= 80) push(vigilance, `Concentration géographique forte : ${topGeo.name} représente environ ${formatNumber(topGeo.value,0)} % du patrimoine.`); else if (geographies.length >= 5 && topGeo.value <= 45) push(favorable, `Diversification géographique étendue sur ${geographies.length} zones.`); }

  for (const s of analysis?.deteriorations || []) if (strongSignal(s, context)) push(vigilance, clean(s));
  for (const s of analysis?.alerts || []) if (strongSignal(s, context)) push(vigilance, clean(s));
  for (const s of analysis?.watch_points || []) if (strongSignal(s, context)) push(vigilance, clean(s));
  if (!favorable.length) push(favorable, `Aucun facteur favorable majeur n'est suffisamment documenté pour être mis en avant automatiquement.`);

  const map = {
    low: { label:'Vigilance faible', intro:`Les indicateurs disponibles sont globalement solides. Seuls les seuils réellement matériels sont retenus comme facteurs de vigilance.`, labelClass:'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', conclusion: vigilance.length ? `Lecture MaximusSCPI : quelques points significatifs restent à surveiller, sans remettre en cause l'appréciation globalement favorable.` : `Lecture MaximusSCPI : aucun facteur de vigilance significatif n'est identifié au regard des seuils renforcés utilisés.` },
    medium: { label:'Vigilance modérée', intro:`Le suivi reste intermédiaire. L'affichage ne retient que les facteurs suffisamment matériels pour peser réellement sur le risque.`, labelClass:'border-amber-500/40 bg-amber-500/10 text-amber-300', conclusion: vigilance.length ? `Lecture MaximusSCPI : la vigilance modérée est étayée par au moins un facteur significatif.` : `Lecture MaximusSCPI : aucun seuil d'alerte fort isolé n'est franchi ; le niveau modéré provient surtout de la trajectoire agrégée du suivi trimestriel.` },
    high: { label:'Vigilance élevée', intro:`Le niveau élevé doit être soutenu par des signaux matériels concernant la liquidité, l'occupation, la dette, la concentration ou une dégradation documentée.`, labelClass:'border-rose-500/40 bg-rose-500/10 text-rose-300', conclusion: vigilance.length ? `Lecture MaximusSCPI : les signaux significatifs identifiés justifient une analyse approfondie avant décision.` : `Lecture MaximusSCPI : le niveau élevé doit être recontrôlé, car aucun facteur significatif n'est actuellement documenté par les seuils renforcés.` },
  } as const;
  const m = riskLevel ? map[riskLevel] : null;
  return m ? { ...m, favorable, vigilance } : { label:'Vigilance à confirmer', intro:`Le niveau de vigilance spécifique n'est pas encore suffisamment documenté.`, labelClass:'border-slate-500 bg-slate-700/40 text-slate-300', favorable, vigilance, conclusion:`Lecture MaximusSCPI : données insuffisantes pour conclure de façon robuste.` };
};

const RationaleBlock: React.FC<{ rationale: Rationale; analysis: BulletinAnalysis | null }> = ({ rationale, analysis }) => {
  const has = rationale.vigilance.length > 0;
  return <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-5 sm:p-6 shadow-lg">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5"><div><h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />Pourquoi cette appréciation MaximusSCPI ?</h3><p className="text-sm text-slate-300 mt-2 max-w-3xl">{rationale.intro}</p></div><span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${rationale.labelClass}`}>{analysis?.risk_level === 'high' ? <AlertTriangle className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}{rationale.label}</span></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4"><h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2 mb-3"><CheckCircle2 className="w-4 h-4"/>Facteurs favorables</h4><ul className="space-y-2.5">{rationale.favorable.map(item => <li key={item} className="text-sm text-slate-300 leading-relaxed flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"/><span>{item}</span></li>)}</ul></div>
      <div className={`rounded-lg border p-4 ${has ? 'border-amber-500/20 bg-amber-500/5' : 'border-slate-600/40 bg-slate-800/30'}`}><h4 className={`text-sm font-bold flex items-center gap-2 mb-3 ${has ? 'text-amber-300' : 'text-slate-300'}`}>{has ? <AlertTriangle className="w-4 h-4"/> : <ShieldCheck className="w-4 h-4"/>}{has ? 'Facteurs de vigilance significatifs' : 'Aucun facteur de vigilance significatif'}</h4>{has ? <ul className="space-y-2.5">{rationale.vigilance.map(item => <li key={item} className="text-sm text-slate-300 leading-relaxed flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0"/><span>{item}</span></li>)}</ul> : <p className="text-sm text-slate-400 leading-relaxed">Aucun indicateur ne franchit actuellement un seuil suffisamment matériel pour être présenté comme une alerte spécifique.</p>}</div>
    </div>
    <div className="mt-4 rounded-lg border border-sky-500/20 bg-sky-500/5 px-4 py-3"><p className="text-sm text-slate-200 leading-relaxed">{rationale.conclusion}</p></div>
    <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed"><Info className="w-3.5 h-3.5 shrink-0 mt-0.5"/><span>Seuils MaximusSCPI renforcés : les micro-signaux non matériels ne sont pas affichés comme facteurs de vigilance. Cette appréciation reste distincte du SRI réglementaire.{analysis?.current_period ? ` Analyse fondée notamment sur le bulletin ${analysis.current_period}.` : ''}</span></div>
  </div>;
};

const ScpiVigilanceRationalePortalV2: React.FC = () => {
  const [analyses,setAnalyses] = useState<Record<string,BulletinAnalysis>>({});
  const [indicators,setIndicators] = useState<Record<string,ScpiIndicator>>({});
  const [target,setTarget] = useState<HTMLElement|null>(null);
  const [activeSlug,setActiveSlug] = useState<string|null>(null);
  useEffect(() => { let cancelled=false; const load=async()=>{ if(!supabase)return; const [a,i]=await Promise.all([supabase.from('scpi_bulletin_analysis').select('scpi_slug,current_period,previous_period,status,risk_level,trend_score,alerts,improvements,deteriorations,watch_points'),supabase.from('scpi_indicators').select('scpi_slug,nom,tof,capitalisation,prix_souscription,endettement,walt,walb,nombre_locataires,nombre_immeubles,nombre_parts,parts_attente_retrait,annee_creation,repartition_sectorielle,repartition_geographique')]); if(cancelled)return; const am:Record<string,BulletinAnalysis>={}; for(const r of (a.data||[]) as BulletinAnalysis[]) am[r.scpi_slug]=r; const im:Record<string,ScpiIndicator>={}; for(const r of (i.data||[]) as ScpiIndicator[]) im[r.scpi_slug]=r; setAnalyses(am); setIndicators(im); }; void load(); return()=>{cancelled=true}; },[]);
  useEffect(()=>{ const scan=()=>{ const heading=Array.from(document.querySelectorAll<HTMLHeadingElement>('h2')).find(n=>n.textContent?.trim().startsWith('Analyse Détaillée -')); if(!heading){setTarget(null);setActiveSlug(null);return;} const name=heading.textContent?.replace(/^Analyse Détaillée\s*-\s*/,'').trim()||''; const slug=createSlugFromName(name); if(!slug)return; const modal=heading.closest('div.bg-slate-800.rounded-2xl') as HTMLElement|null; if(!modal)return; let host=modal.querySelector<HTMLElement>('[data-vigilance-rationale-host="true"]'); if(!host){host=document.createElement('div');host.dataset.vigilanceRationaleHost='true';host.className='px-6 pb-6';const ah=Array.from(modal.querySelectorAll<HTMLHeadingElement>('h3')).find(n=>n.textContent?.trim()==='Analyse MaximusSCPI');const wrap=ah?.closest('div.p-6.space-y-8'); if(wrap?.parentElement)wrap.parentElement.insertBefore(host,wrap);else modal.appendChild(host);} setActiveSlug(slug);setTarget(host); }; scan(); const observer=new MutationObserver(scan); observer.observe(document.body,{childList:true,subtree:true}); return()=>observer.disconnect(); },[]);
  const analysis=activeSlug?analyses[activeSlug]??null:null; const indicator=activeSlug?indicators[activeSlug]??null:null; const rationale=useMemo(()=>buildRationale(analysis,indicator),[analysis,indicator]);
  if(!target||!activeSlug)return null; return createPortal(<RationaleBlock rationale={rationale} analysis={analysis}/>,target);
};
export default ScpiVigilanceRationalePortalV2;
