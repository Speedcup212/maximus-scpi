# TASK-001 — Audit conformité simulateur crédit SCPI
**Date :** 15/05/2026
**Agent :** 04 — Conformité CIF + Cursor
**Fichier audité :** `src/components/ScpiCreditSimulator.tsx`
**Statut :** ✅ Corrigé

---

## Risques détectés et corrections appliquées

| ID | Niveau | Problème | Correction |
|----|--------|----------|------------|
| R1 | P0 | Absence d'avertissement spécifique sur le risque de levier crédit | Bloc orange ajouté dans la synthèse projet |
| R2 | P0 | `DisclaimerBox` standard non utilisé | Importé et ajouté avant le disclaimer custom |
| R3 | P1 | "Patrimoine net estimé" sans mention hypothèses | Mention "non garanti et non contractuel" ajoutée |
| R4 | P1 | TRI affiché sans avertissement sensibilité | Avertissement complet ajouté sous le TRI |
| R5 | P1 | Revalorisation annuelle sans mention hypothèse | Mention ajoutée dans la description du slider |
| R6 | P2 | "variabilité des revenus" insuffisant | Remplacé par "revenus non garantis" |

---

## Formulations ajoutées

**Levier crédit (P0) :**
> "Le recours au crédit augmente l'exposition au risque. En cas de baisse des revenus distribués par les SCPI ou de baisse de la valeur des parts, les mensualités de crédit restent dues. L'effet de levier peut amplifier les gains comme les pertes et générer un effort d'épargne supérieur aux hypothèses initiales."

**Patrimoine net (P1) :**
> "Montant théorique calculé selon les hypothèses saisies, non garanti et non contractuel."

**TRI (P1) :**
> "Le TRI dépend fortement des hypothèses de rendement, de revalorisation, de fiscalité, de durée de détention et de conditions de revente. Il ne constitue pas une performance future garantie."

**Revalorisation (P1) :**
> "La revalorisation annuelle est une hypothèse de simulation. Elle peut être nulle ou négative."

---

## Ce qui n'a pas été modifié
- Aucun calcul, aucune hypothèse par défaut, aucun design global.
- Le disclaimer custom existant a été conservé et complété par `DisclaimerBox`.

---

## Recommandation post-correction
- Vérification visuelle recommandée sur le dev server.
- Build recommandé avant déploiement.
- Commit à valider par l'utilisateur.
