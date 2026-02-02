import { Scpi } from '../types/scpi';
import { SCPIExtended } from '../data/scpiDataExtended';

/**
 * Enrichit les données SCPIExtended avec les données complètes du fichier Excel via scpiData
 * Cette fonction permet d'ajouter les champs manquants (délai de jouissance, frais de gestion, etc.)
 * qui sont présents dans scpiData mais pas dans scpiDataExtended
 */
export function enrichScpiExtended(
  scpiExtended: SCPIExtended,
  scpiData: Scpi[]
): SCPIExtended {
  // Trouver la SCPI correspondante dans scpiData par nom
  const matchingScpi = scpiData.find(
    scpi => scpi.name.toLowerCase() === scpiExtended.name.toLowerCase()
  );

  // Debug: vérifier si Paref Evo est trouvé
  if (scpiExtended.name === 'Paref Evo' && !matchingScpi) {
    console.warn('[enrichScpiExtended] Paref Evo non trouvé dans scpiData. Noms disponibles:', 
      scpiData.filter(s => s.name.toLowerCase().includes('paref')).map(s => s.name).join(', '));
  }

  if (!matchingScpi) {
    return scpiExtended;
  }

  // Convertir les répartitions depuis scpiData (données mises à jour) en tableaux
  const sectorsFromScpiData = matchingScpi.repartitionSector && matchingScpi.repartitionSector.length > 0
    ? matchingScpi.repartitionSector
    : scpiExtended.sectors;
  
  const geographyFromScpiData = matchingScpi.repartitionGeo && matchingScpi.repartitionGeo.length > 0
    ? matchingScpi.repartitionGeo
    : scpiExtended.geography;

  // Enrichir avec les données du fichier Excel
  // PRIORITÉ aux données mises à jour depuis scpiData (JSON) pour les champs critiques
  return {
    ...scpiExtended,
    // Répartitions : priorité aux données mises à jour depuis scpiData
    sectors: sectorsFromScpiData,
    geography: geographyFromScpiData,
    
    // Valeurs de reconstitution/retrait/réalisation
    reconstitutionValue: scpiExtended.reconstitutionValue ?? matchingScpi.valeurReconstitution,
    valeurRetrait: matchingScpi.valeurRetrait ?? scpiExtended.valeurRetrait,
    valeurRealisation: matchingScpi.valeurRealisation ?? scpiExtended.valeurRealisation,
    valeurReconstitution: matchingScpi.valeurReconstitution ?? scpiExtended.valeurReconstitution,
    
    // Frais
    entryFees: scpiExtended.entryFees ?? matchingScpi.fees,
    managementFees: scpiExtended.managementFees ?? matchingScpi.fraisGestion,
    
    // Délai de jouissance et versement
    delaiJouissance: matchingScpi.delaiJouissance ?? scpiExtended.delaiJouissance,
    versementLoyers: matchingScpi.versementLoyers ?? scpiExtended.versementLoyers,
    withdrawalDelay: scpiExtended.withdrawalDelay ?? 
      (matchingScpi.delaiJouissance ? `${matchingScpi.delaiJouissance} mois` : undefined),
    
    // Autres informations
    dureeDetentionRecommandee: matchingScpi.dureeDetentionRecommandee ?? scpiExtended.dureeDetentionRecommandee,
    distribution: matchingScpi.distribution ?? scpiExtended.distribution,
    assetsCount: scpiExtended.assetsCount ?? matchingScpi.nbImmeubles,
    sfdr: matchingScpi.sfdr ?? scpiExtended.sfdr,
    profilCible: matchingScpi.profilCible ?? scpiExtended.profilCible,
    
    // Endettement (LTV) : PRIORITÉ aux données mises à jour depuis scpiData
    ltv: matchingScpi.debt !== undefined ? matchingScpi.debt : scpiExtended.ltv,
    
    // TOF : PRIORITÉ aux données mises à jour depuis scpiData
    tof: matchingScpi.tof !== undefined ? matchingScpi.tof : scpiExtended.tof,
    
    // Yield : PRIORITÉ aux données mises à jour depuis scpiData
    yield: matchingScpi.yield !== undefined ? matchingScpi.yield : scpiExtended.yield,
    
    // Profil de risque
    profilRisque: matchingScpi.profilRisque ?? scpiExtended.profilRisque,
    
    // Données locatives extraites des bulletins trimestriels
    nombreLocataires: matchingScpi.nombreLocataires ?? scpiExtended.nombreLocataires,
    walt: matchingScpi.walt ?? scpiExtended.walt,
    walb: matchingScpi.walb ?? scpiExtended.walb,
    
    // Données trimestrielles extraites des bulletins
    collecteNetteTrimestre: matchingScpi.collecteNetteTrimestre ?? scpiExtended.collecteNetteTrimestre,
    nbCessionsTrimestre: matchingScpi.nbCessionsTrimestre ?? scpiExtended.nbCessionsTrimestre,
  };
}

/**
 * Enrichit un tableau de SCPIExtended avec les données de scpiData
 */
export function enrichScpiExtendedArray(
  scpiExtendedArray: SCPIExtended[],
  scpiData: Scpi[]
): SCPIExtended[] {
  return scpiExtendedArray.map(scpi => enrichScpiExtended(scpi, scpiData));
}
