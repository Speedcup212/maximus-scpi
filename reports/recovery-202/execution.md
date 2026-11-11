# RECOVERY-202 — réparation documentaire, 11 novembre 2026

Mission autorisée : corriger les agents existants, sans nouvel orchestrateur. Base de production : `8535b1c02f86c13c306fcc249ee797abede2d6c2`.

## Causes reproduites

- CORUM run [43024447171](https://github.com/Speedcup212/maximus-scpi/actions/runs/43024447171), artefact 13857002304 : 158 PDF inspectés, 81 transactions refusées. Reproduction sous `SET LOCAL ROLE service_role` : `42501 permission denied for function tof_explicit_vacancy_conflict`. Le GRANT d'exécution sur ce seul prédicat pur rétablit la transaction ; aucun garde financier désactivé.
- Dossiers quotidiens run [43050275192](https://github.com/Speedcup212/maximus-scpi/actions/runs/43050275192) : les 3 dossiers Advenis ont des sources hachées mais leur domaine officiel manque au registre autorisé. Ajout exact `www.advenis-reim.com`, sans wildcard et sans approbation financière.
- OCR run [43022330262](https://github.com/Speedcup212/maximus-scpi/actions/runs/43022330262) : HTTP 502 du téléchargement PAREF, après claim réussi. Ce n'est pas une panne d'authentification OIDC. Les 14 PDF des tâches en échec ont des originaux archivés dans Storage. Reprise sur le PDF exact du bulletin : bail actif, source identique, chemin canonique, taille et SHA-256 vérifiés côté serveur et worker. Aucun secret de Storage transmis au worker.
- Le rejeu du workflow quotidien ne constitue pas une réparation : le garde `run_attempt == 1` interdit sa matrice, ce qui pouvait donner un vert sans preuve. Conservation des quotas et refus OIDC ; ajout d'un refus CI explicite des reruns. Un push validé sur main reprend désormais la cohorte SQL quotidienne existante, idempotente.

## Validation locale avant publication

- Vitest : 322/322 PASS.
- Contrats agents, preuve binaire, planification et syntaxe workflows : 115/115 PASS avant le nouveau cas de reprise ; cas supplémentaire validé séparément.
- Watchdog existant : 11/11 PASS.
- CORUM : 34/34 tests Python PASS.
- Reprise OCR : 5 tests comportementaux du handler serveur, 3 tests Python et 3 contrats de quarantaine PASS ; syntaxe TypeScript : aucun diagnostic.
- Migration testée en transaction annulée : vacance 10,3 % toujours rejetée face au TOF 89,7 %, droits publics inchangés, faux domaine refusé. Puis appliquée et enregistrée dans Supabase sous `20261111214610`.
- Build local standard bloqué par l'IPC Unix de `tsx` dans l'environnement ; recette locale avec les mêmes scripts via `node --import tsx`, et CI distante exacte à vérifier avant fusion.

## État

EN COURS. Les corrections SQL sont appliquées. Les relances GitHub, le déploiement du pont OCR, le build/preview et le cycle jusqu'à la fiche doivent être vérifiés et consignés avant clôture. Aucun candidat promu, aucune certification financière déclarée à ce stade.
