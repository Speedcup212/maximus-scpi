import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const SITE = 'https://maximusscpi.com';
const BRAND_LOGO = `${SITE}/Logo%20MaximusSCPI.com.png`;

let filesVisited = 0;
let filesChanged = 0;
let organizationsHardened = 0;
let articlesHardened = 0;
let articleDatesRecovered = 0;
let invalidJson = 0;

const MONTHS = {
  janvier: '01', fevrier: '02', mars: '03', avril: '04', mai: '05', juin: '06',
  juillet: '07', aout: '08', septembre: '09', octobre: '10', novembre: '11', decembre: '12'
};
const normalizeFrench = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const extractVisiblePublishedDate = (html, filePath) => {
  const normalizedPath = filePath.split(path.sep).join('/');
  if (!normalizedPath.includes('/dist/articles/')) return null;
  // Les composants d'articles affichent leur date de publication dans le bandeau
  // supérieur. On ne lit que le début du HTML pour éviter de confondre une date
  // citée dans le corps de l'article avec la date éditoriale.
  const headAndHero = html.slice(0, Math.min(html.length, 35000));
  const text = headAndHero.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const match = text.match(/\b([0-3]?\d)\s+(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)\s+(20\d{2})\b/i);
  if (!match) return null;
  const month = MONTHS[normalizeFrench(match[2])];
  if (!month) return null;
  return `${match[3]}-${month}-${String(Number(match[1])).padStart(2, '0')}`;
};

const isMaximusOrganization = (node) => {
  if (!node || typeof node !== 'object') return false;
  const type = node['@type'];
  const types = Array.isArray(type) ? type : [type];
  if (!types.some((value) => value === 'Organization' || value === 'FinancialService')) return false;
  const name = String(node.name || '').toLowerCase();
  const url = String(node.url || '').toLowerCase();
  return name === 'maximusscpi' || url === SITE || url === `${SITE}/`;
};

const walk = (node, visiblePublishedDate) => {
  if (Array.isArray(node)) {
    node.forEach((item) => walk(item, visiblePublishedDate));
    return;
  }
  if (!node || typeof node !== 'object') return;

  if (isMaximusOrganization(node)) {
    if (!node.url) node.url = SITE;
    if (!node.logo) {
      node.logo = { '@type': 'ImageObject', url: BRAND_LOGO };
      organizationsHardened++;
    } else if (typeof node.logo === 'string') {
      node.logo = { '@type': 'ImageObject', url: node.logo };
    }
  }

  const type = node['@type'];
  const types = Array.isArray(type) ? type : [type];
  if (types.includes('Article') || types.includes('NewsArticle') || types.includes('BlogPosting')) {
    let changed = false;
    if (!node.image) {
      node.image = BRAND_LOGO;
      changed = true;
    }
    if (!node.publisher) {
      node.publisher = {
        '@type': 'Organization',
        name: 'MaximusSCPI',
        url: SITE,
        logo: { '@type': 'ImageObject', url: BRAND_LOGO }
      };
      organizationsHardened++;
      changed = true;
    } else if (isMaximusOrganization(node.publisher) && !node.publisher.logo) {
      node.publisher.logo = { '@type': 'ImageObject', url: BRAND_LOGO };
      organizationsHardened++;
      changed = true;
    }
    // La date n'est renseignée que si elle est réellement affichée comme date
    // éditoriale dans le bandeau de l'article. Aucune date de build n'est utilisée.
    if (!node.datePublished && visiblePublishedDate) {
      node.datePublished = visiblePublishedDate;
      articleDatesRecovered++;
      changed = true;
    }
    if (changed) articlesHardened++;
  }

  Object.values(node).forEach((value) => walk(value, visiblePublishedDate));
};

const processHtml = (filePath) => {
  filesVisited++;
  let html = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  const visiblePublishedDate = extractVisiblePublishedDate(html, filePath);

  html = html.replace(/<script([^>]*type=["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi, (full, attrs, rawJson) => {
    const source = rawJson.trim();
    if (!source) return full;
    try {
      const data = JSON.parse(source);
      const before = JSON.stringify(data);
      walk(data, visiblePublishedDate);
      const after = JSON.stringify(data).replace(/</g, '\\u003c');
      if (after !== before) changed = true;
      return `<script${attrs}>${after}</script>`;
    } catch {
      invalidJson++;
      return full;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf-8');
    filesChanged++;
  }
};

const visit = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) visit(full);
    else if (entry.isFile() && entry.name === 'index.html') processHtml(full);
  }
};

visit(distDir);

console.log(`✅ Données structurées durcies : ${filesChanged}/${filesVisited} HTML modifiés ; ${organizationsHardened} Organization Maximus enrichies ; ${articlesHardened} Article enrichis ; ${articleDatesRecovered} date(s) éditoriale(s) récupérée(s) ; ${invalidJson} JSON-LD invalide(s) laissé(s) intact(s).`);
