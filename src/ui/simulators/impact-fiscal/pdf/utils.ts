export const normalizeSpaces = (value: string) => value.replace(/[\u202f\u00a0]/g, ' ');

export const formatInt = (value: number) =>
  normalizeSpaces(
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.abs(value) < 0.5 ? 0 : value)
  );

export const formatEUR = (value: number) => `${formatInt(value)} €`;

export const formatPct = (value: number) =>
  normalizeSpaces(
    new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  ) + ' %';

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(date);
