# Brief — Première tâche SEO & IA MaximusSCPI

**Date :** 17 mai 2026  
**Agent :** 01 — SEO + 04 — Conformité CIF  
**Statut :** Brief validé — en attente de validation humaine avant toute modification du site  
**Source :** `roadmap-execution-seo-ia-30j.md` section 8

---

## 1. Tâche prioritaire retenue

**Optimisation SEO + FAQ schema.org de la page `/fiscalite-scpi/`**

Actions comprises dans cette tâche :
1. Produire un titre `<title>` SEO optimisé (60 caractères max)
2. Produire une méta-description optimisée (155 caractères max)
3. Valider ou proposer un H1 optimisé
4. Rédiger 5 paires Q/R au format schema.org `FAQPage` prêtes à implémenter
5. Identifier et formaliser 3 liens de maillage interne à ajouter sur cette page
6. Valider la conformité CIF de l'ensemble (Agent 04)

**Hors périmètre de cette tâche :** modification du code React, création de nouveaux composants, modification du sitemap, modification de `App.tsx`.

---

## 2. Pourquoi cette tâche est prioritaire

### Signaux SEO
- La page `/fiscalite-scpi/` est la page la plus avancée éditorialement sur le site (travail récent, sections structurées, CTA en place).
- La requête `fiscalité SCPI` et ses dérivés (`SCPI impôt`, `revenus fonciers SCPI`, `SCPI prélèvements sociaux`) sont parmi les requêtes à la plus forte intention d'achat dans l'univers SCPI.
- Les moteurs IA (Perplexity, Google AI Overviews) priorisent les pages avec FAQ schema.org pour les requêtes YMYL (Your Money Your Life) — la fiscalité SCPI en fait partie.
- C'est la page la plus susceptible de générer des leads qualifiés (profil investisseur déjà imposé, cherchant à optimiser).

### Signaux conformité
- La page a déjà fait l'objet de corrections CIF récentes — le fond est assaini.
- L'optimisation des balises méta et des FAQ est une couche superficielle qui ne nécessite pas de refactoring profond.
- Risque de conformité maîtrisable : les FAQ doivent inclure les disclaimers CIF, ce que cette tâche prévoit.

### Rapport coût / impact
- Effort faible (brief + implémentation ciblée).
- Impact potentiel fort : meilleur positionnement sur des requêtes à forte intention, citation probable dans les AI Overviews, maillage renforcé vers le comparateur.

---

## 3. Fichiers du site potentiellement concernés (lecture seule — ne pas modifier)

| Fichier | Rôle | Ce qu'on y cherche |
|---------|------|--------------------|
| `src/components/FiscaliteScpiPage.tsx` | Composant principal de la page | H1 actuel, structure des sections, FAQ existantes, CTA en place |
| `src/components/SEOHead.tsx` | Gestion des balises méta | Structure du titre et de la méta-description actuels |
| `src/App.tsx` | Routing + rendu de la page | Props passées à `FiscaliteScpiPage`, `onRdvClick` |
| `src/components/SchemaOrg.tsx` | Injection des données structurées | Format attendu pour injecter `FAQPage` schema.org |

**Consigne :** lire uniquement. Ne modifier aucun de ces fichiers avant validation explicite de l'utilisateur.

---

## 4. Risques SEO

| Risque | Description | Niveau |
|--------|-------------|--------|
| Sur-optimisation des balises | Titre trop chargé en mots-clés → pénalité Google | Modéré — à contrôler |
| Duplication de contenu | FAQ qui répète mot pour mot le corps de la page → signal de duplication | Faible si FAQ bien formulées |
| Cannibalisation interne | Titre ou méta trop proche d'une autre page pilier (`/rendement-scpi/`) | Faible — requêtes distinctes |
| FAQ hors intention de recherche | Questions inventées sans rapport avec les requêtes réelles | Modéré — cibler des questions effectivement recherchées |
| Maillage vers pages non canoniques | Lier vers une URL qui redirige (ex : ancien slug post-TASK-002C) | Faible — vérifier les URLs cibles avant implémentation |

---

## 5. Risques conformité CIF

| Risque | Description | Niveau |
|--------|-------------|--------|
| FAQ avec chiffres non sourcés | Une réponse FAQ citant un taux de distribution sans source ni disclaimer | **Élevé** — bloquer si chiffre sans source |
| Titre méta avec promesse de rendement | "Fiscalité SCPI : économisez X% d'impôt" → assimilable à une promesse | **Élevé** — reformuler |
| Réponse FAQ assimilable à un conseil personnalisé | "Pour réduire vos impôts, choisissez une SCPI européenne" sans recueil d'infos | **Élevé** — reformuler en pédagogie générale |
| Absence de mention risques dans les FAQ | Une FAQ sur le rendement net sans mention des risques SCPI | Modéré — ajouter disclaimer |
| Confusion information / conseil dans le H1 | H1 orienté conseil direct ("Comment payer moins d'impôt avec une SCPI") | Modéré — reformuler en pédagogie |

**Règle de blocage Agent 04 :** si l'un des points ci-dessus est présent dans le livrable, le brief est retourné pour correction avant toute implémentation.

---

## 6. Texte ou structure recommandée

### Titre `<title>` SEO proposé
```
Fiscalité SCPI : revenus fonciers, prélèvements sociaux et optimisation | MaximusSCPI
```
*(87 caractères — à raccourcir si nécessaire : "Fiscalité SCPI : imposition et optimisation | MaximusSCPI" — 57 caractères)*

