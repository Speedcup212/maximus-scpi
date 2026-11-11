/**
 * Audit technique non destructif des images d'actualités officielles.
 * Rien n'est publié ni copié dans les fichiers du site.
 * Un résultat HTTP 200 ne prouve ni que la photographie illustre l'actif,
 * ni que MaximusSCPI dispose de droits de réutilisation.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const sourcePath = path.resolve('data/news/scpi-investment-news-latest.json');
const outDir = path.resolve('artifacts/actualites-images');
const outPath = path.join(outDir, 'validation.json');
const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
if (!Array.isArray(raw) || raw.length === 0) throw Error('Source image inventaire vide ou non disponible');

const patterns = [
  { regex: /\/plugins\/ArkeaREIMPlugin\/images\/ico-fr\.svg(?:\?|$)/i, reason: 'Icône de langue, pas une photo immobilière' },
  { regex: /\/footer\/newsletter\.webp(?:\?|$)/i, reason: 'Illustration du formulaire de newsletter' },
  { regex: /\/image-menu-besoins\.png(?:\?|$)/i, reason: 'Illustration générique du menu du site' },
  { regex: /\/assets\/img\/facebook\.jpg(?:\?|$)/i, reason: 'Image de partage générique' },
  { regex: /\/images\/open-graph-[\w-]+\.png(?:\?|$)/i, reason: 'Image générique Open Graph, non liée à l’actif' },
];
const privateHost = (host) => /^(localhost|127(?:\.\d+){3}|0\.0\.0\.0|::1)$/i.test(host) ||
  /^(?:10|192\.168)\./.test(host) || /^172\.(?:1[6-9]|2\d|3[01])\./.test(host);
const safeUrl = (rawUrl) => {
  try {
    const url = new URL(rawUrl);
    return url.protocol === 'https:' && !url.username && !url.password && !privateHost(url.hostname) ? url : null;
  } catch { return null; }
};
const recognized = (metadata) =>
  ['png', 'jpeg', 'webp', 'avif'].includes(metadata.format) &&
  metadata.width >= 600 && metadata.height >= 300;
const MAX_BYTES = 7_000_000;

async function getImage(url, attempts = 0) {
  const answer = await fetch(url.href, {
    signal: AbortSignal.timeout(13000),
    redirect: 'manual',
    headers: {
      Accept: 'image/avif,image/webp,image/png,image/jpeg;q=0.9',
      'User-Agent': 'MaximusSCPI-DocumentaryImageAudit/1.0'
    },
  });
  if ([301, 302, 303, 307, 308].includes(answer.status)) {
    const location = answer.headers.get('location');
    const next = location ? safeUrl(new URL(location, url).href) : null;
    if (!next || next.hostname !== url.hostname || attempts >= 2) {
      throw Error('Redirection hors domaine ou trop longue : contrôle manuel nécessaire');
    }
    return getImage(next, attempts + 1);
  }
  if (!answer.ok) throw Error('HTTP ' + answer.status + ' — contrôle non concluant');
  const claimedType = answer.headers.get('content-type') || '';
  if (!/^image\/(?:png|jpeg|webp|avif)(?:\s*;|$)/i.test(claimedType)) {
    throw Error('MIME reçu : ' + (claimedType || 'absent'));
  }
  const length = Number(answer.headers.get('content-length') || 0);
  if (length > MAX_BYTES) throw Error('Fichier trop volumineux : ' + length + ' octets');
  if (!answer.body) throw Error('Réponse vide');
  const chunks = [];
  let size = 0;
  const reader = answer.body.getReader();
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > MAX_BYTES) throw Error('Fichier plus volumineux que le plafond de sécurité');
      chunks.push(Buffer.from(next.value));
    }
  } finally {
    try { await reader.cancel(); } catch {}
  }
  const bytes = Buffer.concat(chunks);
  const metadata = await sharp(bytes, { limitInputPixels: 40_000_000, failOn: 'error' }).metadata();
  return {
    format: metadata.format || null,
    width: metadata.width || null,
    height: metadata.height || null,
    bytes: bytes.length,
    contentType: claimedType,
    suitableSize: recognized(metadata),
  };
}
const unique = new Map();
for (const item of raw) {
  const imageUrl = String(item.imageUrl || '').trim();
  if (!imageUrl) continue;
  if (!unique.has(imageUrl)) unique.set(imageUrl, []);
  unique.get(imageUrl).push({ scpi: item.scpi, article: item.title, sourceUrl: item.sourceUrl, credit: item.imageCredit || '' });
}
const records = [...unique.entries()].map(([imageUrl, uses]) => {
  const pattern = patterns.find((entry) => entry.regex.test(imageUrl));
  const url = safeUrl(imageUrl);
  return {
    imageUrl,
    imageId: crypto.createHash('sha256').update(imageUrl).digest('hex').slice(0, 16),
    uses,
    classification: pattern ? 'rejected_non_property_asset' : url ? 'candidate' : 'rejected_unsafe_url',
    reason: pattern?.reason || (url ? null : 'URL externe non HTTPS ou non sûre'),
    technicalStatus: 'not_checked',
    technicalDetails: null,
    rightsStatus: pattern || !url ? 'not_applicable' : 'permission_not_verified',
    reuseApproved: false,
  };
});
const candidates = records.filter((x) => x.classification === 'candidate');
const concurrency = Math.min(4, candidates.length);
let index = 0;
async function worker() {
  while (index < candidates.length) {
    const item = candidates[index++];
    try {
      const details = await getImage(safeUrl(item.imageUrl));
      item.technicalDetails = details;
      item.technicalStatus = details.suitableSize ? 'verified_image' : 'rejected_size_or_format';
      if (!details.suitableSize) item.reason = 'Dimensions/format insuffisants pour une carte de patrimoine';
    } catch (error) {
      item.technicalStatus = 'unavailable_or_unverified';
      item.reason = String(error?.message || error).slice(0, 300);
    }
    console.log('[IMAGE AUDIT]', item.imageId, item.technicalStatus, item.technicalDetails?.width || '',
      item.technicalDetails?.height || '', item.reason || '');
  }
}
await Promise.all(Array.from({ length: concurrency }, () => worker()));
const summary = {
  newsRows: raw.length,
  urlsDistinct: records.length,
  reusableNow: 0,
  rejectedNonProperty: records.filter((x) => x.classification === 'rejected_non_property_asset').length,
  rejectedUnsafeUrl: records.filter((x) => x.classification === 'rejected_unsafe_url').length,
  technicallyValid: records.filter((x) => x.technicalStatus === 'verified_image').length,
  technicallyInvalid: records.filter((x) => x.technicalStatus === 'rejected_size_or_format').length,
  technicallyUnconfirmed: records.filter((x) => x.technicalStatus === 'unavailable_or_unverified').length,
  rightsPending: records.filter((x) => x.rightsStatus === 'permission_not_verified').length,
};
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({
  generatedAtUtc: new Date().toISOString(),
  methodology: 'GET HTTPS + MIME + image decode + image dimensions, without redistribution',
  rightsPolicy: 'No editorial re-use without explicit authorization/license and image-to-property matching',
  summary,
  images: records,
}, null, 2) + '\n');
console.log('[IMAGE AUDIT SUMMARY]', JSON.stringify(summary));
console.log('[IMAGE AUDIT OUTPUT]', outPath);
