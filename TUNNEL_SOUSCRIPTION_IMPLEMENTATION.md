# 🛠️ Guide d'Implémentation Technique - Tunnel de Souscription

## Architecture proposée

### Structure des composants

```
src/
├── components/
│   └── subscription/
│       ├── SubscriptionFunnel.tsx          # Composant principal (orchestrateur)
│       ├── SubscriptionContext.tsx        # Contexte React (état global)
│       ├── Step1Validation.tsx            # Étape 1: Validation portefeuille
│       ├── Step2Parametrage.tsx           # Étape 2: Paramétrage investissement
│       ├── Step3Recueil.tsx               # Étape 3: Recueil minimal
│       ├── Step4Redirection.tsx            # Étape 4: Redirection PSI
│       ├── PortfolioSummary.tsx           # Composant récapitulatif réutilisable
│       ├── AllocationSliders.tsx          # Sliders d'allocation (réutilisé)
│       ├── InvestmentAmountInput.tsx      # Input montant avec presets
│       ├── DetentionModeSelector.tsx      # Sélecteur mode de détention
│       └── ConformityDisclaimer.tsx       # Composant disclaimer réutilisable
├── contexts/
│   └── SubscriptionContext.tsx            # Contexte (déplacé depuis components)
├── utils/
│   ├── subscriptionValidation.ts          # Fonctions de validation
│   ├── subscriptionTracking.ts            # Tracking GA4/Ads
│   └── subscriptionAPI.ts                 # API calls (Supabase, PSI)
└── types/
    └── subscription.ts                    # Types TypeScript
```

---

## 📦 Implémentation étape par étape

### Étape 1: Créer les types TypeScript

**Fichier: `src/types/subscription.ts`**

```typescript
export interface SubscriptionState {
  // Étape 1: Validation
  selectedScpis: SCPIExtended[];
  allocation: Record<number, number>; // scpiId -> percentage
  
  // Étape 2: Paramétrage
  totalAmount: number;
  detentionMode: 'direct' | 'av' | 'per';
  horizon: 5 | 10 | 15 | 20;
  
  // Étape 3: Recueil
  civility: 'Monsieur' | 'Madame' | 'Autre';
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  confirmedAmount: number;
  consentRGPD: boolean;
  wantsAccompaniment: boolean;
  
  // Métadonnées
  currentStep: 1 | 2 | 3 | 4;
  subscriptionToken?: string;
  submittedAt?: Date;
}

export interface SubscriptionContextType {
  state: SubscriptionState;
  updateState: (updates: Partial<SubscriptionState>) => void;
  goToStep: (step: number) => void;
  validateStep: (step: number) => boolean;
  submitSubscription: () => Promise<void>;
  reset: () => void;
}
```

### Étape 2: Créer le contexte React

**Fichier: `src/contexts/SubscriptionContext.tsx`**

