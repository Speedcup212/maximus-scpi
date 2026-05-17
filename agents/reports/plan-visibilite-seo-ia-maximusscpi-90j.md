# Plan de visibilité SEO & IA — MaximusSCPI — 90 jours

**Date :** 17 mai 2026  
**Agent :** 01 — SEO / AEO / IA (+ validation 04 — Conformité CIF)  
**Statut :** Plan d'action — à prioriser session par session  
**Périmètre :** Rapport complémentaire au diagnostic architecture agents (17/05/2026)

---

## 1. Diagnostic brutal de la visibilité actuelle probable

### Ce qu'on sait avec certitude
- Le site dispose de **pages thématiques sectorielles** (`/scpi-bureaux/`, `/scpi-commerces/`, `/scpi-sante/`, `/scpi-france/`, `/scpi-europeennes/`) — canonicalisées et déduplication en cours (TASK-002C).
- Des **pages piliers existantes** : `/fiscalite-scpi/`, `/rendement-scpi/`, `/investir-en-scpi/`, `/acheter-scpi/`, `/comparateur-scpi/`.
- Une **section éducation** avec des articles satellites (`/education/...`).
- Un **comparateur SCPI** interactif — fort potentiel transactionnel.
- Les **corrections CIF** (TASK-002C) ont assaini les pages sectorielles de leurs promesses de rendement non conformes, ce qui était un frein SEO indirect (risque de pénalité editoriale + crédibilité E-E-A-T faible).

### Ce qu'on ne sait pas encore (à mesurer)
- Positions réelles sur les requêtes prioritaires.
- Taux de couverture des entités SCPI dans les LLM (ChatGPT, Perplexity, Claude, Gemini).
- Profil de liens entrants (domaines référents, autorité de domaine).
- Taux d'exploration Googlebot des pages SSG vs SPA.

### Hypothèses de diagnostic
Sans accès GSC/Analytics, les signaux structurels indiquent :
- **Visibilité Google** : probablement faible à moyenne sur les requêtes informelles courtes ("SCPI", "investir en SCPI") mais meilleure sur les requêtes longue traîne ("fiscalité SCPI assurance-vie", "SCPI pour diversifier patrimoine").
- **Visibilité IA** : probablement nulle ou marginale — les LLM citent rarement des sites spécialisés SCPI français hormis les grandes banques et les sites de gestion.
- **Autorité thématique** : en construction — le maillage interne et les cocons sémantiques ne semblent pas encore formalisés.

---

## 2. Ce qui existe déjà dans les agents SEO

L'Agent 01 (`01-seo-maximusscpi.md`) couvre :
- Recherche de mots-clés, structure des contenus, plans d'articles, cocons sémantiques, FAQ.
- Briefs éditoriaux, titres, méta-descriptions.
- Analyse de la concurrence éditoriale.
- Livrables : plans de mots-clés, briefs, métas, audits SEO éditoriaux, recommandations de maillage.

Le template `seo-task.md` fournit un cycle de travail en 3 étapes : diagnostic → livrable → conformité.

**Ce qui manque dans l'Agent 01 :**
- Aucune mention de l'AEO (Answer Engine Optimization) ni de la visibilité dans les LLM.
- Pas de protocole pour structurer les contenus en vue d'une citation par ChatGPT/Perplexity.
- Pas de stratégie de données structurées (schema.org FAQPage, Article, FinancialProduct).
- Pas de protocole de mesure de la visibilité IA (prompt monitoring, brand mentions dans les LLM).

Ce manque est adressé dans le prompt en cours de rédaction : `agents/prompts/agent-01-visibilite-ia-seo-aeo.md`.

---

## 3. Ce que TASK-002C a déjà traité

TASK-002C a résolu la **cannibalisation SEO sectorielle** :
- 5 paires de doublons supprimées (redirections 301 en place).
- Slugs canoniques définis : `/scpi-bureaux/`, `/scpi-commerces/`, `/scpi-sante/`, `/scpi-france/`, `/scpi-europeennes/`.
- Corrections CIF sur les pages sectorielles : suppression des rendements non sourcés, reformulation des titres et labelText, FAQ mis en conformité.
- Routes SPA obsolètes supprimées.

