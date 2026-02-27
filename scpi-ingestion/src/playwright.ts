/**
 * Playwright fallback renderer.
 *
 * Launches a headless Chromium browser, navigates to the target URL, waits
 * for network idle, and returns the fully rendered HTML string.
 *
 * The returned HTML is then fed into the same regex-based PDF extractor used
 * for static pages (html.ts: extractPdfLinks), so all three extraction
 * strategies (anchors, data-href, script strings) work identically on both
 * static and JS-rendered pages.
 *
 * Design principles:
 *   • Playwright is loaded via a dynamic import in getBrowser() so it is
 *     never required at process startup — the module is only resolved when
 *     the fallback is first needed.
 *   • The Browser instance is a lazy singleton: one browser is shared across
 *     all fallback calls within a single run for efficiency.
 *   • Call shutdownPlaywright() at the end of a run to close the browser.
 *
 * Setup (one-time, per environment):
 *   npm install playwright
 *   npx playwright install chromium --with-deps
 */

// `import type` is erased at runtime — this gives us TypeScript types for the
// Browser variable without requiring playwright to be loaded at startup.
import type { Browser } from "playwright";
import { type Result, ok, err } from "./types.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PlaywrightErrorReason =
  | "NOT_INSTALLED"      // playwright package not in node_modules
  | "BROWSER_NOT_FOUND"  // browser binaries not installed (needs: npx playwright install)
  | "LAUNCH_FAILED"      // chromium.launch() threw an unexpected error
  | "NAVIGATION_FAILED"; // page.goto() or page.content() threw

export interface PlaywrightError {
  readonly reason: PlaywrightErrorReason;
  readonly message: string;
  readonly url: string;
}

// ─── Singleton browser ────────────────────────────────────────────────────────

const NAVIGATION_TIMEOUT_MS = 60_000; // JS-heavy pages can be slow to idle

let _browser: Browser | null = null;

/**
 * Lazily launches a headless Chromium browser.
 * Reuses the existing instance if already running.
 * Throws a human-readable Error on any failure.
 */
async function getBrowser(): Promise<Browser> {
  if (_browser !== null) return _browser;

  // Dynamic import: resolves only here so the module load cost is paid once,
  // only when the Playwright fallback is actually triggered.
  let pw: typeof import("playwright");
  try {
    pw = await import("playwright");
  } catch (e) {
    throw new Error(
      `playwright is not installed. ` +
      `Add it with: npm install playwright && npx playwright install chromium --with-deps. ` +
      `Original error: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  try {
    _browser = await pw.chromium.launch({ headless: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Common case: binaries not installed
    if (msg.includes("Executable doesn't exist") || msg.includes("browserType.launch")) {
      throw new Error(
        `Chromium binaries not found. Run: npx playwright install chromium --with-deps. ` +
        `Original error: ${msg}`
      );
    }
    throw new Error(`Failed to launch Chromium: ${msg}`);
  }

  return _browser;
}

/**
 * Closes the browser if it is running.
 * Safe to call even if Playwright was never used during the run.
 */
export async function shutdownPlaywright(): Promise<void> {
  if (_browser !== null) {
    await _browser.close().catch(() => { /* best effort */ });
    _browser = null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Opens `pageUrl` in a headless Chromium browser, waits until the network is
 * idle (all XHR/fetch requests have settled), then returns the fully rendered
 * HTML as a string via `page.content()`.
 *
 * The caller (html.ts) passes the returned HTML through the standard regex-
 * based extractor — no browser-context DOM APIs are needed here, which keeps
 * this module free of DOM type dependencies.
 *
 * Extra headers are set to resemble a real French browser session so that
 * CDNs and DDOS-protection layers do not block the request.
 */
export async function fetchRenderedHtml(
  pageUrl: string
): Promise<Result<string, PlaywrightError>> {
  let browser: Browser;
  try {
    browser = await getBrowser();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    let reason: PlaywrightErrorReason;
    if (message.includes("not installed") || message.includes("Cannot find module")) {
      reason = "NOT_INSTALLED";
    } else if (message.includes("binaries not found") || message.includes("Executable doesn't exist")) {
      reason = "BROWSER_NOT_FOUND";
    } else {
      reason = "LAUNCH_FAILED";
    }
    return err({ reason, message, url: pageUrl });
  }

  const page = await browser.newPage().catch((e: unknown) => {
    throw new Error(`newPage() failed: ${e instanceof Error ? e.message : String(e)}`);
  });

  try {
    // Mimic a real browser to avoid bot detection
    await page.setExtraHTTPHeaders({
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      "Cache-Control":   "no-cache",
    });

    await page.goto(pageUrl, {
      waitUntil: "networkidle",
      timeout:   NAVIGATION_TIMEOUT_MS,
    });

    // page.content() returns the full serialised DOM — equivalent to
    // document.documentElement.outerHTML in the browser.
    const html = await page.content();
    return ok(html);

  } catch (e) {
    return err({
      reason:  "NAVIGATION_FAILED",
      message: e instanceof Error ? e.message : String(e),
      url:     pageUrl,
    });
  } finally {
    // Always close the page to free memory; the browser stays alive for reuse.
    await page.close().catch(() => { /* best effort */ });
  }
}