```typescript
import React, { createContext, useContext, useState, useCallback } from 'react';
import { SubscriptionState, SubscriptionContextType } from '../types/subscription';

const initialState: SubscriptionState = {
  selectedScpis: [],
  allocation: {},
  totalAmount: 50000,
  detentionMode: 'direct',
  horizon: 15,
  civility: 'Monsieur',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  confirmedAmount: 50000,
  consentRGPD: false,
  wantsAccompaniment: false,
  currentStep: 1,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SubscriptionState>(initialState);

  const updateState = useCallback((updates: Partial<SubscriptionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      setState(prev => ({ ...prev, currentStep: step as 1 | 2 | 3 | 4 }));
    }
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        // Validation: au moins 1 SCPI, allocation = 100%
        const allocationSum = Object.values(state.allocation).reduce((sum, val) => sum + val, 0);
        return state.selectedScpis.length > 0 && Math.abs(allocationSum - 100) < 0.01;
      
      case 2:
        // Validation: montant >= minimum, mode et horizon sélectionnés
        const minInvestment = state.selectedScpis.reduce((sum, s) => sum + s.minInvestment, 0);
        return state.totalAmount >= minInvestment && 
               state.detentionMode !== undefined && 
               state.horizon !== undefined;
      
      case 3:
        // Validation: tous les champs obligatoires remplis
        return state.firstName.trim() !== '' &&
               state.lastName.trim() !== '' &&
               state.email.trim() !== '' &&
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email) &&
               state.consentRGPD === true;
      
      default:
        return true;
    }
  }, [state]);

  const submitSubscription = useCallback(async () => {
    // Générer token unique
    const token = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Enregistrer en base
    const { supabase } = await import('../supabaseClient');
    const { error } = await supabase
      .from('leads_souscription')
      .insert([{
        token,
        civility: state.civility,
        first_name: state.firstName,
        last_name: state.lastName,
        email: state.email,
        phone: state.phone || null,
        total_amount: state.confirmedAmount,
        detention_mode: state.detentionMode,
        horizon: state.horizon,
        scpis: state.selectedScpis.map(s => ({ id: s.id, name: s.name })),
        allocation: state.allocation,
        consent_rgpd: state.consentRGPD,
        wants_accompaniment: state.wantsAccompaniment,
        status: 'pending_psi',
        created_at: new Date().toISOString(),
      }]);

    if (error) {
      console.error('Erreur enregistrement:', error);
      throw error;
    }

    // Mettre à jour le state
    setState(prev => ({ ...prev, subscriptionToken: token, submittedAt: new Date() }));

    // Tracking
    if (window.gtag) {
      window.gtag('event', 'step4_redirect_psi', {
        'event_category': 'subscription_funnel',
        'subscription_id': token,
        'value': state.confirmedAmount,
        'currency': 'EUR'
      });
    }

    // Envoyer email récapitulatif (via fonction Supabase Edge)
    // TODO: Implémenter l'envoi d'email

    // Rediriger vers PSI
    const psiUrl = process.env.VITE_PSI_INTENCIAL_URL || 'https://psi.intencial-patrimoine.fr';
    window.location.href = `${psiUrl}?token=${token}&email=${encodeURIComponent(state.email)}`;
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
        submitSubscription,
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
```

### Étape 3: Créer le composant principal

**Fichier: `src/components/subscription/SubscriptionFunnel.tsx`**

```typescript
import React from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import Step1Validation from './Step1Validation';
import Step2Parametrage from './Step2Parametrage';
import Step3Recueil from './Step3Recueil';
import Step4Redirection from './Step4Redirection';

interface SubscriptionFunnelProps {
  initialScpis?: SCPIExtended[];
  onClose?: () => void;
}

const SubscriptionFunnel: React.FC<SubscriptionFunnelProps> = ({ 
  initialScpis = [], 
  onClose 
}) => {
  const { state, updateState } = useSubscription();

  // Initialiser avec les SCPI sélectionnées
  React.useEffect(() => {
    if (initialScpis.length > 0) {
      updateState({ 
        selectedScpis: initialScpis,
        // Allocation égale par défaut
        allocation: initialScpis.reduce((acc, scpi, index) => {
          acc[scpi.id] = 100 / initialScpis.length;
          return acc;
        }, {} as Record<number, number>)
      });
    }
  }, [initialScpis, updateState]);

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <Step1Validation onClose={onClose} />;
      case 2:
        return <Step2Parametrage onClose={onClose} />;
      case 3:
        return <Step3Recueil onClose={onClose} />;
      case 4:
        return <Step4Redirection onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto">
      {renderStep()}
    </div>
  );
};

export default SubscriptionFunnel;
```

### Étape 4: Intégrer dans le comparateur

**Fichier: `src/components/fintech/SelectionSidebar.tsx`**

Modifier le bouton "Visualiser mes résultats" :

