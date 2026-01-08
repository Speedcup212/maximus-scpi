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
      // Si le type de souscription est 'biens_communs' mais que coSubscriber n'existe pas, l'initialiser
      if (prev.subscriptionType === 'biens_communs' && !prev.coSubscriber) {
        return {
          ...prev,
          coSubscriber: { ...getInitialCoSubscriberState(), ...updates }
        };
      }
      // Si coSubscriber existe, le mettre à jour
      if (prev.coSubscriber) {
        return {
          ...prev,
          coSubscriber: { ...prev.coSubscriber, ...updates }
        };
      }
      // Sinon, retourner l'état tel quel
      return prev;
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
               state.activitySector.trim() !== '' &&
               state.dependentChildren !== undefined &&
               state.employer.trim() !== '';
        
        // Si co-souscripteur, valider aussi ses données
        if (state.subscriptionType === 'biens_communs' && state.coSubscriber) {
          const coValid = state.coSubscriber.maritalStatus !== undefined &&
                 state.coSubscriber.profession.trim() !== '' &&
                 state.coSubscriber.activitySector.trim() !== '' &&
                 state.coSubscriber.dependentChildren !== undefined &&
                 state.coSubscriber.employer.trim() !== '';
          return mainValid && coValid;
        }
        
        return mainValid;
      }
      
      case 5: {
        const mainValid = state.housingSituation !== undefined &&
               state.taxResidence !== '' &&
               state.taxResidenceSameAsPrincipal !== null;
        
        // Si co-souscripteur, valider aussi ses données
        if (state.subscriptionType === 'biens_communs' && state.coSubscriber) {
          const coValid = state.coSubscriber.housingSituation !== undefined &&
                 state.coSubscriber.taxResidence !== '' &&
                 state.coSubscriber.taxResidenceSameAsPrincipal !== null;
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
      // Vérifier que l'email et le téléphone sont présents
      if (!state.email || !state.phone) {
        throw new Error('L\'email et le téléphone sont obligatoires pour la soumission.');
      }

      // Extraire email et téléphone pour les colonnes séparées
      const { email, phone, ...restOfState } = state;
      
      // Préparer l'objet simulation_result avec TOUT le reste de l'état
      // Inclure aussi email et phone dans simulation_result pour avoir une trace complète
      const token = `predossier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Forcer les valeurs pour NIF et TMI (champs retirés du formulaire)
      const stateWithDefaults = {
        ...restOfState,
        nif: restOfState.nif || 'A voir en RDV',
        averageTaxRate: restOfState.averageTaxRate || 0,
        // Si co-souscripteur, forcer aussi ses valeurs
        coSubscriber: restOfState.coSubscriber ? {
          ...restOfState.coSubscriber,
          nif: restOfState.coSubscriber.nif || 'A voir en RDV',
          averageTaxRate: restOfState.coSubscriber.averageTaxRate || 0,
        } : undefined,
      };
      
      const simulationResult = {
        ...stateWithDefaults,
        // Inclure email et phone dans simulation_result aussi pour avoir une trace complète
        email,
        phone,
        // Convertir la date de naissance au format ISO si nécessaire (pour faciliter les requêtes)
        birthDateFormatted: (() => {
          if (!state.birthDate) return null;
          const parts = state.birthDate.split('/');
          if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          if (/^\d{4}-\d{2}-\d{2}$/.test(state.birthDate)) {
            return state.birthDate;
          }
          return state.birthDate; // Garder la valeur originale si le format n'est pas reconnu
        })(),
        // Métadonnées de soumission
        submittedAt: new Date().toISOString(),
        token
      };
      
      // Enregistrer en base dans la table prospects
      const { supabase } = await import('../supabaseClient');
      
      // DEBUG - Vérification de la connexion Supabase
      console.log("DEBUG SubscriptionContext - Tentative d'insertion dans 'prospects'");
      console.log("DEBUG SubscriptionContext - Supabase URL utilisée:", import.meta.env.VITE_SUPABASE_URL);
      
      const { data, error } = await supabase
        .from('prospects')
        .insert([{
          email: email,
          telephone: phone,
          simulation_result: simulationResult
        }])
        .select();

      if (error) {
        console.error('Erreur Supabase lors de l\'enregistrement:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Créer un message d'erreur plus détaillé
        let errorMessage = 'Une erreur est survenue lors de l\'enregistrement.';
        if (error.code === '23505') {
          errorMessage = 'Cet email existe déjà dans notre base de données.';
        } else if (error.code === 'PGRST116') {
          errorMessage = 'Erreur de connexion à la base de données. Veuillez réessayer.';
        } else if (error.message) {
          errorMessage = `Erreur: ${error.message}`;
        }
        
        throw new Error(errorMessage);
      }

      // Vérifier que les données ont bien été insérées
      if (!data || data.length === 0) {
        throw new Error('Aucune donnée n\'a été enregistrée. Veuillez réessayer.');
      }

      // Mettre à jour le state avec le token
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

      return { success: true, token, data };

    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      
      // Re-lancer l'erreur avec un message formaté
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de la soumission.');
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
        updateCoSubscriber,
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
