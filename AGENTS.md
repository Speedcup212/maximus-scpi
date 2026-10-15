# AGENTS.md — Règles opérationnelles MaximusSCPI

## Mode actif : RECOVERY

Depuis le 05/10/2026, le chantier est en mode Recovery.

- Branche de travail unique : `recovery/maximus-clean-20261005`.
- Golden base : production stable `cf5ee9e158f4f0ef5ab5cd9336163effa83c2427`.
- `main` n'est pas une source de vérité pour la release tant que RC-1 n'est pas validée.
- Une seule tâche P0 active à la fois.
- Aucun déploiement Netlify avant `RECOVERY-004`, sauf hotfix de production explicitement autorisé.
- Aucun nouveau chantier produit pendant Recovery.

## Rôle du superviseur IA

Exécuter techniquement les missions du rail Recovery, dans l'ordre de `tasks/backlog.md`.
Ne jamais ouvrir un nouveau périmètre tant que la tâche active n'est pas testée et clôturée.

---

## Règles absolues

### Périmètre d'intervention
- Toute modification doit appartenir à une tâche `RECOVERY-*` écrite.
- Aucun commit direct sur `main`.
- Aucun refactoring global.
- Aucun changement de route, Supabase, logique SCPI ou UI hors périmètre exact de la tâche active.
- Aucun déploiement Netlify depuis une branche de travail non validée.

### WIP
- **WIP limit = 1 P0**.
- Une tâche suivante ne démarre qu'après clôture de la précédente.
- Les travaux gelés restent gelés même s'ils sont faciles ou attractifs.

### Cycle obligatoire
1. Identifier la tâche Recovery active.
2. Lister le périmètre exact des fichiers.
3. Exécuter la correction ciblée.
4. Exécuter les tests nommés.
5. Documenter les preuves et limites.
6. Clôturer la tâche.
7. Seulement ensuite démarrer la suivante.

### Définition de « terminé »
Une correction est terminée uniquement si :
- elle existe sur la branche Recovery ;
- les tests ciblés sont PASS ;
- le build production est PASS lorsque du code exécutable est touché ;
- les consommateurs réellement montés ont été vérifiés ;
- aucune donnée `NULL` n'a été transformée en valeur rassurante artificielle ;
- si une publication est nécessaire, la tâche reste non résolue jusqu'à contrôle post-release.

### Commits
- Un commit = une correction cohérente.
- Messages explicites.
- Pas de fichiers générés du build.
- Ne pas commiter `THEMATIC_PAGES_OPTIMIZED.md`, `public/sitemap.xml`, `dist/` ou `.netlify/`.

---

## Contraintes SCPI/CIF — non négociables

- Pas de promesse de rendement.
- Pas de recommandation personnalisée sans recueil préalable.
- Distinguer information générale, pédagogie et conseil personnalisé.
- Rappeler les risques lorsque des performances sont citées.
- Données SCPI sourcées : DIC, note d'information, bulletin, rapport annuel, ASPIM, société de gestion.
- Aucune extrapolation présentée comme donnée certaine.
- Les changements de régime de liquidité doivent être explicitement pris en compte ; une ancienne file de retraits ne peut pas être présentée comme comparable après passage au marché secondaire.

---

## Agents disponibles

| ID | Fichier | Rôle |
|----|---------|------|
| 00 | `agents/00-superviseur.md` | Orchestration, arbitrage, validation |
| 01 | `agents/01-seo-maximusscpi.md` | SEO éditorial |
| 02 | `agents/02-contenu-video.md` | Scripts et contenus vidéo |
| 03 | `agents/03-data-scpi.md` | Data SCPI sourcée |
| 04 | `agents/04-conformite-cif.md` | Conformité CIF/AMF |
| 05 | `agents/05-crm-relance.md` | CRM, relances, RGPD |

Le superviseur ne délègue que la tâche Recovery active.

## Règle durable — une nouvelle SCPI n'est terminée que lorsqu'elle fonctionne partout

Cette règle s'applique aux **225 SCPI cibles**, sans exception, y compris aux quatre CORUM et aux futures SCPI de BNP Paribas REIM. Elle complète les règles de Recovery ; elle n'autorise **aucun** déploiement hors du processus de release.

**Définition de Done produit = Done financier + Done application + Done publication.**
Une extraction OCR, un rapport annuel identifié, des métriques `qa_pass` ou le franchissement d'un seuil SQL ne constituent **jamais** une SCPI intégrée.

