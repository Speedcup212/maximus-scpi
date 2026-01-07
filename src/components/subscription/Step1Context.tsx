import React from 'react';
import { ArrowRight, Shield, AlertTriangle, FileText, UserCheck } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import EricAvatar from '../EricAvatar';

interface Step1ContextProps {
  onClose?: () => void;
}

const Step1Context: React.FC<Step1ContextProps> = ({ onClose }) => {
  const { state, updateState, goToStep, validateStep } = useSubscription();

  const handleAccept = () => {
    updateState({ contextAccepted: true });
    goToStep(2);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex flex-col items-center mb-6">
            <div className="mb-4">
              <EricAvatar size={120} className="ring-4 ring-emerald-500/50 shadow-2xl" />
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 inline-block mb-2 text-center">
              <p className="text-base font-bold text-white mb-1">Eric Bellaiche</p>
              <p className="text-sm font-semibold text-emerald-400 mb-1">Conseiller expert en construction de portefeuilles SCPI</p>
              <p className="text-xs text-slate-300">
                Conseiller en Investissements Financiers (CIF) – Membre de la CNCEF Patrimoine
              </p>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Votre accompagnement</h1>
          <p className="text-slate-400">Préparons ensemble votre projet d'investissement SCPI</p>
          <p className="text-sm text-orange-400 font-semibold mt-2">⏱️ Durée estimée : 15 minutes</p>
        </div>

        {/* Accompagnement */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Comment se déroule votre démarche
          </h2>
          
          <div className="space-y-4 text-slate-300">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="font-semibold text-blue-400 mb-2">Un parcours accompagné, simple et sécurisé</p>
              <p className="text-sm leading-relaxed">
                Votre projet d'investissement est préparé avec l'aide d'un <strong>conseiller expert</strong>, qui vous accompagne à chaque étape. 
                Ce parcours vous permet de constituer votre dossier sereinement, avec une validation humaine avant toute décision finale.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm leading-relaxed font-semibold">
                Les étapes de votre parcours :
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm ml-4">
                <li>
                  <strong>Vous renseignez</strong> les informations nécessaires à la compréhension de votre projet
                </li>
                <li>
                  <strong>Votre conseiller analyse</strong> votre dossier et valide les informations fournies
                </li>
                <li>
                  <strong>Un rendez-vous en visio</strong> est organisé afin de valider ensemble vos informations et votre portefeuille
                </li>
                <li>
                  <strong>La souscription est réalisée</strong> entièrement en ligne, avec votre conseiller, via une signature électronique sécurisée, jusqu'à la finalisation
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Objectif du parcours */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            Pourquoi ce parcours ?
          </h2>
          <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
            <li>Préparer votre projet d'investissement SCPI en toute sérénité</li>
            <li>Centraliser toutes les informations utiles en un seul endroit</li>
            <li>Bénéficier d'un échange personnalisé en visio avec un conseiller expert</li>
            <li>Finaliser votre souscription à distance, simplement et en toute confiance, grâce à la signature en ligne</li>
          </ul>
        </div>

        {/* Avertissements risques */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Avertissements importants
          </h2>
          <div className="space-y-3 text-slate-300">
            <div>
              <p className="font-semibold mb-1">Risque de perte en capital</p>
              <p className="text-sm">
                Comme tout investissement, les SCPI présentent un risque de perte en capital. La valeur de vos parts peut évoluer à la hausse comme à la baisse. Aucun rendement n'est garanti.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Liquidité</p>
              <p className="text-sm">
                La revente de vos parts peut prendre du temps. C'est pourquoi nous recommandons un horizon d'investissement d'au moins 10 ans pour laisser à votre investissement le temps de se développer.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Horizon d'investissement</p>
              <p className="text-sm">
                Les SCPI sont conçues pour un investissement sur le long terme. Un horizon de 10 ans minimum est recommandé pour optimiser votre investissement.
              </p>
            </div>
          </div>
        </div>

        {/* Informations importantes */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
          <h3 className="text-sm font-bold text-slate-200 mb-2">Informations importantes</h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Les SCPI présentent un risque de perte en capital et une liquidité non immédiate. 
            Il s'agit d'investissements de long terme, pour lesquels un horizon d'au moins 10 ans est généralement recommandé.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Les informations que vous renseignez permettent à votre conseiller de préparer votre dossier. 
            Elles sont analysées et validées lors d'un rendez-vous en visio avant toute finalisation. 
            La souscription est ensuite réalisée en ligne, avec votre conseiller, via un processus sécurisé.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
            >
              Annuler
            </button>
          )}
          <button
            onClick={handleAccept}
            className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            J'ai compris, je continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1Context;

