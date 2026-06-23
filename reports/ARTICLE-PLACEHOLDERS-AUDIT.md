# Audit des articles placeholder MaximusSCPI

> **Date :** 21 juin 2026  
> **Périmètre :** `articleTemplatesConfig.ts`, composants TSX d'articles, scripts de build, `dist/articles/`, sitemap  
> **Méthode :** analyse statique, aucune modification de code

---

## 1. Résumé exécutif

| Indicateur | Valeur |
|---|---|
| Templates config (`articleTemplatesConfig.ts`) | **141** (IDs 1-141, avec doublons ID 136/137) |
| Composants TSX d'articles concrets | **30** |
| Articles en `dist/articles/` | **143** sous-répertoires, tous avec `index.html` |
| URLs articles dans le sitemap | **166** |
| Scripts de génération | **3** actifs (static pages, TSX Puppeteer, rich content) + **6** générateurs de composants |

| Classification | Nombre | % |
|---|---|---|
| **Articles premium confirmés** | 19 (TSX) + ~50 (templates bien structurés) = **~70** | ~50% |
| **Placeholders probables** | 11 (TSX ~387 lignes générées) + 22 (templates gestionnaires génériques) = **~33** | ~24% |
| **Conflits de source** | **12** groupes de mots-clés dupliqués (24 templates) + 2 IDs dupliqués + 4 slugs en conflit TSX/template | — |
| **Articles à vérifier manuellement** | **~25** (templates fiscalité-modes, risques-vigilance : bonne structure mais contenu généré programmatiquement) | ~18% |

---

## 2. Articles premium confirmés

### 2a. Composants TSX richement rédigés (> 500 lignes, données chiffrées, SCPI nommées)

| Slug | Source | Type | Niveau de confiance | Remarque |
|---|---|---|---|---|
| `fonds-euros-ou-scpi` | `FondsEurosOuScpiArticlePage.tsx` (1011 lignes) | TSX | **Très élevé** | Tableaux comparatifs, calculs TMI, SCPI nommées (Comète, Remake, Iroko, Epura) |
| `fonds-euros-ou-scpi` | `FondsEurosScpiArticle.tsx` (466 lignes) | TSX | **Élevé** | Comparatifs détaillés, pourcentages précis, profils allocatifs |
| `scpi-tmi-30-pourcent-arbitrage-av-direct` | `ScpiTmi30PourcentArbitrageAvDirectArticle.tsx` (927 lignes) | TSX | **Très élevé** | Analyse fiscale TMI 30% exhaustive, 4 stratégies d'allocation, projections 10/15/20 ans |
| `ifi-scpi-impot-fortune-immobiliere-strategies` | `IfiScpiImpotFortuneImmobiliereStrategiesArticle.tsx` (854 lignes) | TSX | **Très élevé** | Barème IFI 2025, exemples calculs, stratégies réduction |
| `forte-imposition-tmi-41-scpi-assurance-vie` | `ForteImpositionTmi41ScpiAssuranceVieArticle.tsx` (690 lignes) | TSX | **Élevé** | Focus TMI 41%+, calculs comparatifs, enveloppes fiscales |
| `scpi-commerces-retail-e-commerce-opportunites` | `ScpiCommercesRetailECommerceOpportunitesArticle.tsx` (718 lignes) | TSX | **Élevé** | Capitalisation/TDVM/TOF, SCPI nommées, 7 critères |
| `scpi-bureaux-tertiaire-teletravail-2025` | `ScpiBureauxTertiaireTeletravail2025Article.tsx` (690 lignes) | TSX | **Élevé** | TDVM/TO/capitalisation, évolution TO 2019 vs 2025 |
| `rendement-scpi-2025-tdvm-taux-distribution` | `RendementScpi2025TdvmTauxDistributionArticle.tsx` (1071 lignes) | TSX | **Très élevé** | Explication TDVM/distribution, analyse par secteur, 3 scénarios TMI |
| `scpi-residentielles-logement-locatif-scpi-habitation` | `ScpiResidentiellesLogementLocatifScpiHabitationArticle.tsx` (761 lignes) | TSX | **Élevé** | SCPI nommées, capitalisation/TDVM/TOF, comparatif résidentiel vs tertiaire |
| `scpi-europeennes-avantages-ps-0-rendement` | `ScpiEuropeennesAvantagesPs0RendementArticle.tsx` (759 lignes) | TSX | **Très élevé** | PS 0%, rendements nets par TMI, top SCPI européennes |
| `scpi-sante-seniors-ehpad-cliniques-investissement` | `ScpiSanteSeniorsEhpadCliniquesInvestissementArticle.tsx` (757 lignes) | TSX | **Élevé** | Détail sectoriel santé, rendements TDVM |
| `demembrement-scpi-nue-propriete-usufruit` | `DemembrementScpiNueProprieteUsufruitArticle.tsx` (~958 lignes) | TSX | **Très élevé** | Analyse démembrement complète, badge "Stratégie Avancée" |
| `investir-scpi-jeune-actif-25-35-ans` | `InvestirScpiJeuneActif2535AnsArticle.tsx` (~921 lignes) | TSX | **Élevé** | Focus jeunes actifs, badge "Stratégie Long Terme" |
| `frais-scpi-souscription-gestion-performance` | `FraisScpiSouscriptionGestionPerformanceArticle.tsx` (~544 lignes) | TSX | **Très élevé** | "225 SCPI françaises... frais souscription 0% à 10,6%... gestion 1% à 15%" |
| `revendre-parts-scpi-delais-marche-secondaire` | `RevendrePartsScpiDelaisMarcheSecondaireArticle.tsx` (~546 lignes) | TSX | **Très élevé** | "63 SCPI analysées : 70,6% neutres... 25,5% perdent... Edissimo -53%" |
| `diversification-scpi-combien-nombre-parts` | `DiversificationScpiCombienNombrePartsArticle.tsx` (~850 lignes) | TSX | **Élevé** | "4 à 6 SCPI = réduction 70% risque concentration" |
| `scpi-direct-ou-assurance-vie` | `ScpiDirectOuAssuranceVie.tsx` (~834 lignes) | TSX | **Élevé** | Analyse CGP-CIF |
| `100000-euros-fonds-euros-cout-opportunite` | `100000EurosFondsEurosCoutOpportuniteArticle.tsx` (387 lignes) | TSX | **Élevé** | Montant 100k€, calculs TMI 11/30/41% sur 20 ans |

