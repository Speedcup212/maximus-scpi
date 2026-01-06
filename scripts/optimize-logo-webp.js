import sharp from 'sharp';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function optimizeLogoImage() {
  const inputPath = join(projectRoot, 'public', 'Logo canva 2 maximusscpi.png');
  const outputDir = join(projectRoot, 'public', 'images');

  await fs.mkdir(outputDir, { recursive: true });

  console.log('🖼️  Optimisation du logo MaximusSCPI...');

  const sizes = [
    { height: 48, name: 'logo-48.webp' },
    { height: 64, name: 'logo-64.webp' },
    { height: 96, name: 'logo-96.webp' }
  ];

  for (const size of sizes) {
    const outputPath = join(outputDir, size.name);

    await sharp(inputPath)
      .resize(null, size.height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 90 })
      .toFile(outputPath);

    const stats = await fs.stat(outputPath);
    console.log(`✅ ${size.name} créé (${Math.round(stats.size / 1024)} Ko)`);
  }

  const originalStats = await fs.stat(inputPath);
  const optimizedStats = await fs.stat(join(outputDir, 'logo-64.webp'));

  console.log('');
  console.log('📊 Résumé logo :');
  console.log(`   Original PNG: ${Math.round(originalStats.size / 1024)} Ko`);
  console.log(`   WebP optimisé: ${Math.round(optimizedStats.size / 1024)} Ko`);
  console.log(`   Économie: ${Math.round((1 - optimizedStats.size / originalStats.size) * 100)}%`);
}

optimizeLogoImage().catch(console.error);
