import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');
const inputImage = path.join(publicDir, 'Eric Bellaiche 1000x1000.png');

// Generate optimized versions
async function optimizeEricImage() {
  console.log('🖼️  Optimizing Eric Bellaiche image for web performance...');

  try {
    // Check if source image exists
    if (!fs.existsSync(inputImage)) {
      console.error('❌ Source image not found:', inputImage);
      return;
    }

    // 1. Small version for mobile (120x120) - WebP
    await sharp(inputImage)
      .resize(120, 120, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(path.join(publicDir, 'eric-120.webp'));
    console.log('✅ Created eric-120.webp (mobile)');

    // 2. Medium version for tablet (240x240) - WebP
    await sharp(inputImage)
      .resize(240, 240, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(path.join(publicDir, 'eric-240.webp'));
    console.log('✅ Created eric-240.webp (tablet)');

    // 3. Large version for desktop (360x360) - WebP
    await sharp(inputImage)
      .resize(360, 360, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(path.join(publicDir, 'eric-360.webp'));
    console.log('✅ Created eric-360.webp (desktop)');

    // 4. Fallback PNG optimized (120x120 for compatibility)
    await sharp(inputImage)
      .resize(120, 120, {
        fit: 'cover',
        position: 'center'
      })
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(path.join(publicDir, 'eric-120.png'));
    console.log('✅ Created eric-120.png (fallback)');

    // Get file sizes
    const getSize = (file) => {
      try {
        const stats = fs.statSync(path.join(publicDir, file));
        return (stats.size / 1024).toFixed(1) + ' KB';
      } catch {
        return 'N/A';
      }
    };

    console.log('\n📊 Image sizes comparison:');
    console.log(`   Original (1000x1000 PNG): ${getSize('Eric Bellaiche 1000x1000.png')}`);
    console.log(`   Optimized 120x120 WebP: ${getSize('eric-120.webp')}`);
    console.log(`   Optimized 240x240 WebP: ${getSize('eric-240.webp')}`);
    console.log(`   Optimized 360x360 WebP: ${getSize('eric-360.webp')}`);
    console.log(`   Optimized 120x120 PNG: ${getSize('eric-120.png')}`);

    console.log('\n✅ Image optimization complete!');
    console.log('💡 Expected savings: ~900 KB on mobile');

  } catch (error) {
    console.error('❌ Error optimizing image:', error);
  }
}

optimizeEricImage();
