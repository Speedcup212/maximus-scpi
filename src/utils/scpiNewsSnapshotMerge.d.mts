export declare function reconcileScpiNewsSnapshot<T extends {
 id?: string; scpi?: string; date?: string; city?: string; country?: string;
 assetType?: string; sourceUrl?: string; title?: string; summary?: string;
 sourceOfficial?: boolean; investmentRelated?: boolean; dataQuality?: string;
 editorialPriority?: number;
}>(approved: readonly T[] | null | undefined,newCandidates: readonly T[] | null | undefined): T[];
