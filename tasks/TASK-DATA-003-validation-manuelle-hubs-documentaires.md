# TASK-DATA-003 — Validation manuelle des hubs documentaires SCPI pilotes

**Agent :** Agent 03 — Data SCPI  
**Statut :** À faire  
**Type :** Validation manuelle — aucun scraping, aucune extraction PDF, aucune écriture en base  
**Références :** TASK-DATA-002, `agents/03-data-scpi.md`, cadrage « hub avant PDF »

---

## Objectif

Valider **manuellement** les **pages documentaires officielles** (hubs agrégés) des **5 SCPI pilotes** **avant** toute extraction automatique ou pipeline technique.

Le référentiel principal est toujours le **hub documentaire** (ou la page produit qui y renvoie explicitement), **jamais** une URL PDF isolée.

---

## SCPI pilotes

| # | SCPI | Société de gestion |
|---|------|---------------------|
| 1 | Activimmo | Alderan |
| 2 | Comète | Alderan |
| 3 | Iroko Zen | Iroko |
| 4 | Épargne Pierre | Atland Voisin |
| 5 | LF Avenir Santé | La Française REM |

---

## Check-list par SCPI (à exécuter dans l’ordre)

Pour **chaque** SCPI pilote :

| Étape | Description |
|-------|-------------|
| **A** | Ouvrir la **page SCPI produit officielle** (site de la société de gestion ou filiale officielle). |
| **B** | Ouvrir la **page hub documentaire prioritaire** (portail ou page listant bulletins, RA, DIC, note, statuts). |
| **C** | Vérifier que la **SCPI concernée** est bien présente dans le hub ou dans les **filtres** / sélection produit. |
| **D** | Repérer la rubrique **bulletins trimestriels** (liste ou accès structuré, pas un PDF bookmark comme seule entrée). |
| **E** | Repérer la rubrique **rapports annuels** (ou indiquer si absent / sur demande, de manière explicite). |
| **F** | Repérer le **DIC / KID** (rubrique ou lien depuis le hub, pas la rétention d’un PDF direct comme « source unique »). |
| **G** | Repérer la **note d’information** (rubrique ou page agrégée équivalente selon le gestionnaire). |
| **H** | Repérer les **statuts** (rubrique dédiée ou page agrégée « note + statuts » selon le cas). |
| **I** | Identifier la présence d’un **login**, **disclaimer** ou **filtre investisseur** / qualification. |
| **J** | Copier l’**URL canonique** du **hub documentaire retenu** (une URL de référence par pilote pour le registre). |
| **K** | Tester la **stabilité** de l’URL après rechargement (F5) ; si filtres / query string, noter la reproductibilité. |
| **L** | Noter le **statut final** : `validé` / `partiel` / `introuvable` / `à arbitrer`. |

### Vigilance renforcée

- **Iroko Zen** : hub unique parfois **moins évident** ; consolider navigation (page SCPI / bulletins) avant de figer l’URL canonique.
- **Épargne Pierre** : portail documentation potentiellement soumis à **filtres** ou **gates** ; documenter le parcours sans contourner les règles d’accès.

---

## Règles (non négociables)

1. **Ne jamais** retenir un **PDF isolé** comme référentiel principal.
2. **Toujours** privilégier le **hub documentaire officiel** (ou page produit avec lien clair vers ce hub).
3. **Ne pas** reprendre de **chiffres financiers** dans cette tâche (pas d’extraction de performance).
4. Toute incertitude → marquer **`à vérifier`** dans le commentaire et statut adapté (`partiel` ou `à arbitrer`).
5. Distinction conformité : **information générale** / sources officielles ; pas de conseil personnalisé implicite dans les commentaires.

---

## Livrable attendu

Remplir le **tableau ci-dessous** après exécution (une ligne par SCPI).

**Colonnes obligatoires :**

| Colonne | Contenu attendu |
|---------|-----------------|
| SCPI | Nom |
| Société de gestion | Raison sociale affichée |
| Page SCPI officielle | URL validée étape A |
| Hub documentaire validé | URL canonique étape J (réf. principale) |
| Bulletins présents | oui / partiel / non / à vérifier |
| Rapports annuels présents | oui / partiel / non / à vérifier |
| DIC présent | oui / partiel / non / à vérifier |
| Note d’information présente | oui / partiel / non / à vérifier |
| Statuts présents | oui / partiel / non / à vérifier |
| Login / disclaimer | description courte (oui/non + type) |
| URL canonique | = colonne hub (rappel ou lien unique) |
| Stabilité | stable / fragile / à vérifier |
| Statut final | validé / partiel / introuvable / à arbitrer |
| Commentaire | freins, incertitudes, prochaine action |

### Tableau — à compléter

| SCPI | Société de gestion | Page SCPI officielle | Hub documentaire validé | Bulletins présents | RA présents | DIC présent | NI présente | Statuts présents | Login / disclaimer | URL canonique | Stabilité | Statut final | Commentaire |
|------|-------------------|------------------------|---------------------------|---------------------|-------------|-------------|------------|------------------|-------------------|---------------|-----------|--------------|-------------|
| Activimmo | Alderan | | | | | | | | | | | | |
| Comète | Alderan | | | | | | | | | | | | |
| Iroko Zen | Iroko | | | | | | | | | | | | |
| Épargne Pierre | Atland Voisin | | | | | | | | | | | | |
| LF Avenir Santé | La Française REM | | | | | | | | | | | | |

---

## Suite (hors périmètre exécution immédiate)

- Recopie des URLs validées dans `scpi_source_registry` → **validation métier / technique distincte**.
- Phase extraction automatique → **TASK ultérieure**, non lancée sans cloture de TASK-DATA-003.

---

## Historique

| Date | Événement |
|------|-----------|
| 2026-05-18 | Création du fichier TASK-DATA-003 |
