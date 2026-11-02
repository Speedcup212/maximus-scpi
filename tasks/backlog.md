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

### Suite RECOVERY-069 — consentement, autorisée le 02/11/2026

- PR #255, même branche et mêmes interdits ; intégration explicite de `origin/main` autorisée pour inclure `scripts/scpi-history/certificationHistoryPolicy.test.mjs`, absent du premier candidat CI. Conflit documentaire résolu en conservant le texte de clôture RECOVERY-068 de main et la présente tâche.
- Nouveau périmètre : `src/utils/analyticsConsent.ts` (déplacement exact du garde existant), `src/utils/attribution.ts`, `src/utils/funnelAnalytics.ts`, tests dédiés et cette trace. Aucun changement de `useCookieConsent`, `RdvModal`, `leadSubmitter`, `calendly`, des landing pages ni des autres fichiers interdits ; les changements SCPI intégrés proviennent exclusivement de main.
- Remplace le stockage avant consentement décrit dans l'implémentation initiale : capture normalisée en mémoire du module ; écriture dans les clés de session existantes uniquement si consentement analytics, sans remplacement d'une clé présente. `persistAttribution()` est appelé après le garde de consentement et avant la lecture des UTM dans chaque événement. Lecture de session prioritaire, sinon mémoire ; graphe d'imports sans cycle.
- Tests attendus : absence/refus de consentement sans écriture de ce module, consentement déjà donné, acceptation après arrivée sur la même page avec persistance au premier événement, repli URL conservé dans `submitLead` en cas de refus et maintien des six scénarios initiaux.
- Main intégré : `7ff5b50c4107b2c8970de542065fb4ab9bd6bb00`. Le test de politique d'historique qui manquait au premier candidat est désormais inclus ; ses 3/3 cas PASS localement. Aucun code financier ou migration modifié par ce hotfix par rapport à cette base.
- Validation locale, dans l'ordre demandé : `npm run test` = 208 PASS / les mêmes 3 échecs préexistants (26 fichiers, 211 cas) ; `npm run typecheck` = les mêmes 1 020 diagnostics sur 187 fichiers, aucun ajout ni retrait par comparaison hors coordonnées, y compris après intégration de main ; `npx vite build` = PASS. Les échecs préexistants restent hors périmètre.
- Tests dédiés : 67/67 PASS (consentement 11, attribution 17, funnel/consommateurs 30, endpoint 9). Vérification explicite de l'absence d'appel à `sessionStorage.setItem` sans consentement ; acceptation tardive sur la même page et après navigation SPA ; priorité de session sur mémoire ; première valeur conservée ; `submitLead` lit toujours les UTM de l'URL en cas de refus, sans événement ni écriture de ce module. Les 11/11 tests historiques du funnel PASS.
- Le corps de `hasAnalyticsConsent()` est identique à l'original ; imports vérifiés sans cycle (`analyticsConsent` autonome, puis `attribution`, puis `funnelAnalytics`). Les anciens composants restent inchangés, y compris leurs propres écritures UTM : ce correctif ne certifie pas leur comportement avant consentement.
- État : correctif validé localement ; résultats finaux de chaque check CI sur le dernier commit et retard sur main à consigner dans la PR #255 avant le rapport final. Publication de la branche via connecteur GitHub si le CLI reste sans identifiants, avec égalité de l'arbre testé vérifiée. Aucun merge de PR ni déploiement autorisé.

## RECOVERY-070 — Industrialisation de l'onboarding SCPI (02/11/2026)
- Problème : 66/68 codé en dur dans le sitemap, le comparateur, la QA historique et certains tests navigateur ; anomalies de valorisations datées, historique RLS et dépendances au domaine BNP découvertes tardivement.
- Tranche réalisée sur `fix/recovery-070-scpi-onboarding` : baseline immuable de 68 slugs, contrôle de cohorte extensible sans substitution, manifeste de candidats réutilisable, préflight PDF/page/date/empreinte/période, états d'absence et tests unitaires, navigateur desktop/mobile paramétré, workflow CI autonome.
- Sécurité : extraction/QA uniquement, pas d'écriture Supabase, pas de promotion automatique, pas d'attestation fictive. Les contrôles OIDC/RLS/commit/build/revue déléguée et publication atomique restent obligatoires.
- Traçabilité : docs/scpi/RECOVERY-070-onboarding.md. Gate de build ajouté ; résultats de CI et essai 69e SCPI à compléter avant de déclarer le chantier entièrement clos.


## RECOVERY-071 — Hotfix conversion autorisé par Eric le 02/11/2026 : superposition du formulaire de rendez-vous et de Calendly

