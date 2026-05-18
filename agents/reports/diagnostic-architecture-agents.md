# Diagnostic — Architecture des agents MaximusSCPI

Date : 17 mai 2026  
Auteur : Agent 00 — Superviseur  
Statut : Rapport initial — à réviser si l'architecture évolue

---

## 1. Synthèse de l'architecture actuelle

Le dossier `/agents` contient 6 agents opérationnels + 1 fichier de routage.

Structure observée :

```
agents/
├── README.md                        — règles générales, workflow, périmètre Cursor
├── router.md                        — table de routage + format d'activation
├── 00-superviseur.md                — orchestration, arbitrage, verrouillage Cursor
├── 01-seo-maximusscpi.md            — SEO éditorial et maillage interne
├── 02-contenu-video.md              — scripts vidéo (TikTok, YouTube)
├── 03-data-scpi.md                  — données SCPI sourcées
├── 04-conformite-cif.md             — conformité CIF/AMF
├── 05-crm-relance.md                — CRM, relances, RGPD
├── prompts/
│   └── agent-01-visibilite-ia-seo-aeo.md   — prompt Agent 01 étendu (à compléter)
└── reports/
    ├── openrouter-brief-fiscalite-scpi.md
    ├── TASK-001-audit-conformite-simulateur-credit.md
    ├── TASK-002C-cannibalisation-sectorielle.md
    └── diagnostic-architecture-agents.md   (ce fichier)
```

L'architecture suit un modèle **hub-and-spoke** : l'Agent 00 centralise l'arbitrage, les agents 01-05 opèrent sur des périmètres fonctionnels distincts. Aucun agent ne modifie le site sans validation explicite — c'est le principe fondateur.

---

## 2. Rôle de chaque agent

| Agent | Rôle principal | Livrables clés |
|-------|---------------|----------------|
| **00 — Superviseur** | Orchestration, arbitrage, verrouillage Cursor | Mémos inter-agents, alertes de non-conformité, plans de priorisation |
| **01 — SEO** | Visibilité Google, cocons sémantiques, maillage | Briefs articles, plans de mots-clés, méta-descriptions, audits SEO |
| **02 — Vidéo** | Scripts TikTok, YouTube, Shorts | Scripts structurés, descriptions YouTube, charte éditoriale vidéo |
| **03 — Data** | Données SCPI sourcées et vérifiées | Fiches SCPI normalisées, tableaux comparatifs, alertes données périmées |
| **04 — Conformité CIF** | Contrôle réglementaire AMF/CIF | Checklists conformité, rapports de non-conformité, modèles mentions légales |
| **05 — CRM** | Relances prospects, parcours investisseur, RGPD | Templates emails, scénarios relance, segmentation, guide bonnes pratiques |

---

## 3. Risques de chevauchement entre agents

### 3.1 Agent 01 (SEO) ↔ Agent 04 (Conformité)
**Chevauchement : formulation des titres et accroches.**

L'Agent SEO peut produire des titres accrocheurs susceptibles d'être non conformes CIF. L'Agent Conformité doit relire tout contenu comportant des chiffres SCPI ou des comparatifs avant diffusion. Ce circuit est prévu dans le router mais **non formalisé en checklist automatique**.

Risque : un brief SEO part en production sans passer par l'Agent 04.

### 3.2 Agent 01 (SEO) ↔ Agent 02 (Vidéo)
**Chevauchement : titres et descriptions YouTube.**

L'Agent 02 mentionne explicitement la coordination avec l'Agent SEO pour les descriptions YouTube. Mais l'ordre de priorité n'est pas défini : qui produit le titre en premier ? Risque de doublon ou d'incohérence éditoriale.

### 3.3 Agent 03 (Data) ↔ Agent 01 (SEO)
**Chevauchement : chiffres SCPI dans les articles.**

L'Agent SEO peut produire des articles avec des données chiffrées sans passer par l'Agent Data. Les règles l'interdisent théoriquement, mais la dépendance n'est pas formalisée dans le router.

### 3.4 Agent 05 (CRM) ↔ Agent 04 (Conformité)
**Chevauchement : emails contenant des données SCPI.**

Un template CRM évoquant un taux de distribution ou une performance doit passer par l'Agent 04. La règle est présente dans les deux fichiers agents mais l'obligation de passage n'est pas outillée.

### 3.5 Agent 00 (Superviseur) ↔ Cursor (mode agent)
**Chevauchement : modifications de code déclenchées par des demandes stratégiques.**

C'est le risque principal observé en pratique (cf. historique de conversation) : Cursor interprète une demande stratégique comme une mission technique et modifie `src/` sans validation explicite. L'Agent 00 doit systématiquement intercepter ce type de dérive.

---

## 4. Règles anti-dérapage Cursor à respecter

Ces règles sont définies dans `00-superviseur.md` et `README.md`. Synthèse opérationnelle :

