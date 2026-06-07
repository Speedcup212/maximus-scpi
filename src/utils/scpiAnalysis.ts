import { Scpi } from '../types/scpi';
import { computeDisplayedDiscount } from './formatters';

/**
 * Décote/surcote telle qu'AFFICHÉE dans le bloc KPI (recalcul live prix/VR + garde-fou).
 * Source unique partagée par les textes d'analyse afin d'éviter toute divergence KPI / texte.
 * Retourne null quand la décote n'est pas fiable/comparable (→ ne pas la mentionner).
 */
const getDisplayedDiscount = (scpi: Scpi): number | null =>
  computeDisplayedDiscount(scpi.price, scpi.valeurReconstitution, scpi.discountQaStatus, scpi.discount);

/**
 * Échelle de référence pour la capitalisation et la liquidité SCPI
 */
export interface CapitalizationCategory {
  category: 'petite' | 'intermediaire' | 'significative' | 'grande';
  label: string;
  liquidityQualification: string;
  liquidityPotential: 'fragile' | 'correcte' | 'confortable' | 'robuste';
}

/**
 * Détermine la catégorie de capitalisation selon l'échelle de référence marché
 */
export const getCapitalizationCategory = (capitalization: number): CapitalizationCategory => {
  const capitalizationM = capitalization / 1000000; // Convertir en millions
  
  if (capitalizationM < 100) {
    return {
      category: 'petite',
      label: 'Petite SCPI',
      liquidityQualification: 'liquidité potentiellement fragile',
      liquidityPotential: 'fragile'
    };
  } else if (capitalizationM < 300) {
    return {
      category: 'intermediaire',
      label: 'SCPI de taille intermédiaire',
      liquidityQualification: 'liquidité généralement correcte si la collecte est active',
      liquidityPotential: 'correcte'
    };
  } else if (capitalizationM < 800) {
    return {
      category: 'significative',
      label: 'SCPI de taille significative',
      liquidityQualification: 'liquidité confortable en conditions normales de marché',
      liquidityPotential: 'confortable'
    };
  } else {
    return {
      category: 'grande',
      label: 'SCPI de grande taille',
      liquidityQualification: 'liquidité structurellement plus robuste, sans garantie',
      liquidityPotential: 'robuste'
    };
  }
};

/**
 * Formate la capitalisation avec sa catégorie et qualification de liquidité
 */
export const formatCapitalizationWithLiquidity = (capitalization: number): string => {
  const capCategory = getCapitalizationCategory(capitalization);
  const capitalizationM = capitalization / 1000000;
  const capitalizationB = capitalization / 1000000000;
  
  let formattedCap: string;
  if (capitalizationM >= 1000) {
    formattedCap = `${capitalizationB.toFixed(1)}Md€`;
  } else {
    formattedCap = `${capitalizationM.toFixed(0)}M€`;
  }
  
  return `${formattedCap} (${capCategory.label.toLowerCase()}) – ${capCategory.liquidityQualification}`;
};

export const getScpiAdvantages = (scpi: Scpi): string[] => {
  const advantages: string[] = [];
  
  // Rendement
  if (scpi.yield >= 7) {
    advantages.push(`Rendement de ${scpi.yield.toFixed(2)}%`);
  } else if (scpi.yield >= 5.5) {
    advantages.push(`Rendement de ${scpi.yield.toFixed(2)}%`);
  }
  
  // TOF
  if (scpi.tof >= 95) {
    advantages.push(`Taux d'occupation de ${scpi.tof.toFixed(1)}%`);
  }
  
  // Distribution
  if (scpi.yield > 0) {
    advantages.push("Distribution trimestrielle");
  }
  
  // Diversification sectorielle
  if (scpi.repartitionSector && scpi.repartitionSector.length >= 3) {
    advantages.push(`Diversification sur ${scpi.repartitionSector.length} secteurs`);
  }
  
  // Diversification géographique
  if (scpi.geography === 'europe') {
    const geoCount = scpi.repartitionGeo?.length || 0;
    advantages.push(`Exposition géographique européenne (${geoCount} pays)`);
  } else if (scpi.geography === 'international') {
    const geoCount = scpi.repartitionGeo?.length || 0;
    advantages.push(`Exposition géographique internationale (${geoCount} pays)`);
  }
  
  // Accès institutionnel
  if (scpi.capitalization >= 1000000000) {
    advantages.push(`Capitalisation de ${(scpi.capitalization / 1000000000).toFixed(1)}Md€`);
  }
  
  // Fiscalité
  if (scpi.european || scpi.geography === 'international') {
    advantages.push("Fiscalité via assurance-vie possible");
  }
  
  // Accessibilité
  if (scpi.minInvest <= 1000) {
    advantages.push(`Ticket d'entrée de ${scpi.minInvest.toLocaleString('fr-FR')}€`);
  }
  
  // Société de gestion
  const experiencedManagers = ['La Française REM', 'PERIAL Asset Management', 'Sofidy', 'Amundi Immobilier'];
  if (experiencedManagers.includes(scpi.company)) {
    advantages.push(`Société de gestion : ${scpi.company}`);
  }
  
  // Qualité patrimoniale
  if (scpi.creation >= 2015 && scpi.tof >= 90) {
    advantages.push(`Patrimoine créé en ${scpi.creation}, TOF de ${scpi.tof.toFixed(1)}%`);
  }
  
  // Label ISR
  if (scpi.isr) {
    advantages.push("Label ISR présent");
  }
  
  // Frais
  if (scpi.fees === 0) {
    advantages.push("Frais d'entrée à 0%");
  }
  
  // Capitalisation
  if (scpi.capitalization >= 500000000 && scpi.capitalization < 1000000000) {
    advantages.push(`Capitalisation de ${(scpi.capitalization / 1000000).toFixed(0)}M€`);
  }
  
  // Secteurs spécifiques
  if (scpi.sector === 'sante') {
    advantages.push("Secteur d'activité : santé");
  } else if (scpi.sector === 'logistique') {
    advantages.push("Secteur d'activité : logistique");
  } else if (scpi.sector === 'residentiel') {
    advantages.push("Secteur d'activité : résidentiel");
  }
  
  return advantages;
};

export const getScpiPointsAttention = (scpi: Scpi): string[] => {
  const concerns: string[] = [];
  
  // Toujours présent - Fiscalité
  concerns.push("Revenus fonciers soumis à l'impôt sur le revenu et aux prélèvements sociaux");
  
  // Toujours présent - Liquidité
  concerns.push("Délai de revente à prévoir (liquidité non immédiate)");
  
  // Troisième point selon les caractéristiques spécifiques
  const displayedDiscount = getDisplayedDiscount(scpi);
  if (displayedDiscount != null && displayedDiscount > 3) {
    concerns.push(`Surcote/décote de ${Math.abs(displayedDiscount).toFixed(1)}% par rapport à la valeur de reconstitution`);
  } else if (scpi.tof < 90) {
    concerns.push(`Taux d'occupation de ${scpi.tof.toFixed(1)}%`);
  } else if (scpi.creation >= 2020) {
    concerns.push(`Société de gestion créée en ${scpi.creation}`);
  } else if (scpi.sector === 'hotellerie') {
    concerns.push("Secteur d'activité : hôtellerie");
  } else if (scpi.sector === 'commerces') {
    concerns.push("Secteur d'activité : commerces");
  } else if (scpi.creation < 2000) {
    concerns.push(`Patrimoine créé en ${scpi.creation}`);
  } else {
    concerns.push("Horizon d'investissement recommandé : 8 à 12 ans minimum");
  }
  
  return concerns.slice(0, 3); // Maximum 3 points d'attention
};

