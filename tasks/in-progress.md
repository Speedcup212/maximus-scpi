# Tâches en cours — MaximusSCPI Recovery

> Mode RECOVERY actif à compter du 05/10/2026.
> Une seule tâche P0 active. Aucun nouveau chantier ne démarre tant qu'elle n'est pas clôturée.
> Branche de travail unique : `recovery/maximus-clean-20261005`.
> Base de référence : production stable `cf5ee9e158f4f0ef5ab5cd9336163effa83c2427`.
> Aucun déploiement Netlify depuis cette branche avant le gate RC.

---

## P0 actif

| ID | Agent | Priorité | Description | Critère de clôture |
|----|-------|----------|-------------|--------------------|
| RECOVERY-001 | 00 Superviseur + 03 Data + QA | P0 | Corriger définitivement les régimes de liquidité et variations : supprimer tout calcul/file historique non comparable après changement de régime, préserver `NULL`, utiliser les sources certifiées dans tous les consommateurs montés | Tests ciblés PASS + build PASS + contrôle fiche/historique/trajectoire/radar/modal/comparateur sur cas marché secondaire, capital variable et cas standard |

---

## Règles pendant RECOVERY-001

- Interdit de démarrer la home, le nettoyage TypeScript global, Surveillance/Monitor, plugin ChatGPT, extension 212 SCPI, nouveau moat ou nouvelle feature.
- Aucun commit direct sur `main`.
- Aucun déploiement Netlify.
- Pas de refactoring global.
- Une correction n'est considérée terminée que si elle existe sur la branche recovery et possède une preuve de test.
