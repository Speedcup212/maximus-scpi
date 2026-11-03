# RECOVERY-072 — Détecter ET corriger automatiquement les anomalies SCPI

Le pipeline ne doit plus se contenter d’émettre des erreurs. Il applique les remédiations **strictement déterministes**, les reteste et documente les cas qui nécessitent une nouvelle preuve ou une revue.

## Boucle opérationnelle
1. Détecter par les contrôles existants de cohérence, la provenance PDF, la période et les règles de sécurité.
2. Identifier une correction admissible au catalogue fermé de remédiations :
   - Recalcul **uniquement** de `capitalisation_million_eur`, à partir de `source_capitalisation_eur` si les prix x nombre de parts coïncident au centime, si la période correspond, si la provenance SHA est valide, et si la QA est en attente.
   - Tri ascendant des snapshots trimestriels déjà prouvés, **sans changer aucune valeur ou empreinte**.
   - Télécharger à nouveau les PDF officiels en cas d'erreur réseau temporaire par une politique de retries bornés et TLS vérifié ; HTTP 403, problème de certificat ou identité invalide ne se transforment jamais en PASS.
3. Vérifier le post-correctif avec `inspectPrivateCandidate`, vérifier l'intégrité des champs sources et être idempotent.
4. Appliquer en **staging Git uniquement** les correctifs admissibles, produire un rapport d'audit JSON et une PR distincte. Aucune modification de Supabase ni merge ni déploiement sur ces seuls tests.
5. Pour les erreurs non corrigibles automatiquement, publier/actualiser une issue unique avec l'anomalie exacte et la preuve nécessaire : documents réglementaires courants, extraction visuelle sans certitude, incohérences financières, QA indépendante, historique, finalisation du release.

## Activation
- CI de chaque PR touchant `scripts/scpi-onboarding/**` : tests et **dry-run** du résolveur ; impossible de masquer les erreurs restantes.
- Automatisation sur `main` chaque jour à 06 h 33 UTC et sur demande : `.github/workflows/scpi-auto-remediation.yml`, jeton GitHub limité aux droits issues/PR/contenus, **aucun secret financier ou Supabase**.
- Commande : `node scripts/scpi-onboarding/autoRemediate.mjs --scan --write --report test-results/scpi-auto-recovery/automatic.json`.
- La PR générée contient uniquement les corrections de fichiers candidats privés ; les contrôles de release OIDC, RLS, revue financière, public, Netlify et promotion atomique sont toujours indépendants.

## Invariants financiers et de conformité
- Interdit : changer `source_capitalisation_eur`, prix de parts, nombre de parts, TOF, TD, valorisations, répartitions officielles, dates d'arrêté, SHA PDF, statuts DIC/NI, identité du gérant, QA, validation, admission publique.
- Interdit : publier la 69e SCPI sur la seule base d'un PASS technique. Statuts Sofidynamic 2026 manquants et QA indépendante en attente restent des blocages explicites.
- Tous les résolveurs doivent être **sans effet** lorsqu'il manque une source, qu'un montant se contredit ou qu'un domaine officiel ne peut être vérifié.
- La signature financière/contrôle de publication reste obligatoirement fondée sur le référentiel de preuves ; l'automatisation ne fabrique aucun signataire ni approbation.

## Critères de succès
- 100 % des cas réparables présents dans le catalogue sont résolus automatiquement en staging, réévalués et tracés.
- Tous les cas non réparables restent ouverts et catégorisés, sans erreur silencieuse.
- Les tests prouvent l'idempotence, l'absence de mutation des montants primaires et la non-activation de la publication.
- On n'affirme **pas** que le moteur peut résoudre tous les problèmes futurs : ce catalogue s'étend uniquement avec des correctifs vérifiables et des tests anti-régression.

## Reprise vérifiée — 02/11/2026
- Le workflow onboarding était invalide : deux clés YAML dupliquées dans upload-artifact. Aucun job exécuté au run 41485559433. Correction ciblée et garde de syntaxe sur les 22 workflows, exécuté depuis build-verification.
- Tests locaux : 78/78 Node (55 existants + 23 contrôles YAML), 18/18 Python.
- La sonde Pappers a désormais récupéré un PDF de 22 pages : SHA-256 `dc040db78d22f50ee5470d34b74e7b7149676a153076f762629e946d38e0b1ba`, statuts du 30 avril 2026, dépôt annoncé 08/07/2026. La couverture indique SOFIDYNAMIC, SIREN 983023003 et Tikehau Investment Management. Ce résultat remplace le diagnostic de téléchargement 403 dans cet environnement ; il ne prouve pas à lui seul l'authenticité du registre officiel.
- Source de la copie : https://www.pappers.fr/entreprise/sofidynamic-983023003/documents/SOFIDYNAMIC%20-%20Copie%20des%20statuts%20mis%20%C3%A0%20jour%2008-07-2026.pdf
- Lecture réelle Supabase : 29 métriques pending_independent_qa, 2 documents réglementaires validés sur 3, 0 période historique, analyse et certification finale absentes. Publication toujours interdite. Aucun champ de QA ou d'admission modifié.

