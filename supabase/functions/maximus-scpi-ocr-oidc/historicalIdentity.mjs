// Corporate rename resolutions: PAREF Evo (28/06/2024), PAREF Hexa (11/07/2024).
// Only old issuer PDFs, dated before the rename, for the exact legal entity.
export function historicalIssuerIdentityMatches(slug, period, sourceUrl, normalizedText) {
  const aliases = new Map([
    ['paref-evo', 'interpierre europe centrale'],
    ['paref-hexa', 'interpierre france'],
  ]);
  const alias = aliases.get(slug);
  const issue = /^(20\d{2})-(?:T([1-4])|RA)$/.exec(period);
  if (!alias || !issue || !(Number(issue[1]) < 2024 ||
      (Number(issue[1]) === 2024 && issue[2] && Number(issue[2]) <= 2))) return false;
  try {
    const url = new URL(sourceUrl);
    return url.protocol === 'https:' && url.hostname === 'paref-gestion.com' &&
      !url.username && !url.password && (!url.port || url.port === '443') &&
      url.pathname.startsWith('/wp-content/uploads/') && normalizedText.includes(alias);
  } catch { return false; }
}
