import { scpiLandingPages } from './src/data/landingPagesData';

interface CriteriaIssue {
  slug: string;
  nom: string;
  missingCriteria: string[];
  metrics: {
    tof: string;
    rendement: string;
    capitalisation: string;
    endettement: string;
  };
}

const issues: CriteriaIssue[] = [];

Object.entries(scpiLandingPages).forEach(([slug, scpi]) => {
  const avantagesText = scpi.avantages.join(' ').toLowerCase();
  const missingCriteria: string[] = [];

  // Parse TOF
  const tofNum = parseFloat(scpi.tof.replace('%', '').replace(',', '.'));

  // Parse Rendement
  const rendNum = parseFloat(scpi.rendement.replace('%', '').replace(',', '.'));

  // Parse Capitalisation
  let capNum = 0;
  if (scpi.capitalisation.includes('Mds')) {
    capNum = parseFloat(scpi.capitalisation.replace('Mds€', '').replace(',', '.').trim()) * 1000;
  } else {
    capNum = parseFloat(scpi.capitalisation.replace('M€', '').replace(',', '.').trim());
  }

  // Parse Endettement
  const endettNum = parseFloat(scpi.endettement.replace('%', '').replace(',', '.'));

  // Critère 1: TOF >= 90%
  if (tofNum >= 90 && !avantagesText.includes('tof') && !avantagesText.includes('occupation')) {
    missingCriteria.push(`TOF ${scpi.tof} (>= 90%) NON mentionné`);
  }

  // Critère 2: Capitalisation >= 100M€
  if (capNum >= 100 && !avantagesText.includes('capitalisation') && !avantagesText.includes('mds') && !avantagesText.includes('grande scpi') && !avantagesText.includes('leader') && !avantagesText.includes('plus grande')) {
    missingCriteria.push(`Capitalisation ${scpi.capitalisation} (>= 100M€) NON mentionnée`);
  }

  // Critère 3: Rendement >= 5%
  if (rendNum >= 5 && !avantagesText.includes('rendement')) {
    missingCriteria.push(`Rendement ${scpi.rendement} (>= 5%) NON mentionné`);
  }

  // Critère 4: Endettement <= 30%
  if (endettNum <= 30 && endettNum > 0 && !avantagesText.includes('endettement') && !avantagesText.includes('dette')) {
    missingCriteria.push(`Endettement ${scpi.endettement} (<= 30%) NON mentionné`);
  } else if (endettNum === 0 && !avantagesText.includes('endettement') && !avantagesText.includes('dette') && !avantagesText.includes('sans dette') && !avantagesText.includes('aucun endettement') && !avantagesText.includes('zéro endettement')) {
    missingCriteria.push(`Aucun endettement (0%) NON mentionné - EXCELLENT point à valoriser`);
  }

  if (missingCriteria.length > 0) {
    issues.push({
      slug,
      nom: scpi.nom,
      missingCriteria,
      metrics: {
        tof: scpi.tof,
        rendement: scpi.rendement,
        capitalisation: scpi.capitalisation,
        endettement: scpi.endettement
      }
    });
  }
});

console.log(`\n🔍 ANALYSE DES 51 SCPI - CRITÈRES "ON AIME"\n`);
console.log(`Critères vérifiés:`);
console.log(`✓ TOF >= 90%`);
console.log(`✓ Capitalisation >= 100M€`);
console.log(`✓ Rendement >= 5%`);
console.log(`✓ Endettement <= 30%\n`);
console.log(`═══════════════════════════════════════════════════════════\n`);

if (issues.length === 0) {
  console.log(`✅ PARFAIT ! Toutes les 51 SCPI mentionnent correctement leurs points forts dans "avantages"\n`);
} else {
  console.log(`🚨 ${issues.length} SCPI avec des critères positifs NON mentionnés dans "avantages":\n`);

  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.nom} (${issue.slug})`);
    console.log(`   Métriques: TOF=${issue.metrics.tof} | Rend=${issue.metrics.rendement} | Cap=${issue.metrics.capitalisation} | Dette=${issue.metrics.endettement}`);
    issue.missingCriteria.forEach(criteria => {
      console.log(`   ❌ ${criteria}`);
    });
    console.log('');
  });

  console.log(`\n📊 RÉSUMÉ:`);
  console.log(`- Total SCPI analysées: 51`);
  console.log(`- SCPI conformes: ${51 - issues.length}`);
  console.log(`- SCPI à corriger: ${issues.length}`);
}
