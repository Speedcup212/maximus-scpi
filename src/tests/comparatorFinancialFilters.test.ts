import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import FilterPanel from '../components/fintech/FilterPanel';
import { scpiData } from '../data/scpiData';
import certifiedCohort from '../data/certified_scpi_cohort.json';
import {
  createDefaultComparatorFilters,
  countFinancialFilters,
  matchesComparatorFinancialFilters,
  updateFilterRange,
  type FilterState,
} from '../utils/comparatorFilters';

const fund = {
  capitalization: 100_000_000,
  price: 190,
  valeurReconstitution: 200,
  discountQaStatus: 'publishable' as const,
  debt: 20,
  delaiJouissance: 3,
};
const filters = (overrides: Partial<FilterState> = {}): FilterState => ({
  ...createDefaultComparatorFilters(), ...overrides,
});

describe('comparator financial filters', () => {
  it('preserves the complete certified cohort and missing metrics by default', () => {
    expect(scpiData).toHaveLength(certifiedCohort.slugs.length);
    expect(scpiData.filter(scpi => matchesComparatorFinancialFilters(scpi, filters())))
      .toHaveLength(scpiData.length);
    expect(matchesComparatorFinancialFilters(undefined, filters())).toBe(true);
    expect(countFinancialFilters(filters())).toBe(0);
  });

  it('converts the canonical capitalization in euros to M€ with inclusive bounds', () => {
    expect(matchesComparatorFinancialFilters(fund, filters({ capitalizationRange: [100, 100] }))).toBe(true);
    expect(matchesComparatorFinancialFilters(fund, filters({ capitalizationRange: [100.1, null] }))).toBe(false);
    expect(matchesComparatorFinancialFilters(fund, filters({ capitalizationRange: [null, 99.9] }))).toBe(false);
    expect(matchesComparatorFinancialFilters({ ...fund, capitalization: 1_500_000_000 }, filters({ capitalizationRange: [1500, 1500] }))).toBe(true);
  });

  it.each([undefined, null, Number.NaN, Number.POSITIVE_INFINITY, -1, 0])(
    'excludes missing or invalid capitalization %s only when its filter is active', value => {
      const scpi = { ...fund, capitalization: value };
      expect(matchesComparatorFinancialFilters(scpi, filters())).toBe(true);
      expect(matchesComparatorFinancialFilters(scpi, filters({ capitalizationRange: [0, null] }))).toBe(false);
    },
  );

  it('uses the shared signed discount calculation and inclusive floating point boundaries', () => {
    expect(matchesComparatorFinancialFilters(fund, filters({ discountRange: [-5, -5] }))).toBe(true);
    expect(matchesComparatorFinancialFilters(fund, filters({ discountRange: [0, null] }))).toBe(false);
    const premium = { ...fund, price: 210 };
    expect(matchesComparatorFinancialFilters(premium, filters({ discountRange: [5, 5] }))).toBe(true);
    expect(matchesComparatorFinancialFilters({ ...fund, price: 200 }, filters({ discountRange: [0, 0] }))).toBe(true);
    expect(matchesComparatorFinancialFilters({ ...fund, price: 140 }, filters({ discountRange: [null, -25] }))).toBe(true);
    expect(matchesComparatorFinancialFilters({ ...fund, price: 240 }, filters({ discountRange: [15, null] }))).toBe(true);
  });

  it.each(['manual_review', 'excluded_non_scpi', undefined])(
    'excludes discount without publishable QA (%s)', discountQaStatus => {
      expect(matchesComparatorFinancialFilters({ ...fund, discountQaStatus }, filters({ discountRange: [null, 0] }))).toBe(false);
    },
  );

  it.each([
    { valeurReconstitution: undefined },
    { valeurReconstitution: 0 },
    { valeurReconstitution: Number.NaN },
    { price: 0 },
    { capitalType: 'Capital fixe' },
    { liquidityBasis: 'secondary_market_order_book' },
    { liquidityRegimeChanged: true },
    { reconstitutionGate: 'BLOCKED' },
  ])('respects unavailable valuations and liquidity comparability guards: %j', overrides => {
    const scpi = { ...fund, ...overrides };
    expect(matchesComparatorFinancialFilters(scpi, filters())).toBe(true);
    expect(matchesComparatorFinancialFilters(scpi, filters({ discountRange: [-100, 100] }))).toBe(false);
  });

  it('filters debt at the selected maximum including a genuine zero', () => {
    expect(matchesComparatorFinancialFilters(fund, filters({ maxLtv: 20 }))).toBe(true);
    expect(matchesComparatorFinancialFilters(fund, filters({ maxLtv: 19.9 }))).toBe(false);
    expect(matchesComparatorFinancialFilters({ ...fund, debt: 0 }, filters({ maxLtv: 0 }))).toBe(true);
  });

  it('filters enjoyment delay in months including immediate enjoyment', () => {
    expect(matchesComparatorFinancialFilters(fund, filters({ maxJouissanceMonths: 3 }))).toBe(true);
    expect(matchesComparatorFinancialFilters(fund, filters({ maxJouissanceMonths: 2 }))).toBe(false);
    expect(matchesComparatorFinancialFilters({ ...fund, delaiJouissance: 0 }, filters({ maxJouissanceMonths: 0 }))).toBe(true);
  });

  it.each([undefined, null, Number.NaN, Number.POSITIVE_INFINITY, -1])(
    'never treats missing or invalid debt/delay (%s) as zero', value => {
      expect(matchesComparatorFinancialFilters({ ...fund, debt: value }, filters({ maxLtv: 100 }))).toBe(false);
      expect(matchesComparatorFinancialFilters({ ...fund, delaiJouissance: value }, filters({ maxJouissanceMonths: 12 }))).toBe(false);
    },
  );

  it('combines all four criteria outside expert mode and counts each criterion once', () => {
    const active = filters({
      capitalizationRange: [100, 1000], discountRange: [-10, 0],
      maxLtv: 20, maxJouissanceMonths: 3,
    });
    expect(active.expertMode).toBe(false);
    expect(countFinancialFilters(active)).toBe(4);
    expect(matchesComparatorFinancialFilters(fund, active)).toBe(true);
    for (const override of [{ capitalization: 99_000_000 }, { price: 210 }, { debt: 21 }, { delaiJouissance: 4 }]) {
      expect(matchesComparatorFinancialFilters({ ...fund, ...override }, active)).toBe(false);
    }
    expect(matchesComparatorFinancialFilters(undefined, active)).toBe(false);
  });

  it('keeps ranges ordered without imposing arbitrary limits', () => {
    expect(updateFilterRange([null, null], 0, 100)).toEqual([100, null]);
    expect(updateFilterRange([100, 200], 0, 300)).toEqual([300, 300]);
    expect(updateFilterRange([-15, 10], 1, -25)).toEqual([-25, -25]);
    expect(updateFilterRange([100, 200], 0, null)).toEqual([null, 200]);
    const first = filters();
    first.capitalizationRange[0] = 100;
    expect(filters().capitalizationRange).toEqual([null, null]);
  });
});

