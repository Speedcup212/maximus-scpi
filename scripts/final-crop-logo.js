import sharp from 'sharp';

async function finalCrop() {
  try {
    const inputPath = '/tmp/cc-agent/58016922/project/public/logo maximus Canva.png';
    const outputPath = '/tmp/cc-agent/58016922/project/public/logo-cropped.png';

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`Original: ${metadata.width}x${metadata.height}`);

    // 70% du centre pour garder le logo complet avec marge
    const cropWidth = Math.floor(metadata.width * 0.70);
    const cropHeight = Math.floor(metadata.height * 0.70);
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

    console.log(`✅ Logo complet recadré: ${cropWidth}x${cropHeight}`);
    console.log(`Zone gardée: 70% du centre (logo complet + marge)`);

    const stats = await sharp(outputPath).metadata();
    console.log(`Vérification finale: ${stats.width}x${stats.height}`);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

finalCrop();
