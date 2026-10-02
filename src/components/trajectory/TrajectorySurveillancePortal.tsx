import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import TrajectorySurveillanceTable from './TrajectorySurveillanceTable';

const findHeroSection = (): HTMLElement | null => {
  const main = document.querySelector<HTMLElement>('main.analyses-mobile-optimized');
  if (!main) return null;

  return Array.from(main.children).find(
    (child): child is HTMLElement => child instanceof HTMLElement && child.tagName === 'SECTION',
  ) || null;
};

const TrajectorySurveillancePortal: React.FC = () => {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let mountedHost: HTMLElement | null = null;
    let observer: MutationObserver | null = null;

    const mount = () => {
      if (mountedHost) return true;
      const hero = findHeroSection();
      if (!hero?.parentElement) return false;

      const existing = document.querySelector<HTMLElement>('[data-maximus-analysis-trajectory-host="true"]');
      if (existing) {
        mountedHost = existing;
        setHost(existing);
        return true;
      }

      const nextHost = document.createElement('div');
      nextHost.dataset.maximusAnalysisTrajectoryHost = 'true';
      hero.insertAdjacentElement('afterend', nextHost);
      mountedHost = nextHost;
      setHost(nextHost);
      return true;
    };

    if (!mount()) {
      observer = new MutationObserver(() => {
        if (mount()) observer?.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      if (mountedHost?.parentElement) mountedHost.remove();
      mountedHost = null;
    };
  }, []);

  return host ? createPortal(<TrajectorySurveillanceTable />, host) : null;
};

export default TrajectorySurveillancePortal;
