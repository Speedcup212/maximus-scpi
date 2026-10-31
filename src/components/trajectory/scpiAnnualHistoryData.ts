import snapshot from '../../data/scpiAnnualHistory.json';

export interface VerifiedAnnualScpiRow {
  scpi_slug: string;
  fiscal_year: number;
  distribution_totale_par_part: number | null;
  valeur_realisation_par_part: number;
  valeur_reconstitution_par_part: number;
  distribution_basis: string;
  /** Divergence financière conservée, avec arbitrage documentaire explicite. */
  distribution_arbitration?: string | null;
  source_url: string;
  evidence_pages: { distribution: number | null; realisation: number | null; reconstitution: number | null };
}
export interface AnnualHistoryCoverage {
  scpi_slug: string;
  launch_year?: number | null;
  first_fiscal_year?: number | null;
  first_fiscal_year_note?: string | null;
  years_expected: number;
  years_fully_verified: number;
  metrics_missing: number;
  historical_status: string;
  core_historical_ready: boolean;
}
const annualRows = snapshot.rows as VerifiedAnnualScpiRow[];
const annualCoverage = snapshot.coverage as AnnualHistoryCoverage[];
export const getVerifiedAnnualRows = (slug: string): VerifiedAnnualScpiRow[] =>
  annualRows.filter((r) => r.scpi_slug === slug
    && Number.isInteger(r.fiscal_year)
    && (r.distribution_totale_par_part === null || Number.isFinite(r.distribution_totale_par_part))
    && Number.isFinite(r.valeur_realisation_par_part)
    && Number.isFinite(r.valeur_reconstitution_par_part)
    && (r.distribution_totale_par_part === null || (r.evidence_pages?.distribution ?? 0) > 0)
    && r.evidence_pages?.realisation > 0 && r.evidence_pages?.reconstitution > 0
    && /^https:\/\//.test(r.source_url))
    .sort((a,b) => a.fiscal_year-b.fiscal_year);
export const getAnnualHistoryCoverage = (slug: string): AnnualHistoryCoverage | undefined =>
  annualCoverage.find((r) => r.scpi_slug === slug);
