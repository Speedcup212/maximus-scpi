import React, { useMemo } from 'react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { useAllocation } from '../../contexts/AllocationContext';
import PieChart from '../PieChart';

interface SectorAllocationProps {
  selectedScpis: SCPIExtended[];
}

const COLORS = [
  '#2563eb', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
  '#ec4899', '#6366f1', '#fb923c', '#4ade80'
];

const SectorAllocation: React.FC<SectorAllocationProps> = ({ selectedScpis }) => {
  const { weights } = useAllocation();

  const sectorData = useMemo(() => {
    const sectorMap: Record<string, number> = {};

    selectedScpis.forEach(scpi => {
      const weight = weights[scpi.id] || 0;
      scpi.sectors.forEach(sector => {
        const weightedValue = (sector.value * weight) / 100;
        sectorMap[sector.name] = (sectorMap[sector.name] || 0) + weightedValue;
      });
    });

    return Object.entries(sectorMap)
      .map(([name, value], index) => ({
        name,
        value: Math.round(value * 10) / 10,
        color: COLORS[index % COLORS.length]
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [selectedScpis, weights]);

  if (sectorData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-400">
        <p>Aucune donnée sectorielle</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-emerald-400 mb-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
        Répartition Sectorielle
      </h4>

      <div className="flex justify-center mb-6">
        <PieChart data={sectorData} width={280} height={280} animated={true} />
      </div>

      <div className="space-y-2">
        {sectorData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-slate-300 font-medium">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-white">{item.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectorAllocation;
