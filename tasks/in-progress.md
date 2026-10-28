# Tâches en cours — MaximusSCPI Recovery

> Mode RECOVERY actif à compter du 05/10/2026.
> WIP = 1. Aucun nouveau chantier produit ne démarre tant que la tâche active n'est pas clôturée.
> Branche de travail unique : `recovery/maximus-clean-20261005`.
> Base de référence : production stable `cf5ee9e158f4f0ef5ab5cd9336163effa83c2427`.
> Aucun déploiement Netlify avant le gate RC.

---

## Tâche active

| ID | Priorité | Description | Critère de clôture |
|----|----------|-------------|--------------------|
| RECOVERY-002 | P1 | Vérifier et verrouiller uniquement les décisions UX déjà validées sur la home : H1, dashboard outils, `Comprendre`, retrait des chiffres 4 650 / 330 M€, responsive ; aucune nouvelle création | Sources identiques à la version validée + build PASS + assertions statiques home PASS |

### État RECOVERY-002

- React `HomeApp`, `Header` et `HomeBelowFold` = version validée du 03/10.
- Shell statique final corrigé : H1 validé, `Analyses`, `Comprendre`, nouvelle copie, suppression de `4 650 / 330 M€`.
- Assertion directe : `HOME_STATIC_ASSERTIONS_PASS`.
- Ancien build `4fab84` : échec uniquement sur une signature textuelle du garde prebuild ; cause corrigée par `4bbadb`.
- Gate propre à relancer sur le head Recovery actuel.

---

## Correctif d'infrastructure exécuté pour débloquer le gate

Sans ouvrir un second chantier produit :
- workflow Netlify de packaging doublon supprimé ;
- workflow principal préparé avec `concurrency/cancel-in-progress` ;
- `.netlify/` détracké du dépôt et toujours présent dans `.gitignore` ;
- PR de validation #80 fermée sans merge ; PR #81 = validation uniquement, ne pas merger.

Ces changements constituent l'implémentation technique de RECOVERY-003, mais RECOVERY-003 ne sera clôturé qu'après le build propre commun.

---

## Lot précédent validé

`RECOVERY-001` — liquidité / changements de régime : **CODE + BUILD PASS** sur le head Recovery `018a4847038a5c2617261f622fce34153ea30c5d`.

Preuves :
- assertions métier locales : `CORE_GUARDS_PASS` ;
- 61 SCPI : 0 incohérence active régime / retrait / gates ;
- GitHub Build verification : extraction SCPI PASS + production build PASS ;
- aucune publication Netlify ; la correction reste `qa_pass` jusqu'au RC et au contrôle public.

---

## Règles pendant RECOVERY-002

- Aucune nouvelle idée UX : restauration stricte de la version déjà validée.
- Aucun commit direct sur `main`.
- Aucun déploiement Netlify.
- Pas de TypeScript global, Monitor, plugin, 212 SCPI ou nouvelle feature.


## RECOVERY-006 — Correctif demandé le 27/10/2026 : trajectoire partielle

La phase initiale est clôturée sur la branche Recovery (archive `2ad779b`).
Branche dédiée : `fix/trajectory-last-validated-values-20261027`.
Périmètre : `trajectoryData.ts`, `ScpiTrajectoryPanel.tsx`, tests ciblés,
rapprochement SQL sourcé CORUM USA T3 et étape CI des tests de trajectoire.
Critères : valeurs datées par métrique, aucun remplissage des séries, liquidité inchangée,
valorisation sur une même observation, double lecture du bulletin, tests et build PASS.
État : validation en cours ; aucun statut global de readiness modifié.

## RECOVERY-007 — Extraction de toutes les données publiées, 27/10/2026

Correction demandée : la réalisation et la reconstitution présentes dans le T3
CORUM USA ne remontaient pas dans le comparateur. Étendre le driver et tracer
la couverture par champ ; ne pas masquer le problème par des valeurs antérieures.
Branche : recovery/scpi-bulletin-completeness-20261027.
Périmètre : driver CORUM, RPC, provenance, catalogue, mapping, trajectoire et modal.
État : données T3 des quatre CORUM rapprochées ; code et tests en validation.
Preuves : reports/trajectory/RECOVERY-007-20261027.md.

## RECOVERY-008 — Ordre du bloc WALT/WALB, 27/10/2026

Demande : le bloc ne doit pas précéder les chiffres clés.
Cause : enfant indépendant sans ordre CSS, placé avant les enfants order=10+.
Correction : bloc inclus dans scpi-rental-source-coverage du tableau technique ;
assertion Chromium vérifiant sa présence dans ce groupe et après Chiffres clés.
Branche : fix/walb-rental-section-20261027. Validation puis contrôle public requis.

Publication RECOVERY-008 vérifiée le 27/10/2026 : commit b9cfca2, Netlify
6ae0a05f8587ceac6444147c ready ; chiffres clés premiers, bloc détaillé dans les
indicateurs locatifs. Tests navigateur sur quatre CORUM PASS. Tâche clôturée.

## RECOVERY-009 — Tous les bulletins des 65 SCPI, 27/10/2026

Demande explicite : retraiter tous les bulletins disponibles, archives comprises,
pour toutes les SCPI, sans plafond fonctionnel ni sélection du dernier trimestre.
Branche : recovery/all-bulletins-completeness-20261027.
Périmètre : inventaire documentaire actif, extraction complète par champ/date/page,
OCR des pages illisibles, reprise idempotente, écriture historique et indicateurs,
suivi de complétude documentaire et orchestration GitHub OIDC protégée.
Conserver les certifications contradictoires en revue, NULL réels et bases de
liquidité. Un SHA déjà connu ou trois champs extraits ne valent pas complétude.
Critères : chaque document connu possède une tentative/version et un résultat
explicite ; aucune donnée publiée omise par limite de lot, de page ou de période ;
preuves par champ, tests adversariaux et contrôle des consommateurs.
État : inventaire et reprise en cours.

Suite autorisée le 28/10 : achever le correctif SELECT, mettre le workflow sur
main après CI du head exact, reprendre les 201 erreurs et 515 références HTML.
Périmètre et preuves : reports/trajectory/RECOVERY-009-20261027.md. Les sources
inaccessibles et les conflits restent traçables ; aucune complétude financière
ni publication n'est déduite d'un workflow vert.
