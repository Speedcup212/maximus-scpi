import { type LucideIcon } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  badge: string;
  value: string | number;
  label: string;
  accent: 'emerald' | 'blue' | 'amber';
}

const accentClasses = {
  emerald: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15',
    badgeColor: 'text-emerald-300',
  },
  blue: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/15',
    badgeColor: 'text-blue-300',
  },
  amber: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/15',
    badgeColor: 'text-amber-300',
  },
};

export default function KpiCard({ icon: Icon, badge, value, label, accent }: KpiCardProps) {
  const colors = accentClasses[accent];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`${colors.iconBg} p-2 rounded-lg`}>
          <Icon className={`w-5 h-5 ${colors.iconColor}`} />
        </div>
        <span className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${colors.badgeBg} ${colors.badgeColor}`}>
          {badge}
        </span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-slate-400">
        {label}
      </div>
    </div>
  );
}
