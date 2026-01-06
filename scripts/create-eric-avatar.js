import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

async function createEricAvatar() {
  console.log('🎨 Creating professional Eric Bellaiche avatar...');

  try {
    const sizes = [
      { width: 120, name: 'eric-120' },
      { width: 240, name: 'eric-240' },
      { width: 360, name: 'eric-360' }
    ];

    for (const { width, name } of sizes) {
      // Create a professional gradient avatar with initials
      const svgAvatar = `
        <svg width="${width}" height="${width}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad${width}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
            </linearGradient>
            <filter id="shadow${width}">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <!-- Background circle -->
          <circle cx="${width/2}" cy="${width/2}" r="${width/2}" fill="url(#grad${width})"/>

          <!-- Professional silhouette -->
          <g transform="translate(${width/2}, ${width/2})">
            <!-- Head -->
            <circle cx="0" cy="${-width*0.15}" r="${width*0.16}" fill="white" opacity="0.95"/>

            <!-- Body/Shoulders -->
            <ellipse cx="0" cy="${width*0.15}" rx="${width*0.28}" ry="${width*0.32}" fill="white" opacity="0.95"/>
          </g>

          <!-- Initials -->
          <text
            x="${width/2}"
            y="${width*0.58}"
            font-family="Arial, -apple-system, BlinkMacSystemFont, sans-serif"
            font-size="${width*0.22}"
            font-weight="700"
            fill="rgba(37, 99, 235, 0.15)"
            text-anchor="middle"
            dominant-baseline="middle"
          >EB</text>
        </svg>
      `;

      // Generate WebP
      await sharp(Buffer.from(svgAvatar))
        .resize(width, width)
        .webp({ quality: 90, effort: 6 })
        .toFile(path.join(publicDir, `${name}.webp`));

      console.log(`✅ Created ${name}.webp (${width}x${width}px)`);
    }

    // Generate PNG fallback
    const svgPng = `
      <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradPng" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="60" fill="url(#gradPng)"/>
        <g transform="translate(60, 60)">
          <circle cx="0" cy="-18" r="19" fill="white" opacity="0.95"/>
          <ellipse cx="0" cy="18" rx="34" ry="38" fill="white" opacity="0.95"/>
        </g>
        <text
          x="60"
          y="70"
          font-family="Arial, sans-serif"
          font-size="26"
          font-weight="700"
          fill="rgba(37, 99, 235, 0.15)"
          text-anchor="middle"
        >EB</text>
      </svg>
    `;

    await sharp(Buffer.from(svgPng))
      .resize(120, 120)
      .png({ compressionLevel: 9, quality: 90 })
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

    console.log('\n📊 Avatar sizes:');
    console.log(`   eric-120.webp: ${getSize('eric-120.webp')}`);
    console.log(`   eric-240.webp: ${getSize('eric-240.webp')}`);
    console.log(`   eric-360.webp: ${getSize('eric-360.webp')}`);
    console.log(`   eric-120.png:  ${getSize('eric-120.png')}`);

    console.log('\n✅ Professional Eric Bellaiche avatar created!');
    console.log('💡 Avatar shows professional silhouette with initials');

  } catch (error) {
    console.error('❌ Error creating avatar:', error);
    process.exit(1);
  }
}

createEricAvatar();