export const getScpiPresentation = (scpi: Scpi): string => {
  const presentations: Record<string, string> = {
    "Activimmo": "SCPI diversifiée créée en 1984 et gérée par Alderan, Activimmo est l'une des plus anciennes SCPI du marché. Elle investit principalement en France dans des bureaux, commerces et actifs diversifiés, offrant une approche patrimoniale équilibrée et une liquidité attractive grâce à sa taille et son ancienneté.",
    "Aestiam Cap'Hebergimmo": "SCPI spécialisée dans l'hébergement d'affaires et les résidences services, gérée par Aestiam depuis 2012. Elle cible des actifs modernes en France répondant aux nouvelles formes d'hébergement professionnel et étudiant, avec une gestion dynamique et des baux sécurisés.",
    "Aestiam Pierre Rendement": "SCPI diversifiée créée en 2006 par Aestiam, investissant dans des bureaux, commerces et locaux d'activité en France. Elle privilégie des actifs situés dans des zones à fort potentiel économique avec une approche rendement-sécurité équilibrée.",
    "Aestiam Placement Pierre": "SCPI patrimoniale gérée par Aestiam depuis 2005, axée sur les bureaux et commerces en Île-de-France et grandes métropoles régionales. Elle vise une stratégie de valorisation à long terme avec des actifs de qualité dans des emplacements stratégiques.",
    "Altixia Cadence 12": "SCPI à capital fixe fermée, créée en 2012 par Altixia REIM. Elle investit dans des actifs tertiaires diversifiés en France avec un objectif de valorisation et de distribution régulière sur un horizon d'investissement défini.",
    "Altixia Commerces": "SCPI spécialisée dans les commerces de proximité et retail parks, gérée par Altixia REIM depuis 2015. Elle se concentre sur des zones de chalandise dynamiques en France avec des baux longue durée et des enseignes reconnues.",
    "Atream Hotel": "SCPI unique sur le marché, spécialisée dans l'hôtellerie européenne depuis 2006 et gérée par Atream. Elle investit dans des hôtels d'affaires et de tourisme exploités par de grandes enseignes internationales, offrant une exposition au secteur du tourisme et des voyages d'affaires.",
    "Buroboutic Métropoles": "SCPI créée en 2018 par Epsicap REIM, spécialisée dans les petites surfaces de bureaux et commerces dans les métropoles françaises. Elle cible des actifs facilement relocalisables avec une diversification locative importante.",
    "Coeur d'Europe": "SCPI européenne gérée par Advenis REIM depuis 2014, investissant dans les bureaux et commerces des capitales et métropoles européennes. Elle offre une diversification géographique européenne avec des actifs prime dans des villes dynamiques.",
    "Coeur de Région": "SCPI régionale créée en 2011 par Advenis REIM, concentrée sur les métropoles régionales françaises. Elle investit dans des bureaux, commerces et locaux d'activité situés dans des villes moyennes à fort potentiel de développement.",
    "Coeur de ville": "SCPI créée en 2012 par Advenis REIM, spécialisée dans les commerces de centre-ville et pieds d'immeubles. Elle vise des emplacements premium dans les rues commerçantes des principales villes françaises avec des baux longue durée.",
    "Comète": "SCPI innovante créée en 2023 par Alderan, spécialisée dans l'immobilier tertiaire international. Comète se distingue par sa stratégie d'investissement dynamique et son approche ESG renforcée, avec une diversification multi-pays.",
    "Cristal Life": "SCPI résidentielle lancée en 2019 par Cristal REIM, investissant dans des logements neufs ou récents en France. Elle bénéficie du régime fiscal Pinel et cible une clientèle d'investisseurs recherchant des revenus locatifs résidentiels sécurisés.",
    "Crédit Mutuel Pierre 1": "SCPI diversifiée du groupe Crédit Mutuel, créée en 2003 et gérée par ACM GFI. Elle investit dans des bureaux, commerces et actifs tertiaires en France avec une gestion prudente et une approche patrimoniale long terme.",
    "ESG Pierre Capital": "SCPI labellisée ISR créée en 2020 par Epsicap REIM, investissant dans des actifs tertiaires responsables en France. Elle intègre des critères ESG stricts dans sa sélection d'actifs et vise une performance durable.",
    "Edissimo": "SCPI historique créée en 1980 et gérée par Atland Voisin, spécialisée dans les commerces de proximité et pieds d'immeubles en France. Elle offre une forte diversification locative avec plus de 900 locaux répartis sur l'ensemble du territoire.",
    "Efimmo 1": "SCPI diversifiée créée en 1987 par Spirica, filiale du Crédit Agricole. Elle investit dans des bureaux, commerces et locaux d'activité en France avec une gestion patrimoniale stable et des distributions régulières.",
    "Ficommerce Proximité": "SCPI commerciale créée en 2007 par Fiducial Gérance, spécialisée dans les commerces de proximité et zones commerciales en France. Elle privilégie les emplacements stratégiques avec des baux longue durée et des enseignes nationales.",
    "Foncière des Praticiens": "SCPI médicale historique créée en 1991, gérée par Cie La Française Asset Management. Elle investit exclusivement dans l'immobilier médical et paramédical en France : cabinets médicaux, maisons de santé pluridisciplinaires et cliniques.",
    "GMA Essentialis": "SCPI diversifiée créée en 2019 par Groupama Immobilier, investissant dans des bureaux, commerces et actifs de santé en France. Elle bénéficie de l'expertise immobilière du groupe Groupama avec une stratégie core et des actifs de qualité.",
    "Grand Paris Résidentiel": "SCPI résidentielle spécialisée dans le Grand Paris, créée en 2019 par Advltys. Elle investit dans des logements neufs ou récents dans les zones tendues d'Île-de-France, bénéficiant d'une forte demande locative.",
    "Immorente": "SCPI historique créée en 1959, gérée par Sofidy. C'est l'une des plus anciennes SCPI du marché français, investissant dans des bureaux, commerces et locaux d'activité diversifiés en France avec une gestion patrimoniale éprouvée.",
    "Iroko Zen": "SCPI spécialisée dans l'immobilier de santé, gérée par Iroko depuis 2017. Elle investit dans des établissements de santé modernes et des résidences seniors en Europe, bénéficiant du vieillissement démographique et d'une demande structurelle croissante.",
    "Kyaneos Pierre": "SCPI diversifiée créée en 2007 par Kyaneos AM, investissant dans des bureaux, commerces et actifs tertiaires en France. Elle privilégie une approche opportuniste avec des actifs value-add à fort potentiel de revalorisation.",
    "LF Avenir Santé": "SCPI de santé créée en 2018 par La Française REM, spécialisée dans les établissements de santé, cliniques et EHPAD en France et en Europe. Elle bénéficie de l'expertise reconnue de La Française sur le secteur médico-social.",
    "LF Europimmo": "SCPI européenne historique créée en 2003 par La Française REM, investissant dans des bureaux et commerces en Europe. Elle offre une diversification géographique européenne avec des actifs situés dans les principales capitales économiques.",
    "LF Grand Paris Patrimoine": "SCPI créée en 2015 par La Française REM, spécialisée dans les actifs résidentiels et tertiaires du Grand Paris. Elle vise des immeubles patrimoniaux dans des quartiers recherchés de la capitale et de sa proche banlieue.",
    "Log In": "SCPI logistique créée en 2018 par Advenis REIM, spécialisée dans les entrepôts et plateformes logistiques en France et en Europe. Elle bénéficie de la croissance structurelle de l'e-commerce et des besoins en logistique moderne.",
    "NCap Education Santé": "SCPI thématique créée en 2019 par NCap AM, investissant dans l'immobilier de santé et d'éducation en France. Elle cible des actifs défensifs avec des locataires institutionnels et des baux longue durée sécurisés.",
    "NCap Régions": "SCPI régionale créée en 2018 par NCap AM, investissant dans les métropoles régionales françaises. Elle privilégie des actifs tertiaires dans des villes moyennes dynamiques avec un bon rapport rendement-risque.",
    "Novapierre 1": "SCPI diversifiée créée en 2007 par Paref Gestion, investissant dans des bureaux, commerces et locaux d'activité en France. Elle offre une gestion active avec une stratégie d'arbitrage régulière pour optimiser la performance.",
    "Novapierre Résidentiel": "SCPI résidentielle créée en 2015 par Paref Gestion, spécialisée dans les logements neufs ou récents en France. Elle bénéficie du dispositif Pinel et vise une clientèle recherchant des revenus locatifs résidentiels stables.",
    "Novaxia NEO": "SCPI innovante créée en 2018 par Novaxia Investissement, spécialisée dans la transformation et la réhabilitation d'actifs tertiaires en France. Elle adopte une stratégie value-add avec des projets de repositionnement urbain.",
    "Opportunité Immo": "SCPI diversifiée créée en 2012 par Prima Pierre, investissant dans des bureaux, commerces et actifs opportunistes en France. Elle privilégie une approche flexible avec des acquisitions à fort potentiel de revalorisation.",
    "Optimale": "SCPI créée en 2006 par Sofidy, investissant dans des bureaux, commerces et locaux d'activité diversifiés en France. Elle vise une performance équilibrée entre rendement et valorisation du patrimoine.",
    "Paref Evo": "SCPI diversifiée créée en 2019 par Paref Gestion, investissant dans des actifs tertiaires en France et en Europe. Elle adopte une stratégie dynamique avec une gestion active du patrimoine et des arbitrages réguliers.",
    "Paref Hexa": "SCPI créée en 2017 par Paref Gestion, spécialisée dans les actifs tertiaires situés dans les six principales métropoles régionales françaises : Lyon, Marseille, Toulouse, Bordeaux, Nantes et Lille.",
    "Patrimmo Croissance Impact": "SCPI ISR créée en 2021 par Crédit Mutuel Asset Management, investissant dans des actifs tertiaires responsables en France. Elle intègre une démarche ESG exigeante et vise un impact environnemental et social positif.",
    "Perial Grand Paris": "SCPI créée en 2019 par Perial Asset Management, spécialisée dans les actifs tertiaires du Grand Paris. Elle investit dans des bureaux, commerces et actifs mixtes situés dans les zones les plus dynamiques d'Île-de-France.",
    "Perial Hospitalité Europe": "SCPI hôtelière européenne créée en 2019 par Perial Asset Management, investissant dans des hôtels d'affaires et de tourisme exploités par de grandes enseignes. Elle offre une exposition au secteur de l'hospitalité européenne.",
    "Perial O2": "SCPI diversifiée créée en 2016 par Perial Asset Management, investissant dans des bureaux, commerces et actifs tertiaires en France et en Europe. Elle privilégie des actifs core dans des emplacements stratégiques.",
    "Perial Opportunités Europe": "SCPI européenne créée en 2021 par Perial Asset Management, adoptant une stratégie opportuniste sur les actifs tertiaires européens. Elle vise des acquisitions value-add dans les principales capitales économiques.",
    "Remake Live": "SCPI résidentielle innovante de Remake AM, créée en 2018. Elle se concentre sur l'habitat du futur en France, avec des logements connectés et éco-responsables répondant aux nouveaux modes de vie urbains et aux attentes environnementales.",
    "Selectinvest 1": "SCPI diversifiée créée en 2006 par Norma Capital, investissant dans des bureaux, commerces et locaux d'activité en France. Elle privilégie une gestion patrimoniale prudente avec des actifs situés dans des zones dynamiques.",
    "Selectipierre 2": "SCPI créée en 2007 par Norma Capital, spécialisée dans les actifs tertiaires en France. Elle adopte une stratégie de diversification sectorielle et géographique avec une gestion active du patrimoine.",
    "Sofiprime": "SCPI historique créée en 1991 par Sofidy, investissant dans des bureaux et commerces de qualité en France. Elle vise des actifs prime dans les meilleurs emplacements avec une gestion patrimoniale long terme éprouvée.",
    "Transitions Europe": "SCPI européenne gérée par Arkéa REIM, axée sur la transition énergétique et digitale des bureaux. Créée en 2019, elle investit dans des actifs immobiliers durables et certifiés HQE, principalement en Allemagne, France et Espagne.",
    "Urban Coeur de Commerce": "SCPI commerciale créée en 2017 par Urban Premium, spécialisée dans les commerces de centre-ville et pieds d'immeubles. Elle vise des emplacements premium dans les principales artères commerçantes françaises.",
    "Épargne Foncière": "SCPI historique créée en 1965 par La Française REM, l'une des plus anciennes du marché. Elle investit dans des bureaux, commerces et actifs diversifiés en France avec une gestion patrimoniale éprouvée sur près de 60 ans.",
    "Épargne Pierre Europe": "SCPI européenne créée en 2014 par La Française REM, investissant dans des bureaux et commerces en Europe. Elle offre une diversification géographique avec des actifs situés dans les principales métropoles européennes.",
    "Épargne Pierre": "SCPI diversifiée historique créée en 1977 par La Française REM, investissant principalement en France dans des bureaux, commerces et actifs tertiaires. Elle bénéficie d'une gestion patrimoniale stable et d'une expérience de plus de 45 ans."
  };

  return presentations[scpi.name] || `${scpi.name} est une SCPI ${getSectorName(scpi.sector)} gérée par ${scpi.company}, créée en ${scpi.creation}. Cette SCPI investit principalement ${getGeographyName(scpi.geography)} dans des actifs immobiliers de qualité, offrant une stratégie d'investissement diversifiée et une gestion professionnelle reconnue.`;
};

