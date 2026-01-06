import React from 'react';
import { ExternalLink, Shield, Leaf, FileText, User } from 'lucide-react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import MaximusLogoFooter from './MaximusLogoFooter';

const Footer: React.FC = () => {
  const { openSettings } = useCookieConsent();

  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo SVG */}
        <div className="flex justify-center mb-8">
          <MaximusLogoFooter className="h-16 w-auto" />
        </div>

        {/* Grille de blocs d'informations */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
          {/* Bloc 1 : À propos */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-3">
              MaximusSCPI<span className="text-xs align-super">™</span>
            </h3>
            <p className="text-sm text-gray-300 mb-2">
              Votre expert en investissement SCPI
            </p>
            <p className="text-xs text-gray-400">
              Marque déposée INPI
            </p>
          </div>

          {/* Bloc 2 : Conseiller */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-3">
              Conseiller en Investissements Financiers
            </h3>
            <p className="text-sm text-gray-300 mb-2">
              <strong>Eric Bellaiche</strong>
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>ORIAS N° <strong>13001580</strong></p>
              <p>CNCEF Patrimoine N° <strong>D016571</strong></p>
              <p>Sous le contrôle de l'ACPR</p>
            </div>
          </div>

          {/* Bloc 3 : Risques */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-yellow-400 mb-3">
              ⚠️ Risques
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              L'investissement en SCPI présente des risques de perte en capital et de liquidité.
              Les performances passées ne préjugent pas des performances futures.
              Le rendement n'est pas garanti et peut varier.
            </p>
          </div>

          {/* Bloc 4 : Durée et Frais */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-3">
              Durée et Frais
            </h3>
            <div className="text-xs text-gray-300 space-y-2">
              <p>
                <strong>Durée recommandée :</strong> 8 à 10 ans minimum
              </p>
              <p>
                <strong>Frais de souscription :</strong> 8% à 12% HT
              </p>
              <p>
                <strong>Frais de gestion :</strong> 10% à 12% HT sur les loyers
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-5xl mx-auto bg-gray-800 rounded-lg p-6 mb-8">
          <p className="text-xs text-gray-400 leading-relaxed text-center">
            Les informations présentées sur cette page sont fournies à titre indicatif et ne constituent pas un conseil en investissement personnalisé.
            Tout investissement doit faire l'objet d'une analyse approfondie de votre situation personnelle.
            Consultez la note d'information complète de chaque SCPI avant tout investissement.
          </p>
        </div>

        {/* Liens légaux et Copyright */}
        <div className="text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400">
            <a
              href="/mentions_legales_maximusscpi.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              Mentions légales
            </a>
            <a
              href="/politique_confidentialite_maximusscpi.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              Politique de confidentialité
            </a>
            <a
              href="/cgu_maximusscpi.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              Conditions d'utilisation
            </a>
            <a href="/reclamation" className="hover:text-blue-400 transition-colors">
              Réclamation
            </a>
            <button
              onClick={openSettings}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Gérer les cookies
            </button>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} MaximusSCPI. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;