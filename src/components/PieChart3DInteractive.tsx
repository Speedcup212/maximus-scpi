import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChart3DInteractiveProps {
  data: ChartData[];
  radius?: number;
  height?: number;
  animated?: boolean;
}

/**
 * Accessible interactive fallback for the legacy 3D pie-chart API.
 * The project does not install three, @react-three/fiber or @react-three/drei.
 * Keep financial proportions exact rather than silently faking 3D geometry
 * or adding large, unverified WebGL dependencies to the production bundle.
 */
const PieChart3DInteractive: React.FC<PieChart3DInteractiveProps> = ({
  data,
  radius = 5,
  animated = true,
}) => {
  const validData = useMemo(
    () => (Array.isArray(data) ? data : []).filter(
      (item): item is ChartData =>
        item !== null &&
        typeof item === 'object' &&
        typeof item.name === 'string' &&
        item.name.trim().length > 0 &&
        typeof item.value === 'number' &&
        Number.isFinite(item.value) &&
        item.value > 0 &&
        typeof item.color === 'string' &&
        item.color.trim().length > 0,
    ),
    [data],
  );

  const total = validData.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0 || !Number.isFinite(total)) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-xl">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aucune répartition vérifiable à afficher
        </p>
      </div>
    );
  }

  const outerRadius = Math.max(55, Math.min(105, radius * 20));
  return (
    <div
      className="w-full min-h-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-3 shadow-inner"
      aria-label="Graphique de répartition interactif"
    >
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={validData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={outerRadius}
              isAnimationActive={animated}
              stroke="#f8fafc"
              strokeWidth={1}
            >
              {validData.map((item, index) => (
                <Cell key={`${item.name}-${index}`} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                typeof value === 'number' && Number.isFinite(value)
                  ? value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
                  : '—',
                String(name),
              ] as [string, string]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
        {validData.map((item, index) => (
          <div key={`${item.name}-${index}`} className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-200">
            <span aria-hidden="true" className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
            <span>{item.name} : {(item.value / total * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart3DInteractive;
