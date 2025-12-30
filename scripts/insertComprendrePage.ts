import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const comprendrePage = {
  slug: 'comprendre-scpi',
  title: 'Comprendre les SCPI : Guide complet pour investir intelligemment',
  meta_description: 'Découvrez tout ce qu\'il faut savoir sur les SCPI : fonctionnement, avantages, risques, fiscalité. Guide complet pour investir en toute connaissance.',
  keywords: ['comprendre scpi', 'guide scpi', 'investir scpi', 'fonctionnement scpi', 'scpi débutant'],
  category: 'Guide fondamental',
  main_keyword: 'comprendre scpi',
  search_intent: 'informationnel',
  target_audience: 'Débutants souhaitant comprendre les SCPI avant d\'investir',
  component_name: 'ComprendreSCPIPage',
  excerpt: 'Guide complet pour comprendre les SCPI : définition, fonctionnement, avantages, risques et fiscalité.',
  word_count: 5000,
  read_time: 20,
  featured: true,
  status: 'published'
};

async function insertComprendrePage() {
  console.log('🚀 Insertion de la page Comprendre les SCPI...');

  const { error } = await supabase
    .from('articles_seo')
    .upsert(comprendrePage, { onConflict: 'slug' });

  if (error) {
    console.error('❌ Erreur:', error);
  } else {
    console.log('✅ Page Comprendre les SCPI ajoutée avec succès');
  }
}

insertComprendrePage().catch(console.error);
