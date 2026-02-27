/**
 * Maps a 0-100 score to a 1-5 star rating.
 * Used for display consistency across components that show per-SCPI scores from DB.
 *
 * Rules:
 *   - null/undefined => null
 *   - Input clamped to 0..100
 *   - 0-19 => 1
 *   - 20-39 => 2
 *   - 40-59 => 3
 *   - 60-79 => 4
 *   - 80-100 => 5
 */
export function scoreToStars(score0to100: number | null | undefined): number | null {
  if (score0to100 == null) return null;
  const clamped = Math.max(0, Math.min(100, score0to100));
  if (clamped >= 80) return 5;
  if (clamped >= 60) return 4;
  if (clamped >= 40) return 3;
  if (clamped >= 20) return 2;
  return 1;
}
