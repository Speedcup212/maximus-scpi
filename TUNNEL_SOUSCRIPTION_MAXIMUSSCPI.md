# 🎯 Tunnel de Souscription MaximusSCPI
## Spécification complète - Conformité CIF/AMF/PSI Intencial Patrimoine

**Version:** 1.0  
**Date:** 2025-01-XX  
**Statut:** CIF - PSI Intencial Patrimoine (intégration ultérieure)

---

## 📋 Table des matières

1. [Schéma du tunnel](#schéma-du-tunnel)
2. [Étape 1 : Sélection & Validation](#étape-1--sélection--validation)
3. [Étape 2 : Paramétrage Investissement](#étape-2--paramétrage-investissement)
4. [Étape 3 : Recueil Minimal Pré-PSI](#étape-3--recueil-minimal-pré-psi)
5. [Étape 4 : Redirection PSI](#étape-4--redirection-psi)
6. [Copywriting & CTA](#copywriting--cta)
7. [Conformité CIF/AMF](#conformité-cifamf)
8. [KPI de Conversion](#kpi-de-conversion)
9. [Versions avec/sans RDV](#versions-avec-sans-rdv)

---

## 🗺️ Schéma du tunnel

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPARATEUR SCPI                          │
│  (Page d'accueil - FintechComparator)                       │
│  • Sélection de 1 à N SCPI                                  │
│  • Filtres, recherche, analyse                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ CTA: "Valider ma sélection"
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 1 : VALIDATION DU PORTEFEUILLE                       │
│  ───────────────────────────────────────                    │
│  • Récapitulatif SCPI sélectionnées                         │
│  • Allocation automatique ou manuelle                       │
│  • Vérification diversification (warning si < 3 SCPI)       │
│  • Simulation rapide (rendement moyen, revenus estimés)     │
│  • Mentions conformité (risque, liquidité)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ CTA: "Définir mon investissement"
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 2 : PARAMÉTRAGE DE L'INVESTISSEMENT                  │
│  ───────────────────────────────────────                    │
│  • Montant total (slider + presets)                        │
│  • Répartition par SCPI (sliders)                          │
│  • Mode de détention (Direct / AV / PER)                   │
│  • Horizon d'investissement (5/10/15/20 ans)               │
│  • Projection indicative (non-promissive)                  │
│  • Disclaimer renforcé                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ CTA: "Continuer vers la souscription"
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 3 : RECUEIL MINIMAL PRÉ-PSI                         │
│  ───────────────────────────────────────                    │
│  • Civilité, Nom, Prénom                                    │
│  • Email (validation)                                       │
│  • Téléphone (optionnel mais recommandé)                   │
│  • Montant confirmé (pré-rempli depuis étape 2)            │
│  • Consentements RGPD                                       │
│  • Option: "Je souhaite être accompagné(e)" (checkbox)     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ CTA: "Finaliser ma demande"
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 4 : REDIRECTION PSI INTENCIAL                        │
│  ───────────────────────────────────────                    │
│  • Message de transition                                    │
│  • Récapitulatif envoyé par email                           │
│  • Redirection vers PSI (URL fournie ultérieurement)        │
│  • Tracking conversion                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 ÉTAPE 1 : Sélection & Validation

### Objectif
Valider que le prospect a bien sélectionné un portefeuille cohérent avant de continuer.

### Écran Mobile-First

```
┌─────────────────────────────────────┐
│  [X] Retour                          │
│                                      │
│  ✓ Validation de votre sélection    │
│                                      │
│  ┌───────────────────────────────┐  │
│  │ 3 SCPI sélectionnées          │  │
│  │                               │  │
│  │ • Activimmo (5.5%)             │  │
│  │ • Corum Origin (5.8%)         │  │
│  │ • Iroko Zen (5.1%)            │  │
│  │                               │  │
│  │ Rendement moyen: 5.47%        │  │
│  └───────────────────────────────┘  │
│                                      │
│  ⚠️ Recommandation                   │
│  Pour une meilleure diversification,│
│  nous recommandons au moins 3 SCPI. │
│                                      │
│  [Ajuster l'allocation]              │
│                                      │
│  ┌───────────────────────────────┐  │
│  │ Répartition actuelle          │  │
│  │                               │  │
│  │ Activimmo     33.3%  [━━━]    │  │
│  │ Corum Origin  33.3%  [━━━]    │  │
│  │ Iroko Zen     33.3%  [━━━]    │  │
│  └───────────────────────────────┘  │
│                                      │
│  📊 Simulation rapide                │
│  Pour 50 000€ investis:               │
│  • Revenus annuels estimés: 2 735€   │
│  • Revenus mensuels estimés: 228€    │
│                                      │
│  ⚠️ Les performances passées ne      │
│  préjugent pas des performances      │
│  futures.                            │
│                                      │
│  [Définir mon investissement]        │
└─────────────────────────────────────┘
```

### Texte exact de l'écran

**Titre:** "Validation de votre sélection"

**Sous-titre:** "{N} SCPI sélectionnée{N>1?'s':''}"

**Liste des SCPI:**
- Format: "• {Nom SCPI} ({Rendement}%)"
- Bouton "Modifier" à droite de chaque ligne

**Section Recommandation (si < 3 SCPI):**
```
⚠️ Recommandation de diversification

Pour réduire les risques liés à la concentration, nous recommandons de sélectionner au moins 3 SCPI différentes.

Cette recommandation n'est pas une obligation et ne constitue pas un conseil en investissement personnalisé.
```

**Section Allocation:**
```
Répartition de votre portefeuille

Vous pouvez ajuster la répartition entre vos SCPI sélectionnées. La somme doit être égale à 100%.
```

**Section Simulation rapide:**
```
📊 Estimation indicative

Pour un investissement de {montant}€ :
• Revenus annuels estimés : {montant * rendement_moyen / 100}€
• Revenus mensuels estimés : {montant * rendement_moyen / 100 / 12}€

⚠️ Ces estimations sont basées sur les performances passées et ne constituent pas une promesse de rendement.
```

**Disclaimer (toujours visible):**
```
Les investissements en SCPI présentent un risque de perte en capital et une liquidité non garantie. Les performances passées ne préjugent pas des performances futures. Les simulations sont indicatives.
```

**CTA Principal:**
```
[Définir mon investissement]
```

**CTA Secondaire (en haut):**
```
[Retour au comparateur]
```

### Champs collectés
- Liste des SCPI sélectionnées (IDs)
- Allocation par SCPI (pourcentages, somme = 100%)
- Validation utilisateur (checkbox "J'ai bien compris les risques")

### Mentions de conformité
- ⚠️ Risque de perte en capital
- ⚠️ Liquidité non garantie
- ⚠️ Performances passées ≠ performances futures
- ⚠️ Simulations indicatives, non-promissives

---

## 💰 ÉTAPE 2 : Paramétrage Investissement

### Objectif
Permettre au prospect de définir précisément son investissement (montant, répartition, mode, horizon).

### Écran Mobile-First

```
┌─────────────────────────────────────┐
│  [←] Retour                          │
│                                      │
│  💰 Définir mon investissement       │
│                                      │
│  Montant total à investir            │
│  ┌───────────────────────────────┐  │
│  │ [50 000] €                    │  │
│  └───────────────────────────────┘  │
│  [10K€] [25K€] [50K€] [100K€]      │
│                                      │
│  Répartition par SCPI                │
│  ┌───────────────────────────────┐  │
│  │ Activimmo                     │  │
│  │ 33.3%  [━━━━━━━━━━━━━━━━]    │  │
│  │ 16 650€ • 27 parts            │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Corum Origin                  │  │
│  │ 33.3%  [━━━━━━━━━━━━━━━━]    │  │
│  │ 16 650€ • 28 parts            │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Iroko Zen                     │  │
│  │ 33.3%  [━━━━━━━━━━━━━━━━]    │  │
│  │ 16 650€ • 55 parts            │  │
│  └───────────────────────────────┘  │
│                                      │
│  Mode de détention                   │
│  ○ Détention directe                │
│  ○ Assurance-vie                    │
│  ○ PER (Plan Épargne Retraite)       │
│                                      │
│  Horizon d'investissement            │
│  [5 ans] [10 ans] [15 ans] [20 ans] │
│                                      │
│  📊 Projection indicative            │
│  (sur 15 ans, avec réinvestissement)│
│  ┌───────────────────────────────┐  │
│  │ [Graphique barres]            │  │
│  │                               │  │
│  │ Capital initial: 50 000€      │  │
│  │ Revenus cumulés: ~41 000€     │  │
│  │ Valeur estimée: ~91 000€      │  │
│  └───────────────────────────────┘  │
│                                      │
│  ⚠️ Projection basée sur les         │
│  performances passées. Non           │
│  garantie.                           │
│                                      │
│  [Continuer vers la souscription]   │
└─────────────────────────────────────┘
```

### Texte exact de l'écran

**Titre:** "Définir mon investissement"

**Section Montant:**
```
Montant total à investir

Définissez le montant que vous souhaitez investir dans votre portefeuille de SCPI.

Montant minimum : 3 000€ (selon les SCPI sélectionnées)
```

**Section Répartition:**
```
Répartition par SCPI

Ajustez la répartition de votre investissement entre les SCPI sélectionnées. Vous pouvez modifier les pourcentages en utilisant les curseurs ci-dessous.

La somme des pourcentages doit être égale à 100%.
```

**Section Mode de détention:**
```
Mode de détention

Choisissez le support fiscal qui vous convient :

• Détention directe : Fiscalité au barème progressif de l'IR
• Assurance-vie : Avantages fiscaux après 8 ans de détention
• PER : Déduction fiscale immédiate, sortie à la retraite

💡 Besoin d'aide pour choisir ? Vous pourrez en discuter avec votre conseiller lors de la finalisation.
```

**Section Horizon:**
```
Horizon d'investissement

Quel est votre horizon d'investissement ? Cette information nous permet de vous proposer des projections adaptées.

⚠️ Les SCPI sont des investissements à long terme. Un horizon de 10 ans minimum est recommandé.
```

**Section Projection:**
```
📊 Projection indicative sur {horizon} ans

Cette projection est basée sur :
• Les performances passées des SCPI sélectionnées
• Un réinvestissement automatique des revenus
• Les frais d'entrée et de gestion estimés

⚠️ Cette projection est purement indicative et ne constitue pas une promesse de rendement. Les performances futures peuvent différer significativement.
```

**Disclaimer renforcé:**
```
⚠️ Avertissements importants

• Risque de perte en capital : La valeur de vos parts peut baisser
• Liquidité non garantie : La revente de vos parts n'est pas garantie et peut prendre plusieurs mois
• Performances passées : Les performances passées ne préjugent pas des performances futures
• Fiscalité : Les règles fiscales peuvent évoluer et impacter votre rendement net
• Frais : Des frais d'entrée et de gestion s'appliquent et réduisent votre rendement net

En investissant, vous reconnaissez avoir pris connaissance de ces risques.
```

**CTA Principal:**
```
[Continuer vers la souscription]
```

**CTA Secondaire:**
```
[Retour à la validation]
```

### Champs collectés
- Montant total (€, min: somme des minInvestment des SCPI)
- Répartition par SCPI (%, validation: somme = 100%)
- Mode de détention (Direct / AV / PER)
- Horizon d'investissement (5/10/15/20 ans)
- Validation des risques (checkbox obligatoire)

### Mentions de conformité
- ⚠️ Risque de perte en capital
- ⚠️ Liquidité non garantie
- ⚠️ Performances passées ≠ performances futures
- ⚠️ Projections indicatives, non-promissives
- ⚠️ Fiscalité peut évoluer
- ⚠️ Frais réduisent le rendement net

---

## 📝 ÉTAPE 3 : Recueil Minimal Pré-PSI

### Objectif
Collecter les informations minimales nécessaires avant la redirection vers le PSI Intencial Patrimoine.

### Écran Mobile-First

```
┌─────────────────────────────────────┐
│  [←] Retour                          │
│                                      │
│  📝 Finaliser ma demande             │
│                                      │
│  Récapitulatif                       │
│  ┌───────────────────────────────┐  │
│  │ 3 SCPI • 50 000€              │  │
│  │ Détention directe • 15 ans    │  │
│  └───────────────────────────────┘  │
│                                      │
│  Vos informations                    │
│                                      │
│  Civilité *                          │
│  [Monsieur ▼]                        │
│                                      │
│  Nom *                               │
│  [________________]                  │
│                                      │
│  Prénom *                            │
│  [________________]                  │
│                                      │
│  Email *                             │
│  [________________]                  │
│                                      │
│  Téléphone                           │
│  [________________]                  │
│  (recommandé pour finaliser)         │
│                                      │
│  Montant confirmé                    │
│  [50 000] €                          │
│  (modifiable)                        │
│                                      │
│  ┌───────────────────────────────┐  │
│  │ ☑ J'accepte de recevoir des   │  │
│  │   informations par email      │  │
│  └───────────────────────────────┘  │
│                                      │
│  ┌───────────────────────────────┐  │
│  │ ☑ Je souhaite être            │  │
│  │   accompagné(e) par un         │  │
│  │   conseiller                  │  │
│  └───────────────────────────────┘  │
│                                      │
│  ⚠️ Conformité                       │
│  En continuant, vous serez          │
│  redirigé vers le questionnaire     │
│  réglementaire de votre conseiller. │
│                                      │
│  [Finaliser ma demande]              │
└─────────────────────────────────────┘
```

### Texte exact de l'écran

**Titre:** "Finaliser ma demande"

**Section Récapitulatif:**
```
Récapitulatif de votre projet

• {N} SCPI sélectionnée{N>1?'s':''}
• Montant : {montant}€
• Mode : {mode}
• Horizon : {horizon} ans

Vous pourrez modifier ces informations lors de la finalisation avec votre conseiller.
```

**Section Informations:**
```
Vos informations

Ces informations sont nécessaires pour finaliser votre demande de souscription. Elles seront transmises à votre conseiller Intencial Patrimoine.

* Champs obligatoires
```

**Champ Civilité:**
```
Civilité *
[Monsieur] [Madame] [Autre]
```

**Champ Nom:**
```
Nom *
Votre nom de famille
```

**Champ Prénom:**
```
Prénom *
Votre prénom
```

**Champ Email:**
```
Email *
Votre adresse email

Nous vous enverrons un récapitulatif de votre sélection et les prochaines étapes.
```

**Champ Téléphone:**
```
Téléphone
Votre numéro de téléphone (format: 06 12 34 56 78)

Recommandé pour finaliser rapidement votre souscription. Vous pouvez le renseigner plus tard si vous préférez.
```

**Champ Montant:**
```
Montant confirmé
{montant}€

Vous pouvez modifier ce montant si nécessaire. Le montant minimum est de {minInvestment}€.
```

**Checkbox RGPD:**
```
☑ J'accepte de recevoir des informations par email concernant mon projet d'investissement

En cochant cette case, vous acceptez de recevoir des emails de la part de MaximusSCPI et d'Intencial Patrimoine concernant votre demande de souscription.
```

**Checkbox Accompagnement:**
```
☑ Je souhaite être accompagné(e) par un conseiller

En cochant cette case, un conseiller Intencial Patrimoine vous contactera pour vous accompagner dans votre projet. Vous pouvez également finaliser votre souscription en ligne sans accompagnement.
```

**Message de transition:**
```
⚠️ Prochaine étape : Questionnaire réglementaire

En cliquant sur "Finaliser ma demande", vous serez redirigé vers le questionnaire réglementaire de votre conseiller Intencial Patrimoine. Ce questionnaire est obligatoire pour toute souscription et permet de :

• Évaluer votre profil investisseur
• Vérifier l'adéquation de votre projet avec votre situation
• Recueillir les informations nécessaires à la conformité réglementaire

Durée estimée : 10-15 minutes
```

**CTA Principal:**
```
[Finaliser ma demande]
```

**CTA Secondaire:**
```
[Retour au paramétrage]
```

### Champs collectés
- Civilité (Monsieur / Madame / Autre) *
- Nom (string) *
- Prénom (string) *
- Email (email, validation) *
- Téléphone (tel, optionnel mais recommandé)
- Montant confirmé (number, pré-rempli, modifiable)
- Consentement RGPD (checkbox) *
- Souhaite accompagnement (checkbox, optionnel)

### Mentions de conformité
- ⚠️ Redirection vers questionnaire réglementaire obligatoire
- ⚠️ Évaluation du profil investisseur requise
- ⚠️ Vérification d'adéquation obligatoire
- ⚠️ Durée estimée du questionnaire

---

## 🔄 ÉTAPE 4 : Redirection PSI

### Objectif
Transmettre les données au PSI Intencial Patrimoine et rediriger le prospect vers le questionnaire réglementaire.

### Écran Mobile-First

```
┌─────────────────────────────────────┐
│                                      │
│  ✓ Demande enregistrée              │
│                                      │
│  Merci pour votre confiance !       │
│                                      │
│  Votre sélection a été enregistrée  │
│  et un récapitulatif vous a été     │
│  envoyé par email.                   │
│                                      │
│  ┌───────────────────────────────┐  │
│  │ Récapitulatif                  │  │
│  │                                │  │
│  │ • 3 SCPI sélectionnées         │  │
│  │ • Montant : 50 000€            │  │
│  │ • Mode : Détention directe     │  │
│  │ • Horizon : 15 ans             │  │
│  └───────────────────────────────┘  │
│                                      │
│  Prochaine étape                     │
│                                      │
│  Vous allez être redirigé vers le   │
│  questionnaire réglementaire de      │
│  votre conseiller Intencial          │
│  Patrimoine.                         │
│                                      │
│  Ce questionnaire est obligatoire    │
│  pour finaliser votre souscription.  │
│                                      │
│  Durée estimée : 10-15 minutes      │
│                                      │
│  [Continuer vers le questionnaire]   │
│                                      │
│  ┌───────────────────────────────┐  │
│  │ 💡 Besoin d'aide ?            │  │
│  │                                │  │
│  │ Un conseiller peut vous       │  │
│  │ accompagner.                   │  │
│  │                                │  │
│  │ [Contacter un conseiller]     │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Texte exact de l'écran

**Titre:** "Demande enregistrée"

**Message principal:**
```
Merci pour votre confiance !

Votre sélection a été enregistrée et un récapitulatif détaillé vous a été envoyé par email à l'adresse {email}.

Vous pouvez conserver cet email pour référence.
```

**Section Récapitulatif:**
```
Récapitulatif de votre projet

• {N} SCPI sélectionnée{N>1?'s':''} : {liste_noms}
• Montant : {montant}€
• Mode de détention : {mode}
• Horizon d'investissement : {horizon} ans
• Répartition : {détails_allocation}

Ces informations ont été transmises à votre conseiller Intencial Patrimoine.
```

**Section Prochaine étape:**
```
Prochaine étape : Questionnaire réglementaire

Vous allez être redirigé vers le questionnaire réglementaire de votre conseiller Intencial Patrimoine dans quelques secondes.

Ce questionnaire est obligatoire pour toute souscription et permet de :
• Évaluer votre profil investisseur (connaissances, expérience, situation)
• Vérifier l'adéquation de votre projet avec votre situation patrimoniale
• Recueillir les informations nécessaires à la conformité réglementaire (CIF/AMF)

Durée estimée : 10-15 minutes

Vos informations seront sécurisées et traitées conformément au RGPD.
```

**CTA Principal:**
```
[Continuer vers le questionnaire]
```

**CTA Secondaire (si souhait accompagnement):**
```
[Contacter un conseiller]

Un conseiller Intencial Patrimoine peut vous accompagner dans le remplissage du questionnaire et répondre à vos questions.
```

**Message de sécurité:**
```
🔒 Sécurité de vos données

Vos informations sont transmises de manière sécurisée (chiffrement SSL) et traitées conformément au RGPD. Intencial Patrimoine est soumis au secret professionnel.
```

### Actions techniques
1. **Enregistrement en base de données:**
   - Table: `leads_souscription` (à créer)
   - Champs: civilité, nom, prénom, email, téléphone, montant, mode, horizon, SCPI sélectionnées (JSON), allocation (JSON), consentements, timestamp

2. **Envoi email récapitulatif:**
   - Template: "Récapitulatif de votre sélection MaximusSCPI"
   - Contenu: Détails de la sélection, prochaines étapes, lien vers le questionnaire

3. **Transmission au PSI:**
   - Format: API call ou webhook vers Intencial Patrimoine
   - Données: Toutes les informations collectées + token de suivi

4. **Redirection:**
   - URL: {URL_PSI_INTENCIAL} (fournie ultérieurement)
   - Paramètres: token, email, montant (pour pré-remplissage si possible)

5. **Tracking:**
   - Google Analytics: Event "subscription_started"
   - Google Ads: Conversion "lead_subscription"
   - Pixel Facebook: Event "InitiateCheckout"

### Mentions de conformité
- ⚠️ Questionnaire réglementaire obligatoire
- ⚠️ Évaluation du profil investisseur requise
- ⚠️ Vérification d'adéquation obligatoire
- ⚠️ Traitement conforme RGPD
- ⚠️ Secret professionnel

---

## ✍️ Copywriting & CTA

### Principes généraux

**❌ À ÉVITER:**
- "Choisir", "Sélectionner" (trop vague)
- "Fermer", "Valider" (trop technique)
- "Souscrire maintenant" (trop agressif)
- "Garantir", "Assurer" (non-conforme)
- "Rendement garanti" (interdit)

**✅ À UTILISER:**
- "Continuer", "Avancer", "Finaliser"
- "Définir", "Configurer", "Paramétrer"
- "Finaliser ma demande"
- "Continuer vers la souscription"
- "Compléter mon projet"

### CTA par étape

| Étape | CTA Principal | CTA Secondaire | Style |
|-------|---------------|----------------|-------|
| Comparateur → Validation | "Valider ma sélection" | "Continuer à comparer" | Primary (emerald) |
| Validation → Paramétrage | "Définir mon investissement" | "Retour au comparateur" | Primary (emerald) |
| Paramétrage → Recueil | "Continuer vers la souscription" | "Retour à la validation" | Primary (emerald) |
| Recueil → PSI | "Finaliser ma demande" | "Retour au paramétrage" | Primary (emerald, bold) |
| Redirection PSI | "Continuer vers le questionnaire" | "Contacter un conseiller" | Primary (emerald, large) |

### Micro-textes de réassurance

**Pendant la sélection:**
```
💡 Vous pouvez modifier votre sélection à tout moment avant de finaliser.
```

**Pendant le paramétrage:**
```
💡 Ces paramètres peuvent être ajustés lors de la finalisation avec votre conseiller.
```

**Avant le recueil:**
```
💡 Vos informations sont sécurisées et ne seront utilisées que pour finaliser votre demande.
```

**Avant la redirection:**
```
💡 Le questionnaire réglementaire est une étape obligatoire mais rapide (10-15 minutes).
```

### Phrases de transition

**Entre étapes:**
```
Parfait ! Passons à l'étape suivante pour définir votre investissement.
```

```
Excellent ! Il ne reste plus qu'à finaliser quelques informations.
```

```
Presque terminé ! Vous allez être redirigé vers le questionnaire réglementaire.
```

---

## ⚖️ Conformité CIF/AMF

### Checklist conformité

#### ✅ Obligations générales

- [ ] **Aucune promesse de performance**
  - Tous les rendements présentés comme "estimés", "indicatifs", "basés sur performances passées"
  - Aucun chiffre présenté comme garanti

- [ ] **Avertissements risques obligatoires**
  - Risque de perte en capital (toujours visible)
  - Liquidité non garantie (toujours visible)
  - Performances passées ≠ performances futures (sur toutes les projections)

- [ ] **Mentions légales**
  - Statut CIF clairement indiqué
  - PSI Intencial Patrimoine mentionné
  - Lien vers mentions légales accessible

- [ ] **Disclaimers adaptés au contexte**
  - Court (1 ligne) sur les écrans de sélection
  - Moyen (3-5 lignes) sur les simulations
  - Long (section dédiée) avant la souscription

#### ✅ Conformité CIF (Conseiller en Investissements Financiers)

- [ ] **Identification du CIF**
  - Nom: MaximusSCPI
  - Statut: CIF
  - Numéro d'immatriculation (à compléter)

- [ ] **Identification du PSI**
  - Nom: Intencial Patrimoine
  - Statut: PSI (Prestataire de Services d'Investissement)
  - Relation: Partenaire pour la finalisation des souscriptions

- [ ] **Information sur les frais**
  - Frais d'entrée mentionnés (variables selon SCPI)
  - Frais de gestion mentionnés (variables selon SCPI)
  - Impact sur le rendement net expliqué

#### ✅ Conformité AMF (Autorité des Marchés Financiers)

- [ ] **Règles de publicité**
  - Aucune publicité trompeuse
  - Informations équilibrées (avantages + risques)
  - Pas de comparaison avec d'autres produits sans base objective

- [ ] **Information précontractuelle**
  - Document d'information clé (DIC) accessible
  - Règlement de la SCPI accessible
  - Statuts de la SCPI accessibles

- [ ] **Évaluation du profil investisseur**
  - Mention que le questionnaire PSI est obligatoire
  - Explication de l'objectif (adéquation, connaissances, situation)

#### ✅ Conformité RGPD

- [ ] **Consentements**
  - Checkbox RGPD explicite
  - Information sur l'utilisation des données
  - Droit de retrait du consentement

- [ ] **Sécurité des données**
  - Mention du chiffrement SSL
  - Information sur le stockage sécurisé
  - Durée de conservation des données

### Disclaimers par contexte

#### Disclaimer Court (écrans de sélection)
```
⚠️ Risque de perte en capital • Liquidité non garantie
```

#### Disclaimer Moyen (simulations)
```
⚠️ Les investissements en SCPI présentent un risque de perte en capital et une liquidité non garantie. Les performances passées ne préjugent pas des performances futures. Les simulations sont indicatives et ne constituent pas une promesse de rendement.
```

#### Disclaimer Long (avant souscription)
```
⚠️ Avertissements importants

RISQUE DE PERTE EN CAPITAL
La valeur de vos parts de SCPI peut baisser et vous pouvez perdre une partie ou la totalité de votre investissement initial. Aucun rendement n'est garanti.

LIQUIDITÉ NON GARANTIE
La revente de vos parts de SCPI n'est pas garantie et peut prendre plusieurs mois, voire plus. Vous devez être prêt à conserver votre investissement sur le long terme (minimum 10 ans recommandé).

PERFORMANCES PASSÉES
Les performances passées des SCPI ne préjugent pas des performances futures. Les rendements peuvent varier significativement d'une année sur l'autre.

FISCALITÉ
Les règles fiscales applicables aux SCPI peuvent évoluer et impacter votre rendement net. Consultez un conseiller fiscal pour optimiser votre situation.

FRAIS
Des frais d'entrée (variables selon les SCPI, généralement 0% à 10%) et des frais de gestion annuels (généralement 0,5% à 1,5%) s'appliquent et réduisent votre rendement net.

CONFORMITÉ RÉGLEMENTAIRE
Avant toute souscription, vous devrez compléter un questionnaire réglementaire permettant d'évaluer votre profil investisseur et de vérifier l'adéquation de votre projet avec votre situation.

En continuant, vous reconnaissez avoir pris connaissance de ces risques et acceptez de compléter le questionnaire réglementaire obligatoire.
```

---

## 📊 KPI de Conversion

### Métriques à suivre

#### Funnel de conversion

| Étape | Métrique | Objectif | Tracking |
|-------|----------|----------|----------|
| Comparateur | Vues comparateur | - | GA4: page_view |
| Sélection | SCPI sélectionnées | 60% sélectionnent ≥1 SCPI | Custom event: `scpi_selected` |
| Validation | Clic "Valider ma sélection" | 40% des sélectionneurs | Custom event: `step1_validation_click` |
| Paramétrage | Clic "Continuer vers souscription" | 70% des validateurs | Custom event: `step2_continue_click` |
| Recueil | Formulaire complété | 80% des paramétreurs | Custom event: `step3_form_submitted` |
| Redirection PSI | Redirection effective | 95% des formulaires | Custom event: `step4_redirect_psi` |
| PSI complété | Questionnaire PSI terminé | 60% des redirigés | Via Intencial (à confirmer) |
| Souscription finale | Souscription effective | 40% des PSI complétés | Via Intencial (à confirmer) |

#### Taux de conversion global

```
Taux de conversion = (Souscriptions finales / Vues comparateur) × 100

Objectif: 2-3% (selon source de trafic)
```

#### Taux d'abandon par étape

```
Taux d'abandon étape N = (Abandons étape N / Entrées étape N) × 100

Objectifs:
- Étape 1 → 2: < 30%
- Étape 2 → 3: < 20%
- Étape 3 → 4: < 15%
- Étape 4 → PSI: < 5%
```

#### Métriques de qualité

- **Temps moyen par étape:** Identifier les goulots d'étranglement
- **Taux de modification:** Combien de fois l'utilisateur modifie sa sélection/allocation
- **Taux d'accompagnement:** % de prospects cochant "souhaite accompagnement"
- **Taux de complétion PSI:** % de redirigés complétant le questionnaire
- **Taux de souscription finale:** % de PSI complétés aboutissant à une souscription

### Événements à tracker (Google Analytics 4)

```javascript
// Étape 1: Validation
gtag('event', 'step1_validation', {
  'event_category': 'subscription_funnel',
  'scpi_count': 3,
  'scpi_names': ['Activimmo', 'Corum Origin', 'Iroko Zen']
});

// Étape 2: Paramétrage
gtag('event', 'step2_parametrage', {
  'event_category': 'subscription_funnel',
  'investment_amount': 50000,
  'detention_mode': 'direct',
  'horizon': 15
});

// Étape 3: Recueil
gtag('event', 'step3_recueil', {
  'event_category': 'subscription_funnel',
  'has_phone': true,
  'wants_accompaniment': false
});

// Étape 4: Redirection PSI
gtag('event', 'step4_redirect_psi', {
  'event_category': 'subscription_funnel',
  'subscription_id': 'token_12345',
  'value': 50000,
  'currency': 'EUR'
});

// Conversion Google Ads
gtag('event', 'conversion', {
  'send_to': 'AW-XXXXX/subscription_start',
  'value': 50000,
  'currency': 'EUR',
  'transaction_id': 'token_12345'
});
```

---

## 🔀 Versions avec/sans RDV

### Version "Sans RDV" (Tunnel autonome)

**Caractéristiques:**
- Toutes les étapes sont complétables en ligne
- Aucune intervention humaine requise
- Redirection directe vers PSI Intencial
- Support email/chat disponible mais non obligatoire

**Checkbox "Accompagnement":**
```
☐ Je souhaite être accompagné(e) par un conseiller

Si vous cochez cette case, un conseiller Intencial Patrimoine vous contactera dans les 24h pour vous accompagner. Sinon, vous pouvez finaliser votre souscription en ligne de manière autonome.
```

**Message de réassurance:**
```
💡 Vous pouvez finaliser votre souscription en ligne de manière autonome. Un conseiller reste disponible si vous avez des questions.
```

### Version "Avec Accompagnement" (Tunnel guidé)

**Caractéristiques:**
- Même tunnel jusqu'à l'étape 3
- À l'étape 3, si "souhaite accompagnement" coché:
  - Envoi immédiat d'une notification au conseiller
  - Message: "Un conseiller va vous contacter sous 24h"
  - Option: "Prendre rendez-vous maintenant" (ouvre Calendly)
  - Possibilité de continuer en ligne malgré tout

**Checkbox "Accompagnement" (version guidée):**
```
☑ Je souhaite être accompagné(e) par un conseiller

Un conseiller Intencial Patrimoine vous contactera dans les 24h pour vous accompagner dans votre projet. Vous pouvez également prendre rendez-vous maintenant.
```

**Message de transition:**
```
✅ Demande d'accompagnement enregistrée

Un conseiller Intencial Patrimoine va vous contacter sous 24h (jours ouvrés) au {téléphone} ou par email à {email}.

En attendant, vous pouvez :
• Continuer vers le questionnaire réglementaire
• Prendre rendez-vous maintenant (lien Calendly)
• Finaliser votre souscription en ligne de manière autonome
```

**CTA supplémentaires:**
```
[Prendre rendez-vous maintenant]
[Continuer en ligne]
```

### Logique de routage

```javascript
if (wantsAccompaniment) {
  // Envoyer notification au conseiller
  sendNotificationToAdvisor(leadData);
  
  // Afficher options
  showAccompanimentOptions();
} else {
  // Redirection directe vers PSI
  redirectToPSI();
}
```

---

## 🚀 Évolutivité & Intégrations futures

### Préparation à l'intégration PSI Intencial

#### Points de jonction

1. **Token de suivi:**
   - Générer un token unique par demande
   - Transmettre ce token au PSI
   - Permettre le suivi de la complétion

2. **Pré-remplissage (si possible):**
   - Nom, Prénom, Email
   - Montant d'investissement
   - SCPI sélectionnées
   - Mode de détention

3. **Webhook de retour:**
   - PSI complété → Notification MaximusSCPI
   - Souscription effective → Notification MaximusSCPI
   - Mise à jour du statut du lead

#### Structure de données à transmettre

```json
{
  "token": "uuid_unique",
  "lead": {
    "civility": "Monsieur",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com",
    "phone": "+33612345678",
    "wantsAccompaniment": false
  },
  "portfolio": {
    "totalAmount": 50000,
    "detentionMode": "direct",
    "horizon": 15,
    "scpis": [
      {
        "id": 1,
        "name": "Activimmo",
        "allocation": 33.3,
        "amount": 16650
      }
    ]
  },
  "metadata": {
    "source": "maximusscpi",
    "utm_source": "google",
    "utm_campaign": "scpi_comparator",
    "timestamp": "2025-01-XXT10:00:00Z"
  }
}
```

### Optimisations A/B prévues

#### Variables testables

1. **CTA:**
   - "Finaliser ma demande" vs "Continuer vers la souscription"
   - "Valider ma sélection" vs "Définir mon investissement"

2. **Ordre des champs:**
   - Email en premier vs Nom en premier
   - Téléphone obligatoire vs optionnel

3. **Messages de réassurance:**
   - Court vs détaillé
   - Avec icônes vs sans icônes

4. **Disclaimers:**
   - Court en haut vs long en bas
   - Modal vs inline

### Support d'autres produits (AV, PER, Crédit)

#### Architecture modulaire

Le tunnel doit être conçu pour supporter facilement:
- **Assurance-vie:** Mode de détention "AV" → Questions spécifiques AV
- **PER:** Mode de détention "PER" → Questions spécifiques PER
- **Crédit:** Option "Acheter avec crédit" → Questions spécifiques crédit

#### Structure conditionnelle

```javascript
if (detentionMode === 'av') {
  showAVQuestions();
} else if (detentionMode === 'per') {
  showPERQuestions();
} else if (wantsCredit) {
  showCreditQuestions();
}
```

---

## 📋 Checklist d'implémentation

### Phase 1: Structure de base
- [ ] Créer composant `SubscriptionFunnel.tsx`
- [ ] Créer composants pour chaque étape:
  - [ ] `Step1Validation.tsx`
  - [ ] `Step2Parametrage.tsx`
  - [ ] `Step3Recueil.tsx`
  - [ ] `Step4Redirection.tsx`
- [ ] Créer contexte `SubscriptionContext.tsx` pour gérer l'état
- [ ] Créer table Supabase `leads_souscription`

### Phase 2: Intégration comparateur
- [ ] Ajouter CTA "Valider ma sélection" dans `SelectionSidebar.tsx`
- [ ] Connecter le comparateur au tunnel
- [ ] Gérer la transition comparateur → étape 1

### Phase 3: Étape 1 - Validation
- [ ] Afficher récapitulatif SCPI
- [ ] Sliders d'allocation
- [ ] Validation (somme = 100%)
- [ ] Warning si < 3 SCPI
- [ ] Simulation rapide
- [ ] Disclaimers

### Phase 4: Étape 2 - Paramétrage
- [ ] Slider montant total
- [ ] Presets montants
- [ ] Sliders répartition par SCPI
- [ ] Sélecteur mode de détention
- [ ] Sélecteur horizon
- [ ] Graphique projection (non-promissif)
- [ ] Disclaimers renforcés

### Phase 5: Étape 3 - Recueil
- [ ] Formulaire civilité/nom/prénom/email/téléphone
- [ ] Validation email
- [ ] Champ montant (pré-rempli, modifiable)
- [ ] Checkbox RGPD
- [ ] Checkbox accompagnement
- [ ] Message de transition PSI

### Phase 6: Étape 4 - Redirection
- [ ] Écran de confirmation
- [ ] Enregistrement en base
- [ ] Envoi email récapitulatif
- [ ] Transmission au PSI (API/webhook)
- [ ] Redirection vers PSI Intencial
- [ ] Tracking conversions

### Phase 7: Conformité
- [ ] Ajouter tous les disclaimers
- [ ] Vérifier mentions légales
- [ ] Tester sur mobile
- [ ] Validation accessibilité
- [ ] Test RGPD

### Phase 8: Tracking & Analytics
- [ ] Implémenter événements GA4
- [ ] Implémenter conversions Google Ads
- [ ] Implémenter pixel Facebook
- [ ] Dashboard de suivi (optionnel)

---

## 📞 Contact & Support

**Questions sur cette spécification:**
- Référence: TUNNEL_SOUSCRIPTION_MAXIMUSSCPI v1.0
- Date de création: 2025-01-XX
- Statut: En attente d'intégration PSI Intencial Patrimoine

**Prochaines étapes:**
1. Validation de la spécification par l'équipe
2. Récupération de l'URL et de l'API du PSI Intencial Patrimoine
3. Développement du tunnel selon cette spécification
4. Tests de conformité CIF/AMF
5. Tests utilisateurs
6. Déploiement progressif (A/B testing recommandé)

---

**Fin du document**



