# RECOVERY-216 — P0 #311: preuve du TOF total PAREF Hexa

Mission active autorisée le 15/11/2026: continuer jusqu'à 69/69 sans assouplir les contrôles. RECOVERY-215 a corrigé la donnée en production; ce lot répare le vérificateur indépendant qui ciblait les seuls locaux occupés.

Périmètre: scripts/agents/paref_private_archived_tof_oidc_probe.py et son test, ce rapport; après preuve CI réelle, correction atomique du verrou PAREF sur cette preuve.

Le probe exige désormais, pour Hexa T3 2026, la valeur située immédiatement sous les libellés TOF, T3, 2026; page 5 imposée, identité et empreinte inchangées. MuPDF et Poppler doivent chacun valider cette relation spatiale et leurs coordonnées doivent concorder à moins d'un point. Les autres occurrences historiques de 86,0 et la légende 84,5 sont exclues. Aucun JWT, URL privée ou PDF privé n'est publié.

Validation locale: 11/11 tests PASS, dont mauvais trimestre, composante, ambiguïté et absence de libellé TOF. PDF original 1 775 561 octets, SHA ca4a3569a990f99b376268875440ebc1e1aadefa85aab582ebca96cbce0c62ce: valeur totale 86,0 à la page5, MuPDF [70.71,250.51,112.87,274.71], Poppler [70.71,250.50,112.87,274.71].

Aucune attestation humaine, aucune certification financière ni publication autorisée par ce seul rapport. Le workflow existant produira la preuve via le pont OIDC protégé après fusion. Aucun nouvel orchestrateur. Gate SQL non changé dans cette première tranche.
