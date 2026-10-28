import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Scpi } from '../types/scpi';
import { ClientProfile } from '../types/riskProfile';
import { formatCurrency } from './formatters';

interface PortfolioItem extends Scpi {
  investedAmount: number;
  percentage: number;
}

export const generatePortfolioPDF = async (
  portfolio: PortfolioItem[],
  clientProfile: ClientProfile | null,
  totalInvested: number
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Couleurs MaximusSCPI
  const colors = {
    primary: [0, 86, 179],      // #0056b3
    secondary: [0, 204, 255],   // #00ccff
    dark: [33, 37, 41],         // #21252d
    light: [248, 249, 250],     // #f8f9fa
    success: [16, 185, 129],    // #10b981
    warning: [245, 158, 11],    // #f59e0b
    white: [255, 255, 255],
    gray: [107, 114, 128]       // #6b7280
  };

  // Calculs globaux du portefeuille
  const averageYield = portfolio.length > 0 
    ? portfolio.reduce((sum, item) => sum + (item.yield * item.percentage / 100), 0)
    : 0;
  const annualIncome = (totalInvested * averageYield) / 100;
  const monthlyIncome = annualIncome / 12;
  const sectors = [...new Set(portfolio.map(item => item.sector))];
  const geographies = [...new Set(portfolio.map(item => item.geography))];
  const isrCount = portfolio.filter(item => item.isr).length;
  const averageTof = portfolio.length > 0 
    ? portfolio.reduce((sum, item) => sum + (item.tof * item.percentage / 100), 0)
    : 0;
  const totalCapitalization = portfolio.reduce((sum, item) => sum + item.capitalization, 0);

  // Page 1 - Page de garde
  createCoverPage(pdf, clientProfile, portfolio, pageWidth, pageHeight, colors);
  
  // Page 2 - Profil et objectifs
  pdf.addPage();
  createProfilePage(pdf, clientProfile, pageWidth, pageHeight, colors);
  
  // Page 3 - Résumé global
  pdf.addPage();
  createSummaryPage(pdf, portfolio, totalInvested, averageYield, monthlyIncome, annualIncome, sectors, geographies, isrCount, averageTof, pageWidth, colors);
  
  // Page 4 - Tableau détaillé
  pdf.addPage();
  createDetailedTable(pdf, portfolio, totalInvested, pageWidth, colors);
  
  // Page 5 - Simulation personnalisée
  pdf.addPage();
  createSimulationPage(pdf, portfolio, totalInvested, averageYield, annualIncome, monthlyIncome, clientProfile, pageWidth, pageHeight, colors);
  
  // Page 6 - Graphiques d'analyse
  pdf.addPage();
  createChartsPage(pdf, portfolio, pageWidth, pageHeight, colors);
  
  // Page 7 - Call to action
  pdf.addPage();
  createCallToActionPage(pdf, pageWidth, pageHeight, colors);

  // Télécharger le PDF
  const fileName = `rapport-portefeuille-scpi-${clientProfile?.name?.replace(/\s+/g, '-').toLowerCase() || 'client'}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

const createCoverPage = (
  pdf: jsPDF, 
  clientProfile: ClientProfile | null,
  portfolio: PortfolioItem[],
  pageWidth: number, 
  pageHeight: number, 
  colors: any
) => {
  // Fond dégradé simulé
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, pageWidth, pageHeight * 0.6, 'F');
  
  pdf.setFillColor(...colors.secondary);
  pdf.rect(0, pageHeight * 0.6, pageWidth, pageHeight * 0.4, 'F');

  // Logo MaximusSCPI
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(42);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MaximusSCPI', pageWidth / 2, 50, { align: 'center' });
  
  // Sous-titre
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Outils d\'analyse SCPI', pageWidth / 2, 70, { align: 'center' });

  // Titre principal
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  const titleY = pageHeight * 0.4;
  pdf.text('Rapport Personnalisé', pageWidth / 2, titleY, { align: 'center' });
  pdf.setFontSize(28);
  pdf.text('Votre Portefeuille SCPI', pageWidth / 2, titleY + 25, { align: 'center' });

  // Informations client
  if (clientProfile) {
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Préparé pour : ${clientProfile.name}`, pageWidth / 2, titleY + 55, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text(`${clientProfile.riskProfile.icon} Profil ${clientProfile.riskProfile.name}`, pageWidth / 2, titleY + 75, { align: 'center' });
    pdf.text(`💰 ${formatCurrency(clientProfile.investmentAmount)} • ${portfolio.length} SCPI`, pageWidth / 2, titleY + 90, { align: 'center' });
  }

  // Date et version
  pdf.setTextColor(...colors.dark);
  pdf.setFontSize(14);
  pdf.text(`📅 Généré le ${new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, pageWidth / 2, pageHeight - 40, { align: 'center' });

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(...colors.gray);
  pdf.text('Document confidentiel - MaximusSCPI © 2025', pageWidth / 2, pageHeight - 20, { align: 'center' });
};

const createProfilePage = (
  pdf: jsPDF,
  clientProfile: ClientProfile | null,
  pageWidth: number,
  pageHeight: number,
  colors: any
) => {
  // Header avec style
  addPageHeader(pdf, 'Votre Profil Investisseur', pageWidth, colors);

  if (!clientProfile) {
    pdf.setTextColor(...colors.dark);
    pdf.setFontSize(12);
    pdf.text('Profil non défini', 20, 60);
    return;
  }

  const { riskProfile } = clientProfile;

  // Encadré profil principal
  const profileY = 50;
  pdf.setFillColor(240, 248, 255);
  pdf.roundedRect(20, profileY, pageWidth - 40, 70, 5, 5, 'F');
  pdf.setDrawColor(...colors.primary);
  pdf.setLineWidth(2);
  pdf.roundedRect(20, profileY, pageWidth - 40, 70, 5, 5, 'S');

  // Icône et nom du profil
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${riskProfile.icon} Profil ${riskProfile.name}`, 30, profileY + 20);

  // Description
  pdf.setTextColor(...colors.dark);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  const descriptionLines = splitTextToLines(pdf, riskProfile.description, pageWidth - 60, 14);
  descriptionLines.forEach((line, index) => {
    pdf.text(line, 30, profileY + 40 + (index * 12));
  });

  // Caractéristiques du profil
  const charY = profileY + 90;
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('🎯 Caractéristiques de votre profil', 20, charY);

  const characteristics = [
    `⏰ Horizon d'investissement : ${riskProfile.characteristics.horizon}`,
    `📊 Objectif principal : ${riskProfile.characteristics.objective}`,
    `🎚️ Tolérance au risque : ${riskProfile.characteristics.tolerance}`,
    `📈 Rendement cible : ${riskProfile.targetYield.min}% - ${riskProfile.targetYield.max}%`,
    `🏢 Allocation max par SCPI : ${riskProfile.maxSingleAllocation}%`,
    `🎯 Diversification min : ${riskProfile.minDiversification} SCPI`
  ];

  pdf.setTextColor(...colors.dark);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  characteristics.forEach((char, index) => {
    pdf.text(char, 30, charY + 25 + (index * 15));
  });

  // Informations personnelles
  const personalY = charY + 120;
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('👤 Vos informations', 20, personalY);

  const personalInfo = [
    `👤 Âge : ${clientProfile.age} ans`,
    `💰 Montant d'investissement : ${formatCurrency(clientProfile.investmentAmount)}`,
    `⏰ Horizon d'investissement : ${clientProfile.investmentHorizon} ans`,
    `🏛️ TMI : ${clientProfile.tmi || 'Non renseignée'}%`
  ];

  pdf.setTextColor(...colors.dark);
  pdf.setFontSize(12);
  personalInfo.forEach((info, index) => {
    pdf.text(info, 30, personalY + 25 + (index * 15));
  });

  // Préférences
  if (clientProfile.preferences) {
    const prefY = personalY + 90;
    pdf.setTextColor(...colors.primary);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('⚙️ Vos préférences', 20, prefY);

    const preferences = [];
    if (clientProfile.preferences.isr) preferences.push('🌱 Label ISR uniquement');
    if (clientProfile.preferences.european) preferences.push('🇪🇺 SCPI européennes privilégiées');
    if (clientProfile.preferences.noFees) preferences.push('💰 Sans frais d\'entrée');
    if (clientProfile.preferences.sectors.length > 0) {
      preferences.push(`🏢 Secteurs préférés : ${clientProfile.preferences.sectors.join(', ')}`);
    }

    pdf.setTextColor(...colors.dark);
    pdf.setFontSize(12);
    preferences.forEach((pref, index) => {
      pdf.text(pref, 30, prefY + 25 + (index * 15));
    });
  }
};

