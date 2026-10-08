export type SurveillanceSignalLevel = 'critical' | 'watch' | 'info' | 'clear';
export type SurveillanceSignalKind = 'liquidity' | 'tof' | 'valuation' | 'debt' | 'structure';
export type SurveillanceStatus = SurveillanceSignalLevel | 'pending';

export type SurveillanceDashboardRow = {
  scpi_slug: string;
  latest_period: string | null;
  tof: number | string | null;
  niveau_tof: string | null;
  trajectoire_tof: string | null;
  delta_4obs: number | string | null;
  niveau_liquidite: string | null;
  trajectoire_liquidite: string | null;
  liquidity_basis: string | null;
  liquidity_pressure_pct: number | string | null;
  retrait_attente_pct: number | string | null;
  liquidity_regime_changed: boolean | null;
  liquidity_signal_certification: string | null;
  endettement: number | string | null;
  endettement_delta_last: number | string | null;
  prix_souscription: number | string | null;
  prix_reconstitution: number | string | null;
  prix_souscription_delta_last?: number | string | null;
  tof_gate: string | null;
  tof_signal_eligible: boolean | null;
  liquidity_gate: string | null;
  liquidity_signal_eligible: boolean | null;
  reconstitution_gate: string | null;
  debt_gate: string | null;
  market_signal_gate: string | null;
  data_gate: string | null;
};

export type SurveillanceSignal = {
  kind: SurveillanceSignalKind;
  level: Exclude<SurveillanceSignalLevel, 'clear'>;
  title: string;
  detail: string;
};

export const SURVEILLANCE_DASHBOARD_SELECT = [
  'scpi_slug',
  'latest_period',
  'tof',
  'niveau_tof',
  'trajectoire_tof',
  'delta_4obs',
  'niveau_liquidite',
  'trajectoire_liquidite',
  'liquidity_basis',
  'liquidity_pressure_pct',
  'retrait_attente_pct',
  'liquidity_regime_changed',
  'liquidity_signal_certification',
  'endettement',
  'endettement_delta_last',
  'prix_souscription',
  'prix_reconstitution',
  'prix_souscription_delta_last',
  'tof_gate',
  'tof_signal_eligible',
  'liquidity_gate',
  'liquidity_signal_eligible',
  'reconstitution_gate',
  'debt_gate',
  'market_signal_gate',
  'data_gate',
].join(',');

export const toSurveillanceNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Référentiel commun : classification descriptive du NIVEAU d'occupation,
 * sans tirer de conclusion de risque à partir de la pente seule.
 * Seuils éditoriaux MaximusSCPI, non réglementaires.
 */
export type TofOccupationTier = 'eleve' | 'satisfaisant' | 'fragile' | 'faible' | 'critique' | 'inconnu';
export const classifyTofOccupation = (value: unknown): TofOccupationTier => {
  const tof = toSurveillanceNumber(value);
  if (tof === null || tof < 0 || tof > 100) return 'inconnu';
  if (tof >= 95) return 'eleve';
  if (tof >= 90) return 'satisfaisant';
  if (tof >= 85) return 'fragile';
  if (tof >= 80) return 'faible';
  return 'critique';
};

export const surveillanceGatePass = (value?: string | null) => Boolean(value?.startsWith('PASS'));

export const formatSurveillanceNumber = (
  value: number | null,
  suffix = '',
  digits = 2,
) =>
  value === null
    ? 'N.D.'
    : `${value.toLocaleString('fr-FR', { maximumFractionDigits: digits })}${suffix}`;

export const surveillanceLevelFromSignals = (
  signals: SurveillanceSignal[],
): SurveillanceSignalLevel => {
  if (signals.some((signal) => signal.level === 'critical')) return 'critical';
  if (signals.some((signal) => signal.level === 'watch')) return 'watch';
  if (signals.some((signal) => signal.level === 'info')) return 'info';
  return 'clear';
};

