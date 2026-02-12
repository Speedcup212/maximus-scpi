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

        {/* Plan du site - SEO */}
        <div className="max-w-7xl mx-auto mb-8 border-t border-gray-700 pt-8">
          <h3 className="text-lg font-bold text-white mb-6 text-center">Plan du site</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 text-sm">
            {/* Accueil & Outils */}
            <div>
              <h4 className="font-semibold text-blue-400 mb-3">Accueil & Outils</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/" className="hover:text-blue-400 transition-colors">Accueil</a>
                </li>
                <li>
                  <a href="/comparateur-scpi" className="hover:text-blue-400 transition-colors">Comparateur SCPI</a>
                </li>
                <li>
                  <a href="/meilleures-scpi-rendement" className="hover:text-blue-400 transition-colors">Meilleures SCPI</a>
                </li>
              </ul>
            </div>

            {/* Secteurs */}
            <div>
              <h4 className="font-semibold text-blue-400 mb-3">Secteurs</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/scpi-bureaux" className="hover:text-blue-400 transition-colors">SCPI Bureaux</a>
                </li>
                <li>
                  <a href="/scpi-commerces" className="hover:text-blue-400 transition-colors">SCPI Commerces</a>
                </li>
                <li>
                  <a href="/scpi-sante" className="hover:text-blue-400 transition-colors">SCPI Santé</a>
                </li>
                <li>
                  <a href="/scpi-logistique" className="hover:text-blue-400 transition-colors">SCPI Logistique</a>
                </li>
                <li>
                  <a href="/scpi-residentiel" className="hover:text-blue-400 transition-colors">SCPI Résidentiel</a>
                </li>
              </ul>
            </div>

            {/* Géographie */}
            <div>
              <h4 className="font-semibold text-blue-400 mb-3">Géographie</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/scpi-france" className="hover:text-blue-400 transition-colors">SCPI France</a>
                </li>
                <li>
                  <a href="/scpi-europe" className="hover:text-blue-400 transition-colors">SCPI Europe</a>
                </li>
                <li>
                  <a href="/scpi-fiscales" className="hover:text-blue-400 transition-colors">SCPI Fiscales</a>
                </li>
                <li>
                  <a href="/preparer-retraite-scpi" className="hover:text-blue-400 transition-colors">Préparer sa retraite</a>
                </li>
              </ul>
            </div>

            {/* À propos */}
            <div>
              <h4 className="font-semibold text-blue-400 mb-3">À propos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/qui-sommes-nous" className="hover:text-blue-400 transition-colors">Qui sommes-nous</a>
                </li>
                <li>
                  <a href="/partenaire-cabinet" className="hover:text-blue-400 transition-colors">Espace partenaire</a>
                </li>
                <li>
                  <a href="/expertise-orias-cif" className="hover:text-blue-400 transition-colors">Expertise ORIAS/CIF</a>
                </li>
                <li>
                  <a href="/methodologie-donnees-scpi" className="hover:text-blue-400 transition-colors">Méthodologie</a>
                </li>
                <li>
                  <a href="/avertissements-risques-scpi" className="hover:text-blue-400 transition-colors">Avertissements</a>
                </li>
              </ul>
            </div>

            {/* Ressources */}
            <div>
              <h4 className="font-semibold text-blue-400 mb-3">Ressources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/comprendre-les-scpi" className="hover:text-blue-400 transition-colors">Comprendre les SCPI</a>
                </li>
                <li>
                  <a href="/faq" className="hover:text-blue-400 transition-colors">FAQ</a>
                </li>
                <li>
                  <a href="/articles" className="hover:text-blue-400 transition-colors">Articles & Guides</a>
                </li>
                <li>
                  <a href="/investir-scpi" className="hover:text-blue-400 transition-colors">Investir en SCPI</a>
                </li>
              </ul>
            </div>
          </div>
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