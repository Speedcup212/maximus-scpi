import "dotenv/config";
import path from "node:path";
import crypto from "node:crypto";
import { loadSources } from "./loadSources.js";
import { downloadPdf } from "./downloader.js";
import { uploadPdf, recordBulletin, saveScore } from "./supabase.js";
import { fetchBestPdfLink } from "./html.js";
import { shutdownPlaywright } from "./playwright.js";
import { runQa } from "./qa.js";
import { buildReport } from "./report.js";
import { logger } from "./logger.js";
import { computeMaximusScore, fromExtraction } from "./scoring/maximusScore.js";
import { type Source, type DownloadSuccess, type DownloadFailure } from "./types.js";

// ─── Config ──────────────────────────────────────────────────────────────────

const SOURCES_PATH  = path.resolve(process.cwd(), "sources.yaml");
const CONCURRENCY   = 3;

// ─── CLI parsing ─────────────────────────────────────────────────────────────

function parseSlugFromArgs(): string | null {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--slug");
  if (idx === -1 || idx + 1 >= args.length) return null;
  const val = args[idx + 1];
  return typeof val === "string" && val.trim() !== "" ? val.trim() : null;
}

// ─── Exit codes ───────────────────────────────────────────────────────────────
//   0 — all sources processed successfully
//   1 — at least one source failed (partial success)
//   2 — fatal error: setup failed or unexpected crash

process.on("uncaughtException", (error: Error) => {
  logger.error("uncaught_exception", {
    message: error.message,
    stack:   error.stack,
  });
  process.exit(2);
});

process.on("unhandledRejection", (reason: unknown) => {
  logger.error("unhandled_rejection", {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack:  reason instanceof Error ? reason.stack   : undefined,
  });
  process.exit(2);
});

// ─── Concurrency helper ───────────────────────────────────────────────────────

async function processAllConcurrent<T>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  let next = 0;
  async function worker(): Promise<void> {
    for (;;) {
      const i = next++;
      if (i >= items.length) break;
      const item = items[i];
      if (item === undefined) break;
      await fn(item);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );
}

// ─── Per-source processor ─────────────────────────────────────────────────────

