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

- 02/11/2026 15h07 UTC : 18 preuves financières supplémentaires (dont T1, endettement, délai de jouissance, frais de sortie conditionnels) enregistrées en privé. Total Sofidynamic : 29 preuves pending_independent_qa (4 RA 2025, 8 T1, 17 T2). 11 allocations source T2 page 2 enregistrées needs_review : géographie 99,9 % à cause de l'arrondi, secteurs 100 %. Aucune valeur de « nombre de locataires » inventée : source 681 unités locatives.
- Migration 20261102150657 déployée : garde de somme géographie/secteur accepte uniquement l'erreur maximale d'arrondi de 0,05 point par catégorie, sans toucher aux contrôles de provenance/QA. Vue security_invoker conservée.
- Snapshot candidat private_indicator_stage construit : prix 320 €, retrait 313,60 €, TOF 97,73 %, capitalisation 247,58848 M€, endettement 16 %, valeur réalisation/reconstitution arrêtées au 31/12/2025, TD annuel 2025 9,04 % ; statut pending_independent_qa. Aucune fiche publique créée.
- À résoudre : preuve actuelle du DIC 2026 et de la note, certification indépendante des valeurs/allocations, période T3 quand officielle, historique 2 points et tests de prépublication.

- 02/11/2026 15h20 UTC : DIC Sofidynamic 2026 PDF 3 pages et note d'information 2026 PDF 43 pages vérifiés (hash et contenu) et enregistrés dans table privée des documents réglementaires (identity_verified=true,kind_verified=true). Statuts source Sofidy juillet 2025 PDF 21 pages vérifié comme historique, mais **kind_verified=false** car dépôt modifié au registre le 08/07/2026. Bloque expressément le 3/3 réglementaire. Manager légal corrigé `Tikehau Investment Management`, marque `Sofidy`.
- Critères non satisfaits : statuts actualisés 2026, QA indépendante 29 champs/11 allocations, historique certifié T1/T2, certificat financier & revue réglementaire, browser smoke de la candidate, intégration atomique. Sofidynamic reste privée, cohorte publique à 68.

- RECOVERY-071 : contrôle arithmétique multi-trimestriel et unités Sofidynamic : T1 315 € × 672 775 parts = 211 924 125 € ; T2 320 € × 773 714 parts = 247 588 480 € ; 247,58848 M€ en staging. Les deux calculs sont des vérifications techniques **non équivalentes** à une certification financière indépendante. Géographie publiée 99,9 % admise uniquement dans marge d'arrondi de cinq lignes. Statuts du registre 2026 listés mais PDF indisponible via Pappers (HTTP 403) ; ne pas valider le 3/3.


## RECOVERY-072 — Filtres financiers du comparateur (autorisé par Eric le 02/11/2026)

- Demande produit explicite : intégrer capitalisation, décote/surcote, endettement et délai de jouissance dans le panneau du comparateur. Branche isolée `feat/comparator-financial-filters` depuis main, sans commit direct sur main.
- Périmètre : panneau commun `FilterPanel.tsx`, ses consommateurs public et Pro, utilitaire partagé `comparatorFilters.ts`, tests ciblés, gate CI et cette trace. Aucun changement de source financière, cohorte publique, routage, Supabase ou SEO.
- Capitalisation : minimum/maximum en M€ depuis la valeur numérique en euros du catalogue public, sans parser les anciens libellés formatés. Décote/surcote : minimum/maximum signé via le calcul central avec QA et régime de liquidité comparables. Endettement et jouissance : plafonds % et mois.
- Ces quatre critères fonctionnent sans mode expert ; les champs vides restent inactifs. Aucune valeur absente, nulle ou non finie ne passe un critère actif. Dette et jouissance de zéro restent des valeurs légitimes. Valeurs par défaut, compteur et réinitialisation partagés.
- Validation attendue : tests métier des bornes/signes/NULL/QA/régimes/cumul et de la cohorte, panneau rendu et callbacks, suite existante comparée à la base, absence de nouveau diagnostic TypeScript, build Vite production, contrôles navigateur du consommateur réellement monté. État : implémentation et vérifications locales terminées ; publication en attente.

### Preuves RECOVERY-072 — vérifications locales du 02/11/2026

