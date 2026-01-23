export interface ScpiRepartition {
  name: string;
  value: number;
}

export interface Scpi {
  id: number;
  name: string;
  sector: 'bureaux' | 'commerces' | 'residentiel' | 'sante' | 'logistique' | 'hotellerie' | 'diversifie';
  geography: 'france' | 'europe' | 'international';
  yield: number;
  capitalization: number;
  tof: number;
  price: number;
  discount: number;
  fees: number;
  isr: boolean;
  european: boolean;
  company: string;
  creation: number;
  minInvest: number;
  repartitionSector?: ScpiRepartition[];
  repartitionGeo?: ScpiRepartition[];
  allocation?: number;
  rating?: number;
  isRecommended?: boolean;
  debt?: number; // Ratio d'endettement en pourcentage
  // Champs supplémentaires depuis le fichier Excel
  delaiJouissance?: number; // Délai de jouissance en mois
  versementLoyers?: string; // Fréquence de versement des loyers (ex: "Trimestriel", "Mensuel")
  dureeDetentionRecommandee?: number; // Durée de détention recommandée en années
  fraisGestion?: number; // Frais de gestion (HT/%)
  valeurRetrait?: number; // Valeur de retrait (€)
  valeurReconstitution?: number; // Valeur de reconstitution (€)
  valeurRealisation?: number; // Valeur de réalisation (€)
  distribution?: number; // Distribution par part (€/part)
  nbImmeubles?: number; // Nombre d'immeubles
  sfdr?: string; // Classification SFDR (ex: "Article 8", "Article 9")
  profilCible?: string; // Profil cible (ex: "Profil équilibré", "Profil prudent")
  profilRisque?: number; // Profil de risque de 1 à 7
}

export type QuickFilterType = 'tous' | 'europeennes' | 'francaises' | 'isr' | 'high-yield';

export type ObjectiveType = 'revenus' | 'capitaliser' | 'diversifier' | 'fiscalite';

export type PurchaseMethod = 'pleine-propriete' | 'nue-propriete' | 'usufruit' | 'credit';

export interface PurchaseMethodInfo {
  id: PurchaseMethod;
  name: string;
  description: string;
  icon: string;
  fiscalAdvantage: string;
  minInvestment: number;
  targetTmi: number[];
  yieldMultiplier: number;
  taxOptimization: number;
}

export interface InvestmentObjective {
  id: ObjectiveType;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: {
    minYield?: number;
    maxRisk?: number;
    preferredSectors?: string[];
    preferredGeography?: string[];
    maxSingleAllocation?: number;
  };
}

export interface Filters {
  sector: string;
  geography: string;
  minYield: number;
  minCapitalization: number;
}