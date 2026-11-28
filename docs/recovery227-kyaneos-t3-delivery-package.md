# RECOVERY-227 — paquet de livraison exécutable, Kyaneos Pierre 2026-T3

Ce document est le paquet demandé par le mandat du 2026-11-28 : **le point
d'entrée réel**, la **commande exacte**, les **préconditions**, la **transaction**
et le **rollback ciblé** pour ré-extraire Kyaneos T3 depuis le PDF déjà archivé.

Aucune écriture n'est incluse dans ce document. Aucun certificat n'est fabriqué.
Aucun `PASS_100` n'est forcé.

---

## 1. Ce qui a réellement produit la ligne décalée (mesuré, pas supposé)

Deux chaînes d'extraction coexistent dans le dépôt. **Seule la première** a écrit
la ligne du 2026-11-28 03:30:53Z :

| Chaîne | Point d'entrée | Lecture du PDF | Écrit `scpi_bulletins.extraction_json` |
|---|---|---|---|
| **Crawler Netlify** | `netlify/functions/utils/scpi-bulletin-ingestion.ts` → `extractFromText` | `pdf-parse` | **oui — c'est la ligne T3** |
| Replay protégé OIDC | `scripts/agents/bulletin_complete_pipeline.py` → `bulletin_fields.py` | MuPDF + Poppler (double géométrie) | non pour ce bulletin |

