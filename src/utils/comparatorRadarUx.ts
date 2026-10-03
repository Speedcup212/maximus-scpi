import { createSlugFromName } from './scpiSlugMapper';
import { selectSupabaseRest } from './supabaseRest';

const RADAR_TITLE = 'Radar MaximusSCPI';
const ANALYSIS_TITLE_PREFIX = 'Analyse Détaillée - ';
const TRAJECTORY_PANEL_ATTR = 'data-maximus-trajectory-panel';

type TrajectoryDashboardRow = {
  scpi_slug: string;
  latest_period?: string | null;
  tof?: number | string | null;
  niveau_tof?: string | null;
  trajectoire_tof?: string | null;
  delta_last_obs?: number | string | null;
  tof_points?: number | string | null;
  tof_gate?: string | null;
  tof_signal_eligible?: boolean | null;
  retrait_attente_pct?: number | string | null;
  niveau_liquidite?: string | null;
  trajectoire_liquidite?: string | null;
  liquidity_points?: number | string | null;
  liquidity_period?: string | null;
  liquidity_basis?: string | null;
  liquidity_pressure_pct?: number | string | null;
  liquidity_sell_orders?: number | string | null;
  liquidity_buy_orders?: number | string | null;
  liquidity_regime_changed?: boolean | null;
  liquidity_signal_certification?: string | null;
  liquidity_gate?: string | null;
  liquidity_signal_eligible?: boolean | null;
  prix_souscription_known?: number | string | null;
  prix_souscription_period?: string | null;
  prix_souscription_points?: number | string | null;
  prix_souscription_quality?: string | null;
  prix_souscription_delta_last?: number | string | null;
  subscription_value_gate?: string | null;
  prix_reconstitution_known?: number | string | null;
  prix_reconstitution_period?: string | null;
  prix_reconstitution_points?: number | string | null;
  prix_reconstitution_quality?: string | null;
  prix_reconstitution_delta_last?: number | string | null;
  reconstitution_gate?: string | null;
  valeur_realisation_known?: number | string | null;
  valeur_realisation_period?: string | null;
  valeur_realisation_points?: number | string | null;
  valeur_realisation_quality?: string | null;
  valeur_realisation_delta_last?: number | string | null;
  realization_gate?: string | null;
  endettement_known?: number | string | null;
  endettement_period?: string | null;
  endettement_points?: number | string | null;
  endettement_quality?: string | null;
  endettement_delta_last?: number | string | null;
  debt_gate?: string | null;
  data_gate?: string | null;
  structural_gate?: string | null;
  semantic_gate?: string | null;
  market_signal_gate?: string | null;
};

const DASHBOARD_SELECT = [
  'scpi_slug',
  'latest_period',
  'tof',
  'niveau_tof',
  'trajectoire_tof',
  'delta_last_obs',
  'tof_points',
  'tof_gate',
  'tof_signal_eligible',
  'retrait_attente_pct',
  'niveau_liquidite',
  'trajectoire_liquidite',
  'liquidity_points',
  'liquidity_period',
  'liquidity_basis',
  'liquidity_pressure_pct',
  'liquidity_sell_orders',
  'liquidity_buy_orders',
  'liquidity_regime_changed',
  'liquidity_signal_certification',
  'liquidity_gate',
  'liquidity_signal_eligible',
  'prix_souscription_known',
  'prix_souscription_period',
  'prix_souscription_points',
  'prix_souscription_quality',
  'prix_souscription_delta_last',
  'subscription_value_gate',
  'prix_reconstitution_known',
  'prix_reconstitution_period',
  'prix_reconstitution_points',
  'prix_reconstitution_quality',
  'prix_reconstitution_delta_last',
  'reconstitution_gate',
  'valeur_realisation_known',
  'valeur_realisation_period',
  'valeur_realisation_points',
  'valeur_realisation_quality',
  'valeur_realisation_delta_last',
  'realization_gate',
  'endettement_known',
  'endettement_period',
  'endettement_points',
  'endettement_quality',
  'endettement_delta_last',
  'debt_gate',
  'data_gate',
  'structural_gate',
  'semantic_gate',
  'market_signal_gate',
].join(',');

