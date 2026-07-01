import React from 'react';
import { Building2, Landmark, TrendingUp, Calculator, Users, ArrowRight } from 'lucide-react';

interface ProfessionnelsPortalProps {
  onNavigateHome?: () => void;
}

const ProfessionnelsPortal: React.FC<ProfessionnelsPortalProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl">
        {/* Logo */}
        <div className="text-center mb-10">
          <img
            src="/Maximus logo 250x50 4.svg"
            alt="MaximusSCPI"
            className="h-12 mx-auto object-contain mb-4"
          />
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Choisissez votre espace professionnel
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Deux espaces distincts pour deux métiers différents. Sélectionnez celui qui correspond à votre activité.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* CGP / CIF */}
          <div className="bg-slate-900 border border-slate-800 hover:border-emerald-600/50 rounded-xl p-6 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Espace CGP / CIF</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Professionnels du patrimoine</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Comparer, sélectionner et préparer des supports clients SCPI.
              Outils de simulation, comparateur, fiches détaillées et génération de livrables.
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                <Landmark className="w-3 h-3" /> Dossiers clients
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                <Users className="w-3 h-3" /> SCPI préférées
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                <TrendingUp className="w-3 h-3" /> Simulateurs
              </span>
            </div>
            <a
              href="/pro/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition w-full justify-center"
            >
              Accéder à l'espace CGP
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Expert-Comptable */}
          <div className="bg-slate-900 border border-slate-800 hover:border-blue-600/50 rounded-xl p-6 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Espace Expert-Comptable</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Cabinet d'expertise comptable</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Simuler l'impact IS, la trésorerie société et l'usufruit temporaire SCPI.
              Outils de chiffrage fiscal et projections pour vos clients.
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                <Calculator className="w-3 h-3" /> Holding IS
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                <Building2 className="w-3 h-3" /> Trésorerie société
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                <Landmark className="w-3 h-3" /> Usufruit
              </span>
            </div>
            <a
              href="/expert-comptable/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm transition w-full justify-center"
            >
              Accéder à l'espace Expert-Comptable
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-slate-600 mt-8">
          Ces espaces sont réservés aux professionnels. L'accès nécessite une inscription validée.
        </p>
      </div>
    </div>
  );
};

export default ProfessionnelsPortal;
