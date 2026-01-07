import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Mail, Phone, User, AlertCircle } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { validateEmail } from '../../utils/subscriptionValidation';
import { formatCurrency } from '../../utils/formatters';
import EricAvatar from '../EricAvatar';

interface Step3RecueilProps {
  onClose?: () => void;
}

const Step3Recueil: React.FC<Step3RecueilProps> = ({ onClose }) => {
  const { state, updateState, goToStep, validateStep, submitSubscription } = useSubscription();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minInvestment = state.selectedScpis.reduce((sum, s) => sum + s.minInvestment, 0);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (state.firstName.trim() === '') {
      newErrors.firstName = 'Le prénom est obligatoire';
    }

    if (state.lastName.trim() === '') {
      newErrors.lastName = 'Le nom est obligatoire';
    }

    if (state.email.trim() === '') {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!validateEmail(state.email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide';
    }

    if (state.confirmedAmount < minInvestment) {
      newErrors.amount = `Le montant minimum est de ${minInvestment.toLocaleString('fr-FR')}€`;
    }

    if (!state.consentRGPD) {
      newErrors.consent = 'Vous devez accepter de recevoir des informations par email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !validateStep(3)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submitSubscription();
      goToStep(4);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDetentionModeLabel = () => {
    switch (state.detentionMode) {
      case 'direct': return 'Détention directe';
      case 'av': return 'Assurance-vie';
      case 'per': return 'PER';
      default: return state.detentionMode;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => goToStep(2)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour au paramétrage</span>
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Mail className="w-8 h-8 text-emerald-400" />
            Finaliser ma demande
          </h1>
        </div>

        {/* Récapitulatif */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Récapitulatif de votre projet</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">SCPI sélectionnées</span>
              <p className="font-semibold text-white">{state.selectedScpis.length}</p>
            </div>
            <div>
              <span className="text-slate-400">Montant</span>
              <p className="font-semibold text-white">{formatCurrency(state.confirmedAmount)}</p>
            </div>
            <div>
              <span className="text-slate-400">Mode</span>
              <p className="font-semibold text-white">{getDetentionModeLabel()}</p>
            </div>
            <div>
              <span className="text-slate-400">Horizon</span>
              <p className="font-semibold text-white">{state.horizon} ans</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Vous pourrez modifier ces informations lors de la finalisation avec votre conseiller.
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-4">Vos informations</h2>
            <p className="text-sm text-slate-400 mb-6">
              Ces informations permettent à votre conseiller de mieux comprendre votre projet et de vous accompagner efficacement.
            </p>
            <p className="text-xs text-slate-500 mb-6">* Champs obligatoires</p>

            {/* Civilité */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Civilité *
              </label>
              <select
                value={state.civility}
                onChange={(e) => updateState({ civility: e.target.value as 'Monsieur' | 'Madame' | 'Autre' })}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Monsieur">Monsieur</option>
                <option value="Madame">Madame</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            {/* Nom */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nom *
              </label>
              <input
                type="text"
                value={state.lastName}
                onChange={(e) => updateState({ lastName: e.target.value })}
                placeholder="Votre nom de famille"
                className={`w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-white focus:outline-none transition-colors ${
                  errors.lastName ? 'border-red-500' : 'border-slate-600 focus:border-emerald-500'
                }`}
              />
              {errors.lastName && (
                <p className="text-sm text-red-400 mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* Prénom */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Prénom *
              </label>
              <input
                type="text"
                value={state.firstName}
                onChange={(e) => updateState({ firstName: e.target.value })}
                placeholder="Votre prénom"
                className={`w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-white focus:outline-none transition-colors ${
                  errors.firstName ? 'border-red-500' : 'border-slate-600 focus:border-emerald-500'
                }`}
              />
              {errors.firstName && (
                <p className="text-sm text-red-400 mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email *
              </label>
              <input
                type="email"
                value={state.email}
                onChange={(e) => updateState({ email: e.target.value })}
                placeholder="nom@example.com"
                className={`w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-white focus:outline-none transition-colors ${
                  errors.email ? 'border-red-500' : 'border-slate-600 focus:border-emerald-500'
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-400 mt-1">{errors.email}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                Nous vous enverrons un récapitulatif de votre sélection et les prochaines étapes.
              </p>
            </div>

            {/* Téléphone */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Téléphone
              </label>
              <input
                type="tel"
                value={state.phone || ''}
                onChange={(e) => updateState({ phone: e.target.value })}
                placeholder="06 12 34 56 78"
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
              />
              <p className="text-xs text-slate-400 mt-1">
                Recommandé pour finaliser rapidement votre souscription. Vous pouvez le renseigner plus tard si vous préférez.
              </p>
            </div>

            {/* Montant confirmé */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Montant confirmé
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={state.confirmedAmount}
                  onChange={(e) => {
                    const amount = Math.max(0, Number(e.target.value));
                    updateState({ confirmedAmount: amount });
                  }}
                  min={minInvestment}
                  step={1000}
                  className={`w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-white font-bold focus:outline-none transition-colors ${
                    errors.amount ? 'border-red-500' : 'border-slate-600 focus:border-emerald-500'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">€</span>
              </div>
              {errors.amount && (
                <p className="text-sm text-red-400 mt-1">{errors.amount}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                Vous pouvez modifier ce montant si nécessaire. Le montant minimum est de {formatCurrency(minInvestment)}.
              </p>
            </div>
          </div>

          {/* Consentements */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.consentRGPD}
                  onChange={(e) => updateState({ consentRGPD: e.target.checked })}
                  className="mt-1 w-5 h-5 accent-emerald-500"
                />
                <div>
                  <span className="text-sm font-medium text-white">
                    J'accepte de recevoir des informations par email concernant mon projet d'investissement *
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    En cochant cette case, vous acceptez de recevoir des emails de la part de MaximusSCPI et de votre conseiller concernant votre projet d'investissement.
                  </p>
                </div>
              </label>
              {errors.consent && (
                <p className="text-sm text-red-400">{errors.consent}</p>
              )}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.wantsAccompaniment}
                  onChange={(e) => updateState({ wantsAccompaniment: e.target.checked })}
                  className="mt-1 w-5 h-5 accent-emerald-500"
                />
                <div>
                  <span className="text-sm font-medium text-white">
                    Je souhaite être accompagné(e) par un conseiller
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    En cochant cette case, un conseiller expert vous contactera pour vous accompagner dans votre projet et répondre à toutes vos questions.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Message de transition */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="flex-shrink-0">
                <EricAvatar size={100} className="ring-4 ring-blue-500/50 shadow-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-400 mb-1">Prochaine étape : Votre conseiller vous contacte</h3>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-white">Eric Bellaiche</p>
                  <p className="text-xs text-slate-400">Conseiller expert en construction de portefeuilles SCPI</p>
                  <p className="text-xs text-slate-400">Conseiller en Investissements Financiers (CIF) – Membre de la CNCEF Patrimoine</p>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  En cliquant sur "Finaliser ma demande", votre dossier sera transmis à votre conseiller qui :
                </p>
                <ul className="text-sm text-slate-300 mt-2 space-y-1 list-disc list-inside">
                  <li>Analysera votre projet avec attention</li>
                  <li>Vérifiera la cohérence avec vos objectifs et votre situation</li>
                  <li>Vous contactera pour finaliser votre souscription ensemble</li>
                </ul>
                <p className="text-sm text-slate-300 mt-2">
                  Votre conseiller vous contactera sous 24-48h pour vous accompagner dans la suite de votre projet.
                </p>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
            >
              Retour au paramétrage
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !validateStep(3)}
              className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Enregistrement...' : 'Finaliser ma demande'}
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Step3Recueil;