const createSummaryPage = (
  pdf: jsPDF,
  portfolio: PortfolioItem[],
  totalInvested: number,
  averageYield: number,
  monthlyIncome: number,
  annualIncome: number,
  sectors: string[],
  geographies: string[],
  isrCount: number,
  averageTof: number,
  pageWidth: number,
  colors: any
) => {
  // Header
  addPageHeader(pdf, 'Résumé de Votre Portefeuille', pageWidth, colors);

  // Métriques principales en grille
  const metricsY = 60;
  const boxWidth = (pageWidth - 60) / 2;
  const boxHeight = 35;

  // Montant total investi
  createMetricBox(pdf, '💶 MONTANT TOTAL INVESTI', formatCurrency(totalInvested), 
    20, metricsY, boxWidth, boxHeight, colors.primary, colors);

  // Rendement moyen
  createMetricBox(pdf, '📈 RENDEMENT MOYEN PONDÉRÉ', `${averageYield.toFixed(2)}%`, 
    30 + boxWidth, metricsY, boxWidth, boxHeight, colors.success, colors);

  // Nombre de SCPI
  createMetricBox(pdf, '🏢 NOMBRE DE SCPI', `${portfolio.length}`, 
    20, metricsY + 45, boxWidth, boxHeight, colors.secondary, colors);

  // TOF moyen
  createMetricBox(pdf, '🎯 TOF MOYEN PONDÉRÉ', `${averageTof.toFixed(1)}%`, 
    30 + boxWidth, metricsY + 45, boxWidth, boxHeight, colors.warning, colors);

  // Revenus estimés - Encadré spécial
  const revenueY = metricsY + 100;
  pdf.setFillColor(240, 253, 244);
  pdf.roundedRect(20, revenueY, pageWidth - 40, 60, 8, 8, 'F');
  pdf.setDrawColor(...colors.success);
  pdf.setLineWidth(2);
  pdf.roundedRect(20, revenueY, pageWidth - 40, 60, 8, 8, 'S');

  pdf.setTextColor(...colors.success);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('💰 Revenus Estimés (avant fiscalité)', 30, revenueY + 20);

  pdf.setTextColor(...colors.dark);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`📅 Revenus mensuels : ${formatCurrency(monthlyIncome)}`, 30, revenueY + 40);
  pdf.text(`📊 Revenus annuels : ${formatCurrency(annualIncome)}`, 30, revenueY + 55);

  // Caractéristiques du portefeuille
  const charY = revenueY + 80;
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('📋 Caractéristiques du Portefeuille', 20, charY);

  const characteristics = [
    `🎯 Diversification sectorielle : ${sectors.length} secteurs`,
    `🌍 Diversification géographique : ${geographies.length} zones`,
    `🌱 SCPI avec label ISR : ${isrCount}/${portfolio.length} (${Math.round((isrCount/portfolio.length)*100)}%)`,
    `💎 Score de qualité moyen : ${calculateQualityScore(portfolio)}/100`,
    `📈 Performance vs marché : ${averageYield > 5.1 ? '+' : ''}${(averageYield - 5.1).toFixed(2)}% vs moyenne`,
    `🏛️ Capitalisation totale : ${formatCurrency(totalCapitalization)}`
  ];

  pdf.setTextColor(...colors.dark);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  characteristics.forEach((char, index) => {
    pdf.text(char, 30, charY + 25 + (index * 15));
  });
};

