import sharp from 'sharp';

async function betterCrop() {
  try {
    const inputPath = '/tmp/cc-agent/58016922/project/public/logo maximus Canva.png';
    const outputPath = '/tmp/cc-agent/58016922/project/public/logo-cropped.png';

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`Original: ${metadata.width}x${metadata.height}`);

    // Recadrage modéré : 50% du centre
    const cropWidth = Math.floor(metadata.width * 0.50);
    const cropHeight = Math.floor(metadata.height * 0.50);
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

    console.log(`✅ Recadré à: ${cropWidth}x${cropHeight}`);

    const stats = await sharp(outputPath).metadata();
    console.log(`Vérification: ${stats.width}x${stats.height}`);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

betterCrop();
