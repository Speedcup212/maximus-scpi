import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../types';

export const useProfile = (userId?: string | null) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    if (!supabase) {
      setError('Supabase non configuré.');
      setProfile(null);
      setLoading(false);
      return;
    }

    let isActive = true;
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!isActive) return;

      if (fetchError) {
        setError(fetchError.message);
        setProfile(null);
      } else {
        setProfile(data as Profile);
        setError(null);
      }
      setLoading(false);
    };

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, [userId]);

  return { profile, loading, error, setProfile };
};
