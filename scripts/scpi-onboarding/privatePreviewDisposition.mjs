// Generic candidate preview lifecycle: an already-published candidate must not
// block future onboarding CI or be re-injected into the public JSON.
const slug = name => String(name || '').toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export function privatePreviewDisposition(cohort, catalog, candidateSlug) {
  const slugs=cohort?.slugs;
  if (!Array.isArray(slugs)||!Number.isSafeInteger(cohort.count)||
      cohort.count!==slugs.length||new Set(slugs).size!==slugs.length||
      !Array.isArray(catalog)||!candidateSlug) {
    throw Error('INVALID_PUBLIC_COHORT_OR_CATALOG');
  }
  const matches=catalog.filter(item=>slug(item?.['Nom SCPI'])===candidateSlug);
  const inCohort=slugs.includes(candidateSlug);
  if (matches.length>1 || (matches.length===1)!==inCohort) {
    throw Error('CANDIDATE_COHORT_CATALOG_MISMATCH');
  }
  if (inCohort) {
    const row=matches[0];
    const certified=row?.maximus_publication_status==='certified' ||
      row?.maximus_certification?.release_ready===true;
    if (!certified)throw Error('UNVERIFIED_PUBLIC_CANDIDATE');
    return 'ALREADY_PUBLIC_SKIPPED';
  }
  return 'PRIVATE_BROWSER_REQUIRED';
}
