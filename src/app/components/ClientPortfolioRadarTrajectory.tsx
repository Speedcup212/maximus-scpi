import React from 'react';
import type { PortfolioTofPoint } from '../../utils/clientPortfolioHistory';
import ClientHistoricalTofChart from './ClientHistoricalTofChart';
import { Activity, ArrowRight, Gauge, ShieldAlert, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { GlobalPortfolioTrajectory, GlobalRadarLevel, GlobalTrendLevel } from '../../utils/clientPortfolioTrajectory';

type Props = { summary: GlobalPortfolioTrajectory; surveillanceUnavailable: boolean; history: PortfolioTofPoint[]; historyUnavailable: boolean; onSelectHolding?: (slug: string) => void };
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
  info: { title: 'Informations de suivi, sans alerte de vigilance', description: 'Certains indicateurs évoluent, mais aucune vigilance modérée ou forte n’est déclenchée sur les données exploitées.', color: 'text-sky-200' },
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

const ClientPortfolioRadarTrajectory: React.FC<Props> = ({ summary, surveillanceUnavailable, history, historyUnavailable, onSelectHolding }) => {
  const heading = globalTitles[summary.overallStatus];
  const delta = summary.delta4Weighted;
  const Direction = delta === null || Math.abs(delta) < 0.001 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const directionColor = delta === null ? 'text-slate-400' : delta < -0.001 ? 'text-amber-300'
    : delta > 0.001 ? 'text-emerald-300' : 'text-slate-100';
  const watchPositions = summary.rows
    .filter(row => row.status === 'watch' || row.status === 'critical')
    .sort((first, second) => second.percent - first.percent);
  const infoPositions = summary.rows.filter(row => row.status === 'info');
  const infoPercent = summary.weights.find(weight => weight.status === 'info')?.percent ?? 0;
  const watchedNames = watchPositions.slice(0, 2).map(row => row.name).join(' et ');
  const watchMore = watchPositions.length > 2 ? ` et ${watchPositions.length - 2} autre(s) SCPI` : '';
  const decliningPositions = summary.rows
    .filter(row => row.trend === 'decline')
    .sort((first, second) => second.percent - first.percent);
  const decliningNames = decliningPositions.slice(0, 2).map(row => row.name).join(' et ');
  const decliningPercent = summary.trends.find(trend => trend.trend === 'decline')?.percent ?? 0;
  const monitoredValueLabel = pct(summary.monitoredPercent, 0);

  return (
    <section aria-labelledby="global-portfolio-title" className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">Surveillance consolidée</p>
          <h3 id="global-portfolio-title" className="mt-1 text-xl font-semibold text-white">Radar & trajectoire du portefeuille</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            <strong className="text-white">À quoi sert cette analyse ?</strong> Identifier les SCPI qui méritent votre attention
            et suivre l'occupation de leurs immeubles, selon leur poids dans votre portefeuille.
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-300">{summary.rows.length} SCPI suivies</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.12fr_1fr]">
        <article className="min-w-0 rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/[0.07] via-slate-900/60 to-slate-950 p-5 lg:p-6">
          <div className="flex items-center gap-2"><Gauge className="h-5 w-5 text-emerald-300" /><h4 className="font-semibold text-white">Radar : quelles SCPI surveiller ?</h4></div>
          <details className="mt-2 text-sm text-slate-300">
            <summary className="w-fit cursor-pointer rounded-md py-1 font-medium text-emerald-300 hover:text-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300">Comprendre le radar</summary>
            <p className="mt-2 leading-6">
              Le radar recherche des <strong className="text-white">signaux d'alerte</strong> sur l'occupation,
              la liquidité, la valorisation et l'endettement des SCPI.
              Il ne prédit pas une perte en capital.
            </p>
          </details>
          <p className={'mt-4 text-base font-semibold leading-6 ' + heading.color}>{heading.title}</p>
          <p className="mt-2 text-sm leading-5 text-slate-300">{heading.description}</p>
          <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm leading-6 text-slate-200">
            <strong className="text-white">Ce que cela signifie pour votre portefeuille : </strong>
            {surveillanceUnavailable || summary.monitoredPercent === 0
              ? 'La surveillance ne permet pas actuellement de conclure sur les risques des SCPI détenues.'
              : watchPositions.length > 0
                ? <>{pct(summary.riskExposurePercent)} de la valeur indicative de vos SCPI est concernée par un signal de vigilance, notamment {watchedNames}{watchMore}. Il s'agit d'un indicateur à examiner, pas d'une perte constatée.</>
                : infoPositions.length > 0
                  ? <>Aucune alerte de vigilance sur les données suivies. {pct(infoPercent)} du portefeuille présente des informations de suivi, notamment {infoPositions.slice(0, 2).map(row => row.name).join(' et ')}. Une baisse d’occupation peut être suivie sans qualifier le TOF de préoccupant.</>
                  : <>Aucun signal de vigilance n'a été détecté sur les {monitoredValueLabel} de valeur de portefeuille couverts par les contrôles disponibles. Cela ne garantit pas l'absence de risque.</>}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="text-xs font-medium text-slate-300">Part du portefeuille à surveiller</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-amber-200">
                {surveillanceUnavailable || summary.monitoredPercent === 0 ? '—' : pct(summary.riskExposurePercent)}
              </div>
              <div className="mt-1 text-xs leading-5 text-slate-400">Poids de vos SCPI présentant au moins un signal, et non montant que vous risquez de perdre.</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
              <div className="text-xs font-medium text-slate-300">Portefeuille analysable</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-white">{pct(summary.monitoredPercent)}</div>
              <div className="mt-1 text-xs leading-5 text-slate-400">Parts disposant de données exploitables. 100 % ne signifie pas « sans risque ».</div>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-2"><span className="text-xs font-medium text-slate-200">Exposition pondérée aux signaux</span><span className="text-xs text-slate-400">Sur 100 % du capital</span></div>
            <SegmentedBar label="Radar du portefeuille"
              values={summary.weights.map(w => ({ key: radarColors[w.status].label, percent: w.percent, fill: radarColors[w.status].fill }))} />
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {summary.weights.filter(w => w.count > 0).map(w => (
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
          <details className="mt-4 border-t border-white/10 pt-3">
            <summary className="w-fit cursor-pointer py-1 text-sm font-semibold text-emerald-300 hover:text-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300">Comprendre les quatre axes de surveillance</summary>
            <h5 className="mt-2 text-sm font-semibold text-slate-100">Pourquoi une SCPI est-elle surveillée ?</h5>
            <p className="mt-1 text-xs leading-5 text-slate-300">Chaque ligne représente un domaine contrôlé. Un signal peut concerner plusieurs domaines : leurs pourcentages ne s'additionnent pas.</p>
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
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {axis.kind === 'tof' && 'Occupation : évolution des loyers liés aux surfaces louées (TOF).'}
                    {axis.kind === 'liquidity' && 'Liquidité : éventuelles difficultés à revendre les parts.'}
                    {axis.kind === 'valuation' && 'Valorisation : écart entre le prix de la part et la valeur estimée du patrimoine.'}
                    {axis.kind === 'debt' && 'Endettement : niveau de dette supporté par la SCPI.'}
                    {' '}{axis.scpiCount} SCPI avec signal.
                  </p>
                </div>
              ))}
            </div>
          </details>
          <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-slate-400">
            Les évolutions du TOF sont conservées même lorsqu'elles ne déclenchent aucune alerte. Signaux indicatifs, sans notation réglementaire ni recommandation personnalisée.
          </p>
        </article>

        <article className="min-w-0 rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/[0.07] via-slate-900/60 to-slate-950 p-5 lg:p-6">
          <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-sky-300" /><h4 className="font-semibold text-white">Trajectoire : l'occupation des immeubles s'améliore-t-elle ?</h4></div>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            <strong className="text-white">TOF = taux d'occupation financier.</strong> Il mesure l'occupation des immeubles à partir des loyers,
            et non le rendement ou la valeur de vos parts.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4">
              <div className="text-xs font-medium text-slate-300">Occupation financière moyenne des SCPI</div>
              <div className="mt-2 text-2xl font-semibold tabular-nums text-white">
                {summary.tofWeighted === null ? '—' : pct(summary.tofWeighted, 2)}
              </div>
              <div className="mt-1 text-xs text-slate-400">{summary.referencePeriod || 'Période non disponible'}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4">
              <div className="text-xs font-medium text-slate-300">Évolution de l'occupation sur 4 observations</div>
              <div className={'mt-2 flex items-center gap-2 text-2xl font-semibold tabular-nums ' + directionColor}>
                <Direction className="h-5 w-5 shrink-0" />{points(delta)}
              </div>
              <div className="mt-1 text-xs text-slate-400">Capital comparable : {pct(summary.delta4CoveragePercent, 0)}</div>
            </div>
          </div>
          <p className="mt-4 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3 text-sm leading-6 text-slate-200">
            <strong className="text-white">À retenir : </strong>
            {summary.tofWeighted === null ? 'Les données disponibles ne permettent pas de calculer une trajectoire fiable.'
              : <>L'occupation moyenne atteint {pct(summary.tofWeighted, 2)}
                {delta === null ? ', sans évolution comparable exploitable.' : <> et {delta < -0.001 ? 'recule' : delta > 0.001 ? 'progresse' : 'reste globalement stable'} de {Math.abs(delta).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} point(s) sur quatre observations.</>}
                {decliningPositions.length > 0 && !surveillanceUnavailable ? <> Le TOF de {decliningNames} est orienté à la baisse.</> : null}
              </>}
            {' '}Cela ne mesure pas la variation de la valeur des parts.
          </p>
          <ClientHistoricalTofChart points={history} unavailable={historyUnavailable} />
          <details className="mt-3 rounded-xl border border-white/10 bg-slate-950/20 px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-sky-300 hover:text-sky-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300">
              Comprendre la trajectoire et voir le détail des calculs
            </summary>
          <div className="mt-4 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3 text-sm leading-6 text-slate-200">
            <strong className="text-white">Comment interpréter ces chiffres ? </strong>
            {summary.tofWeighted === null
              ? 'Les données disponibles ne suffisent pas à calculer une occupation moyenne représentative.'
              : <>
                Le TOF pondéré est de {pct(summary.tofWeighted, 2)} sur la période {summary.referencePeriod || 'étudiée'}.
                {delta === null
                  ? ' Son évolution ne peut pas être calculée sur une période comparable.'
                  : <> L'indicateur {delta < -0.001 ? 'recule' : delta > 0.001 ? 'progresse' : 'reste quasiment stable'} de {Math.abs(delta).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} point(s) sur quatre observations. <strong className="text-white">Cela n'indique pas une variation de la valeur de vos parts.</strong></>}
              </>}
            {decliningPositions.length > 0 && !surveillanceUnavailable && <> {pct(decliningPercent)} de la valeur indicative est placée dans {decliningNames}, dont le TOF est orienté à la baisse.</>}
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-200">Évolution de l'occupation, par SCPI détenue</span>
              <span className="text-xs text-slate-400">Couverture {pct(summary.tofCoveragePercent, 0)}</span>
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
          </details>
        </article>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
        <div className="flex flex-col gap-1 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-sm font-semibold text-white">Contribution des SCPI au radar global</h4>
          <span className="text-xs text-slate-400">Cliquez sur une SCPI pour consulter sa fiche ci-dessous</span>
        </div>
        <div className="divide-y divide-white/10">
          {summary.rows.map(row => (
            <a key={row.slug} href={'#holding-' + row.slug} onClick={() => onSelectHolding?.(row.slug)}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm transition hover:bg-white/[0.05] focus-visible:bg-white/[0.05]">
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
