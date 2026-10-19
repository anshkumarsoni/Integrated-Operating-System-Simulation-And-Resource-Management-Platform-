import React, { useState } from 'react';
import { GitBranch, Shield, Play, AlertTriangle, CheckCircle2, Lock, Unlock, Plus } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

export default function ThreadsSync() {
  const { threads, osService, refreshAll } = useSimulation();

  const [method, setMethod] = useState('Mutex');
  const [permits, setPermits] = useState(2);
  const [resourceName, setResourceName] = useState('Shared Counter');
  const [selectedThreadIds, setSelectedThreadIds] = useState(['T101-1', 'T101-2', 'T101-3']);
  const [results, setResults] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newThreadData, setNewThreadData] = useState({ pid: 'P101', name: '', priority: 'Medium' });

  const toggleThread = (tid) => {
    setSelectedThreadIds(prev => 
      prev.includes(tid) ? prev.filter(t => t !== tid) : [...prev, tid]
    );
  };

  const handleRunSimulation = () => {
    if (selectedThreadIds.length < 2) {
      alert('Please select at least 2 threads to simulate synchronization concurrency.');
      return;
    }

    const res = osService.runSyncSimulation(
      selectedThreadIds,
      resourceName,
      method,
      permits
    );
    setResults(res);
  };

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newThreadData.name.trim()) return;

    osService.createThread(newThreadData.pid, newThreadData.name, newThreadData.priority);
    refreshAll();
    setIsAddModalOpen(false);
    setNewThreadData({ pid: 'P101', name: '', priority: 'Medium' });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Threads & Concurrency Synchronization</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Demonstrate multi-threaded execution, Critical Section mutual exclusion (Mutex), Counting Semaphores, and Race Conditions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-colors border border-slate-700"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Thread
          </button>
          <button
            onClick={handleRunSimulation}
            className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/30"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            Simulate Synchronization
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Process-Thread Tree Inspector */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
              <GitBranch className="w-4 h-4 mr-2 text-indigo-400" /> Process-Thread Hierarchy
            </h2>
            <span className="text-xs text-slate-500">{selectedThreadIds.length} Selected</span>
          </div>

          <div className="space-y-3">
            {threads.map((proc) => (
              <div key={proc.pid} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between font-mono text-xs font-bold text-indigo-300">
                  <span>Process {proc.pid}</span>
                  <span className="text-slate-500 font-normal">{(proc.threads || []).length} Threads</span>
                </div>

                <div className="pl-3 border-l-2 border-indigo-500/30 space-y-1.5 mt-2">
                  {(proc.threads || []).map((t) => {
                    const isSelected = selectedThreadIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => toggleThread(t.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                          isSelected ? 'bg-indigo-600/20 border border-indigo-500/40 text-white' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded bg-slate-950 border-slate-700 text-indigo-600 w-3.5 h-3.5"
                          />
                          <span className="font-mono font-bold text-indigo-400">{t.id}</span>
                          <span className="truncate max-w-[120px]">{t.name}</span>
                        </div>
                        <StatusBadge status={t.state || 'Ready'} size="xs" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Columns: Simulation Parameters & Execution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls Box */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Synchronization Primitive Selection
            </h2>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {['Mutex', 'Semaphore', 'Race Condition'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      method === m
                        ? m === 'Race Condition'
                          ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/30'
                          : 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {m === 'Mutex' && <Lock className="w-3.5 h-3.5 inline mr-1.5" />}
                    {m === 'Semaphore' && <Shield className="w-3.5 h-3.5 inline mr-1.5" />}
                    {m === 'Race Condition' && <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />}
                    {m}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Target Critical Section Resource
                  </label>
                  <input
                    type="text"
                    value={resourceName}
                    onChange={e => setResourceName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {method === 'Semaphore' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Counting Semaphore Capacity (Permits)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={permits}
                      onChange={e => setPermits(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Educational Concept Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {method === 'Mutex' && (
                  <p><strong className="text-indigo-400">Mutex (Mutual Exclusion):</strong> Enforces that at most one thread executes inside the critical section. Subsequent threads are placed into a wait queue until the lock owner releases ownership.</p>
                )}
                {method === 'Semaphore' && (
                  <p><strong className="text-emerald-400">Counting Semaphore:</strong> Manages a pool of {permits} concurrent access tokens. Decremented by <code>sem_wait()</code> and incremented by <code>sem_post()</code>.</p>
                )}
                {method === 'Race Condition' && (
                  <p><strong className="text-rose-400">Race Condition Scenario:</strong> Demonstrates concurrent unsynchronized memory writes where interleaved execution corrupts shared state without atomic guards.</p>
                )}
              </div>
            </div>
          </div>

          {/* Results Timeline & Final State */}
          {results && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-3">
                  Chronological Execution Timeline
                </h2>
                <div className="space-y-2">
                  {results.timeline.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl flex items-center justify-between text-xs border ${
                        item.status === 'Conflict' 
                          ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                          : item.status === 'Blocked'
                            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-slate-500 text-[11px] w-12">{item.time}</span>
                        <span className="font-mono font-bold text-indigo-400">{item.thread}</span>
                        <span>{item.event}</span>
                      </div>
                      <StatusBadge status={item.status} size="xs" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Final State Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                  Final Thread & Resource State
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="min-w-full divide-y divide-slate-800 text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-4 py-2.5">Thread ID</th>
                        <th className="px-4 py-2.5">Lifecycle State</th>
                        <th className="px-4 py-2.5">Target Resource</th>
                        <th className="px-4 py-2.5">Lock / Guard Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {results.states.map((st, i) => (
                        <tr key={i} className="hover:bg-slate-900/60">
                          <td className="px-4 py-2.5 font-mono font-bold text-indigo-400">{st.thread}</td>
                          <td className="px-4 py-2.5 text-white font-medium">{st.state}</td>
                          <td className="px-4 py-2.5 text-slate-300">{st.resource}</td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status={st.lock} size="xs" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Thread Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Spawn New Thread">
        <form onSubmit={handleCreateThread} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Parent Process
            </label>
            <select
              value={newThreadData.pid}
              onChange={e => setNewThreadData({ ...newThreadData, pid: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              {threads.map(p => (
                <option key={p.pid} value={p.pid}>Process {p.pid}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Thread Name / Task Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Asynchronous Parser Worker"
              value={newThreadData.name}
              onChange={e => setNewThreadData({ ...newThreadData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Thread Priority
            </label>
            <select
              value={newThreadData.priority}
              onChange={e => setNewThreadData({ ...newThreadData, priority: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/30"
            >
              Spawn Thread
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
