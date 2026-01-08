import { SCPIExtended } from '../data/scpiDataExtended';

export type DetentionMode = 'direct' | 'av' | 'per';
export type InvestmentHorizon = 5 | 10 | 15 | 20;
export type SubscriptionStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type SubscriptionStatus = 'pending_cif' | 'cif_validated' | 'psi_completed' | 'subscription_completed' | 'cancelled';
export type RiskTolerance = 'faible' | 'moderee' | 'elevee';
export type RiskReaction = 'securiser' | 'conserver' | 'renforcer';
export type ScpiKnowledge = 'aucune' | 'generale' | 'experimente';
export type PepStatus = 'non' | 'oui_personne' | 'oui_proche';
export type FundingMode = 'fonds_propres' | 'credit' | 'mixte';
export type SubscriptionType = 'biens_propres' | 'biens_communs';
export type MaritalStatus = 'celibataire' | 'marie' | 'pacs' | 'divorce' | 'veuf' | 'concubinage';
export type MaritalRegime = 'communaute_universelle' | 'communaute_reduite_aux_acquets' | 'separation_biens' | 'participation_aux_acquets' | 'communaute_biens_meubles_acquets' | 'indivision' | 'autre' | null;
export type LegalPersonality = 'personne_physique' | 'personne_morale';
export type FundOrigin = 'salaires' | 'heritage' | 'donation' | 'vente_immobilier' | 'assurance_vie' | 'epargne' | 'autre';

// Interface pour le co-souscripteur
export interface CoSubscriberState {
  // Étape 3: Identité & Contact
  civility: 'Monsieur' | 'Madame' | 'Autre';
  lastName: string;
  birthLastName: string; // Nom de naissance
  firstName: string;
  birthDate: string; // Format: YYYY-MM-DD
  birthCountry: string;
  birthCity: string;
  nationality: string;
  legalPersonality: LegalPersonality;
  
  // Contact
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  emailConfirmation: string; // Confirmation de l'email
  
  // Étape 4: Situation familiale & professionnelle
  maritalStatus: MaritalStatus;
  maritalRegime: MaritalRegime;
  dependentChildren: number;
  profession: string;
  activitySector: string;
  employer: string;
  activityOutsideEU: boolean;
  
  // Étape 5: Situation fiscale & résidentielle
  housingSituation: 'proprietaire' | 'locataire' | 'heberge' | 'autre';
  taxResidence: string;
  taxResidenceCountry: string;
  taxResidenceSameAsPrincipal: boolean | null;
  nif: string;
  averageTaxRate: number;
  usPerson: boolean;
  usTaxObligation: boolean | null;
  usCitizenship: boolean | null;
  pep: PepStatus;
  
  // Étape 6: Situation patrimoniale
  primaryResidence: number;
  secondaryResidence: number;
  rentalRealEstate: number;
  securities: number;
  assuranceVie: number;
  liquidities: number;
  livrets: number;
  or: number;
  collection: number;
  objetsArt: number;
  actifsProfessionnels: number;
  forets: number;
  debts: number;
  otherAssets: number;
  salary: number;
  rentalIncome: number;
  financialIncome: number;
  pensions: number;
  otherIncome: number;
  rent: number;
  creditsResidences: number;
  creditsLocatif: number;
  creditsConsommation: number;
  incomeTax: number;
  ifi: number;
  otherCharges: number;
}

// Interface pour les patrimoines séparés en co-souscription
export interface PatrimoineSepare {
  primaryResidence: number;
  secondaryResidence: number;
  rentalRealEstate: number;
  securities: number;
  assuranceVie: number;
  liquidities: number;
  livrets: number;
  or: number;
  collection: number;
  objetsArt: number;
  actifsProfessionnels: number;
  forets: number;
  debts: number;
  otherAssets: number;
  salary: number;
  rentalIncome: number;
  financialIncome: number;
  pensions: number;
  otherIncome: number;
  rent: number;
  creditsResidences: number;
  creditsLocatif: number;
  creditsConsommation: number;
  incomeTax: number;
  ifi: number;
  otherCharges: number;
  
  // Étape 7: Origine des fonds
  primaryFundOrigin: FundOrigin;
  fundAmount: number;
  multipleOrigins: boolean;
  secondaryOrigins?: Array<{ origin: FundOrigin; amount: number }>;
  fundOriginCountry: string;
}

export interface SubscriptionState {
  // Étape 1: Contexte & Cadrage (déjà validé par l'utilisateur)
  contextAccepted: boolean;
  
  // Étape 2: Projet d'investissement
  subscriptionType: SubscriptionType; // Type de souscription : biens_propres ou biens_communs
  coSubscriber?: CoSubscriberState; // Données du co-souscripteur (si subscriptionType = 'biens_communs')
  primaryObjective: string; // Objectif principal *
  secondaryObjectives: string[]; // Objectifs secondaires (optionnel)
  horizon: InvestmentHorizon;
  amount: number;
  fundingMode: FundingMode;
  riskTolerance: RiskTolerance;
  riskReaction: RiskReaction;
  scpiKnowledge: ScpiKnowledge; // Connaissance des risques SCPI/FIA
  
