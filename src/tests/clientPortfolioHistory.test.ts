import { describe, expect, it } from 'vitest';
import { buildHistoricalPortfolioTof, type HistoricalTofRow } from '../utils/clientPortfolioHistory';
const holdings = [
  { slug: 'log-in', currentValue: 2295 },
  { slug: 'coeur-d-europe', currentValue: 1795 },
];
const row = (slug: string, period: string, tof: number, qa_status = 'manual_verified_official_tof'): HistoricalTofRow => ({
  scpi_slug: slug, source_period: period, tof, qa_status, source_url: 'https://societe-de-gestion.example/bulletin.pdf',
});
describe('historique client sur bulletins qualifiés', () => {
  it('pondère le TOF par la valeur actuelle des positions', () => {
    const result = buildHistoricalPortfolioTof([
      row('log-in', '2026-T1', 99), row('coeur-d-europe', '2026-T1', 95.02),
      row('log-in', '2026-T2', 100), row('coeur-d-europe', '2026-T2', 94.31),
    ], holdings);
    expect(result).toHaveLength(2);
    expect(result[0].tof).toBeCloseTo((2295 * 99 + 1795 * 95.02) / 4090);
    expect(result[1].tof).toBeCloseTo((2295 * 100 + 1795 * 94.31) / 4090);
    expect(result[1].coveragePercent).toBe(100);
  });
  it('n’affiche pas les périodes où la couverture est insuffisante', () => {
    expect(buildHistoricalPortfolioTof([row('log-in', '2026-T2', 100)], holdings)).toEqual([]);
  });
  it('écarte QA invalide, format non canonique, source manquante et valeurs impossibles', () => {
    const r = row('log-in', '2026-T2', 100);
    const invalids: HistoricalTofRow[] = [
      {...r, qa_status:'invalid_duplicate_noncanonical_period'},
      {...r, source_period:'T2 2026'},
      {...r, source_url:null},
      {...r, tof:120},
    ];
    expect(buildHistoricalPortfolioTof(invalids, [holdings[0]])).toEqual([]);
  });
  it('n’additionne pas deux valeurs contradictoires pour une SCPI et une période', () => {
    const result = buildHistoricalPortfolioTof([
      row('log-in','2026-T2',100),
      row('log-in','2026-T2',90),
      row('coeur-d-europe','2026-T2',94.31),
    ], holdings,40);
    expect(result).toHaveLength(1);
    expect(result[0].coveredCount).toBe(1);
    expect(result[0].tof).toBeCloseTo(94.31);
  });
  it('ignore les SCPI étrangères au portefeuille', () => {
    const result = buildHistoricalPortfolioTof([row('autre','2026-T2',80)], holdings);
    expect(result).toEqual([]);
  });
});
