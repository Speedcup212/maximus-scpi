# Backlog — MaximusSCPI Recovery

> Ordre strict. Aucun chantier ne saute la file sans défaut P0 de production.
> WIP = 1.

---

## File de reprise

| Ordre | ID | Priorité | Description | Statut |
|------:|----|----------|-------------|--------|
| 1 | RECOVERY-001 | P0 | Régimes de liquidité / comparabilité / consommateurs montés | ✅ Code + build validés ; publication différée au RC |
| 2 | RECOVERY-002 | P1 | Restaurer uniquement les décisions UX déjà validées sur la home : H1 validé, cartes outils, `Comprendre`, retrait des chiffres 4 650 / 330 M€, responsive, sans changer logo/header/footer hors décision existante | 🔄 En cours |
| 3 | RECOVERY-003 | P1 | Simplifier la CI : un seul flux test → build → package ; supprimer le doublon de packaging ; sortir les artefacts `.netlify/` du suivi Git | ⏸️ Gelé jusqu'à RECOVERY-002 |
| 4 | RECOVERY-004 | P0 release | Construire RC-1 et exécuter le gate complet avant un unique déploiement Netlify | ⏸️ En attente |
| 5 | RECOVERY-005 | P2 | Reprendre la dette TypeScript par petits lots uniquement après RC-1 | ⏸️ Différé |

---

## Chantiers volontairement gelés

- Surveillance / Monitor.
- Extension de 61 à 212 SCPI.
- Plugin ChatGPT.
- Nouvelles fonctionnalités espace client hors correction bloquante.
- Nouvelle refonte graphique.
- Recherche de moat / nouveaux modèles commerciaux.
- Nettoyage TypeScript global.
- Nouveaux déploiements Netlify hors RC-1 ou hotfix production critique.

---

## Anciennes tâches

Les anciennes tâches `TASK-*` restent historiquement traçables dans Git et `tasks/done.md`, mais ne pilotent plus la phase Recovery. Toute reprise doit être requalifiée en `RECOVERY-*` et replacée dans l'ordre ci-dessus.


## RECOVERY-027 — CORUM document backfill (autorisé le 27/10/2026)

P0 actif : découverte officielle complète, double extraction PDF, preuves et reprise idempotente ; aucun changement des seuils de readiness. Périmètre : scripts/agents/corum_document_pipeline*, tests dédiés, workflow planifié, routage Supabase du pipeline et migration de journalisation privée. Vérification des 65 fonds et des exceptions existantes.

RECOVERY-027 — Jalons atteints : 65 PASS / 65 readiness, pipeline protégé appliqué et exécution OIDC réelle PASS. Certification exhaustive des anciennes archives : 36 bulletins encore en QA ; aucune clôture fictive. Livraison du code via PR #212, fusion conditionnée aux checks exacts.

## RECOVERY-068 — BNP 67/68 delegated publication (owner authorized 2026-11-01)
Publication réalisée le 02/11/2026 : Accès Valeur Pierre et Accimmo Pierre promues atomiquement, 66 → 68 pilotes actifs. Déploiement de publication `10da46c31a6d0e27ec5f9b480053b31ddd5dbd92` vérifié sur Netlify ; certification OIDC réelle de 68 analyses PASS (run GitHub 41423280906). Sources officielles rapprochées à leurs pages et empreintes ; matrice navigateur authentifiée de 24 cas ordinateur/mobile PASS (runs 41422835948 et 41422836035). Pages canoniques HTTP 200 et sitemap contrôlés. Contrôle visiteur réel : deux SCPI présentes dans le comparateur, vigilance élevée et liquidité documentée ; historiques partiels T2/T3, TOF T2 litigieux d’Accès Valeur Pierre masqué. La visibilité de la ligne T2 exige son égalité intégrale au snapshot approuvé du lot publié ; aucun relèvement de QA historique ni certification de tendance. Les contrôles SQL sous anon refusent un prix ou une empreinte altérés. Dernière correction de présentation : année annuelle 2025 explicite et zones géographiques. Dossier détaillé et revue déléguée conservés dans le registre privé ; aucune signature humaine fabriquée.
