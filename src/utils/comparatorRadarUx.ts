const RADAR_TITLE = 'Radar MaximusSCPI';

const getRadarBlocks = (scope: ParentNode = document): HTMLElement[] => {
  if (typeof document === 'undefined') return [];

  return Array.from(scope.querySelectorAll('h3'))
    .filter((heading) => heading.textContent?.trim() === RADAR_TITLE)
    .map((heading) => heading.parentElement?.parentElement?.parentElement)
    .filter((block): block is HTMLElement => block instanceof HTMLElement);
};

const replaceLeafText = (block: HTMLElement) => {
  const isMobile = window.matchMedia('(max-width: 639px)').matches;

  block.querySelectorAll<HTMLElement>('div, span, p').forEach((element) => {
    if (element.childElementCount > 0) return;
    const text = element.textContent?.trim() ?? '';

    if (text === 'Qualité') element.textContent = 'Solidité / valorisation';
    if (text === 'Taille') element.textContent = 'Capitalisation';
    if (text === 'Note globale') element.textContent = 'Note globale pondérée';

    if (text === 'Décomposition visuelle des cinq composantes de la note MaximusSCPI.') {
      element.textContent = 'Décomposition des cinq composantes pondérées de la note MaximusSCPI.';
    }

    if (text.startsWith('Chaque sommet reprend exactement le score affiché à droite.')) {
      element.textContent =
        'La note globale est pondérée : rendement 40 %, secteurs 20 %, géographie 15 %, solidité / valorisation 15 % et capitalisation 10 %. Le radar ne constitue ni une prévision de performance, ni une garantie de liquidité ou de capital.';
    }
  });

  block.querySelectorAll<SVGTextElement>('svg text').forEach((element) => {
    const text = element.textContent?.trim() ?? '';
    let replacement: string | null = null;

    if (/^Rendement(?:\s+\d+)?$/.test(text)) replacement = 'Rendement';
    else if (/^Secteurs(?:\s+\d+)?$/.test(text)) replacement = 'Secteurs';
    else if (/^Géographie(?:\s+\d+)?$/.test(text)) replacement = isMobile ? 'Géo.' : 'Géographie';
    else if (/^(?:Qualité|Solidité)(?:\s+\d+)?$/.test(text)) replacement = 'Solidité';
    else if (/^(?:Taille|Capitalisation|Capital\.)(?:\s+\d+)?$/.test(text)) {
      replacement = isMobile ? 'Capital.' : 'Capitalisation';
    }

    if (replacement && text !== replacement) element.textContent = replacement;
  });
};

const applyMobileLayoutFix = (block: HTMLElement) => {
  const isMobile = window.matchMedia('(max-width: 639px)').matches;
  const wrapper = block.querySelector<HTMLElement>('.recharts-wrapper');
  const surface = block.querySelector<SVGElement>('.recharts-surface');
  const chartContainer = wrapper?.parentElement as HTMLElement | null;

  if (wrapper) wrapper.style.overflow = 'visible';
  if (surface) surface.style.overflow = 'visible';

  if (chartContainer) {
    chartContainer.style.boxSizing = 'border-box';
    chartContainer.style.paddingLeft = isMobile ? '14px' : '';
    chartContainer.style.paddingRight = isMobile ? '14px' : '';
  }

  block.querySelectorAll<SVGTextElement>('.recharts-polar-angle-axis-tick-value').forEach((tick) => {
    tick.style.fontSize = isMobile ? '9.5px' : '';
    tick.style.fontWeight = '600';
  });
};

export const normalizeComparatorRadarUx = () => {
  if (typeof window === 'undefined') return;

  getRadarBlocks().forEach((block) => {
    replaceLeafText(block);
    applyMobileLayoutFix(block);
  });
};

export const observeComparatorRadarUx = () => {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') {
    return () => undefined;
  }

  let frame: number | null = null;
  const schedule = () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = null;
      normalizeComparatorRadarUx();
    });
  };

  schedule();

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  window.addEventListener('resize', schedule);

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', schedule);
    if (frame !== null) cancelAnimationFrame(frame);
  };
};