1. **Phrase de déverrouillage obligatoire** : aucune modification hors `/agents` sans `VALIDÉ POUR MODIFICATION DU SITE` écrit explicitement par l'utilisateur.
2. **Pas de `Keep All`** sans revue fichier par fichier.
3. **Pas de commit** sans vérification du `git status`.
4. **Lecture limitée à 5 fichiers max** par session sans justification validée.
5. **Un commit = une mission** — jamais de commit groupé multi-missions.
6. **Fichiers jamais commités** : `THEMATIC_PAGES_OPTIMIZED.md`, `public/sitemap.xml`, fichiers générés automatiquement par le build.
7. **En cas de doute** : bloquer, formuler un brief, demander validation.

Formulation à utiliser si dépassement de périmètre :

```
BLOQUÉ.
La demande dépasse le périmètre autorisé ou présente un risque de conformité / stabilité.
Action recommandée : produire d'abord un brief, puis demander validation explicite.
```

---

## 5. Priorité des agents pour MaximusSCPI

Classement selon l'impact immédiat sur les objectifs du projet :

| Priorité | Agent | Justification |
|----------|-------|---------------|
| 1 | **04 — Conformité CIF** | Risque réglementaire immédiat sur tous les contenus. Doit être activé en premier sur toute production publique. |
| 2 | **01 — SEO** | Levier de visibilité principal. Pages thématiques (`/fiscalite-scpi/`, `/rendement-scpi/`, etc.) à fort potentiel de trafic organique. |
| 3 | **03 — Data** | Crédibilité des contenus dépend de la qualité des données SCPI. Alimenter le SEO avec des données fiables est critique. |
| 4 | **05 — CRM** | Conversion des leads générés par le SEO. Priorité croissante dès que le trafic monte. |
| 5 | **02 — Vidéo** | Canal complémentaire. Priorité secondaire tant que le SEO et le CRM ne sont pas stabilisés. |
| 6 | **00 — Superviseur** | Transversal. Actif à chaque session, pas en autonomie. |

---

## 6. Recommandations d'amélioration

### 6.1 Formaliser le circuit de validation conformité
Créer une **checklist de passage obligatoire par l'Agent 04** pour tout livrable contenant :
- un taux de distribution ou de rendement ;
- une comparaison entre SCPI ;
- un CTA vers un rendez-vous ou une simulation.

### 6.2 Compléter le prompt Agent 01 (IA / SEO / AEO)
Le fichier `agents/prompts/agent-01-visibilite-ia-seo-aeo.md` est à l'état de stub. L'Agent 01 doit évoluer vers un agent de **visibilité IA** (AEO, GEO) pour adresser ChatGPT, Perplexity, Claude, Gemini — en plus de Google. Ce prompt stratégique est la prochaine priorité éditoriale.

### 6.3 Créer des templates manquants
Le router référence des templates (`seo-task.md`, `video-task.md`, `data-task.md`, `conformity-task.md`, `crm-task.md`, `dev-task.md`) mais le dossier `agents/templates/` n'est pas détecté dans le repo. À créer.

### 6.4 Clarifier l'ordre de priorité dans le router
Ajouter une colonne "Agent de validation requis" dans la table de routage de `router.md` pour rendre le passage par l'Agent 04 explicite et non optionnel.

### 6.5 Définir la frontière Phase 1 / Phase 2
La limite entre Phase 1 (agents seuls) et Phase 2 (lecture du site autorisée) n'est pas documentée avec des critères de passage. Définir les conditions d'entrée en Phase 2 : nombre de pages publiées, audit conformité validé, premier batch SEO terminé.

---

## 7. Prochaine action recommandée

**Action prioritaire : compléter `agents/prompts/agent-01-visibilite-ia-seo-aeo.md`**

Transformer l'Agent SEO classique en agent de visibilité IA, SEO, AEO et GEO. Ce prompt doit couvrir :

- stratégie d'autorité thématique SCPI pour Google et les moteurs IA ;
- structuration des contenus en réponses directes (FAQ schema, Answer Engine Optimization) ;
- règles de citation dans les LLM (attributs E-E-A-T, sourcing, données structurées) ;
- conformité CIF dans les contenus IA-first ;
- priorisation des pages à fort potentiel : `/fiscalite-scpi/`, `/rendement-scpi/`, `/acheter-scpi/`, `/comparateur-scpi/`.

**Action complémentaire : créer `agents/templates/`** avec les 6 templates référencés dans `router.md`.

---

## Annexe — Fichiers lus pour ce rapport

- `agents/README.md`
- `agents/00-superviseur.md`
- `agents/router.md`
- `agents/01-seo-maximusscpi.md`
- `agents/02-contenu-video.md`
- `agents/03-data-scpi.md`
- `agents/04-conformite-cif.md`
- `agents/05-crm-relance.md`
- `agents/prompts/agent-01-visibilite-ia-seo-aeo.md` (stub)
- `agents/reports/` (liste des fichiers existants)

Aucun fichier hors de `/agents` n'a été modifié.
