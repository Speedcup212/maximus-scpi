# Vérification de livraison certifiée — 29 octobre 2026

Cette livraison vérifie que le contrôle distant, précédemment indisponible faute de secret GitHub, fonctionne via GitHub OIDC sans clé `service_role` dans le dépôt ou le runner.

La source Supabase (fonction `scpi-release-certification-oidc`) contrôle l'identité du dépôt, le SHA, le workflow de construction, la branche principale et les 65 fonds actifs. Le contrôleur GitHub réutilise toutes les règles d'analyse SCPI existantes et compare la cohorte complète.

**Ne pas confondre** cette attestation de contrôle de publication avec une validation financière de chaque bulletin historique : les publications absentes, les téléchargements bloqués et les exceptions documentaires doivent rester visibles et traités séparément.

La publication finale se juge sur deux preuves distinctes : verdict réel du workflow et identifiant de déploiement Netlify en état `ready`.
