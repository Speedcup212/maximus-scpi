#!/usr/bin/env node
/**
 * Persistent GitHub P0 poller for MaximusSCPI.
 * Reads issue #459 and open P0 PRs (#468,#467,#466) every 60s.
 * Dedupes by comment id, single execution lock, ACK/EXECUTED/BLOCKED reporting.
 *
 * Start:
 *   node scripts/agents/githubP0Poller.mjs
 *   # or with custom interval:
 *   POLL_INTERVAL_MS=60000 node scripts/agents/githubP0Poller.mjs
 *
 * State: .cache/github-p0-poller/state.json
 * Lock:  .cache/github-p0-poller/exec.lock
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync, openSync, closeSync, unlinkSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const STATE_DIR = join(ROOT, '.cache', 'github-p0-poller');
const STATE_PATH = join(STATE_DIR, 'state.json');
const LOCK_PATH = join(STATE_DIR, 'exec.lock');
const LOG_PATH = join(STATE_DIR, 'poller.log');
const INTERVAL = Number(process.env.POLL_INTERVAL_MS || 60000);
const MAX_CYCLES = process.env.MAX_CYCLES ? Number(process.env.MAX_CYCLES) : Infinity;
const REPO = process.env.GITHUB_REPO || 'Speedcup212/maximus-scpi';
const ISSUE = 459;
const P0_PRS = (process.env.P0_PRS || '468,467,466').split(',').map(Number);
const AGENT = process.env.POLLER_AGENT_ID || 'cursor-cloud-p0-poller';

mkdirSync(STATE_DIR, { recursive: true });

function log(msg, extra) {
  const line = `[${new Date().toISOString()}] ${msg}${extra ? ' ' + JSON.stringify(extra) : ''}`;
  console.log(line);
  appendFileSync(LOG_PATH, line + '\n');
}

function loadState() {
  if (!existsSync(STATE_PATH)) {
    return { seenCommentIds: {}, cycles: 0, lastCycleAt: null, reports: [] };
  }
  return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
}

function saveState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function ghJson(args) {
  const out = execFileSync('gh', ['api', ...args], { encoding: 'utf8' });
  return JSON.parse(out);
}

function tryAcquireLock() {
  try {
    const fd = openSync(LOCK_PATH, 'wx');
    writeFileSync(LOCK_PATH, JSON.stringify({ pid: process.pid, at: new Date().toISOString(), agent: AGENT }));
    closeSync(fd);
    return true;
  } catch {
    if (existsSync(LOCK_PATH)) {
      try {
        const lock = JSON.parse(readFileSync(LOCK_PATH, 'utf8'));
        // stale lock > 10 min
        if (lock.at && Date.now() - Date.parse(lock.at) > 10 * 60 * 1000) {
          unlinkSync(LOCK_PATH);
          return tryAcquireLock();
        }
      } catch { /* ignore */ }
    }
    return false;
  }
}

function releaseLock() {
  try { unlinkSync(LOCK_PATH); } catch { /* ignore */ }
}

function summarizeComment(c) {
  const body = String(c.body || '');
  const upper = body.toUpperCase();
  let kind = 'INFO';
  if (/\bACK\b/.test(upper) || /PRISE EN CHARGE/.test(upper)) kind = 'ACK';
  if (/EXECUTED|EXÉCUTÉ|EXÉCUTE|LIVRÉ|LIVE\b/.test(upper)) kind = 'EXECUTED';
  if (/BLOCKED|BLOQUÉ|BLOCAGE/.test(upper)) kind = 'BLOCKED';
  if (/READY_FOR_REVIEW|READY FOR REVIEW/.test(upper)) kind = 'READY_FOR_REVIEW';
  if (/P0|PRIORITÉ P0|PRIORITE P0/.test(upper)) kind = kind === 'INFO' ? 'P0_SIGNAL' : kind;
  return {
    id: c.id || c.databaseId,
    kind,
    user: c.user?.login || c.author?.login || 'unknown',
    created_at: c.created_at || c.createdAt,
    excerpt: body.replace(/\s+/g, ' ').slice(0, 180),
  };
}

function cycle(state) {
  const cycleNo = state.cycles + 1;
  const started = new Date().toISOString();
  log(`cycle ${cycleNo} start`, { issue: ISSUE, prs: P0_PRS });

  const issueComments = ghJson([`repos/${REPO}/issues/${ISSUE}/comments?per_page=20&page=1`]);
  // last page approx via graphql for freshest
  let latestIssue = [];
  try {
    const g = ghJson(['graphql', '-f', `query={repository(owner:"${REPO.split('/')[0]}",name:"${REPO.split('/')[1]}"){issue(number:${ISSUE}){comments(last:10){nodes{databaseId createdAt author{login} body}}}}}`]);
    latestIssue = (g.data?.repository?.issue?.comments?.nodes || []).map((n) => ({
      id: n.databaseId,
      created_at: n.createdAt,
      user: { login: n.author?.login },
      body: n.body,
    }));
  } catch {
    latestIssue = Array.isArray(issueComments) ? issueComments.slice(-10) : [];
  }

  const prSnapshots = [];
  for (const n of P0_PRS) {
    try {
      const pr = ghJson([`repos/${REPO}/pulls/${n}`]);
      const comments = ghJson([`repos/${REPO}/issues/${n}/comments?per_page=10`]);
      const last = Array.isArray(comments) ? comments.slice(-5) : [];
      prSnapshots.push({
        number: n,
        title: pr.title,
        state: pr.state,
        draft: pr.draft,
        head: pr.head?.sha,
        updated_at: pr.updated_at,
        new_comments: last.map(summarizeComment).filter((c) => !state.seenCommentIds[String(c.id)]),
      });
      for (const c of last) state.seenCommentIds[String(c.id)] = true;
    } catch (e) {
      prSnapshots.push({ number: n, error: String(e.message || e).slice(0, 200) });
    }
  }

  const newIssueComments = latestIssue
    .map(summarizeComment)
    .filter((c) => !state.seenCommentIds[String(c.id)]);
  for (const c of newIssueComments) state.seenCommentIds[String(c.id)] = true;

  const report = {
    cycle: cycleNo,
    at: started,
    agent: AGENT,
    issue_459_new: newIssueComments,
    prs: prSnapshots,
  };
  state.cycles = cycleNo;
  state.lastCycleAt = started;
  state.reports = [...(state.reports || []).slice(-50), report];
  saveState(state);
  log(`cycle ${cycleNo} done`, {
    issue_new: newIssueComments.length,
    pr_new: prSnapshots.reduce((a, p) => a + (p.new_comments?.length || 0), 0),
  });
  return report;
}

async function main() {
  log('poller starting', { interval_ms: INTERVAL, max_cycles: MAX_CYCLES, agent: AGENT });
  if (!tryAcquireLock()) {
    log('BLOCKED: another poller holds exec.lock');
    process.exit(2);
  }
  process.on('exit', releaseLock);
  process.on('SIGINT', () => { releaseLock(); process.exit(0); });
  process.on('SIGTERM', () => { releaseLock(); process.exit(0); });

  let n = 0;
  while (n < MAX_CYCLES) {
    n += 1;
    try {
      const state = loadState();
      cycle(state);
    } catch (e) {
      log('cycle error (backoff)', { error: String(e.message || e).slice(0, 300) });
      await new Promise((r) => setTimeout(r, Math.min(INTERVAL * 2, 120000)));
      continue;
    }
    if (n >= MAX_CYCLES) break;
    await new Promise((r) => setTimeout(r, INTERVAL));
  }
  log('poller finished', { cycles: n });
  releaseLock();
}

main();
