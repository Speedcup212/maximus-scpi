# Backlog — MaximusSCPI après Recovery RC-1

> Recovery RC-1 clôturée le 05/10/2026.
> Les travaux ci-dessous ne redémarrent pas automatiquement.
> Toute reprise = ticket explicite + branche dédiée + WIP limité + gate avant release.

---

## Recovery clôturée

| Ordre | ID | Priorité | Description | Statut |
|------:|----|----------|-------------|--------|
| 1 | RECOVERY-001 | P0 | Régimes de liquidité / comparabilité / consommateurs montés | ✅ Terminé et publié |
| 2 | RECOVERY-002 | P1 | Restaurer uniquement les décisions UX déjà validées sur la home | ✅ Terminé et publié |
| 3 | RECOVERY-003 | P1 | Simplifier la CI, supprimer le packaging doublon, sortir `.netlify/` du suivi Git | ✅ Terminé et publié |
| 4 | RECOVERY-004 | P0 release | Construire RC-1, gate exact-candidate, unique release Netlify | ✅ Terminé — release `1e602188…`, deploy `6ac41e1b…` ready |

---

## File post-Recovery — non démarrée

| Ordre | ID | Priorité | Description | Statut |
|------:|----|----------|-------------|--------|
| 1 | RECOVERY-005 | P2 | Dette TypeScript par petits lots, en préservant les contrats validés | ⏸️ Différé |
| 2 | SECURITY-001 | P1 | Auditer les 39 vulnérabilités npm et distinguer runtime/dev/transitives avant toute mise à jour | ⏸️ À planifier |
| 3 | SEO-QA-001 | P2 | Traiter les 21 divergences React ↔ HTML statique d'articles aujourd'hui non bloquantes | ⏸️ À planifier |
| 4 | PERF-001 | P2 | Réduire les chunks > 500 kB et remettre Browserslist/caniuse à jour | ⏸️ À planifier |

---

## Chantiers stratégiques gelés tant qu'ils ne sont pas re-priorisés

- Surveillance / Monitor.
- Extension de 61 à 212 SCPI.
- Plugin ChatGPT.
- Nouvelles fonctionnalités espace client hors correction bloquante.
- Nouvelle refonte graphique.
- Recherche de moat / nouveaux modèles commerciaux.
- Nettoyage TypeScript global.

---

## Références de sécurité

- Production : `main` → `1e602188b0924d789aca3ef59441dab9c1ecca22`.
- RC figé : `release/rc-1-20261005` → `abf38f896b6caf77f84e1a097201c5c6e13cfe24`.
- Archive main avant Recovery : `archive/main-pre-recovery-20261005` → `7011e3f7ef54a433f2a1c0bbcee789ef3671ea6c`.
- Base production antérieure : `cf5ee9e158f4f0ef5ab5cd9336163effa83c2427`.
- Netlify production RC-1 : `6ac41e1b46ad180008b5a1b7`.