- **Données :** identité et statut juridique vérifiés ; DIC, note, statuts, rapport annuel et bulletin actuel officiels, horodatés et hachés ; chaque métrique publiée avec sa période, unité, page, empreinte et validation ; aucune confusion année/trimestre, rendement brut/net, TOF ponctuel/moyen, retraits exécutés/en attente.
- **SEO :** page `/{slug}/` générée et rendue, titre/H1/méta description/canonical et structured data exacts, maillage interne, sitemap, lien 200 ; sans page factice, promesse de rendement ni fausse année.
- **Comparateur :** recherche, filtres, sélection multiple, grille/cartes, classements, données live et déclenchement des analyses ; même SCPI et mêmes chiffres que la page SEO.
- **Liquidité :** régime de capital, nombre de parts en attente, file de retraits/marché secondaire, comparabilité historique, transparence des données manquantes ; ne jamais interpréter zéro ou absence comme une liquidité garantie.
- **Simulateurs :** direct, revente, démembrement, crédit et autres simulateurs qui sélectionnent une SCPI ; prix, distribution, jouissance, frais, revente et hypothèses correctement raccordés. Un outil incapable de traiter la SCPI doit être bloqué avec explication, jamais alimenté par un faux zéro.
- **Analyse et espace client :** scoring, radar, trajectoire, patrimoine/secteurs/pays, historique, risque, portefeuille et sources ; validation de l'affichage et du parcours client.
- **Go/No-Go :** PR et tests de parcours qui couvrent chaque consommateur monté ; contrôle final indépendant dette, liquidité, frais, DIC/SFDR, conformité et cohérence ; verrou privé `scpi_candidate_publication_gate_v1.release_ready=true` **et** autorisation de publication. Pas de production avant QA du rendu final, ni publication seulement parce que la source de données est complète.
- **Un seul point d'entrée :** le catalogue public certifié et ses sources de provenance alimentent toutes les surfaces. Éviter les listes parallèles et modifications manuelles SCPI par SCPI. Une nouvelle SCPI est promue **atomiquement** : catalogue, cohorte, comparateur, SEO, sitemap, liquidité, simulateurs et espace client.
- **Travail non terminé :** si une seule surface échoue ou une donnée critique n'est pas certifiée, la fiche reste `candidate`/hors ligne ; enregistrer précisément le blocage et continuer les vérifications, sans conclure au `100 %`.

Les quatre CORUM servent de **lot pilote** ; leurs valeurs QA initiales sont stockées dans `data-import/corum_candidates_prepublication_20261015.json` et contrôlées par `scripts/scpi-candidates/auditCorumE2e.mjs`. Ce fichier est une preuve de préparation, jamais un catalogue public.


## Design de référence obligatoire pour toutes les SCPI — Iroko Atlas

**Le modèle unique est la fiche publique Iroko Atlas**, route `/iroko-atlas/`,
servie par `OptimizedScpiLandingPage` et `buildScpiLandingData`.
Les CORUM, BNP Paribas et les 225 SCPI doivent réutiliser **ce composant exact**
et son comportement responsive, ses blocs, tableaux, cartes, graphiques, textes d'alerte,
liens du comparateur, simulateurs, SEO et formulaire. **Ne jamais créer une page HTML,
un microsite, une maquette parallèle ni une fiche CORUM spécifique** comme substitut.

- Les 61 SCPI existantes et Iroko Atlas servent de référence de non-régression.
- L'activation atomique via `scpi_complet.json` + `certified_scpi_cohort.json`
  distribue la même identité à la fiche, au comparateur et aux simulateurs.
- Les systèmes externes `scpi_indicators`, `scpi_bulletin_analysis`,
  `scpi_trajectory_pilot_history`, `scpi_trajectory_pilot_liquidity`
  alimentent respectivement les données live et scores/radar, l'analyse,
  la trajectoire et la liquidité de l'espace client. Ce sont des **preuves
  obligatoires de raccordement réel**, pas des données simulées.
- Le verrou privé `scpi_candidate_tool_readiness.full_surface_ready` doit être
  vrai en plus de l'audit final : il vérifie les circuits financiers et
  applicatifs réellement alimentés. Ne pas transformer un manque en zéro.
- Test de non-régression : `node --test scripts/scpi-candidates/irokoAtlasTemplateParity.test.mjs`.
  Ce test du câblage source ne remplace PAS les tests navigateur, les traces
  de production, ni une vérification réelle par SCPI.
