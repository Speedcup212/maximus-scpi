# RECOVERY-110 — Crash test de l'admission industrielle 100/100

Date : 2026-11-05. Périmètre : PR #292 `Speedcup212/maximus-scpi`, environnement Supabase `ygvsddcpohsnaowofuwc`, Netlify `maximusscpi`. Exécution **sans promotion QA, sans signature fictive, sans mutation publique, sans merge/déploiement**.

## Verdict

**100/100 est un objectif d'acceptation techniquement réalisable après évolution contrôlée de l'architecture, mais absolument non atteignable au travers du dispositif actuel.** L'échec n'est pas seulement documentaire.

### Défaillances architecturales démontrées — P0

1. **Plafond de 75 dans le workflow PR** : `.github/workflows/scpi-industrial-readiness.yml` appelle toujours `evaluateMaturity(observed)`, qui applique `trustedProtectedReadback=false` par défaut. Les cinq critères de cinq points sont donc systématiquement à zéro, même si le JSON dans la branche affirme PASS. Le job impose ensuite `report.score===100` et échoue systématiquement ; il ne peut devenir une vérification PR verte en l'état.
2. **Post-déploiement structurellement impossible à constater** : `maximus_agents.scpi_industrial_admission_live_v1` renvoie littéralement `false AS admission_100_proven` et une étiquette `AWAIT_PROTECTED_POSTDEPLOY_READBACK` si le lot devient éligible. Aucune preuve d'un déploiement effectif ne remonte dans ce booléen. Même trois SCPI finalement éligibles ne donneraient jamais `admission_100_proven=true` dans cette vue.
3. **Cycle bloquant PR/production** : le contrôle PR exige déjà les cinq points de lecture post-déploiement, alors que son SHA de PR n'est pas déployé sur `maximusscpi.com`. Il faut deux états différents : *prépublication autorisée* après sources/revues/QA et *100/100 post-déploiement* seulement après lecture effective du SHA publié.
4. **Le bit `trustedProtectedReadback:true` n'est pas une attestation** : le calculateur attribue 100/100 à un JSON entièrement fabriqué si un appelant lui passe ce bit et ses booléens techniques à `true`. Cela montre que l'API de calcul est un inventaire, **pas une autorité de certification cryptographique**. Aucun workflow PR ne doit pouvoir fournir cette autorisation. Nécessaire : lecture par exécuteur externe protégé, preuve liée au commit et aux documents, identité et signature vérifiées, expiration, contrôle du Netlify production SHA et des surfaces réelles. La PR ne peut ni signer ni s'auto-approuver.

### Crash test reproductible en CI

Ajout dans `scripts/scpi-onboarding/industrialMaturity.test.mjs` :
- **32 configurations PR adversariales** des 5 critères protégés : 100/100 refusé, score plafonné à 75, `publication_authorized=false`.
- **32 configurations de preuve réputée protégée** : au plus 95 points et `NO_GO` si un seul des 5 manquait ; 100 et `GO` uniquement avec 5/5 *dans l'hypothèse de test*, sans autorisation de publier.
- **16 configurations des drapeaux** TypeScript, non-régression, intégrité et autorisation de lecture : `GO` seulement si tous sont vrais et si la rubrique est complète.
- **Test adversarial démontrant la fragilité du bit de confiance** : un JSON fabriqué peut obtenir un `GO` du calculateur lorsqu'un appelant lui donne le bit privilégié. Ce n'est pas un GO autorisé.
- **Vérification du câblage GitHub** : le workflow de PR garde volontairement l'appel sans autorisation protégée et le rejet de tout score différent de 100.

Ces cas sont des tests de logique. Ils ne prouvent ni la certification financière des SCPI, ni l'existence d'une attestation externe.

### Contrôle factuel Supabase — sans écriture

