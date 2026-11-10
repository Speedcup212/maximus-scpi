# RECOVERY-200 — Livrable du 9 novembre 2026

Tableau complet par SCPI : `RECOVERY-200-69-scpi-table.md` (et `.csv`).
Preuves brutes du relevé : branche `data/recovery-200-fee-probe-run-42665958628` (run GitHub Actions 42665958628, 69 SCPI en 2 min 57 s).

## A — Frais réglementaires

| Indicateur | Avant | Après |
|---|---:|---:|
| `scpi_indicators.frais_souscription` renseigné | 9 / 69 | **33 / 69** |
| `scpi_indicators.frais_gestion` renseigné | 4 / 69 | **19 / 69** |
| Frais avec provenance complète (URL, SHA-256, page, extrait, assiette, HT/TTC, date) | 3 | **47** projetés + 63 au registre |
| Valeurs héritées « frais de gestion » qui étaient en réalité des coûts PRIIPs du DIC | 15 affichées | **0** (11 retirées, 4 remplacées) |

- Registre privé `scpi_fee_evidence` : 138 lignes (69 SCPI × souscription/gestion) — 63 `verified`, 49 `partial`, 26 `blocked`. Contraintes SQL : zéro / inconnu / non applicable distincts ; `verified` impossible sans document DIC/note, SHA-256, page, extrait, assiette, HT/TTC et revue.
- Chargement : fichier `fee-evidence-payload.json` du commit `95c00d0`, récupéré par la base et contrôlé par empreinte `12e8b429…97fa` avant insertion.
- Projection vers les indicateurs publics : uniquement si le libellé public est exact (souscription TTC/TTI, gestion HT ou exonérée) et si le champ était vide ou identique. Un taux HT ne remplit jamais le champ TTC, ni l'inverse.
- Catalogue statique réconcilié (29 valeurs modifiées) : plusieurs frais de souscription y étaient stockés en HT sous un libellé TTC (10 → 12 % TTC pour Efimmo 1, Immorente, NCap ×3, Optimale, Paref Hexa, Sofiprime).
- Revue sémantique : outillée, réalisée par la session Claude, **non humaine**. Aucune signature humaine n'est revendiquée.

Conflits laissés intacts (arbitrage humain requis) :
- Accimmo Pierre souscription : base 10,72 %, note du 22/06/2026 : 10,716 % TTC.
- Accès Valeur Pierre gestion : 9 % HT documenté, mais décision antérieure `not_certified_effective_rate` conservée.
- Sofidynamic et EdR Europa : valeurs déjà certifiées, identiques à la preuve.

Restant : 26 lignes bloquées (13 SCPI sans aucun DIC ni note découvert : Iroko ×2, Perial ×4, Amundi ×2, Épargne Pierre, ESG Pierre Capitale, Log In, Patrimmo Croissance Impact, Transitions Europe) et 49 partielles (note absente, extrait coupé, taux à plusieurs paliers, édition ancienne).

## B — Actualisation T3 2026

Cause racine : la promotion `scpi-certified-promote` (cron toutes les 30 min) est **atomique par bulletin**. Il suffit d'un seul champ sans preuve paginée pour retenir tout le T3.

| Situation | SCPI |
|---|---|
| Retenu pour un ou deux champs sans preuve | Comète, Paref Hexa, Perial O2, Buroboutic (TOF) |
| Source HTML / confiance faible | Iroko Atlas |
| T3 ingéré sans aucune preuve paginée (`auto_partial_review`) | 14 SCPI |
| Garde d'identité PDF en échec | Atream, Cristal Life, Cristal Rente, Log In, Novapierre Résidentiel, Remake UK |
| Bulletin non trouvé / non ingéré | Sofidynamic, Novapierre 1 |

Le détail par SCPI figure dans le tableau. **Aucun T3 n'a été promu dans cette passe.**

La correction structurelle demandée (promotion par métrique, avec la période propre à chaque champ) modifie la fonction de publication. Elle n'a **pas** été déployée sans arbitrage.

## C — Trois états publics

- `verified` / `partial` / `blocked` sont matérialisés pour les frais (registre et contraintes SQL) et dans le contrat `publicQuality` de la PR #391.
- Ils ne sont pas encore raccordés à l'affichage.
- Les 1 065 certifications sans preuve de champ, les 147 rejets et les 47 TOF invalides n'ont pas été retraités ; aucune promotion automatique n'a été faite.

## D — Industrialisation 225

- La découverte documentaire est réutilisable pour toute SCPI ajoutée au manifeste.
- **Capacité mesurée** : 69 SCPI relevées en 2 min 57 s (8 en parallèle), avec 75 % de DIC et 67 % de notes trouvés automatiquement.
- **Capacité d'intégration de nouvelles SCPI publiées par jour ouvré : non mesurée** (aucune admission exécutée).

## Production

- Les fiches et le comparateur fusionnent `scpi_indicators` au chargement : les nouveaux frais sont lus en direct.
- Les pages HTML statiques pré-générées ne seront à jour qu'après le prochain build Netlify.
- Les contrôles post-publication sont consignés dans `tasks/backlog.md`.
