# Audit global des indicateurs SCPI

_Généré le 2026-06-07T21:00:01.167Z_

Toutes les valeurs proviennent du résolveur unique `resolveScpiIndicator` (registre `scpiIndicatorRegistry`).

## Synthèse

- SCPI visibles contrôlées : **63**
- Indicateurs au registre : **29**
- Total contrôles (SCPI × indicateurs) : **1827**
- OK : **1125**
- WARNING : **702**
- CRITICAL : **0**

### Condition bloquante : CRITICAL = 0 → ✅ VALIDÉ

## Anomalies par indicateur

### Valeur de retrait (`valeur_retrait` — important)
Surfaces : ScpiDetailPage, AnalysisDetailModal
CRITICAL : 0 · WARNING : 1

- **Novaxia NEO** — WARNING : Donnée absente (aucune source disponible)

### Valeur de reconstitution (par part) (`valeur_reconstitution` — critical)
Surfaces : AnalysisDetailModal, AnalysisModal, ScpiDetailPage, SelectionSidebar
CRITICAL : 0 · WARNING : 1

- **Rivoli Avenir Patrimoine** — WARNING : Donnée absente (aucune source disponible)

### Valeur de réalisation (`valeur_realisation` — secondary)
Surfaces : ScpiDetailPage
CRITICAL : 0 · WARNING : 8

- **NCap Continent** — WARNING : Donnée absente (aucune source disponible)
- **Wemo One** — WARNING : Donnée absente (aucune source disponible)
- **Epsicap Nano** — WARNING : Donnée absente (aucune source disponible)
- **Alta Convictions** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Rente** — WARNING : Donnée absente (aucune source disponible)
- **Rivoli Avenir Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Pierval Santé** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Agora** — WARNING : Donnée absente (aucune source disponible)

### Décote / Surcote (`decote_surcote` — critical)
Surfaces : ScpiTable, ComparisonTable, AnalysisDetailModal, AnalysisModal, ScpiDetailPage, OptimizedScpiLandingPage, SelectionSidebar, scpiAnalysis
CRITICAL : 0 · WARNING : 7

- **Aestiam Cap'Hebergimmo** — WARNING : Prix ou valeur de reconstitution affichée absent/non comparable
- **Edissimo** — WARNING : Statut QA manual_review → neutralisée (à vérifier)
- **Novapierre Résidentiel** — WARNING : Prix ou valeur de reconstitution affichée absent/non comparable
- **Novaxia NEO** — WARNING : Statut QA manual_review → neutralisée (à vérifier)
- **Optimale** — WARNING : Statut QA manual_review → neutralisée (à vérifier)
- **Remake Live** — WARNING : Statut QA manual_review → neutralisée (à vérifier)
- **Rivoli Avenir Patrimoine** — WARNING : Statut QA manual_review → neutralisée (à vérifier)

### Taux d'occupation physique (`top` — secondary)
Surfaces : ScpiDetailPage
CRITICAL : 0 · WARNING : 63

- **Activimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Cap'Hebergimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Pierre Rendement** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Horizon** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Cadence 12** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Commerces** — WARNING : Donnée absente (aucune source disponible)
- **Atream Hotel** — WARNING : Donnée absente (aucune source disponible)
- **Buroboutic Métropoles** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de Région** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de ville** — WARNING : Donnée absente (aucune source disponible)
- **Coeur d'Europe** — WARNING : Donnée absente (aucune source disponible)
- **Comète** — WARNING : Donnée absente (aucune source disponible)
- **Crédit Mutuel Pierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Life** — WARNING : Donnée absente (aucune source disponible)
- **Edissimo** — WARNING : Donnée absente (aucune source disponible)
- **Efimmo 1** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Croissance Impact** — WARNING : Donnée absente (aucune source disponible)
- **Perial Grand Paris** — WARNING : Donnée absente (aucune source disponible)
- **NCap Régions** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Novaxia NEO** — WARNING : Donnée absente (aucune source disponible)
- **Opportunité Immo** — WARNING : Donnée absente (aucune source disponible)
- **Optimale** — WARNING : Donnée absente (aucune source disponible)
- **Paref Evo** — WARNING : Donnée absente (aucune source disponible)
- **Paref Hexa** — WARNING : Donnée absente (aucune source disponible)
- **GMA Essentialis** — WARNING : Donnée absente (aucune source disponible)
- **Grand Paris Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Immorente** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Zen** — WARNING : Donnée absente (aucune source disponible)
- **Kyaneos Pierre** — WARNING : Donnée absente (aucune source disponible)
- **LF Avenir Santé** — WARNING : Donnée absente (aucune source disponible)
- **LF Europimmo** — WARNING : Donnée absente (aucune source disponible)
- **LF Grand Paris Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Log In** — WARNING : Donnée absente (aucune source disponible)
- **NCap Education Santé** — WARNING : Donnée absente (aucune source disponible)
- **Remake Live** — WARNING : Donnée absente (aucune source disponible)
- **Perial Opportunités Europe** — WARNING : Donnée absente (aucune source disponible)
- **Perial O2** — WARNING : Donnée absente (aucune source disponible)
- **Perial Hospitalité Europe** — WARNING : Donnée absente (aucune source disponible)
- **Sofiprime** — WARNING : Donnée absente (aucune source disponible)
- **Selectinvest 1** — WARNING : Donnée absente (aucune source disponible)
- **Transitions Europe** — WARNING : Donnée absente (aucune source disponible)
- **Urban Coeur de Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Foncière** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre Europe** — WARNING : Donnée absente (aucune source disponible)
- **ESG Pierre Capital** — WARNING : Donnée absente (aucune source disponible)
- **Ficommerce Proximité** — WARNING : Donnée absente (aucune source disponible)
- **Foncière des Praticiens** — WARNING : Donnée absente (aucune source disponible)
- **Selectipierre 2** — WARNING : Donnée absente (aucune source disponible)
- **NCap Continent** — WARNING : Donnée absente (aucune source disponible)
- **Wemo One** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Atlas** — WARNING : Donnée absente (aucune source disponible)
- **Epsicap Nano** — WARNING : Donnée absente (aucune source disponible)
- **Alta Convictions** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Rente** — WARNING : Donnée absente (aucune source disponible)
- **Rivoli Avenir Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Primovie** — WARNING : Donnée absente (aucune source disponible)
- **Praemia Hôtels Europe** — WARNING : Donnée absente (aucune source disponible)
- **Pierval Santé** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Agora** — WARNING : Donnée absente (aucune source disponible)

