import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// Test de garde-fou : la correction doit rester explicite, immédiate et limitée à la date.
const source = readFileSync(new URL('../app/pages/ClientDashboard.tsx', import.meta.url), 'utf8');
describe('correction des dates futures dans le portefeuille client', () => {
  it('identifie la SCPI et montre la date enregistrée en français', () => {
    expect(source).toContain('Une date d’achat à vérifier');
    expect(source).toContain('const scpiName = indicatorMap.get(position.scpi_slug)?.nom');
    expect(source).toContain('formatPurchaseDateFr(position.purchase_date)');
    expect(source).toContain('formatPurchaseDateFr(todayIso)');
    expect(source).toContain('Vérifiez la date figurant sur votre bulletin de souscription');
  });
  it('affiche le formulaire directement sous le message sans envoyer vers une fiche éloignée', () => {
    expect(source).toContain('Date réelle d’achat');
    expect(source).toContain('Enregistrer la date');
    expect(source).toContain('max={todayIso}');
    expect(source).toContain('aria-describedby');
    expect(source).not.toContain('firstEditableFuturePosition');
  });
  it('ne modifie que la date et protège les positions synchronisées', () => {
    const start = source.indexOf('const handleCorrectFutureDate = async');
    const end = source.indexOf('const handleDeletePosition = async', start);
    const handler = source.slice(start, end);
    expect(handler).toContain("position.source !== 'external'");
    expect(handler).toContain(".update({ purchase_date: correctedDate })");
    expect(handler).toContain(".eq('user_id', user.id)");
    expect(handler).toContain(".eq('source', 'external')");
    expect(handler).toContain('correctedDate > todayIso');
    expect(handler).not.toContain('units: parsedUnits');
    expect(handler).not.toContain('purchase_price_per_unit: parsedPrice');
  });
  it('explique quoi faire lorsque la souscription est prévue, sans encourager une date fictive', () => {
    expect(source).toContain('Si l’achat est seulement prévu');
    expect(source).toContain('ne saisissez pas une date fictive');
    expect(source).toContain('Contactez votre conseiller');
  });
});
