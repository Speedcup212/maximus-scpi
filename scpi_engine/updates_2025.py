"""
Couche de mise à jour 2025.

Ce module contient UNIQUEMENT les valeurs issues des bulletins officiels
2025. Il ne duplique pas les données complètes, seulement :

- les champs effectivement mis à jour
- les nouvelles SCPI éventuelles (cas explicitement indiqués)

Règles :
- aucune donnée n'est inventée
- si une information n'apparaît pas dans le bulletin => utiliser `None`
- la clé principale est toujours `Nom SCPI`
"""

from __future__ import annotations

from typing import Any, Dict

from .base_data import ScpiRecord

# Type : mapping "Nom SCPI" -> patch partiel de données
ScpiUpdates = Dict[str, ScpiRecord]


#: Mises à jour issues des bulletins 2025.
#:
# Chaque entrée ne contient QUE les champs présents / confirmés
# dans les bulletins 2025.
SCPI_UPDATES_2025: ScpiUpdates = {
    # Exemple concret fourni par l'utilisateur :
    # SCPI Cœur de Ville (bulletin T3 2025)
    #
    # - Capitalisation  : 28,5 M€
    # - Endettement     : 15,62 %
    #
    # Remarque : Les répartitions géographiques et sectorielles ont
    # déjà été mises à jour directement dans `scpi_complet.json`.
    "Coeur de ville": {
        "Capitalisation (M€)": 28.5,
        "Endettement (%)": 15.62,
        # Toute information absente du bulletin resterait non indiquée
        # ici. Si le bulletin précise explicitement qu'une donnée est
        # non disponible, on utiliserait `None`.
    },
}


__all__ = ["ScpiUpdates", "SCPI_UPDATES_2025"]

