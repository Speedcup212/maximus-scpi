import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Building2, Calendar, FileText, TrendingUp, Euro, Shield, ChevronRight, Clock, Calculator, Percent } from 'lucide-react';
import { getExpertDossierById } from '../../utils/expertDossierStorage';
import type { ExpertClientDossier, ExpertSimulationSnapshot } from '../../types/expertDossier';

const fmtEuro = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
const fmtPercent = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + '\u202f%';
const fmtNumber = (v: number) => new Intl.NumberFormat('fr-FR').format(v);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

interface ExpertDossierDetailProps {
  dossierId: string;
  onBack: () => void;
  onViewSimulation: (simId: string) => void;
}

const ExpertDossierDetail: React.FC<ExpertDossierDetailProps> = ({ dossierId, onBack, onViewSimulation }) => {
  const [dossier, setDossier] = useState<ExpertClientDossier | null>(null);

  useEffect(() => {
    setDossier(getExpertDossierById(dossierId) || null);
  }, [dossierId]);

  if (!dossier) {
    return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center">
          <p className="text-slate-500">Dossier introuvable.</p>
          <button onClick={onBack} className="mt-4 text-blue-400 text-sm hover:underline">Retour aux dossiers</button>
        </div>
      </div>
    );
  }

  const last = dossier.simulations[dossier.simulations.length - 1];

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6">
        <ArrowLeft className="w-3 h-3" /> Tous les dossiers
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{dossier.companyType}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">{dossier.name}</h1>
        </div>
        {last && (
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase">Dernière simulation</p>
            <p className="text-xs text-slate-400">{fmtDate(last.createdAt)}</p>
          </div>
        )}
      </div>

      {/* Dernière simulation — KPI */}
      {last && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Dernière simulation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard label="Effort" value={fmtEuro(last.summary.totalCashEffort)} color="blue" />
            <KpiCard label="Trésorerie résid." value={fmtEuro(last.summary.residualTreasury)} color="slate" />
            <KpiCard label="Cash-flow A1" value={fmtEuro(last.summary.yearOneNetCashFlow)} color="emerald" />
            <KpiCard label="Impact IS A1" value={'+' + fmtEuro(last.summary.yearOneTaxImpact)} color="orange" />
            <KpiCard label="Rend. moyen" value={fmtPercent(last.summary.averageAnnualNetYield)} color="emerald" />
            <KpiCard label="Cash-flow cumulé" value={fmtEuro(last.summary.cumulativeNetCashFlow)} color="emerald" />
          </div>
        </div>
      )}

      {/* Historique */}
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" /> Historique des simulations
        </h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50">
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Date</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Usufruit</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Durée</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Cash-flow A1</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Rend. moyen</th>
                  <th className="py-2.5 px-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {[...dossier.simulations].reverse().map((sim, i) => (
                  <tr key={sim.id} className={i % 2 === 0 ? 'bg-slate-900/30' : ''}>
                    <td className="py-2.5 px-3 text-slate-400">{fmtDateTime(sim.createdAt)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{fmtEuro(sim.summary.usufruitAmount)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{sim.summary.usufruitDuration} ans</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">{fmtEuro(sim.summary.yearOneNetCashFlow)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">{fmtPercent(sim.summary.averageAnnualNetYield)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onViewSimulation(sim.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 ml-auto"
                      >
                        Voir <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const colorMap: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  orange: 'text-orange-400',
  slate: 'text-slate-400',
};

const KpiCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{label}</span>
    <p className={`font-bold text-sm ${colorMap[color] || 'text-slate-200'}`}>{value}</p>
  </div>
);

export default ExpertDossierDetail;