export const getScpiAnalysis = (scpi: Scpi): string => {
  let analysis = "";
  
  if (scpi.yield >= 7) {
    analysis += "🔥 <strong>Très haute performance :</strong> Cette SCPI affiche un rendement exceptionnel supérieur à 7%. ";
  } else if (scpi.yield >= 5) {
    analysis += "✅ <strong>Bonne performance :</strong> Rendement attractif supérieur à 5%. ";
  } else if (scpi.yield >= 3.5) {
    analysis += "📊 <strong>Performance modérée :</strong> Rendement dans la moyenne du marché. ";
  } else {
    analysis += "⚠️ <strong>Performance faible :</strong> Rendement en dessous de la moyenne. ";
  }
  
  if (scpi.tof >= 95) {
    analysis += "Excellent taux d'occupation (>95%) témoignant d'une gestion solide. ";
  }
  
  const displayedDiscount = getDisplayedDiscount(scpi);
  if (displayedDiscount != null && displayedDiscount < -5) {
    analysis += "🎯 <strong>Opportunité d'achat :</strong> Forte décote sur le marché secondaire. ";
  }
  
  if (scpi.fees === 0) {
    analysis += "💰 <strong>Avantage coût :</strong> Sans frais d'entrée, optimise votre investissement initial. ";
  }
  
  if (scpi.isr) {
    analysis += "🌱 <strong>Investissement responsable :</strong> Labellisé ISR pour un impact positif. ";
  }
  
  return analysis;
};

/**
 * Génère les points clés à retenir pour une lecture rapide (5 lignes max)
 * Format : Langage courant, sans jargon financier, pour débutants
 * Inclut des chiffres pour valider chaque affirmation
 * Répond à 5 questions : rapporte-t-il ? risqué ? biens loués ? prix raisonnable ? rôle ?
 * Personnalisé pour chaque SCPI selon ses caractéristiques spécifiques
 */
