import React from 'react';
import { Svg, Line, Rect, Text as SvgText } from '@react-pdf/renderer';
import { formatInt } from '../utils';

type CashBarDatum = { label: string; value: number };
type TaxesBarDatum = { label: string; personal: number; corporate: number };

export const CashBarChart = ({ data }: { data: CashBarDatum[] }) => {
  const width = 520;
  const height = 180;
  const maxVal = Math.max(1, ...data.map(row => row.value));
  const barWidth = width / data.length - 10;
  return (
    <Svg width={width} height={height + 30}>
      <Rect x={0} y={0} width={width} height={height} stroke="#E5E7EB" fill="none" />
      <Line x1={0} y1={height} x2={width} y2={height} stroke="#D1D5DB" />
      <SvgText x={0} y={10} fontSize={8} fill="#6B7280">{formatInt(maxVal)} €</SvgText>
      <SvgText x={0} y={height - 2} fontSize={8} fill="#6B7280">0 €</SvgText>
      {data.map((row, idx) => {
        const baseX = idx * (barWidth + 10);
        const barHeight = (row.value / maxVal) * height;
        return (
          <React.Fragment key={row.label}>
            <Rect x={baseX} y={height - barHeight} width={barWidth} height={barHeight} fill="#22C55E" />
            <SvgText x={baseX} y={height + 12} fontSize={7} fill="#6B7280">{row.label}</SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
};

export const StackedBarChart = ({ data }: { data: TaxesBarDatum[] }) => {
  const width = 520;
  const height = 180;
  const maxVal = Math.max(1, ...data.map(row => row.personal + row.corporate));
  const barWidth = width / data.length - 10;
  return (
    <Svg width={width} height={height + 40}>
      <Rect x={0} y={0} width={width} height={height} stroke="#E5E7EB" fill="none" />
      <Line x1={0} y1={height} x2={width} y2={height} stroke="#D1D5DB" />
      <SvgText x={0} y={10} fontSize={8} fill="#6B7280">{formatInt(maxVal)} €</SvgText>
      <SvgText x={0} y={height - 2} fontSize={8} fill="#6B7280">0 €</SvgText>
      {data.map((row, idx) => {
        const baseX = idx * (barWidth + 10);
        const personalHeight = (row.personal / maxVal) * height;
        const corporateHeight = (row.corporate / maxVal) * height;
        return (
          <React.Fragment key={row.label}>
            <Rect x={baseX} y={height - personalHeight} width={barWidth} height={personalHeight} fill="#22C55E" />
            <Rect x={baseX} y={height - personalHeight - corporateHeight} width={barWidth} height={corporateHeight} fill="#0EA5E9" />
            <SvgText x={baseX} y={height + 12} fontSize={7} fill="#6B7280">{row.label}</SvgText>
          </React.Fragment>
        );
      })}
      <SvgText x={0} y={height + 26} fontSize={8} fill="#6B7280">Impôts perso</SvgText>
      <SvgText x={80} y={height + 26} fontSize={8} fill="#6B7280">Impôts société</SvgText>
    </Svg>
  );
};
