# RECOVERY-073 — Certification et publication autonomes des nouvelles SCPI

## Contrat de la chaîne permanente (n°69, 70 et suivantes)

1. **Découverte** : émetteur autorisé, identité juridique et catalogue candidat privé.
2. **Documentaire** : PDF officiel complet, SHA-256, période, date de référence, page et URL ; les documents tiers sont des indices, jamais l'équivalent d'une source éditeur/registre authentifiée.
3. **Extraction** : valeurs originales et libellés conservés, sans interpolation ni substitution de zéro ; distinction OFFICIALLY_ABSENT / LAST_OFFICIAL_VALUE / EXTRACTION_FAILED.
4. **Rapprochement** : montant = prix × parts, stock / mouvements, HT / TTC / assiette / date d'effet, période annuelle distincte du bulletin trimestriel. Un écart non justifié reste une exception ; il n'est jamais compensé artificiellement.
5. **Certification** : QA indépendante prouvée pour chaque métrique obligatoire ; documents réglementaires actuels, répartition, historique, analyse, liquidité et contrat de données. Aucune signature ni approbation déduite d'un build vert.
6. **Préparation** : décision de batch et digest vérifiables, droits de délégation préexistants, snapshot de release lié au SHA Git exact, signé et non expiré (24 heures). Les fonctions privées de préparation restent inaccessibles aux clients anonymes.
7. **Déploiement** : build Netlify contrôlé. Un nouveau workflow **workflow_run** s'exécute après la réussite du build GitHub sur un vrai push de main du même dépôt. Aucun push de PR, fork ou workflow manuel non vérifié ne peut accéder à la publication automatique.
8. **Publication** : recherche de release préparée pour ce SHA via RPC backend service_role. Sans batch prêt : sortie sans écriture. Avec batch : vérification du SHA exact du checkout, du Netlify READY actuellement publié, des canoniques et du sitemap des SCPI du batch, puis appel au wrapper PostgreSQL. La promotion v3 vérifie à nouveau tous les gates et réalise **une transaction atomique**.
9. **Contrôle** : comparaison du nombre avant/après, lecture anon post-écriture, traçabilité CI et traitement des anomalies par auto-remédiation/issue. Un défaut d'un contrôle prépublication bloque l'activation ; un contrôle postpublication défaillant déclenche l'incident, ne doit jamais être déclaré PASS.

Les noms de SCPI ne sont **pas codés dans le promoteur autonome** : celui-ci exploite exclusivement le lot certifié depuis la base et compare à la cohorte et au catalogue du commit déployé. Au plus cinq nouvelles SCPI par release. La fonction SQL est privée par principe : droit EXECUTE uniquement service_role.

### Garanties et limitations

- Ce workflow **ne certifie pas les données financières de lui-même**. Il consomme uniquement les attestations déjà validées dans la base protégée ; toutes les revues restent traçables et réellement fondées sur des preuves.
- Il n'ajoute aucun rôle privilégié aux navigateurs, ne crée aucune validation synthétique, et n'élargit ni les grants ni les politiques RLS des sources privées.
- Le passage public est interdit si l'analyse, l'historique, le test navigateur privé, la sécurité et les relevés officiels obligatoires ne sont pas prêts.
- Les données optionnelles officiellement absentes ne sont pas transformées en faux zéros et ne doivent pas bloquer un lot sans justification réglementaire.
- La mise en production du nouveau code ne publie pas, en elle-même, une candidate incomplète. La vérification de toutes les interfaces réelles doit toujours être attestée dans le gate de préparation.

## Sofidynamic — exceptions enregistrées au 03/11/2026

- Les trois PDF financiers éditeur (rapport annuel 2025, bulletins T1 et T2 2026) et DIC/note 2026 ont une empreinte technique ; le statut réglementaire authentifié des statuts 2026 reste absent. Une copie Pappers de 22 pages n'est pas suffisante pour valider automatiquement un registre officiel.
- 11 répartitions T2 sont contrôlées en staging ; 29 métriques financières restent en attente de QA indépendante.
- **Stock T1 672 775 + souscriptions T2 101 076 - retraits T2 122 = 773 729 ; stock T2 officiel 773 714 ; delta -15 parts.** À expliquer avec une source primaire de mouvements compatible, pas à corriger en silence.
- Note 2026 p.22 : souscription **2 % HT / 2,4 % TTC du prix de souscription**. Gestion **12 % HT / 14,4 % TTC des revenus locatifs HT et financiers**, avec mécanisme d'évitement de double commission. Ne pas publier « 12 % par an de l'encours ».
- Conditions de retrait : bulletin T1 p.6 **5 % HT / 6 % TTC** ; bulletin T2 p.6 **4,17 % HT / 5 % TTC**, selon la date et les conditions de retrait avant huit ans. Ne pas amalgamer les périodes. Les enregistrements de provenance ne sont pas des certificats indépendants.
- Historique, analyse certifiée, audit financier/juridique final et navigateur privé restent bloqués. **69e SCPI non publiable.**

## Contrôles de non-régression

- Tests génériques de lot incohérent, SCPI absente de la cohorte/catalogue, duplications, référence SHA et Netlify divergentes.
- Test chiffré réel du delta -15 parts, conservation de l'exception et rejet des chiffres impossibles.
- Test des bases de calcul de frais et de l'identité HT/TTC, avec dates d'effet.
- CI obligatoire sur toute PR et avant main ; aucun autotest ne peut changer qa_status ni publication_authorized.

## Sécurité à instruire séparément

L'audit de sécurité Supabase du 03/11 signale notamment 16 vues SECURITY DEFINER, 18 fonctions dont search_path est mutable, ainsi que des permissions GraphQL / exécution de fonctions exposées. L'absence de policy sur les tables staging privées avec RLS activé peut être **volontaire**. Les corriger par lots à l'aveugle casserait des flux ou ouvrirait l'accès ; vérifier au cas par cas l'exposition réelle aux rôles anon/authenticated. Le wrapper de publication créé ici définit search_path vide et refuse les rôles client.

Tout incident de sécurité prioritaire passe avant le déploiement public de nouvelles candidates. Aucune alerte héritée ne doit être masquée, mais son existence ne suffit pas à qualifier automatiquement toutes les SCPI comme non certifiées.
