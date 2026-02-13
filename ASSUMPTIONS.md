# Impact fiscal SCPI — Hypothèses & limites

Ce document décrit les hypothèses de calcul utilisées par le simulateur
« Impact fiscal SCPI : Direct IR vs SCI IR vs SCI IS vs Holding IS ».

## 1) Hypothèses SCPI
- Rendement annuel brut constant sur toute la période.
- Revalorisation annuelle constante des parts.
- Frais de souscription capitalisés dans le prix de revient.
- Frais de cession appliqués au prix de vente à la sortie.
- Option d’indexation du rendement (inflation) appliquée de façon linéaire.

## 2) Crédit
- Crédit amortissable classique.
- Calcul mensualisé, agrégé au niveau annuel.
- Intérêts et assurance pris en compte comme charges déductibles.

## 3) Direct IR et SCI IR
- Régime réel (revenus fonciers).
- Base taxable = revenus SCPI – charges – intérêts – assurance.
- Déficits (mode simplifié) : report sur revenus fonciers futurs.
- Déficits (mode strict) : poche « hors intérêts » limitée au plafond, intérêts reportables.
- Plus-value de cession : régime des particuliers avec abattements IR/PS.

## 4) SCI IS
- Produits = revenus SCPI encaissés.
- Charges = frais + compta + intérêts + assurance.
- Parts SCPI non amorties (actif financier).
- IS : taux normal 25% et option de taux réduit 15% (conditions simplifiées).
- Distribution facultative : PFU sur dividendes versés au foyer.
- Plus-value de cession : taxation à l’IS, sans abattement.

## 5) Holding IS (SAS/SASU)
- Même mécanique IS que SCI IS.
- Frais fixes de holding intégrés.
- Distribution à la personne physique : PFU.
- Extension mère-fille non activée (roadmap).

## 6) Politique de distribution
- Taux fixe : distribution = % du cash net annuel.
- Couvrir l’annuité : distribution = annuité (intérêt + principal + assurance) dans la limite du cash.
- Couvrir les impôts : distribution = impôts estimés dans la limite du cash.
- Distribution annuelle ou uniquement à la sortie.

## 7) Précision des calculs
- Tous les montants fiscaux sont calculés en décimal (Decimal.js).
- Arrondi au centime appliqué à chaque impôt annuel.

## 8) Limites
- Fiscalité évolutive : l’utilisateur doit ajuster les paramètres annuels.
- Simulateur informatif, sans recommandation d’investissement.
