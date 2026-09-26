import React, { lazy, Suspense } from 'react';
import ExpertBanner from './components/ExpertBanner';
import PreuveSociale from './components/PreuveSociale';
import TeaserComparateur from './components/TeaserComparateur';
import SemanticLinks from './components/SemanticLinks';
import Footer from './components/Footer';
import { getSemanticLinks } from './data/semanticCocon';

const Testimonials = lazy(() => import('./components/Testimonials'));
const LandingPagesMenu = lazy(() => import('./components/LandingPagesMenu'));

interface HomeBelowFoldProps {
  isDarkMode: boolean;
  onContactClick: () => void;
  onNavigate: (path: string) => void;
}

const HomeBelowFold: React.FC<HomeBelowFoldProps> = ({
  isDarkMode,
  onContactClick,
  onNavigate,
}) => (
  <>
    <main>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExpertBanner
          isDarkMode={isDarkMode}
          onContactClick={onContactClick}
        />
      </div>

      <Suspense fallback={<div className="min-h-[360px]" aria-hidden="true" />}>
        <Testimonials />
      </Suspense>

      <PreuveSociale />
      <TeaserComparateur />
    </main>

    <Suspense fallback={<div className="min-h-[420px]" aria-hidden="true" />}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LandingPagesMenu onPageClick={(slug) => onNavigate(`/${slug}/`)} />
      </div>
    </Suspense>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <SemanticLinks
        currentPage="/"
        links={getSemanticLinks('/')}
        title="Poursuivez votre découverte des SCPI"
      />
    </div>

    <Footer />
  </>
);

export default HomeBelowFold;
