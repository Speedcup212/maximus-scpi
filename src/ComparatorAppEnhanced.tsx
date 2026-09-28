import React, { useEffect } from 'react';
import ComparatorApp from './ComparatorApp';
import ScpiVigilanceRationalePortalV2 from './components/fintech/ScpiVigilanceRationalePortalV2';

const HideLegacyMaximusAnalysis: React.FC = () => {
  useEffect(() => {
    const hideLegacyBlock = () => {
      const legacyHeading = Array.from(document.querySelectorAll<HTMLHeadingElement>('h3')).find(
        (node) => node.textContent?.trim() === 'Analyse MaximusSCPI',
      );

      const legacyBlock = legacyHeading?.closest('div.p-6.space-y-8') as HTMLElement | null;
      if (legacyBlock) {
        legacyBlock.style.display = 'none';
        legacyBlock.setAttribute('aria-hidden', 'true');
        legacyBlock.dataset.legacyMaximusAnalysisHidden = 'true';
      }
    };

    hideLegacyBlock();
    const observer = new MutationObserver(hideLegacyBlock);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
};

const ComparatorAppEnhanced: React.FC = () => (
  <>
    <ComparatorApp />
    <HideLegacyMaximusAnalysis />
    <ScpiVigilanceRationalePortalV2 />
  </>
);

export default ComparatorAppEnhanced;