**Ce que TASK-002C n'a pas traité :**
- Maillage interne entre les pages sectorielles et les pages piliers.
- Optimisation des balises méta des pages sectorielles pour les requêtes cibles.
- Données structurées (schema.org) sur ces pages.
- Contenus IA-friendly (FAQ structurées, réponses directes, entités nommées).

---

## 4. Ce qui reste à traiter pour la visibilité IA

La visibilité dans les moteurs IA (ChatGPT, Perplexity, Claude, Gemini, Google AI Overviews) repose sur des mécanismes distincts du SEO classique :

| Levier | Action requise | Statut |
|--------|---------------|--------|
| Réponses directes (AEO) | Restructurer les contenus avec des blocs FAQ, définitions, réponses courtes | À faire |
| Données structurées | Ajouter schema.org FAQPage, Article, BreadcrumbList, FinancialProduct | Partiel |
| Autorité E-E-A-T | Mentionner l'expertise ORIAS/CIF, les auteurs, les sources | À renforcer |
| Entités nommées | Citer les sociétés de gestion, les régulateurs (AMF, ASPIM), les termes sectoriels | À faire |
| Fraîcheur du contenu | Mettre à jour les dates, intégrer les données 2026 | À faire |
| Couverture thématique | Couvrir toutes les sous-questions liées à une requête principale | À formaliser |
| Brand mentions | Être cité dans des contenus tiers (presse spécialisée, forums, comparateurs) | Long terme |

---

## 5. Différence entre SEO Google classique et visibilité IA

| Critère | SEO Google classique | Visibilité IA (AEO/GEO) |
|---------|---------------------|------------------------|
| Objectif | Apparaître en première page | Être cité dans la réponse synthétique |
| Signal principal | Backlinks + pertinence sémantique | E-E-A-T + structure des réponses + données structurées |
| Format de contenu | Article long, optimisé H2/H3 | Réponses directes, FAQ, définitions courtes |
| Métriques | CTR, positions, impressions | Brand mentions dans LLM, citations dans AI Overviews |
| Délai d'effet | 3 à 6 mois | 6 à 12 mois (indexation dans les corpus LLM) |
| Outils de mesure | GSC, Semrush, Ahrefs | Perplexity monitoring, prompts tests manuels, Brand24 |
| Contrainte SCPI | Mentions légales dans les métadonnées | Mentions légales dans les blocs de réponse directe |

**Positionnement recommandé pour MaximusSCPI :** viser d'abord le SEO Google (ROI plus rapide) tout en structurant les contenus pour l'IA dès maintenant (investissement durable).

---

## 6. Requêtes prioritaires SCPI à cibler

Classement par volume estimé et faisabilité positionnement :

### Requêtes HEAD (volume fort, concurrence forte)
- `SCPI` — trop générique, cible secondaire
- `investir en SCPI` — page pilier `/investir-en-scpi/`
- `SCPI rendement` — page pilier `/rendement-scpi/`
- `SCPI fiscalité` — page pilier `/fiscalite-scpi/`
- `comparateur SCPI` — page outil `/comparateur-scpi/`

### Requêtes MIDDLE (volume moyen, concurrence moyenne — priorité 1)
- `comment investir en SCPI`
- `SCPI en assurance-vie`
- `SCPI ou immobilier locatif`
- `SCPI européennes fiscalité`
- `rendement SCPI 2026`
- `acheter des parts de SCPI`
- `SCPI et PER`

### Requêtes LONGUE TRAÎNE (volume faible, concurrence faible — positionnement rapide)
- `fiscalité SCPI prélèvements sociaux`
- `SCPI nue-propriété avantages`
- `SCPI en SCI IS`
- `SCPI démembrement temporaire`
- `meilleure SCPI européenne sans impôt français`
- `SCPI bureaux risques 2026`
- `comment choisir ses SCPI pour la retraite`

---

## 7. Requêtes informationnelles à forte intention

Ces requêtes indiquent une intention de comprendre avant d'acheter — fort potentiel de capture en haut de funnel :

| Requête | Page cible recommandée | Priorité |
|---------|----------------------|----------|
| `qu'est-ce qu'une SCPI` | `/investir-en-scpi/` ou article éducation | Haute |
| `comment fonctionne une SCPI` | Article éducation pilier | Haute |
| `SCPI risques` | Section vigilance dans pages piliers | Haute |
| `différence SCPI et OPCI` | Article comparatif éducation | Moyenne |
| `SCPI rendement net après impôt` | `/fiscalite-scpi/` + simulateur | Haute |
| `SCPI ou assurance-vie` | Article éducation + CTA comparateur | Haute |
| `SCPI pour débutant` | Article éducation existant à renforcer | Moyenne |
| `délai de jouissance SCPI` | Glossaire ou article éducation | Moyenne |
| `TOF SCPI signification` | Glossaire ou article éducation | Faible |

