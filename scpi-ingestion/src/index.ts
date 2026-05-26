import "dotenv/config";
import path from "node:path";
import crypto from "node:crypto";
import { loadSources } from "./loadSources.js";
import { downloadPdf } from "./downloader.js";
import { uploadPdf, recordBulletin, saveScore, saveExtraction, upsertIndicators, updateTdFromRapportAnnuel, type IndicatorsPayload } from "./supabase.js";
import { fetchBestPdfLink } from "./html.js";
import { shutdownPlaywright } from "./playwright.js";
import { runQa } from "./qa.js";
import { buildReport } from "./report.js";
import { logger } from "./logger.js";
import { computeMaximusScore, fromExtraction } from "./scoring/maximusScore.js";
import { extractFromText, toExtractedMetrics, extractAnnualReportTd, type ExtractionResult } from "./extractor.js";
import { makeAnnualPeriod } from "./period.js";
import { parsePdfBuffer } from "./pdfParser.js";
import { type Source, type DownloadSuccess, type DownloadFailure } from "./types.js";

// ─── Empty extraction fallback ────────────────────────────────────────────────

function emptyExtraction(): ExtractionResult {
  return {
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
  };
}

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

// ─── Rapport annuel processor ─────────────────────────────────────────────────
//
// Simplified pipeline for rapport_annuel sources:
//   fetch → download → upload → record → parse → extractAnnualReportTd → updateTd
// No QA, no MaximusSCPI scoring (annual reports are not quarterly bulletins).

