# MaximusSCPI — arbitrage d'un écart documentaire mineur

**Statut : règle opératoire.** Ce n'est ni une autorisation de publication, ni une tolérance sur les mesures financières.

## Hiérarchie pour une répartition sectorielle/géographique

1. **Bulletin trimestriel officiel figé, de la période exacte**, avec nom de SCPI, URL primaire, SHA-256, numéro de page, valeur et libellé contrôlés : source canonique publiée pour cette période.
2. **Site actuel de l'émetteur** (synthèse susceptible d'être modifiée sans versionnement) : source de corroboration et de détection des divergences, **pas un remplacement implicite du bulletin daté**.
3. **Sites spécialisés tiers** : corroborations, jamais source primaire suffisante à elles seules.

Un total de 99 % ou 101 % peut résulter d'arrondis indépendants, mais cette cause doit rester une **hypothèse** tant qu'elle n'est pas vérifiée. Ne jamais modifier une valeur pour forcer le total à 100 % ; préserver le total déclaré par la source et afficher le champ avec la provenance.

## Règle de non-blocage pour les données d'allocation

Si deux publications de l'émetteur sont comparables (SCPI, périmètre, date, unité, poids de la *valeur du patrimoine* identiques), mais divergent de **1 point de pourcentage maximum**, on peut retenir **sans blocage de la valeur concernée** celle du bulletin périodique lorsque :
- identité du document, empreinte, page, couple *libellé et pourcentage* vérifiés ;
- la valeur retenue concorde avec le registre canonique et une corroboration indépendante fiable (ou une lecture visuelle directe du PDF) ;
- le dossier conserve l'autre valeur, les deux URLs, la date/période, la différence et le motif de préséance ;
- les autres lignes de la répartition sont sourcées et les totaux reflètent réellement les valeurs retenues ;
- les indicateurs financiers, les frais, la dette, la liquidité, DIC/SFDR et risques réglementaires **ne bénéficient d'aucune tolérance numérique de ce type**.

L'écart devient `nonblocking_documentary_conflict_with_evidence` dans l'audit de la source. Ne pas appeler cette décision une signature indépendante de conformité. **Une divergence non comparable, non sourcée, supérieure à 1 point, ou impliquant un changement d'unité/périmètre reste une exception**. Ne pas résoudre automatiquement un pays dont les pourcentages sont permutés (exemple Eurion), même si la somme vaut 100 %.

La publication finale reste régie par les cinq gates uniques (sources, calculs, exceptions, toutes les surfaces Iroko Atlas, Netlify atomique) et `scpi_candidate_final_release_v1`, qui ne doivent **jamais** être contournés.

## Cas vérifié 17/10/2026 : CORUM XL, Bureaux

- Bulletin officiel 2026-T2, p.4, empreinte `fbac6a2efac56bc75bd90f4548656a7bdff86ab22f6d81e0a3c715e21cd819cd` : **55 %**. L'OCR enregistré contient la suite sectorielle *55, 18, 14, 6, 4, 2, 1*. Valeurs présentes dans les indicateurs canoniques, total 100 %.
- Page CORUM Patrimoine « au 30/06/2026 » : **54 %**, et somme des sept valeurs publiées : 99 %.
- [ChoixSCPI](https://www.choixscpi.fr/scpi/corum-xl/) et [Ateis Patrimoine](https://ateispatrimoine.com/scpi/corum-xl/) relaient 55 % au 30/06/2026.
- Arbitrage : valeur retenue 55 % du bulletin figé, écart de 1 pp sur la page synthétique consigné sans en supposer la cause. Le champ d'allocation peut être techniquement validé, **pas la SCPI entière**. Les huit pays encore non prouvés restent `needs_review`.

Voir migration `20261017_corum_xl_one_point_official_source_arbitration.sql` et sa preuve conservée dans `scpi_candidate_final_review.review_evidence.source_arbitrations`.
