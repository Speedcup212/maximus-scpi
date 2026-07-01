import React, { useState, useEffect } from 'react';
import { FolderOpen, ChevronRight, Building2, Calendar, FileText, TrendingUp, Euro } from 'lucide-react';
import { getExpertDossiers } from '../../utils/expertDossierStorage';
import type { ExpertClientDossier } from '../../types/expertDossier';

const fmtEuro = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
const fmtPercent = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + '\u202f%';
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

interface ExpertDossiersListProps {
  onNavigate: (section: string) => void;
  onOpenDossier: (dossierId: string) => void;
}

const ExpertDossiersList: React.FC<ExpertDossiersListProps> = ({ onNavigate, onOpenDossier }) => {
  const [dossiers, setDossiers] = useState<ExpertClientDossier[]>([]);

  useEffect(() => {
    setDossiers(getExpertDossiers());
  }, []);

  if (dossiers.length === 0) {
    return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Cabinet</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Dossiers clients</h1>
          <p className="text-slate-400 max-w-2xl">
            Simulations Holding IS enregistrées pour les sociétés clientes.
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Aucun dossier client enregistré</h2>
          <p className="text-sm text-slate-500 max-w-md mb-6">
            Lancez une simulation Holding IS puis enregistrez-la dans un dossier client.
          </p>
          <button
            onClick={() => onNavigate('holding-simulator')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            Lancer le simulateur
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FolderOpen className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Cabinet</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Dossiers clients</h1>
        <p className="text-slate-400 max-w-2xl">
          Simulations Holding IS enregistrées pour les sociétés clientes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dossiers.map((d) => {
          const last = d.simulations[d.simulations.length - 1];
          return (
            <button
              key={d.id}
              onClick={() => onOpenDossier(d.id)}
              className="text-left bg-slate-900 border border-slate-800 hover:border-blue-600/50 rounded-xl p-6 transition-all hover:bg-slate-900/80 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                    <Building2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                      {d.name}
                    </h3>
                    <p className="text-xs text-slate-500">{d.companyType}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{fmtDate(d.updatedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {d.simulations.length} simulation{d.simulations.length > 1 ? 's' : ''}
                </span>
              </div>
              {last && (
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase">Effort</span>
                    <p className="text-sm font-semibold text-slate-300">{fmtEuro(last.summary.totalCashEffort)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase">Cash-flow A1</span>
                    <p className="text-sm font-semibold text-emerald-400">{fmtEuro(last.summary.yearOneNetCashFlow)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase">Rend. moyen</span>
                    <p className="text-sm font-semibold text-emerald-400">{fmtPercent(last.summary.averageAnnualNetYield)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase">Impact IS</span>
                    <p className="text-sm font-semibold text-orange-400">+{fmtEuro(last.summary.yearOneTaxImpact)}</p>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExpertDossiersList;
