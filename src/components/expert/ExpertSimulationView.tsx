import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Euro, Calculator, Clock, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import { getExpertDossiers } from '../../utils/expertDossierStorage';
import type { ExpertSimulationSnapshot } from '../../types/expertDossier';

const fmtEuro = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
const fmtPercent = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + '\u202f%';
const fmtNumber = (v: number) => new Intl.NumberFormat('fr-FR').format(v);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function findSimulation(simId: string): ExpertSimulationSnapshot | null {
  const all = getExpertDossiers();
  for (const d of all) {
    const sim = d.simulations.find((s) => s.id === simId);
    if (sim) return sim;
  }
  return null;
}

interface ExpertSimulationViewProps {
  simulationId: string;
  onBack: () => void;
}

const ExpertSimulationView: React.FC<ExpertSimulationViewProps> = ({ simulationId, onBack }) => {
  const [sim, setSim] = useState<ExpertSimulationSnapshot | null>(null);
  const [showProjections, setShowProjections] = useState(false);
  const [showHypotheses, setShowHypotheses] = useState(false);

  useEffect(() => {
    setSim(findSimulation(simulationId));
  }, [simulationId]);

  if (!sim) {
    return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center">
          <p className="text-slate-500">Simulation introuvable.</p>
          <button onClick={onBack} className="mt-4 text-blue-400 text-sm hover:underline">Retour</button>
        </div>
      </div>
    );
  }

  const r = sim.results as Record<string, unknown>;
  const s = sim.summary;

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6">
        <ArrowLeft className="w-3 h-3" /> Détail dossier
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{sim.label}</h1>
        <p className="text-xs text-slate-500 mt-1">Enregistrée le {fmtDate(sim.createdAt)}</p>
      </div>

      {/* Synthèse KPI */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
        <Kpi label="Effort" value={fmtEuro(s.totalCashEffort)} color="blue" />
        <Kpi label="Trésorerie résid." value={fmtEuro(s.residualTreasury)} color="slate" />
        <Kpi label="Cash-flow A1" value={fmtEuro(s.yearOneNetCashFlow)} color="emerald" />
        <Kpi label="Impact IS A1" value={'+' + fmtEuro(s.yearOneTaxImpact)} color="orange" />
        <Kpi label="Rend. moyen" value={fmtPercent(s.averageAnnualNetYield)} color="emerald" />
        <Kpi label="Cash-flow cumulé" value={fmtEuro(s.cumulativeNetCashFlow)} color="emerald" />
      </div>

      {/* Comparatif avant / après — from results */}
      {r.comparatif && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-400" /> Comparatif avant / après
          </h2>
          <ComparatifTable data={r.comparatif as ComparatifRow[]} />
        </div>
      )}

      {/* Projection annuelle */}
      {r.projections && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-8">
          <button
            onClick={() => setShowProjections(!showProjections)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800/50 transition-colors"
          >
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Projection annuelle
            </h2>
            {showProjections ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          </button>
          {showProjections && (
            <div className="px-4 pb-4 overflow-x-auto">
              <ProjectionsTable projections={r.projections as ProjectionRow[]} />
            </div>
          )}
        </div>
      )}

      {/* Hypothèses */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-8">
        <button
          onClick={() => setShowHypotheses(!showHypotheses)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800/50 transition-colors"
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" /> Hypothèses
          </h2>
          {showHypotheses ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </button>
        {showHypotheses && (
          <div className="px-4 pb-4">
            <HypothesesBlock inputs={sim.inputs} />
          </div>
        )}
      </div>

      {/* Storage notice */}
      <div className="text-center">
        <p className="text-[10px] text-slate-600">
          Enregistrement local navigateur — synchronisation cabinet à venir.
        </p>
      </div>
    </div>
  );
};

/* ── Sub‑components ── */

const colorMap: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  orange: 'text-orange-400',
  slate: 'text-slate-400',
};

const Kpi: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{label}</span>
    <p className={`font-bold text-sm ${colorMap[color] || 'text-slate-200'}`}>{value}</p>
  </div>
);

