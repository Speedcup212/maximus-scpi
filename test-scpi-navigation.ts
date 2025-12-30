import { scpiData } from './src/data/scpiData';
import { scpiLandingPages } from './src/data/landingPagesData';
import { findScpiSlug } from './src/utils/scpiSlugMapper';

console.log('=== Test de Navigation SCPI ===\n');

console.log(`Total SCPI dans scpiData: ${scpiData.length}`);
console.log(`Total landing pages: ${Object.keys(scpiLandingPages).length}\n`);

console.log('Test de correspondance pour chaque SCPI:\n');

let matchCount = 0;
let noMatchCount = 0;
const noMatches: string[] = [];

scpiData.forEach((scpi, index) => {
  const slug = findScpiSlug(scpi.name);

  if (slug) {
    const landingPage = scpiLandingPages[slug];
    if (landingPage) {
      matchCount++;
      if (index < 10) {
        console.log(`✓ ${scpi.name} → ${slug} (${landingPage.nom})`);
      }
    } else {
      noMatchCount++;
      noMatches.push(scpi.name);
      console.log(`✗ ${scpi.name} → slug trouvé "${slug}" mais pas de landing page`);
    }
  } else {
    noMatchCount++;
    noMatches.push(scpi.name);
    console.log(`✗ ${scpi.name} → Aucun slug trouvé`);
  }
});

console.log('\n=== Résumé ===');
console.log(`✓ SCPI avec correspondance: ${matchCount}`);
console.log(`✗ SCPI sans correspondance: ${noMatchCount}`);

if (noMatches.length > 0) {
  console.log('\n=== SCPI sans correspondance ===');
  noMatches.forEach(name => console.log(`  - ${name}`));
}
