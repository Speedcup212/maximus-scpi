import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { articleTemplates } from '../src/data/articleTemplatesConfig';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distArticlesDir = path.join(__dirname, '../dist/articles');
const manifestPath = path.join(distArticlesDir, 'react-prerender-manifest.json');
const strictPrerender = process.env.SEO_PRERENDER_STRICT === '1';

const stripText = (html: string) => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const hash = (value: string) => createHash('sha256').update(value).digest('hex');

const extractRoot = (html: string) => {
  const rootStart = html.search(/<div\s+id=["']root["'][^>]*>/i);
  if (rootStart === -1) throw new Error('div#root absent');
  const openEnd = html.indexOf('>', rootStart);
  if (openEnd === -1) throw new Error('ouverture #root invalide');

  const divTag = /<div\b[^>]*>|<\/div>/gi;
  divTag.lastIndex = openEnd + 1;
  let depth = 1;
  let match: RegExpExecArray | null;
  let closeStart = -1;
  while ((match = divTag.exec(html))) {
    if (/^<div\b/i.test(match[0])) depth += 1;
    else depth -= 1;
    if (depth === 0) {
      closeStart = match.index;
      break;
    }
  }
  if (closeStart === -1) throw new Error('fermeture #root absente');

  return {
    opening: html.slice(rootStart, openEnd + 1),
    inner: html.slice(openEnd + 1, closeStart)
  };
};

const finishWithFailures = (failures: string[]) => {
  console.error(`❌ Parité React ↔ HTML statique rompue : ${failures.length} anomalie(s)`);
  failures.slice(0, 60).forEach((failure) => console.error(`   - ${failure}`));

  if (strictPrerender) {
    process.exit(1);
  }

  console.warn('⚠️ Contrôle SEO statique non bloquant : déploiement poursuivi. Définir SEO_PRERENDER_STRICT=1 pour rendre ces anomalies bloquantes.');
  process.exit(0);
};

if (!fs.existsSync(manifestPath)) {
  const message = 'Manifest de pré-rendu React absent.';
  if (strictPrerender) {
    console.error(`❌ ${message}`);
    process.exit(1);
  }

  console.warn(`⚠️ ${message} Contrôle SEO statique ignoré car le pré-rendu est configuré comme non bloquant.`);
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const manifestMap = new Map((manifest.articles || []).map((entry: any) => [entry.slug, entry]));
const templates = articleTemplates.filter((entry) => entry.indexable !== false);
const failures: string[] = [];
let minChars = Number.POSITIVE_INFINITY;
let minH2 = Number.POSITIVE_INFINITY;

if (manifest.count !== templates.length) {
  failures.push(`manifest : ${manifest.count} articles au lieu de ${templates.length}`);
}

for (const article of templates) {
  const filePath = path.join(distArticlesDir, article.slug, 'index.html');
  if (!fs.existsSync(filePath)) {
    failures.push(`${article.slug}: HTML absent`);
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  let root;
  try {
    root = extractRoot(html);
  } catch (error: any) {
    failures.push(`${article.slug}: ${error.message}`);
    continue;
  }

  if (!root.opening.includes('data-react-prerender="true"')) {
    failures.push(`${article.slug}: marqueur de pré-rendu React absent`);
  }
  if (!root.opening.includes(`data-react-prerender-slug="${article.slug}"`)) {
    failures.push(`${article.slug}: slug de pré-rendu incohérent`);
  }
  if (root.inner.includes('article-seo-shell') || root.inner.includes('data-seo-depth="enhanced"')) {
    failures.push(`${article.slug}: ancien contenu SEO parallèle encore présent`);
  }

  const textLength = stripText(root.inner).length;
  const h1Count = (root.inner.match(/<h1\b/gi) || []).length;
  const h2Count = (root.inner.match(/<h2\b/gi) || []).length;
  minChars = Math.min(minChars, textLength);
  minH2 = Math.min(minH2, h2Count);

  if (textLength < 2200) failures.push(`${article.slug}: contenu React statique trop court (${textLength} caractères)`);
  if (h1Count < 1) failures.push(`${article.slug}: H1 absent du rendu React`);
  if (h2Count < 5) failures.push(`${article.slug}: profondeur insuffisante (${h2Count} H2)`);

  const manifestEntry: any = manifestMap.get(article.slug);
  if (!manifestEntry) {
    failures.push(`${article.slug}: absent du manifest React`);
  } else if (manifestEntry.rootHash !== hash(root.inner.trim())) {
    failures.push(`${article.slug}: le HTML final diverge du rendu React capturé`);
  }
}

if (failures.length) {
  finishWithFailures(failures);
}

console.log(`✅ Parité React ↔ HTML certifiée : ${templates.length}/${templates.length} articles · minimum ${minChars} caractères · minimum ${minH2} H2.`);
