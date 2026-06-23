# Rapport de correction Placeholders MaximusSCPI

Date: 21 juin 2026
Build: OK (Puppeteer KO local faute Chrome)

## 1. Fichiers modifies

- src/data/articleTemplatesConfig.ts : indexable field + 33 templates indexable:false + IDs 136/137 renamed 142/143
- scripts/generateArticleStaticPages.js : extraction + filtre indexable
- scripts/generateSitemapFromDB.ts : filtre indexable sur articleTemplates

## 2. Placeholders neutralises: 33

21 gestionnaires vides (meta "a verifier")
12 conflits mot-cle (v2 template vs v1 TSX premium)

## 3. IDs dupliques corriges: 2

ID136 2eme -> 142 (scpi-expatrie-fiscalite)
ID137 2eme -> 143 (declaration-revenus-scpi-erreurs)

## 4. Conflits resolus: 12

v2 marques indexable:false, v1 premium TSX conserves

## 5. Statut rendement-scpi-2025-tdvm-taux-distribution

TSX 1071L OK
Sitemap OK
Template ID23 non marque indexable:false
Pb: Puppeteer skip CI Netlify

## 6. Build results

Sitemap: 110 slugs articles (vs 143 avant)
Articles generes: 110, ignores: 33
Placeholders absents sitemap: confirme

## 7. Risques residuels

- Puppeteer CI skip (Eleve)
- Routes v2 SPA accessibles (Moyen)
- 11 TSX template 387L a enrichir (Faible)
