# Rapport de correction qualité éditoriale — Batch Nouveaux Articles 1

**Date :** 9 juin 2026  
**Objectif :** Réécrire le contenu des 9 nouveaux articles SCPI pour remplacer les blocs génériques par un contenu spécifique à chaque sujet.

---

## 1. Résumé des modifications

| Fichier modifié | Nature de la modification |
|---|---|
| `src/utils/richArticleContentGenerator.tsx` | **Réécriture complète** : passage d'un générateur générique unique à 9 générateurs spécifiques par slug, plus un fallback générique pour les articles existants. |
| `src/data/articleTemplatesConfig.ts` | Mise à jour des titres, metaDescriptions, keywords et searchIntent des 9 articles. |

---

## 2. Blocs génériques supprimés

Les blocs suivants ont été **supprimés du générateur principal** et remplacés par du contenu spécifique :

| Bloc générique supprimé | Articles concernés | Remplacement |
|---|---|---|
| « Contexte 2025 » (taux 3-4 %, inflation 2 %, SCPI 5-6,5 %) | Tous les 9 articles | Introduction spécifique à chaque sujet |
| « Analyse par profil fiscal » (TMI 11 / 30 / 41) | Tous les 9 articles | Contenu adapté : tableaux comparatifs, mécanismes, cas pratiques |
| « Pour et contre » (avantages/inconvénients génériques) | Tous les 9 articles | Tableaux spécifiques, points de vigilance, erreurs fréquentes |
| « Stratégies prudent / équilibré / dynamique » | Tous les 9 articles | Méthode MaximusSCPI adaptée à chaque article |
| « Verdict 2025 / Notre recommandation » | Tous les 9 articles | FAQ spécifique, liens internes, mention conformité |
| « Erreurs à éviter » (mono-SCPI, court-terme, ignorer TMI, focus rendement) | Tous les 9 articles | 4-5 erreurs spécifiques à chaque sujet |

---

## 3. Détail par article

### 3.1. `scpi-ou-lmnp` (id: 138)

**Titre modifié :** « SCPI ou LMNP : comparaison concrète avant d'investir »

