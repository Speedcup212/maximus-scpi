import React from 'react';
import { TrendingUp } from 'lucide-react';
import PieChart from './PieChart';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface ChartWidgetProps {
  title: string;
  data: ChartData[];
  showPercentages?: boolean;
  animated?: boolean;
  showLabels?: boolean;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ 
  title, 
  data, 
  showPercentages = true, 
  animated = true,
  showLabels = false 
}) => {

  const chartData = data.length > 0 ? data : [];
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        {chartData.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <TrendingUp className="w-4 h-4" />
            <span className="font-semibold">{chartData.length}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-center mb-6">
        <PieChart 
          data={chartData} 
          animated={animated}
          showLabels={showLabels}
        />
      </div>
      
      {chartData.length > 0 ? (
        <div className="space-y-3">
          {chartData.map((item, index) => {
            const percentage = showPercentages 
              ? (item.value / total) * 100 
              : item.value;
            
            return (
              <div 
                key={item.name} 
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {showPercentages ? `${percentage.toFixed(1)}%` : `${item.value}`}
                  </span>
                  {!showPercentages && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      SCPI
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Barre de progression totale */}
          {showPercentages && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Répartition totale
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  100%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Aucune donnée disponible
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sélectionnez vos SCPI pour voir la répartition
          </p>
        </div>
      )}
    </div>
  );
};

export default ChartWidget;