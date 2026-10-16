// Reconstitution is now an official issuer HTML announcement (not a 2025 PDF).
// Financial values are verified again from Supabase at RELEASE, not accepted from
// this local snapshot alone. This is a narrow provenance parser, not a QA override.
const sourceUrl='https://www.corum.fr/actus/premier-semestre-2026-pour-les-scpi-de-corum-tous-les-indicateurs-sont-en-hausse';
export const official2026ValuationAnnouncementUrl=sourceUrl;
const shaRe=/^[a-f0-9]{64}$/;
export function hasOfficial2026Valuation(candidate){
 const s=candidate?.publishing_sources?.reconstitution_value;
 const v=candidate?.publishing_fields?.reconstitution_value;
 const h=s?.historical_2025;
 return s?.kind==='official_issuer_html' &&
   s?.url===sourceUrl && s.source_date==='2026-09-10' && s.as_of==='2026-06-30' &&
   s.metric==='valeur_reconstitution_par_part' && s.unit==='EUR_PER_PART' &&
   s.verification_status==='official_issuer_statement_verified' &&
   typeof v==='number' && Number.isFinite(v) && v>0 && s.verified_value===v &&
   typeof h?.verified_value==='number' && h.verified_value>0 &&
   /^https:\/\/www\.corum\.fr\/.+\.pdf$/.test(h.url||'') &&
   Number.isInteger(h.page) && h.page>0 && shaRe.test(h.sha256||'') &&
   h.basis==='2025_12_31_NOT_COMPARABLE_AUTOMATICALLY_WITH_T2_2026';
}
export function assertOfficial2026Valuation(candidate){
 if(!hasOfficial2026Valuation(candidate))
  throw Error('Current 2026 reconstitution proof is not an issuer-dated primary source: '+candidate?.scpi_slug);
 return candidate.publishing_fields.reconstitution_value;
}
