import { describe, expect, it } from 'vitest';
import {
  canonicalQuarter,
  dominantPublishedQuarter,
  isOlderQuarter,
} from '../utils/scpiPublicationFreshness';

describe('SCPI published-quarter freshness', () => {
  it('detects one outdated SCPI among 61 at the same reference quarter', () => {
    const reference = dominantPublishedQuarter([
      ...Array.from({ length: 60 }, () => '2026-T2'),
      '2026-T1',
    ]);
    expect(reference).toBe('2026-T2');
    expect(isOlderQuarter('2026-T1', reference)).toBe(true);
    expect(isOlderQuarter('2026-T2', reference)).toBe(false);
  });

  it('does not confuse missing or noncanonical periods with an old publication', () => {
    expect(canonicalQuarter('T1 2026')).toBeNull();
    expect(isOlderQuarter(null, '2026-T2')).toBe(false);
    expect(isOlderQuarter('T1 2026', '2026-T2')).toBe(false);
    expect(dominantPublishedQuarter([])).toBeNull();
  });

  it('does not force a reference period when no quarter dominates', () => {
    expect(dominantPublishedQuarter([
      ...Array.from({ length: 35 }, () => '2026-T2'),
      ...Array.from({ length: 26 }, () => '2026-T1'),
    ])).toBeNull();
  });

  it('compares quarters chronologically across year boundaries', () => {
    expect(isOlderQuarter('2025-T4', '2026-T1')).toBe(true);
    expect(isOlderQuarter('2026-T2', '2025-T4')).toBe(false);
  });
});
