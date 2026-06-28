import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Signal {
  scpi: string;
  title: string;
  value: string;
  variant: 'up-green' | 'down-red' | 'bar-blue';
}

const signals: Signal[] = [
  { scpi: 'Corum Origin', title: 'TD 2025 confirmé', value: '6,02 %', variant: 'up-green' },
  { scpi: 'Sofidy Europe', title: 'Prix de souscription révisé', value: '-1,4 %', variant: 'down-red' },
  { scpi: 'Remake Live', title: 'Collecte', value: 'Nouvelle collecte ouverte', variant: 'bar-blue' },
  { scpi: 'Iroko Zen', title: 'TD estimé publié', value: '5,44 %', variant: 'up-green' },
];

const ascData = [
  { x: 0, y: 2.5 },
  { x: 1, y: 3.2 },
  { x: 2, y: 4.1 },
  { x: 3, y: 4.8 },
  { x: 4, y: 5.5 },
  { x: 5, y: 6.0 },
];

const descData = [
  { x: 0, y: 3.0 },
  { x: 1, y: 2.7 },
  { x: 2, y: 2.3 },
  { x: 3, y: 1.8 },
  { x: 4, y: 1.5 },
  { x: 5, y: 1.2 },
];

const barData = [
  { x: 0, y: 3 },
  { x: 1, y: 5 },
  { x: 2, y: 4 },
  { x: 3, y: 7 },
  { x: 4, y: 6 },
  { x: 5, y: 9 },
];

function MiniChart({ variant }: { variant: Signal['variant'] }) {
  switch (variant) {
    case 'up-green':
      return (
        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={ascData}>
            <Line
              type="monotone"
              dataKey="y"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'down-red':
      return (
        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={descData}>
            <Line
              type="monotone"
              dataKey="y"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'bar-blue':
      return (
        <ResponsiveContainer width="100%" height={40}>
          <BarChart data={barData}>
            <Bar dataKey="y" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
  }
}

const variantMeta = {
  'up-green': { Icon: TrendingUp, color: 'text-emerald-400' },
  'down-red': { Icon: TrendingDown, color: 'text-red-400' },
  'bar-blue': { Icon: BarChart2, color: 'text-blue-400' },
};

export default function ScpiSignals() {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Signaux SCPI
          <span className="text-[10px] sm:text-xs text-slate-500 font-normal">· juin 2026</span>
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {signals.map((signal) => {
          const { Icon, color } = variantMeta[signal.variant];
          return (
            <div
              key={signal.scpi}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:border-slate-600/80 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className="text-[11px] sm:text-xs text-slate-300 font-medium truncate">
                  {signal.scpi}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 mb-1">
                {signal.title}
              </p>
              <p className="text-sm sm:text-base font-bold text-white mb-2">
                {signal.value}
              </p>
              <MiniChart variant={signal.variant} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