- 31/31 nouveaux tests PASS ; 10/10 tests de liquidité existants PASS. Suite Vitest complète : 240 PASS et les trois échecs antérieurs inchangés de `scpi-bulletin-edge-protection.test.ts` ; base avant modification : 209 PASS et les mêmes trois échecs.
- TypeScript : 1 020 diagnostics préexistants contre 1 021 sur la base, aucun nouveau diagnostic par comparaison normalisée. Le diagnostic retiré correspond à l'import `useState` inutilisé du panneau.
- Build Vite production PASS (27,2 s), sans génération financière/SEO hors périmètre et sans artefact de build commité. Le pipeline complet et les contrôles CI distants restent à lancer après publication autorisée de la branche.
- Navigateur réel sur le bundle compilé, route `/comparateur-scpi/` : 68 SCPI sans filtre ; capitalisation ≥100 M€ = 59 ; décote/surcote ≤0 % = 34 ; dette ≤30 % = 56 ; jouissance ≤3 mois = 9. Cumul des quatre = 3 : Iroko Zen, Crédit Mutuel Pierre 1, Patrimmo Croissance Impact. Noms et comptes rapprochés du catalogue numérique local ; badge 4 critères vérifié et reset à 68. Saisie négative `-10` vérifiée au clavier. Panneau partagé Public/Pro testé ; accès Pro authentifié et véritable viewport mobile non testés localement.
- Prévisualisation compilée opérationnelle après contournement du seul lancement dev `npx vite` trop lent, sans changement de code applicatif ou de réseau. Capture de contrôle disponible dans le workspace.
- Commit d'implémentation local : `7923908`. L'envoi GitHub a été refusé par la revue automatique pour absence d'autorisation explicite de publication sur le dépôt public. Aucun nouvel essai d'envoi par un autre canal ; aucun merge ni déploiement. L'autorisation explicite de pousser, fusionner et déployer après CI est à recueillir avant ces étapes.

- Suite autorisée explicitement par Eric le 02/11/2026 (« j’autorise ») : envoi GitHub, fusion après validation CI, puis déploiement et vérification du comparateur public. Autorisation limitée aux quatre filtres et à leurs contrôles ; aucune promotion financière de SCPI.

- Contrôle de livraison ajouté à la CI : navigateur Chromium sur le bundle de production aux largeurs 1 440 et 390 px, quatre critères séparés et cumulés, cartes, compteur, réouverture et reset, absence de débordement des champs. Le contrôle interdit les appels externes et n’écrit aucune donnée financière. Boutons d’ouverture du panneau nommés pour l’accessibilité.

- CI de prépublication : le garde CORUM initial vérifiait encore un emplacement de code ; il vérifie désormais le comportement du helper commun sur les quatre décotes non approuvées. Le premier test navigateur a ensuite détecté le header en z-[9999] au-dessus du panneau z-50 : un clic physique sur la croix atteignait le header. Panneau corrigé en z-[10000], assertion de maintien sur le comparateur ajoutée. Aucun contrôle financier retiré.

## RECOVERY-072 — Réparer automatiquement après détection (02/11/2026)
- La boucle `détection > classification > auto-fix admissible > réévaluation > rapport > PR/incident` est versionnée dans `scripts/scpi-onboarding/autoRemediate.mjs`.
- Catalogue des réparations sans risque de falsification : recalcul de capitalisation **affichée** M€ à partir des valeurs officielles EUR et de l'égalité exacte prix x parts, après SHA et période vérifiés ; ordre chronologique des données trimestrielles sans altérer leurs valeurs ; réessai réseau borné sur erreurs transitoires de téléchargement PDF, TLS toujours activé.
- Toutes les autres anomalies (statuts à jour, contre-preuves contradictoires, QA indépendantes, document manquant, fuite de comparaison historique, contraintes de sécurité) sont inscrites comme blocages à preuve et jamais auto-approuvées.
- Workflow quotidien / à la demande `.github/workflows/scpi-auto-remediation.yml`, ouvertures de PR de correction et issue unique de blocages ; pas de merge, Supabase public, déploiement ni validation fabriquée. Tests de régression dans CI de préflight.

## RECOVERY-200 — Intégrité industrielle frais/T3 et préparation 225 (09/11/2026)

Mission explicite Eric : A frais réglementaires, B actualisation T3 par métrique,
C trois états publics, D registre canonique et admission par lots.
Branche isolée depuis la version courante : `fix/recovery-200-industrial-data-integrity`.
L'ancienne branche Recovery n'est pas utilisée comme base afin de ne pas réintroduire un état antérieur du produit.

Périmètre de cette première correction : `scpiFeeEvidence.mjs`, synchronisation du
catalogue, fusion live, transformateur/scoring, tests et workflow ciblés ; outils
de contrôle en lecture seule ; exports de données livrés séparément en privé.
Aucune migration, aucune écriture financière, aucune admission ni publication.
Les taux sans preuve HT/TTC concordante ne remplacent plus le catalogue local ;
les zéros explicites sont préservés et les inconnus n'obtiennent plus le bonus zéro frais.
Les contrats `verified/partial/blocked` et le registre sont préparés et testés,
mais le nouveau statut n'est PAS encore raccordé à l'affichage public.

État : EN COURS ; cette PR ne clôture pas la mission A–D.
Les frais documentaires, promotions T3, validation navigateur des parcours,
CI distante et contrôle post-déploiement restent requis. Aucun export Supabase joint au dépôt.

### RECOVERY-200 — Passe données du 09/11/2026 (session Claude, branche existante)

