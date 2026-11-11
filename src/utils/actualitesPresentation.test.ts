import { describe, expect, it } from 'vitest';
import type { InvestmentNewsItem } from '../types/investmentNews';
import { newsExcerpt, newsHeadline, pickFeaturedNews, sortNewsByPublication, withoutFeaturedNews } from './actualitesPresentation';

const item = (scpi: string, date: string, title: string, other: Partial<InvestmentNewsItem> = {}): InvestmentNewsItem => ({
  scpi, date, title, summary: title, detectedAt: '2026-11-11T05:00:00Z',
  id: `${scpi}-${title}`, managementCompany: '', operationType: 'acquisition',
  assetType: 'bureaux', country: '', city: '', area: '', address: '',
  tenant: '', amount: '', surface: '', leaseDuration: '',
  sourceUrl: 'https://example.org/news', sourceOfficial: true,
  investmentRelated: true, dataQuality: 'standard', editorialPriority: 2,
  confidence: 0.9, disclaimer: '', ...other,
});

describe('Actualités : présentation sans hallucinations et sans doublons', () => {
  it('sélectionne trois SCPI différentes dans l’ordre des publications', () => {
    const input = [
      item('Transitions Europe', '2026-11-04', 'A'),
      item('Transitions Europe', '2026-11-03', 'B'),
      item('Cœur d’Europe', '2026-11-02', 'C'),
      item('Iroko Zen', '2026-11-01', 'D'),
      item('SCPI sans date', '', 'E'),
    ];
    const picked = pickFeaturedNews(input);
    expect(picked.map((n) => n.scpi)).toEqual(['Transitions Europe', 'Cœur d’Europe', 'Iroko Zen']);
    expect(withoutFeaturedNews(input, picked).map((n) => n.title)).toEqual(['B', 'E']);
  });

  it('ne traite pas la date de détection comme une date de publication', () => {
    const undated = item('Sans date', '', 'A', { detectedAt: '2026-12-01' });
    const dated = item('Datée', '2026-10-01', 'B', { detectedAt: '2026-09-01' });
    expect(sortNewsByPublication([undated, dated])[0]).toBe(dated);
    expect(pickFeaturedNews([undated, dated])).toEqual([dated]);
  });

  it('ne répète pas un titre comme résumé', () => {
    const base = item('Test', '2026-11-01', 'Acquisition en France');
    expect(newsExcerpt(base)).toBe('');
    expect(newsExcerpt({ ...base, summary: 'Acquisition en France. Local commercial loué.' })).toBe('Local commercial loué.');
    expect(newsHeadline({ ...base, title: 'acquisition en France' })).toBe('Acquisition en France');
  });
});
