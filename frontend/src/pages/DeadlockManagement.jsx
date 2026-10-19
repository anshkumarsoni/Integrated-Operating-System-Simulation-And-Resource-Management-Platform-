import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, RefreshCw, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import DeadlockGraph from '../components/DeadlockGraph';
import StatCard from '../components/StatCard';

export default function DeadlockManagement() {
  const { osService, terminateProcess } = useSimulation();

  const [activeTab, setActiveTab] = useState('Avoidance');
  const [bankerData, setBankerData] = useState({
    processes: ['P0', 'P1', 'P2', 'P3', 'P4'],
    resources: ['R1 (Disk)', 'R2 (Printer)', 'R3 (Lock)'],
    allocation: [
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
      [2, 1, 1],
      [0, 0, 2]
    ],
    maximum: [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
      [4, 3, 3]
    ],
    available: [3, 3, 2]
  });

  const [bankerResult, setBankerResult] = useState(null);
  const [ragData, setRagData] = useState(null);
  const [recoveryMessage, setRecoveryMessage] = useState('');

  useEffect(() => {
    handleBankersCheck();
    fetchRagData();
  }, [activeTab]);

  const handleBankersCheck = () => {
    const res = osService.checkBankersAlgorithm(
      bankerData.processes,
      bankerData.allocation,
      bankerData.maximum,
      bankerData.available
    );
    setBankerResult(res);
  };

  const fetchRagData = () => {
    // Generate RAG request matrix from Need matrix
    const req = bankerData.maximum.map((row, i) =>
      row.map((val, j) => Math.max(0, val - (bankerData.allocation[i]?.[j] || 0)))
    );

    const rNames = ['R1', 'R2', 'R3'];
    const data = osService.getRAGData(
      bankerData.processes,
      rNames,
      bankerData.allocation,
      req
    );
    setRagData(data);
  };

  const handleMatrixChange = (type, i, j, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = JSON.parse(JSON.stringify(bankerData));
    if (type === 'available') {
      updated.available[j] = num;
    } else {
      updated[type][i][j] = num;
    }
    setBankerData(updated);
  };

  const handleTerminateVictim = (procName) => {
    const idx = bankerData.processes.indexOf(procName);
    if (idx !== -1) {
      const updated = JSON.parse(JSON.stringify(bankerData));
      // Reclaim allocation
      for (let j = 0; j < updated.available.length; j++) {
        updated.available[j] += updated.allocation[idx][j];
        updated.allocation[idx][j] = 0;
      }
      setBankerData(updated);
      setRecoveryMessage(`Terminated process ${procName}. Resources reclaimed into Available vector.`);
      setTimeout(() => setRecoveryMessage(''), 4000);
      
      const res = osService.checkBankersAlgorithm(
        updated.processes,
        updated.allocation,
        updated.maximum,
        updated.available
      );
      setBankerResult(res);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Deadlock Avoidance & Banker's Algorithm</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Evaluate system state matrices, detect circular waits via Resource Allocation Graphs, and execute deadlock recovery.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        {[
          { id: 'Avoidance', label: "Deadlock Avoidance (Banker's)", icon: Shield },
          { id: 'Detection', label: 'Resource Allocation Graph (RAG)', icon: Activity },
          { id: 'Recovery', label: 'Deadlock Recovery & Preemption', icon: AlertTriangle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-xs font-bold transition-all border-b-2 ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {recoveryMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
          <span>{recoveryMessage}</span>
          <button onClick={() => setRecoveryMessage('')} className="font-bold ml-3">✕</button>
        </div>
      )}

      {/* 1. Avoidance Tab (Banker's Algorithm) */}
      {activeTab === 'Avoidance' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Matrices Editor */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                System State Matrices (Editable)
              </h2>
              <button
                onClick={handleBankersCheck}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-all flex items-center"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-evaluate
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="p-2.5 border-r border-slate-800">Proc</th>
                    <th colSpan={bankerData.resources.length} className="p-2.5 border-r border-slate-800 text-indigo-300">
                      Allocation Matrix
                    </th>
                    <th colSpan={bankerData.resources.length} className="p-2.5 text-purple-300">
                      Maximum Claim Matrix
                    </th>
                  </tr>
                  <tr className="bg-slate-900/60 border-b border-slate-800 text-[11px] text-slate-400">
                    <th className="p-1 border-r border-slate-800"></th>
                    {bankerData.resources.map(r => <th key={`a-${r}`} className="p-1.5 border-r border-slate-800 font-mono">{r.split(' ')[0]}</th>)}
                    {bankerData.resources.map(r => <th key={`m-${r}`} className="p-1.5 border-r border-slate-800 font-mono">{r.split(' ')[0]}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono">
                  {bankerData.processes.map((p, i) => (
                    <tr key={p} className="hover:bg-slate-900/60">
                      <td className="p-2 font-bold text-indigo-400 border-r border-slate-800 bg-slate-900/30">{p}</td>
                      {/* Allocation inputs */}
                      {bankerData.resources.map((_, j) => (
                        <td key={`alloc-${i}-${j}`} className="p-1 border-r border-slate-800">
                          <input
                            type="number"
                            min="0"
                            value={bankerData.allocation[i][j]}
                            onChange={e => handleMatrixChange('allocation', i, j, e.target.value)}
                            className="w-12 bg-slate-900 border border-slate-700 text-center rounded p-1 text-xs focus:outline-none focus:border-indigo-500 font-bold text-slate-200"
                          />
                        </td>
                      ))}
                      {/* Maximum inputs */}
                      {bankerData.resources.map((_, j) => (
                        <td key={`max-${i}-${j}`} className="p-1 border-r border-slate-800">
                          <input
                            type="number"
                            min="0"
                            value={bankerData.maximum[i][j]}
                            onChange={e => handleMatrixChange('maximum', i, j, e.target.value)}
                            className="w-12 bg-slate-900 border border-slate-700 text-center rounded p-1 text-xs focus:outline-none focus:border-purple-500 font-bold text-purple-300"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Available Vector */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Available Resources Vector (Free Instances)
              </h3>
              <div className="flex space-x-4">
                {bankerData.resources.map((r, j) => (
                  <div key={`avail-${r}`} className="flex flex-col items-center">
                    <span className="text-[11px] font-semibold text-slate-400 mb-1 font-mono">{r}</span>
                    <input
                      type="number"
                      min="0"
                      value={bankerData.available[j]}
                      onChange={e => handleMatrixChange('available', 0, j, e.target.value)}
                      className="w-16 bg-slate-900 border border-slate-700 text-center py-1.5 rounded-lg text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results & Need Matrix */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Banker's Safety Algorithm Results
            </h2>

            {bankerResult && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Safe/Unsafe Banner */}
                <div className={`p-4 rounded-xl border text-center ${
                  bankerResult.isSafe 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="flex items-center justify-center space-x-2 text-xl font-extrabold mb-1">
                    {bankerResult.isSafe ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        <span>SYSTEM IN SAFE STATE</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-rose-400" />
                        <span>UNSAFE STATE / DEADLOCK DETECTED</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs opacity-90">{bankerResult.summary}</p>
                </div>

                {/* Safe Sequence Chain */}
                {bankerResult.isSafe && bankerResult.safeSequence && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Calculated Safe Sequence
                    </span>
                    <div className="flex items-center flex-wrap gap-2 pt-1">
                      {bankerResult.safeSequence.map((p, i) => (
                        <React.Fragment key={p}>
                          <span className="px-3 py-1.5 bg-indigo-600 text-white font-mono font-bold text-xs rounded-lg shadow-sm">
                            {p}
                          </span>
                          {i < bankerResult.safeSequence.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-slate-500" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deadlocked Processes */}
                {!bankerResult.isSafe && bankerResult.deadlockedProcesses.length > 0 && (
                  <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-500/30 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      Deadlocked / Unfinished Processes:
                    </span>
                    <div className="flex gap-2 pt-1">
                      {bankerResult.deadlockedProcesses.map(p => (
                        <span key={p} className="px-3 py-1 bg-rose-600 text-white font-mono font-bold text-xs rounded-lg">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Calculated Need Matrix */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Calculated Need Matrix (Max − Allocation)
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-xs text-center font-mono">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-2 border-r border-slate-800">Process</th>
                          {bankerData.resources.map(r => (
                            <th key={`nr-${r}`} className="p-2 border-r border-slate-800">{r.split(' ')[0]}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {bankerData.processes.map((p, i) => (
                          <tr key={`need-${p}`} className="hover:bg-slate-900/60">
                            <td className="p-2 font-bold text-indigo-400 border-r border-slate-800">{p}</td>
                            {bankerResult.needMatrix[i]?.map((val, j) => (
                              <td key={`nv-${i}-${j}`} className="p-2 text-indigo-300 font-bold border-r border-slate-800">
                                {val}
                              </td>
                            ))}
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
      )}

      {/* 2. Detection Tab (Resource Allocation Graph) */}
      {activeTab === 'Detection' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-indigo-400" /> Resource Allocation Graph (RAG) & Cycle Detection
            </h2>
            <button onClick={fetchRagData} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Nodes represent Processes (circles) and Resources (squares). Solid blue arrows indicate resource allocations (<code className="text-blue-400 font-mono">R → P</code>), and dashed amber arrows represent pending requests (<code className="text-amber-400 font-mono">P → R</code>).
          </p>

          <DeadlockGraph data={ragData} />
        </div>
      )}

      {/* 3. Recovery Tab */}
      {activeTab === 'Recovery' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Process Termination */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              1. Process Termination (Abort Victim)
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Abort one or more processes involved in the circular dependency to break the deadlock cycle and reclaim all assigned resources.
            </p>

            <div className="space-y-2 pt-2">
              {bankerData.processes.map((p, idx) => (
                <div key={p} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-mono font-bold text-xs text-indigo-400 border border-slate-800">
                      {p}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block">Process {p}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Alloc: [{bankerData.allocation[idx].join(', ')}] | Max: [{bankerData.maximum[idx].join(', ')}]
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTerminateVictim(p)}
                    className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-bold transition-colors border border-rose-500/30"
                  >
                    Abort Process
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Preemption */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              2. Resource Preemption & Rollback
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Preempt resources held by one process and allocate them to another process with higher priority or closer to completion.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-300 block font-mono">Preempt R1 (Disk)</span>
                  <span className="text-[11px] text-slate-400">Preempt from P1 and reassign to P0</span>
                </div>
                <button
                  onClick={() => {
                    handleTerminateVictim('P1');
                    setRecoveryMessage('Preempted resources from P1 to satisfy P0.');
                  }}
                  className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg text-xs font-bold transition-colors border border-amber-500/30"
                >
                  Preempt
                </button>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-300 block font-mono">Preempt R3 (File Lock)</span>
                  <span className="text-[11px] text-slate-400">Preempt from P2 and reassign to P3</span>
                </div>
                <button
                  onClick={() => {
                    handleTerminateVictim('P2');
                    setRecoveryMessage('Preempted resources from P2 to satisfy P3.');
                  }}
                  className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg text-xs font-bold transition-colors border border-amber-500/30"
                >
                  Preempt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
