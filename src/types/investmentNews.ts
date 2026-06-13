// Types pour les actualités d'investissements immobiliers SCPI

export type OperationType =
  | 'acquisition'
  | 'acquisition_portefeuille'
  | 'acquisition_vefa'
  | 'extension_patrimoine';

export type AssetType =
  | 'bureaux'
  | 'commerce'
  | 'logistique'
  | 'sante'
  | 'education'
  | 'hotellerie'
  | 'residentiel_gere'
  | 'locaux_activite'
  | 'mixte'
  | 'portefeuille_multi_actifs'
  | 'autre_immobilier';

export type DataQuality = 'complete' | 'standard' | 'partial' | 'weak';

export type EditorialPriority = 0 | 1 | 2 | 3;

export interface InvestmentNewsItem {
  id?: string;
  scpi: string;
  managementCompany: string;
  operationType: OperationType;
  assetType: AssetType;
  country: string;
  city: string;
  area: string;
  address: string;
  tenant: string;
  amount: string;
  surface: string;
  leaseDuration: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceOfficial: boolean;
  date: string;
  detectedAt: string;
  investmentRelated: boolean;
  dataQuality: DataQuality;
  editorialPriority: EditorialPriority;
  confidence: number;
  disclaimer: string;
}

export interface NewsSourceEntry {
  slug: string;
  name: string;
  managementCompany: string;
  officialUrl: string;
  newsUrl: string;
  rssUrl: string;
  enabled: boolean;
  notes: string;
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  bureaux: 'Bureaux',
  commerce: 'Commerce',
  logistique: 'Logistique',
  sante: 'Santé',
  education: 'Éducation',
  hotellerie: 'Hôtellerie',
  residentiel_gere: 'Résidentiel géré',
  locaux_activite: 'Locaux d\'activité',
  mixte: 'Mixte',
  portefeuille_multi_actifs: 'Portefeuille multi-actifs',
  autre_immobilier: 'Autre immobilier',
};

export const ASSET_TYPE_ICONS: Record<AssetType, string> = {
  bureaux: 'Building2',
  commerce: 'ShoppingBag',
  logistique: 'Warehouse',
  sante: 'Heart',
  education: 'GraduationCap',
  hotellerie: 'Hotel',
  residentiel_gere: 'Home',
  locaux_activite: 'Factory',
  mixte: 'Layers',
  portefeuille_multi_actifs: 'Briefcase',
  autre_immobilier: 'Building',
};
