/**
 * ScpiLeadCta — Bloc CTA réutilisable génération de leads
 * Conforme CIF : pas de promesse de rendement, pas de recommandation personnalisée.
 * Liens crawlables en <a href=""> avec paramètres UTM.
 */
import React from 'react';
import { ArrowRight, Shield, FileSearch, ExternalLink } from 'lucide-react';

export interface ScpiLeadCtaProps {
  /** Permet de réduire la visibilité si vrai (version embedded) */
  subtle?: boolean;
}

const LEAD_URL =
  'https://eric-bellaiche.fr/conseiller-scpi/?utm_source=maximusscpi&utm_medium=article&utm_campaign=scpi_leads';

const AUTHORITY_URL =
  'https://eric-bellaiche.fr/eric-bellaiche-cgp-cif/?utm_source=maximusscpi&utm_medium=article&utm_campaign=authority';

const ScpiLeadCta: React.FC<ScpiLeadCtaProps> = ({ subtle = false }) => {
  return (
    <section className={`my-12 ${subtle ? '' : ''}`}>
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-xl">
        {/* Titre */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-3">
          <FileSearch className="w-6 h-6 text-blue-400 flex-shrink-0" />
          <span>Vous envisagez d'investir en SCPI ?</span>
        </h2>

        {/* Texte principal */}
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
          Avant toute souscription, il est utile de vérifier si votre projet SCPI est cohérent
          avec votre fiscalité, votre horizon de placement, votre profil investisseur, votre
          capacité de risque et votre besoin de liquidité.
        </p>

        {/* Bloc conformité */}
        <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-4 mb-5 flex items-start gap-3">
          <Shield className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-300 leading-relaxed">
            <strong className="text-red-200">Rappel important :</strong> Les SCPI présentent un
            risque de perte en capital, un risque de liquidité et des revenus non garantis. Une
            recommandation personnalisée nécessite une analyse préalable de votre situation
            patrimoniale, fiscale et de votre profil investisseur.
          </p>
        </div>

        {/* Bouton principal */}
        <a
          href={LEAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-600/25 mb-4"
        >
          Faire analyser mon projet SCPI
          <ArrowRight className="w-5 h-5" />
        </a>

        {/* Mention professionnelle et lien secondaire */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            Accompagnement possible avec <strong className="text-slate-300">Eric Bellaiche, CGP-CIF</strong> inscrit{' '}
            <strong className="text-slate-300">ORIAS n°13001580</strong>
          </span>
          <span className="hidden sm:inline text-slate-600">·</span>
          <a
            href={AUTHORITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            En savoir plus sur Eric Bellaiche, CGP-CIF
          </a>
        </div>
      </div>
    </section>
  );
};

export default ScpiLeadCta;