---

## 8. Requêtes transactionnelles à forte valeur

Ces requêtes indiquent une intention d'achat ou de prise de contact — fort potentiel de conversion :

| Requête | Page cible | CTA recommandé |
|---------|-----------|---------------|
| `acheter SCPI en ligne` | `/acheter-scpi/` | RDV + comparateur |
| `comparateur SCPI 2026` | `/comparateur-scpi/` | Comparateur interactif |
| `SCPI avec conseil` | Landing page CIF / RDV | Formulaire RDV |
| `SCPI patrimoniale conseil` | `/investir-en-scpi/` | RDV conseiller |
| `simulateur SCPI rendement net` | `/simulateurs/` | Simulateur + RDV |
| `SCPI sans frais de souscription` | Article comparatif + comparateur | Comparateur |
| `souscrire SCPI européenne` | Pages sectorielles `/scpi-europeennes/` | RDV |

---

## 9. Architecture de cocon sémantique recommandée

```
MaximusSCPI — Cocon sémantique SCPI
│
├── PILIER 1 : Comprendre les SCPI
│   ├── Qu'est-ce qu'une SCPI ? (définition, fonctionnement)
│   ├── Types de SCPI (rendement, capitalisation, fiscales)
│   ├── SCPI vs immobilier locatif direct
│   ├── SCPI vs OPCI vs SCI
│   └── Glossaire SCPI (TOF, DIC, délai de jouissance, etc.)
│
├── PILIER 2 : Investir en SCPI → /investir-en-scpi/
│   ├── Comment acheter des parts de SCPI
│   ├── SCPI en direct vs assurance-vie vs PER
│   ├── SCPI en démembrement (nue-propriété / usufruit)
│   ├── SCPI en SCI IS
│   └── SCPI pour débutant (guide pas à pas)
│
├── PILIER 3 : Fiscalité SCPI → /fiscalite-scpi/
│   ├── Revenus fonciers et prélèvements sociaux
│   ├── SCPI européennes : fiscalité allégée
│   ├── SCPI en assurance-vie : avantages fiscaux
│   ├── SCPI et PER : déduction fiscale
│   └── SCPI en démembrement : optimisation fiscale
│
├── PILIER 4 : Rendement SCPI → /rendement-scpi/
│   ├── Comment calculer le rendement net
│   ├── Taux de distribution 2025 : analyse sectorielle
│   ├── SCPI européennes : rendements et fiscalité
│   ├── Risques de perte en capital
│   └── Performances passées : limites d'interprétation
│
├── PILIER 5 : Choisir ses SCPI → /comparateur-scpi/
│   ├── Critères de sélection d'une SCPI
│   ├── SCPI bureaux : analyse et points de vigilance
│   ├── SCPI commerces : analyse et points de vigilance
│   ├── SCPI santé : analyse et points de vigilance
│   ├── SCPI diversifiées : analyse et points de vigilance
│   └── SCPI européennes : analyse et points de vigilance
│
└── PILIER 6 : Prise de décision patrimoniale
    ├── SCPI et stratégie patrimoniale globale
    ├── SCPI pour la retraite
    ├── SCPI pour les jeunes actifs
    ├── SCPI et transmission
    └── Simulateurs (revenus nets, crédit, démembrement)
```

---

## 10. Pages piliers prioritaires

| URL | Statut estimé | Action prioritaire |
|-----|--------------|-------------------|
| `/fiscalite-scpi/` | Existante — en cours d'optimisation | Données structurées FAQPage + maillage vers articles satellites |
| `/rendement-scpi/` | Existante | Audit méta + FAQ structurée + maillage |
| `/investir-en-scpi/` | Existante | Audit méta + plan de mots-clés complet |
| `/acheter-scpi/` | Existante | CTA renforcé + maillage vers comparateur |
| `/comparateur-scpi/` | Existante (outil interactif) | Schema FinancialProduct + FAQ |
| `/scpi-europeennes/` | Existante (post TASK-002C) | Contenu éditorial à enrichir |