async function processRapportAnnuelSource(
  source: Source,
  runId: string,
  successes: DownloadSuccess[],
  failures: DownloadFailure[]
): Promise<void> {
  const operationStartedAt = Date.now();
  const elapsed = (): number => Date.now() - operationStartedAt;

  try {
    logger.info("source_started", {
      sourceId:      source.id,
      scpi:          source.scpi,
      pageUrl:       source.pageUrl,
      document_type: "rapport_annuel",
      ra_year:       source.ra_year,
    });

    // ── Phase 0: find rapport annuel PDF ────────────────────────────────────
    const linkResult = await fetchBestPdfLink(source.pageUrl, "rapport_annuel", source.ra_year);

    if (!linkResult.ok) {
      logger.warn("no_pdf_detected", {
        scpi:          source.scpi,
        pageUrl:       source.pageUrl,
        document_type: "rapport_annuel",
        reason:        linkResult.error.reason,
        message:       linkResult.error.message,
      });
      failures.push({
        sourceId:   source.id,
        scpi:       source.scpi,
        reason:     `[RA][${linkResult.error.reason}] ${linkResult.error.message}`,
        durationMs: elapsed(),
      });
      return;
    }

    const candidate = linkResult.value;

    // Resolve period: use the found period or fall back to ra_year
    let period: string = candidate.period.normalized;
    if (period === "unknown") {
      const fallback = source.ra_year !== undefined
        ? makeAnnualPeriod(source.ra_year)
        : null;
      if (fallback === null) {
        failures.push({
          sourceId:   source.id,
          scpi:       source.scpi,
          reason:     "[RA][PERIOD_NOT_FOUND] cannot determine year from link or ra_year",
          durationMs: elapsed(),
        });
        return;
      }
      period = fallback.normalized;
    }

    logger.info("pdf_selected", {
      scpi:          source.scpi,
      pdfUrl:        candidate.url,
      period,
      document_type: "rapport_annuel",
    });

    const pdfUrl = candidate.url;

    // ── Phase 1: download PDF ────────────────────────────────────────────────
    const downloadResult = await downloadPdf(source, pdfUrl);

    if (!downloadResult.ok) {
      failures.push(downloadResult.error);
      logger.warn("download_failed", {
        sourceId:   downloadResult.error.sourceId,
        reason:     downloadResult.error.reason,
        durationMs: downloadResult.error.durationMs,
      });
      return;
    }

    const dl = downloadResult.value;
    logger.info("download_complete", {
      sourceId:      dl.sourceId,
      sizeBytes:     dl.sizeBytes,
      sha256:        dl.sha256,
      document_type: "rapport_annuel",
    });

    // ── Phase 2: upload to Supabase Storage ─────────────────────────────────
    const uploadResult = await uploadPdf({ scpi_slug: source.scpi, period, buffer: dl.buffer, sha256: dl.sha256 });

    if (!uploadResult.ok) {
      failures.push({
        sourceId:   source.id,
        scpi:       source.scpi,
        reason:     `[RA][${uploadResult.error.reason}] ${uploadResult.error.message}`,
        durationMs: elapsed(),
      });
      return;
    }

    const upload = uploadResult.value;
    logger.info(upload.isNew ? "pdf_uploaded" : "duplicate_detected", {
      path:          upload.storageKey,
      document_type: "rapport_annuel",
    });

    // ── Phase 3: record in scpi_bulletins ────────────────────────────────────
    await recordBulletin({ scpi_slug: source.scpi, period, pdf_path: upload.storageKey, pdf_sha256: dl.sha256, source_url: pdfUrl, run_id: runId });

    // ── Phase 4: parse PDF text → extract TD ─────────────────────────────────
    let tdResult: ReturnType<typeof extractAnnualReportTd> = null;
    try {
      const pdfText = await parsePdfBuffer(dl.buffer);
      tdResult = extractAnnualReportTd(pdfText, source.ra_year);
      logger.info("ra_td_extracted", {
        sourceId: source.id,
        scpi:     source.scpi,
        found:    tdResult !== null,
        td:       tdResult?.td,
        year:     tdResult?.year,
        raw:      tdResult?.raw,
      });
    } catch (e) {
      logger.warn("ra_parse_failed", {
        sourceId: source.id,
        message:  e instanceof Error ? e.message : String(e),
      });
    }

    if (tdResult === null) {
      logger.warn("ra_td_not_found", {
        sourceId: source.id,
        scpi:     source.scpi,
        period,
        hint:     "TD not found in PDF — check extraction patterns or PDF structure",
      });
      failures.push({
        sourceId:   source.id,
        scpi:       source.scpi,
        reason:     `[RA][TD_NOT_FOUND] taux de distribution not found in rapport annuel PDF`,
        durationMs: elapsed(),
      });
      return;
    }

    // ── Phase 5: partial update scpi_indicators (td only) ────────────────────
    const updateResult = await updateTdFromRapportAnnuel({
      scpi_slug:  source.scpi,
      td:         tdResult.td,
      td_annee:   tdResult.year,
      ra_period:  period,
      ra_sha256:  dl.sha256,
    });

    if (!updateResult.ok) {
      logger.warn("ra_td_update_failed", {
        sourceId: source.id,
        reason:   updateResult.error.reason,
        message:  updateResult.error.message,
      });
      failures.push({
        sourceId:   source.id,
        scpi:       source.scpi,
        reason:     `[RA][${updateResult.error.reason}] ${updateResult.error.message}`,
        durationMs: elapsed(),
      });
      return;
    }

    logger.info("ra_td_updated", {
      sourceId: source.id,
      scpi:     source.scpi,
      td:       tdResult.td,
      year:     tdResult.year,
      period,
    });

    // Minimal DownloadSuccess entry (no QA / score for rapport annuel)
    const dummyQa: DownloadSuccess["qaResult"] = { status: "OK", warnings: [], metrics: { confidence: 0.5 } };
    const dummyScore: DownloadSuccess["scoreResult"] = {
      score_total: 0, score_rendement: 0, score_secteur: 0, score_geo: 0, score_qualite: 0, score_taille: 0,
      rating: 1, audit_trail: [`rapport_annuel TD=${(tdResult.td * 100).toFixed(2)}% (${tdResult.year})`],
      version: "v1", has_penalty: false, computed_at: new Date().toISOString(),
    };

    successes.push({
      sourceId:   source.id,
      scpi:       source.scpi,
      storageKey: upload.storageKey,
      sizeBytes:  dl.sizeBytes,
      sha256:     dl.sha256,
      isNew:      upload.isNew,
      durationMs: elapsed(),
      qaResult:   dummyQa,
      scoreResult: dummyScore,
    });

  } catch (unexpected) {
    const message = unexpected instanceof Error ? unexpected.message : String(unexpected);
    failures.push({ sourceId: source.id, scpi: source.scpi, reason: `[RA] unexpected: ${message}`, durationMs: elapsed() });
    logger.error("source_unexpected_error", { sourceId: source.id, message });
  }
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

    // ── Phase 1.5: extract structured data from PDF text ──────────────────
    let extraction: ExtractionResult;
    try {
      const pdfText = await parsePdfBuffer(dl.buffer);
      extraction = extractFromText(pdfText);
      logger.info("pdf_extracted", {
        sourceId:              source.id,
        scpi:                  source.scpi,
        confidence:            extraction.confidence,
        critical_fields_found: extraction._meta.critical_fields_found,
        critical_fields_total: extraction._meta.critical_fields_total,
        has_capitalisation:    extraction.chiffres_cles.capitalisation !== undefined,
        has_td:                extraction.chiffres_cles.taux_distribution !== undefined,
        has_tof:               extraction.chiffres_cles.taux_occupation_financier !== undefined,
        has_prime_decote:      extraction.valorisation_risque.prime_decote !== undefined,
      });
    } catch (extractErr) {
      const message = extractErr instanceof Error ? extractErr.message : String(extractErr);
      logger.warn("pdf_extraction_failed", { sourceId: source.id, scpi: source.scpi, message });
      extraction = emptyExtraction();
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

    // ── Phase 3.5: persist extraction JSON ────────────────────────────────
    const extractionDbResult = await saveExtraction({
      scpi_slug:  source.scpi,
      period:     upload.period,
      extraction,
    });
    if (!extractionDbResult.ok) {
      logger.warn("extraction_save_failed", {
        sourceId: source.id,
        reason:   extractionDbResult.error.reason,
        message:  extractionDbResult.error.message,
      });
    } else {
      logger.info("extraction_saved", {
        sourceId:   source.id,
        confidence: extraction.confidence,
        period:     upload.period,
      });
    }

    // ── Phase 3.75: upsert scpi_indicators ────────────────────────────────
    const c = extraction.chiffres_cles;
    const f = extraction.structure_frais;
    const v = extraction.valorisation_risque;
    const l = extraction.indicateurs_locatifs;

    // Calculer prime_décote si les deux prix sont disponibles dans le même bulletin
    let primDecote: number | undefined;
    if (c.prix_part !== undefined && v.prix_reconstitution !== undefined && v.prix_reconstitution > 0) {
      primDecote = ((c.prix_part - v.prix_reconstitution) / v.prix_reconstitution) * 100;
    } else if (v.prime_decote !== undefined) {
      primDecote = v.prime_decote * 100;
    }

    const sectorMap = extraction.repartition_sectorielle.length > 0
      ? Object.fromEntries(extraction.repartition_sectorielle.map(i => [i.secteur, i.poids]))
      : undefined;

    const geoMap = extraction.repartition_geographique.length > 0
      ? Object.fromEntries(extraction.repartition_geographique.map(i => [i.pays, i.poids]))
      : undefined;

    const indicatorsPayload: IndicatorsPayload = {
      scpi_slug:          source.scpi,
      source_period:      upload.period,
      source_confidence:  extraction.confidence,
      ...(c.taux_distribution            !== undefined && { td:                          c.taux_distribution * 100 }),
      ...(c.taux_occupation_financier    !== undefined && { tof:                         c.taux_occupation_financier * 100 }),
      ...(c.taux_occupation_physique     !== undefined && { top:                         c.taux_occupation_physique * 100 }),
      ...(c.capitalisation               !== undefined && { capitalisation:              c.capitalisation }),
      ...(c.prix_part                    !== undefined && { prix_souscription:           c.prix_part }),
      ...(v.prix_reconstitution          !== undefined && { prix_reconstitution:         v.prix_reconstitution }),
      ...(primDecote                     !== undefined && { prime_decote:               primDecote }),
      ...(f.frais_souscription           !== undefined && { frais_souscription:          f.frais_souscription * 100 }),
      ...(f.frais_gestion                !== undefined && { frais_gestion:              f.frais_gestion * 100 }),
      ...(f.commission_performance       !== undefined && { commission_performance:     f.commission_performance * 100 }),
      ...(f.frais_sortie                 !== undefined && { frais_sortie:               f.frais_sortie * 100 }),
      ...(extraction.profil_risque.niveau !== undefined && { srri:                      extraction.profil_risque.niveau }),
      ...(c.journalisation               !== undefined && { duree_detention_recommandee: c.journalisation }),
      ...(c.delai_jouissance             !== undefined && { delai_jouissance:           c.delai_jouissance / 30.44 }),
      ...(l.walt                         !== undefined && { walt:                        l.walt }),
      ...(l.walb                         !== undefined && { walb:                        l.walb }),
      ...(sectorMap                      !== undefined && { repartition_sectorielle:    sectorMap }),
      ...(geoMap                         !== undefined && { repartition_geographique:   geoMap }),
    };

    const indicatorsResult = await upsertIndicators(indicatorsPayload);
    if (!indicatorsResult.ok) {
      logger.warn("indicators_upsert_failed", {
        sourceId: source.id,
        reason:   indicatorsResult.error.reason,
        message:  indicatorsResult.error.message,
      });
    } else if (extraction.confidence >= 0.3) {
      logger.info("indicators_upserted", {
        sourceId:   source.id,
        scpi:       source.scpi,
        confidence: extraction.confidence,
        period:     upload.period,
        prime_decote: primDecote,
      });
    }

    // ── Phase 4: quality assurance ─────────────────────────────────────────
    const qaResult = runQa(toExtractedMetrics(extraction));

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
    const scoringInput = fromExtraction(source.scpi, extraction);

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
    sources = sources.filter((s) => s.id === slugFilter || s.scpi === slugFilter);
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
    (source) =>
      source.document_type === "rapport_annuel"
        ? processRapportAnnuelSource(source, runId, successes, failures)
        : processSource(source, runId, successes, failures)
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
