// An RPC rollback must not erase the refused binary from operational follow-up.
// Persist only bounded document metadata, never a raw error, payload or token.
export function refusalEvent(doc, error, now = new Date().toISOString()) {
  if (!['corum-origin','corum-xl','corum-eurion','corum-usa'].includes(doc?.slug) ||
      !/^20\d{2}-(T[1-4]|RA)$/.test(doc?.period) || !/^[a-f0-9]{64}$/.test(doc?.sha256)) return null;
  let url;
  try {
    url = new URL(doc.url);
    if (url.protocol !== 'https:' || !['www.corum.fr','corum.fr'].includes(url.hostname) ||
        url.username || url.password || (url.port && url.port !== '443') || url.href.length > 2000) return null;
    url.search = ''; url.hash = '';
  } catch { return null; }
  const code = /^[A-Z][A-Z0-9_]{2,79}(?=\b|$)/.exec(String(error?.message || ''))?.[0] || 'DOCUMENT_TRANSACTION_REJECTED';
  return {scpi_slug:doc.slug,source_period:doc.period,bulletin_url:url.href,
    status:'failed',step:'corum_document_refused',started_at:now,ended_at:now,
    message:code+' sha256='+doc.sha256};
}
