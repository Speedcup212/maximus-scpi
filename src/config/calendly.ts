// MaximusSCPI — URL Calendly centralisée
// Fallback explicite si VITE_CALENDLY_URL n'est pas défini en production.
export const CALENDLY_URL =
  import.meta.env.VITE_CALENDLY_URL ||
  'https://calendly.com/eric-bellaiche/seance-decouverte-du-fonctionnement-des-scpi-clone'
