export type ScpiNewsEditorialCandidate = {
  title?: string | null;
  summary?: string | null;
  sourceUrl?: string | null;
  source_url?: string | null;
};
export declare function newsEditorialReviewReason(item: ScpiNewsEditorialCandidate | null | undefined): string | null;
export declare function isNewsEditoriallyValid(item: ScpiNewsEditorialCandidate | null | undefined): boolean;