---

## 11. Articles satellites prioritaires

À créer ou renforcer dans `/education/` :

| Titre cible | Requête principale | Pilier parent |
|-------------|-------------------|---------------|
| SCPI en assurance-vie : avantages fiscaux et sélection | `SCPI assurance-vie` | Fiscalité + Investir |
| SCPI et PER : comment déduire ses versements | `SCPI PER retraite` | Fiscalité |
| Nue-propriété SCPI : optimisation fiscale et patrimoniale | `SCPI démembrement` | Fiscalité + Investir |
| Comment calculer le rendement net d'une SCPI | `rendement net SCPI` | Rendement |
| SCPI européennes : fiscalité et liste 2026 | `SCPI européennes` | Rendement + Fiscalité |
| SCPI pour la retraite : stratégie et sélection | `SCPI retraite` | Choisir |
| SCPI pour jeune actif : comment démarrer | `SCPI jeune actif` | Investir |
| SCPI bureaux 2026 : analyse marché et points de vigilance | `SCPI bureaux 2026` | Choisir |
| Différence SCPI et OPCI : lequel choisir | `SCPI OPCI` | Comprendre |
| Glossaire SCPI : les 20 termes essentiels | `glossaire SCPI` | Comprendre |

---

## 12. Pages comparatives prioritaires

Ces pages capturent les requêtes transactionnelles comparatives — fort potentiel de conversion :

| Titre | Requête cible | CTA |
|-------|--------------|-----|
| SCPI direct vs assurance-vie : comparatif complet | `SCPI direct assurance-vie` | RDV + simulateur |
| SCPI vs immobilier locatif : analyse patrimoniale | `SCPI ou immobilier locatif` | RDV |
| SCPI bureaux vs SCPI commerces vs SCPI diversifiées | `choisir type SCPI` | Comparateur |
| SCPI françaises vs SCPI européennes : fiscalité comparée | `SCPI européennes vs françaises` | Comparateur + RDV |
| Nue-propriété vs pleine propriété SCPI | `nue-propriété SCPI` | Simulateur démembrement |

---

## 13. Contenus IA-friendly à produire

Pour être cité dans les réponses des LLM (ChatGPT, Perplexity, Gemini, Claude), le contenu doit respecter ces formats :

### Format 1 — Définition directe
```
Structure : [Terme] est/désigne [définition en 1-2 phrases]. [Contexte SCPI]. [Risque ou nuance].
Exemple : "Le taux de distribution d'une SCPI est le rapport entre les dividendes versés 
et le prix de part. C'est une donnée historique, non garantie pour les années futures."
```

### Format 2 — Réponse directe à une question
```
Structure : [Reformulation de la question]. [Réponse directe en 1 phrase]. 
[Développement en 2-3 points]. [Mention de risque ou de limite].
Exemple pour "SCPI ou immobilier locatif ?" : réponse directe + 3 critères + disclaimer.
```

### Format 3 — FAQ structurée (schema.org FAQPage)
Chaque page pilier doit comporter 5 à 10 questions/réponses intégrées en schema.org.  
Les réponses doivent être concises (2-4 phrases), sourcées si elles contiennent des chiffres.

### Format 4 — Données structurées entités
Citer systématiquement : AMF, ASPIM, sociétés de gestion (Corum, Iroko, Perial, etc.), ORIAS.  
Ces entités nommées augmentent la probabilité d'indexation dans les corpus LLM.

### Format 5 — Mise à jour datée
Indiquer la date de dernière mise à jour sur chaque page (déjà en place sur `/fiscalite-scpi/`).  
Les LLM favorisent les contenus récents et datés.

---

## 14. Stratégie de maillage interne

### Principe directeur
Chaque article satellite doit pointer vers le pilier parent + 2 articles satellites connexes.  
Chaque pilier doit pointer vers le comparateur et une page de prise de RDV.

### Maillage prioritaire à créer

