import React from 'react';
import {
  Activity, AlertTriangle, ArrowUpRight, Building2, ExternalLink,
  Globe2, Layers3, Pencil, ShieldAlert, TrendingUp,
} from 'lucide-react';
import type { SurveillanceDashboardRow, SurveillanceSignal } from '../../utils/surveillanceSignals';
import type { ScpiExposure, ExposureEntry } from '../../utils/clientPortfolioExposure';

type Numeric = number | string | null | undefined;
export type ClientScpiCardIndicator = {
  td?: Numeric;
  td_annee?: number | null;
  tof?: Numeric;
  prix_souscription?: Numeric;
  prix_retrait?: Numeric;
  prix_reconstitution?: Numeric;
  endettement?: Numeric;
  capitalisation?: Numeric;
  societe_gestion?: string | null;
  categorie?: string | null;
  versement_loyers?: string | null;
  delai_jouissance?: Numeric;
  sfdr?: string | null;
  label_isr?: boolean | null;
  srri?: number | null;
  source_period?: string | null;
  updated_at?: string | null;
};
export type ClientScpiCardHolding = {
  slug: string;
  name: string;
  units: number;
  invested: number;
  currentValue: number;
  valuationBasis: 'withdrawal' | 'subscription' | 'purchase';
  averagePurchasePrice: number;
  annualIncome: number | null;
  yieldOnCost: number | null;
  source: 'maximus' | 'external' | 'mixed';
  indicator?: ClientScpiCardIndicator;
  trajectory?: SurveillanceDashboardRow;
};
type Props = {
  holding: ClientScpiCardHolding;
  sector: ScpiExposure;
  geography: ScpiExposure;
  company?: string | null;
  alerts: SurveillanceSignal[];
  radarLabel: string;
  radarClass: string;
  surveillanceUnavailable: boolean;
  manageExpanded: boolean;
  onManage: () => void;
  children?: React.ReactNode;
};

const colorScale = ['#2dd4bf','#60a5fa','#a78bfa','#f59e0b','#f472b6','#38bdf8','#94a3b8','#818cf8'];
const num = (value: Numeric): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
const euro = (value: Numeric, decimals = 0) => {
  const n = num(value);
  return n === null ? 'Non disponible' : n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: decimals });
};
const pct = (value: Numeric, decimals = 1) => {
  const n = num(value);
  return n === null ? '—' : n.toLocaleString('fr-FR', { maximumFractionDigits: decimals }) + ' %';
};
const pctChange = (value: number) => (value > 0 ? '+' : '') + pct(value);
const periodLabel = (value?: string | null) => value ? 'Données : ' + value : 'Période de référence non précisée';

const Stat = ({ label, value, hint, emphasis = false }: {
  label: string; value: string; hint?: string; emphasis?: boolean;
}) => (
  <div className="min-w-0 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">
    <div className="text-[10px] uppercase tracking-[0.13em] text-slate-400">{label}</div>
    <div className={emphasis ? 'mt-1 text-xl font-semibold tabular-nums text-white' : 'mt-1 text-base font-semibold tabular-nums text-slate-100'}>{value}</div>
    {hint && <div className="mt-1 text-[11px] leading-4 text-slate-500">{hint}</div>}
  </div>
);

