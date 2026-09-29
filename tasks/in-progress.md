# Tâches en cours — MaximusSCPI

> Déplacer ici les tâches du backlog au démarrage.
> Une seule tâche active par agent à la fois si possible.

---

## En cours

| ID | Agent | Priorité | Description | Démarré le | Fichiers consultés |
|----|-------|----------|-------------|------------|-------------------|
| TASK-006 | 00 — Superviseur | P0 | Finaliser performance et responsive du comparateur — chargement initial, stabilité visuelle, cartes/résultats mobile, tests de comparaison | 29/09/2026 | `src/ComparatorApp.tsx`, `src/components/fintech/FintechComparator.tsx`, `SCPICardDark.tsx`, `MobileSelectionBar.tsx`, `SelectionSidebar.tsx` |
| TASK-007 | 03 — Data + 04 — Conformité | P0 | Rendre chaque vigilance orange/rouge explicable — motif, seuil, valeur observée, source et cohérence fiche/comparateur | 29/09/2026 | `src/utils/zScoreAttention.ts`, `src/utils/scpiAnalysis.ts`, `ScpiVigilanceRationalePortalV2.tsx`, `AnalysisDetailModal.tsx`, `src/App.tsx` |
| TASK-008 | 03 — Data | P0 | Revalider pipeline bulletins → Supabase → analyse trimestrielle → fiches et fraîcheur des sources en production | 29/09/2026 | `netlify/functions/scpi-ingest-scheduled.ts`, `scpi-ingest-background.mts`, `utils/scpi-bulletin-ingestion.ts`, déploiement Netlify |
| TASK-009 | 05 — CRM + 04 — Conformité | P0 | Auditer et fiabiliser tunnel CTA/formulaire → stockage/notification → Calendly, y compris mobile et consentements | 29/09/2026 | `src/utils/leadSubmitter.ts`, `src/components/RdvModal.tsx`, `netlify/functions/lead-fallback.ts`, `src/config/calendly.ts` |
| TASK-010 | 01 — SEO + 03 — Data | P1 | Créer le hub `/analyses/` « MaximusSCPI Research », ajouter l’entrée Analyses dans la navigation et renommer Apprendre en Comprendre | 29/09/2026 | `src/components/Header.tsx`, `src/main.tsx`, `src/components/AnalysesPage.tsx`, `src/AnalysesApp.tsx` |

---

## Format

| ID | Agent | Priorité | Description | Démarré le | Fichiers consultés |
|----|-------|----------|-------------|------------|-------------------|
