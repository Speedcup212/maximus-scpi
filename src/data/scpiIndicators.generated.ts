// FICHIER GÉNÉRÉ — ne pas modifier manuellement
// Généré par : scripts/data/publish-scpi-indicators.ts
// Source primaire : bulletins trimestriels T3 2025 + scpi_complet.json (legacy)
// Dernière mise à jour : 2026-05-22
// SCPI couvertes : 5 pilotes (Activimmo, Comète, Iroko Zen, Remake Live, Transitions Europe)
// Pour régénérer : npx tsx scripts/data/publish-scpi-indicators.ts --apply
//
// Règle de classification source_origin :
//   official_document → champ extrait d'un bulletin/rapport officiel JSON (scripts/bulletin_*.json)
//   legacy_dataset    → champ issu de scpi_complet.json sans traçabilité bulletin individuelle
//
// Règle de classification data_status :
//   verified  → tous les indicateurs clés proviennent d'official_document
//   to_verify → au moins un indicateur clé (notamment distribution_rate) vient de legacy_dataset

import { ScpiIndicator } from '../types/scpiIndicator';

export const INDICATORS_GENERATED_AT = '2026-05-22';
export const INDICATORS_SOURCE_VERSION = 'T3 2025';

export const scpiIndicators: Record<string, ScpiIndicator> = {

  // ─────────────────────────────────────────────────────────────────────────
  // ACTIVIMMO (Alderan)
  // Source : scpi_complet.json uniquement — aucun bulletin JSON disponible
  // updateActivimmoT3.cjs a mis à jour scpi_complet.json depuis le bulletin T3
  // mais la traçabilité reste indirecte
  // ─────────────────────────────────────────────────────────────────────────
  activimmo: {
    slug: 'activimmo',
    name: 'Activimmo',
    management_company: 'Alderan',
    category: 'Logistique et activités',
    strategy_summary:
      'SCPI spécialisée logistique urbaine et entrepôts. Stratégie pan-européenne axée sur la durabilité, label ISR.',

    distribution_rate: 5.5,        // legacy_dataset — scpi_complet.json
    distribution_year: 2024,       // estimé — cohérent avec libellé comparateur existant
    share_price: 610,              // legacy_dataset — scpi_complet.json
    capitalization: 1400,          // legacy_dataset — scpi_complet.json
    tof: 92.8,                     // legacy_dataset — scpi_complet.json
    occupancy_rate: 92.8,          // legacy_dataset — scpi_complet.json
    subscription_fees: 12.72,      // legacy_dataset — scpi_complet.json
    management_fees: 10,           // legacy_dataset — scpi_complet.json
    enjoyment_delay: 6,            // legacy_dataset — scpi_complet.json
    reconstitution_value: 609.65,  // legacy_dataset — scpi_complet.json
    discount_premium: 0,           // legacy_dataset — scpi_complet.json
    debt_ratio: 1.46,              // legacy_dataset — scpi_complet.json
    ran: null,
    tri_5y: null,
    tri_10y: null,

    main_sector: 'Logistique',
    sector_breakdown: {
      "Entrepôts logistiques": 51,
      "Locaux d'activités": 31,
      "Logistique urbaine": 10,
      "Transport": 7,
      "Autres": 1,
    },
    main_geography: 'France',
    geography_breakdown: {
      France: 78.2,
      Espagne: 13.8,
      Portugal: 4.2,
      Italie: 1.5,
      Allemagne: 1,
      Autres: 0.3,
    },

    source_url: 'https://alderan.fr',
    source_document_type: 'donnees_internes',
    source_publication_date: null,    // date bulletin T3 non extraite
    extraction_date: '2026-05-22',
    confidence_score: 0.72,
    data_status: 'to_verify',
    source_origin: 'legacy_dataset',
    legacy_fields: [
      'distribution_rate', 'share_price', 'capitalization', 'tof',
      'subscription_fees', 'management_fees', 'enjoyment_delay',
      'reconstitution_value', 'discount_premium', 'debt_ratio',
    ],

    warning:
      'Toutes les données viennent de scpi_complet.json (legacy). Aucun bulletin JSON dédié Activimmo. ' +
      'TOF à 92,8% — en retrait de 0,5pt vs T2 2025. Vérification manuelle requise avant affichage public.',
    requires_manual_review: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // COMÈTE (Alderan)
  // Source : bulletin_comete_t3_2025.json (partiel — seul endettement non-null)
  //          + scpi_complet.json pour tous les autres champs
  // ─────────────────────────────────────────────────────────────────────────
  comete: {
    slug: 'comete',
    name: 'Comète',
    management_company: 'Alderan',
    category: 'Diversifié européen',
    strategy_summary:
      'SCPI diversifiée européenne à haute rentabilité. Stratégie opportuniste multi-pays, frais de gestion différés nuls.',

    distribution_rate: 9,          // legacy_dataset — scpi_complet.json (bulletin null)
    distribution_year: 2024,       // estimé
    share_price: 250,              // legacy_dataset — scpi_complet.json (bulletin null)
    capitalization: 519.6,         // legacy_dataset — scpi_complet.json (bulletin null)
    tof: 99.1,                     // legacy_dataset — scpi_complet.json (bulletin null)
    occupancy_rate: 99.1,          // legacy_dataset
    subscription_fees: 12,         // legacy_dataset — scpi_complet.json
    management_fees: null,
    enjoyment_delay: 6,            // legacy_dataset — scpi_complet.json
    reconstitution_value: 258.45,  // legacy_dataset — scpi_complet.json (bulletin null)
    discount_premium: -3.27,       // legacy_dataset — scpi_complet.json
    debt_ratio: 0.1,               // official_document — bulletin_comete_t3_2025.json
    ran: null,
    tri_5y: null,
    tri_10y: null,

    main_sector: 'Diversifié',
    sector_breakdown: null,        // absent du bulletin T3 2025
    main_geography: 'Europe',
    geography_breakdown: null,     // absent du bulletin T3 2025

    source_url: 'https://alderan.fr',
    source_document_type: 'bulletin_trimestriel',
    source_publication_date: null,  // date bulletin T3 non extraite
    extraction_date: '2026-05-22',
    confidence_score: 0.68,
    data_status: 'to_verify',
    source_origin: 'legacy_dataset',
    legacy_fields: [
      'distribution_rate', 'share_price', 'capitalization', 'tof',
      'subscription_fees', 'enjoyment_delay', 'reconstitution_value', 'discount_premium',
    ],

    warning:
      'Taux de distribution 9% issu de scpi_complet.json — non confirmé dans le bulletin T3 2025 (champ null). ' +
      'Seul le ratio endettement (0,1%) provient du bulletin officiel. ' +
      'Répartition sectorielle et géographique absentes du bulletin T3.',
    requires_manual_review: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // IROKO ZEN (Iroko)
  // Source : bulletin_iroko_zen_t3_2025.json (complet sauf tauxDistribution)
  //          + scpi_complet.json pour distribution_rate uniquement
  // ─────────────────────────────────────────────────────────────────────────
  'iroko-zen': {
    slug: 'iroko-zen',
    name: 'Iroko Zen',
    management_company: 'Iroko',
    category: 'Diversifié européen',
    strategy_summary:
      'SCPI zéro frais de souscription, diversifiée multi-secteurs et multi-pays. Délai de jouissance 1 mois.',

    distribution_rate: 7.12,       // legacy_dataset — scpi_complet.json (bulletin null)
    distribution_year: 2024,       // estimé
    share_price: 204,              // official_document — bulletin_iroko_zen_t3_2025.json
    capitalization: 1237,          // official_document — bulletin
    tof: 98.1,                     // official_document — bulletin
    occupancy_rate: 97.6,          // official_document — bulletin (TOP physique)
    subscription_fees: 0,          // legacy_dataset — scpi_complet.json
    management_fees: null,
    enjoyment_delay: 1,            // legacy_dataset — scpi_complet.json
    reconstitution_value: 213.65,  // official_document — bulletin
    discount_premium: null,        // absent du bulletin
    debt_ratio: 30.1,              // official_document — bulletin
    ran: null,
    tri_5y: null,
    tri_10y: null,

    main_sector: 'Diversifié',
    sector_breakdown: null,        // absent du bulletin T3 2025
    main_geography: 'Europe',
    geography_breakdown: null,     // absent du bulletin T3 2025

    source_url: 'https://iroko.eu',
    source_document_type: 'bulletin_trimestriel',
    source_publication_date: null,  // date bulletin T3 non extraite
    extraction_date: '2026-05-22',
    confidence_score: 0.82,
    data_status: 'to_verify',
    source_origin: 'legacy_dataset',   // dominant sur l'indicateur clé (TD)
    legacy_fields: ['distribution_rate', 'subscription_fees', 'enjoyment_delay'],

    warning:
      'Le taux de distribution (7,12%) vient de scpi_complet.json — non présent dans le bulletin T3 2025. ' +
      'Les autres indicateurs (prix, TOF, capitalisation, reconstitution, endettement) sont issus du bulletin officiel.',
    requires_manual_review: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // REMAKE LIVE (Remake Asset Management)
  // Source : bulletin_remake_live_t3_2025.json — complet sur tous les champs clés
  // Seule SCPI pilote entièrement vérifiable depuis un bulletin officiel
  // ─────────────────────────────────────────────────────────────────────────
  'remake-live': {
    slug: 'remake-live',
    name: 'Remake Live',
    management_company: 'Remake Asset Management',
    category: 'Diversifié européen',
    strategy_summary:
      'SCPI zéro frais, diversifiée multi-secteurs en Europe. Positionnement sur actifs à forte valeur ajoutée ESG.',

    distribution_rate: 7.5,        // official_document — bulletin_remake_live_t3_2025.json
    distribution_year: 2025,       // issu du bulletin T3 2025 directement
    share_price: 204,              // official_document — bulletin
    capitalization: 806,           // official_document — bulletin
    tof: 99.3,                     // official_document — bulletin
    occupancy_rate: 99.3,          // official_document — bulletin
    subscription_fees: 0,          // legacy_dataset — scpi_complet.json
    management_fees: null,
    enjoyment_delay: 6,            // legacy_dataset — scpi_complet.json
    reconstitution_value: 203.52,  // official_document — bulletin
    discount_premium: 0.24,        // official_document — bulletin
    debt_ratio: 18.64,             // official_document — bulletin
    ran: null,
    tri_5y: null,
    tri_10y: null,

    main_sector: 'Diversifié',
    sector_breakdown: {            // official_document — bulletin
      Bureaux: 38.02,
      'Santé & éducation': 21.92,
      'Logistique et locaux d\'activité': 14.12,
      Commerces: 12.06,
      'Hôtels, tourisme, loisirs': 8.84,
      Résidentiel: 3.48,
      Alternatifs: 1.56,
    },
    main_geography: 'Europe',
    geography_breakdown: {         // official_document — bulletin
      'Royaume Uni': 29,
      France: 27.62,
      Espagne: 11.66,
      Irlande: 10.11,
      'Pays-Bas': 9.93,
      Pologne: 8.04,
      Allemagne: 2.65,
      Portugal: 0.98,
    },

    source_url: 'https://remake-am.com',    // à vérifier : peut être remake-asset-management.com
    source_document_type: 'bulletin_trimestriel',
    source_publication_date: null,  // date bulletin T3 non extraite
    extraction_date: '2026-05-22',
    confidence_score: 0.90,
    data_status: 'verified',
    source_origin: 'official_document',
    legacy_fields: ['subscription_fees', 'enjoyment_delay'],

    warning:
      'Frais de souscription (0%) et délai de jouissance (6 mois) issus de scpi_complet.json. ' +
      "URL source_url à vérifier — peut être remake-asset-management.com plutôt que remake-am.com.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TRANSITIONS EUROPE (Arkéa REIM)
  // Source : bulletin_transitions_europe_t3_2025.json (complet sauf tauxDistribution)
  //          + scpi_complet.json pour distribution_rate uniquement
  // ─────────────────────────────────────────────────────────────────────────
  'transitions-europe': {
    slug: 'transitions-europe',
    name: 'Transitions Europe',
    management_company: 'Arkéa REIM',
    category: 'Diversifié européen',
    strategy_summary:
      'SCPI 100% européenne hors France, axée sur la transition énergétique et durable. Label ISR renouvelé 2025.',

    distribution_rate: 8.6,        // legacy_dataset — scpi_complet.json (bulletin null)
    distribution_year: 2024,       // estimé
    share_price: 200,              // official_document — bulletin_transitions_europe_t3_2025.json
    capitalization: 948,           // official_document — bulletin
    tof: 97.54,                    // official_document — bulletin
    occupancy_rate: 97.54,         // official_document — bulletin
    subscription_fees: 12,         // legacy_dataset — scpi_complet.json
    management_fees: null,
    enjoyment_delay: 6,            // legacy_dataset — scpi_complet.json
    reconstitution_value: 207.02,  // official_document — bulletin
    discount_premium: -3.4,        // official_document — bulletin
    debt_ratio: 0,                 // official_document — bulletin
    ran: null,
    tri_5y: null,
    tri_10y: null,

    main_sector: 'Diversifié',
    sector_breakdown: {            // official_document — bulletin
      Bureaux: 35,
      Commerce: 21,
      Logistique: 17,
      'Life Science': 15,
      Hospitalité: 8,
      Éducation: 4,
    },
    main_geography: 'Europe',
    geography_breakdown: {         // official_document — bulletin
      Espagne: 36,
      Allemagne: 20,
      'Pays-Bas': 19,
      Irlande: 12,
      Italie: 9,
      Pologne: 4,
    },

    source_url: 'https://arkeaim.com',     // à vérifier — peut être arkea-im.com
    source_document_type: 'bulletin_trimestriel',
    source_publication_date: null,  // date bulletin T3 non extraite
    extraction_date: '2026-05-22',
    confidence_score: 0.82,
    data_status: 'to_verify',
    source_origin: 'legacy_dataset',   // dominant sur l'indicateur clé (TD)
    legacy_fields: ['distribution_rate', 'subscription_fees', 'enjoyment_delay'],

    warning:
      'Le taux de distribution (8,6%) vient de scpi_complet.json — non présent dans le bulletin T3 2025. ' +
      'Décote de -3,4% vs valeur de reconstitution. ' +
      "URL source_url à vérifier — peut être arkea-im.com.",
    requires_manual_review: true,
  },
};

export function getIndicator(slug: string): ScpiIndicator | undefined {
  return scpiIndicators[slug];
}

export function getDataStatusLabel(status: ScpiIndicator['data_status']): string {
  switch (status) {
    case 'verified':  return 'Vérifié';
    case 'to_verify': return 'À vérifier';
    case 'missing':   return 'Donnée manquante';
  }
}

export function getDataStatusColor(status: ScpiIndicator['data_status']): string {
  switch (status) {
    case 'verified':  return 'text-green-700 bg-green-50 border-green-200';
    case 'to_verify': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'missing':   return 'text-gray-500 bg-gray-50 border-gray-200';
  }
}

export function getSourceOriginLabel(origin: ScpiIndicator['source_origin']): string {
  switch (origin) {
    case 'official_document': return 'Document officiel';
    case 'official_website':  return 'Site officiel';
    case 'legacy_dataset':    return 'Dataset legacy';
    case 'manual_entry':      return 'Saisie manuelle';
    case 'estimated':         return 'Estimé';
    case 'missing':           return 'Absent';
  }
}
