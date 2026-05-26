import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { type MaximusScoreResult, type Result, ok, err } from "./types.js";
import { type ExtractionResult } from "./extractor.js";

const BUCKET = "scpi-bulletins";
const TABLE  = "scpi_bulletins";

// PostgreSQL error code for unique-key violations
const PG_UNIQUE_VIOLATION = "23505";

// ─── Env validation ──────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// ─── Singleton client ────────────────────────────────────────────────────────
// Initialised lazily on first use so env vars (e.g. loaded via dotenv) are
// available before the module executes top-level code.

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client === null) {
    _client = createClient(
      requireEnv("SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false } }
    );
  }
  return _client;
}

// ─── Storage types ────────────────────────────────────────────────────────────

export type StorageErrorReason =
  | "PERIOD_NOT_FOUND"  // cannot derive YYYY-Tn period from source metadata
  | "UPLOAD_FAILED"     // Supabase returned a non-409 storage error
  | "ENV_MISSING";      // required environment variable is absent

export interface StorageError {
  readonly reason: StorageErrorReason;
  readonly message: string;
}

export interface StorageSuccess {
  /** Full storage object key: scpi_slug/YYYY-Tn/sha256.pdf */
  readonly storageKey: string;
  /** Normalized period string used to build the path, e.g. "2025-T3". */
  readonly period: string;
  /** true → object was just uploaded; false → key already existed (409). */
  readonly isNew: boolean;
}

// ─── Database types ───────────────────────────────────────────────────────────

/** Outcome of a recordBulletin() call. */
export type DbOutcome =
  | "inserted"   // new row created
  | "duplicate"  // identical (scpi_slug, period, sha256) already in the table
  | "revision";  // same (scpi_slug, period) but different sha256 — bulletin was revised

export type DbErrorReason = "DB_ERROR" | "ENV_MISSING";

export interface DbSuccess {
  readonly outcome: DbOutcome;
  /**
   * SHA-256 of the previously stored PDF.
   * Present only when outcome === "revision".
   */
  readonly previousHash?: string;
}

export interface DbError {
  readonly reason: DbErrorReason;
  readonly message: string;
}

// ─── Internal: row shape ──────────────────────────────────────────────────────

interface BulletinRow {
  readonly scpi_slug: string;
  readonly period: string;
  readonly pdf_path: string;
  readonly pdf_sha256: string;
  readonly source_url: string;
  readonly run_id: string;
}

// ─── Internal: storage duplicate detection ───────────────────────────────────

/**
 * Returns true when the Storage error is a 409 Conflict (object already exists).
 * Checks the numeric/string status code AND the message as a fallback for SDK
 * version variance.
 */
function isAlreadyExistsError(error: { message: string }): boolean {
  const status: unknown = (error as Record<string, unknown>)["status"];
  return (
    status === 409 ||
    (typeof status === "string" && status === "409") ||
    error.message.toLowerCase().includes("already exists")
  );
}

// ─── Public API: storage upload ───────────────────────────────────────────────

/**
 * Uploads a PDF buffer to the `scpi-bulletins` Supabase Storage bucket.
 *
 * Storage path: `scpi_slug/YYYY-Tn/sha256.pdf`
 *
 * Deduplication: the sha256 hash is the filename, so two calls with identical
 * content for the same (scpi, period) always resolve to the same object key.
 * `upsert: false` makes Supabase return 409 when the key already exists —
 * this is treated as a benign duplicate (isNew: false), not an error.
 *
 * `period` must be YYYY-Tn (e.g. "2025-T3") and is derived from the chosen
 * PDF link by the caller (fetchBestPdfLink).
 */
