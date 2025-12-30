import React, { useState } from 'react';
import { ExternalLink, FileText, Shield, Info, Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';

const LegalFooter: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalType: string) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <>
      <footer className="bg-gray-900 border-t border-gray-700 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Logo et description */}
            <div className="md:col-span-1">
              <div className="mb-4">
                <Logo className="h-12 w-auto mb-3" isDarkMode={true} />
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Plateforme d'analyse SCPI powered by IA pour optimiser vos investissements immobiliers.
              </p>
            </div>

            {/* Outils */}
            <div>
              <h4 className="text-white font-semibold mb-4">Outils</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Comparateur SCPI
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      if (window.openSCPIWizard) {
                        window.openSCPIWizard();
                      }
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Simulateur IA
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      if (window.openRdvModal) {
                        window.openRdvModal();
                      }
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Conseil Expert
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:eric.bellaiche@gmail.com" className="hover:text-white transition-colors">
                    eric.bellaiche@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <ExternalLink className="w-4 h-4" />
                  <a 
                    href="https://eric-bellaiche.fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    eric-bellaiche.fr
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <a 
                    href="https://calendly.com/eric-bellaiche/gp-rendez-vous-avec-eric-bellaiche-clone" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Prendre RDV
                  </a>
                </div>
              </div>
            </div>

            {/* Informations légales */}
            <div>
              <h4 className="text-white font-semibold mb-4">Informations légales</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => openModal('mentions')}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    Mentions légales
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => openModal('confidentialite')}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    Politique de confidentialité
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => openModal('cgu')}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Info className="w-3 h-3" />
                    CGU
                  </button>
                </li>
                <li>
                  <a 
                    href="/politique-durabilite.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Politique durabilité
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <div className="text-sm text-gray-400 mb-2">
                  <strong>Eric Bellaiche</strong> - Conseiller en Gestion de Patrimoine Certifié
                </div>
                <div className="text-xs text-gray-500">
                  CIF n°D016571 • Sous contrôle ACPR • ORIAS 13001580 • CNCEF
                </div>
              </div>
              <div className="text-xs text-gray-500 text-center md:text-right">
                © 2025 MaximusSCPI. Tous droits réservés.<br />
                Avertissement : Tout investissement présente des risques.
              </div>
            </div>
          </div>

          {/* Logo en bas de page */}
          <div className="mt-8 pt-6 border-t border-gray-700 flex justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="hover:scale-105 transition-transform duration-300">
                <Logo className="h-14 w-auto" isDarkMode={true} />
              </div>
              <p className="text-xs text-gray-500">Votre expert en investissement SCPI</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals pour les mentions légales */}
      {activeModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-600">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {activeModal === 'mentions' && 'Mentions légales'}
                {activeModal === 'confidentialite' && 'Politique de confidentialité'}
                {activeModal === 'cgu' && 'Conditions générales d\'utilisation'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeModal === 'mentions' && (
                <div className="prose dark:prose-invert max-w-none">
                  <h3>Éditeur du site</h3>
                  <p>
                    <strong>MaximusSCPI</strong><br />
                    Représenté par Eric Bellaiche<br />
                    Conseiller en Gestion de Patrimoine Certifié<br />
                    CIF n°D016571
                  </p>

                  <h3>Hébergement</h3>
                  <p>
                    Site hébergé par Netlify<br />
                    2325 3rd Street, Suite 296<br />
                    San Francisco, CA 94107, USA
                  </p>

                  <h3>Responsabilité</h3>
                  <p>
                    Les informations présentes sur ce site sont fournies à titre indicatif. 
                    Elles ne constituent pas un conseil en investissement personnalisé. 
                    Tout investissement présente des risques de perte en capital.
                  </p>

                  <h3>Propriété intellectuelle</h3>
                  <p>
                    Le contenu de ce site (textes, images, graphiques) est protégé par le droit d'auteur. 
                    Toute reproduction sans autorisation est interdite.
                  </p>
                </div>
              )}

              {activeModal === 'confidentialite' && (
                <div className="prose dark:prose-invert max-w-none">
                  <h3>Collecte des données</h3>
                  <p>
                    Nous collectons uniquement les données nécessaires au fonctionnement du service :
                    nom, email, téléphone pour les prises de rendez-vous.
                  </p>

                  <h3>Utilisation des données</h3>
                  <p>
                    Vos données sont utilisées exclusivement pour :
                  </p>
                  <ul>
                    <li>Vous contacter suite à une demande de rendez-vous</li>
                    <li>Vous envoyer votre analyse SCPI personnalisée</li>
                    <li>Améliorer nos services</li>
                  </ul>

                  <h3>Conservation</h3>
                  <p>
                    Vos données sont conservées pendant 3 ans maximum, 
                    conformément à la réglementation en vigueur.
                  </p>

                  <h3>Vos droits</h3>
                  <p>
                    Vous disposez d'un droit d'accès, de rectification et de suppression 
                    de vos données personnelles. Contactez-nous à eric.bellaiche@gmail.com
                  </p>
                </div>
              )}

              {activeModal === 'cgu' && (
                <div className="prose dark:prose-invert max-w-none">
                  <h3>Objet</h3>
                  <p>
                    Les présentes conditions générales régissent l'utilisation du site MaximusSCPI 
                    et de ses outils d'analyse SCPI.
                  </p>

                  <h3>Utilisation du service</h3>
                  <p>
                    Le service est fourni gratuitement. L'utilisateur s'engage à :
                  </p>
                  <ul>
                    <li>Utiliser le service de manière loyale</li>
                    <li>Ne pas tenter de contourner les mesures de sécurité</li>
                    <li>Fournir des informations exactes</li>
                  </ul>

                  <h3>Limitation de responsabilité</h3>
                  <p>
                    Les analyses et recommandations fournies sont indicatives. 
                    MaximusSCPI ne peut être tenu responsable des décisions d'investissement 
                    prises sur la base de ces informations.
                  </p>

                  <h3>Modification des CGU</h3>
                  <p>
                    Ces conditions peuvent être modifiées à tout moment. 
                    Les utilisateurs seront informés des changements significatifs.
                  </p>
                </div>
              )}
            </div>

            {/* Footer du modal */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30">
              <button
                onClick={closeModal}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LegalFooter;