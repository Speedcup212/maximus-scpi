import { useState, useCallback, type ReactNode } from 'react';
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
  ArrowRight,
  Shield,
  MoreHorizontal,
  Building2,
  Users,
  TrendingUp,
  Menu,
  X,
  Clock,
  Play,
  type LucideIcon,
} from 'lucide-react';
import KpiCard from './KpiCard';
import ScpiFavorites from './ScpiFavorites';
import ScpiSignals from './ScpiSignals';
import ProComparator from './ProComparator';

/* ──────────────────────────────────────────
   Types
   ────────────────────────────────────────── */

type ProSection = 'dashboard' | 'dossiers' | 'livrables' | 'comparateur' | 'scpi-suivies' | 'scpi-preferees' | 'videos';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  section: ProSection;
  badge?: number;
}

interface DossierItem {
  initials: string;
  client: string;
  montant: string;
  status: 'Livrable prêt' | 'Sélection terminée' | 'Analyse en cours';
  date: string;
}

/* ──────────────────────────────────────────
   Constantes
   ────────────────────────────────────────── */

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', section: 'dashboard' },
  { icon: FolderOpen, label: 'Dossiers', section: 'dossiers', badge: 3 },
  { icon: FileText, label: 'Livrables', section: 'livrables' },
  { icon: BarChart3, label: 'Comparateur', section: 'comparateur' },
  { icon: Eye, label: 'SCPI suivies', section: 'scpi-suivies' },
  { icon: Star, label: 'SCPI préférées', section: 'scpi-preferees', badge: 4 },
  { icon: Video, label: 'Vidéos', section: 'videos' },
];

const dossiers: DossierItem[] = [
  { initials: 'MB', client: 'Retraite Mme Bernard', montant: '80 000 €', status: 'Livrable prêt', date: '03/06/2026' },
  { initials: 'FM', client: 'Dossier Martin', montant: '120 000 €', status: 'Sélection terminée', date: "Aujourd'hui" },
  { initials: 'SD', client: 'SCI Dupont', montant: '300 000 €', status: 'Analyse en cours', date: 'Hier' },
];

const statusStyle = (status: DossierItem['status']) => {
  switch (status) {
    case 'Livrable prêt':
      return 'text-blue-400 bg-blue-500/10';
    case 'Sélection terminée':
      return 'text-emerald-400 bg-emerald-500/10';
    case 'Analyse en cours':
      return 'text-amber-400 bg-amber-500/10';
  }
};

const sectionLabel: Record<ProSection, string> = {
  'dashboard': 'Dashboard',
  'dossiers': 'Dossiers en cours',
  'livrables': 'Livrables',
  'comparateur': 'Comparateur SCPI',
  'scpi-suivies': 'SCPI suivies',
  'scpi-preferees': 'SCPI préférées',
  'videos': 'Vidéos',
};

/* ──────────────────────────────────────────
   Sections de contenu
   ────────────────────────────────────────── */

function DashboardHome() {
  return (
    <>
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest mb-1">
            Dashboard
          </p>
          <h1 className="text-lg sm:text-2xl font-bold text-white">
            Bonjour, Eric.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            3 dossiers actifs{' '}
            <span className="text-slate-600">·</span>{' '}
            <span className="text-emerald-400 font-medium">1 livrable prêt à envoyer</span>{' '}
            <span className="text-slate-600">·</span>{' '}
            données juin 2026
          </p>
          <p className="text-[9px] sm:text-[10px] text-slate-600 mt-1.5 italic">
            Support d&rsquo;aide à la décision — le conseil reste sous votre responsabilité.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Nouveau dossier
          </button>
          <button
            onClick={() => window.location.href = '/comparateur-scpi'}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs sm:text-sm rounded-lg transition-colors"
          >
            Accéder au comparateur
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* ─── KPI CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <KpiCard icon={TrendingUp} badge="+3 ce mois" value={64} label="SCPI analysées" accent="emerald" />
        <KpiCard icon={FolderOpen} badge="1 livrable prêt" value={3} label="Dossiers actifs" accent="blue" />
        <KpiCard icon={FileText} badge="+4 vs T1" value={12} label="Supports générés · T2 2026" accent="amber" />
      </div>

      {/* ─── DOSSIERS EN COURS (aperçu) ─── */}
      <DossiersTable />

      {/* ─── SCPI PRÉFÉRÉES (aperçu) ─── */}
      <ScpiFavorites />

      {/* ─── SIGNAUX SCPI ─── */}
      <ScpiSignals />
    </>
  );
}

