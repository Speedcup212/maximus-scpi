import { Scpi } from '../types/scpi';

export const getScpiAdvantages = (scpi: Scpi): string[] => {
  const advantages: string[] = [];
  
  // Rendement
  if (scpi.yield >= 7) {
    advantages.push("Rendement très attractif (>7%)");
  } else if (scpi.yield >= 5.5) {
    advantages.push("Rendement attractif et stable");
  }
  
  // TOF
  if (scpi.tof >= 95) {
    advantages.push("Taux d'occupation élevé, sécurisant les distributions");
  }
  
  // Distribution
  if (scpi.yield > 0) {
    advantages.push("Distribution régulière trimestrielle");
  }
  
  // Diversification sectorielle
  if (scpi.repartitionSector && scpi.repartitionSector.length >= 3) {
    advantages.push("Diversification sectorielle équilibrée");
  }
  
  // Diversification géographique
  if (scpi.geography === 'europe') {
    advantages.push("Diversification géographique européenne");
  } else if (scpi.geography === 'international') {
    advantages.push("Diversification géographique internationale");
  }
  
  // Accès institutionnel
  if (scpi.capitalization >= 1000000000) {
    advantages.push("Accès à des actifs institutionnels de grande qualité");
  }
  
  // Fiscalité
  if (scpi.european || scpi.geography === 'international') {
    advantages.push("Fiscalité optimisable via assurance-vie");
  }
  
  // Accessibilité
  if (scpi.minInvest <= 1000) {
    advantages.push("Ticket d'entrée faible et accessibilité");
  }
  
  // Société de gestion
  const experiencedManagers = ['La Française REM', 'PERIAL Asset Management', 'Sofidy', 'Amundi Immobilier'];
  if (experiencedManagers.includes(scpi.company)) {
    advantages.push("Société de gestion reconnue et expérimentée");
  }
  
  // Qualité patrimoniale
  if (scpi.creation >= 2015 && scpi.tof >= 90) {
    advantages.push("Patrimoine de qualité avec normes modernes");
  }
  
  // Label ISR
  if (scpi.isr) {
    advantages.push("Label ISR, politique ESG active");
  }
  
  // Frais
  if (scpi.fees === 0) {
    advantages.push("Sans frais d'entrée, optimise l'investissement initial");
  }
  
  // Capitalisation
  if (scpi.capitalization >= 500000000) {
    advantages.push("Capitalisation importante garantissant la liquidité");
  }
  
  // Secteurs spécifiques
  if (scpi.sector === 'sante') {
    advantages.push("Secteur santé défensif et porteur");
  } else if (scpi.sector === 'logistique') {
    advantages.push("Secteur logistique en forte croissance");
  } else if (scpi.sector === 'residentiel') {
    advantages.push("Secteur résidentiel stable et défensif");
  }
  
  return advantages;
};

export const getScpiPointsAttention = (scpi: Scpi): string[] => {
  const concerns: string[] = [];
  
  // Toujours présent - Fiscalité
  concerns.push("Revenus fonciers imposés (IR + prélèvements sociaux)");
  
  // Toujours présent - Liquidité
  concerns.push("Délai de revente (liquidité limitée)");
  
  // Troisième point selon les caractéristiques spécifiques
  if (scpi.geography === 'international' || scpi.european) {
    concerns.push("Double imposition potentielle sur l'international");
  } else if (scpi.discount > 3) {
    concerns.push("Surcote/décote du prix de part");
  } else if (scpi.tof < 90) {
    concerns.push("RAN faible ou en diminution");
  } else if (scpi.creation >= 2020) {
    concerns.push("Société de gestion jeune ou peu expérimentée");
  } else if (scpi.sector === 'hotellerie') {
    concerns.push("Sensibilité aux taux d'intérêt et inflation");
  } else if (scpi.sector === 'commerces') {
    concerns.push("Concentration sectorielle ou géographique");
  } else if (scpi.creation < 2000) {
    concerns.push("Patrimoine vieillissant (travaux à prévoir)");
  } else {
    concerns.push("Horizon d'investissement long (8-12 ans minimum)");
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
    "Comète": "SCPI innovante créée en 2021 par Alderan, spécialisée dans l'immobilier de bureaux et commerces en Europe. Comète se distingue par sa stratégie d'investissement dynamique et son approche ESG renforcée, visant des actifs à fort potentiel de valorisation dans des métropoles européennes en croissance.",
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
  
  if (scpi.discount < -5) {
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

export const getScpiNews = (scpi: Scpi): string => {
  const news: Record<string, string> = {
    "Comète": "• Acquisition récente d'un immeuble de bureaux moderne à Amsterdam pour 45M€<br>• Certification HQE obtenue pour 80% du patrimoine<br>• Distribution trimestrielle maintenue à 2,65% malgré le contexte économique",
    "Transitions Europe": "• Lancement d'un programme de rénovation énergétique sur 15 actifs<br>• Signature d'un bail ferme de 9 ans avec une multinationale tech à Berlin<br>• Obtention du label ISR renforcé pour l'ensemble du patrimoine",
    "Iroko Zen": "• Extension réussie d'une clinique privée en région parisienne<br>• Partenariat stratégique avec un groupe hospitalier européen<br>• Rendement 2024 confirmé à 7,3% grâce à l'indexation des loyers",
    "Pierval Santé": "• Acquisition d'un pôle de santé de 12 000 m² en région lyonnaise<br>• Renouvellement anticipé de 85% des baux sur 2024<br>• Lancement d'un programme d'extension de 8 établissements existants"
  };
  
  return news[scpi.name] || "• Actualités en cours de mise à jour - consultez le site de la société de gestion<br>• Rapports trimestriels disponibles sur demande<br>• Rendez-vous conseil pour information détaillée sur les dernières évolutions";
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