### 2b. Templates config bien structurés (IDs 1-36, première batch)

Les 36 premiers templates (IDs 1-36) sont bien structurés : titres précis, catégories variées, wordCountTarget >= 2400, intentions de recherche uniques.

---

## 3. Articles placeholder probables

### 3a. Composants TSX générés par template (~387 lignes)

| Slug | Problème identifié | Gravité |
|---|---|---|
| `scpi-ou-etf-immobilier-reit-comparatif` | Intro générique réutilisée, pas de données SCPI concrètes | **Élevée** |
| `achat-scpi-credit-effet-levier-fiscalite` | Intro template, pas de calcul d'effet de levier | **Élevée** |
| `succession-scpi-transmission-droits-heritage` | Intro copiée, pas d'exemples chiffrés | **Élevée** |
| `scpi-fiscales-malraux-deficit-foncier-2025` | Intro copiée, slug 2025 | **Élevée** |
| `premier-investissement-scpi-debutant-guide` | Intro copiée du template crédit | **Élevée** |
| `investir-200000-euros-scpi-portefeuille-diversifie` | Pas d'allocation concrète | **Élevée** |
| `sci-scpi-societe-civile-immobiliere-parts` | Intro copiée, pas de comparatif | **Élevée** |
| `per-scpi-retraite-deduction-fiscale` | Intro copiée, pas de barème | **Élevée** |
| `investir-scpi-tmi-11-pourcent-fiscalite-optimale` | Intro copiée, TMI 11% moins critique | **Moyenne** |
| `scpi-ou-opci-differences-avantages` | Intro identique à ScpiOuEtf | **Élevée** |
| `scpi-logistique-entrepots-e-commerce-2025` | Intro placeholder explicite | **Élevée** |

### 3b. Templates gestionnaires génériques (22 templates)

Titres du type "[Nom] : société de gestion immobilière" sans SCPI nommées. Meta: "SCPI associées à vérifier" ou "données à confirmer".

Slugs concernés : `aew`, `allianz-immovalor`, `axipit-real-estate-partners`, `darwin-invest`, `foncieres-et-territoires`, `groupama-gan-reim`, `mata-capital-im`, `mnk-partners`, `mysharecompany`, `telamon`, `unofi-gestion-dactifs`, `aroxys`, `bagan-asset-management`, `balzac-reim`, `clubfunding-am`, `elevation-capital-partners`, `hsbc-reim-france`, `midi-2i`, `ofi-invest-real-estate`, `otoktone-3i`, `advenis-reim`, `altixia-reim`

**Gravité : Critique** — contenu trop pauvre pour le SEO.

### 3c. Templates avec IDs dupliqués (136 et 137)

| ID | Slug 1 | Slug 2 | Problème | Gravité |
|---|---|---|---|---|
| 136 | `epsicap` | `scpi-expatrie-fiscalite` | `getTemplateById(136)` retourne mauvais slug | **Critique** |
| 137 | `theoreim` | `declaration-revenus-scpi-erreurs` | Même problème | **Critique** |

---

## 4. Conflits de source

### 4a. Mots-clés dupliqués (12 groupes, 24 templates)

