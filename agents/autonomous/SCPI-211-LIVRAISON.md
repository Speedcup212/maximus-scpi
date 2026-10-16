# Livraison MaximusSCPI : jalon des 211 fonds (16 octobre 2026)

## Périmètre de vérité
Le jalon **211 identités distinctes** est constitué des **61 historiques + 150 candidates**. Les **30 alias/exclusions** ne comptent jamais dans la livraison. La cible historique de 225 reste un objectif d'extension ultérieur : ce contrat porte sur les 211 déjà recensées. La présence dans l'univers ne constitue pas une autorisation de publication.

**Une seule source de pilotage** : vues privées `maximus_agents.scpi_delivery_211` (une ligne par fond, prochain vrai blocage) et `maximus_agents.scpi_delivery_211_summary` (totaux), construites sur les tables de qualité déjà en production. La vue existante `scpi_candidate_work_queue` est corrigée ; **aucun deuxième orchestrateur** ni nouveau worker.

## Circuit par SCPI : aucune réinitialisation d'étape
1. **SEARCH** : identifier précisément la SCPI et sa société de gestion, exclure doublons, alias et fonds fermés ; récupérer les références documentaires **primaires**. 91 candidates à l'étape identité/source lors du diagnostic.
2. **DATA** : vérifier empreinte PDF, fonds/période, annualité et trimestre ; vérifier les chiffres et leur provenance avec page et unité ; gérer les régimes capital fixe/variable, TOF non applicable, parts en attente et frais géographiques sans valeurs fictives. 49 candidates avaient une vérification documentaire à compléter, 4 la QA des métriques.
3. **ANALYST** : produire et contrôler les analyses **sur bulletins de même période certifiés**, comparer les périodes sur bases compatibles ; tenir les anomalies explicites dans le registre. 6 candidates prêtes pour cette étape, dont CORUM Origin, Eurion, USA et XL. **Priorité numéro 1** : terminer ces quatre analyses, pas relire leurs PDF déjà vérifiés.
4. **QA** : vérification financière indépendante, frais/DIC, liquidité, avertissements, comparaison historique, parité de la fiche modèle Iroko Atlas avec comparateur, radar, trajectoire, simulateurs, analyse, espace client, SEO/sitemap. Bloquer seulement la SCPI présentant une exception, sans ralentir les autres.
5. **CONTROL/release** : lot maximal de **5 fonds** (limite existante en base), passage de tous les gates, un seul test de bout en bout et **un seul déploiement contrôlé par lot** lorsque les contrôles sont PASS. Ne jamais activer le flag global de publication pour contourner un échec. En cas d'échec, la SCPI reste privée et rejoint une file d'exception sourcée.

## Premier lot et cadence
- **Pilote = 4 CORUM**. Preuves source déjà intégrées au schéma commun ; les analyses et la revue finale restent NON CERTIFIÉES. Terminées seulement si toutes les surfaces et toutes les preuves passent.
- En parallèle, réparer les **7 historiques non autorisées** (2 échecs stricts, 5 comparaisons non certifiées) ; ne pas confondre ces 7 avec des candidates.
- Puis grouper **jusqu'à 5 candidates réellement prêtes**, indépendamment de leur ordre alphabétique. Ne pas attendre les 91 identités sans documents pour avancer les 6 proches des contrôles finaux.
- Utiliser les workers OCR/backfill existants à leur cadence déjà définie. Le worker DeepSeek peut corriger le **code borné** et soumettre une PR ; il ne peut pas certifier seul les données immobilières financières.
- Mesurer à chaque cycle le **nombre de nouvelles SCPI strictement certifiées, toutes interfaces prêtes, puis effectivement servies par le site** ; les exécutions GitHub/commits ne sont pas des livraisons.

## Conditions de fin : vérifiables
Pour un fonds : source primaire officielle identifiée et datée, champs utiles certifiés avec pages, analyse trimestrielle/multi-annuelle adéquate, contrôle de risques/frais/liquidité, parité d'affichage et tests sur toutes les surfaces, revue finale indépendante, inclusion atomique au catalogue et au sitemap, contrôle des API anonymes et de la production Netlify.

Pour le jalon 211 : **chaque identité** doit avoir soit une publication pleinement vérifiée, soit un statut d'exception précis avec pièce manquante et prochaine action. **Aucun statut PASS artificiel.** L'objectif commercial de 211 fonds *publiés* ne peut être déclaré atteint tant que leur mise en ligne réelle n'est pas constatée.
