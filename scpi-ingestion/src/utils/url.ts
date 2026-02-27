/**
 * Strip tracking params (utm_*, gclid, etc.) from URLs.
 * Returns a clean URL suitable for deduplication and storage.
 */
export function stripTrackingParams(url: string): string {
  try {
    const u = new URL(url);
    const toRemove = new Set<string>();
    for (const key of u.searchParams.keys()) {
      const k = key.toLowerCase();
      if (
        k.startsWith("utm_") ||
        k === "gclid" ||
        k === "fbclid" ||
        k === "msclkid" ||
        k === "ref" ||
        k === "source"
      ) {
        toRemove.add(key);
      }
    }
    toRemove.forEach((k) => u.searchParams.delete(k));
    return u.href;
  } catch {
    return url;
  }
}
