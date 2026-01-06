export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'N/A';
  }
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1) + 'Md€';
  } else if (amount >= 1000000) {
    return Math.round(amount / 1000000) + 'M€';
  } else if (amount >= 1000) {
    return Math.round(amount / 1000) + 'k€';
  } else {
    return Math.round(amount).toLocaleString('fr-FR') + '€';
  }
};

export const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return 'N/A';
  }
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const getPerformanceColor = (scpiYield: number | undefined | null): string => {
  if (scpiYield === undefined || scpiYield === null || isNaN(scpiYield)) {
    return 'text-gray-600 dark:text-gray-400';
  }
  if (scpiYield >= 7) return 'text-green-600 dark:text-green-400';
  if (scpiYield >= 5) return 'text-blue-600 dark:text-blue-400';
  if (scpiYield >= 3.5) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

export const getDiscountColor = (discount: number | undefined | null): string => {
  if (discount === undefined || discount === null || isNaN(discount)) {
    return 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-300 px-2 py-1 rounded font-bold';
  }
  if (discount < 0) return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-1 rounded font-bold';
  if (discount > 0) return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-2 py-1 rounded font-bold';
  return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 px-2 py-1 rounded font-bold';
};

/**
 * Normalise une chaîne de caractères en supprimant les accents et en la mettant en minuscules
 * Utilisé pour la recherche insensible aux accents
 */
export const normalizeString = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};