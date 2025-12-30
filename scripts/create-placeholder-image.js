/**
 * Script pour créer une image placeholder SVG pour Eric Bellaiche
 * À exécuter avec: node scripts/create-placeholder-image.js
 */

const fs = require('fs');
const path = require('path');

// Créer un SVG placeholder optimisé (seulement 1-2 KB)
const placeholderSVG = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="100" fill="url(#grad)"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="white">EB</text>
</svg>`;

// Écrire le SVG dans le dossier public
const outputPath = path.join(__dirname, '..', 'public', 'eric-placeholder.svg');
fs.writeFileSync(outputPath, placeholderSVG);

console.log('✅ Placeholder SVG créé:', outputPath);
console.log('📊 Taille:', Buffer.byteLength(placeholderSVG), 'bytes (vs 920 KB pour PNG)');
console.log('🎯 Économie:', ((920 * 1024 - Buffer.byteLength(placeholderSVG)) / (920 * 1024) * 100).toFixed(2), '%');