Rejeu des deux chaînes sur l'octet officiel
(SHA-256 `4def42a528fa1b75372bc132607895169dbc75899c824a55756ddefdff69413c`,
1 401 858 octets, récupéré à l'URL du registre, empreinte identique) :

```
$ pdftotext ... ; python -c "bulletin_fields.reconcile(...)"   # chaîne replay
pages 9, moteurs concordants: true
coverage: prix_souscription=needs_review, valeur_realisation=needs_review,
          prix_reconstitution=needs_review, prix_retrait=needs_review,
          nombre_immeubles=needs_review, capitalisation=verified
```

La chaîne replay **ne produit aucun** des montants décalés : elle ne les retient
pas du tout (`needs_review`), ce qui est un autre sujet et **pas** ce qui a écrit
la ligne. C'est bien `pdf-parse` + `extractFromText` qui a écrit :

```json
"maximus_indicators": {"valeur_realisation":184.42,"prix_retrait":225.02,
                       "nombre_immeubles":8,"endettement":0.25},
"valorisation_risque": {"prix_reconstitution":186.49},
"chiffres_cles": {"prix_part":224,"capitalisation":224}
```

Les valeurs page 4 publiées par l'émetteur (relues par Poppler **et** PyMuPDF) :

| Libellé page 4 | Valeur publiée | Valeur écrite | Nature du défaut |
|---|---|---|---|
| Valeur IFI* | 184,42 € | — | (non publiée) |
| Valeur de réalisation* | **186,49 €** | 184,42 | valeur du libellé voisin |
| Valeur de reconstitution* | **225,02 €** | 186,49 | valeur du libellé voisin |
| Valeur de retrait* | **199,36 €** | 225,02 | valeur du libellé voisin |
| Nombre d'actifs | **666** | 8 | flux d'acquisitions trimestriel |
| Ratio de dettes (jauge 0/25/50 %) | — | 0 | graduation de jauge, **corrigé** en 25 % par #476 |
| Capitalisation (page 1) | **458 M€** | 224 | prix de part de la ligne du dessus |

`nombre_immeubles` et `endettement` ont été corrigés par #476. Les trois montants
par part aussi.

---

## 2. Défaut mesuré, NON corrigé dans cette PR : `capitalisation`

`capitalisation` est un indicateur **CORE** du promoteur certifié
(`supabase/functions/scpi-certified-promote/index.ts`, `CORE = ["tof",
"capitalisation", "prix_souscription"]`). Sur le bulletin Kyaneos 3T 2026 il est
lu à **224** au lieu de **458 000 000**.

Cause, mesurée par lecture du texte réel :

```
Prix de part
224 €
Capitalisation
458 M€
```

Le motif `([\d\s\u00a0.,]+\s*(?:…|€))\s*\n?\s*capitalisa(?:tion)?` capture
`224 €` : il démarre sur la ligne précédente et ne conserve que le dernier
montant de sa capture. C'est la même classe de défaut que les montants par part.

**Pourquoi ce n'est pas corrigé ici.** Une tentative de correction a été
implémentée puis mesurée sur **112 bulletins réels** (téléchargés depuis les URL
de registre, lecture seule) contre la version de #476 :

| Variante essayée | Bulletins modifiés | Verdict |
|---|---|---|
| Montant-avant prioritaire, filtré par libellé voisin | 20 / 112 | Rejetée |
| + garde « colonne de période » | 22 / 112 | Rejetée |
| Inversion simple de priorité | 20 / 112 | Rejetée |

Chaque variante corrige Kyaneos mais **casse des valeurs saines** sur d'autres
émetteurs, par exemple :

- `corum-eurion` : la forme `1,507 milliard d'euros` n'est pas reconnue par
  `parseAmount` (retourne `2 €` au lieu de 1,507 Md€) ;
- `ncap-regions`, `ncap-education-sante` : tableaux à colonnes de périodes sans
  marqueur lisible dans la couche texte — la « première » valeur n'est pas
  celle de la période ;
- `altixia-commerces` : libellé suivi du TOF puis du montant ;
- `esg-pierre-capital`, `altixia-cadence-12`, `cristal-life` : plusieurs
  agencements dans un même document.

Aucune règle textuelle testée ne distingue ces agencements de façon fiable. Une
correction ne peut donc pas être livrée sans revue par émetteur, ce qui sort du
périmètre de cette PR et toucherait des SCPI déjà publiées.

**Ce que la transaction fait face à ce défaut.** Elle **écrit explicitement**
`chiffres_cles.capitalisation = 458000000` pour Kyaneos 3T 2026, avec page 1 et
date du 30/09/2026 dans la provenance. La valeur fausse (224) n'est donc pas
conservée pour cette ligne. Le défaut reste présent pour les autres bulletins et
doit faire l'objet d'une tâche distincte, par émetteur, avec vérification de
chaque valeur contre son PDF.

`capitalisation` n'entre pas dans `scpi_indicators` par le chemin du crawler :
`buildIndicatorPatch` la divise par 1 000 000 et `validateIndicatorPatch` la
borne à `[0.1, 100000]`, donc `224` deviendrait `0.000224 M€` et serait rejeté.
Le défaut est donc confiné à `scpi_bulletins.extraction_json`.

---

## 3. Point d'entrée exact que ChatGPT peut exécuter

Le crawler Netlify **ne se rejoue pas** sur le même SHA : la déduplication
renvoie `unchanged` avant toute extraction.

```ts
// netlify/functions/utils/scpi-bulletin-ingestion.ts:729-762
const { data: existingByHash } = await client.from('scpi_bulletins')
  .select('id,period,pdf_sha256,extraction_json')
  .eq('pdf_sha256', sha256).eq('scpi_slug', source.scpi_slug).maybeSingle();
if (existingByHash?.id && existingByHash.extraction_json) { /* unchanged */ }
```

La branche qui bloque est nommée `step: 'deduplication'` dans
`scpi_ingestion_events` ; elle retourne `status: 'unchanged'` et
`message: 'Bulletin déjà traité (SHA-256 identique).'`.

Tant que la ligne T3 existe avec ce `pdf_sha256` et un `extraction_json`, aucun
redéploiement du correctif ne ré-extraira ce bulletin. Il faut donc une écriture
**explicite et ciblée** de la ligne, ou la suppression préalable de la ligne T3.

### 3.1 Préconditions (à vérifier avant toute écriture)

```sql
-- a) la ligne est toujours celle du décalage
SELECT id, qa_status, pdf_sha256, extraction_confidence
FROM public.scpi_bulletins
WHERE scpi_slug='kyaneos-pierre' AND period='2026-T3';
-- attendu : qa_status='auto_partial_review',
--           pdf_sha256='4def42a5…413c', extraction_confidence=0.3

-- b) aucune surface publiée ne porte ces valeurs
SELECT source_period, valeur_realisation, prix_reconstitution, prix_retrait
FROM public.scpi_indicators WHERE scpi_slug='kyaneos-pierre';
-- attendu : source_period='2026-T2' (225,26 / 199,36) — jamais 2026-T3

-- c) aucune ligne d'historique ni certificat T3
SELECT count(*) FROM public.scpi_indicator_history
 WHERE scpi_slug='kyaneos-pierre' AND source_period='2026-T3';       -- attendu 0
SELECT count(*) FROM public.scpi_metric_certifications
 WHERE scpi_slug='kyaneos-pierre' AND source_period='2026-T3';       -- attendu 0

-- d) la cohorte n'a pas bougé
SELECT count(*) FROM public.scpi_crash_test_strict_v2
 WHERE crash_test_status='PASS_100';                                 -- attendu 68
```

### 3.2 La transaction exacte

Le script est fourni dans le dépôt de la PR :
`scripts/industrial/sql/recovery227_kyaneos_t3_reextraction.sql`.

Il **ne certifie rien**, **ne touche aucune vue**, **ne change aucun seuil** :
il remplace uniquement `extraction_json` de la ligne T3 par la sortie de
l'extracteur corrigé, en laissant `qa_status='auto_partial_review'`. Une ligne
`auto_partial_review` ne peut pas être promue par
`scpi_commit_certified_promotion`, qui exige `qa_status='auto_verified'` et un
certificat par métrique. Le refus est donc structurel, pas une convention.

Exécution (une seule transaction, `ON_ERROR_STOP`) :

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f scripts/industrial/sql/recovery227_kyaneos_t3_reextraction.sql
```

Ou, depuis le SQL editor Supabase de ChatGPT, coller le contenu du fichier :
il est autonome (`BEGIN … COMMIT`, aucune dépendance hors `public`).

Le script :

1. verrouille consultatif `recovery227:kyaneos-pierre:2026-T3` ;
2. vérifie les préconditions §3.1 **et échoue** si elles ne sont plus vraies
   (`REC227_PREIMAGE_MISMATCH`, `REC227_BULLETIN_ROW_ABSENT`, …) ;
3. écrit dans `extraction_json` un bloc `recovery227_reextraction` contenant,
   **par champ**, la valeur, la page, la date de référence, le lecteur, et
   l'empreinte du PDF ;
4. remplace les sept valeurs décalées par les valeurs publiées ;
5. recalcule `extraction_confidence` à partir des champs lus ;
6. **relit sa propre postimage** et échoue si elle diffère
   (`REC227_POSTIMAGE_MISMATCH_REVIEW_REQUIRED`) ;
7. vérifie que le compteur strict est inchangé, sinon `RAISE` et rollback ;
8. capture une préimage **complète** (`extraction_json`,
   `extraction_confidence`, `qa_status` et **`processed_at`**) et une postimage
   complète, puis inscrit un événement `scpi_ingestion_events` distinct d'une
   certification.

### 3.2 bis Ce que la revue indépendante du 28/11 a corrigé

La revue du commentaire `#issuecomment-7237468468` a relevé trois défauts réels
dans le paquet initial. Les trois sont corrigés et prouvés par rejeu hors
production (`src/tests/recovery227Reextraction.test.ts`) :

| Défaut relevé | Correction | Preuve |
|---|---|---|
| `processed_at` modifié sans être sauvegardé ni restauré | capturé dans `bulletin_before` **et** comparé dans `bulletin_after` ; restauré par le rollback | `le rollback restaure la préimage exacte, processed_at compris` |
| `confiance` et `qa_status` préimage codés en dur (`0.3` / `'auto_partial_review'`) | lus sur la ligne réelle (`before_confidence`, `before_qa_status`) et écrits dans la trace | contrat statique : aucune constante de préimage |
| le rollback n'inspectait pas la postimage avant d'écraser | `REC227_ROLLBACK_POSTIMAGE_DRIFT_REVIEW_REQUIRED` si la ligne n'est plus celle écrite par le script | `le rollback refuse d'écraser un état qui n'est plus celui du script` |
| aucune trace d'annulation distincte | nouvel `event_key` `…:rollback-applied`, la trace d'exécution n'est jamais supprimée | `le rollback laisse une trace d'annulation distincte` |
| événement d'ingestion indistinguable d'une certification | statut `manual_review_required`, message explicite, `certifies_nothing=true`, aucun certificat créé | `distingue l'événement d'ingestion d'une certification` |

Deux durcissements supplémentaires, mesurés sur la préimage réelle du
2026-11-28 :

- la préimage de la fixture est désormais une **copie fidèle** de la ligne de
  production (`_meta`, `structure_frais`, les douze entrées de
  `repartition_sectorielle`) : le test prouve que la transaction **préserve**
  ces blocs au lieu de les reconstruire ;
- `SELECT … INTO STRICT` remplacé par un contrôle explicite, pour que l'absence
  de ligne produise `REC227_BULLETIN_ROW_ABSENT` et non un `NO_DATA_FOUND` brut.

### 3.2 ter Définition canonique du ratio de dette

La revue demande de vérifier que « 25 % » correspond bien à la définition
canonique avant toute promotion. Vérifié dans le code réellement monté :

| Couche | Ce qu'elle appelle `endettement` | Unité |
|---|---|---|
| `src/indicators/scpiIndicatorRegistry.ts` | `Endettement (LTV)`, `validate: inRange(0, 60)` | pourcentage |
| `netlify/functions/utils/scpi-bulletin-ingestion.ts` | `endettement: pct(m.endettement)` → `× 100` | `extraction_json` = **fraction**, `scpi_indicators` = pourcentage |
| `supabase/functions/scpi-certified-promote/index.ts` | `DEBT_OUT_OF_RANGE` hors `[0 ; 80]` | pourcentage |
| `scripts/agents/bulletin_fields.py` | `'endettement': ('%', …)` | pourcentage |

La phrase du bulletin — « La dette représente 25 % de la valeur de réalisation
de la SCPI » — **est** ce ratio canonique (dettes / valeur de réalisation), et
non la jauge `0 % / 25 % / 50 %` qui n'est qu'une échelle. Conséquence
appliquée : `extraction_json.maximus_indicators.endettement` reçoit `0.25`
(fraction) et non `25`, sinon `pct()` publierait **2500 %**, valeur refusée par
la borne `[0 ; 80]`. Le script contrôle cette unité et échoue avec
`REC227_DEBT_RATIO_UNIT_OR_DEFINITION_REVIEW_REQUIRED` si la constante change.

### 3.3 Provenance et date, champ par champ

Chaque valeur écrite porte sa source. Les dates sont celles **imprimées**, pas
déduites de la période :

| Champ | Valeur | Page | Date de référence imprimée | Définition |
|---|---|---|---|---|
| `valeur_realisation` | 186,49 | 4 | 2026-06-30 | valeur de réalisation par part |
| `prix_reconstitution` | 225,02 | 4 | 2026-06-30 | valeur de reconstitution par part |
| `prix_retrait` | 199,36 | 4 | 2026-06-30 | valeur de retrait par part |
| `prix_souscription` | 224 | 4 | 2026-06-30 | prix de souscription |
| `endettement` | 25 % | 4 | 2026-09-30 | ratio publié en prose, **pas** la jauge |
| `nombre_immeubles` | 666 | 4 | 2026-09-30 | stock « Nombre d'actifs » |
| `capitalisation` | 458 M€ | 1 | 2026-09-30 | capitalisation en prix de souscription, **écrite explicitement** (voir §2) |

**Anomalie de date à ne pas convertir en donnée rassurante.**
Le bloc « Valeurs de part » du bulletin **3T 2026** porte l'en-tête
**« au 30/06/2026 »** (vérifié par MuPDF et Poppler). C'est la date imprimée par
l'émetteur, donc la date de valeur retenue pour les quatre montants par part.
Elle est **qualifiée séparément** de la période du document (`2026-T3`, arrêtée
au 30/09/2026) et le script l'enregistre telle quelle avec la mention explicite
de l'anomalie. Aucune valorisation n'est datée par déduction de la période.

**Définition du ratio de dette.** Le bulletin publie deux choses distinctes :
une jauge graduée `0 % / 25 % / 50 %` et la phrase « La dette représente 25 % de
la valeur de réalisation de la SCPI qui est autorisée à s'endetter au maximum à
50 % ». Seule la phrase est un ratio publié. La jauge ne produit **rien** (testé :
`extractFromText('Ratio de dettes\n0%\n\n25%\n\n50%\n')` → `endettement`
`undefined`). Le 25 % enregistré est celui de la phrase, pas la graduation.

### 3.4 Rollback ciblé — exécutable, pas seulement documenté

Le retour arrière est un **script versionné**, pas un extrait à recopier :

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f scripts/industrial/sql/recovery227_kyaneos_t3_reextraction_rollback.sql
```

Il corrige les trois défauts du rollback initial :

1. il **refuse d'écraser** un état qui n'est plus la postimage écrite par la
   transaction (`REC227_ROLLBACK_POSTIMAGE_DRIFT_REVIEW_REQUIRED`) — une
   ré-extraction ultérieure ou une correction manuelle survivent. La comparaison
   est null-safe et porte sur les **cinq** champs que la transaction a déplacés :

   | Champ comparé | Référence | Test de dérive dédié |
   |---|---|---|
   | `extraction_json` | postimage | `le rollback refuse d'écraser un état qui n'est plus celui du script` |
   | `extraction_confidence` | postimage | idem |
   | `qa_status` | postimage | idem |
   | `processed_at` | `bulletin_after.processed_at` | `le rollback refuse sans écrire quand processed_at dérive seul` |
   | `pdf_sha256` | préimage | `… quand pdf_sha256 dérive seul (nouveau PDF)` |
   | `source_url` | préimage | `… quand source_url dérive seule (nouvelle source)` |

   Chaque cas de dérive est prouvé séparément : la valeur dérivée doit survivre,
   `extraction_json` doit rester celle du script, et **aucune** trace
   d'annulation ne doit être créée par un refus ;
2. il restaure **`processed_at`** en plus de `extraction_json`,
   `extraction_confidence` et `qa_status`, tous lus depuis la préimage
   réellement capturée, jamais recalculés ;
3. il **trace son annulation** sous un `event_key` distinct
   (`recovery227:kyaneos-pierre:2026-T3:rollback-applied`), sans jamais
   supprimer la trace d'exécution d'origine.

Une trace **antérieure au correctif** ne porte pas de `processed_at` de
postimage. Le rollback ne saute pas ce contrôle en silence : il lève
`REC227_ROLLBACK_PREIMAGE_INCOMPLETE` (tests « trace sans processed_at de
postimage » et « identité du document manquante »).

Codes d'échec nommés : `REC227_ROLLBACK_WITHOUT_EXECUTION_TRACE`,
`REC227_ROLLBACK_PREIMAGE_INCOMPLETE`, `REC227_ROLLBACK_BULLETIN_ROW_ABSENT`,
`REC227_ROLLBACK_WRONG_ROW`, `REC227_ROLLBACK_POSTIMAGE_DRIFT_REVIEW_REQUIRED`,
`REC227_ROLLBACK_PUBLIC_SURFACE_CHANGED`,
`REC227_ROLLBACK_RESTORE_MISMATCH_REVIEW_REQUIRED`,
`REC227_ROLLBACK_ALREADY_EXECUTED`.

Aucune autre ligne n'est concernée : le script ne touche ni `scpi_indicators`,
ni `scpi_indicator_history`, ni `scpi_metric_certifications`, ni les vues.
Une seconde exécution du rollback est refusée, elle n'écrase rien deux fois.

---

## 4. Contrôle indépendant prévu (par ChatGPT, pas par Cursor)

Le paquet ne prétend pas remplacer la revue financière. Après l'écriture :

1. relire la page 4 de l'octet `4def42a5…413c` avec **deux** lecteurs
   indépendants et confirmer les quatre montants et 666 actifs ;
2. confirmer que « Valeurs de part » porte bien `au 30/06/2026` et que le ratio
   de 25 % est la phrase, pas la jauge ;
3. vérifier en SQL que `scpi_indicators` n'a **pas** bougé de période ;
4. vérifier que le compteur strict reste à 68 `PASS_100` (le fonds reste
   `INCOMPLETE` : `last_document_period` et `source_ready` sont `NULL`) ;
5. décider, séparément, du rétablissement de `source_ready` — **hors de ce
   paquet**, et hors de portée de Cursor (voir §6).

---

## 5. Vérification 69/69 via la chaîne existante

La chaîne de vérification est la vue stricte déjà en place, pas un nouveau
script :

```sql
SELECT count(*) FILTER (WHERE crash_test_status='PASS_100') AS pass_100,
       count(*) AS total
FROM public.scpi_crash_test_strict_v2;
```

Règle de lecture : `PASS_100` exige `operational_status='DONE'`, `missing_tof=0`,
`missing_source=0`, `source_confidence>=0.95` et l'absence de quarantaine TOF.
Kyaneos est aujourd'hui `INCOMPLETE` avec `last_document_period IS NULL` et
`source_ready IS NULL` : il **ne peut pas** passer `PASS_100` par cette seule
ré-écriture, et ce paquet ne le prétend pas. Le résultat attendu après
exécution est **68 / 69 inchangé**, avec une extraction T3 désormais exacte.

**Aucun script de ce paquet n'écrit `last_document_period`.** Le champ est lu
par les routes d'admission (`recovery176/177/179`), pas par la ré-extraction :
`grep -n last_document_period` sur les trois SQL du paquet ne renvoie rien. Si
la vue stricte réelle portait déjà `2026-T3` pour Kyaneos au moment de
l'exécution, cette observation est celle de ChatGPT (accès SQL direct) et ne
change rien à l'ordre des étapes ni à l'écriture : l'étape 1 du tableau §7 reste
la propriété du rôle privilégié, et le paquet ne la réécrit jamais « pour être
sûr ».

---

## 6. Quarantaine ciblée déjà en place

`scripts/industrial/sql/recovery227_kyaneos_t3_stale_extraction_quarantine.sql`
(refus de promotion, déjà dans #476) reste valide **avant** ré-écriture et
échoue volontairement après. Ne pas le rejouer après §3.2 : il lève
`REC227_EXTRACTION_ALREADY_CHANGED_REVIEW_REQUIRED`.

Après l'exécution de §3.2, c'est le script de ré-extraction qui porte la trace,
sous la clé `recovery227:kyaneos-pierre:2026-T3:reextracted-from-archived-pdf`.

---

## 7. Chemin minimal vers `source_ready` — décrit, jamais forcé

Une extraction correcte ne rend **pas** `source_ready` vrai, et ce paquet ne le
prétend pas. Le chemin minimal, pour que ChatGPT puisse le suivre sans le
déduire, est une chaîne de quatre conditions distinctes dont **la troisième est
hors de portée de ce paquet**.

| Étape | Ce qui doit être vrai | Qui peut le faire | État |
|---|---|---|---|
| 1 | `scpi_operational_status.last_document_period = '2026-T3'` | écriture privilégiée | **bloqué** (403 `projects_read`) |
| 2 | `qa_status` du bulletin passe à `auto_verified` — exige un certificat `auto_verified_with_evidence` **par métrique**, page > 0, texte de page identique | revue financière indépendante | hors paquet |
| 3 | `source_ready = true` sur `scpi_operational_status` | décision humaine explicite | **jamais déduit d'une extraction** |
| 4 | `operational_status = 'DONE'`, `missing_tof = 0`, `missing_source = 0`, `source_confidence >= 0.95`, aucune quarantaine TOF | conséquence des étapes 1–3 | — |

Rappel de lecture de la vue stricte (`scpi_crash_test_strict_v2`) :

```sql
CASE WHEN operational_status = 'DONE'
      AND missing_source_url = 0 AND source_host_violations = 0
      AND missing_tof = 0 AND cap_consistency_issues = 0
      AND uncertified_tof_periods = 0
      AND NOT EXISTS (… tof_policy_quarantine_audit_20261028 x WHERE x.scpi_slug = b.scpi_slug)
     THEN 'PASS_100' ELSE 'FAIL_STRICT' END
```

`source_ready` n'apparaît pas dans cette expression : il conditionne les
**routes d'admission** (`20261108_recovery179_true_strict_admission_routes.sql`,
`20261107_recovery176/177`), pas le verdict `PASS_100`. Les deux doivent être
vrais pour une publication ; aucun des deux n'est atteignable par une simple
ré-écriture d'`extraction_json`, et c'est exactement pourquoi cette transaction
laisse `qa_status='auto_partial_review'`.

Conséquence vérifiable : après §3.2, le compteur attendu est **68 / 69
inchangé**, avec une extraction T3 exacte et non publiable.

---

## 8. Blocage restant, hors de portée de Cursor

`SUPABASE_ACCESS_TOKEN` est injecté mais `GET /v1/projects` répond **403
`projects_read`**. Cursor ne peut ni lire ni écrire par le management Supabase.
La clé `anon` du site permet la lecture REST, jamais l'écriture.

La chaîne complète exige donc, côté ChatGPT :

1. exécuter §3.2 (écriture `extraction_json`) ;
2. la revue indépendante §4 ;
3. la décision explicite sur `source_ready` / `operational_status` (§7).

Les points 1 et 2 sont dans le périmètre de ce paquet. Le point 3 en est
délibérément exclu : il ne peut pas être déduit d'une extraction correcte.
#470-#473 (cible Supabase hors production) restent un besoin **séparé** : ni ce
paquet ni l'accès `projects_read` n'en sont une condition préalable, puisque
ChatGPT dispose du SQL.
