import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { articleTemplates } from '../src/data/articleTemplatesConfig';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distArticlesDir = path.join(__dirname, '../dist/articles');

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

const failures: string[] = [];
let enhanced = 0;
let full = 0;

for (const article of articleTemplates.filter((entry) => entry.indexable !== false)) {
  const filePath = path.join(distArticlesDir, article.slug, 'index.html');
  if (!fs.existsSync(filePath)) {
    failures.push(`${article.slug}: HTML absent`);
    continue;
  }
  const html = fs.readFileSync(filePath, 'utf-8');
  const textLength = stripText(html).length;
  const h2Count = (html.match(/<h2\b/gi) || []).length;
  const isEnhanced = html.includes('data-seo-depth="enhanced"');
  const isThinLegacy = html.includes('article-seo-shell') && !isEnhanced;

  if (isThinLegacy) failures.push(`${article.slug}: ancien shell SEO mince encore présent`);
  if (isEnhanced) {
    enhanced++;
    if (textLength < 900) failures.push(`${article.slug}: contenu HTML enrichi trop court (${textLength} caractères)`);
    if (h2Count < 3) failures.push(`${article.slug}: seulement ${h2Count} H2 dans le HTML enrichi`);
    if (!html.includes('id="article-static-depth-schema"')) failures.push(`${article.slug}: schema Article statique absent`);
  } else {
    full++;
    if (textLength < 700) failures.push(`${article.slug}: page statique complète trop courte (${textLength} caractères)`);
    if (h2Count < 2) failures.push(`${article.slug}: profondeur éditoriale insuffisante (${h2Count} H2)`);
  }
}

if (failures.length) {
  console.error(`❌ Profondeur HTML articles insuffisante : ${failures.length} anomalie(s)`);
  failures.slice(0, 60).forEach((failure) => console.error(`   - ${failure}`));
  process.exit(1);
}

console.log(`✅ Profondeur HTML articles certifiée : ${enhanced} shells enrichis + ${full} pages statiques complètes.`);
