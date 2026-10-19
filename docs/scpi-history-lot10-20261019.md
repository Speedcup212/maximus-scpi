# Lot historique SCPI n°2 — 10 fonds (19/10/2026)

## Mission

Réutiliser l'unique chaîne CORUM : identité du fonds → clôtures officielles → années et valeurs de la colonne → preuve PDF et page → Supabase existant → tests d'intégration analyse/trajectoire/comparateur → publication unique Netlify du lot terminé. **Aucun `PASS_100` global** ne peut résulter du seul historique financier.

## Liste et état de départ (après rectification des périodes)

| Ordre | SCPI | Années civiles attendues 2025 inclus | Années avec 3 séries certifiées | Blocages immédiats |
|---|---|---:|---:|---|
| 1 | Iroko Atlas | 1 (2025) | **1** | Périmètre officiellement corrigé. Complétude des trois séries seulement |
| 2 | Remake UK 2025 | 1 (2025) | 1 | Contrôler les dates effectives 31/12 des valorisations ; premier millésime à capital fixe ; lancement 2025 provisoire |
| 3 | Transitions Europe | 3 (2023–2025) | 2 | Constitué 2022, **deux exercices distincts clos 31/03/2023 et 31/12/2023** : le modèle une ligne / année ne décrit pas les deux clôtures |
| 4 | Comète | 3 (2023–2025) | 0 | 3 rapports, métriques partielles ; année de lancement à certifier |
| 5 | Cœur d'Europe | 5 (2021–2025) | 1 | 5 rapports, absence distribution annuelle sur certains exercices |
| 6 | Épargne Pierre Europe | 4 (2022–2025) | 0 | 4 rapports, recoupement distribution brute / valeurs par part |
| 7 | Iroko Zen | 6 (2020–2025) | 2 | 4 premières années sans valorisations annuelles validées dans la table |
| 8 | Remake Live | 4 (2022–2025) | 0 | Rapports réutilisés sur plusieurs années, pages et valeurs à rapprocher |
| 9 | Activimmo | 7 (2019–2025) | 0 | 7 rapports, distributions manquantes sur 2021–2022, vérifier zéro 2019 |
| 10 | Novaxia NEO | 7 (2019–2025) | 1 | 7 rapports, source primaire pour les PDF hébergés par un tiers, recoupement complet |
| **Total** | **10 fonds** | **41 lignes annuelles civiles** | **8 complètes** | **82 indicateurs annuels manquants ou non vérifiés** sur 123 attendus |

Attention : les **41 lignes civiles ne sont pas équivalentes à 41 exercices sociaux** ; Transitions Europe clôt deux exercices en 2023. Il faut conserver les dates exactes dans le modèle de preuve avant la certification de ce fonds. Les statuts `extracted` dans `scpi_annual_backfill_queue` ne valent pas certification ; seule `scpi_history_year_audit_v1` est un contrôle financier.

## Corrections déjà opérées dans Supabase

- **Iroko Atlas :** l'année de lancement 2024 enregistrée à tort devient **2025** (source officielle Iroko, lancement le 16 septembre 2025). Premier exercice 2025, 1/1 année complète et `CORE_HISTORY_VERIFIED` sur les trois séries. Aucun exercice 2024 artificiel.
- **Transitions Europe :** création juridique le 16/11/2022, premier exercice social clos le 31/03/2023 (16/11/2022–31/03/2023), second exercice du 01/04/2023 au 31/12/2023. `first_fiscal_year=2023`, trois années civiles attendues, 2/3 documentées avec trois séries. **La certification complète reste bloquée** tant que les deux clôtures 2023 ne sont pas représentées correctement.
- SQL transactionnel et contrôles après correction : `scripts/scpi-history/batch10-correct-start-years-20261019.sql`.
- Iroko Atlas `Année de création` synchronisée à 2025 dans `src/data/scpi_complet.json`. Une PR et un build de production ultérieurs sont requis pour que le public voie cette correction.

## Définition de terminé

- Pour chaque fonds : date de création, lancement et clôtures documentées, 3 mesures annuelles chaque clôture, PDF+page+définition, exceptions explicites et absence de valeurs fabriquées.
- Distribution brute versus dividende comptable clairement séparés ; valeurs de réalisation/reconstitution à leur **date exacte**, pas forcées sur T2 2026.
- Le catalogue doit alimenter une seule fois tous les outils (fiche, comparaison, analyse, trajectoire et espace client) sans agents ou bases parallèles.
- La publication ne se fait **qu'une fois** par lot cohérent, après preview Netlify et contrôle de production.
- Les autres indicateurs (TOF, dette, frais, retrait, WALT/WALB, liquidité) restent leur propre volet de certification avant `PASS_100` global.

## Documents officiels déjà identifiés

- Iroko Atlas : https://www.iroko.eu/blog/scpi-internationale ; https://iroko-documents.s3.eu-west-3.amazonaws.com/Iroko_Atlas_rapport_annuel_2025.pdf
- Transitions Europe premier exercice : https://www.arkea-reim.com/upload/docs/application/pdf/2023-05/arkea_reim_ra_transition_europe.pdf
- Transitions Europe deuxième exercice : https://www.arkea-reim.com/upload/docs/application/pdf/2025-05/ra_2023_te.pdf
- Remake UK 2025 : https://www.remake.fr/telecharger/remake-uk-2025/note-d-information/53

**Ne pas recréer de file globale depuis 2018** : les enregistrements historiques courants restent les sources de travail. Les rapports déjà sourcés doivent être exploités par année/colonne avant de télécharger de nouveaux fichiers.
