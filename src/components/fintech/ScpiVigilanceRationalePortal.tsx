import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Eye, Info, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { createSlugFromName } from '../../utils/scpiSlugMapper';

type RiskLevel = 'low' | 'medium' | 'high';
type Signal = {
  metric?: string;
  severity?: string;
  message?: string;
  [key: string]: unknown;
};

type BulletinAnalysis = {
  scpi_slug: string;
  current_period: string | null;
  previous_period: string | null;
  status: string | null;
  risk_level: RiskLevel | null;
  trend_score: number | null;
  alerts: Signal[] | null;
  improvements: Signal[] | null;
  deteriorations: Signal[] | null;
  watch_points: Signal[] | null;
};

type ScpiIndicator = {
  scpi_slug: string;
  nom: string | null;
  td: number | string | null;
  tof: number | string | null;
  capitalisation: number | string | null;
  endettement: number | string | null;
  walt: number | string | null;
  walb: number | string | null;
  nombre_locataires: number | string | null;
  nombre_immeubles: number | string | null;
  parts_attente_retrait: number | string | boolean | null;
  capital_type: string | null;
  annee_creation: number | string | null;
  repartition_sectorielle: unknown;
  repartition_geographique: unknown;
};

type Rationale = {
  label: string;
  intro: string;
  labelClass: string;
  favorable: string[];
  vigilance: string[];
  conclusion: string;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/\s/g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatNumber = (value: number, digits = 1) =>
  value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: digits });

const formatCapitalisation = (value: number) => {
  const millions = value > 100000 ? value / 1000000 : value;
  return `${formatNumber(millions, millions >= 100 ? 0 : 1)} M€`;
};

const parseDistribution = (raw: unknown): Array<{ name: string; value: number }> => {
  let value = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw);
    } catch {
      return [];
    }
  }

  if (Array.isArray(value)) {
    return value
      .map((item: any) => ({
        name: String(item?.name ?? item?.label ?? item?.sector ?? item?.country ?? '').trim(),
        value: toNumber(item?.value ?? item?.percentage ?? item?.percent ?? item?.part) ?? 0,
      }))
      .filter((item) => item.name && item.value > 0)
      .sort((a, b) => b.value - a.value);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([name, itemValue]) => ({ name, value: toNumber(itemValue) ?? 0 }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }

  return [];
};

const uniquePush = (target: string[], message: string | null | undefined, max = 4) => {
  if (!message || target.length >= max || target.includes(message)) return;
  target.push(message);
};

const cleanSignalMessage = (signal: Signal | undefined): string | null => {
  const message = typeof signal?.message === 'string' ? signal.message.trim() : '';
  if (!message || message.length < 8) return null;
  return message.replace(/\s+/g, ' ');
};

const isNegativeSignal = (signal: Signal) => {
  const severity = String(signal.severity || '').toLowerCase();
  if (severity === 'high' || severity === 'warning' || severity === 'medium' || severity === 'error') return true;
  const text = `${signal.metric || ''} ${signal.message || ''}`.toLowerCase();
  return /(baisse|recul|diminution|dégrad|degrad|retrait|liquidit|vacance|hausse.{0,20}(dette|endett)|tof.{0,20}(baisse|faible)|distribution.{0,20}(baisse|recul)|valeur.{0,20}(baisse|recul))/.test(text);
};

