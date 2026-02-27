// ─── Structured JSON logger ───────────────────────────────────────────────────
//
// All output is newline-delimited JSON (NDJSON).
// info → stdout  |  warn / error → stderr
//
// The logger never throws: serialization failures fall back to a minimal
// safe envelope so the pipeline always emits valid JSON lines.

export type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  readonly level: LogLevel;
  readonly ts: string;
  readonly msg: string;
  readonly data?: Record<string, unknown>;
}

// ─── Safe serialization ───────────────────────────────────────────────────────

/**
 * JSON.stringify replacer that converts Error instances to plain objects so
 * they are not silently serialized as `{}` by the default replacer.
 */
function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name:    value.name,
      message: value.message,
      stack:   value.stack,
    };
  }
  return value;
}

/**
 * Serializes `entry` to a JSON string.  Falls back to a minimal safe envelope
 * if the entry contains circular references or any other non-serializable value.
 */
function safeStringify(entry: LogEntry): string {
  try {
    return JSON.stringify(entry, replacer);
  } catch {
    // Fallback: emit at least level + timestamp + message so the log line is
    // never silently dropped, even if the data payload cannot be serialized.
    return JSON.stringify({
      level:  entry.level,
      ts:     entry.ts,
      msg:    entry.msg,
      _error: "log_serialization_failed",
    });
  }
}

// ─── Emit ─────────────────────────────────────────────────────────────────────

function emit(level: LogLevel, msg: string, data?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    ts: new Date().toISOString(),
    msg,
    ...(data !== undefined ? { data } : {}),
  };
  const line = safeStringify(entry) + "\n";
  if (level === "error" || level === "warn") {
    process.stderr.write(line);
  } else {
    process.stdout.write(line);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const logger = {
  info(msg: string, data?: Record<string, unknown>): void {
    emit("info", msg, data);
  },
  warn(msg: string, data?: Record<string, unknown>): void {
    emit("warn", msg, data);
  },
  error(msg: string, data?: Record<string, unknown>): void {
    emit("error", msg, data);
  },
} as const;