const createDetailedTable = (
  pdf: jsPDF,
  portfolio: PortfolioItem[],
  totalInvested: number,
  pageWidth: number,
  colors: any
) => {
  // Header
  addPageHeader(pdf, 'Composition Détaillée du Portefeuille', pageWidth, colors);

  if (portfolio.length === 0) {
    pdf.setTextColor(...colors.dark);
    pdf.setFontSize(14);
    pdf.text('Aucune SCPI sélectionnée', 20, 80);
    return;
  }

  // Configuration du tableau optimisée
  const tableStartY = 70;
  const rowHeight = 18;
  const tableWidth = pageWidth - 40;
  const colWidths = [45, 35, 25, 15, 15, 15, 20, 10, 10];
  
  let currentX = 20;

  // En-têtes du tableau avec style
  pdf.setFillColor(...colors.primary);
  pdf.roundedRect(20, tableStartY, tableWidth, rowHeight, 3, 3, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  
  const headers = ['SCPI', 'Société', 'Montant €', '%', 'Rdt%', 'TOF%', 'Secteur', 'ISR', 'Géo'];
  
  headers.forEach((header, index) => {
    pdf.text(header, currentX + 2, tableStartY + 12);
    currentX += colWidths[index];
  });

  // Lignes du tableau
  portfolio.forEach((item, index) => {
    const y = tableStartY + rowHeight * (index + 1);
    currentX = 20;

    // Alternance de couleurs
    if (index % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(20, y, tableWidth, rowHeight, 'F');
    }

    // Bordures légères
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.rect(20, y, tableWidth, rowHeight, 'S');

    // Données avec formatage intelligent
    const rowData = [
      truncateText(item.name, 20),
      truncateText(item.company, 15),
      formatCurrency(item.investedAmount),
      `${item.percentage.toFixed(1)}%`,
      `${item.yield.toFixed(1)}%`,
      `${item.tof.toFixed(0)}%`,
      `${getSectorIcon(item.sector)} ${getSectorName(item.sector)}`,
      item.isr ? '✓' : '✗',
      getGeoIcon(item.geography)
    ];

    rowData.forEach((data, colIndex) => {
      // Couleurs spéciales selon le contenu
      if (colIndex === 4) { // Rendement
        if (item.yield >= 6) pdf.setTextColor(...colors.success);
        else if (item.yield >= 4) pdf.setTextColor(...colors.primary);
        else pdf.setTextColor(...colors.warning);
      } else if (colIndex === 7) { // ISR
        pdf.setTextColor(...(item.isr ? colors.success : colors.warning));
      } else {
        pdf.setTextColor(...colors.dark);
      }
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', colIndex === 0 ? 'bold' : 'normal');
      pdf.text(data, currentX + 2, y + 12);
      currentX += colWidths[colIndex];
    });
  });

  // Ligne de total avec style
  const totalY = tableStartY + rowHeight * (portfolio.length + 1);
  pdf.setFillColor(...colors.success);
  pdf.roundedRect(20, totalY, tableWidth, rowHeight, 3, 3, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  
  currentX = 20;
  pdf.text('TOTAL PORTEFEUILLE', currentX + 2, totalY + 12);
  currentX += colWidths[0] + colWidths[1];
  pdf.text(formatCurrency(totalInvested), currentX + 2, totalY + 12);
  currentX += colWidths[2];
  pdf.text('100%', currentX + 2, totalY + 12);
  currentX += colWidths[3];
  
  const averageYield = portfolio.reduce((sum, item) => 
    sum + (item.yield * item.percentage / 100), 0
  );
  pdf.text(`${averageYield.toFixed(2)}%`, currentX + 2, totalY + 12);
};

const createSimulationPage = (
  pdf: jsPDF,
  portfolio: PortfolioItem[],
  totalInvested: number,
  averageYield: number,
  annualIncome: number,
  monthlyIncome: number,
  clientProfile: ClientProfile | null,
  pageWidth: number,
  pageHeight: number,
  colors: any
) => {
  // Header
  addPageHeader(pdf, 'Simulation Personnalisée', pageWidth, colors);

  // Revenus actuels
  const currentY = 60;
  pdf.setFillColor(240, 253, 244);
  pdf.roundedRect(20, currentY, pageWidth - 40, 50, 8, 8, 'F');
  pdf.setDrawColor(...colors.success);
  pdf.setLineWidth(2);
  pdf.roundedRect(20, currentY, pageWidth - 40, 50, 8, 8, 'S');

  pdf.setTextColor(...colors.success);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('💰 Revenus Estimés (avant fiscalité)', 30, currentY + 18);

  pdf.setTextColor(...colors.dark);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`📅 Revenus mensuels : ${formatCurrency(monthlyIncome)}`, 30, currentY + 35);
  pdf.text(`📊 Revenus annuels : ${formatCurrency(annualIncome)}`, 30, currentY + 48);

  // Projections temporelles
  const projectionY = currentY + 70;
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('📈 Projections d\'Évolution du Capital', 20, projectionY);

  // Tableau des projections avec style moderne
  const tableY = projectionY + 20;
  const projectionData = [
    { years: 1, label: 'Court terme' },
    { years: 5, label: 'Moyen terme' },
    { years: 10, label: 'Long terme' },
    { years: 15, label: 'Très long terme' }
  ];

  // En-têtes
  pdf.setFillColor(...colors.primary);
  pdf.roundedRect(20, tableY, pageWidth - 40, 15, 3, 3, 'F');
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Horizon', 25, tableY + 10);
  pdf.text('Capital Projeté', 70, tableY + 10);
  pdf.text('Plus-Value', 120, tableY + 10);
  pdf.text('Rendement Total', 150, tableY + 10);

  // Données des projections
  projectionData.forEach((proj, index) => {
    const y = tableY + 15 * (index + 1);
    const projectedValue = totalInvested * Math.pow(1 + averageYield / 100, proj.years);
    const plusValue = projectedValue - totalInvested;
    const totalReturn = ((projectedValue / totalInvested) - 1) * 100;

    // Alternance de couleurs
    if (index % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(20, y, pageWidth - 40, 15, 'F');
    }

    pdf.setTextColor(...colors.dark);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${proj.years} an${proj.years > 1 ? 's' : ''} (${proj.label})`, 25, y + 10);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatCurrency(projectedValue), 70, y + 10);
    
    pdf.setTextColor(...colors.success);
    pdf.text(`+${formatCurrency(plusValue)}`, 120, y + 10);
    pdf.text(`+${totalReturn.toFixed(1)}%`, 150, y + 10);
  });

  // Note importante avec style
  const noteY = tableY + 80;
  pdf.setFillColor(255, 248, 220);
  pdf.roundedRect(20, noteY, pageWidth - 40, 40, 5, 5, 'F');
  pdf.setDrawColor(...colors.warning);
  pdf.setLineWidth(1);
  pdf.roundedRect(20, noteY, pageWidth - 40, 40, 5, 5, 'S');

  pdf.setTextColor(...colors.warning);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('⚠️ Avertissement Important', 25, noteY + 15);

  pdf.setTextColor(...colors.dark);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Ces projections sont indicatives et basées sur les performances actuelles.', 25, noteY + 28);
  pdf.text('Les performances passées ne préjugent pas des performances futures.', 25, noteY + 38);

  // Analyse comparative
  if (clientProfile) {
    const analysisY = noteY + 60;
    pdf.setTextColor(...colors.primary);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🎯 Analyse vs Objectifs', 20, analysisY);

    const targetMin = clientProfile.riskProfile.targetYield.min;
    const targetMax = clientProfile.riskProfile.targetYield.max;
    const isInTarget = averageYield >= targetMin && averageYield <= targetMax;

    pdf.setTextColor(...(isInTarget ? colors.success : colors.warning));
    pdf.setFontSize(12);
    pdf.text(`Rendement cible : ${targetMin}% - ${targetMax}%`, 30, analysisY + 20);
    pdf.text(`Rendement obtenu : ${averageYield.toFixed(2)}% ${isInTarget ? '✅ Conforme' : '⚠️ Hors cible'}`, 30, analysisY + 35);
  }
};

const createChartsPage = (
  pdf: jsPDF,
  portfolio: PortfolioItem[],
  pageWidth: number,
  pageHeight: number,
  colors: any
) => {
  // Header
  addPageHeader(pdf, 'Analyse Graphique du Portefeuille', pageWidth, colors);

  if (portfolio.length === 0) {
    pdf.setTextColor(...colors.dark);
    pdf.setFontSize(14);
    pdf.text('Aucune donnée à afficher', 20, 80);
    return;
  }

  // Répartition par SCPI (camembert principal)
  const scpiData = portfolio.map((item, index) => ({
    name: truncateText(item.name, 15),
    value: item.percentage,
    color: getScpiColor(index)
  }));
  
  createSimplePieChart(pdf, '🏢 Répartition par SCPI', scpiData, 20, 70, 80, colors);

  // Répartition sectorielle
  const sectorData = aggregateSectorData(portfolio);
  createSimplePieChart(pdf, '🏭 Répartition Sectorielle', sectorData, 110, 70, 80, colors);

  // Graphique en barres des rendements
  createYieldBarChart(pdf, portfolio, 20, 180, pageWidth - 40, 60, colors);
};

const createCallToActionPage = (
  pdf: jsPDF,
  pageWidth: number,
  pageHeight: number,
  colors: any
) => {
  // Fond élégant
  pdf.setFillColor(248, 250, 252);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header avec logo stylisé
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(38);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MaximusSCPI', pageWidth / 2, 60, { align: 'center' });

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Outils d\'analyse SCPI', pageWidth / 2, 80, { align: 'center' });

  // Titre principal avec émojis
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.dark);
  const titleY = pageHeight * 0.35;
  pdf.text('🚀 Prêt à Concrétiser', pageWidth / 2, titleY, { align: 'center' });
  pdf.text('Votre Projet ?', pageWidth / 2, titleY + 25, { align: 'center' });

  // Texte descriptif
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(75, 85, 99);
  const descY = titleY + 60;
  pdf.text('Un conseiller expert MaximusSCPI peut finaliser', pageWidth / 2, descY, { align: 'center' });
  pdf.text('avec vous cette allocation optimisée.', pageWidth / 2, descY + 20, { align: 'center' });

  // Bouton CTA stylisé
  const buttonY = descY + 50;
  const buttonWidth = 140;
  const buttonHeight = 30;
  const buttonX = (pageWidth - buttonWidth) / 2;

  pdf.setFillColor(...colors.success);
  pdf.roundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8, 8, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('👉 Prendre Rendez-vous', pageWidth / 2, buttonY + 20, { align: 'center' });

  // Informations de contact avec style
  const contactY = buttonY + 60;
  
  // Encadré contact
  pdf.setFillColor(...colors.white);
  pdf.roundedRect(30, contactY, pageWidth - 60, 80, 8, 8, 'F');
  pdf.setDrawColor(...colors.primary);
  pdf.setLineWidth(2);
  pdf.roundedRect(30, contactY, pageWidth - 60, 80, 8, 8, 'S');

  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MaximusSCPI', pageWidth / 2, contactY + 20, { align: 'center' });

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Outils d\'analyse SCPI', pageWidth / 2, contactY + 35, { align: 'center' });

  pdf.setTextColor(...colors.dark);
  pdf.setFontSize(12);
  pdf.text('📧 contact@maximusscpi.fr', pageWidth / 2, contactY + 50, { align: 'center' });
  pdf.text('🌐 https://maximusscpi.fr', pageWidth / 2, contactY + 65, { align: 'center' });

  // Disclaimer légal
  pdf.setFontSize(9);
  pdf.setTextColor(...colors.gray);
  const disclaimerY = pageHeight - 50;
  pdf.text('Les performances passées ne préjugent pas des performances futures. Tout investissement présente un risque de perte en capital.', pageWidth / 2, disclaimerY, { align: 'center' });
  pdf.text('MaximusSCPI - Plateforme d\'analyse SCPI - Document généré automatiquement', pageWidth / 2, disclaimerY + 12, { align: 'center' });
  pdf.text('Conseil en investissement non contractuel - Consultez un professionnel avant tout investissement', pageWidth / 2, disclaimerY + 24, { align: 'center' });
};

// Fonctions utilitaires améliorées

const addPageHeader = (pdf: jsPDF, title: string, pageWidth: number, colors: any) => {
  // Ligne décorative en haut
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, pageWidth, 8, 'F');
  
  // Titre principal
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 20, 35);
  
  // Ligne sous le titre
  pdf.setDrawColor(...colors.primary);
  pdf.setLineWidth(2);
  pdf.line(20, 42, pageWidth - 20, 42);
};

const createMetricBox = (
  pdf: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number[],
  colors: any
) => {
  // Fond de la boîte
  pdf.setFillColor(color[0], color[1], color[2], 0.1);
  pdf.roundedRect(x, y, width, height, 5, 5, 'F');
  
  // Bordure colorée
  pdf.setDrawColor(...color);
  pdf.setLineWidth(2);
  pdf.roundedRect(x, y, width, height, 5, 5, 'S');

  // Label
  pdf.setTextColor(...color);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(label, x + 5, y + 12);

  // Valeur
  pdf.setFontSize(18);
  pdf.text(value, x + 5, y + 28);
};

const createSimplePieChart = (
  pdf: jsPDF,
  title: string,
  data: { name: string; value: number; color: string }[],
  x: number,
  y: number,
  size: number,
  colors: any
) => {
  // Titre
  pdf.setTextColor(...colors.dark);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, x, y - 10);

  if (data.length === 0) return;

  // Simuler un camembert avec des rectangles colorés (approximation)
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const radius = size * 0.3;

  let currentAngle = 0;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  data.forEach((item, index) => {
    const sliceAngle = (item.value / total) * 360;
    
    // Couleur du segment
    const color = hexToRgb(item.color);
    pdf.setFillColor(color.r, color.g, color.b);
    
    // Approximation du segment avec un rectangle
    const segmentX = centerX + Math.cos((currentAngle + sliceAngle/2) * Math.PI / 180) * radius * 0.5;
    const segmentY = centerY + Math.sin((currentAngle + sliceAngle/2) * Math.PI / 180) * radius * 0.5;
    
    pdf.rect(segmentX - 3, segmentY - 3, 6, 6, 'F');
    
    currentAngle += sliceAngle;
  });

  // Légende à droite
  const legendX = x + size + 10;
  data.forEach((item, index) => {
    const legendY = y + (index * 12);
    const color = hexToRgb(item.color);
    
    pdf.setFillColor(color.r, color.g, color.b);
    pdf.rect(legendX, legendY, 4, 4, 'F');
    
    pdf.setTextColor(...colors.dark);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${item.name} (${item.value.toFixed(1)}%)`, legendX + 8, legendY + 3);
  });
};

