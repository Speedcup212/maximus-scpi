import React, { useEffect } from 'react';
import { CheckCircle, ArrowRight, Phone, Shield, Mail } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { formatCurrency } from '../../utils/formatters';

interface Step4RedirectionProps {
  onClose?: () => void;
}

const Step4Redirection: React.FC<Step4RedirectionProps> = ({ onClose }) => {
  const { state } = useSubscription();

  const getDetentionModeLabel = () => {
    switch (state.detentionMode) {
      case 'direct': return 'Détention directe';
      case 'av': return 'Assurance-vie';
      case 'per': return 'PER';
      default: return state.detentionMode;
    }
  };

  // Redirection automatique après 3 secondes si pas d'interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      // La redirection est déjà gérée dans submitSubscription
      // Ici on peut juste afficher un message
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualRedirect = () => {
    const psiUrl = import.meta.env.VITE_PSI_INTENCIAL_URL || 'https://psi.intencial-patrimoine.fr';
    if (state.subscriptionToken) {
      window.location.href = `${psiUrl}?token=${state.subscriptionToken}&email=${encodeURIComponent(state.email)}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Demande enregistrée</h1>
          <p className="text-slate-400">Merci pour votre confiance !</p>
        </div>

        {/* Message principal */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700 text-center">
          <p className="text-lg text-slate-300 mb-2">
            Votre sélection a été enregistrée et un récapitulatif détaillé vous a été envoyé par email à l'adresse
          </p>
          <p className="text-xl font-bold text-emerald-400 flex items-center justify-center gap-2">
            <Mail className="w-5 h-5" />
            {state.email}
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Vous pouvez conserver cet email pour référence.
          </p>
        </div>

        {/* Récapitulatif */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Récapitulatif de votre projet</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-700">
              <span className="text-slate-400">SCPI sélectionnées</span>
              <span className="font-semibold text-white">
                {state.selectedScpis.length} : {state.selectedScpis.map(s => s.name).join(', ')}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-700">
              <span className="text-slate-400">Montant</span>
              <span className="font-semibold text-white">{formatCurrency(state.confirmedAmount)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-700">
              <span className="text-slate-400">Mode de détention</span>
              <span className="font-semibold text-white">{getDetentionModeLabel()}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-700">
              <span className="text-slate-400">Horizon d'investissement</span>
              <span className="font-semibold text-white">{state.horizon} ans</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block mb-2">Répartition</span>
              <div className="space-y-1">
                {state.selectedScpis.map(scpi => {
                  const percentage = state.allocation[scpi.id] || 0;
                  const amount = Math.round((percentage / 100) * state.confirmedAmount);
                  return (
                    <div key={scpi.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{scpi.name}</span>
                      <span className="text-white font-medium">
                        {percentage.toFixed(1)}% ({formatCurrency(amount)})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Ces informations ont été transmises à votre conseiller Intencial Patrimoine.
          </p>
        </div>

        {/* Prochaine étape */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-blue-400" />
            Prochaine étape : Questionnaire réglementaire
          </h2>
          <p className="text-slate-300 mb-4">
            Vous allez être redirigé vers le questionnaire réglementaire de votre conseiller Intencial Patrimoine dans quelques secondes.
          </p>
          <p className="text-sm text-slate-300 mb-4">
            Ce questionnaire est obligatoire pour toute souscription et permet de :
          </p>
          <ul className="text-sm text-slate-300 space-y-2 mb-4 list-disc list-inside">
            <li>Évaluer votre profil investisseur (connaissances, expérience, situation)</li>
            <li>Vérifier l'adéquation de votre projet avec votre situation patrimoniale</li>
            <li>Recueillir les informations nécessaires à la conformité réglementaire (CIF/AMF)</li>
          </ul>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-sm text-slate-300">
              <strong>Durée estimée :</strong> 10-15 minutes
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Vos informations seront sécurisées et traitées conformément au RGPD.
            </p>
          </div>
        </div>

        {/* Sécurité */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-emerald-400 mb-1">Sécurité de vos données</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vos informations sont transmises de manière sécurisée (chiffrement SSL) et traitées conformément au RGPD. Intencial Patrimoine est soumis au secret professionnel.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Principal */}
        <button
          onClick={handleManualRedirect}
          className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 mb-4"
        >
          Continuer vers le questionnaire
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Option accompagnement */}
        {state.wantsAccompaniment && (
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-400 mb-1">Besoin d'aide ?</h3>
                <p className="text-sm text-slate-300 mb-3">
                  Un conseiller Intencial Patrimoine peut vous accompagner dans le remplissage du questionnaire et répondre à vos questions.
                </p>
                <button
                  onClick={() => {
                    if (window.openRdvModal) {
                      window.openRdvModal();
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  Contacter un conseiller
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step4Redirection;




