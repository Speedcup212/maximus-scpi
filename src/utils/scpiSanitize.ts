import { ScpiInput } from './scpiScoring';

/**
 * Sanitise les données SCPI avant scoring pour éviter les erreurs de calcul
 *
 * Corrections appliquées:
 * - Conversion des virgules en points pour les décimales (FR → EN)
 * - Conversion de la capitalisation en M€ si nécessaire
 * - Nettoyage des valeurs null/undefined
 * - Normalisation des pourcentages
 */
export function sanitizeScpiInput(scpi: ScpiInput): ScpiInput {
  const clone = { ...scpi };

  // Liste des champs numériques à sanitiser
  const numericFields = [
    'rendement',
    'tof',
    'endettement',
    'prix_souscription',
    'valeur_reconstitution',
    'frais_gestion',
    'frais_souscription',
    'capitalisation',
    'delai_jouissance'
  ];

  // 1. Convertir les virgules en points (format FR → EN)
  for (const field of numericFields) {
    const value = (clone as any)[field];
    if (typeof value === 'string') {
      const cleaned = value.replace(/,/g, '.').replace(/\s/g, '');
      const parsed = parseFloat(cleaned);
      (clone as any)[field] = Number.isFinite(parsed) ? parsed : null;
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      (clone as any)[field] = value;
    } else {
      (clone as any)[field] = null;
    }
  }

  // 2. Convertir la capitalisation en M€ si elle est en €
  const cap = Number(clone.capitalisation);
  if (Number.isFinite(cap)) {
    // Si > 100000, on suppose que c'est en € et on convertit en M€
    if (cap > 100000) {
      clone.capitalisation = +(cap / 1_000_000).toFixed(2);
    }
    // Si entre 1000 et 100000, on suppose déjà en milliers d'€ → convertir en M€
    else if (cap > 1000 && cap <= 100000) {
      clone.capitalisation = +(cap / 1000).toFixed(2);
    }
    // Sinon, déjà en M€, on garde tel quel
  }

  // 3. Normaliser les pourcentages (s'assurer qu'ils sont entre 0 et 100)
  if (clone.tof !== null && clone.tof > 100) {
    clone.tof = 100; // Cap à 100%
  }
  if (clone.endettement !== null && clone.endettement < 0) {
    clone.endettement = 0; // Pas d'endettement négatif
  }

  // 4. Nettoyer les répartitions sectorielles/géographiques
  if (clone.repartition_sectorielle) {
    clone.repartition_sectorielle = sanitizeRepartition(clone.repartition_sectorielle);
  }
  if (clone.repartitionSector) {
    clone.repartitionSector = sanitizeRepartition(clone.repartitionSector);
  }
  if (clone.repartition_geographique) {
    clone.repartition_geographique = sanitizeRepartition(clone.repartition_geographique);
  }
  if (clone.repartitionGeo) {
    clone.repartitionGeo = sanitizeRepartition(clone.repartitionGeo);
  }

  // 5. Normaliser les labels
  if (typeof clone.label_isr === 'boolean') {
    clone.label_isr = clone.label_isr ? 'oui' : 'non';
  } else if (typeof clone.label_isr === 'string') {
    const lower = clone.label_isr.toLowerCase().trim();
    if (lower === 'true' || lower === '1' || lower === 'yes') {
      clone.label_isr = 'oui';
    } else if (lower === 'false' || lower === '0' || lower === 'no') {
      clone.label_isr = 'non';
    }
  }

  // 6. Normaliser SFDR
  if (typeof clone.sfdr === 'string') {
    const sfdrClean = clone.sfdr.toLowerCase().replace(/[^0-9]/g, '');
    if (sfdrClean === '6' || sfdrClean === '8' || sfdrClean === '9') {
      clone.sfdr = sfdrClean;
    } else if (clone.sfdr.toLowerCase().includes('article 8') || clone.sfdr.toLowerCase().includes('art 8')) {
      clone.sfdr = '8';
    } else if (clone.sfdr.toLowerCase().includes('article 9') || clone.sfdr.toLowerCase().includes('art 9')) {
      clone.sfdr = '9';
    } else if (clone.sfdr.toLowerCase().includes('article 6') || clone.sfdr.toLowerCase().includes('art 6')) {
      clone.sfdr = '6';
    }
  }

  return clone;
}

/**
 * Sanitise une répartition (secteur ou géo)
 */
function sanitizeRepartition(repartition: Record<string, number>): Record<string, number> {
  const sanitized: Record<string, number> = {};

  for (const [key, value] of Object.entries(repartition)) {
    // Convertir la valeur en nombre
    let numValue: number;
    if (typeof value === 'string') {
      const cleaned = value.replace(/,/g, '.').replace(/%/g, '').replace(/\s/g, '');
      numValue = parseFloat(cleaned);
    } else {
      numValue = Number(value);
    }

    // Ne garder que les valeurs valides et positives
    if (Number.isFinite(numValue) && numValue > 0) {
      sanitized[key.trim()] = numValue;
    }
  }

  return sanitized;
}

/**
 * Sanitise un batch de SCPI
 */
export function sanitizeScpiBatch(scpiList: ScpiInput[]): ScpiInput[] {
  return scpiList.map(sanitizeScpiInput);
}

/**
 * Valide qu'une SCPI a les données minimales requises pour le scoring
 */
export function validateScpiInput(scpi: ScpiInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!scpi.nom || scpi.nom.trim() === '') {
    errors.push('Le nom de la SCPI est requis');
  }

  if (scpi.rendement === null || scpi.rendement === undefined) {
    errors.push('Le rendement est requis pour le calcul du score');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Filtre les SCPI invalides d'un batch et retourne les valides + warnings
 */
export function filterValidScpi(scpiList: ScpiInput[]): {
  valid: ScpiInput[];
  invalid: Array<{ scpi: ScpiInput; errors: string[] }>;
} {
  const valid: ScpiInput[] = [];
  const invalid: Array<{ scpi: ScpiInput; errors: string[] }> = [];

  for (const scpi of scpiList) {
    const validation = validateScpiInput(scpi);
    if (validation.valid) {
      valid.push(scpi);
    } else {
      invalid.push({ scpi, errors: validation.errors });
    }
  }

  return { valid, invalid };
}
