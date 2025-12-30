import React from 'react';
import { X, Shield, Award, ExternalLink, User, Building } from 'lucide-react';
import ResponsiveImage from './ResponsiveImage';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl h-[80vh] shadow-2xl border border-gray-200 dark:border-gray-600 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1">
              Qui sommes-nous ?
            </h2>
            <p className="text-base font-medium text-gray-700 dark:text-gray-200">
              MaximusSCPI - Partenaire de confiance SCPI
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
            <h3 className="font-black text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2 text-lg">
              <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              MaximusSCPI
            </h3>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
              Plateforme d'analyse SCPI avec IA pour optimiser vos investissements immobiliers.
            </p>
          </div>

          {/* Eric Bellaiche */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex flex-col items-center text-center mb-4">
              <img
                src="/cercle Eric Bellaiche bleu.svg"
                alt="Eric Bellaiche - Conseiller en Gestion de Patrimoine"
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-full object-cover shadow-2xl mb-4"
                loading="eager"
                width="224"
                height="224"
              />
              <div>
                <h3 className="font-black text-gray-900 dark:text-gray-100 mb-2 text-2xl">
                  Eric Bellaiche
                </h3>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  Conseiller en Gestion de Patrimoine Certifié
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-bold rounded-full">
                    CGP Certifié
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-full">
                    CIF n°D016571
                  </span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-xs font-bold rounded-full">
                    Expert SCPI
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
              <p>
                Fort de <strong>plus de 15 ans d'expérience</strong> dans le conseil en investissement immobilier,
                je me suis spécialisé dans l'accompagnement des investisseurs souhaitant optimiser leur patrimoine
                via les SCPI (Sociétés Civiles de Placement Immobilier).
              </p>

              <p>
                Ma mission est simple : <strong>vous aider à construire un portefeuille SCPI performant et adapté</strong>
                à votre situation fiscale, vos objectifs patrimoniaux et votre profil de risque. Que vous recherchiez
                des revenus complémentaires réguliers, une optimisation fiscale ou une diversification patrimoniale,
                je vous accompagne dans chaque étape de votre projet.
              </p>

              <p>
                Grâce à <strong>MaximusSCPI</strong>, j'ai développé une plateforme innovante combinant mon expertise
                humaine avec des outils d'analyse avancés et l\'intelligence artificielle. Cette approche unique vous
                permet de bénéficier d'une analyse objective et approfondie du marché des SCPI, tout en profitant d\'un
                accompagnement personnalisé par un professionnel certifié.
              </p>

              <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg mt-3">
                <p className="font-bold text-gray-900 dark:text-white mb-2">🎯 Mon engagement :</p>
                <ul className="space-y-1 text-sm">
                  <li>✓ Analyse personnalisée de votre situation patrimoniale</li>
                  <li>✓ Sélection rigoureuse des meilleures SCPI du marché</li>
                  <li>✓ Optimisation fiscale selon votre TMI</li>
                  <li>✓ Suivi régulier de vos investissements</li>
                  <li>✓ Transparence totale et conseils indépendants</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
              <a
                href="https://eric-bellaiche.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm w-full sm:w-auto"
              >
                <ExternalLink className="w-4 h-4" />
                Découvrir mon site
              </a>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-200 text-center sm:text-left">
                CIF n°D016571 • Sous contrôle ACPR • ORIAS n°13001580
              </div>
            </div>
          </div>

          {/* Informations réglementaires */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
            <h3 className="font-black text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              Informations réglementaires
            </h3>
            
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-white/60 dark:bg-gray-800/60 p-2 rounded-lg text-center">
                <div className="font-black text-gray-900 dark:text-white mb-0.5">CIF n°D016571</div>
                <div className="font-medium text-gray-700 dark:text-gray-200">CNCEF</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 p-2 rounded-lg text-center">
                <div className="font-black text-gray-900 dark:text-white mb-0.5">ACPR</div>
                <div className="font-medium text-gray-700 dark:text-gray-200">Contrôle</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 p-2 rounded-lg text-center">
                <div className="font-black text-gray-900 dark:text-white mb-0.5">ORIAS</div>
                <div className="font-medium text-gray-700 dark:text-gray-200">13001580</div>
              </div>
            </div>
          </div>

          {/* Engagement qualité */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-600">
            <h3 className="font-black text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Notre engagement qualité
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-black text-gray-900 dark:text-gray-100 text-sm">Transparence</h4>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Infos objectives
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-black text-gray-900 dark:text-gray-100 text-sm">Expertise</h4>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Conseils personnalisés
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-black text-gray-900 dark:text-gray-100 text-sm">Innovation</h4>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Outils IA avancés
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-300">
              <strong>Avertissement :</strong> Informations à titre indicatif. Tout investissement présente des risques. 
              Consultez un conseiller agréé avant investissement.
            </p>
          </div>

          {/* Call to action */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-xl border border-green-200 dark:border-green-800 text-center">
            <h4 className="font-black text-gray-900 dark:text-white mb-2 text-lg">
              Prêt à optimiser vos SCPI ?
            </h4>
            <button
              onClick={() => {
                onClose();
                if (window.openRdvModal) {
                  window.openRdvModal();
                }
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-black text-base hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
            >
              Prendre rendez-vous gratuitement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;