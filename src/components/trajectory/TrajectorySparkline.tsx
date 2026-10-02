import React, { useMemo } from 'react';

type TrajectorySparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
  strokeWidth?: number;
};

const TrajectorySparkline: React.FC<TrajectorySparklineProps> = ({
  values,
  width = 92,
  height = 28,
  className = 'text-sky-300',
  strokeWidth = 2,
}) => {
  const points = useMemo(() => {
    const finite = values.filter(Number.isFinite);
    if (finite.length === 0) return '';
    if (finite.length === 1) return `${width / 2},${height / 2}`;

    const min = Math.min(...finite);
    const max = Math.max(...finite);
    const range = max - min || 1;
    const xStep = width / (finite.length - 1);
    const paddingY = 3;
    const usableHeight = height - paddingY * 2;

    return finite
      .map((value, index) => {
        const x = index * xStep;
        const y = paddingY + (1 - (value - min) / range) * usableHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [values, width, height]);

  if (!points) {
    return <span className="text-[11px] text-slate-500">N.D.</span>;
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="Évolution historique"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export default TrajectorySparkline;
