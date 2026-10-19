import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SEOHead from './components/SEOHead';
import AnalysesPage from './components/AnalysesPage';
import { CookieConsent } from './components/CookieConsent';

const go = (path: string) => {
  window.location.href = path;
};

const AnalysesApp: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme ? savedTheme === 'dark' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
    try {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // localStorage peut être indisponible en navigation privée.
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((value) => !value);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <SEOHead
        title="Analyse SCPI 360° : Radar et Trajectoire | MaximusSCPI"
        description="Analysez les SCPI au-delà du rendement : Historique, Radar, Trajectoire et Surveillance. Sources officielles, risques, valorisation et liquidité."
        keywords={[
          'analyse SCPI',
          'MaximusSCPI Research',
          'radar SCPI',
          'risque SCPI',
          'liquidité SCPI',
          'endettement SCPI',
          'valeur de reconstitution SCPI',
        ]}
        canonical="https://maximusscpi.com/analyses/"
      />
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onContactClick={() => go('/')}
        onAboutClick={() => go('/qui-sommes-nous/')}
        onEducationClick={() => go('/articles/')}
        onArticlesClick={() => go('/articles/')}
        onActualitesClick={() => go('/actualites/')}
        onLogoClick={() => go('/')}
        onScpiPageClick={(slug) => go(`/${slug}/`)}
        onUnderstandingClick={() => go('/comprendre-les-scpi/')}
        onAboutSectionClick={() => go('/qui-sommes-nous/')}
        onFaqClick={() => go('/faq/')}
        onComparateurClick={() => go('/comparateur-scpi/')}
        onSimulateurClick={() => go('/simulateurs/')}
        onAboutNavigation={(path) => go(path)}
        onPrivateSpaceClick={() => go('/app/')}
        onProClick={() => go('/professionnels')}
        currentView="analyses"
      />
      <AnalysesPage />
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default AnalysesApp;
