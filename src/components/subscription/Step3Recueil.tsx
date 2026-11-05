/**
 * Legacy route compatibility only.
 *
 * The former short recueil screen tried to send a client pre-dossier before
 * regulatory identity/origin-of-funds validation and conflated required consent
 * with marketing consent. Always reuse the canonical nine-step identity flow.
 */
export { default } from './Step3Identite';
