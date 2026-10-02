import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  BarChart3,
  Calculator,
  Check,
  ChevronRight,
  LineChart,
  Plus,
  SearchCheck,
} from 'lucide-react';

const SELECTION_STORAGE_KEY = 'maximus:scpi-selection:v1';
const MAX_SELECTION_SIZE = 6;

type DecisionTarget = 'radar' | 'trajectory' | 'analysis' | 'compare' | 'simulate';

type ScpiDecisionHubPortalProps = {
  scpiSlug: string;
};

const readSelection = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(SELECTION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string' && value.length > 0)
      : [];
  } catch {
    return [];
  }
};

const writeSelection = (selection: string[]) => {
  window.localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(selection));
  window.dispatchEvent(new CustomEvent('maximus:scpi-selection-changed', { detail: selection }));
};

const findHeading = (selector: 'h2' | 'h3' | 'summary', startsWith: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(selector)).find((node) =>
    node.textContent?.trim().startsWith(startsWith),
  ) || null;

const scrollIntoViewWithOffset = (target: HTMLElement) => {
  const top = target.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
};

const resolveDecisionTarget = (target: Exclude<DecisionTarget, 'compare'>): HTMLElement | null => {
  if (target === 'trajectory') {
    return (
      document.getElementById('trajectoire-scpi') ||
      findHeading('h2', 'Trajectoire Maximus')?.closest<HTMLElement>('section') ||
      document.querySelector<HTMLElement>('[data-maximus-scpi-trajectory-host="true"]') ||
      null
    );
  }

  if (target === 'radar') {
    const heading = findHeading('h3', 'Radar Maximus');
    return heading?.closest<HTMLElement>('div.rounded-2xl') || heading;
  }

  if (target === 'analysis') {
    const heading = findHeading('h2', 'Analyse Maximus de');
    return heading?.closest<HTMLElement>('section') || heading;
  }

  const summary = findHeading('summary', 'Simuler mes revenus');
  return summary?.closest<HTMLElement>('details') || summary;
};

const findHeroSection = (): HTMLElement | null => {
  const h1 = document.querySelector<HTMLHeadingElement>('h1');
  if (!h1) return null;

  let current: HTMLElement | null = h1.parentElement;
  while (current && current !== document.body) {
    const className = typeof current.className === 'string' ? current.className : '';
    if (className.includes('bg-gradient-to-br') && className.includes('text-white')) {
      return current;
    }
    current = current.parentElement;
  }

  return h1.parentElement;
};

