import React, { useEffect } from 'react';
import { scpiDataExtended } from '../../data/scpiDataExtended';
import { createSlugFromName } from '../../utils/scpiSlugMapper';

const STORAGE_KEY = 'maximus:scpi-selection:v1';
const MAX_SELECTION_SIZE = 6;

const knownScpis = scpiDataExtended.map((scpi) => ({
  name: scpi.name,
  slug: createSlugFromName(scpi.name),
}));

const normalizeSelection = (values: string[]) => {
  const knownSlugs = new Set(knownScpis.map((scpi) => scpi.slug));
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value.length > 0 && knownSlugs.has(value)),
    ),
  ).slice(0, MAX_SELECTION_SIZE);
};

const readStoredSelection = (): string[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? normalizeSelection(parsed.filter((value): value is string => typeof value === 'string'))
      : [];
  } catch {
    return [];
  }
};

const readRequestedSelection = (): string[] => {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('selection');
  if (fromUrl) return normalizeSelection(fromUrl.split(','));
  return readStoredSelection();
};

const writeSelection = (selection: string[]) => {
  const normalized = normalizeSelection(selection);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent('maximus:scpi-selection-changed', { detail: normalized }));
  } catch {
    // Le comparateur reste utilisable même si le stockage local est indisponible.
  }
};

const waitFor = <T,>(getter: () => T | null, timeoutMs = 1800): Promise<T | null> =>
  new Promise((resolve) => {
    const startedAt = Date.now();

    const tick = () => {
      const value = getter();
      if (value) {
        resolve(value);
        return;
      }
      if (Date.now() - startedAt >= timeoutMs) {
        resolve(null);
        return;
      }
      window.setTimeout(tick, 40);
    };

    tick();
  });

const setControlledInputValue = (input: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  if (setter) setter.call(input, value);
  else input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

const findSearchInput = () =>
  document.querySelector<HTMLInputElement>(
    '#comparator-container input[placeholder^="Rechercher par nom"]',
  );

const findScpiCard = (name: string): HTMLElement | null => {
  const heading = Array.from(
    document.querySelectorAll<HTMLHeadingElement>('#scpi-grid h3'),
  ).find((node) => node.textContent?.trim() === name);

  return heading?.closest<HTMLElement>('div.bg-slate-800.rounded-2xl') || null;
};

const findSelectionButton = (card: HTMLElement) =>
  Array.from(card.querySelectorAll<HTMLButtonElement>('button')).find((button) => {
    const label = button.textContent?.trim();
    return label === 'Ajouter' || label === 'Choisie';
  }) || null;

const slugFromCard = (card: HTMLElement): string | null => {
  const name = card.querySelector<HTMLHeadingElement>('h3')?.textContent?.trim();
  if (!name) return null;
  const slug = createSlugFromName(name);
  return knownScpis.some((scpi) => scpi.slug === slug) ? slug : null;
};

const ComparatorSelectionBridge: React.FC = () => {
  useEffect(() => {
    let cancelled = false;
    let hydrating = true;
    let sidebarSyncTimer: number | null = null;

    const requestedSelection = readRequestedSelection();
    writeSelection(requestedSelection);

    const hydrate = async () => {
      if (requestedSelection.length === 0) {
        hydrating = false;
        return;
      }

      const searchInput = await waitFor(findSearchInput, 2500);
      if (!searchInput || cancelled) {
        hydrating = false;
        return;
      }

      for (const slug of requestedSelection) {
        if (cancelled) break;
        const scpi = knownScpis.find((item) => item.slug === slug);
        if (!scpi) continue;

        setControlledInputValue(searchInput, scpi.name);
        const card = await waitFor(() => findScpiCard(scpi.name), 1400);
        if (!card || cancelled) continue;

        const button = findSelectionButton(card);
        if (button?.textContent?.trim() === 'Ajouter') {
          button.click();
          await new Promise((resolve) => window.setTimeout(resolve, 90));
        }
      }

      if (!cancelled) {
        setControlledInputValue(searchInput, '');
        window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
      }
      hydrating = false;
    };

    const handleComparatorClick = (event: MouseEvent) => {
      if (hydrating) return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest<HTMLButtonElement>('button');
      if (!button) return;
      const label = button.textContent?.trim();
      if (label !== 'Ajouter' && label !== 'Choisie') return;

      const card = button.closest<HTMLElement>('div.bg-slate-800.rounded-2xl');
      if (!card) return;
      const slug = slugFromCard(card);
      if (!slug) return;

      const current = readStoredSelection();
      const next = label === 'Ajouter'
        ? normalizeSelection([...current, slug])
        : current.filter((item) => item !== slug);
      writeSelection(next);
    };

    const syncFromSidebar = () => {
      if (hydrating) return;
      const sidebar = document.getElementById('selection-sidebar');
      if (!sidebar) return;

      const text = sidebar.textContent || '';
      if (text.includes('Sélectionnez une ou plusieurs SCPI')) {
        writeSelection([]);
        return;
      }

      const selected = knownScpis
        .filter((scpi) => text.includes(scpi.name))
        .map((scpi) => scpi.slug)
        .slice(0, MAX_SELECTION_SIZE);

      if (selected.length > 0) writeSelection(selected);
    };

    const observer = new MutationObserver(() => {
      if (sidebarSyncTimer !== null) window.clearTimeout(sidebarSyncTimer);
      sidebarSyncTimer = window.setTimeout(syncFromSidebar, 80);
    });

    const comparator = document.getElementById('comparator-container') || document.body;
    observer.observe(comparator, { childList: true, subtree: true, characterData: true });
    document.addEventListener('click', handleComparatorClick, true);

    void hydrate();

    return () => {
      cancelled = true;
      observer.disconnect();
      document.removeEventListener('click', handleComparatorClick, true);
      if (sidebarSyncTimer !== null) window.clearTimeout(sidebarSyncTimer);
    };
  }, []);

  return null;
};

export default ComparatorSelectionBridge;