const createYieldBarChart = (
  pdf: jsPDF,
  portfolio: PortfolioItem[],
  x: number,
  y: number,
  width: number,
  height: number,
  colors: any
) => {
  // Titre
  pdf.setTextColor(...colors.dark);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('📊 Rendements par SCPI', x, y - 10);

  if (portfolio.length === 0) return;

  const maxYield = Math.max(...portfolio.map(item => item.yield), 8); // Minimum 8% pour l'échelle
  const barWidth = Math.min((width - 20) / portfolio.length - 2, 25);
  const chartHeight = height - 25;

  // Axe Y avec graduations
  pdf.setDrawColor(...colors.gray);
  pdf.setLineWidth(1);
  pdf.line(x, y, x, y + chartHeight);
  pdf.line(x, y + chartHeight, x + width, y + chartHeight);

  // Graduations
  for (let i = 0; i <= 4; i++) {
    const yPos = y + chartHeight - (i * chartHeight / 4);
    const value = (i * maxYield / 4);
    
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.line(x, yPos, x + width, yPos);
    
    pdf.setTextColor(...colors.gray);
    pdf.setFontSize(8);
    pdf.text(`${value.toFixed(1)}%`, x - 8, yPos + 1, { align: 'right' });
  }

  // Barres avec couleurs selon performance
  portfolio.forEach((item, index) => {
    const barHeight = (item.yield / maxYield) * chartHeight;
    const barX = x + 10 + (index * (barWidth + 2));
    const barY = y + chartHeight - barHeight;

    // Couleur selon le rendement
    if (item.yield >= 6) {
      pdf.setFillColor(...colors.success);
    } else if (item.yield >= 4) {
      pdf.setFillColor(...colors.primary);
    } else {
      pdf.setFillColor(...colors.warning);
    }

    pdf.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');

    // Bordure
    pdf.setDrawColor(...colors.dark);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'S');

    // Valeur au-dessus
    pdf.setTextColor(...colors.dark);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${item.yield.toFixed(1)}%`, barX + barWidth / 2, barY - 3, { align: 'center' });

    // Nom de la SCPI en bas
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    const shortName = truncateText(item.name, 8);
    pdf.text(shortName, barX + barWidth / 2, y + chartHeight + 12, { align: 'center' });
  });
};

// Fonctions utilitaires

const splitTextToLines = (pdf: jsPDF, text: string, maxWidth: number, fontSize: number): string[] => {
  pdf.setFontSize(fontSize);
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const textWidth = pdf.getTextWidth(testLine);
    
    if (textWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength - 2) + '..' : text;
};

const getSectorIcon = (sector: string): string => {
  const icons: Record<string, string> = {
    'bureaux': '🏢',
    'commerces': '🏬',
    'residentiel': '🏠',
    'sante': '🏥',
    'logistique': '🚚',
    'hotellerie': '🏨',
    'diversifie': '🏗️'
  };
  return icons[sector] || '🏢';
};

const getSectorName = (sector: string): string => {
  const names: Record<string, string> = {
    'bureaux': 'Bureaux',
    'commerces': 'Commerces',
    'residentiel': 'Résidentiel',
    'sante': 'Santé',
    'logistique': 'Logistique',
    'hotellerie': 'Hôtellerie',
    'diversifie': 'Diversifié'
  };
  return names[sector] || 'Diversifié';
};

const getGeoIcon = (geography: string): string => {
  const icons: Record<string, string> = {
    'france': '🇫🇷',
    'europe': '🇪🇺',
    'international': '🌍'
  };
  return icons[geography] || '🇫🇷';
};

const getScpiColor = (index: number): string => {
  const colors = [
    '#0056b3', '#00ccff', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899',
    '#6366f1', '#14b8a6', '#f97316', '#8b5cf6', '#06b6d4'
  ];
  return colors[index % colors.length];
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 86, b: 179 };
};

const aggregateSectorData = (portfolio: PortfolioItem[]) => {
  const sectorMap: Record<string, number> = {};
  
  portfolio.forEach(item => {
    const sectorName = getSectorName(item.sector);
    if (!sectorMap[sectorName]) {
      sectorMap[sectorName] = 0;
    }
    sectorMap[sectorName] += item.percentage;
  });

  return Object.entries(sectorMap)
    .map(([sector, percentage], index) => ({
      name: sector,
      value: percentage,
      color: getScpiColor(index + 10)
    }))
    .sort((a, b) => b.value - a.value);
};

const calculateQualityScore = (portfolio: PortfolioItem[]): number => {
  if (portfolio.length === 0) return 0;
  
  const score = portfolio.reduce((sum, item) => {
    let itemScore = 50; // Score de base
    if (item.tof >= 95) itemScore += 20;
    if (item.isr) itemScore += 15;
    if (item.fees === 0) itemScore += 10;
    if (item.capitalization >= 500000000) itemScore += 5;
    return sum + (itemScore * item.percentage / 100);
  }, 0);
  
  return Math.round(score);
};