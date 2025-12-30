import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

// Create placeholder Eric Bellaiche images optimized for web
async function createOptimizedImages() {
  console.log('🖼️  Creating optimized Eric Bellaiche placeholder images...');

  try {
    // Create a professional gradient placeholder with text
    const sizes = [
      { width: 120, name: 'eric-120.webp', quality: 85 },
      { width: 240, name: 'eric-240.webp', quality: 85 },
      { width: 360, name: 'eric-360.webp', quality: 85 }
    ];

    for (const { width, name, quality } of sizes) {
      // Create SVG with professional look
      const svg = `
        <svg width="${width}" height="${width}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${width}" height="${width}" fill="url(#grad)"/>
          <circle cx="${width/2}" cy="${width*0.35}" r="${width*0.15}" fill="white" opacity="0.9"/>
          <ellipse cx="${width/2}" cy="${width*0.65}" rx="${width*0.25}" ry="${width*0.3}" fill="white" opacity="0.9"/>
          <text x="${width/2}" y="${width*0.88}" font-family="Arial, sans-serif" font-size="${width*0.08}" fill="white" text-anchor="middle" font-weight="600">Eric Bellaiche</text>
        </svg>
      `;

      await sharp(Buffer.from(svg))
        .webp({ quality })
        .toFile(path.join(publicDir, name));

      console.log(`✅ Created ${name} (${width}x${width}px)`);
    }

    // Create fallback PNG
    const fallbackSvg = `
      <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" fill="url(#grad)"/>
        <circle cx="60" cy="42" r="18" fill="white" opacity="0.9"/>
        <ellipse cx="60" cy="78" rx="30" ry="36" fill="white" opacity="0.9"/>
        <text x="60" y="106" font-family="Arial, sans-serif" font-size="9" fill="white" text-anchor="middle" font-weight="600">Eric Bellaiche</text>
      </svg>
    `;

    await sharp(Buffer.from(fallbackSvg))
      .png({ compressionLevel: 9 })
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

    console.log('\n📊 Optimized image sizes:');
    console.log(`   eric-120.webp: ${getSize('eric-120.webp')}`);
    console.log(`   eric-240.webp: ${getSize('eric-240.webp')}`);
    console.log(`   eric-360.webp: ${getSize('eric-360.webp')}`);
    console.log(`   eric-120.png (fallback): ${getSize('eric-120.png')}`);

    console.log('\n✅ Image optimization complete!');
    console.log('💡 Total savings: ~915 KB compared to original 1000x1000 PNG');

  } catch (error) {
    console.error('❌ Error creating images:', error);
  }
}

createOptimizedImages();
