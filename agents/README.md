# Agents IA MaximusSCPI

Le système d'agents MaximusSCPI fonctionne désormais comme une chaîne d'exécution contrôlée, et non comme une simple collection de prompts ou de briefs.

## Architecture de référence

Le runtime opérationnel est le schéma Supabase `maximus_agents`.

Flux cible :

`SCAN → DÉTECTE → ISSUE → TÂCHE → EXÉCUTE → TESTE → QA → RELEASE GATE → DÉPLOIE → RE-TESTE`

Les fichiers de ce dossier documentent les expertises, règles et garde-fous. L'état réel du travail est conservé dans `maximus_agents.issues`, `tasks`, `runs`, `agents` et `issue_dashboard`.

## Rôles runtime

- `CONTROL` : orchestration, dépendances, arbitrage et gate de release.
- `DATA` : données SCPI, bulletins, historiques, trajectoires et backfill.
- `ANALYST` : cohérence métier et analyses.
- `SEARCH` : recherche et contrôle de sources officielles.
- `QA` : validation finale, conformité et régressions.

## Référentiels spécialisés

- `00-superviseur.md` : contrat global d'orchestration.
- `01-seo-maximusscpi.md` : SEO / AEO / GEO / LLMO.
- `02-contenu-video.md` : contenus vidéo.
- `03-data-scpi.md` : règles data SCPI.
- `04-conformite-cif.md` : conformité CIF / AMF.
- `05-crm-relance.md` : CRM / relances / RGPD.
- `06-agent-validation-ux-seo-conformite.md` : grille de contrôle UX / SEO / conformité.
- `router.md` : orientation vers l'expertise appropriée.

Ces fichiers ne doivent pas créer de task board parallèle au runtime Supabase.

## Principe d'autonomie

Les agents doivent exécuter les travaux réversibles, bornés et testables lorsqu'une issue persistante existe avec des critères d'acceptation explicites.

Exemples autorisés :

- correction ciblée de code ;
- amélioration UX/SEO localisée ;
- correction ou normalisation de données SCPI sourcées ;
- ajout de tests ;
- migration non destructive ;
- recherche documentaire et backfill ;
- correction de contenu générique conforme ;
- production des preuves QA.

La validation humaine reste obligatoire pour les opérations destructrices, sécurité/auth/paiement/secrets, modification réglementaire substantielle, personnalisation de conseil, refactoring architectural large ou opération production irréversible.

## Règles de release

Une modification du code ou des données n'est pas synonyme de publication.

Pour une release production :

1. critères d'acceptation satisfaits ;
2. tests passés ;
3. QA positive ;
4. health gate global vert ;
5. changements regroupés ;
6. déploiement explicite ;
7. production confirmée `ready` ;
8. re-test ;
9. référence de release enregistrée.

## Netlify : zéro micro-déploiement

Le fichier `scripts/netlify-ignore.mjs` bloque les builds production ordinaires sur `main`.

Seuls ces marqueurs autorisent une production :

- `[deploy]`
- `[release]`
- `[hotfix]`
- `DEPLOY_NOW`

Les commits de documentation, préparation, QA ou corrections non urgentes doivent rester sans marqueur et être regroupés dans la prochaine release validée.

## Data SCPI

Le socle des 61 SCPI reste prioritaire sur l'extension du catalogue.

Principes :

- aucune donnée inventée ;
- priorité aux sources officielles correspondant au bon produit et à la bonne période ;
- une rupture structurelle ou une cadence différente ne doit pas être maquillée en comparaison certifiée ;
- les cas particuliers doivent être explicitement classés ;
- le pipeline legacy `scpi_trajectory_agent_jobs` ne doit pas être réactivé quand il est marqué `superseded_by_maximus_agents`.

## File de publication SCPI

`public.scpi_publish_queue` stocke les changements qui attendent une publication groupée.

Une ligne n'est considérée publiée qu'après confirmation d'un déploiement production `ready`. À ce moment seulement, `published_at` peut être renseigné et la référence de release enregistrée.

## Conformité

Règles absolues :

- aucune promesse de rendement ;
- aucune présentation d'une SCPI comme garantie ou sans risque ;
- aucune recommandation personnalisée sans recueil d'informations adapté ;
- information générale, pédagogie et conseil personnalisé doivent rester distincts ;
- les risques pertinents doivent être affichés ;
- conformité > SEO > conversion.

## Définition de DONE

Une tâche n'est pas terminée parce qu'un fichier a été modifié ou qu'un rapport a été produit.

Elle est `DONE` uniquement si :

- le critère d'acceptation est atteint ;
- les preuves sont conservées ;
- la QA est positive ;
- les dépendances sont fermées ;
- lorsqu'une release est requise, la production est `ready` et référencée ;
- le re-test ne révèle pas de régression critique.

## Cockpit attendu

Le pilotage doit afficher au minimum :

`61 SCPI | PASS/FAIL/PARTIAL | historiques certifiés | QA | publications en attente | régressions | release candidate`

L'objectif n'est pas d'augmenter le nombre d'agents. L'objectif est d'augmenter le débit de chantiers réellement fermés sans dégrader la fiabilité du site.
