# Agents IA MaximusSCPI

Ce dossier contient les agents IA internes du projet MaximusSCPI.

Objectif : structurer le travail SEO, contenu, data, conformité et CRM sans modifier le site de manière incontrôlée.

---

## 1. Principe général

Les agents servent à produire :

- des briefs ;
- des audits ;
- des recommandations ;
- des prompts Cursor ;
- des rapports ;
- des contrôles de conformité ;
- des plans d’action.

Par défaut, ils ne doivent pas modifier le code du site.

---

## 2. Ordre d’utilisation

Toujours commencer par l’agent superviseur :

- 00-superviseur.md

Le superviseur décide ensuite quel agent doit intervenir.

Agents disponibles :

- 00-superviseur.md
- 01-seo-maximusscpi.md
- 02-contenu-video.md
- 03-data-scpi.md
- 04-conformite-cif.md
- 05-crm-relance.md
- 06-agent-validation-ux-seo-conformite.md
- router.md

---

## 3. Rôle des agents

### Agent 00 — Superviseur

Pilote les autres agents, définit le périmètre, détecte les risques et bloque les modifications non validées.

### Agent 01 — SEO MaximusSCPI

Travaille sur la visibilité Google, la visibilité IA, les cocons sémantiques, les pages SCPI et le maillage interne.

### Agent 02 — Contenu vidéo

Produit des scripts TikTok, YouTube Shorts, hooks, angles pédagogiques et storytelling SCPI.

### Agent 03 — Data SCPI

Contrôle les données SCPI, les indicateurs, les bulletins trimestriels, les rapports annuels et les incohérences chiffrées.

### Agent 04 — Conformité CIF

Vérifie les formulations sensibles, les risques de promesse de rendement, les recommandations personnalisées et les mentions réglementaires.

### Agent 05 — CRM / Relance

Structure les relances prospects, les messages commerciaux, les séquences emails et la conversion vers rendez-vous qualifié.

### Agent 06 — Validation UX / SEO / Conformité CIF

Valide automatiquement chaque brief, livrable ou modification de page avant implémentation. Produit un score sur 4 axes (SEO, visibilité IA, UX/CTA, conformité CIF) et détermine si la validation humaine est nécessaire ou si la validation IA seule suffit.

---

## 4. Validation avant modification du site

Tout livrable (brief SEO, FAQ, méta, contenu, CTA) doit passer par l'Agent 06 avant implémentation.

L'Agent 06 produit un rapport avec 4 scores (/100) et une décision :

- `VALIDATION IA : OK` + tous les scores ≥ 75 + aucun red flag → l'utilisateur peut écrire `VALIDÉ POUR MODIFICATION DU SITE`.
- `VALIDATION IA : À CORRIGER` → corriger et re-soumettre avant modification.
- `VALIDATION IA : BLOQUÉ` → validation humaine obligatoire, aucune modification du site.

---

## 5. Règles absolues

Les agents doivent respecter les règles suivantes :

- ne jamais promettre de rendement ;
- ne jamais présenter une SCPI comme garantie ;
- ne jamais présenter une SCPI comme sans risque ;
- ne jamais présenter une SCPI comme systématiquement meilleure ;
- ne jamais faire de recommandation personnalisée sans recueil d’informations ;
- distinguer information générale, pédagogie et conseil personnalisé ;
- mentionner les risques lorsque nécessaire : perte en capital, liquidité, revenus non garantis, fiscalité, marché immobilier, frais ;
- signaler les points à vérifier : DIC, note d’information, bulletin trimestriel, rapport annuel, AMF, ASPIM, société de gestion.

---

## 6. Règles Cursor

En phase actuelle, seuls ces fichiers peuvent être créés ou modifiés :

- /agents/*.md
- /agents/reports/*.md
- /agents/templates/*.md

Sont interdits sans validation explicite :

- /src
- /public
- /supabase
- /netlify
- /scripts
- package.json
- package-lock.json
- vite.config
- sitemap.xml
- robots.txt
- routes React
- composants React
- fonctions Supabase
- fonctions Netlify

Avant toute modification du site, l’utilisateur doit écrire explicitement :

VALIDÉ POUR MODIFICATION DU SITE

Sans cette phrase, les agents restent en mode analyse, brief ou recommandation.

---

## 7. Workflow recommandé

Pour chaque nouvelle demande :

1. Lire 00-superviseur.md.
2. Identifier l’objectif réel.
3. Définir l’agent prioritaire.
4. Produire un brief.
5. Faire passer les sujets sensibles par 04-conformite-cif.md.
6. Soumettre le livrable à l'Agent 06 pour validation scoring.
7. Ne modifier aucun fichier du site sans validation explicite et rapport Agent 06 OK.
8. Créer si besoin un rapport dans /agents/reports.
9. Ne jamais faire Keep All sans revue fichier par fichier.
10. Ne jamais faire Commit sans contrôle du git status.

---

## 8. Commandes utiles

Vérifier les modifications en cours :

git status --short

Voir les modifications sur les agents :

git diff -- agents

Vérifier uniquement le dossier agents :

git status --short agents

Lister les fichiers agents :

Get-ChildItem agents -File | Select-Object Name, Length, LastWriteTime

---

## 9. Objectif final

Le système d’agents MaximusSCPI doit aider à produire plus vite et mieux :

- des contenus SEO performants ;
- des contenus IA-friendly ;
- des scripts vidéo ;
- des données SCPI contrôlées ;
- des relances prospects ;
- des audits de conformité ;
- des briefs Cursor propres.

Mais il doit surtout éviter :

- les modifications sauvages ;
- les promesses commerciales dangereuses ;
- les erreurs réglementaires ;
- les contenus trop agressifs ;
- les incohérences de données ;
- les refactorings non demandés.

