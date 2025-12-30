import React, { useState } from 'react';
import InvestorProfileQuestionnaire from './InvestorProfileQuestionnaire';
import SelectionSimulator from './SelectionSimulator';
import { Scpi } from '../types/scpi';

interface SmartFiltersProps {
  availableScpi: Scpi[];
  selectedScpi: Scpi[];
}

const SmartFilters: React.FC<SmartFiltersProps> = ({ availableScpi, selectedScpi }) => {
  const [mode, setMode] = useState<'default' | 'ia' | 'selection'>('default');

  return (
    <div className="w-full h-full">
      {mode === 'default' && (
        <div className="p-6 bg-white shadow rounded">
          <h2 className="text-xl font-bold mb-4">Mon portefeuille</h2>

          {/* Liste des SCPI sélectionnées */}
          <ul className="mb-6">
            {selectedScpi.length > 0 ? (
              selectedScpi.map((scpi) => (
                <li key={scpi.id} className="py-1 border-b">
                  {scpi.name}
                </li>
              ))
            ) : (
              <li className="text-gray-500">Aucune SCPI sélectionnée</li>
            )}
          </ul>

          {/* Boutons */}
          <div className="grid grid-cols-1 gap-3 mt-4">
            <button
              onClick={() => setMode('ia')}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transform hover:scale-105"
            >
              🤖 Simuler avec l'IA
            </button>

            <button
              onClick={() => setMode('selection')}
              className="px-6 py-3 bg-gray-100 rounded hover:bg-gray-200"
            >
              📊 Simuler ma sélection
            </button>
          </div>
        </div>
      )}

      {mode === 'ia' && (
        <InvestorProfileQuestionnaire
          onClose={() => setMode('default')}
          availableScpi={availableScpi}
          selectedScpi={selectedScpi}
        />
      )}

      {mode === 'selection' && (
        <SelectionSimulator
          onClose={() => setMode('default')}
          selectedScpi={selectedScpi}
        />
      )}
    </div>
  );
};

export default SmartFilters;