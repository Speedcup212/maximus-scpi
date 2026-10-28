# TOF MaximusSCPI — source émetteur exclusivement (cabinet, 28/10/2026)

## Règle obligatoire

Le champ canonique `tof` est **uniquement** la valeur exacte du TOF publiée dans le **bulletin officiel de la même SCPI** par sa **société de gestion**, pour **la période documentaire exacte**. Une valeur libellée « TOF ASPIM » ou « TOF financier ASPIM » est **interdite dans le champ TOF** ; ne jamais la remplacer par un TOF calculé, un TOP, un taux de locaux occupés, un nombre voisin, une moyenne, ni une valeur d'un autre trimestre.

Si la seule valeur affichée sur le bulletin porte ce libellé interdit, laisser le TOF non certifié, avec une exception de QA explicite. Ne pas forcer PASS. Un TOF exceptionnel supérieur à 100 % peut être présenté uniquement lorsqu'il s'agit du **TOF admis par cette politique**, directement publié dans le bulletin émetteur et corroboré par le passage expliquant la valeur ; ne pas appliquer de plafond artificiel ni modifier sa valeur pour la ramener à 100 %.

## Provenance et reconnaissance juridique

* Identité SCPI, société de gestion et période doivent concorder avec le bulletin.
* Le document doit être accessible depuis le **site de l'émetteur** ou un hébergement/CDN officiellement relié à celui-ci, approuvé individuellement dans `scpi_source_connectors.allowed_hosts`. Un hébergement de miroir, un comparateur, l'ASPIM ou un agrégateur ne sont pas une source admissible, même s'ils recopient le bulletin.
* Pour chaque métrique, stocker URL exacte, période, date d'arrêté, page PDF (ou position HTML), extrait libellé, version/hash du document et méthode d'extraction.
* Les bulletins d'une autre structure juridique sont interdits : SCPI Atream Hôtels ≠ SCI Atream Euro Hospitality ; Sofiprime ≠ Sofidy Europe Invest.
* Les dates et valeurs doivent être vérifiées par rapport au PDF, pas seulement par concordance des nombres et proximité textuelle.

## Exceptions structurantes conservées

* Grand Paris Résidentiels : reporting semestriel/annuel sans exiger 8 trimestres consécutifs. Une URL CDN doit être validée depuis l'index de la société de gestion avant ajout à `allowed_hosts`.
* Patrimmo Croissance Impact : série spéciale nue-propriété ; `tof` n'est pas applicable. Ne pas le fabriquer ni pénaliser son statut `READY_SPECIAL_STRUCTURE`, mais suivre liquidité/valorisation/suspension de variabilité.
* Edissimmo et Rivoli Avenir Patrimoine : découverte Amundi dynamique ; l'absence de lien HTML statique n'est pas un défaut. Un miroir SCPI-Lab n'est cependant pas une preuve TOF autorisée.

## Audit et déploiement

Avant fusion : `SELECT * FROM scpi_internal.tof_bulletin_source_policy_violations`; vérifier individuellement les lignes. Les certifications historiques sont conservées **à titre de preuve** tant qu'elles n'ont pas été réconciliées ; ne pas présenter le test comme terminé. Les nouvelles certifications non conformes sont marquées `invalid_tof_bulletin_source_policy` (confiance 0), sans suppression de preuves.

Points identifiés le 28/10 avant déploiement : 75 preuves TOF ASPIM correspondant à l'expression bloquante sur 13 SCPI, et 4 hôtes hors allowlist (3 miroirs/agrégateurs : Altixia Cadence XII, Edissimmo, Rivoli Avenir Patrimoine ; 1 CDN Inter Gestion potentiellement officiel : Grand Paris Résidentiels). Certains autres extraits contiennent le mot ASPIM ailleurs sans que le TOF soit explicitement libellé ASPIM ; ne pas les condamner sans revue.

**Les observations historiques existantes ne sont pas modifiées automatiquement par cette PR.** Le traitement des anciennes certifications et des historiques nécessite une reprise documentée et un crash test 65/65 après la sécurisation des sources.