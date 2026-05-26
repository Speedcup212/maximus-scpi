import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { PublishedTd, getSnapshotTd } from '../utils/publishedIndicators';
import { scpiIndicators } from '../data/scpiIndicators.generated';

/**
 * Fournit les TD publiables pour une liste de slugs SCPI.
 *
 * Priorité :
 *   1. Supabase scpi_indicators (lecture async, une seule requête par session)
 *   2. Snapshot publishable (scpiIndicators.generated.ts)
 *
 * Seuls les slugs présents dans scpiIndicators.generated.ts déclenchent une requête Supabase
 * (évite de requêter pour les 50+ SCPI non pilotes).
 *
 * Retour immédiat avec les valeurs snapshot ; mise à jour async quand Supabase répond.
 */
export function usePublishedTds(slugs: string[]): Record<string, PublishedTd> {
  const [tds, setTds] = useState<Record<string, PublishedTd>>({});
  const fetched = useRef(new Set<string>());
  const key = slugs.join(',');

  useEffect(() => {
    // Hydratation snapshot — synchrone, comble les entrées manquantes
    setTds(prev => {
      let next = prev;
      for (const slug of slugs) {
        if (!(slug in prev)) {
          const snap = getSnapshotTd(slug);
          if (snap) {
            if (next === prev) next = { ...prev };
            next[slug] = snap;
          }
        }
      }
      return next;
    });

    // Lecture Supabase — uniquement pour les slugs du snapshot non encore récupérés
    if (!supabase) return;
    const toFetch = slugs.filter(s => scpiIndicators[s] && !fetched.current.has(s));
    if (toFetch.length === 0) return;
    toFetch.forEach(s => fetched.current.add(s));

    supabase
      .from('scpi_indicators')
      .select('scpi_slug, td, td_annee')
      .in('scpi_slug', toFetch)
      .then(({ data, error }) => {
        if (error || !data) return;
        setTds(prev => {
          let next = prev;
          for (const row of data) {
            if (row.td == null) continue;
            const raw = typeof (row.td as unknown) === 'string'
              ? parseFloat(row.td as string)
              : Number(row.td);
            if (!isNaN(raw)) {
              if (next === prev) next = { ...prev };
              next[row.scpi_slug as string] = {
                value: raw * 100,
                year: (row.td_annee as number | null) ?? null,
                source: 'supabase',
              };
            }
          }
          return next;
        });
      });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return tds;
}
