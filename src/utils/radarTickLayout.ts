/**
 * Positionnement des libellés de l'axe polaire du radar de sélection.
 *
 * Recharts place les libellés exactement sur le sommet de leur axe. Sur un
 * graphique étroit, un libellé long (« Concentration 100 ») dépasse alors du
 * cadre SVG et devient illisible. Cette fonction pure conserve la position
 * Recharts tant que le texte tient, et le ramène à l'intérieur du cadre sinon.
 *
 * Elle ne modifie ni la largeur du radar, ni les données, ni les scores.
 */

export interface RadarTickInput {
  x: number;
  y: number;
  textAnchor: string | null | undefined;
  label: string;
  containerWidth: number;
  containerHeight: number;
}

export interface RadarTickLayout {
  x: number;
  y: number;
  textAnchor: 'start' | 'middle' | 'end';
  moved: boolean;
}

/** Largeur de texte estimée à 11 px semi-gras, volontairement conservatrice. */
export const RADAR_TICK_CHAR_WIDTH = 7;
export const RADAR_TICK_PADDING = 4;

export function resolveRadarTickLayout({
  x,
  y,
  textAnchor,
  label,
  containerWidth,
  containerHeight,
}: RadarTickInput): RadarTickLayout {
  const anchor: RadarTickLayout['textAnchor'] =
    textAnchor === 'end' || textAnchor === 'start' ? textAnchor : 'middle';

  // Sans largeur mesurée, on restitue le rendu Recharts d'origine.
  if (!(containerWidth > 0)) {
    return { x, y, textAnchor: anchor, moved: false };
  }

  const labelWidth = label.length * RADAR_TICK_CHAR_WIDTH;
  const left =
    anchor === 'end' ? x - labelWidth : anchor === 'middle' ? x - labelWidth / 2 : x;
  const right = left + labelWidth;
  const overflows =
    left < RADAR_TICK_PADDING || right > containerWidth - RADAR_TICK_PADDING;

  if (!overflows) {
    return { x, y, textAnchor: anchor, moved: false };
  }

  const halfWidth = labelWidth / 2;
  const clampedX = Math.max(
    halfWidth + RADAR_TICK_PADDING,
    Math.min(x, containerWidth - halfWidth - RADAR_TICK_PADDING),
  );
  // Un libellé recentré au milieu de son axe chevaucherait le polygone :
  // on l'écarte verticalement du côté où il se trouve déjà.
  const verticalOffset = containerHeight > 0 && y < containerHeight / 2 ? -20 : 20;

  return {
    x: clampedX,
    y: y + verticalOffset,
    textAnchor: 'middle',
    moved: true,
  };
}
