import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function cropLogo() {
  try {
    const inputPath = join(projectRoot, 'public/logo maximus Canva.png');
    const outputPath = join(projectRoot, 'public/logo-cropped.png');
    
    // Lire l'image et obtenir les métadonnées
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Image originale: ${metadata.width}x${metadata.height}`);
    
    // Recadrer pour enlever l'espace blanc (garder 60% au centre)
    const cropWidth = Math.floor(metadata.width * 0.6);
    const cropHeight = Math.floor(metadata.height * 0.6);
    const left = Math.floor((metadata.width - cropWidth) / 2);
    const top = Math.floor((metadata.height - cropHeight) / 2);
    
    await sharp(inputPath)
      .extract({ 
        left: left, 
        top: top, 
        width: cropWidth, 
        height: cropHeight 
      })
      .toFile(outputPath);
    
    console.log(`✅ Logo recadré créé: ${cropWidth}x${cropHeight}`);
    console.log(`Fichier: ${outputPath}`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

cropLogo();
