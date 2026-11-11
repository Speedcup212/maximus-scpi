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

## Recette réelle après PR #423

- Fusion contrôlée `007b8f1adfc1f970f9d59c865fff8292192dd886`, après 84 étapes PASS de la CI `43106406084` et preview Netlify `6af4e2dc3862498211e07819` prêt.
- Migration Supabase `20261111214610`, pont OCR v8 déployé. Advisors sécurité : 9 constats préexistants avant/après, aucun nouveau.
- Dossiers Advenis : run `43107246708`, 3 source-proof + 3 QA PASS. Supabase : les 12 tâches sont `done`, les 3 QA portent `binary_proof_status=live_binary_proof`. Les 9 analyses amont restent à une seule tentative ; pas de remise à zéro du quota.
- OCR : run `43107246731`, Novapierre 1 2021-T4 extrait de l'original archivé : 10 pages, 18 507 caractères, SHA vérifié, `page_verified`. Cela ne certifie aucune valeur financière. Deux anciens bulletins de Paref Evo sont correctement bloqués faute de reconnaissance de leur ancienne dénomination ; défaut complémentaire corrigé ci-dessous.
- CORUM : second essai `43024447171/attempts/2`, 158 documents, 157 transactions reconnues / un refus `EXTENDED_PDF_HASH_OR_URL_MISMATCH` pour Origin 2026-T2. L'ancien PDF publié a le SHA `1c6a537714151489b38c7591140040262129187124acb170a14b171b977ed1dc`, le nouvel URL de novembre le SHA `faeb58603b932d09c9693e80e0302c3a29f247b4d335e5c3494c771c9b7cf3eb`. Aucune substitution de source. Tentative de relecture du précédent original chez CORUM : HTTP 403. Cette comparaison reste non résolue.
- Cycle pilote CORUM Origin : T3 2026 SHA `42dc72447853212c97b769ed027c998dd368faf3e73ea5763b3e00a7ae80fb43`, TOF 95,48 % p.4, 3 670 342 parts p.3, 0 part en attente p.3. Concordance `scpi_indicators`, `scpi_indicator_history`, `scpi_bulletin_analysis` et fiche réelle `https://maximusscpi.com/corum-origin/`, ainsi que preview #423. Rejeu d'un bulletin réel déjà découvert, pas preuve d'une nouvelle détection ni certification des 69 SCPI.

## Complément PAREF : identité historique, sans approbation financière

Le téléchargement d'archive est maintenant opérationnel ; les anciens noms n'étaient admis ni par le worker ni par son pont. Deux alias précis sont ajoutés seulement sur les PDF officiels PAREF, périodes antérieures au changement de nom (jusqu'à T2 2024 ou RA antérieurs à 2024). Les deux fonds ne sont jamais interchangeables ; ni nom générique, ni domaine ressemblant, ni période future ne passent.

Preuves juridiques primaires :

- PAREF Evo : résolution de modification de dénomination, page 18 du dépôt des comptes 2023 (AG 28 juin 2024), Interpierre Europe Centrale → PAREF Evo : https://www.pappers.fr/entreprise/paref-evo-880615463/comptes/PAREF%20EVO%20-%20Comptes%20sociaux%202023%2005-07-2024.pdf
- PAREF Hexa : résolution de modification de dénomination, page 30 (AG 11 juillet 2024), Interpierre France → PAREF Hexa : https://www.pappers.fr/entreprise/paref-hexa-383356755/comptes/PAREF%20HEXA%20-%20Comptes%20sociaux%202023%2002-08-2024.pdf

Tests ciblés : 9 Node et 4 Python PASS, incluant refus inter-fonds, faux domaines et période postérieure. Les quarantaines des vrais mauvais documents restent inchangées. Le retrait des seules quarantaines faussement causées par ces renommages et la reprise réelle doivent encore être prouvés.
