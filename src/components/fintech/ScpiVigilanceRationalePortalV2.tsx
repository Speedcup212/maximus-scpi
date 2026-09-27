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
  quality_issue?: boolean;
  materiality?: string;
  ratio_pct?: number;
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
  tof: number | string | null;
  capitalisation: number | string | null;
  prix_souscription: number | string | null;
  prix_reconstitution: number | string | null;
  endettement: number | string | null;
  walt: number | string | null;
  walb: number | string | null;
  nombre_locataires: number | string | null;
  nombre_immeubles: number | string | null;
  nombre_parts: number | string | null;
  parts_attente_retrait: number | string | boolean | null;
  annee_creation: number | string | null;
  repartition_sectorielle: unknown;
  repartition_geographique: unknown;
};

type Rationale = {
  riskLevel: RiskLevel | null;
  label: string;
  intro: string;
  labelClass: string;
  favorable: string[];
  vigilance: string[];
  information: string[];
  qualityIssues: string[];
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

const capMillions = (value: number | null) =>
  value == null ? null : value > 100000 ? value / 1000000 : value;

const formatCap = (value: number) => {
  const millions = capMillions(value) ?? value;
  return `${formatNumber(millions, millions >= 100 ? 0 : 1)} M€`;
};

const pushUnique = (target: string[], message?: string | null, max = 5) => {
  if (!message || target.length >= max || target.includes(message)) return;
  target.push(message);
};

const signalMessage = (signal: Signal) => {
  const message = typeof signal.message === 'string' ? signal.message.trim() : '';
  return message.length >= 8 ? message.replace(/\s+/g, ' ') : null;
};

const suspiciousDistributionLabel = (label: string) =>
  /(vacance|occup|taux|dette|endett|performance|distribution|collecte|capitalisation|walb|walt|associ|moyen de)/i.test(label);

const parseDistribution = (raw: unknown) => {
  let value = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw);
    } catch {
      return { items: [] as Array<{ name: string; value: number }>, suspicious: true };
    }
  }

  const items: Array<{ name: string; value: number }> = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      const name = String(item?.name ?? item?.label ?? item?.sector ?? item?.country ?? '').trim();
      const number = toNumber(item?.value ?? item?.percentage ?? item?.percent ?? item?.part);
      if (name && number != null && number > 0) items.push({ name, value: number });
    }
  } else if (value && typeof value === 'object') {
    for (const [name, rawValue] of Object.entries(value as Record<string, unknown>)) {
      const number = toNumber(rawValue);
      if (number != null && number > 0) items.push({ name, value: number });
    }
  }

  const suspicious = items.some((item) => suspiciousDistributionLabel(item.name));
  return {
    items: suspicious ? [] : items.sort((a, b) => b.value - a.value),
    suspicious,
  };
};