### Report à nouveau (`ran` — secondary)
Surfaces : ScpiDetailPage
CRITICAL : 0 · WARNING : 63

- **Activimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Cap'Hebergimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Pierre Rendement** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Horizon** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Cadence 12** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Commerces** — WARNING : Donnée absente (aucune source disponible)
- **Atream Hotel** — WARNING : Donnée absente (aucune source disponible)
- **Buroboutic Métropoles** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de Région** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de ville** — WARNING : Donnée absente (aucune source disponible)
- **Coeur d'Europe** — WARNING : Donnée absente (aucune source disponible)
- **Comète** — WARNING : Donnée absente (aucune source disponible)
- **Crédit Mutuel Pierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Life** — WARNING : Donnée absente (aucune source disponible)
- **Edissimo** — WARNING : Donnée absente (aucune source disponible)
- **Efimmo 1** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Croissance Impact** — WARNING : Donnée absente (aucune source disponible)
- **Perial Grand Paris** — WARNING : Donnée absente (aucune source disponible)
- **NCap Régions** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Novaxia NEO** — WARNING : Donnée absente (aucune source disponible)
- **Opportunité Immo** — WARNING : Donnée absente (aucune source disponible)
- **Optimale** — WARNING : Donnée absente (aucune source disponible)
- **Paref Evo** — WARNING : Donnée absente (aucune source disponible)
- **Paref Hexa** — WARNING : Donnée absente (aucune source disponible)
- **GMA Essentialis** — WARNING : Donnée absente (aucune source disponible)
- **Grand Paris Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Immorente** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Zen** — WARNING : Donnée absente (aucune source disponible)
- **Kyaneos Pierre** — WARNING : Donnée absente (aucune source disponible)
- **LF Avenir Santé** — WARNING : Donnée absente (aucune source disponible)
- **LF Europimmo** — WARNING : Donnée absente (aucune source disponible)
- **LF Grand Paris Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Log In** — WARNING : Donnée absente (aucune source disponible)
- **NCap Education Santé** — WARNING : Donnée absente (aucune source disponible)
- **Remake Live** — WARNING : Donnée absente (aucune source disponible)
- **Perial Opportunités Europe** — WARNING : Donnée absente (aucune source disponible)
- **Perial O2** — WARNING : Donnée absente (aucune source disponible)
- **Perial Hospitalité Europe** — WARNING : Donnée absente (aucune source disponible)
- **Sofiprime** — WARNING : Donnée absente (aucune source disponible)
- **Selectinvest 1** — WARNING : Donnée absente (aucune source disponible)
- **Transitions Europe** — WARNING : Donnée absente (aucune source disponible)
- **Urban Coeur de Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Foncière** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre Europe** — WARNING : Donnée absente (aucune source disponible)
- **ESG Pierre Capital** — WARNING : Donnée absente (aucune source disponible)
- **Ficommerce Proximité** — WARNING : Donnée absente (aucune source disponible)
- **Foncière des Praticiens** — WARNING : Donnée absente (aucune source disponible)
- **Selectipierre 2** — WARNING : Donnée absente (aucune source disponible)
- **NCap Continent** — WARNING : Donnée absente (aucune source disponible)
- **Wemo One** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Atlas** — WARNING : Donnée absente (aucune source disponible)
- **Epsicap Nano** — WARNING : Donnée absente (aucune source disponible)
- **Alta Convictions** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Rente** — WARNING : Donnée absente (aucune source disponible)
- **Rivoli Avenir Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Primovie** — WARNING : Donnée absente (aucune source disponible)
- **Praemia Hôtels Europe** — WARNING : Donnée absente (aucune source disponible)
- **Pierval Santé** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Agora** — WARNING : Donnée absente (aucune source disponible)

### Collecte nette (trimestre) (`collecte_nette` — secondary)
Surfaces : ScpiDetailPage
CRITICAL : 0 · WARNING : 58

- **Activimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Cap'Hebergimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Pierre Rendement** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Horizon** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Cadence 12** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Commerces** — WARNING : Donnée absente (aucune source disponible)
- **Atream Hotel** — WARNING : Donnée absente (aucune source disponible)
- **Buroboutic Métropoles** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de Région** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de ville** — WARNING : Donnée absente (aucune source disponible)
- **Coeur d'Europe** — WARNING : Donnée absente (aucune source disponible)
- **Crédit Mutuel Pierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Life** — WARNING : Donnée absente (aucune source disponible)
- **Edissimo** — WARNING : Donnée absente (aucune source disponible)
- **Efimmo 1** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Croissance Impact** — WARNING : Donnée absente (aucune source disponible)
- **Perial Grand Paris** — WARNING : Donnée absente (aucune source disponible)
- **NCap Régions** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Opportunité Immo** — WARNING : Donnée absente (aucune source disponible)
- **Optimale** — WARNING : Donnée absente (aucune source disponible)
- **Paref Evo** — WARNING : Donnée absente (aucune source disponible)
- **Paref Hexa** — WARNING : Donnée absente (aucune source disponible)
- **GMA Essentialis** — WARNING : Donnée absente (aucune source disponible)
- **Grand Paris Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Immorente** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Zen** — WARNING : Donnée absente (aucune source disponible)
- **Kyaneos Pierre** — WARNING : Donnée absente (aucune source disponible)
- **LF Avenir Santé** — WARNING : Donnée absente (aucune source disponible)
- **LF Europimmo** — WARNING : Donnée absente (aucune source disponible)
- **LF Grand Paris Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Log In** — WARNING : Donnée absente (aucune source disponible)
- **NCap Education Santé** — WARNING : Donnée absente (aucune source disponible)
- **Perial O2** — WARNING : Donnée absente (aucune source disponible)
- **Perial Hospitalité Europe** — WARNING : Donnée absente (aucune source disponible)
- **Sofiprime** — WARNING : Donnée absente (aucune source disponible)
- **Selectinvest 1** — WARNING : Donnée absente (aucune source disponible)
- **Urban Coeur de Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Foncière** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre Europe** — WARNING : Donnée absente (aucune source disponible)
- **ESG Pierre Capital** — WARNING : Donnée absente (aucune source disponible)
- **Ficommerce Proximité** — WARNING : Donnée absente (aucune source disponible)
- **Foncière des Praticiens** — WARNING : Donnée absente (aucune source disponible)
- **Selectipierre 2** — WARNING : Donnée absente (aucune source disponible)
- **NCap Continent** — WARNING : Donnée absente (aucune source disponible)
- **Wemo One** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Atlas** — WARNING : Donnée absente (aucune source disponible)
- **Epsicap Nano** — WARNING : Donnée absente (aucune source disponible)
- **Alta Convictions** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Rente** — WARNING : Donnée absente (aucune source disponible)
- **Rivoli Avenir Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Primovie** — WARNING : Donnée absente (aucune source disponible)
- **Praemia Hôtels Europe** — WARNING : Donnée absente (aucune source disponible)
- **Pierval Santé** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Agora** — WARNING : Donnée absente (aucune source disponible)

