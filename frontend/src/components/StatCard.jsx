import React from 'react';
import { cn } from '../utils/helpers';

const COLOR_MAP = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  red: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  slate: 'bg-slate-800/50 text-slate-400 border-slate-700'
};

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend, className }) => {
  const colorStyle = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className={cn("bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{value ?? '-'}</p>
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-lg border", colorStyle)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center text-xs">
          {trend && (
            <span className={cn(
              "font-medium mr-2",
              trend.startsWith('+') ? "text-emerald-400" : trend.startsWith('-') ? "text-rose-400" : "text-slate-400"
            )}>
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-400 font-medium">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