export async function uploadPdf(params: {
  scpi_slug: string;
  period: string;
  buffer: Buffer;
  sha256: string;
}): Promise<Result<StorageSuccess, StorageError>> {
  const { scpi_slug, period, buffer, sha256 } = params;
  const storageKey = `${scpi_slug}/${period}/${sha256}.pdf`;

  // 2. Get (or lazily create) the Supabase client
  let client: SupabaseClient;
  try {
    client = getClient();
  } catch (e) {
    return err({
      reason: "ENV_MISSING",
      message: e instanceof Error ? e.message : String(e),
    });
  }

  // 3. Upload — 409 = duplicate, anything else = error
  const { error } = await client.storage.from(BUCKET).upload(storageKey, buffer, {
    contentType: "application/pdf",
    upsert: false,
  });

  if (error === null) {
    return ok({ storageKey, period, isNew: true });
  }

  if (isAlreadyExistsError(error)) {
    return ok({ storageKey, period, isNew: false });
  }

  return err({
    reason: "UPLOAD_FAILED",
    message: `Supabase Storage error: ${error.message}`,
  });
}

// ─── Public API: database record ─────────────────────────────────────────────

/**
 * Inserts a row into `public.scpi_bulletins`.
 *
 * Conflict handling (two unique constraints):
 *
 *   unique(scpi_slug, period) — same SCPI / same quarter:
 *     • identical sha256  → "duplicate" (benign, skip)
 *     • different sha256  → "revision"  (issuer updated the bulletin)
 *
 *   unique(pdf_sha256) — same content, different (scpi, period):
 *     • treated as "duplicate" (benign cross-source match)
 *
 * DB errors that are NOT unique violations are returned as Err<DbError> and
 * should be treated as pipeline failures by the caller.
 */
export async function recordBulletin(
  row: BulletinRow
): Promise<Result<DbSuccess, DbError>> {
  let client: SupabaseClient;
  try {
    client = getClient();
  } catch (e) {
    return err({
      reason: "ENV_MISSING",
      message: e instanceof Error ? e.message : String(e),
    });
  }

  // ── Happy path: attempt insert ────────────────────────────────────────────
  const { error: insertError } = await client.from(TABLE).insert(row);

  if (insertError === null) {
    return ok({ outcome: "inserted" });
  }

  // ── Conflict on one of the two UNIQUE constraints ─────────────────────────
  if (insertError.code === PG_UNIQUE_VIOLATION) {
    // Determine which constraint was hit by fetching the existing (scpi, period) row.
    const { data: existing, error: fetchError } = await client
      .from(TABLE)
      .select("pdf_sha256")
      .eq("scpi_slug", row.scpi_slug)
      .eq("period", row.period)
      .maybeSingle();

    if (fetchError) {
      return err({ reason: "DB_ERROR", message: fetchError.message });
    }

    if (existing !== null) {
      if (existing.pdf_sha256 === row.pdf_sha256) {
        // Exact same (scpi, period, hash) — idempotent duplicate, nothing to do.
        return ok({ outcome: "duplicate" });
      }
      // Same slot, different content — the issuer published a revised bulletin.
      return ok({ outcome: "revision", previousHash: existing.pdf_sha256 as string });
    }

    // No row for this (scpi, period) — the conflict was on pdf_sha256 (same
    // PDF bytes already recorded for a different scpi/period pair).  Benign.
    return ok({ outcome: "duplicate" });
  }

  // ── Unexpected DB error ───────────────────────────────────────────────────
  return err({ reason: "DB_ERROR", message: insertError.message });
}

// ─── Public API: scpi_indicators upsert ──────────────────────────────────────

export interface IndicatorsPayload {
  readonly scpi_slug:          string;
  readonly source_period:      string;
  readonly source_confidence:  number;
  readonly bulletin_id?:       string;
  // Identité — écrits depuis sources.yaml quand renseignés
  readonly nom?:               string;
  readonly societe_gestion?:   string;
  readonly categorie?:         string;
  // Valeurs extraites — undefined = ne pas écraser l'existant
  readonly td?:                number;
  readonly tof?:               number;
  readonly top?:               number;
  readonly capitalisation?:    number;
  readonly prix_souscription?: number;
  readonly prix_reconstitution?: number;
  readonly prime_decote?:      number;
  readonly frais_souscription?: number;
  readonly frais_gestion?:     number;
  readonly commission_performance?: number;
  readonly frais_sortie?:      number;
  readonly srri?:              number;
  readonly duree_detention_recommandee?: number;
  readonly endettement?:       number;
  readonly delai_jouissance?:  number;
  readonly walt?:              number;
  readonly walb?:              number;
  readonly repartition_sectorielle?:  Record<string, number>;
  readonly repartition_geographique?: Record<string, number>;
  readonly collecte_nette?:    number;
  readonly distribution_par_part?: number;
  readonly report_a_nouveau?:  number;
}

