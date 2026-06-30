import { useState, useCallback, useEffect, lazy, Suspense, type ReactNode } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  BarChart3,
  Eye,
  Star,
  Video,
  ChevronDown,
  Plus,
  Shield,
  Building2,
  Users,
  TrendingUp,
  Menu,
  X,
  Clock,
  Play,
  Link2,
  Calculator,
  Scale,
  Wallet,
  Landmark,
  Layers,
  RefreshCw,
  Coins,
  UserCheck,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Info,
  Trash2,
  PieChart,
  type LucideIcon,
} from 'lucide-react';
import KpiCard from './KpiCard';
import ScpiFavorites from './ScpiFavorites';
import ScpiSignals from './ScpiSignals';
import ProFintechComparator from '../fintech/ProFintechComparator';
import ProRapports from './ProRapports';
import ProSettings from './ProSettings';
import { getFavoriteScpiIds } from '../../utils/proFavorites';
import { SCPIExtended } from '../../data/scpiDataExtended';
import ProSimulator from './ProSimulator';

/* ── Lazy imports des simulateurs publics ── */
const ScpiNetIncomeSimulator = lazy(() => import('../ScpiNetIncomeSimulator'));
const ScpiCreditSimulator = lazy(() => import('../ScpiCreditSimulator'));
const ScpiDemembrementSimulator = lazy(() => import('../ScpiDemembrementSimulator'));
const InvestorProfileSimulator = lazy(() => import('../InvestorProfileSimulator'));
const SimulateurTresorerieIS = lazy(() => import('../../pages/SimulateurTresorerieIS'));
const SimulateurImpactFiscal = lazy(() => import('../../pages/SimulateurImpactFiscal'));
const LifeToScpiPage = lazy(() => import('../LifeToScpiPage'));
const ScpiEnvelopeComparator = lazy(() => import('../ScpiEnvelopeComparator'));
const ComparateurDemembrementScpi = lazy(() => import('../ComparateurDemembrementScpi'));

/* ── Types / Constantes pour le hub simulateurs ── */
type ProSimulatorView =
  | 'hub'
  | 'allocation'
  | 'revenus-nets'
  | 'credit'
  | 'demembrement'
  | 'fiscalite'
  | 'tresorerie-is'
  | 'profil-investisseur'
  | 'fonds-euros'
  | 'enveloppes'
  | 'demembrement-comparateur';

interface SimulatorCard {
  title: string;
  description: string;
  simulatorKey: ProSimulatorView;
  cta: string;
  badge?: string;
  Icon: LucideIcon;
}

/* ──────────────────────────────────────────
   Types
   ────────────────────────────────────────── */

type ProSection = 'dashboard' | 'dossiers' | 'livrables' | 'comparateur' | 'simulateurs' | 'scpi-suivies' | 'scpi-preferees' | 'videos' | 'rapports' | 'settings';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  section: ProSection;
  badge?: number;
}

type DossierStatus = 'Analyse en cours' | 'Sélection terminée' | 'Livrable prêt' | 'En attente client';
type ClientType = 'Particulier' | 'Couple' | 'SCI' | 'Société' | 'Holding';

interface ProDossier {
  id: string;
  name: string;
  clientType: ClientType;
  clientReference: string;
  advisor: string;
  amount: number;
  objective: string;
  horizon: string;
  envelope: string;
  status: DossierStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
}

/* ──────────────────────────────────────────
   Constantes
   ────────────────────────────────────────── */

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', section: 'dashboard' },
  { icon: FolderOpen, label: 'Dossiers', section: 'dossiers', badge: 3 },
  { icon: FileText, label: 'Livrables', section: 'livrables' },
  { icon: BarChart3, label: 'Comparateur', section: 'comparateur' },
  { icon: Calculator, label: 'Simulateurs', section: 'simulateurs' },
  { icon: Star, label: 'SCPI préférées', section: 'scpi-preferees' },
  { icon: Video, label: 'Vidéos', section: 'videos' },
  { icon: Link2, label: 'Mes liens clients', section: 'rapports' },
  { icon: Building2, label: 'Mon cabinet', section: 'settings' },
];

/* ── Dossiers par défaut (seed localStorage) ── */
const DOSSIERS_KEY = 'maximus_pro_dossiers';

function generateId(): string {
  return 'dossier_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function defaultProDossiers(): ProDossier[] {
  return [
    { id: 'seed-1', name: 'Retraite Mme Bernard', clientType: 'Particulier', clientReference: '', advisor: 'Eric B.', amount: 80000, objective: 'Revenus complémentaires', horizon: '8 à 12 ans', envelope: 'Assurance-vie', status: 'Livrable prêt', note: '', createdAt: '2026-06-03', updatedAt: '2026-06-03' },
    { id: 'seed-2', name: 'Dossier Martin', clientType: 'Couple', clientReference: '', advisor: 'Eric B.', amount: 120000, objective: 'Diversification patrimoniale', horizon: '5 à 8 ans', envelope: 'Direct', status: 'Sélection terminée', note: '', createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10) },
    { id: 'seed-3', name: 'SCI Dupont', clientType: 'SCI', clientReference: '', advisor: 'Eric B.', amount: 300000, objective: 'Capitalisation long terme', horizon: 'Plus de 12 ans', envelope: 'SCI IS', status: 'Analyse en cours', note: '', createdAt: new Date(Date.now() - 86400000).toISOString().slice(0, 10), updatedAt: new Date(Date.now() - 86400000).toISOString().slice(0, 10) },
  ];
}

