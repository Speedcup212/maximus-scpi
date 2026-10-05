import { Scpi } from '../types/scpi';
import { SCPIExtended } from '../data/scpiDataExtended';

export function enrichScpiExtended(
  scpiExtended: SCPIExtended,
  scpiData: Scpi[]
): SCPIExtended {
  const matchingScpi = scpiData.find(
    scpi => scpi.name.toLowerCase() === scpiExtended.name.toLowerCase()
  );

  if (scpiExtended.name === 'Paref Evo' && !matchingScpi) {
    console.warn('[enrichScpiExtended] Paref Evo non trouvé dans scpiData. Noms disponibles:',
      scpiData.filter(s => s.name.toLowerCase().includes('paref')).map(s => s.name).join(', '));
  }

  if (!matchingScpi) return scpiExtended;

  const sectorsFromScpiData = matchingScpi.repartitionSector && matchingScpi.repartitionSector.length > 0
    ? matchingScpi.repartitionSector
    : scpiExtended.sectors;
  const geographyFromScpiData = matchingScpi.repartitionGeo && matchingScpi.repartitionGeo.length > 0
    ? matchingScpi.repartitionGeo
    : scpiExtended.geography;
  const valuationComparable = matchingScpi.discountQaStatus === 'publishable';

  return {
    ...scpiExtended,
    sectors: sectorsFromScpiData,
    geography: geographyFromScpiData,
    reconstitutionValue: valuationComparable
      ? (matchingScpi.valeurReconstitution ?? scpiExtended.reconstitutionValue)
      : undefined,
    valeurRetrait: matchingScpi.valeurRetrait ?? scpiExtended.valeurRetrait,
    valeurRealisation: matchingScpi.valeurRealisation ?? scpiExtended.valeurRealisation,
    entryFees: scpiExtended.entryFees ?? matchingScpi.fees,
    managementFees: scpiExtended.managementFees ?? matchingScpi.fraisGestion,
    delaiJouissance: matchingScpi.delaiJouissance ?? scpiExtended.delaiJouissance,
    versementLoyers: matchingScpi.versementLoyers ?? scpiExtended.versementLoyers,
    withdrawalDelay: scpiExtended.withdrawalDelay ??
      (matchingScpi.delaiJouissance ? `${matchingScpi.delaiJouissance} mois` : undefined),
    dureeDetentionRecommandee: matchingScpi.dureeDetentionRecommandee ?? scpiExtended.dureeDetentionRecommandee,
    distribution: matchingScpi.distribution ?? scpiExtended.distribution,
    assetsCount: scpiExtended.assetsCount ?? matchingScpi.nbImmeubles,
    sfdr: matchingScpi.sfdr ?? scpiExtended.sfdr,
    profilCible: matchingScpi.profilCible ?? scpiExtended.profilCible,
    discount: matchingScpi.discount,
    discountQaStatus: matchingScpi.discountQaStatus,
    hasWaitingShares: matchingScpi.hasWaitingShares,
    ltv: matchingScpi.debt !== undefined ? matchingScpi.debt : scpiExtended.ltv,
    tof: matchingScpi.tof !== undefined ? matchingScpi.tof : scpiExtended.tof,
    yield: matchingScpi.yield !== undefined ? matchingScpi.yield : scpiExtended.yield,
    profilRisque: matchingScpi.profilRisque ?? scpiExtended.profilRisque,
    nombreLocataires: matchingScpi.nombreLocataires ?? scpiExtended.nombreLocataires,
    walt: matchingScpi.walt ?? scpiExtended.walt,
    walb: matchingScpi.walb ?? scpiExtended.walb,
    collecteNetteTrimestre: matchingScpi.collecteNetteTrimestre ?? scpiExtended.collecteNetteTrimestre,
    nbCessionsTrimestre: matchingScpi.nbCessionsTrimestre ?? scpiExtended.nbCessionsTrimestre,
    dataPeriod: matchingScpi.maximusSourcePeriode ?? matchingScpi.periodeBulletinTrimestriel ?? scpiExtended.dataPeriod,
    dataDate: matchingScpi.dateBulletin ?? scpiExtended.dataDate,
    dataSourceDocument: matchingScpi.maximusSourceDocument ?? scpiExtended.dataSourceDocument,
    dataStatus: matchingScpi.maximusDataStatus ?? scpiExtended.dataStatus,
    dataUpdateDate: matchingScpi.maximusUpdateDate ?? scpiExtended.dataUpdateDate,
    liquidityNote: matchingScpi.liquidite ?? scpiExtended.liquidityNote,
  };
}

export function enrichScpiExtendedArray(
  scpiExtendedArray: SCPIExtended[],
  scpiData: Scpi[]
): SCPIExtended[] {
  return scpiExtendedArray.map(scpi => enrichScpiExtended(scpi, scpiData));
}