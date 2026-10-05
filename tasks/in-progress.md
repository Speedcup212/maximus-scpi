# Tâches en cours — MaximusSCPI

> Phase RECOVERY du 05/10/2026 : **CLÔTURÉE**.
> Aucun chantier produit actif automatiquement après RC-1.
> Branche de référence Recovery : `recovery/maximus-clean-20261005`.
> Candidat figé : `release/rc-1-20261005` → `abf38f896b6caf77f84e1a097201c5c6e13cfe24`.
> Release production : `1e602188b0924d789aca3ef59441dab9c1ecca22`.
> Netlify production : deploy `6ac41e1b46ad180008b5a1b7` — **ready**.

---

## Recovery terminée

| ID | Statut | Résultat |
|----|--------|----------|
| RECOVERY-001 | ✅ Terminé | Liquidité / changements de régime / décotes : consommateurs sécurisés, séries non comparables neutralisées, 61 SCPI contrôlées, 0 anomalie régime ↔ retrait ↔ gates. |
| RECOVERY-002 | ✅ Terminé | Home React conservée ; shell statique aligné sur la version validée : H1, `Analyses`, `Comprendre`, retrait de `4 650 / 330 M€`, assertions anti-régression actives. |
| RECOVERY-003 | ✅ Terminé | CI simplifiée : un seul workflow utile, concurrence sérialisée, workflow Netlify doublon supprimé, `.netlify/` détracké, validation du SHA exact candidate. |
| RECOVERY-004 | ✅ Terminé | RC-1 figé, gate exact-candidate PASS, commit de release créé sans force-push, GitHub push build PASS, Netlify production ready sur le SHA attendu. |

---

## Preuves de release

- RC exact certifié : `abf38f896b6caf77f84e1a097201c5c6e13cfe24`.
- GitHub exact-candidate run `#711` / `37379275052` : PASS.
- Release : `1e602188b0924d789aca3ef59441dab9c1ecca22`.
- GitHub production run `#712` / `37379701231` : PASS.
- Logs build : home statique synchronisée ; `Analyses` + `Comprendre` présents ; anciennes preuves sociales supprimées.
- Netlify deploy : `6ac41e1b46ad180008b5a1b7`, contexte production, commit_ref `1e602188…`, état `ready`, aucune erreur.
- Archive du `main` pré-release : `archive/main-pre-recovery-20261005` → `7011e3f7ef54a433f2a1c0bbcee789ef3671ea6c`.
- Agents Supabase : `enabled=false` pendant la clôture Recovery.

---

## Dette volontairement non ouverte pendant Recovery

- RECOVERY-005 : dette TypeScript, uniquement par petits lots.
- 39 vulnérabilités npm signalées par `npm ci` (2 low, 7 moderate, 28 high, 2 critical) : **à auditer séparément**, sans `npm audit fix --force` automatique.
- Warnings de taille de chunks / Browserslist : dette performance/outillage, non bloquante pour RC-1.
- 21 divergences React ↔ HTML statique d'articles signalées comme contrôle SEO non bloquant : à traiter dans un chantier SEO dédié, sans rouvrir la home.
- Extension 61 → 212 SCPI, Surveillance/Monitor, plugin ChatGPT, nouveaux moats/features : restent hors Recovery.

---

## État après release

Aucun nouveau P0 n'est ouvert. Toute reprise doit repartir d'un ticket explicite avec WIP limité, branche dédiée et gate test/build avant déploiement.
