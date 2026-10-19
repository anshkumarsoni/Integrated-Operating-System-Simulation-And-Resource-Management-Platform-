import React, { useState } from 'react';
import { Terminal, Shield, Play, RefreshCw, CheckCircle2, Filter, Zap } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import { SYSTEM_CALL_DEFINITIONS } from '../simulation/systemCalls';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';

export default function SystemCalls() {
  const { systemCalls, processes, osService, refreshAll } = useSimulation();

  const [filterPid, setFilterPid] = useState('All');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testCall, setTestCall] = useState({
    pid: 'P101',
    callName: 'create_process()',
    description: 'Manual verification trap'
  });
  const [testFeedback, setTestFeedback] = useState('');

  const filteredCalls = filterPid === 'All' 
    ? systemCalls 
    : systemCalls.filter(c => c.pid === filterPid);

  const stats = osService.getSystemCallStats();

  const handleTriggerManualCall = (e) => {
    e.preventDefault();
    osService.syscallMgr.logCall(
      testCall.pid,
      testCall.callName,
      'SUCCESS',
      testCall.description || `Executed test trap for ${testCall.callName}`
    );
    osService.saveState();
    refreshAll();
    setIsTestModalOpen(false);
    setTestFeedback(`Successfully trapped and serviced ${testCall.callName} for ${testCall.pid}`);
    setTimeout(() => setTestFeedback(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Calls & Kernel Traps</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Interface between userland applications and the simulated kernel space via software interrupts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/30"
          >
            <Play className="w-4 h-4 mr-1.5 fill-current" />
            Invoke System Call Trap
          </button>
        </div>
      </div>

      {testFeedback && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{testFeedback}</span>
          </div>
          <button onClick={() => setTestFeedback('')} className="font-bold ml-3">✕</button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total System Calls" value={stats.totalCalls} color="blue" subtitle="Intercepted interrupts" />
        <StatCard title="Successful Traps" value={stats.successfulCalls} color="emerald" subtitle="Completed with status 0" />
        <StatCard title="Failed Traps" value={stats.failedCalls} color="red" subtitle="Permission / resource errors" />
        <StatCard title="Supported API Calls" value={`${SYSTEM_CALL_DEFINITIONS.length} Calls`} color="purple" subtitle="POSIX simulated vectors" />
      </div>

      {/* 1. Educational System Call Catalog */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
          <Shield className="w-4 h-4 mr-2 text-indigo-400" /> Kernel System Call API Definitions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SYSTEM_CALL_DEFINITIONS.map((def) => (
            <div key={def.name} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <code className="text-xs font-bold text-indigo-300 font-mono">{def.name}</code>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                  {def.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{def.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Live System Call Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              System Call Execution Log
            </h2>
          </div>

          {/* Filter by PID */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-semibold">Filter PID:</span>
            <select
              value={filterPid}
              onChange={e => setFilterPid(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="All">All Processes</option>
              <option value="KERNEL">KERNEL</option>
              {processes.map(p => (
                <option key={p.pid} value={p.pid}>{p.pid} ({p.name})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="min-w-full divide-y divide-slate-800 text-xs text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Call ID</th>
                <th className="px-4 py-3">Process (PID)</th>
                <th className="px-4 py-3">System Call Vector</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Kernel Status</th>
                <th className="px-4 py-3">Description & Arguments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    No system calls logged for this filter.
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-400">{call.id}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-white">{call.pid}</td>
                    <td className="px-4 py-3 font-mono text-purple-300 font-semibold">{call.systemCall}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{call.time}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={call.status} size="xs" />
                    </td>
                    <td className="px-4 py-3 text-slate-300 max-w-sm truncate">{call.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Invocation Modal */}
      <Modal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} title="Simulate Kernel System Call Trap">
        <form onSubmit={handleTriggerManualCall} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Caller Process (PID)
            </label>
            <select
              value={testCall.pid}
              onChange={e => setTestCall({ ...testCall, pid: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="KERNEL">KERNEL (Ring 0 Privileged)</option>
              {processes.map(p => (
                <option key={p.pid} value={p.pid}>{p.pid} — {p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Select System Call Vector
            </label>
            <select
              value={testCall.callName}
              onChange={e => setTestCall({ ...testCall, callName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500 font-mono"
            >
              {SYSTEM_CALL_DEFINITIONS.map(def => (
                <option key={def.name} value={def.name}>{def.name} — {def.category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Call Arguments / Description
            </label>
            <input
              type="text"
              placeholder="e.g. Memory buffer address 0x00402000"
              value={testCall.description}
              onChange={e => setTestCall({ ...testCall, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsTestModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/30"
            >
              Dispatch System Call
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
