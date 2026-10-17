# Validation finale proportionnée — lot SCPI (17 octobre 2026)

## Une seule décision professionnelle, pas quatre audits externes

Le contrôle source est entièrement automatique. Pour le lot CORUM, `maximus_agents.scpi_candidate_proportional_release_v2` compare les quatre fonds individuellement et expose quatre sous-contrôles :

- `source_financial_ready` : année 2025 et T2 2026 officiels, risques documentés, répartitions vérifiées, indicateurs cohérents.
- `disclosure_ready` : 18 champs descriptifs utiles, SFDR, avertissements des notes officielles, taux annuel/dette correctement datés ; les clauses contractuelles longues de retrait ne sont pas obligatoires sur une fiche comparative.
- `app_data_ready` : analyse, trajectoire et liquidité réellement disponibles dans les données des consommateurs.
- `private_browser_proof_recorded` : un vrai run CI privé du lot, 28 contrôles, conservé avec son artefact SHA.

`technical_ready` ne dépend plus de huit cases manuelles ni d'une signature indépendante par SCPI.

## La seule décision non automatique

Le responsable du cabinet valide **une fois le lot** après revue des fiches, des frais, des documents financiers, des risques et des exceptions. Une seule ligne privée est créée dans `maximus_agents.scpi_candidate_batch_decisions` (identifiant : `corum-2026-t2`) avec les quatre fonds, statut `draft`.

Pour prendre une décision `approved`, cette ligne requiert : nom du responsable réel, date, déclaration de décision substantielle, empreinte SHA256 du dossier approuvé et une trace structurée des contrôles officiels et des exceptions. Une décision doit être fondée sur un examen véritable ; l'IA ne remplit pas les champs à la place du responsable et ne simule pas sa signature.

Le moteur n'autorise `final_release_ready=true` que si les quatre contrôles automatiques et la décision du lot sont vrais. La table d'audit historique conserve sa traçabilité mais **ne verrouille plus à elle seule** la publication. Les RPC de clearance et la dernière transition post-Netlify consomment le nouveau résultat. La prépublication privée reste distincte de l'activation publique : le déploiement Netlify exige toujours le contrôle produit et son retour de vérification.

### Contrôle du lot CORUM

Le 17/10/2026, 4/4 `technical_ready=true` ; décision `draft`, donc 0/4 `final_release_ready`. Les valeurs financières ou autorisations publiques n'ont pas changé.

### Limite à traiter avant une publication

Le promoteur historique `scripts/scpi-candidates/promoteApprovedCorum.mjs` utilise toujours une photo JSON datée du 15/10 au lieu d'un export frais du registre. La simplification du contrôle final ne prouve **pas** que cet ancien flux de promotion est déjà corrigé. Ne pas lancer `--apply` avec le fichier obsolète ou écrire arbitrairement des `qa_pass`.

**Principes :** une seule source de vérité, aucune valeur inventée, une campagne navigateur par lot, une décision professionnelle de lot, une publication atomique et son smoke test. 
