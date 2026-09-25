import React, { lazy, Suspense, useEffect, useState } from 'react';
import OptimizedScpiLandingPage from './components/OptimizedScpiLandingPage';

const RdvModal = lazy(() => import('./components/RdvModal'));

declare global {
  interface Window {
    __SCPI_STATIC_SLUG__?: string;
  }
}

const go = (path: string) => {
  window.location.href = path;
};

const ScpiApp: React.FC = () => {
  const scpiKey = window.__SCPI_STATIC_SLUG__ || window.location.pathname.replace(/^\/|\/$/g, '');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const [isRdvModalOpen, setIsRdvModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <>
      <OptimizedScpiLandingPage
        scpiKey={scpiKey}
        onNavigateHome={() => go('/')}
        onNavigateToFaq={() => go('/faq/')}
        onNavigateToAbout={() => go('/qui-sommes-nous/')}
        onNavigateToUnderstanding={() => go('/comprendre-les-scpi/')}
        onNavigateToScpi={(slug) => go(`/${slug}/`)}
        onContactClick={() => setIsRdvModalOpen(true)}
        onArticlesClick={() => go('/articles/')}
        onComparateurClick={() => go('/comparateur-scpi/')}
        onSimulateurClick={() => go('/simulateurs/')}
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(v => !v)}
      />

      <Suspense fallback={null}>
        {isRdvModalOpen && (
          <RdvModal
            isOpen={isRdvModalOpen}
            onClose={() => setIsRdvModalOpen(false)}
          />
        )}
      </Suspense>
    </>
  );
};

export default ScpiApp;
