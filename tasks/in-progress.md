# Tâches en cours — MaximusSCPI Recovery

> Mode RECOVERY actif à compter du 05/10/2026.
> WIP = 1. Aucun nouveau chantier ne démarre tant que la tâche active n'est pas clôturée.
> Branche de travail unique : `recovery/maximus-clean-20261005`.
> Base de référence : production stable `cf5ee9e158f4f0ef5ab5cd9336163effa83c2427`.
> Aucun déploiement Netlify avant le gate RC.

---

## Tâche active

| ID | Priorité | Description | Critère de clôture |
|----|----------|-------------|--------------------|
| RECOVERY-002 | P1 | Vérifier et verrouiller uniquement les décisions UX déjà validées sur la home : H1, dashboard outils, `Comprendre`, retrait des chiffres 4 650 / 330 M€, responsive ; aucune nouvelle création | Sources identiques à la version validée + build PASS + assertions statiques home PASS |

---

## Lot précédent validé

`RECOVERY-001` — liquidité / changements de régime : **CODE + BUILD PASS** sur le head Recovery `018a4847038a5c2617261f622fce34153ea30c5d`.

Preuves :
- assertions métier locales : `CORE_GUARDS_PASS` ;
- 61 SCPI : 0 incohérence active régime / retrait / gates ;
- GitHub Build verification : extraction SCPI PASS + production build PASS ;
- aucune publication Netlify ; la correction restera `qa_pass` jusqu'au RC et au contrôle public.

---

## Règles pendant RECOVERY-002

- Aucune nouvelle idée UX : restauration stricte de la version déjà validée.
- Aucun commit direct sur `main`.
- Aucun déploiement Netlify.
- Pas de TypeScript global, Monitor, plugin, 212 SCPI ou nouvelle feature.
