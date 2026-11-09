import React, { useEffect, useState } from 'react';

const SELECTION_STORAGE_KEY = 'maximus:scpi-selection:v1';
const MAX_SELECTION_SIZE = 6;

type SectionId =
  | 'scpi-synthese'
  | 'radar-scpi'
  | 'trajectoire-scpi'
  | 'scpi-patrimoine'
  | 'scpi-risques-frais'
  | 'scpi-documents';

interface ScpiDecisionHubPortalProps {
  scpiSlug: string;
  canSimulate?: boolean;
}

const SECTIONS: ReadonlyArray<{ id: SectionId; label: string }> = [
  { id: 'scpi-synthese', label: 'Synthèse' },
  { id: 'radar-scpi', label: 'Radar' },
  { id: 'trajectoire-scpi', label: 'Trajectoire' },
  { id: 'scpi-patrimoine', label: 'Patrimoine' },
  { id: 'scpi-risques-frais', label: 'Risques & frais' },
  { id: 'scpi-documents', label: 'Documents' },
];

// Header: 64px; the sticky section navigation sits immediately beneath it.
const NAV_OFFSET = 132;

const readSelection = (): string[] => {
  try {
    const value = JSON.parse(window.localStorage.getItem(SELECTION_STORAGE_KEY) || '[]');
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string' && item.length > 0)
      : [];
  } catch {
    return [];
  }
};

const scrollToSection = (id: SectionId, behavior: ScrollBehavior = 'smooth') => {
  const target = id === 'radar-scpi'
    ? document.getElementById('radar-scpi')
    : document.getElementById(id);
  if (!target) return false;
  const top = window.scrollY + target.getBoundingClientRect().top - NAV_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
};

/**
 * The former 5-card decision hub is now a single, compact sticky index.
 * This component is mounted INLINE in the shared SCPI template: mounting a
 * sticky element inside a short-lived portal host would prevent it from
 * remaining sticky throughout the document.
 */
