# scpi_engine/audit_scpi.py

from src.data.scpi_complet import SCPI_DATA

print("Nombre total de SCPI :", len(SCPI_DATA))
print("\nListe des SCPI :\n")

for key in sorted(SCPI_DATA.keys()):
    print("-", key)



