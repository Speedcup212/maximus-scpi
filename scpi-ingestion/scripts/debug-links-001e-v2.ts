/**
 * Debug 001E v2 — Teste l'URL /documentation d'Iroko
 */
import "dotenv/config";
import { extractPdfLinks } from "../src/html.js";
import { fetchRenderedHtml } from "../src/playwright.js";

const URLS = [
  "https://www.iroko.eu/documentation",
  "https://www.iroko.eu/fr/documentation",
  "https://www.iroko.eu/investisseurs",
];

for (const PAGE_URL of URLS) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`URL : ${PAGE_URL}`);
  console.log("=".repeat(60));

  const result = await fetchRenderedHtml(PAGE_URL);
  if (!result.ok) {
    console.log(`Playwright failed: ${result.error.message}`);
    continue;
  }

  const allLinks = extractPdfLinks(result.value, PAGE_URL, "bulletin_trimestriel");
  const raLinks  = extractPdfLinks(result.value, PAGE_URL, "rapport_annuel");

  console.log(`Liens PDF totaux (sans filtre exclusion bulletin) : ${allLinks.length}`);
  allLinks.slice(0, 10).forEach((l, i) =>
    console.log(`  [${i}] ${l.href.slice(0, 80)}\n       "${l.text.slice(0, 60)}"`)
  );

  console.log(`\nLiens PDF rapport_annuel seulement : ${raLinks.length}`);
  raLinks.forEach((l, i) =>
    console.log(`  [${i}] ${l.href.slice(0, 80)}\n       "${l.text.slice(0, 60)}"`)
  );

  // Chercher "rapport" dans le HTML brut
  const anchorRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  let rapportCount = 0;
  while ((m = anchorRe.exec(result.value)) !== null) {
    const attrs = m[1] ?? "";
    const inner = (m[2] ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const href  = /href\s*=\s*["']([^"']*?)["']/i.exec(attrs)?.[1] ?? "";
    if (/rapport|annuel|annual/i.test(href + " " + inner) && rapportCount < 10) {
      console.log(`  RAPPORT: href="${href.slice(0, 80)}" text="${inner.slice(0, 60)}"`);
      rapportCount++;
    }
  }
  if (rapportCount === 0) console.log("  (aucun lien rapport/annuel trouvé)");

  // Stop after first successful URL
  if (allLinks.length > 0) break;
}