/**
 * Upsert into scpi_indicators.
 * Only fields present in payload overwrite existing values.
 * Fields absent from payload are preserved via COALESCE in the upsert.
 * Skips upsert entirely if confidence < 0.3 (not worth polluting the table).
 */
export async function upsertIndicators(
  payload: IndicatorsPayload
): Promise<Result<void, DbError>> {
  if (payload.source_confidence < 0.3) {
    return ok(undefined);
  }

  let client: SupabaseClient;
  try {
    client = getClient();
  } catch (e) {
    return err({
      reason:  "ENV_MISSING",
      message: e instanceof Error ? e.message : String(e),
    });
  }

  // Build update object — only include defined fields
  const row: Record<string, unknown> = {
    scpi_slug:          payload.scpi_slug,
    source_period:      payload.source_period,
    source_confidence:  payload.source_confidence,
    source_type:        "pipeline",
    updated_at:         new Date().toISOString(),
  };

  if (payload.bulletin_id             !== undefined) row["bulletin_id"]             = payload.bulletin_id;
  if (payload.nom                      !== undefined) row["nom"]                     = payload.nom;
  if (payload.societe_gestion          !== undefined) row["societe_gestion"]         = payload.societe_gestion;
  if (payload.categorie                !== undefined) row["categorie"]               = payload.categorie;
  if (payload.td                       !== undefined) row["td"]                      = payload.td;
  if (payload.tof                      !== undefined) row["tof"]                     = payload.tof;
  if (payload.top                      !== undefined) row["top"]                     = payload.top;
  if (payload.capitalisation           !== undefined) row["capitalisation"]           = payload.capitalisation;
  if (payload.prix_souscription        !== undefined) row["prix_souscription"]        = payload.prix_souscription;
  if (payload.prix_reconstitution      !== undefined) row["prix_reconstitution"]      = payload.prix_reconstitution;
  if (payload.prime_decote             !== undefined) row["prime_decote"]             = payload.prime_decote;
  if (payload.frais_souscription       !== undefined) row["frais_souscription"]       = payload.frais_souscription;
  if (payload.frais_gestion            !== undefined) row["frais_gestion"]            = payload.frais_gestion;
  if (payload.commission_performance   !== undefined) row["commission_performance"]   = payload.commission_performance;
  if (payload.frais_sortie             !== undefined) row["frais_sortie"]             = payload.frais_sortie;
  if (payload.srri                     !== undefined) row["srri"]                     = payload.srri;
  if (payload.duree_detention_recommandee !== undefined) row["duree_detention_recommandee"] = payload.duree_detention_recommandee;
  if (payload.endettement              !== undefined) row["endettement"]              = payload.endettement;
  if (payload.delai_jouissance         !== undefined) row["delai_jouissance"]         = payload.delai_jouissance;
  if (payload.walt                     !== undefined) row["walt"]                     = payload.walt;
  if (payload.walb                     !== undefined) row["walb"]                     = payload.walb;
  if (payload.repartition_sectorielle  !== undefined) row["repartition_sectorielle"]  = payload.repartition_sectorielle;
  if (payload.repartition_geographique !== undefined) row["repartition_geographique"] = payload.repartition_geographique;
  if (payload.collecte_nette           !== undefined) row["collecte_nette"]           = payload.collecte_nette;
  if (payload.distribution_par_part    !== undefined) row["distribution_par_part"]    = payload.distribution_par_part;
  if (payload.report_a_nouveau         !== undefined) row["report_a_nouveau"]         = payload.report_a_nouveau;

  const { error } = await client
    .from("scpi_indicators")
    .upsert(row, { onConflict: "scpi_slug", ignoreDuplicates: false });

  if (error !== null) {
    return err({ reason: "DB_ERROR", message: error.message });
  }

  return ok(undefined);
}

