# 🎨 Schéma Visuel du Tunnel de Souscription

## Vue d'ensemble du parcours

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAGE D'ACCUEIL                                │
│              (Comparateur FintechComparator)                     │
│                                                                   │
│  [Recherche] [Filtres] [51 SCPI disponibles]                    │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ SCPI 1   │  │ SCPI 2   │  │ SCPI 3   │                     │
│  │ [✓]      │  │ [ ]      │  │ [✓]      │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
│                                                                   │
│  Sidebar: 2 SCPI sélectionnées                                  │
│  [Valider ma sélection] ← CTA PRINCIPAL                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 1 : VALIDATION DU PORTEFEUILLE                           │
│  ───────────────────────────────────────────────────────────    │
│                                                                   │
│  ✓ Validation de votre sélection                                │
│                                                                   │
│  Récapitulatif:                                                  │
│  • Activimmo (5.5%)                                              │
│  • Iroko Zen (5.1%)                                             │
│  Rendement moyen: 5.3%                                          │
│                                                                   │
│  ⚠️ Recommandation: Au moins 3 SCPI pour diversification       │
│                                                                   │
│  Allocation:                                                     │
│  [Slider 50%] Activimmo                                          │
│  [Slider 50%] Iroko Zen                                          │
│                                                                   │
│  Simulation: 50K€ → 2 650€/an                                   │
│                                                                   │
│  [Définir mon investissement] ← CTA                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 2 : PARAMÉTRAGE INVESTISSEMENT                           │
│  ───────────────────────────────────────────────────────────    │
│                                                                   │
│  💰 Définir mon investissement                                   │
│                                                                   │
│  Montant: [50 000] €                                             │
│  [10K] [25K] [50K] [100K]                                        │
│                                                                   │
│  Répartition:                                                    │
│  [Slider 33%] Activimmo → 16 500€                               │
│  [Slider 33%] Corum → 16 500€                                   │
│  [Slider 34%] Iroko → 17 000€                                   │
│                                                                   │
│  Mode: ○ Direct  ○ AV  ○ PER                                    │
│  Horizon: [5] [10] [15] [20] ans                                │
│                                                                   │
│  📊 Projection 15 ans:                                          │
│  [Graphique barres]                                              │
│  Capital: 50K€ | Revenus: 41K€ | Total: 91K€                    │
│                                                                   │
│  ⚠️ Projection indicative, non garantie                          │
│                                                                   │
│  [Continuer vers la souscription] ← CTA                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 3 : RECUEIL MINIMAL PRÉ-PSI                              │
│  ───────────────────────────────────────────────────────────    │
│                                                                   │
│  📝 Finaliser ma demande                                         │
│                                                                   │
│  Récapitulatif: 3 SCPI • 50K€ • Direct • 15 ans                 │
│                                                                   │
│  Vos informations:                                               │
│  [Monsieur ▼]                                                    │
│  Nom: [_____________] *                                          │
│  Prénom: [_____________] *                                       │
│  Email: [_____________] *                                        │
│  Téléphone: [_____________] (recommandé)                          │
│                                                                   │
│  Montant: [50 000] € (modifiable)                                │
│                                                                   │
│  ☑ J'accepte de recevoir des emails                             │
│  ☑ Je souhaite être accompagné(e)                               │
│                                                                   │
│  ⚠️ Redirection vers questionnaire réglementaire                │
│                                                                   │
│  [Finaliser ma demande] ← CTA                                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 4 : REDIRECTION PSI INTENCIAL                             │
│  ───────────────────────────────────────────────────────────    │
│                                                                   │
│  ✓ Demande enregistrée                                           │
│                                                                   │
│  Merci pour votre confiance !                                    │
│  Récapitulatif envoyé par email                                  │
│                                                                   │
│  Prochaine étape:                                                │
│  Questionnaire réglementaire (10-15 min)                         │
│                                                                   │
│  [Continuer vers le questionnaire] ← CTA                        │
│                                                                   │
│  💡 Besoin d'aide? [Contacter un conseiller]                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    [PSI INTENCIAL PATRIMOINE]
                    (Questionnaire réglementaire)
```

## Points de friction identifiés & solutions

### 🔴 Friction 1: Sélection de SCPI
**Problème:** Trop de choix (51 SCPI) → paralysie du choix  
**Solution:** 
- Filtres intelligents pré-configurés
- Recommandations basées sur profil
- Limite visuelle: "Commencez par 3-5 SCPI"

### 🔴 Friction 2: Allocation manuelle
**Problème:** Sliders complexes, peur de mal faire  
**Solution:**
- Allocation automatique égale par défaut
- Option "Répartition équilibrée" en 1 clic
- Validation visuelle (somme = 100%)

### 🔴 Friction 3: Montant à investir
**Problème:** Indécision sur le montant  
**Solution:**
- Presets visuels (10K, 25K, 50K, 100K)
- Simulation en temps réel
- Message: "Vous pourrez ajuster plus tard"

### 🔴 Friction 4: Formulaire long
**Problème:** Peur de donner ses coordonnées  
**Solution:**
- Formulaire minimal (4 champs obligatoires)
- Téléphone optionnel mais recommandé
- Message de sécurité visible

### 🔴 Friction 5: Redirection PSI
**Problème:** Peur de perdre ses données, questionnaire long  
**Solution:**
- Récapitulatif envoyé par email immédiatement
- Message rassurant sur la durée (10-15 min)
- Option d'accompagnement visible

## Optimisations UX par écran

### Écran 1: Validation
- ✅ Progression visible (1/4)
- ✅ Bouton "Modifier" sur chaque SCPI
- ✅ Warning visuel si < 3 SCPI (mais pas bloquant)
- ✅ Simulation rapide pour rassurer

### Écran 2: Paramétrage
- ✅ Progression visible (2/4)
- ✅ Presets montants en boutons visuels
- ✅ Sliders avec feedback visuel (€ et parts)
- ✅ Graphique projection (mais disclaimer fort)

### Écran 3: Recueil
- ✅ Progression visible (3/4)
- ✅ Formulaire court (4 champs)
- ✅ Téléphone optionnel (réduit friction)
- ✅ Checkbox accompagnement (non bloquant)

### Écran 4: Redirection
- ✅ Progression visible (4/4)
- ✅ Confirmation immédiate
- ✅ Email de récap envoyé
- ✅ Message rassurant sur la suite

## États d'erreur & validation

### Validation étape 1
```
❌ Erreur: Allocation totale = 95%
✅ Solution: "La somme doit être égale à 100%. Ajustez les curseurs."
```

### Validation étape 2
```
❌ Erreur: Montant < minimum (3 000€)
✅ Solution: "Le montant minimum est de 3 000€ selon vos SCPI sélectionnées."
```

### Validation étape 3
```
❌ Erreur: Email invalide
✅ Solution: "Veuillez entrer une adresse email valide (ex: nom@example.com)"
```

## Messages de succès

### Après étape 1
```
✅ Portefeuille validé !
Vous pouvez maintenant définir votre investissement.
```

### Après étape 2
```
✅ Paramètres enregistrés !
Il ne reste plus qu'à finaliser quelques informations.
```

### Après étape 3
```
✅ Demande enregistrée !
Vous allez être redirigé vers le questionnaire réglementaire.
```

## Indicateurs de progression

```
Étape 1: [████████░░] 25%
Étape 2: [████████████░░] 50%
Étape 3: [████████████████░░] 75%
Étape 4: [████████████████████] 100%
```

---

**Document complémentaire au TUNNEL_SOUSCRIPTION_MAXIMUSSCPI.md**