### Endettement (LTV) (`endettement` — important)
Surfaces : ScpiDetailPage, AnalysisDetailModal, scpiAnalysis
CRITICAL : 0 · WARNING : 3

- **Edissimo** — WARNING : Valeur invalide (masquée) : hors plage attendue [0 ; 60]
- **Cristal Rente** — WARNING : Donnée absente (aucune source disponible)
- **Rivoli Avenir Patrimoine** — WARNING : Valeur invalide (masquée) : hors plage attendue [0 ; 60]

### Nombre d'immeubles (`nombre_immeubles` — secondary)
Surfaces : ScpiDetailPage, AnalysisDetailModal
CRITICAL : 0 · WARNING : 3

- **Aestiam Cap'Hebergimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Pierre Rendement** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre Résidentiel** — WARNING : Donnée absente (aucune source disponible)

### Nombre de locataires (`nombre_locataires` — secondary)
Surfaces : ScpiDetailPage
CRITICAL : 0 · WARNING : 49

- **Aestiam Cap'Hebergimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Pierre Rendement** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Horizon** — WARNING : Donnée absente (aucune source disponible)
- **Atream Hotel** — WARNING : Donnée absente (aucune source disponible)
- **Buroboutic Métropoles** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de ville** — WARNING : Donnée absente (aucune source disponible)
- **Crédit Mutuel Pierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Life** — WARNING : Donnée absente (aucune source disponible)
- **Edissimo** — WARNING : Donnée absente (aucune source disponible)
- **Efimmo 1** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Croissance Impact** — WARNING : Donnée absente (aucune source disponible)
- **Perial Grand Paris** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Paref Evo** — WARNING : Donnée absente (aucune source disponible)
- **Paref Hexa** — WARNING : Donnée absente (aucune source disponible)
- **GMA Essentialis** — WARNING : Donnée absente (aucune source disponible)
- **Grand Paris Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Immorente** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Zen** — WARNING : Donnée absente (aucune source disponible)
- **Kyaneos Pierre** — WARNING : Donnée absente (aucune source disponible)
- **LF Avenir Santé** — WARNING : Donnée absente (aucune source disponible)
- **LF Europimmo** — WARNING : Donnée absente (aucune source disponible)
- **LF Grand Paris Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Log In** — WARNING : Donnée absente (aucune source disponible)
- **NCap Education Santé** — WARNING : Donnée absente (aucune source disponible)
- **Perial Opportunités Europe** — WARNING : Donnée absente (aucune source disponible)
- **Perial O2** — WARNING : Donnée absente (aucune source disponible)
- **Perial Hospitalité Europe** — WARNING : Donnée absente (aucune source disponible)
- **Sofiprime** — WARNING : Donnée absente (aucune source disponible)
- **Selectinvest 1** — WARNING : Donnée absente (aucune source disponible)
- **Urban Coeur de Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Foncière** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre Europe** — WARNING : Donnée absente (aucune source disponible)
- **Ficommerce Proximité** — WARNING : Donnée absente (aucune source disponible)
- **Selectipierre 2** — WARNING : Donnée absente (aucune source disponible)
- **NCap Continent** — WARNING : Donnée absente (aucune source disponible)
- **Wemo One** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Atlas** — WARNING : Donnée absente (aucune source disponible)
- **Epsicap Nano** — WARNING : Donnée absente (aucune source disponible)
- **Alta Convictions** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Rente** — WARNING : Donnée absente (aucune source disponible)
- **Rivoli Avenir Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Primovie** — WARNING : Donnée absente (aucune source disponible)
- **Praemia Hôtels Europe** — WARNING : Donnée absente (aucune source disponible)
- **Pierval Santé** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Agora** — WARNING : Donnée absente (aucune source disponible)

### Surface du patrimoine (`surface` — secondary)
Surfaces : ScpiDetailPage
CRITICAL : 0 · WARNING : 63

