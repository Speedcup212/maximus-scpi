# RECOVERY-077 — Publication SCPI progressive (validation propriétaire 03/11/2026)

## Principe
Le référencement public d'une SCPI et la certification complète de toutes ses données sont deux états distincts. Il est interdit de transformer une donnée absente ou ancienne en valeur courante. Les défauts circonscrits font l'objet d'un avertissement *au niveau du champ* et d'un blocage des calculs affectés, plutôt que d'une exclusion totale de la SCPI.

## États
- READY_CERTIFIED : l'intégralité des contrôles de certification est satisfaite.
- READY_WITH_RESERVES : identité et sources financières essentielles vérifiées, DIC et note présents, chiffres clés revus, UI privée conforme, réserves détaillées et fonctionnalités risquées neutralisées. **Prêt à une revue de publication**, pas publié ou approuvé par ce statut.
- BLOCKED : identité/source incertaine, document essentiel absent, données majeures incohérentes non contenues, présentation trompeuse, sécurité ou QA d'affichage non conforme.

## Règles non négociables
- Chaque valeur publiée conserve URL primaire, SHA du PDF, page, date de référence, unité. Une valeur issue du rapport annuel ne doit pas prendre la date du bulletin.
- Statuts anciens : citer explicitement la date de la version effectivement disponible, avertir sur la version plus récente non vérifiée ; ne pas prétendre appliquer des clauses obsolètes.
- Écart historique non résolu : conserver les nombres exacts du gestionnaire, **masquer les comparaisons dérivées non justifiées**. Ne pas corriger les nombres officiels.
- Absence de WALT/WALB ou autre champ non essentiel : non renseigné ; jamais zéro par défaut.
- Frais et liquidité : si des sources contradictoires ne peuvent être arbitrées, masquer le chiffre contesté ou bloquer la fonctionnalité exposée.
- DIC/SFDR non entièrement revus : ne pas générer de recommandation d'adéquation à partir de la fiche partielle.
- Statut provisoire visible sur les interfaces concernées ; même provenance dans fiche, comparateur, simulateurs, radar, trajectoire et espace client.
- La transition d'un état vers un autre doit être auditée et atomique. Le contrôleur ne doit pas se signer une revue humaine ni traiter cette vue comme une autorisation de publication.
- Conserver le contrôle exact du déploiement Netlify, du commit SHA, du catalogue, des RLS et du compteur anonyme public avant toute activation.

## SCPI pilote
Sofidynamic: bulletin T2 2026 et 29 preuves QA, DIC/NI 2026, 12 tests Chromium; derniers statuts 08/07/2026 à récupérer. Statuts signés 30/04/2026 disponibles mais version antérieure. Écart de -15 parts entre flux et stock T2, donc neutraliser la tendance des flux. Valeurs de réalisation/reconstitution au 31/12/2025 seulement. L'éligibilité avec réserves ne doit PAS afficher une prétendue certification complète.

## Mise en service
Le module `progressivePublication.mjs` définit les invariants métier; la vue privée `scpi_candidate_progressive_publication_v1` expose les réserves au contrôle backend. **La procédure de promotion atomique existante reste volontairement en circuit certifié tant que l'activation vérifiée des mentions légales/UI, l'enregistrement des exceptions et l'audit post-déploiement du circuit provisoire ne sont pas prouvés.**
