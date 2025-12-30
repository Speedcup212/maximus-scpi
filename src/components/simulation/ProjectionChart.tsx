import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { useAllocation } from '../../contexts/AllocationContext';

interface ProjectionChartProps {
  selectedScpis: SCPIExtended[];
}

const ProjectionChart: React.FC<ProjectionChartProps> = ({ selectedScpis }) => {
  const { totalInvestment, getWeightedYield } = useAllocation();

  const data = useMemo(() => {
    const weightedYield = getWeightedYield(selectedScpis) / 100;
    const years = 15;
    const chartData = [];

    for (let year = 0; year <= years; year++) {
      const totalValue = totalInvestment + (totalInvestment * weightedYield * year);
      chartData.push({
        year: year,
        capital: totalInvestment,
        value: Math.round(totalValue)
      });
    }

    return chartData;
  }, [totalInvestment, selectedScpis, getWeightedYield]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-slate-400 mb-2">Année {payload[0].payload.year}</p>
          <p className="text-sm font-semibold text-blue-400">
            Capital initial: {payload[0].value.toLocaleString('fr-FR')}€
          </p>
          <p className="text-sm font-semibold text-emerald-400">
            Valeur totale: {payload[1].value.toLocaleString('fr-FR')}€
          </p>
          <p className="text-sm font-semibold text-purple-400 mt-1">
            Gains: {(payload[1].value - payload[0].value).toLocaleString('fr-FR')}€
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="year"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            label={{ value: 'Années', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K€`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="capital"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCapital)"
            name="Capital Initial"
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
            name="Valeur Projetée"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectionChart;