- **Activimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Cap'Hebergimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Pierre Rendement** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Horizon** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Cadence 12** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Commerces** — WARNING : Donnée absente (aucune source disponible)
- **Atream Hotel** — WARNING : Donnée absente (aucune source disponible)
- **Buroboutic Métropoles** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de Région** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de ville** — WARNING : Donnée absente (aucune source disponible)
- **Coeur d'Europe** — WARNING : Donnée absente (aucune source disponible)
- **Comète** — WARNING : Donnée absente (aucune source disponible)
- **Crédit Mutuel Pierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Life** — WARNING : Donnée absente (aucune source disponible)
- **Edissimo** — WARNING : Donnée absente (aucune source disponible)
- **Efimmo 1** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Croissance Impact** — WARNING : Donnée absente (aucune source disponible)
- **Perial Grand Paris** — WARNING : Donnée absente (aucune source disponible)
- **NCap Régions** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Novaxia NEO** — WARNING : Donnée absente (aucune source disponible)
- **Opportunité Immo** — WARNING : Donnée absente (aucune source disponible)
- **Optimale** — WARNING : Donnée absente (aucune source disponible)
- **Paref Evo** — WARNING : Donnée absente (aucune source disponible)
- **Paref Hexa** — WARNING : Donnée absente (aucune source disponible)
- **GMA Essentialis** — WARNING : Donnée absente (aucune source disponible)
- **Grand Paris Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Immorente** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Zen** — WARNING : Donnée absente (aucune source disponible)
- **Kyaneos Pierre** — WARNING : Donnée absente (aucune source disponible)
- **LF Avenir Santé** — WARNING : Donnée absente (aucune source disponible)
- **LF Europimmo** — WARNING : Donnée absente (aucune source disponible)
- **LF Grand Paris Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Log In** — WARNING : Donnée absente (aucune source disponible)
- **NCap Education Santé** — WARNING : Donnée absente (aucune source disponible)
- **Remake Live** — WARNING : Donnée absente (aucune source disponible)
- **Perial Opportunités Europe** — WARNING : Donnée absente (aucune source disponible)
- **Perial O2** — WARNING : Donnée absente (aucune source disponible)
- **Perial Hospitalité Europe** — WARNING : Donnée absente (aucune source disponible)
- **Sofiprime** — WARNING : Donnée absente (aucune source disponible)
- **Selectinvest 1** — WARNING : Donnée absente (aucune source disponible)
- **Transitions Europe** — WARNING : Donnée absente (aucune source disponible)
- **Urban Coeur de Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Foncière** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre Europe** — WARNING : Donnée absente (aucune source disponible)
- **ESG Pierre Capital** — WARNING : Donnée absente (aucune source disponible)
- **Ficommerce Proximité** — WARNING : Donnée absente (aucune source disponible)
- **Foncière des Praticiens** — WARNING : Donnée absente (aucune source disponible)
- **Selectipierre 2** — WARNING : Donnée absente (aucune source disponible)
- **NCap Continent** — WARNING : Donnée absente (aucune source disponible)
- **Wemo One** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Atlas** — WARNING : Donnée absente (aucune source disponible)
- **Epsicap Nano** — WARNING : Donnée absente (aucune source disponible)
- **Alta Convictions** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Rente** — WARNING : Donnée absente (aucune source disponible)
- **Rivoli Avenir Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Primovie** — WARNING : Donnée absente (aucune source disponible)
- **Praemia Hôtels Europe** — WARNING : Donnée absente (aucune source disponible)
- **Pierval Santé** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Agora** — WARNING : Donnée absente (aucune source disponible)

### WALT (`walt` — secondary)
Surfaces : ScpiDetailPage
CRITICAL : 0 · WARNING : 55

- **Aestiam Cap'Hebergimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Pierre Rendement** — WARNING : Donnée absente (aucune source disponible)
- **Atream Hotel** — WARNING : Donnée absente (aucune source disponible)
- **Buroboutic Métropoles** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de Région** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de ville** — WARNING : Donnée absente (aucune source disponible)
- **Coeur d'Europe** — WARNING : Donnée absente (aucune source disponible)
- **Crédit Mutuel Pierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Life** — WARNING : Donnée absente (aucune source disponible)
- **Edissimo** — WARNING : Donnée absente (aucune source disponible)
- **Efimmo 1** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Croissance Impact** — WARNING : Donnée absente (aucune source disponible)
- **Perial Grand Paris** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Novaxia NEO** — WARNING : Donnée absente (aucune source disponible)
- **Opportunité Immo** — WARNING : Donnée absente (aucune source disponible)
- **Optimale** — WARNING : Donnée absente (aucune source disponible)
- **Paref Evo** — WARNING : Donnée absente (aucune source disponible)
- **Paref Hexa** — WARNING : Donnée absente (aucune source disponible)
- **GMA Essentialis** — WARNING : Donnée absente (aucune source disponible)
- **Grand Paris Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Immorente** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Zen** — WARNING : Donnée absente (aucune source disponible)
- **Kyaneos Pierre** — WARNING : Donnée absente (aucune source disponible)
- **LF Avenir Santé** — WARNING : Donnée absente (aucune source disponible)
- **LF Europimmo** — WARNING : Donnée absente (aucune source disponible)
- **LF Grand Paris Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Log In** — WARNING : Donnée absente (aucune source disponible)
- **NCap Education Santé** — WARNING : Donnée absente (aucune source disponible)
- **Perial Opportunités Europe** — WARNING : Donnée absente (aucune source disponible)
- **Perial O2** — WARNING : Donnée absente (aucune source disponible)
- **Perial Hospitalité Europe** — WARNING : Donnée absente (aucune source disponible)
- **Sofiprime** — WARNING : Donnée absente (aucune source disponible)
- **Selectinvest 1** — WARNING : Donnée absente (aucune source disponible)
- **Urban Coeur de Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Foncière** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre Europe** — WARNING : Donnée absente (aucune source disponible)
- **ESG Pierre Capital** — WARNING : Donnée absente (aucune source disponible)
- **Ficommerce Proximité** — WARNING : Donnée absente (aucune source disponible)
- **Foncière des Praticiens** — WARNING : Donnée absente (aucune source disponible)
- **Selectipierre 2** — WARNING : Donnée absente (aucune source disponible)
- **NCap Continent** — WARNING : Donnée absente (aucune source disponible)
- **Wemo One** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Atlas** — WARNING : Donnée absente (aucune source disponible)
- **Epsicap Nano** — WARNING : Donnée absente (aucune source disponible)
- **Alta Convictions** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Rente** — WARNING : Donnée absente (aucune source disponible)
- **Rivoli Avenir Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Primovie** — WARNING : Donnée absente (aucune source disponible)
- **Praemia Hôtels Europe** — WARNING : Donnée absente (aucune source disponible)
- **Pierval Santé** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Agora** — WARNING : Donnée absente (aucune source disponible)

### WALB (`walb` — secondary)
Surfaces : ScpiDetailPage
CRITICAL : 0 · WARNING : 51

