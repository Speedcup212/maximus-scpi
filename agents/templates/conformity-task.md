# Template — Mission Conformité CIF (Agent 04)

## Cycle obligatoire
1. Diagnostic → 2. Fichiers nécessaires → 3. Attente validation → 4. Rapport ciblé

> Cet agent produit des alertes et recommandations internes.
> Il ne remplace pas un avocat, une RCCI ou une validation réglementaire externe.

---

## À remplir par l'opérateur

```
COMPOSANT / PAGE CIBLÉ : 
TYPE DE CONTENU : [simulateur / article / email / landing page / comparatif / autre]
RISQUE PRESSENTI : [promesse rendement / recommandation sans recueil / données non sourcées / absence disclaimer / autre]
```

---

## Étape 1 — Diagnostic (lecture seule)

Fichiers à consulter (max 5, lister avant d'ouvrir) :
- [ ] Composant ciblé
- [ ] `src/components/DisclaimerBox.tsx` si disclaimer concerné
- [ ] `src/components/LegalFooter.tsx` ou `Footer.tsx` si footer concerné
- [ ] Fichier data associé si chiffres SCPI présents
- [ ] Autre : ___

Attendre validation avant ouverture.

---

## Étape 2 — Checklist de conformité

### Mentions obligatoires
- [ ] "Les performances passées ne préjugent pas des performances futures."
- [ ] "Investir en SCPI comporte des risques, dont la perte en capital."
- [ ] "Les revenus ne sont pas garantis."
- [ ] "La liquidité peut être limitée."
- [ ] Distinction information générale / pédagogie / conseil personnalisé visible

### Formulations interdites
- [ ] Aucune promesse de rendement futur
- [ ] Aucune SCPI présentée comme "garantie", "sûre" ou "sans risque"
- [ ] Aucune recommandation personnalisée sans recueil préalable
- [ ] Aucune formulation type "la meilleure SCPI" sans réserve

### Sources et données
- [ ] Chaque chiffre SCPI cité est sourcé (DIC / bulletin / rapport / ASPIM)
- [ ] Date de référence présente
- [ ] Pas d'extrapolation de performance future

---

## Étape 3 — Rapport de non-conformité

```
COMPOSANT : 
POINT LITIGIEUX : 
NIVEAU DE RISQUE : [Faible / Modéré / Élevé / Bloquant]
CORRECTION PROPOSÉE : 
MENTIONS MANQUANTES : [oui / non — préciser]
STATUT : [Conforme / À corriger / Bloqué]
MODIFICATION NÉCESSAIRE : [oui / non]
PRIORITÉ : [P0 / P1 / P2]
```
