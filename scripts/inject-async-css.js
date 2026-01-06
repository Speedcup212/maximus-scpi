import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Script pour charger le CSS en async dans index.html
const indexPath = resolve('dist/index.html');
let html = readFileSync(indexPath, 'utf-8');

// Trouver le lien CSS
const cssLinkRegex = /<link rel="stylesheet"[^>]*href="([^"]*\.css)"[^>]*>/;
const match = html.match(cssLinkRegex);

if (match) {
  const cssLink = match[0];
  const cssHref = match[1];

  // Remplacer par preload + async load
  const asyncCss = `
    <!-- CSS loaded async to prevent render blocking -->
    <link rel="preload" href="${cssHref}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${cssHref}"></noscript>`;

  html = html.replace(cssLink, asyncCss);

  writeFileSync(indexPath, html);
  console.log('✅ CSS converted to async load');
} else {
  console.log('⚠️ No CSS link found');
}
