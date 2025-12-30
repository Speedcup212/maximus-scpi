import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

interface ScpiDB {
  id: number;
  nom: string;
  societe_gestion: string;
  prix_souscription: number;
  minimum_souscription: number;
  rendement: number;
  tof: number;
  capitalisation: number;
  repartition_sectorielle: any;
  repartition_geographique: any;
}

function categorizeSCPI(sectors: any): string {
  if (!sectors) return 'Diversifiée';

  const keys = Object.keys(sectors);
  if (keys.length === 0) return 'Diversifiée';

  const firstSector = keys[0].toLowerCase();

  if (firstSector.includes('santé') || firstSector.includes('ehpad') || firstSector.includes('clinique')) {
    return 'Santé';
  }
  if (firstSector.includes('bureau')) {
    return 'Bureaux';
  }
  if (firstSector.includes('commerce') || firstSector.includes('retail')) {
    return 'Commerce';
  }
  if (firstSector.includes('logistique') || firstSector.includes('entrepôt')) {
    return 'Logistique';
  }
  if (firstSector.includes('résidentiel') || firstSector.includes('habitation')) {
    return 'Résidentiel';
  }
  if (firstSector.includes('hôtel') || firstSector.includes('tourisme')) {
    return 'Hôtellerie';
  }

  return 'Diversifiée';
}

function getStrategy(nom: string, sectors: any): string {
  const category = categorizeSCPI(sectors);

  const strategies: Record<string, string> = {
    'Santé': 'Spécialisée dans les actifs de santé avec une forte exposition aux EHPAD et cliniques',
    'Bureaux': 'Investissement principalement dans des immeubles de bureaux de qualité',
    'Commerce': 'Portefeuille orienté vers les actifs commerciaux et de retail',
    'Logistique': 'Spécialisée dans les plateformes logistiques et entrepôts',
    'Résidentiel': 'Investissement dans l\'immobilier résidentiel de qualité',
    'Hôtellerie': 'Portefeuille d\'actifs hôteliers et de tourisme',
    'Diversifiée': 'Portefeuille diversifié multi-secteurs pour optimiser le couple rendement/risque'
  };

  return strategies[category] || strategies['Diversifiée'];
}

function formatCapitalization(cap: number): string {
  if (cap >= 1000) {
    return `${(cap / 1000).toFixed(1).replace('.', ',')}Md€`;
  }
  return `${Math.round(cap)}M€`;
}

function convertSectorsToArray(sectors: any): Array<{ name: string; value: number }> {
  if (!sectors || typeof sectors !== 'object') {
    return [{ name: 'Diversifié', value: 100 }];
  }

  return Object.entries(sectors).map(([name, value]) => ({
    name,
    value: typeof value === 'number' ? Math.round(value * 10) / 10 : parseFloat(String(value))
  }));
}

function convertGeographyToArray(geography: any): Array<{ name: string; value: number }> {
  if (!geography || typeof geography !== 'object') {
    return [{ name: 'France', value: 100 }];
  }

  return Object.entries(geography).map(([name, value]) => ({
    name,
    value: typeof value === 'number' ? Math.round(value * 10) / 10 : parseFloat(String(value))
  }));
}

async function syncScpiData() {
  console.log('🔄 Synchronisation des données SCPI depuis Supabase...\n');

  const { data: scpiData, error } = await supabase
    .from('scpi')
    .select('*')
    .order('nom', { ascending: true });

  if (error) {
    console.error('❌ Erreur lors de la récupération des données:', error);
    process.exit(1);
  }

  if (!scpiData || scpiData.length === 0) {
    console.error('❌ Aucune donnée SCPI trouvée');
    process.exit(1);
  }

  console.log(`✅ ${scpiData.length} SCPI récupérées depuis Supabase\n`);

  const scpiExtended = scpiData.map((scpi: ScpiDB, index: number) => {
    const sectors = convertSectorsToArray(scpi.repartition_sectorielle);
    const geography = convertGeographyToArray(scpi.repartition_geographique);
    const category = categorizeSCPI(scpi.repartition_sectorielle);
    const strategy = getStrategy(scpi.nom, scpi.repartition_sectorielle);

    return {
      id: index + 1,
      name: scpi.nom,
      yield: scpi.rendement || 0,
      price: scpi.prix_souscription || 0,
      minInvestment: scpi.minimum_souscription || scpi.prix_souscription || 0,
      category,
      managementCompany: scpi.societe_gestion || 'Non renseigné',
      tof: scpi.tof || 0,
      capitalization: formatCapitalization(scpi.capitalisation || 0),
      sectors,
      geography,
      strategy
    };
  });

  const fileContent = `export interface SCPIExtended {
  id: number;
  name: string;
  yield: number;
  price: number;
  minInvestment: number;
  category: string;
  managementCompany: string;
  tof: number;
  capitalization: string;
  sectors: Array<{ name: string; value: number }>;
  geography: Array<{ name: string; value: number }>;
  strategy: string;
}

const baseSCPIData: SCPIExtended[] = ${JSON.stringify(scpiExtended, null, 2)};

export const scpiDataExtended: SCPIExtended[] = baseSCPIData;

export default scpiDataExtended;
`;

  const outputPath = path.join(process.cwd(), 'src', 'data', 'scpiDataExtended.ts');
  fs.writeFileSync(outputPath, fileContent, 'utf-8');

  console.log(`✅ Fichier scpiDataExtended.ts mis à jour avec ${scpiExtended.length} SCPI`);
  console.log(`📁 Fichier: ${outputPath}\n`);

  console.log('📊 Résumé par catégorie:');
  const categories = scpiExtended.reduce((acc: Record<string, number>, scpi) => {
    acc[scpi.category] = (acc[scpi.category] || 0) + 1;
    return acc;
  }, {});

  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`  - ${cat}: ${count} SCPI`);
  });
}

syncScpiData().catch(console.error);
