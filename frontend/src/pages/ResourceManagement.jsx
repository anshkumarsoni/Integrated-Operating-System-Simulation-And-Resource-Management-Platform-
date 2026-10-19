import React, { useState } from 'react';
import { Package, Plus, Minus, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import ResourceTable from '../components/ResourceTable';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';

export default function ResourceManagement() {
  const { 
    resources, 
    processes, 
    requestResource, 
    releaseResource, 
    refreshAll 
  } = useSimulation();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [selectedResId, setSelectedResId] = useState('R1');
  const [selectedPid, setSelectedPid] = useState('P101');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleOpenRequest = (resId) => {
    setSelectedResId(resId);
    setIsRequestModalOpen(true);
  };

  const handleOpenRelease = (resId) => {
    setSelectedResId(resId);
    setIsReleaseModalOpen(true);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const res = await requestResource(selectedPid, selectedResId, quantity);
    setIsRequestModalOpen(false);

    if (res.allocated) {
      setMessage({ text: res.message, type: 'success' });
    } else {
      setMessage({ text: res.message, type: 'warning' });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleReleaseSubmit = async (e) => {
    e.preventDefault();
    const res = await releaseResource(selectedPid, selectedResId, quantity);
    setIsReleaseModalOpen(false);
    setMessage({ text: res.message, type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const totalInstances = resources.reduce((sum, r) => sum + (r.total || 0), 0);
  const allocatedInstances = resources.reduce((sum, r) => sum + (r.allocated || 0), 0);
  const availableInstances = resources.reduce((sum, r) => sum + (r.available || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Resource Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Monitor multi-instance hardware & software resources (Disk, Printer, Locks, DB) and control atomic allocations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Request Resource
          </button>
          <button
            onClick={() => setIsReleaseModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-colors border border-slate-700"
          >
            <Minus className="w-4 h-4 mr-1.5" />
            Release Resource
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {message.text && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ text: '', type: '' })} className="font-bold ml-3">✕</button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Resource Instances" value={totalInstances} color="blue" subtitle="Global system capacity" />
        <StatCard title="Allocated Instances" value={allocatedInstances} color="purple" subtitle="Active locks & claims" />
        <StatCard title="Available Instances" value={availableInstances} color="emerald" subtitle="Ready for allocation" />
        <StatCard title="Resource Types" value={`${resources.length} Types`} color="indigo" subtitle="R1, R2, R3, R4" />
      </div>

      {/* Resource Table */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
            <Package className="w-4 h-4 mr-2 text-indigo-400" /> Resource Allocation Table
          </h2>
          <span className="text-xs text-slate-500">Atomic allocation & wait queues</span>
        </div>

        <ResourceTable 
          resources={resources} 
          onRequest={handleOpenRequest} 
          onRelease={handleOpenRelease} 
        />
      </div>

      {/* Request Modal */}
      <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Process Resource Request">
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Select Requesting Process
            </label>
            <select
              value={selectedPid}
              onChange={e => setSelectedPid(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              {processes.map(p => (
                <option key={p.pid} value={p.pid}>{p.pid} — {p.name} ({p.state})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Select Resource
            </label>
            <select
              value={selectedResId}
              onChange={e => setSelectedResId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              {resources.map(r => (
                <option key={r.id} value={r.id}>
                  {r.id} — {r.name} (Available: {r.available}/{r.total})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Quantity / Instances
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/30"
            >
              Request Resource
            </button>
          </div>
        </form>
      </Modal>

      {/* Release Modal */}
      <Modal isOpen={isReleaseModalOpen} onClose={() => setIsReleaseModalOpen(false)} title="Process Resource Release">
        <form onSubmit={handleReleaseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Select Process Holding Resource
            </label>
            <select
              value={selectedPid}
              onChange={e => setSelectedPid(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              {processes.map(p => (
                <option key={p.pid} value={p.pid}>{p.pid} — {p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Resource to Release
            </label>
            <select
              value={selectedResId}
              onChange={e => setSelectedResId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              {resources.map(r => (
                <option key={r.id} value={r.id}>{r.id} — {r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Quantity / Instances to Free
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsReleaseModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-600/30"
            >
              Release & Reclaim
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
