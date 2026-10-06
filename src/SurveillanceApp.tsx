import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SEOHead from './components/SEOHead';
import SurveillancePage from './components/SurveillancePage';
import { CookieConsent } from './components/CookieConsent';

const go = (path: string) => {
  window.location.href = path;
};

const SurveillanceApp: React.FC = () => {
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

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <SEOHead
        title="Surveillance SCPI : alertes, liquidité, TOF et risques | MaximusSCPI"
        description="Surveillez les 61 SCPI suivies par MaximusSCPI : signaux certifiés sur le TOF, la liquidité, la valorisation, la dette et les changements structurels."
        keywords={[
          'surveillance SCPI',
          'alerte SCPI',
          'liquidité SCPI',
          'TOF SCPI',
          'risque SCPI',
          'marché secondaire SCPI',
          'MaximusSCPI',
        ]}
        canonical="https://maximusscpi.com/surveillance/"
      />
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode((value) => !value)}
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
        currentView="surveillance"
      />
      <SurveillancePage />
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default SurveillanceApp;