function loadDossiers(): ProDossier[] {
  try {
    const raw = localStorage.getItem(DOSSIERS_KEY);
    if (!raw) return defaultProDossiers();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultProDossiers();
    return parsed as ProDossier[];
  } catch {
    return defaultProDossiers();
  }
}

function saveDossiers(dossiers: ProDossier[]): void {
  try {
    localStorage.setItem(DOSSIERS_KEY, JSON.stringify(dossiers));
  } catch { /* quota exceeded, ignore */ }
}

const statusStyle = (status: DossierStatus) => {
  switch (status) {
    case 'Livrable prêt':
      return 'text-blue-400 bg-blue-500/10';
    case 'Sélection terminée':
      return 'text-emerald-400 bg-emerald-500/10';
    case 'Analyse en cours':
      return 'text-amber-400 bg-amber-500/10';
    case 'En attente client':
      return 'text-purple-400 bg-purple-500/10';
  }
};

function getInitials(name: string): string {
  return name.split(' ').filter(w => w.length > 1).slice(0, 2).map(w => w[0].toUpperCase()).join('') || name.slice(0, 2).toUpperCase();
}

function formatDateFR(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatAmount(v: number): string {
  return v.toLocaleString('fr-FR') + ' €';
}

const sectionLabel: Record<ProSection, string> = {
  'dashboard': 'Dashboard',
  'dossiers': 'Dossiers en cours',
  'livrables': 'Livrables',
  'comparateur': 'Comparateur SCPI',
  'simulateurs': 'Simulateurs',
  'scpi-suivies': 'SCPI suivies',
  'scpi-preferees': 'SCPI préférées',
  'videos': 'Vidéos',
  'rapports': 'Mes liens clients',
  'settings': 'Mon cabinet',
};

/* ──────────────────────────────────────────
   Sections de contenu
   ────────────────────────────────────────── */

interface DashboardHomeProps {
  onNavigate: (section: ProSection) => void;
  onAnalyzeScpi?: (scpi: SCPIExtended) => void;
  onCompareScpi?: (scpi: SCPIExtended) => void;
}

function DashboardHome({ onNavigate, onAnalyzeScpi, onCompareScpi }: DashboardHomeProps) {
  const [dossierModal, setDossierModal] = useState<ProDossier | null>(null);
  const [dossiers] = useState<ProDossier[]>(() => loadDossiers());

  return (
    <>
      {/* ═══════════════════════════════════════
          HEADER
          ═══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest mb-1">
            Dashboard
          </p>
          <h1 className="text-lg sm:text-2xl font-bold text-white">
            Bonjour, Eric.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Votre poste de pilotage MaximusSCPI Pro.
          </p>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5">
            3 dossiers actifs{' '}
            <span className="text-slate-600">·</span>{' '}
            <span className="text-emerald-400 font-medium">1 livrable prêt à envoyer</span>{' '}
            <span className="text-slate-600">·</span>{' '}
            données juin 2026
          </p>
          <p className="text-[9px] sm:text-[10px] text-slate-600 mt-1.5 italic">
            Outil d&rsquo;aide à la décision — le conseil final reste sous votre responsabilité professionnelle.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => onNavigate('dossiers')}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Nouveau dossier
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          KPI CARDS
          ═══════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <KpiCard icon={TrendingUp} badge="+3 ce mois" value={64} label="SCPI analysées" accent="emerald" />
        <KpiCard icon={FolderOpen} badge="1 livrable prêt" value={3} label="Dossiers actifs" accent="blue" />
        <KpiCard icon={FileText} badge="+4 vs T1" value={12} label="Supports générés · T2 2026" accent="amber" />
      </div>

      {/* ═══════════════════════════════════════
          ACTIONS RAPIDES
          ═══════════════════════════════════════ */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Actions rapides
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('dossiers')}
            className="flex flex-col items-center gap-1.5 p-3 bg-slate-800/60 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors text-slate-300 hover:text-white group"
          >
            <FolderOpen className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
            <span className="text-[10px] sm:text-xs font-medium">Créer un dossier client</span>
          </button>
          <button
            onClick={() => onNavigate('comparateur')}
            className="flex flex-col items-center gap-1.5 p-3 bg-slate-800/60 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors text-slate-300 hover:text-white group"
          >
            <BarChart3 className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
            <span className="text-[10px] sm:text-xs font-medium">Comparer des SCPI</span>
          </button>
          <button
            onClick={() => onNavigate('simulateurs')}
            className="flex flex-col items-center gap-1.5 p-3 bg-slate-800/60 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors text-slate-300 hover:text-white group"
          >
            <Calculator className="w-5 h-5 text-amber-400 group-hover:text-amber-300" />
            <span className="text-[10px] sm:text-xs font-medium">Ouvrir les simulateurs</span>
          </button>
          <button
            onClick={() => onNavigate('scpi-preferees')}
            className="flex flex-col items-center gap-1.5 p-3 bg-slate-800/60 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors text-slate-300 hover:text-white group"
          >
            <Star className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
            <span className="text-[10px] sm:text-xs font-medium">Gérer mes SCPI préférées</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          DOSSIERS EN COURS (aperçu)
          ═══════════════════════════════════════ */}
      <DossiersTable
        dossiers={dossiers}
        compact
        onOpenDossier={(d) => setDossierModal(d)}
        onViewAll={() => onNavigate('dossiers')}
        onCreateDossier={() => onNavigate('dossiers')}
      />

      {/* ═══════════════════════════════════════
          COMPARAISON SCPI (aperçu dashboard)
          ═══════════════════════════════════════ */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            Comparaison SCPI
          </h3>
        </div>
        <div className="text-center py-6 sm:py-8">
          <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-medium text-slate-300 mb-1">Aucune comparaison en cours</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Sélectionnez jusqu&rsquo;à 6 SCPI depuis le comparateur Pro pour préparer une analyse comparative.
          </p>
          <button
            onClick={() => onNavigate('comparateur')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Comparer des SCPI
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SCPI PRÉFÉRÉES (aperçu dashboard)
          ═══════════════════════════════════════ */}
      <ScpiFavorites
        onNavigateToComparator={() => onNavigate('comparateur')}
        onAnalyzeScpi={onAnalyzeScpi}
      />

      {/* ═══════════════════════════════════════
          SIGNAUX SCPI
          ═══════════════════════════════════════ */}
      <div>
        <ScpiSignals />
        <p className="text-[9px] text-slate-600 mt-1.5 leading-relaxed">
          Données indicatives à vérifier avant usage client.
        </p>
      </div>

      {/* ═══════════════════════════════════════
          CADRE D'UTILISATION
          ═══════════════════════════════════════ */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 sm:p-4">
        <h4 className="text-[11px] font-semibold text-slate-400 mb-1.5">Cadre d&rsquo;utilisation</h4>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          MaximusSCPI Pro centralise des indicateurs, comparaisons et supports pédagogiques.
          L&rsquo;outil ne remplace pas l&rsquo;analyse réglementaire du conseiller et ne constitue pas une recommandation personnalisée.
        </p>
      </div>

      {/* ═══════════════════════════════════════
          MODALE DÉTAIL DOSSIER
          ═══════════════════════════════════════ */}
      {dossierModal && (
        <DossierDetailModal
          dossier={dossierModal}
          onClose={() => setDossierModal(null)}
          onEdit={() => onNavigate('dossiers')}
          onDelete={() => { /* handled in DossiersFull */ setDossierModal(null); }}
        />
      )}
    </>
  );
}

function DossiersTable({ dossiers, onOpenDossier, onViewAll, onCreateDossier, compact }: {
  dossiers: ProDossier[];
  onOpenDossier: (dossier: ProDossier) => void;
  onViewAll: () => void;
  onCreateDossier: () => void;
  compact?: boolean;
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-slate-400" />
          Dossiers en cours
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateDossier}
            className="text-[10px] sm:text-xs px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Nouveau
          </button>
          {compact && (
            <button
              onClick={onViewAll}
              className="text-[10px] sm:text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Voir tout →
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-[600px] w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
              <th className="text-left py-2.5 px-3 font-medium">Client / dossier</th>
              {!compact && <th className="text-left py-2.5 px-3 font-medium hidden sm:table-cell">Type</th>}
              <th className="text-right py-2.5 px-3 font-medium">Montant</th>
              {!compact && <th className="text-left py-2.5 px-3 font-medium hidden md:table-cell">Objectif</th>}
              <th className="text-center py-2.5 px-3 font-medium">Statut</th>
              <th className="text-right py-2.5 px-3 font-medium hidden sm:table-cell">Date</th>
              <th className="py-2.5 px-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {dossiers.map((d) => (
              <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                      {getInitials(d.name)}
                    </div>
                    <span className="text-white font-medium truncate">{d.name}</span>
                  </div>
                </td>
                {!compact && <td className="py-3 px-3 text-slate-500 hidden sm:table-cell whitespace-nowrap">{d.clientType}</td>}
                <td className="py-3 px-3 text-right">
                  <span className="text-white font-semibold whitespace-nowrap">{formatAmount(d.amount)}</span>
                </td>
                {!compact && <td className="py-3 px-3 text-slate-400 hidden md:table-cell truncate max-w-[120px]">{d.objective}</td>}
                <td className="py-3 px-3 text-center">
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${statusStyle(d.status)}`}>
                    {d.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-slate-500 hidden sm:table-cell whitespace-nowrap">
                  {formatDateFR(d.updatedAt)}
                </td>
                <td className="py-3 px-1">
                  <button
                    onClick={() => onOpenDossier(d)}
                    className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Ouvrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Constantes pour les formulaires ── */
const CLIENT_TYPES: ClientType[] = ['Particulier', 'Couple', 'SCI', 'Société', 'Holding'];
const OBJECTIFS = ['Revenus complémentaires', 'Diversification patrimoniale', 'Capitalisation long terme', 'Fiscalité / optimisation', 'Transmission', 'Trésorerie société', 'Démembrement'];
const HORIZONS = ['3 à 5 ans', '5 à 8 ans', '8 à 12 ans', 'Plus de 12 ans'];
const ENVELOPPES = ['Direct', 'Assurance-vie', 'SCI IR', 'SCI IS', 'Société IS', 'Nue-propriété', 'À définir'];
const STATUTS: DossierStatus[] = ['Analyse en cours', 'Sélection terminée', 'Livrable prêt', 'En attente client'];

function CreateDossierModal({ onSave, onClose, initial }: {
  onSave: (data: Omit<ProDossier, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  initial?: ProDossier | null;
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? '');
  const [clientType, setClientType] = useState<ClientType>(initial?.clientType ?? 'Particulier');
  const [clientReference, setClientReference] = useState(initial?.clientReference ?? '');
  const [advisor] = useState(initial?.advisor ?? 'Eric B.');
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '');
  const [amountError, setAmountError] = useState('');
  const [objective, setObjective] = useState(initial?.objective ?? '');
  const [horizon, setHorizon] = useState(initial?.horizon ?? '');
  const [envelope, setEnvelope] = useState(initial?.envelope ?? 'À définir');
  const [status, setStatus] = useState<DossierStatus>(initial?.status ?? 'Analyse en cours');
  const [note, setNote] = useState(initial?.note ?? '');

  const isValid = name.trim().length > 0 && clientType && amount && Number(amount) > 0 && objective && horizon;

  const handleSubmit = () => {
    if (!isValid) return;
    const amt = Number(amount);
    if (amt <= 0) { setAmountError('Le montant doit être supérieur à 0.'); return; }
    setAmountError('');
    onSave({ name: name.trim(), clientType, clientReference: clientReference.trim(), advisor, amount: amt, objective, horizon, envelope, status, note: note.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">{isEdit ? 'Modifier' : 'Nouveau dossier'}</span>
            <h2 className="text-lg font-bold text-white mt-1">{isEdit ? name || 'Dossier' : 'Nouveau dossier client'}</h2>
            {!isEdit && <p className="text-xs text-slate-500 mt-0.5">Créez un espace de travail pour analyser, comparer et préparer vos supports client.</p>}
          </div>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-800"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
          {/* Bloc A — Identification */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Identification du dossier</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Nom du dossier <span className="text-red-400">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Retraite Mme Bernard" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Type de client <span className="text-red-400">*</span></label>
                <select value={clientType} onChange={(e) => setClientType(e.target.value as ClientType)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition">
                  {CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Référence interne</label>
                <input type="text" value={clientReference} onChange={(e) => setClientReference(e.target.value)} placeholder="Ex : CLI-2026-014" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">CGP en charge</label>
                <input type="text" value={advisor} disabled className="w-full px-3 py-2 bg-slate-800/40 border border-slate-700 rounded-lg text-sm text-slate-400 cursor-not-allowed" />
              </div>
            </div>
          </div>

          {/* Bloc B — Projet patrimonial */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Projet patrimonial</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Montant envisagé <span className="text-red-400">*</span></label>
                <input type="text" inputMode="numeric" value={amount} onChange={(e) => { setAmount(e.target.value); setAmountError(''); }} placeholder="Ex : 80000" className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${amountError ? 'border-red-500' : 'border-slate-700'}`} />
                {amountError && <p className="text-[10px] text-red-400 mt-1">{amountError}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Objectif principal <span className="text-red-400">*</span></label>
                <select value={objective} onChange={(e) => setObjective(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition">
                  <option value="">— Sélectionner —</option>
                  {OBJECTIFS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Horizon d'investissement <span className="text-red-400">*</span></label>
                <select value={horizon} onChange={(e) => setHorizon(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition">
                  <option value="">— Sélectionner —</option>
                  {HORIZONS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Enveloppe envisagée</label>
                <select value={envelope} onChange={(e) => setEnvelope(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition">
                  {ENVELOPPES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Bloc C — Statut */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Statut du dossier</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Statut initial <span className="text-red-400">*</span></label>
                <select value={status} onChange={(e) => setStatus(e.target.value as DossierStatus)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition">
                  {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Note interne</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Points d'attention, contraintes client, prochaine action…" rows={2} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors">Annuler</button>
          <button onClick={handleSubmit} disabled={!isValid} className={`px-5 py-2 text-xs font-medium rounded-lg transition-colors ${isValid ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
            {isEdit ? 'Enregistrer les modifications' : 'Créer le dossier'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DossiersFull() {
  const [allDossiers, setAllDossiers] = useState<ProDossier[]>(loadDossiers);
  const [detailDossier, setDetailDossier] = useState<ProDossier | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<ProDossier | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleCreateDossier = (data: Omit<ProDossier, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().slice(0, 10);
    const newDossier: ProDossier = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const updated = [newDossier, ...allDossiers];
    setAllDossiers(updated);
    saveDossiers(updated);
    setShowCreate(false);
    showToast('Dossier créé avec succès.');
  };

  const handleSaveEdit = (data: Omit<ProDossier, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!showEdit) return;
    const now = new Date().toISOString().slice(0, 10);
    const updatedDossier: ProDossier = { ...data, id: showEdit.id, createdAt: showEdit.createdAt, updatedAt: now };
    const updated = allDossiers.map(d => d.id === showEdit.id ? updatedDossier : d);
    setAllDossiers(updated);
    saveDossiers(updated);
    setShowEdit(null);
    setDetailDossier(updatedDossier);
    showToast('Dossier mis à jour.');
  };

  const handleDeleteDossier = (id: string) => {
    if (!window.confirm('Supprimer ce dossier ? Cette action est locale à votre navigateur.')) return;
    const updated = allDossiers.filter(d => d.id !== id);
    setAllDossiers(updated);
    saveDossiers(updated);
    setDetailDossier(null);
    showToast('Dossier supprimé.');
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-white mb-1">Dossiers en cours</h1>
          <p className="text-xs text-slate-400">{allDossiers.length} dossier{allDossiers.length > 1 ? 's' : ''} actif{allDossiers.length > 1 ? 's' : ''} — gérez vos analyses en cours.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Nouveau dossier
        </button>
      </div>

      {allDossiers.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center">
          <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-1">Aucun dossier</p>
          <p className="text-slate-600 text-xs mb-4">Créez votre premier dossier client.</p>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Nouveau dossier
          </button>
        </div>
      ) : (
        <DossiersTable
          dossiers={allDossiers}
          onOpenDossier={(d) => setDetailDossier(d)}
          onViewAll={() => {}}
          onCreateDossier={() => setShowCreate(true)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-lg animate-pulse-once">
          {toast}
        </div>
      )}

      {detailDossier && (
        <DossierDetailModal
          dossier={detailDossier}
          onClose={() => setDetailDossier(null)}
          onEdit={() => { setShowEdit(detailDossier); setDetailDossier(null); }}
          onDelete={() => handleDeleteDossier(detailDossier.id)}
        />
      )}

      {showCreate && (
        <CreateDossierModal
          onSave={handleCreateDossier}
          onClose={() => setShowCreate(false)}
        />
      )}

      {showEdit && (
        <CreateDossierModal
          initial={showEdit}
          onSave={handleSaveEdit}
          onClose={() => setShowEdit(null)}
        />
      )}

      {/* Compliance */}
      <div className="mt-6 bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 sm:p-4">
        <h4 className="text-[11px] font-semibold text-slate-400 mb-1.5">Cadre d&rsquo;utilisation</h4>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Support d&rsquo;aide à la décision — le conseil final, la vérification réglementaire et la documentation client restent sous la responsabilité du CGP.
        </p>
      </div>
    </>
  );
}

function DossierDetailModal({ dossier, onClose, onEdit, onDelete }: {
  dossier: ProDossier;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const nextAction = dossier.status === 'Livrable prêt'
    ? 'Envoyer le livrable au client'
    : dossier.status === 'Sélection terminée'
      ? 'Finaliser le rapport de sélection'
      : dossier.status === 'Analyse en cours'
        ? 'Poursuivre l\'analyse comparative'
        : 'Relancer le client';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Détail dossier</span>
            <h2 className="text-lg font-bold text-white mt-1">{dossier.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Créé le {formatDateFR(dossier.createdAt)} · Mis à jour le {formatDateFR(dossier.updatedAt)}</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-800"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Type de client</p>
              <p className="text-sm font-bold text-white">{dossier.clientType}</p>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">CGP en charge</p>
              <p className="text-sm font-bold text-white">{dossier.advisor}</p>
            </div>
            {dossier.clientReference && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Référence</p>
                <p className="text-sm font-bold text-white">{dossier.clientReference}</p>
              </div>
            )}
            <div className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Montant</p>
              <p className="text-sm font-bold text-white">{formatAmount(dossier.amount)}</p>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Objectif</p>
              <p className="text-sm font-bold text-white">{dossier.objective}</p>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Horizon</p>
              <p className="text-sm font-bold text-white">{dossier.horizon}</p>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Enveloppe</p>
              <p className="text-sm font-bold text-white">{dossier.envelope}</p>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Statut</p>
              <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-medium ${statusStyle(dossier.status)}`}>{dossier.status}</span>
            </div>
          </div>
          {dossier.note && (
            <div className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Note interne</p>
              <p className="text-xs text-slate-300 leading-relaxed">{dossier.note}</p>
            </div>
          )}
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
            <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-1">Prochaine action recommandée</p>
            <p className="text-xs text-amber-300/80">{nextAction}</p>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-3">
          <button onClick={onEdit} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors">Modifier</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-colors">Fermer</button>
          <button onClick={onDelete} className="p-2.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-950/30" title="Supprimer"><Trash2 className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}

function ScpiSuiviesContent() {
  return (
    <>
      <h1 className="text-lg sm:text-2xl font-bold text-white mb-1">SCPI suivies</h1>
      <p className="text-xs text-slate-400 mb-4 sm:mb-6">Surveillez les SCPI qui vous intéressent.</p>
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center">
        <Eye className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm mb-1">Aucune SCPI suivie</p>
        <p className="text-slate-600 text-xs">Ajoutez des SCPI à votre liste de suivi depuis le comparateur.</p>
      </div>
    </>
  );
}

function VideosContent() {
  const videos = [
    { title: 'Introduction aux SCPI', duration: '12 min', date: 'Juin 2026' },
    { title: 'Analyser un DIC', duration: '8 min', date: 'Mai 2026' },
    { title: 'Construire un portefeuille diversifié', duration: '15 min', date: 'Avril 2026' },
    { title: 'Fiscalité des SCPI étrangères', duration: '10 min', date: 'Mars 2026' },
  ];

  return (
    <>
      <h1 className="text-lg sm:text-2xl font-bold text-white mb-1">Vidéos</h1>
      <p className="text-xs text-slate-400 mb-4 sm:mb-6">Contenus pédagogiques pour vous et vos clients.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {videos.map((v) => (
          <div key={v.title} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors cursor-pointer group">
            <div className="w-full h-32 bg-slate-800 rounded-lg mb-3 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
              <Play className="w-8 h-8 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="text-sm font-medium text-white mb-1 truncate">{v.title}</h3>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{v.duration}</span>
              <span className="text-slate-700">·</span>
              <span>{v.date}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ──────────────────────────────────────────
   ProSimulatorHub — page hub des simulateurs
   ────────────────────────────────────────── */

const BLOC_PRODUCTION: SimulatorCard[] = [
  {
    title: 'Allocation client SCPI',
    description: 'Calculez l\'allocation, le nombre de parts, le montant réellement souscrit et le cash restant.',
    simulatorKey: 'allocation',
    cta: 'Lancer l\'allocation',
    Icon: PieChart,
  },
  {
    title: 'Fiscalité SCPI',
    description: 'Estimez l\'impact fiscal des revenus SCPI selon la TMI du client.',
    simulatorKey: 'fiscalite',
    cta: 'Lancer le simulateur',
    Icon: Calculator,
  },
  {
    title: 'Revenus nets SCPI (IR)',
    description: 'Estimez les revenus réels du client après fiscalité.',
    simulatorKey: 'revenus-nets',
    cta: 'Lancer le simulateur',
    Icon: Wallet,
  },
  {
    title: 'SCPI à crédit',
    description: 'Mesurez l\'effet de levier et le cash-flow d\'un achat à crédit.',
    simulatorKey: 'credit',
    cta: 'Lancer le simulateur',
    Icon: Landmark,
  },
  {
    title: 'Démembrement',
    description: 'Comprenez l\'intérêt potentiel de la nue-propriété selon l\'horizon du client.',
    simulatorKey: 'demembrement',
    cta: 'Lancer le simulateur',
    Icon: Scale,
  },
  {
    title: 'Trésorerie IS – SCPI',
    description: 'Projection de trésorerie nette à l\'impôt sur les sociétés.',
    simulatorKey: 'tresorerie-is',
    cta: 'Lancer le simulateur',
    Icon: Coins,
  },
];

const BLOC_ARBITRAGES: SimulatorCard[] = [
  {
    title: 'Fonds euros vs SCPI',
    description: 'Comparatif de réallocation entre fonds euros et SCPI.',
    simulatorKey: 'fonds-euros',
    cta: 'Lancer le simulateur',
    Icon: Layers,
  },
  {
    title: 'Comparateur d\'enveloppes',
    description: 'Direct, assurance-vie ou SCI à l\'IS : comparez les enveloppes de détention.',
    simulatorKey: 'enveloppes',
    cta: 'Ouvrir le comparateur',
    Icon: Layers,
  },
  {
    title: 'Comparateur démembrement',
    description: 'Pleine propriété vs nue-propriété vs usufruit.',
    simulatorKey: 'demembrement-comparateur',
    cta: 'Ouvrir le comparateur',
    Icon: RefreshCw,
  },
];

const BLOC_PROFIL: SimulatorCard[] = [
  {
    title: 'Questionnaire investisseur complet',
    description: 'Évaluez le profil, l\'horizon, les connaissances financières et la tolérance au risque.',
    simulatorKey: 'profil-investisseur',
    cta: 'Démarrer le questionnaire',
    badge: '32 questions',
    Icon: UserCheck,
  },
  {
    title: 'Quiz SCPI rapide',
    description: 'Première orientation selon fiscalité, horizon et objectif patrimonial.',
    simulatorKey: 'profil-investisseur',
    cta: 'Faire le quiz rapide',
    badge: 'Version rapide',
    Icon: Sparkles,
  },
];

function ProSimulatorHub({ onLaunch }: {
  onLaunch: (key: ProSimulatorView) => void;
}) {
  const renderCard = (card: SimulatorCard) => (
    <div
      key={card.title}
      className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-emerald-500/40 hover:bg-slate-900 transition"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
          <card.Icon className="w-5 h-5" />
        </div>
        {card.badge && (
          <span className="inline-flex items-center rounded-full bg-blue-500/10 text-blue-400 px-2 py-0.5 text-[10px] font-semibold">
            {card.badge}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-100">{card.title}</h3>
      <p className="mt-1.5 text-xs text-slate-400 flex-1">{card.description}</p>
      <button
        type="button"
        onClick={() => onLaunch(card.simulatorKey)}
        className="mt-4 inline-flex items-center gap-1.5 self-start rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
      >
        {card.cta}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Simulateurs</h1>
        <p className="text-sm text-slate-400 mt-1">
          Tous les outils de simulation disponibles pour préparer vos dossiers clients.
        </p>
      </div>

      {/* Bloc 1 — Production dossier */}
      <section>
        <h2 className="text-base font-semibold text-slate-200 mb-1">Production dossier</h2>
        <p className="text-xs text-slate-500 mb-4">Outils de simulation pour construire un dossier client complet.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BLOC_PRODUCTION.map(renderCard)}
        </div>
      </section>

      {/* Bloc 2 — Arbitrages patrimoniaux */}
      <section>
        <h2 className="text-base font-semibold text-slate-200 mb-1">Arbitrages patrimoniaux</h2>
        <p className="text-xs text-slate-500 mb-4">Outils pour comparer les stratégies de détention et d'allocation.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BLOC_ARBITRAGES.map(renderCard)}
        </div>
      </section>

      {/* Bloc 3 — Profil / préqualification */}
      <section>
        <h2 className="text-base font-semibold text-slate-200 mb-1">Profil / préqualification</h2>
        <p className="text-xs text-slate-500 mb-4">Évaluez le profil du client avant d'investir.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {BLOC_PROFIL.map(renderCard)}
        </div>
      </section>

      {/* Mention réglementaire */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400/80">
            Ces outils sont informatifs et préparatoires. Ils ne constituent pas une recommandation
            personnalisée au sens de la réglementation MIF2. Toute recommandation nécessite une analyse
            complète validée par un conseiller.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   ComplianceStrip (réutilisé)
   ────────────────────────────────────────── */

function ComplianceStrip() {
  return (
    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500">
        <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500/50 shrink-0" />
        <span>Support d&rsquo;aide à la décision — le conseil reste sous votre responsabilité de CGP</span>
      </div>
      <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-600 shrink-0">
        <Building2 className="w-3 h-3" />
        <span>ORIAS 13001580</span>
        <span className="text-slate-700">·</span>
        <Users className="w-3 h-3" />
        <span>CNCEF D016571</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   ProDashboard
   ────────────────────────────────────────── */

export default function ProDashboard({ initialSection }: { initialSection?: ProSection }) {
  const [activeSection, setActiveSection] = useState<ProSection>(initialSection || 'dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [simulatorView, setSimulatorView] = useState<ProSimulatorView>('hub');
  const [favoriteCount, setFavoriteCount] = useState(() => getFavoriteScpiIds().size);
  const [pendingAnalysisScpi, setPendingAnalysisScpi] = useState<SCPIExtended | null>(null);
  const [pendingCompareScpi, setPendingCompareScpi] = useState<SCPIExtended | null>(null);
  const [analysisReturnSection, setAnalysisReturnSection] = useState<ProSection | null>(null);

  useEffect(() => {
    const handler = () => setFavoriteCount(getFavoriteScpiIds().size);
    window.addEventListener('maximus-pro-favorites-updated', handler);
    return () => window.removeEventListener('maximus-pro-favorites-updated', handler);
  }, []);

  useEffect(() => {
    if (initialSection && initialSection !== activeSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const handleSectionClick = useCallback((section: ProSection) => {
    setActiveSection(section);
    if (section !== 'simulateurs') setSimulatorView('hub');
    setMobileMenuOpen(false);
  }, []);

  const handleLaunchSimulator = useCallback((view: ProSimulatorView) => {
    setSimulatorView(view);
  }, []);

  const handleBackToSimulatorHub = useCallback(() => {
    setSimulatorView('hub');
  }, []);

  const handleAnalyzeScpiFromFavorites = useCallback((scpi: SCPIExtended) => {
    setAnalysisReturnSection('scpi-preferees');
    setPendingAnalysisScpi(scpi);
    setActiveSection('comparateur');
    setMobileMenuOpen(false);
  }, []);

  const handleCompareScpiFromFavorites = useCallback((scpi: SCPIExtended) => {
    setPendingCompareScpi(scpi);
    setActiveSection('comparateur');
    setMobileMenuOpen(false);
  }, []);

  const handleCloseAnalysis = useCallback(() => {
    setPendingAnalysisScpi(null);
    if (analysisReturnSection) {
      setActiveSection(analysisReturnSection);
      setAnalysisReturnSection(null);
    }
  }, [analysisReturnSection]);

  const renderContent = (): ReactNode => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome
          onNavigate={handleSectionClick}
          onAnalyzeScpi={handleAnalyzeScpiFromFavorites}
          onCompareScpi={handleCompareScpiFromFavorites}
        />;
      case 'dossiers':
        return <DossiersFull />;
      case 'livrables':
        return <LivrablesContent />;
      case 'comparateur':
        return <ProFintechComparator
          initialAnalysisScpi={pendingAnalysisScpi}
          initialCompareScpi={pendingCompareScpi}
          onCloseAnalysis={handleCloseAnalysis}
        />;
      case 'simulateurs':
        if (simulatorView !== 'hub') {
          return (
            <>
              <button
                onClick={handleBackToSimulatorHub}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour aux simulateurs
              </button>
              <Suspense fallback={<div className="text-slate-500 text-sm py-8">Chargement du simulateur...</div>}>
                {simulatorView === 'allocation' && <ProSimulator />}
                {simulatorView === 'revenus-nets' && (
                  <ScpiNetIncomeSimulator
                    defaultAmount={50000}
                    defaultYield={5}
                    defaultTmi={30}
                    onCtaClick={() => {}}
                  />
                )}
                {simulatorView === 'credit' && (
                  <ScpiCreditSimulator
                    defaultAmount={100000}
                    defaultApport={20000}
                    defaultRate={3.5}
                    defaultDuration={20}
                    onCtaClick={() => {}}
                  />
                )}
                {simulatorView === 'demembrement' && (
                  <ScpiDemembrementSimulator
                    defaultMontant={0}
                    defaultDuree={10}
                    defaultRendement={5.0}
                    onCtaClick={() => {}}
                  />
                )}
                {simulatorView === 'fiscalite' && <SimulateurImpactFiscal />}
                {simulatorView === 'tresorerie-is' && <SimulateurTresorerieIS />}
                {simulatorView === 'profil-investisseur' && <InvestorProfileSimulator />}
                {simulatorView === 'fonds-euros' && <LifeToScpiPage />}
                {simulatorView === 'enveloppes' && (
                  <ScpiEnvelopeComparator
                    defaultAmount={100000}
                    defaultYield={5}
                    defaultDuration={15}
                    onCtaClick={() => {}}
                  />
                )}
                {simulatorView === 'demembrement-comparateur' && <ComparateurDemembrementScpi />}
              </Suspense>
            </>
          );
        }
        return (
          <ProSimulatorHub
            onLaunch={handleLaunchSimulator}
          />
        );
      case 'scpi-suivies':
        return <ScpiSuiviesContent />;
      case 'scpi-preferees':
        return <ScpiFavorites
          onNavigateToComparator={() => handleSectionClick('comparateur')}
          onAnalyzeScpi={handleAnalyzeScpiFromFavorites}
          onCompareScpi={handleCompareScpiFromFavorites}
        />;
      case 'videos':
        return <VideosContent />;
      case 'rapports':
        return <ProRapports />;
      case 'settings':
        return <ProSettings />;
      default:
        return <DashboardHome onNavigate={handleSectionClick} />;
    }
  };

  /* ── Rendu de la sidebar (partagé desktop / mobile) ── */
  const renderSidebar = (isMobile = false) => (
    <>
      {isMobile && (
        <div className="px-5 pt-4 pb-2 flex justify-end">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Espace de travail */}
      <div className="px-4 pt-4 pb-1">
        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-medium mb-2">
          ESPACE DE TRAVAIL
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleSectionClick(item.section)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
              activeSection === item.section
                ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {(() => {
              const badgeValue = item.section === 'scpi-preferees' ? (favoriteCount > 0 ? favoriteCount : undefined) : item.badge;
              return badgeValue !== undefined && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  activeSection === item.section
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {badgeValue}
                </span>
              );
            })()}
          </button>
        ))}
      </nav>

      {/* Bottom user */}
      <div className="px-3 py-3 border-t border-slate-800">
        <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-800/60 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            EB
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-[11px] text-white font-medium truncate">Eric B.</div>
            <div className="text-[9px] text-slate-500">CGP-CIF</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-full relative">
      {/* ══════════════════════════════════════════
          SIDEBAR DESKTOP
          ══════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-slate-900/80 border-r border-slate-800 sticky top-0 h-screen max-h-screen">
        {renderSidebar()}
      </aside>

      {/* ══════════════════════════════════════════
          SIDEBAR MOBILE (drawer)
          ══════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-64 bg-slate-950 border-r border-slate-800 shadow-2xl flex flex-col animate-slide-in">
            {renderSidebar(true)}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          CONTENU PRINCIPAL
          ══════════════════════════════════════════ */}
      <div className="flex-1 overflow-x-hidden min-w-0">
        <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 ${activeSection === 'comparateur' ? '' : 'max-w-6xl mx-auto'}`}>
          {/* Mobile header avec bouton menu + titre section */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">
              {sectionLabel[activeSection]}
            </span>
          </div>

          {/* Contenu dynamique */}
          {renderContent()}

          {/* Compliance strip (sauf sur comparateur) */}
          {activeSection !== 'comparateur' && <ComplianceStrip />}
        </div>
      </div>
    </div>
  );
}
