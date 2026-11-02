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
Active scope: remove per-SCPI human-only actor requirements under standing delegation; retain truthful financial, document, browser and security evidence; finalize Accès Valeur Pierre and Accimmo Pierre. Source PDFs: 47 exact page/token/hash checks PASS. 15 onboarding/release tests PASS. Delegation private access and unknown-actor rejection verified in Supabase. Local Chromium fails to launch with socket EPERM; GitHub CI is required for authentic browser evidence. Publication is NOT complete. Repair the non-idempotent hero prebuild patch discovered during validation, with regression test.

## RECOVERY-069 — Hotfix de mesure autorisé par Eric le 02/11/2026 : attribution UTM du funnel

- Autorisation explicite limitée à ce hotfix ; branche dédiée `fix/attribution-utm-funnel` demandée par Eric, en exception à la branche Recovery historique.
- Périmètre : `src/utils/attribution.ts`, `src/main.tsx`, `src/utils/funnelAnalytics.ts`, `netlify/functions/funnel-event.ts`, tests Vitest dédiés et cette trace de tâche.
- Capture initiale de `utm_source`, `utm_medium`, `utm_campaign` dans les clés de session existantes ; conservation de la première valeur par clé ; normalisation `[a-z0-9_-]`, minuscules, 80 caractères.
- Événements soumis au consentement analytics existant ; seules les trois nouvelles clés sont autorisées côté serveur. Aucun champ personnel ajouté aux événements.
- Vérifier les consommateurs `leadSubmitter.ts` et `src/config/calendly.ts` sans les modifier. `track-funnel-event.mts`, les pages éditoriales interdites, Supabase, les migrations et la home restent hors périmètre.
- Validation : six scénarios demandés, `npm run test`, puis `npm run typecheck` ; comparer les échecs à la base avant correction. Build Vite de production sans les scripts de génération SCPI/SEO hors périmètre.
- Limites à signaler : stockage de session avant le choix cookies ; anciens composants pouvant réécrire les UTM ; aucune garantie d'attribution sans URL balisée ni entre sessions.
- Diagnostic confirmé : les deux listes autorisées excluaient les UTM et la capture n'était pas globale. `captureAttribution()` est appelé une fois avant `createRoot`. Aucune référence à `track-funnel-event.mts` dans `src/` ; le consommateur réel appelle `/api/funnel-event`.
- Résultats locaux : 47/47 nouveaux tests PASS ; `npm run test` = 188 PASS / 3 échecs préexistants inchangés dans `scpi-bulletin-edge-protection.test.ts` (contrôle de l'hôte émetteur des fixtures). Avant correction : 141 PASS / les mêmes 3 échecs.
- `npm run typecheck` = échec préexistant : 1 020 diagnostics sur 187 fichiers, identiques avant/après comparaison hors numéros de ligne ; aucun nouveau diagnostic, aucune correction hors périmètre.
- Non-régression historique : 11/11 tests des conversions et de l'endpoint PASS. Build Vite de production PASS (`npx vite build --outDir /tmp/maximus-utm-vite-build`) ; pipeline complet `npm run build` non lancé car il exécute les générateurs SCPI/SEO hors périmètre. Aucun artefact de build commité.
- `submitLead` et `buildCalendlyUrl` vérifiés avec les UTM après navigation, sans modification et sans accès à une base réelle. Les événements restent bloqués sans consentement analytics.
- À arbitrer : la capture globale stocke les UTM avant le choix cookies (comportement déjà présent dans `RdvModal`, désormais généralisé). `RdvModal`, `EmailSimulationModal` et les anciennes landing pages peuvent toujours écraser les clés partagées : l'utilitaire conserve la première valeur, mais ne peut garantir cette règle face à ces écritures hors périmètre. Le getter nettoie aussi ces valeurs lors de l'émission des événements ; il ne réécrit pas les données lues par les leads.
- État : correctif implémenté et validé sur son périmètre, prêt pour PR. Les gates globaux restent en échec préexistant ; aucune clôture de release, aucun merge ni déploiement autorisé.
