// Editorial summaries have their own provenance. Never borrow a metric's latest period.
export function getVerifiedScpiNews(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
  const text = typeof record.text === 'string' ? record.text.trim() : '';
  const period = typeof record.period === 'string' ? record.period.trim() : '';
  const documentDate = typeof record.document_date === 'string' ? record.document_date.trim() : '';
  const sourceDocument = typeof record.source_document === 'string' ? record.source_document.trim() : '';
  const sourceUrl = typeof record.source_url === 'string' ? record.source_url.trim() : '';
  if (record.status !== 'verified' || !text || !sourceDocument || !sourceUrl) return null;
  if (!/^(?:\d{4}-T[1-4]|T[1-4] \d{4}|S[12] \d{4})$/.test(period)) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(documentDate)) return null;
  const date = new Date(`${documentDate}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== documentDate) return null;
  try {
    if (new URL(sourceUrl).protocol !== 'https:') return null;
  } catch { return null; }
  return { text, period, documentDate, sourceDocument, sourceUrl };
}

const normalizedPeriod = (value) => {
  const period = String(value || '').trim();
  const quarter = period.match(/^(?:T([1-4])\s+(\d{4})|(\d{4})-T([1-4]))$/);
  if (quarter) return `${quarter[2] || quarter[3]}-T${quarter[1] || quarter[4]}`;
  const semester = period.match(/^S([12])\s+(\d{4})$/);
  return semester ? `${semester[2]}-T${Number(semester[1]) * 2}` : null;
};

// Build a factual summary only from a certified analysis and its exact linked PDF.
// Flows (collection, distributions) are excluded: their coverage can differ from
// the snapshot quarter, e.g. the Transitions Europe S1 bulletin's 274 M€ collection.
export function buildScpiEditorialNews(analysis, bulletin) {
  const snapshot = analysis?.current_snapshot;
  if (!snapshot || !bulletin || analysis.certification_status !== 'certified' || analysis.current_source_certified !== true) return null;
  if (snapshot.bulletin_id !== bulletin.id || analysis.scpi_slug !== bulletin.scpi_slug) return null;
  const period = normalizedPeriod(analysis.current_period);
  if (!period || period !== normalizedPeriod(snapshot.source_period) || period !== normalizedPeriod(bulletin.period)) return null;
  const sourceUrl = analysis.certified_source_url;
  if (!sourceUrl || sourceUrl !== snapshot.source_url || sourceUrl !== bulletin.source_url) return null;
  const evidence = bulletin.extraction_json?.evidence;
  if (!evidence || typeof evidence !== 'object') return null;

  const stampDates = new Set();
  for (const proof of Object.values(evidence)) {
    const stamp = String(proof?.text || '').match(/Bulletin\s+d['’]information\s+(\d{2})\/(\d{2})\/(\d{4})/i);
    if (stamp) stampDates.add(`${stamp[3]}-${stamp[2]}-${stamp[1]}`);
  }
  // The date must be printed in the linked PDF and coincide with the snapshot's
  // closing date. Neither generated_at, updated_at nor the URL month is a date proof.
  const [year, quarter] = period.split('-T').map(Number);
  const closingDate = new Date(Date.UTC(year, quarter * 3, 0)).toISOString().slice(0, 10);
  if (!stampDates.has(closingDate)) return null;
  const format = value => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
  const facts = [];
  for (const [key, label, unit, min, max] of [
    ['tof', 'TOF publié', '%', 0, 100],
    ['capitalisation', 'Capitalisation publiée', 'M€', 0, Infinity],
    ['endettement', 'Endettement publié', '%', 0, 100],
  ]) {
    const value = snapshot[key];
    const proof = evidence[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) continue;
    if (!proof || proof.value_match !== true || proof.method !== 'pdf_page_text_match' || typeof proof.page !== 'number' || proof.page < 1 || !proof.text) continue;
    if (typeof proof.raw_value !== 'number' || proof.raw_value !== value || proof.unit !== unit) continue;
    facts.push(`${label} : ${format(value)} ${unit}`);
  }
  if (!facts.length) return null;
  const record = { status: 'verified', text: facts.join(' | '), period, document_date: closingDate, source_document: snapshot.source_document, source_url: sourceUrl };
  return getVerifiedScpiNews(record) ? record : null;
}
