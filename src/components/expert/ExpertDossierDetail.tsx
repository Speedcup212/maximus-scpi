import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Building2, Calendar, Clock, TrendingUp, Play, FileText,
  ChevronRight, Save, Trash2, Copy, Loader2, AlertCircle, BarChart3,
  FileDown, Download, RefreshCw, BadgeCheck, Hash, User, Archive, ArchiveRestore,
} from 'lucide-react';
import {
  getExpertDossierById, updateExpertDossier, deleteExpertDossier,
  duplicateExpertDossier, deleteExpertHoldingSimulation,
  getExpertReportsByDossier, deleteExpertReport, getExpertReportSignedUrl,
  archiveExpertReport, unarchiveExpertReport, downloadExpertReport,
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
  const [pdfErrors, setPdfErrors] = useState<Record<string, string>>({});
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [archivingIds, setArchivingIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showDeletedReports, setShowDeletedReports] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

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
    setPdfErrors((prev) => {
      const next = { ...prev };
      delete next[simId];
      return next;
    });

    try {
      const sim = dossier?.simulations.find(s => s.id === simId);
      if (!sim) throw new Error('Simulation introuvable');

      const { generatePdfBlob } = await import('./pdf/generateHoldingPdfBlob');
      const { pdfBlob, fileName } = await generatePdfBlob(sim, {
        dossierName: dossier?.clientName,
        includeAdminTestBadge: false,
      });

      const { uploadExpertReport } = await import('../../utils/expertDossiersSupabase');
      const { versionNumber } = await uploadExpertReport(
        dossierId, simId, pdfBlob, fileName,
        sim.inputs as unknown as Record<string, unknown>,
        sim.results as unknown as Record<string, unknown>,
      );

      // Recharger les rapports
      const { getExpertReportsByDossier } = await import('../../utils/expertDossiersSupabase');
      const reps = await getExpertReportsByDossier(dossierId);
      setReports(reps);
      showToast(`PDF v${versionNumber} enregistré dans le dossier.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Impossible de générer le PDF.';
      console.error('[handleGeneratePdf]', err);
      setPdfErrors((prev) => ({ ...prev, [simId]: msg }));
      showToast(msg, 'error');
    } finally {
      setRegeneratingSimId(null);
    }
  };

  const handleDownloadReport = async (report: ExpertGeneratedReport) => {
    setDownloadError(null);
    try {
      await downloadExpertReport(report);
    } catch (err: unknown) {
      console.error('[handleDownloadReport]', err);
      setDownloadError('Impossible de récupérer le lien de téléchargement.');
      setTimeout(() => setDownloadError(null), 4000);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteExpertReport(reportId);
      showToast('Rapport supprimé du dossier.', 'info');
      const reps = await getExpertReportsByDossier(dossierId).catch(() => [] as ExpertGeneratedReport[]);
      setReports(reps);
    } catch (err: unknown) {
      console.error('[handleDeleteReport]', err);
      showToast('Impossible de supprimer le rapport.', 'error');
    }
  };

  const handleArchiveReport = async (reportId: string) => {
    setArchivingIds(prev => new Set(prev).add(reportId));
    try {
      await archiveExpertReport(reportId);
      showToast('Rapport archivé.', 'info');
      const reps = await getExpertReportsByDossier(dossierId).catch(() => [] as ExpertGeneratedReport[]);
      setReports(reps);
    } catch (err: unknown) {
      console.error('[handleArchiveReport]', err);
      showToast('Impossible d\'archiver le rapport.', 'error');
    } finally {
      setArchivingIds(prev => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
    }
  };

  const handleRestoreReport = async (reportId: string) => {
    setArchivingIds(prev => new Set(prev).add(reportId));
    try {
      await unarchiveExpertReport(reportId);
      showToast('Rapport restauré.', 'success');
      const reps = await getExpertReportsByDossier(dossierId).catch(() => [] as ExpertGeneratedReport[]);
      setReports(reps);
    } catch (err: unknown) {
      console.error('[handleRestoreReport]', err);
      showToast('Impossible de restaurer le rapport.', 'error');
    } finally {
      setArchivingIds(prev => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
    }
  };

  const reloadReports = async () => {
    setReportsLoading(true);
    try {
      const reps = await getExpertReportsByDossier(dossierId);
      setReports(reps);
    } catch { /* ignore */ }
    setReportsLoading(false);
  };

  /* ── Helper: trouver le dernier rapport actif pour une simulation ── */
  const getLatestReportForSimulation = (simId: string): ExpertGeneratedReport | undefined => {
    const simReports = reports
      .filter(r => r.simulationId === simId && r.reportStatus !== 'deleted')
      .sort((a, b) => (b.versionNumber || 0) - (a.versionNumber || 0));
    return simReports[0];
  };

  /* ── Helper: compter les rapports actifs pour une simulation ── */
  const getActiveReportCount = (simId: string): number => {
    return reports.filter(r => r.simulationId === simId && r.reportStatus !== 'deleted').length;
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
  const reportCount = reports.length;

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Toast notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg border transition-all ${
          toastMessage.type === 'success' ? 'bg-emerald-950/90 border-emerald-800 text-emerald-300' :
          toastMessage.type === 'error' ? 'bg-red-950/90 border-red-800 text-red-300' :
          'bg-blue-950/90 border-blue-800 text-blue-300'
        }`}>
          {toastMessage.text}
        </div>
      )}
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
            <KpiCard label="Rend. cash-flow" value={fmtPercent(last.summary.cashFlowAverageReturn ?? last.summary.averageAnnualNetYield)} color="amber" />
            <KpiCard label="Cash-flow cumulé" value={fmtEuro(last.summary.cumulativeNetCashFlow)} color="emerald" />
            {last.summary.gainNetAfterUsufructExtinction !== undefined && (
              <KpiCard label="Gain net extinction" value={fmtEuro(last.summary.gainNetAfterUsufructExtinction)} color="emerald" />
            )}
            {last.summary.annualizedSimpleReturnAfterExtinction !== undefined && (
              <KpiCard label="Rend. après extinction" value={fmtPercent(last.summary.annualizedSimpleReturnAfterExtinction)} color="emerald" />
            )}
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
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Rend. cash-flow</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-center">PDF</th>
                  <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {[...dossier.simulations].reverse().map((sim, i) => {
                  const report = getReportForSimulation(sim.id);
                  const pdfErr = pdfErrors[sim.id];
                  const isGenerating = regeneratingSimId === sim.id;
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
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">{fmtPercent(sim.summary.cashFlowAverageReturn ?? sim.summary.averageAnnualNetYield)}</td>
                      <td className="py-2.5 px-3 text-center">
                        {(() => {
                          const latestReport = getLatestReportForSimulation(sim.id);
                          if (isGenerating) {
                            return (
                              <span className="text-xs text-violet-400 inline-flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" /> Génération...
                              </span>
                            );
                          }
                          if (latestReport) {
                            return (
                              <div className="flex items-center justify-center gap-1.5">
                                <button onClick={() => handleDownloadReport(latestReport)}
                                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1">
                                  <Download className="w-3 h-3" /> PDF v{latestReport.versionNumber || 1}
                                </button>
                              </div>
                            );
                          }
                          return (
                            <div>
                              <button onClick={() => handleGeneratePdf(sim.id)}
                                className="text-xs text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1">
                                <FileDown className="w-3 h-3" /> Générer PDF
                              </button>
                              {pdfErr && (
                                <p className="text-[10px] text-red-400 mt-0.5 max-w-[120px] leading-tight">{pdfErr}</p>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => onViewSimulation(sim.id)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1" title="Voir">
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleResumeSpecific(sim)} className="text-xs text-amber-400 hover:text-amber-300 transition-colors" title="Reprendre">
                            <RefreshCw className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleGeneratePdf(sim.id)} disabled={isGenerating}
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
            {reportCount > 0 && (
              <span className="text-[10px] text-slate-500 font-normal ml-1">({reportCount})</span>
            )}
          </h2>
          <div className="flex items-center gap-3">
            <button onClick={reloadReports} disabled={reportsLoading}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
              {reportsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Actualiser
            </button>
            {reports.length > 0 && (
              <button
                onClick={async () => {
                  try {
                    const { exportReportsCsv } = await import('../../utils/expertDossiersSupabase');
                    const blob = await exportReportsCsv(reports);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    const safeName = dossier.clientName.replace(/[^a-zA-Z0-9]/g, '-');
                    const date = new Date().toISOString().slice(0, 10);
                    a.download = `historique-pdf-${safeName}-${date}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch { /* ignore */ }
                }}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Exporter historique CSV
              </button>
            )}
          </div>
        </div>
        {downloadError && (
          <p className="text-[10px] text-red-400 mb-3">{downloadError}</p>
        )}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {reports.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-slate-500">Aucun rapport PDF généré pour ce dossier.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50">
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold w-16">Version</th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Document</th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Date</th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Simulation</th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Statut</th>
                      <th className="py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {reports.map((r, idx) => (
                      <tr key={r.id} className={idx % 2 === 0 ? 'bg-slate-900/30' : ''}>
                        <td className="py-2.5 px-3">
                          <span className="text-xs font-mono text-violet-400 font-semibold">v{r.versionNumber || 1}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{r.fileName}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded ${
                            r.reportStatus === 'archived' ? 'bg-amber-950/30 text-amber-400' :
                            r.reportStatus === 'deleted' ? 'bg-red-950/30 text-red-400' :
                            'bg-emerald-950/30 text-emerald-400'
                          }`}>
                            {r.reportStatus === 'archived' ? 'Archivé' : r.reportStatus === 'deleted' ? 'Supprimé' : 'Actif'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">{fmtDateTime(r.generatedAt)}</td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {r.simulationId
                            ? dossier.simulations.find(s => s.id === r.simulationId)?.label || r.simulationId.slice(0, 8) + '...'
                            : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleDownloadReport(r)}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                              title="Télécharger">
                              <Download className="w-3 h-3" /> Télécharger
                            </button>
                            {r.reportStatus === 'archived' ? (
                              <button onClick={() => handleRestoreReport(r.id)}
                                disabled={archivingIds.has(r.id)}
                                className="text-xs text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                                title="Restaurer">
                                {archivingIds.has(r.id) ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ArchiveRestore className="w-3 h-3" />
                                )}
                                Restaurer
                              </button>
                            ) : (
                              <button onClick={() => handleArchiveReport(r.id)}
                                disabled={archivingIds.has(r.id)}
                                className="text-xs text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                                title="Archiver">
                                {archivingIds.has(r.id) ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Archive className="w-3 h-3" />
                                )}
                                Archiver
                              </button>
                            )}
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
              {reports.length > 0 && (
                <div className="px-4 py-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={async () => {
                      try {
                        const { exportReportsCsv } = await import('../../utils/expertDossiersSupabase');
                        const blob = await exportReportsCsv(reports);
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        const safeName = dossier.clientName.replace(/[^a-zA-Z0-9]/g, '-');
                        const date = new Date().toISOString().slice(0, 10);
                        a.download = `historique-pdf-${safeName}-${date}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch { /* ignore */ }
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Exporter historique CSV
                  </button>
                </div>
              )}
            </>
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
