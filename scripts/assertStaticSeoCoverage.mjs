import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const sitemapPath = path.join(distDir, 'sitemap.xml');

if (!fs.existsSync(sitemapPath)) {
  console.error('❌ dist/sitemap.xml introuvable.');
  process.exit(1);
}

const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const failures = [];

const normalizeCanonical = (value) => {
  try {
    const u = new URL(value);
    let pathname = u.pathname || '/';
    if (pathname !== '/' && !pathname.endsWith('/')) pathname += '/';
    return `${u.origin}${pathname}`;
  } catch {
    return value;
  }
};

for (const url of urls) {
  const parsed = new URL(url);
  const cleanPath = parsed.pathname.replace(/^\/+|\/+$/g, '');
  const filePath = cleanPath
    ? path.join(distDir, ...cleanPath.split('/'), 'index.html')
    : path.join(distDir, 'index.html');

  if (!fs.existsSync(filePath)) {
    failures.push(`${parsed.pathname} → index.html dédié absent`);
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["'][^>]*>/i);
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const h1Match = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/i);

  if (!canonicalMatch) failures.push(`${parsed.pathname} → canonical absent`);
  else if (normalizeCanonical(canonicalMatch[1]) !== normalizeCanonical(url)) {
    failures.push(`${parsed.pathname} → canonical ${canonicalMatch[1]} au lieu de ${url}`);
  }

  if (!titleMatch || !titleMatch[1].trim()) failures.push(`${parsed.pathname} → title absent`);
  if (!h1Match) failures.push(`${parsed.pathname} → H1 HTML absent`);

  if (parsed.pathname !== '/' && /<link\s+rel=["']canonical["']\s+href=["']https:\/\/maximusscpi\.com\/["']/i.test(html)) {
    failures.push(`${parsed.pathname} → canonical home détecté`);
  }
}

if (failures.length) {
  console.error(`❌ Couverture SEO statique incomplète : ${failures.length} anomalie(s) sur ${urls.length} URLs`);
  failures.slice(0, 60).forEach((failure) => console.error(`   - ${failure}`));
  process.exit(1);
}

console.log(`✅ Couverture SEO statique certifiée : ${urls.length}/${urls.length} URLs avec HTML dédié, canonical propre, title et H1.`);
