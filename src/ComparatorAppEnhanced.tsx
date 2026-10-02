import React, { lazy, Suspense, useEffect, useState } from 'react';
import ComparatorApp from './ComparatorApp';

const ScpiVigilanceRationalePortalV2 = lazy(
  () => import('./components/fintech/ScpiVigilanceRationalePortalV2'),
);
const ComparatorAnalysisTrajectoryPortal = lazy(
  () => import('./components/trajectory/ComparatorAnalysisTrajectoryPortal'),
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

      // Comparator analysis hierarchy:
      // Chiffres clés -> Radar MaximusSCPI -> Trajectoire Maximus -> remaining analysis.
      const modalHeading = Array.from(document.querySelectorAll<HTMLHeadingElement>('h2')).find((node) =>
        node.textContent?.trim().startsWith('Analyse Détaillée - '),
      );
      const modalRoot = modalHeading?.closest('.fixed.inset-0') as HTMLElement | null;

      if (modalRoot) {
        const modalHeadings = Array.from(modalRoot.querySelectorAll<HTMLHeadingElement>('h3'));
        const keyHeading = modalHeadings.find((node) => node.textContent?.trim() === 'Chiffres clés');
        const radarHeading = modalHeadings.find((node) => node.textContent?.trim() === 'Radar MaximusSCPI');

        const keySection = keyHeading?.parentElement?.parentElement as HTMLElement | null;
        const radarSection = radarHeading?.parentElement?.parentElement as HTMLElement | null;

        if (keySection && radarSection && radarSection.previousElementSibling !== keySection) {
          keySection.insertAdjacentElement('afterend', radarSection);
        }
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
            <ComparatorAnalysisTrajectoryPortal />
            <ScpiVigilanceRationalePortalV2 />
          </Suspense>
        </>
      )}
    </>
  );
};

export default ComparatorAppEnhanced;
