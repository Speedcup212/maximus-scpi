/**
 * Utilitaires PDF par page — usage scripts Node uniquement.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import pdfParse from 'pdf-parse';

export const RELEVANT_KEYWORDS = [
  'valeur de reconstitution',
  'valeur de réalisation',
  'valeur de realisation',
  'prix de souscription',
  'prix de retrait',
  'division du nominal',
  'division par',
  'multiplication par',
] as const;

export interface PdfPage {
  page: number;
  text: string;
}

export interface RankedPdf {
  fileName: string;
  absPath: string;
  docType: 'BT' | 'RA' | 'NI' | 'OTHER';
  score: number;
}

export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function pageMatchesKeywords(text: string): boolean {
  const n = normalizeText(text);
  return RELEVANT_KEYWORDS.some((kw) => n.includes(normalizeText(kw)));
}

/** Score de pertinence — pages les plus denses en indicateurs en priorité. */
export function scorePageRelevance(text: string): number {
  const n = normalizeText(text);
  let score = 0;
  for (const kw of RELEVANT_KEYWORDS) {
    if (n.includes(normalizeText(kw))) score += 10;
  }
  if (/division\s+par\s+\d/.test(n)) score += 25;
  if (/multiplication\s+par\s+\d/.test(n)) score += 15;
  if (n.includes('valeur de reconstitution')) score += 15;
  if (n.includes('prix de souscription')) score += 12;
  return score;
}

export async function extractPdfPages(absPath: string): Promise<PdfPage[]> {
  const buffer = readFileSync(absPath);
  const pages: PdfPage[] = [];

  await pdfParse(buffer, {
    pagerender: async (pageData: {
      getTextContent: (opts: object) => Promise<{ items: Array<{ str: string; transform: number[] }> }>;
    }) => {
      const textContent = await pageData.getTextContent({
        normalizeWhitespace: false,
        disableCombineTextItems: false,
      });

      let text = '';
      let lastY: number | undefined;
      for (const item of textContent.items) {
        if (lastY === item.transform[5] || lastY === undefined) {
          text += item.str;
        } else {
          text += '\n' + item.str;
        }
        lastY = item.transform[5];
      }

      pages.push({ page: pages.length + 1, text });
      return text;
    },
  });

  return pages;
}

export function classifyPdf(fileName: string): RankedPdf['docType'] {
  const n = normalizeText(fileName);
  if (/bti|bulletin|bt[_\s-]|trimestriel|semestriel/.test(n)) return 'BT';
  if (/rapport.?annuel|\bra\b/.test(n)) return 'RA';
  if (/note.?d.?information|\bni\b|statuts/.test(n)) return 'NI';
  return 'OTHER';
}

export function scorePdf(fileName: string, docType: RankedPdf['docType']): number {
  const n = normalizeText(fileName);
  let score = docType === 'BT' ? 100 : docType === 'RA' ? 50 : docType === 'NI' ? 30 : 0;
  if (n.includes('2026')) score += 20;
  else if (n.includes('2025')) score += 10;
  if (/t1|1t|s1|1s/.test(n)) score += 5;
  if (/t2|2t|s2|2s/.test(n)) score += 3;
  return score;
}

export function rankPdfsInFolder(folderAbs: string): RankedPdf[] {
  const files = readdirSync(folderAbs).filter((f) => f.toLowerCase().endsWith('.pdf'));
  return files
    .map((fileName) => {
      const docType = classifyPdf(fileName);
      return {
        fileName,
        absPath: join(folderAbs, fileName),
        docType,
        score: scorePdf(fileName, docType),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function filterRelevantPages(pages: PdfPage[]): PdfPage[] {
  return pages
    .filter((p) => pageMatchesKeywords(p.text))
    .sort((a, b) => scorePageRelevance(b.text) - scorePageRelevance(a.text));
}

export interface PageChunk {
  document: string;
  page: number;
  text: string;
}

export async function collectRelevantPageChunks(
  folderAbs: string,
  maxDocs = 3,
  maxPages = 6
): Promise<{ chunks: PageChunk[]; primaryDocument: string | null }> {
  const ranked = rankPdfsInFolder(folderAbs);
  const candidates: Array<PageChunk & { score: number }> = [];
  const seen = new Set<string>();

  for (const pdf of ranked.slice(0, maxDocs)) {
    const pages = await extractPdfPages(pdf.absPath);
    const relevant = filterRelevantPages(pages);
    for (const p of relevant) {
      const key = `${pdf.fileName}#${p.page}`;
      if (seen.has(key)) continue;
      seen.add(key);
      candidates.push({
        document: pdf.fileName,
        page: p.page,
        text: p.text,
        score: scorePageRelevance(p.text),
      });
    }
  }

  const chunks = candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPages)
    .map(({ document, page, text }) => ({ document, page, text }));

  return {
    chunks,
    primaryDocument: ranked[0]?.fileName ?? null,
  };
}

export function folderToScpiName(folder: string): string {
  const overrides: Record<string, string> = {
    'scpi ficommerce proximite': 'Ficommerce Proximité',
    'credit mutuel pierre 1': 'Crédit Mutuel Pierre 1',
    'scpi activimmo': 'Activimmo',
    'scpi aestiam horizon': 'Aestiam Horizon',
    'ncapregions': 'NCap Régions',
    'scpi  europa': 'EDR Europa',
    'paref evo': 'Paref Evo',
    'lf grand paris patrimoine': 'LF Grand Paris Patrimoine',
    'iroko atlas': 'Iroko Atlas',
    'epsicap nano': 'Epsicap Nano',
    'perial o2': 'Perial O2',
  };
  const key = normalizeText(folder);
  if (overrides[key]) return overrides[key];
  return folder.replace(/^SCPI\s+/i, '').trim();
}

export function isFicommerceFolder(folder: string): boolean {
  return normalizeText(folder).includes('ficommerce');
}

/**
 * Règle 8 : produits hors périmètre SCPI à exclure définitivement.
 * Kyaneos Denormandie 4 est un dispositif Denormandie, pas une SCPI.
 */
const EXCLUDED_SCPI_MARKERS = ['kyaneos denormandie', 'denormandie 4'];

export function isExcludedScpi(folderOrName: string): boolean {
  const n = normalizeText(folderOrName);
  return EXCLUDED_SCPI_MARKERS.some((m) => n.includes(m));
}