const buildRationale = (analysis: BulletinAnalysis | null, indicator: ScpiIndicator | null): Rationale => {
  const riskLevel = analysis?.risk_level ?? null;
  const favorable: string[] = [];
  const vigilance: string[] = [];

  const tof = toNumber(indicator?.tof);
  const debt = toNumber(indicator?.endettement);
  const walb = toNumber(indicator?.walb);
  const walt = toNumber(indicator?.walt);
  const cap = toNumber(indicator?.capitalisation);
  const tenants = toNumber(indicator?.nombre_locataires);
  const buildings = toNumber(indicator?.nombre_immeubles);
  const creationYear = toNumber(indicator?.annee_creation);
  const waiting = indicator?.parts_attente_retrait;
  const waitingNumber = toNumber(waiting);
  const hasWaiting = typeof waiting === 'boolean' ? waiting : (waitingNumber != null ? waitingNumber > 0 : null);
  const sectors = parseDistribution(indicator?.repartition_sectorielle);
  const geographies = parseDistribution(indicator?.repartition_geographique);
  const topSector = sectors[0];
  const topGeo = geographies[0];
  const currentYear = new Date().getFullYear();
  const age = creationYear != null ? currentYear - creationYear : null;

  if (tof != null) {
    if (tof >= 97) uniquePush(favorable, `TOF élevé à ${formatNumber(tof)} %, signe d'une occupation locative solide.`);
    else if (tof < 90) uniquePush(vigilance, `TOF de ${formatNumber(tof)} % : vacance ou franchises à surveiller.`);
    else if (tof < 95) uniquePush(vigilance, `TOF de ${formatNumber(tof)} % : niveau d'occupation encore perfectible.`);
  }

  if (debt != null) {
    if (debt <= 15) uniquePush(favorable, `Endettement contenu à ${formatNumber(debt)} %, ce qui limite l'effet de levier financier.`);
    else if (debt >= 35) uniquePush(vigilance, `Endettement élevé à ${formatNumber(debt)} %, facteur de sensibilité financière.`);
    else if (debt >= 25) uniquePush(vigilance, `Endettement de ${formatNumber(debt)} % : niveau à suivre dans le cycle actuel.`);
  }

  if (walb != null) {
    if (walb >= 7) uniquePush(favorable, `WALB de ${formatNumber(walb)} ans : bonne visibilité avant prochaines options de rupture.`);
    else if (walb < 4) uniquePush(vigilance, `WALB de ${formatNumber(walb)} ans : échéances locatives relativement proches.`);
  } else if (walt != null && walt >= 8) {
    uniquePush(favorable, `WALT de ${formatNumber(walt)} ans : durée résiduelle des baux favorable.`);
  }

  if (hasWaiting === false) {
    uniquePush(favorable, `Aucune part en attente de retrait dans la dernière donnée disponible.`);
  } else if (hasWaiting === true) {
    uniquePush(vigilance, waitingNumber && waitingNumber > 1
      ? `${formatNumber(waitingNumber, 0)} parts en attente de retrait : liquidité à surveiller.`
      : `Des parts sont en attente de retrait : la liquidité du marché des parts doit être surveillée.`);
  }

  if (cap != null) {
    if (cap >= 500) uniquePush(favorable, `Capitalisation d'environ ${formatCapitalisation(cap)} : taille favorable à la mutualisation.`);
    else if (cap < 200) uniquePush(vigilance, `Capitalisation d'environ ${formatCapitalisation(cap)} : mutualisation encore limitée.`);
  }

  if (buildings != null && buildings >= 50) {
    uniquePush(favorable, `${formatNumber(buildings, 0)} immeubles : patrimoine déjà bien mutualisé.`);
  } else if (buildings != null && buildings < 25) {
    uniquePush(vigilance, `${formatNumber(buildings, 0)} immeubles seulement : sensibilité plus forte à chaque actif.`);
  }

  if (tenants != null && tenants >= 75) {
    uniquePush(favorable, `${formatNumber(tenants, 0)} locataires : bonne mutualisation du risque locatif.`);
  } else if (tenants != null && tenants < 30) {
    uniquePush(vigilance, `${formatNumber(tenants, 0)} locataires : concentration locative encore significative.`);
  }

  if (age != null && age >= 0 && age <= 5) {
    uniquePush(vigilance, `Historique encore court : SCPI créée en ${Math.round(creationYear!)} et non éprouvée sur un cycle immobilier complet.`);
  }

  if (topSector) {
    if (topSector.value >= 60) {
      uniquePush(vigilance, `Concentration sectorielle : ${topSector.name} représente environ ${formatNumber(topSector.value, 0)} % du patrimoine.`);
    } else if (sectors.length >= 3 && topSector.value <= 45) {
      uniquePush(favorable, `Diversification sectorielle correcte : aucun secteur ne dépasse ${formatNumber(topSector.value, 0)} %.`);
    }
  }

  if (topGeo) {
    if (topGeo.value >= 65) {
      uniquePush(vigilance, `Concentration géographique : ${topGeo.name} représente environ ${formatNumber(topGeo.value, 0)} % du patrimoine.`);
    } else if (geographies.length >= 5 && topGeo.value <= 45) {
      uniquePush(favorable, `Diversification géographique étendue sur ${geographies.length} zones, première exposition à ${formatNumber(topGeo.value, 0)} %.`);
    }
  }

  for (const signal of analysis?.deteriorations || []) {
    uniquePush(vigilance, cleanSignalMessage(signal));
  }
  for (const signal of analysis?.alerts || []) {
    if (isNegativeSignal(signal)) uniquePush(vigilance, cleanSignalMessage(signal));
  }
  for (const signal of analysis?.watch_points || []) {
    if (isNegativeSignal(signal)) uniquePush(vigilance, cleanSignalMessage(signal));
  }

  if (favorable.length === 0) {
    uniquePush(favorable, `Aucun facteur favorable majeur n'est suffisamment documenté pour être mis en avant automatiquement.`);
  }

  if (vigilance.length === 0) {
    if (riskLevel === 'low') {
      uniquePush(vigilance, `Aucun signal spécifique majeur identifié dans les données actuellement disponibles.`);
    } else if (riskLevel === 'medium') {
      uniquePush(vigilance, `Le suivi trimestriel justifie une vigilance modérée ; les prochains bulletins doivent confirmer la trajectoire.`);
    } else if (riskLevel === 'high') {
      uniquePush(vigilance, `Le dernier suivi MaximusSCPI comporte plusieurs signaux justifiant une surveillance renforcée.`);
    } else {
      uniquePush(vigilance, `Données insuffisantes pour établir une explication complète du niveau de vigilance.`);
    }
  }

  if (riskLevel === 'low') {
    return {
      label: 'Vigilance faible',
      intro: `Les indicateurs disponibles sont globalement solides, sans signal défavorable majeur à ce stade.`,
      labelClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
      favorable,
      vigilance,
      conclusion: `Lecture MaximusSCPI : les fondamentaux observés sont plutôt favorables. Une vigilance faible ne signifie pas absence de risque ; elle traduit l'absence de signal spécifique majeur dans les données suivies.`,
    };
  }

  if (riskLevel === 'medium') {
    return {
      label: 'Vigilance modérée',
      intro: `Les fondamentaux restent globalement corrects, mais plusieurs facteurs propres à cette SCPI justifient un suivi.`,
      labelClass: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      favorable,
      vigilance,
      conclusion: `Lecture MaximusSCPI : le niveau « modéré » résulte du compromis entre des indicateurs favorables et des facteurs de concentration, de mutualisation, de liquidité, d'historique ou de tendance trimestrielle à surveiller.`,
    };
  }

  if (riskLevel === 'high') {
    return {
      label: 'Vigilance élevée',
      intro: `Plusieurs indicateurs peuvent peser sur la distribution, la liquidité, la valorisation ou la mutualisation du risque.`,
      labelClass: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
      favorable,
      vigilance,
      conclusion: `Lecture MaximusSCPI : la vigilance élevée signifie que les signaux défavorables identifiés doivent être analysés avant toute décision et suivis dans les prochains bulletins.`,
    };
  }

  return {
    label: 'Vigilance à confirmer',
    intro: `Le niveau de vigilance spécifique n'est pas encore suffisamment documenté.`,
    labelClass: 'border-slate-500 bg-slate-700/40 text-slate-300',
    favorable,
    vigilance,
    conclusion: `Lecture MaximusSCPI : données insuffisantes pour conclure de façon robuste.`,
  };
};

