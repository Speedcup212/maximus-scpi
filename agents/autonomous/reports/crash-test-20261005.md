# Crash test MaximusSCPI et agents — 5 octobre 2026

Verdict global : **REVIEW**. L'orchestration est installée et a exécuté un cycle réel ; les corrections métiers et SEO identifiées ne sont pas encore appliquées au site.

## Fait et vérifié

| Bloc | Preuve actuelle | Limite |
|---|---|---|
| CONTROL + DATA + ANALYST + SEARCH + QA | Trois agents exécutés en parallèle, QA ensuite ; quatre tâches done/REVIEW conservées | Premier cycle lancé pendant l'installation |
| File persistante | Tâches, leases, preuves, tentatives et résultats enregistrés | Aucun patch métier intégré automatiquement |
| Garde-fous | Tests SQL transactionnels PASS : doublons, exclusivité, dépendances, preuves, date, token, timeout, retry, budgets, QA, arrêt et droits | Plafond de tâches, pas mesure monétaire réelle |
| Programmation | Orchestrateur activé matin/soir en Europe/Paris | last_run_time encore NULL : premier déclenchement planifié non observé |
| Données courantes | 61 PASS legacy, 61 operational_ready, aucune alerte active dans health | Le strict reste distinct et incomplet |
| Certification stricte | 60 PASS_100 / 1 FAIL_STRICT | Altixia Commerces, uncertified_tof_periods=1 |
| HTTP public | Home, analyses, comparateur, Comète, Transitions Europe, robots et sitemap répondent 200 ; 404 URL sitemap | Échantillon, pas audit des 61 pages ni preuve d'indexation |
| Netlify | Déploiement courant prêt, identifiant 6ac37c50825ece0008bf2108, inchangé au contrôle | Aucun déploiement déclenché par ce test |

## Défaut supplémentaire trouvé et corrigé

L'ancien validateur acceptait evidence=[{}] comme preuve. Le test adversarial l'a reproduit dans une transaction annulée. Le validateur privé exige maintenant pour chaque élément une source nommée, une date valide et un constat non vide. Les preuves vides/nulles et dates invalides sont rejetées ; la suite entière passe après correction. La structure ne garantit pas la vérité du contenu : QA doit toujours vérifier indépendamment les faits.

Les 33 preuves des quatre résultats d'installation ont les champs requis et sont préservées. Le changement n'affecte aucune donnée SCPI métier ni code public.

## Reste essentiel, dans l'ordre

1. Rapprocher le TOF non certifié d'Altixia de la période et du PDF exacts. Ne pas considérer 2026-T2, dernière période documentaire, comme nécessairement la période incriminée. Obtenir 61/61 strict uniquement après preuve suffisante.
2. Corriger la présentation de liquidité lorsque le régime change, et le libellé Δ 4 obs. correspondant à quatre trimestres. Code déployé confirmé ; montage DOM et affichage effectif restent à vérifier.
3. Corriger l'actualité Transitions Europe : texte T3 2025 sous étiquette 2026-T2. Relier texte, période et source du même enregistrement.
4. Corriger HTML initial/canonical de /analyses/, actuellement ceux de l'accueil ; traiter H1 des fiches et exposition de l'historique, puis vérifier sitemap et indexation réelle.
5. Diagnostiquer les sorties ingestion : sur 48 h, 5 failed, 20 needs_review, 2 dispatched, 356 completed (découverte historique dans le premier audit). Rapprocher incidents et résolution ; prouver une ingestion nouvelle de bout en bout. Les succès cron ne suffisent pas.
6. Classer l'ancienne file trajectoire (60 pending, run ancien running dans le premier audit), sans la réactiver aveuglément. Vérifier le premier cycle réellement déclenché par le planificateur, puis endurance sur plusieurs cycles.
7. Transformer les propositions actuelles en patchs implémentés, tests et lot de release validé. L'autorisation automatique actuelle couvre agents/tasks et runtime privé ; les correctifs du code public sont une étape distincte.

## Hors preuve de ce crash test

Indexation Search Console/Bing, citations IA, conversion commerciale, backlinks, tableau de bord client et produit Surveillance complet ne sont pas certifiés par les contrôles ci-dessus. Aucun pourcentage d'avancement global n'est attribué sans inventaire et mesure spécifiques.

Priorité : fermer les écarts de données et de présentation, démontrer ingestion et programmation, puis une release groupée après QA. L'extension au-delà des 61 SCPI reste prématurée tant que ce périmètre ne passe pas le contrôle strict.