const VisualDistribution = ({ title, icon: Icon, exposure }: {
  title: string; icon: React.ElementType; exposure: ScpiExposure;
}) => {
  const items = exposure.items;
  const colors = items.map((item, index) => ({ ...item, color: colorScale[index % colorScale.length] }));
  const slices: string[] = [];
  let progress = 0;
  for (const { value, color } of colors) {
    const start = progress;
    progress += value;
    slices.push(color + ' ' + start + '% ' + progress + '%');
  }
  const top = items.reduce<ExposureEntry | null>((best, item) => !best || item.value > best.value ? item : best, null);
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
        <Icon className="h-4 w-4 text-emerald-300" />
        {title}
      </div>
      {items.length ? (
        <>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div
              className="relative h-28 w-28 shrink-0 rounded-full"
              style={{ background: 'conic-gradient(' + slices.join(',') + ')' }}
              role="img"
              aria-label={title + ' : ' + items.map(item => item.label + ' ' + pct(item.value)).join(', ')}
            >
              <div className="absolute inset-[18px] flex items-center justify-center rounded-full bg-slate-900 text-center">
                <span className="max-w-[72px] text-[11px] leading-4 text-slate-200">{top?.label}</span>
              </div>
            </div>
            <div className="w-full min-w-0 flex-1 space-y-2">
              {colors.slice(0, 5).map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-slate-300">{item.label}</span>
                    <span className="shrink-0 tabular-nums text-slate-200">{pct(item.value)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full" style={{ width: Math.min(100, item.value) + '%', backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
              {colors.length > 5 && <p className="text-[11px] text-slate-500">+ {colors.length - 5} autres catégories sur la fiche</p>}
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-4 text-slate-500">
            {exposure.source === 'catalog'
              ? 'Source : répartition de la fiche SCPI Maximus ; période à vérifier.'
              : 'Source : répartition structurée MaximusSCPI.'}
          </p>
        </>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-7 text-center text-xs leading-5 text-slate-400">
          Répartition détaillée non vérifiable. Aucun pourcentage inventé.
        </div>
      )}
    </div>
  );
};

const ClientScpiCard: React.FC<Props> = ({
  holding, sector, geography, company, alerts,
  radarLabel, radarClass, surveillanceUnavailable, manageExpanded, onManage, children,
}) => {
  const { indicator, trajectory } = holding;
  const delta = holding.currentValue - holding.invested;
  const deltaPct = holding.invested > 0 ? delta / holding.invested * 100 : null;
  const tof = num(indicator?.tof);
  const valuationGap = num(indicator?.prix_souscription) !== null &&
    num(indicator?.prix_reconstitution) !== null && (num(indicator?.prix_reconstitution) || 0) > 0
    ? ((num(indicator?.prix_souscription) as number) / (num(indicator?.prix_reconstitution) as number) - 1) * 100
    : null;
  const topSector = sector.items.reduce<ExposureEntry | null>((top, item) => !top || item.value > top.value ? item : top, null);
  const topGeography = geography.items.reduce<ExposureEntry | null>((top, item) => !top || item.value > top.value ? item : top, null);
  const scpiFacts = [
    topSector ? 'Exposition dominante : ' + topSector.label + ' (' + pct(topSector.value) + ')' : null,
    topGeography ? 'Première zone : ' + topGeography.label + ' (' + pct(topGeography.value) + ')' : null,
    tof !== null ? 'TOF publié : ' + pct(tof) : null,
  ].filter((item): item is string => item !== null);

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 shadow-xl shadow-black/10">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-start sm:justify-between lg:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10">
            <Building2 className="h-7 w-7 text-emerald-300" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xl font-semibold text-white">{holding.name}</h4>
              <span className={'rounded-full border px-2.5 py-1 text-[10px] font-semibold ' + radarClass}>
                {surveillanceUnavailable ? 'Surveillance indisponible' : radarLabel}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {company || 'Société de gestion non renseignée'} · {holding.units.toLocaleString('fr-FR', { maximumFractionDigits: 6 })} parts
              {' · '}{holding.source === 'external' ? 'Détenues ailleurs' : holding.source === 'maximus' ? 'Souscrites via Maximus' : 'Origines mixtes'}
            </p>
            <p className="text-[11px] text-slate-500">
              {indicator?.source_period ? periodLabel(indicator.source_period) : 'Indicateurs datés selon les dernières sources disponibles'}
              {trajectory?.latest_period ? ' · Trajectoires ' + trajectory.latest_period : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {holding.source !== 'maximus' && (
            <button type="button" onClick={onManage} aria-expanded={manageExpanded}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs text-slate-200 hover:border-emerald-500/30 hover:bg-white/5">
              <Pencil className="h-3.5 w-3.5" /> Gérer mes parts
            </button>
          )}
          <a href={'/' + holding.slug + '/'} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-300">
            Fiche complète <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="p-5 lg:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Capital investi" value={euro(holding.invested)} hint={euro(holding.averagePurchasePrice, 2) + ' / part à l’achat'} emphasis />
          <Stat
            label={holding.valuationBasis === 'withdrawal' ? 'Valeur indicative de retrait' : holding.valuationBasis === 'subscription' ? 'Valeur indicative de souscription' : 'Coût retenu faute de valeur publiée'}
            value={euro(holding.currentValue)}
            hint={holding.valuationBasis === 'withdrawal'
              ? euro(num(indicator?.prix_retrait), 2) + ' / part · hors délai de cession'
              : holding.valuationBasis === 'subscription'
                ? 'Prix de souscription, pas valeur de revente'
                : 'Aucune valeur actuelle exploitable'}
            emphasis
          />
          <Stat label="Différence valeur / coût" value={euro(delta)} hint={(deltaPct === null ? '—' : pctChange(deltaPct)) + ' · pas une perte réalisée'} emphasis />
          <Stat label="Revenus annualisés indicatifs" value={euro(holding.annualIncome)} hint={'TD publié appliqué aux parts, hors jouissance'} emphasis />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Taux de distribution" value={pct(indicator?.td, 2)} hint={indicator?.td_annee ? 'Référence ' + indicator.td_annee : 'Année du TD à vérifier'} />
          <Stat label="Taux d’occupation (TOF)" value={pct(tof, 2)} hint={trajectory?.trajectoire_tof ? 'Trajectoire : ' + trajectory.trajectoire_tof.replace(/_/g, ' ') : 'Évolution non certifiée'} />
          <Stat label="Prix de souscription" value={euro(indicator?.prix_souscription, 2)} hint="Prix public indicatif" />
          <Stat label="Valeur de reconstitution" value={euro(indicator?.prix_reconstitution, 2)} hint={valuationGap === null ? 'Écart indisponible' : 'Prix / reconstitution : ' + pctChange(valuationGap)} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <VisualDistribution title="Répartition sectorielle" icon={Layers3} exposure={sector} />
          <VisualDistribution title="Répartition géographique" icon={Globe2} exposure={geography} />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <h5 className="flex items-center gap-2 text-sm font-semibold text-white">
              <TrendingUp className="h-4 w-4 text-emerald-300" /> Lecture patrimoniale
            </h5>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Exposition et indicateurs de cette SCPI au sein du portefeuille, sans recommandation personnalisée.
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              {scpiFacts.length ? scpiFacts.map(fact => <li key={fact} className="flex gap-2"><span className="text-emerald-300">•</span>{fact}</li>)
                : <li>Informations d’exposition insuffisantes.</li>}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-400">
              {num(indicator?.endettement) !== null && <span className="rounded-lg border border-white/10 px-2 py-1">Endettement : {pct(indicator?.endettement)}</span>}
              {num(indicator?.capitalisation) !== null && <span className="rounded-lg border border-white/10 px-2 py-1">Capitalisation : {euro(indicator?.capitalisation)}</span>}
              {indicator?.label_isr && <span className="rounded-lg border border-white/10 px-2 py-1">Label ISR</span>}
              {indicator?.sfdr && <span className="rounded-lg border border-white/10 px-2 py-1">SFDR : {indicator.sfdr}</span>}
              {indicator?.srri != null && <span className="rounded-lg border border-white/10 px-2 py-1">Risque publié : {indicator.srri}/7</span>}
              {num(indicator?.delai_jouissance) !== null && <span className="rounded-lg border border-white/10 px-2 py-1">Jouissance : {num(indicator?.delai_jouissance)} mois</span>}
              {indicator?.versement_loyers && <span className="rounded-lg border border-white/10 px-2 py-1">Distribution : {indicator.versement_loyers}</span>}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <h5 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Activity className="h-4 w-4 text-emerald-300" /> Surveillance de cette SCPI
            </h5>
            {surveillanceUnavailable ? (
              <div className="mt-3 flex gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-100">
                <ShieldAlert className="h-4 w-4 shrink-0" /> Indisponible : aucun diagnostic de risque ne peut être établi.
              </div>
            ) : alerts.length ? (
              <div className="mt-3 space-y-2">
                {alerts.slice(0, 3).map((alert, index) => (
                  <div key={alert.kind + index} className={alert.level === 'critical'
                    ? 'rounded-xl border border-red-500/20 bg-red-500/5 p-3'
                    : alert.level === 'watch'
                      ? 'rounded-xl border border-amber-500/20 bg-amber-500/5 p-3'
                      : 'rounded-xl border border-sky-500/20 bg-sky-500/5 p-3'}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                      <div>
                        <p className="text-xs font-medium text-white">{alert.title}</p>
                        <p className="mt-1 text-[11px] leading-5 text-slate-300">{alert.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {alerts.length > 3 && <p className="text-[11px] text-slate-400">+ {alerts.length - 3} autres signaux à consulter dans les analyses</p>}
              </div>
            ) : !trajectory ? (
              <p className="mt-3 text-xs text-slate-400">Trajectoires indisponibles pour cette SCPI. Ce n’est pas un signal de stabilité.</p>
            ) : (
              <p className="mt-3 text-xs text-slate-300">Aucun signal de vigilance identifié selon les règles actuellement certifiées. Cela ne garantit pas l’absence de risque.</p>
            )}
            <a href={'/' + holding.slug + '/'} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 hover:text-emerald-200">
              Analyse SCPI complète <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        {manageExpanded && (
          <div className="mt-5 border-t border-white/10 pt-5">{children}</div>
        )}
      </div>
    </article>
  );
};

export default ClientScpiCard;
