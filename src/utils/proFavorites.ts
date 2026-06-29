import { scpiDataExtended, SCPIExtended } from '../data/scpiDataExtended';

const STORAGE_KEY = 'maximus_pro_favorite_scpis';

/**
 * Récupère les IDs des SCPI favorites depuis localStorage.
 * Retourne un Set<number> vide si rien n'est stocké.
 */
export function getFavoriteScpiIds(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed.map(Number).filter(id => !isNaN(id)));
    return new Set();
  } catch {
    return new Set();
  }
}

/**
 * Sauvegarde les IDs des SCPI favorites dans localStorage.
 */
export function saveFavoriteScpiIds(ids: Set<number>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage full or unavailable — silent fail
  }
}

/**
 * Ajoute une SCPI aux favoris. Retourne le nouveau Set.
 */
export function addFavoriteScpi(id: number): Set<number> {
  const favorites = getFavoriteScpiIds();
  favorites.add(id);
  saveFavoriteScpiIds(favorites);
  window.dispatchEvent(new Event('maximus-pro-favorites-updated'));
  return favorites;
}

/**
 * Retire une SCPI des favoris. Retourne le nouveau Set.
 */
export function removeFavoriteScpi(id: number): Set<number> {
  const favorites = getFavoriteScpiIds();
  favorites.delete(id);
  saveFavoriteScpiIds(favorites);
  window.dispatchEvent(new Event('maximus-pro-favorites-updated'));
  return favorites;
}

/**
 * Bascule l'état favori d'une SCPI (ajoute si absent, retire si présent).
 * Retourne le nouveau Set.
 */
export function toggleFavoriteScpi(id: number): Set<number> {
  const favorites = getFavoriteScpiIds();
  if (favorites.has(id)) {
    return removeFavoriteScpi(id);
  }
  return addFavoriteScpi(id);
}

/**
 * Vérifie si une SCPI est dans les favoris.
 */
export function isFavoriteScpi(id: number): boolean {
  return getFavoriteScpiIds().has(id);
}

/**
 * Récupère les objets SCPI complets correspondant aux IDs favoris.
 */
export function getFavoriteScpis(): SCPIExtended[] {
  const ids = getFavoriteScpiIds();
  return scpiDataExtended.filter(scpi => ids.has(scpi.id));
}
