# Router des agents — MaximusSCPI

## Comment utiliser ce fichier
Pour chaque demande, identifie la nature de la mission → sélectionne l'agent → utilise le template correspondant.

---

## Table de routage

| Nature de la demande | Agent | Template |
|---|---|---|
| Mots-clés, briefs articles, méta, maillage, visibilité IA | 01 — SEO | `templates/seo-task.md` |
| Script vidéo, brief tournage, description YouTube | 02 — Vidéo | `templates/video-task.md` |
| Données SCPI, fiche normalisée, comparatif | 03 — Data | `templates/data-task.md` |
| Audit conformité, checklist CIF, mentions légales | 04 — Conformité | `templates/conformity-task.md` |
| Parcours CRM, email, séquence, RGPD | 05 — CRM | `templates/crm-task.md` |
| Validation UX, scoring SEO, validation avant modification site | 06 — Validation | — |
| Modification code, correctif technique, audit dev | 00 → Cursor | `templates/dev-task.md` |
| Mission transverse ou arbitrage entre agents | 00 — Superviseur | — |

---

## Règles de routage

1. **Une mission = un agent principal.** Si deux agents sont impliqués, le superviseur (00) arbitre.
2. **Toute mission touchant le code (`src/`) passe par `dev-task.md`** et requiert une validation avant modification.
3. **Toute mission data cite obligatoirement sa source** (DIC, bulletin, rapport annuel, ASPIM).
4. **Toute mission éditoriale (SEO, vidéo, CRM) passe par la conformité (04)** avant diffusion si elle contient des chiffres SCPI ou des comparatifs.
5. **Tout livrable prêt à implémenter passe par l'Agent 06** pour scoring avant modification du site.
6. **Toute tâche est inscrite dans `tasks/backlog.md`** avant d'être exécutée.

---

## Format d'activation d'un agent

```
AGENT ACTIVÉ : [00 à 06 ou Cursor]
MISSION : [description courte]
TEMPLATE : [nom du fichier template]
TÂCHE BACKLOG : [référence dans tasks/backlog.md]
FICHIERS À CONSULTER : [liste — max 5 sans validation]
VALIDATION AGENT 06 REQUISE : oui / non
VALIDATION HUMAINE REQUISE AVANT MODIFICATION : oui / non
```
