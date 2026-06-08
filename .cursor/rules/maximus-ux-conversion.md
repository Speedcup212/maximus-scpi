# MaximusSCPI — UX et conversion

## Objectif

Maximiser la conversion de prospects froids en **leads qualifiés** via Calendly, sans sacrifier la conformité CIF.

## Parcours de conversion cible

```
Homepage (Hero + Quiz) → Résultat pré-audit → Calendly
                      → Comparateur SCPI → Sélection → Calendly
                      → Page thématique → CTA → Calendly
```

## Principes UX

1. **Parcours simples** — maximum 4 clics entre arrivée et CTA Calendly.
2. **Pas de modals inutiles** — liens Calendly directs (`target="_blank"`), pas de modal intermédiaire.
3. **CTA clairs** — un CTA primaire vert par section, libellé actionnable.
4. **Preuve sociale factuelle** — chiffres vérifiables uniquement (pas de placeholders en production).
5. **Mobile-first** — le quiz et le comparateur doivent fonctionner sur mobile.
6. **Charge cognitive limitée** — homepage max 5 sections visibles avant le footer.

## CTA autorisés

| CTA | Destination | Style |
|---|---|---|
| « Valider ma sélection avec un expert » | Calendly (nouvel onglet) | Bouton vert plein |
| « Prendre RDV » | Calendly (nouvel onglet) | Bouton vert |
| « Voir le comparateur complet » | `/comparateur-scpi` | Lien texte souligné |
| « Démarrer l'analyse » | Scroll vers quiz (mobile) | Bouton vert |
| Bouton flottant calendrier | Calendly (nouvel onglet) | Icône fixe |

## Homepage — structure validée

1. Hero + Quiz intégré
2. Bloc Eric Bellaiche + accréditations
3. Témoignages + CTA Calendly
4. Preuve sociale (non chiffrée)
5. Teaser comparateur

## Interdits UX

- Sacrifier la conformité pour la conversion (pas de « rendement garanti » pour convertir).
- Multiplier les CTA Calendly dans une même section (1 CTA prominent max).
- Réintroduire des modals de contact quand Calendly suffit.
- Afficher le comparateur complet sur la homepage (trop lourd).

## Agent responsable

`agents/UX_CONVERSION_AGENT.md`