- **Aestiam Cap'Hebergimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Pierre Rendement** — WARNING : Donnée absente (aucune source disponible)
- **Atream Hotel** — WARNING : Donnée absente (aucune source disponible)
- **Buroboutic Métropoles** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de Région** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de ville** — WARNING : Donnée absente (aucune source disponible)
- **Coeur d'Europe** — WARNING : Donnée absente (aucune source disponible)
- **Crédit Mutuel Pierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Life** — WARNING : Donnée absente (aucune source disponible)
- **Edissimo** — WARNING : Donnée absente (aucune source disponible)
- **Efimmo 1** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Croissance Impact** — WARNING : Donnée absente (aucune source disponible)
- **Perial Grand Paris** — WARNING : Donnée absente (aucune source disponible)
- **NCap Régions** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Optimale** — WARNING : Donnée absente (aucune source disponible)
- **Paref Evo** — WARNING : Donnée absente (aucune source disponible)
- **GMA Essentialis** — WARNING : Donnée absente (aucune source disponible)
- **Grand Paris Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Immorente** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Zen** — WARNING : Donnée absente (aucune source disponible)
- **Kyaneos Pierre** — WARNING : Donnée absente (aucune source disponible)
- **LF Avenir Santé** — WARNING : Donnée absente (aucune source disponible)
- **LF Europimmo** — WARNING : Donnée absente (aucune source disponible)
- **LF Grand Paris Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Log In** — WARNING : Donnée absente (aucune source disponible)
- **NCap Education Santé** — WARNING : Donnée absente (aucune source disponible)
- **Remake Live** — WARNING : Donnée absente (aucune source disponible)
- **Perial O2** — WARNING : Donnée absente (aucune source disponible)
- **Perial Hospitalité Europe** — WARNING : Donnée absente (aucune source disponible)
- **Sofiprime** — WARNING : Donnée absente (aucune source disponible)
- **Selectinvest 1** — WARNING : Donnée absente (aucune source disponible)
- **Urban Coeur de Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Foncière** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre Europe** — WARNING : Donnée absente (aucune source disponible)
- **Ficommerce Proximité** — WARNING : Donnée absente (aucune source disponible)
- **Selectipierre 2** — WARNING : Donnée absente (aucune source disponible)
- **NCap Continent** — WARNING : Donnée absente (aucune source disponible)
- **Wemo One** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Atlas** — WARNING : Donnée absente (aucune source disponible)
- **Epsicap Nano** — WARNING : Donnée absente (aucune source disponible)
- **Alta Convictions** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Rente** — WARNING : Donnée absente (aucune source disponible)
- **Rivoli Avenir Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Primovie** — WARNING : Donnée absente (aucune source disponible)
- **Praemia Hôtels Europe** — WARNING : Donnée absente (aucune source disponible)
- **Pierval Santé** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Agora** — WARNING : Donnée absente (aucune source disponible)

### Délai de jouissance (`delai_jouissance` — important)
Surfaces : ScpiDetailPage, AnalysisDetailModal
CRITICAL : 0 · WARNING : 13

- **Novaxia NEO** — WARNING : Donnée absente (aucune source disponible)
- **NCap Continent** — WARNING : Donnée absente (aucune source disponible)
- **Wemo One** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Atlas** — WARNING : Donnée absente (aucune source disponible)
- **Epsicap Nano** — WARNING : Donnée absente (aucune source disponible)
- **Alta Convictions** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Rente** — WARNING : Donnée absente (aucune source disponible)
- **Rivoli Avenir Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Primovie** — WARNING : Donnée absente (aucune source disponible)
- **Praemia Hôtels Europe** — WARNING : Donnée absente (aucune source disponible)
- **Pierval Santé** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Agora** — WARNING : Donnée absente (aucune source disponible)

### Frais de gestion (`frais_gestion` — secondary)
Surfaces : ScpiDetailPage
CRITICAL : 0 · WARNING : 1

- **NCap Continent** — WARNING : Donnée absente (aucune source disponible)

### Classification SFDR (`sfdr` — secondary)
Surfaces : ScpiDetailPage
CRITICAL : 0 · WARNING : 62

- **Activimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Cap'Hebergimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Pierre Rendement** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Horizon** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Cadence 12** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Commerces** — WARNING : Donnée absente (aucune source disponible)
- **Atream Hotel** — WARNING : Donnée absente (aucune source disponible)
- **Buroboutic Métropoles** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de Région** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de ville** — WARNING : Donnée absente (aucune source disponible)
- **Coeur d'Europe** — WARNING : Donnée absente (aucune source disponible)
- **Comète** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Life** — WARNING : Donnée absente (aucune source disponible)
- **Edissimo** — WARNING : Donnée absente (aucune source disponible)
- **Efimmo 1** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Croissance Impact** — WARNING : Donnée absente (aucune source disponible)
- **Perial Grand Paris** — WARNING : Donnée absente (aucune source disponible)
- **NCap Régions** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Novaxia NEO** — WARNING : Donnée absente (aucune source disponible)
- **Opportunité Immo** — WARNING : Donnée absente (aucune source disponible)
- **Optimale** — WARNING : Donnée absente (aucune source disponible)
- **Paref Evo** — WARNING : Donnée absente (aucune source disponible)
- **Paref Hexa** — WARNING : Donnée absente (aucune source disponible)
- **GMA Essentialis** — WARNING : Donnée absente (aucune source disponible)
- **Grand Paris Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Immorente** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Zen** — WARNING : Donnée absente (aucune source disponible)
- **Kyaneos Pierre** — WARNING : Donnée absente (aucune source disponible)
- **LF Avenir Santé** — WARNING : Donnée absente (aucune source disponible)
- **LF Europimmo** — WARNING : Donnée absente (aucune source disponible)
- **LF Grand Paris Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Log In** — WARNING : Donnée absente (aucune source disponible)
- **NCap Education Santé** — WARNING : Donnée absente (aucune source disponible)
- **Remake Live** — WARNING : Donnée absente (aucune source disponible)
- **Perial Opportunités Europe** — WARNING : Donnée absente (aucune source disponible)
- **Perial O2** — WARNING : Donnée absente (aucune source disponible)
- **Perial Hospitalité Europe** — WARNING : Donnée absente (aucune source disponible)
- **Sofiprime** — WARNING : Donnée absente (aucune source disponible)
- **Selectinvest 1** — WARNING : Donnée absente (aucune source disponible)
- **Transitions Europe** — WARNING : Donnée absente (aucune source disponible)
- **Urban Coeur de Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Foncière** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre Europe** — WARNING : Donnée absente (aucune source disponible)
- **ESG Pierre Capital** — WARNING : Donnée absente (aucune source disponible)
- **Ficommerce Proximité** — WARNING : Donnée absente (aucune source disponible)
- **Foncière des Praticiens** — WARNING : Donnée absente (aucune source disponible)
- **Selectipierre 2** — WARNING : Donnée absente (aucune source disponible)
- **NCap Continent** — WARNING : Donnée absente (aucune source disponible)
- **Wemo One** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Atlas** — WARNING : Donnée absente (aucune source disponible)
- **Epsicap Nano** — WARNING : Donnée absente (aucune source disponible)
- **Alta Convictions** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Rente** — WARNING : Donnée absente (aucune source disponible)
- **Rivoli Avenir Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Primovie** — WARNING : Donnée absente (aucune source disponible)
- **Praemia Hôtels Europe** — WARNING : Donnée absente (aucune source disponible)
- **Pierval Santé** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Agora** — WARNING : Donnée absente (aucune source disponible)

