import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, ArrowRight, Trash2, X, PieChart, Star, Award, DollarSign, BarChart3, Sliders } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import LoadingSpinner from '../LoadingSpinner';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import EricAvatar from '../EricAvatar';

interface SelectionSidebarProps {
  selectedScpis: SCPIExtended[];
  onRemove: (scpi: SCPIExtended) => void;
  onClear: () => void;
  onVisualize: () => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Diversifiée': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Résidentiel': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Santé': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Bureaux': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Européenne': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Logistique': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };
  return colors[category] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
};

const GRADIENT_IDS = {
  sectors: ['gradBlue', 'gradTeal', 'gradOrange', 'gradPink', 'gradPurple', 'gradCyan', 'gradLime', 'gradRed'],
  geography: ['gradBlue2', 'gradTeal2', 'gradOrange2', 'gradPink2', 'gradPurple2', 'gradCyan2', 'gradLime2', 'gradRed2']
};

const LEGEND_COLORS = {
  sectors: ['#2563eb', '#059669', '#d97706', '#db2777', '#7c3aed', '#0891b2', '#65a30d', '#ea580c'],
  geography: ['#2563eb', '#059669', '#d97706', '#db2777', '#7c3aed', '#0891b2', '#65a30d', '#ea580c']
};

// Calcule la décote/surcote en % à partir du prix et de la valeur de reconstitution
const getDiscountPremium = (scpi: SCPIExtended): { value: number; isDiscount: boolean } | null => {
  if (!scpi.reconstitutionValue || scpi.reconstitutionValue === 0) {
    return null;
  }
  const value = ((scpi.price - scpi.reconstitutionValue) / scpi.reconstitutionValue) * 100;
  return {
    value,
    isDiscount: value < 0
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const cleanName = (name: string): string => {
      return name.replace(/^[\s,\.]+/, '').trim();
    };
    return (
      <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-600 shadow-xl">
        <p className="text-white font-semibold text-sm">{cleanName(payload[0].name)}</p>
        <p className="text-emerald-400 font-bold text-lg">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const SelectionSidebar: React.FC<SelectionSidebarProps> = ({
  selectedScpis,
  onRemove,
  onClear,
  onVisualize
}) => {
  const [isResultOpen, setIsResultOpen] = useState(false);
  
  // États pour le montant et les pourcentages modulables
  const [totalAmount, setTotalAmount] = useState(100000);
  const [scpiPercentages, setScpiPercentages] = useState<Record<string, number>>({});
  
  // Initialiser les pourcentages à parts égales
  useEffect(() => {
    if (selectedScpis.length > 0) {
      const equalPercentage = 100 / selectedScpis.length;
      const initialPercentages: Record<string, number> = {};
      selectedScpis.forEach(scpi => {
        initialPercentages[scpi.id] = equalPercentage;
      });
      setScpiPercentages(initialPercentages);
    }
  }, [selectedScpis]);
  
  // Calculer les montants par SCPI et la performance financière
  const portfolioAnalysis = useMemo(() => {
    if (selectedScpis.length === 0) return null;
    
    const scpiData = selectedScpis.map(scpi => {
      const percentage = scpiPercentages[scpi.id] || 0;
      const amount = (totalAmount * percentage) / 100;
      const annualIncome = (amount * scpi.yield) / 100;
      const monthlyIncome = annualIncome / 12;
      
      return {
        id: scpi.id,
        name: scpi.name,
        percentage,
        amount,
        yield: scpi.yield,
        annualIncome,
        monthlyIncome,
        price: scpi.price,
        minInvestment: scpi.minInvestment,
        parts: Math.floor(amount / scpi.price)
      };
    });
    
    const totalPercentage = Object.values(scpiPercentages).reduce((sum, p) => sum + p, 0);
    const weightedYield = scpiData.reduce((sum, item) => sum + (item.yield * item.percentage / 100), 0);
    const totalAnnualIncome = scpiData.reduce((sum, item) => sum + item.annualIncome, 0);
    const totalMonthlyIncome = totalAnnualIncome / 12;
    
    return {
      scpiData,
      totalAmount,
      totalPercentage,
      weightedYield,
      totalAnnualIncome,
      totalMonthlyIncome
    };
  }, [selectedScpis, scpiPercentages, totalAmount]);
  
  // Fonction pour ajuster un pourcentage
  const updatePercentage = (scpiId: string, newPercentage: number) => {
    const clamped = Math.max(0, Math.min(100, newPercentage));
    setScpiPercentages(prev => ({
      ...prev,
      [scpiId]: clamped
    }));
  };
  
  // Normaliser les pourcentages pour qu'ils totalisent 100%
  const normalizePercentages = () => {
    const total = Object.values(scpiPercentages).reduce((sum, p) => sum + p, 0);
    if (total === 0) return;
    
    const normalized: Record<string, number> = {};
    Object.keys(scpiPercentages).forEach(scpiId => {
      normalized[scpiId] = (scpiPercentages[scpiId] / total) * 100;
    });
    setScpiPercentages(normalized);
  };
  if (selectedScpis.length === 0) {
    return (
      <div className="hidden lg:block lg:w-96 bg-slate-800 border-l border-slate-700 p-6">
        <div className="sticky top-24">
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-slate-700 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Votre Sélection
            </h3>
            <p className="text-sm text-slate-400">
              Cliquez sur "Sélectionner" pour ajouter des SCPI à votre portefeuille
            </p>
          </div>
        </div>
      </div>
    );
  }

  const avgYield = selectedScpis.reduce((sum, s) => sum + s.yield, 0) / selectedScpis.length;
  const minInvestment = selectedScpis.reduce((sum, s) => sum + s.minInvestment, 0);

  // Fonction pour nettoyer les noms (retirer les virgules et points au début)
  const cleanName = (name: string): string => {
    return name.replace(/^[\s,\.]+/, '').trim();
  };

  // Fonction pour normaliser les noms de secteurs (regrouper les variantes)
  const normalizeSectorName = (name: string): string => {
    const cleaned = cleanName(name);
    const lower = cleaned.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Normaliser les accents
    
    // Règles de normalisation par ordre de priorité
    // Hôtellerie / Tourisme / Loisirs
    if (lower.includes('hotel') || lower.includes('hotellerie') || 
        lower.includes('tourisme') || lower.includes('loisir') || 
        lower.includes('seminaire') || lower.includes('séminaire')) {
      return 'Hôtels, tourisme, loisirs';
    }
    
    // Santé & Éducation
    if ((lower.includes('sante') || lower.includes('santé')) && 
        (lower.includes('education') || lower.includes('éducation') || lower.includes('enseignement'))) {
      return 'Santé et éducation';
    }
    if (lower.includes('sante') || lower.includes('santé')) {
      // Si c'est juste "Santé", on garde tel quel ou on regroupe selon le contexte
      // Pour l'instant, on regroupe avec "Santé et éducation" si on trouve aussi "éducation" ailleurs
      return 'Santé et éducation';
    }
    if (lower.includes('education') || lower.includes('éducation') || lower.includes('enseignement')) {
      return 'Santé et éducation';
    }
    
    // Logistique
    if (lower.includes('logistique') || lower.includes('entrepot') || 
        lower.includes('entrepôt') || lower.includes('activite') || 
        lower.includes('activité') || lower.includes('transport')) {
      return 'Logistique et locaux d\'activités';
    }
    
    // Commerces
    if (lower.includes('commerce')) {
      return 'Commerces';
    }
    
    // Bureaux
    if (lower.includes('bureau') && !lower.includes('commerce')) {
      return 'Bureaux';
    }
    
    // Résidentiel
    if (lower.includes('residentiel') || lower.includes('résidentiel') || 
        lower.includes('logement') || lower.includes('habitation')) {
      return 'Résidentiel';
    }
    
    // Si pas de correspondance, retourner le nom nettoyé avec première lettre en majuscule
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  };

  // Liste des termes géographiques à exclure de la répartition sectorielle
  const geoKeywords = ['france', 'paris', 'région', 'europe', 'espagne', 'allemagne', 'italie',
    'royaume', 'pays', 'belgique', 'portugal', 'étranger', 'international', 'idf', 'ile-de-france',
    'atlantique', 'parisienne', 'dorsale', 'métropol', 'irlande', 'pologne', 'uk', 'pays-bas',
    'netherlands', 'hollande', 'suisse', 'luxembourg', 'autriche', 'grèce', 'danemark', 'suède',
    'norvège', 'finlande', 'tchéquie', 'hongrie', 'roumanie', 'bulgarie', 'croatie', 'slovénie'];

  const isGeographicName = (name: string): boolean => {
    const lowerName = name.toLowerCase();
    return geoKeywords.some(keyword => lowerName.includes(keyword));
  };

  // Calcul des répartitions agrégées du portefeuille (sans doublons)
  const calculateAggregatedSectors = () => {
    const sectorMap: Record<string, number> = {};
    const weightPerScpi = 100 / selectedScpis.length; // Répartition égale par défaut

    selectedScpis.forEach(scpi => {
      if (scpi.sectors && scpi.sectors.length > 0) {
        scpi.sectors.forEach(sector => {
          // Exclure les noms géographiques de la répartition sectorielle
          if (isGeographicName(sector.name)) return;
          
          const normalizedName = normalizeSectorName(sector.name);
          if (!sectorMap[normalizedName]) {
            sectorMap[normalizedName] = 0;
          }
          // Pondérer par le poids de la SCPI dans le portefeuille
          sectorMap[normalizedName] += (sector.value * weightPerScpi) / 100;
        });
      }
    });

    return Object.entries(sectorMap)
      .map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const calculateAggregatedGeography = () => {
    const geoMap: Record<string, number> = {};
    const weightPerScpi = 100 / selectedScpis.length; // Répartition égale par défaut

    selectedScpis.forEach(scpi => {
      if (scpi.geography && scpi.geography.length > 0) {
        scpi.geography.forEach(geo => {
          const cleanGeoName = cleanName(geo.name);
          if (!geoMap[cleanGeoName]) {
            geoMap[cleanGeoName] = 0;
          }
          // Pondérer par le poids de la SCPI dans le portefeuille
          geoMap[cleanGeoName] += (geo.value * weightPerScpi) / 100;
        });
      }
    });

    return Object.entries(geoMap)
      .map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const aggregatedSectors = calculateAggregatedSectors();
  const aggregatedGeography = calculateAggregatedGeography();

  // Calcul de l'avis Maximusscpi sur la sélection
  const calculateMaximusAvis = () => {
    // Score de répartition sectorielle (0-5 étoiles)
    // Plus il y a de secteurs différents, mieux c'est (max 5 secteurs = 5 étoiles)
    const sectorDiversityScore = Math.min(aggregatedSectors.length / 1, 5);
    
    // Score de répartition géographique (0-5 étoiles)
    // Plus il y a de zones différentes, mieux c'est (max 5 zones = 5 étoiles)
    const geoDiversityScore = Math.min(aggregatedGeography.length / 1, 5);
    
    // Score de performance (0-5 étoiles basé sur le rendement moyen)
    // 3% = 2 étoiles, 4% = 3 étoiles, 5% = 4 étoiles, 6%+ = 5 étoiles
    let performanceScore = 0;
    if (avgYield >= 6) performanceScore = 5;
    else if (avgYield >= 5) performanceScore = 4;
    else if (avgYield >= 4) performanceScore = 3;
    else if (avgYield >= 3) performanceScore = 2;
    else performanceScore = 1;
    
    // Score de liquidité (0-5 étoiles basé sur le TOF moyen)
    const avgTof = selectedScpis.reduce((sum, s) => sum + (s.tof || 0), 0) / selectedScpis.length;
    let liquidityScore = 0;
    if (avgTof >= 95) liquidityScore = 5;
    else if (avgTof >= 92) liquidityScore = 4;
    else if (avgTof >= 90) liquidityScore = 3;
    else if (avgTof >= 85) liquidityScore = 2;
    else liquidityScore = 1;
    
    // Score de diversification (0-5 étoiles basé sur le nombre de SCPI)
    // Plus il y a de SCPI, mieux c'est (max 5 SCPI = 5 étoiles)
    const diversificationScore = Math.min(selectedScpis.length, 5);
    
    // Score de risque (0-5 étoiles, inversé : moins de risque = plus d'étoiles)
    // Basé sur la concentration : si un secteur représente >50%, risque plus élevé
    const maxSectorWeight = aggregatedSectors.length > 0 ? aggregatedSectors[0].value : 0;
    let riskScore = 5;
    if (maxSectorWeight > 60) riskScore = 2;
    else if (maxSectorWeight > 50) riskScore = 3;
    else if (maxSectorWeight > 40) riskScore = 4;
    else riskScore = 5;
    
    // Calcul de la note globale avec pondération
    // Pondération : Risque (1.3x), Liquidité (1.2x), Diversification (1.2x), autres (1.0x)
    const weightedSum = 
      sectorDiversityScore * 1.0 +
      geoDiversityScore * 1.0 +
      performanceScore * 1.0 +
      liquidityScore * 1.2 +  // Pondéré à 1.2x
      diversificationScore * 1.2 +  // Pondéré à 1.2x
      riskScore * 1.3;  // Pondéré à 1.3x
    
    const weightedMax = 5 * (1.0 + 1.0 + 1.0 + 1.2 + 1.2 + 1.3); // Somme des poids max
    const overall = Math.round((weightedSum / weightedMax) * 5);

    return {
      sectorDiversity: Math.round(sectorDiversityScore),
      geoDiversity: Math.round(geoDiversityScore),
      performance: performanceScore,
      liquidity: Math.round(liquidityScore),
      diversification: diversificationScore,
      risk: riskScore,
      overall: Math.max(1, Math.min(5, overall)) // Entre 1 et 5
    };
  };

  const maximusAvis = calculateMaximusAvis();

  // Analyse professionnelle CIF/CGP : Avantages et Inconvénients
  const analyzePortfolioProsCons = () => {
    const pros: string[] = [];
    const cons: string[] = [];
    
    // Analyse de la diversification
    if (selectedScpis.length >= 4) {
      pros.push('Diversification optimale avec plusieurs SCPI, réduisant significativement le risque de concentration');
    } else if (selectedScpis.length >= 2) {
      pros.push('Diversification correcte permettant de limiter l\'exposition au risque spécifique d\'une seule SCPI');
    } else {
      cons.push('Concentration sur une seule SCPI : risque spécifique non diversifié, recommandation d\'ajouter au moins 2-3 SCPI supplémentaires');
    }
    
    // Analyse sectorielle
    if (aggregatedSectors.length >= 4) {
      pros.push('Excellente diversification sectorielle couvrant plusieurs segments de l\'immobilier, résilience accrue face aux cycles économiques');
    } else if (aggregatedSectors.length >= 2) {
      pros.push('Diversification sectorielle correcte, mais pourrait être améliorée pour une meilleure résilience');
    } else {
      cons.push('Concentration sectorielle importante : exposition accrue aux risques spécifiques du secteur, diversification recommandée');
    }
    
    // Analyse géographique
    const hasEurope = aggregatedGeography.some(g => g.name.toLowerCase().includes('europe') || g.name.toLowerCase().includes('européen'));
    const hasFrance = aggregatedGeography.some(g => g.name.toLowerCase().includes('france') || g.name.toLowerCase().includes('français'));
    
    if (aggregatedGeography.length >= 3) {
      pros.push('Exposition géographique diversifiée, réduction du risque géopolitique et économique local');
    } else if (hasEurope && hasFrance) {
      pros.push('Répartition France/Europe équilibrée, bonne exposition aux marchés européens');
    } else if (hasEurope) {
      pros.push('Exposition européenne intéressante pour la diversification géographique');
    } else {
      cons.push('Concentration géographique sur la France : considérer une exposition européenne pour réduire le risque pays');
    }
    
    // Analyse du rendement
    if (avgYield >= 6) {
      pros.push(`Rendement moyen attractif (${avgYield.toFixed(2)}%), supérieur à la moyenne du marché SCPI`);
    } else if (avgYield >= 5) {
      pros.push(`Rendement moyen correct (${avgYield.toFixed(2)}%), aligné avec les standards du marché`);
    } else if (avgYield >= 4) {
      cons.push(`Rendement moyen modéré (${avgYield.toFixed(2)}%) : envisager l'ajout de SCPI à rendement plus élevé pour optimiser la performance`);
    } else {
      cons.push(`Rendement moyen faible (${avgYield.toFixed(2)}%) : portefeuille sous-performant, révision de la sélection recommandée`);
    }
    
    // Analyse de la liquidité
    const avgTof = selectedScpis.reduce((sum, s) => sum + (s.tof || 0), 0) / selectedScpis.length;
    if (avgTof >= 95) {
      pros.push('Excellent taux d\'occupation financier moyen, signe de qualité de gestion et de résilience locative');
    } else if (avgTof >= 90) {
      pros.push('Taux d\'occupation financier correct, portefeuille bien géré');
    } else if (avgTof >= 85) {
      cons.push('Taux d\'occupation financier moyen : vigilance sur la qualité locative, certains actifs pourraient nécessiter un suivi renforcé');
    } else {
      cons.push('Taux d\'occupation financier faible : risque de vacance locative élevé, révision de la sélection recommandée');
    }
    
    // Analyse de la concentration
    const maxSectorWeight = aggregatedSectors.length > 0 ? aggregatedSectors[0].value : 0;
    if (maxSectorWeight > 60) {
      cons.push(`Concentration sectorielle élevée (${maxSectorWeight.toFixed(1)}% sur un seul secteur) : risque de corrélation élevée en cas de crise sectorielle`);
    } else if (maxSectorWeight > 50) {
      cons.push(`Concentration sectorielle modérée (${maxSectorWeight.toFixed(1)}%) : considérer une meilleure répartition pour réduire le risque`);
    } else {
      pros.push('Répartition sectorielle équilibrée, bonne diversification des risques');
    }
    
    // Analyse fiscale et structure
    const hasResidential = aggregatedSectors.some(s => s.name.toLowerCase().includes('résidentiel') || s.name.toLowerCase().includes('residentiel'));
    const hasCommercial = aggregatedSectors.some(s => s.name.toLowerCase().includes('commerce') || s.name.toLowerCase().includes('bureau'));
    
    if (hasResidential && hasCommercial) {
      pros.push('Mix résidentiel/commercial équilibré, optimisation fiscale et diversification des revenus locatifs');
    }
    
    // Analyse du nombre de parts et investissement minimum
    if (minInvestment > 50000) {
      cons.push(`Investissement minimum total élevé (${minInvestment.toLocaleString('fr-FR')}€) : barrière à l'entrée importante, considérer des SCPI avec des montants minimums plus faibles`);
    }
    
    // Analyse de la maturité et capitalisation
    const avgCapitalization = selectedScpis
      .filter(s => s.capitalization)
      .reduce((sum, s) => {
        const cap = typeof s.capitalization === 'string' ? parseFloat(s.capitalization.replace(/[^\d,]/g, '').replace(',', '.')) : 0;
        return sum + cap;
      }, 0) / selectedScpis.filter(s => s.capitalization).length;
    
    if (avgCapitalization > 500) {
      pros.push('SCPI de grande taille en moyenne, signe de stabilité et de capacité de diversification interne');
    }
    
    // Analyse des frais et performance
    const hasHighYield = selectedScpis.some(s => s.yield >= 6);
    if (hasHighYield) {
      pros.push('Présence de SCPI à rendement élevé, potentiel de performance intéressant');
    }
    
    // Analyse du risque de change (si européennes)
    if (hasEurope && !hasFrance) {
      cons.push('Exposition uniquement européenne : risque de change EUR présent, considérer une part française pour équilibrer');
    }
    
    // Analyse de la liquidité secondaire
    const hasLowLiquidity = selectedScpis.some(s => (s.tof || 0) < 85);
    if (hasLowLiquidity) {
      cons.push('Certaines SCPI présentent un TOF faible : risque de liquidité sur le marché secondaire, délais de revente potentiellement allongés');
    }
    
    // Recommandation générale
    if (selectedScpis.length < 3) {
      cons.push('Portefeuille sous-diversifié : recommandation d\'ajouter 2 à 4 SCPI supplémentaires pour optimiser le ratio risque/rendement');
    }
    
    return { pros, cons };
  };

  const portfolioProsCons = analyzePortfolioProsCons();

  return (
    <div className="hidden lg:block lg:w-96 bg-gradient-to-b from-slate-800 to-slate-900 border-l border-slate-700 p-6">
      <div className="sticky top-24">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white">
              Ma Sélection
            </h3>
            <button
              onClick={onClear}
              className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
              title="Vider la sélection"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-slate-400">
            {selectedScpis.length} SCPI sélectionnée{selectedScpis.length > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Jusqu’à <span className="font-semibold text-slate-300">6 SCPI</span> maximum dans votre portefeuille.
          </p>
        </div>

        <div className="space-y-3 mb-6 max-h-[calc(100vh-450px)] overflow-y-auto">
          {selectedScpis.map(scpi => (
            <div
              key={scpi.id}
              className="bg-slate-900 rounded-lg p-4 border-2 border-emerald-500/30 hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm">{scpi.name}</h4>
                  <p className="text-xs text-slate-400">{scpi.managementCompany}</p>
                </div>
                <button
                  onClick={() => onRemove(scpi)}
                  className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Rendement</p>
                  <p className="text-lg font-bold text-emerald-400">{scpi.yield.toFixed(2)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Prix</p>
                  <p className="text-sm font-semibold text-white">{scpi.price}€</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-emerald-500/10 rounded-lg p-4 mb-4 border border-emerald-500/30">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-emerald-400 font-medium mb-1">Rendement moyen</p>
              <p className="text-xl font-bold text-emerald-400">
                {avgYield.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-400 font-medium mb-1">Investissement min.</p>
              <p className="text-xl font-bold text-emerald-400">
                {minInvestment.toLocaleString('fr-FR')}€
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsResultOpen(true)}
          className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-bold text-base shadow-lg shadow-orange-500/30 hover:shadow-xl hover:from-orange-700 hover:to-orange-600 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <span>Valider ma sélection</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-xs text-center text-slate-500 mt-4">
          Finalisez votre souscription en quelques étapes
        </p>
      </div>

      {/* Pop-up de résultat de la sélection */}
      {isResultOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-700 shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-4 border-b border-slate-700 flex-shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-white">Résultat de votre sélection</h2>
              <button
                onClick={() => setIsResultOpen(false)}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              {/* Avis Maximusscpi */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-emerald-500/30 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="flex-shrink-0">
                    <EricAvatar size={40} className="sm:w-12 sm:h-12 ring-2 ring-emerald-500/50" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">Avis Maximusscpi</h3>
                    <p className="text-[10px] sm:text-xs text-slate-300">Évaluation de votre sélection</p>
                  </div>
                </div>
                
                {/* Note globale */}
                <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-300">Note globale</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < maximusAvis.overall
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-slate-600 fill-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 italic mb-1">
                    Note globale issue d'une analyse multicritères pondérée.
                  </p>
                  <p className="text-xs text-slate-300">
                    {maximusAvis.overall >= 4
                      ? 'Excellente sélection, portefeuille bien équilibré'
                      : maximusAvis.overall >= 3
                      ? 'Bonne sélection avec quelques points d\'amélioration possibles'
                      : 'Sélection correcte, envisagez d\'ajouter plus de diversification'}
                  </p>
                </div>

                {/* Critères détaillés */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Répartition sectorielle</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < maximusAvis.sectorDiversity
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-slate-600 fill-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Répartition géographique</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < maximusAvis.geoDiversity
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-slate-600 fill-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-300">Potentiel de rendement</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < maximusAvis.performance
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-slate-600 fill-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-300 italic">Indicateur basé sur des données historiques, non garanti.</p>
                  </div>
                  <div className="flex items-center justify-between group relative">
                    <span className="text-xs text-slate-300 cursor-help">
                      Liquidité
                      <span className="ml-1 text-[10px] text-slate-300">ℹ️</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < maximusAvis.liquidity
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-slate-600 fill-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 text-xs text-slate-300">
                      <p className="font-semibold mb-2 text-white">Évaluation de la liquidité</p>
                      <p className="mb-1">Basée sur le taux d'occupation financier (TOF) moyen.</p>
                      <p className="text-slate-300 italic">La liquidité SCPI dépend également de :</p>
                      <ul className="list-disc list-inside mt-1 text-slate-300 space-y-0.5">
                        <li>Délai de jouissance</li>
                        <li>Mutualisation locative</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Diversification</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < maximusAvis.diversification
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-slate-600 fill-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Maîtrise du risque</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < maximusAvis.risk
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-slate-600 fill-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Avantages et Inconvénients - Analyse CIF/CGP */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-700">
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Analyse professionnelle : </span>Avantages et Inconvénients
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Avantages */}
                    <div className="bg-emerald-500/10 rounded-lg p-3 sm:p-4 border border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400"></div>
                        <h5 className="text-xs sm:text-sm font-bold text-emerald-400">Points forts</h5>
                      </div>
                      {portfolioProsCons.pros.length > 0 ? (
                        <ul className="space-y-1.5 sm:space-y-2">
                          {portfolioProsCons.pros.map((pro, index) => (
                            <li key={index} className="text-[10px] sm:text-xs text-slate-300 flex items-start gap-1.5 sm:gap-2">
                              <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">✓</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[10px] sm:text-xs text-slate-400 italic">Aucun point fort identifié</p>
                      )}
                    </div>
                    
                    {/* Inconvénients */}
                    <div className="bg-amber-500/10 rounded-lg p-3 sm:p-4 border border-amber-500/30">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400"></div>
                        <h5 className="text-xs sm:text-sm font-bold text-amber-400">Points d'attention</h5>
                      </div>
                      {portfolioProsCons.cons.length > 0 ? (
                        <ul className="space-y-1.5 sm:space-y-2">
                          {portfolioProsCons.cons.map((con, index) => (
                            <li key={index} className="text-[10px] sm:text-xs text-slate-300 flex items-start gap-1.5 sm:gap-2">
                              <span className="text-amber-400 mt-0.5 sm:mt-1 flex-shrink-0">⚠</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[10px] sm:text-xs text-slate-400 italic">Aucun point d'attention identifié</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-[9px] sm:text-[10px] text-slate-400 italic leading-relaxed">
                      <strong className="text-slate-300">Note :</strong> Cette analyse est basée sur les caractéristiques objectives du portefeuille sélectionné. 
                      Elle ne constitue pas un conseil personnalisé en investissement. 
                      Un conseiller certifié ORIAS analysera votre situation personnelle avant toute décision.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Bloc Montant à investir et Performance financière */}
              {portfolioAnalysis && (
                <div className="bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-slate-700 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Sliders className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                    <h3 className="text-base sm:text-lg font-bold text-white">Configuration du portefeuille</h3>
                  </div>
                  
                  {/* Montant total à investir */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5 sm:mb-2">
                      Montant total à investir
                    </label>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <input
                        type="number"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-base sm:text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        min="0"
                        step="1000"
                      />
                      <span className="text-slate-400 font-semibold text-sm sm:text-base">€</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                      {[50000, 100000, 150000, 200000, 300000].map(amount => (
                        <button
                          key={amount}
                          onClick={() => setTotalAmount(amount)}
                          className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded-lg transition-colors ${
                            totalAmount === amount
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {amount.toLocaleString('fr-FR')}€
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Performance financière du portefeuille */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-slate-900 rounded-lg p-2.5 sm:p-4 border border-slate-700">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                        <p className="text-[10px] sm:text-xs text-slate-400">Rendement moyen pondéré</p>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-400">
                        {portfolioAnalysis.weightedYield.toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-2.5 sm:p-4 border border-slate-700">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                        <p className="text-[10px] sm:text-xs text-slate-400">Revenus annuels estimés</p>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-blue-400">
                        {portfolioAnalysis.totalAnnualIncome.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€
                      </p>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-2.5 sm:p-4 border border-slate-700">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                        <p className="text-[10px] sm:text-xs text-slate-400">Revenus mensuels estimés</p>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-purple-400">
                        {portfolioAnalysis.totalMonthlyIncome.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€
                      </p>
                    </div>
                  </div>
                  
                  {/* Graphique de performance par SCPI */}
                  <div className="mb-4 sm:mb-6">
                    <h4 className="text-xs sm:text-sm font-bold text-white mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                      <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                      Revenus annuels par SCPI
                    </h4>
                    <div className="bg-slate-900 rounded-lg p-2 sm:p-4 border border-slate-700">
                      <ResponsiveContainer width="100%" height={150} className="sm:h-[200px]">
                        <BarChart data={portfolioAnalysis.scpiData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            label={{ value: '€', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            formatter={(value: number) => [`${value.toLocaleString('fr-FR')}€`, 'Revenus annuels']}
                          />
                          <Bar dataKey="annualIncome" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Répartition modulable par SCPI */}
                  <div>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2">
                        <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                        Répartition du portefeuille (%)
                      </h4>
                      <button
                        onClick={normalizePercentages}
                        className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-600/20 text-emerald-400 rounded-lg hover:bg-emerald-600/30 transition-colors"
                      >
                        Normaliser
                      </button>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {portfolioAnalysis.scpiData.map((item, index) => {
                        const scpi = selectedScpis.find(s => s.id === item.id);
                        if (!scpi) return null;
                        
                        return (
                          <div key={item.id} className="bg-slate-900 rounded-lg p-2.5 sm:p-4 border border-slate-700">
                            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="text-xs sm:text-sm font-semibold text-white truncate">{scpi.name}</p>
                                <p className="text-[10px] sm:text-xs text-slate-400">
                                  {item.amount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€ 
                                  {' • '}
                                  {item.parts} part{item.parts > 1 ? 's' : ''}
                                  {' • '}
                                  {item.yield.toFixed(2)}%
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-base sm:text-lg font-bold text-emerald-400">{item.percentage.toFixed(1)}%</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={item.percentage}
                                onChange={(e) => {
                                  const newValue = parseFloat(e.target.value);
                                  updatePercentage(item.id, newValue);
                                }}
                                className="flex-1 h-1.5 sm:h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                              />
                              <input
                                type="number"
                                value={item.percentage.toFixed(1)}
                                onChange={(e) => {
                                  const newValue = parseFloat(e.target.value) || 0;
                                  updatePercentage(item.id, newValue);
                                }}
                                className="w-16 sm:w-20 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-800 border border-slate-600 rounded text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                min="0"
                                max="100"
                                step="0.1"
                              />
                              <span className="text-slate-400 text-xs sm:text-sm w-4 sm:w-6">%</span>
                            </div>
                            <div className="mt-1.5 sm:mt-2 h-0.5 sm:h-1 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {portfolioAnalysis.totalPercentage !== 100 && (
                      <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-[10px] sm:text-xs text-yellow-400">
                          ⚠️ Total: {portfolioAnalysis.totalPercentage.toFixed(1)}% 
                          {portfolioAnalysis.totalPercentage < 100 
                            ? ` (${(100 - portfolioAnalysis.totalPercentage).toFixed(1)}% non alloué)`
                            : ` (${(portfolioAnalysis.totalPercentage - 100).toFixed(1)}% en trop)`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Graphique camembert de répartition par SCPI */}
                  <div className="mt-4 sm:mt-6">
                    <h4 className="text-xs sm:text-sm font-bold text-white mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                      <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                      Répartition visuelle du portefeuille
                    </h4>
                    <div className="bg-slate-900 rounded-lg p-2 sm:p-4 border border-slate-700">
                      <div className="relative">
                        <ResponsiveContainer width="100%" height={200} className="sm:h-[300px]">
                          <RechartsPie>
                            <defs>
                              {portfolioAnalysis.scpiData.map((_, index) => {
                                const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
                                return (
                                  <linearGradient key={`grad-${index}`} id={`gradScpi-${index}`} x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={1} />
                                    <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.7} />
                                  </linearGradient>
                                );
                              })}
                            </defs>
                            <Pie
                              data={portfolioAnalysis.scpiData}
                              cx="50%"
                              cy="50%"
                              innerRadius="40%"
                              outerRadius="80%"
                              paddingAngle={2}
                              dataKey="percentage"
                              animationBegin={0}
                              animationDuration={800}
                            >
                              {portfolioAnalysis.scpiData.map((entry, index) => (
                                <Cell
                                  key={`cell-${entry.id}`}
                                  fill={`url(#gradScpi-${index})`}
                                  stroke="#1e293b"
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-600 shadow-xl">
                                      <p className="text-white font-semibold text-sm">{data.name}</p>
                                      <p className="text-emerald-400 font-bold">{data.percentage.toFixed(1)}%</p>
                                      <p className="text-slate-300 text-xs mt-1">
                                        {data.amount.toLocaleString('fr-FR')}€ • {data.parts} part{data.parts > 1 ? 's' : ''}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </RechartsPie>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                          <div className="text-xl sm:text-3xl font-bold text-white">{portfolioAnalysis.totalAmount.toLocaleString('fr-FR')}</div>
                          <div className="text-[10px] sm:text-xs text-slate-300">€ investis</div>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 max-h-32 sm:max-h-40 overflow-y-auto">
                        {portfolioAnalysis.scpiData.map((item, index) => {
                          const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
                          return (
                            <div key={item.id} className="flex items-center justify-between text-[10px] sm:text-xs">
                              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                                <div
                                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: colors[index % colors.length] }}
                                />
                                <span className="text-slate-300 truncate">{item.name}</span>
                              </div>
                              <span className="font-semibold text-white flex-shrink-0 ml-2">{item.percentage.toFixed(1)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-300">
                Vous avez sélectionné <span className="font-semibold text-white">{selectedScpis.length} SCPI</span>.
                Voici un récapitulatif avant de commencer votre souscription en ligne.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-slate-800 rounded-lg p-2.5 sm:p-4 border border-slate-700">
                  <p className="text-[10px] sm:text-xs text-slate-300 mb-1">Rendement moyen estimé</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-400">{avgYield.toFixed(2)}%</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-2.5 sm:p-4 border border-slate-700">
                  <p className="text-[10px] sm:text-xs text-slate-300 mb-1">Investissement minimal estimé</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-400">
                    {minInvestment.toLocaleString('fr-FR')}€
                  </p>
                </div>
              </div>

              {/* Répartitions agrégées du portefeuille */}
              {aggregatedSectors.length > 0 && aggregatedGeography.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Répartition Sectorielle Agregée */}
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-blue-400" />
                      Répartition Sectorielle du Portefeuille
                    </h3>
                    <div className="relative">
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsPie>
                          <defs>
                            <linearGradient id="gradBlue-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                              <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="gradTeal-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                              <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="gradOrange-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                              <stop offset="100%" stopColor="#d97706" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="gradPink-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#f472b6" stopOpacity={1} />
                              <stop offset="100%" stopColor="#db2777" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="gradPurple-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                              <stop offset="100%" stopColor="#7c3aed" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="gradCyan-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#22d3ee" stopOpacity={1} />
                              <stop offset="100%" stopColor="#0891b2" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="gradLime-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#a3e635" stopOpacity={1} />
                              <stop offset="100%" stopColor="#65a30d" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="gradRed-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#fb923c" stopOpacity={1} />
                              <stop offset="100%" stopColor="#ea580c" stopOpacity={1} />
                            </linearGradient>
                          </defs>
                          <Pie
                            data={aggregatedSectors}
                            cx="50%"
                            cy="50%"
                            innerRadius="50%"
                            outerRadius="85%"
                            paddingAngle={0}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                            animationEasing="ease-out"
                          >
                            {aggregatedSectors.map((entry, index) => (
                              <Cell
                                key={`cell-sector-portfolio-${index}`}
                                fill={`url(#${['gradBlue', 'gradTeal', 'gradOrange', 'gradPink', 'gradPurple', 'gradCyan', 'gradLime', 'gradRed'][index % 8]}-portfolio)`}
                                stroke="#1e293b"
                                strokeWidth={2}
                                style={{ outline: 'none' }}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </RechartsPie>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <div className="text-2xl font-bold text-white">{aggregatedSectors.length}</div>
                        <div className="text-xs text-slate-300">secteurs</div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1.5 max-h-32 overflow-y-auto">
                      {aggregatedSectors.map((sector, index) => (
                        <div key={sector.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor: LEGEND_COLORS.sectors[index % LEGEND_COLORS.sectors.length]
                              }}
                            ></div>
                            <span className="text-slate-300 truncate">{sector.name}</span>
                          </div>
                          <span className="font-semibold text-white">{sector.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Répartition Géographique Agregée */}
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-green-400" />
                      Répartition Géographique du Portefeuille
                    </h3>
                    <div className="relative">
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsPie>
                          <defs>
                            <linearGradient id="gradBlue2-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                              <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="gradTeal2-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                              <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="gradOrange2-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                              <stop offset="100%" stopColor="#d97706" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="gradPink2-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#f472b6" stopOpacity={1} />
                              <stop offset="100%" stopColor="#db2777" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="gradPurple2-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                              <stop offset="100%" stopColor="#7c3aed" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="gradCyan2-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#22d3ee" stopOpacity={1} />
                              <stop offset="100%" stopColor="#0891b2" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="gradLime2-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#a3e635" stopOpacity={1} />
                              <stop offset="100%" stopColor="#65a30d" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="gradRed2-portfolio" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#fb923c" stopOpacity={1} />
                              <stop offset="100%" stopColor="#ea580c" stopOpacity={1} />
                            </linearGradient>
                          </defs>
                          <Pie
                            data={aggregatedGeography}
                            cx="50%"
                            cy="50%"
                            innerRadius="50%"
                            outerRadius="85%"
                            paddingAngle={0}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                            animationEasing="ease-out"
                          >
                            {aggregatedGeography.map((entry, index) => (
                              <Cell
                                key={`cell-geo-portfolio-${index}`}
                                fill={`url(#${['gradBlue2', 'gradTeal2', 'gradOrange2', 'gradPink2', 'gradPurple2', 'gradCyan2', 'gradLime2', 'gradRed2'][index % 8]}-portfolio)`}
                                stroke="#1e293b"
                                strokeWidth={2}
                                style={{ outline: 'none' }}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </RechartsPie>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <div className="text-2xl font-bold text-white">{aggregatedGeography.length}</div>
                        <div className="text-xs text-slate-300">zones</div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1.5 max-h-32 overflow-y-auto">
                      {aggregatedGeography.map((geo, index) => (
                        <div key={geo.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor: LEGEND_COLORS.geography[index % LEGEND_COLORS.geography.length]
                              }}
                            ></div>
                            <span className="text-slate-300 truncate">{geo.name}</span>
                          </div>
                          <span className="font-semibold text-white">{geo.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-xs text-slate-300 mb-3">Détail de votre sélection</p>
                <div className="space-y-3">
                  {selectedScpis.map(scpi => (
                    <div
                      key={scpi.id}
                      className="rounded-lg border border-slate-700 bg-slate-900/60 p-3"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-sm font-semibold text-white">{scpi.name}</p>
                          <p className="text-xs text-slate-300">{scpi.managementCompany}</p>
                        </div>
                        <span
                          className={`inline-block px-2 py-1 rounded-lg text-[10px] font-semibold border ${getCategoryColor(
                            scpi.category
                          )}`}
                        >
                          {scpi.category}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-[11px] text-slate-300 mb-4">
                        <div>
                          <p className="text-[10px] text-slate-300">Rendement</p>
                          <p className="font-semibold text-emerald-400">
                            {scpi.yield.toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-300">Prix de part</p>
                          <p className="font-semibold text-white">{scpi.price}€</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-300">Invest. min.</p>
                          <p className="font-semibold text-white">
                            {scpi.minInvestment.toLocaleString('fr-FR')}€
                          </p>
                        </div>
                        {scpi.capitalization && (
                          <div>
                            <p className="text-[10px] text-slate-300">Capitalisation</p>
                            <p className="font-semibold text-white">{scpi.capitalization}</p>
                          </div>
                        )}
                        {typeof scpi.tof === 'number' && (
                          <div>
                            <p className="text-[10px] text-slate-300">Taux d'occupation</p>
                            <p className="font-semibold text-white">{scpi.tof.toFixed(1)}%</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] text-slate-300">Horizon recommandé</p>
                          <p className="font-semibold text-white">10 ans</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-300">Distribution</p>
                          <p className="font-semibold text-white">Trimestriel</p>
                        </div>
                        {scpi.reconstitutionValue && (
                          <div>
                            <p className="text-[10px] text-slate-300">Valeur reconstitution</p>
                            <p className="font-semibold text-white">{scpi.reconstitutionValue}€</p>
                          </div>
                        )}
                        {typeof scpi.ltv === 'number' && (
                          <div>
                            <p className="text-[10px] text-slate-300">Endettement</p>
                            <p className="font-semibold text-white">{scpi.ltv}%</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] text-slate-300">Nombre d'immeubles</p>
                          <p className="font-semibold text-white">
                            {typeof scpi.assetsCount === 'number' ? scpi.assetsCount : 'N/A'}
                          </p>
                        </div>
                        {getDiscountPremium(scpi) && (
                          <div>
                            <p className="text-[10px] text-slate-300">Décote / Surcote</p>
                            {(() => {
                              const info = getDiscountPremium(scpi);
                              if (!info) return null;
                              const label = info.isDiscount ? 'Décote' : 'Surcote';
                              return (
                                <p className={`font-semibold ${info.isDiscount ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {info.value > 0 ? '+' : ''}
                                  {info.value.toFixed(1)}%
                                  <span className="text-[10px] text-slate-300 ml-1">({label})</span>
                                </p>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-300">
                Ce récapitulatif est indicatif et ne constitue pas un conseil personnalisé. Votre projet sera
                analysé avec un conseiller avant toute décision.
              </p>
            </div>

            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-700 flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => setIsResultOpen(false)}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                Revenir au comparateur
              </button>
              <button
                onClick={() => {
                  setIsResultOpen(false);
                  window.history.pushState({ scpis: selectedScpis }, '', '/souscription');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
              >
                Commencer ma souscription
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SelectionSidebar;