```typescript
// Ajouter l'import
import SubscriptionFunnel from '../subscription/SubscriptionFunnel';

// Ajouter l'état
const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);

// Modifier le bouton
<button
  onClick={() => setIsSubscriptionOpen(true)}
  className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:from-emerald-700 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 active:scale-95"
>
  <span>Valider ma sélection</span>
  <ArrowRight className="w-5 h-5" />
</button>

// Ajouter le modal
{isSubscriptionOpen && (
  <SubscriptionFunnel
    initialScpis={selectedScpis}
    onClose={() => setIsSubscriptionOpen(false)}
  />
)}
```

### Étape 5: Créer la table Supabase

**Migration SQL: `supabase/migrations/XXXXXX_create_leads_souscription.sql`**

```sql
CREATE TABLE IF NOT EXISTS leads_souscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  civility TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  detention_mode TEXT NOT NULL CHECK (detention_mode IN ('direct', 'av', 'per')),
  horizon INTEGER NOT NULL CHECK (horizon IN (5, 10, 15, 20)),
  scpis JSONB NOT NULL, -- [{id, name, allocation, amount}]
  allocation JSONB NOT NULL, -- {scpiId: percentage}
  consent_rgpd BOOLEAN NOT NULL DEFAULT false,
  wants_accompaniment BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending_psi' CHECK (status IN ('pending_psi', 'psi_completed', 'subscription_completed', 'cancelled')),
  psi_completed_at TIMESTAMPTZ,
  subscription_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_leads_souscription_token ON leads_souscription(token);
CREATE INDEX idx_leads_souscription_email ON leads_souscription(email);
CREATE INDEX idx_leads_souscription_status ON leads_souscription(status);
CREATE INDEX idx_leads_souscription_created_at ON leads_souscription(created_at);

-- RLS (Row Level Security)
ALTER TABLE leads_souscription ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs anonymes peuvent insérer
CREATE POLICY "Anonymous can insert" ON leads_souscription
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Les utilisateurs authentifiés peuvent lire leurs propres leads
CREATE POLICY "Users can read own leads" ON leads_souscription
  FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
```

### Étape 6: Fonctions utilitaires

**Fichier: `src/utils/subscriptionValidation.ts`**

```typescript
export const validateAllocation = (allocation: Record<number, number>): boolean => {
  const sum = Object.values(allocation).reduce((acc, val) => acc + val, 0);
  return Math.abs(sum - 100) < 0.01; // Tolérance 0.01%
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateAmount = (
  amount: number, 
  minInvestment: number
): { valid: boolean; error?: string } => {
  if (amount < minInvestment) {
    return {
      valid: false,
      error: `Le montant minimum est de ${minInvestment.toLocaleString('fr-FR')}€`
    };
  }
  if (amount > 10000000) {
    return {
      valid: false,
      error: 'Le montant maximum est de 10 000 000€'
    };
  }
  return { valid: true };
};

export const calculateAllocationAmounts = (
  totalAmount: number,
  allocation: Record<number, number>,
  scpis: SCPIExtended[]
): Record<number, { amount: number; shares: number }> => {
  const result: Record<number, { amount: number; shares: number }> = {};
  
  scpis.forEach(scpi => {
    const percentage = allocation[scpi.id] || 0;
    const amount = Math.round((percentage / 100) * totalAmount);
    const shares = Math.floor(amount / scpi.price);
    result[scpi.id] = { amount, shares };
  });
  
  return result;
};
```

**Fichier: `src/utils/subscriptionTracking.ts`**

```typescript
export const trackSubscriptionStep = (
  step: number,
  data?: Record<string, any>
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  const eventMap: Record<number, string> = {
    1: 'step1_validation',
    2: 'step2_parametrage',
    3: 'step3_recueil',
    4: 'step4_redirect_psi',
  };

  window.gtag('event', eventMap[step] || 'subscription_step', {
    'event_category': 'subscription_funnel',
    'event_label': `step_${step}`,
    ...data,
  });
};

export const trackSubscriptionConversion = (
  token: string,
  amount: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  // Google Analytics
  window.gtag('event', 'step4_redirect_psi', {
    'event_category': 'subscription_funnel',
    'subscription_id': token,
    'value': amount,
    'currency': 'EUR',
  });

  // Google Ads Conversion
  window.gtag('event', 'conversion', {
    'send_to': process.env.VITE_GOOGLE_ADS_CONVERSION_ID || 'AW-XXXXX/subscription_start',
    'value': amount,
    'currency': 'EUR',
    'transaction_id': token,
  });

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: amount,
      currency: 'EUR',
      content_name: 'SCPI Subscription',
    });
  }
};
```

