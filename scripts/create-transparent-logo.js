import sharp from 'sharp';
import { readFileSync } from 'fs';

// Create a transparent PNG logo from the SVG
const svgBuffer = readFileSync('./public/3-barres.svg');

sharp(svgBuffer)
  .resize(400, 400)
  .png({
    quality: 100,
    compressionLevel: 9,
    palette: false
  })
  .toFile('./public/3-barres-transparent.png')
  .then(() => {
    console.log('✅ Logo PNG transparent créé: 3-barres-transparent.png');
  })
  .catch(err => {
    console.error('❌ Erreur:', err);
  });
