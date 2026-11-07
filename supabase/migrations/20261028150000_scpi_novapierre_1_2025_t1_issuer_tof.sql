-- Direct issuer bulletin PAREF Novapierre 1 2025-T1, editorial p.1:
-- "Le Taux d'Occupation Financier (TOF) ... 88,0 % au 1er trimestre".
-- This is the explicit TOF publisher label, not a proxy or third-party figure.
SELECT scpi_internal.recertify_quarantined_tof_issuer_pdf(
'novapierre-1','2025-T1',88.0,
'https://paref-gestion.com/wp-content/uploads/2025/05/eaa2c54d-6937-43b5-b6ad-94277844a34b-BT-T1-2025-Novapierre1.pdf',
1,
'19de7e93597078ce388394da54d0f38b708e86350e1ef873f9ec3e2495058445',
'Le Taux d''Occupation Financier (TOF) s''affiche à 88,0 % au 1er trimestre 2025, en baisse de 1,7 % par rapport au trimestre précédent.'
);