| Mot-clé | v1 (riche) | v2 (template) |
|---|---|---|
| démembrement SCPI | ID 7 (strategies) | ID 37 (fiscalite-modes) |
| SCPI TMI 11 | ID 8 (fiscalite, TSX) | ID 39 (fiscalite-modes) |
| SCPI TMI 30 | ID 9 (fiscalite, 927L TSX) | ID 40 (fiscalite-modes) |
| SCPI TMI 41 | ID 10 (fiscalite, 690L TSX) | ID 58 (fiscalite-avancee) |
| SCPI européennes | ID 11 (guides, 759L TSX) | ID 36 (analyse-criteres) |
| SCPI santé | ID 13 (guides, 757L TSX) | ID 52 (secteurs-immo) |
| SCPI bureaux | ID 14 (guides, 690L TSX) | ID 54 (secteurs-immo) |
| SCPI logistique | ID 16 (guides) | ID 53 (secteurs-immo) |
| risques SCPI | ID 24 (guides, TSX) | ID 42 (risques-vigilance) |
| frais SCPI | ID 25 (guides, 544L TSX) | ID 41 (fiscalite-modes) |
| IFI SCPI | ID 20 (fiscalite, 854L TSX) | ID 65 (fiscalite-avancee) |
| SCPI à crédit | ID 6 (strategies) | ID 77 (strategies-patrimoniales) |

### 4b. Multi-sources critiques

| Slug | TSX Premium | Template | Supabase |
|---|---|---|---|
| `fonds-euros-ou-scpi` | OUI (1011L) | ID 1 | OUI |
| `scpi-tmi-30-pourcent-arbitrage-av-direct` | OUI (927L) | ID 9 + 40 | OUI |
| `forte-imposition-tmi-41-scpi-assurance-vie` | OUI (690L) | ID 10 + 58 | OUI |
| `rendement-scpi-2025-tdvm-taux-distribution` | OUI (1071L) | ID 23 | À vérifier |

---

## 5. Focus prioritaire : `rendement-scpi-2025-tdvm-taux-distribution`

| Check | Résultat |
|---|---|
| TSX | 1071 lignes, très riche |
| dist/index.html | Riche, capturé par Puppeteer |
| Routage | `articleViews` dispatch (legacy), pas `OptimizedArticlePage` |
| Routes | `/education/` + `/articles/` (2 routes, 1 composant) |
| Puppeteer CI | **SKIPPÉ** en Netlify → HTML doit être pré-généré et commité |
| Incohérence | Titre template "2026", H1 TSX "2025" |

---

## 6. Recommandations opérationnelles

### Lot A : Critique (immédiat)
1. Corriger IDs dupliqués 136/137
2. Désindexer 22 templates gestionnaires vides
3. Rediriger slugs v2 → v1
4. Corriger incohérence titre `rendement-scpi-2025`

### Lot B : Élevé (progressif)
5. Enrichir 11 TSX template (~387 lignes)
6. Migrer articles premium en Supabase
7. Vérifier ~25 templates batches intermédiaires
8. Commit HTML Puppeteer avant déploiement

### Lot C : Conserver
- 36 premiers templates
- 19 composants TSX premium
- Templates gestionnaires avec SCPI nommées

---

## 7. Plan d'action technique sans refonte

### Redirections v2 → v1 recommandées
- `/scpi-demembrement` → `/articles/demembrement-scpi-nue-propriete-usufruit`
- `/scpi-tmi-11` → `/articles/investir-scpi-tmi-11-pourcent-fiscalite-optimale`
- `/scpi-tmi-30` → `/articles/scpi-tmi-30-pourcent-arbitrage-av-direct`
- `/scpi-tmi-41` → `/articles/forte-imposition-tmi-41-scpi-assurance-vie`
- `/frais-scpi` → `/articles/frais-scpi-souscription-gestion-performance`
- `/risques-scpi` → `/articles/risques-scpi-vacance-locative-liquidite`
- `/scpi-ifi` → `/articles/ifi-scpi-impot-fortune-immobiliere-strategies`

### Principes
- Supabase HTML pour articles SEO standards
- TSX pour articles premium (ne pas remplacer par du template)
- `noindex` pour templates gestionnaires sans contenu réel
- Vérifier HTML source après chaque déploiement

---

## Annexes

### Lignes clés dans les fichiers

| Fichier | Lignes | Contenu |
|---|---|---|
| `articleTemplatesConfig.ts` | 1667-1715 | IDs dupliqués 136/137 |
| `App.tsx` | 2710-2743 | Bloc `dynamic-article` |
| `App.tsx` | 775-779 | Catch-all `articles/` |
| `OptimizedArticlePage.tsx` | 56-61 | Requête Supabase |
| `generateArticlesFromTSX.js` | 11-14 | Skip CI Netlify |
| `generateArticlesFromTSX.js` | 107 | Mapping rendement-scpi-2025 |

### Patterns d'introduction dupliqués (6 patterns, utilisés dans 11 fichiers TSX)

**Pattern 1 :** "comprendre ce sujet est essentiel pour tout investisseur en SCPI..." (5 fichiers)
**Pattern 2 :** "cette analyse vous permet de comprendre tous les enjeux..." (4 fichiers)
**Pattern 3 :** "En conclusion, [topic] nécessite une analyse approfondie..." (4 fichiers)
**Pattern 4 :** "cette stratégie peut transformer votre approche de l'investissement..." (4 fichiers)
**Pattern 5 :** "La fiscalité des SCPI est un élément déterminant..." (3 fichiers)
**Pattern 6 :** "En 2025, [topic] devient un sujet incontournable..." (2 fichiers)
