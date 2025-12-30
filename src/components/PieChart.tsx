import React, { useEffect, useRef, useState } from 'react';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
  showLabels?: boolean;
  animated?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  width = 280, 
  height = 280, 
  showLabels = false,
  animated = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    // Reset animation when data changes
    setAnimationProgress(0);
    
    if (animated) {
      const startTime = Date.now();
      const duration = 1000; // 1 seconde

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function pour une animation plus fluide
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        setAnimationProgress(easeOutCubic);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    } else {
      setAnimationProgress(1);
    }
  }, [data, animated]);

  useEffect(() => {
    if (data.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration haute résolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Vérifier que nous avons des données valides
    const validData = data.filter(item => item.value > 0);
    if (validData.length === 0) return;

    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius * 0.4; // Donut chart
    const hoverRadius = outerRadius + 8;

    let currentAngle = -Math.PI / 2; // Commencer en haut
    const total = validData.reduce((sum, item) => sum + item.value, 0);

    validData.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI * animationProgress;
      const isHovered = hoveredSegment === index;
      const radius = isHovered ? hoverRadius : outerRadius;

      // Gradient pour chaque segment
      const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, radius);
      gradient.addColorStop(0, item.color + '40'); // Semi-transparent au centre
      gradient.addColorStop(1, item.color);

      // Dessiner le segment
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();

      ctx.fillStyle = gradient;
      ctx.fill();

      // Bordure avec effet de profondeur
      ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = isHovered ? 3 : 1;
      ctx.stroke();

      // Ombre portée pour l'effet 3D
      if (isHovered) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      } else {
        ctx.shadowColor = 'transparent';
      }

      // Labels sur les segments si demandé
      if (showLabels && sliceAngle > 0.2) { // Seulement si le segment est assez grand
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelRadius = (outerRadius + innerRadius) / 2;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${((item.value / total) * 100).toFixed(0)}%`, labelX, labelY);
      }

      currentAngle += sliceAngle;
    });

    // Texte central avec statistiques
    if (data.length > 0) {
      // Détecter le mode sombre via le canvas parent
      const isDarkMode = document.documentElement.classList.contains('dark');

      // Fond semi-transparent pour améliorer la lisibilité
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius - 5, 0, 2 * Math.PI);
      ctx.fillStyle = isDarkMode ? 'rgba(17, 24, 39, 0.85)' : 'rgba(255, 255, 255, 0.95)';
      ctx.fill();

      // Bordure subtile
      ctx.strokeStyle = isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Texte avec fond de lisibilité
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (hoveredSegment !== null) {
        const hoveredItem = data[hoveredSegment];
        const percentage = ((hoveredItem.value / total) * 100).toFixed(1);

        // Nom du segment
        ctx.fillStyle = isDarkMode ? '#f9fafb' : '#111827';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText(hoveredItem.name, centerX, centerY - 12);

        // Pourcentage en couleur
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillStyle = hoveredItem.color;
        ctx.fillText(`${percentage}%`, centerX, centerY + 12);
      } else {
        // Nombre d'éléments
        ctx.fillStyle = isDarkMode ? '#f9fafb' : '#111827';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.fillText(`${data.length}`, centerX, centerY - 6);

        // Label "éléments"
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillStyle = isDarkMode ? '#d1d5db' : '#6b7280';
        ctx.fillText('éléments', centerX, centerY + 14);
      }
    }
  }, [data, width, height, hoveredSegment, animationProgress, showLabels]);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setMousePos({ x: event.clientX, y: event.clientY });

    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius * 0.4;

    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    
    if (distance >= innerRadius && distance <= outerRadius + 8) {
      const angle = Math.atan2(y - centerY, x - centerX);
      const normalizedAngle = (angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
      
      const total = data.reduce((sum, item) => sum + item.value, 0);
      let currentAngle = 0;
      
      for (let i = 0; i < data.length; i++) {
        const sliceAngle = (data[i].value / total) * 2 * Math.PI;
        if (normalizedAngle >= currentAngle && normalizedAngle <= currentAngle + sliceAngle) {
          setHoveredSegment(i);
          return;
        }
        currentAngle += sliceAngle;
      }
    }
    
    setHoveredSegment(null);
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="font-medium">Aucune donnée</div>
          <div className="text-sm">Sélectionnez vos SCPI pour voir la répartition</div>
        </div>
      </div>
    );
  }

  const hoveredItem = hoveredSegment !== null ? data[hoveredSegment] : null;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer transition-all duration-200"
        style={{ filter: hoveredSegment !== null ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : 'none' }}
      />
      
      {/* Tooltip interactif */}
      {hoveredItem && (
        <div
          className="fixed z-50 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg shadow-xl border border-gray-700 pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: mousePos.x,
            top: mousePos.y - 10,
          }}
        >
          <div className="font-semibold">{hoveredItem.name}</div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: hoveredItem.color }}
            />
            <span>{((hoveredItem.value / total) * 100).toFixed(1)}%</span>
            <span className="text-gray-300">({hoveredItem.value})</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PieChart;