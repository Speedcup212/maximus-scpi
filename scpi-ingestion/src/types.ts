// ─── Result<T, E> monad ──────────────────────────────────────────────────────

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = string> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

// ─── Source schema ───────────────────────────────────────────────────────────

/**
 * Type de document à extraire pour cette source.
 * - bulletin_trimestriel : bulletin trimestriel T1-T4 (comportement par défaut)
 * - rapport_annuel       : rapport annuel — seul le taux de distribution est extrait
 */
export type PipelineDocumentType = 'bulletin_trimestriel' | 'rapport_annuel';

export interface Source {
  /** SCPI identifier slug (e.g. "iroko-zen", "comete") */
  readonly scpi: string;
  /** Official documentation page URL — pipeline loads with Playwright and extracts latest PDF */
  readonly pageUrl: string;
  /** Derived id for logging (scpi slug, or scpi:ra for rapport annuel) */
  readonly id: string;
  /** Document type to extract — defaults to "bulletin_trimestriel" */
  readonly document_type: PipelineDocumentType;
  /** Target reporting year for rapport_annuel (e.g. 2024). Ignored for bulletin_trimestriel. */
  readonly ra_year?: number;
}

export interface SourcesFile {
  readonly sources: Source[];
}

// ─── Download result ─────────────────────────────────────────────────────────

export interface DownloadSuccess {
  readonly sourceId: string;
  readonly scpi: string;
  /** Supabase Storage object key: scpi_slug/YYYY-Tn/sha256.pdf */
  readonly storageKey: string;
  readonly sizeBytes: number;
  /** SHA-256 hex digest of the downloaded content. */
  readonly sha256: string;
  /**
   * true  — file was new and has been written to Supabase Storage.
   * false — an object with the same key already existed; nothing was uploaded.
   */
  readonly isNew: boolean;
  /** Wall-clock duration covering download, storage upload, and DB record. */
  readonly durationMs: number;
  /** Quality-assurance result for the extracted bulletin metrics. */
  readonly qaResult: QaResult;
  /** MaximusSCPI score computed from extracted metrics (v1). */
  readonly scoreResult: MaximusScoreResult;
}

export interface DownloadFailure {
  readonly sourceId: string;
  readonly scpi: string;
  readonly reason: string;
  readonly durationMs: number;
}

// ─── Scoring types ───────────────────────────────────────────────────────────

/**
 * Input for the MaximusSCPI scoring engine (backend-native units).
 * All percentages in %, monetary amounts in M€ or € as noted.
 */
export interface MaximusScoringInput {
  readonly scpi_slug:               string;
  readonly rendement?:              number;   // %, e.g. 5.67
  readonly tof?:                    number;   // %, e.g. 94.5
  readonly endettement?:            number;   // LTV %, e.g. 25
  readonly label_isr?:              string;   // "oui" | "non"
  readonly sfdr?:                   string;   // "6" | "8" | "9"
  readonly capitalisation?:         number;   // M€, e.g. 850
  readonly delai_jouissance?:       number;   // months, e.g. 2
  readonly prix_souscription?:      number;   // €
  readonly valeur_reconstitution?:  number;   // €
  readonly frais_gestion?:          number;   // %, e.g. 13
  readonly frais_souscription?:     number;   // %, e.g. 9.5
  readonly repartition_sectorielle?:  Record<string, number>;
  readonly repartition_geographique?: Record<string, number>;
}

/**
 * Scoring result produced by computeMaximusScore().
 * Stored as JSONB in scpi_bulletins.maximus_score.
 */
export interface MaximusScoreResult {
  readonly score_total:     number;    // 0-100
  readonly score_rendement: number;    // 0-40
  readonly score_secteur:   number;    // 0-20
  readonly score_geo:       number;    // 0-15
  readonly score_qualite:   number;    // 0-15
  readonly score_taille:    number;    // 0-10
  /** 1-5 star rating derived from score_total (same thresholds as guidedJourneyLogic.ts). */
  readonly rating:          number;    // 1-5
  readonly audit_trail:     string[];
  readonly version:         "v1";
  /** true = all three critical fields (rendement, tof, capitalisation) absent */
  readonly has_penalty:     boolean;
  readonly computed_at:     string;    // ISO 8601
}

// ─── QA types ────────────────────────────────────────────────────────────────

/**
 * Metrics extracted from a bulletin PDF.
 * All financial fields are optional — they may not be present in every bulletin
 * or may fail to parse.  `confidence` is always required (0 = no extraction
 * attempted, 1 = fully confident).
 */
export interface ExtractedMetrics {
  /** Taux d'Occupation Financier — expected in [0.70, 1.00] */
  readonly tof?: number;
  /** Taux de Distribution — expected ≤ 0.15 */
  readonly td?: number;
  /** Total capitalisation in EUR — expected ≥ 5,000,000 */
  readonly capitalisation?: number;
  /** Extraction confidence score in [0, 1] */
  readonly confidence: number;
}

export type QaStatus = "OK" | "NEEDS_REVIEW";

export type QaWarningField = "tof" | "td" | "capitalisation";

export interface QaWarning {
  readonly field: QaWarningField;
  readonly message: string;
  readonly value: number;
}

export interface QaResult {
  readonly status: QaStatus;
  readonly warnings: readonly QaWarning[];
  readonly metrics: ExtractedMetrics;
}

// ─── Run report ──────────────────────────────────────────────────────────────

export interface RunReport {
  readonly runId: string;
  readonly startedAt: string;      // ISO 8601
  readonly endedAt: string;        // ISO 8601
  readonly durationMs: number;
  readonly totalSources: number;
  readonly successCount: number;
  readonly failedCount: number;
  /** Successful operations where isNew === true. */
  readonly newBulletins: number;
  /** Successful operations where isNew === false (object already in storage). */
  readonly duplicates: number;
  /** Successful operations where qaResult.status === "NEEDS_REVIEW". */
  readonly needsReview: number;
  readonly successes: DownloadSuccess[];
  readonly failures: DownloadFailure[];
}
