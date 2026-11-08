# RECOVERY-193 — TOF ASPIM sur bulletin officiel (08/11/2026)

## Décision

Le libellé « TOF ASPIM » n'est plus, à lui seul, un motif de rejet. Il identifie une méthodologie de calcul, pas la qualité de la source.

Un chiffre peut être **candidat à la certification** si le bulletin officiel est celui de la même SCPI, sur un domaine ou CDN déclaré pour elle, et si la période, la valeur globale de TOF, la page PDF, le SHA-256 et le libellé sont vérifiables. L'admission financière exige la QA indépendante effective. Un candidat n'est jamais un certificat.

## Refus maintenus

- Agrégateur, miroir ou source non reliée à l'émetteur par une preuve explicite.
- Reconstitution, estimation, interpolation, TOP ou moyenne prise pour le TOF du trimestre.
- Composante de vacance, locaux occupés hors franchises ou autre sous-composante prise pour le TOF global.
- Identité, période, page, valeur ou empreinte absente/contradictoire.
- Contradiction sémantique, fraude documentaire ou QA non achevée.

## Évolution technique

- Le classificateur SQL `scpi_internal.tof_bulletin_source_rejection_reason` n'interdit plus la chaîne « TOF ASPIM » ; les autres motifs restent inchangés.
- Les collecteurs Netlify et Edge conservent désormais les valeurs candidates plutôt que de les supprimer du résultat d'extraction. La QA indépendante demeure obligatoire et aucune promotion publique n'est faite par l'extraction seule.
- La quarantaine historique `scpi_internal.tof_policy_quarantine_audit_20261028` n'est ni supprimée, ni blanchie. Les anciennes lignes `invalid_tof_bulletin_source_policy` restent invalides jusqu'à une recertification justifiée par PDF original, SHA, identité, période, page, valeur globale et validation indépendante.
- Les fonctions de garde sur les composants de vacance, le contrôle de publication atomique et le compteur strict PASS_100 restent inchangés.

## Admission avant production

1. CI complète et tests anti-régression : émetteur + ASPIM admissible à la QA, miroir interdit, valeur dérivée interdite, vacance ≠ TOF.
2. Migration SQL exécutée avec assertions transactionnelles, suivie d'un readback sur la fonction active et les triggers de vacance.
3. Rejouer une ingestion sur document officiel en mode candidat ; aucun nouveau certificat, PASS ni publication automatique.
4. Auditer séparément les 37 anciens certificats marqués `quarantined_TOF_ASPIM_FORBIDDEN`/`blocked_TOF_ASPIM_FORBIDDEN`. Ne pas changer leur état par simple mise à jour de la politique.

État jusqu'aux preuves : NO GO pour recertification historique automatique et déploiement non testé.
