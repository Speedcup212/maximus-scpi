# RECOVERY-093 — Finalisation mesurée de la chaîne existante

4 novembre 2026. Branche `recovery/091-scpi-certification-industrialisation`, PR #292 conservée. Suite de RECOVERY-091/092 et #283. Aucun merge, déploiement, rôle privilégié ou écriture financière de production.

**Verdict : NO GO. Score conservateur : 75/100, objectif 90 non atteint.** Les capacités progressent sans attribuer de points à des certifications ou à un débit non démontrés. Aucun nouveau pilote n'a encore franchi toutes les étapes jusqu'à une publication autorisée. Le critère de réussite de la mission reste donc non satisfait.

## Actualisation du 5 novembre 2026 — TypeScript résolu et preuves antérieures réconciliées

Les mesures initiales de ce rapport (`601` diagnostics) sont historiques au 4 novembre. La [CI d'admission du commit `463ce90`](https://github.com/Speedcup212/maximus-scpi/actions/runs/42014045754) constate désormais **zéro diagnostic TypeScript**, contre 1 023 au départ, sans régression. Le [build complet](https://github.com/Speedcup212/maximus-scpi/actions/runs/42014045915) est PASS. Le score reste **75/100, NO GO** : trois pilotes éligibles et lecture-retour production non démontrés.

La lecture **seule** du schéma Supabase a identifié des preuves d'identité binaire préexistantes non reflétées par les échecs de collecte du passage précédent. Le DIC 2026, la note, les statuts et le bulletin T2 2026 d'**Opus Real** sont déjà contrôlés en base (SHA et identité), mais cela **ne certifie pas** le bulletin T3, les valeurs financières, les allocations ni la publication. **Sofidynamic** dispose de DIC/note et de bulletins T1/T2 contrôlés ; les statuts du site enregistrés en base restent la version de juillet 2025, avec vérification de type refusée.

Un document privé transmis auparavant par l'utilisateur porte la mention **« Statuts Sofidynamic en date du 30 avril 2026 »**, signé/certifié conforme par **Tikehau Investment Management** ; SHA-256 du fichier : `dc040db78d22f50ee5470d34b74e7b7149676a153076f762629e946d38e0b1ba` (22 pages). **Document-candidat seulement** : le raccordement à une source émetteur ou à un dépôt légal opposable et la vérification de l'éventuelle version postérieure restent à réaliser. Aucune certification statutaire en production n'est modifiée. Tikehau Investment Management est bien l'identité de gestion à conserver.

L'export immuable [source antérieure](evidence/recovery-093-readonly-db-reconciliation-20261105.json) distingue les binaires déjà contrôlés d'une nouvelle collecte, sans transformer une observation Supabase en attestation ou en autorisation. `industrialBatch.py` réutilise ce contexte en mode **read-only** optionnel pour qualifier les causes documentaires, mais conserve intégralement ses blockers et sa décision `publication_authorized=false`. La réexécution de la collecte n'est pas une preuve d'examen financier.

Commande optionnelle (sources antérieurement contrôlées uniquement) :

```bash
python scripts/scpi-onboarding/industrialBatch.py --registry scripts/scpi-onboarding/fixtures/industrial-pilots-20261104.json --out test-results/recovery-093-live-crosscheck --limit 4 --observed-sources docs/scpi/evidence/recovery-093-readonly-db-reconciliation-20261105.json
```

L'absence de ligne pour AEW Opportunités Europe ou CRISTAL Care dans cet export n'est **pas** la preuve de l'absence de document chez les émetteurs : c'est simplement l'absence de preuve dans ces tables au moment du contrôle. **Aucune écriture Supabase, aucun merge, aucun déploiement.**

## Pourquoi les tests verts ne donnaient pas une admission verte

Le build Vite transpile TypeScript sans exécuter `tsc -b`. Vitest vérifie des comportements couverts, pas tous les contrats de types. Le workflow d'admission exige le contrôle complet, les preuves financières et les conditions de publication. Son échec était réel et ne devait pas être neutralisé.

La comparaison normalisée entre la base `88755a0` et le début de cette reprise `3ccc0b4` retrouve **1 023 diagnostics identiques, zéro ajouté ou retiré**. Le fichier [baseline](evidence/recovery-093-typescript-baseline.json) et le [rapport de remédiation](evidence/recovery-093-technical-remediation.json) conservent les messages, familles et empreintes. Les numéros de ligne et les compteurs d'abréviation des types ne créent pas de fausses régressions ; les messages différents restent détectés.

Après corrections : **601 diagnostics, 422 supprimés, aucun nouveau diagnostic normalisé**. La vérification complète reste **FAIL**. Aucun `tsconfig` modifié, aucun fichier exclu, aucun `@ts-ignore`, aucune déclaration fictive de module.

| Cause restante | Diagnostics | Intervention requise |
|---|---:|---|
| Symboles inutilisés hors transformations admissibles | 278 | Examiner les déclarations exécutables/paramètres ; ne pas supprimer leurs effets de bord automatiquement |
| Contrats de types incompatibles | 251 | Réconcilier notamment navigation, composants, données de portefeuille et signatures ; ne pas élargir les types à `any` |
| Nullité | 57 | Capturer les clients après leurs gardes et traiter explicitement l'absence de configuration/donnée |
| Modules absents | 15 | Retrouver les contrats d'origine ou retirer après analyse les chemins obsolètes ; ne pas inventer un moteur AMF ou un profil de risque |
| **Total** | **601** | Admission technique encore refusée |

## Corrections effectuées et comptage automatique

**330 diagnostics résolus automatiquement**, correspondant à **340 bindings d'import retirés dans 77 fichiers**. Le compteur de diagnostics et celui des bindings sont distincts : un diagnostic « tous les imports sont inutilisés » peut viser plusieurs bindings.

Le remédiateur existant `autoRemediate.mjs` utilise le compilateur TypeScript pour localiser exclusivement les imports diagnostiqués. Il compare le JavaScript émis avant/après et refuse toute transformation différente. Les déclarations exécutables et les montants financiers ne sont jamais auto-supprimés. Les modifications sont journalisées par empreinte ; le chemin de rapport est validé avant toute écriture et un checkpoint atomique est produit après chaque réparation. Une dernière passe sur l'état courant ne propose plus de réparation admissible.

Les régressions permanentes couvrent aussi une fausse alerte sur un import réellement utilisé, un effet de bord, un diagnostic périmé, des coordonnées hors fichier et les tentatives de simple reformatage. Une anomalie inconnue devient un blocage explicite ; elle ne déclenche pas une correction financière improvisée.

Les **92 autres diagnostics retirés** résultent des corrections de contrats revues pendant ce chantier :

- Palette PDF typée en tuples RGB : suppression de 68 erreurs de spread issues d'une seule cause. La capitalisation est calculée dans la portée qui l'utilise ; le test exécute le PDF complet avec seul le téléchargement intercepté.
- Suppression du bloc SCPI logiquement inaccessible dans la branche où les données sont absentes.
- Graphiques SCPI : valeurs absentes/non numériques signalées « Non disponible », zéro numérique conservé. Les callbacks acceptent le vrai contrat de Recharts.
- Classification géographique : prise en charge du catalogue canonique et des allocations géographiques du catalogue étendu, sans comparer un tableau à une chaîne.
- Identifiant canonique facultatif déclaré pour les anciennes lignes ; garde de liquidité nulle conservée ; déclaration globale Calendly unifiée.
- Historique annuel : pages sources nulles/absentes exclues, distribution absente conservée à `null`. Aucun chiffre de portefeuille ou catalogue n'a été réécrit.

**Corrections automatiques de données financières sources : zéro.** Les rapprochements sûrs ne constituent pas des signatures de certification.

## Anomalies financières et documentaires

Le collecteur partagé produit désormais un `anomaly_ledger` pour chaque SCPI : identifiant stable, catégorie DOCUMENTARY/FINANCIAL/TECHNICAL, cause, preuve, incidence sur la certification et voie de traitement. « Non obtenu par le collecteur » n'est jamais transformé en « officiellement indisponible ».

Les récupérations automatiques de transport ne sont comptées que lorsqu'une erreur transitoire est réellement suivie d'une réponse réussie. La présence d'une boucle de réessai n'est pas une réparation accomplie. Le compteur réel de chaque passage se trouve dans l'artefact CI.

La politique de publication progressive **existante** reste le décideur technique commun : statuts récents non vérifiés ou anomalie de flux circonscrite peuvent donner des réserves et neutraliser les fonctions dépendantes. L'absence de DIC, les chiffres essentiels non vérifiés, une contradiction non circonscrite ou un défaut de sécurité continuent de bloquer. La classification `READY_WITH_RESERVES` n'est ni une autorisation de publication ni une certification complète. Les vrais bulletins semestriels sont maintenant acceptés avec leur date de fin exacte, sans être rebaptisés trimestres.

### Les quinze parts

Le contrôleur générique `reconcileSourceShareFlow` recalcule les flux depuis le manifeste de sources existant : deux périodes consécutives, quatre valeurs uniques, unité PARTS, bases stock/flux exactes, pages, domaines officiels et SHA. Les trois valeurs de clôture/flux doivent venir du même document courant. L'arithmétique utilise des entiers exacts ; une donnée manquante, une période sautée, un doublon ou une unité erronée ne devient pas un zéro.

Résultat sourcé enregistré : **672 775 + 101 076 − 122 = 773 729 ; clôture publiée 773 714 ; delta −15**. [Preuve calculée](evidence/recovery-093-share-flow.json). La réserve reste ouverte, les valeurs officielles restent intactes et la comparaison de flux reste neutralisée. L'explication économique/juridique exige une preuve primaire ; aucune explication n'a été générée. La vérification binaire des sources reste séparée de ce calcul sur manifeste.

## Résultat réel des quatre pilotes

Les sources du passage `3ccc0b4` sont archivées dans le run [41817737676](https://github.com/Speedcup212/maximus-scpi/actions/runs/41817737676). La nouvelle exécution de #292 recontrôle les binaires et génère les nouveaux registres d'anomalies ; ses statuts et empreintes sont consignés dans la description de PR au SHA exact.

| Pilote | Documents techniquement contrôlés au passage de référence | Manques et travaux | Publication / certification |
|---|---|---|---|
| Sofidynamic — Sofidy | T2/T3, DIC, note et RA 2025 ; cinq PDF retenus | Statuts opposables de juillet 2026 non obtenus ; −15 parts ; revue des valeurs/allocations T3, risques/SFDR, historique et revue responsable encore incomplète | Déjà publique **avec réserves** ; certification complète **0/1**, aucune nouvelle publication autorisée |
| Opus Real — BNP Paribas REIM | NI, statuts 2026, RA 2025 ; trois PDF récupérés via provenance conservée malgré la page produit indisponible | DIC et bulletin financier courant non résolus ; marché secondaire à traiter, pas de reprise d'une ancienne file de retraits | Candidate **BLOCKED**, aucune donnée certifiée par le seul téléchargement |
| AEW Opportunités Europe — AEW Patrimoine | S1 2026, S2 2025, DIC, NI/statuts combinés, RA 2025 ; cinq PDF | Revue des champs/allocations, snapshot privé et préflight réels ; conserver l'ancienne dénomination comme alias | Candidate **BLOCKED**, semestre reconnu, aucun trimestre fabriqué |
| CRISTAL Care — Inter Gestion REIM | Un PDF NI/statuts combiné de septembre 2026 | DIC et état financier courant à établir ; absence de RA 2025 à qualifier au regard du lancement, jamais remplacer par un rendement zéro | Candidate **BLOCKED**, aucun objectif transformé en rendement historique |

Sur ces quatre dossiers, le collecteur de référence recense **22 contrôles manquants** : six catégories de documents non vérifiées et seize contrôles de revue financière/allocation/décision/préflight. Ils sont comptés par SCPI, et non comme 22 causes racines indépendantes. Les rejets de documents étrangers/anciens et les champs ambigus détaillés dans le ledger ne sont pas ajoutés une seconde fois à ces 22 contrôles. L'écart de quinze parts et les 601 diagnostics TypeScript sont des mesures séparées.

Les dix cas navigateur Sofidynamic (cinq surfaces, deux largeurs) et les deux cas de trajectoire passent sur données privées interceptées T1/T2. Ils ne prouvent ni une certification T3 ni un préflight authentifié des trois autres SCPI. La publication/progression reste refusée faute de snapshots éligibles et de contrôles complets.

Taux global intégral de certification : **non établi**. Le constat Supabase existant donne 65/68 contrôles stricts et 52/68 analyses certifiées ; aucun de ces taux ne mesure une certification intégrale. Le catalogue contient 69 identités, l'univers `existing` 68 : cette divergence n'a pas été masquée par une écriture de production.

## Validation et CI/CD

- Application : **275 tests PASS**, 37 fichiers.
- Tests onboarding/plugin : **122 PASS**, résultat final et journal dans [les validations](evidence/recovery-093-validation.json).
- PDF/collecte : **44 PASS** ; agents/lecteurs historiques : **80 PASS**.
- Chromium : dix cas Sofidynamic + deux trajectoire PASS ; douze cas de publication progressive PASS. Restrictions maintenues.
- Build complet : **PASS**, 109/109 articles, 302/302 URL ; fichiers générés restaurés et exclus des commits.
- TypeScript : **FAIL, 601 diagnostics**, 422 retirés, aucune nouvelle erreur normalisée. Les défauts restants bloquent toujours l'admission.
- CI : le workflow d'admission se déclenche aussi sur les sources, configurations TS et dépendances. Le résultat TypeScript observé alimente la grille, au lieu de rester un booléen figé. Les régressions nouvelles ont leur propre diagnostic ; cela ne transforme pas les erreurs préexistantes en PASS.
- Les preuves d'anciens SHA restent étiquetées comme telles. La description finale de #292 conserve les liens vers les runs terminés et artefacts du dernier SHA.

## Maturité et passage à 200 SCPI

La grille mesurable RECOVERY-092 reste inchangée : architecture 15/15, collecte 10/15, extraction 10/15, certification 10/20, remédiation 15/15, publication 5/10, traçabilité 10/10 = **75/100**. Les points manquants correspondent aux documents courants complets, champs intégralement revus, revue indépendante, pilotes éligibles et read-back autorisé. La baisse des diagnostics n'est pas un certificat ni un motif pour relever artificiellement le score.

Le registre générique est vérifié avec **200 identités distinctes**. Les tests exécutent un découpage de quarante lots de cinq sans omission ni doublon. La collecte borne chaque lot à vingt dossiers au maximum, ses pages/documents/réessais, et conserve un checkpoint après chaque dossier. `--resume` reprend au curseur suivant uniquement si le SHA du registre est inchangé ; un curseur faux ou un registre changé est refusé. Reprendre un curseur ne revalide pas les sources anciennes et ne crée aucune QA. Les rapports de lots restent archivés séparément.

Exécution réutilisable :

```sh
python scripts/scpi-onboarding/industrialBatch.py --registry registre-prive.json --out test-results/lot --limit 5
python scripts/scpi-onboarding/industrialBatch.py --registry registre-prive.json --out test-results/lot --limit 5 --resume
```

Ce test structurel n'est pas un benchmark de collecte de 200 gestionnaires. La limite de cinq candidats par transaction atomique de publication reste distincte et conservée. Aucun module SCPI individuel ou deuxième catalogue n'a été créé.

Avant GO : terminer les contrats TS restants, résoudre les connecteurs documentaires incomplets, obtenir/qualifier les preuves primaires, rapprocher tous les champs/allocations, produire les snapshots privés, exécuter leurs préflights complets et recueillir la décision responsable par lot. Puis seulement envisager une publication contrôlée et sa surveillance au SHA exact (Netlify READY, droits publics, sources, sitemap, modules et read-back). Aucun déploiement n'a été lancé pour gagner des points.