| Page source | Lien vers | Ancre recommandée |
|------------|-----------|------------------|
| `/fiscalite-scpi/` | `/education/scpi-direct-ou-assurance-vie` | "fiscalité SCPI en assurance-vie" |
| `/fiscalite-scpi/` | `/education/per-scpi-retraite-deduction-fiscale` | "déduction fiscale via le PER" |
| `/fiscalite-scpi/` | `/education/demembrement-scpi-nue-propriete-usufruit` | "démembrement et optimisation fiscale" |
| `/rendement-scpi/` | `/comparateur-scpi/` | "comparer les SCPI par rendement" |
| `/scpi-europeennes/` | `/fiscalite-scpi/` | "fiscalité allégée des SCPI européennes" |
| `/scpi-bureaux/` | `/rendement-scpi/` | "rendements historiques SCPI bureaux" |
| Articles éducation | `/comparateur-scpi/` | "comparer les SCPI" |
| Articles éducation | RDV / formulaire | "analyser votre situation" |

### Règle de conformité sur les ancres
Les ancres de liens ne doivent pas contenir de promesse de rendement.  
❌ "SCPI qui rapportent le plus"  
✅ "comparer les données historiques des SCPI"

---

## 15. Stratégie d'autorité thématique

### E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

**Actions à fort impact :**

