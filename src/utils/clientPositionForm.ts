/**
 * Contrôle commun de la saisie de parts SCPI détenues ailleurs.
 * Le formulaire n'est valide que si les quatre champs sont renseignés.
 */
export type ClientPositionFormFields = {
  scpiSlug: string;
  units: string;
  purchasePrice: string;
  purchaseDate: string;
};

export const positivePositionNumber = (input: string): number | null => {
  const trimmed = input.trim();
  if (!/^\d+(?:[.,]\d+)?$/.test(trimmed)) return null;
  const value = Number(trimmed.replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? value : null;
};

export const isValidPurchaseDate = (date: string, todayIso: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > todayIso) return false;
  const time = Date.parse(date + 'T00:00:00Z');
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === date;
};

export const isCompleteClientPosition = (
  fields: ClientPositionFormFields,
  todayIso: string,
): boolean => Boolean(
  fields.scpiSlug.trim() &&
  positivePositionNumber(fields.units) !== null &&
  positivePositionNumber(fields.purchasePrice) !== null &&
  isValidPurchaseDate(fields.purchaseDate, todayIso),
);
