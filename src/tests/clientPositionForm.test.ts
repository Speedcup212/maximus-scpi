import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { isCompleteClientPosition, isValidPurchaseDate, positivePositionNumber } from '../utils/clientPositionForm';

const today = '2026-10-08';
const valid = {
  scpiSlug: 'coeur-d-europe',
  units: '10',
  purchasePrice: '204',
  purchaseDate: '2026-10-01',
};

describe('ajout de SCPI au portefeuille : validation complète', () => {
  it('ne valide que les quatre champs présents et cohérents', () => {
    expect(isCompleteClientPosition(valid, today)).toBe(true);
    for (const field of Object.keys(valid) as (keyof typeof valid)[]) {
      expect(isCompleteClientPosition({ ...valid, [field]: '' }, today)).toBe(false);
      expect(isCompleteClientPosition({ ...valid, [field]: '   ' }, today)).toBe(false);
    }
  });
  it('rejette les parts et les prix nuls, négatifs ou non numériques', () => {
    for (const value of ['0', '-2', 'abc', 'Infinity', '1e309', '1 000', '1..5']) {
      expect(isCompleteClientPosition({ ...valid, units: value }, today)).toBe(false);
      expect(isCompleteClientPosition({ ...valid, purchasePrice: value }, today)).toBe(false);
    }
    expect(positivePositionNumber('0,5')).toBe(0.5);
    expect(isCompleteClientPosition({ ...valid, units: '1,5', purchasePrice: '204,50' }, today)).toBe(true);
  });
  it('refuse les dates futures et calendaires impossibles, accepte aujourd’hui', () => {
    expect(isCompleteClientPosition({ ...valid, purchaseDate: '2026-10-09' }, today)).toBe(false);
    expect(isCompleteClientPosition({ ...valid, purchaseDate: today }, today)).toBe(true);
    expect(isValidPurchaseDate('2026-02-30', today)).toBe(false);
    expect(isValidPurchaseDate('2026-02-29', today)).toBe(false);
    expect(isValidPurchaseDate('2024-02-29', today)).toBe(true);
    expect(isValidPurchaseDate('2026-10-8', today)).toBe(false);
  });
  it('désactive le bouton et bloque aussi une soumission forcée, sans enregistrer une date vide', () => {
    const dashboard = readFileSync(new URL('../app/pages/ClientDashboard.tsx', import.meta.url), 'utf8');
    expect(dashboard).toContain('disabled={saving || !canAddPosition}');
    expect(dashboard).toContain('if (!canAddPosition)');
    expect(dashboard).toContain('isCompleteClientPosition({ scpiSlug: selectedSlug, units, purchasePrice, purchaseDate }, todayIso)');
    expect(dashboard).toContain('purchase_date: purchaseDate,');
    expect(dashboard).toContain('Date d’achat\n                <input\n                  type="date"\n                  required');
    expect(dashboard).toContain('Tous les champs sont valides. Vous pouvez ajouter cette SCPI.');
    expect(dashboard).toContain('Pour activer l’ajout, renseignez les quatre champs');
  });
});
