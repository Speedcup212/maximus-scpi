import React, { useState } from 'react';
import { X, TrendingUp, PieChart, DollarSign, Calendar, BarChart3, AlertCircle, Clock, Shield, Tag, Building2, Percent, TrendingDown } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface AnalysisDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  scpi: SCPIExtended;
  onNavigateHome?: () => void;
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
        <p className="text-emerald-400 font-bold text-lg">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const AnalysisDetailModal: React.FC<AnalysisDetailModalProps> = ({ isOpen, onClose, scpi, onNavigateHome }) => {
  const [investmentAmount, setInvestmentAmount] = useState<number>(50000);
  const [investmentYears, setInvestmentYears] = useState<number>(15);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = (e?: React.MouseEvent) => {
    // Empêcher la propagation si c'est un événement de clic
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Marquer comme en cours de fermeture pour l'animation
    setIsClosing(true);
    
    // Fermer le modal immédiatement pour éviter les conflits
    onClose();
    
    // Naviguer vers l'accueil après un court délai
    setTimeout(() => {
      if (onNavigateHome) {
        onNavigateHome();
      }
      setIsClosing(false);
    }, 100);
  };

  if (!isOpen) return null;

  const numberOfShares = Math.floor(investmentAmount / scpi.price);
  const actualInvestment = numberOfShares * scpi.price;
  const annualRevenue = actualInvestment * (scpi.yield / 100);
  const monthlyRevenue = annualRevenue / 12;
  const netYield = scpi.yield - 0.5;
  const annualNetRevenue = actualInvestment * (netYield / 100);

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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Diversifiée': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Résidentiel': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Santé': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Bureaux': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Européenne': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Logistique': 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    };
    return colors[category] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose(e);
        }
      }}
      onWheel={(e) => {
        // Empêcher le scroll de fermer le modal accidentellement
        e.stopPropagation();
      }}
    >
      <div 
        className={`bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto transition-transform duration-200 ${
          isClosing ? 'scale-95 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => {
          // Empêcher la propagation des clics à l'intérieur du modal
          e.stopPropagation();
        }}
        onWheel={(e) => {
          // Empêcher le scroll de se propager au backdrop
          e.stopPropagation();
        }}
      >
        <div className="sticky top-0 z-10 bg-slate-800 border-b border-slate-700 px-6 pt-12 pb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-emerald-400" />
              Analyse Détaillée - {scpi.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold border ${getCategoryColor(scpi.category)}`}>
                {scpi.category}
              </span>
              <span className="text-sm text-slate-400">{scpi.managementCompany}</span>
            </div>
          </div>
          <button
            onClick={(e) => handleClose(e)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
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
                      step={scpi.price}
                      placeholder="Entrez un montant"
                      className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 text-white rounded-lg text-xl font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">€</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Minimum: {scpi.minInvestment.toLocaleString('fr-FR')}€</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-2">Montants rapides:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setInvestmentAmount(10000)}
                      className="px-3 py-2 bg-slate-700 hover:bg-emerald-600 border border-slate-600 hover:border-emerald-500 text-white rounded-lg text-sm font-semibold transition-all"
                    >
                      10k€
                    </button>
                    <button
                      onClick={() => setInvestmentAmount(25000)}
                      className="px-3 py-2 bg-slate-700 hover:bg-emerald-600 border border-slate-600 hover:border-emerald-500 text-white rounded-lg text-sm font-semibold transition-all"
                    >
                      25k€
                    </button>
                    <button
                      onClick={() => setInvestmentAmount(50000)}
                      className="px-3 py-2 bg-slate-700 hover:bg-emerald-600 border border-slate-600 hover:border-emerald-500 text-white rounded-lg text-sm font-semibold transition-all"
                    >
                      50k€
                    </button>
                    <button
                      onClick={() => setInvestmentAmount(100000)}
                      className="px-3 py-2 bg-slate-700 hover:bg-emerald-600 border border-slate-600 hover:border-emerald-500 text-white rounded-lg text-sm font-semibold transition-all"
                    >
                      100k€
                    </button>
                    <button
                      onClick={() => setInvestmentAmount(200000)}
                      className="px-3 py-2 bg-slate-700 hover:bg-emerald-600 border border-slate-600 hover:border-emerald-500 text-white rounded-lg text-sm font-semibold transition-all"
                    >
                      200k€
                    </button>
                    <button
                      onClick={() => setInvestmentAmount(500000)}
                      className="px-3 py-2 bg-slate-700 hover:bg-emerald-600 border border-slate-600 hover:border-emerald-500 text-white rounded-lg text-sm font-semibold transition-all"
                    >
                      500k€
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Nombre de parts</span>
                    <span className="text-2xl font-bold text-white">{numberOfShares}</span>
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
                    <span className="text-sm text-slate-400">Prix par part</span>
                    <span className="text-lg font-bold text-white">{scpi.price}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-400" />
                Répartition Sectorielle
              </h3>
              <div className="relative">
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPie>
                    <defs>
                      <linearGradient id="gradBlue" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="gradTeal" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="gradOrange" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                        <stop offset="100%" stopColor="#d97706" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="gradPink" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f472b6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#db2777" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="gradPurple" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="gradCyan" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={1} />
                        <stop offset="100%" stopColor="#0891b2" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="gradLime" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#a3e635" stopOpacity={1} />
                        <stop offset="100%" stopColor="#65a30d" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="gradRed" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fb923c" stopOpacity={1} />
                        <stop offset="100%" stopColor="#ea580c" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={scpi.sectors}
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
                      {scpi.sectors.map((entry, index) => (
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
                  <div className="text-3xl font-bold text-white">{scpi.sectors.length}</div>
                  <div className="text-sm text-slate-400">secteurs</div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {scpi.sectors.map((sector, index) => (
                  <div key={sector.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: LEGEND_COLORS.sectors[index % LEGEND_COLORS.sectors.length]
                        }}
                      ></div>
                      <span className="text-slate-300">{sector.name}</span>
                    </div>
                    <span className="font-semibold text-white">{sector.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-green-400" />
                Répartition Géographique
              </h3>
              <div className="relative">
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPie>
                    <defs>
                      <linearGradient id="gradBlue2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="gradTeal2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="gradOrange2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                        <stop offset="100%" stopColor="#d97706" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="gradPink2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f472b6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#db2777" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="gradPurple2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="gradCyan2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={1} />
                        <stop offset="100%" stopColor="#0891b2" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="gradLime2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#a3e635" stopOpacity={1} />
                        <stop offset="100%" stopColor="#65a30d" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="gradRed2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fb923c" stopOpacity={1} />
                        <stop offset="100%" stopColor="#ea580c" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={scpi.geography}
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
                      {scpi.geography.map((entry, index) => (
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
                  <div className="text-3xl font-bold text-white">{scpi.geography.length}</div>
                  <div className="text-sm text-slate-400">pays</div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {scpi.geography.map((geo, index) => (
                  <div key={geo.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: LEGEND_COLORS.geography[index % LEGEND_COLORS.geography.length]
                        }}
                      ></div>
                      <span className="text-slate-300">{geo.name}</span>
                    </div>
                    <span className="font-semibold text-white">{geo.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectionData}>
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

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 rounded-xl border border-green-500/20 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Revenus Estimés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="text-sm text-slate-400 mb-1">Revenus Annuels Bruts</div>
                <div className="text-2xl font-bold text-emerald-400">{annualRevenue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</div>
                <div className="text-xs text-slate-500 mt-1">Rendement {scpi.yield}%</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="text-sm text-slate-400 mb-1">Revenus Mensuels</div>
                <div className="text-2xl font-bold text-green-400">{monthlyRevenue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</div>
                <div className="text-xs text-slate-500 mt-1">Par mois</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="text-sm text-slate-400 mb-1">Revenus Nets Estimés</div>
                <div className="text-2xl font-bold text-green-400">{annualNetRevenue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</div>
                <div className="text-xs text-slate-500 mt-1">Après prélèvements sociaux</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Tableau de Bord Technique
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Structure & Frais
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <div className="text-xs text-slate-400">Frais d'entrée</div>
                    </div>
                    {scpi.entryFees !== undefined ? (
                      scpi.entryFees === 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">0%</span>
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded border border-emerald-500/30">Sans frais</span>
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-white">{scpi.entryFees}%</div>
                      )
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <div className="text-xs text-slate-400">Frais de gestion</div>
                    </div>
                    {scpi.managementFees !== undefined ? (
                      <div className="text-lg font-bold text-white">{scpi.managementFees}% TTC</div>
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div className="text-xs text-slate-400">Délai de jouissance</div>
                    </div>
                    {scpi.withdrawalDelay ? (
                      <div className="text-lg font-bold text-white">{scpi.withdrawalDelay}</div>
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <div className="text-xs text-slate-400">Immeubles</div>
                    </div>
                    {scpi.assetsCount !== undefined ? (
                      <div className="text-lg font-bold text-white">{scpi.assetsCount}</div>
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Valorisation & Risque
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <div className="text-xs text-slate-400">Val. Reconstitution</div>
                    </div>
                    {scpi.reconstitutionValue !== undefined ? (
                      <div className="text-lg font-bold text-white">{scpi.reconstitutionValue}€</div>
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-slate-400" />
                      <div className="text-xs text-slate-400">Décote / Surcote</div>
                    </div>
                    {scpi.reconstitutionValue !== undefined ? (
                      (() => {
                        const discountPremium = ((scpi.price - scpi.reconstitutionValue) / scpi.reconstitutionValue * 100);
                        const isDiscount = discountPremium < 0;
                        return (
                          <div className={`text-lg font-bold ${isDiscount ? 'text-emerald-400' : 'text-red-400'}`}>
                            {discountPremium > 0 ? '+' : ''}{discountPremium.toFixed(1)}%
                            <span className="text-xs ml-1">({isDiscount ? 'Décote' : 'Surcote'})</span>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <div className="text-xs text-slate-400">Report à Nouveau</div>
                    </div>
                    {scpi.ranDays !== undefined ? (
                      <div className="text-lg font-bold text-white">{scpi.ranDays} jours</div>
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <div className="text-xs text-slate-400">Taux d'Occupation</div>
                    </div>
                    <div className="text-lg font-bold text-white">{scpi.tof}%</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                <div className="text-sm font-semibold text-slate-300 mb-2">Stratégie d'Investissement</div>
                <p className="text-sm text-slate-400 leading-relaxed">{scpi.strategy}</p>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-blue-400 mb-1">Note importante</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Les performances passées ne préjugent pas des performances futures. Les revenus sont estimés et peuvent varier selon le taux d'occupation réel et la politique de distribution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 px-6 py-4">
          <button
            onClick={(e) => handleClose(e)}
            className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors"
            type="button"
          >
            Fermer l'Analyse
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetailModal;
