import React from 'react';
import { cn } from '../utils/helpers';

const MemoryVisualizer = ({ blocks = [], totalMemory = 1024 }) => {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-blue-50/40 rounded-xl border border-blue-200 border-dashed">
        <span className="text-blue-600 text-sm font-medium">No memory blocks configured</span>
      </div>
    );
  }

  const safeTotalMemory = Math.max(totalMemory, 1);

  return (
    <div className="space-y-4">
      {/* Horizontal Continuous Physical Bar */}
      <div>
        <div className="flex justify-between text-xs text-blue-800 mb-1.5 font-mono">
          <span>0 MB (0x00000000)</span>
          <span>Physical Address Space: {totalMemory} MB</span>
          <span>{totalMemory} MB</span>
        </div>
        
        <div className="h-12 w-full rounded-xl overflow-hidden border border-blue-200 bg-blue-50/40 flex shadow-inner">
          {blocks.map((block) => {
            const widthPercent = (block.size / safeTotalMemory) * 100;
            const isAllocated = block.status === 'Allocated' || Boolean(block.pid);
            
            return (
              <div
                key={block.id}
                className={cn(
                  "h-full border-r border-blue-200 flex flex-col items-center justify-center relative group transition-all",
                  isAllocated ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-100/80 hover:bg-blue-200 text-blue-800"
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
                  ? "bg-blue-50/80 border-blue-200 text-slate-800 shadow-xs hover:border-blue-300" 
                  : "bg-sky-50/60 border-sky-200 text-slate-700 shadow-xs hover:border-sky-300"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold font-mono text-blue-900">{block.name || `Block ${block.id}`}</span>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded font-mono font-semibold",
                  isAllocated ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-sky-100 text-sky-800 border border-sky-300"
                )}>
                  {isAllocated ? 'ALLOCATED' : 'FREE'}
                </span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">Capacity:</span>
                <span className="font-mono text-slate-900 font-semibold">{block.size} MB</span>
              </div>
              <div className="flex justify-between text-xs mt-0.5">
                <span className="text-slate-500">Start Offset:</span>
                <span className="font-mono text-slate-700">{block.start} MB</span>
              </div>
              {isAllocated && (
                <>
                  <div className="flex justify-between text-xs mt-0.5 text-blue-700 font-medium">
                    <span>Process PID:</span>
                    <span className="font-mono font-bold">{block.pid}</span>
                  </div>
                  {block.internalFrag > 0 && (
                    <div className="flex justify-between text-xs mt-0.5 text-amber-600 font-medium">
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
