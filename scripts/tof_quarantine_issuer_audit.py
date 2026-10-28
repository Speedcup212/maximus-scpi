"""Read-only official issuer source audit for 77 quarantined TOF records.
Does not modify SQL, publish values, or accept ASPIM-labelled TOF.
"""
import concurrent.futures
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlparse
import requests
import fitz

DOCS = [
  {
    "scpi_slug": "aestiam-agora",
    "source_period": "2024-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/agora/periodique/2024-1t-bti-aestiam-pierre-rendement.pdf",
    "allowed_hosts": [
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-agora",
    "source_period": "2024-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/agora/periodique/2024-2t-bti-aestiam-pierre-rendement.pdf",
    "allowed_hosts": [
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-agora",
    "source_period": "2024-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/agora/periodique/2024-3t-bti-aestiam-pierre-rendement.pdf",
    "allowed_hosts": [
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-agora",
    "source_period": "2024-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/agora/periodique/2024-4t-bti-aestiam-pierre-rendement.pdf",
    "allowed_hosts": [
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-agora",
    "source_period": "2025-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/agora/periodique/2025-1t-bti-aestiam-pierre-rendement.pdf",
    "allowed_hosts": [
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-agora",
    "source_period": "2025-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/agora/periodique/2025-2t-bti-aestiam-pierre-rendement.pdf",
    "allowed_hosts": [
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-agora",
    "source_period": "2025-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/agora/periodique/2025-3t-bti-aestiam-agora.pdf",
    "allowed_hosts": [
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-horizon",
    "source_period": "2023-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://aestiam.com/wp-content/uploads/2023/07/app-1t2023-bulletin-trimestriel.pdf",
    "allowed_hosts": [
      "aestiam.com",
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-horizon",
    "source_period": "2023-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/app/periodique/2023-2t-bti-aestiam-placement-pierre.pdf",
    "allowed_hosts": [
      "aestiam.com",
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-horizon",
    "source_period": "2023-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/app/periodique/2023-3t-bti-aestiam-placement-pierre.pdf",
    "allowed_hosts": [
      "aestiam.com",
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-horizon",
    "source_period": "2023-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/app/periodique/2023-4t-bti-aestiam-placement-pierre.pdf",
    "allowed_hosts": [
      "aestiam.com",
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-horizon",
    "source_period": "2024-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/horizon/periodique/2024-1t-bti-aestiam-placement-pierre.pdf",
    "allowed_hosts": [
      "aestiam.com",
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-horizon",
    "source_period": "2024-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/horizon/periodique/2024-3t-bti-aestiam-placement-pierre.pdf",
    "allowed_hosts": [
      "aestiam.com",
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-horizon",
    "source_period": "2024-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/horizon/periodique/2024-4t-bti-aestiam-placement-pierre.pdf",
    "allowed_hosts": [
      "aestiam.com",
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-horizon",
    "source_period": "2025-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/horizon/periodique/2025-1t-bti-aestiam-placement-pierre.pdf",
    "allowed_hosts": [
      "aestiam.com",
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-horizon",
    "source_period": "2025-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/horizon/periodique/2025-2t-bti-aestiam-placement-pierre.pdf",
    "allowed_hosts": [
      "aestiam.com",
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "aestiam-horizon",
    "source_period": "2025-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.aestiam.com/doc/horizon/periodique/2025-3t-bti-aestiam-horizon.pdf",
    "allowed_hosts": [
      "aestiam.com",
      "www.aestiam.com"
    ]
  },
  {
    "scpi_slug": "altixia-cadence-12",
    "source_period": "2026-T2",
    "rejection_reason": "OUTSIDE_ISSUER_OFFICIAL_HOSTS",
    "source_url": "https://api.rock-n-data.io/fichiers/publications/6a708fd02b6f8415260897.pdf",
    "allowed_hosts": [
      "www.altixia.fr"
    ]
  },
  {
    "scpi_slug": "atream-hotel",
    "source_period": "2026-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://atream.com/wp-content/uploads/2026/07/Bulletin-N2026_2T-SCPI_Atream_Hotels_WEB_10-PAGES.pdf",
    "allowed_hosts": [
      "atream.com",
      "www.atream.com"
    ]
  },
  {
    "scpi_slug": "buroboutic-metropoles",
    "source_period": "2026-T1",
    "rejection_reason": "TOF_NOT_DIRECT_FROM_ISSUER_BULLETIN",
    "source_url": "https://www.fiducial-gerance.fr/content/download/1334/38495?version=5",
    "allowed_hosts": [
      "www.fiducial-gerance.fr"
    ]
  },
  {
    "scpi_slug": "buroboutic-metropoles",
    "source_period": "2026-T2",
    "rejection_reason": "TOF_NOT_DIRECT_FROM_ISSUER_BULLETIN",
    "source_url": "https://www.fiducial-gerance.fr/content/download/1410/40287?version=4",
    "allowed_hosts": [
      "www.fiducial-gerance.fr"
    ]
  },
  {
    "scpi_slug": "cristal-life",
    "source_period": "2024-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://corpocdn.blob.core.windows.net/blobfiles/IG_CLBulletin_Trimestriel3T2024.pdf",
    "allowed_hosts": [
      "www.inter-gestion.com",
      "corpocdn.blob.core.windows.net"
    ]
  },
  {
    "scpi_slug": "cristal-life",
    "source_period": "2025-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://corpocdn.blob.core.windows.net/blobfiles/IG_CLBulletin_Trimestriel2025_T2.pdf",
    "allowed_hosts": [
      "www.inter-gestion.com",
      "corpocdn.blob.core.windows.net"
    ]
  },
  {
    "scpi_slug": "cristal-rente",
    "source_period": "2026-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://corpocdn.blob.core.windows.net/blobfiles/IG_CRBulletin_Trimestriel2026_T2_V2_.pdf",
    "allowed_hosts": [
      "www.inter-gestion.com",
      "corpocdn.blob.core.windows.net"
    ]
  },
  {
    "scpi_slug": "edissimo",
    "source_period": "2026-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://www.amundi-immobilier.com/Local-content/Producsheet/SCPI/EDISSIMMO/Documents",
    "allowed_hosts": [
      "www.amundi-immobilier.com",
      "www.amundi.fr"
    ]
  },
  {
    "scpi_slug": "edissimo",
    "source_period": "2026-T2",
    "rejection_reason": "OUTSIDE_ISSUER_OFFICIAL_HOSTS",
    "source_url": "https://www.scpi-lab.com/scpi/scpi-edissimmo-35/information/bt2-2026",
    "allowed_hosts": [
      "www.amundi-immobilier.com",
      "www.amundi.fr"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2018-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-KP-BT-4T18.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2019-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-KP-BT-1T19.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2019-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-KP-BT-2T19.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2019-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-KP-BT-4T19.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2020-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-KP-BT-1T20.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2020-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-KP-BT-2T20.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2020-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-KP-BT-3T20.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2020-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-4T20.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2021-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-1T2021-vdef.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2021-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-2T2021.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2021-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-3T2021.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2021-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-T4-2021.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2022-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-1T2022.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2022-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-2T2022-vdef.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2022-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-3T2022.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2022-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-4T2022.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2023-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-1T2023.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2023-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/09/BT-Kyaneos-Pierre-2T2023.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2023-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2023/10/Bulletin-trimestriel-3T2023-SCPI-Kyaneos-Pierre.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2023-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2024/02/SCPI-KP-Bulletin-trimestriel-4T2023.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2024-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2024/05/SCPI-KP-Bulletin-trimestriel-1T2024.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2024-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2024/07/SCPI-KP-Bulletin-trimestriel-2T2024.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2024-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2025/01/SCPI-KP-Bulletin-trimestriel-3T2024.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2024-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2025/02/SCPI-KP-Bulletin-trimestriel-4T2024.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "kyaneos-pierre",
    "source_period": "2025-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://kyaneosam.com/wp-content/uploads/2025/05/SCPI-KP-Bulletin-trimestriel-1T2025.pdf",
    "allowed_hosts": [
      "kyaneosam.com",
      "www.kyaneosam.com"
    ]
  },
  {
    "scpi_slug": "novapierre-1",
    "source_period": "2024-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2024/10/e80435cf-ebee-4c63-bfc8-a816e551af47-BTI-T2-2024-Novapierre-1.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "novapierre-1",
    "source_period": "2024-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2024/11/8365e8f8-f7f1-4ffd-be3f-09d8863c8c99-BTI-T3-2024-Novapierre1.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "novapierre-1",
    "source_period": "2024-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2025/02/ba9e87ab-0585-4faa-aa87-288ce666deff-BTI-T4-2024-Novapierre1.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "novapierre-1",
    "source_period": "2025-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2025/05/eaa2c54d-6937-43b5-b6ad-94277844a34b-BT-T1-2025-Novapierre1.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "novapierre-1",
    "source_period": "2025-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2025/08/f59da8a2-71a4-4a6b-a5e0-2c7c26476f6a-BTI-T2-2025-Novapierre1.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "novapierre-1",
    "source_period": "2025-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2026/02/4716f270-c591-4691-8a61-f3ad53ecc4b0-BTI-T4-2025-Novapierre-1.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "novapierre-residentiel",
    "source_period": "2022-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2024/07/6d13e584-58d0-4ef5-87b9-c5a0e25582b6-BTI-T1-2022-Novapierre-Residentiel.pdf",
    "allowed_hosts": [
      "paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "novapierre-residentiel",
    "source_period": "2024-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2024/10/dc6af67c-bfce-4a7d-89a3-0989baf29441-BTI-T2-2024-Novapierre-Residentiel.pdf",
    "allowed_hosts": [
      "paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "novapierre-residentiel",
    "source_period": "2024-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2024/11/35078630-740e-4157-923b-bbeeb8c8c968-BTI-T3-2024-Novapierre-Residentiel.pdf",
    "allowed_hosts": [
      "paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "novapierre-residentiel",
    "source_period": "2024-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2025/02/e02a206a-a607-4d28-865c-aaf0b51902d3-BTI-T4-2024-Novapierre-Residentiel.pdf",
    "allowed_hosts": [
      "paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "novapierre-residentiel",
    "source_period": "2025-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2025/05/ed9960da-69f1-484c-beac-20a05cf16837-BTI-T1-2025-Novapierre-Residentiel.pdf",
    "allowed_hosts": [
      "paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "novapierre-residentiel",
    "source_period": "2025-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2025/08/b9ab7256-d730-4d7d-9021-a06e0ee4bc53-BTI-T2-2025-Novapierre-Residentiel.pdf",
    "allowed_hosts": [
      "paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "paref-evo",
    "source_period": "2023-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2024/10/0a632856-2bf0-4399-994c-438f91b752ac-BTI-T3-2023-InterpierreEuropeCentrale.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "paref-evo",
    "source_period": "2023-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2024/10/31ad89f0-5e9c-4f4a-87c1-02d17a7f213f-BTI-T4-2023-InterpierreEuropeCentrale.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "paref-evo",
    "source_period": "2024-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2024/10/b4105257-f061-4189-941b-8738ee51e6a9-BTI-T1-2024-InterpierreEuropeCentrale.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "paref-evo",
    "source_period": "2024-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2024/10/32d8f60b-1009-4012-85d1-14ffc0d28f25-BTI-T2-2024-PAREF-Evo.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "paref-evo",
    "source_period": "2024-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2024/11/d71d2173-7d2f-4032-b22a-90dabe8e49db-BTI-T3-2024-PAREF-Evo.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "paref-hexa",
    "source_period": "2023-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2024/10/013e3d71-8b55-482a-aa10-cf608c2d8026-BTI-T3-2023-InterpierreFrance.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "paref-hexa",
    "source_period": "2024-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2024/10/9cd85c71-c9e3-44a8-8573-d613f399db31-BTI-T2-2024-PAREF-Hexa.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "paref-hexa",
    "source_period": "2024-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2024/11/79797e1f-94aa-479d-b200-3488a941546f-BTI-T3-2024-PAREF-Hexa.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "paref-hexa",
    "source_period": "2024-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2025/02/8d0abc2f-e82b-4ab5-be54-1f1089a9c346-BTI-T4-2024-PAREF-Hexa.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "paref-hexa",
    "source_period": "2025-T1",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2025/05/d0bfee3b-ae37-4238-9739-fe8d7f0db4de-BTI-T1-2025-PAREF-Hexa.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "paref-hexa",
    "source_period": "2025-T2",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2025/08/5e033a55-bf23-4d45-be76-c67f084d3fd3-BTI-T2-2025-PAREF-Hexa.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "paref-hexa",
    "source_period": "2025-T3",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2025/11/98b003e1-d080-4f41-9522-2baf371c2b71-BTI-T3-2025-PAREF-Hexa.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "paref-hexa",
    "source_period": "2025-T4",
    "rejection_reason": "TOF_ASPIM_FORBIDDEN",
    "source_url": "https://paref-gestion.com/wp-content/uploads/2026/02/15725d65-2855-4feb-8406-b674dfa1ce3c-BTI-T4-2025-PAREF-Hexa.pdf",
    "allowed_hosts": [
      "paref-gestion.com",
      "www.paref-gestion.com"
    ]
  },
  {
    "scpi_slug": "rivoli-avenir-patrimoine",
    "source_period": "2026-T2",
    "rejection_reason": "OUTSIDE_ISSUER_OFFICIAL_HOSTS",
    "source_url": "https://www.scpi-lab.com/scpi/scpi-rivoli-avenir-patrimoine-97/information/bt2-2026",
    "allowed_hosts": [
      "www.amundi-immobilier.com",
      "www.amundi.fr"
    ]
  }
]
LABEL = re.compile(r"\bTOF\b|taux\s+d['’]?occupation\s+financier",re.I)
ASPIM = re.compile(r"TOF\s+(?:financier\s+)?ASPIM|taux\s+d['’]?occupation\s+financier\s+ASPIM",re.I)
PCT = re.compile(r"(\d{1,3}(?:[.,]\d{1,3})?)\s*%")
def analyze(row):
    host=urlparse(row["source_url"]).hostname
    if host not in row["allowed_hosts"]:
        return {**row,"status":"REJECTED_THIRD_PARTY","host":host}
    try:
        response=requests.get(row["source_url"],headers={"User-Agent":"Mozilla/5.0 MaximusSCPI issuer bulletin QA","Accept":"application/pdf,application/octet-stream"},timeout=35)
        response.raise_for_status()
        b=response.content
        if not b.startswith(b"%PDF"):
            return {**row,"status":"NOT_OFFICIAL_PDF_BYTES","bytes":len(b),"content_type":response.headers.get("Content-Type")}
        pdf=fitz.open(stream=b,filetype="pdf")
        plain=[]
        aspim=[]
        all_pages=0
        for i,page in enumerate(pdf):
            text=page.get_text("text",sort=True)
            if text.strip():all_pages+=1
            for m in LABEL.finditer(text):
                sample=" ".join(text[max(0,m.start()-130):min(len(text),m.end()+200)].split())
                # classify ASPIM only when explicitly attached to this TOF label
                direct=text[m.start():min(len(text),m.end()+45)]
                item={"page":i+1,"label":m.group(0),"snippet":sample[:400],"percentages":PCT.findall(sample)[:10]}
                if ASPIM.search(direct): aspim.append(item)
                else: plain.append(item)
        targeted={
          ("aestiam-agora","2024-T2"):[1,2],
          ("aestiam-agora","2024-T4"):[1,2],
          ("aestiam-agora","2025-T2"):[1,2],
          ("aestiam-agora","2025-T3"):[1,2],
          ("aestiam-horizon","2023-T1"):[1,2],
          ("aestiam-horizon","2023-T2"):[1,2],
          ("aestiam-horizon","2023-T4"):[1,2],
          ("aestiam-horizon","2024-T4"):[1,2],
          ("aestiam-horizon","2025-T2"):[1,2],
          ("aestiam-horizon","2025-T3"):[1,2],
          ("cristal-life","2024-T3"):[3],
          ("cristal-life","2025-T2"):[3],
          ("novapierre-residentiel","2022-T1"):[1,4],
          ("novapierre-residentiel","2024-T2"):[1,4],
          ("novapierre-residentiel","2024-T3"):[1,4],
          ("novapierre-residentiel","2024-T4"):[1,4],
          ("novapierre-residentiel","2025-T2"):[1,4],
          ("paref-hexa","2025-T2"):[1,4,5],
        }
        details=[{"page":n,"text":pdf[n-1].get_text("text",sort=True)[:16000]}
                 for n in targeted.get((row["scpi_slug"],row["source_period"]),[])
                 if 1<=n<=len(pdf)]
        return {**row,"status":"PDF_READ","sha256":hashlib.sha256(b).hexdigest(),
                "page_diagnostics":details,
                "pages":len(pdf),"readable_pages":all_pages,
                "labels_ASPIM":len(aspim),"labels_other":len(plain),
                "other_examples":plain[:5],"aspim_examples":aspim[:2]}
    except Exception as exc:
        return {**row,"status":"FETCH_OR_PDF_ERROR","error":str(exc)[:160]}
def main():
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        result=list(pool.map(analyze,DOCS))
    Path("tof_quarantine_issuer_audit.json").write_text(json.dumps(result,ensure_ascii=False,indent=2))
    from collections import Counter
    print("SUMMARY",json.dumps(dict(Counter(x["status"] for x in result))),flush=True)
    for x in result:print(json.dumps(x,ensure_ascii=False),flush=True)
if __name__=="__main__":main()