- ID 071 attribué après la fusion de RECOVERY-070 (onboarding SCPI), pour éviter deux tâches RECOVERY portant le même numéro.
- Branche `fix/rdv-calendly-overlay` issue de `main` ; autorisation ultérieure explicite de merger et déployer donnée le 02/11/2026.
- Cause visuelle : `RdvModal` en `z-[10001]` reste devant l'overlay Calendly après `openCalendlyPopup()`.
- Correction : `isCalendlyActive` masque le rendu du formulaire, sans démonter le composant ni interrompre l'écoute de `calendly.event_scheduled`. Un `MutationObserver` surveille la disparition de `.calendly-overlay` et appelle `onClose()` une seule fois seulement si aucune réservation n'a été signalée. Nettoyage au démontage, redirection et repli natif conservés ; aucune modification de `calendlyPopup.ts` ni de la fenêtre cookies Calendly.
- Cause UTM : `src/App.tsx` (`navigateToView`) remplace la query string avec `history.pushState({}, '', path)` ; `src/HomeApp.tsx` (`go(path)`) recharge une URL sans UTM. La capture initiale conserve les valeurs en mémoire mais les consommateurs lead et Calendly lisaient seulement sessionStorage et URL. Sans consentement analytics, sessionStorage reste vide et la source disparaît après navigation SPA.
- Correction UTM : `getAttribution()` ajouté comme dernier repli pour trois clés seulement (`utm_source`, `utm_medium`, `utm_campaign`), sans écriture supplémentaire. Le consentement analytics reste inchangé. Limite : la mémoire ne survit pas à un rechargement complet sans UTM conservés dans l'URL.
- Tests Vitest dédiés : formulaire masqué et modal monté, réservation unique/redirection, fermeture sans réservation/réouverture, fallback Calendly, cookies refusés avec UTM uniquement en mémoire ; exécution des tests dédiée en CI.
- Périmètre : `src/components/RdvModal.tsx`, `src/utils/leadSubmitter.ts`, `src/config/calendly.ts`, tests, ajout de gate ciblé dans `.github/workflows/build-verification.yml` et ce backlog. Aucune modification du routage, des pages SEO interdites, de Supabase, du consentement ou de la home.

### RECOVERY-070 — Phase 2 (02/11/2026)
- Réconciliation sans écriture des valeurs datées, détection des contradictions interbulletins et preuve numérique exacte ajoutées au preflight, y compris tests des répétitions des dates d'arrêté.
- Pilote 69e identifié pour la découverte documentaire : Sofidynamic (Sofidy). Fiche de découverte sur source officielle, mais les PDF binaires, empreintes et analyses ne sont pas certifiés. La candidate reste privée.
- Aucune publication de données ni activation de connecteur ; la preuve de CI et l'état de la PR dédiée doivent être rapprochés avant clôture.

### RECOVERY-070 — Phase 3 : preuve PDF Sofidynamic
- Nouveau vérificateur générique de PDF d'éditeur en lecture seule, tests d'URL HTTPS exacte, redirections, véritable PDF, SHA-256, identité, période et couches de texte ; aucun champ publié ni attestation inventée.
- Le manifeste pilote contient les trois URL Sofidy officielles (T1, T2 2026, annuel 2025) et des indices de pages explicitement non certifiés.
- Workflow CI dédié : téléchargement par GitHub Actions, rapport SHA/pages en artefact ; échec fermé si une source est absente ou non vérifiable. La base MaximusSCPI reste à 68 SCPI et Sofidynamic en candidate privée jusqu'à certification du circuit.

- 02/11 14:19 UTC : GitHub run #41460701277 = vérification des 3 PDF officiels Sofidy PASS (T2=6 pages, T1=6 pages, RA=84 pages, SHA-256 collectés). Les empreintes et pages ont été insérées et relues dans les deux tables privées d'index et validation PDF, statut direct_pdf_checked ; aucune promotion financière.
- Revue du rendu page 4 du T2 : TOF 97,73 % visible mais absent de la couche texte exacte. La chaîne doit produire une revue visuelle ciblée au lieu de classer la métrique comme absente.

- 02/11/2026: migration Supabase 20261102142947 candidate_verified_issuer_host_registry appliquee. Registry prive et RLS, lecture seule par service_role ; URLs HTTPS officielles CORUM, BNP et Sofidy autorisees. Faux hostname et HTTP refuses. Anciennes deux contraintes statiques remplacees.
- 11 metriques des pages originales Sofidy enregistrees et relues dans maximus_agents.scpi_candidate_metric_evidence, toutes pending_independent_qa et sans signature independante ; 2025-RA conserve la date d'arrete 2025-12-31 ; graphique TOF T2 97,73 % valide comme indice visuel, en attente du second passage.
- Aucune mutation de la cohorte publique, de scpi_indicators ni activation ; 68 SCPI actives.