---

## 🔌 Intégration avec le PSI Intencial Patrimoine

### Format de transmission (API/Webhook)

**Endpoint:** `POST {PSI_API_URL}/api/subscription/init`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {PSI_API_KEY}
```

**Body:**
```json
{
  "token": "sub_1234567890_abc123",
  "lead": {
    "civility": "Monsieur",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com",
    "phone": "+33612345678",
    "wantsAccompaniment": false
  },
  "portfolio": {
    "totalAmount": 50000,
    "detentionMode": "direct",
    "horizon": 15,
    "scpis": [
      {
        "id": 1,
        "name": "Activimmo",
        "allocation": 33.3,
        "amount": 16650,
        "shares": 27
      },
      {
        "id": 2,
        "name": "Corum Origin",
        "allocation": 33.3,
        "amount": 16650,
        "shares": 28
      },
      {
        "id": 3,
        "name": "Iroko Zen",
        "allocation": 33.4,
        "amount": 16700,
        "shares": 55
      }
    ]
  },
  "metadata": {
    "source": "maximusscpi",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "scpi_comparator",
    "timestamp": "2025-01-XXT10:00:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "psiUrl": "https://psi.intencial-patrimoine.fr/questionnaire?token=sub_1234567890_abc123",
  "expiresAt": "2025-01-XXT11:00:00Z"
}
```

### Webhook de retour (PSI → MaximusSCPI)

**Endpoint MaximusSCPI:** `POST /api/webhooks/psi-completion`

**Body:**
```json
{
  "token": "sub_1234567890_abc123",
  "status": "psi_completed" | "subscription_completed" | "cancelled",
  "completedAt": "2025-01-XXT10:30:00Z",
  "data": {
    // Données complémentaires du PSI si nécessaire
  }
}
```

---

## 📊 Tests à effectuer

### Tests fonctionnels

- [ ] Sélection de 1 SCPI → Validation OK
- [ ] Sélection de 3+ SCPI → Validation OK
- [ ] Allocation manuelle → Validation (somme = 100%)
- [ ] Montant < minimum → Erreur affichée
- [ ] Email invalide → Erreur affichée
- [ ] Formulaire incomplet → Erreur affichée
- [ ] Soumission → Enregistrement en base
- [ ] Soumission → Email envoyé
- [ ] Soumission → Redirection PSI

### Tests de conformité

- [ ] Tous les disclaimers présents
- [ ] Aucune promesse de performance
- [ ] Mentions légales accessibles
- [ ] Consentement RGPD fonctionnel
- [ ] Données sécurisées (HTTPS)

### Tests UX

- [ ] Mobile-first responsive
- [ ] Navigation entre étapes fluide
- [ ] Messages d'erreur clairs
- [ ] Messages de succès rassurants
- [ ] Temps de chargement < 2s

---

## 🚀 Déploiement

### Variables d'environnement

```env
# .env.production
VITE_PSI_INTENCIAL_URL=https://psi.intencial-patrimoine.fr
VITE_PSI_API_KEY=your_api_key_here
VITE_GOOGLE_ADS_CONVERSION_ID=AW-XXXXX/subscription_start
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Checklist pré-déploiement

- [ ] Tests fonctionnels passés
- [ ] Tests de conformité validés
- [ ] Variables d'environnement configurées
- [ ] Table Supabase créée
- [ ] RLS policies activées
- [ ] Tracking GA4/Ads configuré
- [ ] Email récapitulatif testé
- [ ] Redirection PSI testée (si URL disponible)

---

**Fin du guide d'implémentation**



