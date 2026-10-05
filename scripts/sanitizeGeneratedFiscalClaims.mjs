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

const replacements = [
  {
    pattern: /PS\s*0\s*%/gi,
    replacement: 'traitement des prélèvements sociaux à vérifier selon le pays et la situation',
  },
  {
    pattern: /exon[ée]ration(?:\s+totale)?\s+(?:de\s+)?pr[ée]l[èe]vements sociaux/gi,
    replacement: 'traitement spécifique des prélèvements sociaux à vérifier',
  },
  {
    pattern: /exon[ée]r[ée]e?s?\s+d['’]IFI/gi,
    replacement: 'soumise à un traitement IFI à vérifier',
  },
  {
    pattern: /exon[ée]ration\s+IFI/gi,
    replacement: 'traitement IFI à vérifier',
  },
  {
    pattern: /Net\s+TMI\s*\d+\s*%\s*:\s*~?\s*\d+(?:[.,]\d+)?\s*%/gi,
    replacement: 'Rendement net : à calculer selon la situation fiscale',
  },
  {
    pattern: /TMI\s*\d+\s*%\s*\+\s*PS\s*17[.,]2\s*%\s*=\s*\d+(?:[.,]\d+)?\s*%/gi,
    replacement: 'Fiscalité : à calculer selon la base imposable et la situation du foyer',
  },
  {
    pattern: /Pr[ée]f[ée]rer\s+via\s+assurance-vie\s+pour\s+optimiser/gi,
    replacement: "Comparer avec l'assurance-vie selon le contrat, les frais et la situation fiscale",
  },
];

let touched = 0;
let removedRatings = 0;

for (const file of walkHtml(distDir)) {
  const original = fs.readFileSync(file, 'utf8');
  let html = original;

  const ratingPattern = /,\s*"aggregateRating"\s*:\s*\{[^{}]*"@type"\s*:\s*"AggregateRating"[^{}]*"ratingValue"\s*:\s*"4\.8"[^{}]*"reviewCount"\s*:\s*"127"[^{}]*\}/g;
  const beforeRatings = html;
  html = html.replace(ratingPattern, '');
  if (html !== beforeRatings) removedRatings += 1;

  for (const { pattern, replacement } of replacements) {
    html = html.replace(pattern, replacement);
  }

  if (html !== original) {
    fs.writeFileSync(file, html);
    touched += 1;
  }
}

console.log(`[seo-sanitize] ${touched} HTML file(s) sanitized; unsupported hard-coded ratings removed from ${removedRatings} file(s).`);