### Indicateur de risque (SRI) (`sri` — important)
Surfaces : ScpiDetailPage, AnalysisDetailModal
CRITICAL : 0 · WARNING : 12

- **NCap Continent** — WARNING : Donnée absente (aucune source disponible)
- **Wemo One** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Atlas** — WARNING : Donnée absente (aucune source disponible)
- **Epsicap Nano** — WARNING : Donnée absente (aucune source disponible)
- **Alta Convictions** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Rente** — WARNING : Donnée absente (aucune source disponible)
- **Rivoli Avenir Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Primovie** — WARNING : Donnée absente (aucune source disponible)
- **Praemia Hôtels Europe** — WARNING : Donnée absente (aucune source disponible)
- **Pierval Santé** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Agora** — WARNING : Donnée absente (aucune source disponible)

### Report à nouveau (cumulé) (`report_a_nouveau` — secondary)
Surfaces : ScpiDetailPage
CRITICAL : 0 · WARNING : 63

- **Activimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Cap'Hebergimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Pierre Rendement** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Horizon** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Cadence 12** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Commerces** — WARNING : Donnée absente (aucune source disponible)
- **Atream Hotel** — WARNING : Donnée absente (aucune source disponible)
- **Buroboutic Métropoles** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de Région** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de ville** — WARNING : Donnée absente (aucune source disponible)
- **Coeur d'Europe** — WARNING : Donnée absente (aucune source disponible)
- **Comète** — WARNING : Donnée absente (aucune source disponible)
- **Crédit Mutuel Pierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Life** — WARNING : Donnée absente (aucune source disponible)
- **Edissimo** — WARNING : Donnée absente (aucune source disponible)
- **Efimmo 1** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Croissance Impact** — WARNING : Donnée absente (aucune source disponible)
- **Perial Grand Paris** — WARNING : Donnée absente (aucune source disponible)
- **NCap Régions** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Novaxia NEO** — WARNING : Donnée absente (aucune source disponible)
- **Opportunité Immo** — WARNING : Donnée absente (aucune source disponible)
- **Optimale** — WARNING : Donnée absente (aucune source disponible)
- **Paref Evo** — WARNING : Donnée absente (aucune source disponible)
- **Paref Hexa** — WARNING : Donnée absente (aucune source disponible)
- **GMA Essentialis** — WARNING : Donnée absente (aucune source disponible)
- **Grand Paris Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Immorente** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Zen** — WARNING : Donnée absente (aucune source disponible)
- **Kyaneos Pierre** — WARNING : Donnée absente (aucune source disponible)
- **LF Avenir Santé** — WARNING : Donnée absente (aucune source disponible)
- **LF Europimmo** — WARNING : Donnée absente (aucune source disponible)
- **LF Grand Paris Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Log In** — WARNING : Donnée absente (aucune source disponible)
- **NCap Education Santé** — WARNING : Donnée absente (aucune source disponible)
- **Remake Live** — WARNING : Donnée absente (aucune source disponible)
- **Perial Opportunités Europe** — WARNING : Donnée absente (aucune source disponible)
- **Perial O2** — WARNING : Donnée absente (aucune source disponible)
- **Perial Hospitalité Europe** — WARNING : Donnée absente (aucune source disponible)
- **Sofiprime** — WARNING : Donnée absente (aucune source disponible)
- **Selectinvest 1** — WARNING : Donnée absente (aucune source disponible)
- **Transitions Europe** — WARNING : Donnée absente (aucune source disponible)
- **Urban Coeur de Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Foncière** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre Europe** — WARNING : Donnée absente (aucune source disponible)
- **ESG Pierre Capital** — WARNING : Donnée absente (aucune source disponible)
- **Ficommerce Proximité** — WARNING : Donnée absente (aucune source disponible)
- **Foncière des Praticiens** — WARNING : Donnée absente (aucune source disponible)
- **Selectipierre 2** — WARNING : Donnée absente (aucune source disponible)
- **NCap Continent** — WARNING : Donnée absente (aucune source disponible)
- **Wemo One** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Atlas** — WARNING : Donnée absente (aucune source disponible)
- **Epsicap Nano** — WARNING : Donnée absente (aucune source disponible)
- **Alta Convictions** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Rente** — WARNING : Donnée absente (aucune source disponible)
- **Rivoli Avenir Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Primovie** — WARNING : Donnée absente (aucune source disponible)
- **Praemia Hôtels Europe** — WARNING : Donnée absente (aucune source disponible)
- **Pierval Santé** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Agora** — WARNING : Donnée absente (aucune source disponible)

### Parts en attente de retrait (`parts_en_attente` — important)
Surfaces : ScpiDetailPage
CRITICAL : 0 · WARNING : 63

