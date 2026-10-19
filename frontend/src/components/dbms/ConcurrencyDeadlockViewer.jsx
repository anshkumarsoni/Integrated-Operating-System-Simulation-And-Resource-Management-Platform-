import React, { useState } from 'react';
import { 
  Lock, AlertTriangle, Play, RefreshCw, CheckCircle2, 
  XCircle, ArrowRight, ShieldAlert, Cpu, Database, ChevronRight
} from 'lucide-react';

export default function ConcurrencyDeadlockViewer() {
  const [scenario, setScenario] = useState('deadlock'); // '2pl' | 'deadlock'
  const [currentStep, setCurrentStep] = useState(0);

  // Scenario 1: Clean 2PL Two-Phase Locking
  const SCENARIO_2PL_STEPS = [
    {
      step: 1,
      title: 'Step 1: T1 Growing Phase (Acquire Lock)',
      t1: 'ACQUIRE Exclusive Lock (X-Lock) on processes(P101)',
      t2: 'IDLE (Awaiting dispatch)',
      locks: [
        { target: 'processes(P101)', tx: 'T1', type: 'EXCLUSIVE', status: 'GRANTED' }
      ],
      wfg: [],
      status: 'NORMAL',
      log: 'T1 successfully acquired Exclusive Lock on row P101. Growing Phase initialized.'
    },
    {
      step: 2,
      title: 'Step 2: T2 Attempts Conflicting Lock (Blocked by 2PL)',
      t1: 'Writing update: UPDATE processes SET priority = 1 WHERE pid = "P101"',
      t2: 'REQUEST Exclusive Lock on processes(P101) -> BLOCKED',
      locks: [
        { target: 'processes(P101)', tx: 'T1', type: 'EXCLUSIVE', status: 'GRANTED' },
        { target: 'processes(P101)', tx: 'T2', type: 'EXCLUSIVE', status: 'WAITING' }
      ],
      wfg: [{ from: 'T2', to: 'T1' }],
      status: 'BLOCKED',
      log: 'T2 blocked on processes(P101). Strict 2PL prevents dirty reads; T2 placed in wait queue.'
    },
    {
      step: 3,
      title: 'Step 3: T1 Commits & Shrinking Phase',
      t1: 'COMMIT; Releases lock on processes(P101)',
      t2: 'Woken up: Lock granted to T2!',
      locks: [
        { target: 'processes(P101)', tx: 'T2', type: 'EXCLUSIVE', status: 'GRANTED' }
      ],
      wfg: [],
      status: 'NORMAL',
      log: 'T1 committed. Shrinking phase complete. Lock released and safely passed to T2.'
    },
    {
      step: 4,
      title: 'Step 4: T2 Finishes & Commits',
      t1: 'COMPLETED (Committed)',
      t2: 'COMMIT; Releases all locks',
      locks: [],
      wfg: [],
      status: 'RESOLVED',
      log: 'T2 committed successfully. Serializable execution schedule preserved with 0 anomalies.'
    }
  ];

  // Scenario 2: Transaction Deadlock with Wait-For-Graph Cycle
  const SCENARIO_DEADLOCK_STEPS = [
    {
      step: 1,
      title: 'Step 1: Concurrent Lock Acquisition',
      t1: 'ACQUIRE Exclusive Lock on processes(P101)',
      t2: 'ACQUIRE Exclusive Lock on resources(R1)',
      locks: [
        { target: 'processes(P101)', tx: 'T1', type: 'EXCLUSIVE', status: 'GRANTED' },
        { target: 'resources(R1)', tx: 'T2', type: 'EXCLUSIVE', status: 'GRANTED' }
      ],
      wfg: [],
      status: 'NORMAL',
      log: 'Both transactions acquire distinct row locks in parallel. No contention yet.'
    },
    {
      step: 2,
      title: 'Step 2: T1 Requests Resource Held by T2',
      t1: 'REQUEST Exclusive Lock on resources(R1) -> BLOCKED by T2',
      t2: 'Holding resources(R1), computing workload...',
      locks: [
        { target: 'processes(P101)', tx: 'T1', type: 'EXCLUSIVE', status: 'GRANTED' },
        { target: 'resources(R1)', tx: 'T2', type: 'EXCLUSIVE', status: 'GRANTED' },
        { target: 'resources(R1)', tx: 'T1', type: 'EXCLUSIVE', status: 'WAITING' }
      ],
      wfg: [{ from: 'T1', to: 'T2' }],
      status: 'BLOCKED',
      log: 'T1 requests lock held by T2. Wait edge created in Wait-For-Graph: T1 -> T2.'
    },
    {
      step: 3,
      title: 'Step 3: T2 Requests Row Held by T1 (Circular Wait!)',
      t1: 'WAITING for T2 to release resources(R1)',
      t2: 'REQUEST Exclusive Lock on processes(P101) -> BLOCKED by T1',
      locks: [
        { target: 'processes(P101)', tx: 'T1', type: 'EXCLUSIVE', status: 'GRANTED' },
        { target: 'resources(R1)', tx: 'T2', type: 'EXCLUSIVE', status: 'GRANTED' },
        { target: 'resources(R1)', tx: 'T1', type: 'EXCLUSIVE', status: 'WAITING' },
        { target: 'processes(P101)', tx: 'T2', type: 'EXCLUSIVE', status: 'WAITING' }
      ],
      wfg: [{ from: 'T1', to: 'T2' }, { from: 'T2', to: 'T1' }],
      status: 'DEADLOCK',
      log: 'DEADLOCK DETECTED! Circular dependency in Wait-For-Graph: T1 -> T2 -> T1. Neither transaction can proceed!'
    },
    {
      step: 4,
      title: 'Step 4: InnoDB Engine Victim Selection & Auto-Rollback',
      t1: 'RESUMED: Lock on resources(R1) granted!',
      t2: 'ABORTED: Rolled back by MySQL InnoDB Deadlock Detector',
      locks: [
        { target: 'processes(P101)', tx: 'T1', type: 'EXCLUSIVE', status: 'GRANTED' },
        { target: 'resources(R1)', tx: 'T1', type: 'EXCLUSIVE', status: 'GRANTED' }
      ],
      wfg: [],
      status: 'RESOLVED',
      log: 'MySQL Engine Resolution: ERROR 1213 (40001): Deadlock found when trying to get lock. T2 selected as victim with smallest undo log footprint and rolled back.'
    }
  ];

  const stepsList = scenario === '2pl' ? SCENARIO_2PL_STEPS : SCENARIO_DEADLOCK_STEPS;
  const currentStepData = stepsList[currentStep] || stepsList[0];

  const handleNextStep = () => {
    if (currentStep < stepsList.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              DBMS Concurrency Control & Deadlock Detection (2PL & WFG)
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono">
            innodb_deadlock_detect = ON
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
          Observe how the relational database engine guarantees serializability via <strong>Two-Phase Locking (2PL)</strong>, constructs dynamic <strong>Wait-For-Graphs (WFG)</strong>, and resolves circular deadlocks through automated victim rollback.
        </p>
      </div>

      {/* Scenario Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => { setScenario('deadlock'); setCurrentStep(0); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              scenario === 'deadlock'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Scenario 1: Transaction Deadlock & Cycle (WFG)
          </button>
          <button
            onClick={() => { setScenario('2pl'); setCurrentStep(0); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              scenario === '2pl'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Scenario 2: Strict 2PL Serializability (Safe)
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs"
            title="Reset step counter"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-mono text-slate-400 px-2">
            Step {currentStep + 1} / {stepsList.length}
          </span>
          <button
            onClick={handleNextStep}
            disabled={currentStep === stepsList.length - 1}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-40 shadow-sm"
          >
            Next Step &rarr;
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Transaction Timelines & Lock Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Step Banner */}
          <div className={`p-4 rounded-2xl border transition-all ${
            currentStepData.status === 'DEADLOCK'
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              : currentStepData.status === 'RESOLVED'
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider">{currentStepData.title}</h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                currentStepData.status === 'DEADLOCK' ? 'bg-rose-500/20 text-rose-300' :
                currentStepData.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' :
                'bg-indigo-500/20 text-indigo-300'
              }`}>
                {currentStepData.status}
              </span>
            </div>
            <p className="font-mono text-xs opacity-90">{currentStepData.log}</p>
          </div>

          {/* Parallel Transaction Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Transaction 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-indigo-400 font-mono">Transaction T1 (PID: P101)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
              </div>
              <p className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 min-h-[58px]">
                {currentStepData.t1}
              </p>
            </div>

            {/* Transaction 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-amber-400 font-mono">Transaction T2 (PID: P102)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              </div>
              <p className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 min-h-[58px]">
                {currentStepData.t2}
              </p>
            </div>
          </div>

          {/* Active Row Lock Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <Lock className="w-4 h-4 mr-2 text-indigo-400" /> Active InnoDB Row Lock Table (performance_schema.data_locks)
            </h4>

            {currentStepData.locks.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Resource Target</th>
                      <th className="p-3">Held / Requested By</th>
                      <th className="p-3">Lock Type</th>
                      <th className="p-3">Lock Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-[11px]">
                    {currentStepData.locks.map((lk, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="p-3 text-white font-bold">{lk.target}</td>
                        <td className="p-3 text-indigo-300 font-bold">{lk.tx}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold">
                            {lk.type}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            lk.status === 'GRANTED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            {lk.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                All locks released. Database in quiescent state.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Wait-For-Graph (WFG) Visualization */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2 text-rose-400" /> Wait-For Graph (WFG)
            </h4>

            {/* SVG Visualizer */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[220px]">
              <svg width="240" height="150" viewBox="0 0 240 150">
                {/* Node T1 */}
                <circle cx="50" cy="75" r="28" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2.5" />
                <text x="50" y="80" textAnchor="middle" fill="#c7d2fe" fontSize="13" fontWeight="bold" fontFamily="monospace">T1</text>

                {/* Node T2 */}
                <circle cx="190" cy="75" r="28" fill="#451a03" stroke="#f59e0b" strokeWidth="2.5" />
                <text x="190" y="80" textAnchor="middle" fill="#fde68a" fontSize="13" fontWeight="bold" fontFamily="monospace">T2</text>

                {/* Arrow T1 -> T2 */}
                {currentStepData.wfg.some(e => e.from === 'T1' && e.to === 'T2') && (
                  <g>
                    <path d="M 80 60 Q 120 30 160 60" fill="transparent" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="4 2" />
                    <polygon points="160,60 150,55 152,65" fill="#f43f5e" />
                    <text x="120" y="38" textAnchor="middle" fill="#fda4af" fontSize="9" fontFamily="monospace">Waits for</text>
                  </g>
                )}

                {/* Arrow T2 -> T1 */}
                {currentStepData.wfg.some(e => e.from === 'T2' && e.to === 'T1') && (
                  <g>
                    <path d="M 160 90 Q 120 120 80 90" fill="transparent" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="4 2" />
                    <polygon points="80,90 90,95 88,85" fill="#f43f5e" />
                    <text x="120" y="125" textAnchor="middle" fill="#fda4af" fontSize="9" fontFamily="monospace">Waits for</text>
                  </g>
                )}

                {currentStepData.wfg.length === 0 && (
                  <text x="120" y="79" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="sans-serif">No Wait Edges</text>
                )}
              </svg>

              {currentStepData.wfg.length === 2 && (
                <div className="mt-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold font-mono animate-bounce">
                  🚨 CYCLE DETECTED: T1 &harr; T2
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
              <span className="font-bold text-slate-300">💡 DBMS vs OS Deadlock Handling:</span>
              <p>
                <strong>In OS:</strong> Uses Dijkstra's Banker's Algorithm to <em>avoid</em> entering an unsafe state before allocating resources.
              </p>
              <p>
                <strong>In MySQL:</strong> Allows speculative locking, but runs background cycle-finding on the <em>Wait-For Graph (WFG)</em>. When a cycle appears, it immediately selects a victim and rolls it back.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
