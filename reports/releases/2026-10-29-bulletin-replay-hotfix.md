# Livraison contrôlée — 29 octobre 2026

## Périmètre

- PR #229 (952e4c6) : les champs officiellement absents après double lecture complète ne sont pas des erreurs d'extraction ; champs structurés et champs financiers restent distingués.
- PR #230 (9a72c76) : le seed OIDC évite les collisions de clés sur les URL canoniques modifiées, conserve l'ancienne source pour audit et exige une preuve positive d'au moins un indicateur financier central avant de déclarer un document financièrement complet.
- Correction du contrôle de rendu de l'espace client avant les assertions du navigateur.

## Conditions de publication

Le build du code, les tests métier et navigateur, puis le contrôle distant de certification SCPI doivent réussir. Aucun contournement des anomalies documentaires, source officielles, historiques ou autorisations de publication n'est permis.

## Ce que cette livraison n'affirme pas

Ce correctif de moteur n'est pas une certification automatique de tous les bulletins des 65 SCPI ; les sources indisponibles et les divergences de données restent signalées distinctement. La dernière valeur officielle certifiée garde sa date de référence.
