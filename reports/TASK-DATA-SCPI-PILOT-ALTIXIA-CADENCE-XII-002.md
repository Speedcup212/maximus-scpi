# TASK-DATA-SCPI-PILOT-ALTIXIA-CADENCE-XII-002 — Rapport final

**Date :** 2026-05-27
**Branche :** `claude/issue-1-20260515-1418`
**Statut :** ✅ Complété

---

## Objectif

Sécuriser le traitement des anomalies détectées sur le pilote Altixia Cadence XII avant passage aux lots de 5 SCPI. Corriger les règles de parsing WALT/WALB, vérifier les indicateurs `manual_review`, et établir les règles de publication définitives.

---

## Sources relues

| Fichier | Type | Pages nouvellement lues |
|---|---|---|
| `data-import/processed/altixia-cadence-xii/indicator-matrix.json` | Matrice pilote | — |
| `data-import/processed/altixia-cadence-xii/anomalies.json` | Anomalies détectées | — |
| `data-import/processed/altixia-cadence-xii/document-inventory.json` | Inventaire documentaire | — |
| `doc1-20260309-180655.pdf` (Note d'information) | p38–39 Annexe Disclosure | Lues pour SFDR |
| `doc1-20250526-145625.pdf` (RA 2024) | p46 convention prestation | Lu pour ISR + SFDR |

---

## 1 — WALT / WALB : règle de parsing corrigée

### Analyse de l'anomalie #1

**Convention ASPIM standard :**

| Sigle | Signification | Durée |
|---|---|---|
| **WALB** | Weighted Average Lease Break — première date de sortie possible | **Courte** |
| **WALT** | Weighted Average Lease Term — échéance finale du bail | **Longue** |

**Bulletin T1 2026 (libellés explicites d'Altixia REIM) :**

| Sigle bulletin | Libellé | Valeur |
|---|---|---|
| WALT | "Durée moyenne restante des baux" | **2,6 ans** |
| WALB | "Durée moyenne ferme des baux" | **5,9 ans** |

**Rapport Annuel 2024 (sans sigle, valeurs nues) :**

| Libellé | Valeur | Équivalent ASPIM |
|---|---|---|
| "Durée moyenne ferme des baux restant à courir" | 2,55 ans | WALB (break = court) |
| "Durée résiduelle moyenne des baux" | 6,71 ans | WALT (term = long) |

### Conclusion

Le bulletin T1 2026 utilise les libellés WALT et WALB **en sens inverse de la convention ASPIM** :
- Le bulletin appelle **WALT** ce qui est en réalité le **WALB** (break, durée courte : 2,6 ans)
- Le bulletin appelle **WALB** ce qui est en réalité le **WALT** (term, durée longue : 5,9 ans)

Les valeurs numériques sont cohérentes avec l'évolution du portefeuille (RA 2024 : 2,55/6,71 → T1 2026 : 2,6/5,9). Il n'y a pas d'inversion des valeurs, seulement une inversion des étiquettes.

### Règle de parsing — WALT/WALB

```
SI un document Altixia REIM utilise les libellés "WALT" et "WALB" :
  → STOCKER les valeurs avec les libellés du document (source de vérité brute)
  → SIGNALER que la convention Altixia est inversée vs. ASPIM standard
  → NE JAMAIS publier WALT/WALB sans confirmer la convention utilisée

SI la valeur "courte" (≤ 4 ans) est étiquetée WALT dans le document :
  → La stocker comme walt_document = X ans, walb_document = Y ans
  → Ajouter un flag: convention = "altixia_inversee"
  → publication_status = manual_review

SI les deux valeurs sont présentes sans libellé :
  → Ne pas assigner WALT/WALB sans confirmation explicite
  → publication_status = missing

RÈGLE ABSOLUE : ne jamais publier WALT/WALB si :
  - libellé ambigu ou absent dans le document source
  - inversion possible entre documents d'une même SCPI
  - aucune confirmation de la convention appliquée
  - divergence > 1 an entre deux documents de la même période
```

**Application à Altixia Cadence XII :**

| Indicateur | Valeur stockée | Convention | Statut |
|---|---|---|---|
| `walt` | 2,6 ans (libellé bulletin) | Altixia inversée vs ASPIM | `manual_review` ✓ |
| `walb` | 5,9 ans (libellé bulletin) | Altixia inversée vs ASPIM | `manual_review` ✓ |

Les statuts `manual_review` du pilote sont **maintenus et justifiés**.

---

## 2 — SFDR : correction de l'évaluation

### Données nouvelles (Annexe Disclosure, Note d'info p38–39)

**Titre de l'annexe :**
> "Information pré-contractuelle requise par **l'article 6** du Règlement (UE) 2019/2088 (dit Disclosure) et 7 du règlement (UE) 2020/852 (dit Taxonomie)"

**Contenu :**
> "A ce jour, les investissements immobiliers de la SCPI ALTIXIA CADENCE XII **ne prennent pas en compte des facteurs de risques en matière de durabilité dans les décisions d'investissement** mais une réflexion en ce sens est entamée"

> "La Société s'engage à respecter un **alignement minimum de 0%** avec la Taxonomie européenne"

**Données RA 2024 p46 (convention de prestation) :**
> "pour ses diligences en vue de **l'obtention** du label ISR et/ou d'une classification **article 8 ou 9** au regard de SFDR, une rémunération de €500 HT par actif en présence d'un plan d'action"

### Analyse

- L'annexe est titrée "article 6" car l'article 6 SFDR impose des disclosures **à tous les produits**, quel que soit leur classement — ceci ne signifie pas que le produit est "Article 6 produit" au sens commercial.
- Cependant, le contenu — "ne prennent pas en compte les facteurs de durabilité" — est le corps de la déclaration **Article 6** (non-intégration des risques de durabilité). Les fonds Article 8 déclarent généralement les caractéristiques environnementales ou sociales promues.
- Le RA 2024 mentionne une diligence **"en vue de l'obtention"** d'une classification Article 8 ou 9 — ce qui implique que la classification n'est pas encore atteinte à la date du rapport annuel.

### Correction

| Paramètre | Pilote 001 | Correction 002 |
|---|---|---|
| Valeur | Article 8 | **Incertain — Article 6 probable** |
| Source | Note d'info (indirect) | Note d'info Annexe p38 (direct) |
| Confidence score | 0,85 | **0,40** |
| Statut | manual_review | **manual_review** ✓ |
| Raison | Phrasing standard A8 | Annexe Article 6 explicite + no ESG integration confirmée + A8 en cours d'obtention (RA 2024 p46) |

**Règle de parsing — SFDR :**

```
SOURCE PRIORITAIRE : Annexe Disclosure de la Note d'Information
  → Chercher le titre de l'annexe : "article 6", "article 8" ou "article 9"
  → Lire le corps : promotion de caractéristiques E/S (→ Art.8) ou objectif durable (→ Art.9)

INDICATEURS Article 8 :
  + "promeut des caractéristiques environnementales et/ou sociales"
  + alignement taxonomie > 0% (ou déclaration spécifique)
  + référence à l'article 8 dans le corps du texte

INDICATEURS Article 6 :
  + "ne prend pas en compte les facteurs de durabilité" (corps du texte)
  + alignement taxonomie = 0% + aucune caractéristique E/S promue

NE JAMAIS inférer Article 8 à partir :
  - du seul phrasing "critères EU taxonomie non pris en compte" (present in both Art.6 & Art.8)
  - des données legacy non confirmées
  - d'indices indirects dans la lettre de gestion
```

---

## 3 — Label ISR : correction de l'évaluation

### Données nouvelles (RA 2024 p46)

> "pour ses diligences **en vue de l'obtention du label ISR** et/ou d'une classification article 8 ou 9 au regard de SFDR, une rémunération de €500 HT par actif **en présence d'un plan d'action d'amélioration**"

> "pour ses diligences en vue du **suivi et du reporting** de chaque actif au regard du label ISR et/ou d'une classification article 8 ou 9 au regard de SFDR, une rémunération de €500 par actif et par an"

### Analyse

La double mention ("obtention" + "suivi et reporting") crée une ambiguïté :
- "Obtention" → le label n'est pas encore obtenu
- "Suivi et reporting" → si déjà obtenu, maintien en cours

Les deux formulations coexistent dans la même convention, décrivant deux scénarios (selon l'avancement). On ne peut pas conclure directement.

La note d'information et le bulletin T1 2026 ne mentionnent pas le label ISR explicitement dans les pages lues. L'absence de mention dans le bulletin — qui liste habituellement les certifications — est un indice supplémentaire d'incertitude.

### Correction

| Paramètre | Pilote 001 | Correction 002 |
|---|---|---|
| Valeur | Oui (legacy) | **Incertain** |
| Confidence score | 0,60 | **0,45** |
| Statut | manual_review | **manual_review** ✓ |
| Raison | Legacy Excel uniquement | RA 2024 p46 : label en "cours d'obtention" au 31/12/2024, absence dans bulletin T1 2026 |

**Règle de parsing — Label ISR :**

```
SOURCE PRIORITAIRE : Bulletin trimestriel (page couverture ou fiche d'identité)
  → Chercher picto/badge ISR, mention explicite "Label ISR" ou "Fonds ISR"
  → La note d'information peut confirmer

JAMAIS inférer depuis :
  - des données legacy seules
  - une mention de "démarche ISR en cours" ou "en vue de l'obtention"
  - les frais de gestion liés à l'ISR

publication_status = publishable UNIQUEMENT si mention explicite dans document officiel récent
publication_status = manual_review si legacy seul, mention indirecte, ou démarche en cours
```

---

## 4 — Surcote/décote calculée

### Évaluation

La valeur 0,30% a été calculée par la formule `(prix_souscription - valeur_reconstitution) / valeur_reconstitution × 100 = (200 - 199,40) / 199,40 × 100`.

La surcote/décote est publiée directement dans certains documents (ex. : rapport ASPIM, certaines fiches gestionnaire). Dans les documents Altixia lus, elle n'est pas publiée explicitement.

**Décision :** `manual_review` confirmé — donnée calculée non publiée officiellement.

**Règle :**
```
Surcote/décote : publishable UNIQUEMENT si valeur explicitement publiée dans le document source
                 manual_review si calculée par l'agent
```

---

## 5 — Prévisionnel TD 2026

**Évaluation :** La fourchette 5,00%–5,20% est un objectif prévisionnel non garanti, explicitement présenté comme tel dans le bulletin T1 2026. Il ne peut pas être publié comme donnée ferme.

**Décision :** `manual_review` confirmé.

**Règle :**
```
Prévisionnel TD : jamais publishable
                  manual_review si fourni avec les conditions de non-garantie
                  Libellé obligatoire : "objectif prévisionnel, non garanti"
```

---

## 6 — Indicateurs publishable : aucune correction requise

Les 46 indicateurs `publishable` du pilote ont été vérifiés. Aucune correction à apporter :
- Tous issus de documents officiels identifiés avec certitude
- Toutes les valeurs numériques lues directement dans les documents (non calculées)
- Aucune divergence non résolue entre documents pour ces indicateurs
- Sources et pages documentées dans `indicator-matrix.json`

---

## 7 — Règles générales établies pour les lots de 5 SCPI

### Règle WALT/WALB
1. Lire les libellés exacts du document source
2. Comparer avec la convention ASPIM : WALB = break (court) / WALT = term (long)
3. Si inversion détectée : stocker les valeurs avec flag `convention_inversee = true`
4. Toujours `manual_review` jusqu'à confirmation de la convention par société de gestion
5. Ne jamais publier si deux documents d'une même SCPI donnent des valeurs contradictoires sans explication temporelle

### Règle SFDR
1. Source prioritaire : Annexe Disclosure de la Note d'Information
2. Lire le titre de l'annexe ET le corps du texte
3. Article 8 confirmé uniquement si : promotion E/S caractéristiques explicite OU alignement taxonomie > 0%
4. "0% alignement taxonomie" seul est insuffisant — présent dans Art.6 et Art.8
5. Données legacy SFDR : confidence_score max 0,5 si non confirmé PDF

### Règle Label ISR
1. Source prioritaire : bulletin trimestriel ou rapport annuel (mention explicite)
2. Picto ISR ou texte "Fonds ISR" / "Label ISR obtenu" requis
3. "Démarche en cours" = manual_review, pas publishable
4. Données legacy ISR : confidence_score max 0,5 si non confirmé PDF

### Règle données calculées
1. Surcote/décote, TRI intermédiaires, rendement net calculé : toujours `manual_review` si non publiés dans les sources
2. Toujours documenter la formule utilisée dans le champ `note` de l'indicateur

### Règle données prévisionnelles
1. Jamais `publishable`
2. `manual_review` si mentionné avec clause de non-garantie explicite
3. Libellé obligatoire dans l'UI : "objectif prévisionnel, non garanti"

---

## 8 — Statuts corrigés pour Altixia Cadence XII

| Indicateur | Statut 001 | Statut 002 | Modification |
|---|---|---|---|
| `label_isr` | manual_review (0,60) | manual_review (0,45) | Confidence abaissée |
| `sfdr` | manual_review (0,85) | manual_review (0,40) | Confidence abaissée + Article 6 probable |
| `walt` | manual_review | manual_review | Confirmé + règle documentée |
| `walb` | manual_review | manual_review | Confirmé + règle documentée |
| `surcote_decote` | manual_review | manual_review | Confirmé |
| `previsionnel_td_2026` | manual_review | manual_review | Confirmé |
| `nombre_parts` (calculé) | publishable | **manual_review** | Correction : valeur calculée, non lue directement |

> **Correction supplémentaire** : `nombre_parts` (951 781) a été calculé (947 190 + 11 399 - 6 808) et non lu directement dans le document. La page 9 du bulletin affiche la valeur tronquée ("951 [coupé]"). Statut corrigé en `manual_review`.

**Bilan final :**
- `publishable` : **45** (−1 vs pilote 001)
- `manual_review` : **8** (+1 vs pilote 001)

---

## 9 — Vérifications

Aucun fichier de code modifié → `npx tsc --noEmit` et `npm run build` non requis.

---

## Contraintes respectées

- ✅ Aucune modification du design
- ✅ Aucune intégration en base
- ✅ Pas de passage aux lots de 5 SCPI
- ✅ Pas de git add/commit/push sans validation

---

## Recommandation finale

Les règles établies dans cette tâche sont prêtes pour application aux lots de 5 SCPI. Points d'attention prioritaires :

1. **WALT/WALB** : toujours lire les libellés exacts + vérifier la convention de chaque société de gestion
2. **SFDR** : toujours lire l'Annexe Disclosure + ne pas se fier aux données legacy seules
3. **Label ISR** : toujours chercher la mention explicite dans le bulletin ou le rapport annuel
4. **Données calculées** : marquer `manual_review` systématiquement même si le calcul est trivial
