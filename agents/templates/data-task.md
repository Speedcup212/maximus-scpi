# Template — Mission Data SCPI (Agent 03)

## Cycle obligatoire
1. Diagnostic → 2. Fichiers nécessaires → 3. Attente validation → 4. Livrable sourcé

---

## À remplir par l'opérateur

```
SCPI CONCERNÉE(S) : 
INDICATEUR(S) RECHERCHÉ(S) : [taux de distribution / TOF / capitalisation / délai jouissance / autre]
SOURCE DISPONIBLE : [DIC / bulletin trimestriel / rapport annuel / ASPIM / société de gestion]
DATE DE RÉFÉRENCE : 
```

---

## Étape 1 — Diagnostic (lecture seule)

Fichiers à consulter (max 5, lister avant d'ouvrir) :
- [ ] `src/data/scpiData.ts` (début uniquement si fichier long)
- [ ] `src/data/scpiDataExtended.ts` si données étendues
- [ ] Fichier JSON SCPI concerné (`scpi_complet.json`, etc.)
- [ ] Bulletin trimestriel si disponible dans `/scripts/`
- [ ] Autre : ___

Attendre validation avant ouverture.

---

## Étape 2 — Règles de sourçage obligatoires

Sources prioritaires (dans cet ordre) :
1. DIC (Document d'Information Clé)
2. Note d'information AMF
3. Bulletin trimestriel de la société de gestion
4. Rapport annuel
5. Site officiel de la société de gestion
6. Données ASPIM

**Interdit :** inventer, extrapoler, estimer un chiffre non publié par une source officielle.

---

## Étape 3 — Livrable attendu

Choisir le type :
- [ ] Fiche SCPI normalisée
- [ ] Tableau comparatif multi-SCPI
- [ ] Alerte données périmées ou manquantes
- [ ] Synthèse sectorielle

---

## Format de réponse

```
TYPE : [Fiche / Comparatif / Alerte / Synthèse]
SCPI : 
INDICATEUR : 
SOURCE : 
DATE DE RÉFÉRENCE : 
MENTION RÉGLEMENTAIRE INCLUSE : [oui / non]
CONFORMITÉ : [validée / à vérifier]
```

> Mention obligatoire sur chaque livrable :
> "Les performances passées ne préjugent pas des performances futures.
> Investir en SCPI comporte des risques, dont la perte en capital."
