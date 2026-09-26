import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const RETIRED = [{ name: 'GMA Essentialis', slug: 'gma-essentialis' }];
const ASSERT_DIST = process.argv.includes('--assert-dist');
const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.html', '.xml', '.txt', '.md', '.css', '.csv']);

const containsRetired = (text) => RETIRED.some(({ name, slug }) => text.includes(name) || text.includes(slug));

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

const cleanJson = (value) => {
  if (Array.isArray(value)) {
    return value
      .map(cleanJson)
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === 'object') {
    const identifyingFields = ['Nom SCPI', 'name', 'nom', 'slug', 'scpi_slug', 'scpi_name'];
    const retiredObject = RETIRED.some(({ name, slug }) =>
      identifyingFields.some((field) => {
        const current = value[field];
        return typeof current === 'string' && (current.toLowerCase() === name.toLowerCase() || current === slug);
      })
    );
    if (retiredObject) return undefined;

    const next = {};
    for (const [key, item] of Object.entries(value)) {
      if (RETIRED.some(({ slug }) => key === slug)) continue;
      const cleaned = cleanJson(item);
      if (cleaned !== undefined) next[key] = cleaned;
    }
    return next;
  }

  return value;
};

const cleanJsonFile = (file) => {
  const raw = fs.readFileSync(file, 'utf8');
  if (!containsRetired(raw)) return;
  const parsed = JSON.parse(raw);
  const cleaned = cleanJson(parsed);
  fs.writeFileSync(file, `${JSON.stringify(cleaned, null, 2)}\n`, 'utf8');
};

const findMatchingBrace = (text, openIndex) => {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const char = text[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
};

const removeArrayObjectByMarker = (file, marker) => {
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');
  let changed = false;

  while (text.includes(marker)) {
    const markerIndex = text.indexOf(marker);
    let start = text.lastIndexOf('\n  {', markerIndex);
    if (start < 0) throw new Error(`Impossible de localiser le début de l'objet contenant ${marker} dans ${file}`);
    start += 1;
    const open = text.indexOf('{', start);
    const close = findMatchingBrace(text, open);
    if (close < 0) throw new Error(`Impossible de localiser la fin de l'objet contenant ${marker} dans ${file}`);

    let end = close + 1;
    if (text.slice(end).startsWith(',')) end += 1;
    if (text.slice(end).startsWith('\r\n')) end += 2;
    else if (text.slice(end).startsWith('\n')) end += 1;
    text = text.slice(0, start) + text.slice(end);
    changed = true;
  }

  if (changed) fs.writeFileSync(file, text, 'utf8');
};

const removeObjectPropertyByMarker = (file, marker) => {
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');
  let changed = false;

  while (text.includes(marker)) {
    const markerIndex = text.indexOf(marker);
    const lineStart = text.lastIndexOf('\n', markerIndex) + 1;
    const open = text.indexOf('{', markerIndex);
    const close = findMatchingBrace(text, open);
    if (open < 0 || close < 0) throw new Error(`Bloc ${marker} invalide dans ${file}`);

    let end = close + 1;
    if (text.slice(end).startsWith(',')) end += 1;
    if (text.slice(end).startsWith('\r\n')) end += 2;
    else if (text.slice(end).startsWith('\n')) end += 1;
    text = text.slice(0, lineStart) + text.slice(end);
    changed = true;
  }

  if (changed) fs.writeFileSync(file, text, 'utf8');
};

const cleanPublicGeneratedFiles = (publicDir) => {
  if (!fs.existsSync(publicDir)) return;

  for (const file of walk(publicDir).filter((item) => item.endsWith('.json'))) {
    cleanJsonFile(file);
  }

  const redirects = path.join(publicDir, '_redirects');
  if (fs.existsSync(redirects)) {
    const lines = fs.readFileSync(redirects, 'utf8').split(/\r?\n/);
    const cleaned = lines.filter((line) => !containsRetired(line));
    fs.writeFileSync(redirects, `${cleaned.join('\n').replace(/\n+$/g, '')}\n`, 'utf8');
  }

  const sitemap = path.join(publicDir, 'sitemap.xml');
  if (fs.existsSync(sitemap)) {
    let xml = fs.readFileSync(sitemap, 'utf8');
    for (const { slug } of RETIRED) {
      const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      xml = xml.replace(new RegExp(`<url>[\\s\\S]*?${escaped}[\\s\\S]*?<\\/url>\\s*`, 'gi'), '');
    }
    fs.writeFileSync(sitemap, xml, 'utf8');
  }
};

const purgeSource = () => {
  const dataDir = path.join(ROOT, 'src', 'data');
  for (const file of walk(dataDir).filter((file) => file.endsWith('.json'))) {
    cleanJsonFile(file);
  }

  removeArrayObjectByMarker(
    path.join(ROOT, 'src', 'data', 'scpiDataExtended.ts'),
    '"name": "GMA Essentialis"'
  );

  const landing = path.join(ROOT, 'src', 'data', 'landingPagesData.ts');
  removeObjectPropertyByMarker(landing, "'gma-essentialis': {");
  removeObjectPropertyByMarker(landing, '"gma-essentialis": {');

  const slugMapper = path.join(ROOT, 'src', 'utils', 'scpiSlugMapper.ts');
  if (fs.existsSync(slugMapper)) {
    let text = fs.readFileSync(slugMapper, 'utf8');
    text = text.replace(/^\s*["']gma-essentialis["'],?\s*\r?\n/gm, '');
    fs.writeFileSync(slugMapper, text, 'utf8');
  }

  const publicDir = path.join(ROOT, 'public');
  if (fs.existsSync(publicDir)) {
    for (const entry of fs.readdirSync(publicDir, { withFileTypes: true })) {
      if (entry.name.includes('gma-essentialis')) {
        fs.rmSync(path.join(publicDir, entry.name), { recursive: true, force: true });
      }
    }
    cleanPublicGeneratedFiles(publicDir);
  }

  const failures = [];
  for (const base of [path.join(ROOT, 'src'), path.join(ROOT, 'public')]) {
    for (const file of walk(base)) {
      if (!TEXT_EXTENSIONS.has(path.extname(file).toLowerCase())) continue;
      const text = fs.readFileSync(file, 'utf8');
      if (containsRetired(text)) failures.push(path.relative(ROOT, file));
    }
  }

  if (failures.length) {
    throw new Error(`Références à une SCPI retirée encore présentes dans les sources publiques : ${failures.join(', ')}`);
  }

  console.log('✅ SCPI retirées purgées des sources publiques.');
};

const assertDist = () => {
  const dist = path.join(ROOT, 'dist');
  if (!fs.existsSync(dist)) throw new Error('dist/ introuvable pour le contrôle des SCPI retirées.');

  const failures = [];
  for (const file of walk(dist)) {
    const relative = path.relative(dist, file);
    if (RETIRED.some(({ slug }) => relative.includes(slug))) {
      failures.push(relative);
      continue;
    }
    if (!TEXT_EXTENSIONS.has(path.extname(file).toLowerCase())) continue;
    const text = fs.readFileSync(file, 'utf8');
    if (containsRetired(text)) failures.push(relative);
  }

  if (failures.length) {
    throw new Error(`SCPI retirée encore présente dans le build public : ${failures.join(', ')}`);
  }

  console.log('✅ Build public contrôlé : aucune trace de SCPI retirée.');
};

if (ASSERT_DIST) assertDist();
else purgeSource();
