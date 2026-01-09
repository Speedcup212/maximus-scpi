import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle, Shield, TrendingUp, Info, BarChart3, Building, PieChart as PieChartIcon, DollarSign, Calendar, MessageCircle, ArrowRight, Phone } from 'lucide-react';
import { PortfolioRecommendation, GuidedJourneyAnswers } from '../../types/guidedJourney';
import { Scpi } from '../../types/scpi';
import { scpiData } from '../../data/scpiData';
import { analyzePortfolio } from '../../utils/portfolioAnalysis';
import { adaptPortfolioToAmount, getMaxScpiCount } from '../../utils/portfolioAdaptation';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import SectionRepliable from './SectionRepliable';

interface GuidedJourneyResultsProps {
  recommendation: PortfolioRecommendation;
  answers: GuidedJourneyAnswers;
  onBack: () => void;
  onStartSubscription?: (scpiIds: number[]) => void;
  onCalendlyClick?: () => void;
}

interface PortfolioAnalysisModuleProps {
  portfolioScpis: Array<{ scpi: Scpi; allocation: number }>;
  analysis: ReturnType<typeof analyzePortfolio>;
  initialInvestmentAmount?: number; // Montant initial depuis le questionnaire
}

const GRADIENT_IDS = {
  sectors: ['gradBlue', 'gradTeal', 'gradOrange', 'gradPink', 'gradPurple', 'gradCyan', 'gradLime', 'gradRed'],
  geography: ['gradBlue2', 'gradTeal2', 'gradOrange2', 'gradPink2', 'gradPurple2', 'gradCyan2', 'gradLime2', 'gradRed2']
};