export const getScpiKeyTakeaways = (scpi: Scpi): string[] => {
  const takeaways: string[] = [];

  const isEurope = scpi.geography === 'europe' || scpi.european;
  const yieldValue = scpi.yield;
  const tofValue = scpi.tof;
  const debtValue = scpi.debt;
  const discountValue = getDisplayedDiscount(scpi);
  const capitalizationM = scpi.capitalization / 1000000;
  const nbImmeubles = scpi.nbImmeubles;
  const walt = scpi.walt;
  const walb = scpi.walb;
  const nombreLocataires = scpi.nombreLocataires;
  const sector = scpi.sector;
  const isr = scpi.isr;
  const company = scpi.company;
  const creation = scpi.creation;
  const versementLoyers = scpi.versementLoyers;
  
  // Caractéristiques combinées pour personnalisation
  const isVeryLargeCap = capitalizationM >= 2000;
  const isLargeCap = capitalizationM >= 800;
  const isMediumCap = capitalizationM >= 300;
  const isSmallCap = capitalizationM < 100;
  const isHighYield = yieldValue >= 6.5;
  const isMediumYield = yieldValue >= 5.0 && yieldValue < 6.5;
  const isLowYield = yieldValue < 4.5;
  const isLowDebt = debtValue !== undefined && debtValue < 15;
  const isVeryLowDebt = debtValue !== undefined && debtValue < 5;
  const isModerateDebt = debtValue !== undefined && debtValue >= 15 && debtValue < 30;
  const isHighDebt = debtValue !== undefined && debtValue >= 30;
  const isHighTof = tofValue !== undefined && tofValue >= 95;
  const isGoodTof = tofValue !== undefined && tofValue >= 92 && tofValue < 95;
  const isModerateTof = tofValue !== undefined && tofValue >= 88 && tofValue < 92;
  const isLowTof = tofValue !== undefined && tofValue < 88;
  const isVeryDiversified = nbImmeubles !== undefined && nbImmeubles >= 200;
  const isDiversified = nbImmeubles !== undefined && nbImmeubles >= 100;
  const isLongLease = walt !== undefined && walt >= 7;
  const isMediumLease = walt !== undefined && walt >= 4 && walt < 7;
  const isOldScpi = creation < 2000;
  const isRecentScpi = creation >= 2015;
  const isMensuel = versementLoyers === 'Mensuel';

  // 1. 💰 EST-CE QUE ÇA RAPPORTE CORRECTEMENT ? (Rendement) - Personnalisé selon profil
  let revenus: string = '';
  const yieldFormatted = yieldValue.toFixed(2).replace('.', ',');
  
  // Cas spécifiques par secteur
  if (sector === 'logistique') {
    if (isHighYield) {
      revenus = `💰 Rendement élevé (${yieldFormatted}%), secteur logistique en forte croissance.`;
    } else if (isMediumYield) {
      revenus = `💰 Rendement régulier (${yieldFormatted}%), secteur logistique porteur.`;
    } else {
      revenus = `💰 Rendement modéré (${yieldFormatted}%), secteur logistique stable.`;
    }
  } else if (sector === 'sante') {
    if (isMediumYield || isHighYield) {
      revenus = `💰 Rendement régulier (${yieldFormatted}%), secteur de la santé très défensif.`;
    } else {
      revenus = `💰 Rendement modéré (${yieldFormatted}%), secteur de la santé stable et sécurisé.`;
    }
  } else if (sector === 'hotellerie') {
    if (isHighYield) {
      revenus = `💰 Rendement élevé (${yieldFormatted}%), secteur hôtelier dynamique mais plus volatile.`;
    } else {
      revenus = `💰 Rendement variable (${yieldFormatted}%) selon la saison, secteur hôtelier.`;
    }
  } else if (sector === 'commerces') {
    if (isMediumYield || isHighYield) {
      revenus = `💰 Rendement régulier (${yieldFormatted}%), commerce de proximité résilient.`;
    } else {
      revenus = `💰 Rendement modéré (${yieldFormatted}%), commerce traditionnel stable.`;
    }
  } else if (isEurope) {
    if (yieldValue >= 7.0) {
      revenus = `💰 Rendement élevé (${yieldFormatted}%), mais avec plus de risques liés à l'étranger.`;
    } else if (yieldValue >= 6.0) {
      revenus = `💰 Rendement régulier (${yieldFormatted}%), avec une partie des biens à l'étranger.`;
    } else if (yieldValue >= 5.0) {
      revenus = `💰 Rendement modéré (${yieldFormatted}%), avec une partie des biens à l'étranger.`;
    } else {
      revenus = `💰 Rendement faible (${yieldFormatted}%), avec une partie des biens à l'étranger.`;
    }
  } else {
    // France - logique personnalisée selon taille et profil
    if (isHighYield && isVeryLargeCap) {
      revenus = `💰 Rendement élevé (${yieldFormatted}%), grande SCPI bien établie.`;
    } else if (isHighYield && isLargeCap) {
      revenus = `💰 Rendement élevé (${yieldFormatted}%), SCPI de taille importante.`;
    } else if (isHighYield) {
      revenus = `💰 Rendement élevé (${yieldFormatted}%), mais attention aux risques.`;
    } else if (isMediumYield && isVeryLargeCap) {
      revenus = `💰 Rendement régulier (${yieldFormatted}%), grande SCPI sécurisée.`;
    } else if (isMediumYield && isLowDebt) {
      revenus = `💰 Rendement régulier (${yieldFormatted}%), sans prise de risque excessive.`;
    } else if (isMediumYield) {
      revenus = `💰 Rendement modéré (${yieldFormatted}%), fonctionnement prudent.`;
    } else if (isLowYield && isVeryLargeCap) {
      revenus = `💰 Rendement modéré (${yieldFormatted}%), mise sur la stabilité et la taille.`;
    } else {
      revenus = `💰 Rendement faible (${yieldFormatted}%), mise plutôt sur la valeur des biens.`;
    }
  }
  
  if (revenus) {
    takeaways.push(revenus);
  }

  // 2. 🛡️ EST-CE QUE C'EST RISQUÉ ? (Risque / sécurité) - Personnalisé
  if (debtValue !== undefined) {
    let risque: string = '';
    const debtFormatted = debtValue.toFixed(1).replace('.', ',');
    
    // Distinguer 0% (aucune dette) vs très peu de dettes
    if (debtValue === 0) {
      if (isVeryLargeCap) {
        risque = `🛡️ Aucune dette (${debtFormatted}%), grande SCPI très sécurisée.`;
      } else if (isLargeCap) {
        risque = `🛡️ Aucune dette (${debtFormatted}%), fonctionnement très prudent.`;
      } else {
        risque = `🛡️ Aucune dette (${debtFormatted}%), fonctionnement très prudent.`;
      }
    } else if (isVeryLowDebt && isVeryLargeCap) {
      risque = `🛡️ Très peu de dettes (${debtFormatted}%), grande SCPI très sécurisée.`;
    } else if (isVeryLowDebt && isLargeCap) {
      risque = `🛡️ Très peu de dettes (${debtFormatted}%), fonctionnement très prudent.`;
    } else if (isVeryLowDebt) {
      risque = `🛡️ Très peu de dettes (${debtFormatted}%), fonctionnement prudent.`;
    } else if (isLowDebt && isHighTof && isLargeCap) {
      risque = `🛡️ Peu de dettes (${debtFormatted}%), situation très sécurisée.`;
    } else if (isLowDebt && isHighTof) {
      risque = `🛡️ Peu de dettes (${debtFormatted}%), situation sécurisée.`;
    } else if (isLowDebt) {
      risque = `🛡️ Peu de dettes (${debtFormatted}%), situation sécurisée.`;
    } else if (isModerateDebt && isHighTof) {
      risque = `🛡️ Dettes maîtrisées (${debtFormatted}%), situation stable.`;
    } else if (isModerateDebt) {
      risque = `🛡️ Dettes modérées (${debtFormatted}%), situation stable.`;
    } else if (isHighDebt && isHighTof) {
      risque = `🛡️ Dettes importantes (${debtFormatted}%), mais occupation solide.`;
    } else if (isHighDebt) {
      risque = `🛡️ Dettes importantes (${debtFormatted}%), nécessite de l'attention.`;
    } else {
      risque = `🛡️ Dettes maîtrisées (${debtFormatted}%), situation stable.`;
    }
    
    if (risque) {
      takeaways.push(risque);
    }
  }

  // 3. 🏢 EST-CE QUE LES BIENS SONT LOUÉS ? (Location des biens) - Personnalisé
  if (tofValue !== undefined) {
    let location: string = '';
    const tofFormatted = tofValue.toFixed(1).replace('.', ',');
    
    // Distinguer 100% (tous loués) vs presque tous loués (95-99%)
    if (tofValue >= 99.5) {
      if (isVeryDiversified) {
        location = `🏢 Tous les biens loués (${tofFormatted}%), patrimoine très diversifié et excellente situation.`;
      } else if (isDiversified) {
        location = `🏢 Tous les biens loués (${tofFormatted}%), patrimoine diversifié et situation excellente.`;
      } else if (isLongLease) {
        location = `🏢 Tous les biens loués (${tofFormatted}%), baux longue durée sécurisés.`;
      } else {
        location = `🏢 Tous les biens loués (${tofFormatted}%), situation excellente.`;
      }
    } else if (isHighTof && isVeryDiversified) {
      location = `🏢 Biens presque tous loués (${tofFormatted}%), patrimoine très diversifié et excellente situation.`;
    } else if (isHighTof && isDiversified) {
      location = `🏢 Biens presque tous loués (${tofFormatted}%), patrimoine diversifié et situation excellente.`;
    } else if (isHighTof && isLongLease) {
      location = `🏢 Biens presque tous loués (${tofFormatted}%), baux longue durée sécurisés.`;
    } else if (isHighTof) {
      location = `🏢 Biens presque tous loués (${tofFormatted}%), situation excellente.`;
    } else if (isGoodTof && isVeryDiversified) {
      location = `🏢 Biens majoritairement loués (${tofFormatted}%), patrimoine très diversifié avec quelques changements normaux.`;
    } else if (isGoodTof && isLongLease) {
      location = `🏢 Biens majoritairement loués (${tofFormatted}%), baux longue durée avec quelques changements de locataires.`;
    } else if (isGoodTof) {
      location = `🏢 Biens majoritairement loués (${tofFormatted}%), avec quelques changements de locataires.`;
    } else if (isModerateTof && isDiversified) {
      location = `🏢 Biens majoritairement loués (${tofFormatted}%), patrimoine diversifié avec quelques vacances.`;
    } else if (isModerateTof) {
      location = `🏢 Biens majoritairement loués (${tofFormatted}%), avec quelques changements de locataires.`;
    } else if (isLowTof && isDiversified) {
      location = `🏢 Plusieurs biens vacants (${tofFormatted}%), patrimoine diversifié nécessitant du travail pour les relouer.`;
    } else if (isLowTof) {
      location = `🏢 Plusieurs biens vacants (${tofFormatted}%), nécessite du travail pour les relouer.`;
    } else {
      location = `🏢 Nombreux biens vacants (${tofFormatted}%), situation préoccupante.`;
    }
    
    if (location) {
      takeaways.push(location);
    }
  }

  // 4. 💵 EST-CE QUE LE PRIX EST RAISONNABLE ? (Prix d'achat) - Personnalisé
  if (discountValue !== undefined && discountValue !== null) {
    let prix: string = '';
    const discountFormatted = discountValue.toFixed(1).replace('.', ',');
    const discountAbs = Math.abs(discountValue);
    const discountAbsFormatted = discountAbs.toFixed(1).replace('.', ',');
    
    // Combinaisons avec taille et TOF - Décote = bonne affaire
    if (discountValue <= -10 && isLargeCap) {
      prix = `💵 Bonne affaire (décote ${discountAbsFormatted}%), grande SCPI en décote significative.`;
    } else if (discountValue <= -10) {
      prix = `💵 Bonne affaire (décote ${discountAbsFormatted}%), prix d'achat intéressant.`;
    } else if (discountValue <= -5 && isHighTof) {
      prix = `💵 Bonne affaire (décote ${discountAbsFormatted}%), prix en dessous de la valeur avec occupation solide.`;
    } else if (discountValue <= -5) {
      prix = `💵 Bonne affaire (décote ${discountAbsFormatted}%), prix légèrement en dessous de la valeur.`;
    } else if (discountValue < 0 && discountValue > -5 && isHighTof && isLargeCap) {
      prix = `💵 Prix d'achat aligné avec la valeur (décote ${discountAbsFormatted}%), grande SCPI bien occupée.`;
    } else if (discountValue < 0 && discountValue > -5) {
      prix = `💵 Prix d'achat proche de la valeur réelle (décote ${discountAbsFormatted}%), sans bonne affaire particulière.`;
    } else if (discountValue === 0 || (discountValue > -1 && discountValue < 1)) {
      if (isHighTof && isLargeCap) {
        prix = `💵 Prix d'achat aligné avec la valeur (${discountFormatted}%), grande SCPI bien occupée.`;
      } else {
        prix = `💵 Prix d'achat proche de la valeur réelle (${discountFormatted}%), sans bonne affaire particulière.`;
      }
    } else if (discountValue <= 5 && isHighTof) {
      prix = `💵 Prix d'achat un peu élevé (surcote ${discountAbsFormatted}%), mais occupation solide.`;
    } else if (discountValue <= 5) {
      prix = `💵 Prix d'achat un peu élevé (surcote ${discountAbsFormatted}%) par rapport à la valeur réelle.`;
    } else if (discountValue <= 10 && isHighTof) {
      prix = `💵 Prix d'achat élevé (surcote ${discountAbsFormatted}%), mais occupation solide.`;
    } else if (discountValue <= 10) {
      prix = `💵 Prix d'achat élevé (surcote ${discountAbsFormatted}%) par rapport à la valeur réelle.`;
    } else {
      prix = `💵 Prix d'achat nettement au-dessus de la valeur réelle (surcote ${discountAbsFormatted}%), à éviter.`;
    }
    
    if (prix) {
      takeaways.push(prix);
    }
  }

  // 5. 🧩 À QUOI ÇA SERT DANS UN PORTEFEUILLE ? (Rôle) - Très personnalisé
  let role: string = '';
  
  // Cas spécifiques par combinaison de caractéristiques
  if (isHighYield && isVeryLowDebt && isHighTof && isVeryLargeCap) {
    role = '🧩 Intéressant comme placement principal, excellent équilibre revenus et sécurité.';
  } else if (isHighYield && isLowDebt && isHighTof && isLargeCap) {
    role = '🧩 Intéressant comme placement principal, bon équilibre revenus et sécurité.';
  } else if (isMediumYield && isVeryLowDebt && isHighTof && isVeryLargeCap) {
    role = '🧩 Intéressant comme placement principal, très sécurisé et bien établi.';
  } else if (isLowDebt && isHighTof && isVeryLargeCap && isOldScpi) {
    role = '🧩 Intéressant comme placement principal, SCPI historique sécurisée.';
  } else if (isLowDebt && isHighTof && isLargeCap) {
    role = '🧩 Intéressant comme placement principal, sécurisé et bien établi.';
  } else if (isHighYield && isLowDebt && isGoodTof && isDiversified) {
    role = '🧩 Intéressant comme placement principal, bon équilibre revenus et sécurité.';
  } else if (isHighYield && isLowDebt && isGoodTof) {
    role = '🧩 Intéressant comme placement principal, bon équilibre revenus et sécurité.';
  } else if (isMediumYield && isVeryLowDebt && isGoodTof && isMediumCap) {
    role = '🧩 Intéressant en complément, sécurisé mais revenus modérés.';
  } else if (isVeryLowDebt && isGoodTof && isMediumCap && sector === 'sante') {
    role = '🧩 Intéressant en complément, secteur défensif et sécurisé.';
  } else if (isHighYield && !isLowDebt && isGoodTof) {
    role = '🧩 Intéressant en complément, rapporte bien mais nécessite de l\'attention.';
  } else if (isHighYield && isLowDebt && sector === 'logistique') {
    role = '🧩 Intéressant en complément, secteur porteur avec revenus élevés.';
  } else if (isHighYield && isLowDebt) {
    role = '🧩 Intéressant en complément d\'un portefeuille diversifié.';
  } else if (isMediumYield && isLowDebt && isGoodTof && isDiversified) {
    role = '🧩 Intéressant en complément d\'un portefeuille diversifié.';
  } else if (isMediumYield && isLowDebt && isGoodTof) {
    role = '🧩 Intéressant en complément d\'un portefeuille diversifié.';
  } else if (isLowDebt && isGoodTof && isRecentScpi) {
    role = '🧩 Intéressant en complément, SCPI récente sécurisée.';
  } else if (isLowDebt && isGoodTof) {
    role = '🧩 Intéressant en complément, sécurisé mais revenus modérés.';
  } else if (isLowDebt && isModerateTof && isDiversified) {
    role = '🧩 Intéressant en complément, diversifié mais occupation à surveiller.';
  } else if (sector === 'sante' && isLowDebt) {
    role = '🧩 Intéressant en complément, secteur défensif et sécurisé.';
  } else if (sector === 'logistique' && isMediumYield) {
    role = '🧩 Intéressant en complément, secteur porteur en croissance.';
  } else {
    role = '🧩 Intéressant en complément d\'un portefeuille diversifié.';
  }
  
  if (role) {
    takeaways.push(role);
  }

  // Limiter à 5 lignes maximum
  return takeaways.slice(0, 5);
};