export const buildSurveillanceSignals = (
  row: SurveillanceDashboardRow,
): SurveillanceSignal[] => {
  const signals: SurveillanceSignal[] = [];
  const tof = toSurveillanceNumber(row.tof);
  const tofDelta = toSurveillanceNumber(row.delta_4obs);

  // Le NIVEAU du TOF prime sur la pente. Une baisse à 94 % relève du
  // suivi informatif, jamais d'une alerte d'occupation à elle seule.
  // Seuils internes d'interprétation (non réglementaires).
  const tofTier = classifyTofOccupation(tof);
  const tofEligible = Boolean(row.tof_signal_eligible && surveillanceGatePass(row.tof_gate)) &&
    tofTier !== 'inconnu';
  const tofTrendBad = tofEligible &&
    (row.trajectoire_tof === 'baisse' || row.trajectoire_tof === 'baisse_forte');
  const tofLevelBad = tofEligible &&
    (tofTier === 'fragile' || tofTier === 'faible' || tofTier === 'critique');
  const tofVeryWeak = tofEligible && (tofTier === 'faible' || tofTier === 'critique');
  const tofExtreme = tofEligible && (tofTier === 'critique' ||
    (tofVeryWeak && row.trajectoire_tof === 'baisse_forte'));

  const liquidityBasis = row.liquidity_basis || '';
  const regimeSuppressed =
    Boolean(row.liquidity_regime_changed) ||
    row.liquidity_signal_certification === 'suppressed_regime_change_pending_data';

  if (regimeSuppressed) {
    signals.push({
      kind: 'structure',
      level: 'info',
      title: 'Changement de régime de liquidité',
      detail:
        'Le signal de liquidité est neutralisé tant que les observations du nouveau régime ne sont pas comparables.',
    });
  }

  const liquidityLevel = row.niveau_liquidite;
  const liquidityTrend = row.trajectoire_liquidite;
  const liquidityEligible =
    Boolean(row.liquidity_signal_eligible && surveillanceGatePass(row.liquidity_gate)) &&
    !regimeSuppressed;
  const liquidityBad =
    liquidityEligible &&
    (
      liquidityLevel === 'tension_significative' ||
      liquidityLevel === 'tension_forte' ||
      liquidityLevel === 'tension_forte_secondaire' ||
      liquidityLevel === 'tension_tres_forte' ||
      liquidityTrend === 'deterioration' ||
      liquidityTrend === 'deterioration_forte'
    );
  const liquidityExtreme = liquidityEligible && liquidityLevel === 'tension_tres_forte';

  const debt = toSurveillanceNumber(row.endettement);
  const debtDelta = toSurveillanceNumber(row.endettement_delta_last);
  const debtBad = surveillanceGatePass(row.debt_gate) && debt !== null && debt >= 30;
  const debtExtreme = surveillanceGatePass(row.debt_gate) && debt !== null && debt >= 40;

  const criticalContext =
    liquidityExtreme ||
    tofExtreme ||
    (liquidityBad && tofLevelBad && tofTrendBad) ||
    (debtExtreme && (tofLevelBad || liquidityBad));

  if (tofEligible && (tofLevelBad || tofTrendBad)) {
    const tofCritical =
      tofExtreme ||
      (tofLevelBad && liquidityBad && tofTrendBad) ||
      (tofVeryWeak && debtExtreme && tofTrendBad);
    const level: SurveillanceSignal['level'] =
      tofCritical ? 'critical' : tofLevelBad ? 'watch' : 'info';
    const parts = [
      tof !== null ? `TOF ${formatSurveillanceNumber(tof, ' %')}` : null,
      tofDelta !== null
        ? `évolution sur 4 observations ${tofDelta > 0 ? '+' : ''}${formatSurveillanceNumber(tofDelta, ' pt')}`
        : null,
    ].filter(Boolean);
    const interpretation = tof! >= 90
      ? 'Niveau d’occupation satisfaisant. Recul à suivre, sans alerte de risque fondée sur le seul TOF.'
      : tof! >= 85
        ? 'Niveau d’occupation fragile : vigilance justifiée.'
        : 'Occupation faible : vigilance renforcée.';

    signals.push({
      kind: 'tof',
      level,
      title: level === 'info' ? 'Occupation satisfaisante — tendance en baisse'
        : level === 'critical' ? 'Occupation sous vigilance forte' : 'Occupation à surveiller',
      detail: `${parts.join(' · ')} · ${interpretation}`,
    });
  }

  if (liquidityBad) {
    const isSecondary = liquidityBasis.startsWith('secondary_market_order_book');
    const metric = toSurveillanceNumber(
      isSecondary ? row.liquidity_pressure_pct : row.retrait_attente_pct,
    );
    const liquidityCritical =
      criticalContext &&
      (
        liquidityExtreme ||
        (liquidityBad && tofLevelBad && tofTrendBad) ||
        (debtExtreme && liquidityBad)
      );

    signals.push({
      kind: 'liquidity',
      level: liquidityCritical ? 'critical' : 'watch',
      title: isSecondary
        ? 'Pression sur le marché secondaire'
        : 'Liquidité sous surveillance',
      detail:
        metric === null
          ? 'Signal certifié de liquidité défavorable.'
          : `${isSecondary ? 'Pression secondaire' : 'File de retraits'} : ${formatSurveillanceNumber(metric, ' %', 3)}`,
    });
  }

  const price = toSurveillanceNumber(row.prix_souscription);
  const reconstitution = toSurveillanceNumber(row.prix_reconstitution);
  const comparableValuation =
    surveillanceGatePass(row.reconstitution_gate) &&
    surveillanceGatePass(row.market_signal_gate) &&
    !row.liquidity_regime_changed &&
    !liquidityBasis.startsWith('secondary_market_order_book');

  if (
    comparableValuation &&
    price !== null &&
    reconstitution !== null &&
    reconstitution > 0
  ) {
    const gap = (price / reconstitution - 1) * 100;
    if (Math.abs(gap) >= 10) {
      signals.push({
        kind: 'valuation',
        level: 'watch',
        title: 'Écart de valorisation marqué',
        detail: `Prix / valeur de reconstitution : ${gap > 0 ? '+' : ''}${formatSurveillanceNumber(gap, ' %')}`,
      });
    } else if (Math.abs(gap) >= 5) {
      signals.push({
        kind: 'valuation',
        level: 'info',
        title: 'Écart de valorisation à suivre',
        detail: `Prix / valeur de reconstitution : ${gap > 0 ? '+' : ''}${formatSurveillanceNumber(gap, ' %')}`,
      });
    }
  }

  if (debtBad && debt !== null) {
    const debtCritical =
      criticalContext &&
      debtExtreme &&
      (tofLevelBad || liquidityBad);

    signals.push({
      kind: 'debt',
      level: debtCritical ? 'critical' : 'watch',
      title: debtCritical
        ? 'Endettement élevé avec signal concordant'
        : 'Endettement à surveiller',
      detail: `${formatSurveillanceNumber(debt, ' %')}${
        debtDelta !== null
          ? ` · variation ${debtDelta > 0 ? '+' : ''}${formatSurveillanceNumber(debtDelta, ' pt')}`
          : ''
      }`,
    });
  }

  return signals;
};

export const getSurveillanceStatus = (
  row?: SurveillanceDashboardRow | null,
): SurveillanceStatus => {
  if (!row || !surveillanceGatePass(row.data_gate)) return 'pending';
  return surveillanceLevelFromSignals(buildSurveillanceSignals(row));
};
