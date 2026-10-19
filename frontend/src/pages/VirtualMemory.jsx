import React, { useState, useEffect } from 'react';
import { Layers, Play, RefreshCw, Zap, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import StatCard from '../components/StatCard';
import PageTableView from '../components/PageTableView';

export default function VirtualMemory() {
  const { osService } = useSimulation();

  const [algorithm, setAlgorithm] = useState('FIFO');
  const [refString, setRefString] = useState('7 0 1 2 0 3 0 4 2 3 0 3 2');
  const [framesCount, setFramesCount] = useState(3);
  const [results, setResults] = useState(null);

  useEffect(() => {
    handleRunReplacement();
  }, [algorithm, framesCount]);

  const handleRunReplacement = () => {
    const pages = refString
      .split(/[\s,]+/)
      .map(p => parseInt(p.trim(), 10))
      .filter(n => !isNaN(n));

    if (pages.length === 0) return;

    const res = osService.runPageReplacement(pages, framesCount, algorithm);
    setResults(res);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Virtual Memory & Page Replacement</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Simulate demand paging, Page Table address translation, TLB lookup, and page replacement policies.
          </p>
        </div>
        <button
          onClick={handleRunReplacement}
          className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/30"
        >
          <Play className="w-4 h-4 mr-2 fill-current" />
          Run Page Replacement
        </button>
      </div>

      {/* Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Configuration & Reference String
        </h2>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          {/* Algorithm Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Algorithm</label>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['FIFO', 'LRU', 'Optimal'].map(algo => (
                <button
                  key={algo}
                  onClick={() => setAlgorithm(algo)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    algorithm === algo
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>
          </div>

          {/* Reference String Input */}
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Page Reference String (Space/comma separated)
            </label>
            <input
              type="text"
              value={refString}
              onChange={e => setRefString(e.target.value)}
              placeholder="e.g. 7 0 1 2 0 3 0 4 2 3"
              className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Frame Count */}
          <div className="w-28">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Physical Frames</label>
            <input
              type="number"
              min="1"
              max="8"
              value={framesCount}
              onChange={e => setFramesCount(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 text-center"
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Total Page Faults" value={results.faults} color="red" subtitle="Page misses (disk load)" />
            <StatCard title="Total Page Hits" value={results.hits} color="emerald" subtitle="In-memory cache hits" />
            <StatCard title="Page Fault Rate" value={`${results.faultRate}%`} color="orange" subtitle="Miss ratio" />
            <StatCard title="Hit Rate" value={`${results.hitRate}%`} color="blue" subtitle="Efficiency ratio" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step-by-Step Frame Matrix View */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
                  <Layers className="w-4 h-4 mr-2 text-indigo-400" /> Frame Allocation Timeline ({algorithm})
                </h2>
                <span className="text-xs font-mono text-slate-400">Total References: {results.steps.length}</span>
              </div>

              <PageTableView steps={results.steps} framesCount={framesCount} />
            </div>

            {/* Right Side: TLB Stats & Page Table */}
            <div className="space-y-6">
              {/* TLB Box */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center">
                  <Cpu className="w-4 h-4 mr-2 text-blue-400" /> TLB (Translation Buffer)
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">TLB Hits</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">{results.tlbHits}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">TLB Misses</span>
                    <span className="text-lg font-bold text-rose-400 font-mono">{results.tlbMisses}</span>
                  </div>
                </div>
              </div>

              {/* Page Table View */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center">
                  <Layers className="w-4 h-4 mr-2 text-purple-400" /> Final Page Table
                </h2>
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="min-w-full divide-y divide-slate-800 text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-3 py-2.5">Page #</th>
                        <th className="px-3 py-2.5">Frame #</th>
                        <th className="px-3 py-2.5">Valid Bit</th>
                        <th className="px-3 py-2.5">Last Accessed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-mono">
                      {results.pageTable.map(pt => (
                        <tr key={pt.id} className="hover:bg-slate-900/60">
                          <td className="px-3 py-2 text-indigo-300 font-bold">Page {pt.id}</td>
                          <td className="px-3 py-2 text-slate-300">{pt.frame !== null ? `Frame ${pt.frame + 1}` : 'Disk'}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              pt.inMemory ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {pt.inMemory ? '1 (Valid)' : '0 (Invalid)'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-500 text-[11px]">{pt.lastAccessed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
