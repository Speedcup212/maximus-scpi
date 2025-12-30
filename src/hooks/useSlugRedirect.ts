import { useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useSlugRedirect() {
  useEffect(() => {
    const checkRedirect = async () => {
      const currentSlug = window.location.pathname.replace(/^\//, '');

      if (!currentSlug) return;

      const { data, error } = await supabase
        .from('slug_redirects')
        .select('to_slug')
        .eq('from_slug', currentSlug)
        .eq('active', true)
        .maybeSingle();

      if (!error && data) {
        window.history.replaceState(null, '', `/${data.to_slug}`);
        window.location.reload();
      }
    };

    checkRedirect();
  }, []);
}
