import React from 'react';
import { cn, formatTimestamp } from '../utils/helpers';
import { CheckCircle2, Clock, Loader2, ArrowRight } from 'lucide-react';

const ExecutionTimeline = ({ steps = [] }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-500 bg-slate-950 rounded-xl border border-slate-800 border-dashed text-xs">
        No execution timeline available
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-slate-800 ml-4 space-y-4 pb-4">
      {steps.map((step, index) => {
        const status = (step.status || '').toLowerCase();
        const isCompleted = status === 'completed' || status === 'success';
        const isActive = status === 'active' || status === 'running';

        return (
          <div key={step.id || index} className="relative pl-6">
            {/* Timeline Dot */}
            <span className={cn(
              "absolute -left-[11px] top-1 flex items-center justify-center w-5 h-5 rounded-full ring-4 ring-slate-950 transition-all",
              isCompleted 
                ? "bg-emerald-500 text-white" 
                : isActive 
                  ? "bg-indigo-600 text-white animate-pulse" 
                  : "bg-slate-800 text-slate-400"
            )}>
              {isCompleted ? (
                <CheckCircle2 className="w-3 h-3 text-white" />
              ) : isActive ? (
                <Loader2 className="w-3 h-3 text-white animate-spin" />
              ) : (
                <span className="text-[10px] font-bold font-mono">{index + 1}</span>
              )}
            </span>
            
            {/* Step Card */}
            <div className={cn(
              "rounded-xl p-3.5 transition-all border",
              isActive 
                ? "bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-950/50" 
                : isCompleted 
                  ? "bg-slate-900/90 border-slate-800 text-slate-300" 
                  : "bg-slate-950/50 border-slate-850 opacity-60"
            )}>
              <div className="flex items-center justify-between mb-1">
                <h4 className={cn(
                  "text-xs font-bold tracking-tight",
                  isActive ? "text-indigo-300" : isCompleted ? "text-white" : "text-slate-400"
                )}>
                  STEP {step.number || step.step_number || index + 1}: {step.title}
                </h4>
                {step.timestamp && (
                  <time className="text-[10px] text-slate-500 font-mono">
                    {formatTimestamp(step.timestamp)}
                  </time>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc || step.description}</p>
              
              {step.state_change && (
                <div className="mt-2 text-[11px] bg-slate-950 p-2 rounded-lg font-mono text-emerald-400 border border-slate-800">
                  {step.state_change}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExecutionTimeline;
