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
/**
 * Demi-hauteur d'un libellé déplacé, rendu avec `dominantBaseline="middle"`.
 * À 11 px, la boîte de texte fait une douzaine de pixels de haut.
 */
export const RADAR_TICK_HALF_HEIGHT = 7;
/** Écart vertical appliqué à un libellé recentré pour ne pas toucher le polygone. */
export const RADAR_TICK_VERTICAL_OFFSET = 20;

/**
 * Contient une ordonnée de libellé dans le cadre vertical du SVG.
 * Sans hauteur mesurée, la valeur d'origine est restituée telle quelle.
 */
function clampTickY(y: number, containerHeight: number): number {
  if (!(containerHeight > 0)) return y;
  const min = RADAR_TICK_PADDING + RADAR_TICK_HALF_HEIGHT;
  const max = containerHeight - RADAR_TICK_PADDING - RADAR_TICK_HALF_HEIGHT;
  if (max < min) return containerHeight / 2;
  return Math.max(min, Math.min(y, max));
}

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
  // Un libellé recentré au milieu de son axe chevauchait le polygone :
  // on l'écarte du côté où il se trouve déjà, puis on le garde dans le cadre.
  const verticalOffset =
    containerHeight > 0 && y < containerHeight / 2
      ? -RADAR_TICK_VERTICAL_OFFSET
      : RADAR_TICK_VERTICAL_OFFSET;

  return {
    x: clampedX,
    y: clampTickY(y + verticalOffset, containerHeight),
    textAnchor: 'middle',
    moved: true,
  };
}
