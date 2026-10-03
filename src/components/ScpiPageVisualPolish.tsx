import React, { useEffect } from 'react';

interface ScpiPageVisualPolishProps {
  scpiSlug: string;
}

const getText = (node: Element | null) => (node?.textContent || '').replace(/\s+/g, ' ').trim();

const ScpiPageVisualPolish: React.FC<ScpiPageVisualPolishProps> = ({ scpiSlug }) => {
  useEffect(() => {
    let frame = 0;

    const applyPolish = () => {
      const headings = Array.from(document.querySelectorAll('h1'));
      const heroTitle = headings.find((heading) => /^SCPI\s/i.test(getText(heading)));

      if (heroTitle) {
        const leftColumn = heroTitle.parentElement;
        const heroGrid = leftColumn?.parentElement;
        const heroInner = heroGrid?.parentElement;
        const heroRoot = heroInner?.parentElement;

        heroRoot?.classList.add('scpi-polished-hero');
        heroGrid?.setAttribute('data-scpi-hero-grid', 'true');

        heroTitle.querySelectorAll(':scope > span').forEach((span) => {
          (span as HTMLElement).classList.add('scpi-polish-hide');
        });

        if (leftColumn) {
          const badge = leftColumn.firstElementChild as HTMLElement | null;
          if (badge && !badge.dataset.maximusPolishedBadge) {
            const sourceNode = Array.from(leftColumn.querySelectorAll('div')).find((node) =>
              getText(node).startsWith('Source :')
            );
            const sourceText = getText(sourceNode);
            const periodMatch = sourceText.match(/(20\d{2})-T([1-4])/i);
            const period = periodMatch ? `T${periodMatch[2]} ${periodMatch[1]}` : 'DONNÉES À JOUR';

            badge.textContent = `ANALYSE MAXIMUSSCPI · ${period}`;
            badge.dataset.maximusPolishedBadge = 'true';
          }

          const directChildren = Array.from(leftColumn.children) as HTMLElement[];
          const advantages = directChildren.find((node) => {
            const text = getText(node);
            const checkCount = node.querySelectorAll('svg').length;
            return node.classList.contains('space-y-4') && checkCount >= 2 && !/chiffres essentiels/i.test(text);
          });
          advantages?.classList.add('scpi-polish-hide');
        }

        const aside = heroGrid?.querySelector(':scope > aside') as HTMLElement | null;
        if (aside) {
          aside.classList.add('scpi-polish-cta');
          const helper = Array.from(aside.querySelectorAll('p')).find((node) =>
            /formulaire complet est disponible plus bas/i.test(getText(node))
          );
          helper?.classList.add('scpi-polish-hide');
        }
      }

      // Harden the 3x3 "Chiffres essentiels" matrix on narrow screens.
      // We tag the section and its metric cards without depending on the source component markup.
      const essentialLabel = Array.from(document.querySelectorAll('h2, h3, p, div')).find((node) =>
        /^les chiffres essentiels$/i.test(getText(node))
      ) as HTMLElement | undefined;

      if (essentialLabel) {
        let section: HTMLElement | null = essentialLabel.parentElement;
        while (section && section !== document.body) {
          const grids = Array.from(section.querySelectorAll('.grid')) as HTMLElement[];
          const metricsGrid = grids.find((grid) => grid.children.length >= 6);
          if (metricsGrid) {
            section.classList.add('scpi-polish-essentials');
            metricsGrid.classList.add('scpi-polish-essentials-grid');
            Array.from(metricsGrid.children).forEach((card) => {
              (card as HTMLElement).classList.add('scpi-polish-essential-card');
              const children = Array.from(card.children) as HTMLElement[];
              const value = children.find((child) => {
                const text = getText(child);
                return /^(?:ND|[-+]?\d[\d\s.,]*(?:\s?(?:%|€|M€))?)$/i.test(text);
              });
              value?.classList.add('scpi-polish-essential-value');
            });
            break;
          }
          section = section.parentElement;
        }
      }

      const patrimoineTitle = Array.from(document.querySelectorAll('h2')).find((heading) =>
        /^Où investit\s/i.test(getText(heading))
      );

      if (patrimoineTitle) {
        let section: HTMLElement | null = patrimoineTitle.parentElement;
        while (section && section !== document.body) {
          const className = typeof section.className === 'string' ? section.className : '';
          if (className.includes("bg-[#F8FAFC]") || className.includes('bg-white py-10')) break;
          section = section.parentElement;
        }

        if (section && section !== document.body) {
          section.classList.add('scpi-polish-patrimoine');
          section.querySelectorAll('h3').forEach((heading) => {
            const card = heading.parentElement?.parentElement as HTMLElement | null;
            if (card) card.classList.add('scpi-polish-patrimoine-card');
          });
        }
      }

      document.querySelectorAll('div[aria-hidden="true"]').forEach((node) => {
        const element = node as HTMLElement;
        if (typeof element.className === 'string' && element.className.includes('bg-gradient-to-b')) {
          element.classList.add('scpi-polish-spacer');
        }
      });
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(applyPolish);
    };

    applyPolish();
    const retry = window.setTimeout(applyPolish, 700);
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(retry);
      observer.disconnect();
    };
  }, [scpiSlug]);

  return (
    <style>{`
      .scpi-polish-hide { display: none !important; }

      .scpi-polished-hero > div {
        padding-top: 2rem !important;
        padding-bottom: 2rem !important;
      }

      .scpi-polished-hero h1 {
        max-width: 860px;
        margin-bottom: 0 !important;
      }

      .scpi-polished-hero [data-scpi-hero-grid="true"] > div:first-child {
        row-gap: 1.35rem !important;
      }

      .scpi-polished-hero [data-maximus-polished-badge="true"] {
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .scpi-polish-cta > div {
        background: linear-gradient(145deg, rgba(15, 23, 42, .97), rgba(8, 40, 35, .97)) !important;
        border: 1px solid rgba(0, 200, 150, .34) !important;
        color: #f8fafc !important;
        box-shadow: 0 22px 55px rgba(0, 0, 0, .28) !important;
      }

      .scpi-polish-cta h2,
      .scpi-polish-cta p:first-of-type { color: #f8fafc !important; }
      .scpi-polish-cta h2 + p { color: #b8c5d1 !important; }

      .scpi-polish-cta .grid > div {
        background: rgba(255, 255, 255, .055) !important;
        border: 1px solid rgba(255, 255, 255, .08);
        color: #d9e4ec !important;
      }

      .scpi-polish-cta button { box-shadow: 0 14px 30px rgba(0, 200, 150, .18) !important; }
      .scpi-polish-spacer { height: 24px !important; min-height: 24px !important; }

      .scpi-polish-patrimoine {
        background: #071018 !important;
        padding-top: 2.75rem !important;
        padding-bottom: 2.75rem !important;
      }

      .scpi-polish-patrimoine h2,
      .scpi-polish-patrimoine h3 { color: #f8fafc !important; }

      .scpi-polish-patrimoine p,
      .scpi-polish-patrimoine span { color: #aebdca !important; }

      .scpi-polish-patrimoine-card {
        background: linear-gradient(145deg, #0d1821, #101d25) !important;
        border: 1px solid rgba(148, 163, 184, .14) !important;
        box-shadow: 0 18px 45px rgba(0, 0, 0, .22) !important;
      }

      .scpi-polish-patrimoine-card h3,
      .scpi-polish-patrimoine-card span.font-semibold { color: #f8fafc !important; }

      .scpi-polish-essential-value {
        white-space: nowrap !important;
        overflow: visible !important;
        max-width: 100%;
        font-variant-numeric: tabular-nums;
      }

      @media (min-width: 1024px) {
        .scpi-polished-hero [data-scpi-hero-grid="true"] {
          grid-template-columns: minmax(0, 1.3fr) minmax(360px, .7fr) !important;
          gap: 2rem !important;
        }

        .scpi-polish-cta {
          width: 100%;
          max-width: 390px;
          justify-self: end;
        }
      }

      @media (max-width: 1023px) {
        .scpi-polish-cta { max-width: 560px; }
      }

      @media (max-width: 640px) {
        .scpi-polish-essentials-grid {
          gap: .7rem !important;
        }

        .scpi-polish-essential-card {
          min-width: 0 !important;
          padding-left: .7rem !important;
          padding-right: .7rem !important;
        }

        .scpi-polish-essential-value {
          font-size: clamp(1.55rem, 6.1vw, 2.15rem) !important;
          line-height: 1.05 !important;
          letter-spacing: -.035em !important;
        }
      }

      @media (max-width: 390px) {
        .scpi-polish-essentials-grid { gap: .5rem !important; }
        .scpi-polish-essential-card {
          padding-left: .5rem !important;
          padding-right: .5rem !important;
        }
        .scpi-polish-essential-value {
          font-size: clamp(1.35rem, 5.8vw, 1.75rem) !important;
        }
      }
    `}</style>
  );
};

export default ScpiPageVisualPolish;
