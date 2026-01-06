import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, '..', 'public', 'Design copy copy.png');
const dest = path.join(__dirname, '..', 'public', 'maximus-logo-hero.png');

try {
  fs.copyFileSync(source, dest);
  console.log('✓ Logo copié: maximus-logo-hero.png');
  const stats = fs.statSync(dest);
  console.log(`✓ Taille: ${Math.round(stats.size / 1024)} KB`);
} catch (error) {
  console.error('Erreur:', error.message);
  process.exit(1);
}
