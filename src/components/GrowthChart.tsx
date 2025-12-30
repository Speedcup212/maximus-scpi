import React from 'react';

interface DataPoint {
  year: number;
  value: number;
  label: string;
}

interface GrowthChartProps {
  data: DataPoint[];
  initialValue: number;
  onPointClick?: (point: DataPoint) => void;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data, initialValue, onPointClick }) => {
  const width = 800;
  const height = 300;
  const padding = { top: 40, right: 40, bottom: 50, left: 80 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find min and max values
  const allValues = [initialValue, ...data.map(d => d.value)];
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const maxYear = Math.max(...data.map(d => d.year));

  // Add some padding to the scale
  const valueRange = maxValue - minValue;
  const minY = minValue - valueRange * 0.1;
  const maxY = maxValue + valueRange * 0.1;

  // Scale functions
  const xScale = (year: number) => padding.left + (year / maxYear) * chartWidth;
  const yScale = (value: number) => padding.top + chartHeight - ((value - minY) / (maxY - minY)) * chartHeight;

  // Generate path for the curve
  const allPoints = [{ year: 0, value: initialValue }, ...data];
  const pathData = allPoints.map((point, i) => {
    const x = xScale(point.year);
    const y = yScale(point.value);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Generate gradient path (area under curve)
  const gradientPath = `${pathData} L ${xScale(maxYear)} ${yScale(minY)} L ${xScale(0)} ${yScale(minY)} Z`;

  // Format currency for display
  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
    if (value >= 1000) return `${Math.round(value / 1000)}k€`;
    return `${Math.round(value)}€`;
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ minWidth: '600px' }}
      >
        <defs>
          {/* Gradient for area */}
          <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>

          {/* Drop shadow for line */}
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((percent, i) => {
          const y = padding.top + chartHeight * (1 - percent);
          const value = minY + (maxY - minY) * percent;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="text-gray-300 dark:text-gray-600"
                opacity="0.5"
              />
              <text
                x={padding.left - 10}
                y={y}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-xs fill-gray-600 dark:fill-gray-400"
              >
                {formatValue(value)}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {allPoints.map((point, i) => (
          <text
            key={`x-${i}`}
            x={xScale(point.year)}
            y={height - padding.bottom + 25}
            textAnchor="middle"
            className="text-xs fill-gray-600 dark:fill-gray-400 font-medium"
          >
            {point.year === 0 ? 'Départ' : `${point.year} an${point.year > 1 ? 's' : ''}`}
          </text>
        ))}

        {/* Area under curve (gradient fill) */}
        <path
          d={gradientPath}
          fill="url(#areaGradient)"
          className="transition-all duration-1000"
          style={{
            animation: 'fadeIn 1s ease-in-out'
          }}
        />

        {/* Main line */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#shadow)"
          className="transition-all duration-1000"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: 1000,
            animation: 'drawLine 2s ease-out forwards'
          }}
        />

        {/* Points */}
        {allPoints.map((point, i) => (
          <g
            key={`point-${i}`}
            className="cursor-pointer transition-all duration-300"
            onClick={() => onPointClick && i > 0 && onPointClick(data[i - 1])}
            style={{
              animation: `fadeIn 0.5s ease-out ${0.5 + i * 0.2}s backwards`
            }}
          >
            {/* Outer ring */}
            <circle
              cx={xScale(point.year)}
              cy={yScale(point.value)}
              r="8"
              className="fill-white dark:fill-gray-800 stroke-blue-500 dark:stroke-blue-400"
              strokeWidth="2"
            />
            {/* Inner dot */}
            <circle
              cx={xScale(point.year)}
              cy={yScale(point.value)}
              r="4"
              className="fill-blue-500 dark:fill-blue-400"
            />

            {/* Hover effect */}
            <circle
              cx={xScale(point.year)}
              cy={yScale(point.value)}
              r="12"
              className="fill-blue-500 dark:fill-blue-400 opacity-0 hover:opacity-20 transition-opacity duration-300"
            />

            {/* Value label on hover */}
            <g className="opacity-0 hover:opacity-100 transition-opacity duration-300">
              <rect
                x={xScale(point.year) - 40}
                y={yScale(point.value) - 35}
                width="80"
                height="25"
                rx="6"
                className="fill-gray-900 dark:fill-gray-100"
              />
              <text
                x={xScale(point.year)}
                y={yScale(point.value) - 18}
                textAnchor="middle"
                className="text-xs font-bold fill-white dark:fill-gray-900"
              >
                {formatValue(point.value)}
              </text>
            </g>
          </g>
        ))}

        <style>
          {`
            @keyframes drawLine {
              to {
                stroke-dashoffset: 0;
              }
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </svg>
    </div>
  );
};

export default GrowthChart;
