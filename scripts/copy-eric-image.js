import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, '..', 'public', 'Eric Bellaiche 1000x1000 copy.png');
const dest = path.join(__dirname, '..', 'public', 'eric-bellaiche.png');

try {
  fs.copyFileSync(source, dest);
  console.log('✓ Photo copiée: eric-bellaiche.png');
  const stats = fs.statSync(dest);
  console.log(`✓ Taille: ${Math.round(stats.size / 1024)} KB`);
} catch (error) {
  console.error('Erreur:', error.message);
  process.exit(1);
}
