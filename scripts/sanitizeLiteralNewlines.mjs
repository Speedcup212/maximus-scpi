import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
let filesScanned = 0;
let filesFixed = 0;
let nodesRemoved = 0;

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;

    filesScanned++;
    const source = fs.readFileSync(fullPath, 'utf8');
    let removedHere = 0;

    // Remove only standalone text nodes made of escaped newline tokens ("\\n", "\\r\\n").
    // This deliberately does not touch escaped newlines inside scripts, JSON or normal text.
    const cleaned = source.replace(/>([ \t]*(?:\\r?\\n[ \t]*)+)</g, (match) => {
      removedHere++;
      return '><';
    });

    if (cleaned !== source) {
      fs.writeFileSync(fullPath, cleaned, 'utf8');
      filesFixed++;
      nodesRemoved += removedHere;
    }
  }
};

if (!fs.existsSync(distDir)) {
  console.error('❌ dist introuvable pour sanitizeLiteralNewlines');
  process.exit(1);
}

walk(distDir);
console.log(`✅ HTML nettoyé : ${filesFixed}/${filesScanned} fichiers corrigés, ${nodesRemoved} nœuds parasites supprimés.`);
