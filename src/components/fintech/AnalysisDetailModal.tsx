import React, { useState, useMemo } from 'react';
import { X, TrendingUp, PieChart, DollarSign, Calendar, BarChart3, AlertCircle, Clock, Shield, Tag, Building2, Percent, TrendingDown, CheckCircle2, XCircle, Star, FileText, Newspaper, Plus, Check } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { scpiData } from '../../data/scpiData';
import { getScpiAdvantages, getScpiPointsAttention, getScpiNews, getScpiKeyTakeaways, getCapitalizationCategory, formatCapitalizationWithLiquidity } from '../../utils/scpiAnalysis';
import { checkScpiDataCompleteness, getCompletenessDisplay } from '../../utils/scpiDataCompleteness';
import { getYieldDisplayInfo } from '../../utils/yieldDisplay';

interface AnalysisDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  scpi: SCPIExtended;
  onAdd?: () => void;
  isSelected?: boolean;
  onShowToast?: (message: string) => void;
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

const AnalysisDetailModal: React.FC<AnalysisDetailModalProps> = ({ isOpen, onClose, scpi, onAdd, isSelected = false, onShowToast }) => {
  const [investmentAmount, setInvestmentAmount] = useState<number>(50000);
  const [investmentYears, setInvestmentYears] = useState<number>(15);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Convertir SCPIExtended en Scpi pour utiliser les fonctions d'analyse
  // Prioriser l'entrée avec actualités trimestrielles si elle existe
  const scpiForAnalysis = useMemo(() => {
    const allMatching = scpiData.filter(s => s.name.toLowerCase() === scpi.name.toLowerCase());
    if (allMatching.length === 0) return null;
    
    // Prioriser l'entrée avec actualités trimestrielles
    const withNews = allMatching.find(s => s.actualitesTrimestrielles);
    return withNews || allMatching[0];
  }, [scpi.name]);


  // Récupérer les avantages et inconvénients
  const advantages = scpiForAnalysis ? getScpiAdvantages(scpiForAnalysis) : [];
  const pointsAttention = scpiForAnalysis ? getScpiPointsAttention(scpiForAnalysis) : [];
  
  // Récupérer les points clés pour lecture rapide
  const keyTakeaways = scpiForAnalysis ? getScpiKeyTakeaways(scpiForAnalysis) : [];
  
  // Récupérer les actualités trimestrielles
  const quarterlyNews = scpiForAnalysis ? getScpiNews(scpiForAnalysis) : '';
  const periodeBulletin = scpiForAnalysis?.periodeBulletinTrimestriel;

  // Utiliser les données locatives de scpiForAnalysis si elles ne sont pas dans scpi
  const nombreLocataires = scpi.nombreLocataires ?? scpiForAnalysis?.nombreLocataires;
  const walt = scpi.walt ?? scpiForAnalysis?.walt;
  const walb = scpi.walb ?? scpiForAnalysis?.walb;
  
  // Utiliser les données trimestrielles de scpiForAnalysis si elles ne sont pas dans scpi
  const collecteNetteTrimestre = scpi.collecteNetteTrimestre ?? scpiForAnalysis?.collecteNetteTrimestre;
  const nbCessionsTrimestre = scpi.nbCessionsTrimestre ?? scpiForAnalysis?.nbCessionsTrimestre;
  
  // Utiliser le nombre d'immeubles de scpiForAnalysis si disponible (priorité aux données mises à jour)
  const nbImmeubles = scpiForAnalysis?.nbImmeubles ?? scpi.assetsCount;

  // Vérifier la complétude des données
  const completenessResult = useMemo(() => {
    if (!scpiForAnalysis) return null;
    return checkScpiDataCompleteness(scpiForAnalysis, scpi);
  }, [scpiForAnalysis, scpi]);

  const completenessDisplay = completenessResult ? getCompletenessDisplay(completenessResult.donnees_completes_niveau) : null;

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
  const currentYield = scpiForAnalysis?.yield ?? scpi.yield;
  const annualRevenue = actualInvestment * (currentYield / 100);
  const monthlyRevenue = annualRevenue / 12;
  const netYield = currentYield - 0.5;
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
      <div 
        className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
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
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Badge de mise à jour du bulletin trimestriel et tag de complétude */}
        {(periodeBulletin || completenessResult) && (
          <div className="px-6 pt-4 pb-2 flex items-center gap-3 flex-wrap">
            {periodeBulletin && (
              <div className="text-xs text-white bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-600 inline-block">
                Mise à jour BULLETIN TRIMESTRIEL D'INFORMATION {periodeBulletin}
              </div>
            )}
            {completenessResult && completenessDisplay && (
              <div className={`text-xs ${completenessDisplay.color} ${completenessDisplay.bgColor} px-4 py-2 rounded-lg border border-current/30 inline-flex items-center gap-2`}>
                <span>{completenessDisplay.emoji}</span>
                <span className="font-semibold">{completenessDisplay.label}</span>
                <span className="text-slate-400">({completenessResult.donnees_completes_score}/11 indicateurs)</span>
              </div>
            )}
          </div>
        )}

        {/* Bloc Lecture rapide - Ce qu'il faut retenir */}
        {keyTakeaways.length > 0 && (
          <div className="px-6 pt-4 pb-6">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Lecture rapide – ce qu'il faut retenir</h3>
              </div>
              <ul className="space-y-2.5">
                {keyTakeaways.map((takeaway, index) => {
                  // Dernier élément = conclusion implicite
                  const isConclusion = index === keyTakeaways.length - 1;
                  return (
                    <li 
                      key={index} 
                      className={`flex items-start gap-3 text-sm leading-relaxed ${
                        isConclusion 
                          ? 'pt-3 mt-3 border-t border-blue-500/30 font-semibold text-white' 
                          : 'text-slate-200'
                      }`}
                    >
                      <span className={`font-bold mt-0.5 ${isConclusion ? 'text-blue-300' : 'text-blue-400'}`}>
                        {isConclusion ? '→' : '•'}
                      </span>
                      <span className="flex-1">{takeaway}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        <div className="p-6 space-y-8">
          {/* 2. Analyse MaximusSCPI - Avantages et Points d'attention (interprétation) */}
          {(advantages.length > 0 || pointsAttention.length > 0) && (
            <div className="bg-purple-500/10 rounded-xl border-2 border-purple-500/30 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Analyse MaximusSCPI</h3>
                  <p className="text-xs text-purple-300/70 mt-0.5">Lecture structurée et interprétation</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avantages */}
                {advantages.length > 0 && (
                  <div className="bg-emerald-500/10 rounded-lg p-5 border border-emerald-500/20 shadow-md">
                    <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Avantages
                    </h4>
                    <ul className="space-y-3">
                      {advantages.map((advantage, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="flex-1">{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Inconvénients / Points d'attention */}
                {pointsAttention.length > 0 && (
                  <div className="bg-orange-500/10 rounded-lg p-5 border border-orange-500/20 shadow-md">
                    <h4 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Points d'attention
                    </h4>
                    <ul className="space-y-3">
                      {pointsAttention.map((point, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                          <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                          <span className="flex-1">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Chiffres clés */}
          <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              Chiffres clés
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Taux de distribution */}
              {(() => {
                const scpiForYield = scpiForAnalysis || scpi;
                const yieldInfo = getYieldDisplayInfo(scpiForYield);
                return (
                  <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <div className="text-xs text-slate-400">{yieldInfo.primaryLabel}</div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {yieldInfo.primaryValue.toFixed(2)}%
                    </div>
                    {yieldInfo.secondaryValue && (
                      <div className="mt-2 pt-2 border-t border-slate-600">
                        <div className="text-xs text-slate-500 mb-1">{yieldInfo.secondaryLabel}</div>
                        <div className="text-lg font-semibold text-slate-300">
                          {yieldInfo.secondaryValue.toFixed(2)}%
                        </div>
                      </div>
                    )}
                    {yieldInfo.netNotAvailable && (
                      <div className="mt-2 pt-2 border-t border-amber-500/30">
                        <div className="text-xs text-amber-400 font-medium">
                          ⚠️ Taux net non communiqué
                        </div>
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-slate-600">
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {yieldInfo.legalNotice}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TOF */}
              <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-4 h-4 text-blue-400" />
                  <div className="text-xs text-slate-400">TOF</div>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {(scpiForAnalysis?.tof ?? scpi.tof).toFixed(1)}%
                </div>
              </div>

              {/* Décote/Surcote */}
              <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-600 hover:bg-slate-800/70 transition-colors">
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
              {(() => {
                const cap = scpiForAnalysis?.capitalization ?? scpi.capitalization;
                const capCategory = getCapitalizationCategory(cap);
                const capM = cap / 1000000;
                const capB = cap / 1000000000;
                const formattedCap = capM >= 1000 ? `${capB.toFixed(1)}Md€` : `${capM.toFixed(0)}M€`;
                
                return (
                  <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <div className="text-xs text-slate-400">Capitalisation</div>
                    </div>
                    <div className="text-2xl font-bold text-purple-400 mb-1">
                      {formattedCap}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {capCategory.label}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1 leading-tight">
                      {capCategory.liquidityQualification}
                    </div>
                  </div>
                );
              })()}

              {/* Note */}
              <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-600 hover:bg-slate-800/70 transition-colors">
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

          {/* 4. Profil de Risque (SRRI) */}
          {scpi.profilRisque !== undefined && scpi.profilRisque !== null && (
            <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-400" />
                Profil de Risque (SRRI)
              </h3>
              {/* Version mobile : compact */}
              <div className="md:hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                      const isActive = level <= scpi.profilRisque!;
                      let colorClass = 'bg-slate-600';
                      if (isActive) {
                        if (level <= 3) {
                          colorClass = 'bg-emerald-500';
                        } else if (level === 4) {
                          colorClass = 'bg-orange-400';
                        } else if (level <= 6) {
                          colorClass = 'bg-orange-600';
                        } else {
                          colorClass = 'bg-red-500';
                        }
                      }
                      return (
                        <div
                          key={level}
                          className={`w-5 h-6 rounded ${colorClass} transition-all flex items-center justify-center text-xs font-bold text-white ${
                            isActive ? 'opacity-100' : 'opacity-30'
                          }`}
                          title={`Niveau ${level}`}
                        >
                          {level}
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-lg font-bold text-white ml-2">{scpi.profilRisque}/7</span>
                </div>
                <div className="text-xs text-slate-400 text-center">
                  {scpi.profilRisque <= 3 ? 'Prudent' : scpi.profilRisque <= 5 ? 'Équilibré' : 'Dynamique'}
                </div>
              </div>
              {/* Version desktop : large */}
              <div className="hidden md:block">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                      const isActive = level <= scpi.profilRisque!;
                      let colorClass = 'bg-slate-600';
                      if (isActive) {
                        if (level <= 3) {
                          colorClass = 'bg-emerald-500';
                        } else if (level === 4) {
                          colorClass = 'bg-orange-400';
                        } else if (level <= 6) {
                          colorClass = 'bg-orange-600';
                        } else {
                          colorClass = 'bg-red-500';
                        }
                      }
                      return (
                        <div
                          key={level}
                          className={`flex-1 h-8 rounded ${colorClass} transition-all flex items-center justify-center text-sm font-bold text-white ${
                            isActive ? 'opacity-100' : 'opacity-30'
                          }`}
                          title={`Niveau ${level}`}
                        >
                          {level}
                        </div>
                      );
                    })}
                  </div>
                  <div className="ml-2 text-lg font-bold text-white min-w-[2rem] text-right">
                    {scpi.profilRisque}/7
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Prudent</span>
                  <span>Équilibré</span>
                  <span>Dynamique</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. Répartitions sectorielle et géographique */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <PieChart className="w-6 h-6 text-blue-400" />
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
                      data={[...scpi.sectors].sort((a, b) => b.value - a.value)}
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
                      {scpi.sectors.sort((a, b) => b.value - a.value).map((entry, index) => (
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
                {scpi.sectors.sort((a, b) => b.value - a.value).map((sector, index) => (
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

            <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <PieChart className="w-6 h-6 text-green-400" />
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
                      data={[...scpi.geography].sort((a, b) => b.value - a.value)}
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
                      {scpi.geography.sort((a, b) => b.value - a.value).map((entry, index) => (
                        <Cell
                          key={`cell-geo-${index}`}
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
                {scpi.geography.sort((a, b) => b.value - a.value).map((geo, index) => (
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

          {/* Séparateur visuel */}
          <div className="border-t border-slate-600/50 my-2"></div>

          {/* 6. Tableau de Bord Technique */}
          <div className="bg-slate-700/30 rounded-xl border border-slate-700 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              Tableau de Bord Technique
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Structure & Frais
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <div className="text-xs text-emerald-400 font-semibold">Prix de la part</div>
                    </div>
                    <div className="text-lg font-bold text-emerald-400">
                      {scpi.price.toFixed(2)}€
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <div className="text-xs text-slate-400">Minimum souscription</div>
                    </div>
                    <div className="text-lg font-bold text-white">
                      {scpi.minInvestment.toFixed(2)}€
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
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
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
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
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
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
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <div className="text-xs text-slate-400">Immeubles</div>
                    </div>
                    {nbImmeubles !== undefined ? (
                      <div className="text-lg font-bold text-white">
                        {nbImmeubles}
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                  {scpi.versementLoyers && (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div className="text-xs text-slate-400">Versement des loyers</div>
                      </div>
                      <div className="text-lg font-bold text-white">{scpi.versementLoyers}</div>
                    </div>
                  )}
                  {scpi.dureeDetentionRecommandee !== undefined && (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div className="text-xs text-slate-400">Durée détention recommandée</div>
                      </div>
                      <div className="text-lg font-bold text-white">{scpi.dureeDetentionRecommandee} ans</div>
                    </div>
                  )}
                  {scpi.sfdr && (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <div className="text-xs text-slate-400">SFDR</div>
                      </div>
                      <div className="text-lg font-bold text-white">{scpi.sfdr}</div>
                    </div>
                  )}
                  {scpi.profilCible && (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <div className="text-xs text-slate-400">Profil cible</div>
                      </div>
                      <div className="text-lg font-bold text-white">{scpi.profilCible}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Indicateurs Locatifs */}
              <div>
                <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Indicateurs Locatifs
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <div className="text-xs text-slate-400">Nombre de locataires</div>
                    </div>
                    {nombreLocataires !== undefined ? (
                      <div className="text-lg font-bold text-white">{nombreLocataires}</div>
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <div className="text-xs text-slate-400">WALT</div>
                    </div>
                    {walt !== undefined ? (
                      <div className="text-lg font-bold text-white">{walt.toFixed(1)} ans</div>
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <div className="text-xs text-slate-400">WALB</div>
                    </div>
                    {walb !== undefined ? (
                      <div className="text-lg font-bold text-white">{walb.toFixed(1)} ans</div>
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                </div>
                
                {/* Données trimestrielles */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-cyan-400" />
                      <div className="text-xs text-slate-400">Collecte nette trimestre</div>
                    </div>
                    {collecteNetteTrimestre !== undefined ? (
                      <div className="text-lg font-bold text-white">
                        {(collecteNetteTrimestre / 1000000).toFixed(1)}M€
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-cyan-400" />
                      <div className="text-xs text-slate-400">Nb cessions trimestre</div>
                    </div>
                    {nbCessionsTrimestre !== undefined ? (
                      <div className="text-lg font-bold text-white">{nbCessionsTrimestre}</div>
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="w-4 h-4 text-cyan-400" />
                      <div className="text-xs text-slate-400">Endettement</div>
                    </div>
                    {scpi.ltv !== undefined || scpiForAnalysis?.debt !== undefined ? (
                      <div className="text-lg font-bold text-white">
                        {(scpi.ltv ?? scpiForAnalysis?.debt)?.toFixed(1)}%
                      </div>
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
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <div className="text-xs text-emerald-400 font-semibold">Val. Reconstitution</div>
                    </div>
                    {(scpi.reconstitutionValue !== undefined || scpi.valeurReconstitution !== undefined) ? (
                      <div className="text-lg font-bold text-emerald-400">
                        {(scpi.reconstitutionValue ?? scpi.valeurReconstitution)?.toFixed(2)}€
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-slate-500">N/A</div>
                    )}
                  </div>
                  {(scpi.valeurRetrait !== undefined || scpi.reconstitutionValue !== undefined || scpi.valeurReconstitution !== undefined) && (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
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
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <div className="text-xs text-slate-400">Val. Réalisation</div>
                      </div>
                      <div className="text-lg font-bold text-white">{scpi.valeurRealisation.toFixed(2)}€</div>
                    </div>
                  )}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
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
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <div className="text-xs text-slate-400">Distribution (€/part)</div>
                      </div>
                      <div className="text-lg font-bold text-white">{scpi.distribution.toFixed(2)}€</div>
                    </div>
                  )}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
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
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-800/70 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <div className="text-xs text-emerald-400 font-semibold">Taux d'Occupation</div>
                    </div>
                    <div className="text-lg font-bold text-emerald-400">{(scpiForAnalysis?.tof ?? scpi.tof)}%</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-600 shadow-md">
                <div className="text-sm font-semibold text-slate-300 mb-3">Stratégie d'Investissement</div>
                <p className="text-sm text-slate-400 leading-relaxed">{scpi.strategy}</p>
              </div>

            </div>
          </div>

          {/* Séparateur visuel */}
          <div className="border-t border-slate-600/50 my-2"></div>

          {/* 7. Actualité Trimestrielle (bulletin) - Toujours affichée ouverte */}
          {quarterlyNews && (
            <div className="bg-slate-700/30 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Newspaper className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white">Actualité Trimestrielle</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {periodeBulletin ? `Bulletin ${periodeBulletin}` : 'Données officielles du bulletin'}
                    </p>
                  </div>
                </div>
                <div 
                  className="text-sm text-slate-200 leading-relaxed space-y-3 bg-slate-800/40 rounded-lg p-5 border border-blue-500/20"
                  dangerouslySetInnerHTML={{ __html: quarterlyNews }}
                />
              </div>
            </div>
          )}

          {/* 8. Notes et mentions */}
          <div className="bg-blue-500/10 rounded-lg p-5 border border-blue-500/20 shadow-md">
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

        <div 
          className="sticky bottom-0 bg-slate-800 border-t border-slate-700 px-6 py-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Fermer l'analyse
            </button>
            {onAdd && !isSelected && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Action terminale : ajouter et fermer immédiatement
                  onAdd();
                  // Afficher le toast de confirmation
                  if (onShowToast) {
                    onShowToast(`SCPI ajoutée à votre sélection`);
                  }
                  // Fermer le modal immédiatement
                  onClose();
                }}
                className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Ajouter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetailModal;
