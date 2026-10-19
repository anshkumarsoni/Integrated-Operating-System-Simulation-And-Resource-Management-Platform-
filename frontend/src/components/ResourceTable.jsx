import React from 'react';
import { Package, ShieldAlert } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ResourceTable = ({ resources = [], onRequest, onRelease }) => {
  if (!resources || resources.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-slate-950 rounded-xl border border-slate-800 border-dashed">
        <span className="text-slate-500 text-sm">No resources configured</span>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
      <table className="w-full text-xs text-left">
        <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-900 border-b border-slate-800">
          <tr>
            <th className="px-4 py-3 font-semibold">Resource ID</th>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Utilization</th>
            <th className="px-4 py-3 font-semibold text-center">Available / Total</th>
            <th className="px-4 py-3 font-semibold text-center">Allocated</th>
            <th className="px-4 py-3 font-semibold text-center">Waiting Queue</th>
            <th className="px-4 py-3 font-semibold text-center">Status</th>
            {(onRequest || onRelease) && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-850">
          {resources.map((resource) => {
            const resId = resource.id || resource.resource_id;
            const total = resource.total || resource.total_instances || 1;
            const available = resource.available ?? resource.available_instances ?? 0;
            const allocated = resource.allocated ?? resource.allocated_instances ?? (total - available);
            const waiters = resource.waitingProcs || resource.waiting_processes || [];

            const utilization = Math.min(100, Math.round(((total - available) / total) * 100));
            const isDepleted = available === 0;

            return (
              <tr key={resId} className="hover:bg-slate-900/60 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-indigo-400">
                  {resId}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="p-1.5 rounded-lg bg-slate-800 mr-2.5 text-slate-300">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{resource.name}</p>
                    </div>
                  </div>
                </td>
                
                <td className="px-4 py-3 w-40">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                    <span className="text-slate-400">{utilization}%</span>
                    <span className={isDepleted ? "text-rose-400" : "text-emerald-400"}>
                      {isDepleted ? 'Maxed' : 'Active'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${isDepleted ? 'bg-rose-500' : 'bg-indigo-500'}`}
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                </td>
                
                <td className="px-4 py-3 text-center font-mono">
                  <span className={`font-bold ${isDepleted ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {available}
                  </span>
                  <span className="text-slate-600 mx-1">/</span>
                  <span className="text-slate-400">{total}</span>
                </td>

                <td className="px-4 py-3 text-center font-mono text-indigo-300 font-medium">
                  {allocated}
                </td>
                
                <td className="px-4 py-3 text-center">
                  {waiters.length > 0 ? (
                    <div className="inline-flex items-center text-amber-400 text-[11px] font-medium bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <ShieldAlert className="w-3 h-3 mr-1" />
                      {waiters.length} proc ({waiters.join(', ')})
                    </div>
                  ) : (
                    <span className="text-slate-600 font-mono text-xs">0</span>
                  )}
                </td>
                
                <td className="px-4 py-3 text-center">
                  <StatusBadge 
                    status={isDepleted ? 'DEPLETED' : 'AVAILABLE'} 
                    size="xs"
                  />
                </td>

                {(onRequest || onRelease) && (
                  <td className="px-4 py-3 text-right space-x-2">
                    {onRequest && (
                      <button
                        onClick={() => onRequest(resId)}
                        className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded text-xs transition-colors border border-indigo-500/30"
                      >
                        Request
                      </button>
                    )}
                    {onRelease && (
                      <button
                        onClick={() => onRelease(resId)}
                        disabled={allocated === 0}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors border border-slate-700 disabled:opacity-40"
                      >
                        Release
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ResourceTable;