- **Activimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Cap'Hebergimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Pierre Rendement** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Horizon** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Cadence 12** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Commerces** — WARNING : Donnée absente (aucune source disponible)
- **Atream Hotel** — WARNING : Donnée absente (aucune source disponible)
- **Buroboutic Métropoles** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de Région** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de ville** — WARNING : Donnée absente (aucune source disponible)
- **Coeur d'Europe** — WARNING : Donnée absente (aucune source disponible)
- **Comète** — WARNING : Donnée absente (aucune source disponible)
- **Crédit Mutuel Pierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Life** — WARNING : Donnée absente (aucune source disponible)
- **Edissimo** — WARNING : Donnée absente (aucune source disponible)
- **Efimmo 1** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Croissance Impact** — WARNING : Donnée absente (aucune source disponible)
- **Perial Grand Paris** — WARNING : Donnée absente (aucune source disponible)
- **NCap Régions** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Novaxia NEO** — WARNING : Donnée absente (aucune source disponible)
- **Opportunité Immo** — WARNING : Donnée absente (aucune source disponible)
- **Optimale** — WARNING : Donnée absente (aucune source disponible)
- **Paref Evo** — WARNING : Donnée absente (aucune source disponible)
- **Paref Hexa** — WARNING : Donnée absente (aucune source disponible)
- **GMA Essentialis** — WARNING : Donnée absente (aucune source disponible)
- **Grand Paris Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Immorente** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Zen** — WARNING : Donnée absente (aucune source disponible)
- **Kyaneos Pierre** — WARNING : Donnée absente (aucune source disponible)
- **LF Avenir Santé** — WARNING : Donnée absente (aucune source disponible)
- **LF Europimmo** — WARNING : Donnée absente (aucune source disponible)
- **LF Grand Paris Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Log In** — WARNING : Donnée absente (aucune source disponible)
- **NCap Education Santé** — WARNING : Donnée absente (aucune source disponible)
- **Remake Live** — WARNING : Donnée absente (aucune source disponible)
- **Perial Opportunités Europe** — WARNING : Donnée absente (aucune source disponible)
- **Perial O2** — WARNING : Donnée absente (aucune source disponible)
- **Perial Hospitalité Europe** — WARNING : Donnée absente (aucune source disponible)
- **Sofiprime** — WARNING : Donnée absente (aucune source disponible)
- **Selectinvest 1** — WARNING : Donnée absente (aucune source disponible)
- **Transitions Europe** — WARNING : Donnée absente (aucune source disponible)
- **Urban Coeur de Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Foncière** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre Europe** — WARNING : Donnée absente (aucune source disponible)
- **ESG Pierre Capital** — WARNING : Donnée absente (aucune source disponible)
- **Ficommerce Proximité** — WARNING : Donnée absente (aucune source disponible)
- **Foncière des Praticiens** — WARNING : Donnée absente (aucune source disponible)
- **Selectipierre 2** — WARNING : Donnée absente (aucune source disponible)
- **NCap Continent** — WARNING : Donnée absente (aucune source disponible)
- **Wemo One** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Atlas** — WARNING : Donnée absente (aucune source disponible)
- **Epsicap Nano** — WARNING : Donnée absente (aucune source disponible)
- **Alta Convictions** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Rente** — WARNING : Donnée absente (aucune source disponible)
- **Rivoli Avenir Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Primovie** — WARNING : Donnée absente (aucune source disponible)
- **Praemia Hôtels Europe** — WARNING : Donnée absente (aucune source disponible)
- **Pierval Santé** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Agora** — WARNING : Donnée absente (aucune source disponible)

### Liquidité (`liquidite` — important)
Surfaces : ScpiDetailPage
CRITICAL : 0 · WARNING : 63

- **Activimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Cap'Hebergimmo** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Pierre Rendement** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Horizon** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Cadence 12** — WARNING : Donnée absente (aucune source disponible)
- **Altixia Commerces** — WARNING : Donnée absente (aucune source disponible)
- **Atream Hotel** — WARNING : Donnée absente (aucune source disponible)
- **Buroboutic Métropoles** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de Région** — WARNING : Donnée absente (aucune source disponible)
- **Coeur de ville** — WARNING : Donnée absente (aucune source disponible)
- **Coeur d'Europe** — WARNING : Donnée absente (aucune source disponible)
- **Comète** — WARNING : Donnée absente (aucune source disponible)
- **Crédit Mutuel Pierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Life** — WARNING : Donnée absente (aucune source disponible)
- **Edissimo** — WARNING : Donnée absente (aucune source disponible)
- **Efimmo 1** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Croissance Impact** — WARNING : Donnée absente (aucune source disponible)
- **Perial Grand Paris** — WARNING : Donnée absente (aucune source disponible)
- **NCap Régions** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre 1** — WARNING : Donnée absente (aucune source disponible)
- **Novapierre Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Novaxia NEO** — WARNING : Donnée absente (aucune source disponible)
- **Opportunité Immo** — WARNING : Donnée absente (aucune source disponible)
- **Optimale** — WARNING : Donnée absente (aucune source disponible)
- **Paref Evo** — WARNING : Donnée absente (aucune source disponible)
- **Paref Hexa** — WARNING : Donnée absente (aucune source disponible)
- **GMA Essentialis** — WARNING : Donnée absente (aucune source disponible)
- **Grand Paris Résidentiel** — WARNING : Donnée absente (aucune source disponible)
- **Immorente** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Zen** — WARNING : Donnée absente (aucune source disponible)
- **Kyaneos Pierre** — WARNING : Donnée absente (aucune source disponible)
- **LF Avenir Santé** — WARNING : Donnée absente (aucune source disponible)
- **LF Europimmo** — WARNING : Donnée absente (aucune source disponible)
- **LF Grand Paris Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Log In** — WARNING : Donnée absente (aucune source disponible)
- **NCap Education Santé** — WARNING : Donnée absente (aucune source disponible)
- **Remake Live** — WARNING : Donnée absente (aucune source disponible)
- **Perial Opportunités Europe** — WARNING : Donnée absente (aucune source disponible)
- **Perial O2** — WARNING : Donnée absente (aucune source disponible)
- **Perial Hospitalité Europe** — WARNING : Donnée absente (aucune source disponible)
- **Sofiprime** — WARNING : Donnée absente (aucune source disponible)
- **Selectinvest 1** — WARNING : Donnée absente (aucune source disponible)
- **Transitions Europe** — WARNING : Donnée absente (aucune source disponible)
- **Urban Coeur de Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Foncière** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre** — WARNING : Donnée absente (aucune source disponible)
- **Épargne Pierre Europe** — WARNING : Donnée absente (aucune source disponible)
- **ESG Pierre Capital** — WARNING : Donnée absente (aucune source disponible)
- **Ficommerce Proximité** — WARNING : Donnée absente (aucune source disponible)
- **Foncière des Praticiens** — WARNING : Donnée absente (aucune source disponible)
- **Selectipierre 2** — WARNING : Donnée absente (aucune source disponible)
- **NCap Continent** — WARNING : Donnée absente (aucune source disponible)
- **Wemo One** — WARNING : Donnée absente (aucune source disponible)
- **Iroko Atlas** — WARNING : Donnée absente (aucune source disponible)
- **Epsicap Nano** — WARNING : Donnée absente (aucune source disponible)
- **Alta Convictions** — WARNING : Donnée absente (aucune source disponible)
- **Cristal Rente** — WARNING : Donnée absente (aucune source disponible)
- **Rivoli Avenir Patrimoine** — WARNING : Donnée absente (aucune source disponible)
- **Primovie** — WARNING : Donnée absente (aucune source disponible)
- **Praemia Hôtels Europe** — WARNING : Donnée absente (aucune source disponible)
- **Pierval Santé** — WARNING : Donnée absente (aucune source disponible)
- **Patrimmo Commerce** — WARNING : Donnée absente (aucune source disponible)
- **Aestiam Agora** — WARNING : Donnée absente (aucune source disponible)

