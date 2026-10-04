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
let invalidJson = 0;

const isMaximusOrganization = (node) => {
  if (!node || typeof node !== 'object') return false;
  const type = node['@type'];
  const types = Array.isArray(type) ? type : [type];
  if (!types.some((value) => value === 'Organization' || value === 'FinancialService')) return false;
  const name = String(node.name || '').toLowerCase();
  const url = String(node.url || '').toLowerCase();
  return name === 'maximusscpi' || url === SITE || url === `${SITE}/`;
};

const walk = (node) => {
  if (Array.isArray(node)) {
    node.forEach(walk);
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
    // Important : on ne crée JAMAIS datePublished/dateModified ici. Une date doit
    // provenir de la donnée éditoriale réelle, pas de la date du build.
    if (changed) articlesHardened++;
  }

  Object.values(node).forEach(walk);
};

const processHtml = (filePath) => {
  filesVisited++;
  let html = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  html = html.replace(/<script([^>]*type=["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi, (full, attrs, rawJson) => {
    const source = rawJson.trim();
    if (!source) return full;
    try {
      const data = JSON.parse(source);
      const before = JSON.stringify(data);
      walk(data);
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

console.log(`✅ Données structurées durcies : ${filesChanged}/${filesVisited} HTML modifiés ; ${organizationsHardened} Organization Maximus enrichies ; ${articlesHardened} Article enrichis ; ${invalidJson} JSON-LD invalide(s) laissé(s) intact(s).`);