const RationaleBlock: React.FC<{
  rationale: Rationale;
  analysis: BulletinAnalysis | null;
}> = ({ rationale, analysis }) => (
  <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-5 sm:p-6 shadow-lg">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
          Pourquoi cette appréciation MaximusSCPI ?
        </h3>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl">{rationale.intro}</p>
      </div>
      <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${rationale.labelClass}`}>
        {analysis?.risk_level === 'high' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        {rationale.label}
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
        <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4" />
          Facteurs favorables
        </h4>
        <ul className="space-y-2.5">
          {rationale.favorable.map((item) => (
            <li key={item} className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
        <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4" />
          Facteurs de vigilance
        </h4>
        <ul className="space-y-2.5">
          {rationale.vigilance.map((item) => (
            <li key={item} className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="mt-4 rounded-lg border border-sky-500/20 bg-sky-500/5 px-4 py-3">
      <p className="text-sm text-slate-200 leading-relaxed">{rationale.conclusion}</p>
    </div>

    <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <span>
        Cette appréciation est spécifique à la SCPI et distincte du SRI réglementaire. Les risques généraux des SCPI (perte en capital, liquidité non garantie, fiscalité et horizon long) restent applicables quel que soit le niveau affiché.
        {analysis?.current_period ? ` Analyse fondée notamment sur le bulletin ${analysis.current_period}.` : ''}
      </span>
    </div>
  </div>
);

const ScpiVigilanceRationalePortal: React.FC = () => {
  const [analyses, setAnalyses] = useState<Record<string, BulletinAnalysis>>({});
  const [indicators, setIndicators] = useState<Record<string, ScpiIndicator>>({});
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!supabase) return;
      const [analysisResult, indicatorResult] = await Promise.all([
        supabase
          .from('scpi_bulletin_analysis')
          .select('scpi_slug,current_period,previous_period,status,risk_level,trend_score,alerts,improvements,deteriorations,watch_points'),
        supabase
          .from('scpi_indicators')
          .select('scpi_slug,nom,td,tof,capitalisation,endettement,walt,walb,nombre_locataires,nombre_immeubles,parts_attente_retrait,capital_type,annee_creation,repartition_sectorielle,repartition_geographique'),
      ]);

      if (cancelled) return;
      if (analysisResult.error) console.warn('[ScpiVigilanceRationale] Analyses indisponibles', analysisResult.error);
      if (indicatorResult.error) console.warn('[ScpiVigilanceRationale] Indicateurs indisponibles', indicatorResult.error);

      const analysisMap: Record<string, BulletinAnalysis> = {};
      for (const row of (analysisResult.data || []) as BulletinAnalysis[]) analysisMap[row.scpi_slug] = row;
      const indicatorMap: Record<string, ScpiIndicator> = {};
      for (const row of (indicatorResult.data || []) as ScpiIndicator[]) indicatorMap[row.scpi_slug] = row;

      setAnalyses(analysisMap);
      setIndicators(indicatorMap);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const scan = () => {
      const headings = Array.from(document.querySelectorAll<HTMLHeadingElement>('h2'));
      const heading = headings.find((node) => node.textContent?.trim().startsWith('Analyse Détaillée -'));
      if (!heading) {
        setTarget(null);
        setActiveSlug(null);
        return;
      }

      const name = heading.textContent?.replace(/^Analyse Détaillée\s*-\s*/, '').trim() || '';
      const slug = createSlugFromName(name);
      if (!slug) return;

      const modal = heading.closest('div.bg-slate-800.rounded-2xl') as HTMLElement | null;
      if (!modal) return;

      let host = modal.querySelector<HTMLElement>('[data-vigilance-rationale-host="true"]');
      if (!host) {
        host = document.createElement('div');
        host.dataset.vigilanceRationaleHost = 'true';
        host.className = 'px-6 pb-6';

        const analysisHeading = Array.from(modal.querySelectorAll<HTMLHeadingElement>('h3'))
          .find((node) => node.textContent?.trim() === 'Analyse MaximusSCPI');
        const analysisWrapper = analysisHeading?.closest('div.p-6.space-y-8');

        if (analysisWrapper?.parentElement) {
          analysisWrapper.parentElement.insertBefore(host, analysisWrapper);
        } else {
          modal.appendChild(host);
        }
      }

      setActiveSlug(slug);
      setTarget(host);
    };

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const analysis = activeSlug ? analyses[activeSlug] ?? null : null;
  const indicator = activeSlug ? indicators[activeSlug] ?? null : null;
  const rationale = useMemo(() => buildRationale(analysis, indicator), [analysis, indicator]);

  if (!target || !activeSlug) return null;
  return createPortal(<RationaleBlock rationale={rationale} analysis={analysis} />, target);
};

export default ScpiVigilanceRationalePortal;
