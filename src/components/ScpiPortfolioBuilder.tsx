import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, AlertCircle } from 'lucide-react';

// Types pour le portfolio
export interface PortfolioLine {
  scpiId: string;
  scpiName: string;
  rendementBrut: number;
  weightPercent: number;
  weightAmount: number;
}

export interface ScpiDataForPortfolio {
  id: string;
  name: string;
  rendementBrut: number;
  revaloMoyenne: number;
  partFrance: number;
  partEtranger: number;
  company: string;
  disponibleAssuranceVie?: boolean;
  disponibleSciIs?: boolean;
}

interface ScpiPortfolioBuilderProps {
  scpis: ScpiDataForPortfolio[];
  montantTotal: number;
  portfolio: PortfolioLine[];
  onChangePortfolio: (portfolio: PortfolioLine[]) => void;
}

const ScpiPortfolioBuilder: React.FC<ScpiPortfolioBuilderProps> = ({
  scpis,
  montantTotal,
  portfolio,
  onChangePortfolio
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const formatEuro = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Filtrer les SCPI disponibles (non déjà ajoutées)
  const selectedScpiIds = portfolio.map(line => line.scpiId);
  const availableScpis = scpis.filter(scpi => !selectedScpiIds.includes(scpi.id));

  // Filtrer selon la recherche
  const filteredScpis = useMemo(() => {
    if (!searchQuery) return availableScpis;
    const query = searchQuery.toLowerCase();
    return availableScpis.filter(scpi =>
      scpi.name.toLowerCase().includes(query) ||
      scpi.company.toLowerCase().includes(query)
    );
  }, [searchQuery, availableScpis]);

  // Ajouter une SCPI au portfolio
  const handleAddScpi = (scpi: ScpiDataForPortfolio) => {
    const newLine: PortfolioLine = {
      scpiId: scpi.id,
      scpiName: scpi.name,
      rendementBrut: scpi.rendementBrut,
      weightPercent: 0,
      weightAmount: 0
    };
    onChangePortfolio([...portfolio, newLine]);
    setSearchQuery('');
    setShowDropdown(false);
  };

  // Supprimer une ligne
  const handleRemoveLine = (index: number) => {
    const newPortfolio = portfolio.filter((_, i) => i !== index);
    onChangePortfolio(newPortfolio);
  };

  // Modifier le poids en %
  const handleChangePercent = (index: number, value: number) => {
    const newPortfolio = [...portfolio];
    newPortfolio[index].weightPercent = value;
    newPortfolio[index].weightAmount = (value / 100) * montantTotal;
    onChangePortfolio(newPortfolio);
  };

  // Modifier le montant
  const handleChangeAmount = (index: number, value: number) => {
    const newPortfolio = [...portfolio];
    newPortfolio[index].weightAmount = value;
    newPortfolio[index].weightPercent = montantTotal > 0 ? (value / montantTotal) * 100 : 0;
    onChangePortfolio(newPortfolio);
  };

  // Répartition équilibrée automatique
  const handleAutoBalance = () => {
    if (portfolio.length === 0) return;
    const equalPercent = 100 / portfolio.length;
    const newPortfolio = portfolio.map(line => ({
      ...line,
      weightPercent: equalPercent,
      weightAmount: (equalPercent / 100) * montantTotal
    }));
    onChangePortfolio(newPortfolio);
  };

  // Calculs totaux
  const totalPercent = portfolio.reduce((sum, line) => sum + line.weightPercent, 0);
  const totalAmount = portfolio.reduce((sum, line) => sum + line.weightAmount, 0);

  return (
    <div className="space-y-4">
      {/* Info pédagogique */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Construisez un portefeuille</strong> à partir des SCPI disponibles.
          <br />
          Les rendements utilisés sont les derniers taux de distribution connus pour chaque SCPI.
          Ils ne sont pas garantis et sont utilisés uniquement comme base de travail pour la simulation.
        </p>
      </div>

      {/* Zone de recherche et ajout */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher une SCPI (nom, gestionnaire)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-10 pr-3 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Dropdown résultats */}
        {showDropdown && searchQuery && filteredScpis.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto z-50">
            {filteredScpis.slice(0, 10).map((scpi) => (
              <button
                key={scpi.id}
                onClick={() => handleAddScpi(scpi)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                  {scpi.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {scpi.company} • Rendement {scpi.rendementBrut}%
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Liste des SCPI du portfolio */}
      {portfolio.length > 0 ? (
        <>
          <div className="space-y-3">
            {portfolio.map((line, index) => (
              <div
                key={`${line.scpiId}-${index}`}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {line.scpiName}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Rendement : {line.rendementBrut}%
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveLine(index)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Poids en % */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Poids (%)
                    </label>
                    <input
                      type="number"
                      value={line.weightPercent.toFixed(2)}
                      onChange={(e) => handleChangePercent(index, parseFloat(e.target.value) || 0)}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Montant */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Montant (€)
                    </label>
                    <input
                      type="number"
                      value={Math.round(line.weightAmount)}
                      onChange={(e) => handleChangeAmount(index, parseFloat(e.target.value) || 0)}
                      min={0}
                      step={1000}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleAutoBalance}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-400 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Répartir équitablement
            </button>
          </div>

          {/* Totaux */}
          <div className={`rounded-lg p-4 border-2 ${
            Math.abs(totalPercent - 100) < 0.01
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-700'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-700'
          }`}>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-900 dark:text-white">Total alloué :</span>
                <span className={`font-bold ${
                  Math.abs(totalPercent - 100) < 0.01
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}>
                  {totalPercent.toFixed(2)} % • {formatEuro(totalAmount)}
                </span>
              </div>

              {Math.abs(totalPercent - 100) > 0.01 && (
                <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Le total doit être égal à 100% ({formatEuro(montantTotal)}).
                    Différence : {(100 - totalPercent).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucune SCPI sélectionnée</p>
          <p className="text-xs mt-1">Utilisez la barre de recherche ci-dessus pour ajouter des SCPI</p>
        </div>
      )}
    </div>
  );
};

export default ScpiPortfolioBuilder;
