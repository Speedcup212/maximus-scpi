import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createSlugFromName } from '../../utils/scpiSlugMapper';
import ScpiTrajectoryPanel from './ScpiTrajectoryPanel';

const HOST_ATTR = 'data-maximus-analysis-trajectory-host';

const ComparatorAnalysisTrajectoryPortal: React.FC = () => {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [scpiSlug, setScpiSlug] = useState<string | null>(null);

  useEffect(() => {
    const scan = () => {
      const headings = Array.from(document.querySelectorAll<HTMLHeadingElement>('h2'));
      const modalHeading = headings.find((node) =>
        node.textContent?.trim().startsWith('Analyse Détaillée - '),
      );

      if (!modalHeading) {
        setTarget(null);
        setScpiSlug(null);
        return;
      }

      const name = modalHeading.textContent?.trim().replace(/^Analyse Détaillée\s*-\s*/, '') || '';
      const slug = createSlugFromName(name);
      if (!slug) return;

      const modalRoot = modalHeading.closest('.fixed.inset-0') as HTMLElement | null;
      if (!modalRoot) return;

      const keyHeading = Array.from(modalRoot.querySelectorAll<HTMLHeadingElement>('h3')).find(
        (node) => node.textContent?.trim() === 'Chiffres clés',
      );
      const keyCard = keyHeading?.parentElement as HTMLElement | null;
      const keySection = keyCard?.parentElement as HTMLElement | null;
      if (!keySection) return;

      let host = modalRoot.querySelector<HTMLElement>(`[${HOST_ATTR}]`);
      if (!host) {
        host = document.createElement('div');
        host.setAttribute(HOST_ATTR, 'true');
        keySection.insertAdjacentElement('afterend', host);
      } else if (host.previousElementSibling !== keySection) {
        keySection.insertAdjacentElement('afterend', host);
      }

      if (target !== host) setTarget(host);
      if (scpiSlug !== slug) setScpiSlug(slug);
    };

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [target, scpiSlug]);

  if (!target || !scpiSlug) return null;

  return createPortal(
    <ScpiTrajectoryPanel scpiSlug={scpiSlug} />,
    target,
  );
};

export default ComparatorAnalysisTrajectoryPortal;