function DossiersTable() {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-slate-400" />
          Dossiers en cours
        </h3>
        <button className="text-[10px] sm:text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
          Voir tout →
        </button>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-[600px] w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
              <th className="text-left py-2.5 px-3 font-medium">Client</th>
              <th className="text-right py-2.5 px-3 font-medium">Montant</th>
              <th className="text-center py-2.5 px-3 font-medium">Statut</th>
              <th className="text-right py-2.5 px-3 font-medium hidden sm:table-cell">Date</th>
              <th className="py-2.5 px-3 w-10"></th>
              <th className="py-2.5 px-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {dossiers.map((dossier) => (
              <tr key={dossier.client} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                      {dossier.initials}
                    </div>
                    <span className="text-white font-medium truncate">{dossier.client}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="text-white font-semibold whitespace-nowrap">{dossier.montant}</span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${statusStyle(dossier.status)}`}>
                    {dossier.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-slate-500 hidden sm:table-cell whitespace-nowrap">
                  {dossier.date}
                </td>
                <td className="py-3 px-1">
                  <button className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 rounded-lg transition-colors whitespace-nowrap">
                    Ouvrir
                  </button>
                </td>
                <td className="py-3 px-2">
                  <button className="text-slate-600 hover:text-slate-400 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
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

function DossiersFull() {
  return (
    <>
      <h1 className="text-lg sm:text-2xl font-bold text-white mb-1">Dossiers en cours</h1>
      <p className="text-xs text-slate-400 mb-4 sm:mb-6">3 dossiers actifs — gérez vos analyses en cours.</p>
      <DossiersTable />
    </>
  );
}

function LivrablesContent() {
  return (
    <>
      <h1 className="text-lg sm:text-2xl font-bold text-white mb-1">Livrables</h1>
      <p className="text-xs text-slate-400 mb-4 sm:mb-6">Documents et rapports générés pour vos clients.</p>
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center">
        <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm mb-1">Aucun livrable pour le moment</p>
        <p className="text-slate-600 text-xs">Les livrables apparaîtront ici après validation de vos analyses.</p>
      </div>
    </>
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

export default function ProDashboard() {
  const [activeSection, setActiveSection] = useState<ProSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSectionClick = useCallback((section: ProSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  }, []);

  const renderContent = (): ReactNode => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'dossiers':
        return <DossiersFull />;
      case 'livrables':
        return <LivrablesContent />;
      case 'comparateur':
        return <ProComparator />;
      case 'scpi-suivies':
        return <ScpiSuiviesContent />;
      case 'scpi-preferees':
        return (
          <>
            <h1 className="text-lg sm:text-2xl font-bold text-white mb-1">SCPI préférées</h1>
            <p className="text-xs text-slate-400 mb-4 sm:mb-6">Vos SCPI favorites et votre watchlist.</p>
            <ScpiFavorites />
          </>
        );
      case 'videos':
        return <VideosContent />;
      default:
        return <DashboardHome />;
    }
  };

  /* ── Rendu de la sidebar (partagé desktop / mobile) ── */
  const renderSidebar = (isMobile = false) => (
    <>
      {/* Logo */}
      <div className={`px-4 py-4 border-b border-slate-800 ${isMobile ? '' : ''}`}>
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="float-right p-1 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-1.5 mb-0.5">
          <img
            src="/Maximus logo 250x50 4.svg"
            alt="MaximusSCPI"
            className="h-5 object-contain"
          />
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
            PRO
          </span>
        </div>
        <p className="text-[9px] text-slate-500 uppercase tracking-widest">
          COMPARATEUR INTELLIGENT
        </p>
      </div>

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
            {item.badge !== undefined && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                activeSection === item.section
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {item.badge}
              </span>
            )}
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
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
