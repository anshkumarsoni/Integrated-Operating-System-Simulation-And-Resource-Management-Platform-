import React from 'react';
import { cn } from '../utils/helpers';

const StatusBadge = ({ status, size = 'sm', className }) => {
  const getBadgeColor = (stat) => {
    const s = (stat || '').toUpperCase();
    if (['NEW', 'CREATED'].includes(s)) return 'bg-sky-500/10 text-sky-400 border border-sky-500/30';
    if (['READY'].includes(s)) return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    if (['RUNNING', 'PROCESSING', 'ACTIVE'].includes(s)) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    if (['WAITING', 'PENDING', 'BLOCKED'].includes(s)) return 'bg-orange-500/10 text-orange-400 border border-orange-500/30';
    if (['TERMINATED'].includes(s)) return 'bg-slate-800 text-slate-400 border border-slate-700';
    if (['COMPLETED', 'SUCCESS', 'SAFE', 'FINISHED', 'RELEASED (SAFE)'].includes(s)) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    if (['FAILED', 'CONFLICT', 'UNSAFE'].includes(s)) return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
    if (['FREE'].includes(s)) return 'bg-slate-800 text-slate-400 border border-slate-700';
    if (['ALLOCATED'].includes(s)) return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30';
    return 'bg-slate-800 text-slate-300 border border-slate-700';
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span className={cn(
      "inline-flex items-center justify-center font-medium rounded-md font-mono tracking-tight",
      getBadgeColor(status),
      sizeClasses[size] || sizeClasses.sm,
      className
    )}>
      {status || 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
