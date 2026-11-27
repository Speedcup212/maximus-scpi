import { describe, expect, it } from 'vitest';
import {
  RADAR_TICK_CHAR_WIDTH,
  RADAR_TICK_PADDING,
  resolveRadarTickLayout,
} from '../utils/radarTickLayout';

const LABELS = [
  'Rendement 100',
  'Liquidité 60',
  'Diversif. 80',
  'Secteurs 100',
  'Géographie 100',
  'Concentration 100',
];

const measure = (label: string) => label.length * RADAR_TICK_CHAR_WIDTH;

const leftEdge = (layout: { x: number; textAnchor: string }, label: string) => {
  const width = measure(label);
  if (layout.textAnchor === 'end') return layout.x - width;
  if (layout.textAnchor === 'middle') return layout.x - width / 2;
  return layout.x;
};

/**
 * Reproduit la géométrie réelle de Recharts : six sommets répartis sur un
 * hexagone, libellés posés sur le sommet. C'est là que « Concentration »
 * sortait du cadre avant correction.
 */
const hexagonTicks = (containerWidth: number, containerHeight: number) => {
  const cx = containerWidth / 2;
  const cy = containerHeight / 2;
  const radius = Math.min(cx, cy) * 0.82;
  return LABELS.map((label, index) => {
    const angle = (Math.PI * 2 * index) / LABELS.length - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    const cos = Math.cos(angle);
    const textAnchor = Math.abs(cos) < 0.01 ? 'middle' : cos > 0 ? 'start' : 'end';
    return { label, x, y, textAnchor };
  });
};

describe('libellés du radar de sélection contenus dans le cadre', () => {
  it('garde chaque libellé dans les bornes du SVG quelle que soit la largeur', () => {
    // Largeurs réellement atteignables : la modale n'est montée qu'à partir de lg (1024 px).
    const sizes: Array<[number, number]> = [
      [399, 320],
      [640, 320],
      [900, 320],
      [1200, 320],
      [1600, 320],
    ];

    for (const [containerWidth, containerHeight] of sizes) {
      for (const tick of hexagonTicks(containerWidth, containerHeight)) {
        const layout = resolveRadarTickLayout({
          ...tick,
          containerWidth,
          containerHeight,
        });
        const left = leftEdge(layout, tick.label);
        const right = left + measure(tick.label);
        expect(left).toBeGreaterThanOrEqual(-0.001);
        expect(right).toBeLessThanOrEqual(containerWidth + 0.001);
      }
    }
  });

  it('déplace « Concentration » qui débordait à gauche sans correction', () => {
    const [containerWidth, containerHeight] = [399, 320];
    const tick = hexagonTicks(containerWidth, containerHeight).find(
      t => t.label === 'Concentration 100',
    )!;

    // Sans correction, le libellé sort du cadre : c'est le défaut signalé.
    const naiveLeft = leftEdge(tick, tick.label);
    expect(naiveLeft).toBeLessThan(0);

    const layout = resolveRadarTickLayout({ ...tick, containerWidth, containerHeight });
    expect(layout.moved).toBe(true);
    expect(leftEdge(layout, tick.label)).toBeGreaterThanOrEqual(RADAR_TICK_PADDING);
  });

  it('laisse intact un libellé qui tient déjà dans le cadre', () => {
    const tick = { label: 'Secteurs 100', x: 200, y: 300, textAnchor: 'middle' };
    const layout = resolveRadarTickLayout({
      ...tick,
      containerWidth: 1200,
      containerHeight: 320,
    });
    expect(layout).toEqual({ x: 200, y: 300, textAnchor: 'middle', moved: false });
  });

  it('restitue le rendu Recharts tant que la largeur n’est pas mesurée', () => {
    const layout = resolveRadarTickLayout({
      label: 'Concentration 100',
      x: -50,
      y: 100,
      textAnchor: 'end',
      containerWidth: 0,
      containerHeight: 0,
    });
    expect(layout).toEqual({ x: -50, y: 100, textAnchor: 'end', moved: false });
  });

  it('écarte verticalement un libellé recentré pour ne pas toucher le polygone', () => {
    const top = resolveRadarTickLayout({
      label: 'Concentration 100',
      x: 0,
      y: 10,
      textAnchor: 'end',
      containerWidth: 399,
      containerHeight: 320,
    });
    const bottom = resolveRadarTickLayout({
      label: 'Concentration 100',
      x: 0,
      y: 300,
      textAnchor: 'end',
      containerWidth: 399,
      containerHeight: 320,
    });
    expect(top.y).toBe(-10);
    expect(bottom.y).toBe(320);
    expect(top.textAnchor).toBe('middle');
    expect(bottom.textAnchor).toBe('middle');
  });

  it('ne modifie jamais les scores affichés par les libellés', () => {
    for (const [containerWidth, containerHeight] of [[399, 320], [1200, 320]] as Array<[number, number]>) {
      for (const tick of hexagonTicks(containerWidth, containerHeight)) {
        const layout = resolveRadarTickLayout({ ...tick, containerWidth, containerHeight });
        // La fonction ne renvoie aucune donnée métier : seul le placement change.
        expect(Object.keys(layout).sort()).toEqual(['moved', 'textAnchor', 'x', 'y']);
        expect(tick.label).toMatch(/^(Rendement|Liquidité|Diversif\.|Secteurs|Géographie|Concentration) \d+$/);
      }
    }
  });
});