- A : relevé officiel DIC/notes des 69 SCPI (run 42665958628, 2 min 57 s ; 52 DIC, 46 notes d'identité vérifiée), revue sémantique outillée **non humaine** (`scripts/industrial/fees/fee-review-20261109.json`), garde : aucun taux accepté s'il n'apparaît pas dans la clause paginée citée (0 rejet).
- Supabase : table privée `scpi_fee_evidence` (migration `20261109_recovery200_scpi_fee_evidence`), 138 lignes (63 verified / 49 partial / 26 blocked) chargées depuis le commit `95c00d0` après contrôle SHA-256 du fichier. Projection publique : souscription TTC/TTI et gestion HT/exonérée uniquement, champ vide ou identique, provenance complète : `frais_souscription` 9 → 33/69, `frais_gestion` 4 → 19/69. 26 SCPI concernées sont lues en direct par le site (cohorte publique), 15 hors cohorte attendent le catalogue réconcilié.
- Catalogue : 29 valeurs corrigées avec provenance, 11 « frais de gestion » qui étaient des coûts PRIIPs du DIC retirés (inconnu ≠ zéro). Conflits conservés pour arbitrage : Accimmo 10,72/10,716 ; AVP gestion (décision antérieure) ; Sofidynamic ; EdR.
- B : diagnostic par SCPI des 25 T3 non transférés (promotion atomique par bulletin, preuves paginées manquantes, gardes d'identité PDF). Aucune promotion T3 ni modification de la fonction de publication dans cette passe.
- Tests : 39/39 node (dont non-régression catalogue), 6/6 unittest relevé, Vitest 280/280, build Vite PASS. Livrable : `reports/industrial-20261109/RECOVERY-200-livrable.md`.
- État : EN COURS. Restent : 13 SCPI sans document découvert, 49 frais partiels, T3 par métrique (décision requise), états publics raccordés à l'UI, revue humaine des frais, build Netlify et contrôle post-release des pages statiques.

### RECOVERY-200 — Passe du 10/11/2026 (faux zéros, seconde passe frais)

- Faux zéros en production corrigés en base : dividende T3 2026 à 0 € (Ficommerce Proximité, Selectipierre 2) → inconnu ; parts en attente T2 2026 de Primovie à 0 → non applicable (variabilité suspendue le 23/06/2026). Cause : `refresh_scpi_metric_certifications` re-dérivait les certifications rejetées et le rapprocheur prouvait un zéro par proximité.
- Base : registre `scpi_internal.metric_certification_rejections` (9 rejets revus) et trigger `trg_zzzzzz_reviewed_metric_rejection` (migrations `20261110_recovery200_metric_rejection_*`). Contrôle `scripts/industrial/sql/recovery200_rejection_guard_check.sql` 5/5 PASS.
- Rapprocheur `scpi-evidence-certify` extrait dans `matcher.mjs` (zéro explicite seulement, unités cohérentes), 14 tests. **Non déployé** (décision requise).
- Frais, relevé v2 42773336564 (60 DIC, 66 notes) : registre 87 verified / 45 partial / 6 blocked ; `frais_souscription` 41/69 + 8 non applicables, `frais_gestion` 34/69. Revue citée par SHA-256 (`fee-review-20261110.json`), vue `scpi_fee_evidence_current`.
- Tests : node 57/57, unittest 10/10, Vitest 280/280, build Vite PASS. Livrable : `reports/industrial-20261110/RECOVERY-200-livrable.md`.
- État : EN COURS. Décisions requises : fusion PR #391 + build Netlify, déploiement du rapprocheur, promotion T3 par métrique, conflits Accimmo/AVP, revue humaine des lignes d'historique manuelles à 0 (Aestiam Horizon 2023-T3/2024-T2, NCap Éducation Santé 2019-T3).
- Suite 10/11 (après-midi) : 3e lot de frais (pages complètes) → registre 108 verified / 24 partial / 6 blocked, base `frais_souscription` 44/69 (+8 non applicables), `frais_gestion` 44/69 ; 6 frais prouvés non projetés (garde des instantanés manuels, non contournée) ; projection AVP gestion annulée (décision antérieure).
- Chantier C : migration `recovery200_freeze_rejected_certifications` (défaut prouvé : les 147 rejets Sofiprime revenaient en validation au rafraîchissement ; 0 après correctif) ; vue `scpi_internal.metric_public_quality_v1` (789 verified / 294 partial / 5 blocked). Affichage à raccorder.
- Chantier D : `scpi_internal.scpi_canonical_registry_v1` (79 SCPI, 32 sociétés de gestion, 0 alias en collision). Capacité par jour ouvré : non mesurée.
- Revue des écarts : 9 + 5 certifications automatiques fausses rejetées (registre : 24 décisions). Simulation T3 par métrique en lecture seule : 78 valeurs publiables sur 18 SCPI, décision requise (garde de plausibilité et échantillon humain recommandés).
