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
