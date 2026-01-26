import React, { useEffect, useState, lazy, Suspense } from 'react';
import Header from './Header';
import EricAvatar from './EricAvatar';
import MaximusLogoFooter from './MaximusLogoFooter';
import LoadingSpinner from './LoadingSpinner';

const FintechComparator = lazy(() => import('./fintech/FintechComparator'));

interface StaticScpiPageProps {
  slug: string;
  onNavigateHome?: () => void;
  onNavigateToFaq?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToUnderstanding?: () => void;
  onNavigateToScpi?: (slug: string) => void;
  onContactClick?: () => void;
  onArticlesClick?: () => void;
  onComparateurClick?: () => void;
  onSimulateurClick?: (simulateurId: string) => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

interface ScpiData {
  'Nom SCPI': string;
  'Société de gestion': string;
  'Année de création': number;
  'Label ISR': string;
  'Capitalisation (M€)': number;
  'Prix de souscription (€)': number;
  'Taux de distribution (%)': number;
  'TOF (%)': number;
  'Endettement (%)': number;
  'Répartition Géographique': string;
  'Répartition Sectorielle': string;
}

const StaticScpiPage: React.FC<StaticScpiPageProps> = ({
  slug,
  onNavigateHome,
  onNavigateToFaq,
  onNavigateToAbout,
  onNavigateToUnderstanding,
  onNavigateToScpi,
  onContactClick,
  onArticlesClick,
  onComparateurClick,
  onSimulateurClick,
  isDarkMode = false,
  toggleTheme = () => {}
}) => {
  const [scpi, setScpi] = useState<ScpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScpiData = async () => {
      try {
        const response = await fetch('/SCPI_complet_avec_SFDR_Profil.json');
        const data = await response.json();
        const scpiList = data.Sheet1 || data;

        // Normalize SCPI name to slug (same as scpiPageGenerator)
        const normalizeToSlug = (name: string) => {
          return `scpi-${name.toLowerCase()
            .replace(/['\s]+/g, '-')
            .replace(/[éèê]/g, 'e')
            .replace(/[àâ]/g, 'a')
            .replace(/[ç]/g, 'c')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/[ùûü]/g, 'u')
            .replace(/[^a-z0-9-]/g, '')}`;
        };

        const found = scpiList.find((s: ScpiData) =>
          normalizeToSlug(s['Nom SCPI']) === slug
        );

        setScpi(found || null);
      } catch (error) {
        console.error('Error loading SCPI data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScpiData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!scpi) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">SCPI non trouvée</h1>
          <button
            onClick={onNavigateHome}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const isISR = scpi['Label ISR']?.toLowerCase() === 'oui';
  const performanceLevel = scpi['Taux de distribution (%)'] >= 7 ? 'Excellent' :
                           scpi['Taux de distribution (%)'] >= 5.5 ? 'Attractif' : 'Solide';
  const tofQuality = scpi['TOF (%)'] >= 95 ? 'Taux d\'occupation optimal' : 'Bien occupée';

  const title = `SCPI ${scpi['Nom SCPI']} : ${scpi['Taux de distribution (%)']}% Rendement 2025 ✓ ${scpi['Société de gestion']} | Analyse & Avis`;

  return (
    <div className="min-h-screen bg-white">
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onContactClick={onContactClick || (() => {})}
        onAboutClick={onNavigateToAbout || (() => {})}
        onLogoClick={onNavigateHome}
        onFaqClick={onNavigateToFaq}
        onScpiPageClick={onNavigateToScpi}
        onUnderstandingClick={onNavigateToUnderstanding}
        onAboutSectionClick={onNavigateToAbout}
        onComparateurClick={onComparateurClick}
        onSimulateurClick={onSimulateurClick}
        onArticlesClick={onArticlesClick}
        currentView="scpi-detail"
      />

      <section className="min-h-[60vh] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                SCPI {scpi['Nom SCPI']} : Analyse Complète & Rendement {scpi['Taux de distribution (%)']}%
              </h1>
              <h2 className="text-xl md:text-2xl mb-8 opacity-95">
                {performanceLevel} rendement {scpi['Taux de distribution (%)']}% avec {scpi['Société de gestion']}
              </h2>
              <a
                href="https://calendly.com/eric-bellaiche/gp-rendez-vous-avec-eric-bellaiche-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg"
              >
                ✓ Obtenir un Conseil Gratuit
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto py-12 px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-indigo-600">
            <span className="block text-sm text-slate-600 font-semibold mb-2 uppercase tracking-wide">Taux de distribution 2024</span>
            <span className="block text-3xl font-bold text-indigo-600">{scpi['Taux de distribution (%)']}%</span>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-indigo-600">
            <span className="block text-sm text-slate-600 font-semibold mb-2 uppercase tracking-wide">Capitalisation</span>
            <span className="block text-3xl font-bold text-indigo-600">{scpi['Capitalisation (M€)'].toFixed(0)}M€</span>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-indigo-600">
            <span className="block text-sm text-slate-600 font-semibold mb-2 uppercase tracking-wide">TOF</span>
            <span className="block text-3xl font-bold text-indigo-600">{scpi['TOF (%)']}%</span>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-indigo-600">
            <span className="block text-sm text-slate-600 font-semibold mb-2 uppercase tracking-wide">Prix</span>
            <span className="block text-3xl font-bold text-indigo-600">{scpi['Prix de souscription (€)']}€</span>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-indigo-600">
            <span className="block text-sm text-slate-600 font-semibold mb-2 uppercase tracking-wide">Société</span>
            <span className="block text-xl font-bold text-indigo-600">{scpi['Société de gestion']}</span>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-indigo-600">
            <span className="block text-sm text-slate-600 font-semibold mb-2 uppercase tracking-wide">Création</span>
            <span className="block text-3xl font-bold text-indigo-600">{scpi['Année de création']}</span>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Présentation de la SCPI {scpi['Nom SCPI']}</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            La SCPI {scpi['Nom SCPI']}, gérée par <strong>{scpi['Société de gestion']}</strong>, offre un rendement de <strong>{scpi['Taux de distribution (%)']}%</strong> en 2024.
            Avec une capitalisation de <strong>{scpi['Capitalisation (M€)'].toFixed(0)} millions d'euros</strong> et un taux d'occupation financier de <strong>{scpi['TOF (%)']}%</strong>,
            cette SCPI se positionne comme {performanceLevel.toLowerCase()} sur le marché de l'investissement immobilier pierre-papier.
          </p>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Caractéristiques principales</h3>
          <ul className="space-y-3 text-slate-700 text-lg">
            <li className="flex items-start">
              <span className="text-emerald-600 font-bold mr-3 text-xl">✓</span>
              <span>Taux de distribution {performanceLevel.toLowerCase()} de {scpi['Taux de distribution (%)']}% en 2024</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 font-bold mr-3 text-xl">✓</span>
              <span>{tofQuality} avec un TOF de {scpi['TOF (%)']}%</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 font-bold mr-3 text-xl">✓</span>
              <span>Capitalisation importante de {scpi['Capitalisation (M€)'].toFixed(0)} M€</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 font-bold mr-3 text-xl">✓</span>
              <span>Prix de souscription : {scpi['Prix de souscription (€)']} €</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 font-bold mr-3 text-xl">✓</span>
              <span>Endettement maîtrisé : {scpi['Endettement (%)']}%</span>
            </li>
            {isISR && (
              <li className="flex items-start">
                <span className="text-emerald-600 font-bold mr-3 text-xl">✓</span>
                <span>Labellisée ISR (Investissement Socialement Responsable)</span>
              </li>
            )}
          </ul>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Pourquoi investir dans la SCPI {scpi['Nom SCPI']} ?</h3>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            <strong>MaximusSCPI</strong> vous accompagne dans votre investissement en SCPI {scpi['Nom SCPI']}.
            Bénéficiez de l'expertise d'<strong>Eric Bellaiche</strong>, conseiller certifié ORIAS avec 15 ans d'expérience,
            pour optimiser votre sélection immobilière pierre-papier et maximiser vos revenus passifs.
          </p>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Accompagnement personnalisé MaximusSCPI</h3>
          <ul className="space-y-3 text-slate-700 text-lg">
            <li className="flex items-start">
              <span className="text-emerald-600 font-bold mr-3 text-xl">✓</span>
              <span>Conseil gratuit et sans engagement</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 font-bold mr-3 text-xl">✓</span>
              <span>Analyse personnalisée de votre profil investisseur</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 font-bold mr-3 text-xl">✓</span>
              <span>Zéro commission cachée</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 font-bold mr-3 text-xl">✓</span>
              <span>Suivi régulier de votre sélection SCPI</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 font-bold mr-3 text-xl">✓</span>
              <span>Réponse sous 24h garantie</span>
            </li>
          </ul>
        </div>
      </div>

      <section className="bg-white py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <EricAvatar size="lg" className="mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-slate-900 mb-2">Eric Bellaiche</h3>
          <p className="text-xl text-slate-600 mb-1">Conseiller en Gestion de Patrimoine et en Investissements Financiers</p>
          <p className="text-base text-slate-500">Membre de la Chambre Nationale des Conseils Experts Financiers (CNCEF) • 15 ans d'expérience</p>
        </div>
      </section>

      <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white py-16 px-6 text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Prêt à investir dans la SCPI {scpi['Nom SCPI']} ?</h3>
        <p className="text-xl mb-8 opacity-95">Eric Bellaiche vous rappelle gratuitement sous 24h</p>
        <a
          href="https://calendly.com/eric-bellaiche/gp-rendez-vous-avec-eric-bellaiche-clone"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-12 py-5 bg-white text-emerald-700 rounded-lg font-bold text-xl hover:bg-slate-50 transition-all transform hover:scale-105 shadow-xl"
        >
          📞 Prendre Rendez-vous Gratuit
        </a>
        <p className="mt-6 text-base opacity-90">
          Sans engagement • Conseiller certifié ORIAS • Réponse sous 24h
        </p>
      </section>

      {/* Section Comparateur Fintech */}
      <div className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<LoadingSpinner />}>
            <FintechComparator onCloseAnalysis={onNavigateHome} />
          </Suspense>
        </div>
      </div>

      <footer className="bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <MaximusLogoFooter className="mx-auto mb-4" />
          <p className="text-slate-400 text-sm">© 2025 MaximusSCPI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default StaticScpiPage;
