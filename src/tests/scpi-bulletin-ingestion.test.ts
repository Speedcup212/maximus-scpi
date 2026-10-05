import { describe, expect, it } from 'vitest';
import { extractPdfLinks } from '../../netlify/functions/utils/scpi-bulletin-ingestion';

describe('official bulletin discovery document exclusions', () => {
  it('keeps the quarterly bulletin and excludes the actual Altixia ISR report', () => {
    const html = `<a href="/medias/documentations/doc1-20260730-213819.pdf">Bulletin 2e trimestre 2026</a>
      <a href="/medias/documentations/rapport-isr-scpi-altixia-commerces-2023-235.PDF">Altixia Commerces</a>`;
    expect(extractPdfLinks(html, 'https://www.altixia.fr/scpi-altixia-commerces.php').map(x => x.url))
      .toEqual(['https://www.altixia.fr/medias/documentations/doc1-20260730-213819.pdf']);
  });

  it('excludes annual and ISR reports across URL and label separators, including script PDF links', () => {
    const html = `<a href="/rapport_annuel_2025.pdf">Altixia</a>
      <a href="/report.pdf">Rapport ISR SCPI Altixia</a>
      <script>const document="/rapport-isr-2025.pdf";</script>
      <a href="/bulletin.pdf">Bulletin T2 2026</a>`;
    expect(extractPdfLinks(html, 'https://www.altixia.fr/').map(x => x.url))
      .toEqual(['https://www.altixia.fr/bulletin.pdf']);
  });
});
