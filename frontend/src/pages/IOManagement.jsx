import React, { useState } from 'react';
import { HardDrive, Play, Plus, CheckCircle2, RefreshCw, ArrowRight, Activity } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { formatTimestamp } from '../utils/helpers';

export default function IOManagement() {
  const { 
    ioRequests, 
    processes, 
    createIORequest, 
    completeIORequest, 
    osService 
  } = useSimulation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({ pid: 'P101', device: 'Disk', requestType: 'READ' });

  // Disk scheduling form
  const [diskConfig, setDiskConfig] = useState({
    requests: '98, 183, 37, 122, 14, 124, 65, 67',
    head: 53,
    algorithm: 'FCFS',
    direction: 'Right'
  });
  const [diskResults, setDiskResults] = useState(null);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    await createIORequest(newRequest.pid, newRequest.device, newRequest.requestType);
    setIsCreateModalOpen(false);
  };

  const handleComplete = async (id) => {
    await completeIORequest(id);
  };

  const handleRunDiskScheduling = () => {
    const reqArray = diskConfig.requests
      .split(/[\s,]+/)
      .map(n => parseInt(n.trim(), 10))
      .filter(n => !isNaN(n));

    const res = osService.runDiskScheduling(
      reqArray,
      Number(diskConfig.head) || 53,
      diskConfig.algorithm,
      diskConfig.direction
    );
    setDiskResults(res);
  };

  const pendingCount = ioRequests.filter(r => r.status === 'WAITING' || r.status === 'PROCESSING').length;
  const completedCount = ioRequests.filter(r => r.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">I/O Management & Disk Scheduling</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage device drivers, asynchronous I/O request queues, and simulate disk head arm seek optimization.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create I/O Request
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total I/O Requests" value={ioRequests.length} color="blue" />
        <StatCard title="Pending Requests" value={pendingCount} color="orange" subtitle="Awaiting driver service" />
        <StatCard title="Completed Requests" value={completedCount} color="emerald" subtitle="Service completed" />
        <StatCard title="Active Devices" value="4 Devices" color="purple" subtitle="Disk, Printer, Network, Console" />
      </div>

      {/* 1. I/O Request Queue Table */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
            <HardDrive className="w-4 h-4 mr-2 text-amber-400" /> Device I/O Request Queue
          </h2>
          <span className="text-xs text-slate-500 font-mono">{ioRequests.length} Requests in Log</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="min-w-full divide-y divide-slate-800 text-xs text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Process (PID)</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {ioRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                    No active I/O requests in queue.
                  </td>
                </tr>
              ) : (
                ioRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-400">{req.id}</td>
                    <td className="px-4 py-3 font-mono text-white font-semibold">{req.pid}</td>
                    <td className="px-4 py-3 text-slate-300 font-medium">{req.device}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {req.requestType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} size="xs" />
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{formatTimestamp(req.timestamp)}</td>
                    <td className="px-4 py-3 text-right">
                      {req.status !== 'COMPLETED' ? (
                        <button
                          onClick={() => handleComplete(req.id)}
                          className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-emerald-500/30"
                        >
                          Complete I/O
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-mono">Serviced ✓</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Disk Arm Scheduling Simulator */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-indigo-400" /> Disk Cylinder Seek Scheduling
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Optimize mechanical disk platter head traversal</p>
          </div>
          <button
            onClick={handleRunDiskScheduling}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/30 self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
            Compute Track Traversal
          </button>
        </div>

        {/* Algorithm Settings Bar */}
        <div className="flex flex-wrap gap-4 items-end bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Algorithm</label>
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
              {['FCFS', 'SSTF', 'SCAN', 'C-SCAN'].map((algo) => (
                <button
                  key={algo}
                  onClick={() => setDiskConfig({ ...diskConfig, algorithm: algo })}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                    diskConfig.algorithm === algo
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Cylinder Requests Queue
            </label>
            <input
              type="text"
              value={diskConfig.requests}
              onChange={e => setDiskConfig({ ...diskConfig, requests: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="w-24">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Head</label>
            <input
              type="number"
              min="0"
              max="199"
              value={diskConfig.head}
              onChange={e => setDiskConfig({ ...diskConfig, head: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono text-center rounded-lg px-2 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {(diskConfig.algorithm === 'SCAN' || diskConfig.algorithm === 'C-SCAN') && (
            <div className="w-28">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Head Direction</label>
              <select
                value={diskConfig.direction}
                onChange={e => setDiskConfig({ ...diskConfig, direction: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Right">Right (→ 199)</option>
                <option value="Left">Left (← 0)</option>
              </select>
            </div>
          )}
        </div>

        {/* Scheduling Results */}
        {diskResults && (
          <div className="space-y-6 pt-2 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 uppercase font-semibold block">Total Head Movement</span>
                <span className="text-3xl font-bold text-indigo-400 font-mono mt-1 block">
                  {diskResults.totalMovement} <span className="text-sm font-normal text-slate-500">cylinders</span>
                </span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 uppercase font-semibold block">Serviced Tracks</span>
                <span className="text-3xl font-bold text-emerald-400 font-mono mt-1 block">
                  {diskResults.sequence.length - 1} <span className="text-sm font-normal text-slate-500">requests</span>
                </span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 uppercase font-semibold block">Algorithm</span>
                <span className="text-xl font-bold text-white font-mono mt-2 block">
                  {diskConfig.algorithm}
                </span>
              </div>
            </div>

            {/* Visual Movement Path */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Head Movement Traversal Sequence
              </h3>
              <div className="flex items-center overflow-x-auto pb-3 pt-1 space-x-2">
                {diskResults.sequence.map((cyl, idx) => (
                  <React.Fragment key={idx}>
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs font-bold ${
                        idx === 0 
                          ? 'bg-indigo-600 text-white border-2 border-indigo-400' 
                          : 'bg-slate-900 border border-slate-700 text-slate-200'
                      }`}>
                        {cyl}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 font-mono">{idx === 0 ? 'Start' : `T${idx}`}</span>
                    </div>
                    {idx < diskResults.sequence.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Enqueue Asynchronous I/O Request">
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Select Initiating Process
            </label>
            <select
              value={newRequest.pid}
              onChange={e => setNewRequest({ ...newRequest, pid: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              {processes.map(p => (
                <option key={p.pid} value={p.pid}>{p.pid} — {p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Target I/O Device
            </label>
            <select
              value={newRequest.device}
              onChange={e => setNewRequest({ ...newRequest, device: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="Disk">Magnetic Disk (Secondary Storage)</option>
              <option value="Printer">Line Printer (Output Device)</option>
              <option value="Network">Ethernet Network Interface (NIC)</option>
              <option value="Console">Virtual Terminal Console (TTY)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Request Operation Type
            </label>
            <select
              value={newRequest.requestType}
              onChange={e => setNewRequest({ ...newRequest, requestType: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="READ">READ (Block Retrieval)</option>
              <option value="WRITE">WRITE (Flush Buffer)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/30"
            >
              Enqueue I/O
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
