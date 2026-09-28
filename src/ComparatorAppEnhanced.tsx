import React, { useEffect } from 'react';
import ComparatorApp from './ComparatorApp';
import ScpiVigilanceRationalePortalV2 from './components/fintech/ScpiVigilanceRationalePortalV2';

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

const ComparatorAppEnhanced: React.FC = () => (
  <>
    <ComparatorApp />
    <ConsolidateMaximusAnalysis />
    <ScpiVigilanceRationalePortalV2 />
  </>
);

export default ComparatorAppEnhanced;
