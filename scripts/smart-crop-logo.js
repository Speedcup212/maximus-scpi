import sharp from 'sharp';

async function smartCrop() {
  try {
    const inputPath = '/tmp/cc-agent/58016922/project/public/logo maximus Canva.png';
    const outputPath = '/tmp/cc-agent/58016922/project/public/logo-cropped.png';

    // Utiliser trim() de Sharp pour enlever automatiquement l'espace blanc
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`Original: ${metadata.width}x${metadata.height}`);

    // trim() enlève automatiquement les bordures transparentes/blanches
    await sharp(inputPath)
      .trim({
        background: { r: 255, g: 255, b: 255 }, // Enlever le blanc
        threshold: 30 // Tolérance
      })
      .toFile(outputPath);

    const trimmedMeta = await sharp(outputPath).metadata();
    console.log(`✅ Après trim automatique: ${trimmedMeta.width}x${trimmedMeta.height}`);

    const reduction = ((1 - (trimmedMeta.width * trimmedMeta.height) / (metadata.width * metadata.height)) * 100).toFixed(1);
    console.log(`Réduction: ${reduction}% d'espace blanc enlevé`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Essai avec une méthode alternative...');

    // Si trim échoue, utiliser extract avec padding minimal
    try {
      const inputPath = '/tmp/cc-agent/58016922/project/public/logo maximus Canva.png';
      const outputPath = '/tmp/cc-agent/58016922/project/public/logo-cropped.png';

      const image = sharp(inputPath);
      const metadata = await image.metadata();

      // Garder 70% du centre avec un bon padding
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

      console.log(`✅ Méthode alternative: ${cropWidth}x${cropHeight} (70% du centre)`);
    } catch (e) {
      console.error('❌ Erreur méthode alternative:', e.message);
    }
  }
}

smartCrop();
