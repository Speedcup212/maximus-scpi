# MaximusSCPI — livraison contrôlée provenance et sécurité des nombres (29 octobre 2026)

## Correctifs déjà exécutés et audités
- PR #232 : rattachement des bulletins à la bonne SCPI et au bon trimestre (Optimale 2021-T3 / 2022-T2, PAREF Hexa vs PAREF Evo). Les 20 certifications attribuées au mauvais document sont retirées de la table active et conservées avec leurs sources d'origine dans un audit privé. Aucun report de valeur fictive.
- Contrôle des titres et des pages de garde : un trimestre historique dans un tableau comparatif n'est plus une preuve que le bulletin appartient à cette période.
- Les références historiques renvoyant seulement une page de documentation sont conservées comme non résolues, sans nouvelle lecture quotidienne du même HTML. Les HTTP 403/404 sont classés comme indisponibilité de source, non comme donnée financière absente.
- Cinq URL officielles Praemia (Primovie 2024-T1/T4, Patrimmo Commerce 2024-T1/T2/T4) réintroduites dans la file de vérification indépendante.
- PR #233 : les nombres gigantesques issus de colonnes PDF fusionnées sont rejetés en Python et au niveau SQL. Les trois PDF Patrimmo Commerce concernés ont été remis en file.

## Garde-fous
Les bilans et preuves historiques restent distincts de la certification des 65 analyses courantes. Les champs numériques contestés restent **needs_review** ; un PDF non publié sur un site officiel ne devient pas une absence de valeur ni une valeur inventée.

## Critère de clôture
La livraison technique doit réussir les tests métier/navigateurs, la certification OIDC du registre de 65 SCPI et Netlify. **Elle ne signifie pas que les 1 480 documents historiques sont financièrement certifiés.** Les sources officielles encore manquantes et les incohérences restent à traiter sans assouplissement des règles.
