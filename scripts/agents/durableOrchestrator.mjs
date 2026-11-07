// RECOVERY-173: bounded recovery planner for the EXISTING workflows/agent queue.
// Pure policy, independent of model providers, QA financial decisions and token quotas.
export const RECOVERY_TARGETS = Object.freeze([
  Object.freeze({ key: 'candidate20', workflow: 'maximus-agent-parallel.yml', afterParisHour: 9 }),
  Object.freeze({ key: 'document-replay', workflow: 'maximus-all-bulletins-replay.yml', afterParisHour: 8 }),
  Object.freeze({ key: 'safe-remediation', workflow: 'scpi-auto-remediation.yml', afterParisHour: 10 })
]);

export function parisDay(date) {
  const d = new Date(date);
  if (!Number.isFinite(d.getTime())) throw new Error('Invalid orchestration clock');
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(d);
}

export function parisHour(date) {
  const d = new Date(date);
  if (!Number.isFinite(d.getTime())) throw new Error('Invalid orchestration clock');
  return Number(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris', hour: '2-digit', hourCycle: 'h23'
  }).format(d));
}

// Runs are scoped to main by the GitHub API caller. Never infer "missing"
// from a partial/invalid API response or use PR runs as a production heartbeat.
export function decideWorkflowRecovery({ now, runs, target }) {
  if (!target || !RECOVERY_TARGETS.some(t => t.workflow === target.workflow &&
      t.key === target.key && t.afterParisHour === target.afterParisHour)) {
    throw new Error('Unapproved workflow recovery target');
  }
  if (!Array.isArray(runs)) throw new Error('Workflow history is unavailable');
  if (!runs.every(r => r && typeof r.created_at === 'string' &&
      typeof r.status === 'string' && typeof r.event === 'string')) {
    throw new Error('Incomplete workflow history');
  }
  const day = parisDay(now);
  const todayRuns = runs.filter(r =>
    r.event !== 'pull_request' && parisDay(r.created_at) === day);
  todayRuns.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const latest = todayRuns[0];
  if (latest) {
    const url = typeof latest.html_url === 'string' &&
      /^https:\/\/github\.com\/[^/]+\/[^/]+\/actions\/runs\/\d+$/.test(latest.html_url)
      ? latest.html_url : null;
    if (latest.status !== 'completed') return { decision: 'ACTIVE', day, url };
    if (latest.conclusion !== 'success') return {
      decision: 'FAILED', day, url, conclusion: latest.conclusion ?? 'unknown'
    };
    return { decision: 'HEALTHY', day, url };
  }
  if (parisHour(now) < target.afterParisHour) return { decision: 'NOT_DUE', day };
  return { decision: 'DISPATCH_ONCE', day };
}
