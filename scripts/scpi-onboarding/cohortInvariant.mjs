// Immutable minimum membership from the last known 68-fund certified production cohort.
// Future approved funds may be appended, but never at the expense of these identities.
import fs from 'node:fs';
const baseline = JSON.parse(fs.readFileSync(new URL('../../src/data/certified_scpi_baseline_68.json',import.meta.url),'utf8'));
export function cohortIntegrityErrors(cohort, required = baseline) {
  const errors=[];
  const slugs=cohort?.slugs;
  if(!Array.isArray(slugs) || !Number.isSafeInteger(cohort?.count) ||
     cohort.count!==slugs.length || slugs.length!==new Set(slugs).size)
    errors.push('COHORT_COUNT_OR_DUPLICATE_INVALID');
  if(!Array.isArray(required?.slugs) || required.count!==required.slugs.length ||
     new Set(required.slugs).size!==required.count)
    errors.push('BASELINE_INVALID');
  if(Array.isArray(slugs) && Array.isArray(required?.slugs)) {
    const actual=new Set(slugs);
    for(const slug of required.slugs) if(!actual.has(slug)) errors.push('BASELINE_FUND_MISSING:'+slug);
    if(slugs.length<required.count) errors.push('COHORT_SHRUNK');
  }
  return errors;
}
