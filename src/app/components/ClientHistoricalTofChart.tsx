import React from 'react';
import type { PortfolioTofPoint } from '../../utils/clientPortfolioHistory';

type Props = { points: PortfolioTofPoint[]; unavailable: boolean };
const display = (value: number) =>
  value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' %';
const ClientHistoricalTofChart: React.FC<Props> = ({ points, unavailable }) => {
  const sampled = points.slice(-20);
  if (unavailable) return (
    <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
      L’historique sourcé n’est pas accessible. Aucun graphique de substitution n’est calculé.
    </div>
  );
  if (sampled.length < 2) return (
    <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
      Pas assez de trimestres documentés et comparables pour tracer une courbe fiable.
    </div>
  );
  const width = 560, height = 166;
  const left = 46, right = 15, top = 14, bottom = 31;
  const plotWidth = width-left-right, plotHeight = height-top-bottom;
  const rawMin = Math.min(...sampled.map(p => p.tof)), rawMax = Math.max(...sampled.map(p => p.tof));
  const minY = Math.max(0, Math.floor((rawMin - 2) / 5) * 5);
  const maxY = Math.min(100, Math.max(minY+5, Math.ceil((rawMax + 1) / 5) * 5));
  const sx = (index:number) => left + index / Math.max(1,sampled.length - 1) * plotWidth;
  const sy = (value:number) => top + (maxY-value) / (maxY-minY) * plotHeight;
  const plotted = sampled.map((p,i)=>sx(i).toFixed(1)+','+sy(p.tof).toFixed(1)).join(' ');
  const labels = [...new Set([0,Math.floor((sampled.length-1)/2),sampled.length-1])];
  const minCoverage = Math.min(...sampled.map(p=>p.coveragePercent));
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-4">
      <div className="flex flex-wrap justify-between gap-2">
        <span className="text-xs font-semibold text-slate-100">TOF historique consolidé</span>
        <span className="text-[11px] text-slate-400">{sampled.length} périodes · couverture minimale {display(minCoverage)}</span>
      </div>
      <svg className="mt-3 h-auto w-full" viewBox={'0 0 '+width+' '+height}
        role="img" aria-label={'Évolution historique du taux d’occupation : '+sampled.map(p=>p.period+' '+display(p.tof)).join(', ')}>
        {[0,0.5,1].map(t=>{
          const value=minY+t*(maxY-minY),y=sy(value);
          return <g key={t}><line x1={left} x2={width-right} y1={y} y2={y} stroke="#334155" strokeDasharray="3 6" />
            <text x={left-9} y={y+4} textAnchor="end" fontSize="11" fill="#cbd5e1">{Math.round(value)} %</text></g>;
        })}
        <polyline points={plotted} fill="none" stroke="#34d399" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {sampled.map((p,i)=><circle key={p.period} cx={sx(i)} cy={sy(p.tof)} r="3.5" fill="#5eead4" stroke="#0f172a" strokeWidth="1">
          <title>{p.period} : {display(p.tof)} · Couverture {display(p.coveragePercent)} ({p.coveredCount}/{p.holdingCount} SCPI)</title>
        </circle>)}
        {labels.map(i=><text key={i} x={sx(i)} y={height-9} textAnchor={i===0?'start':i===sampled.length-1?'end':'middle'} fontSize="11" fill="#cbd5e1">{sampled[i].period}</text>)}
      </svg>
      <p className="mt-2 text-[11px] leading-5 text-slate-400">
        Séries issues de bulletins référencés et contrôlés. Pondération à positions actuelles constantes ;
        il ne s’agit pas du rendement historique réalisé ni du TOF historique réel d’un portefeuille dont les parts ont évolué.
        Seuls les trimestres couvrant au moins 75 % de la valorisation indicative sont représentés.
      </p>
    </div>
  );
};
export default ClientHistoricalTofChart;
