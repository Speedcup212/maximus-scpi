# RECOVERY-092 — Démonstration industrielle et décision d'admission

Date : 4 novembre 2026. Suite de #292, sans nouvelle application, sans merge ni déploiement. Le score et l'éligibilité financière sont séparés. **Décision : NO GO pour publier industriellement des lots. Le seuil 90/100 n'est pas atteint.**

## Grille calculée, avant / après

La décomposition de chaque domaine en critères binaires de cinq points est versionnée dans `industrialMaturity.mjs`. Un critère sans preuve ou en échec vaut zéro. Les capacités non exécutées ne reçoivent aucun point. Le moteur calcule les scores depuis [les observations d'évaluation](evidence/recovery-092-maturity-input.json) ; [le résultat reproductible](evidence/recovery-092-maturity-result.json) n'est ni une signature financière ni une permission de livrer.

| Domaine demandé | Maximum | Initial, après les deux commits de décote de #292 | Après travaux |
|---|---:|---:|---:|
| Architecture et orchestration | 15 | 5 | 15 |
| Collecte documentaire | 15 | 5 | 10 |
| Extraction et normalisation | 15 | 5 | 10 |
| Certification financière et réglementaire | 20 | 10 | 10 |
| Auto-réparation et non-régression | 15 | 5 | 15 |
| Publication automatisée sécurisée | 10 | 5 | 5 |
| Scalabilité et traçabilité | 10 | 5 | 10 |
| **Total démontré** | **100** | **40** | **75** |

Les points initiaux mesurent strictement les capacités couvertes par cette grille multi-émetteurs ; ils ne prétendent pas remplacer une notation historique inexistante. Les 25 points non attribués correspondent à : documents réglementaires courants complets, revue de toutes les données des pilotes, contrôle indépendant, trois pilotes effectivement éligibles et lecture d'une publication autorisée en production. Les cent identités sont testées structurellement ; aucun débit réel de cent émetteurs n'est revendiqué. Même 100 points ne peuvent rendre GO un contrôle critique défaillant.

## État réel de Sofidynamic

Production inchangée : fiche publique **avec réserves**, `verified_primary_source_with_reserves`. Les vues Supabase restent `full_qa_pass=false`, `final_release_ready=false`, `complete_certification=false`. Le catalogue public n'a pas été modifié.

Les 29 métriques et 11 allocations historiques de RECOVERY-091 restent rapprochées des sources enregistrées ; le workflow officiel recontrôle leurs binaires. Ce corpus couvre T1/T2 2026 et RA 2025 ; il ne certifie pas automatiquement le nouveau T3 découvert.

### Nouvelle valorisation : preuve primaire et proposition privée

La collecte retrouve le [bulletin T3 officiel](https://www.sofidy.com/app/uploads/2026/11/Bulletin_Trimestriel_-_Sofidynamic.pdf), SHA-256 `1898d414b5195c8e0f675ef9041e3142e2e53f720f238fd6ca6cdcf2f8992c38`. La page 5 porte **340,38 €** et l'en-tête **« par part au 30/06/2026 »**. Le trimestre de publication **2026-T3** n'est pas la date d'arrêté **30/06/2026**. L'ancien point **336,75 € au 31/12/2025**, RA 2025 p.9, reste conservé.

La [proposition privée](../../data-import/batches/sofidynamic-valuation-prepared-20261104.json) prépare une indication de **5,99 %** avec prix 320 € et valeur 340,38 €, tous deux arrêtés au 30/06/2026. Elle reste `pending_independent_qa`, sans écriture en base ou dans le catalogue public, sans score ni recommandation. Le public conserve son indication historique actuelle **4,97 %** tant que la chaîne applicable à la correction n'est pas validée.

Les commits `e33aaff` et `9c406ab` ne donnaient qu'un test **synthétique** et une règle d'affichage pour des dates égales. Ils sont repris et testés, jamais utilisés comme certification de 340,38 €. Le nouveau test distingue la proposition sourcée et le catalogue réellement publié.

### Blocages et limites

- Statuts opposables déposés au RNE le 08/07/2026 : non récupérés. Le site émetteur sert encore une édition 2025. Le miroir renvoie 403 ; son listing n'est pas un binaire officiel. L'accès public INPI/RNE testé n'a pas fourni le document ; aucun compte INPI authentifié n'est disponible dans l'environnement.
- Écart T2 : **672 775 + 101 076 − 122 = 773 729**, contre **773 714** parts publiées, soit **−15 parts**. Aucune explication primaire n'est établie. Les chiffres restent inchangés ; calculs de flux et comparaisons non certifiées restent interdits.
- DIC/NI, frais, HT/TTC, risque/SFDR et liquidité : vérification documentaire technique distincte de leur revue financière/réglementaire complète. Aucun avis humain fabriqué.
- Le nouveau T3 impose une revue des métriques et allocations de cette période ; les 29/11 preuves anciennes ne la remplacent pas.
- Analyse, historique de production et registre d'activation ne deviennent pas certifiés par une suite locale. Le registre d'activation initial et le déploiement actuel sont toujours des preuves distinctes.

## Les trois pilotes exécutés

Le [registre multi-émetteurs](../../scripts/scpi-onboarding/fixtures/industrial-pilots-20261104.json) utilise le même collecteur et les mêmes parseurs ; seules les identités, URL officielles et périodes demandées sont déclarées. Aucun composant SCPI individuel n'a été développé.

| Pilote non publié | Profil documentaire | Résultat primaire obtenu | Niveau de publication |
|---|---|---|---|
| Opus Real — BNP Paribas REIM | Variabilité suspendue, marché secondaire depuis mars 2026 | NI, statuts 2026 et RA 2025 : binaires/identité/périodes contrôlés. Le bulletin d'information sur la suspension n'est pas un bulletin financier trimestriel. DIC et bulletin courant non résolus par le connecteur. | **BLOCKED**, aucun prix de marché inventé, aucune file de retrait héritée comparée |
| AEW Opportunités Europe — AEW Patrimoine | Ancienne dénomination Fructirégions Europe ; publication semestrielle | S1 2026 et S2 2025, DIC, NI/statuts combinés et RA 2025 contrôlés. L'analyse S1 est distinguée de la période de validité S2. NI et statuts du même PDF passent des vérifications distinctes. | **BLOCKED**, revue des champs/allocations et préflight réel encore nécessaires |
| CRISTAL Care — Inter Gestion REIM | Lancement 2026, documentation sur CDN éditeur | PDF NI/statuts de septembre 2026 retrouvé via lien de l'émetteur, identité/année contrôlées. Absence de RA 2025 non transformée en rendement zéro ou projection historique ; DIC et état financier courant à établir. | **BLOCKED**, aucune assimilation d'un objectif de rendement à une performance acquise |

Les chaînes ont effectivement exécuté la découverte, les téléchargements, l'extraction de texte, les propositions, les contrôles techniques et le refus de prépublication/publication. **Elles n'ont pas obtenu trois certifications ou trois prépublications éligibles.** Le refus est un résultat de contrôle, pas une validation industrielle de ces trois produits.

Les [preuves des passages réels](evidence/recovery-092-industrial-trial.json) référencent les runs, SHA et artefacts. Les archives contiennent les binaires exacts, pages et rapports ; leur durée de conservation CI est de trente jours. Le collecteur est raccordé à l'extracteur financier géométrique **existant** `bulletin_fields.extract/reconcile`, avec MuPDF et Poppler. Leurs accords produisent des propositions datées/unitaires, jamais une certification indépendante.

## Causes racines éliminées et tests permanents

1. **Archives épuisant le budget avant les documents essentiels.** Sélection par types, puis deuxième document de chaque type ; budget borné et absence explicitement remontée. Test de cinquante bulletins et quatre documents réglementaires.
2. **Trimestre figé dans le manifeste.** Détection du titre du PDF et conservation séparée de la période du document et de la date du chiffre. Une période ambiguë bloque ; une date d'upload ne la remplace pas.
3. **Semestre forcé en trimestre.** Support générique des semestres dans l'auditeur et l'extracteur partagés ; tests analyse S1 contre validité S2. Aucun bulletin S1 rebaptisé T2.
4. **Documents réglementaires combinés comptés comme manquants.** Chaque type passe séparément l'auditeur existant sur les mêmes octets ; un libellé de lien seul ne suffit pas.
5. **Rapport ISR confondu avec le rapport financier annuel.** Le classificateur exclut les rapports ESG/ISR du besoin de rapport annuel financier ; test permanent.
6. **Attributs de téléchargement HTML ignorés.** Extension ciblée du résolveur existant aux attributs génériques `data-document-url`, `data-file-url`, `data-url` ; test sans code propre à un gestionnaire.
7. **Occurrence numérique partielle.** « 200 » dans « 2006 » n'est plus retenu comme candidat à un montant ; tous les résultats restent contextualisés par page/SHA.
8. **WALT/WALB, identités de métriques et unités non contrôlés explicitement.** Préflight enrichi : inversion incompatible, preuve attachée à l'autre métrique et EUR/M€ contradictoires refusés. Les snapshots historiques sans unité ne sont pas rétroactivement proclamés certifiés.
9. **Retests globaux sans lien avec la correction.** Le remédiateur expose les seuls contrôles touchés et les exécute avec `--retest`, plus la préservation de cohorte. Un essai isolé d'erreur EUR/M€ l'a exécuté : 10 tests PASS, aucune écriture de source ni approbation.
10. **Score industriel pouvant masquer un échec.** Grille calculée, preuves obligatoires et veto critiques ; le test à 100 points avec un contrôle critique faux reste NO GO. Le nouveau workflow d'admission exécute réellement TypeScript et refuse le seuil insuffisant.

## Tests et sécurité

- Suite applicative avec les propositions de décote : **270/270 PASS**, 35 fichiers.
- Onboarding/plugin/maturité et corpus financier adversarial : **114 PASS**, validation YAML du workflow d'admission incluse.
- PDF/collecte industrielle : **37 PASS** ; parseurs financiers/transport historiques : **55 PASS** ; résolveur ciblé : **18 PASS**.
- SQL éphémère : PASS sur la migration d'arrondi de RECOVERY-091, sans application distante. SHA, période, page, QA, doublons et droits restent bloquants.
- Six surfaces Sofidynamic : **10 cas PASS** sur fiche, comparateur, radar, simulateur et espace client, complétés par **2 cas PASS** de trajectoire. Données sourcées interceptées en local, jamais déclarées test de production. Restrictions de comparaison/recommandation maintenues.
- TypeScript global : **FAIL, 1 023 diagnostics préexistants**, dont 606 TS6133. Même résultat normalisé avant/après, zéro message ajouté ou retiré y compris après le test de proposition sourcée. Ces erreurs ne sont pas retirées des exigences ni neutralisées dans `tsconfig`.
- Le build complet et les campagnes CI de #292 sont distincts de l'admission industrielle. Un workflow documentaire vert signifie que le constat s'est exécuté, même si les candidats sont BLOCKED. Le workflow **SCPI industrial admission** doit rester en échec tant que TypeScript, le score et les conditions obligatoires ne sont pas satisfaits.
- Aucun accès de mutation Supabase, aucun rôle de service ajouté, aucun RLS affaibli. Les replays existants déclenchés sur PR n'exécutent que les tests et sondes publiques : leurs étapes de queue distante sont exclues de l'événement `pull_request`.

## Réutilisation pour les cent prochaines identités

1. Déclarer les identités canoniques et domaines officiels dans le registre privé. Le contrat « exactement trois gestionnaires » est propre à l'essai, pas une limite du moteur. Vérifier aussi les anciennes dénominations afin d'éviter les doublons.
2. Exécuter `industrialBatch.py --registry <registre> --out <artefacts>`. Le moteur réutilise le résolveur/auditeur existants, borne pages/documents/réessais, archive les octets par SHA, cherche les sources liées autorisées et extrait les propositions avec deux lecteurs.
3. Examiner tous les candidats contradictoires, unités, définitions et dates ; établir les absences officiellement prouvées. Une donnée optionnelle absente doit neutraliser les fonctions dépendantes, pas créer un faux zéro. Une donnée essentielle manquante bloque le niveau de publication concerné.
4. Alimenter après revue les registres privés existants ; exécuter `preflight.mjs`, contrôles d'allocations, analyse/historique et audits proportionnés. Ne pas convertir le statut technique `verified` d'un parseur en QA financière.
5. Corriger uniquement les dérivés démontrables via le remédiateur existant ; `--retest` relance les contrôles concernés. Repasser ensuite les non-régressions communes et le contrôle d'admission avant le lot.
6. Utiliser les préflights navigateur existants sur les six surfaces avec le vrai snapshot privé, puis le mécanisme de publication atomique existant. La limite de cinq candidats par transaction préparée reste conservée : cent candidats exigent plusieurs lots, pas la suppression du verrou.
7. Après autorisation et succès des contrôles : vérifier SHA exact, Netlify READY, OIDC, droits anonymes, catalogue/sitemap et lecture réelle post-publication. Une fiche avec réserves ne compte jamais parmi les certifications complètes.

## Ce qui reste à résoudre

**Dépendances externes / décisions non substituables :** obtenir les statuts officiels opposables via accès RNE/INPI, greffe ou gestionnaire ; obtenir une explication primaire des quinze parts ou une exception responsable limitée ; recueillir les revues et décisions identifiées. Aucune demande n'a été envoyée à un tiers.

**Travaux techniques encore ouverts, à ne pas faire passer pour des blocages humains :** compléter les connecteurs documentaires Opus Real/CRISTAL Care, achever la couverture et la revue des champs et allocations de tous les pilotes, construire les snapshots privés éligibles, réaliser leurs préflights complets, traiter la dette TypeScript et prouver le débit réel de lots. Ces capacités ne sont pas déclarées achevées par la présence d'un collecteur.

Aucun merge ou déploiement à ce stade. La migration préparée dans #292 reste non appliquée. **75/100 ne satisfait pas 90/100 ; trois refus sûrs ne sont pas trois intégrations validées.**

Journaux locaux et leurs empreintes : [validation locale RECOVERY-092](evidence/recovery-092-local-validation.json). La dernière description de #292 contient les statuts et artefacts CI du SHA final ; les preuves archivées antérieures restent étiquetées par leur propre SHA.