| SCPI pilote | Champs courants QA / annuels QA | Noyau | DIC, NI, statuts vérifiés | Historique prépublication | Analyse | 6 surfaces en vue d'admission | Revue et audit indépendants | Lot responsable | Autorisation finale |
|---|---:|---:|---:|---|---|---|---|---|---|
| Sofidynamic T3 2026 | 17 / 4 | 11/11 | 2/3 | NON : delta officiel T1-T2 = -15 parts | NON | NON | NON | NON | NON |
| Opus Real T3 2026 | 13 / 4 | 11/11 | 3/3 | OUI, sous conditions de marché secondaire | NON | NON | NON | NON | NON |
| AEW Opportunités Europe S1 2026 | 15 / 15 | 11/11 | 3/3 | OUI | NON | NON | NON | NON | NON |

Toutes trois ont `technical_financial_minimum_met=true`, `independent_review_gate=false`, `independent_audit_gate=false`, `responsible_batch_gate=false`, `six_surface_browser_gate=false`, `final_release_gate=false`, `admission_100_proven=false`. Les 3 fiches d'audit en base sont toujours `pending` et le lot `RECOVERY-100-THREE-PILOTS-20261105` reste `draft`.

**Production constatée** via connecteur Netlify : site `maximusscpi.com`, déploiement publié `6aec97d02a61623a0240031f`, SHA `cdd65b06846054cfa2a9f949c491e5c2c2010534` ; PR #292 au SHA `7bb252da1229f21c23b2414354d57d608d2ed9d0` à l'instant de démarrage du stress test : **SHAs différents**. Aucune preuve de publication de la PR n'est donc possible aujourd'hui.

### Plan minimal et ordre imposé pour un 100 authentique

**P0 — Corriger le protocole d'admission** (sans assouplir les obligations) :
- CI de PR = contrôle d'intégrité technique + absence de régression. **Préflight de publication** indépendant = sources signées, revue financière et juridique et preuves navigateur sur un environnement de préproduction pour le SHA exact. Ce préflight doit produire une décision explicite, distincte du 100 post-déploiement.
- Ne jamais accepter un drapeau ou une chaîne JSON comme preuve de lecture protégée. Exécuter une attestation externe depuis un environnement et une identité protégés, avec vérification authentique (signature, fraîcheur, commit, identifiants de preuves), hors PR contrôlable. Exiger le SHA réellement publié Netlify et la confirmation des six surfaces.
- Corriger le calcul de l'admission pour qu'un état `100_proven` soit dérivé **uniquement** d'une attestation valide et des états Supabase réels ; ne pas supprimer la logique d'exclusion des recommandations non certifiées.

**P1 — Fermer les 3 dossiers sans fabriquer de preuve** :
- Sofidynamic : actes/statuts officiels juillet 2026 vérifiés (accès INPI protégé), éclaircissement du delta de 15 parts par l'émetteur ou exception formelle excluant toute comparaison inadéquate, cohérence SRI/SFDR et plafond d'endettement 300 M€/proposition 400 M€.
- Opus Real : note et statut de suspension REIM contrôlés, documentation des transactions secondaires sans prix de retrait inventé, analyse et QA indépendante.
- AEW : cohérence identité et renumérotation historique, analyses et QA indépendante.
- Pour chaque pilote : analyses financières sourcées, 12 preuves navigateur privées et réelles (6 surfaces x desktop/mobile), revue indépendante réellement imputable, audit signé, décision responsable puis publication autorisée.

**P2 — Enregistrer la réussite en production** : déployer **uniquement** après validation, comparer les vrais états Netlify/Supabase au SHA attendu, vérifier les six surfaces et l'exclusion des recommandations non certifiées, puis laisser le contrôleur externe émettre le 100/100.

### Règles d'interprétation

- `75/100` représente un **score de capacités déclarées et testées dans la PR**, pas un taux de qualité effective des 69 SCPI, pas un taux de complétude documentaire et pas une autorisation de publication.
- `100/100` peut signifier **100 % des contrôles d'admission exigés réalisés et prouvés**, pas l'absence de risque, de source manquante dans l'univers complet, ni une exactitude financière garantie à perpétuité.
- Aucun changement de `qa_pass`, de revue signée, d'autorisation, de `main` ou de production n'est justifié par ces essais synthétiques.

Conclusion : **réalisable sous conditions avec un circuit à deux phases et des validations réelles ; impossible avec l'admission PR et la vue Supabase actuelles.**
