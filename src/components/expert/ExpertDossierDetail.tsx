import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Building2, Calendar, Clock, TrendingUp, Play, FileText, ChevronRight, Save, Trash2, Copy, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { getExpertDossierById, updateExpertDossier, deleteExpertDossier, duplicateExpertDossier } from '../../utils/expertDossiersSupabase';
import type { ExpertClientDossier } from '../../types/expertDossier';

const RESUME_SESSION_KEY = 'maximus_expert_resume_simulation';

const fmtEuro = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
const fmtPercent = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + '\u202f%';
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

interface ExpertDossierDetailProps {
  dossierId: string;
  onBack: () => void;
  onViewSimulation: (simId: string) => void;
  onNavigate: (section: string) => void;
}

const ExpertDossierDetail: React.FC<ExpertDossierDetailProps> = ({ dossierId, onBack, onViewSimulation, onNavigate }) => {
  const [dossier, setDossier] = useState<ExpertClientDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const d = await getExpertDossierById(dossierId);
      if (!d) {
        setError('Dossier introuvable.');
      } else {
        setDossier(d);
        setNotes(d.notes || '');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger le dossier.');
    } finally {
      setLoading(false);
    }
  }, [dossierId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleSaveNotes = async () => {
    if (!dossier) return;
    setSavingNotes(true);
    try {
      const updated = await updateExpertDossier(dossierId, { notes });
      setDossier(updated);
      setNotes(updated.notes || '');
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {
      // ignore
    } finally {
      setSavingNotes(false);
    }
  };

  const handleResumeSimulation = () => {
    if (!dossier) return;
    const last = dossier.simulations[dossier.simulations.length - 1];
    if (!last) return;
    try {
      sessionStorage.setItem(RESUME_SESSION_KEY, JSON.stringify(last.inputs));
    } catch { /* ignore */ }
    onNavigate('holding-simulator');
  };

  const handleNewSimulation = () => {
    try {
      sessionStorage.removeItem(RESUME_SESSION_KEY);
    } catch { /* ignore */ }
    onNavigate('holding-simulator');
  };

  const handleDelete = async () => {
    try {
      await deleteExpertDossier(dossierId);
      onBack();
    } catch {
      // ignore
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateExpertDossier(dossierId);
      onBack();
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={reload} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors">
              Réessayer
            </button>
            <button onClick={onBack} className="px-4 py-2 text-blue-400 text-sm hover:underline">
              Retour aux dossiers
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6">
        <ArrowLeft className="w-3 h-3" /> Tous les dossiers
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{dossier.companyType}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">{dossier.clientName}</h1>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Créé le {fmtDate(dossier.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Modifié le {fmtDate(dossier.updatedAt)}
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> {dossier.simulations.length} simulation{dossier.simulations.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleNewSimulation}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            <Play className="w-4 h-4" />
            Nouvelle simulation
          </button>
          {last && (
            <button
              onClick={handleResumeSimulation}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Reprendre simulation
            </button>
          )}
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1 px-3 py-2.5 text-slate-500 hover:text-violet-400 hover:bg-violet-600/10 rounded-lg transition-colors text-sm"
            title="Dupliquer"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1 px-3 py-2.5 text-slate-500 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors text-sm"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="mb-6 bg-red-950/20 border border-red-900/30 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-red-300">Supprimer définitivement ce dossier et toutes ses simulations ?</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors">
              Annuler
            </button>
            <button onClick={handleDelete} className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-500 transition-colors">
              Supprimer
            </button>
          </div>
        </div>
      )}

      {last && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Dernière simulation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard label="Effort initial" value={fmtEuro(last.summary.totalCashEffort)} color="blue" />
            <KpiCard label="Trésorerie résid." value={fmtEuro(last.summary.residualTreasury)} color="slate" />
            <KpiCard label="Flux net année 1" value={fmtEuro(last.summary.yearOneNetCashFlow)} color="emerald" />
            <KpiCard label="Impact IS année 1" value={'+' + fmtEuro(last.summary.yearOneTaxImpact)} color="orange" />
            <KpiCard label="Rend. net moyen" value={fmtPercent(last.summary.averageAnnualNetYield)} color="emerald" />
            <KpiCard label="Cash-flow cumulé" value={fmtEuro(last.summary.cumulativeNetCashFlow)} color="emerald" />
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" /> Simulations enregistrées ({dossier.simulations.length})
        </h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50">
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Date</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Usufruit</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Durée</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Flux net A1</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Rend. net</th>
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
          {dossier.simulations.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-sm text-slate-500">Aucune simulation enregistrée.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" /> Notes cabinet
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes internes, remarques, suivi du dossier..."
          rows={4}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-y"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-slate-600">Notes internes accessibles uniquement côté cabinet.</p>
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-3 h-3" />
            {notesSaved ? 'Enregistré' : 'Enregistrer les notes'}
          </button>
        </div>
      </div>

      <p className="text-[10px] text-slate-600 text-center">
        Stockage sécurisé Supabase — synchronisé avec votre compte cabinet.
      </p>
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
