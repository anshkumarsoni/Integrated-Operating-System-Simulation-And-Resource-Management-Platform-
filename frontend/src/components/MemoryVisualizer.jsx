import React from 'react';
import { cn } from '../utils/helpers';

const MemoryVisualizer = ({ blocks = [], totalMemory = 1024 }) => {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-slate-950 rounded-xl border border-slate-800 border-dashed">
        <span className="text-slate-500 text-sm">No memory blocks configured</span>
      </div>
    );
  }

  const safeTotalMemory = Math.max(totalMemory, 1);

  return (
    <div className="space-y-4">
      {/* Horizontal Continuous Physical Bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
          <span>0 MB (0x00000000)</span>
          <span>Physical Address Space: {totalMemory} MB</span>
          <span>{totalMemory} MB</span>
        </div>
        
        <div className="h-12 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex shadow-inner">
          {blocks.map((block) => {
            const widthPercent = (block.size / safeTotalMemory) * 100;
            const isAllocated = block.status === 'Allocated' || Boolean(block.pid);
            
            return (
              <div
                key={block.id}
                className={cn(
                  "h-full border-r border-slate-900 flex flex-col items-center justify-center relative group transition-all",
                  isAllocated ? "bg-indigo-600/80 hover:bg-indigo-600 text-white" : "bg-slate-800/60 hover:bg-slate-800 text-slate-400"
                )}
                style={{ width: `${widthPercent}%` }}
                title={`${block.name || `Block ${block.id}`} (${block.size} MB) - ${isAllocated ? `Allocated to ${block.pid}` : 'Free'}`}
              >
                <span className="text-[11px] font-bold truncate px-1 font-mono">
                  {block.name || `B${block.id}`}
                </span>
                <span className="text-[10px] opacity-80 font-mono">
                  {block.size}M
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Partition Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
        {blocks.map((block) => {
          const isAllocated = block.status === 'Allocated' || Boolean(block.pid);
          return (
            <div
              key={block.id}
              className={cn(
                "p-3 rounded-lg border transition-all",
                isAllocated 
                  ? "bg-indigo-950/30 border-indigo-500/40 text-slate-200" 
                  : "bg-slate-950/60 border-slate-800 text-slate-400"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold font-mono text-white">{block.name || `Block ${block.id}`}</span>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded font-mono font-semibold",
                  isAllocated ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-slate-800 text-slate-400"
                )}>
                  {isAllocated ? 'ALLOCATED' : 'FREE'}
                </span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-400">Capacity:</span>
                <span className="font-mono text-white font-medium">{block.size} MB</span>
              </div>
              <div className="flex justify-between text-xs mt-0.5">
                <span className="text-slate-400">Start Offset:</span>
                <span className="font-mono text-slate-400">{block.start} MB</span>
              </div>
              {isAllocated && (
                <>
                  <div className="flex justify-between text-xs mt-0.5 text-indigo-300 font-medium">
                    <span>Process PID:</span>
                    <span className="font-mono font-bold">{block.pid}</span>
                  </div>
                  {block.internalFrag > 0 && (
                    <div className="flex justify-between text-xs mt-0.5 text-amber-400">
                      <span>Internal Frag:</span>
                      <span className="font-mono">{block.internalFrag} MB</span>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemoryVisualizer;
