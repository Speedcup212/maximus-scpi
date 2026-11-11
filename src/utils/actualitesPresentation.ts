import type { InvestmentNewsItem } from '../types/investmentNews';

/** Une date de détection n'est pas une date de publication : ne jamais les confondre à l'affichage. */
const publicationSortKey = (item: InvestmentNewsItem): string =>
  /^\d{4}-\d{2}-\d{2}$/.test(item.date || '')
    ? item.date
    : '';

export function sortNewsByPublication(items: readonly InvestmentNewsItem[]): InvestmentNewsItem[] {
  return [...items].sort((a, b) => {
    const dateOrder = publicationSortKey(b).localeCompare(publicationSortKey(a));
    if (dateOrder) return dateOrder;
    return (b.detectedAt || '').localeCompare(a.detectedAt || '');
  });
}

/** Une sélection variée : au plus une publication par SCPI, avec date connue. */
export function pickFeaturedNews(items: readonly InvestmentNewsItem[], limit = 3): InvestmentNewsItem[] {
  const featured: InvestmentNewsItem[] = [];
  const seen = new Set<string>();
  for (const item of sortNewsByPublication(items)) {
    if (!publicationSortKey(item)) continue;
    const key = item.scpi.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
    if (seen.has(key)) continue;
    seen.add(key);
    featured.push(item);
    if (featured.length === limit) break;
  }
  return featured;
}

function normalizeEditorialText(value: string): string {
  return value.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim().toLowerCase();
}

export function newsHeadline(item: InvestmentNewsItem): string {
  const raw = (item.title || '').replace(/\s+/g, ' ').trim();
  return raw ? raw.charAt(0).toLocaleUpperCase('fr') + raw.slice(1) : '';
}

/** Ne pas répéter un titre en guise de résumé, ni fabriquer de contenu éditorial. */
export function newsExcerpt(item: InvestmentNewsItem): string {
  const text = (item.summary || '').replace(/\s+/g, ' ').trim();
  const title = (item.title || '').replace(/\s+/g, ' ').trim();
  if (!text || normalizeEditorialText(text) === normalizeEditorialText(title)) return '';
  if (title && text.toLocaleLowerCase('fr').startsWith(title.toLocaleLowerCase('fr'))) {
    return text.slice(title.length).replace(/^[\s.\-:;,|]+/, '').trim();
  }
  return text;
}

export function withoutFeaturedNews(items: readonly InvestmentNewsItem[], featured: readonly InvestmentNewsItem[]): InvestmentNewsItem[] {
  const ids = new Set(featured.map((item) => item.id || `${item.scpi}|${item.title}|${item.date}`));
  return items.filter((item) => !ids.has(item.id || `${item.scpi}|${item.title}|${item.date}`));
}
