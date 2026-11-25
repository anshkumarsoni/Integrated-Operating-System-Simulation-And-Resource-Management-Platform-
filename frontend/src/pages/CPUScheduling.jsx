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

  // Derive candidate processes (either from custom testing queue, loaded scenario, or live ready queue)
  const candidateProcesses = useMemo(() => {
    if (customScenarioProcesses !== null) {
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
      // In Automatic Mode, the kernel auto-assigns the optimal policy based on workload characteristics
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

  // Clear all processes to test custom processes from a blank canvas
  const handleClearQueue = () => {
    setSelectedScenarioId(null);
    setCustomScenarioProcesses([]);
    setShowAddForm(true);
  };

  // Remove a single process from active queue
  const handleDeleteProcessFromQueue = (pid) => {
    const updated = candidateProcesses.filter(p => String(p.pid) !== String(pid));
    setCustomScenarioProcesses(updated);
  };

  // Modify process arrival, burst, or priority inline
  const handleUpdateProcess = (pid, field, value) => {
    const val = field === 'name' ? value : Math.max(0, Number(value) || 0);
    const updated = candidateProcesses.map(p => {
      if (String(p.pid) === String(pid)) {
        return { ...p, [field]: val };
      }
      return p;
    });
    setCustomScenarioProcesses(updated);
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
      name: newProc.name.trim() || `Process ${pid}`,
      arrival_time: Number(newProc.arrival_time) || 0,
      burst_time: Math.max(1, Number(newProc.burst_time) || 1),
      priority: Math.max(1, Number(newProc.priority) || 3),
      state: 'READY'
    };

    const updated = [...candidateProcesses, proc];
    setCustomScenarioProcesses(updated);
    setNewProc({ name: '', arrival_time: 0, burst_time: 8, priority: 3 });
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
          <div className="flex bg-blue-50 p-1 rounded-xl border border-blue-200 shadow-xs">
            <button
              onClick={() => handleSwitchMode('AUTO')}
              className={`flex items-center px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                schedulingMode === 'AUTO'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-blue-100/60'
              }`}
            >
              <Bot className="w-3.5 h-3.5 mr-1.5" />
              1. Automatic Mode
            </button>
            <button
              onClick={() => handleSwitchMode('MANUAL')}
              className={`flex items-center px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                schedulingMode === 'MANUAL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-blue-100/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 mr-1.5" />
              2. Manual Mode
            </button>
          </div>

          <button
            onClick={handleRunScheduling}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20 cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            Run Execution
          </button>
        </div>
      </div>

      {/* Mode 1: Automatic Scenario Diagnosis & Autonomous Scheduler Banner */}
      {schedulingMode === 'AUTO' && smartAdvice && (
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-3 rounded-2xl bg-blue-100 border border-blue-200 text-blue-600 shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Kernel Autonomous Decision Engine
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                    Scenario: {smartAdvice.scenarioName}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span>Algorithm Auto-Selected:</span>
                  <span className="px-3 py-0.5 rounded-lg bg-blue-600 text-white font-mono font-extrabold text-sm shadow-xs">
                    {smartAdvice.name}
                  </span>
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-4xl pt-0.5">
                  {smartAdvice.reason}
                </p>
              </div>
            </div>

            <div className="bg-white/90 p-3.5 rounded-xl border border-blue-200 shrink-0 space-y-1.5 text-xs font-mono text-slate-700 shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Policy Assigned:</span>
                <span className="text-blue-700 font-bold">{algorithm} {isPreemptive ? '(Preemptive)' : ''}</span>
              </div>
              {algorithm === 'Round Robin' && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Auto Time Quantum:</span>
                  <span className="text-blue-600 font-bold">{timeQuantum} ms</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Optimal Avg TAT:</span>
                <span className="text-purple-600 font-bold">{results?.summary?.avgTurnaround || 0} ms</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Optimal Avg WT:</span>
                <span className="text-blue-600 font-bold">{results?.summary?.avgWaiting || 0} ms</span>
              </div>
            </div>
          </div>

          {/* Scenario Telemetry Indicators */}
          {smartAdvice.metricsSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-blue-200 text-[11px] font-mono">
              <div className="bg-white p-2.5 rounded-xl border border-blue-200 shadow-xs">
                <span className="text-blue-600 font-medium block text-[10px]">Burst Variance (CV):</span>
                <span className="text-slate-800 font-bold">{smartAdvice.metricsSummary.cv} (Mean: {smartAdvice.metricsSummary.meanBurst}ms)</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-blue-200 shadow-xs">
                <span className="text-blue-600 font-medium block text-[10px]">Arrival Dispersion (ΔAT):</span>
                <span className="text-slate-800 font-bold">{smartAdvice.metricsSummary.arrivalSpread} ms</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-blue-200 shadow-xs">
                <span className="text-blue-600 font-medium block text-[10px]">Convoy Hazard Risk:</span>
                <span className={`font-bold ${smartAdvice.metricsSummary.convoyRisk === 'High' ? 'text-rose-600' : smartAdvice.metricsSummary.convoyRisk === 'Moderate' ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {smartAdvice.metricsSummary.convoyRisk}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-blue-200 shadow-xs">
                <span className="text-blue-600 font-medium block text-[10px]">Urgent Priority (≤ 2):</span>
                <span className={`font-bold ${smartAdvice.metricsSummary.hasCriticalPriority ? 'text-amber-600' : 'text-slate-700'}`}>
                  {smartAdvice.metricsSummary.hasCriticalPriority ? 'Detected' : 'Standard Workload'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Manual Selection Controls */}
      {schedulingMode === 'MANUAL' && (
        <div className="bg-white border border-blue-200 p-5 rounded-2xl space-y-4 animate-in fade-in shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center">
                <Sliders className="w-4 h-4 mr-2 text-blue-600" />
                Manual Scheduling Policy Configuration
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
                Manual Override Active
              </span>
            </div>

            <span className="text-xs text-slate-600 font-mono">
              Active: <span className="text-blue-600 font-bold">{algorithm}</span> {isPreemptive ? '(Preemptive)' : ''}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Algorithm Toggle */}
            <div className="flex bg-blue-50 p-1 rounded-xl border border-blue-200">
              {['FCFS', 'SJF', 'Priority', 'Round Robin'].map(algo => (
                <button
                  key={algo}
                  onClick={() => setAlgorithm(algo)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    algorithm === algo
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-blue-100/60'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>

            {/* Time Quantum for Round Robin */}
            {algorithm === 'Round Robin' && (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                <label className="text-xs text-slate-600 font-medium">Time Quantum (q):</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={timeQuantum}
                  onChange={e => {
                    const val = e.target.value;
                    setTimeQuantum(val === '' ? '' : Math.max(1, parseInt(val) || 1));
                  }}
                  className="w-16 bg-white border border-blue-200 text-slate-800 text-xs font-mono font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs text-blue-600 font-mono">ms</span>
              </div>
            )}

            {/* Preemptive toggle for SJF / Priority */}
            {(algorithm === 'SJF' || algorithm === 'Priority') && (
              <label className="flex items-center space-x-2 text-xs text-slate-700 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPreemptive}
                  onChange={e => setIsPreemptive(e.target.checked)}
                  className="rounded bg-white border-blue-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Preemptive Mode {algorithm === 'SJF' ? '(SRTF)' : ''}</span>
              </label>
            )}

            <button
              onClick={() => handleSwitchMode('AUTO')}
              className="text-xs px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl transition-all cursor-pointer flex items-center ml-auto font-semibold"
            >
              <Bot className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Switch back to Automatic Mode
            </button>
          </div>
        </div>
      )}

      {/* Real-World Process Workload Profiles (Testing Datasets) */}
      <div className="bg-white border border-blue-200 p-5 rounded-2xl space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-blue-600" />
              Sample System Workload Profiles
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Load realistic process workloads to observe how the Automatic Engine evaluates process characteristics and assigns scheduling policies:
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all cursor-pointer font-bold shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              {showAddForm ? 'Hide Add Form' : '+ Add Custom Process'}
            </button>

            <button
              onClick={handleClearQueue}
              className="inline-flex items-center px-2.5 py-1.5 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-all cursor-pointer font-semibold"
              title="Clear all processes to enter and test your own processes from scratch"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-600" />
              Clear Queue
            </button>

            {(customScenarioProcesses !== null || selectedScenarioId) && (
              <button
                onClick={handleResetToLiveQueue}
                className="inline-flex items-center px-2.5 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-all cursor-pointer font-semibold"
                title="Reload the 4 live processes from Process Manager"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Reset to Live Queue
              </button>
            )}
          </div>
        </div>

        {/* Inline Custom Process Form */}
        {showAddForm && (
          <form onSubmit={handleAddCustomProcess} className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center">
                <PlusCircle className="w-4 h-4 mr-1.5 text-blue-600" />
                Add Process to Queue (Live Auto-Evaluated)
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-slate-600 font-bold block mb-1">Process Name</label>
                <input
                  type="text"
                  placeholder="e.g. Worker Job P1"
                  value={newProc.name}
                  onChange={e => setNewProc({ ...newProc, name: e.target.value })}
                  className="w-full bg-white border border-blue-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 font-bold block mb-1">Arrival Time (AT in ms)</label>
                <input
                  type="number"
                  min="0"
                  value={newProc.arrival_time}
                  onChange={e => setNewProc({ ...newProc, arrival_time: e.target.value })}
                  className="w-full bg-white border border-blue-200 text-slate-800 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 font-bold block mb-1">Burst Time (BT in ms)</label>
                <input
                  type="number"
                  min="1"
                  value={newProc.burst_time}
                  onChange={e => setNewProc({ ...newProc, burst_time: e.target.value })}
                  className="w-full bg-white border border-blue-200 text-slate-800 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 font-bold block mb-1">Priority (1=Urgent, 5=Standard)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newProc.priority}
                  onChange={e => setNewProc({ ...newProc, priority: e.target.value })}
                  className="w-full bg-white border border-blue-200 text-slate-800 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
              >
                + Add Process to Queue
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
                    ? 'bg-blue-100 border-blue-500 shadow-sm ring-2 ring-blue-500/40'
                    : 'bg-blue-50/70 border-blue-200 hover:border-blue-400 hover:bg-blue-100/70 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-300 uppercase tracking-wider">
                      {sc.badge}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight leading-snug">
                    {sc.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {sc.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-blue-200/70 flex items-center justify-between text-[10px] text-blue-700 font-mono">
                  <span>{sc.processes.length} Processes</span>
                  <span className="text-blue-600 flex items-center font-bold">
                    Load <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Ready Queue Table */}
      <div className="bg-white border border-blue-200 p-5 rounded-2xl space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
              Active Process Queue ({candidateProcesses.length} processes)
            </h2>
            <span className="text-xs text-blue-600 font-mono">
              {selectedScenarioId ? `(Workload Profile)` : customScenarioProcesses !== null ? `(Custom Testing Queue)` : `(Live Process Manager)`}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-all cursor-pointer font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              Add Process
            </button>
            <button
              onClick={handleClearQueue}
              className="inline-flex items-center px-2.5 py-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-all cursor-pointer font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-600" />
              Clear Queue
            </button>
            {(customScenarioProcesses !== null || selectedScenarioId) && (
              <button
                onClick={handleResetToLiveQueue}
                className="inline-flex items-center px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-all cursor-pointer font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Reset to Live Queue
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-blue-200 bg-white">
          <table className="min-w-full divide-y divide-blue-100 text-xs text-left">
            <thead className="bg-blue-50 text-blue-800 uppercase tracking-wider font-semibold border-b border-blue-200">
              <tr>
                <th className="px-4 py-3">PID</th>
                <th className="px-4 py-3">Process Name</th>
                <th className="px-4 py-3">Arrival Time (ms)</th>
                <th className="px-4 py-3">Burst Time (ms)</th>
                <th className="px-4 py-3">Priority (1-10)</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {candidateProcesses.map((p) => (
                <tr key={p.pid} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-2.5 font-mono font-bold text-blue-600">{p.pid}</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-800">{p.name}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-600">
                    <input
                      type="number"
                      min="0"
                      value={p.arrival_time ?? p.arrival ?? 0}
                      onChange={(e) => handleUpdateProcess(p.pid, 'arrival_time', e.target.value)}
                      className="w-20 bg-blue-50/60 border border-blue-200 text-slate-800 text-xs font-mono font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 focus:bg-white"
                      title="Edit Arrival Time"
                    />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-600">
                    <input
                      type="number"
                      min="1"
                      value={p.burst_time ?? p.burst ?? 1}
                      onChange={(e) => handleUpdateProcess(p.pid, 'burst_time', e.target.value)}
                      className="w-20 bg-blue-50/60 border border-blue-200 text-slate-800 text-xs font-mono font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 focus:bg-white"
                      title="Edit Burst Time"
                    />
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={p.priority ?? 3}
                      onChange={(e) => handleUpdateProcess(p.pid, 'priority', e.target.value)}
                      className="w-20 bg-blue-50/60 border border-blue-200 text-amber-600 text-xs font-mono font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 focus:bg-white"
                      title="Edit Priority (1=High, 5=Low)"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={p.state || 'READY'} size="xs" />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => handleDeleteProcessFromQueue(p.pid)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove this process from active queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {candidateProcesses.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500 space-y-2">
                    <p className="font-semibold text-slate-700">The Active Process Queue is currently empty.</p>
                    <p className="text-xs text-slate-500">
                      Use the "Add Custom Process" form above to enter your own processes, or load a preset workload profile to see the engine auto-select algorithms!
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 inline mr-1" /> Add Custom Process
                      </button>
                      <button
                        onClick={handleResetToLiveQueue}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Load Default Queue
                      </button>
                    </div>
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
          <div className="bg-white border border-blue-200 p-6 rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center">
                <Cpu className="w-4 h-4 mr-2 text-blue-600" /> Execution Gantt Chart ({algorithm} {isPreemptive ? '- Preemptive' : ''})
              </h2>
              <span className="text-xs font-mono text-slate-500">Total Duration: {results.totalTime} ms</span>
            </div>
            
            <GanttChart data={results.gantt_data} totalTime={results.totalTime} />
          </div>

          {/* Detailed Per-Process Scheduling Metrics Table */}
          <div className="bg-white border border-blue-200 p-6 rounded-2xl space-y-4 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Detailed Process Timing Metrics
            </h2>

            <div className="overflow-x-auto rounded-xl border border-blue-200 bg-white">
              <table className="min-w-full divide-y divide-blue-100 text-xs text-left">
                <thead className="bg-blue-50 text-blue-800 uppercase tracking-wider font-semibold border-b border-blue-200">
                  <tr>
                    <th className="px-4 py-3">PID</th>
                    <th className="px-4 py-3">Process Name</th>
                    <th className="px-4 py-3">Arrival (AT)</th>
                    <th className="px-4 py-3">Burst (BT)</th>
                    <th className="px-4 py-3">Completion (CT)</th>
                    <th className="px-4 py-3 text-purple-600">Turnaround (TAT)</th>
                    <th className="px-4 py-3 text-blue-600">Waiting (WT)</th>
                    <th className="px-4 py-3 text-orange-600">Response (RT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {results.metrics.map(m => (
                    <tr key={m.pid} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">{m.pid}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{m.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{m.arrival} ms</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{m.burst} ms</td>
                      <td className="px-4 py-3 font-mono text-slate-900 font-bold">{m.completion} ms</td>
                      <td className="px-4 py-3 font-mono text-purple-600 font-bold">{m.turnaround} ms</td>
                      <td className="px-4 py-3 font-mono text-blue-600 font-bold">{m.waiting} ms</td>
                      <td className="px-4 py-3 font-mono text-orange-600 font-bold">{m.response} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Formula Explanation Note */}
            <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 text-[11px] text-slate-600 space-y-1">
              <p><strong className="text-slate-800">Formulas:</strong> Turnaround Time (TAT) = Completion Time (CT) − Arrival Time (AT)</p>
              <p>Waiting Time (WT) = TAT − Burst Time (BT) | Response Time (RT) = First Response Time − AT</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
