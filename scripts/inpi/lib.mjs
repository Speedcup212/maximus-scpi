import { createHash } from 'node:crypto';

export const INPI_BASE = 'https://registre-national-entreprises.inpi.fr';
export const MAX_PDF_BYTES = 30 * 1024 * 1024;

export function validateSiren(value) {
  const siren = String(value ?? '');
  if (!/^[0-9]{9}$/.test(siren)) throw new Error('SIREN invalide (9 chiffres requis)');
  return siren;
}

export function normaliseAct(row, expectedSiren) {
  if (!row || typeof row !== 'object' || !/^[a-zA-Z0-9_-]{1,120}$/.test(String(row.id ?? ''))) {
    throw new Error('Identifiant acte INPI invalide');
  }
  if (row.siren && String(row.siren) !== expectedSiren) throw new Error('SIREN document divergent');
  return {
    inpi_id: String(row.id),
    siren: expectedSiren,
    document_name: String(row.nomDocument ?? '').slice(0, 512) || null,
    deposit_date: /^\d{4}-\d{2}-\d{2}$/.test(String(row.dateDepot)) ? row.dateDepot : null,
    source_updated_at: row.updatedAt && !Number.isNaN(Date.parse(row.updatedAt)) ? new Date(row.updatedAt).toISOString() : null,
    act_types: Array.isArray(row.typeRdd) ? row.typeRdd : [],
    deleted: row.deleted === true,
    public: String(row.confidentiality ?? '').toLowerCase() === 'public',
  };
}

export function decodeInpiPdf(bytes, contentType = '') {
  let output = Buffer.from(bytes);
  if (output.length > MAX_PDF_BYTES * 1.5) throw new Error('PDF INPI trop volumineux');
  if (output.subarray(0, 5).toString('ascii') !== '%PDF-') {
    const text = output.toString('utf8').trim();
    let value = text;
    if (text.startsWith('{') || text.startsWith('"')) {
      try {
        const parsed = JSON.parse(text);
        value = typeof parsed === 'string' ? parsed :
          (parsed.binaryFile ?? parsed.data ?? parsed.content ?? '');
      } catch { throw new Error('Réponse PDF INPI non décodable'); }
    }
    if (typeof value !== 'string' || !/^data:application\/pdf;base64,/i.test(value)) {
      throw new Error('La réponse INPI ne contient pas un PDF vérifiable (' + String(contentType).slice(0, 60) + ')');
    }
    const b64 = value.replace(/^data:application\/pdf;base64,/i, '').replace(/\s/g, '');
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64) || !b64) throw new Error('Base64 PDF INPI invalide');
    output = Buffer.from(b64, 'base64');
  }
  if (output.length < 10 || output.length > MAX_PDF_BYTES || output.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new Error('Document INPI non PDF ou taille excessive');
  }
  return { bytes: output, sha256: createHash('sha256').update(output).digest('hex') };
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function inpiRequest(path, { token, method = 'GET', body, fetcher = fetch } = {}) {
  if (!/^\/api\/[a-z0-9/?=&%[\]_-]+$/i.test(path)) throw new Error('Chemin API INPI interdit');
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetcher(INPI_BASE + path, {
      method,
      headers: {
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(30000),
    });
    if ((response.status === 429 || response.status >= 500) && attempt < 3) {
      const suggested = Number(response.headers.get('retry-after'));
      await sleep(Number.isFinite(suggested) && suggested > 0 ? Math.min(suggested * 1000, 15000) : 1000 * 2 ** attempt);
      continue;
    }
    if (!response.ok) throw new Error('INPI HTTP ' + response.status + ' pour ' + path.split('?')[0]);
    return response;
  }
  throw new Error('INPI indisponible après tentatives');
}

export async function authenticate({ username, password, fetcher = fetch }) {
  if (!username || !password) throw new Error('Identifiants API INPI manquants');
  const response = await inpiRequest('/api/sso/login', {
    method: 'POST', body: { username, password }, fetcher,
  });
  const payload = await response.json();
  if (!payload?.token || typeof payload.token !== 'string') throw new Error('Token API INPI absent');
  return payload.token;
}

export async function listActs(siren, token, fetcher = fetch) {
  const result = await inpiRequest('/api/companies/' + validateSiren(siren) + '/attachments', { token, fetcher });
  const payload = await result.json();
  if (!Array.isArray(payload?.actes)) throw new Error('Format liste actes INPI inattendu');
  return payload.actes.map(row => normaliseAct(row, siren));
}

export async function downloadAct(id, token, fetcher = fetch) {
  if (!/^[a-zA-Z0-9_-]{1,120}$/.test(String(id))) throw new Error('Identifiant INPI dangereux');
  const response = await inpiRequest('/api/actes/' + id + '/download', { token, fetcher });
  const length = Number(response.headers.get('content-length'));
  if (length && length > MAX_PDF_BYTES * 1.5) throw new Error('Document trop volumineux');
  return decodeInpiPdf(Buffer.from(await response.arrayBuffer()), response.headers.get('content-type') ?? '');
}
