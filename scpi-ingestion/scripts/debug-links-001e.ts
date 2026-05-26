/**
 * Debug 001E — Affiche tous les liens PDF trouvés sur la page Iroko Zen
 * sans aucun filtre, pour diagnostiquer les patterns disponibles.
 */
import "dotenv/config";
import { extractPdfLinks } from "../src/html.js";
import { fetchRenderedHtml } from "../src/playwright.js";

const PAGE_URL = "https://www.iroko.eu/scpi-iroko-zen/";

console.log(`Chargement Playwright : ${PAGE_URL}\n`);

const result = await fetchRenderedHtml(PAGE_URL);
if (!result.ok) {
  console.error("Playwright failed:", result.error.message);
  process.exit(1);
}

// Tous les liens PDF sans aucun filtre (mode bulletin = filtrage minimal)
const allLinks = extractPdfLinks(result.value, PAGE_URL, "bulletin_trimestriel");

// Aussi chercher les liens bruts dans le HTML (anchors)
const anchorRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
const pdfMentions: string[] = [];
let m: RegExpExecArray | null;
while ((m = anchorRe.exec(result.value)) !== null) {
  const attrs = m[1] ?? "";
  const inner = (m[2] ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const href  = /href\s*=\s*["']([^"']*?)["']/i.exec(attrs)?.[1] ?? "";
  if (/\.pdf|rapport|annuel|annual|document/i.test(href + " " + inner)) {
    pdfMentions.push(`href="${href}" | text="${inner.slice(0, 80)}"`);
  }
}

console.log(`=== Liens PDF trouvés (mode bulletin, après exclusions) : ${allLinks.length} ===`);
allLinks.forEach((l, i) => console.log(`  [${i}] ${l.href}\n       "${l.text.slice(0, 80)}"`));

console.log(`\n=== Anchors contenant "pdf|rapport|annuel|annual|document" (brut) : ${pdfMentions.length} ===`);
pdfMentions.slice(0, 20).forEach((m, i) => console.log(`  [${i}] ${m}`));

// Chercher "rapport" dans le HTML brut (hors balises)
const rapportCtx = [...result.value.matchAll(/rapport[^<]{0,100}/gi)]
  .slice(0, 15)
  .map(m => m[0].replace(/\s+/g, " ").trim());
console.log(`\n=== Occurrences de "rapport" dans le HTML : ${rapportCtx.length} (max 15) ===`);
rapportCtx.forEach((c, i) => console.log(`  [${i}] ${c}`));
