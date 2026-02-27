// ─── Types ────────────────────────────────────────────────────────────────────

export interface RetryOptions {
  /** Total number of attempts (1 = no retry). Default: 3 */
  readonly maxAttempts: number;
  /** Delay before the second attempt in ms. Default: 1 000 */
  readonly initialDelayMs: number;
  /** Multiplier applied to the delay after each attempt. Default: 2 */
  readonly backoffFactor: number;
  /** Maximum random jitter added to each delay in ms. Default: 500 */
  readonly jitterMs: number;
}

export const DEFAULT_RETRY: RetryOptions = {
  maxAttempts:    3,
  initialDelayMs: 1_000,
  backoffFactor:  2,
  jitterMs:       500,
};

// ─── Retryability classifier ──────────────────────────────────────────────────

/**
 * Returns true for transient errors that are worth retrying:
 *   • HTTP 5xx          — server-side transient failure
 *   • Request timeout   — our "timed out" message
 *   • TCP-level errors  — ECONNRESET, ECONNREFUSED, ETIMEDOUT, ENOTFOUND, EPIPE
 *
 * Explicitly NOT retried (permanent failures):
 *   • HTTP 4xx          — bad URL / forbidden / not found
 *   • Too many redirects
 *   • Unexpected content-type (server returns HTML instead of PDF)
 *   • File too small / too large
 */
export function isRetryable(error: Error): boolean {
  const msg = error.message;

  if (/\bHTTP 5\d{2}\b/.test(msg)) return true;
  if (msg.includes("timed out"))    return true;

  const code = (error as NodeJS.ErrnoException).code;
  if (code !== undefined) {
    return (["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "EPIPE", "EHOSTUNREACH"] as string[]).includes(code);
  }

  return false;
}

// ─── Core utility ─────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes `fn`, retrying on retryable errors with exponential backoff + jitter.
 *
 * Delay schedule (with default options, no jitter):
 *   attempt 1 → runs immediately
 *   attempt 2 → wait ~1 000 ms then retry
 *   attempt 3 → wait ~2 000 ms then retry
 *
 * Throws the last error if all attempts are exhausted or the error is
 * not retryable.
 *
 * @param fn        The async function to execute.
 * @param options   Retry configuration; defaults to DEFAULT_RETRY.
 * @param onRetry   Optional callback invoked before each retry sleep.
 *                  Useful for structured logging without coupling this
 *                  utility to a specific logger.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY,
  onRetry?: (attempt: number, error: Error, delayMs: number) => void
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      const isLastAttempt = attempt >= options.maxAttempts;

      if (isLastAttempt || !isRetryable(error)) throw error;

      const delayMs = Math.round(
        options.initialDelayMs * Math.pow(options.backoffFactor, attempt - 1) +
        Math.random() * options.jitterMs
      );

      onRetry?.(attempt, error, delayMs);
      await sleep(delayMs);
    }
  }
}
