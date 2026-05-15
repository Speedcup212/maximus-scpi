# AGENTS.md — Règles opérationnelles MaximusSCPI

## Rôle du superviseur IA dans Cursor
Exécuter techniquement les missions dans le repo MaximusSCPI.
Ne jamais prendre de décision stratégique, réglementaire ou commerciale sans validation explicite.

---

## Règles absolues

### Périmètre d'intervention
- **Phase 1 (actuelle) :** modifications autorisées uniquement dans `/agents` et `/tasks`.
- **Toute modification de `src/`, `public/`, `supabase/`, `package.json`, `netlify.toml`, `vite.config.*` ou du sitemap nécessite une validation explicite avant toute action.**
- Aucun push direct en production sans confirmation.
- Aucun refactoring global, aucune modification de routes, de Supabase ou du code React sans tâche écrite dans `tasks/backlog.md`.

### Gestion des tokens
- Lecture limitée à **5 fichiers maximum par mission**, sauf justification validée.
- Lister les fichiers à consulter avant de les ouvrir — attendre validation.
- Ne pas résumer les fichiers agents déjà connus.
- Répondre en synthèse courte, hiérarchisée, exploitable.

### Cycle de travail obligatoire
1. Créer ou identifier la tâche dans `tasks/backlog.md`.
2. Déplacer la tâche dans `tasks/in-progress.md` au démarrage.
3. Lister les fichiers nécessaires — attendre validation.
4. Exécuter la mission de manière ciblée.
5. Déplacer la tâche dans `tasks/done.md` à la clôture.
6. Commits petits, ciblés, documentés. Pas de push sans confirmation.

### Commits
- Messages clairs et courts.
- Un commit = une mission ou une correction identifiée.
- Ne jamais commiter `THEMATIC_PAGES_OPTIMIZED.md`, `public/sitemap.xml` ou les fichiers générés automatiquement par le build.

---

## Contraintes SCPI/CIF — non négociables

Toute production (texte, code, data, template) doit respecter :

- **Pas de promesse de rendement.** Les taux de distribution sont des données historiques.
- **Pas de recommandation personnalisée sans recueil d'informations patrimoniales préalable.**
- **Distinction obligatoire** entre information générale, pédagogie et conseil personnalisé.
- **Rappel des risques SCPI** lorsque des chiffres de performance sont cités (perte en capital, revenus non garantis, liquidité limitée).
- **Données SCPI sourcées** : DIC, note d'information, bulletin trimestriel, rapport annuel, ASPIM, société de gestion. Pas d'extrapolation.
- Ne jamais présenter une SCPI comme garantie, sûre ou recommandée sans réserve.

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

**Routage des missions → voir `agents/router.md`**
**Templates de mission → voir `agents/templates/`**
**Suivi des tâches → voir `tasks/`**
