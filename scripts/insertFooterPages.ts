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

const footerPages = [
  {
    slug: 'mentions-legales',
    title: 'Mentions légales - MaximusSCPI',
    meta_description: 'Mentions légales du site MaximusSCPI : éditeur, hébergeur, responsabilité et propriété intellectuelle.',
    keywords: ['mentions légales', 'maximus scpi', 'informations légales', 'éditeur', 'hébergement'],
    category: 'Légal',
    main_keyword: 'mentions légales',
    search_intent: 'informationnel',
    target_audience: 'Tous visiteurs',
    component_name: 'MentionsLegalesPage',
    excerpt: 'Informations légales du site MaximusSCPI : éditeur, hébergeur, responsabilité et propriété intellectuelle.',
    word_count: 200,
    read_time: 1,
    featured: false,
    status: 'published'
  },
  {
    slug: 'politique-confidentialite',
    title: 'Politique de confidentialité - MaximusSCPI',
    meta_description: 'Politique de confidentialité MaximusSCPI : collecte, utilisation, conservation et droits sur vos données personnelles.',
    keywords: ['politique confidentialité', 'données personnelles', 'rgpd', 'vie privée', 'protection données'],
    category: 'Légal',
    main_keyword: 'politique confidentialité',
    search_intent: 'informationnel',
    target_audience: 'Tous visiteurs',
    component_name: 'PolitiqueConfidentialitePage',
    excerpt: 'Protection de vos données personnelles : collecte, utilisation, conservation et vos droits.',
    word_count: 300,
    read_time: 2,
    featured: false,
    status: 'published'
  },
  {
    slug: 'conditions-utilisation',
    title: 'Conditions d\'utilisation - MaximusSCPI',
    meta_description: 'Conditions d\'utilisation MaximusSCPI : statuts légaux, ORIAS, activités réglementées, responsabilité civile professionnelle et RGPD.',
    keywords: ['conditions utilisation', 'cgu', 'orias', 'cif', 'responsabilité professionnelle'],
    category: 'Légal',
    main_keyword: 'conditions utilisation',
    search_intent: 'informationnel',
    target_audience: 'Tous visiteurs',
    component_name: 'ConditionsUtilisationPage',
    excerpt: 'Informations réglementaires et conditions générales d\'utilisation : statuts légaux, ORIAS, activités réglementées et RGPD.',
    word_count: 1200,
    read_time: 5,
    featured: false,
    status: 'published'
  },
  {
    slug: 'reclamation',
    title: 'Réclamations - MaximusSCPI',
    meta_description: 'Formuler une réclamation auprès de MaximusSCPI : modalités de saisine, médiation et résolution amiable.',
    keywords: ['réclamation', 'médiation', 'litige', 'médiateur', 'résolution amiable'],
    category: 'Légal',
    main_keyword: 'réclamation',
    search_intent: 'transactionnel',
    target_audience: 'Clients ayant une réclamation',
    component_name: 'ReclamationPage',
    excerpt: 'Modalités de réclamation et procédure de médiation pour les litiges avec MaximusSCPI.',
    word_count: 600,
    read_time: 3,
    featured: false,
    status: 'published'
  },
  {
    slug: 'qui-sommes-nous',
    title: 'Qui sommes-nous - MaximusSCPI et Eric Bellaiche',
    meta_description: 'Découvrez MaximusSCPI et Eric Bellaiche : expertise en investissement SCPI, IA et 15 ans d\'expérience en gestion de patrimoine.',
    keywords: ['qui sommes nous', 'eric bellaiche', 'maximus scpi', 'expertise scpi', 'gestion patrimoine'],
    category: 'À propos',
    main_keyword: 'qui sommes nous',
    search_intent: 'informationnel',
    target_audience: 'Prospects découvrant MaximusSCPI',
    component_name: 'AboutUsPage',
    excerpt: 'MaximusSCPI : fusion entre intelligence artificielle et expertise humaine pour votre investissement SCPI.',
    word_count: 1800,
    read_time: 7,
    featured: false,
    status: 'published'
  }
];

async function insertFooterPages() {
  console.log('🚀 Mise à jour des pages footer dans Supabase avec le vrai contenu...');

  for (const page of footerPages) {
    const { error } = await supabase
      .from('articles_seo')
      .upsert(page, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Erreur pour ${page.slug}:`, error);
    } else {
      console.log(`✅ ${page.slug} mise à jour`);
    }
  }

  console.log('✅ Toutes les pages footer ont été mises à jour avec le vrai contenu');
}

insertFooterPages().catch(console.error);
