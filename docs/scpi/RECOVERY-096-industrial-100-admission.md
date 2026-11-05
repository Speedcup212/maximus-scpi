# RECOVERY-096 — Admission industrielle : cinq preuves obligatoires, aucun GO déclaratif

**05 novembre 2026.** PR #292, branche `recovery/091-scpi-certification-industrialisation`.

## Règle vérifiée
La note de maturité initiale provient de `docs/scpi/evidence/recovery-092-maturity-input.json`. Le calcul ne recoupait pas les cinq critères critiques avec l'état de la base et du déploiement. Cela permettait une note trompeuse si le fichier déclarait simplement `PASS`.

Le fichier `scripts/scpi-onboarding/industrialMaturity.mjs` bloque maintenant toute attribution des cinq critères à partir des déclarations de PR seules. La fonction n'accepte ces preuves qu'au moyen d'un contexte de lecture protégé explicitement confirmé ; le workflow de PR conserve la valeur par défaut `false`.

**Cette correction ne constitue ni la lecture protégée ni une certification financière.** Le futur passage à 100/100 exige un contrôle externe indépendant, courant, de Supabase et du SHA déployé ; le mode PR est toujours NO GO.

## Faits et métriques correctement préparés en base privée

Suite aux PDF originaux du run GitHub [#42042717291](https://github.com/Speedcup212/maximus-scpi/actions/runs/42042717291), **neuf indicateurs** ont été insérés dans `maximus_agents.scpi_candidate_metric_evidence` sous le statut `pending_independent_qa` (insertions idempotentes, jointure obligatoire avec SHA/URL/pages de `scpi_candidate_pdf_validation`; sans écraser un statut existant).

| Pilote | Période d'origine | Valeurs en attente de QA indépendante |
|---|---|---|
| Sofidynamic | 2026-T3 | Prix de retrait 313,60 € (p. 5), TOF **du trimestre** 97,3 % (p. 1), 9 029 associés (p. 1), 40 immeubles (p. 1), 0 part retirée (p. 5) |
| Opus Real | 2026-T3 | WALB 5,2 ans (p. 4), durée de détention recommandée 10 ans (p. 6) |
| AEW Opportunités Europe | 2026-S1 | Prix de souscription 175 € (p. 1) ; TD **2025** 5,41 % *repris* dans le bulletin S1 2026 (p. 1, référence au 31/12/2025, pas performance S1 2026) |

Preuve technique : les deux lecteurs géométriques MuPDF et Poppler trouvent chacun les mêmes valeurs aux mêmes pages du même PDF et leurs empreintes SHA-256 concordent avec les cinq preuves documentaires déjà présentes en base. Le rapprochement entre deux lecteurs du **même document** ne vaut toutefois pas revue financière indépendante ou validation juridique.

## Cinq critères bloquants pour 100/100

1. **Documents réglementaires actuels** : Sofidynamic compte deux pièces officiellement rattachées (DIC, NI) ; les statuts les plus récents nécessitent une preuve opposable. Le PDF signé avril 2026 de l'utilisateur ne peut être présumé à jour si un document daté juillet 2026 existe. Pour AEW, DIC + note + statuts sont enregistrés comme identités PDF vérifiées, mais le registre officiel et l'appréciation juridique indépendante restent à finaliser.
2. **Champs financiers** : malgré les neuf nouveaux dossiers préparés, le nombre de métriques de la période courante validées indépendamment reste insuffisant ; nombre de parts, capitalisation, valorisation, répartition géographique et sectorielle, dette et liquidité doivent être rapprochés. Les absences officielles doivent être libellées comme telles, pas inventées.
3. **Revue indépendante** : pas de décision de sign-off complet pour les trois pilotes. Sofidynamic conserve des contrôles `legal_identity_passed=false`, `annual_quarter_coherence_passed=false`, `dic_risk_sfdr_review_passed=false`.
4. **Trois pilotes éligibles** : `final_release_ready=false` pour Sofidynamic, Opus Real et AEW. Les garde-fous historiques de reporting `2026-T2` devront accepter un semestriel `2026-S1` comme tel (pas de changement sémantique frauduleux).
5. **Lecture après publication réelle** : aucune nouvelle publication Opus Real ou AEW validée en production. Sofidynamic reste au bulletin T2 2026 avec réserves.

## Risque métier particulier : Opus Real
La fiche officielle BNP Paribas REIM indique une suspension de la variabilité du capital depuis le **5 mars 2026**, avec transactions sur le **marché secondaire**. Il ne faut pas afficher le prix de souscription ou la liquidité comme pour une SCPI à capital variable en souscription ouverte. Source : https://reim.bnpparibas-am.com/fr-fr/produits/scpi/opus-real

## Décision
- Pas de changement des critères de score pour obtenir artificiellement 100.
- Aucun `qa_pass` accordé aux neuf nouvelles métriques, aucune homologation réglementaire ou juridique fictive.
- Aucun merge ni publication autorisée à ce stade ; l'admission ne sera GO qu'après **100/100 démontré**, QA complète des trois pilotes et lecture protégée du déploiement effectif.

