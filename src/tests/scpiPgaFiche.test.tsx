import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { scpiData } from '../data/scpiData';
import certifiedAnnual from '../data/pga_certified_2025.json';
import PgaMetricCard from '../components/PgaMetricCard';
import { mergeScpiWithLiveIndicators } from '../utils/scpiLiveData';
import { getPgaDisplayInfo } from '../utils/scpiPga';

const slug = (name: string) => name.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

describe('PGA visibly present and source-backed in all published SCPI fiches', () => {
  it('renders one explicit annual PGA card for each of the 69 certified-cohort fiches', () => {
    const cohort = new Map(scpiData.map(scpi => [slug(scpi.name), scpi]));
    expect(cohort.size).toBeGreaterThanOrEqual(69);
    for (const scpi of cohort.values()) {
      const markup = renderToStaticMarkup(<PgaMetricCard scpi={scpi} />);
      expect(markup).toContain('data-testid="scpi-pga-metric"');
      expect(markup).toContain('PGA');
      expect(markup).toContain('Performance globale annuelle');
    }
  });

  it('shows sourced annual values (including negative values) and never invents missing ones', () => {
    const bySlug = new Map(scpiData.map(scpi => [slug(scpi.name), scpi]));
    const proven = new Set(certifiedAnnual.map(row => row.slug));
    for (const [key, scpi] of bySlug) {
      const markup = renderToStaticMarkup(<PgaMetricCard scpi={scpi} variant="hero" />);
      if (proven.has(key)) {
        expect(markup).toContain('Publication officielle');
        expect(markup).toContain('PGA 2025');
      } else {
        expect(markup).toContain('Non disponible');
        expect(markup).not.toContain('Publication officielle');
      }
    }
    const novapierre = bySlug.get('novapierre-residentiel')!;
    expect(renderToStaticMarkup(<PgaMetricCard scpi={novapierre} />)).toContain('-41,53');
  });

  it('protects 2025 certified TD/PGA against a conflicting live bulletin value', () => {
    const coeur = scpiData.find(scpi => slug(scpi.name) === 'coeur-de-region')!;
    expect(coeur.yield).toBeCloseTo(6.2);
    const merged = mergeScpiWithLiveIndicators(coeur, {
      scpi_slug: 'coeur-de-region', td: 4.44, td_annee: 2025,
      td_reference_period: null, td_reference_url: null,
    });
    expect(merged.yield).toBeCloseTo(6.2);
    expect(merged.distributionReferencePeriod).toBe('2025-RA');
    expect(getPgaDisplayInfo(merged)).toMatchObject({ available: true, year: 2025, value: 6.2 });
  });

  it('never pairs PGA 2025 with a newer separately documented TD 2026', () => {
    const coeur = scpiData.find(scpi => slug(scpi.name) === 'coeur-de-region')!;
    const merged = mergeScpiWithLiveIndicators(coeur, {
      scpi_slug: 'coeur-de-region', td: 6.5, td_annee: 2026,
      td_reference_period: '2026-RA',
      td_reference_url: 'https://example.org/official-2026.pdf',
    });
    expect(merged.yield).toBe(6.5);
    expect(merged.distributionReferencePeriod).toBe('2026-RA');
    expect(getPgaDisplayInfo(merged).available).toBe(false);
  });
});
