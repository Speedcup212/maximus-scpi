import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// ─── Public interface ─────────────────────────────────────────────────────────

export interface HashIndex {
  /** Returns the file path of the matching file, or null if not found. */
  find(sha256: string): string | null;
  /** Register a newly saved file so subsequent downloads in the same run can detect it. */
  add(sha256: string, filePath: string): void;
  /** Number of entries currently in the index. */
  readonly size: number;
}

// ─── Builder ──────────────────────────────────────────────────────────────────

/**
 * Reads every existing .pdf file in `dir`, hashes each one with SHA-256,
 * and returns a HashIndex that answers find() in O(1).
 *
 * Called once at the start of each run so that subsequent downloads can
 * deduplicate against both historical files AND files saved earlier in the
 * same run (via `add`).
 *
 * Unreadable files are silently skipped — they do not block the run.
 */
export function buildHashIndex(dir: string): HashIndex {
  const map = new Map<string, string>();

  if (fs.existsSync(dir)) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".pdf")) continue;
      const filePath = path.join(dir, entry.name);
      try {
        const digest = crypto
          .createHash("sha256")
          .update(fs.readFileSync(filePath))
          .digest("hex");
        map.set(digest, filePath);
      } catch {
        // Best effort — unreadable file does not invalidate the run.
      }
    }
  }

  return {
    find(sha256: string): string | null {
      return map.get(sha256) ?? null;
    },
    add(sha256: string, filePath: string): void {
      map.set(sha256, filePath);
    },
    get size(): number {
      return map.size;
    },
  };
}
