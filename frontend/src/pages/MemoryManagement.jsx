import React, { useState } from 'react';
import { MemoryStick, Layers, Database, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import MemoryVisualizer from '../components/MemoryVisualizer';
import StatCard from '../components/StatCard';

export default function MemoryManagement() {
  const { 
    memoryStatus, 
    processes, 
    allocateMemory, 
    deallocateMemory 
  } = useSimulation();

  const [algorithm, setAlgorithm] = useState('First Fit');
  const [selectedPid, setSelectedPid] = useState('');
  const [customSize, setCustomSize] = useState('');
  const [deallocPid, setDeallocPid] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // When a process is selected, auto-fill its required memory
  const handleProcessSelect = (pid) => {
    setSelectedPid(pid);
    const proc = processes.find(p => p.pid === pid);
    if (proc) {
      setCustomSize(proc.memory_required);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!selectedPid) {
      setMessage({ text: 'Please select a target process.', type: 'error' });
      return;
    }

    const size = Number(customSize);
    if (isNaN(size) || size <= 0) {
      setMessage({ text: 'Please enter a valid memory size in MB.', type: 'error' });
      return;
    }

    const res = await allocateMemory(selectedPid, size, algorithm);
    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setSelectedPid('');
      setCustomSize('');
    } else {
      setMessage({ text: res.message, type: 'error' });
    }

    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleDeallocate = async (e) => {
    e.preventDefault();
    if (!deallocPid) {
      setMessage({ text: 'Please select a process to deallocate.', type: 'error' });
      return;
    }

    const res = await deallocateMemory(deallocPid);
    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setDeallocPid('');
    } else {
      setMessage({ text: res.message, type: 'error' });
    }

    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const allocatedBlocks = (memoryStatus?.blocks || []).filter(b => b.status === 'Allocated' && b.pid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Memory Management & Partitioning</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Simulate physical memory allocation algorithms, calculate internal/external fragmentation, and inspect partition maps.
          </p>
        </div>

        {/* Algorithm Picker */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {['First Fit', 'Best Fit', 'Worst Fit'].map(algo => (
            <button
              key={algo}
              onClick={() => setAlgorithm(algo)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                algorithm === algo
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {algo}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Banner */}
      {message.text && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ text: '', type: '' })} className="font-bold ml-3">✕</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Simulated" value={`${memoryStatus?.totalMemory || 1024} MB`} color="slate" subtitle="Simulated RAM" />
        <StatCard title="Used Memory" value={`${memoryStatus?.usedMemory || 0} MB`} color="purple" subtitle="Active payload" />
        <StatCard title="Free Memory" value={`${memoryStatus?.freeMemory || 1024} MB`} color="emerald" subtitle="Available space" />
        <StatCard title="Internal Frag." value={`${memoryStatus?.internalFrag || 0} MB`} color="yellow" subtitle="Unused in block" />
        <StatCard title="External Frag." value={`${memoryStatus?.externalFrag || 0} MB`} color="orange" subtitle="Non-contiguous free" />
      </div>

      {/* Main Visualizer & Allocation Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Memory Map */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <MemoryStick className="w-4 h-4 mr-2 text-indigo-400" /> Physical Memory Partition Map
            </h2>
            <span className="text-xs font-mono text-indigo-300 font-bold">
              Algorithm: {algorithm}
            </span>
          </div>

          <MemoryVisualizer 
            blocks={memoryStatus?.blocks || []} 
            totalMemory={memoryStatus?.totalMemory || 1024} 
          />
        </div>

        {/* Right Column: Allocation & Deallocation Controls */}
        <div className="space-y-6">
          {/* Allocate Box */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-emerald-400" /> Allocate Process Memory
            </h2>

            <form onSubmit={handleAllocate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Select Process
                </label>
                <select
                  value={selectedPid}
                  onChange={e => handleProcessSelect(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="">-- Choose Process --</option>
                  {processes.map(p => (
                    <option key={p.pid} value={p.pid}>
                      {p.pid} — {p.name} ({p.memory_required} MB required)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Memory Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1024"
                  placeholder="e.g. 150"
                  value={customSize}
                  onChange={e => setCustomSize(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/30"
              >
                Allocate via {algorithm}
              </button>
            </form>
          </div>

          {/* Deallocate Box */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <Database className="w-4 h-4 mr-2 text-rose-400" /> Free / Deallocate Memory
            </h2>

            <form onSubmit={handleDeallocate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Select Allocated Process
                </label>
                <select
                  value={deallocPid}
                  onChange={e => setDeallocPid(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-rose-500 font-medium"
                >
                  <option value="">-- Choose Allocated Process --</option>
                  {allocatedBlocks.map(b => (
                    <option key={b.id} value={b.pid}>
                      {b.pid} — in {b.name} ({b.size} MB)
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={allocatedBlocks.length === 0}
                className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold rounded-xl text-xs transition-all border border-rose-500/30 disabled:opacity-30"
              >
                Deallocate & Reclaim Block
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
