import React from 'react';
import { cn, formatTimestamp } from '../utils/helpers';
import { CheckCircle2, Clock, Loader2, ArrowRight } from 'lucide-react';

const ExecutionTimeline = ({ steps = [] }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-blue-600 bg-blue-50/40 rounded-xl border border-blue-200 border-dashed text-xs">
        No execution timeline available
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-blue-200 ml-4 space-y-4 pb-4">
      {steps.map((step, index) => {
        const status = (step.status || '').toLowerCase();
        const isCompleted = status === 'completed' || status === 'success';
        const isActive = status === 'active' || status === 'running';

        return (
          <div key={step.id || index} className="relative pl-6">
            {/* Timeline Dot */}
            <span className={cn(
              "absolute -left-[11px] top-1 flex items-center justify-center w-5 h-5 rounded-full ring-4 ring-white transition-all shadow-xs",
              isCompleted 
                ? "bg-emerald-500 text-white" 
                : isActive 
                  ? "bg-blue-600 text-white animate-pulse" 
                  : "bg-blue-100 text-blue-800 border border-blue-300"
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
                ? "bg-blue-100/90 border-blue-400 shadow-md shadow-blue-500/10" 
                : isCompleted 
                  ? "bg-blue-50/80 border-blue-200 text-slate-800" 
                  : "bg-blue-50/40 border-blue-200/70 text-slate-700"
            )}>
              <div className="flex items-center justify-between mb-1">
                <h4 className={cn(
                  "text-xs font-bold tracking-tight",
                  isActive ? "text-blue-900" : isCompleted ? "text-blue-900" : "text-blue-800"
                )}>
                  STEP {step.number || step.step_number || index + 1}: {step.title}
                </h4>
                {step.timestamp && (
                  <time className="text-[10px] text-blue-500 font-mono">
                    {formatTimestamp(step.timestamp)}
                  </time>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc || step.description}</p>
              
              {step.state_change && (
                <div className="mt-2 text-[11px] bg-white p-2 rounded-lg font-mono text-emerald-700 border border-emerald-200">
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
