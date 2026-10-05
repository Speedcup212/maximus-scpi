# Backlog — MaximusSCPI Recovery

> Ordre strict. Aucun chantier ne saute la file sans défaut P0 de production.
> WIP = 1.

---

## File de reprise

| Ordre | ID | Priorité | Description | Statut |
|------:|----|----------|-------------|--------|
| 1 | RECOVERY-001 | P0 | Régimes de liquidité / comparabilité / consommateurs montés | ✅ Code + build validés ; publication différée au RC |
| 2 | RECOVERY-002 | P1 | Restaurer uniquement les décisions UX déjà validées sur la home : H1 validé, cartes outils, `Comprendre`, retrait des chiffres 4 650 / 330 M€, responsive, sans changer logo/header/footer hors décision existante | 🔄 En cours |
| 3 | RECOVERY-003 | P1 | Simplifier la CI : un seul flux test → build → package ; supprimer le doublon de packaging ; sortir les artefacts `.netlify/` du suivi Git | ⏸️ Gelé jusqu'à RECOVERY-002 |
| 4 | RECOVERY-004 | P0 release | Construire RC-1 et exécuter le gate complet avant un unique déploiement Netlify | ⏸️ En attente |
| 5 | RECOVERY-005 | P2 | Reprendre la dette TypeScript par petits lots uniquement après RC-1 | ⏸️ Différé |

---

## Chantiers volontairement gelés

- Surveillance / Monitor.
- Extension de 61 à 212 SCPI.
- Plugin ChatGPT.
- Nouvelles fonctionnalités espace client hors correction bloquante.
- Nouvelle refonte graphique.
- Recherche de moat / nouveaux modèles commerciaux.
- Nettoyage TypeScript global.
- Nouveaux déploiements Netlify hors RC-1 ou hotfix production critique.

---

## Anciennes tâches

Les anciennes tâches `TASK-*` restent historiquement traçables dans Git et `tasks/done.md`, mais ne pilotent plus la phase Recovery. Toute reprise doit être requalifiée en `RECOVERY-*` et replacée dans l'ordre ci-dessus.
