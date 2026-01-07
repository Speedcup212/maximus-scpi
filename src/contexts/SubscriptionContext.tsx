import React, { createContext, useContext, useState, useCallback } from 'react';
import { SubscriptionState, SubscriptionContextType, SubscriptionStep, CoSubscriberState } from '../types/subscription';
import { validateEmail, validatePhone, validatePostalCode, validateNif } from '../utils/subscriptionValidation';

const initialState: SubscriptionState = {
  // Étape 1
  contextAccepted: false,
  
  // Étape 2
  subscriptionType: 'biens_propres',
  coSubscriber: undefined,
  primaryObjective: '',
  secondaryObjectives: [],
  horizon: 10,
  amount: 50000,
  fundingMode: 'fonds_propres',
  riskTolerance: 'moderee',
  riskReaction: 'conserver',
  scpiKnowledge: 'aucune',
  selectedScpis: [],
  allocation: {},
  
  // Étape 3
  civility: 'Monsieur',
  lastName: '',
  birthLastName: '',
  firstName: '',
  birthDate: '',
  birthCountry: 'France',
  birthCity: '',
  nationality: 'France',
  legalPersonality: 'personne_physique',
  address: '',
  postalCode: '',
  city: '',
  country: 'France',
  phone: '',
  email: '',
  emailConfirmation: '',
  
  // Étape 4
  maritalStatus: 'celibataire',
  maritalRegime: null,
  dependentChildren: 0,
  profession: '',
  activitySector: '',
  employer: '',
  activityOutsideEU: false,
  
  // Étape 5
  housingSituation: 'proprietaire',
  taxResidence: 'France',
  taxResidenceCountry: '',
  taxResidenceSameAsPrincipal: null,
  nif: '',
  averageTaxRate: 0,
  usPerson: false,
  usTaxObligation: null,
  usCitizenship: null,
  pep: 'non',
  
  // Étape 6
  primaryResidence: 0,
  secondaryResidence: 0,
  rentalRealEstate: 0,
  securities: 0,
  assuranceVie: 0,
  liquidities: 0,
  livrets: 0,
  or: 0,
  collection: 0,
  objetsArt: 0,
  actifsProfessionnels: 0,
  forets: 0,
  debts: 0,
  otherAssets: 0,
  salary: 0,
  rentalIncome: 0,
  financialIncome: 0,
  pensions: 0,
  otherIncome: 0,
  rent: 0,
  creditsResidences: 0,
  creditsLocatif: 0,
  creditsConsommation: 0,
  incomeTax: 0,
  ifi: 0,
  otherCharges: 0,
  
  // Étape 7
  primaryFundOrigin: 'epargne',
  fundAmount: 0,
  multipleOrigins: false,
  fundOriginCountry: 'France',
  
  // Étape 8
  cniRecto: null,
  cniVerso: null,
  proofOfResidence: null,
  proofOfFundOrigin: null,
  rib: null,
  
  // Étape 9
  electronicDocuments: false,
  emailConsent: false,
  smsConsent: false,
  
  // Étape 10
  informationAccuracy: false,
  riskUnderstanding: false,
  cifAnalysisAgreement: false,
  subscriptionUnderstanding: false,
  
  // Métadonnées
  currentStep: 1,
  detentionMode: 'direct',
  confirmedAmount: 50000,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Fonction helper pour initialiser le co-souscripteur
const getInitialCoSubscriberState = (): CoSubscriberState => ({
  civility: 'Monsieur',
  lastName: '',
  birthLastName: '',
  firstName: '',
  birthDate: '',
  birthCountry: 'France',
  birthCity: '',
  nationality: 'France',
  legalPersonality: 'personne_physique',
  address: '',
  postalCode: '',
  city: '',
  country: 'France',
  phone: '',
  email: '',
  emailConfirmation: '',
  maritalStatus: 'celibataire',
  maritalRegime: null,
  dependentChildren: 0,
  profession: '',
  activitySector: '',
  employer: '',
  activityOutsideEU: false,
  housingSituation: 'proprietaire',
  taxResidence: 'France',
  taxResidenceCountry: '',
  taxResidenceSameAsPrincipal: null,
  nif: '',
  averageTaxRate: 0,
  usPerson: false,
  usTaxObligation: null,
  usCitizenship: null,
  pep: 'non',
  primaryResidence: 0,
  secondaryResidence: 0,
  rentalRealEstate: 0,
  securities: 0,
  assuranceVie: 0,
  liquidities: 0,
  livrets: 0,
  or: 0,
  collection: 0,
  objetsArt: 0,
  actifsProfessionnels: 0,
  forets: 0,
  debts: 0,
  otherAssets: 0,
  salary: 0,
  rentalIncome: 0,
  financialIncome: 0,
  pensions: 0,
  otherIncome: 0,
  rent: 0,
  creditsResidences: 0,
  creditsLocatif: 0,
  creditsConsommation: 0,
  incomeTax: 0,
  ifi: 0,
  otherCharges: 0,
  primaryFundOrigin: 'epargne',
  fundAmount: 0,
  multipleOrigins: false,
  fundOriginCountry: 'France',
});

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SubscriptionState>(initialState);

  const updateState = useCallback((updates: Partial<SubscriptionState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      
      // Si subscriptionType passe à 'biens_communs' et coSubscriber n'existe pas, l'initialiser
      if (updates.subscriptionType === 'biens_communs' && !newState.coSubscriber) {
        newState.coSubscriber = getInitialCoSubscriberState();
      }
      
      // Si subscriptionType passe à 'biens_propres', supprimer le co-souscripteur
      if (updates.subscriptionType === 'biens_propres') {
        newState.coSubscriber = undefined;
      }
      
      return newState;
    });
  }, []);
  
  // Fonction pour mettre à jour le co-souscripteur
  const updateCoSubscriber = useCallback((updates: Partial<CoSubscriberState>) => {
    setState(prev => {
      if (!prev.coSubscriber) {
        return prev;
      }
      return {
        ...prev,
        coSubscriber: { ...prev.coSubscriber, ...updates }
      };
    });
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 9) {
      setState(prev => ({ ...prev, currentStep: step as SubscriptionStep }));
    }
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return state.contextAccepted === true;
      
      case 2:
        return (state.primaryObjective.trim() !== '' || state.secondaryObjectives.length > 0) &&
               state.horizon !== undefined &&
               state.amount > 0 &&
               state.fundingMode !== undefined &&
               state.riskTolerance !== undefined &&
               state.riskReaction !== undefined;
      
      case 3: {
        const isBirthLastNameRequired = state.civility === 'Madame';
        const mainValid = state.lastName.trim() !== '' &&
               state.firstName.trim() !== '' &&
               (!isBirthLastNameRequired || state.birthLastName.trim() !== '') &&
               state.birthDate !== '' &&
               state.birthCountry !== '' &&
               state.birthCity !== '' &&
               state.nationality !== '' &&
               state.address.trim() !== '' &&
               validatePostalCode(state.postalCode) &&
               state.city.trim() !== '' &&
               validatePhone(state.phone) &&
               validateEmail(state.email) &&
               validateEmail(state.emailConfirmation) &&
               state.email === state.emailConfirmation;
        
        // Si co-souscripteur, valider aussi ses données
        if (state.subscriptionType === 'biens_communs' && state.coSubscriber) {
          const coIsBirthLastNameRequired = state.coSubscriber.civility === 'Madame';
          const coValid = state.coSubscriber.lastName.trim() !== '' &&
                 state.coSubscriber.firstName.trim() !== '' &&
                 (!coIsBirthLastNameRequired || state.coSubscriber.birthLastName.trim() !== '') &&
                 state.coSubscriber.birthDate !== '' &&
                 state.coSubscriber.birthCountry !== '' &&
                 state.coSubscriber.birthCity !== '' &&
                 state.coSubscriber.nationality !== '' &&
                 state.coSubscriber.address.trim() !== '' &&
                 validatePostalCode(state.coSubscriber.postalCode) &&
                 state.coSubscriber.city.trim() !== '' &&
                 validatePhone(state.coSubscriber.phone) &&
                 validateEmail(state.coSubscriber.email) &&
                 validateEmail(state.coSubscriber.emailConfirmation || '') &&
                 state.coSubscriber.email === (state.coSubscriber.emailConfirmation || '');
          return mainValid && coValid;
        }
        
        return mainValid;
      }
      
      case 4: {
        const mainValid = state.maritalStatus !== undefined &&
               state.profession.trim() !== '' &&
               state.activitySector.trim() !== '';
        
        // Si co-souscripteur, valider aussi ses données
        if (state.subscriptionType === 'biens_communs' && state.coSubscriber) {
          const coValid = state.coSubscriber.maritalStatus !== undefined &&
                 state.coSubscriber.profession.trim() !== '' &&
                 state.coSubscriber.activitySector.trim() !== '';
          return mainValid && coValid;
        }
        
        return mainValid;
      }
      
      case 5: {
        const mainValid = state.housingSituation !== undefined &&
               state.taxResidence !== '' &&
               validateNif(state.nif);
        
        // Si co-souscripteur, valider aussi ses données
        if (state.subscriptionType === 'biens_communs' && state.coSubscriber) {
          const coValid = state.coSubscriber.housingSituation !== undefined &&
                 state.coSubscriber.taxResidence !== '' &&
                 validateNif(state.coSubscriber.nif);
          return mainValid && coValid;
        }
        
        return mainValid;
      }
      
      case 6:
        // Validation minimale - tous les champs peuvent être à 0
        return true;
      
      case 7:
        return state.primaryFundOrigin !== undefined &&
               state.fundOriginCountry !== '';
      
      case 8:
        // Les consentements sont optionnels mais recommandés
        return true;
      
      case 9:
        return state.informationAccuracy === true &&
               state.riskUnderstanding === true &&
               state.cifAnalysisAgreement === true &&
               state.subscriptionUnderstanding === true;
      
      default:
        return true;
    }
  }, [state]);

  const submitPreDossier = useCallback(async () => {
    try {
      // Générer token unique
      const token = `predossier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Enregistrer en base
      const { supabase } = await import('../supabaseClient');
      const { error } = await supabase
        .from('leads_souscription')
        .insert([{
          token,
          context_accepted: state.contextAccepted,
          // Projet
          primary_objective: state.primaryObjective,
          secondary_objectives: state.secondaryObjectives,
          horizon: state.horizon,
          amount: state.amount,
          funding_mode: state.fundingMode,
          risk_tolerance: state.riskTolerance,
          risk_reaction: state.riskReaction,
          scpi_knowledge: state.scpiKnowledge,
          // Identité
          civility: state.civility,
          first_name: state.firstName,
          last_name: state.lastName,
          birth_last_name: state.birthLastName || null,
          birth_date: (() => {
            // Convertir JJ/MM/AAAA en YYYY-MM-DD pour la base de données
            if (!state.birthDate) return null;
            const parts = state.birthDate.split('/');
            if (parts.length === 3) {
              return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            // Si déjà au format YYYY-MM-DD, le garder tel quel
            if (/^\d{4}-\d{2}-\d{2}$/.test(state.birthDate)) {
              return state.birthDate;
            }
            return null;
          })(),
          birth_country: state.birthCountry,
          birth_city: state.birthCity,
          nationality: state.nationality,
          legal_personality: state.legalPersonality,
          address: state.address,
          postal_code: state.postalCode,
          city: state.city,
          country: state.country,
          email: state.email,
          phone: state.phone,
          // Situation
          marital_status: state.maritalStatus,
          marital_regime: state.maritalRegime,
          dependent_children: state.dependentChildren,
          profession: state.profession,
          activity_sector: state.activitySector,
          employer: state.employer || null,
          activity_outside_eu: state.activityOutsideEU,
          // Fiscale
          housing_situation: state.housingSituation,
          tax_residence: state.taxResidence,
          tax_residence_country: state.taxResidenceCountry || null,
          nif: state.nif,
          average_tax_rate: state.averageTaxRate || null,
          us_person: state.usPerson,
          pep: state.pep,
          // Patrimoniale
          primary_residence: state.primaryResidence,
          secondary_residence: state.secondaryResidence,
          rental_real_estate: state.rentalRealEstate,
          securities: state.securities,
          assurance_vie: state.assuranceVie,
          liquidities: state.liquidities,
          livrets: state.livrets,
          or: state.or,
          collection: state.collection,
          objets_art: state.objetsArt,
          actifs_professionnels: state.actifsProfessionnels,
          forets: state.forets,
          debts: state.debts,
          other_assets: state.otherAssets,
          salary: state.salary,
          rental_income: state.rentalIncome,
          financial_income: state.financialIncome,
          pensions: state.pensions,
          other_income: state.otherIncome,
          rent: state.rent,
          credits_residences: state.creditsResidences,
          credits_locatif: state.creditsLocatif,
          credits_consommation: state.creditsConsommation,
          income_tax: state.incomeTax,
          ifi: state.ifi,
          other_charges: state.otherCharges,
          // Origine fonds
          primary_fund_origin: state.primaryFundOrigin,
          fund_amount: state.fundAmount,
          multiple_origins: state.multipleOrigins,
          secondary_origins: state.secondaryOrigins || [],
          fund_origin_country: state.fundOriginCountry,
          // SCPI
          scpis: state.selectedScpis.map(s => ({ 
            id: s.id, 
            name: s.name,
            yield: s.yield,
            price: s.price
          })),
          allocation: state.allocation,
          // Consentements
          electronic_documents: state.electronicDocuments,
          email_consent: state.emailConsent,
          sms_consent: state.smsConsent,
          // Validations
          information_accuracy: state.informationAccuracy,
          risk_understanding: state.riskUnderstanding,
          cif_analysis_agreement: state.cifAnalysisAgreement,
          subscription_understanding: state.subscriptionUnderstanding,
          status: 'pending_cif',
          created_at: new Date().toISOString(),
        }]);

      if (error) {
        console.error('Erreur enregistrement:', error);
        throw error;
      }

      // Mettre à jour le state
      setState(prev => ({ ...prev, subscriptionToken: token, submittedAt: new Date() }));

      // Tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'predossier_submitted', {
          'event_category': 'subscription_funnel',
          'subscription_id': token,
          'value': state.amount,
          'currency': 'EUR'
        });
      }

    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      throw error;
    }
  }, [state]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        state,
        updateState,
        goToStep,
        validateStep,
        submitPreDossier,
        reset,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};
