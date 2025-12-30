import React from 'react';
import { Building, MapPin, TrendingUp } from 'lucide-react';
import { Scpi } from '../types/scpi';
import PieChart3DInteractive from './PieChart3DInteractive';

interface MarketChartsProps {
  scpiData: Scpi[];
  selectedScpi?: Scpi[];
}

const MarketCharts: React.FC<MarketChartsProps> = ({ scpiData, selectedScpi = [] }) => {
  // 🛡️ Sécurisation des données
  if (!scpiData || !Array.isArray(scpiData) || scpiData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-600">
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-2">
              Données SCPI non disponibles
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Impossible de charger les données du marché
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!Array.isArray(selectedScpi)) {
    console.warn('⚠️ selectedScpi n\'est pas un tableau, utilisation d\'un tableau vide');
    selectedScpi = [];
  }

  // Préparer les données pour les graphiques 3D
  const sectorData = Object.entries(
    scpiData.reduce((acc, scpi) => {
      if (scpi && scpi.sector && typeof scpi.sector === 'string') {
        acc[scpi.sector] = (acc[scpi.sector] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([sector, count], index) => ({
    name: {
      'bureaux': '🏢 Bureaux',
      'commerces': '🏬 Commerces',
      'residentiel': '🏠 Résidentiel',
      'sante': '🏥 Santé',
      'logistique': '📦 Logistique',
      'hotellerie': '🏨 Hôtellerie',
      'diversifie': '🏗️ Diversifié'
    }[sector] || sector,
    value: count,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'][index % 7]
  }));

  const geoData = Object.entries(
    scpiData.reduce((acc, scpi) => {
      if (scpi && scpi.geography && typeof scpi.geography === 'string') {
        acc[scpi.geography] = (acc[scpi.geography] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([geo, count], index) => ({
    name: {
      'france': '🇫🇷 France',
      'europe': '🇪🇺 Europe',
      'international': '🌍 International'
    }[geo] || geo,
    value: count,
    color: ['#1e40af', '#059669', '#dc2626'][index % 3]
  }));
  return (
    <div className="space-y-6">
      {/* Graphiques du marché global */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition sectorielle du marché */}
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900 dark:text-white">
                Répartition Sectorielle
              </h4>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Marché global des SCPI
              </p>
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
            <PieChart3DInteractive
              data={sectorData}
              radius={5}
              height={1}
              animated={true}
            />
          </div>
          
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center mt-4 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
            Répartition des {scpiData.length} SCPI par secteur d'activité
          </p>
        </div>

        {/* Répartition géographique du marché */}
        <div className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900 dark:text-white">
                Répartition Géographique
              </h4>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Zones d'investissement
              </p>
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
            <PieChart3DInteractive
              data={geoData}
              radius={5}
              height={1}
              animated={true}
            />
          </div>
          
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center mt-4 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
            Exposition géographique des SCPI disponibles
          </p>
        </div>
      </div>

      {/* Graphique du portefeuille sélectionné */}
      {selectedScpi.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-600 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900 dark:text-white">
                Votre Sélection SCPI
              </h4>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Répartition de vos {selectedScpi.length} SCPI sélectionnées
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
              <PieChart3DInteractive
                data={selectedScpi.map((scpi, index) => ({
                  name: scpi.name,
                  value: 100 / selectedScpi.length,
                  color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 6]
                }))}
                radius={4}
                height={0.8}
                animated={true}
              />
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700 shadow-lg">
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-2">Rendement moyen</div>
                <div className="text-3xl font-black text-purple-800 dark:text-purple-200">
                  {(selectedScpi.reduce((sum, scpi) => sum + scpi.yield, 0) / selectedScpi.length).toFixed(2)}%
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-700 shadow-lg">
                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-2">Diversification</div>
                <div className="text-3xl font-black text-indigo-800 dark:text-indigo-200">
                  {[...new Set(selectedScpi.map(s => s.sector))].length} secteurs
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700 shadow-lg">
                <div className="text-sm font-bold text-green-600 dark:text-green-400 mb-2">Label ISR</div>
                <div className="text-3xl font-black text-green-800 dark:text-green-200">
                  {selectedScpi.filter(scpi => scpi.isr).length}/{selectedScpi.length}
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400 text-center mt-6 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg">
            Répartition sectorielle de votre sélection actuelle
          </p>
        </div>
      )}
    </div>
  );
};

export default MarketCharts;