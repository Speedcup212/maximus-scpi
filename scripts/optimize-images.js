const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  Sharp not installed. Install it with: npm install --save-dev sharp');
  console.log('📖 See IMAGE_OPTIMIZATION_GUIDE.md for alternative methods');
  process.exit(0);
}

const inputPath = path.join(__dirname, '../public/Eric Bellaiche 1000x1000.png');
const outputDir = path.join(__dirname, '../public');

// Check if input file exists
if (!fs.existsSync(inputPath)) {
  console.error('❌ Input file not found:', inputPath);
  process.exit(1);
}

const sizes = [
  { width: 100, height: 100, name: '100x100' },
  { width: 200, height: 200, name: '200x200' },
  { width: 400, height: 400, name: '400x400' }
];

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');

  for (const size of sizes) {
    const baseName = `Eric Bellaiche ${size.name}`;

    try {
      // Create WebP version
      const webpPath = path.join(outputDir, `${baseName}.webp`);
      await sharp(inputPath)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 85, effort: 6 })
        .toFile(webpPath);

      const webpStats = fs.statSync(webpPath);
      console.log(`✅ Created ${baseName}.webp (${Math.round(webpStats.size / 1024)} KB)`);

      // Create PNG version (only for smaller sizes as fallback)
      if (size.width <= 200) {
        const pngPath = path.join(outputDir, `${baseName}.png`);
        await sharp(inputPath)
          .resize(size.width, size.height, {
            fit: 'cover',
            position: 'center'
          })
          .png({
            quality: 85,
            compressionLevel: 9,
            effort: 10
          })
          .toFile(pngPath);

        const pngStats = fs.statSync(pngPath);
        console.log(`✅ Created ${baseName}.png (${Math.round(pngStats.size / 1024)} KB)`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${baseName}:`, error.message);
    }

    console.log('');
  }

  // Calculate savings
  const originalStats = fs.statSync(inputPath);
  const originalSize = originalStats.size;
  console.log('📊 Optimization Summary:');
  console.log(`   Original image: ${Math.round(originalSize / 1024)} KB`);
  console.log(`   New images: ~50-80 KB total`);
  console.log(`   💰 Savings: ~${Math.round((originalSize - 80000) / 1024)} KB (${Math.round(((originalSize - 80000) / originalSize) * 100)}% reduction)`);
  console.log('\n✨ Image optimization complete!');
  console.log('💡 Tip: You can now delete the original 1000x1000.png to save space');
}

optimizeImages().catch(err => {
  console.error('❌ Optimization failed:', err);
  process.exit(1);
});
