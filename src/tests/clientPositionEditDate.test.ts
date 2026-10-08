import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { isCompleteClientPosition, isValidPurchaseDate } from '../utils/clientPositionForm';

const today = '2026-10-08';
const edit = { scpiSlug: 'coeur-d-europe', units: '10', purchasePrice: '204', purchaseDate: '2026-10-01' };
const page = readFileSync(new URL('../app/pages/ClientDashboard.tsx', import.meta.url), 'utf8');

describe('SCPI : même date obligatoire lors de l’ajout et de la modification', () => {
  it('rejette l’édition lorsque la date est vide, impossible ou dans le futur', () => {
    expect(isCompleteClientPosition(edit, today)).toBe(true);
    expect(isCompleteClientPosition({ ...edit, purchaseDate: '' }, today)).toBe(false);
    expect(isCompleteClientPosition({ ...edit, purchaseDate: '2026-10-09' }, today)).toBe(false);
    expect(isCompleteClientPosition({ ...edit, purchaseDate: '2026-02-30' }, today)).toBe(false);
    expect(isValidPurchaseDate('2026-10-01', today)).toBe(true);
  });
  it('bloque le bouton modifier lorsque un champ est vide et renseigne le motif', () => {
    expect(page).toContain('disabled={saving || !canSaveEditedPosition(position)}');
    expect(page).toContain('aria-describedby={\'edit-position-help-\' + position.id}');
    expect(page).toContain('Tous les champs sont valides. Vous pouvez enregistrer.');
    expect(page).toContain('La date est obligatoire.');
    expect(page).toContain('value={editPurchaseDate}');
    expect(page).toContain('type="date"\n                                          required');
  });
  it('refuse une soumission forcée et ne peut plus enregistrer une date nulle', () => {
    const start = page.indexOf('const handleUpdatePosition = async');
    const end = page.indexOf('const handleCorrectFutureDate = async', start);
    const handler = page.slice(start, end);
    expect(handler).toContain('if (!canSaveEditedPosition(position))');
    expect(handler).toContain('purchase_date: editPurchaseDate');
    expect(handler).not.toContain('purchase_date: editPurchaseDate || null');
    expect(page).toContain('const canSaveEditedPosition = (position: Position) => isCompleteClientPosition({');
    expect(page).toContain('disabled={saving || !canAddPosition}');
  });
  it('la correction d’une date future valide également le calendrier réel', () => {
    const start = page.indexOf('const handleCorrectFutureDate = async');
    const end = page.indexOf('const handleDeletePosition = async', start);
    expect(page.slice(start, end)).toContain('isValidPurchaseDate(correctedDate, todayIso)');
  });
});