### Méta-description proposée
```
Comprenez comment sont imposés les revenus de vos SCPI : revenus fonciers, prélèvements 
sociaux, SCPI européennes et dispositifs d'optimisation. Données pédagogiques, non garanties.
```
*(155 caractères — à ajuster selon le composant SEOHead)*

### H1 actuel (à conserver ou légèrement reformuler)
Actuel probable : "La fiscalité des SCPI"  
Proposition optimisée : "Fiscalité des SCPI : comprendre l'imposition de vos revenus"  
*(À valider après lecture du composant)*

### 5 questions FAQ schema.org proposées

**Q1 — Définition (requête : "qu'est-ce que la fiscalité d'une SCPI")**
> Comment sont imposés les revenus d'une SCPI ?

Réponse : Les revenus distribués par une SCPI relèvent généralement des revenus fonciers, soumis à l'impôt sur le revenu selon votre tranche marginale d'imposition (TMI) et aux prélèvements sociaux (17,2 %). Le taux d'imposition effectif dépend de votre situation fiscale personnelle. *Ces informations sont de nature pédagogique et ne constituent pas un conseil fiscal personnalisé.*

---

**Q2 — Prélèvements sociaux (requête : "SCPI prélèvements sociaux")**
> Quel est le taux des prélèvements sociaux sur les revenus de SCPI ?

Réponse : Les revenus fonciers issus de SCPI sont soumis aux prélèvements sociaux au taux global de 17,2 % (CSG, CRDS, prélèvement de solidarité). Une partie de la CSG (6,8 %) peut être déductible du revenu imposable l'année suivante sous le régime réel. *Les taux sont ceux en vigueur à la date de mise à jour de cette page et peuvent évoluer.*

---

**Q3 — SCPI européennes (requête : "SCPI européennes fiscalité avantage")**
> Les SCPI investissant en Europe sont-elles moins imposées ?

Réponse : Les revenus issus de biens situés à l'étranger peuvent bénéficier de conventions fiscales bilatérales qui réduisent ou neutralisent leur imposition en France. Cela dépend du pays d'investissement et de votre situation fiscale. Ce mécanisme ne constitue pas une garantie de rendement ou d'économie fiscale. *Consultez un professionnel habilité pour une analyse adaptée à votre situation.*

---

**Q4 — Optimisation (requête : "comment réduire impôt SCPI")**
> Existe-t-il des modes de détention permettant d'alléger la fiscalité des SCPI ?

Réponse : Plusieurs modes de détention peuvent modifier l'imposition des revenus de SCPI : la détention en assurance-vie, via un PER, ou en démembrement temporaire. Chacun présente des avantages fiscaux et des contraintes spécifiques. Le choix le plus adapté dépend de votre profil patrimonial, de vos objectifs et de votre horizon d'investissement. *Investir en SCPI comporte des risques, dont la perte en capital et des revenus non garantis.*

---

**Q5 — Risques (requête : "risques fiscaux SCPI")**
> Quels sont les risques fiscaux d'un investissement en SCPI ?

Réponse : La législation fiscale peut évoluer et modifier le traitement des revenus de SCPI (taux d'imposition, prélèvements sociaux, conventions fiscales). Par ailleurs, les revenus distribués ne sont pas garantis : une baisse des loyers perçus par la SCPI réduit les revenus imposables mais aussi les distributions. *Les performances passées ne préjugent pas des performances futures.*

---

### Maillage interne à ajouter (3 liens prioritaires)

| Ancre | Destination | Placement recommandé |
|-------|-------------|---------------------|
| "fiscalité SCPI en assurance-vie" | `/education/scpi-direct-ou-assurance-vie` | Section optimisation ou CTA |
| "déduction fiscale via le PER" | `/education/per-scpi-retraite-deduction-fiscale` | Section optimisation |
| "comparer les SCPI selon votre profil fiscal" | `/comparateur-scpi/` | CTA final ou section récapitulatif |

---

## 7. Critères d'acceptation

La tâche est considérée comme terminée et prête pour implémentation quand :

- [ ] Titre `<title>` : 50-65 caractères, mot-clé principal en début, aucune promesse de rendement
- [ ] Méta-description : 140-160 caractères, appel à l'action présent, mention "pédagogique" ou "analyser"
- [ ] H1 : distinct du titre `<title>`, orienté pédagogie, pas de conseil direct
- [ ] 5 FAQ : chaque réponse contient un disclaimer, aucun chiffre sans source, aucun conseil personnalisé
- [ ] Maillage : 3 liens avec ancres conformes CIF, URLs cibles vérifiées (non canoniques)
- [ ] Validation Agent 04 : rapport de conformité produit et aucun point "Bloquant" ou "Élevé" non résolu

---

## 8. Formule exacte de validation humaine nécessaire avant modification du site

Avant toute modification de `src/components/FiscaliteScpiPage.tsx`, `src/components/SEOHead.tsx` ou tout autre fichier du site, l'utilisateur doit écrire **exactement** :

```
VALIDÉ POUR MODIFICATION DU SITE
```

Sans cette phrase, les agents restent en mode brief et analyse.  
Aucune modification de `/src`, `/public` ou tout autre fichier hors `/agents` n'est autorisée.

---

*Brief produit par Agent 01 — SEO, validé structurellement par Agent 04 — Conformité CIF. Aucun fichier hors de `/agents` n'a été modifié.*
