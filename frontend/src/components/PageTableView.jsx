import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '../utils/helpers';

const PageTableView = ({ steps = [], framesCount = 3 }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-36 bg-slate-950 rounded-xl border border-slate-800 border-dashed">
        <span className="text-slate-500 text-sm">No page replacement steps to display</span>
      </div>
    );
  }

  const frameHeaders = Array.from({ length: framesCount }, (_, i) => `Frame ${i + 1}`);

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
      <table className="w-full text-xs text-left">
        <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-900 border-b border-slate-800">
          <tr>
            <th className="px-3.5 py-3 font-semibold">Step</th>
            <th className="px-3.5 py-3 font-semibold border-r border-slate-800">Page Ref</th>
            {frameHeaders.map(header => (
              <th key={header} className="px-3.5 py-3 font-semibold text-center">{header}</th>
            ))}
            <th className="px-3.5 py-3 font-semibold text-center border-l border-slate-800">Outcome</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-850">
          {steps.map((step, index) => {
            const frameList = step.frames || step.frames_state || [];
            const isFault = step.fault !== undefined ? step.fault : (step.is_fault ?? true);

            return (
              <tr key={index} className="hover:bg-slate-900/60 transition-colors">
                <td className="px-3.5 py-2.5 text-slate-500 font-mono">{index + 1}</td>
                <td className="px-3.5 py-2.5 font-bold font-mono text-indigo-400 border-r border-slate-800 bg-indigo-500/5">
                  {step.page}
                </td>
                
                {Array.from({ length: framesCount }).map((_, frameIndex) => {
                  const frameValue = frameList[frameIndex];
                  const isNew = frameValue === step.page && isFault;
                  
                  return (
                    <td key={frameIndex} className="px-3.5 py-2.5 text-center">
                      <span className={cn(
                        "inline-flex items-center justify-center w-7 h-7 rounded font-mono font-bold text-xs transition-all",
                        frameValue !== undefined && frameValue !== null
                          ? isNew 
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" 
                            : "bg-slate-800 text-slate-200 border border-slate-700"
                          : "text-slate-600 font-normal"
                      )}>
                        {frameValue !== undefined && frameValue !== null ? frameValue : '-'}
                      </span>
                    </td>
                  );
                })}
                
                <td className="px-3.5 py-2.5 text-center border-l border-slate-800">
                  {isFault ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      <X className="w-3 h-3 mr-1" /> FAULT
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <Check className="w-3 h-3 mr-1" /> HIT
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PageTableView;
