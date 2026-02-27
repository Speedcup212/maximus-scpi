import https from "node:https";
import http from "node:http";
import crypto from "node:crypto";
import { type Source, type DownloadFailure, type Result, ok, err } from "./types.js";
import { withRetry, DEFAULT_RETRY } from "./retry.js";
import { logger } from "./logger.js";

const TIMEOUT_MS    = 30_000;
const MAX_REDIRECTS = 5;
const MIN_PDF_BYTES = 1_024;                   // 1 KB — reject empty/stub files
const MAX_PDF_BYTES = 100 * 1_024 * 1_024;    // 100 MB guard

// ─── Intermediate type (pipeline-internal, not exported from types.ts) ───────

export interface DownloadedBytes {
  readonly sourceId: string;
  readonly scpi: string;
  /** PDF content held in memory; passed directly to the storage uploader. */
  readonly buffer: Buffer;
  readonly sizeBytes: number;
  /** SHA-256 hex digest, computed while streaming. */
  readonly sha256: string;
  readonly durationMs: number;
}

export type DownloadBytesResult = Result<DownloadedBytes, DownloadFailure>;

// ─── Core fetch ───────────────────────────────────────────────────────────────

/**
 * Fetches `url` into a memory Buffer, simultaneously streaming bytes through a
 * SHA-256 hasher.  Follows redirects up to `redirectsLeft` hops.
 *
 * Timeout: a 30-second socket-inactivity timeout is set on the request.  The
 * `withRetry` wrapper in `downloadPdf` handles retrying on transient failures.
 */
function fetchToBuffer(
  url: string,
  redirectsLeft: number
): Promise<{ buffer: Buffer; sizeBytes: number; sha256: string }> {
  return new Promise((resolve, reject) => {
    if (redirectsLeft < 0) {
      reject(new Error("too many redirects"));
      return;
    }

    const parsed = new URL(url);
    const transport = parsed.protocol === "https:" ? https : http;

    // Settled flag prevents double-rejection when both req.error and the
    // destroy-triggered error fire after a timeout.
    let settled = false;
    const fail = (e: Error): void => {
      if (!settled) { settled = true; reject(e); }
    };

    const req = transport.get(url, { timeout: TIMEOUT_MS }, (res) => {
      const status = res.statusCode ?? 0;

      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume();
        const next = new URL(res.headers.location, url).href;
        fetchToBuffer(next, redirectsLeft - 1).then(resolve).catch(reject);
        return;
      }

      if (status < 200 || status >= 300) {
        res.resume();
        fail(new Error(`HTTP ${status} for ${url}`));
        return;
      }

      const contentType = res.headers["content-type"] ?? "";
      const isLikelyPdf =
        contentType.includes("application/pdf") ||
        contentType.includes("octet-stream") ||
        contentType === "";

      const hash   = crypto.createHash("sha256");
      const chunks: Buffer[] = [];
      let sizeBytes = 0;
      let firstChunk = true;

      res.on("data", (chunk: Buffer) => {
        if (settled) return;
        if (firstChunk && chunk.length >= 4 && !isLikelyPdf) {
          const sig = chunk.slice(0, 4).toString("utf-8");
          if (sig !== "%PDF") {
            fail(new Error(`response is not a PDF (got ${sig})`));
            return;
          }
          firstChunk = false;
        }
        sizeBytes += chunk.length;
        if (sizeBytes > MAX_PDF_BYTES) {
          req.destroy(new Error(`PDF exceeds ${MAX_PDF_BYTES / (1024 * 1024)} MB limit`));
          return;
        }
        hash.update(chunk);
        chunks.push(chunk);
      });

      res.on("end", () => {
        if (settled) return;
        if (sizeBytes < MIN_PDF_BYTES) {
          fail(new Error(`downloaded file is too small (${sizeBytes} bytes)`));
          return;
        }
        const buf = Buffer.concat(chunks);
        if (buf.length >= 4 && buf.slice(0, 4).toString("utf-8") !== "%PDF") {
          fail(new Error("downloaded content is not a PDF (missing %PDF signature)"));
          return;
        }
        settled = true;
        resolve({
          buffer:    buf,
          sizeBytes,
          sha256:    hash.digest("hex"),
        });
      });

      res.on("error", fail);
    });

    req.on("timeout", () => {
      req.destroy(new Error(`request timed out after ${TIMEOUT_MS}ms`));
    });

    req.on("error", fail);
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Downloads the PDF at `pdfUrl` into memory with automatic retry.
 *
 * `pdfUrl` is the resolved direct PDF URL.  It may differ from `source.url`
 * when the source is an HTML documentation page — in that case the caller
 * (index.ts) has already run `fetchBestPdfLink` to discover the actual PDF URL.
 *
 * Retry policy (DEFAULT_RETRY):
 *   • Up to 3 total attempts
 *   • Exponential backoff: ~1 s → ~2 s between attempts (+ up to 500 ms jitter)
 *   • Retried: HTTP 5xx, timeouts, TCP errors (ECONNRESET, ETIMEDOUT, …)
 *   • NOT retried: HTTP 4xx, wrong content-type, file too small / too large,
 *     too many redirects
 *
 * No files are written to disk; the caller is responsible for persisting the
 * returned Buffer (e.g. by uploading it to Supabase Storage).
 */
export async function downloadPdf(source: Source, pdfUrl: string): Promise<DownloadBytesResult> {
  const startedAt = Date.now();
  try {
    const { buffer, sizeBytes, sha256 } = await withRetry(
      () => fetchToBuffer(pdfUrl, MAX_REDIRECTS),
      DEFAULT_RETRY,
      (attempt, error, delayMs) => {
        logger.warn("download_retry", {
          sourceId: source.id,
          attempt,
          reason:   error.message,
          delayMs,
        });
      }
    );
    return ok({
      sourceId:    source.id,
      scpi:        source.scpi,
      buffer,
      sizeBytes,
      sha256,
      durationMs:  Date.now() - startedAt,
    });
  } catch (e) {
    return err({
      sourceId:   source.id,
      scpi:       source.scpi,
      reason:     e instanceof Error ? e.message : String(e),
      durationMs: Date.now() - startedAt,
    });
  }
}
