import React, { useState, useMemo } from 'react';
import { X, TrendingUp, PieChart, DollarSign, Calendar, BarChart3, AlertCircle, Clock, Shield, Tag, Building2, Percent, TrendingDown, CheckCircle2, XCircle, Star } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { scpiData } from '../../data/scpiData';
import { getScpiAdvantages, getScpiPointsAttention } from '../../utils/scpiAnalysis';

interface AnalysisDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  scpi: SCPIExtended;
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

const AnalysisDetailModal: React.FC<AnalysisDetailModalProps> = ({ isOpen, onClose, scpi }) => {
  const [investmentAmount, setInvestmentAmount] = useState<number>(50000);
  const [investmentYears, setInvestmentYears] = useState<number>(15);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Convertir SCPIExtended en Scpi pour utiliser les fonctions d'analyse
  const scpiForAnalysis = useMemo(() => {
    const matchingScpi = scpiData.find(s => s.name.toLowerCase() === scpi.name.toLowerCase());
    return matchingScpi || null;
  }, [scpi.name]);

  // Récupérer les avantages et inconvénients
  const advantages = scpiForAnalysis ? getScpiAdvantages(scpiForAnalysis) : [];
  const pointsAttention = scpiForAnalysis ? getScpiPointsAttention(scpiForAnalysis) : [];

  // Calculer la note sur 5 étoiles
  const calculateRating = useMemo(() => {
    if (!scpiForAnalysis) return 3; // Note par défaut si pas de données
    
    // Vérifier les critères pour une note minimale de 5/5
    const capitalisationOk = scpiForAnalysis.capitalization >= 50000000; // 50 millions
    const tofOk = scpiForAnalysis.tof >= 90;
    
    // Vérifier la décote (prix < valeur de reconstitution)
    const reconstitutionVal = scpi.reconstitutionValue ?? scpi.valeurReconstitution ?? 0;
    const hasDiscount = reconstitutionVal > 0 && scpi.price < reconstitutionVal;
    
    // Vérifier le rendement selon la géographie
    const isEurope = scpiForAnalysis.geography === 'europe' || scpiForAnalysis.european;
    const rendementOk = isEurope 
      ? scpiForAnalysis.yield >= 6 
      : scpiForAnalysis.yield >= 5.5;
    
    // Vérifier l'endettement
    const debt = scpiForAnalysis.debt || 0;
    const endettementOk = debt <= 30;
    
    // Si tous les critères sont remplis, note minimale de 5/5
    if (capitalisationOk && tofOk && hasDiscount && rendementOk && endettementOk) {
      return 5;
    }
    
    // Sinon, calculer la note normalement
    let score = 0;
    let maxScore = 0;

    // Rendement (0-1.5 étoiles)
    maxScore += 1.5;
    if (scpiForAnalysis.yield >= 7) score += 1.5;
    else if (scpiForAnalysis.yield >= 6) score += 1.2;
    else if (scpiForAnalysis.yield >= 5) score += 1;
    else if (scpiForAnalysis.yield >= 4) score += 0.7;
    else if (scpiForAnalysis.yield >= 3) score += 0.4;

    // TOF (0-1 étoile)
    maxScore += 1;
    if (scpiForAnalysis.tof >= 95) score += 1;
    else if (scpiForAnalysis.tof >= 90) score += 0.7;
    else if (scpiForAnalysis.tof >= 85) score += 0.4;

    // Frais (0-0.5 étoile)
    maxScore += 0.5;
    if (scpiForAnalysis.fees === 0) score += 0.5;
    else if (scpiForAnalysis.fees <= 3) score += 0.3;
    else if (scpiForAnalysis.fees <= 5) score += 0.1;

    // Qualité / Diversification (0-0.5 étoile)
    maxScore += 0.5;
    if (scpiForAnalysis.isr) score += 0.2;
    if (scpiForAnalysis.repartitionSector && scpiForAnalysis.repartitionSector.length >= 3) score += 0.2;
    if (scpiForAnalysis.capitalization >= 500000000) score += 0.1;

    // Endettement (0-0.5 étoile)
    maxScore += 0.5;
    if (debt === 0) score += 0.5;
    else if (debt <= 20) score += 0.4;
    else if (debt <= 30) score += 0.2;

    // Capitalisation / Liquidité (0-0.5 étoile)
    maxScore += 0.5;
    if (scpiForAnalysis.capitalization >= 1000000000) score += 0.5;
    else if (scpiForAnalysis.capitalization >= 500000000) score += 0.3;
    else if (scpiForAnalysis.capitalization >= 200000000) score += 0.1;

    // Convertir le score en note sur 5
    const rating = Math.round((score / maxScore) * 5);
    return Math.max(1, Math.min(5, rating)); // Entre 1 et 5
  }, [scpiForAnalysis, scpi]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
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
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 1. Chiffres clés - En premier */}
          <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Chiffres clés
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Rendement */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <div className="text-xs text-slate-400">Rendement</div>
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  {scpi.yield.toFixed(2)}%
                </div>
              </div>

              {/* TOF */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-4 h-4 text-blue-400" />
                  <div className="text-xs text-slate-400">TOF</div>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {scpi.tof.toFixed(1)}%
                </div>
              </div>

              {/* Décote/Surcote */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-slate-400" />
                  <div className="text-xs text-slate-400">Décote/Surcote</div>
                </div>
                {(() => {
                  const reconstitutionVal = scpi.reconstitutionValue ?? scpi.valeurReconstitution ?? 0;
                  const discountPremium = reconstitutionVal > 0 
                    ? ((scpi.price - reconstitutionVal) / reconstitutionVal * 100)
                    : 0;
                  const isDiscount = discountPremium < 0;
                  return (
                    <div className={`text-2xl font-bold ${isDiscount ? 'text-emerald-400' : discountPremium > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      {discountPremium > 0 ? '+' : ''}{discountPremium.toFixed(1)}%
                    </div>
                  );
                })()}
              </div>

              {/* Capitalisation */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <div className="text-xs text-slate-400">Capitalisation</div>
                </div>
                <div className="text-lg font-bold text-purple-400">
                  {scpi.capitalization}
                </div>
              </div>

              {/* Note */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <div className="text-xs text-slate-400">Note</div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= calculateRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                  <span className="text-lg font-bold text-white ml-1">
                    {calculateRating}/5
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Analyse MaximusSCPI - Avantages et Inconvénients */}
          {(advantages.length > 0 || pointsAttention.length > 0) && (
            <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Analyse MaximusSCPI
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avantages */}
                {advantages.length > 0 && (
                  <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
                    <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Avantages
                    </h4>
                    <ul className="space-y-2">
                      {advantages.map((advantage, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Inconvénients / Points d'attention */}
                {pointsAttention.length > 0 && (
                  <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                    <h4 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Points d'attention
                    </h4>
                    <ul className="space-y-2">
                      {pointsAttention.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                          <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Tableau de Bord Technique */}
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
                    {(scpi.managementFees !== undefined || scpi.fraisGestion !== undefined) ? (
                      <div className="text-lg font-bold text-white">
                        {(scpi.managementFees ?? scpi.fraisGestion)}% TTC
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div className="text-xs text-slate-400">Délai de jouissance</div>
                    </div>
                    {scpi.delaiJouissance !== undefined ? (
                      <div className="text-lg font-bold text-white">{scpi.delaiJouissance} mois</div>
                    ) : scpi.withdrawalDelay ? (
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
                    {(scpi.assetsCount !== undefined || scpi.nbImmeubles !== undefined) ? (
                      <div className="text-lg font-bold text-white">
                        {scpi.assetsCount ?? scpi.nbImmeubles}
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                  {scpi.versementLoyers && (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div className="text-xs text-slate-400">Versement des loyers</div>
                      </div>
                      <div className="text-lg font-bold text-white">{scpi.versementLoyers}</div>
                    </div>
                  )}
                  {scpi.dureeDetentionRecommandee !== undefined && (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div className="text-xs text-slate-400">Durée détention recommandée</div>
                      </div>
                      <div className="text-lg font-bold text-white">{scpi.dureeDetentionRecommandee} ans</div>
                    </div>
                  )}
                  {scpi.sfdr && (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <div className="text-xs text-slate-400">SFDR</div>
                      </div>
                      <div className="text-lg font-bold text-white">{scpi.sfdr}</div>
                    </div>
                  )}
                  {scpi.profilCible && (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <div className="text-xs text-slate-400">Profil cible</div>
                      </div>
                      <div className="text-lg font-bold text-white">{scpi.profilCible}</div>
                    </div>
                  )}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <div className="text-xs text-slate-400">Minimum de souscription</div>
                    </div>
                    <div className="text-lg font-bold text-white">{scpi.minInvestment.toLocaleString('fr-FR')}€</div>
                  </div>
                  {scpi.profilRisque !== undefined && scpi.profilRisque !== null && (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <div className="text-xs text-slate-400">Profil de risque (SRRI)</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex gap-1">
                          {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                            const isActive = level <= scpi.profilRisque!;
                            let colorClass = 'bg-slate-600';
                            if (isActive) {
                              if (level <= 3) {
                                // Jusqu'à 3 : vert
                                colorClass = 'bg-emerald-500';
                              } else if (level === 4) {
                                // 4 : orange clair
                                colorClass = 'bg-orange-400';
                              } else if (level <= 6) {
                                // 5-6 : orange foncé
                                colorClass = 'bg-orange-600';
                              } else {
                                // 7 : rouge
                                colorClass = 'bg-red-500';
                              }
                            }
                            return (
                              <div
                                key={level}
                                className={`flex-1 h-8 rounded ${colorClass} transition-all ${
                                  isActive ? 'opacity-100' : 'opacity-30'
                                }`}
                                title={`Niveau ${level}`}
                              />
                            );
                          })}
                        </div>
                        <div className="ml-2 text-lg font-bold text-white min-w-[2rem] text-right">
                          {scpi.profilRisque}/7
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-slate-400">
                        <span>Prudent</span>
                        <span>Équilibré</span>
                        <span>Dynamique</span>
                      </div>
                    </div>
                  )}
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
                    {(scpi.reconstitutionValue !== undefined || scpi.valeurReconstitution !== undefined) ? (
                      <div className="text-lg font-bold text-white">
                        {(scpi.reconstitutionValue ?? scpi.valeurReconstitution)?.toFixed(2)}€
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                  {(scpi.valeurRetrait !== undefined || scpi.reconstitutionValue !== undefined || scpi.valeurReconstitution !== undefined) && (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <div className="text-xs text-slate-400">Val. Retrait</div>
                      </div>
                      {scpi.valeurRetrait !== undefined ? (
                        <div className="text-lg font-bold text-white">{scpi.valeurRetrait.toFixed(2)}€</div>
                      ) : (
                        <div className="text-lg font-bold text-slate-500">N/A</div>
                      )}
                    </div>
                  )}
                  {scpi.valeurRealisation !== undefined && (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <div className="text-xs text-slate-400">Val. Réalisation</div>
                      </div>
                      <div className="text-lg font-bold text-white">{scpi.valeurRealisation.toFixed(2)}€</div>
                    </div>
                  )}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-slate-400" />
                      <div className="text-xs text-slate-400">Décote / Surcote</div>
                    </div>
                    {(scpi.reconstitutionValue !== undefined || scpi.valeurReconstitution !== undefined) ? (
                      (() => {
                        const reconstitutionVal = scpi.reconstitutionValue ?? scpi.valeurReconstitution ?? 0;
                        const discountPremium = ((scpi.price - reconstitutionVal) / reconstitutionVal * 100);
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
                  {scpi.distribution !== undefined && (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <div className="text-xs text-slate-400">Distribution (€/part)</div>
                      </div>
                      <div className="text-lg font-bold text-white">{scpi.distribution.toFixed(2)}€</div>
                    </div>
                  )}
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

          {/* 2. Répartitions - Ensuite */}
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
                      data={[...scpi.sectors]}
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
                      data={[...scpi.geography]}
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
        </div>

        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors"
          >
            Fermer l'Analyse
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetailModal;
