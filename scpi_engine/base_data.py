"""
Couche d'accès aux données SCPI de base.

Ce module NE MODIFIE PAS les données d'origine. Il se contente de les
charger depuis les sources existantes pour les rendre disponibles au
moteur de fusion.

Aujourd'hui, la source est le JSON `src/data/scpi_complet.json` déjà
utilisé en production. Si, à l'avenir, un module Python centralise ces
données, il suffira de modifier **uniquement** ce fichier.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List
import json

ScpiRecord = Dict[str, Any]


def _get_project_root() -> Path:
    """
    Déduit la racine du projet à partir de ce fichier.

    Hypothèse : `scpi_engine` est créé à la racine du projet.
    """
    return Path(__file__).resolve().parent.parent


def load_base_scpi_data() -> List[ScpiRecord]:
    """
    Charge les données SCPI de base **sans aucune modification**.

    - Source actuelle : `src/data/scpi_complet.json`
    - AUCUNE écriture n'est effectuée.
    - La structure retournée est une liste de dicts.
    """
    root = _get_project_root()
    json_path = root / "src" / "data" / "scpi_complet.json"

    with json_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("Le fichier scpi_complet.json doit contenir une liste d'objets.")

    return data


__all__ = ["ScpiRecord", "load_base_scpi_data"]

