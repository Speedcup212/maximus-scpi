import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createSlugFromName } from '../../utils/scpiSlugMapper';
import ScpiTrajectoryTabs from './ScpiTrajectoryTabs';

const HOST_ATTR = 'data-maximus-analysis-trajectory-host';
const MODAL_ORDER_ATTR = 'data-maximus-analysis-modal-ordered';
const CONTENT_ATTR = 'data-maximus-analysis-content';
const ORDER_ATTR = 'data-maximus-analysis-order';
const GUTTER_ATTR = 'data-maximus-analysis-gutter';
const HIDDEN_ATTR = 'data-maximus-analysis-hidden';

const getDirectChild = (root: HTMLElement, node: HTMLElement | null): HTMLElement | null => {
  if (!node) return null;

  let current: HTMLElement | null = node;
  while (current?.parentElement && current.parentElement !== root) {
    current = current.parentElement;
  }

  return current?.parentElement === root ? current : null;
};

const findHeading = (
  root: HTMLElement,
  selector: 'h3' | 'h4',
  label: string,
): HTMLElement | null =>
  Array.from(root.querySelectorAll<HTMLElement>(selector)).find(
    (node) => node.textContent?.trim() === label,
  ) || null;

const markOrder = (
  node: HTMLElement | null,
  order: number,
  withGutter = false,
) => {
  if (!node) return;
  node.setAttribute(ORDER_ATTR, String(order));
  if (withGutter) node.setAttribute(GUTTER_ATTR, 'true');
};