const ScpiDecisionHub: React.FC<ScpiDecisionHubPortalProps> = ({ scpiSlug }) => {
  const [selection, setSelection] = useState<string[]>(() => readSelection());

  const isSelected = selection.includes(scpiSlug);

  useEffect(() => {
    const syncSelection = () => setSelection(readSelection());
    window.addEventListener('storage', syncSelection);
    window.addEventListener('maximus:scpi-selection-changed', syncSelection as EventListener);
    return () => {
      window.removeEventListener('storage', syncSelection);
      window.removeEventListener('maximus:scpi-selection-changed', syncSelection as EventListener);
    };
  }, []);

  const items = useMemo(
    () => [
      {
        id: 'radar' as const,
        eyebrow: 'État actuel',
        title: 'Radar',
        description: 'Lire la qualité actuelle sur les dimensions clés.',
        icon: Activity,
      },
      {
        id: 'trajectory' as const,
        eyebrow: 'Évolution',
        title: 'Trajectoire',
        description: 'Voir ce qui s’améliore, reste stable ou se dégrade.',
        icon: LineChart,
      },
      {
        id: 'analysis' as const,
        eyebrow: 'Interprétation',
        title: 'Analyse',
        description: 'Comprendre les forces, vigilances et faits utiles.',
        icon: SearchCheck,
      },
      {
        id: 'compare' as const,
        eyebrow: 'Face au marché',
        title: 'Comparer',
        description: 'Confronter cette SCPI aux alternatives du comparateur.',
        icon: BarChart3,
      },
      {
        id: 'simulate' as const,
        eyebrow: 'Impact financier',
        title: 'Simuler',
        description: 'Projeter un montant et les revenus associés.',
        icon: Calculator,
      },
    ],
    [],
  );

  const ensureSelected = () => {
    if (selection.includes(scpiSlug)) return selection;
    const next = [...selection, scpiSlug].slice(-MAX_SELECTION_SIZE);
    writeSelection(next);
    setSelection(next);
    return next;
  };

  const toggleSelection = () => {
    const next = isSelected
      ? selection.filter((slug) => slug !== scpiSlug)
      : [...selection, scpiSlug].slice(-MAX_SELECTION_SIZE);
    writeSelection(next);
    setSelection(next);
  };

  const navigateToTarget = (target: DecisionTarget) => {
    if (target === 'compare') {
      const nextSelection = ensureSelected();
      const params = new URLSearchParams();
      params.set('selection', nextSelection.join(','));
      params.set('source', 'fiche-scpi');
      window.location.href = `/comparateur-scpi/?${params.toString()}`;
      return;
    }

    const resolved = resolveDecisionTarget(target);
    if (resolved) {
      if (target === 'simulate' && resolved instanceof HTMLDetailsElement) {
        resolved.open = true;
      }
      scrollIntoViewWithOffset(resolved);
      return;
    }

    if (target === 'simulate') {
      window.location.href = `/simulateurs/?scpi=${encodeURIComponent(scpiSlug)}&source=fiche-scpi`;
      return;
    }

    // Les blocs Radar / Analyse / Trajectoire peuvent arriver légèrement après
    // le premier paint (données live / portal). On retente sans bloquer l'UX.
    window.setTimeout(() => {
      const retryTarget = resolveDecisionTarget(target);
      if (retryTarget) scrollIntoViewWithOffset(retryTarget);
    }, 350);
  };

  return (
    <section className="bg-[#07110e] text-white border-y border-emerald-400/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
          <div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Parcours d’analyse Maximus
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
              Tout analyser depuis cette fiche
            </h2>
            <p className="mt-2 max-w-3xl text-sm sm:text-base text-slate-300">
              Une seule SCPI, cinq lectures complémentaires : état actuel, évolution, interprétation, comparaison et projection.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleSelection}
            aria-pressed={isSelected}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
              isSelected
                ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                : 'border border-emerald-400/35 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15'
            }`}
          >
            {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isSelected ? 'Dans ma sélection' : 'Ajouter à ma sélection'}
            <span className="rounded-full bg-black/15 px-2 py-0.5 text-xs">{selection.length}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateToTarget(item.id)}
                className="group text-left rounded-2xl border border-white/10 bg-white/[0.045] p-4 sm:p-5 hover:border-emerald-300/40 hover:bg-emerald-300/[0.08] transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-emerald-300" />
                </div>
                <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {item.eyebrow}
                </div>
                <div className="mt-1 text-lg font-extrabold text-white">{item.title}</div>
                <p className="mt-2 hidden sm:block text-sm leading-snug text-slate-400">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <span>Ma sélection est conservée sur MaximusSCPI.</span>
          {selection.length > 0 && <span>• {selection.length} SCPI sélectionnée{selection.length > 1 ? 's' : ''}</span>}
        </div>
      </div>
    </section>
  );
};

const ScpiDecisionHubPortal: React.FC<ScpiDecisionHubPortalProps> = ({ scpiSlug }) => {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let mountedHost: HTMLElement | null = null;
    let observer: MutationObserver | null = null;

    const mount = () => {
      if (mountedHost) return true;

      const hero = findHeroSection();
      if (!hero?.parentElement) return false;

      const existing = document.querySelector<HTMLElement>('[data-maximus-decision-hub-host="true"]');
      if (existing) {
        mountedHost = existing;
        setHost(existing);
        return true;
      }

      const nextHost = document.createElement('div');
      nextHost.dataset.maximusDecisionHubHost = 'true';
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
  }, [scpiSlug]);

  return host ? createPortal(<ScpiDecisionHub scpiSlug={scpiSlug} />, host) : null;
};

export default ScpiDecisionHubPortal;
