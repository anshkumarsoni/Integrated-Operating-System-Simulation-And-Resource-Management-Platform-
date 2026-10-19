import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Cpu, Clock, Layers, RefreshCw, Zap, CheckCircle2, 
  Sparkles, ArrowRight, Check, HelpCircle, BarChart2, ShieldCheck, 
  ChevronRight, ShieldAlert, Activity, GitBranch, Gauge, Filter,
  Sliders, Bot, PlusCircle, Trash2, CheckCircle, Info
} from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import { CPUScheduler, PRESET_SCENARIOS } from '../simulation/cpuScheduler';
import GanttChart from '../components/GanttChart';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function CPUScheduling() {
  const { processes: globalProcesses, osService } = useSimulation();

  // Mode Selection: 'AUTO' (Default - Autonomous Kernel Selection) or 'MANUAL' (User Manual Selection)
  const [schedulingMode, setSchedulingMode] = useState('AUTO');

  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const [customScenarioProcesses, setCustomScenarioProcesses] = useState(null);
  
  // Algorithm & Simulation Parameters
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [isPreemptive, setIsPreemptive] = useState(false);
  
  const [results, setResults] = useState(null);
  const [smartAdvice, setSmartAdvice] = useState(null);

  // Inline Quick Add Process state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProc, setNewProc] = useState({
    name: '',
    arrival_time: 0,
    burst_time: 8,
    priority: 3
  });

  // Derive candidate processes (either from loaded workload profile or live ready queue)
  const candidateProcesses = useMemo(() => {
    if (customScenarioProcesses && customScenarioProcesses.length > 0) {
      return customScenarioProcesses;
    }
    const ready = globalProcesses.filter(p => p.state === 'READY' || p.state === 'RUNNING');
    return ready.length > 0 ? ready : globalProcesses.filter(p => p.state !== 'TERMINATED');
  }, [customScenarioProcesses, globalProcesses]);

  // Compute live advice & automatically apply if in AUTO mode
  useEffect(() => {
    if (candidateProcesses.length === 0) {
      setResults(null);
      setSmartAdvice(null);
      return;
    }

    const advice = CPUScheduler.autoSelectOptimalAlgorithm(candidateProcesses);
    setSmartAdvice(advice);

    if (schedulingMode === 'AUTO') {
      // In Automatic Mode, the user does not choose the algorithm; the kernel auto-assigns it based on scenario
      setAlgorithm(advice.recommendedAlgorithm);
      setIsPreemptive(advice.recommendedPreemptive);
      if (advice.recommendedTimeQuantum) {
        setTimeQuantum(advice.recommendedTimeQuantum);
      }
    }
  }, [candidateProcesses, schedulingMode]);

  // Re-run scheduling calculations whenever algorithm, parameters, or processes change
  useEffect(() => {
    if (candidateProcesses.length === 0) {
      setResults(null);
      return;
    }

    const safeQuantum = Math.max(1, Number(timeQuantum) || 2);
    const res = CPUScheduler.runScheduling(
      algorithm,
      candidateProcesses,
      safeQuantum,
      isPreemptive
    );
    setResults(res);
  }, [algorithm, timeQuantum, isPreemptive, candidateProcesses]);

  // Explicit user action to run & commit to kernel execution history
  const handleRunScheduling = () => {
    if (candidateProcesses.length === 0) return;

    const safeQuantum = Math.max(1, Number(timeQuantum) || 2);
    const res = osService.runScheduling(
      algorithm,
      candidateProcesses,
      safeQuantum,
      isPreemptive
    );
    setResults(res);
  };

  // Load Workload Profile
  const handleLoadScenario = (scenario) => {
    setSelectedScenarioId(scenario.id);
    setCustomScenarioProcesses(scenario.processes);
    
    // Auto-analyze
    const advice = CPUScheduler.autoSelectOptimalAlgorithm(scenario.processes);
    setSmartAdvice(advice);

    if (schedulingMode === 'AUTO') {
      setAlgorithm(advice.recommendedAlgorithm);
      setIsPreemptive(advice.recommendedPreemptive);
      if (advice.recommendedTimeQuantum) {
        setTimeQuantum(advice.recommendedTimeQuantum);
      }
    }
  };

  // Reset to live Process Manager ready queue
  const handleResetToLiveQueue = () => {
    setSelectedScenarioId(null);
    setCustomScenarioProcesses(null);
  };

  // Handle switching modes
  const handleSwitchMode = (mode) => {
    setSchedulingMode(mode);
    if (mode === 'AUTO' && smartAdvice) {
      setAlgorithm(smartAdvice.recommendedAlgorithm);
      setIsPreemptive(smartAdvice.recommendedPreemptive);
      if (smartAdvice.recommendedTimeQuantum) {
        setTimeQuantum(smartAdvice.recommendedTimeQuantum);
      }
    }
  };

  // Add custom process to current queue
  const handleAddCustomProcess = (e) => {
    e.preventDefault();
    const pid = `P${Math.floor(100 + Math.random() * 900)}`;
    const proc = {
      pid,
      name: newProc.name || `Process ${pid}`,
      arrival_time: Number(newProc.arrival_time) || 0,
      burst_time: Math.max(1, Number(newProc.burst_time) || 1),
      priority: Math.max(1, Number(newProc.priority) || 5),
      state: 'READY'
    };

    const updated = customScenarioProcesses ? [...customScenarioProcesses, proc] : [...candidateProcesses, proc];
    setCustomScenarioProcesses(updated);
    setNewProc({ name: '', arrival_time: 0, burst_time: 8, priority: 3 });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">CPU Scheduling</h1>
            {schedulingMode === 'AUTO' ? (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Bot className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Automatic Mode (Auto-Selected by Scenario)
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Sliders className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                Manual Mode (User Selection)
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-0.5">
            Choose between <strong className="text-emerald-400">Automatic Mode</strong> (kernel auto-detects workload scenario & assigns the optimal algorithm) or <strong className="text-indigo-400">Manual Mode</strong> (choose your own algorithm).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Two-Way Mode Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-md">
            <button
              onClick={() => handleSwitchMode('AUTO')}
              className={`flex items-center px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                schedulingMode === 'AUTO'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5 mr-1.5" />
              1. Automatic Mode
            </button>
            <button
              onClick={() => handleSwitchMode('MANUAL')}
              className={`flex items-center px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                schedulingMode === 'MANUAL'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 mr-1.5" />
              2. Manual Mode
            </button>
          </div>

          <button
            onClick={handleRunScheduling}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/30 cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            Run Execution
          </button>
        </div>
      </div>

      {/* Mode 1: Automatic Scenario Diagnosis & Autonomous Scheduler Banner */}
      {schedulingMode === 'AUTO' && smartAdvice && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Kernel Autonomous Decision Engine
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Scenario: {smartAdvice.scenarioName}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Algorithm Auto-Selected:</span>
                  <span className="px-3 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-extrabold text-sm">
                    {smartAdvice.name}
                  </span>
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-4xl pt-0.5">
                  {smartAdvice.reason}
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-500/30 shrink-0 space-y-1.5 text-xs font-mono text-slate-300">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Policy Assigned:</span>
                <span className="text-emerald-400 font-bold">{algorithm} {isPreemptive ? '(Preemptive)' : ''}</span>
              </div>
              {algorithm === 'Round Robin' && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Auto Time Quantum:</span>
                  <span className="text-cyan-300 font-bold">{timeQuantum} ms</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Optimal Avg TAT:</span>
                <span className="text-purple-300 font-bold">{results?.summary?.avgTurnaround || 0} ms</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Optimal Avg WT:</span>
                <span className="text-blue-300 font-bold">{results?.summary?.avgWaiting || 0} ms</span>
              </div>
            </div>
          </div>

          {/* Scenario Telemetry Indicators */}
          {smartAdvice.metricsSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Burst Variance (CV):</span>
                <span className="text-white font-bold">{smartAdvice.metricsSummary.cv} (Mean: {smartAdvice.metricsSummary.meanBurst}ms)</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Arrival Dispersion (ΔAT):</span>
                <span className="text-white font-bold">{smartAdvice.metricsSummary.arrivalSpread} ms</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Convoy Hazard Risk:</span>
                <span className={`font-bold ${smartAdvice.metricsSummary.convoyRisk === 'High' ? 'text-rose-400' : smartAdvice.metricsSummary.convoyRisk === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {smartAdvice.metricsSummary.convoyRisk}
                </span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Urgent Priority (≤ 2):</span>
                <span className={`font-bold ${smartAdvice.metricsSummary.hasCriticalPriority ? 'text-amber-300' : 'text-slate-300'}`}>
                  {smartAdvice.metricsSummary.hasCriticalPriority ? 'Detected' : 'Standard Workload'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Manual Selection Controls */}
      {schedulingMode === 'MANUAL' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center">
                <Sliders className="w-4 h-4 mr-2 text-indigo-400" />
                Manual Scheduling Policy Configuration
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                Manual Override Active
              </span>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Active: <span className="text-indigo-400 font-bold">{algorithm}</span> {isPreemptive ? '(Preemptive)' : ''}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Algorithm Toggle */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['FCFS', 'SJF', 'Priority', 'Round Robin'].map(algo => (
                <button
                  key={algo}
                  onClick={() => setAlgorithm(algo)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    algorithm === algo
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>

            {/* Time Quantum for Round Robin */}
            {algorithm === 'Round Robin' && (
              <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <label className="text-xs text-slate-400 font-medium">Time Quantum (q):</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={timeQuantum}
                  onChange={e => {
                    const val = e.target.value;
                    setTimeQuantum(val === '' ? '' : Math.max(1, parseInt(val) || 1));
                  }}
                  className="w-16 bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-slate-500 font-mono">ms</span>
              </div>
            )}

            {/* Preemptive toggle for SJF / Priority */}
            {(algorithm === 'SJF' || algorithm === 'Priority') && (
              <label className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPreemptive}
                  onChange={e => setIsPreemptive(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Preemptive Mode {algorithm === 'SJF' ? '(SRTF)' : ''}</span>
              </label>
            )}

            <button
              onClick={() => handleSwitchMode('AUTO')}
              className="text-xs px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl transition-all cursor-pointer flex items-center ml-auto font-semibold"
            >
              <Bot className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Switch back to Automatic Mode
            </button>
          </div>
        </div>
      )}

      {/* Real-World Process Workload Profiles (Testing Datasets) */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-indigo-400" />
              Sample System Workload Profiles
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Load realistic process workloads to observe how the Automatic Engine evaluates process characteristics and assigns scheduling policies:
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center px-2.5 py-1 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg transition-all cursor-pointer font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              Add Custom Process
            </button>

            {selectedScenarioId && (
              <button
                onClick={handleResetToLiveQueue}
                className="inline-flex items-center px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reset to Live Queue
              </button>
            )}
          </div>
        </div>

        {/* Inline Custom Process Form */}
        {showAddForm && (
          <form onSubmit={handleAddCustomProcess} className="bg-slate-950 p-4 rounded-xl border border-indigo-500/40 grid grid-cols-1 sm:grid-cols-5 gap-3 animate-in fade-in">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Process Name</label>
              <input
                type="text"
                placeholder="e.g. Web API Server"
                value={newProc.name}
                onChange={e => setNewProc({ ...newProc, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Arrival Time (ms)</label>
              <input
                type="number"
                min="0"
                value={newProc.arrival_time}
                onChange={e => setNewProc({ ...newProc, arrival_time: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Burst Time (ms)</label>
              <input
                type="number"
                min="1"
                value={newProc.burst_time}
                onChange={e => setNewProc({ ...newProc, burst_time: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Priority (1=High, 5=Low)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newProc.priority}
                onChange={e => setNewProc({ ...newProc, priority: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer"
              >
                Add to Active Queue
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
          {PRESET_SCENARIOS.map((sc) => {
            const isSelected = selectedScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleLoadScenario(sc)}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                      {sc.badge}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-white tracking-tight leading-snug">
                    {sc.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {sc.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{sc.processes.length} Processes</span>
                  <span className="text-indigo-400 flex items-center font-bold">
                    Load <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Ready Queue Table */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-amber-400" />
            Active Process Queue ({candidateProcesses.length} processes)
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {selectedScenarioId ? `Loaded Workload Dataset` : `Loaded from Live Process Manager`}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="min-w-full divide-y divide-slate-800 text-xs text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">PID</th>
                <th className="px-4 py-3">Process Name</th>
                <th className="px-4 py-3">Arrival Time</th>
                <th className="px-4 py-3">Burst Time</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {candidateProcesses.map((p) => (
                <tr key={p.pid} className="hover:bg-slate-900/60 transition-colors">
                  <td className="px-4 py-2.5 font-mono font-bold text-indigo-400">{p.pid}</td>
                  <td className="px-4 py-2.5 font-semibold text-white">{p.name}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-300">{p.arrival_time ?? p.arrival ?? 0} ms</td>
                  <td className="px-4 py-2.5 font-mono text-slate-300">{p.burst_time ?? p.burst ?? 1} ms</td>
                  <td className="px-4 py-2.5 font-mono text-amber-400 font-bold">{p.priority ?? 5}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={p.state || 'READY'} size="xs" />
                  </td>
                </tr>
              ))}
              {candidateProcesses.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-slate-500">
                    Process queue is empty. Load a workload profile above or add a process.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results & Gantt Chart */}
      {results && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Avg Waiting Time" value={`${results.summary.avgWaiting} ms`} color="blue" subtitle="Time spent in ready queue" />
            <StatCard title="Avg Turnaround Time" value={`${results.summary.avgTurnaround} ms`} color="purple" subtitle="Total submission to completion" />
            <StatCard title="Avg Response Time" value={`${results.summary.avgResponse} ms`} color="orange" subtitle="First dispatch latency" />
            <StatCard title="CPU Utilization" value={`${results.summary.cpuUtil}%`} color="emerald" subtitle="Active compute efficiency" />
          </div>

          {/* Visual Gantt Chart Card */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
                <Cpu className="w-4 h-4 mr-2 text-indigo-400" /> Execution Gantt Chart ({algorithm} {isPreemptive ? '- Preemptive' : ''})
              </h2>
              <span className="text-xs font-mono text-slate-400">Total Duration: {results.totalTime} ms</span>
            </div>
            
            <GanttChart data={results.gantt_data} totalTime={results.totalTime} />
          </div>

          {/* Detailed Per-Process Scheduling Metrics Table */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Detailed Process Timing Metrics
            </h2>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="min-w-full divide-y divide-slate-800 text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">PID</th>
                    <th className="px-4 py-3">Process Name</th>
                    <th className="px-4 py-3">Arrival (AT)</th>
                    <th className="px-4 py-3">Burst (BT)</th>
                    <th className="px-4 py-3">Completion (CT)</th>
                    <th className="px-4 py-3 text-purple-400">Turnaround (TAT)</th>
                    <th className="px-4 py-3 text-blue-400">Waiting (WT)</th>
                    <th className="px-4 py-3 text-orange-400">Response (RT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {results.metrics.map(m => (
                    <tr key={m.pid} className="hover:bg-slate-900/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-400">{m.pid}</td>
                      <td className="px-4 py-3 font-semibold text-white">{m.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{m.arrival} ms</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{m.burst} ms</td>
                      <td className="px-4 py-3 font-mono text-white font-bold">{m.completion} ms</td>
                      <td className="px-4 py-3 font-mono text-purple-300 font-bold">{m.turnaround} ms</td>
                      <td className="px-4 py-3 font-mono text-blue-300 font-bold">{m.waiting} ms</td>
                      <td className="px-4 py-3 font-mono text-orange-300 font-bold">{m.response} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Formula Explanation Note */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p><strong className="text-slate-300">Formulas:</strong> Turnaround Time (TAT) = Completion Time (CT) − Arrival Time (AT)</p>
              <p>Waiting Time (WT) = TAT − Burst Time (BT) | Response Time (RT) = First Response Time − AT</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
