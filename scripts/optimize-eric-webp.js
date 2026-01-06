import sharp from 'sharp';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function optimizeEricImage() {
  const inputPath = join(projectRoot, 'public', 'Eric Bellaiche 1000x1000 copy.png');
  const outputDir = join(projectRoot, 'public', 'images');

  await fs.mkdir(outputDir, { recursive: true });

  console.log('🖼️  Optimisation de l\'image d\'Eric Bellaiche...');

  const sizes = [
    { width: 96, name: 'eric-96.webp' },
    { width: 120, name: 'eric-120.webp' },
    { width: 192, name: 'eric-192.webp' },
    { width: 384, name: 'eric-384.webp' }
  ];

  for (const size of sizes) {
    const outputPath = join(outputDir, size.name);

    await sharp(inputPath)
      .resize(size.width, size.width, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const stats = await fs.stat(outputPath);
    console.log(`✅ ${size.name} créé (${Math.round(stats.size / 1024)} Ko)`);
  }

  const originalStats = await fs.stat(inputPath);
  const optimizedStats = await fs.stat(join(outputDir, 'eric-96.webp'));

  console.log('');
  console.log('📊 Résumé :');
  console.log(`   Original PNG (1000x1000): ${Math.round(originalStats.size / 1024)} Ko`);
  console.log(`   WebP optimisé (96x96): ${Math.round(optimizedStats.size / 1024)} Ko`);
  console.log(`   Économie: ${Math.round((1 - optimizedStats.size / originalStats.size) * 100)}%`);
}

optimizeEricImage().catch(console.error);