async function processSource(
  source: Source,
  runId: string,
  successes: DownloadSuccess[],
  failures: DownloadFailure[]
): Promise<void> {
  const operationStartedAt = Date.now();
  const elapsed = (): number => Date.now() - operationStartedAt;

  try {
    logger.info("source_started", {
      sourceId: source.id,
      scpi:     source.scpi,
      pageUrl:  source.pageUrl,
    });

    // ── Phase 0: load pageUrl and extract latest bulletin PDF ───────────────
    const linkResult = await fetchBestPdfLink(source.pageUrl);

    if (!linkResult.ok) {
      logger.warn("no_pdf_detected", {
        scpi:    source.scpi,
        pageUrl: source.pageUrl,
        reason:  linkResult.error.reason,
        message: linkResult.error.message,
      });
      failures.push({
        sourceId:   source.id,
        scpi:       source.scpi,
        reason:     `[PDF_URL_RESOLVE][${linkResult.error.reason}] ${linkResult.error.message}`,
        durationMs: elapsed(),
      });
      return;
    }

    const candidate = linkResult.value;
    logger.info("page_loaded", { scpi: source.scpi, pageUrl: source.pageUrl });
    logger.info("pdf_detected", {
      scpi:     source.scpi,
      pdfCount: 1,
      pageUrl:  source.pageUrl,
    });
    logger.info("pdf_selected", {
      scpi:     source.scpi,
      pdfUrl:   candidate.url,
      period:   candidate.period.normalized,
      reasons:  candidate.period.normalized !== "unknown" ? ["period_parsed", "most_recent"] : ["document_order"],
    });

    const pdfUrl  = candidate.url;
    const period  = candidate.period.normalized;

    // ── Phase 1: fetch PDF into memory ─────────────────────────────────────
    const downloadResult = await downloadPdf(source, pdfUrl);

    if (!downloadResult.ok) {
      const { error } = downloadResult;
      failures.push(error);
      logger.warn("download_failed", {
        sourceId:   error.sourceId,
        reason:    error.reason,
        durationMs: error.durationMs,
      });
      return;
    }

    const dl = downloadResult.value;
    logger.info("pdf_verified", { contentType: "application/pdf", bytes: dl.sizeBytes, sha256: dl.sha256 });
    logger.info("download_complete", {
      sourceId:  dl.sourceId,
      sizeBytes: dl.sizeBytes,
      sha256:    dl.sha256,
      durationMs: dl.durationMs,
    });

    // ── Phase 2: upload buffer to Supabase Storage ─────────────────────────
    const uploadResult = await uploadPdf({
      scpi_slug: source.scpi,
      period,
      buffer:    dl.buffer,
      sha256:    dl.sha256,
    });

    if (!uploadResult.ok) {
      const { error } = uploadResult;
      failures.push({
        sourceId:   source.id,
        scpi:       source.scpi,
        reason:     `[${error.reason}] ${error.message}`,
        durationMs: elapsed(),
      });
      logger.warn("upload_failed", {
        sourceId: source.id,
        reason:   error.reason,
        message:  error.message,
        durationMs: elapsed(),
      });
      return;
    }

    const upload = uploadResult.value;

    if (upload.isNew) {
      logger.info("pdf_uploaded", { path: upload.storageKey });
      logger.info("upload_succeeded", {
        sourceId:   source.id,
        storageKey: upload.storageKey,
        period:     upload.period,
        sizeBytes:  dl.sizeBytes,
        sha256:     dl.sha256,
        durationMs: elapsed(),
      });
    } else {
      logger.info("duplicate_detected", {
        sourceId:   source.id,
        sha256:     dl.sha256,
        storageKey: upload.storageKey,
        period:     upload.period,
        durationMs: elapsed(),
      });
    }

    // ── Phase 3: record in scpi_bulletins ──────────────────────────────────
    const dbResult = await recordBulletin({
      scpi_slug:  source.scpi,
      period:     upload.period,
      pdf_path:   upload.storageKey,
      pdf_sha256: dl.sha256,
      source_url: pdfUrl,
      run_id:     runId,
    });

    if (!dbResult.ok) {
      failures.push({
        sourceId:   source.id,
        scpi:       source.scpi,
        reason:     `[${dbResult.error.reason}] ${dbResult.error.message} (storage key: ${upload.storageKey})`,
        durationMs: elapsed(),
      });
      logger.warn("db_record_failed", {
        sourceId:   source.id,
        storageKey: upload.storageKey,
        reason:     dbResult.error.reason,
        message:    dbResult.error.message,
        durationMs: elapsed(),
      });
      return;
    }

    const db = dbResult.value;

    logger.info("db_upserted", {
      scpi:     source.scpi,
      period:   upload.period,
      outcome:  db.outcome,
    });

    if (db.outcome === "revision") {
      logger.warn("bulletin_revision_detected", {
        sourceId:     source.id,
        scpi:         source.scpi,
        period:       upload.period,
        newHash:      dl.sha256,
        previousHash: db.previousHash,
        storageKey:   upload.storageKey,
      });
    }

    // ── Phase 4: quality assurance ─────────────────────────────────────────
    const qaResult = runQa({ confidence: 0 });

    if (qaResult.status === "NEEDS_REVIEW") {
      logger.warn("qa_needs_review", {
        sourceId:   source.id,
        confidence: qaResult.metrics.confidence,
        tof:        qaResult.metrics.tof,
        td:         qaResult.metrics.td,
        warnings:   qaResult.warnings.map((w) => w.message),
      });
    } else {
      logger.info("qa_passed", {
        sourceId: source.id,
        warnings: qaResult.warnings.map((w) => w.message),
      });
    }

    // ── Phase 5: MaximusSCPI score ─────────────────────────────────────────
    const scoringInput = fromExtraction(
      source.scpi,
      {
        chiffres_cles:            {},
        profil_risque:            {},
        repartition_sectorielle:  [],
        repartition_geographique: [],
        structure_frais:          {},
        indicateurs_locatifs:     {},
        valorisation_risque:      {},
        strategie_investissement: {},
        actualite_trimestrielle:  { acquisitions: [], arbitrages: [] },
        confidence:               0,
        _meta:                    { critical_fields_total: 10, critical_fields_found: 0 },
      }
    );

    const scoreResult = computeMaximusScore(scoringInput);

    logger.info("score_computed", {
      event:      "score_computed",
      scpi:       source.scpi,
      period:     upload.period,
      score_total: scoreResult.score_total,
      has_penalty: scoreResult.has_penalty,
      version:    scoreResult.version,
    });

    const scoreDbResult = await saveScore({
      scpi_slug: source.scpi,
      period:    upload.period,
      score:     scoreResult,
    });

    if (!scoreDbResult.ok) {
      logger.warn("score_save_failed", {
        sourceId: source.id,
        reason:   scoreDbResult.error.reason,
        message:  scoreDbResult.error.message,
      });
    } else {
      logger.info("score_saved", {
        sourceId:   source.id,
        score_total: scoreResult.score_total,
        period:     upload.period,
      });
    }

    successes.push({
      sourceId:    source.id,
      scpi:       source.scpi,
      storageKey: upload.storageKey,
      sizeBytes:  dl.sizeBytes,
      sha256:     dl.sha256,
      isNew:      upload.isNew,
      durationMs: elapsed(),
      qaResult,
      scoreResult,
    });

  } catch (unexpected) {
    const message = unexpected instanceof Error ? unexpected.message : String(unexpected);
    const stack   = unexpected instanceof Error ? unexpected.stack   : undefined;
    failures.push({
      sourceId:   source.id,
      scpi:       source.scpi,
      reason:     `unexpected error: ${message}`,
      durationMs: elapsed(),
    });
    logger.error("source_unexpected_error", {
      sourceId: source.id,
      message,
      stack,
    });
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const runId      = crypto.randomUUID();
  const startedAt  = new Date();
  const slugFilter = parseSlugFromArgs();

  logger.info("ingestion_run_started", { runId, sourcesPath: SOURCES_PATH, slugFilter: slugFilter ?? null });

  try {
    await runIngestion(runId, startedAt, slugFilter);
  } finally {
    await shutdownPlaywright();
  }
}

async function runIngestion(runId: string, startedAt: Date, slugFilter: string | null): Promise<void> {
  const sourcesResult = loadSources(SOURCES_PATH);
  if (!sourcesResult.ok) {
    logger.error("sources_load_failed", { runId, reason: sourcesResult.error });
    process.exit(2);
  }

  let { sources } = sourcesResult.value;
  if (slugFilter !== null) {
    sources = sources.filter((s) => s.scpi === slugFilter);
    if (sources.length === 0) {
      logger.error("slug_not_found", { runId, slug: slugFilter });
      process.exit(2);
    }
    logger.info("slug_filter_applied", { runId, slug: slugFilter, count: sources.length });
  } else {
    logger.info("sources_loaded", { runId, count: sources.length });
  }

  const successes: DownloadSuccess[] = [];
  const failures:  DownloadFailure[] = [];

  await processAllConcurrent(
    sources,
    CONCURRENCY,
    (source) => processSource(source, runId, successes, failures)
  );

  const endedAt = new Date();
  const report  = buildReport({ runId, startedAt, endedAt, successes, failures });

  logger.info("ingestion_run_complete", {
    runId:        report.runId,
    startedAt:    report.startedAt,
    endedAt:      report.endedAt,
    durationMs:   report.durationMs,
    totalSources: report.totalSources,
    successCount: report.successCount,
    failedCount:  report.failedCount,
    newBulletins: report.newBulletins,
    duplicates:   report.duplicates,
    needsReview:  report.needsReview,
  });

  if (report.failedCount > 0) {
    logger.warn("run_partial_failure", { failedCount: report.failedCount });
    process.exit(1);
  }
}

main().catch((e: unknown) => {
  logger.error("main_fatal_error", {
    message: e instanceof Error ? e.message : String(e),
    stack:   e instanceof Error ? e.stack   : undefined,
  });
  process.exit(2);
});