const buildRationale = (
  analysis: BulletinAnalysis | null,
  indicator: ScpiIndicator | null,
): Rationale => {
  const favorable: string[] = [];
  const vigilance: string[] = [];
  const information: string[] = [];
  const qualityIssues: string[] = [];

  const riskLevel = analysis?.risk_level ?? null;
  const tof = toNumber(indicator?.tof);
  const debt = toNumber(indicator?.endettement);
  const walb = toNumber(indicator?.walb);
  const walt = toNumber(indicator?.walt);
  const cap = toNumber(indicator?.capitalisation);
  const capM = capMillions(cap);
  const price = toNumber(indicator?.prix_souscription);
  const reconstitution = toNumber(indicator?.prix_reconstitution);
  const buildings = toNumber(indicator?.nombre_immeubles);
  const tenants = toNumber(indicator?.nombre_locataires);
  const shares = toNumber(indicator?.nombre_parts);
  const waiting = toNumber(indicator?.parts_attente_retrait);

  if (tof != null) {
    if (tof > 0 && tof < 50) {
      pushUnique(
        qualityIssues,
        `TOF atypique (${formatNumber(tof)} %) : cette donnée doit être vérifiée avant toute interprétation.`,
      );
    } else if (tof >= 97) {
      pushUnique(favorable, `TOF élevé à ${formatNumber(tof)} %, signe d'une occupation locative solide.`);
    }
  }

  if (debt != null && debt <= 15) {
    pushUnique(
      favorable,
      `Endettement contenu à ${formatNumber(debt)} %, ce qui limite l'effet de levier financier.`,
    );
  }

  if (walb != null && walb >= 7) {
    pushUnique(
      favorable,
      `WALB de ${formatNumber(walb)} ans : bonne visibilité avant les prochaines options de rupture.`,
    );
  } else if (walb == null && walt != null && walt >= 8) {
    pushUnique(favorable, `WALT de ${formatNumber(walt)} ans : durée résiduelle des baux favorable.`);
  }

  const estimatedShares =
    shares != null && shares > 0
      ? shares
      : capM != null && price != null && price > 0
        ? (capM * 1_000_000) / price
        : null;
  const waitingRatio =
    waiting != null && waiting > 0 && estimatedShares != null && estimatedShares > 0
      ? (waiting / estimatedShares) * 100
      : null;

  if (waiting === 0) {
    pushUnique(favorable, `Aucune part en attente de retrait dans la dernière donnée disponible.`);
  } else if (waiting != null && waiting > 0 && waitingRatio != null && waitingRatio < 0.5) {
    pushUnique(
      favorable,
      `${formatNumber(waiting, 0)} part${waiting > 1 ? 's' : ''} en attente, soit ${formatNumber(waitingRatio, 3)} % des parts : volume non significatif.`,
    );
  }

  if (cap != null && capM != null && capM >= 500) {
    pushUnique(favorable, `Capitalisation d'environ ${formatCap(cap)} : taille favorable à la mutualisation.`);
  }
  if (buildings != null && buildings >= 50) {
    pushUnique(favorable, `${formatNumber(buildings, 0)} immeubles : patrimoine déjà bien mutualisé.`);
  }
  if (tenants != null && tenants >= 75) {
    pushUnique(favorable, `${formatNumber(tenants, 0)} locataires : bonne mutualisation du risque locatif.`);
  }

  const sector = parseDistribution(indicator?.repartition_sectorielle);
  const geography = parseDistribution(indicator?.repartition_geographique);

  if (sector.suspicious) {
    pushUnique(
      qualityIssues,
      `Répartition sectorielle incohérente détectée : elle est exclue de l'analyse jusqu'à vérification.`,
    );
  } else if (sector.items.length >= 3 && sector.items[0].value <= 45) {
    pushUnique(
      favorable,
      `Diversification sectorielle correcte : aucun secteur ne dépasse ${formatNumber(sector.items[0].value, 0)} %.`,
    );
  }

  if (geography.suspicious) {
    pushUnique(
      qualityIssues,
      `Répartition géographique incohérente détectée : elle est exclue de l'analyse jusqu'à vérification.`,
    );
  } else if (geography.items.length >= 5 && geography.items[0].value <= 45) {
    pushUnique(favorable, `Diversification géographique étendue sur ${geography.items.length} zones.`);
  }

  const allSignals = [...(analysis?.alerts || []), ...(analysis?.watch_points || [])];

  for (const signal of allSignals) {
    const message = signalMessage(signal);
    if (!message) continue;

    if (signal.quality_issue === true || String(signal.metric || '').startsWith('data_quality')) {
      pushUnique(qualityIssues, message);
      continue;
    }

    const severity = String(signal.severity || '').toLowerCase();
    if (severity === 'high' || severity === 'medium') {
      pushUnique(vigilance, message);
    } else if (severity === 'info') {
      pushUnique(information, message, 4);
    }
  }

  if (price != null && reconstitution != null && reconstitution > 0) {
    const spread = (price / reconstitution - 1) * 100;
    if (spread <= -5) {
      pushUnique(
        information,
        `Prix de souscription en décote de ${formatNumber(Math.abs(spread), 2)} % par rapport à la valeur de reconstitution.`,
        4,
      );
    }
  }

  if (!favorable.length) {
    pushUnique(
      favorable,
      `Aucun facteur favorable majeur n'est suffisamment documenté pour être mis en avant automatiquement.`,
    );
  }

  const map: Record<RiskLevel, Omit<Rationale, 'riskLevel' | 'favorable' | 'vigilance' | 'information' | 'qualityIssues'>> = {
    low: {
      label: 'Vigilance faible',
      intro:
        `Aucun facteur matériel ne franchit actuellement les seuils de vigilance MaximusSCPI.`,
      labelClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
      conclusion:
        `Lecture MaximusSCPI : les fondamentaux suivis ne font ressortir aucun signal spécifique significatif à ce stade.`,
    },
    medium: {
      label: 'Vigilance modérée',
      intro:
        `Au moins un facteur matériel justifie un suivi, sans signal majeur isolé suffisant à lui seul pour classer la SCPI en vigilance élevée.`,
      labelClass: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      conclusion:
        `Lecture MaximusSCPI : le niveau modéré est directement étayé par les facteurs significatifs affichés ci-dessous.`,
    },
    high: {
      label: 'Vigilance élevée',
      intro:
        `Un signal majeur ou une accumulation de facteurs matériels justifie une analyse approfondie avant décision.`,
      labelClass: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
      conclusion:
        `Lecture MaximusSCPI : les facteurs affichés ont une matérialité suffisante pour justifier une vigilance renforcée.`,
    },
  };

  if (riskLevel) {
    return {
      riskLevel,
      ...map[riskLevel],
      favorable,
      vigilance,
      information,
      qualityIssues,
    };
  }

  return {
    riskLevel: null,
    label: 'Vigilance à confirmer',
    intro: `Le niveau de vigilance spécifique n'est pas encore suffisamment documenté.`,
    labelClass: 'border-slate-500 bg-slate-700/40 text-slate-300',
    favorable,
    vigilance,
    information,
    qualityIssues,
    conclusion: `Lecture MaximusSCPI : données insuffisantes pour conclure de façon robuste.`,
  };
};