type ElementNode = { type: unknown; props: Record<string, any> };
function nodes(root: unknown): ElementNode[] {
  if (Array.isArray(root)) return root.flatMap(nodes);
  if (!root || typeof root !== 'object' || !('props' in root)) return [];
  const node = root as ElementNode;
  if (typeof node.type === 'function') return nodes(node.type(node.props));
  return [node, ...nodes(node.props.children)];
}

describe('shared public and Pro filter panel', () => {
  it('renders all four criteria without expert mode with accessible numeric fields', () => {
    const markup = renderToStaticMarkup(React.createElement(FilterPanel, {
      isOpen: true, onClose: vi.fn(), filters: filters(), onFiltersChange: vi.fn(), resultCount: 68,
    }));
    for (const text of ['Capitalisation (M€)', 'Décote / surcote (%)', 'Endettement maximal (%)', 'Délai de jouissance maximal (mois)']) {
      expect(markup).toContain(text);
    }
    expect(markup).not.toContain('Réserves de distribution (RAN)');
    expect(markup.match(/type="number"/g)).toHaveLength(6);
    expect(markup).toContain('Voir les 68 SCPI');
  });

  it('applies numeric edits, clears bounds and resets all four criteria', () => {
    let state = filters();
    const render = () => nodes(FilterPanel({
      isOpen: true, onClose: vi.fn(), filters: state,
      onFiltersChange: next => { state = next; }, resultCount: 7,
    }));
    const change = (id: string, value: string) => {
      const input = render().find(node => node.props.id === id);
      expect(input).toBeDefined();
      input!.props.onChange({ target: { value } });
    };
    change('capitalization-0', '100');
    change('capitalization-1', '1500');
    change('discount-0', '-10');
    change('discount-1', '5');
    change('max-ltv', '30.5');
    change('max-jouissance', '3');
    expect(state).toMatchObject({ capitalizationRange: [100, 1500], discountRange: [-10, 5], maxLtv: 30.5, maxJouissanceMonths: 3 });
    change('max-ltv', '0');
    expect(state.maxLtv).toBe(0);
    change('max-ltv', '');
    expect(state.maxLtv).toBeNull();
    expect(countFinancialFilters(state)).toBe(3);
    render().find(node => node.type === 'button' && node.props.children === 'Réinitialiser')!.props.onClick();
    expect(state).toEqual(filters());
    expect(countFinancialFilters(state)).toBe(0);
  });
});