// ─── Public API: extraction storage ──────────────────────────────────────────

/**
 * Persists the full ExtractionResult onto the scpi_bulletins row identified by
 * (scpi_slug, period) using a targeted UPDATE.
 *
 * Requires the extraction_json column (sql/03_add_extraction_column.sql).
 */
export async function saveExtraction(params: {
  scpi_slug:  string;
  period:     string;
  extraction: ExtractionResult;
}): Promise<Result<void, DbError>> {
  let client: SupabaseClient;
  try {
    client = getClient();
  } catch (e) {
    return err({
      reason:  "ENV_MISSING",
      message: e instanceof Error ? e.message : String(e),
    });
  }

  const { error } = await client
    .from(TABLE)
    .update({ extraction_json: params.extraction as unknown as Record<string, unknown> })
    .eq("scpi_slug", params.scpi_slug)
    .eq("period",    params.period);

  if (error !== null) {
    return err({ reason: "DB_ERROR", message: error.message });
  }

  return ok(undefined);
}

// ─── Public API: score storage ────────────────────────────────────────────────

/**
 * Persists a MaximusScoreResult onto the scpi_bulletins row identified by
 * (scpi_slug, period) using a targeted UPDATE.
 *
 * The column `maximus_score` must exist (created by
 * sql/02_add_score_columns.sql).  Silently succeeds if the row has not yet
 * been created (no rows updated is treated as a no-op, not an error).
 */
export async function saveScore(params: {
  scpi_slug: string;
  period:    string;
  score:     MaximusScoreResult;
}): Promise<Result<void, DbError>> {
  let client: SupabaseClient;
  try {
    client = getClient();
  } catch (e) {
    return err({
      reason:  "ENV_MISSING",
      message: e instanceof Error ? e.message : String(e),
    });
  }

  const scoreValue = params.score.score_total;
  const { error } = await client
    .from(TABLE)
    .update({
      maximus_score:      params.score as unknown as Record<string, unknown>,
      maximus_score_value: scoreValue,
    })
    .eq("scpi_slug", params.scpi_slug)
    .eq("period",    params.period);

  if (error !== null) {
    return err({ reason: "DB_ERROR", message: error.message });
  }

  return ok(undefined);
}

// ─── Public API: rapport annuel TD update ─────────────────────────────────────

/**
 * Partial update of scpi_indicators: only sets td + td_annee + ra_source fields.
 * Does NOT overwrite quarterly bulletin data (TOF, capitalisation, etc.).
 * Safe to call even if the SCPI has no existing row (upsert inserts minimal row).
 */
export async function updateTdFromRapportAnnuel(params: {
  readonly scpi_slug:   string;
  /** Taux de distribution — decimal [0, 1] (e.g. 0.0567 for 5.67%) */
  readonly td:          number;
  /** Reporting year (e.g. 2024) */
  readonly td_annee:    number;
  /** Storage period string, e.g. "2024-RA" */
  readonly ra_period:   string;
  /** SHA-256 of the source PDF */
  readonly ra_sha256:   string;
}): Promise<Result<void, DbError>> {
  let client: SupabaseClient;
  try {
    client = getClient();
  } catch (e) {
    return err({
      reason:  "ENV_MISSING",
      message: e instanceof Error ? e.message : String(e),
    });
  }

  const { error } = await client
    .from("scpi_indicators")
    .upsert(
      {
        scpi_slug:        params.scpi_slug,
        td:               params.td,
        td_annee:         params.td_annee,
        ra_source_period: params.ra_period,
        ra_source_sha256: params.ra_sha256,
        ra_updated_at:    new Date().toISOString(),
      },
      {
        onConflict:       "scpi_slug",
        ignoreDuplicates: false,
      }
    );

  if (error !== null) {
    return err({ reason: "DB_ERROR", message: error.message });
  }

  return ok(undefined);
}
