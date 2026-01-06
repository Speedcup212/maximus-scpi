import React, { useEffect } from 'react';
import { X, Star, Users, ThumbsUp } from 'lucide-react';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReviewsModal: React.FC<ReviewsModalProps> = ({ isOpen, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Charger le script Elfsight si pas déjà chargé
      if (!document.querySelector('script[src="https://elfsightcdn.com/platform.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://elfsightcdn.com/platform.js';
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl h-[80vh] shadow-2xl border border-gray-200 dark:border-gray-600 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              Avis Clients
            </h2>
            <p className="text-base font-medium text-gray-700 dark:text-gray-200">
              Retours clients MaximusSCPI
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-4 min-h-0">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 dark:text-gray-100 mb-1 text-lg">
                  Témoignages de nos clients
                </h3>
                <p className="text-base font-medium text-gray-800 dark:text-gray-100">
                  Expérience clients MaximusSCPI
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h4 className="text-sm font-black text-gray-900 dark:text-gray-100">Expertise</h4>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Analyses approfondies
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <ThumbsUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-sm font-black text-gray-900 dark:text-gray-100">Satisfaction</h4>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Suivi personnalisé
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-sm font-black text-gray-900 dark:text-gray-100">Communauté</h4>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Témoignages authentiques
                </p>
              </div>
            </div>
          </div>

          {/* Widget Google Reviews */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-600 flex-1 min-h-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 dark:text-white text-base">
                  Avis Google Reviews
                </h3>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Témoignages authentiques de nos clients
                </p>
              </div>
            </div>
            
            {/* Widget Elfsight Google Reviews */}
            <div className="elfsight-app-089f5018-38f9-4d1a-b6e6-b795752d6c76 h-48 overflow-hidden" data-elfsight-app-lazy></div>
            
            {/* Message de chargement */}
            <div className="text-center py-4 text-gray-600 dark:text-gray-300" id="reviews-loading">
              <div className="animate-spin w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">Chargement des avis clients...</p>
            </div>
          </div>

          {/* Call to action */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-xl border border-green-200 dark:border-green-800 flex-shrink-0">
            <div className="text-center">
              <h4 className="font-black text-gray-900 dark:text-white mb-2 text-lg">
                Rejoignez nos clients satisfaits
              </h4>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-3">
                Expertise Eric Bellaiche pour optimiser vos SCPI
              </p>
              <button
                onClick={() => {
                  onClose();
                  // Ouvrir le modal RDV
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
    </div>
  );
};

export default ReviewsModal;