const ScpiDecisionHubPortal: React.FC<ScpiDecisionHubPortalProps> = ({
  scpiSlug,
  canSimulate = false,
}) => {
  const [active, setActive] = useState<SectionId>('scpi-synthese');

  useEffect(() => {
    let frame = 0;
    const updateActive = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let closest: SectionId = 'scpi-synthese';
        for (const item of SECTIONS) {
          const node = document.getElementById(item.id);
          if (node && node.getBoundingClientRect().top <= NAV_OFFSET + 18) {
            // Choose the last section in DOM order, not the visual label order.
            const top = node.getBoundingClientRect().top + window.scrollY;
            const previous = document.getElementById(closest);
            if (!previous || top >= previous.getBoundingClientRect().top + window.scrollY) {
              closest = item.id;
            }
          }
        }
        // The last section cannot always reach the sticky threshold because
        // the footer is shorter than the viewport. Keep Documents active at
        // the bottom instead of incorrectly highlighting Risks & fees.
        const docs = document.getElementById('scpi-documents');
        const atBottom = window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 24;
        if (atBottom && docs && docs.getBoundingClientRect().top < window.innerHeight) {
          closest = 'scpi-documents';
        }
        setActive(closest);
      });
    };
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    updateActive();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [scpiSlug]);

  useEffect(() => {
    let frame = 0;
    const pendingCorrections: number[] = [];
    let userInteracted = false;

    const cancelPendingCorrections = () => {
      for (const timer of pendingCorrections) window.clearTimeout(timer);
      pendingCorrections.length = 0;
    };
    // Never fight a user's intentional scroll/click after the initial deep link.
    const suspendAutoRestore = () => {
      userInteracted = true;
      cancelPendingCorrections();
    };
    // On a directly opened /scpi/#scpi-documents URL the browser parses
    // the static shell before React mounts all sections. In addition, images
    // and asynchronously mounted blocks can shift the document after hydration.
    const restoreHash = () => {
      let id: string;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return; // Malformed, user-controlled hash must not crash navigation.
      }
      const matchingSection = SECTIONS.find(section => section.id === id);
      if (!matchingSection) return;
      cancelAnimationFrame(frame);
      cancelPendingCorrections();
      userInteracted = false;
      const expectedHash = '#' + matchingSection.id;
      const reconcileScroll = () => {
        if (userInteracted || window.location.hash !== expectedHash) return;
        if (scrollToSection(matchingSection.id, 'auto')) {
          setActive(matchingSection.id);
        }
      };
      frame = requestAnimationFrame(() => {
        reconcileScroll();
        // Bounded re-alignment on late image/font/chart layout changes, not
        // an infinite polling loop or a replacement for the browser QA gate.
        for (const delay of [120, 420, 1100, 2400]) {
          pendingCorrections.push(window.setTimeout(reconcileScroll, delay));
        }
      });
    };

    restoreHash();
    window.addEventListener('hashchange', restoreHash);
    window.addEventListener('popstate', restoreHash);
    window.addEventListener('load', restoreHash);
    window.addEventListener('wheel', suspendAutoRestore, { passive: true });
    window.addEventListener('touchstart', suspendAutoRestore, { passive: true });
    window.addEventListener('pointerdown', suspendAutoRestore, { passive: true });
    window.addEventListener('keydown', suspendAutoRestore);
    return () => {
      cancelAnimationFrame(frame);
      cancelPendingCorrections();
      window.removeEventListener('hashchange', restoreHash);
      window.removeEventListener('popstate', restoreHash);
      window.removeEventListener('load', restoreHash);
      window.removeEventListener('wheel', suspendAutoRestore);
      window.removeEventListener('touchstart', suspendAutoRestore);
      window.removeEventListener('pointerdown', suspendAutoRestore);
      window.removeEventListener('keydown', suspendAutoRestore);
    };
  }, [scpiSlug]);

  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, id: SectionId) => {
    if (!document.getElementById(id)) return;
    event.preventDefault();
    window.history.pushState(null, '', window.location.pathname + window.location.search + '#' + id);
    scrollToSection(id);
    setActive(id);
  };

  const compare = () => {
    const selected = readSelection();
    const next = selected.includes(scpiSlug)
      ? selected
      : [...selected, scpiSlug].slice(-MAX_SELECTION_SIZE);
    window.localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('maximus:scpi-selection-changed', { detail: next }));
    const params = new URLSearchParams({ selection: next.join(','), source: 'fiche-scpi' });
    window.location.href = '/comparateur-scpi/?' + params.toString();
  };

  return (
    <div data-testid="scpi-sticky-navigation" className="sticky top-16 z-[9980] border-y border-emerald-400/20 bg-[#0D1C25]/95 text-white shadow-lg shadow-slate-950/15 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 sm:px-6">
        <nav aria-label="Navigation dans la fiche SCPI" className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain py-2">
          <div className="flex w-max items-center gap-1.5 whitespace-nowrap sm:gap-2">
            {SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={'#' + id}
                aria-current={active === id ? 'location' : undefined}
                onClick={(event) => navigate(event, id)}
                className={
                  active === id
                    ? 'rounded-lg bg-[#00C896] px-3 py-2 text-xs font-semibold text-[#05251e] shadow-sm sm:text-sm'
                    : 'rounded-lg px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 sm:text-sm'
                }
              >
                {label}
              </a>
            ))}
          </div>
        </nav>
        <div className="hidden shrink-0 items-center gap-2 border-l border-white/10 py-2 pl-3 lg:flex">
          {canSimulate && (
            <a href="#scpi-simulateur" onClick={(event) => {
              const el = document.getElementById('scpi-simulateur');
              if (el) {
                event.preventDefault();
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const disclosure = el.querySelector('details');
                if (disclosure) disclosure.open = true;
              }
            }} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">
              Simuler
            </a>
          )}
          <button
            type="button"
            onClick={compare}
            className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
          >
            Comparer cette SCPI
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScpiDecisionHubPortal;
