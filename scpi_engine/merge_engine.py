# scpi_engine/merge_engine.py
# Moteur d'écrasement contrôlé (deep merge)
# Règle :
# - si une clé existe dans les updates -> elle écrase la base
# - sinon -> on conserve la base
# - merge récursif dictionnaire par dictionnaire
# - aucune suppression implicite

from copy import deepcopy


def deep_merge(base: dict, update: dict) -> dict:
    """
    Fusion récursive base <- update
    """
    result = deepcopy(base)

    for key, value in update.items():
        if isinstance(value, dict) and isinstance(result.get(key), dict):
            result[key] = deep_merge(result[key], value)
        else:
            # Écrasement direct (y compris None si fourni explicitement)
            result[key] = value

    return result


def apply_updates(scpi_base_data: dict, scpi_updates: dict) -> dict:
    """
    Applique les updates SCPI par SCPI.
    - Les SCPI existantes sont fusionnées champ par champ
    - Les SCPI présentes uniquement dans les updates sont ajoutées
    """
    final_data = {}

    # 1) Fusion des SCPI existantes
    for scpi_id, base_scpi in scpi_base_data.items():
        if scpi_id in scpi_updates:
            final_data[scpi_id] = deep_merge(base_scpi, scpi_updates[scpi_id])
        else:
            final_data[scpi_id] = deepcopy(base_scpi)

    # 2) Ajout des nouvelles SCPI absentes de la base
    for scpi_id, update_scpi in scpi_updates.items():
        if scpi_id not in final_data:
            final_data[scpi_id] = deepcopy(update_scpi)

    return final_data


