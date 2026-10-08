import React from 'react';
import { Activity, ArrowRight, Gauge, ShieldAlert, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { GlobalPortfolioTrajectory, GlobalRadarLevel, GlobalTrendLevel } from '../../utils/clientPortfolioTrajectory';

type Props = { summary: GlobalPortfolioTrajectory; surveillanceUnavailable: boolean };
const radarColors: Record<GlobalRadarLevel, { label: string; fill: string }> = {
  critical: { label: 'Vigilance forte', fill: '#fb7185' },
  watch: { label: 'À surveiller', fill: '#fbbf24' },
  info: { label: 'Information', fill: '#38bdf8' },
  stable: { label: 'Sans signal', fill: '#34d399' },
  pending: { label: 'Non documenté', fill: '#64748b' },
};
const trendColors: Record<GlobalTrendLevel, { label: string; fill: string }> = {
  decline: { label: 'TOF en baisse', fill: '#fbbf24' },
  stable: { label: 'TOF stable', fill: '#34d399' },
  rise: { label: 'TOF en hausse', fill: '#38bdf8' },
  unknown: { label: 'Non comparable', fill: '#64748b' },
};
const pct = (value: number, digits = 1) =>
  value.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + ' %';
const points = (value: number | null) => value === null ? '—'
  : (value > 0 ? '+' : '') + value.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' pt';
const globalTitles: Record<GlobalPortfolioTrajectory['overallStatus'], { title: string; description: string; color: string }> = {
  critical: { title: 'Vigilance forte sur une partie du portefeuille', description: 'Au moins une SCPI présente un signal fort selon les règles Maximus.', color: 'text-rose-200' },
  watch: { title: 'Une partie du portefeuille est à surveiller', description: 'Des signaux défavorables ont été détectés, sans préjuger de leur évolution.', color: 'text-amber-200' },
  partial: { title: 'Analyse partiellement documentée', description: 'Certains actifs ne disposent pas de trajectoire certifiée.', color: 'text-slate-200' },
  info: { title: 'Informations à examiner', description: 'Des informations sont disponibles sans vigilance modérée ou forte détectée.', color: 'text-sky-200' },
  clear: { title: 'Aucun signal détecté sur les données certifiées', description: 'Cela ne garantit ni liquidité ni stabilité future.', color: 'text-emerald-200' },
  unavailable: { title: 'Surveillance indisponible ou non certifiée', description: 'Aucune conclusion de risque n’est possible.', color: 'text-slate-200' },
};
const SegmentedBar = ({ label, values }: { label: string; values: { key: string; percent: number; fill: string }[] }) => (
  <div role="img" aria-label={label + ' : ' + values.map(v => v.key + ' ' + pct(v.percent)).join(' ; ')}
    className="flex h-4 overflow-hidden rounded-full bg-slate-800">
    {values.filter(v => v.percent > 0).map(v => (
      <div key={v.key} title={v.key + ' : ' + pct(v.percent)}
        style={{ width: v.percent + '%', backgroundColor: v.fill }} />
    ))}
  </div>
);

const ClientPortfolioRadarTrajectory: React.FC<Props> = ({ summary, surveillanceUnavailable }) => {
  const heading = globalTitles[summary.overallStatus];
  const delta = summary.delta4Weighted;
  const Direction = delta === null || Math.abs(delta) < 0.001 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const directionColor = delta === null ? 'text-slate-400' : delta < -0.001 ? 'text-amber-300'
    : delta > 0.001 ? 'text-emerald-300' : 'text-slate-100';

  return (
    <section aria-labelledby="global-portfolio-title" className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">Surveillance consolidée</p>
          <h3 id="global-portfolio-title" className="mt-1 text-xl font-semibold text-white">Radar & trajectoire du portefeuille</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">SCPI détenues dans cet espace, pondérées par leur valeur indicative.</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-300">{summary.rows.length} SCPI suivies</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.12fr_1fr]">
        <article className="min-w-0 rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/[0.07] via-slate-900/60 to-slate-950 p-5 lg:p-6">
          <div className="flex items-center gap-2"><Gauge className="h-5 w-5 text-emerald-300" /><h4 className="font-semibold text-white">Radar global de vigilance</h4></div>
          <p className={'mt-4 text-lg font-semibold leading-6 ' + heading.color}>{heading.title}</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">{heading.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Part sous vigilance</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-amber-200">
                {surveillanceUnavailable || summary.monitoredPercent === 0 ? '—' : pct(summary.riskExposurePercent)}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">Vigilance modérée et forte</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Capital couvert par le radar</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-white">{pct(summary.monitoredPercent)}</div>
              <div className="mt-1 text-[11px] text-slate-500">Hors positions non certifiées</div>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-2"><span className="text-xs font-medium text-slate-200">Exposition pondérée aux signaux</span><span className="text-[11px] text-slate-500">Sur 100 % du capital</span></div>
            <SegmentedBar label="Radar du portefeuille"
              values={summary.weights.map(w => ({ key: radarColors[w.status].label, percent: w.percent, fill: radarColors[w.status].fill }))} />
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              {summary.weights.map(w => (
                <div key={w.status} className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: radarColors[w.status].fill }} />
                  <div className="min-w-0">
                    <div className="font-medium tabular-nums text-slate-200">{pct(w.percent)}</div>
                    <div className="mt-0.5 text-[11px] leading-4 text-slate-400">{radarColors[w.status].label} · {w.count} SCPI</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 border-t border-white/10 pt-4">
            <h5 className="text-xs font-semibold text-slate-200">Axes de surveillance Maximus</h5>
            <p className="mt-1 text-[11px] leading-4 text-slate-500">Part du capital exposée à un signal identifié sur chaque axe. Les axes ne s'additionnent pas.</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {summary.axes.map(axis => (
                <div key={axis.kind}>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-slate-200">{axis.label}</span>
                    <span className="tabular-nums text-amber-200">
                      {summary.monitoredPercent === 0 ? '—' : pct(axis.vigilancePercent)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="bg-amber-400" style={{ width: axis.vigilancePercent + '%' }} />
                    <div className="bg-sky-400" style={{ width: axis.informationPercent + '%' }} />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {axis.scpiCount} SCPI avec signal · {pct(axis.informationPercent)} d'information
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-5 text-slate-500">
            Synthèse des signaux existants, pas une notation réglementaire SRRI/SRI ni une recommandation personnalisée.
          </p>
        </article>

        <article className="min-w-0 rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/[0.07] via-slate-900/60 to-slate-950 p-5 lg:p-6">
          <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-sky-300" /><h4 className="font-semibold text-white">Trajectoire globale du TOF</h4></div>
          <p className="mt-2 text-xs leading-5 text-slate-400">Données certifiées de période comparable, pas évolution financière du portefeuille.</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">TOF moyen pondéré</div>
              <div className="mt-2 text-2xl font-semibold tabular-nums text-white">
                {summary.tofWeighted === null ? '—' : pct(summary.tofWeighted, 2)}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">{summary.referencePeriod || 'Période non disponible'}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Variation sur 4 observations</div>
              <div className={'mt-2 flex items-center gap-2 text-2xl font-semibold tabular-nums ' + directionColor}>
                <Direction className="h-5 w-5 shrink-0" />{points(delta)}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">Capital comparable : {pct(summary.delta4CoveragePercent, 0)}</div>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-200">Trajectoires par exposition</span>
              <span className="text-[11px] text-slate-400">Couverture {pct(summary.tofCoveragePercent, 0)}</span>
            </div>
            <SegmentedBar label="Trajectoires TOF"
              values={summary.trends.map(t => ({ key: trendColors[t.trend].label, percent: t.percent, fill: trendColors[t.trend].fill }))} />
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              {summary.trends.map(t => (
                <div key={t.trend} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: trendColors[t.trend].fill }} />
                  <span className="min-w-0 flex-1 text-slate-300">{trendColors[t.trend].label}</span>
                  <span className="font-semibold tabular-nums text-white">{pct(t.percent)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/30 px-4 py-3 text-xs leading-5 text-slate-300">
            {summary.referencePeriod === null ? (
              <span><ShieldAlert className="mr-2 inline h-4 w-4 text-amber-300" />Aucune période commune exploitable : trajectoire non calculée.</span>
            ) : summary.periodCoveragePercent < 99.95 ? (
              <span>Période retenue : {summary.referencePeriod}, sur {pct(summary.periodCoveragePercent)} du capital.
                Les autres périodes sont exclues des moyennes.</span>
            ) : (
              <span>Période commune : {summary.referencePeriod}. Les variations sont pondérées par la valeur actuelle des positions.</span>
            )}
          </div>
          <p className="mt-3 text-[11px] leading-5 text-slate-500">
            Cette tendance du TOF ne représente ni une courbe de rendement ni une variation du capital investi.
          </p>
        </article>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
        <div className="flex flex-col gap-1 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-sm font-semibold text-white">Contribution des SCPI au radar global</h4>
          <span className="text-[11px] text-slate-400">Cliquez sur une SCPI pour consulter sa fiche ci-dessous</span>
        </div>
        <div className="divide-y divide-white/10">
          {summary.rows.map(row => (
            <a key={row.slug} href={'#holding-' + row.slug}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-xs transition hover:bg-white/[0.05] focus-visible:bg-white/[0.05]">
              <span className="min-w-[10rem] flex-1 font-medium text-slate-100">{row.name}</span>
              <span className="w-20 shrink-0 text-right font-semibold tabular-nums text-slate-200">{pct(row.percent)}</span>
              <span className="flex min-w-[10rem] items-center gap-1.5 text-slate-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: radarColors[row.status].fill }} />
                {radarColors[row.status].label}
              </span>
              <span className="min-w-[8rem] text-slate-400">{row.trend === 'unknown' ? 'TOF non comparable' : trendColors[row.trend].label}</span>
              <ArrowRight className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
export default ClientPortfolioRadarTrajectory;