const findDistributionGroup = (
  contentRoot: HTMLElement,
  sectorHeading: HTMLElement | null,
  geoHeading: HTMLElement | null,
): HTMLElement | null => {
  if (!sectorHeading || !geoHeading) return null;

  let current: HTMLElement | null = sectorHeading.parentElement;
  while (current && current !== contentRoot) {
    if (current.contains(geoHeading) && current.parentElement === contentRoot) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
};

const ORDER_STYLES = `
  [${MODAL_ORDER_ATTR}="true"] {
    display: flex !important;
    flex-direction: column !important;
  }

  [${MODAL_ORDER_ATTR}="true"] > * {
    flex: 0 0 auto;
  }

  [${CONTENT_ATTR}="true"] {
    display: contents !important;
  }

  [${CONTENT_ATTR}="true"] > * {
    margin-top: 0 !important;
  }

  [${HIDDEN_ATTR}="true"] {
    display: none !important;
  }

  [${ORDER_ATTR}="10"] { order: 10; }
  [${ORDER_ATTR}="20"] { order: 20; }
  [${ORDER_ATTR}="30"] { order: 30; }
  [${ORDER_ATTR}="40"] { order: 40; }
  [${ORDER_ATTR}="50"] { order: 50; }
  [${ORDER_ATTR}="60"] { order: 60; }
  [${ORDER_ATTR}="70"] { order: 70; }
  [${ORDER_ATTR}="80"] { order: 80; }
  [${ORDER_ATTR}="90"] { order: 90; }
  [${ORDER_ATTR}="100"] { order: 100; }
  [${ORDER_ATTR}="110"] { order: 110; }
  [${ORDER_ATTR}="200"] { order: 200; }

  [${GUTTER_ATTR}="true"] {
    margin-left: 1.5rem !important;
    margin-right: 1.5rem !important;
    margin-bottom: 2rem !important;
  }

  @media (max-width: 640px) {
    [${GUTTER_ATTR}="true"] {
      margin-left: 1rem !important;
      margin-right: 1rem !important;
      margin-bottom: 1.5rem !important;
    }
  }
`;

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
      const modalPanel = modalHeading.closest('.max-h-\\[90vh\\]') as HTMLElement | null;
      if (!modalRoot || !modalPanel) return;

      modalPanel.setAttribute(MODAL_ORDER_ATTR, 'true');

      const keyHeading = findHeading(modalRoot, 'h3', 'Chiffres clés');
      const riskHeading = Array.from(modalRoot.querySelectorAll<HTMLElement>('h4')).find((node) =>
        node.textContent?.trim().startsWith('Profil de Risque'),
      ) || null;
      const sectorHeading = findHeading(modalRoot, 'h3', 'Répartition Sectorielle');
      const geoHeading = findHeading(modalRoot, 'h3', 'Répartition Géographique');
      const radarHeading = findHeading(modalRoot, 'h3', 'Radar MaximusSCPI');
      const technicalHeading = findHeading(modalRoot, 'h3', 'Tableau de Bord Technique');
      const quarterlyHeading = findHeading(modalRoot, 'h3', 'Actualité Trimestrielle');
      const sourceHeading = findHeading(modalRoot, 'h3', 'Source & fraîcheur des données');
      const quickHeading = Array.from(modalRoot.querySelectorAll<HTMLElement>('h3')).find((node) =>
        node.textContent?.trim().startsWith('Lecture rapide'),
      ) || null;

      const keySection = getDirectChild(modalPanel, keyHeading);
      const radarSection = getDirectChild(modalPanel, radarHeading);
      const sourceSection = getDirectChild(modalPanel, sourceHeading);
      const quickSection = getDirectChild(modalPanel, quickHeading);

      // Le grand conteneur historique regroupe SRI, répartitions, tableau technique,
      // actualité trimestrielle et l'ancienne analyse. On l'identifie via un bloc
      // stable (Tableau de Bord Technique), et non via le titre Analyse MaximusSCPI
      // qui existe aussi dans le portail d'analyse consolidée.
      const contentRoot = technicalHeading
        ? getDirectChild(modalPanel, technicalHeading)
        : riskHeading
          ? getDirectChild(modalPanel, riskHeading)
          : null;

      if (!keySection || !radarSection || !contentRoot) return;

      contentRoot.setAttribute(CONTENT_ATTR, 'true');

      const riskSection = getDirectChild(contentRoot, riskHeading);
      const distributionsSection = findDistributionGroup(contentRoot, sectorHeading, geoHeading);
      const technicalSection = getDirectChild(contentRoot, technicalHeading);
      const quarterlySection = getDirectChild(contentRoot, quarterlyHeading);

      // L'analyse MaximusSCPI visible est désormais le portail de rationale consolidée.
      const rationaleHost = modalRoot.querySelector<HTMLElement>(
        '[data-vigilance-rationale-host="true"]',
      );

      const contentChildren = Array.from(contentRoot.children) as HTMLElement[];
      const legacyAnalysisSection = contentChildren.find((node) =>
        Array.from(node.querySelectorAll('h3')).some(
          (heading) => heading.textContent?.trim() === 'Analyse MaximusSCPI',
        ),
      ) || null;
      const noteSection = contentChildren.find((node) =>
        node.textContent?.includes('Note importante'),
      ) || null;

      contentChildren.forEach((node) => {
        if (
          node !== riskSection &&
          node !== distributionsSection &&
          node !== technicalSection &&
          node !== quarterlySection &&
          node !== noteSection &&
          node !== legacyAnalysisSection
        ) {
          if (node.className.includes('border-t')) {
            node.setAttribute(HIDDEN_ATTR, 'true');
          } else {
            markOrder(node, 110, true);
          }
        }
      });

      markOrder(keySection, 10);
      markOrder(riskSection, 20, true);
      markOrder(rationaleHost, 30);
      markOrder(distributionsSection, 40, true);
      markOrder(radarSection, 50);
      markOrder(technicalSection, 70, true);
      markOrder(quarterlySection, 80, true);
      markOrder(sourceSection, 90);
      markOrder(noteSection, 100, true);

      // L'ancien bloc Analyse est redondant avec le rationale consolidé.
      if (legacyAnalysisSection) {
        legacyAnalysisSection.setAttribute(HIDDEN_ATTR, 'true');
      }

      // Suppression visuelle du bloc redondant « Lecture rapide ».
      if (quickSection) {
        quickSection.setAttribute(HIDDEN_ATTR, 'true');
        quickSection.setAttribute('aria-hidden', 'true');
      }

      const footer = Array.from(modalPanel.children).find((node) =>
        node instanceof HTMLElement && node.className.includes('sticky') && node.className.includes('bottom-0'),
      ) as HTMLElement | undefined;
      markOrder(footer || null, 200);

      let host = modalRoot.querySelector<HTMLElement>(`[${HOST_ATTR}]`);
      if (!host) {
        host = document.createElement('div');
        host.setAttribute(HOST_ATTR, 'true');
        radarSection.insertAdjacentElement('afterend', host);
      } else if (host.previousElementSibling !== radarSection) {
        radarSection.insertAdjacentElement('afterend', host);
      }
      markOrder(host, 60);

      setTarget((current) => (current === host ? current : host));
      setScpiSlug((current) => (current === slug ? current : slug));
    };

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  if (!target || !scpiSlug) return null;

  return createPortal(
    <>
      <style>{ORDER_STYLES}</style>
      <ScpiTrajectoryTabs scpiSlug={scpiSlug} />
    </>,
    target,
  );
};

export default ComparatorAnalysisTrajectoryPortal;
