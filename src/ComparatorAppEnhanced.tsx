import React, { lazy, Suspense, useEffect, useState } from 'react';
import ComparatorApp from './ComparatorApp';
import ComparatorSelectionBridge from './components/fintech/ComparatorSelectionBridge';

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

      // Hide only the former legacy "Analyse MaximusSCPI" card.
      // Important: do NOT hide the surrounding div.p-6.space-y-8 wrapper,
      // because it also contains the sector/geography pie charts and the
      // technical dashboard.
      const legacyHeading = headings.find(
        (node) =>
          node.textContent?.trim() === 'Analyse MaximusSCPI' &&
          Boolean(node.closest('div.p-6.space-y-8')),
      );

      let legacyBlock = legacyHeading?.parentElement ?? null;
      while (
        legacyBlock &&
        legacyBlock !== document.body &&
        !legacyBlock.className.includes('bg-purple-500/10')
      ) {
        legacyBlock = legacyBlock.parentElement;
      }

      if (legacyBlock && legacyBlock !== document.body) {
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

      const modalHeading = Array.from(document.querySelectorAll<HTMLHeadingElement>('h2')).find((node) =>
        node.textContent?.trim().startsWith('Analyse Détaillée - '),
      );
      const modalRoot = modalHeading?.closest('.fixed.inset-0') as HTMLElement | null;

      if (modalRoot) {
        const modalHeadings = Array.from(modalRoot.querySelectorAll<HTMLHeadingElement>('h3'));
        const keyHeading = modalHeadings.find((node) => node.textContent?.trim() === 'Chiffres clés');
        const radarHeading = modalHeadings.find((node) => node.textContent?.trim() === 'Radar MaximusSCPI');
        const sourceHeading = modalHeadings.find(
          (node) => node.textContent?.trim() === 'Source & fraîcheur des données',
        );

        const keySection = keyHeading?.parentElement?.parentElement as HTMLElement | null;
        const radarSection = radarHeading?.closest('div.px-6.pb-6') as HTMLElement | null;
        const sourceSection = sourceHeading?.closest('div.px-6.pb-6') as HTMLElement | null;
        const trajectoryHost = modalRoot.querySelector<HTMLElement>(
          '[data-maximus-analysis-trajectory-host="true"]',
        );

        // Desired hierarchy:
        // Chiffres clés -> Trajectoire / Signaux marché -> Radar -> reste de l'analyse.
        const radarAnchor = trajectoryHost || keySection;
        if (radarAnchor && radarSection && radarSection.previousElementSibling !== radarAnchor) {
          radarAnchor.insertAdjacentElement('afterend', radarSection);
        }

        // Source & fraîcheur is useful for auditability but should not interrupt
        // the analytical reading. Move it to the very bottom, just above actions.
        const stickyFooter = modalRoot.querySelector<HTMLElement>('div.sticky.bottom-0');
        if (
          sourceSection &&
          stickyFooter?.parentElement &&
          sourceSection.nextElementSibling !== stickyFooter
        ) {
          stickyFooter.parentElement.insertBefore(sourceSection, stickyFooter);
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
      <ComparatorSelectionBridge />
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
