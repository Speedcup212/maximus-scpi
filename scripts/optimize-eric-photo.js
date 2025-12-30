import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

// Liste des fichiers photo Eric possibles
const possiblePhotos = [
  'Eric Bellaiche 1000x1000.png',
  'WEB-ERIC-01 copy.jpg',
  'WEB-ERIC-01.jpg',
  'Photo Eric Bellaiche complet.png'
];

async function optimizeEricPhoto() {
  console.log('🔍 Recherche de la photo Eric Bellaiche...');

  let sourcePhoto = null;

  // Chercher la première photo valide
  for (const photoName of possiblePhotos) {
    const photoPath = path.join(publicDir, photoName);
    try {
      const stats = fs.statSync(photoPath);
      // Vérifier que le fichier fait plus de 1KB (pas un fichier corrompu)
      if (stats.size > 1024) {
        // Vérifier que c'est une vraie image
        const metadata = await sharp(photoPath).metadata();
        if (metadata.width && metadata.height) {
          sourcePhoto = photoPath;
          console.log(`✅ Photo trouvée: ${photoName} (${metadata.width}x${metadata.height}, ${(stats.size/1024).toFixed(1)} KB)`);
          break;
        }
      }
    } catch (err) {
      // Fichier n'existe pas ou n'est pas une image valide
      continue;
    }
  }

  if (!sourcePhoto) {
    console.error('❌ Aucune photo Eric valide trouvée dans public/');
    console.log('\n📋 Photos recherchées:');
    possiblePhotos.forEach(name => console.log(`   - ${name}`));
    console.log('\n💡 Veuillez placer une photo Eric (JPG ou PNG) dans le dossier public/');
    process.exit(1);
  }

  console.log('\n🎨 Génération des versions optimisées...');

  try {
    const sizes = [
      { width: 120, name: 'eric-120', formats: ['webp', 'png'] },
      { width: 240, name: 'eric-240', formats: ['webp'] },
      { width: 360, name: 'eric-360', formats: ['webp'] }
    ];

    for (const { width, name, formats } of sizes) {
      for (const format of formats) {
        const outputPath = path.join(publicDir, `${name}.${format}`);

        await sharp(sourcePhoto)
          .resize(width, width, {
            fit: 'cover',
            position: 'center'
          })
          .toFormat(format, {
            quality: format === 'webp' ? 85 : 90,
            effort: format === 'webp' ? 6 : undefined,
            compressionLevel: format === 'png' ? 9 : undefined
          })
          .toFile(outputPath);

        const stats = fs.statSync(outputPath);
        console.log(`✅ Créé ${name}.${format} (${width}x${width}px, ${(stats.size/1024).toFixed(1)} KB)`);
      }
    }

    // Statistiques finales
    console.log('\n📊 Résumé des images optimisées:');
    const files = ['eric-120.webp', 'eric-240.webp', 'eric-360.webp', 'eric-120.png'];
    let totalSize = 0;

    for (const file of files) {
      try {
        const stats = fs.statSync(path.join(publicDir, file));
        const size = stats.size / 1024;
        totalSize += size;
        console.log(`   ${file}: ${size.toFixed(1)} KB`);
      } catch (err) {
        console.log(`   ${file}: non trouvé`);
      }
    }

    console.log(`\n   Total: ${totalSize.toFixed(1)} KB`);

    // Comparer avec l'original
    const originalStats = fs.statSync(sourcePhoto);
    const originalSize = originalStats.size / 1024;
    const savings = ((1 - totalSize / originalSize) * 100).toFixed(1);

    console.log(`   Original: ${originalSize.toFixed(1)} KB`);
    console.log(`   Économie: ${savings}% 🎉`);

    console.log('\n✅ Images Eric optimisées avec succès!');
    console.log('💡 Lancez "npm run build" pour les copier dans dist/');

  } catch (error) {
    console.error('❌ Erreur lors de l\'optimisation:', error.message);
    process.exit(1);
  }
}

optimizeEricPhoto();
