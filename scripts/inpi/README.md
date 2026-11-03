# MaximusSCPI — collecte des actes et statuts INPI (RNE)

Source : documentation officielle INPI API Actes v4.0 (juin 2025) :
https://www.inpi.fr/sites/default/files/2025-06/documentation%20technique%20API%20Actes%20v4.0.pdf

## Architecture

La synchronisation interroge les SCPI par SIREN (jamais leur société de gestion) :
1. Authentification serveur via POST /api/sso/login et jeton Bearer conservé en mémoire.
2. GET /api/companies/{siren}/attachments pour identifier les actes.
3. GET /api/actes/{id}/download uniquement pour une pièce publique non supprimée.
4. Contrôle du PDF, empreinte SHA-256, dépôt dans le bucket privé existant scpi-bulletins, dossier inpi/.
5. Métadonnées dans public.scpi_inpi_documents, avec RLS activée et accès service_role seulement.
6. Lorsque INPI signale deleted=true ou une pièce non publique : retrait de l'objet stocké, statut withdrawn/restricted.

Aucune publication publique automatique, aucune modification financière, aucune attestation juridique automatique.

## Activation sécurisée

1. Changer les identifiants SFTP exposés dans la capture d'écran ; ils ne doivent pas être utilisés pour l'API.
2. GitHub > Settings > Secrets and variables > Actions > Repository secrets :
   - INPI_API_USERNAME : email du compte E-procédures autorisé pour l'API.
   - INPI_API_PASSWORD : mot de passe du compte E-procédures, pas le mot de passe SFTP.
   - SUPABASE_URL : URL du projet MaximusSCPI.
   - SUPABASE_SERVICE_ROLE_KEY : clé secrète, jamais côté navigateur.
3. Insérer une SCPI pilote dans public.scpi_inpi_entities avec son SIREN justifié par une preuve officielle, verified=true, verified_at et verification_source.
4. Fusionner la PR après tests.
5. Lancer manuellement le workflow INPI RNE depuis Actions, avec limit=1, max_downloads=50.
6. Vérifier les métadonnées privées, les PDF, les SHA-256 et le traitement des retraits INPI.
7. Étendre les SIREN vérifiés puis configurer la variable GitHub Actions INPI_RNE_ENABLED=true pour la collecte quotidienne à 05:20 UTC.

Le workflow planifié reste désactivé sans cette variable. Aucun identifiant en clair ne doit être versionné.

## Diagnostics et limites

- Tests offline : node --test scripts/inpi/lib.test.mjs.
- Collecte avec secrets en environnement : node scripts/inpi/sync.mjs.
- Pas de correspondance automatique incertaine entre nom de SCPI et SIREN.
- Tentatives limitées sur 429/5xx, échec explicite sur 401/403.
- Suivi source_updated_at et quota INPI_MAX_DOWNLOADS pour éviter les reprises inutiles.
- Une erreur transitoire ne retire pas un PDF déjà validé.
- Les secrets API ne sont pas encore configurés par cette PR et aucun téléchargement de production n'est vérifié.
- La récupération des comptes annuels INPI sera un module distinct ; cette version collecte les actes et statuts.