const RationaleBlock: React.FC<{
  rationale: Rationale;
  analysis: BulletinAnalysis | null;
}> = ({ rationale, analysis }) => {
  const hasVigilance = rationale.vigilance.length > 0;

  return (
    <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-5 sm:p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            Pourquoi cette appréciation MaximusSCPI ?
          </h3>
          <p className="text-sm text-slate-300 mt-2 max-w-3xl">{rationale.intro}</p>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${rationale.labelClass}`}
        >
          {rationale.riskLevel === 'high' ? (
            <AlertTriangle className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
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
              <li
                key={item}
                className="text-sm text-slate-300 leading-relaxed flex items-start gap-2"
              >
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            hasVigilance
              ? 'border-amber-500/20 bg-amber-500/5'
              : 'border-slate-600/40 bg-slate-800/30'
          }`}
        >
          <h4
            className={`text-sm font-bold flex items-center gap-2 mb-3 ${
              hasVigilance ? 'text-amber-300' : 'text-slate-300'
            }`}
          >
            {hasVigilance ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {hasVigilance
              ? 'Facteurs de vigilance significatifs'
              : 'Aucun facteur de vigilance significatif'}
          </h4>
          {hasVigilance ? (
            <ul className="space-y-2.5">
              {rationale.vigilance.map((item) => (
                <li
                  key={item}
                  className="text-sm text-slate-300 leading-relaxed flex items-start gap-2"
                >
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 leading-relaxed">
              Aucun indicateur ne franchit actuellement un seuil suffisamment matériel pour être
              présenté comme une alerte spécifique.
            </p>
          )}
        </div>
      </div>

      {rationale.information.length > 0 && (
        <div className="mt-4 rounded-lg border border-sky-500/20 bg-sky-500/5 p-4">
          <h4 className="text-sm font-bold text-sky-300 flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" />
            Informations suivies
          </h4>
          <ul className="space-y-1.5">
            {rationale.information.map((item) => (
              <li key={item} className="text-xs text-slate-300 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {rationale.qualityIssues.length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-500/30 bg-slate-800/40 p-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" />
            Données à vérifier
          </h4>
          <ul className="space-y-1.5">
            {rationale.qualityIssues.map((item) => (
              <li key={item} className="text-xs text-slate-400 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-sky-500/20 bg-sky-500/5 px-4 py-3">
        <p className="text-sm text-slate-200 leading-relaxed">{rationale.conclusion}</p>
      </div>

      <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Doctrine propriétaire MaximusSCPI : les micro-signaux ne sont pas classés comme facteurs
          de vigilance. Pour la liquidité, une file inférieure à 0,5 % des parts est considérée non
          significative, 0,5–1 % comme information, 1–3 % comme vigilance, 3–5 % comme tension
          notable et ≥ 5 % comme signal majeur. Cette appréciation est distincte du SRI
          réglementaire.
          {analysis?.current_period ? ` Analyse fondée notamment sur le bulletin ${analysis.current_period}.` : ''}
        </span>
      </div>
    </div>
  );
};

const ScpiVigilanceRationalePortalV2: React.FC = () => {
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
          .select(
            'scpi_slug,current_period,previous_period,status,risk_level,trend_score,alerts,improvements,deteriorations,watch_points',
          ),
        supabase
          .from('scpi_indicators')
          .select(
            'scpi_slug,nom,tof,capitalisation,prix_souscription,prix_reconstitution,endettement,walt,walb,nombre_locataires,nombre_immeubles,nombre_parts,parts_attente_retrait,annee_creation,repartition_sectorielle,repartition_geographique',
          ),
      ]);

      if (cancelled) return;

      if (analysisResult.error) {
        console.warn('[ScpiVigilanceRationale] Analyses indisponibles', analysisResult.error);
      }
      if (indicatorResult.error) {
        console.warn('[ScpiVigilanceRationale] Indicateurs indisponibles', indicatorResult.error);
      }

      const analysisMap: Record<string, BulletinAnalysis> = {};
      for (const row of (analysisResult.data || []) as BulletinAnalysis[]) {
        analysisMap[row.scpi_slug] = row;
      }

      const indicatorMap: Record<string, ScpiIndicator> = {};
      for (const row of (indicatorResult.data || []) as ScpiIndicator[]) {
        indicatorMap[row.scpi_slug] = row;
      }

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
      const heading = Array.from(document.querySelectorAll<HTMLHeadingElement>('h2')).find((node) =>
        node.textContent?.trim().startsWith('Analyse Détaillée -'),
      );

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

        const analysisHeading = Array.from(modal.querySelectorAll<HTMLHeadingElement>('h3')).find(
          (node) => node.textContent?.trim() === 'Analyse MaximusSCPI',
        );
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

export default ScpiVigilanceRationalePortalV2;