- Suite complète : correction des fixtures Edge obsolètes (registre d'hôtes absent ; ancienne attente de publication directe). Le handler réel reste inchangé : nouvel extrait en staging, aucune écriture scpi_indicators, rejet explicite d'un hôte non enregistré. Suite npm test intégrée au build obligatoire.

## Conservation des preuves — 03/11/2026
- Le run 41543130099 conserve des captures sélectionnées mais aucun PDF complet : la revue des frais et annexes reste impossible à partir de cet artefact seul.
- `SCPI_PDF_ARCHIVE_DIR` conserve désormais les octets officiels après validation technique, nommés par SHA-256, et un JSON du texte natif avec pagination, URL et empreinte du PDF. Le rapport porte aussi le SHA-256 du JSON. Une source rejetée ne produit pas de preuve archivée.
- Le workflow officiel active cette conservation dans son artefact à rétention de 30 jours. Aucun statut financier ni aucune autorisation de publication ne change.
- Validation locale : 20 tests Python réussis, 23 contrôles YAML réussis, diff sans erreur d'espacement. La CI distante et la revue intégrale restent nécessaires.
- Point de rapprochement à instruire, sans correction des valeurs officielles : le stock T1 (672775 parts), les souscriptions T2 (101076) et retraits T2 (122) donnent 773729, contre 773714 parts au stock T2, soit 15 parts d'écart. Les mouvements peuvent avoir des périmètres différents ; aucune cause n'est affirmée sans preuve complémentaire.

### Résultat réel de la reprise du 03/11
- Audit source réussi : https://github.com/Speedcup212/maximus-scpi/actions/runs/41600327536 ; artefact 13213458241, ZIP SHA-256 `3da5518af7235e8a5b0ea5e081a3fc8428eeb484ae1575a0623b9cf6fa84f463`. Téléchargement et vérification locale du ZIP, des six PDF et des six fichiers de texte paginé réussis.
- Revue visuelle de la page 2 du bulletin T2 : les 11 allocations correspondent exactement. Mise à jour transactionnelle limitée à ces 11 lignes de staging, avec prédicats sur libellé, valeur, URL, SHA et page ; toute cardinalité différente provoque une exception. Preuve de revue ajoutée dans evidence_excerpt. Contrôle après écriture : geography_verified=true, sector_verified=true, allocations_verified=true, final_release_ready=false. RLS active ; aucun SELECT anon ni UPDATE authenticated sur cette table ; aucun trigger de publication.
- Note officielle 2026 page 22 : commission de souscription 2.00 % HT / 2.40 % TTC ; gestion 12.00 % HT / 14.40 % TTC des produits locatifs HT et produits financiers, avec règles de déduction pour les sociétés déjà facturées. Ces bases ne sont pas un pourcentage annuel de la valeur investie. Page 17 : exemples de retrait à 313.60 EUR après 8 ans et 297.92 EUR avant 8 ans (conditions de contrepartie applicables). Les valeurs restent à intégrer dans le contrat de données avec leur période propre ; aucun faux rattachement au bulletin T2.
- Pas de WALT/WALB identifié par recherche dans les textes complets des bulletins T1/T2 et du rapport annuel 2025. Cette recherche seule ne constitue pas une attestation officielle de non-publication.
- Blocages conservés : statuts applicables 2026 non rapprochés d'une source officielle authentifiée ; 29 métriques encore pending_independent_qa ; historique et analyse non certifiés ; revue finale et test navigateur privé absents. L'écart de 15 parts nécessite une explication, sans correction inventée.
- Les conseillers Supabase ont aussi signalé des constats de sécurité existants (16 vues security_definer, 18 fonctions avec search_path mutable, accès GraphQL/fonctions à examiner). Aucun de ces contrôles n'a été supprimé et aucun PASS global de sécurité n'est affirmé.