## Anomalies par SCPI

### Activimmo (OK 21 · WARNING 8 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Aestiam Cap'Hebergimmo (OK 16 · WARNING 13 · CRITICAL 0)
- `decote_surcote` — WARNING : Prix ou valeur de reconstitution affichée absent/non comparable _(correction : passer l’affichage par resolveScpiIndicator)_
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_immeubles` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Aestiam Pierre Rendement (OK 17 · WARNING 12 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_immeubles` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Aestiam Horizon (OK 20 · WARNING 9 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Altixia Cadence 12 (OK 21 · WARNING 8 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Altixia Commerces (OK 21 · WARNING 8 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Atream Hotel (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Buroboutic Métropoles (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Coeur de Région (OK 19 · WARNING 10 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Coeur de ville (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Coeur d'Europe (OK 19 · WARNING 10 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Comète (OK 22 · WARNING 7 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Crédit Mutuel Pierre 1 (OK 19 · WARNING 10 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Cristal Life (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Edissimo (OK 16 · WARNING 13 · CRITICAL 0)
- `decote_surcote` — WARNING : Statut QA manual_review → neutralisée (à vérifier) _(correction : passer l’affichage par resolveScpiIndicator)_
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `endettement` — WARNING : Valeur invalide (masquée) : hors plage attendue [0 ; 60] _(correction : vérifier la donnée source (hors plage métier))_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Efimmo 1 (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Patrimmo Croissance Impact (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Perial Grand Paris (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### NCap Régions (OK 20 · WARNING 9 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Novapierre 1 (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Novapierre Résidentiel (OK 16 · WARNING 13 · CRITICAL 0)
- `decote_surcote` — WARNING : Prix ou valeur de reconstitution affichée absent/non comparable _(correction : passer l’affichage par resolveScpiIndicator)_
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_immeubles` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Novaxia NEO (OK 18 · WARNING 11 · CRITICAL 0)
- `valeur_retrait` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `decote_surcote` — WARNING : Statut QA manual_review → neutralisée (à vérifier) _(correction : passer l’affichage par resolveScpiIndicator)_
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `delai_jouissance` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Opportunité Immo (OK 20 · WARNING 9 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Optimale (OK 18 · WARNING 11 · CRITICAL 0)
- `decote_surcote` — WARNING : Statut QA manual_review → neutralisée (à vérifier) _(correction : passer l’affichage par resolveScpiIndicator)_
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Paref Evo (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Paref Hexa (OK 19 · WARNING 10 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### GMA Essentialis (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Grand Paris Résidentiel (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Immorente (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Iroko Zen (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Kyaneos Pierre (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### LF Avenir Santé (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### LF Europimmo (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### LF Grand Paris Patrimoine (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Log In (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### NCap Education Santé (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Remake Live (OK 20 · WARNING 9 · CRITICAL 0)
- `decote_surcote` — WARNING : Statut QA manual_review → neutralisée (à vérifier) _(correction : passer l’affichage par resolveScpiIndicator)_
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Perial Opportunités Europe (OK 20 · WARNING 9 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Perial O2 (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Perial Hospitalité Europe (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Sofiprime (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Selectinvest 1 (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Transitions Europe (OK 22 · WARNING 7 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Urban Coeur de Commerce (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Épargne Foncière (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Épargne Pierre (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Épargne Pierre Europe (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### ESG Pierre Capital (OK 20 · WARNING 9 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Ficommerce Proximité (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Foncière des Praticiens (OK 20 · WARNING 9 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Selectipierre 2 (OK 18 · WARNING 11 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### NCap Continent (OK 14 · WARNING 15 · CRITICAL 0)
- `valeur_realisation` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `delai_jouissance` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `frais_gestion` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sri` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Wemo One (OK 15 · WARNING 14 · CRITICAL 0)
- `valeur_realisation` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `delai_jouissance` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sri` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Iroko Atlas (OK 16 · WARNING 13 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `delai_jouissance` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sri` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Epsicap Nano (OK 15 · WARNING 14 · CRITICAL 0)
- `valeur_realisation` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `delai_jouissance` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sri` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Alta Convictions (OK 15 · WARNING 14 · CRITICAL 0)
- `valeur_realisation` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `delai_jouissance` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sri` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Cristal Rente (OK 14 · WARNING 15 · CRITICAL 0)
- `valeur_realisation` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `endettement` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `delai_jouissance` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sri` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Rivoli Avenir Patrimoine (OK 12 · WARNING 17 · CRITICAL 0)
- `valeur_reconstitution` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `valeur_realisation` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `decote_surcote` — WARNING : Statut QA manual_review → neutralisée (à vérifier) _(correction : passer l’affichage par resolveScpiIndicator)_
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `endettement` — WARNING : Valeur invalide (masquée) : hors plage attendue [0 ; 60] _(correction : vérifier la donnée source (hors plage métier))_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `delai_jouissance` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sri` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Primovie (OK 16 · WARNING 13 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `delai_jouissance` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sri` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Praemia Hôtels Europe (OK 16 · WARNING 13 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `delai_jouissance` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sri` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Pierval Santé (OK 15 · WARNING 14 · CRITICAL 0)
- `valeur_realisation` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `delai_jouissance` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sri` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Patrimmo Commerce (OK 16 · WARNING 13 · CRITICAL 0)
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `delai_jouissance` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sri` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_

### Aestiam Agora (OK 15 · WARNING 14 · CRITICAL 0)
- `valeur_realisation` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `top` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `ran` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `collecte_nette` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `nombre_locataires` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `surface` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walt` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `walb` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `delai_jouissance` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sfdr` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `sri` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `report_a_nouveau` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `parts_en_attente` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
- `liquidite` — WARNING : Donnée absente (aucune source disponible) _(correction : sourcer la donnée (bulletin/DIC) puis intégrer)_