**Blocs ajoutés :**
- Introduction comparative SCPI (collectif, délégué) vs LMNP (direct, amortissement)
- **Tableau obligatoire** : 8 critères (ticket, gestion, diversification, fiscalité, liquidité, effet de levier, transmission, risque)
- Exemple pédagogique : profil 45 ans, TMI 30 %, 100 000 €, comparaison SCPI 3-4 SCPI vs LMNP studio meublé
- Erreurs fréquentes : amortissement ≠ gain pur, SCPI pas toujours moins rentable, vacance LMNP, frais souscription SCPI, choix sur seul critère fiscal
- Méthode MaximusSCPI : grille d'analyse pour SCPI (rendement, TOF, frais, SG) et pour LMNP (emplacement, rendement brut, amortissement, crédit, temps)
- FAQ : 5 questions (cumul SCPI + LMNP, micro-BIC ou réel, ticket d'entrée, risque comparé, liquidité)
- Mention conformité

**Maillage interne ajouté :** `/comparateur-scpi/`, `/fiscalite-scpi/`, `/scpi-ou-immobilier-locatif/`, `/articles/`

---

### 3.2. `scpi-ou-immobilier-locatif` (id: 139)

**Titre modifié :** « SCPI ou immobilier locatif direct : gestion déléguée ou maîtrise totale ? »

**Blocs ajoutés :**
- Introduction : départager gestion déléguée (SCPI) vs maîtrise totale (direct)
- **Tableau comparatif** : 9 critères (investissement minimum, diversification, gestion quotidienne, travaux/vacance, fiscalité, effet de levier, liquidité, transmission, temps de gestion)
- Erreurs fréquentes : comparer uniquement rendement brut, sous-estimer temps de gestion, ignorer risque concentration, oublier frais SCPI
- Points à vérifier : grille pour SCPI et pour bien direct
- FAQ : 4 questions (cumul des deux, rendement net, rentabilité long terme, ticket d'entrée)
- Mention conformité

**Maillage interne ajouté :** `/comparateur-scpi/`, `/scpi-ou-lmnp/`, `/fiscalite-scpi/`, `/articles/`

---

### 3.3. `scpi-ou-assurance-vie` (id: 140)

**Titre modifié :** « SCPI en direct ou en assurance-vie : quelle enveloppe pour vos SCPI ? »

**Note :** Le sujet a été clarifié : il ne s'agit pas de comparer SCPI vs AV comme produits concurrents, mais SCPI en direct vs SCPI via assurance-vie.

**Blocs ajoutés :**
- Introduction : distinction SCPI en direct vs SCPI en AV (deux enveloppes différentes)
- **Tableau comparatif** : 9 critères (choix des SCPI, fiscalité revenus, fiscalité sortie, transmission, liquidité, démembrement, frais, capitalisation, montant min)
- Cas pédagogique : profil 55 ans TMI 41 %, 100 000 €, comparaison direct vs AV
- Erreurs fréquentes : choisir sur nombre de SCPI en AV, négliger frais du contrat, penser AV toujours avantageuse, ne pas vérifier qualité UC
- FAQ : 5 questions (cumul direct + AV, liquidité AV, frais à comparer, démembrement en AV, fiscalité après 8 ans)
- Mention conformité

**Maillage interne ajouté :** `/scpi-assurance-vie/`, `/comparateur-scpi/`, `/fiscalite-scpi/`, `/articles/`

---

### 3.4. `scpi-capital-fixe-capital-variable` (id: 141)

**Titre modifié :** « SCPI à capital fixe ou capital variable : impact sur votre investissement »

**Blocs ajoutés :**
- Introduction : mécanisme d'émission/retrait différent, impact sur liquidité et prix
- **Tableau comparatif** : 9 critères (émission, prix, retrait, liquidité, suspension, décote, surcote, stabilité capital, rôle SG)
- Explication mécanisme : fonctionnement détaillé de chaque structure
- Erreurs fréquentes : croire liquidité immédiate en capital variable, penser capital fixe toujours décoté, ignorer risque suspension, choisir capital fixe sans vérifier marché secondaire
- FAQ : 4 questions (type le plus répandu, prix souscription vs retrait, changement de statut, impact liquidité)
- Mention conformité

**Maillage interne ajouté :** `/comparateur-scpi/`, `/liquidite-scpi/`, `/baisse-prix-part-scpi/`, `/articles/`

---

### 3.5. `bulletin-trimestriel-scpi` (id: 142)

**Titre modifié :** « Comment lire un bulletin trimestriel de SCPI sans se tromper »

**Blocs ajoutés :**
- Introduction : rôle du BT, différence avec rapport annuel, importance pour suivi entre deux RA
- **Tableau obligatoire** : 13 rubriques (période, distribution, TDVM, collecte, capitalisation, nb associés, prix souscription, délai jouissance, TOF/TOP, acquisitions, dette, report à nouveau, commentaire de gestion) avec colonnes « Signification », « Importance », « Vigilance »
- Limites du BT : pas d'expertise, pas de certification, pas de comptes détaillés, données partielles
- Méthode MaximusSCPI : check-list de lecture trimestrielle (indicateurs performance + signaux faibles)
- FAQ : 5 questions (où trouver le BT, différence BT vs RA, obligation légale, indicateurs prioritaires, retard de publication)
- Aucune mention de TMI sauf section « impact fiscal éventuel » non incluse (hors sujet)
- Mention conformité

**Maillage interne ajouté :** `/rapport-annuel-scpi/`, `/documents-reglementaires-scpi/`, `/tof-scpi/`, `/articles/`

---

### 3.6. `rapport-annuel-scpi` (id: 143)

**Titre modifié :** « Comment lire un rapport annuel de SCPI : les points essentiels à vérifier »

**Blocs ajoutés :**
- Introduction : document de référence, certifié, seule source fiable d'analyse complète
- **Tableau obligatoire** : 12 sections (rapport de gestion, compte de résultat, bilan, patrimoine, expertise, valeur reconstitution, valeur réalisation, distribution, TOF, frais, rapport CAC, conventions réglementées) avec colonnes « Information à extraire », « Utilité pour l'investisseur »
- 5 points à vérifier en priorité : distribution couverte par loyers, progression valeur reconstitution, stabilité TOF, maîtrise endettement, réserves du CAC
- Erreurs fréquentes : se fier uniquement au TDVM, ignorer rapport CAC, ne pas comparer années précédentes, oublier conventions réglementées
- FAQ : 4 questions (où trouver le RA, valeur reconstitution vs réalisation, obligation légale, SG ne publie pas le RA)
- Mention conformité

**Maillage interne ajouté :** `/bulletin-trimestriel-scpi/`, `/dic-scpi/`, `/documents-reglementaires-scpi/`, `/articles/`

---

### 3.7. `delai-revente-scpi` (id: 144)

**Titre modifié :** « Délai de revente d'une SCPI : comprendre le processus avant d'investir »

**Blocs ajoutés :**
- Introduction : liquidité non garantie, délai dépend du type de capital et du marché
- Explication mécanisme : capital variable (retrait compensé par souscriptions) vs capital fixe (marché secondaire)
- **Tableau des délais** : 6 situations avec délai estimé et niveau de risque (marché normal, marché tendu, petite SCPI, grande SCPI, revente avec décote)
- Erreurs fréquentes : investir sans horizon 8-10 ans, croire revente immédiate, ne pas vérifier conditions de retrait, ignorer frais/fiscalité de cession
- FAQ : 5 questions (vendre à tout moment, prix de revente, suspension des retraits, améliorer revente, fiscalité avec décote)
- Mention conformité

**Maillage interne ajouté :** `/liquidite-scpi/`, `/risques-scpi/`, `/baisse-prix-part-scpi/`, `/articles/`

---

### 3.8. `investir-scpi-apres-50-ans` (id: 145)

**Titre modifié :** « Investir en SCPI après 50 ans : objectifs et points d'attention »

**Blocs ajoutés :**
- Introduction : objectifs 50-65 ans (retraite, revenus, transmission, fiscalité)
- Points clés : 6 cartes (horizon placement, revenus complémentaires, fiscalité, transmission, liquidité, cohérence patrimoniale)
- Erreurs fréquentes : surinvestir sans liquidités précaution, ignorer AV pour transmission, choisir SCPI trop risquées pour le rendement, ne pas anticiper transmission
- FAQ : 5 questions (investir à 60 ans, démembrement après 50 ans, part du patrimoine en SCPI, SCPI pour retraite, risque liquidité après 70 ans)
- Pas de stratégie prudent/équilibré/dynamique générique
- Aucune recommandation personnalisée
- Mention conformité

**Maillage interne ajouté :** `/scpi-retraite/`, `/scpi-revenus-complementaires/`, `/scpi-transmission/`, `/articles/`

---

### 3.9. `scpi-non-resident-fiscal` (id: 146)

**Titre modifié :** « SCPI pour non-résident fiscal : points à vérifier avant d'investir »

**Blocs ajoutés :**
- Introduction : résidence fiscale ≠ nationalité, fiscalité dépend du pays de résidence et des conventions
- **Tableau obligatoire** : 9 points à vérifier (résidence fiscale, convention fiscale, prélèvement source, imposition locale, SCPI françaises vs européennes, double imposition, banque/devise, retour France, déclaration France) avec colonnes « Pourquoi c'est important », « Document/source à consulter »
- Explication fiscalité : prélèvement source 20 % (hors UE) ou 12 % (UE), exonération PS sous conditions
- Erreurs fréquentes : croire qu'on ne paie pas d'impôt en France, penser l'AV résout tout, ignorer conventions fiscales, investir sans conseil fiscal spécialisé
- Sources citées : impots.gouv.fr, BOFiP, DIC, IFU, SINR, conseiller fiscal
- FAQ : 5 questions (ouverture SCPI aux non-résidents, prélèvement source, SCPI européennes, déclaration France, retour en France)
- Aucun taux fiscal générique non sourcé, aucun avantage automatique présenté
- Mention conformité

**Maillage interne ajouté :** `/fiscalite-scpi/`, `/scpi-revenus-etrangers/`, `/scpi-credit-impot/`, `/articles/`

---

## 4. Structure ajoutée dans chaque article

Tous les articles corrigés contiennent désormais les sections suivantes :

1. ✅ **Réponse courte IA** (3-6 lignes spécifiques au sujet)
2. ✅ **Tableau obligatoire** (spécifique à chaque article, pas de tableau générique)
3. ✅ **Explication claire du mécanisme** (adaptée au sujet)
4. ✅ **Erreurs fréquentes** (minimum 4 erreurs spécifiques par article)
5. ✅ **FAQ** (minimum 4-5 questions spécifiques)
6. ✅ **Méthode MaximusSCPI** (adaptée au sujet de l'article)
7. ✅ **Maillage interne** (liens vers routes existantes uniquement)
8. ✅ **Mention conformité** (identique pour tous)
9. ✅ **Aucune recommandation personnalisée**
10. ✅ **Aucune promesse de rendement**
11. ✅ **Aucune mention « guide complet », « tout savoir » ou « notre recommandation »**

---

## 5. Points à vérifier après déploiement

- [ ] Vérifier le rendu de chaque article sur `/articles/[slug]/`
- [ ] Vérifier que les tableaux s'affichent correctement (responsive, dark mode)
- [ ] Vérifier que les liens internes pointent vers des routes existantes (404)
- [ ] Vérifier l'absence de « Contexte 2025 », « TMI 11/30/41 », « prudent/équilibré/dynamique », « Notre recommandation »
- [ ] Vérifier que `scpi-ou-assurance-vie` traite bien SCPI en direct vs SCPI en AV (pas SCPI vs AV)
- [ ] Vérifier que `scpi-non-resident-fiscal` n'affiche pas de taux fiscal générique non sourcé
- [ ] Vérifier le fallback générique pour les autres articles (non modifiés)
- [ ] Lancer `npm run build` (vérifier que l'erreur SUPABASE est la seule erreur éventuelle)