const panelCache = new Map<string, TrajectoryDashboardRow | null>();
const panelInflight = new Map<string, Promise<TrajectoryDashboardRow | null>>();

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const humanize = (value: string | null | undefined): string => {
  if (!value) return 'Non renseigné';
  const dictionary: Record<string, string> = {
    stable: 'Stable',
    hausse: 'Hausse',
    hausse_forte: 'Hausse forte',
    baisse: 'Baisse',
    baisse_forte: 'Baisse forte',
    amelioration: 'Amélioration',
    amelioration_forte: 'Amélioration forte',
    deterioration: 'Détérioration',
    deterioration_forte: 'Détérioration forte',
    historique_insuffisant: 'Historique insuffisant',
    stale_last_known: 'Dernière donnée connue non fraîche',
    regime_change_data_pending: 'Rupture de régime — nouvelle série en attente',
    non_calculable: 'Non calculable',
    faible: 'Faible',
    satisfaisant: 'Satisfaisant',
    fragile: 'Fragile',
    eleve: 'Élevé',
    tension_significative: 'Tension significative',
    tension_forte: 'Tension forte',
    trajectory: 'Trajectoire certifiée',
    evolution: 'Évolution observée',
    level_only: 'Niveau certifié uniquement',
    trajectory_certified: 'Trajectoire certifiée',
    suppressed_regime_change_pending_data: 'Signal neutralisé après rupture de régime',
  };
  return dictionary[value] || value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const gateLabel = (gate: string | null | undefined): string => {
  const labels: Record<string, string> = {
    PASS: 'Trajectoire exploitable',
    PASS_LEVEL_ONLY: 'Niveau certifié — pas de trajectoire',
    PASS_EVOLUTION: 'Évolution observable — profondeur limitée',
    PASS_LIMITED: 'Historique limité',
    PASS_STALE: 'Donnée non fraîche — signal neutralisé',
    PASS_PENDING_REGIME: 'Rupture de régime — signal neutralisé',
    PASS_NO_DATA: 'Aucun signal publié',
    PASS_NA: 'Non applicable',
    NO_DATA: 'Donnée non disponible',
  };
  return labels[gate || ''] || humanize(gate);
};

const gateClass = (gate: string | null | undefined): string => {
  if (gate === 'PASS') return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
  if (gate === 'PASS_EVOLUTION' || gate === 'PASS_LEVEL_ONLY' || gate === 'PASS_LIMITED') {
    return 'border-amber-500/40 bg-amber-500/10 text-amber-200';
  }
  if (gate === 'PASS_STALE' || gate === 'PASS_PENDING_REGIME' || gate === 'PASS_NO_DATA' || gate === 'NO_DATA') {
    return 'border-orange-500/40 bg-orange-500/10 text-orange-200';
  }
  return 'border-slate-600 bg-slate-800/70 text-slate-300';
};

const formatValue = (value: unknown, suffix = '', decimals = 2): string => {
  const number = toNumber(value);
  if (number === null) return 'N/D';
  return `${number.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
};

const formatDelta = (value: unknown, suffix = ''): string | null => {
  const number = toNumber(value);
  if (number === null) return null;
  const sign = number > 0 ? '+' : '';
  return `${sign}${number.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}${suffix}`;
};

const getRadarBlocks = (): HTMLElement[] => {
  if (typeof document === 'undefined') return [];

  return Array.from(document.querySelectorAll('h3'))
    .filter((heading) => heading.textContent?.trim() === RADAR_TITLE)
    .map((heading) => heading.parentElement?.parentElement?.parentElement)
    .filter((block): block is HTMLElement => block instanceof HTMLElement);
};

const replaceLeafText = (block: HTMLElement) => {
  const isMobile = window.matchMedia('(max-width: 639px)').matches;

  block.querySelectorAll<HTMLElement>('div, span, p').forEach((element) => {
    if (element.childElementCount > 0) return;
    const text = element.textContent?.trim() ?? '';

    if (text === 'Qualité') element.textContent = 'Solidité / valorisation';
    if (text === 'Taille') element.textContent = 'Capitalisation';
    if (text === 'Note globale') element.textContent = 'Note globale pondérée';

    if (text === 'Décomposition visuelle des cinq composantes de la note MaximusSCPI.') {
      element.textContent = 'Décomposition des cinq composantes pondérées de la note MaximusSCPI.';
    }

    if (text.startsWith('Chaque sommet reprend exactement le score affiché à droite.')) {
      element.textContent =
        'La note globale est pondérée : rendement 40 %, secteurs 20 %, géographie 15 %, solidité / valorisation 15 % et capitalisation 10 %. Le radar ne constitue ni une prévision de performance, ni une garantie de liquidité ou de capital.';
    }
  });

  block.querySelectorAll<SVGTextElement>('svg text').forEach((element) => {
    const text = element.textContent?.trim() ?? '';
    let replacement: string | null = null;

    if (/^Rendement(?:\s+\d+)?$/.test(text)) replacement = 'Rendement';
    else if (/^Secteurs(?:\s+\d+)?$/.test(text)) replacement = 'Secteurs';
    else if (/^Géographie(?:\s+\d+)?$/.test(text)) replacement = isMobile ? 'Géo.' : 'Géographie';
    else if (/^(?:Qualité|Solidité)(?:\s+\d+)?$/.test(text)) replacement = 'Solidité';
    else if (/^(?:Taille|Capitalisation|Capital\.)(?:\s+\d+)?$/.test(text)) replacement = isMobile ? 'Capital.' : 'Capitalisation';

    if (replacement && text !== replacement) element.textContent = replacement;
  });
};

const applyMobileLayoutFix = (block: HTMLElement) => {
  const isMobile = window.matchMedia('(max-width: 639px)').matches;
  const wrapper = block.querySelector<HTMLElement>('.recharts-wrapper');
  const surface = block.querySelector<SVGElement>('.recharts-surface');
  const chartContainer = wrapper?.parentElement as HTMLElement | null;

  if (wrapper) wrapper.style.overflow = 'visible';
  if (surface) surface.style.overflow = 'visible';

  if (chartContainer) {
    chartContainer.style.boxSizing = 'border-box';
    chartContainer.style.paddingLeft = isMobile ? '14px' : '';
    chartContainer.style.paddingRight = isMobile ? '14px' : '';
  }

  block.querySelectorAll<SVGTextElement>('.recharts-polar-angle-axis-tick-value').forEach((tick) => {
    tick.style.fontSize = isMobile ? '9.5px' : '';
    tick.style.fontWeight = '600';
  });
};

const findAnalysisTitle = (): HTMLHeadingElement | null => {
  const headings = Array.from(document.querySelectorAll<HTMLHeadingElement>('h2'));
  return headings.find((heading) => heading.textContent?.trim().startsWith(ANALYSIS_TITLE_PREFIX)) || null;
};

const getAnalysisScpiName = (): string | null => {
  const title = findAnalysisTitle()?.textContent?.trim();
  if (!title || !title.startsWith(ANALYSIS_TITLE_PREFIX)) return null;
  return title.slice(ANALYSIS_TITLE_PREFIX.length).trim() || null;
};

const loadTrajectoryDashboard = async (slug: string): Promise<TrajectoryDashboardRow | null> => {
  if (panelCache.has(slug)) return panelCache.get(slug) ?? null;

  const currentInflight = panelInflight.get(slug);
  if (currentInflight) return currentInflight;

  const request = (async () => {
    const params = new URLSearchParams({
      select: DASHBOARD_SELECT,
      scpi_slug: `eq.${slug}`,
      limit: '1',
    });

    try {
      const rows = await selectSupabaseRest<TrajectoryDashboardRow>('scpi_trajectory_pilot_dashboard', params, {
        cacheTtlMs: 5 * 60 * 1000,
      });
      const row = rows[0] ?? null;
      panelCache.set(slug, row);
      return row;
    } catch (error) {
      console.warn('[ComparatorTrajectory] Lecture Supabase indisponible', slug, error);
      panelCache.set(slug, null);
      return null;
    } finally {
      panelInflight.delete(slug);
    }
  })();

  panelInflight.set(slug, request);
  return request;
};

const renderMetricCard = (options: {
  label: string;
  value: string;
  period?: string | null;
  gate?: string | null;
  quality?: string | null;
  delta?: string | null;
  trajectory?: string | null;
  points?: unknown;
  signalEligible?: boolean | null;
}) => {
  const {
    label,
    value,
    period,
    gate,
    quality,
    delta,
    trajectory,
    points,
    signalEligible,
  } = options;
  const gateAllowsDirection = gate === 'PASS' || gate === 'PASS_EVOLUTION';
  const canShowDirection = signalEligible !== false && gateAllowsDirection && Boolean(trajectory);
  const details: string[] = [];

  if (period) details.push(`Période ${escapeHtml(period)}`);
  const pointCount = toNumber(points);
  if (pointCount !== null) details.push(`${pointCount} observation${pointCount > 1 ? 's' : ''}`);

  let statusText = gateLabel(gate);
  if (quality && gate === 'PASS') statusText = humanize(quality);

  const movement = canShowDirection
    ? `<div class="mt-2 text-xs font-semibold text-slate-200">Trajectoire : ${escapeHtml(humanize(trajectory))}${delta ? ` <span class="text-slate-400">(${escapeHtml(delta)})</span>` : ''}</div>`
    : `<div class="mt-2 text-xs text-slate-400">Aucun signal directionnel publié${gate ? ` — ${escapeHtml(gateLabel(gate))}` : ''}.</div>`;

  return `
    <div class="rounded-lg border border-slate-700 bg-slate-800/55 p-4 min-h-[156px]">
      <div class="text-[11px] uppercase tracking-wide text-slate-500">${escapeHtml(label)}</div>
      <div class="mt-1 text-xl font-bold text-white">${escapeHtml(value)}</div>
      <div class="mt-2 inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${gateClass(gate)}">${escapeHtml(statusText)}</div>
      ${movement}
      ${details.length > 0 ? `<div class="mt-2 text-[10px] text-slate-500">${details.join(' • ')}</div>` : ''}
    </div>`;
};

const renderLiquidityCard = (row: TrajectoryDashboardRow) => {
  const pressure = toNumber(row.liquidity_pressure_pct);
  const pending = toNumber(row.retrait_attente_pct);
  const value = pressure !== null
    ? `${formatValue(pressure, '%', 2)} de pression`
    : pending !== null
      ? `${formatValue(pending, '%', 2)} en attente`
      : humanize(row.niveau_liquidite);

  const details: string[] = [];
  if (row.liquidity_period) details.push(`Période ${escapeHtml(row.liquidity_period)}`);
  if (row.liquidity_basis) details.push(`Base ${escapeHtml(humanize(row.liquidity_basis))}`);
  const points = toNumber(row.liquidity_points);
  if (points !== null) details.push(`${points} observation${points > 1 ? 's' : ''}`);

  let signalText = 'Aucun signal directionnel publié.';
  if (row.liquidity_regime_changed || row.liquidity_gate === 'PASS_PENDING_REGIME') {
    signalText = 'Rupture de régime détectée : la comparaison avec l’ancienne série est neutralisée.';
  } else if (row.liquidity_gate === 'PASS_STALE') {
    signalText = `Dernière donnée connue${row.liquidity_period ? ` (${escapeHtml(row.liquidity_period)})` : ''} : signal de tendance neutralisé car non frais.`;
  } else if (row.liquidity_signal_eligible && row.liquidity_gate === 'PASS') {
    signalText = `Trajectoire : ${escapeHtml(humanize(row.trajectoire_liquidite))}.`;
  } else if (row.liquidity_gate === 'PASS_LIMITED') {
    signalText = 'Niveau observable, mais historique insuffisant pour publier une trajectoire.';
  } else if (row.liquidity_gate === 'PASS_NO_DATA') {
    signalText = 'Donnée de liquidité non documentée : aucun signal n’est publié.';
  }

  return `
    <div class="rounded-lg border border-slate-700 bg-slate-800/55 p-4 min-h-[156px]">
      <div class="text-[11px] uppercase tracking-wide text-slate-500">Liquidité</div>
      <div class="mt-1 text-xl font-bold text-white">${escapeHtml(value)}</div>
      <div class="mt-1 text-xs text-slate-400">Niveau : ${escapeHtml(humanize(row.niveau_liquidite))}</div>
      <div class="mt-2 inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${gateClass(row.liquidity_gate)}">${escapeHtml(gateLabel(row.liquidity_gate))}</div>
      <div class="mt-2 text-xs text-slate-300">${signalText}</div>
      ${details.length > 0 ? `<div class="mt-2 text-[10px] text-slate-500">${details.join(' • ')}</div>` : ''}
    </div>`;
};

const renderMarketSignals = (row: TrajectoryDashboardRow) => {
  const signals: string[] = [];

  if (row.tof_signal_eligible && row.tof_gate === 'PASS') {
    signals.push(`<strong>TOF :</strong> ${escapeHtml(humanize(row.trajectoire_tof))}, niveau ${escapeHtml(humanize(row.niveau_tof))}.`);
  } else {
    signals.push(`<strong>TOF :</strong> aucun signal directionnel publié — ${escapeHtml(gateLabel(row.tof_gate))}.`);
  }

  if (row.liquidity_regime_changed || row.liquidity_gate === 'PASS_PENDING_REGIME') {
    signals.push('<strong>Liquidité :</strong> rupture de régime détectée ; l’ancienne série n’est pas prolongée artificiellement.');
  } else if (row.liquidity_gate === 'PASS_STALE') {
    signals.push(`<strong>Liquidité :</strong> dernière donnée connue ${escapeHtml(row.liquidity_period || '')}; tendance neutralisée car la donnée n’est plus fraîche.`);
  } else if (row.liquidity_signal_eligible && row.liquidity_gate === 'PASS') {
    signals.push(`<strong>Liquidité :</strong> ${escapeHtml(humanize(row.trajectoire_liquidite))}, niveau ${escapeHtml(humanize(row.niveau_liquidite))}.`);
  } else if (row.liquidity_gate === 'PASS_LIMITED') {
    signals.push('<strong>Liquidité :</strong> niveau observable, mais profondeur historique insuffisante pour une trajectoire.');
  } else {
    signals.push(`<strong>Liquidité :</strong> aucun signal directionnel publié — ${escapeHtml(gateLabel(row.liquidity_gate))}.`);
  }

  const valuationGates = [
    ['Prix de souscription', row.subscription_value_gate],
    ['Valeur de reconstitution', row.reconstitution_gate],
    ['Valeur de réalisation', row.realization_gate],
    ['Endettement', row.debt_gate],
  ] as const;

  const levelOnly = valuationGates
    .filter(([, gate]) => gate === 'PASS_LEVEL_ONLY')
    .map(([label]) => label.toLowerCase());
  if (levelOnly.length > 0) {
    signals.push(`<strong>Valorisation :</strong> ${escapeHtml(levelOnly.join(', '))} — niveau certifié, mais pas assez d’historique comparable pour publier une trajectoire.`);
  }

  const missing = valuationGates
    .filter(([, gate]) => gate === 'NO_DATA' || gate === 'PASS_NO_DATA')
    .map(([label]) => label.toLowerCase());
  if (missing.length > 0) {
    signals.push(`<strong>Données absentes :</strong> ${escapeHtml(missing.join(', '))} — aucun signal n’est extrapolé.`);
  }

  if (row.market_signal_gate === 'PASS_LIMITED') {
    signals.push('<strong>Lecture globale :</strong> signaux du marché publiés avec profondeur limitée.');
  } else if (row.market_signal_gate === 'PASS') {
    signals.push('<strong>Lecture globale :</strong> contrôle sémantique validé ; seuls les signaux autorisés par les gates sont affichés.');
  } else {
    signals.push(`<strong>Lecture globale :</strong> ${escapeHtml(gateLabel(row.market_signal_gate))}.`);
  }

  return signals
    .map((signal) => `<li class="flex gap-3 text-sm leading-relaxed text-slate-300"><span class="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400"></span><span>${signal}</span></li>`)
    .join('');
};

const createTrajectoryPanel = (row: TrajectoryDashboardRow, scpiName: string): HTMLElement => {
  const wrapper = document.createElement('div');
  wrapper.className = 'px-6 pb-6';
  wrapper.setAttribute(TRAJECTORY_PANEL_ATTR, row.scpi_slug);

  const tofDelta = row.tof_signal_eligible && row.tof_gate === 'PASS'
    ? formatDelta(row.delta_last_obs, ' pt')
    : null;

  const subscriptionDelta = row.subscription_value_gate === 'PASS' || row.subscription_value_gate === 'PASS_EVOLUTION'
    ? formatDelta(row.prix_souscription_delta_last, ' €')
    : null;
  const reconstitutionDelta = row.reconstitution_gate === 'PASS' || row.reconstitution_gate === 'PASS_EVOLUTION'
    ? formatDelta(row.prix_reconstitution_delta_last, ' €')
    : null;
  const realizationDelta = row.realization_gate === 'PASS' || row.realization_gate === 'PASS_EVOLUTION'
    ? formatDelta(row.valeur_realisation_delta_last, ' €')
    : null;
  const debtDelta = row.debt_gate === 'PASS' || row.debt_gate === 'PASS_EVOLUTION'
    ? formatDelta(row.endettement_delta_last, ' pt')
    : null;

  wrapper.innerHTML = `
    <div class="rounded-xl border border-slate-700 bg-slate-900/45 p-5 sm:p-6 shadow-lg">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 class="text-lg sm:text-xl font-bold text-white">Analyse et trajectoire</h3>
          <p class="mt-1 text-xs text-slate-400">Lecture historique certifiée de ${escapeHtml(scpiName)}. Les tendances non suffisamment documentées sont explicitement neutralisées.</p>
        </div>
        <div class="inline-flex rounded-lg border border-slate-700 bg-slate-800/70 p-1" role="tablist" aria-label="Trajectoire et signaux du marché">
          <button type="button" data-trajectory-tab="trajectory" class="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white" aria-selected="true">Trajectoire</button>
          <button type="button" data-trajectory-tab="signals" class="rounded-md px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white" aria-selected="false">Signaux du marché</button>
        </div>
      </div>

      <div data-trajectory-view="trajectory" class="mt-5">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          ${renderMetricCard({
            label: 'TOF',
            value: formatValue(row.tof, '%', 2),
            period: row.latest_period,
            gate: row.tof_gate,
            trajectory: row.trajectoire_tof,
            points: row.tof_points,
            signalEligible: row.tof_signal_eligible,
            delta: tofDelta,
          })}
          ${renderLiquidityCard(row)}
          ${renderMetricCard({
            label: 'Prix de souscription',
            value: formatValue(row.prix_souscription_known, ' €', 2),
            period: row.prix_souscription_period,
            gate: row.subscription_value_gate,
            quality: row.prix_souscription_quality,
            trajectory: row.prix_souscription_quality === 'trajectory' || row.prix_souscription_quality === 'evolution' ? 'évolution du prix' : null,
            points: row.prix_souscription_points,
            signalEligible: row.subscription_value_gate === 'PASS' || row.subscription_value_gate === 'PASS_EVOLUTION',
            delta: subscriptionDelta,
          })}
          ${renderMetricCard({
            label: 'Valeur de reconstitution',
            value: formatValue(row.prix_reconstitution_known, ' €', 2),
            period: row.prix_reconstitution_period,
            gate: row.reconstitution_gate,
            quality: row.prix_reconstitution_quality,
            trajectory: row.prix_reconstitution_quality === 'trajectory' || row.prix_reconstitution_quality === 'evolution' ? 'évolution de la valeur' : null,
            points: row.prix_reconstitution_points,
            signalEligible: row.reconstitution_gate === 'PASS' || row.reconstitution_gate === 'PASS_EVOLUTION',
            delta: reconstitutionDelta,
          })}
          ${renderMetricCard({
            label: 'Valeur de réalisation',
            value: formatValue(row.valeur_realisation_known, ' €', 2),
            period: row.valeur_realisation_period,
            gate: row.realization_gate,
            quality: row.valeur_realisation_quality,
            trajectory: row.valeur_realisation_quality === 'trajectory' || row.valeur_realisation_quality === 'evolution' ? 'évolution de la valeur' : null,
            points: row.valeur_realisation_points,
            signalEligible: row.realization_gate === 'PASS' || row.realization_gate === 'PASS_EVOLUTION',
            delta: realizationDelta,
          })}
          ${renderMetricCard({
            label: 'Endettement',
            value: formatValue(row.endettement_known, '%', 2),
            period: row.endettement_period,
            gate: row.debt_gate,
            quality: row.endettement_quality,
            trajectory: row.endettement_quality === 'trajectory' || row.endettement_quality === 'evolution' ? 'évolution de l’endettement' : null,
            points: row.endettement_points,
            signalEligible: row.debt_gate === 'PASS' || row.debt_gate === 'PASS_EVOLUTION',
            delta: debtDelta,
          })}
        </div>
        <div class="mt-4 rounded-lg border border-slate-700 bg-slate-800/35 px-4 py-3 text-xs text-slate-400">
          Règle MaximusSCPI : <strong class="text-slate-200">niveau observé ≠ trajectoire</strong>. Un statut « niveau seul », « stale », « historique limité » ou « rupture de régime » interdit l’affichage d’une tendance directionnelle.
        </div>
      </div>

      <div data-trajectory-view="signals" class="mt-5 hidden">
        <div class="mb-4 flex flex-wrap gap-2">
          <span class="rounded-full border px-3 py-1 text-xs font-semibold ${gateClass(row.data_gate)}">Données : ${escapeHtml(gateLabel(row.data_gate))}</span>
          <span class="rounded-full border px-3 py-1 text-xs font-semibold ${gateClass(row.semantic_gate)}">Sémantique : ${escapeHtml(gateLabel(row.semantic_gate))}</span>
          <span class="rounded-full border px-3 py-1 text-xs font-semibold ${gateClass(row.market_signal_gate)}">Marché : ${escapeHtml(gateLabel(row.market_signal_gate))}</span>
        </div>
        <ul class="space-y-3">${renderMarketSignals(row)}</ul>
      </div>
    </div>`;

  const buttons = Array.from(wrapper.querySelectorAll<HTMLButtonElement>('[data-trajectory-tab]'));
  const views = Array.from(wrapper.querySelectorAll<HTMLElement>('[data-trajectory-view]'));
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const tab = button.dataset.trajectoryTab;
      buttons.forEach((candidate) => {
        const active = candidate === button;
        candidate.setAttribute('aria-selected', active ? 'true' : 'false');
        candidate.classList.toggle('bg-emerald-600', active);
        candidate.classList.toggle('text-white', active);
        candidate.classList.toggle('text-slate-300', !active);
      });
      views.forEach((view) => view.classList.toggle('hidden', view.dataset.trajectoryView !== tab));
    });
  });

  return wrapper;
};

const ensureTrajectoryPanel = async () => {
  if (typeof document === 'undefined') return;

  const scpiName = getAnalysisScpiName();
  if (!scpiName) return;

  const slug = createSlugFromName(scpiName);
  if (!slug) return;

  const existing = document.querySelector<HTMLElement>(`[${TRAJECTORY_PANEL_ATTR}="${slug}"]`);
  if (existing) return;

  const radarBlock = getRadarBlocks()[0];
  if (!radarBlock || !radarBlock.isConnected) return;

  const row = await loadTrajectoryDashboard(slug);
  if (!row) return;

  const stillOpenName = getAnalysisScpiName();
  if (!stillOpenName || createSlugFromName(stillOpenName) !== slug) return;
  if (document.querySelector(`[${TRAJECTORY_PANEL_ATTR}="${slug}"]`)) return;

  const panel = createTrajectoryPanel(row, scpiName);
  const insertionAnchor = radarBlock.parentElement instanceof HTMLElement ? radarBlock.parentElement : radarBlock;
  insertionAnchor.insertAdjacentElement('afterend', panel);
};

export const normalizeComparatorRadarUx = () => {
  if (typeof window === 'undefined') return;

  getRadarBlocks().forEach((block) => {
    replaceLeafText(block);
    applyMobileLayoutFix(block);
  });
};

export const observeComparatorRadarUx = () => {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') {
    return () => undefined;
  }

  let frame: number | null = null;
  const schedule = () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = null;
      normalizeComparatorRadarUx();
      void ensureTrajectoryPanel();
    });
  };

  schedule();

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  window.addEventListener('resize', schedule);

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', schedule);
    if (frame !== null) cancelAnimationFrame(frame);
  };
};
