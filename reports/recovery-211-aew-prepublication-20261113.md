# RECOVERY-211 — AEW Opportunités Europe : dossier de prépublication (NO GO)

**Date de contrôle :** 13 novembre 2026. **Source :** lecture directe de la production Supabase MaximusSCPI, schéma `maximus_agents`. **Ticket opérationnel :** [#426](https://github.com/Speedcup212/maximus-scpi/issues/426).

> Document de travail privé, **pas une certification**, **pas un conseil d'investissement** ni une autorisation de publication. Aucun statut QA, critère de release ou chiffre financier n'est modifié par ce rapport.

## 1. Périmètre et preuves

- SCPI : `aew-opportunites-europe` ; source officielle [Bulletin semestriel 2026-S1](https://www.aewpatrimoine.com/sites/default/files/2026-08/AEW%20OPPORTUNITES%20EUROPE%20Bulletin%201er%20semestre%202026.pdf), SHA256 `7dee4e015b33a15b36a51fc1eaf8686eba50ad3291560a4150b64b37c34e19fe`, source `maximus_agents.scpi_candidate_pdf_validation`.
- Antériorité : [bulletin 2025-S2](https://www.aewpatrimoine.com/sites/default/files/2026-03/AEW%20OPPORTUNITES%20EUROPE%20Bulletin%202%C3%A8me%20semestre%202025_0.pdf), SHA256 `6e4556df29e653aba7ad7e940802ad6fcc7b9f73180ed360284718007a7640fd`.
- Rapport annuel 2025, SHA256 `02beb7ab17d4edd160088a7b2a7bc91b2026a6ee4e0d7792590f06cb4d4e8c69` ; données 2025 distinctes des observations semestrielles 2026.
- [DIC juillet 2026](https://www.aewpatrimoine.com/sites/default/files/2026-07/DIC%20AEW%20OPPORTUNITES%20EUROPE%20juillet%202026_1.pdf) SHA256 `27bbf007ed4276079aae15d11dd306ea652941be0610b601fbc09a5f89288332`. Vérification source/identité en registre, sans revue légale finale.
- Registres contrôlés : `scpi_candidate_release_circuit_v3`, `scpi_candidate_indicator_stage`, `scpi_candidate_metric_evidence`, `scpi_candidate_private_trajectory_exact_v2` et `scpi_candidate_final_audit`.

## 2. Indicateurs sourcés (2026-S1, sauf indication)

| Indicateur | Valeur enregistrée | Base temporelle / remarque |
|---|---:|---|
| Prix de souscription | 175 € / part | 30 juin 2026, bulletin p.1 |
| Prix de retrait théorique en cas de compensation | 157,50 € / part | Bulletin p.3 ; **ce n'est pas une promesse de liquidité** |
| Nombre de parts | 1 549 048 | 30 juin 2026, bulletin p.2 |
| Capitalisation | 271 083 400 € | Bulletin p.1 ; **exactement** 1 549 048 × 175 € |
| TOF | 82,58 % | T2 2026 mentionné au sein de S1, bulletin p.2 |
| TOP | 80,71 % | T2 2026, bulletin p.2 |
| Endettement | 8,8 % | 30 juin 2026, bulletin p.1 |
| Valeur de reconstitution | 174,56 € / part | 30 juin 2026, bulletin p.1 |
| Valeur de réalisation | 147,90 € / part | 30 juin 2026, bulletin p.1 |
| Parts en attente de retrait | 75 877 | 30 juin 2026, bulletin p.2 |
| TD 2025 | 5,41 % | **Exercice 2025**, répété sur la couverture S1 2026 ; **pas TD 2026** |

Les valeurs de cette table sont issues de la revue documentaire enregistrée dans `scpi_candidate_metric_evidence` (`qa_pass` au niveau champ), tandis que le snapshot global reste `pending_independent_qa`. Elles sont donc utilisables pour **préparer** l'analyse, pas pour déclarer la fiche certifiée.

## 3. Évolution vérifiable et risque de liquidité

- Parts en attente : **67 066 en 2025-S2 → 75 877 en 2026-S1**, soit **+8 811 parts**, environ **+13,14 %**. Les périodes et PDF sont distincts, les chiffres sont issus des originaux référencés.
- Les 75 877 parts représentent **4,90 %** des 1 549 048 parts en circulation au 30 juin 2026. Il s'agit d'un ratio de stock, pas d'un délai de retrait, ni d'une probabilité de perte.
- TOF : **82,82 %** au T4 2025 (bulletin S2) → **82,58 %** au T2 2026 (bulletin S1), soit **−0,24 point**. Ne pas créer un faux historique trimestriel T1 2026.
- Nombre de parts : **1 553 612** au S2 2025 → **1 549 048** au S1 2026, soit **−4 564 parts**. Les mouvements enregistrés se réconcilient au sein de `scpi_candidate_verified_share_flow_v1`.
- Écart entre prix de souscription et prix de retrait indiqué : **17,50 € / part, soit 10 %** du prix de souscription ; cet écart ne constitue pas une garantie de rachat.
- Le DIC signale un SRI **3/7**, une durée recommandée **10 ans** et des risques de perte en capital / liquidité. La revue juridique et de continuité de dénomination (ancienne Fructirégions Europe) reste requise.

**Lecture risque :** le stock de retraits en attente, son augmentation, le TOF inférieur à 85 % et l'absence de liquidité garantie imposent un avertissement visible et un contrôle indépendant. L'analyse ne doit pas transformer le TD historique 2025 en projection.

## 4. Gates de production : lecture du 13/11/2026

| Gate | État |
|---|---|
| PDF original, métriques, axes, DIC/notice/statuts | Contrôles de source positifs |
| `current_qa_fields`, `annual_qa_fields` | 15 / 15 |
| `current_indicators_ready`, `live_liquidity_ready` | TRUE / TRUE (staging privé) |
| `prepublication_verified_history_periods` | 2 |
| `prepublication_history_consistency_ready` | TRUE |
| `historical_periods`, `live_trajectory_points` | 0 / 0 (pas encore publiés) |
| `bulletin_analysis_ready` | FALSE |
| `independent_review_ready` | FALSE |
| `independent_audit_ready` | FALSE |
| `responsible_batch_ready` | FALSE |
| `final_release_ready` | **FALSE — NO GO** |

L'ancien `scpi_candidate_publication_gate_v1` attend une période `2026-T2` pour le dossier AEW ; **ce diagnostic hérité est inadapté à un semestre `2026-S1`**. Le circuit `v3` admet explicitement `S1/S2` et doit rester la référence pour l'admission finale. Il ne faut ni requalifier S1 en T2, ni fabriquer une publication pour satisfaire un ancien critère.

## 5. Suite d'exécution attendue dans les composants existants

1. **ANALYST** : produire le brouillon de bulletin sourcé à partir des métriques et du DIC, y compris l'avertissement sur les 75 877 parts en attente et l'origine 2025 du TD.
2. **QA indépendante** : vérifier chaque assertion et chaque URL/page/SHA, la chronologie et le régime de capital, puis tester les risques et les frais de sortie ; ne jamais auto-approuver.
3. **UI/QA** : prévisualiser les six usages (fiche, radar, trajectoire, comparateur, simulateur, actualités), desktop et mobile, avec preuves de rendu, sans exposer le dossier tant que la validation n'est pas acquise.
4. **Release** : n'enregistrer approbation indépendante et lot responsable qu'avec leurs pièces réelles. L'activation finale exige un commit GitHub exact, CI verte, Netlify prêt et publié, contrôle public et absence de régression des 69 dossiers présents.

**Prochain jalon mesurable :** dossier d'analyse privé source-page prêt pour la revue et un résultat QA indépendant ; **aucune publication** tant que les gates ci-dessus sont faux.