1. **Mentionner l'ORIAS** sur chaque page de prise de contact et en pied de page — signal de fiabilité pour Google et les LLM.
2. **Citer les sources réglementaires** dans les articles (AMF, ASPIM, DIC, notes d'information) — renforce l'autorité thématique.
3. **Créer une page "Méthodologie"** expliquant comment les données SCPI sont vérifiées — signal E-E-A-T fort.
4. **Créer une page "À propos"** avec le profil de l'équipe, les qualifications, le numéro ORIAS — requis pour les requêtes YMYL (Your Money Your Life).
5. **Obtenir des mentions externes** dans des médias financiers spécialisés (Patrimoine 24, BFM Business, L'Express, Les Échos) — backlinks + indexation LLM.
6. **Structurer les données auteurs** (schema.org Person) sur les articles — signal E-E-A-T pour Google.

---

## 16. Règles de conformité CIF à respecter

Ces règles s'appliquent à **tous** les contenus SEO et IA produits (issu de l'Agent 04) :

| Règle | Application SEO / IA |
|-------|---------------------|
| Pas de promesse de rendement | Titres, métas, ancres de liens, FAQ, snippets IA — aucun chiffre de rendement sans disclaimer |
| Performances passées non garanties | Mention obligatoire dans tout contenu citant un taux de distribution |
| Distinction info / pédagogie / conseil | Les articles éducatifs ne sont pas des recommandations personnalisées — le préciser |
| Risques SCPI | Citer les 4 risques principaux (perte en capital, revenus non garantis, liquidité, fiscalité) dans les pages à fort trafic |
| Sources citées | Tout chiffre doit être sourcé (DIC, bulletin, ASPIM) — sans source = retirer le chiffre |
| Pas de SCPI "meilleure" sans réserve | Formulations comparatives toujours assorties de nuances et du profil investisseur |
| Recueil d'informations avant conseil | Les CTA vers RDV doivent préciser "après recueil de votre situation patrimoniale" |

**Formule de disclaimer minimale pour contenus SEO :**
> "Les informations présentées sont de nature pédagogique et ne constituent pas un conseil en investissement personnalisé. Les performances passées ne préjugent pas des performances futures. Investir en SCPI comporte des risques, dont la perte en capital."

---

## 17. Opportunités de conversion vers lead

### Funnel recommandé

```
Requête Google / LLM
        ↓
Page pilier ou article éducation (découverte)
        ↓
CTA contextuel (simulateur, comparateur, guide PDF)
        ↓
Page comparateur / simulateur (qualification)
        ↓
CTA fort : "Analyser votre situation" → formulaire RDV
        ↓
RDV conseiller (lead qualifié)
```

### Points de conversion à renforcer

| Page | CTA actuel probable | CTA recommandé |
|------|--------------------|--------------| 
| `/fiscalite-scpi/` | RDV + comparateur | Ajouter CTA "Simuler mon rendement net" → simulateur impact fiscal |
| `/rendement-scpi/` | À vérifier | CTA "Comparer les rendements historiques" → comparateur |
| Articles éducation | Liens internes | CTA contextuel à chaque section + CTA final RDV |
| `/scpi-europeennes/` | À vérifier | CTA "Découvrir les SCPI européennes disponibles" → comparateur |
| Pages sectorielles | RDV (post TASK-002C) | Ajouter un simulateur d'impact fiscal sectoriel |

---

## 18. Plan d'action 30 / 60 / 90 jours

### J+30 — Fondations SEO
**Objectif : nettoyer, structurer, prioriser**

- [ ] Audit méta-descriptions et titres des 6 pages piliers (Agent 01)
- [ ] FAQ structurée schema.org sur `/fiscalite-scpi/` (Agent 01 + validation 04)
- [ ] Maillage interne : 10 liens prioritaires (cf. section 14)
- [ ] Page "À propos" avec mentions ORIAS et qualifications (hors scope code — brief à produire)
- [ ] Plan de mots-clés complet sur les 6 piliers (Agent 01)
- [ ] Vérification post-build TASK-002C : redirections 301, pages SSG générées

### J+60 — Contenus et satellites
**Objectif : couvrir la longue traîne et renforcer les piliers**

- [ ] Rédiger 3 articles satellites prioritaires (SCPI assurance-vie, rendement net, SCPI européennes 2026) — Agent 01
- [ ] Créer 2 pages comparatives (SCPI direct vs AV, SCPI bureaux vs diversifiées) — Agent 01
- [ ] Validation conformité CIF de tous les contenus produits — Agent 04
- [ ] Implémenter FAQ schema.org sur les pages sectorielles
- [ ] Compléter le prompt `agent-01-visibilite-ia-seo-aeo.md` avec la stratégie AEO/GEO complète
- [ ] Tester la présence de MaximusSCPI dans Perplexity, ChatGPT, Gemini (prompts de test)

### J+90 — Visibilité IA et autorité
**Objectif : devenir une référence citée par les LLM sur la thématique SCPI française**

- [ ] Rédiger 5 contenus IA-friendly au format "réponse directe" sur les requêtes prioritaires
- [ ] Publier un guide complet "Tout comprendre sur les SCPI" (pilier ultime, 3000+ mots)
- [ ] Obtenir 3 mentions externes dans des médias financiers — brief à produire pour Agent 01
- [ ] Glossaire SCPI complet (20 termes) avec schema.org DefinedTerm
- [ ] Rapport de mesure : positions GSC, brand mentions LLM, conversions RDV

---

## 19. KPI à suivre

### SEO Google
| KPI | Outil | Fréquence |
|-----|-------|-----------|
| Positions sur les 20 requêtes prioritaires | GSC / Semrush | Mensuelle |
| Impressions et CTR par page pilier | GSC | Mensuelle |
| Pages indexées vs crawlées | GSC Coverage | Mensuelle |
| Backlinks domaines référents | Ahrefs / Semrush | Trimestrielle |

### Visibilité IA
| KPI | Méthode | Fréquence |
|-----|---------|-----------|
| Mentions dans les réponses Perplexity | Tests manuels (10 prompts cibles) | Mensuelle |
| Apparitions dans ChatGPT / Claude | Tests manuels | Mensuelle |
| Présence en AI Overviews Google | GSC + tests manuels | Mensuelle |

### Conversion
| KPI | Mesure | Fréquence |
|-----|--------|-----------|
| RDV pris via les pages SEO | CRM / analytics | Hebdomadaire |
| Taux de clic sur les CTA RDV | Analytics | Mensuelle |
| Taux de complétion simulateurs | Analytics | Mensuelle |

---

## 20. Prochaine action concrète recommandée

**Action immédiate (cette semaine) :**

```
AGENT ACTIVÉ : 01 — SEO
MISSION : Audit méta et FAQ structurée — page /fiscalite-scpi/
TEMPLATE : agents/templates/seo-task.md
PÉRIMÈTRE : Lecture /src/components/FiscaliteScpiPage.tsx + production de brief
VALIDATION REQUISE AVANT MODIFICATION : oui — attendre VALIDÉ POUR MODIFICATION DU SITE
```

Cette page est la plus avancée en termes de contenu (travail récent), dispose d'un bon potentiel de positionnement sur "fiscalité SCPI" et de ses dérivés, et est la plus susceptible de générer des leads qualifiés (intention de compréhension avant investissement).

**Livrables attendus de cette première action :**
1. Titre SEO optimisé + méta-description (Agent 01)
2. 5 questions FAQ au format schema.org (Agent 01)
3. Validation conformité CIF des formulations (Agent 04)
4. Recommandation de maillage interne depuis cette page (Agent 01)

---

*Rapport produit par Agent 00 — Superviseur, sur la base des fichiers `/agents`. Aucun fichier hors de `/agents` n'a été modifié.*
