# TASK-DATA-002 — Inventaire des sources officielles SCPI pilotes

**Agent :** Agent 03 — Data SCPI  
**Statut :** À faire  
**Date de création :** 2026-05-18  
**Type :** Inventaire documentaire — aucune extraction technique  
**Référence audit :** TASK-DATA-001, `agents/03-data-scpi.md`, `agents/reports/architecture-data-agent03-contrat-compatibilite.md`

---

## Objectif

Identifier pour **chaque SCPI pilote** :

- les **sources officielles** (sites société de gestion, espaces « documents », AMF si pertinent) ;
- les **pages documents** ou équivalent (liste bulletins, rapports annuels, DIC, notes d’information) ;
- le **dernier bulletin trimestriel connu** (période / libellé tel que publié) ;
- les **rapports annuels** disponibles ou lien vers archive ;
- les **DIC** et **notes d’information** (URL ou référence de téléchargement stable si disponible) ;
- une estimation du **niveau de difficulté d’extraction** (faible / moyen / élevé) et les raisons (PDF natif vs scan, tableaux complexes, absence d’URL stable, etc.).

**Important :** cette tâche est **manuelle ou semi-manuelle**. Elle ne consiste pas à lancer des scripts d’extraction, ni à peupler une base de données.

---

## SCPI pilotes (scope fixe)

| # | SCPI | Société de gestion |
|---|------|---------------------|
| 1 | Activimmo | Alderan |
| 2 | Iroko Zen | Iroko |
| 3 | Comète | Alderan |
| 4 | Épargne Pierre | Atland Voisin |
| 5 | LF Avenir Santé | La Française REM |

*(Alternative documentaire pour la 5ᵉ ligne si besoin métier : Kyaneos Pierre, Transitions Europe, ou NCap Education Santé — à noter dans les livrables si substitution validée.)*

---

## Contraintes Agent 03 / conformité

- **Ne jamais inventer une URL.** Si une URL n’est pas trouvée après contrôle humain : laisser vide et statut « à identifier ».
- **Ne pas extrapoler** les performances ou dates à partir de titres marketing.
- **Distinguer** : document officiel publié / simple page marketing sans lien PDF vérifiable.
- Respecter `agents/03-data-scpi.md` : sources prioritaires DIC, note d’information, bulletin, rapport annuel, société de gestion, ASPIM si usage sectoriel.

---

## Interdictions explicites (phase actuelle)

- Ne pas modifier `tasks/backlog.md` dans le cadre de cette mission de création de fichier.
- Ne pas créer de schéma Supabase ni table `scpi_raw_extractions`.
- Ne pas lancer d’extraction PDF ni de scraping massif.
- Ne pas modifier `src/data/scpi_complet.json`, `scpiData.ts`, `scpiDataExtended.ts`, ni aucun fichier sous `src/` ou `public/`.

---

## Livrables attendus

1. **Grille par SCPI pilote** (à compléter dans ce fichier ou en annexe Markdown sous `/agents/reports/` uniquement si une validation ultérieure l’autorise — pour TASK-DATA-002 la grille peut être complétée **directement dans ce document** lors de l’exécution).

   Pour chaque pilote, colonnes minimales :

   | Colonne | Description |
   |---------|-------------|
   | Page officielle SCPI | URL ou « à identifier » |
   | Page documents / bulletins | URL ou « à identifier » |
   | Dernier bulletin | Période (ex. T3 2025) + URL fichier ou page |
   | Dernier rapport annuel | Millésime + URL ou « à identifier » |
   | DIC | URL ou référence AMF / téléchargement |
   | Note d’information | URL ou référence |
   | Difficulté extraction | faible / moyen / élevé |
   | Commentaires | Captchas, PDF image, chaîne de redirections, etc. |

2. **Synthèse** (½ page) : gestionnaires les plus « extraction-friendly », blocages récurrents, recommandation d’ordre de traitement pour une Phase 2 technique future.

3. **Alignement `scpi_source_registry`** : pour chaque pilote, indiquer si une ligne existe déjà et si les champs URL sont encore vides (sans modifier la base dans cette tâche si non validé).

---

## Critères de succès

- Les **5 SCPI** ont une ligne dans la grille avec au minimum : page gestionnaire ou page SCPI identifiée **ou** motif documenté « introuvable après recherche ».
- Au moins une **source par type visé** (bulletin, RA, DIC) est soit renseignée, soit explicitement « non trouvé au jour du contrôle » avec date du contrôle.
- Aucune URL inventée ; aucune donnée financière ajoutée sans bulletin/document sourcé.

---

## Template grille (à dupliquer lors de l’exécution)

### Pilote 1 — Activimmo (Alderan)

| Élément | URL / Référence | Date du contrôle | Difficulté | Notes |
|---------|-----------------|------------------|------------|-------|
| Page SCPI | | | | |
| Documents / bulletins | | | | |
| Dernier bulletin | | | | |
| Rapport annuel | | | | |
| DIC | | | | |
| Note d’information | | | | |

### Pilote 2 — Iroko Zen (Iroko)

*(idem)*

### Pilote 3 — Comète (Alderan)

*(idem)*

### Pilote 4 — Épargne Pierre (Atland Voisin)

*(idem)*

### Pilote 5 — LF Avenir Santé (La Française REM)

*(idem)*

---

## Suite prévue (hors périmètre TASK-DATA-002)

- Phase 2 technique : extraction brute vers structure dédiée — **non lancée** sans validation séparée.
- Après TASK-DATA-002 : mise à jour contrôlée du registre `scpi_source_registry` et/ou scripts d’import — **sur validation explicite**.

---

## Historique

| Date | Événement |
|------|-----------|
| 2026-05-18 | Création du fichier TASK-DATA-002 |
