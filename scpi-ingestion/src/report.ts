import { type DownloadSuccess, type DownloadFailure, type RunReport } from "./types.js";

export function buildReport(params: {
  runId: string;
  startedAt: Date;
  endedAt: Date;
  successes: DownloadSuccess[];
  failures: DownloadFailure[];
}): RunReport {
  const { runId, startedAt, endedAt, successes, failures } = params;

  return {
    runId,
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    durationMs: endedAt.getTime() - startedAt.getTime(),
    totalSources: successes.length + failures.length,
    successCount: successes.length,
    failedCount: failures.length,
    newBulletins: successes.filter((s) => s.isNew).length,
    duplicates:   successes.filter((s) => !s.isNew).length,
    needsReview:  successes.filter((s) => s.qaResult.status === "NEEDS_REVIEW").length,
    successes,
    failures,
  };
}