/**
 * Synthétise l'actualité trimestrielle orientée investisseur
 * Format : [Icône] Mot-clé – phrase synthétique (10-25 mots)
 * 2-6 points par trimestre (max 8 si exceptionnel)
 * Priorités strictes : Acquisitions → Cessions → Collecte/Retraits → Distribution → Occupation → Endettement → Événement
 */
export const getScpiNews = (scpi: Scpi): string => {
  try {
    // 1) Priorité aux actualités structurées si disponibles
    if (scpi.actualiteTrimestrielle && Array.isArray(scpi.actualiteTrimestrielle)) {
      const blocT3 = scpi.actualiteTrimestrielle.find(b => b.Trimestre === 'T3 2025') 
        || scpi.actualiteTrimestrielle[0];
      const faits = Array.isArray(blocT3?.Faits_marquants) ? blocT3.Faits_marquants : [];

      if (faits.length > 0) {
        const getEmojiForFact = (fact: string): string => {
          const text = fact.toLowerCase();
          if (text.includes('acquisition') || text.includes('achat')) return '🏢';
          if (text.includes('cession') || text.includes('arbitrage')) return '🔁';
          if (text.includes('dividende') || text.includes('distribution')) return '💰';
          if (text.includes('tof') || text.includes('occupation') || text.includes('locaux')) return '📊';
          if (text.includes('endettement') || text.includes('dette')) return '🏦';
          if (text.includes('patrimoine') || text.includes('actifs')) return '📂';
          if (text.includes('part') && text.includes('retrait')) return '🔓';
          return '🔹';
        };

        const items = faits
          .filter(f => typeof f === 'string' && f.trim().length > 0)
          .map(f => {
            const trimmed = f.trim();
            const emoji = getEmojiForFact(trimmed);
            return `<li>${emoji} ${trimmed}</li>`;
          })
          .join('');

        if (items) {
          return `<ul class="list-disc pl-5 space-y-1">${items}</ul>`;
        }
      }
    }

    // 2) Sinon, fallback sur l'ancien champ texte plat
    if (!scpi.actualitesTrimestrielles) {
      return '';
    }

    const actualites = scpi.actualitesTrimestrielles.split(' | ');
    
    // Filtrer uniquement les phrases qui sont UNIQUEMENT des mentions de bulletin trimestriel
    // Ne pas filtrer les phrases qui mentionnent "bulletin trimestriel" dans un contexte descriptif
    const filteredActualites = actualites.filter(actu => {
      const actuTrimmed = actu.trim();
      // Filtrer uniquement si la phrase commence par une mention de bulletin (phrase de mise à jour)
      // Ne pas filtrer si "bulletin trimestriel" apparaît dans un contexte descriptif (ex: "détaillés dans le bulletin trimestriel")
      const isBulletinUpdate = actuTrimmed.match(/^(BULLETIN TRIMESTRIEL|bulletin trimestriel|Mise à jour BULLETIN|MISE À JOUR BULLETIN)/i);
      return !isBulletinUpdate;
    });

    if (filteredActualites.length === 0) {
      return '';
    }

    const fullText = filteredActualites.join(' | ');
    
    if (!fullText || typeof fullText !== 'string') {
      console.warn('[getScpiNews] fullText invalide pour', scpi.name);
      return '';
    }
  const structuredFacts: string[] = [];
  // Pas de limite stricte pour les acquisitions - on prend toutes celles trouvées
  let maxPoints = 50; // Limite élevée pour permettre toutes les acquisitions
  
  // Set pour éviter les doublons d'acquisitions (basé sur ville + pays)
  const acquisitionsSeen = new Set<string>();

  // Fonction pour extraire le type d'actif depuis une chaîne
  const extractAssetType = (text: string): string => {
    const types = [
      { pattern: /ensemble\s+commercial|centre\s+commercial/i, label: 'commerce' },
      { pattern: /immeuble\s+de\s+bureaux|bureaux/i, label: 'bureaux' },
      { pattern: /actif\s+logistique|logistique|entrepôt/i, label: 'logistique' },
      { pattern: /cellules?\s+commerciales?|locaux\s+commerciaux/i, label: 'commerce' },
      { pattern: /lot\s+commercial/i, label: 'commerce' },
      { pattern: /grand\s+magasin/i, label: 'commerce' },
      { pattern: /immeuble\s+d'activités/i, label: 'activités' },
      { pattern: /immeuble\s+de\s+santé|clinique|hôpital/i, label: 'santé' },
      { pattern: /résidentiel|logement/i, label: 'résidentiel' },
      { pattern: /hôtel|hôtellerie/i, label: 'hôtellerie' },
    ];
    
    for (const type of types) {
      if (type.pattern.test(text)) {
        return type.label;
      }
    }
    return '';
  };

  // Vérifier si le type est déjà présent dans le texte (format "(type)" à la fin)
  const hasTypeInText = (text: string): boolean => {
    return /\(commerce|logistique|bureaux|santé|résidentiel|hôtellerie|activités\)\s*$/i.test(text.trim());
  };

  // Obtenir le typeLabel seulement si le type n'est pas déjà présent
  const getTypeLabel = (text: string): string => {
    if (hasTypeInText(text)) {
      return '';
    }
    const type = extractAssetType(text);
    return type ? ` (${type})` : '';
  };

  // 1. PRIORITÉ STRICTE : Acquisitions (localisation, typologie, rendement si disponible)
  // Format LOG-IN : "2 acquisitions finalisées pour 9,6 M€: Fossò (Italie, 3 346 m², TreZeta Group) et Tychy (Pologne, 9 705 m², BOS Automotive)"
  // Format LOG-IN alternatif : "Deux acquisitions finalisées pour 9,6 M€ au cours du trimestre" (sans détails après :)
  const acqDetailMatch = fullText.match(/(\d+)\s+acquisition.*?finalisée.*?(\d+[.,]\d+)\s*M€.*?:\s*([^|]+)/i);
  if (acqDetailMatch) {
    const nb = parseInt(acqDetailMatch[1]);
    const montant = acqDetailMatch[2].replace(',', '.');
    const detailsStr = acqDetailMatch[3];
    
    // Extraire TOUTES les acquisitions individuelles
    // Séparer par " et " ou ", " en préservant les parenthèses
    const acquisitions: string[] = [];
    let currentAcq = '';
    let parenCount = 0;
    
    for (let i = 0; i < detailsStr.length; i++) {
      const char = detailsStr[i];
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      
      if (parenCount === 0 && (detailsStr.substring(i, i + 4) === ' et ' || detailsStr.substring(i, i + 2) === ', ')) {
        if (currentAcq.trim()) {
          acquisitions.push(currentAcq.trim());
          currentAcq = '';
        }
        i += detailsStr.substring(i, i + 4) === ' et ' ? 3 : 1;
        continue;
      }
      currentAcq += char;
    }
    if (currentAcq.trim()) {
      acquisitions.push(currentAcq.trim());
    }
    
    // Si aucune séparation trouvée, prendre toute la chaîne
    if (acquisitions.length === 0) {
      acquisitions.push(detailsStr.trim());
    }
    
    acquisitions.forEach(acq => {
      // Format : "Ville (Pays, surface m², locataire)"
      const villeMatch = acq.match(/([A-Z][a-zàéèêëïîôùûüÿç]+(?:\s+[A-Z][a-zàéèêëïîôùûüÿç]+)?)\s*\(([A-Z][a-zàéèêëïîôùûüÿç]+)(?:,\s*(\d+(?:\s+\d+)?)\s*m²)?/);
      if (villeMatch) {
        const ville = villeMatch[1];
        const pays = villeMatch[2];
        const key = `${ville.toLowerCase()}_${pays.toLowerCase()}`;
        
        // Vérifier si cette acquisition n'a pas déjà été ajoutée
        if (!acquisitionsSeen.has(key)) {
          acquisitionsSeen.add(key);
          const surface = villeMatch[3] ? `, ${villeMatch[3]} m²` : '';
          const typeLabel = getTypeLabel(acq);
          structuredFacts.push(`Acquisition à ${ville} (${pays}${surface})${typeLabel}`);
        }
      } else {
        // Format alternatif : juste ville et pays
        const simpleMatch = acq.match(/([A-Z][a-zàéèêëïîôùûüÿç]+(?:\s+[A-Z][a-zàéèêëïîôùûüÿç]+)?)\s*\(([A-Z][a-zàéèêëïîôùûüÿç]+)/);
        if (simpleMatch) {
          const key = `${simpleMatch[1].toLowerCase()}_${simpleMatch[2].toLowerCase()}`;
          
          // Vérifier si cette acquisition n'a pas déjà été ajoutée
          if (!acquisitionsSeen.has(key)) {
            acquisitionsSeen.add(key);
            const typeLabel = getTypeLabel(acq);
            structuredFacts.push(`Acquisition à ${simpleMatch[1]} (${simpleMatch[2]})${typeLabel}`);
          }
        }
      }
    });
    
    // Si aucune acquisition individuelle n'a été extraite, utiliser le format global
    if (structuredFacts.length === 0) {
      structuredFacts.push(`${nb} acquisition${nb !== '1' ? 's' : ''} pour ${montant}M€`);
    }
  } else {
    // Format : "Nouvelle acquisition à Ville (Pays): typologie de X m²"
    // Exemple : "Nouvelle acquisition à Ovar (Portugal): ensemble commercial de 13 329 m²"
    let acqNouvelleMatches: RegExpMatchArray[] = [];
    try {
      acqNouvelleMatches = Array.from(fullText.matchAll(/nouvelle\s+acquisition.*?à\s+([A-Z][a-zàéèêëïîôùûüÿç]+(?:\s+[A-Z][a-zàéèêëïîôùûüÿç]+)?)\s*\(([A-Z][a-zàéèêëïîôùûüÿç]+)\):([^|]+?)(?:\s+de\s+(\d+(?:\s+\d+)?)\s*m²)?/gi));
    } catch (error) {
      console.warn('[getScpiNews] Erreur lors de la détection des acquisitions (nouvelle):', error);
    }
    acqNouvelleMatches.forEach(match => {
      const ville = match[1];
      const pays = match[2];
      const key = `${ville.toLowerCase()}_${pays.toLowerCase()}`;
      
      // Vérifier si cette acquisition n'a pas déjà été ajoutée
      if (!acquisitionsSeen.has(key)) {
        acquisitionsSeen.add(key);
        const description = match[3]?.trim() || '';
        const surface = match[4] ? `, ${match[4]} m²` : '';
        const typeLabel = getTypeLabel(description);
        structuredFacts.push(`Acquisition à ${ville} (${pays}${surface})${typeLabel}`);
      }
    });
    
    // Format : "Acquisition d'un ensemble de bureaux à Pozuelo de Alarcón (Madrid, Espagne), ..."
    let acqDeFormatMatches: RegExpMatchArray[] = [];
    try {
      acqDeFormatMatches = Array.from(fullText.matchAll(/(?:^|\|)\s*Acquisition\s+d'[^à]*à\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s\-']+?)\s*\(([^)]+)\)[^|]*/gi));
    } catch (error) {
      console.warn('[getScpiNews] Erreur lors de la détection des acquisitions (format "d\'un"):', error);
    }
    acqDeFormatMatches.forEach(match => {
      const ville = match[1];
      const paysDetails = match[2];
      const fullMatch = match[0];
      
      // Extraire le pays : si virgule, prendre le dernier élément (ex: "Madrid, Espagne" -> "Espagne")
      // Sinon prendre le premier mot
      let pays: string;
      if (paysDetails.includes(',')) {
        const parts = paysDetails.split(',').map(p => p.trim());
        pays = parts[parts.length - 1]; // Dernier élément après la virgule
      } else {
        const paysMatch = paysDetails.match(/^([A-Z][a-zàéèêëïîôùûüÿç]+(?:\s+[A-Z][a-zàéèêëïîôùûüÿç]+)?)/);
        pays = paysMatch ? paysMatch[1] : paysDetails.trim();
      }
      
      if (!pays) return;
      
      const key = `${ville.toLowerCase()}_${pays.toLowerCase()}`;
      
      if (!acquisitionsSeen.has(key)) {
        acquisitionsSeen.add(key);
        // Extraire des détails supplémentaires si présents
        const rendementMatch = fullMatch.match(/rendement[^0-9]*(\d+[.,]?\d*)\s*%/i);
        const rendement = rendementMatch ? `, rendement ${rendementMatch[1].replace(',', '.')}%` : '';
        structuredFacts.push(`Acquisition à ${ville} (${pays})${rendement}`);
      }
    });
    
    // Format : "Acquisition à Ville (Pays, surface m², montantM€) : description"
    // Format : "Acquisition à Ville (Pays) : description"
    // Note: Le pattern doit gérer les caractères spéciaux comme "ò" dans "Fossò" et les tirets dans "Sainte-Hélène-du-Lac"
    // Utiliser un lookbehind pour s'assurer qu'on commence par "Acquisition" (pas "acquisitions" au pluriel)
    let acqFormatMatches: RegExpMatchArray[] = [];
    try {
      acqFormatMatches = Array.from(fullText.matchAll(/(?:^|\|)\s*Acquisition\s+à\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s\-']+?)\s*\(([^)]+)\)\s*:\s*([^|]+)/gi));
    } catch (error) {
      console.warn('[getScpiNews] Erreur lors de la détection des acquisitions (format détaillé):', error);
    }
    acqFormatMatches.forEach(match => {
      const ville = match[1];
      const paysDetails = match[2]; // Peut contenir "Pays, surface, montant" ou juste "Pays"
      const description = match[3]?.trim() || '';
      
      // Extraire le pays (premier élément avant la virgule)
      const paysMatch = paysDetails.match(/^([A-Z][a-zàéèêëïîôùûüÿç]+)/);
      if (!paysMatch) return;
      
      const pays = paysMatch[1];
      const key = `${ville.toLowerCase()}_${pays.toLowerCase()}`;
      
      // Vérifier si cette acquisition n'a pas déjà été ajoutée
      if (!acquisitionsSeen.has(key)) {
        acquisitionsSeen.add(key);
        // Extraire surface et montant si présents dans les parenthèses
        const surfaceMatch = paysDetails.match(/(\d+(?:\s+\d+)?)\s*m²/);
        const montantMatch = paysDetails.match(/(\d+[.,]\d+)\s*M€/);
        
        // Obtenir le typeLabel seulement si le type n'est pas déjà présent dans la description
        const typeLabel = getTypeLabel(description);
        
        // Construire la phrase complète avec description
        structuredFacts.push(`Acquisition à ${ville} (${pays}) : ${description.trim()}${typeLabel}`);
      }
    });
    
    // Format : "Acquisition à Ville (Pays) - montant M€, surface m², locataire"
    let acqFormat2Matches: RegExpMatchArray[] = [];
    try {
      acqFormat2Matches = Array.from(fullText.matchAll(/acquisition.*?à\s+([A-Z][a-zàéèêëïîôùûüÿç]+(?:\s+[A-Z][a-zàéèêëïîôùûüÿç]+)?)\s*\(([A-Z][a-zàéèêëïîôùûüÿç]+)\)\s*-\s*([^|]+)/gi));
    } catch (error) {
      console.warn('[getScpiNews] Erreur lors de la détection des acquisitions (format 2):', error);
    }
    acqFormat2Matches.forEach(match => {
      const ville = match[1];
      const pays = match[2];
      const key = `${ville.toLowerCase()}_${pays.toLowerCase()}`;
      
      // Vérifier si cette acquisition n'a pas déjà été ajoutée
      if (!acquisitionsSeen.has(key)) {
        acquisitionsSeen.add(key);
        const details = match[3]?.trim() || '';
        const surfaceMatch = details.match(/(\d+(?:\s+\d+)?)\s*m²/);
        const surface = surfaceMatch ? `, ${surfaceMatch[1]} m²` : '';
        const typeLabel = getTypeLabel(details);
        structuredFacts.push(`Acquisition à ${ville} (${pays}${surface})${typeLabel}`);
      }
    });
    
    // Si aucune acquisition "nouvelle" n'a été trouvée, chercher le format simple
    if (structuredFacts.length === 0) {
      const acqSimpleMatch = fullText.match(/(\d+)\s+acquisition.*?(\d+[.,]\d+)\s*M€/i);
      if (acqSimpleMatch) {
        const nb = acqSimpleMatch[1];
        const montant = acqSimpleMatch[2].replace(',', '.');
        structuredFacts.push(`${nb} acquisition${nb !== '1' ? 's' : ''} pour ${montant}M€`);
      }
    }
  }
  
  // Chercher "Aucune acquisition" si mentionné (comme pour les cessions)
  const acquisitionFound = structuredFacts.some(fact => fact.toLowerCase().includes('acquisition'));
  if (!acquisitionFound && fullText.match(/aucune\s+acquisition/i) && structuredFacts.length < maxPoints) {
    // Utiliser le texte exact si disponible, sinon format standard
    const aucuneAcquisitionMatch = fullText.match(/Aucune acquisition[^|]*/i);
    if (aucuneAcquisitionMatch) {
      structuredFacts.push(aucuneAcquisitionMatch[0].trim());
    } else {
      structuredFacts.push('Aucune acquisition au trimestre');
    }
  }
  
  // Ajuster maxPoints après avoir compté les acquisitions
  // Garder au moins 15 points pour les autres éléments, mais permettre plus si beaucoup d'acquisitions
  maxPoints = Math.max(15, structuredFacts.length + 10);

  // 2. PRIORITÉ : Cessions (arbitrage, création de valeur, désendettement)
  // Format : "Cession d'un actif de commerce à Rueil-Malmaison, ..."
  let cesDeFormatMatches: RegExpMatchArray[] = [];
  try {
    cesDeFormatMatches = Array.from(fullText.matchAll(/(?:^|\|)\s*Cession\s+d'[^à]*à\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s\-']+?)(?:[,|]|$)/gi));
  } catch (error) {
    console.warn('[getScpiNews] Erreur lors de la détection des cessions (format "d\'un"):', error);
  }
  cesDeFormatMatches.forEach(match => {
    const ville = match[1].trim();
    if (ville && !structuredFacts.some(f => f.toLowerCase().includes(ville.toLowerCase()) && f.toLowerCase().includes('cession'))) {
      structuredFacts.push(`Cession à ${ville}`);
    }
  });
  
  // Extraire toutes les cessions mentionnées (formats classiques)
  const cesPatterns = [
    /(\d+)\s+cession.*?(\d+[.,]\d+)\s*M€/i,
    /cession.*?(\d+[.,]\d+)\s*M€/i,
    /(\d+)\s+cession/i,
  ];

  let cessionFound = false;
  for (const pattern of cesPatterns) {
    const match = fullText.match(pattern);
    if (match && structuredFacts.length < maxPoints) {
      if (match[1] && match[2]) {
        const nb = match[1];
        const montant = match[2].replace(',', '.');
        structuredFacts.push(`${nb} cession${nb !== '1' ? 's' : ''} pour ${montant}M€`);
        cessionFound = true;
      } else if (match[1] && match[1].includes(',')) {
        structuredFacts.push(`Cession de ${match[1].replace(',', '.')}M€`);
        cessionFound = true;
      } else if (match[1] && !match[1].includes(',')) {
        structuredFacts.push(`${match[1]} cession${match[1] !== '1' ? 's' : ''}`);
        cessionFound = true;
      }
      break;
    }
  }
  
  // Chercher aussi "Aucune cession" si mentionné
  if (!cessionFound && fullText.match(/aucune\s+cession/i) && structuredFacts.length < maxPoints) {
    // Utiliser le texte exact si disponible, sinon format standard
    const aucuneCessionMatch = fullText.match(/Aucune cession[^|]*/i);
    if (aucuneCessionMatch) {
      structuredFacts.push(aucuneCessionMatch[0].trim());
    } else {
      structuredFacts.push('Aucune cession au trimestre');
    }
  }

  // 2.4. PRIORITÉ : Collecte / Investissement (si mentionné explicitement)
  if (fullText.match(/capitaux\s+collectés\s+intégralement\s+investis/i) && structuredFacts.length < maxPoints) {
    structuredFacts.push('Capitaux collectés intégralement investis');
  }
  
  // 2.5. PRIORITÉ : Gestion locative (fait marquant) - Prolongations, renouvellements, reloués, mouvements
  // Détecter tous les éléments de gestion locative significatifs
  const gestionLocativePatterns = [
    /mouvements\s+locatifs[^|]*/i,
    /prolongation.*?renouvellement.*?baux?[^|]*/i,
    /renouvellement.*?bail[^|]*/i,
    /prolongation.*?bail[^|]*/i,
    /\d+\s+m²\s+reloué[^|]*/i,
    /reloué[^|]*/i,
    /nouveau\s+bail[^|]*/i,
    /signature.*?baux?[^|]*/i,
  ];

  const allGestionMatches: string[] = [];
  const ensureGlobalRegex = (regex: RegExp) => {
    if (regex.global) {
      return regex;
    }
    const flags = `${regex.flags}g`;
    return new RegExp(regex.source, flags);
  };

  gestionLocativePatterns.forEach(pattern => {
    try {
      const matches = Array.from(fullText.matchAll(ensureGlobalRegex(pattern)));
      matches.forEach(match => {
        if (match && match[0]) {
          const text = match[0].trim();
          // Filtrer les doublons et limiter la longueur
          if (text.length > 0 && text.length <= 120 && !allGestionMatches.some(existing => 
            existing.toLowerCase().includes(text.toLowerCase().substring(0, 30)) ||
            text.toLowerCase().includes(existing.toLowerCase().substring(0, 30))
          )) {
            allGestionMatches.push(text);
          }
        }
      });
    } catch (error) {
      // Ignorer les erreurs de regex pour ce pattern
      console.warn('[getScpiNews] Erreur lors de la détection de gestion locative:', error);
    }
  });

  // Ajouter tous les éléments de gestion locative trouvés (max 3 pour éviter la surcharge)
  if (allGestionMatches.length > 0 && structuredFacts.length < maxPoints) {
    allGestionMatches.slice(0, 3).forEach(gestionText => {
      if (structuredFacts.length < maxPoints) {
        structuredFacts.push(gestionText);
      }
    });
  }

  // 3. PRIORITÉ : Collecte / Retraits (flux significatifs, parts en attente)
  const collecteMatch = fullText.match(/collecte\s*(nette|brute).*?(\d+[.,]\d+)\s*(M|Md)€[^|]*/i);
  if (collecteMatch && structuredFacts.length < maxPoints) {
    const type = collecteMatch[1] || 'nette';
    const montant = collecteMatch[2].replace(',', '.');
    const unite = collecteMatch[3] === 'Md' ? 'Md' : 'M';
    // Extraire le contexte complet si disponible (ex: "portant la capitalisation à...")
    const collecteFullMatch = fullText.match(/Collecte\s+(?:brute|nette)\s+de\s+(\d+[.,]\d+)\s*(M|Md)€[^|]*/i);
    if (collecteFullMatch) {
      const fullTextMatch = collecteFullMatch[0];
      // Garder le texte complet si informatif, sinon format standard
      if (fullTextMatch.length > 30) {
        structuredFacts.push(fullTextMatch.trim());
      } else {
        structuredFacts.push(`Collecte ${type} de ${montant}${unite}€`);
      }
    } else {
      structuredFacts.push(`Collecte ${type} de ${montant}${unite}€`);
    }
  }

  const retraitsMatch = fullText.match(/retrait.*?(\d+[.,]?\d*)\s*(parts|M€)/i);
  if (retraitsMatch && structuredFacts.length < maxPoints) {
    const valeur = retraitsMatch[1];
    const unite = retraitsMatch[2];
    structuredFacts.push(`Retraits de ${valeur} ${unite}`);
  }

  // 4. PRIORITÉ : Distribution (confirmation, évolution, ajustement)
  const distMatch = fullText.match(/distribution.*?T3.*?(\d+[.,]\d+)\s*€\/part/i) ||
                    fullText.match(/distribution.*?(\d+[.,]\d+)\s*€\/part/i);
  if (distMatch && structuredFacts.length < maxPoints) {
    const montant = distMatch[1].replace(',', '.');
    structuredFacts.push(`Distribution de ${montant}€/part`);
  }

  // 5. PRIORITÉ : Occupation / Vacance (variation notable uniquement)
  // On mentionne si variation significative ou niveau critique, sinon on l'ajoute en fallback si rien d'autre
  const occFinMatch = fullText.match(/taux\s*d'occupation\s*financier.*?(\d+[.,]?\d+)%/i);
  const occPhyMatch = fullText.match(/taux\s*d'occupation\s*physique.*?(\d+[.,]?\d+)%/i);
  
  let occupationNotable = false;
  if (occFinMatch && structuredFacts.length < maxPoints) {
    const taux = parseFloat(occFinMatch[1].replace(',', '.'));
    // Mentionner si < 95% (variation notable) ou si très élevé (>= 99.5%) ou si le texte complet contient des infos supplémentaires (WALB, etc.)
    const occFullMatch = fullText.match(/Taux\s+d'?occupation\s+financier[^|]*/i);
    const hasAdditionalInfo = occFullMatch && occFullMatch[0].length > 50;
    
    if (taux < 95 || taux >= 99.5 || hasAdditionalInfo) {
      // Extraire le texte complet si disponible (ex: "et durée ferme moyenne des baux (WALB) de 9,7 ans")
      if (hasAdditionalInfo) {
        structuredFacts.push(occFullMatch[0].trim());
      } else {
        structuredFacts.push(`Taux d'occupation financier de ${occFinMatch[1].replace(',', '.')}%`);
      }
      occupationNotable = true;
    }
  } else if (occPhyMatch && structuredFacts.length < maxPoints) {
    const taux = parseFloat(occPhyMatch[1].replace(',', '.'));
    if (taux < 95 || taux >= 99.5) {
      structuredFacts.push(`Occupation physique de ${occPhyMatch[1].replace(',', '.')}%`);
      occupationNotable = true;
    }
  }

  // 6. PRIORITÉ : Endettement / Financement (nouveau levier, renégociation)
  const endMatch = fullText.match(/(?:endettement|LTV|ratio\s*d'endettement).*?(\d+[.,]\d+)%/i);
  let endettementNotable = false;
  if (endMatch && structuredFacts.length < maxPoints) {
    const taux = parseFloat(endMatch[1].replace(',', '.'));
    // Mentionner si variation notable (> 5% ou < 0.5%)
    if (taux > 5 || taux < 0.5) {
      structuredFacts.push(`Endettement de ${endMatch[1].replace(',', '.')}%`);
      endettementNotable = true;
    }
  }

  // 7. PRIORITÉ : Événement à venir (changement de prix, modification future)
  const evenementAVenirMatch = filteredActualites.find(actu => {
    const actuLower = actu.toLowerCase();
    return (actuLower.includes('à compter du') || actuLower.includes('à partir du') || 
            actuLower.includes('dès le') || actuLower.includes('à venir')) &&
           actu.length < 150;
  });
  if (evenementAVenirMatch && structuredFacts.length < maxPoints) {
    structuredFacts.push(evenementAVenirMatch.trim());
  }

  // 8. PRIORITÉ : Événement exceptionnel (revalorisation, incident, changement stratégique)
  const prixMatch = filteredActualites.find(actu => 
    (actu.includes('prix') || actu.includes('distinction') || actu.includes('récompense') || 
     actu.includes('élue') || actu.includes('palmarès') || actu.includes('revalorisation') ||
     actu.includes('revalorisé')) &&
    !actu.includes('à compter du') && // Exclure les événements à venir déjà traités
    actu.length < 120
  );
  if (prixMatch && structuredFacts.length < maxPoints) {
    // Synthétiser l'événement : extraire l'essentiel
    let prixText = prixMatch;
    // Si c'est une élection/palmarès, simplifier
    if (prixText.includes('élue') && prixText.includes('palmarès')) {
      const scpiName = scpi.name;
      prixText = `${scpiName} élue dans un palmarès`;
    } else if (prixText.includes('revalorisé') || prixText.includes('revalorisation')) {
      const prixMatch = prixText.match(/prix.*?(\d+)\s*€/i);
      if (prixMatch) {
        prixText = `Prix de la part revalorisé à ${prixMatch[1]}€`;
      }
    }
    if (prixText.length > 70) {
      prixText = prixText.substring(0, 67) + '...';
    }
    structuredFacts.push(prixText);
  }

  // Déduplication finale : supprimer les doublons exacts
  const uniqueFacts: string[] = [];
  const seenFacts = new Set<string>();
  
  for (const fact of structuredFacts) {
    // Normaliser la chaîne pour la comparaison (minuscules, espaces)
    const normalized = fact.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!seenFacts.has(normalized)) {
      seenFacts.add(normalized);
      uniqueFacts.push(fact);
    }
  }

  // Limiter selon maxPoints (ajusté dynamiquement selon le nombre d'acquisitions)
  let selectedFacts = uniqueFacts.slice(0, maxPoints);

  // Si aucun fait structurant n'a été extrait mais qu'on a des actualités, 
  // essayer d'extraire au moins la distribution ou la collecte comme fallback
  if (selectedFacts.length === 0) {
    // Fallback 1 : Distribution (toujours importante)
    const distFallback = fullText.match(/distribution.*?(\d+[.,]\d+)\s*€/i);
    if (distFallback) {
      selectedFacts.push(`Distribution de ${distFallback[1].replace(',', '.')}€/part`);
    }
    
    // Fallback 2 : Collecte
    if (selectedFacts.length === 0) {
      const collecteFallback = fullText.match(/collecte.*?(\d+[.,]\d+)\s*(M|Md)€/i);
      if (collecteFallback) {
        const unite = collecteFallback[2] === 'Md' ? 'Md' : 'M';
        selectedFacts.push(`Collecte de ${collecteFallback[1].replace(',', '.')}${unite}€`);
      }
    }
    
    // Fallback 3 : Occupation (si pas déjà ajoutée comme notable)
    if (selectedFacts.length === 0 && !occupationNotable) {
      if (occFinMatch) {
        selectedFacts.push(`Occupation financier de ${occFinMatch[1].replace(',', '.')}%`);
      } else if (occPhyMatch) {
        selectedFacts.push(`Occupation physique de ${occPhyMatch[1].replace(',', '.')}%`);
      }
    }
    
    // Fallback 4 : Endettement (si pas déjà ajouté comme notable)
    if (selectedFacts.length === 0 && !endettementNotable && endMatch) {
      selectedFacts.push(`Endettement de ${endMatch[1].replace(',', '.')}%`);
    }
    
    // Fallback 5 : Capitalisation si disponible
    if (selectedFacts.length === 0) {
      const capFallback = fullText.match(/capitalisation.*?(\d+[.,]\d+)\s*(M|Md)€/i);
      if (capFallback) {
        const unite = capFallback[2] === 'Md' ? 'Md' : 'M';
        selectedFacts.push(`Capitalisation de ${capFallback[1].replace(',', '.')}${unite}€`);
      }
    }
  }

  // Accepter à partir de 1 point (événement structurant même isolé)
  // Si on a des actualités mais aucun pattern ne matche, on retourne quand même quelque chose
  if (selectedFacts.length === 0) {
    return '';
  }

  // NOUVEAU FORMAT : [Icône] Mot-clé – phrase (10-25 mots)
  // Mapping des icônes par type de fait
  const getIconAndKeyword = (fact: string): { icon: string; keyword: string; phrase: string } => {
    const factLower = fact.toLowerCase();
    
    // Acquisitions
    if (factLower.includes('acquisition')) {
      // Extraire la phrase : enlever "Acquisition à" ou "X acquisitions" du début
      let phrase = fact.replace(/^Acquisition\s+à\s+/i, '');
      phrase = phrase.replace(/^(\d+)\s+acquisition[^:]*:\s*/i, '');
      // Si la phrase commence par une ville, reformuler pour inclure le contexte
      if (phrase.match(/^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß]/)) {
        // La phrase commence déjà bien, on la garde
      } else {
        phrase = fact; // Garder la phrase originale si la transformation échoue
      }
      return { icon: '🏢', keyword: 'Acquisition', phrase: phrase || fact };
    }
    
    // Cessions
    if (factLower.includes('cession')) {
      return { icon: '💸', keyword: 'Cession', phrase: fact };
    }
    
    // Gestion locative (prolongations, renouvellements, reloués)
    if (factLower.includes('prolongation') || factLower.includes('renouvellement') || 
        factLower.includes('reloué') || factLower.includes('nouveau bail') || 
        factLower.includes('signature') && factLower.includes('bail')) {
      return { icon: '🔑', keyword: 'Gestion locative', phrase: fact };
    }
    
    // Collecte
    if (factLower.includes('collecte')) {
      return { icon: '📈', keyword: 'Collecte', phrase: fact };
    }
    
    // Retraits
    if (factLower.includes('retrait')) {
      return { icon: '📉', keyword: 'Retraits', phrase: fact };
    }
    
    // Distribution
    if (factLower.includes('distribution') || factLower.includes('dividende')) {
      return { icon: '💰', keyword: 'Distribution', phrase: fact };
    }
    
    // Occupation
    if (factLower.includes('occupation') || factLower.includes('taux d\'occupation')) {
      return { icon: '🧱', keyword: 'Occupation', phrase: fact };
    }
    
    // Endettement
    if (factLower.includes('endettement') || factLower.includes('ratio')) {
      return { icon: '🏦', keyword: 'Endettement', phrase: fact };
    }
    
    // Événement à venir (avec date future)
    if (factLower.includes('à compter du') || factLower.includes('à partir du') || 
        factLower.includes('dès le') || factLower.includes('à venir')) {
      return { icon: '⏳', keyword: 'Événement à venir', phrase: fact };
    }
    
    // Événement exceptionnel
    if (factLower.includes('élue') || factLower.includes('palmarès') || factLower.includes('récompense') || 
        factLower.includes('revalorisation') || factLower.includes('prix')) {
      return { icon: '⚠️', keyword: 'Événement', phrase: fact };
    }
    
    // Par défaut
    return { icon: '⏳', keyword: 'Actualité', phrase: fact };
  };

  // Fonction pour compter les mots
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  // Fonction pour reformuler si nécessaire (10-25 mots)
  const formatPhrase = (phrase: string, minWords: number = 10, maxWords: number = 25): string => {
    const words = countWords(phrase);
    
    if (words < minWords) {
      // Trop court : garder tel quel (sera géré par la sélection)
      return phrase;
    } else if (words > maxWords) {
      // Trop long : tronquer intelligemment à la phrase complète la plus proche de 25 mots
      const wordsArray = phrase.split(/\s+/);
      // Prendre les 25 premiers mots
      let truncated = wordsArray.slice(0, maxWords).join(' ');
      
      // Chercher un point de coupure naturel (virgule, point, deux-points) dans les 20-25 derniers mots
      const truncatedWords = truncated.split(/\s+/);
      const searchStart = Math.max(0, truncatedWords.length - 10);
      let bestCutPoint = -1;
      
      for (let i = truncatedWords.length - 1; i >= searchStart; i--) {
        const word = truncatedWords[i];
        if (word.endsWith(',') || word.endsWith(':') || word.endsWith('.')) {
          bestCutPoint = i;
          break;
        }
      }
      
      if (bestCutPoint >= 0 && bestCutPoint < truncatedWords.length - 3) {
        // Couper à la ponctuation trouvée
        truncated = truncatedWords.slice(0, bestCutPoint + 1).join(' ');
      }
      
      return truncated;
    }
    
    return phrase;
  };

  // Formater chaque fait avec icône, mot-clé et phrase
  const formattedFacts: string[] = [];
  for (const fact of selectedFacts) {
    const { icon, keyword, phrase } = getIconAndKeyword(fact);
    const formattedPhrase = formatPhrase(phrase);
    formattedFacts.push(`${icon} ${keyword} – ${formattedPhrase}`);
  }

  // Limiter à 2-6 points (max 8 si trimestre exceptionnel)
  // Déterminer si trimestre exceptionnel (beaucoup d'acquisitions, événements majeurs)
  const nbAcquisitions = selectedFacts.filter(f => f.toLowerCase().includes('acquisition')).length;
  const hasExceptionalEvent = selectedFacts.some(f => 
    f.toLowerCase().includes('élue') || 
    f.toLowerCase().includes('récompense') || 
    f.toLowerCase().includes('première acquisition') ||
    f.toLowerCase().includes('nouveau pays')
  );
  
  // Un trimestre est exceptionnel si :
  // - Plus de 3 acquisitions
  // - Événement majeur (récompense, nouveau pays, etc.)
  // - Plus de 6 points au total
  const isExceptional = nbAcquisitions > 3 || hasExceptionalEvent || formattedFacts.length > 6;
  
  const finalMaxPoints = isExceptional ? 8 : 6;
  const minPoints = 2;
  
  // Prioriser les acquisitions, puis les autres par ordre de priorité
  const acquisitions = formattedFacts.filter(f => f.includes('🏢'));
  const autres = formattedFacts.filter(f => !f.includes('🏢'));
  
  // AFFICHER TOUTES LES ACQUISITIONS SANS LIMITE
  // Les acquisitions sont prioritaires et doivent toutes être affichées
  const selectedAcquisitions = acquisitions; // Toutes les acquisitions
  
  // Calculer les slots restants pour les autres infos
  // Si beaucoup d'acquisitions, on peut dépasser légèrement le max pour garder au moins 1-2 autres points
  const remainingSlots = Math.max(1, finalMaxPoints - selectedAcquisitions.length);
  const selectedAutres = autres.slice(0, remainingSlots);
  
  let finalFacts = [...selectedAcquisitions, ...selectedAutres];
  
  // Si moins de 2 points après sélection, garder ce qu'on a (minimum 1 point acceptable)
  if (finalFacts.length === 0 && formattedFacts.length > 0) {
    finalFacts = formattedFacts.slice(0, 1); // Au moins 1 point
  }

  // Convertir en liste HTML
  return finalFacts.map(fact => `• ${fact}`).join('<br>');
  } catch (error) {
    console.error('[getScpiNews] Erreur lors du traitement des actualités pour', scpi.name, error);
    return ''; // Retourner une chaîne vide en cas d'erreur pour éviter une page blanche
  }
};

const getSectorName = (sector: string): string => {
  const sectorNames: Record<string, string> = {
    'bureaux': 'de bureaux',
    'commerces': 'commerciale',
    'residentiel': 'résidentielle',
    'sante': 'de santé',
    'logistique': 'logistique',
    'hotellerie': 'd\'hôtellerie',
    'diversifie': 'diversifiée'
  };

  return sectorNames[sector] || 'diversifiée';
};

const getGeographyName = (geography: string): string => {
  const geoNames: Record<string, string> = {
    'france': 'en France',
    'europe': 'en Europe',
    'international': 'à l\'international'
  };
  
  return geoNames[geography] || 'en France';
};