import { describe, expect, it } from 'vitest';
import news from '../../data/news/scpi-investment-news-latest.json';
import { isNewsEditoriallyValid, newsEditorialReviewReason } from './scpiNewsEditorialGate.mjs';

describe('Actualités — contrôle anti extraction de navigation', () => {
  const valid = {
    date: '2026-10-21',
    title: 'Cristal Life acquiert un immeuble de bureaux à Dublin pour 27,65 M€',
    summary: 'Cristal Life a acquis un immeuble de bureaux de 3 167 m² à Dublin, occupé par Regus.',
    sourceUrl: 'https://www.inter-gestion.com/corpo/inter-gestion-reim',
  };

  it('conserve une acquisition concrète avec prix, surface, locataire', () => {
    expect(isNewsEditoriallyValid(valid)).toBe(true);
  });

  it('bloque le faux titre InterGestion et le texte de navigation', () => {
    const wrong = {
      title: 'InterGestion',
      summary: 'TAL Rente CRISTAL Life Votre profil CGP Jeune actif Célibataire ou en couple Relations associés 01 43 12 52 52 Relations partenaires Souscrire Simulateur SCPI gérées',
      sourceUrl: 'https://www.inter-gestion.com/corpo/acquisition-cristal-life-dublin%60',
    };
    expect(newsEditorialReviewReason(wrong)).toBeTruthy();
    expect(newsEditorialReviewReason({ ...valid, summary: wrong.summary })).toMatch(/Résumé contaminé/);
    expect(newsEditorialReviewReason({ ...valid, sourceUrl: wrong.sourceUrl })).toMatch(/caractère parasite/);
  });

  it('écarte les pages index et hors catégorie acquisition', () => {
    for (const title of [
      'Actualités de FIDUCIAL Gérance',
      'Epsicap Nano : résultats du 3e trimestre 2026',
      'Epsicap REIM franchit les 300 M€ sous gestion',
    ]) expect(isNewsEditoriallyValid({ ...valid, title })).toBe(false);
  });

  it('rejette une actualité sans date, une date de détection déguisée ou un titre répété', () => {
    expect(newsEditorialReviewReason({ ...valid, date: '' })).toMatch(/Date de publication/);
    expect(newsEditorialReviewReason({ ...valid, summary: valid.title })).toMatch(/Texte trop court|copie du titre/);
    expect(newsEditorialReviewReason({ ...valid, date: '2099-01-01' })).toMatch(/Date de publication/);
  });

  it('ne rejette pas un communiqué qui emploie un mot de navigation isolé', () => {
    expect(isNewsEditoriallyValid({ ...valid, summary: 'La SCPI Cristal Life acquiert un actif. Pour en savoir plus, contactez-nous.' })).toBe(true);
  });

  it('garantit le fallback local intégralement validé', () => {
    expect(news.length).toBeGreaterThanOrEqual(33);
    expect(news.every(isNewsEditoriallyValid)).toBe(true);
    const cristals = news.filter((e) => e.scpi === 'Cristal Life');
    expect(cristals).toHaveLength(1);
    expect(cristals[0].summary).toContain('Regus');
    expect(cristals[0].summary).toContain('3 167 m²');
    expect(cristals[0].sourceUrl).toMatch(/^https:\/\/www\.inter-gestion\.com\/corpo\//);
  });
});
