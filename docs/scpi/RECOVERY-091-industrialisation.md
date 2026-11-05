# RECOVERY-091 — Reprise vérifiable du pipeline SCPI

Contrôle du 4 novembre 2026, projet `Speedcup212/maximus-scpi`, base `88755a0fb6b674048f49a1976c243e7169a31642`. Branche dédiée demandée par le propriétaire : `recovery/091-scpi-certification-industrialisation`. Supabase et Netlify consultés en lecture seule. Aucune migration distante, correction financière, activation, fusion ou livraison autorisée par ce chantier.

## État réel et dénominateurs

L'export horodaté [des observations](evidence/recovery-091-sofidynamic-readonly.json) contient les 29 métriques, 11 allocations, documents, verrous privés, indicateur, analyse et historique lus dans Supabase. Il constitue un constat enregistré, jamais un certificat vivant. Son champ `captured_at` fait foi. Les métadonnées Netlify ont été consultées séparément le même jour.

- Catalogue et indicateurs publics : **69 identités**, dont Sofidynamic **publiée avec réserves** (`verified_primary_source_with_reserves`). Certification complète Sofidynamic : **0/1**.
- Vue de l'univers : **68** lignes `existing`, **65/68 = 95,59 %** satisfaisant les contrôles stricts et **52/68 = 76,47 %** portant une analyse certifiée. Ces deux taux ne mesurent pas une certification intégrale. La vue ne compte pas encore Sofidynamic comme 69e `existing`.
- **Total des SCPI intégralement certifiées : non établi par ces vues.** Ni le nom `certified_scpi_cohort`, ni 29/29 `qa_pass`, ni 52 analyses certifiées ne suffisent pour affirmer un taux global intégral. Le rapport conserve ce total à `null`.
- Netlify production : `6aea17c53e1b85d5bb20c94a`, état **READY**, SHA **88755a0fb6b674048f49a1976c243e7169a31642**, publié le 03/11/2026 à 17:24 UTC. GitHub Build verification [41683226596](https://github.com/Speedcup212/maximus-scpi/actions/runs/41683226596) : succès sur ce même SHA.
- Le registre d'activation progressive conserve la première activation `a00fde4237b13ef3607c98c263878dad2b37e638` / `6ae9f9dc0d78206579868195`. Cette preuve initiale ne certifie pas les corrections des six commits suivants. Aucun read-back HTTP anonyme actuel ni campagne navigateur distante complète n'a été exécuté ici ; READY n'est pas leur substitut.

## Sofidynamic : contrôle de chaque preuve

`observedCertification.mjs` rapproche **chacune des 29 lignes** du manifeste de seconde lecture existant : montant exact, période, unité, base sémantique, URL émetteur, page, identité et SHA du document validé. Il rapproche également **les 11 allocations** avec les valeurs publiques et leur PDF de même période. Le résultat `MATCHES_RECORDED_EVIDENCE` signifie concordance avec les preuves enregistrées, **pas nouvelle lecture binaire indépendante** ni approbation réglementaire.

Les téléchargements directs récents du site et des PDF Sofidy ont échoué (502 via l'outil web). Les binaires n'ont donc pas été réauthentifiés dans cette session. Le workflow existant `scpi-official-pdf-proof.yml` conserve la vérification HTTPS/TLS, téléchargement binaire, SHA, période, extraction et pages rendues sur le runner GitHub ; son résultat sur la PR doit être lu séparément.

| Preuve | Constat conservé | Limite |
|---|---|---|
| T1 2026 p.5 | 315 € × 672 775 = 211 924 125 € | Stock officiel, pas une explication des flux T2 |
| T2 2026 p.5 | 320 € × 773 714 = 247 588 480 €, soit 247,58848 M€ | Unités distinctes et contrôlées |
| T2 p.4 | TOF 97,73 % | Graphique : absence dans le texte OCR ne signifie pas absence officielle |
| T2 p.5 | Distribution 5,52 €/part ; retrait 313,60 € ; file 0 part | Zéro officiel de file ne garantit aucun délai de liquidité |
| RA 2025 p.9 | TD brut 9,04 % ; reconstitution 336,75 € ; réalisation 305,55 € | Arrêté 31/12/2025, jamais revalorisation T2 2026 |
| Flux T1→T2 p.5 | 672 775 + 101 076 − 122 = 773 729 ; stock publié 773 714 | Écart **−15 parts** inexpliqué, aucune correction fabriquée |
| Allocations T2 p.2 | 5 zones = 99,9 %, 6 secteurs = 100 % | Arrondi éditeur conservé ; verrous backend encore faux |
| Frais | Souscription 2 % HT/2,4 % TTC ; gestion 12 % HT/14,4 % TTC ; sortie T2 4,17 % HT/5 % TTC avant 8 ans | Bases et périodes dans le manifeste existant ; ne pas réutiliser les frais T1 pour T2 |
| DIC / note 2026 | Identité et binaire enregistrés, SHA/pages dans l'export | La vérification du type n'est pas un avis d'adéquation ni revue complète risques/SFDR |
| Statuts | PDF juillet 2025 historique uniquement, `kind_verified=false` | Dépôt actualisé du 08/07/2026 à obtenir et comparer ; pas de troisième document courant certifié |

Les 29 lignes sont `qa_pass` en staging, avec revue explicitement désignée **NOT_HUMAN**. Certaines provenances de l'indicateur public restent `pending_independent_qa`. L'analyse courante s'est régénérée en `review_required` / `current_source_certified=false`. L'historique public observé ne contient qu'un trimestre T1 ; la fixture privée de test en contient deux. Aucun test sur fixture ne doit certifier deux périodes de production.

## Causes racines et corrections

1. **Tests partiels sélectionnés manuellement.** Le build obligatoire ne lançait pas toutes les suites d'onboarding ; les correctifs UI ne déclenchaient pas systématiquement le préflight. La CI découvre maintenant tous les `*.test.mjs` et surveille les consommateurs, migrations, scripts et preuves concernés.
2. **Contrat navigateur périmé après publication progressive.** [Run 41680093513, job 126074855481](https://github.com/Speedcup212/maximus-scpi/actions/runs/41680093513/job/126074855481) : timeout à l'attente de « 2 périodes observées ». Le composant réellement monté interdit intentionnellement la comparaison non certifiée. Le test vérifie désormais cet état, l'absence de courbe et l'absence de valorisation annuelle antidatée, sans enlever les restrictions du catalogue.
3. **Deux gates SQL divergents.** La migration du 02/11 corrigeait `release_circuit_v3`, tandis que `allocation_certification_v1` conservait `pct_total=100`. Nouvelle migration **préparée seulement** : même tolérance d'une demi-unité d'arrondi par ligne, uniquement pour des valeurs à la décimale, avec conservation de tous les contrôles de libellé, valeur, QA forte, période, URL, SHA, page et identité. Le gate final et la revue restent obligatoires. Le test exécute l'ancienne vue puis la migration dans PostgreSQL éphémère, reproduit l'échec 99,9 %, et vérifie les mutations adverses, doublons, lignes manquantes, privilèges et `security_invoker`.
4. **Sortie prématurée du plugin après première activation.** `ALREADY_PUBLIC` contournait la vérification du rapport/stamp des builds suivants. Le contrôle post-build vérifie maintenant les deux preuves Chromium et leurs empreintes même si Sofidynamic existe déjà. Le registre de première activation n'est pas réécrit par ce changement.
5. **Classification permissive des entrées JSON.** Les chaînes `"false"` étaient truthy ; les dates impossibles/futures et le delta de parts inconnu pouvaient passer la classification progressive. Les flags doivent désormais être booléens explicites, les dates calendaires réelles, l'arrêté égal à la fin du trimestre et le delta connu. Les flux doivent porter sur deux trimestres consécutifs dans l'ordre. Aucun nouveau mécanisme d'approbation.
6. **Téléchargement navigateur systématique.** Le build local échouait sur un Chrome téléchargé en 403 malgré Chromium disponible. `ensureBuildBrowser.mjs` réutilise l'exécutable configuré ou le cache, et **lance réellement** le navigateur ; à défaut il conserve le téléchargement et l'échec bloquant. Aucun contrôle de rendu supprimé.
7. **Confusion de statuts et sources de comptage.** Le nouvel auditeur d'observations garde séparés catalogue, univers, QA de lignes, analyse, verrous complets et déploiement. Les rapports et le texte d’incident du remédiateur déclarent désormais explicitement leur périmètre de snapshot versionné, sans prétendre lire la certification courante Supabase. Les incidents réglementaires ne sont plus interprétables comme un PASS du simple remédiateur technique.

Les anciens workflows de publication GitHub sont déjà retirés (`if: false`) depuis RECOVERY-081. Leurs secrets Netlify/Supabase absents ne doivent pas être recréés pour ressusciter un second éditeur. Le propriétaire de publication existant reste Netlify natif. Les clés opaques `sb_secret_` restent dans `apikey`, jamais dans Bearer ; aucun privilège n'a été ajouté aux clients publics.

## Chaîne réutilisée pour les prochains lots

Aucun composant applicatif recréé. Les étapes existantes restent les points d'entrée :

1. Découverte : `discovery.mjs --manifest <manifest>` et index/registre officiels existants. Les sondes Sofidy demeurent spécifiques à cet émetteur ; adapter les manifestes et domaines documentés, jamais copier ses chiffres.
2. Binaire/extraction : `publisherPdfAudit.py`, archive immuable SHA, période/identité/pages, OCR et revue visuelle si graphique ; `secondPassPdfEvidence.py` pour le corpus Sofidynamic existant. Ne pas convertir l'extraction en certification.
3. Préflight générique : `preflight.mjs --manifest <manifest>` ; `candidateConsistency.mjs`, `datedEvidence.mjs`, contrôle allocations et périodes. Le manifeste multi-candidats et les identités permettent des lots de 100 sans constante de taille ; préserver chaque membre de la baseline 68.
4. Remédiation existante : `autoRemediate.mjs --scan --report test-results/scpi-auto-recovery/<lot>.json`. D'abord simulation ; écriture limitée aux dérivés démontrés et à l'ordre du staging via le workflow existant, PR obligatoire. Aucun chiffre officiel ou QA modifié.
5. Revue : compléter les registres privés existants, décisions responsables et preuves indépendantes autorisées, historique exact et analyse. Comparer un export récent avec `observedCertification.mjs`. Son code de sortie **1 = incohérence**, **2 = bloqué/revue requise** ; il ne délivre jamais d'autorisation.
6. Régressions : toutes les suites d'onboarding + SQL éphémère + suites applicatives existantes ; `browser.mjs` par manifeste, contrôles partiels existants, trajectoire et références publiées. Un lot réel nécessite les parcours authentifiés, responsive et outils effectivement utilisés ; les douze cas du pilote ne prouvent pas 100 fiches.
7. Publication conditionnelle : réutiliser `autonomousPreparedRelease.mjs`, les RPC atomiques et le plugin Netlify existants **après** décision et contrôles. SHA testé = SHA déployé, READY, rapport Chromium authentifié, OIDC/RLS et read-back public. Une fiche avec réserves reste exclue de la certification complète et des calculs neutralisés. Aucun lancement dans ce chantier.

Commande de rapprochement du constat archivé :

```sh
node scripts/scpi-onboarding/observedCertification.mjs \
  --observation docs/scpi/evidence/recovery-091-sofidynamic-readonly.json \
  --manifest scripts/scpi-onboarding/fixtures/sofidynamic-69-second-pass.json \
  --issuer-host www.sofidy.com
```

## Interventions et preuves encore nécessaires

- Récupérer les statuts opposables du dépôt 08/07/2026 auprès du RNE/INPI, greffe ou gestionnaire ; contrôler intégralité, identité, dates, SHA et différences d'articles. Pas d'accès authentifié ni de demande envoyée au gestionnaire dans cette session.
- Obtenir une explication primaire des −15 parts, ou décision responsable d'exception circonscrite avec neutralisation maintenue. Ni l'arithmétique ni un modèle ne peuvent inventer cette cause.
- Revue effective DIC/NI, risque/SFDR, frais et liquidité ; responsabilité identifiée et empreinte de la décision. Aucun faux signataire humain.
- Après validation seulement : tester/appliquer la migration, compléter la chaîne de provenance courante et les verrous, reconstruire les analyses/historiques sans surcertification, puis campagne navigateur sur le vrai déploiement et API anonyme/RLS. Ne pas changer les données pour faire passer le test.
- La généralisation opérationnelle à 100 nouvelles SCPI dépend de leurs documents officiels et des adaptations de découverte propres aux émetteurs. **Aucune garantie de certification automatique des 100 prochaines** n'est déduite du pilote bloqué.

## Validation de cette branche

- Suites Node onboarding et plugin : **103/103 PASS** sur la version finale ; gates existants de publication/cohorte : **15/15 PASS**.
- Suite applicative complète : **267/267 PASS**, 34 fichiers.
- Source QA Python hors réseau : **20/20 PASS**.
- PostgreSQL éphémère : **PASS**, ancienne anomalie reproduite, migration idempotente et mutations adverses refusées. La migration n'a pas été appliquée à Supabase.
- Chromium : **12/12 PASS** sur les surfaces progressives, **20/20 PASS** sur les deux SCPI BNP existantes, **2/2 PASS** pour le blocage de trajectoire Sofidynamic à 1 440/390 px. Le contrôle des références publiées existantes passe également : **8 cas PASS**. Ce sont des données de test sourcées, pas un contrôle anonyme distant de production.
- Rapprochement d'observations : **29/29 métriques + 11/11 allocations concordantes**, aucune incohérence de rapprochement ; résultat métier **BLOCKED** (code 2) et certification complète false.
- Build local initial : **FAIL configuration** (Chrome à télécharger en 403 puis variables publiques Supabase absentes). Chromium installé a produit **109/109 articles** lors du premier pré-rendu complet. Relance complète `CI=true PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium npm run build` : **PASS**, 109/109 articles, 302/302 URLs statiques, sitemap et contrôles fiscaux PASS. `SKIPPED_REMOTE` est explicite : ce build ne certifie aucune donnée distante. L’injection des variables publiques est ignorée selon le contrat CI existant ; validation CI sur SHA de PR à consigner séparément.
- Les fichiers générés du build, la cohorte et les données financières ne font pas partie du correctif. Aucun contournement de test, aucune attestation distante factice.

Résultats locaux et empreintes des journaux : [validation locale](evidence/recovery-091-local-validation.json). Les preuves locales portent sur le worktree modifié basé sur le SHA indiqué ; seule la CI de PR authentifie son SHA final.
