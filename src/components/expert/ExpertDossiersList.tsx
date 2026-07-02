import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FolderOpen, Search, Plus, Building2, Calendar, Trash2, Copy, Eye, Play, Loader2, AlertCircle, X, Save } from 'lucide-react';
import {
  getExpertDossiers,
  deleteExpertDossier,
  duplicateExpertDossier,
  createExpertDossier,
} from '../../utils/expertDossiersSupabase';
import type { ExpertClientDossier } from '../../types/expertDossier';

const fmtEuro = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
const fmtPercent = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + '\u202f%';
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const COMPANY_TYPES = ['SAS', 'SARL', 'SCI IS', 'Holding', 'Autre'];

interface ExpertDossiersListProps {
  onNavigate: (section: string) => void;
  onOpenDossier: (dossierId: string) => void;
}

const ExpertDossiersList: React.FC<ExpertDossiersListProps> = ({ onNavigate, onOpenDossier }) => {
  const [dossiers, setDossiers] = useState<ExpertClientDossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Formulaire création
  const [newName, setNewName] = useState('');
  const [newCompanyType, setNewCompanyType] = useState('SAS');
  const [newSiret, setNewSiret] = useState('');
  const [newManager, setNewManager] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getExpertDossiers();
      setDossiers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les dossiers clients.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = useMemo(() => {
    if (!search.trim()) return dossiers;
    const q = search.toLowerCase();
    return dossiers.filter(
      (d) =>
        d.clientName.toLowerCase().includes(q) ||
        d.companyType.toLowerCase().includes(q)
    );
  }, [dossiers, search]);

  const handleDelete = async (id: string) => {
    try {
      await deleteExpertDossier(id);
      setConfirmDelete(null);
      reload();
    } catch {
      // ignore
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateExpertDossier(id);
      reload();
    } catch {
      // ignore
    }
  };

  const resetCreateForm = useCallback(() => {
    setNewName('');
    setNewCompanyType('SAS');
    setNewSiret('');
    setNewManager('');
    setNewNotes('');
    setSaveError('');
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) {
      setSaveError('Le nom de la société cliente est obligatoire.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const dossier = await createExpertDossier({
        clientName: newName.trim(),
        companyType: newCompanyType,
        siret: newSiret.trim() || undefined,
        managerName: newManager.trim() || undefined,
        notes: newNotes.trim() || undefined,
      });
      setShowCreateModal(false);
      resetCreateForm();
      onOpenDossier(dossier.id);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erreur lors de la création.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Modal création (useMemo pour stabiliser la référence JSX, pas de remount) ── */
  const createModal = useMemo(() => {
    if (!showCreateModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">Nouveau dossier client</h2>
            <button
              onClick={() => { setShowCreateModal(false); resetCreateForm(); }}
              className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 space-y-4" onKeyDown={(e) => e.stopPropagation()}>
            {/* Nom société */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Nom de la société cliente <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: SCI Dupont Holding"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-600/50 transition-colors"
              />
            </div>

            {/* Type société */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Type société</label>
              <div className="grid grid-cols-3 gap-1.5">
                {COMPANY_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewCompanyType(t)}
                    className={`px-2 py-1.5 rounded text-[11px] font-medium transition ${
                      newCompanyType === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* SIRET */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                SIRET <span className="text-slate-600 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={newSiret}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 14);
                  setNewSiret(cleaned);
                }}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Ex: 12345678901234"
                maxLength={14}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-600/50 transition-colors"
              />
              {newSiret.length > 0 && newSiret.length < 14 && (
                <p className="text-[10px] text-amber-400 mt-1">
                  SIRET incomplet — 14 chiffres attendus.
                </p>
              )}
            </div>

            {/* Dirigeant */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Nom du dirigeant <span className="text-slate-600 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                value={newManager}
                onChange={(e) => setNewManager(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-600/50 transition-colors"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Notes cabinet <span className="text-slate-600 font-normal">(optionnel)</span>
              </label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Notes internes..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-600/50 transition-colors resize-none"
              />
            </div>

            {saveError && (
              <p className="text-xs text-red-400">{saveError}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-800">
            <button
              onClick={() => { setShowCreateModal(false); resetCreateForm(); }}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Créer le dossier
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }, [showCreateModal, newName, newCompanyType, newSiret, newManager, newNotes, saving, saveError, resetCreateForm, handleCreate]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-8 flex flex-col items-center text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-sm text-red-300 mb-4">{error}</p>
          <button onClick={reload} className="px-4 py-2 bg-red-600/20 text-red-300 rounded-lg text-sm hover:bg-red-600/30 transition-colors">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  /* ── Empty state ── */
  if (dossiers.length === 0 && !search.trim()) {
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
            Lancez une simulation Holding IS puis enregistrez-la dans un dossier client, ou créez directement un dossier.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              Créer un dossier client
            </button>
            <button
              onClick={() => onNavigate('holding-simulator')}
              className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Lancer le simulateur
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-4 max-w-sm">
            Les dossiers sont synchronisés avec votre compte et accessibles depuis n'importe quel appareil.
          </p>
        </div>
        {createModal}
      </div>
    );
  }

  /* ── Liste ── */
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FolderOpen className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Cabinet</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Dossiers clients</h1>
            <p className="text-slate-400 text-sm mt-1">
              Simulations Holding IS enregistrées pour les sociétés clientes.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nouveau dossier client
          </button>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une société ou un dossier..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      {/* Tableau */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <Th>Société cliente</Th>
                <Th>Type société</Th>
                <Th className="text-center">Nb sim.</Th>
                <Th className="text-right">Dernière sim.</Th>
                <Th className="text-right">Effort initial</Th>
                <Th className="text-right">Flux net A1</Th>
                <Th className="text-right">Impact IS A1</Th>
                <Th className="text-right">Rend. moyen</Th>
                <Th>Dernière modif.</Th>
                <Th className="text-center">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((d, i) => {
                const last = d.simulations[d.simulations.length - 1];
                return (
                  <tr
                    key={d.id}
                    className={`group ${i % 2 === 0 ? 'bg-slate-900/30' : ''} hover:bg-blue-600/5 transition-colors`}
                  >
                    <Td>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="text-white font-medium">{d.clientName}</span>
                      </div>
                    </Td>
                    <Td>
                      <span className="text-slate-400">{d.companyType}</span>
                    </Td>
                    <Td align="center">
                      <span className="text-slate-300">{d.simulations.length}</span>
                    </Td>
                    <Td align="right">
                      {last ? (
                        <span className="text-slate-300">{fmtDate(last.createdAt)}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </Td>
                    <Td align="right">
                      {last ? (
                        <span className="text-blue-400 font-medium">{fmtEuro(last.summary.totalCashEffort)}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </Td>
                    <Td align="right">
                      {last ? (
                        <span className={`font-medium ${last.summary.yearOneNetCashFlow >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                          {fmtEuro(last.summary.yearOneNetCashFlow)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </Td>
                    <Td align="right">
                      {last ? (
                        <span className="text-orange-400 font-medium">+{fmtEuro(last.summary.yearOneTaxImpact)}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </Td>
                    <Td align="right">
                      {last ? (
                        <span className="text-emerald-400 font-medium">{fmtPercent(last.summary.averageAnnualNetYield)}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        <span className="text-slate-400">{fmtDate(d.updatedAt)}</span>
                      </div>
                    </Td>
                    <Td align="center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => onOpenDossier(d.id)}
                          title="Ouvrir le dossier"
                          className="p-1.5 rounded text-slate-500 hover:text-blue-400 hover:bg-blue-600/10 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onNavigate('holding-simulator')}
                          title="Nouvelle simulation"
                          className="p-1.5 rounded text-slate-500 hover:text-emerald-400 hover:bg-emerald-600/10 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(d.id)}
                          title="Dupliquer le dossier"
                          className="p-1.5 rounded text-slate-500 hover:text-violet-400 hover:bg-violet-600/10 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(confirmDelete === d.id ? null : d.id)}
                          title="Supprimer le dossier"
                          className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-600/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {confirmDelete === d.id && (
                        <div className="mt-2 flex items-center gap-2 text-[10px]">
                          <span className="text-red-400">Supprimer ?</span>
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
                          >
                            Oui
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                          >
                            Non
                          </button>
                        </div>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && search.trim() && (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-sm">Aucun dossier ne correspond à "{search}".</p>
          </div>
        )}
      </div>

      {createModal}
    </div>
  );
};

/* ── Sub‑components ── */

const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <th className={`py-2.5 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold whitespace-nowrap ${className || ''}`}>
    {children}
  </th>
);

const Td: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' | 'center' }> = ({ children, align = 'left' }) => (
  <td className={`py-2.5 px-3 whitespace-nowrap ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : ''}`}>
    {children}
  </td>
);

export default ExpertDossiersList;
