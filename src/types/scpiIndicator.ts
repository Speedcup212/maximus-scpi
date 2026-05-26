export type DataStatus = 'verified' | 'to_verify' | 'missing';

export type DocumentType =
  | 'bulletin_trimestriel'
  | 'rapport_annuel'
  | 'dic'
  | 'note_information'
  | 'page_officielle'
  | 'statuts'
  | 'plaquette_officielle'
  | 'communique_officiel'
  | 'donnees_internes';

/**
 * Origine de la donnée dans la chaîne de traitement :
 * - official_document : extrait d'un bulletin, rapport annuel ou DIC officiel
 * - official_website  : lu directement sur la page publique de la société de gestion
 * - legacy_dataset    : issu de scpi_complet.json — source indirecte non traçable individuellement
 * - manual_entry      : saisi à la main sans document source identifié
 * - estimated         : valeur calculée ou approximée
 * - missing           : champ absent de toutes les sources disponibles
 */
export type SourceOrigin =
  | 'official_document'
  | 'official_website'
  | 'legacy_dataset'
  | 'manual_entry'
  | 'estimated'
  | 'missing';

export interface ScpiIndicator {
  slug: string;
  name: string;
  management_company: string;
  category: string;
  strategy_summary: string;

  distribution_rate: number | null;
  distribution_year: number | null;
  share_price: number | null;
  capitalization: number | null;
  tof: number | null;
  occupancy_rate: number | null;
  subscription_fees: number | null;
  management_fees: number | null;
  enjoyment_delay: number | null;
  reconstitution_value: number | null;
  discount_premium: number | null;
  debt_ratio: number | null;
  ran: number | null;
  tri_5y: number | null;
  tri_10y: number | null;
  walt?: number | null;
  walb?: number | null;
  nombre_locataires?: number | null;
  distribution_quarterly?: number | null;

  main_sector: string | null;
  sector_breakdown: Record<string, number> | null;
  main_geography: string | null;
  geography_breakdown: Record<string, number> | null;

  source_url: string | null;
  source_document_type: DocumentType | null;
  source_publication_date: string | null;
  /** Période du bulletin source (ex: "T3 2025") — identique à source_period dans Supabase */
  source_period: string | null;
  extraction_date: string;
  confidence_score: number;
  data_status: DataStatus;
  /** Origine dominante pour les indicateurs clés de cette entrée */
  source_origin: SourceOrigin;
  /** Champs issus de legacy_dataset quand l'entrée est mixte */
  legacy_fields?: string[];

  /** Sources consultées dans l'ordre de priorité avant de marquer un champ missing */
  sources_checked: DocumentType[];
  /** Source la plus riche ayant fourni des données pour cette entrée */
  best_available_source: DocumentType | null;
  /** Explication des champs null après recherche multi-sources */
  missing_reason: string | null;
  /** true = recherche multi-sources complète effectuée ; false = bulletin seul consulté */
  evidence_search_complete: boolean;

  previous_value?: number | null;
  new_value?: number | null;
  variation_detected?: boolean;
  requires_manual_review?: boolean;
  warning?: string | null;
}
