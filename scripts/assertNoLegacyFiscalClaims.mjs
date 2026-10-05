import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');

const walkHtml = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkHtml(fullPath);
    return entry.isFile() && entry.name.endsWith('.html') ? [fullPath] : [];
  });
};

const forbidden = [
  { label: 'PS 0% shortcut', pattern: /PS\s*0\s*%/i },
  { label: 'automatic IFI exemption claim', pattern: /exon[ée]r[ée]e?s?\s+d['’]IFI/i },
  { label: 'IFI exemption shortcut', pattern: /exon[ée]ration\s+IFI/i },
  { label: 'hard-coded net by TMI', pattern: /Net\s+TMI\s*\d+\s*%\s*:\s*~?\s*\d+(?:[.,]\d+)?\s*%/i },
  { label: 'automatic TMI + PS total', pattern: /TMI\s*\d+\s*%\s*\+\s*PS\s*17[.,]2\s*%\s*=\s*\d+(?:[.,]\d+)?\s*%/i },
  { label: 'unsupported hard-coded AggregateRating', pattern: /"ratingValue"\s*:\s*"4\.8"[\s\S]{0,180}"reviewCount"\s*:\s*"127"/i },
  { label: 'automatic AV recommendation', pattern: /Pr[ée]f[ée]rer\s+via\s+assurance-vie\s+pour\s+optimiser/i },
];

const violations = [];
for (const file of walkHtml(distDir)) {
  const html = fs.readFileSync(file, 'utf8');
  for (const rule of forbidden) {
    if (rule.pattern.test(html)) {
      violations.push(`${path.relative(distDir, file)} — ${rule.label}`);
    }
  }
}

if (violations.length > 0) {
  console.error('[seo-fiscal-claims] Forbidden legacy claims detected:');
  for (const violation of violations.slice(0, 100)) console.error(` - ${violation}`);
  process.exit(1);
}

console.log('[seo-fiscal-claims] PASS — no forbidden legacy fiscal claims in generated HTML.');
