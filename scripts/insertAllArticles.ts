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

interface Article {
  slug: string;
  title: string;
  meta_description: string;
  keywords: string[];
  category: string;
  main_keyword: string;
  search_intent: string;
  target_audience: string;
  component_name: string;
  excerpt: string;
  word_count: number;
  read_time: number;
  featured: boolean;
  status: string;
}

const articles: Article[] = [
  {
    slug: 'fonds-euros-ou-scpi',
    title: 'Fonds euros ou SCPI : que faire en 2025 ?',
    meta_description: 'Fonds euros en chute libre : 1,80% en 2024. Découvrez pourquoi 200 000€ sur un fonds euros coûte 20 000€ par an en rendement perdu vs SCPI (4,5%).',
    keywords: ['fonds euros', 'SCPI', 'assurance vie', 'rendement', 'placement', '2025'],
    category: 'Comparatifs',
    main_keyword: 'fonds euros ou scpi',
    search_intent: 'comparatif',
    target_audience: 'Épargnants conservateurs cherchant à optimiser leur assurance vie',
    component_name: 'FondsEurosOuScpiArticle',
    excerpt: 'Les fonds euros rapportent 1,80% en 2024 : découvrez l\'alternative SCPI à 4,5% et le coût d\'opportunité de rester sur un fonds euros.',
    word_count: 3500,
    read_time: 15,
    featured: true,
    status: 'published'
  },
  {
    slug: 'scpi-en-direct-ou-assurance-vie',
    title: 'SCPI en direct ou en assurance vie : le guide complet 2025',
    meta_description: 'SCPI en direct ou assurance vie ? Comparatif complet : fiscalité, frais, liquidité, succession. TMI 11% : direct. TMI 30%+ : AV. Guide expert 2025.',
    keywords: ['SCPI direct', 'SCPI assurance vie', 'fiscalité SCPI', 'comparatif enveloppes'],
    category: 'Guides pratiques',
    main_keyword: 'scpi direct ou assurance vie',
    search_intent: 'comparatif',
    target_audience: 'Investisseurs SCPI cherchant l\'enveloppe optimale selon leur TMI',
    component_name: 'ScpiDirectOuAssuranceVie',
    excerpt: 'Direct ou assurance vie pour vos SCPI ? Découvrez l\'enveloppe optimale selon votre TMI, votre horizon et vos objectifs patrimoniaux.',
    word_count: 4200,
    read_time: 18,
    featured: true,
    status: 'published'
  },
  {
    slug: '100000-euros-fonds-euros-cout-opportunite',
    title: '100 000€ sur un fonds euros : le coût d\'opportunité caché',
    meta_description: '100 000€ sur fonds euros à 1,80% = 236 000€ perdus sur 20 ans vs SCPI 4,5%. Découvrez le vrai coût de la sécurité apparente des fonds euros.',
    keywords: ['fonds euros', 'coût opportunité', '100000 euros', 'SCPI', 'rendement'],
    category: 'Analyses',
    main_keyword: '100000 euros fonds euros',
    search_intent: 'informationnel',
    target_audience: 'Épargnants ayant 100k€+ sur fonds euros',
    component_name: '100000EurosFondsEurosCoutOpportuniteArticle',
    excerpt: 'Placer 100 000€ sur un fonds euros semble sécuritaire, mais combien cela vous coûte-t-il réellement par rapport aux SCPI ?',
    word_count: 3200,
    read_time: 14,
    featured: false,
    status: 'published'
  },
  {
    slug: 'investir-200000-euros-scpi-portefeuille-diversifie',
    title: 'Investir 200 000€ en SCPI : portefeuille diversifié 2025',
    meta_description: '200 000€ en SCPI : portefeuille diversifié 8-12 SCPI (bureaux, commerces, santé, Europe). Rendement cible 4,5%, risque maîtrisé. Stratégie MaximusSCPI.',
    keywords: ['investir 200000 euros', 'SCPI', 'diversification', 'portefeuille'],
    category: 'Stratégies',
    main_keyword: 'investir 200000 euros scpi',
    search_intent: 'transactionnel',
    target_audience: 'Investisseurs disposant de 200k€ à investir en SCPI',
    component_name: 'Investir200000EurosScpiPortefeuilleDiversifieArticle',
    excerpt: 'Comment construire un portefeuille SCPI optimal avec 200 000€ ? Diversification sectorielle, géographique et par gestionnaire.',
    word_count: 3800,
    read_time: 16,
    featured: false,
    status: 'published'
  },
  {
    slug: 'scpi-ou-immobilier-locatif-comparatif-20-ans',
    title: 'SCPI ou immobilier locatif : comparatif sur 20 ans',
    meta_description: 'SCPI vs immobilier locatif sur 20 ans : rendement net, fiscalité, gestion, liquidité. SCPI : 4,5% net sans gestion. Locatif : 3% net après charges et vacance.',
    keywords: ['SCPI', 'immobilier locatif', 'comparatif', 'rendement', 'gestion'],
    category: 'Comparatifs',
    main_keyword: 'scpi ou immobilier locatif',
    search_intent: 'comparatif',
    target_audience: 'Investisseurs immobiliers hésitant entre SCPI et location directe',
    component_name: 'ScpiOuImmobilierLocatifComparatif20AnsArticle',
    excerpt: 'SCPI ou immobilier en direct ? Comparaison détaillée sur 20 ans : rendement, fiscalité, temps de gestion et liquidité.',
    word_count: 4500,
    read_time: 19,
    featured: true,
    status: 'published'
  },
  {
    slug: 'achat-scpi-credit-effet-levier-fiscalite',
    title: 'Achat SCPI à crédit : effet de levier et fiscalité 2025',
    meta_description: 'SCPI à crédit : effet de levier puissant (TRI 8-12%), intérêts déductibles si TMI 30%+, autofinancement possible. Guide complet fiscalité et stratégie.',
    keywords: ['SCPI crédit', 'effet de levier', 'fiscalité', 'intérêts déductibles'],
    category: 'Stratégies avancées',
    main_keyword: 'achat scpi crédit',
    search_intent: 'informationnel',
    target_audience: 'Investisseurs souhaitant maximiser leur rendement via l\'effet de levier',
    component_name: 'AchatScpiCreditEffetLevierFiscaliteArticle',
    excerpt: 'Acheter des SCPI à crédit permet de multiplier son rendement grâce à l\'effet de levier. Découvrez la stratégie et la fiscalité.',
    word_count: 3900,
    read_time: 17,
    featured: false,
    status: 'published'
  },
  {
    slug: 'demembrement-scpi-nue-propriete-usufruit',
    title: 'Démembrement de SCPI : nue-propriété et usufruit expliqués',
    meta_description: 'Démembrement SCPI : nue-propriété (décote 30-50%, zéro fiscalité, reconstitution pleine propriété). Usufruit (100% loyers, donation optimisée). Guide 2025.',
    keywords: ['démembrement SCPI', 'nue-propriété', 'usufruit', 'optimisation fiscale'],
    category: 'Stratégies avancées',
    main_keyword: 'démembrement scpi',
    search_intent: 'informationnel',
    target_audience: 'Contribuables fortement imposés ou en stratégie de transmission',
    component_name: 'DemembrementScpiNueProprieteUsufruitArticle',
    excerpt: 'Le démembrement de SCPI permet d\'optimiser sa fiscalité et sa transmission. Nue-propriété, usufruit : comment ça marche ?',
    word_count: 3600,
    read_time: 15,
    featured: false,
    status: 'published'
  },
  {
    slug: 'investir-scpi-tmi-11-pourcent-fiscalite-optimale',
    title: 'Investir en SCPI avec TMI 11% : la fiscalité optimale',
    meta_description: 'TMI 11% : fiscalité SCPI ultra-favorable (28,2% total). SCPI direct > assurance vie. Pas de prélèvement à la source. Optimisation maximale. Guide 2025.',
    keywords: ['SCPI TMI 11%', 'fiscalité SCPI', 'optimisation fiscale', 'faible imposition'],
    category: 'Fiscalité',
    main_keyword: 'scpi tmi 11 pourcent',
    search_intent: 'informationnel',
    target_audience: 'Contribuables TMI 11% souhaitant investir en SCPI',
    component_name: 'InvestirScpiTmi11PourcentFiscaliteOptimaleArticle',
    excerpt: 'Avec un TMI à 11%, vous bénéficiez de la meilleure fiscalité SCPI. Découvrez comment maximiser votre investissement.',
    word_count: 3300,
    read_time: 14,
    featured: false,
    status: 'published'
  },
  {
    slug: 'scpi-tmi-30-pourcent-arbitrage-av-direct',
    title: 'SCPI et TMI 30% : arbitrage assurance vie ou direct',
    meta_description: 'TMI 30% : SCPI en AV (30% sur rachats) ou direct (47,2% sur loyers) ? Horizon court : AV. Long terme : direct si liquidité OK. Comparatif détaillé 2025.',
    keywords: ['SCPI TMI 30%', 'assurance vie', 'SCPI direct', 'fiscalité', 'arbitrage'],
    category: 'Fiscalité',
    main_keyword: 'scpi tmi 30 pourcent',
    search_intent: 'comparatif',
    target_audience: 'Contribuables TMI 30% cherchant l\'enveloppe optimale',
    component_name: 'ScpiTmi30PourcentArbitrageAvDirectArticle',
    excerpt: 'TMI 30% : faut-il privilégier les SCPI en assurance vie ou en direct ? Analyse comparative selon votre horizon.',
    word_count: 3700,
    read_time: 16,
    featured: false,
    status: 'published'
  },
  {
    slug: 'forte-imposition-tmi-41-scpi-assurance-vie',
    title: 'Forte imposition (TMI 41-45%) : SCPI en assurance vie obligatoire',
    meta_description: 'TMI 41-45% : SCPI en direct = 62,2% de fiscalité ! AV obligatoire (30% après 8 ans). PEA-PME ou nue-propriété aussi. Stratégies hauts revenus 2025.',
    keywords: ['SCPI TMI 41%', 'TMI 45%', 'assurance vie', 'forte imposition', 'optimisation fiscale'],
    category: 'Fiscalité',
    main_keyword: 'scpi tmi 41',
    search_intent: 'informationnel',
    target_audience: 'Hauts revenus TMI 41-45%',
    component_name: 'ForteImpositionTmi41ScpiAssuranceVieArticle',
    excerpt: 'TMI 41% ou 45% ? Les SCPI en direct sont fiscalement pénalisantes. L\'assurance vie devient indispensable.',
    word_count: 3400,
    read_time: 15,
    featured: false,
    status: 'published'
  },
  {
    slug: 'scpi-europeennes-avantages-ps-0-rendement',
    title: 'SCPI européennes : avantages du PS=0 et rendement 2025',
    meta_description: 'SCPI européennes : 0% de prélèvements sociaux (vs 17,2% France), rendements 5-6%, diversification zone euro. Corum Origin, Remake Live, Vendôme Regions.',
    keywords: ['SCPI européennes', 'prélèvements sociaux', 'PS 0%', 'diversification', 'Europe'],
    category: 'Types de SCPI',
    main_keyword: 'scpi europeennes',
    search_intent: 'informationnel',
    target_audience: 'Investisseurs cherchant à optimiser leur fiscalité via l\'Europe',
    component_name: 'ScpiEuropeennesAvantagesPs0RendementArticle',
    excerpt: 'Les SCPI européennes offrent 0% de prélèvements sociaux et des rendements attractifs. Pourquoi et comment investir ?',
    word_count: 3500,
    read_time: 15,
    featured: false,
    status: 'published'
  },
  {
    slug: 'scpi-fiscales-malraux-deficit-foncier-2025',
    title: 'SCPI fiscales : Malraux, déficit foncier et réductions d\'impôt 2025',
    meta_description: 'SCPI fiscales : Malraux (réduction 22-30%), Pinel (12-21%), déficit foncier (10 700€/an). Rendement après avantage fiscal 5-8%. Profils TMI 30%+. Guide 2025.',
    keywords: ['SCPI fiscales', 'Malraux', 'Pinel', 'déficit foncier', 'réduction d\'impôt'],
    category: 'Types de SCPI',
    main_keyword: 'scpi fiscales',
    search_intent: 'informationnel',
    target_audience: 'Contribuables fortement imposés cherchant des réductions d\'impôt',
    component_name: 'ScpiFiscalesMalrauxDeficitFoncier2025Article',
    excerpt: 'Les SCPI fiscales permettent de réduire ses impôts via Malraux, Pinel ou le déficit foncier. Mode d\'emploi complet.',
    word_count: 3800,
    read_time: 16,
    featured: false,
    status: 'published'
  },
  {
    slug: 'scpi-sante-seniors-ehpad-cliniques-investissement',
    title: 'SCPI santé et seniors : EHPAD, cliniques et investissement 2025',
    meta_description: 'SCPI santé : secteur résilient (vieillissement, +60% de +75 ans d\'ici 2050), rendements 4-5%, baux longs, opérateurs solides. Primovie, PF Hospitalité, Silver Avenir.',
    keywords: ['SCPI santé', 'EHPAD', 'cliniques', 'seniors', 'santé', 'vieillissement'],
    category: 'Secteurs SCPI',
    main_keyword: 'scpi sante',
    search_intent: 'informationnel',
    target_audience: 'Investisseurs cherchant l\'exposition au secteur santé',
    component_name: 'ScpiSanteSeniorsEhpadCliniquesInvestissementArticle',
    excerpt: 'Les SCPI santé investissent dans les EHPAD et cliniques. Secteur résilient porté par le vieillissement démographique.',
    word_count: 3600,
    read_time: 15,
    featured: false,
    status: 'published'
  },
  {
    slug: 'scpi-bureaux-tertiaire-teletravail-2025',
    title: 'SCPI de bureaux et tertiaire : impact télétravail 2025',
    meta_description: 'SCPI bureaux : télétravail = mutation (flex office, surfaces premium, localisations prime). Corum XL, Epargne Pierre, PFO2 : stratégies gagnantes malgré hybride.',
    keywords: ['SCPI bureaux', 'tertiaire', 'télétravail', 'flex office', 'bureaux premium'],
    category: 'Secteurs SCPI',
    main_keyword: 'scpi bureaux',
    search_intent: 'informationnel',
    target_audience: 'Investisseurs s\'interrogeant sur l\'avenir des bureaux',
    component_name: 'ScpiBureauxTertiaireTeletravail2025Article',
    excerpt: 'Le télétravail transforme le marché des bureaux. Comment les SCPI de bureaux s\'adaptent-elles ? Analyse sectorielle.',
    word_count: 3700,
    read_time: 16,
    featured: false,
    status: 'published'
  },
  {
    slug: 'scpi-commerces-retail-e-commerce-opportunites',
    title: 'SCPI de commerces et retail : e-commerce et opportunités 2025',
    meta_description: 'SCPI commerces : e-commerce = pression sur retail traditionnel. Opportunités : retail parks, commerces alimentaires, localisations premium. Immorente, Cristal Rente.',
    keywords: ['SCPI commerces', 'retail', 'e-commerce', 'commerce de proximité', 'retail parks'],
    category: 'Secteurs SCPI',
    main_keyword: 'scpi commerces',
    search_intent: 'informationnel',
    target_audience: 'Investisseurs s\'interrogeant sur l\'avenir du commerce physique',
    component_name: 'ScpiCommercesRetailECommerceOpportunitesArticle',
    excerpt: 'Le e-commerce transforme le retail. Quelles SCPI de commerces résistent et prospèrent ? Analyse du secteur.',
    word_count: 3500,
    read_time: 15,
    featured: false,
    status: 'published'
  },
  {
    slug: 'scpi-logistique-entrepots-e-commerce-2025',
    title: 'SCPI logistique et entrepôts : boom e-commerce 2025',
    meta_description: 'SCPI logistique : secteur star (+15%/an), e-commerce dopant, baux longs (9-12 ans), locataires AAA (Amazon, DHL). LOG IN, Activimmo, LF Europimmo.',
    keywords: ['SCPI logistique', 'entrepôts', 'e-commerce', 'logistique', 'supply chain'],
    category: 'Secteurs SCPI',
    main_keyword: 'scpi logistique',
    search_intent: 'informationnel',
    target_audience: 'Investisseurs cherchant l\'exposition au secteur logistique',
    component_name: 'ScpiLogistiqueEntrepotsECommerce2025Article',
    excerpt: 'Le e-commerce propulse les SCPI logistique. Entrepôts, plateformes logistiques : le secteur star des SCPI.',
    word_count: 3400,
    read_time: 14,
    featured: false,
    status: 'published'
  },
  {
    slug: 'scpi-residentielles-logement-locatif-scpi-habitation',
    title: 'SCPI résidentielles et logement locatif : habitation 2025',
    meta_description: 'SCPI résidentielles : logements locatifs, résidences étudiantes, coliving. Crise du logement = opportunité long terme. Remake Live, Pierval Santé, Interpierre.',
    keywords: ['SCPI résidentielles', 'logement locatif', 'résidentiel', 'habitation', 'crise logement'],
    category: 'Secteurs SCPI',
    main_keyword: 'scpi residentielles',
    search_intent: 'informationnel',
    target_audience: 'Investisseurs intéressés par le résidentiel locatif',
    component_name: 'ScpiResidentiellesLogementLocatifScpiHabitationArticle',
    excerpt: 'Les SCPI résidentielles investissent dans le logement. Crise du logement et démographie : le pari du résidentiel.',
    word_count: 3600,
    read_time: 15,
    featured: false,
    status: 'published'
  },
  {
    slug: 'per-scpi-retraite-deduction-fiscale',
    title: 'PER avec SCPI : préparer sa retraite avec déduction fiscale',
    meta_description: 'PER + SCPI : déduction fiscale immédiate (TMI 30-45%), capitalisation sans fiscalité, sortie rente viagère 4-5%/an ou capital. Stratégie retraite optimale.',
    keywords: ['PER SCPI', 'retraite', 'déduction fiscale', 'PER', 'capitalisation'],
    category: 'Enveloppes',
    main_keyword: 'per scpi',
    search_intent: 'informationnel',
    target_audience: 'Actifs préparant leur retraite avec avantages fiscaux',
    component_name: 'PerScpiRetraiteDeductionFiscaleArticle',
    excerpt: 'Le PER avec SCPI combine déduction fiscale immédiate et préparation retraite. Comment optimiser cette stratégie ?',
    word_count: 3500,
    read_time: 15,
    featured: false,
    status: 'published'
  },
  {
    slug: 'sci-scpi-societe-civile-immobiliere-parts',
    title: 'SCI ou SCPI : différences entre société civile immobilière et parts',
    meta_description: 'SCI vs SCPI : SCI = gestion active, fiscalité transparente, transmission optimisée. SCPI = gestion déléguée, liquidité, diversification. Comparatif complet 2025.',
    keywords: ['SCI', 'SCPI', 'société civile immobilière', 'comparatif', 'transmission'],
    category: 'Comparatifs',
    main_keyword: 'sci scpi',
    search_intent: 'comparatif',
    target_audience: 'Investisseurs hésitant entre SCI et SCPI',
    component_name: 'SciScpiSocieteCivileImmobilierePartsArticle',
    excerpt: 'SCI ou SCPI : quelles différences ? Avantages et inconvénients comparés pour choisir la meilleure structure.',
    word_count: 3700,
    read_time: 16,
    featured: false,
    status: 'published'
  },
  {
    slug: 'ifi-scpi-impot-fortune-immobiliere-strategies',
    title: 'IFI et SCPI : stratégies face à l\'impôt sur la fortune immobilière',
    meta_description: 'IFI + SCPI : parts taxables comme immobilier direct. Stratégies : démembrement (NU non IFI), holding, donations. Seuil 1,3M€. Optimisation patrimoniale 2025.',
    keywords: ['IFI', 'SCPI', 'impôt fortune immobilière', 'démembrement', 'optimisation'],
    category: 'Fiscalité',
    main_keyword: 'ifi scpi',
    search_intent: 'informationnel',
    target_audience: 'Contribuables IFI détenant ou envisageant des SCPI',
    component_name: 'IfiScpiImpotFortuneImmobiliereStrategiesArticle',
    excerpt: 'Les SCPI sont soumises à l\'IFI. Quelles stratégies pour optimiser sa situation patrimoniale ?',
    word_count: 3400,
    read_time: 14,
    featured: false,
    status: 'published'
  },
  {
    slug: 'succession-scpi-transmission-droits-heritage',
    title: 'Succession et SCPI : transmission, droits et héritage 2025',
    meta_description: 'Succession SCPI : fiscalité (abattements 100k€, barème 5-45%), démembrement avantageux, donations Dutreil, assurance vie (hors succession). Guide transmission 2025.',
    keywords: ['succession SCPI', 'transmission', 'héritage', 'droits de succession', 'donation'],
    category: 'Patrimoine',
    main_keyword: 'succession scpi',
    search_intent: 'informationnel',
    target_audience: 'Détenteurs de SCPI préparant leur transmission',
    component_name: 'SuccessionScpiTransmissionDroitsHeritageArticle',
    excerpt: 'Comment transmettre ses SCPI ? Fiscalité successorale, donations, démembrement : les stratégies optimales.',
    word_count: 3600,
    read_time: 15,
    featured: false,
    status: 'published'
  },
  {
    slug: 'diversification-scpi-combien-nombre-parts',
    title: 'Diversification SCPI : combien de SCPI et nombre de parts ?',
    meta_description: 'Diversification SCPI : 8-12 SCPI optimum (secteurs, géographies, gestionnaires). Parts min 5k€/SCPI. Corrélation <0,4. MaximusSCPI Score pour sélection 2025.',
    keywords: ['diversification SCPI', 'nombre de SCPI', 'portefeuille SCPI', 'allocation'],
    category: 'Stratégies',
    main_keyword: 'diversification scpi',
    search_intent: 'informationnel',
    target_audience: 'Investisseurs construisant leur portefeuille SCPI',
    component_name: 'DiversificationScpiCombienNombrePartsArticle',
    excerpt: 'Combien de SCPI détenir dans son portefeuille ? Comment diversifier efficacement ? Stratégie de construction.',
    word_count: 3500,
    read_time: 15,
    featured: false,
    status: 'published'
  },
  {
    slug: 'rendement-scpi-2025-tdvm-taux-distribution',
    title: 'Rendement SCPI 2025 : TDVM, taux de distribution et performance',
    meta_description: 'Rendement SCPI 2025 : TDVM 4-6% (loyers/prix souscription), TRI incluant plus-values. TOF, capitalisation, secteur impactent. Corum Origin 5,21%, Épargne Pierre 4,64%.',
    keywords: ['rendement SCPI', 'TDVM', 'taux de distribution', 'performance SCPI', '2025'],
    category: 'Analyses',
    main_keyword: 'rendement scpi 2025',
    search_intent: 'informationnel',
    target_audience: 'Investisseurs comparant les rendements SCPI',
    component_name: 'RendementScpi2025TdvmTauxDistributionArticle',
    excerpt: 'Quel rendement attendre des SCPI en 2025 ? Comprendre le TDVM, le TRI et les facteurs de performance.',
    word_count: 3300,
    read_time: 14,
    featured: false,
    status: 'published'
  },
  {
    slug: 'risques-scpi-vacance-locative-liquidite',
    title: 'Risques SCPI : vacance locative, liquidité et autres 2025',
    meta_description: 'Risques SCPI : vacance locative (TOF <5% OK), illiquidité (délais 2-6 mois), baisse valeur, défaut gestionnaire. Diversification essentielle. Guide complet 2025.',
    keywords: ['risques SCPI', 'vacance locative', 'liquidité SCPI', 'TOF', 'risques immobiliers'],
    category: 'Guides pratiques',
    main_keyword: 'risques scpi',
    search_intent: 'informationnel',
    target_audience: 'Investisseurs souhaitant comprendre les risques avant d\'investir',
    component_name: 'RisquesScpiVacanceLocativeLiquiditeArticle',
    excerpt: 'Quels sont les risques d\'investir en SCPI ? Vacance, liquidité, baisse de valeur : analyse complète et solutions.',
    word_count: 3700,
    read_time: 16,
    featured: false,
    status: 'published'
  },
  {
    slug: 'frais-scpi-souscription-gestion-performance',
    title: 'Frais SCPI : souscription, gestion et performance 2025',
    meta_description: 'Frais SCPI : souscription (8-12% HT), gestion (8-12% HT loyers), arbitrage si négociés. Impact rendement net -1 pt. Comparer après frais. Transparence 2025.',
    keywords: ['frais SCPI', 'frais souscription', 'frais gestion', 'coûts SCPI'],
    category: 'Guides pratiques',
    main_keyword: 'frais scpi',
    search_intent: 'informationnel',
    target_audience: 'Investisseurs voulant comprendre les coûts réels des SCPI',
    component_name: 'FraisScpiSouscriptionGestionPerformanceArticle',
    excerpt: 'Quels frais pour investir en SCPI ? Souscription, gestion, arbitrage : décryptage complet et impact sur le rendement.',
    word_count: 3400,
    read_time: 14,
    featured: false,
    status: 'published'
  },
  {
    slug: 'revendre-parts-scpi-delais-marche-secondaire',
    title: 'Revendre ses parts de SCPI : délais et marché secondaire 2025',
    meta_description: 'Revente SCPI : délais 2-6 mois selon marché secondaire. Prix retrait < souscription (décote 5-15%). Liquidité variable par SCPI. Anticiper sortie. Guide 2025.',
    keywords: ['revendre SCPI', 'marché secondaire', 'liquidité SCPI', 'délais revente'],
    category: 'Guides pratiques',
    main_keyword: 'revendre parts scpi',
    search_intent: 'informationnel',
    target_audience: 'Détenteurs de SCPI souhaitant récupérer leur capital',
    component_name: 'RevendrePartsScpiDelaisMarcheSecondaireArticle',
    excerpt: 'Comment revendre ses parts de SCPI ? Marché secondaire, délais, prix de retrait : tout comprendre.',
    word_count: 3300,
    read_time: 14,
    featured: false,
    status: 'published'
  },
  {
    slug: 'scpi-ou-etf-immobilier-reit-comparatif',
    title: 'SCPI ou ETF immobilier (REIT) : comparatif complet 2025',
    meta_description: 'SCPI vs ETF REIT : SCPI = pierre papier France 4,5%, stable. ETF REIT = foncières cotées internationales, volatiles, liquidité 100%. Profils différents. Comparatif.',
    keywords: ['SCPI', 'ETF immobilier', 'REIT', 'comparatif', 'immobilier coté'],
    category: 'Comparatifs',
    main_keyword: 'scpi ou etf immobilier',
    search_intent: 'comparatif',
    target_audience: 'Investisseurs hésitant entre SCPI et ETF immobiliers',
    component_name: 'ScpiOuEtfImmobilierReitComparatifArticle',
    excerpt: 'SCPI ou ETF immobilier (REIT) ? Comparaison rendement, liquidité, volatilité et fiscalité pour choisir.',
    word_count: 3600,
    read_time: 15,
    featured: false,
    status: 'published'
  },
  {
    slug: 'scpi-ou-opci-differences-avantages',
    title: 'SCPI ou OPCI : différences et avantages comparés 2025',
    meta_description: 'SCPI vs OPCI : SCPI = 100% immo physique, 4-5%. OPCI = immo 60-90% + liquidités, volatilité modérée, 3-4%. Liquidité OPCI > SCPI. Choix selon profil 2025.',
    keywords: ['SCPI', 'OPCI', 'différences', 'comparatif', 'pierre papier'],
    category: 'Comparatifs',
    main_keyword: 'scpi ou opci',
    search_intent: 'comparatif',
    target_audience: 'Investisseurs découvrant la pierre papier',
    component_name: 'ScpiOuOpciDifferencesAvantagesArticle',
    excerpt: 'SCPI ou OPCI : quelles différences ? Avantages et inconvénients pour choisir le bon véhicule immobilier.',
    word_count: 3400,
    read_time: 14,
    featured: false,
    status: 'published'
  },
  {
    slug: 'premier-investissement-scpi-debutant-guide',
    title: 'Premier investissement en SCPI : guide débutant 2025',
    meta_description: 'Débuter en SCPI : comprendre pierre papier, rendement 4-5%, minimum 1 000€, horizon 8+ ans, diversifier 3-5 SCPI. Guide complet débutant MaximusSCPI 2025.',
    keywords: ['premier investissement SCPI', 'débuter SCPI', 'guide débutant', 'investissement immobilier'],
    category: 'Guides pratiques',
    main_keyword: 'premier investissement scpi',
    search_intent: 'informationnel',
    target_audience: 'Débutants découvrant les SCPI',
    component_name: 'PremierInvestissementScpiDebutantGuideArticle',
    excerpt: 'Vous débutez en SCPI ? Guide complet : comment investir, combien, quelles SCPI choisir, et erreurs à éviter.',
    word_count: 3800,
    read_time: 16,
    featured: false,
    status: 'published'
  },
  {
    slug: 'investir-scpi-jeune-actif-25-35-ans',
    title: 'Investir en SCPI jeune actif (25-35 ans) : stratégie 2025',
    meta_description: 'SCPI jeune actif 25-35 ans : commencer tôt (effet temps), PEA-PME ou AV si TMI bas, versements programmés 200-500€/mois. Patrimoine long terme. Stratégie 2025.',
    keywords: ['SCPI jeune actif', '25-35 ans', 'jeune investisseur', 'versements programmés'],
    category: 'Stratégies',
    main_keyword: 'scpi jeune actif',
    search_intent: 'informationnel',
    target_audience: 'Jeunes actifs 25-35 ans souhaitant investir',
    component_name: 'InvestirScpiJeuneActif2535AnsArticle',
    excerpt: 'Jeune actif entre 25 et 35 ans ? Pourquoi et comment investir en SCPI dès maintenant pour construire son patrimoine.',
    word_count: 3500,
    read_time: 15,
    featured: false,
    status: 'published'
  }
];

async function insertArticles() {
  console.log(`🚀 Insertion de ${articles.length} articles dans Supabase...`);

  for (const article of articles) {
    const { error } = await supabase
      .from('articles_seo')
      .upsert(article, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Erreur pour ${article.slug}:`, error);
    } else {
      console.log(`✅ ${article.slug}`);
    }
  }

  console.log('\n✨ Insertion terminée !');
}

insertArticles().catch(console.error);
