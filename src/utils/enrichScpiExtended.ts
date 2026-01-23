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

  if (!matchingScpi) {
    return scpiExtended;
  }

  // Enrichir avec les données du fichier Excel
  return {
    ...scpiExtended,
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
    
    // Endettement (LTV)
    ltv: scpiExtended.ltv ?? matchingScpi.debt,
    
    // Profil de risque
    profilRisque: matchingScpi.profilRisque ?? scpiExtended.profilRisque,
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
