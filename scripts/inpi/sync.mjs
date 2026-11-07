import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { authenticate, downloadAct, listActs, listWithdrawnActIds, validateSiren } from './lib.mjs';

const BUCKET = 'scpi-bulletins';
const now = () => new Date().toISOString();

function required(key) {
  const value = process.env[key];
  if (!value) throw new Error('Secret manquant : ' + key);
  return value;
}

function assertResult(result, label) {
  if (result.error) throw new Error(label + ' : ' + result.error.message);
  return result.data;
}

async function writeRow(db, row) {
  assertResult(await db.from('scpi_inpi_documents').upsert(row, { onConflict: 'inpi_id' }), 'Écriture métadonnées');
}

async function removeObject(db, path) {
  if (!path) return;
  assertResult(await db.storage.from(BUCKET).remove([path]), 'Suppression INPI obligatoire');
}

export async function syncEntity({ db, entity, token, fetcher = fetch, maxDownloads = 250, counters }) {
  const siren = validateSiren(entity.siren);
  const slug = String(entity.scpi_slug);
  const currentActs = await listActs(siren, token, fetcher);
  const withdrawnIds = await listWithdrawnActIds(siren, token, fetcher);
  const byId = new Map(currentActs.map(item => [item.inpi_id, item]));
  for (const id of withdrawnIds) {
    const item = byId.get(id);
    if (item) item.deleted = true;
    else byId.set(id, { inpi_id: id, siren, document_name: null, deposit_date: null,
      source_updated_at: null, act_types: [], public: false, deleted: true });
  }
  const acts = [...byId.values()];
  const previous = assertResult(await db.from('scpi_inpi_documents')
    .select('inpi_id,storage_path,status,sha256,source_updated_at')
    .eq('siren', siren), 'Lecture actes archivés') ?? [];
  const known = new Map(previous.map(row => [row.inpi_id, row]));
  for (const act of acts) {
    const old = known.get(act.inpi_id);
    const base = {
      inpi_id: act.inpi_id,
      scpi_slug: slug,
      siren,
      document_name: act.document_name,
      deposit_date: act.deposit_date,
      source_updated_at: act.source_updated_at,
      act_types: act.act_types,
      checked_at: now(),
    };
    if (act.deleted || !act.public) {
      // INPI requires withdrawal of removed documents; restriction must also revoke prior access.
      await removeObject(db, old?.storage_path);
      await writeRow(db, { ...base, status: act.deleted ? 'withdrawn' : 'restricted',
        storage_path: null, sha256: null, last_error: null });
      counters[act.deleted ? 'withdrawn' : 'restricted']++;
      continue;
    }
    if (old?.status === 'available' && old?.storage_path &&
      old?.source_updated_at === act.source_updated_at) {
      counters.unchanged++;
      continue;
    }
    if (counters.downloaded >= maxDownloads) { counters.deferred++; continue; }
    try {
      const pdf = await downloadAct(act.inpi_id, token, fetcher);
      const newPath = 'inpi/' + siren + '/' + act.inpi_id + '/' + pdf.sha256 + '.pdf';
      if (old?.storage_path !== newPath) {
        const result = await db.storage.from(BUCKET).upload(newPath, pdf.bytes, {
          contentType: 'application/pdf', cacheControl: '3600', upsert: false,
        });
        if (result.error) {
          // A failed prior database write can leave this deterministic object in place.
          if (result.error.statusCode !== '409' && result.error.status !== 409) {
            throw new Error('Stockage privé INPI : ' + result.error.message);
          }
          const check = assertResult(await db.storage.from(BUCKET).download(newPath),
            'Vérification objet préexistant');
          const { createHash } = await import('node:crypto');
          const sha = createHash('sha256').update(Buffer.from(await check.arrayBuffer())).digest('hex');
          if (sha !== pdf.sha256) throw new Error('Conflit objet INPI non conforme SHA-256');
        }
      }
      await writeRow(db, { ...base, status: 'available', storage_path: newPath,
        sha256: pdf.sha256, last_error: null });
      if (old?.storage_path && old.storage_path !== newPath) await removeObject(db, old.storage_path);
      counters.downloaded++;
    } catch (error) {
      counters.errors++;
      const message = String(error?.message ?? error).slice(0, 500);
      // Keep a previously verified PDF available on transient network/storage errors.
      await writeRow(db, { ...base, status: old?.status === 'available' ? 'available' : 'error',
        storage_path: old?.storage_path ?? null, sha256: old?.sha256 ?? null,
        last_error: message });
      console.error('INPI act failed:', slug, act.inpi_id, message);
    }
  }
  counters.entities++;
}

export async function run({ db, fetcher = fetch, username, password, limit = Infinity,
  maxDownloads = 250 }) {
  const entities = assertResult(await db.from('scpi_inpi_entities')
    .select('scpi_slug,siren').eq('verified', true).order('scpi_slug'), 'Identités juridiques SCPI') ?? [];
  if (!entities.length) throw new Error('Aucun couple SCPI/SIREN juridiquement vérifié : collecte suspendue');
  const token = await authenticate({ username, password, fetcher });
  const counters = { entities: 0, downloaded: 0, unchanged: 0,
    deferred: 0, restricted: 0, withdrawn: 0, errors: 0 };
  for (const entity of entities.slice(0, limit)) {
    try {
      await syncEntity({ db, entity, token, fetcher, maxDownloads, counters });
    } catch (error) {
      counters.errors++;
      console.error('INPI entity failed:', entity.scpi_slug, String(error?.message ?? error).slice(0, 500));
    }
  }
  console.log('INPI sync summary:', JSON.stringify(counters));
  if (counters.errors) throw new Error('Synchronisation INPI incomplète : erreurs documentaires');
  return counters;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const db = createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } });
  const limit = process.env.INPI_SCPI_LIMIT ? Number(process.env.INPI_SCPI_LIMIT) : Infinity;
  const maxDownloads = process.env.INPI_MAX_DOWNLOADS ? Number(process.env.INPI_MAX_DOWNLOADS) : 250;
  if (!(limit > 0) || !(maxDownloads > 0) || maxDownloads > 2000) throw new Error('Limites INPI invalides');
  run({ db, username: required('INPI_API_USERNAME'), password: required('INPI_API_PASSWORD'),
    limit, maxDownloads }).catch(error => {
      console.error('INPI ingestion stopped:', String(error?.message ?? error).slice(0, 500));
      process.exitCode = 1;
    });
}
