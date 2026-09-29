import React, { lazy, Suspense, useEffect, useState } from 'react';
import ComparatorApp from './ComparatorApp';

const ScpiVigilanceRationalePortalV2 = lazy(
  () => import('./components/fintech/ScpiVigilanceRationalePortalV2'),
);

const ConsolidateMaximusAnalysis: React.FC = () => {
  useEffect(() => {
    const normalizeAnalysis = () => {
      const headings = Array.from(document.querySelectorAll<HTMLHeadingElement>('h3'));

      // Hide only the former legacy analysis block.
      const legacyHeading = headings.find(
        (node) =>
          node.textContent?.trim() === 'Analyse MaximusSCPI' &&
          Boolean(node.closest('div.p-6.space-y-8')),
      );

      const legacyBlock = legacyHeading?.closest('div.p-6.space-y-8') as HTMLElement | null;
      if (legacyBlock) {
        legacyBlock.style.display = 'none';
        legacyBlock.setAttribute('aria-hidden', 'true');
        legacyBlock.dataset.legacyMaximusAnalysisHidden = 'true';
      }

      // Rename the remaining consolidated rationale block.
      const rationaleHeading = headings.find(
        (node) => node.textContent?.trim() === 'Pourquoi cette appréciation MaximusSCPI ?',
      );
      if (rationaleHeading) {
        rationaleHeading.textContent = 'Analyse MaximusSCPI';
      }
    };

    normalizeAnalysis();
    const observer = new MutationObserver(normalizeAnalysis);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
};

const ComparatorAppEnhanced: React.FC = () => {
  const [analysisEnhancementsEnabled, setAnalysisEnhancementsEnabled] = useState(false);

  useEffect(() => {
    if (analysisEnhancementsEnabled) return;

    const enableOnAnalysisClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest('button');
      if (button?.textContent?.includes('Analyser')) {
        setAnalysisEnhancementsEnabled(true);
      }
    };

    // Capture permet de démarrer le chunk d'analyse avant même le rendu du modal.
    document.addEventListener('click', enableOnAnalysisClick, true);
    return () => document.removeEventListener('click', enableOnAnalysisClick, true);
  }, [analysisEnhancementsEnabled]);

  return (
    <>
      <ComparatorApp />
      {analysisEnhancementsEnabled && (
        <>
          <ConsolidateMaximusAnalysis />
          <Suspense fallback={null}>
            <ScpiVigilanceRationalePortalV2 />
          </Suspense>
        </>
      )}
    </>
  );
};

export default ComparatorAppEnhanced;