  // SCPI sélectionnées (depuis le comparateur)
  selectedScpis: SCPIExtended[];
  allocation: Record<number, number>; // scpiId -> percentage
  
  // Étape 3: Identité & Contact
  civility: 'Monsieur' | 'Madame' | 'Autre';
  lastName: string;
  birthLastName: string; // Nom de naissance
  firstName: string;
  birthDate: string; // Format: YYYY-MM-DD
  birthCountry: string;
  birthCity: string;
  nationality: string;
  legalPersonality: LegalPersonality;
  
  // Contact
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  emailConfirmation: string; // Confirmation de l'email
  
  // Étape 4: Situation familiale & professionnelle
  maritalStatus: MaritalStatus;
  maritalRegime: MaritalRegime; // Si marié/PACS
  dependentChildren: number;
  
  // Professionnelle
  profession: string;
  activitySector: string;
  employer: string;
  activityOutsideEU: boolean;
  
  // Étape 5: Situation fiscale & résidentielle
  housingSituation: 'proprietaire' | 'locataire' | 'heberge' | 'autre';
  taxResidence: string; // Pays
  taxResidenceCountry: string; // Si différent de résidence principale
  taxResidenceSameAsPrincipal: boolean | null; // La résidence fiscale est-elle la même que la résidence principale ?
  nif: string; // Numéro d'identification fiscale
  averageTaxRate: number; // Taux moyen d'imposition
  usPerson: boolean; // US Person
  usTaxObligation: boolean | null; // Obligation fiscale aux États-Unis
  usCitizenship: boolean | null; // Citoyenneté américaine
  pep: PepStatus; // Personne politiquement exposée (PPE)
  
  // Étape 6: Situation patrimoniale (déclarative)
  // Patrimoine
  primaryResidence: number; // Résidence principale
  secondaryResidence: number; // Résidence secondaire
  rentalRealEstate: number; // Investissement locatif
  securities: number; // Valeurs mobilières
  assuranceVie: number; // Assurance-vie
  liquidities: number; // Liquidités
  livrets: number; // Livrets
  or: number; // Or
  collection: number; // Collection
  objetsArt: number; // Objets d'art
  actifsProfessionnels: number; // Actifs professionnels
  forets: number; // Forêts
  debts: number; // Capital restant dû sur les emprunts en cours
  otherAssets: number; // Autres (épargne, retraite...)
  
  // Revenus
  salary: number; // Salaire
  rentalIncome: number; // Revenus fonciers
  financialIncome: number; // Revenus financiers (BIC/BNC)
  pensions: number; // Pensions et retraites
  otherIncome: number; // Autres revenus
  
  // Charges annuelles brutes
  rent: number; // Loyer
  creditsResidences: number; // Crédits sur les résidences principales et secondaires
  creditsLocatif: number; // Crédits sur l'immobilier locatif
  creditsConsommation: number; // Crédits à la consommation
  incomeTax: number; // Montant de l'impôt sur le revenu de l'année précédente
  ifi: number; // Montant de IFI de l'année précédente
  otherCharges: number; // Autres charges
  
  // Patrimoines séparés pour co-souscription (optionnel)
  patrimoineSouscripteur1?: PatrimoineSepare; // Patrimoine du souscripteur principal
  patrimoineSouscripteur2?: PatrimoineSepare; // Patrimoine du co-souscripteur
  patrimoineCommuns?: PatrimoineSepare; // Patrimoine commun
  
  // Étape 7: Origine des fonds (LCB-FT)
  primaryFundOrigin: FundOrigin;
  fundAmount: number; // Montant de l'origine principale
  multipleOrigins: boolean;
  secondaryOrigins?: Array<{ origin: FundOrigin; amount: number }>;
  fundOriginCountry: string; // Pays de provenance des fonds
  
  // Étape 8: Communication & Consentements
  electronicDocuments: boolean; // Documents électroniques
  emailConsent: boolean; // Informations par email
  smsConsent: boolean; // Informations par SMS
  
  // Étape 9: Validation client
  informationAccuracy: boolean; // Exactitude des informations *
  riskUnderstanding: boolean; // Compréhension des risques SCPI/FIA *
  cifAnalysisAgreement: boolean; // Accord pour analyse CIF *
  subscriptionUnderstanding: boolean; // Compréhension que la souscription sera validée par conseiller *
  
  // Métadonnées
  currentStep: SubscriptionStep;
  subscriptionToken?: string;
  submittedAt?: Date;
  
  // Mode de détention (depuis ancien tunnel, à garder pour compatibilité)
  detentionMode: DetentionMode;
  confirmedAmount: number; // Alias pour amount
}

export interface SubscriptionContextType {
  state: SubscriptionState;
  updateState: (updates: Partial<SubscriptionState>) => void;
  updateCoSubscriber: (updates: Partial<CoSubscriberState>) => void;
  goToStep: (step: number) => void;
  validateStep: (step: number) => boolean;
  submitPreDossier: () => Promise<{ success: boolean; token: string; data: any }>;
  reset: () => void;
}

export interface AllocationAmounts {
  amount: number;
  shares: number;
}
