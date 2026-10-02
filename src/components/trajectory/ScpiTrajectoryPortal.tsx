import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ScpiTrajectoryPanel from './ScpiTrajectoryPanel';

type ScpiTrajectoryPortalProps = {
  scpiSlug: string;
};

const findPatrimoineSection = (): HTMLElement | null => {
  const heading = Array.from(document.querySelectorAll<HTMLHeadingElement>('h2')).find((node) =>
    node.textContent?.trim().startsWith('Où investit'),
  );

  if (!heading) return null;

  let current: HTMLElement | null = heading.parentElement;
  while (current && current !== document.body) {
    if (typeof current.className === 'string' && current.className.includes('bg-[#F8FAFC]')) {
      return current;
    }
    current = current.parentElement;
  }

  return heading.parentElement?.parentElement?.parentElement || null;
};

const ScpiTrajectoryPortal: React.FC<ScpiTrajectoryPortalProps> = ({ scpiSlug }) => {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let mountedHost: HTMLElement | null = null;
    let observer: MutationObserver | null = null;

    const mount = () => {
      if (mountedHost) return true;
      const target = findPatrimoineSection();
      if (!target?.parentElement) return false;

      const existing = document.querySelector<HTMLElement>('[data-maximus-scpi-trajectory-host="true"]');
      if (existing) {
        mountedHost = existing;
        setHost(existing);
        return true;
      }

      const nextHost = document.createElement('div');
      nextHost.dataset.maximusScpiTrajectoryHost = 'true';
      target.parentElement.insertBefore(nextHost, target);
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

  return host ? createPortal(<ScpiTrajectoryPanel scpiSlug={scpiSlug} />, host) : null;
};

export default ScpiTrajectoryPortal;
