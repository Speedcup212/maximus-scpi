# scpi_engine/scpi_final.py
# Données SCPI finales consolidées (base + updates 2025)

from scpi_engine.base_data import SCPI_BASE_DATA
from scpi_engine.updates_2025 import SCPI_UPDATES_2025
from scpi_engine.merge_engine import apply_updates

# Application de l'écrasement contrôlé
SCPI_DATA_FINAL = apply_updates(
    scpi_base_data=SCPI_BASE_DATA,
    scpi_updates=SCPI_UPDATES_2025
)

# Alias pratique si besoin
SCPI_DATA = SCPI_DATA_FINAL


