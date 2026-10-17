/** Reporting period of an annual financial metric, not the date of a quarterly bulletin. */
export function annualReferenceYear(period: string | null | undefined): number | null {
  const matched = /^(20\d{2})-RA$/.exec(period ?? '');
  return matched ? Number(matched[1]) : null;
}

/** Never deduce an annual year from a shared quarterly source_period field. */
export function distributionYearLabel(period: string | null | undefined): string {
  const year = annualReferenceYear(period);
  return year !== null ? `Taux de distribution ${year}` : 'Taux de distribution';
}

export function distributionYearHelp(period: string | null | undefined): string {
  const year = annualReferenceYear(period);
  return year !== null ? `Taux annuel publié pour ${year} (rapport annuel)` : 'Distribution annuelle (année de référence non indiquée)';
}

export function debtYearHelp(period: string | null | undefined): string {
  const year = annualReferenceYear(period);
  return year !== null ? `Endettement publié au rapport annuel ${year}` : 'Niveau de dette (date de référence non indiquée)';
}

/** This link only comes from a verified public issuer report and is never synthesized. */
export function officialSourceHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password ? url : undefined;
  } catch {
    return undefined;
  }
}
