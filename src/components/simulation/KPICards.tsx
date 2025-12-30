import React from 'react';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { useAllocation } from '../../contexts/AllocationContext';

interface KPICardsProps {
  selectedScpis: SCPIExtended[];
}

const KPICards: React.FC<KPICardsProps> = ({ selectedScpis }) => {
  const { getWeightedYield, getMonthlyRevenue, getTenYearProjection } = useAllocation();

  const weightedYield = getWeightedYield(selectedScpis);
  const monthlyRevenue = getMonthlyRevenue(selectedScpis);
  const tenYearProjection = getTenYearProjection(selectedScpis);

  const kpis = [
    {
      icon: TrendingUp,
      label: 'Rendement Moyen Pondéré',
      value: `${weightedYield.toFixed(2)}%`,
      color: 'emerald',
      bgGradient: 'from-emerald-500/20 to-emerald-600/20',
      iconBg: 'bg-emerald-500/20',
      textColor: 'text-emerald-400'
    },
    {
      icon: DollarSign,
      label: 'Revenus Mensuels Estimés',
      value: `${monthlyRevenue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€`,
      color: 'blue',
      bgGradient: 'from-blue-500/20 to-blue-600/20',
      iconBg: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      icon: Calendar,
      label: 'Gain Total sur 10 ans',
      value: `${tenYearProjection.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€`,
      color: 'purple',
      bgGradient: 'from-purple-500/20 to-purple-600/20',
      iconBg: 'bg-purple-500/20',
      textColor: 'text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className={`bg-gradient-to-br ${kpi.bgGradient} rounded-2xl p-6 border border-slate-700 shadow-xl`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${kpi.textColor}`} />
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-2">{kpi.label}</p>
            <p className={`text-3xl font-bold ${kpi.textColor}`}>{kpi.value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
