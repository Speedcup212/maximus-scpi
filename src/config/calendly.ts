// MaximusSCPI — URL Calendly centralisée
// Définir VITE_CALENDLY_URL dans .env / Netlify pour la production.
const FALLBACK_CALENDLY_URL =
  'https://calendly.com/eric-bellaiche/rdv-strategique-scpi';

export const CALENDLY_URL =
  import.meta.env.VITE_CALENDLY_URL || FALLBACK_CALENDLY_URL;
