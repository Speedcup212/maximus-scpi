# MaximusSCPI — chaîne de données SCPI certifiée (cohorte active)

## Chaîne de production

1. **Détection** — Supabase `scpi-bulletin-watch` toutes les 30 min et Netlify `scpi-ingest-scheduled` quotidiennement. Les documents sont classés et datés, jamais publiés par simple extraction.
2. **Archivage** — URL d'éditeur autorisée, binaire PDF, empreinte SHA-256, période explicite et extraction de métriques ; conservation du PDF brut et des exceptions documentaires.
3. **Preuve indépendante** — `scpi-evidence-certify` rapproche chaque métrique des pages du PDF original. Les métriques non sourcées passent en revue, aucune valeur manquante n'est remplacée par zéro.
4. **Promotion automatique à privilèges restreints** — `scpi-certified-promote` vérifie l'appartenance aux 66 SCPI actives, la source d'origine, SHA, trimestre, confiance, 100 % de preuve de page, certificats concordants (montant/unité/page/URL), contrôles financiers et garde concurrent. Il ne promeut que des champs trimestriels explicitement certifiés.
5. **Publication / surfaces** — la mise à jour live en base est suivie d'une relecture puis d'une entrée `scpi_publish_queue`. Les surfaces reposant sur un snapshot statique (notamment l'historique) ne sont marquées livrées qu'après Netlify READY, bon SHA et contrôles fiche/comparateur/simulateurs/trajectoire.
6. **Exception** — anomalie PDF/TOF, source non éditeur, contradiction entre cap et parts, absence de valorisation officiellement datée, preuve incomplète, baisse de confiance ou conflit de trimestre : suspendre la promotion et conserver la dernière donnée certifiée avec sa date.

## Fréquences

- Watcher : minutes 00 et 30.
- Agent de preuve : minutes 15 et 45.
- Promoteur : minutes 20 et 50 (job Supabase `scpi-certified-promote-30m`).
- Backfill historique : quatre workers décalés par quarts d'heure.
- Netlify : build de production uniquement avec marqueur `[deploy]` et CI vérifiée ; pas de déploiement gratuit à chaque simple détection.

## Garde-fous de publication

- La sortie `auto_verified` d'un extracteur n'est **pas** une certification finale.
- Aucune donnée ne peut passer à un trimestre plus ancien ou écraser un snapshot manuel du même trimestre.
- TOF ASPIM ou TOF inférieur à 50 % : revue indépendante obligatoire, sans remplacement automatique.
- TOF pris exclusivement dans les bulletins de l'émetteur ; URL d'une copie tierce non promue comme originale.
- TD annuel et valorisations réalisation/reconstitution : date d'arrêté officielle exigée ; aucune interpolation pour les trimestres intermédiaires.
- Des événements `updated` ou des exécutions cron `succeeded` ne suffisent pas à certifier le site : contrôler l'identité du commit/déploiement, l'affichage et le rapprochement avec Supabase.

## Indicateurs de service

Couverture active = 66/66, taux des connecteurs opérationnels, âge de chaque dernier bulletin certifié, anomalies par source, dette de revues, revues résolues, certification au niveau champ, cohérence de l'historique, promotion vérifiée par readback, attente de release Netlify, état et SHA de la dernière publication.

Le taux 100 % **financier** exige le contrôle de chaque métrique déclarée par l'émetteur ; le taux 100 % **documentaire** ne doit pas être revendiqué si des PDF restent en attente de SHA ou d'archivage.
