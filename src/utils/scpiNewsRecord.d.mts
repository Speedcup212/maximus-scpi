export interface VerifiedScpiNews {
  text: string;
  period: string;
  documentDate: string;
  sourceDocument: string;
  sourceUrl: string;
}
export function getVerifiedScpiNews(record: unknown): VerifiedScpiNews | null;
export function buildScpiEditorialNews(analysis: unknown, bulletin: unknown): {
  status: 'verified'; text: string; period: string; document_date: string;
  source_document: string; source_url: string;
} | null;
