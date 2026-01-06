import React, { useMemo } from 'react';
import { Shuffle, AlertCircle } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { useAllocation } from '../../contexts/AllocationContext';

interface AllocationSlidersProps {
  selectedScpis: SCPIExtended[];
}

const AllocationSliders: React.FC<AllocationSlidersProps> = ({ selectedScpis }) => {
  const { weights, setWeight, distributeEqually, getAllocationDetails, totalInvestment } = useAllocation();

  const allocationDetails = useMemo(() =>
    getAllocationDetails(selectedScpis),
    [selectedScpis, getAllocationDetails]
  );

  const totalWeight = useMemo(() =>
    allocationDetails.reduce((sum, detail) => sum + detail.weight, 0),
    [allocationDetails]
  );

  const isInvalid = Math.abs(totalWeight - 100) > 0.1;

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Répartition Personnalisée</h3>
          <p className="text-sm text-slate-400 mt-1">
            Ajustez les poids de chaque SCPI dans votre portefeuille
          </p>
        </div>
        <button
          onClick={() => distributeEqually(selectedScpis)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
        >
          <Shuffle className="w-4 h-4" />
          <span>Répartir équitablement</span>
        </button>
      </div>

      {/* Total Weight Indicator */}
      <div className={`mb-6 p-4 rounded-xl border-2 ${
        isInvalid
          ? 'bg-red-500/10 border-red-500/50'
          : 'bg-emerald-500/10 border-emerald-500/50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isInvalid && <AlertCircle className="w-5 h-5 text-red-400" />}
            <span className={`font-semibold ${isInvalid ? 'text-red-400' : 'text-emerald-400'}`}>
              Total: {totalWeight.toFixed(1)}%
            </span>
          </div>
          {isInvalid && (
            <span className="text-sm text-red-400">
              La somme doit être égale à 100%
            </span>
          )}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        {selectedScpis.map((scpi) => {
          const weight = weights[scpi.id] || 0;
          const amount = (totalInvestment * weight) / 100;

          return (
            <div key={scpi.id} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-base font-bold text-white">{scpi.name}</h4>
                  <p className="text-xs text-slate-400">{scpi.managementCompany}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">{weight.toFixed(1)}%</p>
                  <p className="text-sm text-slate-400">{amount.toLocaleString('fr-FR')}€</p>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(scpi.id, Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-emerald"
              />

              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .slider-emerald::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #10b981;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
        .slider-emerald::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #10b981;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
          border: none;
        }
      `}</style>
    </div>
  );
};

export default AllocationSliders;
