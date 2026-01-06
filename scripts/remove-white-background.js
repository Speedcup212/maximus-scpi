import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function removeWhiteBackground() {
  const inputPath = join(__dirname, '..', 'public', '3 barres copy copy.png');
  const outputPath = join(__dirname, '..', 'public', '3-barres.png');

  try {
    // Load the image and extract raw pixel data
    const image = sharp(inputPath);
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Process pixels: make white/near-white pixels transparent
    const threshold = 240; // Any pixel with RGB values above this becomes transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // If pixel is white or very light gray, make it transparent
      if (r >= threshold && g >= threshold && b >= threshold) {
        data[i + 3] = 0; // Set alpha to 0 (fully transparent)
      }
    }

    // Create new image from modified pixel data
    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outputPath);

    console.log('✅ Fond blanc supprimé avec succès !');
    console.log(`📐 Dimensions: ${info.width}x${info.height}`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

removeWhiteBackground();