const LEGEND_COLORS = {
  sectors: ['#2563eb', '#059669', '#d97706', '#db2777', '#7c3aed', '#0891b2', '#65a30d', '#ea580c'],
  geography: ['#2563eb', '#059669', '#d97706', '#db2777', '#7c3aed', '#0891b2', '#65a30d', '#ea580c']
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-600 shadow-xl">
        <p className="text-white font-semibold text-sm">{payload[0].name}</p>
        <p className="text-emerald-400 font-bold text-lg">{payload[0].value.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const PortfolioAnalysisModule: React.FC<PortfolioAnalysisModuleProps> = ({ portfolioScpis, analysis, initialInvestmentAmount }) => {
  const [investmentAmount, setInvestmentAmount] = useState<number>(initialInvestmentAmount || 50000);
  const [investmentYears, setInvestmentYears] = useState<number>(15);

  // Calculer le nombre total de parts et l'investissement réel pour le portefeuille
  const totalShares = useMemo(() => {
    return portfolioScpis.reduce((total, item) => {
      const amountForScpi = (investmentAmount * item.allocation) / 100;
      const shares = Math.floor(amountForScpi / item.scpi.price);
      return total + shares;
    }, 0);
  }, [investmentAmount, portfolioScpis]);

  const actualInvestment = useMemo(() => {
    return portfolioScpis.reduce((total, item) => {
      const amountForScpi = (investmentAmount * item.allocation) / 100;
      const shares = Math.floor(amountForScpi / item.scpi.price);
      return total + (shares * item.scpi.price);
    }, 0);
  }, [investmentAmount, portfolioScpis]);

  const averagePricePerShare = useMemo(() => {
    if (totalShares === 0) return 0;
    return actualInvestment / totalShares;
  }, [actualInvestment, totalShares]);

  const annualRevenue = (actualInvestment * analysis.averageYield) / 100;
  const monthlyRevenue = annualRevenue / 12;

  const projectionData = Array.from({ length: investmentYears + 1 }, (_, year) => {
    const totalRevenue = annualRevenue * year;
    const totalValue = actualInvestment + totalRevenue;
    return {
      year: year === 0 ? 'Début' : `An ${year}`,
      capital: actualInvestment,
      revenus: totalRevenue,
      total: totalValue
    };
  });

  // Préparer les données pour les camemberts
  const sectorData = Object.entries(analysis.sectorDistribution)
    .map(([name, value], index) => ({
      name,
      value: Math.round(value * 10) / 10,
      color: LEGEND_COLORS.sectors[index % LEGEND_COLORS.sectors.length]
    }))
    .sort((a, b) => b.value - a.value)
    .filter(item => item.value > 0);

  const geoData = Object.entries(analysis.geoDistribution)
    .map(([name, value], index) => ({
      name,
      value: Math.round(value * 10) / 10,
      color: LEGEND_COLORS.geography[index % LEGEND_COLORS.geography.length]
    }))
    .sort((a, b) => b.value - a.value)
    .filter(item => item.value > 0);

  // Trouver le prix minimum pour le step
  const minPrice = Math.min(...portfolioScpis.map(item => item.scpi.price));
  const minInvestment = Math.max(...portfolioScpis.map(item => item.scpi.minInvestment || item.scpi.price));

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
      <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-emerald-400" />
        Analyse détaillée du portefeuille (pour mieux comprendre)
      </h2>
      <p className="text-slate-300 mb-6 text-sm">
        Les éléments ci-dessous vous permettent de mieux comprendre la construction de votre portefeuille recommandé.
      </p>

      <div className="space-y-6">
        {/* Montant à Investir */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl border border-emerald-500/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Montant à Investir
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Montant d'investissement
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || value === '0') {
                        setInvestmentAmount(0);
                      } else {
                        setInvestmentAmount(Number(value));
                      }
                    }}
                    min={0}
                    step={minPrice}
                    placeholder="Entrez un montant"
                    className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 text-white rounded-lg text-xl font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">€</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Minimum: {minInvestment.toLocaleString('fr-FR')}€</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">Montants rapides:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[10000, 25000, 50000, 100000, 200000, 500000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setInvestmentAmount(amount)}
                      className={`px-3 py-2 border rounded-lg text-sm font-semibold transition-all ${
                        investmentAmount === amount
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-700 hover:bg-emerald-600 border-slate-600 hover:border-emerald-500 text-white'
                      }`}
                    >
                      {amount >= 1000 ? `${amount / 1000}k€` : `${amount}€`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Nombre de parts</span>
                  <span className="text-2xl font-bold text-white">{totalShares}</span>
                </div>
              </div>
              <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300 font-medium">Investissement réel</span>
                  <span className="text-2xl font-bold text-emerald-400">{actualInvestment.toLocaleString('fr-FR')}€</span>
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Prix moyen par part</span>
                  <span className="text-lg font-bold text-white">{averagePricePerShare.toFixed(0)}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Répartitions Sectorielle et Géographique */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Répartition Sectorielle */}
          <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-400" />
              Répartition Sectorielle
            </h3>
            <p className="text-sm text-slate-300 mb-4">
              Cette répartition sectorielle permet de limiter la dépendance à un seul cycle immobilier. 
              En diversifiant les secteurs, vous réduisez l'impact d'une baisse temporaire dans un domaine spécifique.
            </p>
            <div className="relative">
              <ResponsiveContainer width="100%" height={280}>
                <RechartsPie>
                  <defs>
                    {GRADIENT_IDS.sectors.map((id, index) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={LEGEND_COLORS.sectors[index]} stopOpacity={1} />
                        <stop offset="100%" stopColor={LEGEND_COLORS.sectors[index]} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="90%"
                    paddingAngle={0}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#${GRADIENT_IDS.sectors[index % GRADIENT_IDS.sectors.length]})`}
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
                <div className="text-3xl font-bold text-white">{sectorData.length}</div>
                <div className="text-sm text-slate-400">secteurs</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {sectorData.map((sector, index) => (
                <div key={sector.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sector.color }}
                    ></div>
                    <span className="text-slate-300">{sector.name}</span>
                  </div>
                  <span className="font-semibold text-white">{sector.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

              {/* Répartition Géographique */}
              <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-green-400" />
                  Répartition Géographique
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  Cette répartition géographique réduit votre exposition aux risques locaux. 
                  En investissant dans plusieurs zones, vous bénéficiez de la stabilité de marchés complémentaires.
                </p>
            <div className="relative">
              <ResponsiveContainer width="100%" height={280}>
                <RechartsPie>
                  <defs>
                    {GRADIENT_IDS.geography.map((id, index) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={LEGEND_COLORS.geography[index]} stopOpacity={1} />
                        <stop offset="100%" stopColor={LEGEND_COLORS.geography[index]} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={geoData}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="90%"
                    paddingAngle={0}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {geoData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#${GRADIENT_IDS.geography[index % GRADIENT_IDS.geography.length]})`}
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
                <div className="text-3xl font-bold text-white">{geoData.length}</div>
                <div className="text-sm text-slate-400">pays</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {geoData.map((geo, index) => (
                <div key={geo.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: geo.color }}
                    ></div>
                    <span className="text-slate-300">{geo.name}</span>
                  </div>
                  <span className="font-semibold text-white">{geo.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Projection sur X ans */}
        <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" />
              Projection sur {investmentYears} ans
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">Durée:</label>
              <select
                value={investmentYears}
                onChange={(e) => setInvestmentYears(Number(e.target.value))}
                className="px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value={5}>5 ans</option>
                <option value={10}>10 ans</option>
                <option value={15}>15 ans</option>
                <option value={20}>20 ans</option>
              </select>
            </div>
          </div>
          <div className="mb-4 space-y-2">
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              Cette projection illustre l'évolution potentielle de votre investissement sur {investmentYears} ans, 
              en supposant un rendement constant. Elle vous aide à visualiser l'accumulation progressive des revenus 
              et l'évolution de votre patrimoine, sans garantie de résultat.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs text-yellow-200 leading-relaxed">
                <strong>Projection indicative basée sur des hypothèses.</strong> Les performances passées ne préjugent pas des performances futures. 
                Les revenus peuvent varier et le capital n'est pas garanti.
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[...projectionData]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => `${value.toLocaleString('fr-FR')}€`}
              />
              <Legend />
              <Bar dataKey="capital" name="Capital investi" stackId="a" fill="#3b82f6" />
              <Bar dataKey="revenus" name="Revenus cumulés" stackId="a" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 bg-slate-800/50 rounded-lg p-4 border border-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Patrimoine total après {investmentYears} ans</span>
              <span className="text-2xl font-bold text-emerald-400">
                {(actualInvestment + annualRevenue * investmentYears).toLocaleString('fr-FR')}€
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GuidedJourneyResults: React.FC<GuidedJourneyResultsProps> = ({
  recommendation,
  answers,
  onBack,
  onStartSubscription,
  onCalendlyClick,
}) => {
  console.log('🎯 [GuidedJourneyResults] Composant rendu');
  console.log('🔍 [GuidedJourneyResults] Props reçues:', {
    hasRecommendation: !!recommendation,
    hasAnswers: !!answers,
    hasOnBack: !!onBack,
    hasOnStartSubscription: !!onStartSubscription,
    hasOnCalendlyClick: !!onCalendlyClick,
    onCalendlyClickType: typeof onCalendlyClick
  });
  
  const { portfolio, explanation } = recommendation;

  // État pour le montant d'investissement (utilise la valeur du questionnaire ou 50000 par défaut)
  const [investmentAmount, setInvestmentAmount] = useState<number>(answers.investmentAmount || 50000);

  // Récupérer les SCPI du portefeuille original
  const originalPortfolioScpis = useMemo(() => {
    if (!scpiData || scpiData.length === 0) {
      console.warn('⚠️ scpiData est vide ou non chargé');
      return [];
    }
    
    const result = portfolio.scpis
      .map(p => {
        const scpi = scpiData.find(s => s.id === p.scpiId);
        if (!scpi) {
          console.warn(`⚠️ SCPI avec ID ${p.scpiId} non trouvée dans scpiData`);
        }
        return scpi ? { scpi, allocation: p.allocation } : null;
      })
      .filter((item): item is { scpi: Scpi; allocation: number } => item !== null);
    
    if (result.length === 0) {
      console.error('❌ Aucune SCPI trouvée dans originalPortfolioScpis');
    }
    
    return result;
  }, [portfolio.scpis]);

  // Adapter le portefeuille au montant investi
  const { adaptedScpis: portfolioScpis, maxScpiCount } = useMemo(() => 
    adaptPortfolioToAmount(originalPortfolioScpis, portfolio.id, investmentAmount),
    [originalPortfolioScpis, portfolio.id, investmentAmount]
  );

  // Calculer les indicateurs du portefeuille adapté
  const analysis = useMemo(() => analyzePortfolio(portfolioScpis), [portfolioScpis]);
  
  // Vérifier si le portefeuille a été adapté
  const isAdapted = portfolioScpis.length < originalPortfolioScpis.length;

  // Générer la logique globale du portefeuille
  const portfolioLogic = useMemo(() => {
    const { taxSituation, objective, horizon, immediateIncome } = answers;
    
    let logic = "Ce portefeuille a été construit en tenant compte de votre situation personnelle. ";
    
    // Fiscalité
    if (taxSituation === 'plus-6000') {
      logic += "Votre situation fiscale (plus de 6 000 € d'impôt annuel) a orienté la sélection vers des SCPI permettant une optimisation fiscale, notamment européennes. ";
    } else if (taxSituation === 'moins-2000') {
      logic += "Votre faible imposition (moins de 2 000 € d'impôt annuel) permet de privilégier la performance brute. ";
    } else if (taxSituation === '2000-6000') {
      logic += "Votre situation fiscale intermédiaire (entre 2 000 € et 6 000 € d'impôt annuel) permet d'équilibrer rendement et diversification. ";
    }
    
    // Objectif
    if (objective === 'revenus-reguliers' || immediateIncome === 'oui') {
      logic += "L'accent a été mis sur la génération de revenus réguliers et prévisibles. ";
    } else if (objective === 'croissance-long-terme' || horizon === 'plus-15-ans') {
      logic += "L'horizon long terme permet de privilégier la croissance du capital. ";
    } else if (objective === 'revenus-et-croissance') {
      logic += "Un équilibre a été recherché entre revenus réguliers et croissance du capital. ";
    }
    
    // Horizon
    if (horizon === 'moins-8-ans') {
      logic += "Avec un horizon plus court, la stabilité et la liquidité relative ont été privilégiées. ";
    } else if (horizon === 'plus-15-ans') {
      logic += "L'horizon long terme permet de mieux absorber les fluctuations de marché. ";
    }
    
    // Risque
    logic += `Le niveau de risque ${portfolio.riskLevel === 'faible' ? 'faible' : portfolio.riskLevel === 'modere' ? 'modéré' : 'dynamique'} de ce portefeuille correspond à votre profil.`;
    
    return logic;
  }, [answers, portfolio.riskLevel]);

  const riskLevelColors = {
    faible: 'bg-green-100 text-green-800 border-green-300',
    modere: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    dynamique: 'bg-orange-100 text-orange-800 border-orange-300',
  };

  const riskLevelLabels = {
    faible: 'Faible',
    modere: 'Modéré',
    dynamique: 'Dynamique',
  };

  // Calculer le score de risque sur une échelle de 1 à 7 (toujours entre 3 et 4)
  const riskScore = useMemo(() => {
    const { riskLevel } = portfolio;
    const portfolioType = portfolio.id;
    
    // Toujours entre 3 et 4
    if (riskLevel === 'faible') {
      return 3; // Au lieu de 2, on met 3
    } else if (riskLevel === 'modere') {
      // Pour les portefeuilles européens, score légèrement plus élevé
      if (portfolioType === 'immobilier-europeen') {
        return 4;
      } else {
        return 3;
      }
    } else if (riskLevel === 'dynamique') {
      return 4;
    }
    
    // Par défaut, retourner 3
    return 3;
  }, [portfolio.riskLevel, portfolio.id]);

  const [expandedSections, setExpandedSections] = useState({
    why: true,
    composition: true,
    analysis: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleValidate = () => {
    // Lancer directement le tunnel de souscription
    handleStartSubscription();
  };

  const handleCalendlyClick = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('📞 [GuidedJourneyResults] handleCalendlyClick appelé');
    console.log('🔍 [GuidedJourneyResults] onCalendlyClick défini?', !!onCalendlyClick);
    if (onCalendlyClick) {
      console.log('✅ [GuidedJourneyResults] Appel de onCalendlyClick');
      onCalendlyClick();
    } else {
      console.log('⚠️ [GuidedJourneyResults] onCalendlyClick non défini, ouverture directe de Calendly');
      // Fallback : ouvrir Calendly directement
      window.open('https://calendly.com/eric-bellaiche/gp-rendez-vous-avec-eric-bellaiche-clone', '_blank');
    }
  };

  const handleStartSubscription = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Empêcher le comportement par défaut (scroll, navigation, etc.)
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Empêcher les clics multiples
    if (isLoading) {
      console.log('⏳ [GuidedJourneyResults] Déjà en cours de chargement...');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🚀 [GuidedJourneyResults] Début de l\'ouverture du tunnel de souscription...');
      console.log('🔍 [GuidedJourneyResults] onStartSubscription défini?', !!onStartSubscription);

      // Vérifier que portfolioScpis est défini et non vide
      if (!portfolioScpis || portfolioScpis.length === 0) {
        console.error('❌ [GuidedJourneyResults] Aucune SCPI dans le portefeuille');
        alert('Erreur : Aucune SCPI sélectionnée. Veuillez réessayer.');
        setIsLoading(false);
        return;
      }

      console.log('📊 [GuidedJourneyResults] Portfolio SCPIs:', portfolioScpis.map(p => ({ id: p.scpi.id, name: p.scpi.name })));

      // Extraire les IDs des SCPI
      const scpiIds = portfolioScpis.map(p => p.scpi.id);
      console.log('✅ [GuidedJourneyResults] IDs SCPI extraits:', scpiIds);

      // Appeler la fonction onStartSubscription passée depuis App.tsx
      if (onStartSubscription) {
        console.log('📞 [GuidedJourneyResults] Appel de onStartSubscription avec', scpiIds.length, 'SCPI');
        await onStartSubscription(scpiIds);
        console.log('✅ [GuidedJourneyResults] onStartSubscription appelé avec succès');
      } else {
        console.error('❌ [GuidedJourneyResults] onStartSubscription n\'est pas défini');
        console.error('❌ [GuidedJourneyResults] Props reçues:', { onStartSubscription, onBack, onCalendlyClick });
        alert('Erreur : Impossible d\'ouvrir le tunnel. Veuillez réessayer.');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('❌ [GuidedJourneyResults] Erreur lors de l\'ouverture du tunnel:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  // Générer le sous-titre humain selon le type de portefeuille
  const humanSubtitle = useMemo(() => {
    const { objective, immediateIncome, horizon } = answers;
    
    if (objective === 'revenus-reguliers' || immediateIncome === 'oui') {
      return "Pour générer des revenus réguliers tout en privilégiant la stabilité du capital.";
    }
    if (objective === 'croissance-long-terme' || horizon === 'plus-15-ans') {
      return "Pour faire progresser votre capital sur le long terme avec une approche équilibrée.";
    }
    if (objective === 'revenus-et-croissance') {
      return "Pour combiner revenus réguliers et croissance du capital sur le moyen terme.";
    }
    return "Pour vous accompagner dans votre projet d'investissement avec une solution adaptée à votre profil.";
  }, [answers]);

  // Générer les bullet points simplifiés
  const portfolioBulletPoints = useMemo(() => {
    const points: string[] = [];
    const { objective, immediateIncome, horizon } = answers;
    
    if (objective === 'revenus-reguliers' || immediateIncome === 'oui') {
      points.push("Générer des revenus réguliers et prévisibles");
      points.push("Préserver votre capital investi");
    } else if (objective === 'croissance-long-terme' || horizon === 'plus-15-ans') {
      points.push("Faire progresser votre capital sur le long terme");
      points.push("Bénéficier d'une diversification solide");
    } else {
      points.push("Équilibrer revenus réguliers et croissance du capital");
      points.push("Diversifier votre investissement immobilier");
    }
    
    points.push("Réduire les risques grâce à la diversification");
    
    if (horizon === 'moins-8-ans') {
      points.push("Adapter votre investissement à un horizon plus court");
    } else if (horizon === 'plus-15-ans') {
      points.push("Optimiser votre investissement pour le long terme");
    }
    
    return points.slice(0, 4); // Maximum 4 points
  }, [answers]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-slate-900/60 border border-slate-700 rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au questionnaire
        </button>

        {/* 1️⃣ SYNTHÈSE IMMÉDIATE - Au-dessus de la ligne de flottaison */}
        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-full mb-4">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Votre portefeuille recommandé
            </h1>
            <p className="text-base text-slate-300">
              Adapté à votre situation
            </p>
          </div>

          {/* Synthèse en 3 points clés (simplifiée) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Type de portefeuille */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Portefeuille</div>
              <div className="text-lg font-bold text-white">{portfolio.name}</div>
            </div>

            {/* Objectif principal */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Objectif</div>
              <div className="text-sm text-slate-200 leading-tight">{humanSubtitle}</div>
            </div>

            {/* Niveau de risque */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700">
              <div className="text-xs text-slate-400 mb-2">Risque</div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${riskLevelColors[portfolio.riskLevel]}`}>
                  {riskLevelLabels[portfolio.riskLevel]}
                </span>
              </div>
              {/* Échelle de risque 1-7 */}
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-400">Profil :</span>
                  <div className="flex-1 flex flex-col gap-1">
                    {/* 7 barres distinctes */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                        const isActive = num <= riskScore;
                        const barColor = riskScore === 3
                          ? (isActive ? 'bg-green-500' : 'bg-slate-700')
                          : riskScore === 4
                          ? (isActive ? 'bg-orange-500' : 'bg-slate-700')
                          : (isActive ? 'bg-red-500' : 'bg-slate-700');
                        
                        return (
                          <div
                            key={num}
                            className={`flex-1 h-5 rounded transition-all duration-500 ${barColor}`}
                          />
                        );
                      })}
                    </div>
                    {/* Chiffres 1 à 7 en dessous */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <div key={num} className="flex-1 text-center">
                          <span className="text-xs text-slate-400">{num}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-300 min-w-[2rem] text-right">{riskScore}/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Card - Détails */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl shadow-xl p-6 sm:p-8 mb-6">

          {/* NIVEAU 2 : JUSTIFICATION - Sections repliables */}
          
          {/* Section 1 : Pourquoi ce portefeuille vous correspond */}
          <SectionRepliable
            title="Pourquoi ce portefeuille vous correspond"
            isExpanded={expandedSections.why}
            onToggle={() => setExpandedSections(prev => ({ ...prev, why: !prev.why }))}
          >
            <p className="text-slate-200 leading-relaxed mb-4">
              Ce portefeuille a été construit en tenant compte de votre situation personnelle et de vos objectifs.
            </p>
            <ul className="space-y-2">
              {portfolioBulletPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-200">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </SectionRepliable>

          {/* Section 2 : Composition du portefeuille */}
          <SectionRepliable
            title={`Les ${portfolioScpis.length} SCPI recommandées`}
            subtitle={isAdapted 
              ? `Pour un montant de ${investmentAmount.toLocaleString('fr-FR')} €, le portefeuille est concentré sur ${portfolioScpis.length} SCPI pour conserver une allocation lisible et efficace.`
              : `${portfolioScpis.length} SCPI sélectionnées pour leur solidité, leur taux d'occupation élevé, leur faible endettement et leur décote à l'achat.`
            }
            isExpanded={expandedSections.composition}
            onToggle={() => setExpandedSections(prev => ({ ...prev, composition: !prev.composition }))}
          >
            <div className="space-y-3">
              {portfolioScpis.map(({ scpi, allocation }) => (
                <div
                  key={scpi.id}
                  className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-slate-100">{scpi.name}</div>
                    <div className="text-sm text-slate-400">{scpi.company}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">{scpi.yield.toFixed(2)}%</div>
                    <div className="text-xs text-slate-400">Répartition: {allocation.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
            {isAdapted && (
              <p className="text-sm text-slate-300 leading-relaxed mt-4">
                Cette approche professionnelle privilégie la qualité et la simplicité. 
                La diversification pourra être renforcée dans le temps lors de futurs investissements.
              </p>
            )}
          </SectionRepliable>


        </div>


        {/* NIVEAU 3 : ANALYSE DÉTAILLÉE - Section repliable */}
        <SectionRepliable
          title="Analyse détaillée"
          subtitle="Pour approfondir votre compréhension du portefeuille"
          isExpanded={expandedSections.analysis}
          onToggle={() => setExpandedSections(prev => ({ ...prev, analysis: !prev.analysis }))}
        >
          <PortfolioAnalysisModule 
            portfolioScpis={portfolioScpis}
            analysis={analysis}
            initialInvestmentAmount={investmentAmount}
          />
        </SectionRepliable>

        {/* 5️⃣ FIN DE PAGE - Transition vers l'action */}
        <div className="space-y-4">
          {/* Message de rassurance et ouverture */}
          <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-2">
              Prochaine étape
            </h3>
            <p className="text-slate-200 leading-relaxed text-sm">
              Cette recommandation constitue une base solide pour votre projet. 
              Un conseiller certifié peut vous accompagner pour la valider et affiner votre stratégie.
            </p>
          </div>

          {/* Avertissement réglementaire */}
          <div className="bg-slate-900/80 border border-yellow-500/50 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-100">
                <p className="font-semibold mb-2">Avertissement important</p>
                <p className="leading-relaxed">
                  Les investissements en SCPI présentent un risque de perte en capital et une liquidité non garantie. 
                  Les performances passées ne préjugent pas des performances futures. 
                  Cette recommandation est indicative et ne constitue pas un engagement contractuel ni une promesse de rendement. 
                  Durée de placement recommandée : 8 à 10 ans minimum.
                </p>
              </div>
            </div>
          </div>

          {/* BOUTONS D'ACTION EN BAS DE PAGE */}
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Bouton Prendre RDV */}
              {(() => {
                console.log('🔍 [GuidedJourneyResults] Rendu du bouton Prendre RDV, onCalendlyClick:', !!onCalendlyClick);
                return (
                  <button
                    type="button"
                    onClick={(e) => {
                      console.log('🖱️🖱️🖱️ [GuidedJourneyResults] ⭐⭐⭐ CLIC SUR BOUTON "PRENDRE RDV" ⭐⭐⭐');
                      console.error('🖱️🖱️🖱️ [GuidedJourneyResults] CLIC PRENDRE RDV - FORCE LOG');
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔍 [GuidedJourneyResults] État avant handleCalendlyClick:', {
                        hasOnCalendlyClick: !!onCalendlyClick,
                        onCalendlyClickType: typeof onCalendlyClick
                      });
                      handleCalendlyClick(e);
                    }}
                    style={{
                      position: 'relative',
                      zIndex: 1000,
                      pointerEvents: 'auto'
                    }}
                    className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-base font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Prendre RDV avec un conseiller</span>
                  </button>
                );
              })()}

              {/* Bouton Commencer ma souscription */}
              {(() => {
                const isDisabled = isLoading || !portfolioScpis || portfolioScpis.length === 0;
                console.log('🔍 [GuidedJourneyResults] État du bouton:', {
                  isLoading,
                  hasPortfolioScpis: !!portfolioScpis,
                  portfolioScpisLength: portfolioScpis?.length || 0,
                  isDisabled,
                  hasOnStartSubscription: !!onStartSubscription
                });
                return (
                  <button
                    type="button"
                    onClick={async (e) => {
                      console.log('🖱️🖱️🖱️ [GuidedJourneyResults] ⭐⭐⭐ CLIC DÉTECTÉ SUR LE BOUTON ⭐⭐⭐');
                      console.error('🖱️🖱️🖱️ [GuidedJourneyResults] CLIC SUR BOUTON - FORCE LOG');
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔍 [GuidedJourneyResults] État avant clic:', {
                        isLoading,
                        portfolioScpisLength: portfolioScpis?.length || 0,
                        hasOnStartSubscription: !!onStartSubscription,
                        isDisabled
                      });
                      if (isDisabled) {
                        console.warn('⚠️ [GuidedJourneyResults] Bouton désactivé, clic ignoré');
                        alert('⚠️ Bouton désactivé ! Vérifiez que vous avez des SCPI dans le portefeuille.');
                        return;
                      }
                      console.log('✅ [GuidedJourneyResults] Appel de handleStartSubscription...');
                      try {
                        await handleStartSubscription(e);
                        console.log('✅ [GuidedJourneyResults] handleStartSubscription terminé');
                      } catch (error) {
                        console.error('❌ [GuidedJourneyResults] Erreur dans handleStartSubscription:', error);
                        alert('Erreur lors de l\'ouverture du tunnel: ' + (error instanceof Error ? error.message : String(error)));
                      }
                    }}
                    disabled={isDisabled}
                    style={{ 
                      position: 'relative',
                      zIndex: 1000,
                      pointerEvents: isDisabled ? 'none' : 'auto'
                    }}
                    className="flex-1 px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-base font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:shadow-none"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Ouverture du tunnel de souscription...</span>
                      </>
                    ) : (
                      <>
                        <span>Commencer ma souscription en ligne</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                );
              })()}
            </div>
            <p className="text-xs text-slate-400 text-center mt-3">
              Accédez au formulaire de souscription avec votre portefeuille pré-rempli
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GuidedJourneyResults;
