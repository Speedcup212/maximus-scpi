# Backlog des tâches — MaximusSCPI

> Toute modification du site doit être inscrite ici avant exécution.
> Format : [ID] | Agent | Priorité | Description | Template | Statut

---

## Tâches en attente

| ID | Agent | Priorité | Description | Template | Statut |
|----|-------|----------|-------------|----------|--------|
| TASK-001 | 04 — Conformité | P0 | Audit conformité du simulateur crédit SCPI (`ScpiCreditSimulator.tsx`) — vérifier disclaimers, mentions risques, absence de promesse de rendement | `conformity-task.md` | ✅ Terminé |
| TASK-002 | 01 — SEO | P1 | Architecture SEO 100 pages + résolution cannibalisation sectorielle | `seo-task.md` | 🔄 TASK-002C termin� � build requis |
| TASK-SEO-003 | 01 — SEO + 04 — Conformité | P1 | Page pivot `/fiscalite-scpi/` — création composant `FiscaliteScpiPage.tsx`, wiring App.tsx, mentions CIF complètes | `seo-task.md` | ✅ Terminé |
| TASK-004 | 04 — Conformité | P0 | Audit tunnel souscription (`SubscriptionFunnel.tsx`) — recueil d'informations investisseur, mentions CIF, consentement RGPD | `conformity-task.md` | ⏳ À démarrer |
| TASK-005 | 04 — Conformité | P1 | Audit usage des disclaimers sur les pages publiques — vérifier présence de `DisclaimerBox` sur les simulateurs et pages comparatif | `conformity-task.md` | ⏳ À démarrer |
| TASK-008 | 03 — Data | P0 | Revalider pipeline bulletins → Supabase → analyse trimestrielle → fiches et fraîcheur des sources en production | `data-task.md` | ⏳ À démarrer |
| TASK-009 | 05 — CRM + 04 — Conformité | P0 | Auditer et fiabiliser tunnel CTA/formulaire → stockage/notification → Calendly, y compris mobile et consentements | `general-task.md` | ⏳ À démarrer |

---

## Règles de gestion du backlog

- Toute nouvelle tâche reçoit un ID incrémental (TASK-XXX).
- Une tâche démarrée est déplacée dans `tasks/in-progress.md`.
- Une tâche terminée est déplacée dans `tasks/done.md`.
- Aucune tâche ne peut modifier `src/`, `public/`, `supabase/` sans validation explicite.
