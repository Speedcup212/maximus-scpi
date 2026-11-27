#!/usr/bin/env node
/**
 * ChatGPT / #459 ticket watcher — polls every 60s.
 * Dedupe by comment id. Single-flight lock. No secrets in logs.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, renameSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const INTERVAL_MS = Number(process.env.WATCH_INTERVAL_MS || 60_000);
const STATE_DIR = process.env.WATCH_STATE_DIR || join(process.cwd(), '.local/chatgpt-watcher');
const REPO = 'Speedcup212/maximus-scpi';
const ISSUE = 459;
const EXTRA_PRS = (process.env.WATCH_PRS || '468,467,466').split(',').map(Number).filter(Boolean);
const API = 'https://api.github.com';
const UA = 'maximus-chatgpt-ticket-watcher/1.0';

mkdirSync(STATE_DIR, { recursive: true });
const statePath = join(STATE_DIR, 'state.json');
const lockPath = join(STATE_DIR, 'lock.json');
const logPath = join(STATE_DIR, 'watcher.log');

function log(line) {
  const row = `[${new Date().toISOString()}] ${line}`;
  console.log(row);
  writeFileSync(logPath, row + '\n', { flag: 'a' });
}

function loadState() {
  if (!existsSync(statePath)) return { seenCommentIds: {}, cycles: 0, lastCycleAt: null, lastNew: [] };
  return JSON.parse(readFileSync(statePath, 'utf8'));
}

function saveState(state) {
  const tmp = statePath + '.tmp';
  writeFileSync(tmp, JSON.stringify(state, null, 2));
  renameSync(tmp, statePath);
}

function acquireLock() {
  if (existsSync(lockPath)) {
    try {
      const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
      const heldByOther =
        Number.isInteger(lock.pid) &&
        lock.pid > 0 &&
        lock.pid !== process.pid &&
        !lock.released &&
        Date.now() - Date.parse(lock.at) < INTERVAL_MS * 2;
      if (heldByOther) return false;
    } catch {
      // lock illisible → on reprend
    }
  }
  writeFileSync(lockPath, JSON.stringify({ pid: process.pid, at: new Date().toISOString(), released: false }));
  return true;
}

function releaseLock() {
  try {
    if (!existsSync(lockPath)) return;
    const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
    if (lock.pid === process.pid) unlinkSync(lockPath);
  } catch {
    try { unlinkSync(lockPath); } catch {}
  }
}

async function ghJson(path) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': UA };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`${API}${path}`, { headers, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`HTTP_${res.status}:${path}`);
  return res.json();
}

function isChatGptSignal(body = '', viaApp = false) {
  if (viaApp) return true;
  return /VALIDÉ|CORRECTION REQUISE|BLOQUÉ|EXECUTED|READY_FOR_REVIEW|P0 —|DÉCLENCHEMENT DEMANDÉ|Mandat propriétaire|PRIORITÉ P0/i.test(body);
}

async function cycle() {
  if (!acquireLock()) {
    log('SKIP cycle — lock held');
    return false;
  }
  try {
    const state = loadState();
    const targets = [ISSUE, ...EXTRA_PRS];
    const fresh = [];
    for (const n of targets) {
      const comments = await ghJson(`/repos/${REPO}/issues/${n}/comments?per_page=100`);
      for (const c of comments) {
        const id = String(c.id);
        if (state.seenCommentIds[id]) continue;
        const via = Boolean(c.performed_via_github_app);
        if (!isChatGptSignal(c.body || '', via) && n !== ISSUE) {
          state.seenCommentIds[id] = { at: c.created_at, ignored: true };
          continue;
        }
        state.seenCommentIds[id] = { at: c.created_at, issue: n, title: (c.body || '').split('\n')[0].slice(0, 160) };
        fresh.push({ id, issue: n, created_at: c.created_at, title: state.seenCommentIds[id].title, viaApp: via });
      }
    }
    state.cycles += 1;
    state.lastCycleAt = new Date().toISOString();
    state.lastNew = fresh;
    saveState(state);
    log(`ACK cycle=${state.cycles} intervalMs=${INTERVAL_MS} new=${fresh.length} seen=${Object.keys(state.seenCommentIds).length} targets=${targets.join(',')}`);
    log(`CYCLE ${state.cycles} ok — new=${fresh.length} seen=${Object.keys(state.seenCommentIds).length}`);
    for (const f of fresh) log(`NEW#${f.issue} comment=${f.id} viaApp=${f.viaApp} :: ${f.title}`);
    return true;
  } finally {
    releaseLock();
  }
}

const prove = process.argv.includes('--prove-cycles');
const proveCount = Number(process.env.PROVE_CYCLES || 3);

log(`START interval=${INTERVAL_MS}ms prove=${prove} state=${STATE_DIR}`);
if (prove) {
  let ok = 0;
  const stamps = [];
  while (ok < proveCount) {
    const before = Date.now();
    const success = await cycle();
    if (success) {
      ok += 1;
      stamps.push(new Date().toISOString());
      log(`PROVE_PROGRESS ${ok}/${proveCount} at=${stamps[stamps.length - 1]}`);
      if (ok < proveCount) await new Promise((r) => setTimeout(r, INTERVAL_MS));
    } else {
      await new Promise((r) => setTimeout(r, 1_000));
    }
    if (Date.now() - before > INTERVAL_MS * 5) {
      log('PROVE_FAIL timeout waiting for successful cycles');
      process.exit(1);
    }
  }
  log(`PROVE_DONE cycles=${proveCount} stamps=${stamps.join(',')}`);
  process.exit(0);
}

await cycle();
setInterval(() => {
  cycle().catch((e) => log(`ERROR ${e.message}`));
}, INTERVAL_MS);
