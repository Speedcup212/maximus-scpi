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
