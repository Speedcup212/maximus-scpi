import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Building2, Calendar, Clock, TrendingUp, Play, FileText,
  ChevronRight, Save, Trash2, Copy, Loader2, AlertCircle, BarChart3,
  FileDown, Download, RefreshCw, BadgeCheck, Hash, User,
} from 'lucide-react';
import {
  getExpertDossierById, updateExpertDossier, deleteExpertDossier,
  duplicateExpertDossier, deleteExpertHoldingSimulation,
  getExpertReportsByDossier, deleteExpertReport, getExpertReportSignedUrl,
} from '../../utils/expertDossiersSupabase';
import type { ExpertClientDossier, ExpertGeneratedReport } from '../../types/expertDossier';

const RESUME_SESSION_KEY = 'maximus_expert_resume_simulation';

/** Formate un montant en toute sécurité (pas de NaN) */
const formatSafeCurrency = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
};

const fmtEuro = (v: number) => formatSafeCurrency(v);
const fmtPercent = (v: number) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + '\u202f%';
};
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

  /* ── Documents générés ── */
  const [reports, setReports] = useState<ExpertGeneratedReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [regeneratingSimId, setRegeneratingSimId] = useState<string | null>(null);
  const [deletingSimId, setDeletingSimId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [d, reps] = await Promise.all([
        getExpertDossierById(dossierId),
        getExpertReportsByDossier(dossierId).catch(() => [] as ExpertGeneratedReport[]),
      ]);
      if (!d) {
        setError('Dossier introuvable.');
      } else {
        setDossier(d);
        setNotes(d.notes || '');
        setReports(reps);
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
    try { sessionStorage.removeItem(RESUME_SESSION_KEY); } catch { /* ignore */ }
    onNavigate('holding-simulator');
  };

  const handleResumeSpecific = (sim: { inputs: Record<string, unknown> }) => {
    try {
      sessionStorage.setItem(RESUME_SESSION_KEY, JSON.stringify(sim.inputs));
    } catch { /* ignore */ }
    onNavigate('holding-simulator');
  };

  const handleDelete = async () => {
    try { await deleteExpertDossier(dossierId); onBack(); } catch { /* ignore */ }
  };

  const handleDuplicate = async () => {
    try { await duplicateExpertDossier(dossierId); onBack(); } catch { /* ignore */ }
  };

  const handleDeleteSimulation = async (simId: string) => {
    setDeletingSimId(simId);
    try {
      await deleteExpertHoldingSimulation(simId);
      await reload();
    } catch { /* ignore */ }
    setDeletingSimId(null);
  };

  /* ── Génération PDF ── */
  const handleGeneratePdf = async (simId: string) => {
    setRegeneratingSimId(simId);
    try {
      const { generatePdfBlob } = await import('./pdf/generateHoldingPdfBlob');
      const sim = dossier?.simulations.find(s => s.id === simId);
      if (!sim) throw new Error('Simulation introuvable');
      const { pdfBlob, fileName } = await generatePdfBlob(sim);
      const { uploadExpertReport } = await import('../../utils/expertDossiersSupabase');
      await uploadExpertReport(dossierId, simId, pdfBlob, fileName);
      await reload();
    } catch { /* ignore */ }
    setRegeneratingSimId(null);
  };

  const handleDownloadReport = async (report: ExpertGeneratedReport) => {
    try {
      const url = await getExpertReportSignedUrl(report.storagePath);
      window.open(url, '_blank');
    } catch { /* ignore */ }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteExpertReport(reportId);
      await reload();
    } catch { /* ignore */ }
  };

  const reloadReports = async () => {
    setReportsLoading(true);
    try {
      const reps = await getExpertReportsByDossier(dossierId);
      setReports(reps);
    } catch { /* ignore */ }
    setReportsLoading(false);
  };

  /* ── Helper: check if a simulation has a report ── */
  const getReportForSimulation = (simId: string) =>
    reports.find(r => r.simulationId === simId);

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

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{dossier.companyType}</span>
            {dossier.status === 'active' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-600/20 text-emerald-400 border border-emerald-600/30">
                <BadgeCheck className="w-3 h-3" /> Dossier actif
              </span>
            )}
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">{dossier.clientName}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleNewSimulation}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            <Play className="w-4 h-4" /> Nouvelle simulation
          </button>
          {last && (
            <button
              onClick={handleResumeSimulation}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              <FileText className="w-4 h-4" /> Reprendre simulation
            </button>
          )}
          <button onClick={handleDuplicate} className="flex items-center gap-1 px-3 py-2.5 text-slate-500 hover:text-violet-400 hover:bg-violet-600/10 rounded-lg transition-colors text-sm" title="Dupliquer">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1 px-3 py-2.5 text-slate-500 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors text-sm" title="Supprimer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="mb-6 bg-red-950/20 border border-red-900/30 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-red-300">Supprimer définitivement ce dossier et toutes ses simulations ?</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors">Annuler</button>
            <button onClick={handleDelete} className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-500 transition-colors">Supprimer</button>
          </div>
        </div>
      )}

      {/* ── A. Identité société ── */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-400" /> Identité société
        </h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Nom société</span>
              <p className="text-white font-semibold mt-0.5">{dossier.clientName}</p>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Type société</span>
              <p className="text-white font-semibold mt-0.5">{dossier.companyType}</p>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">SIRET</span>
              <p className="text-white font-semibold mt-0.5">{dossier.siret || '—'}</p>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Dirigeant</span>
              <p className="text-white font-semibold mt-0.5">{dossier.managerName || '—'}</p>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Date création</span>
              <p className="text-slate-300 mt-0.5">{fmtDate(dossier.createdAt)}</p>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Dernière modification</span>
              <p className="text-slate-300 mt-0.5">{fmtDate(dossier.updatedAt)}</p>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Statut</span>
              <p className="text-emerald-400 font-semibold mt-0.5">Dossier actif</p>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Simulations</span>
              <p className="text-white font-semibold mt-0.5">{dossier.simulations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── B. Dernière simulation ── */}
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

      {/* ── C. Simulations enregistrées ── */}
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
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Libellé</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Usufruit</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Durée</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Clé</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Flux net A1</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Rend. net</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-center">PDF</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {[...dossier.simulations].reverse().map((sim, i) => {
                  const report = getReportForSimulation(sim.id);
                  const usufruitKey = (sim.inputs as Record<string, unknown>)?.usufruitKeyPercent ?? (sim.inputs as Record<string, unknown>)?.usufruitKey ?? '—';
                  const duration = (sim.inputs as Record<string, unknown>)?.usufruitDuration ?? '—';
                  return (
                    <tr key={sim.id} className={i % 2 === 0 ? 'bg-slate-900/30' : ''}>
                      <td className="py-2.5 px-3 text-slate-400">{fmtDateTime(sim.createdAt)}</td>
                      <td className="py-2.5 px-3 text-slate-300">{sim.label}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{fmtEuro(sim.summary.usufruitAmount)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{String(duration)} ans</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{typeof usufruitKey === 'number' ? usufruitKey + '%' : usufruitKey}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">{fmtEuro(sim.summary.yearOneNetCashFlow)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">{fmtPercent(sim.summary.averageAnnualNetYield)}</td>
                      <td className="py-2.5 px-3 text-center">
                        {report ? (
                          <button onClick={() => handleDownloadReport(report)} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1">
                            <Download className="w-3 h-3" /> PDF disponible
                          </button>
                        ) : (
                          <button onClick={() => handleGeneratePdf(sim.id)} disabled={regeneratingSimId === sim.id}
                            className="text-xs text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1 disabled:opacity-50">
                            {regeneratingSimId === sim.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <FileDown className="w-3 h-3" />
                            )}
                            Générer PDF
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => onViewSimulation(sim.id)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1" title="Voir">
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleResumeSpecific(sim)} className="text-xs text-amber-400 hover:text-amber-300 transition-colors" title="Reprendre">
                            <RefreshCw className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleGeneratePdf(sim.id)} disabled={regeneratingSimId === sim.id}
                            className="text-xs text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50" title="Générer PDF">
                            <FileDown className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteSimulation(sim.id)} disabled={deletingSimId === sim.id}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50" title="Supprimer">
                            {deletingSimId === sim.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* ── D. Documents générés ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileDown className="w-4 h-4 text-violet-400" /> Documents générés
          </h2>
          <button onClick={reloadReports} disabled={reportsLoading}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
            {reportsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Actualiser
          </button>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {reports.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-slate-500">Aucun rapport PDF généré pour ce dossier.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50">
                    <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Fichier</th>
                    <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Type</th>
                    <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Date génération</th>
                    <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {reports.map((r, idx) => (
                    <tr key={r.id} className={idx % 2 === 0 ? 'bg-slate-900/30' : ''}>
                      <td className="py-2.5 px-3 text-slate-300">{r.fileName}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs text-violet-400 font-medium">Rapport Holding IS</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{fmtDate(r.generatedAt)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleDownloadReport(r)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
                            <Download className="w-3 h-3" /> Télécharger
                          </button>
                          {r.simulationId && (
                            <button onClick={() => handleGeneratePdf(r.simulationId!)}
                              disabled={regeneratingSimId === r.simulationId}
                              className="text-xs text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1 disabled:opacity-50">
                              {regeneratingSimId === r.simulationId ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3" />
                              )}
                              Regénérer
                            </button>
                          )}
                          <button onClick={() => handleDeleteReport(r.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Notes cabinet ── */}
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
