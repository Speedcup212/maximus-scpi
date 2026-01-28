from scpi_engine.scpi_final import SCPI_DATA

# 1) Vérification basique
print("Nombre de SCPI :", len(SCPI_DATA))

# 2) Vérification Aestiam
print("\nAestiam Agora :")
print(SCPI_DATA.get("aestiam_agora"))

print("\nAestiam Pierre Rendement existe ?",
      "aestiam_pierre_rendement" in SCPI_DATA)

print("\nAestiam Cap'Hébergimmo existe ?",
      "aestiam_cap_hebergimmo" in SCPI_DATA)

# 3) Vérification événement structurant Novapierre Résidentiel
print("\nNovapierre Résidentiel – événements :")
print(
    SCPI_DATA
    .get("novapierre_residentiel", {})
    .get("evenements_structurants", {})
)

# 4) Vérification écrasement indicateurs (exemple PERIAL)
print("\nPERIAL Hospitalité Europe – indicateurs :")
print(
    SCPI_DATA
    .get("perial_hospitalite_europe", {})
    .get("indicateurs", {})
)

