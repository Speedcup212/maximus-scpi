import { Scpi } from '../types/scpi';
import { ScpiInput, SectorMap, GeoMap } from './scpiScoring';
import { sanitizeScpiInput } from './scpiSanitize';

/**
 * Transforme les données SCPI du format Maximus vers le format ScpiInput pour le scoring.
 * Une valeur de reconstitution n'est jamais reconstruite depuis une décote non certifiée.
 */
export function transformScpiToScoringInput(scpi: Scpi): ScpiInput {
  const repartitionSectorielle: SectorMap | null = scpi.repartitionSector
    ? scpi.repartitionSector.reduce((acc, item) => {
        acc[item.name] = item.value;
        return acc;
      }, {} as SectorMap)
    : null;

  const repartitionGeographique: GeoMap | null = scpi.repartitionGeo
    ? scpi.repartitionGeo.reduce((acc, item) => {
        acc[item.name] = item.value;
        return acc;
      }, {} as GeoMap)
    : null;

  const prixSouscription = scpi.price || null;
  const valeurReconstitution = scpi.discountQaStatus === 'publishable'
    ? (scpi.valeurReconstitution ?? (
        prixSouscription && Number.isFinite(scpi.discount) && 1 + scpi.discount / 100 > 0
          ? prixSouscription / (1 + scpi.discount / 100)
          : null
      ))
    : null;

  const raw: ScpiInput = {
    id: scpi.id,
    nom: scpi.name,
    societe_gestion: scpi.company || null,
    rendement: scpi.yield || null,
    tof: scpi.tof || null,
    endettement: null,
    label_isr: scpi.isr ? 'oui' : 'non',
    sfdr: null,
    capitalisation: scpi.capitalization ? scpi.capitalization / 1_000_000 : null,
    delai_jouissance: null,
    prix_souscription: prixSouscription,
    valeur_reconstitution: valeurReconstitution,
    frais_gestion: null,
    frais_souscription: scpi.fees || null,
    repartitionSector: repartitionSectorielle,
    repartitionGeo: repartitionGeographique,
  };

  return sanitizeScpiInput(raw);
}

export function transformScpiArrayToScoringInput(scpiList: Scpi[]): ScpiInput[] {
  return scpiList.map(transformScpiToScoringInput);
}

export function transformSupabaseScpiToScoringInput(dbScpi: any): ScpiInput {
  const repartitionSector = typeof dbScpi.repartition_sectorielle === 'string'
    ? JSON.parse(dbScpi.repartition_sectorielle)
    : dbScpi.repartition_sectorielle;

  const repartitionGeo = typeof dbScpi.repartition_geographique === 'string'
    ? JSON.parse(dbScpi.repartition_geographique)
    : dbScpi.repartition_geographique;

  const raw: ScpiInput = {
    id: dbScpi.id,
    nom: dbScpi.nom || dbScpi.name,
    societe_gestion: dbScpi.societe_gestion || dbScpi.company,
    rendement: dbScpi.rendement || dbScpi.yield,
    tof: dbScpi.tof,
    endettement: dbScpi.endettement || dbScpi.ltv,
    label_isr: dbScpi.label_isr || (dbScpi.isr ? 'oui' : 'non'),
    sfdr: dbScpi.sfdr,
    capitalisation: dbScpi.capitalisation || (dbScpi.capitalization ? dbScpi.capitalization / 1_000_000 : null),
    delai_jouissance: dbScpi.delai_jouissance,
    prix_souscription: dbScpi.prix_souscription || dbScpi.price,
    valeur_reconstitution: dbScpi.valeur_reconstitution,
    frais_gestion: dbScpi.frais_gestion,
    frais_souscription: dbScpi.frais_souscription || dbScpi.fees,
    repartition_sectorielle: repartitionSector,
    repartition_geographique: repartitionGeo,
  };

  return sanitizeScpiInput(raw);
}