# scripts/scpi-agents

Répertoire des scripts d'agents opérant sur la chaîne de certification SCPI MaximusSCPI.

## Runbooks de recertification TOF (conservés)

Les scripts `recertify_*.mjs` documentent la procédure de recertification des lignes
TOF mises en quarantaine `invalid_tof_bulletin_source_policy` lors de l'audit
`scpi_internal.tof_policy_quarantine_audit_20261028`.

Ils sont **idempotents** : ils relisent la valeur officielle du bulletin émetteur
(SHA-256 croisé avec `scpi_bulletins.pdf_sha256`) et ré-appliquent la même valeur.
Ordre imposé par les gardes en base : **certificat d'abord**
(`guard_quarantined_tof_replay`), puis ligne d'historique.

- `recertify_kyaneos_pierre.mjs` — 9 périodes (2018-T4 → 2022-T2)
- `recertify_kyaneos_pierre_remaining.mjs` — 4 périodes (2022-T1 → 2023-T1)
- `recertify_batch_invalid_rows.mjs` — 11 périodes (Aestiam, Altixia, Cristal)
- `recertify_aestiam_agora_remaining.mjs` — 3 périodes Agora

Prérequis : `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`
(chargeur local uniquement — aucun secret versionné).

## État de référence

Objectif atteint : **69/69 SCPI `PASS_100`** (contrôle strict
`public.scpi_crash_test_strict_v2`), 0 `FAIL_STRICT`, 0 blocage trimestriel/annuel.
Surveillé par le watchdog `maximus_agents.watchdog_tick()` (cron 30 min) et le
registre `maximus_agents.scpi_universe` (69 `existing`).

## Fichiers scratch

Les diagnostics, extractions et PDF temporaires générés lors de la mission 69/69
ont été archivés **hors dépôt** (aucune suppression) le 24/11/2026. Les empreintes
SHA-256 de preuve restent intégrées dans les runbooks ci-dessus.
