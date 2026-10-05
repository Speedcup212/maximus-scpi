import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    const queryProfile = async () => {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      return { data, fetchError };
    };

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      // Après un retour OAuth, le contexte React peut recevoir l'utilisateur
      // juste avant que la session soit pleinement attachée aux requêtes REST.
      // Attendre explicitement getSession évite une lecture anon transitoire.
      const { data: sessionData } = await supabase.auth.getSession();
      if (!isActive) return;

      if (!sessionData.session || sessionData.session.user.id !== userId) {
        setProfile(null);
        setError('Session utilisateur indisponible.');
        setLoading(false);
        return;
      }

      let { data, fetchError } = await queryProfile();

      // Une seule relance courte couvre le retour OAuth sans masquer une vraie erreur.
      if (!data && !fetchError) {
        await sleep(180);
        if (!isActive) return;
        await supabase.auth.getSession();
        ({ data, fetchError } = await queryProfile());
      }

      if (!isActive) return;

      if (fetchError) {
        setError(fetchError.message);
        setProfile(null);
      } else if (!data) {
        setError('Profil introuvable.');
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