interface ComparatifRow {
  label: string;
  avant: string;
  apres: string;
  impact: string;
  positive?: boolean;
}

const ComparatifTable: React.FC<{ data: ComparatifRow[] }> = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-xs">
      <thead>
        <tr className="border-b border-slate-700 bg-slate-950/50">
          <th className="py-2 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Poste</th>
          <th className="py-2 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Avant</th>
          <th className="py-2 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Après</th>
          <th className="py-2 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Impact</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800/50">
        {data.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-slate-900/30' : ''}>
            <td className="py-2 px-3 text-slate-300 font-medium">{row.label}</td>
            <td className="py-2 px-3 text-right text-slate-400">{row.avant}</td>
            <td className="py-2 px-3 text-right text-slate-300">{row.apres}</td>
            <td className={`py-2 px-3 text-right font-semibold ${row.positive !== undefined ? (row.positive ? 'text-emerald-400' : 'text-orange-400') : 'text-slate-300'}`}>
              {row.impact}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface ProjectionRow {
  year: number;
  grossIncome: number;
  amortization: number;
  fiscalResultOp: number;
  fiscalResultAfter: number;
  isBefore: number;
  isAfter: number;
  isImpact: number;
  netCashFlow: number;
  feesCash: number;
  netCashFlowAfterFees: number;
  cumulativeAfterFees: number;
}

const ProjectionsTable: React.FC<{ projections: ProjectionRow[] }> = ({ projections }) => (
  <table className="w-full text-left text-[11px]">
    <thead>
      <tr className="border-b border-slate-700">
        <th className="py-2 px-2 text-[10px] uppercase text-slate-500">Année</th>
        <th className="py-2 px-2 text-[10px] uppercase text-slate-500 text-right">Revenu brut</th>
        <th className="py-2 px-2 text-[10px] uppercase text-slate-500 text-right">Amort.</th>
        <th className="py-2 px-2 text-[10px] uppercase text-slate-500 text-right">IS avant</th>
        <th className="py-2 px-2 text-[10px] uppercase text-slate-500 text-right">IS après</th>
        <th className="py-2 px-2 text-[10px] uppercase text-slate-500 text-right">Impact IS</th>
        <th className="py-2 px-2 text-[10px] uppercase text-slate-500 text-right">Cash-flow</th>
        <th className="py-2 px-2 text-[10px] uppercase text-slate-500 text-right">Cumul</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-800/50">
      {projections.map((p) => (
        <tr key={p.year}>
          <td className="py-1.5 px-2 font-semibold text-slate-300">A{p.year}</td>
          <td className="py-1.5 px-2 text-right text-slate-400">{fmtEuro(p.grossIncome)}</td>
          <td className="py-1.5 px-2 text-right text-slate-400">{fmtEuro(p.amortization)}</td>
          <td className="py-1.5 px-2 text-right text-slate-400">{fmtEuro(p.isBefore)}</td>
          <td className="py-1.5 px-2 text-right text-slate-300">{fmtEuro(p.isAfter)}</td>
          <td className="py-1.5 px-2 text-right text-orange-400 font-semibold">+{fmtEuro(p.isImpact)}</td>
          <td className="py-1.5 px-2 text-right text-emerald-400">{fmtEuro(p.netCashFlow)}</td>
          <td className="py-1.5 px-2 text-right text-emerald-400 font-semibold">{fmtEuro(p.cumulativeAfterFees || p.netCashFlow)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const HypothesesBlock: React.FC<{ inputs: Record<string, unknown> }> = ({ inputs }) => {
  const entries = Object.entries(inputs);
  if (entries.length === 0) return <p className="text-xs text-slate-500 py-4">Aucune hypothèse enregistrée.</p>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 py-2">
      {entries.map(([key, value]) => (
        <div key={key} className="text-xs">
          <span className="text-slate-500">{key}: </span>
          <span className="text-slate-300">
            {typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : typeof value === 'number' ? fmtNumber(value as number) : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ExpertSimulationView;
