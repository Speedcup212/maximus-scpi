// RECOVERY-227 — le garde-fou de promotion doit être exercé, pas seulement décrit.
//
// La revue indépendante du 28/11 a demandé « un test effectif du garde-fou
// existant » : le SQL de quarantaine ne prouve rien sur le refus réel. Ce test
// appelle la fonction de validation effectivement montée dans l'ingestion et
// vérifie ce qui est réellement accepté ou refusé, champ par champ.
//
// Aucune écriture, aucun réseau : la fonction est pure.
import { describe, expect, it } from 'vitest';
import { validateIndicatorPatch } from '../../netlify/functions/utils/scpi-bulletin-ingestion';

// Valeurs réellement publiées page 4 du bulletin Kyaneos Pierre 3T 2026.
const PUBLIEES = {
  valeur_realisation: 186.49,
  prix_reconstitution: 225.02,
  prix_retrait: 199.36,
  nombre_immeubles: 666,
};

// Valeurs décalées d'un champ, telles qu'extraites le 2026-11-28 03:30:53Z.
const DECALEES = {
  valeur_realisation: 184.42, // valeur IFI
  prix_reconstitution: 186.49, // vraie valeur de réalisation
  prix_retrait: 225.02, // vraie valeur de reconstitution
  nombre_immeubles: 8, // acquisitions du trimestre
};

// État précédent réel : les valeurs T2 2026 en production.
const T2_2026 = {
  valeur_realisation: 187.1,
  prix_reconstitution: 225.26,
  prix_retrait: 199.36,
  nombre_immeubles: 660,
};

describe('garde de promotion RECOVERY-227', () => {
  it('les montants permutés restent dans les plages : les bornes ne les arrêtent pas', () => {
    const { accepted, rejected } = validateIndicatorPatch(DECALEES, null);
    // Limite mesurée, pas contournée : une permutation entre montants par part
    // produit des valeurs plausibles. Le refus ne peut venir que du décalage
    // détecté en amont et de la quarantaine de provenance.
    expect(accepted).toEqual(DECALEES);
    expect(rejected).toEqual([]);
  });

  it('le nombre d’actifs effondré (8 au lieu de 666) est refusé', () => {
    const { accepted, rejected } = validateIndicatorPatch(DECALEES, T2_2026);
    expect(accepted.nombre_immeubles).toBeUndefined();
    expect(rejected.some(r => r.startsWith('nombre_immeubles'))).toBe(true);
  });

  it('un nombre d’actifs effondré ne peut pas écraser le stock certifié', () => {
    const { accepted, rejected } = validateIndicatorPatch(
      { nombre_immeubles: 8 },
      { nombre_immeubles: 666 }
    );
    expect(accepted.nombre_immeubles).toBeUndefined();
    expect(rejected).toHaveLength(1);
    expect(rejected[0]).toMatch(/nombre_immeubles/);
  });

  it('tous les stocks sont protégés contre un effondrement', () => {
    const cas = [
      { nombre_immeubles: 8 },
      { nombre_locataires: 2 },
      { nombre_associes: 3 },
      { nombre_parts: 500 },
    ];
    const precedent = {
      nombre_immeubles: 666,
      nombre_locataires: 115,
      nombre_associes: 4_000,
      nombre_parts: 3_147_773,
    };
    for (const patch of cas) {
      const { accepted } = validateIndicatorPatch(patch, precedent);
      expect(accepted).toEqual({});
    }
  });

  it('une valeur hors plage est refusée avant toute comparaison', () => {
    const { accepted, rejected } = validateIndicatorPatch({ nombre_immeubles: 10_000_000 }, null);
    expect(accepted.nombre_immeubles).toBeUndefined();
    expect(rejected[0]).toMatch(/hors plage/);
  });

  it('une valeur non numérique est refusée', () => {
    const { accepted, rejected } = validateIndicatorPatch({ prix_retrait: '199,36' }, null);
    expect(accepted.prix_retrait).toBeUndefined();
    expect(rejected[0]).toMatch(/non numérique/);
  });

  it('les valeurs officielles sont acceptées sans rejet', () => {
    const { accepted, rejected } = validateIndicatorPatch(PUBLIEES, T2_2026);
    expect(accepted).toEqual(PUBLIEES);
    expect(rejected).toEqual([]);
  });

  it('un endettement de 0 % reste dans la plage : le refus du faux zéro est en amont', () => {
    // Fixe la limite : les bornes [0, 80] ne distinguent pas un faux zéro d'un
    // vrai. La non-régression vient de l'extracteur (champ absent ou 25 % lu),
    // jamais de cette fonction.
    const { accepted } = validateIndicatorPatch({ endettement: 0 }, { endettement: 25 });
    expect(accepted.endettement).toBe(0);
  });

  it('un saut d’endettement au-delà de 40 points est refusé', () => {
    const { accepted, rejected } = validateIndicatorPatch({ endettement: 70 }, { endettement: 25 });
    expect(accepted.endettement).toBeUndefined();
    expect(rejected[0]).toMatch(/variation > 40 points/);
  });

  it('les évolutions de stock légitimes ne sont pas bloquées', () => {
    const cas: Array<[string, Record<string, number>, Record<string, number>]> = [
      ['acquisition de 3 actifs', { nombre_immeubles: 669 }, { nombre_immeubles: 666 }],
      ['acquisition forte', { nombre_immeubles: 932 }, { nombre_immeubles: 666 }],
      ['cession', { nombre_immeubles: 533 }, { nombre_immeubles: 666 }],
      ['locataires en hausse', { nombre_locataires: 132 }, { nombre_locataires: 115 }],
      ['parts en hausse', { nombre_parts: 3_210_728 }, { nombre_parts: 3_147_773 }],
    ];
    for (const [nom, patch, precedent] of cas) {
      const { accepted, rejected } = validateIndicatorPatch(patch, precedent);
      expect(rejected, nom).toEqual([]);
      expect(accepted, nom).toEqual(patch);
    }
  });

  it('sans valeur précédente comparable, aucune variation n’est inventée', () => {
    // Un premier import n'a pas d'historique : l'absence de référence ne doit ni
    // bloquer la ligne ni créer un refus fictif.
    expect(validateIndicatorPatch({ nombre_immeubles: 8 }, null).rejected).toEqual([]);
    expect(validateIndicatorPatch({ nombre_immeubles: 8 }, { nombre_immeubles: 0 }).rejected).toEqual([]);
  });
});
