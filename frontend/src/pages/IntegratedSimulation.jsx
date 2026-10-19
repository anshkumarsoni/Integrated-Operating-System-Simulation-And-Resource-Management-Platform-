import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, FastForward, CheckCircle2, 
  Database, FileText, Server, BarChart2, HardDrive, 
  Clock, Cpu, Layers, ShieldCheck, Activity, Loader2, ArrowRight
} from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import { WORKFLOW_STEPS, APPLICATION_PROFILES } from '../simulation/integratedWorkflow';
import StatusBadge from '../components/StatusBadge';
import ExecutionTimeline from '../components/ExecutionTimeline';

export default function IntegratedSimulation() {
  const { osService, refreshAll, simSpeed, setSimSpeed } = useSimulation();

  const [selectedApp, setSelectedApp] = useState(APPLICATION_PROFILES[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isFinished, setIsFinished] = useState(false);
  const [currentPid, setCurrentPid] = useState('P-SIM');

  // Real-time process state inspector
  const [processState, setProcessState] = useState({
    pid: '-',
    state: 'NONE',
    memory: '0 MB',
    cpuTime: '0 ms',
    io: 'None',
    resources: 'None',
    deadlockStatus: 'Safe'
  });

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSelectApp = (app) => {
    if (isRunning) return;
    setSelectedApp(app);
    handleReset();
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(false);
    setCurrentStepIndex(-1);
    setIsFinished(false);
    setProcessState({
      pid: '-',
      state: 'NONE',
      memory: '0 MB',
      cpuTime: '0 ms',
      io: 'None',
      resources: 'None',
      deadlockStatus: 'Safe'
    });
  };

  const executeStep = async (stepIdx) => {
    setCurrentStepIndex(stepIdx);
    const app = selectedApp;
    const pid = currentPid;

    switch (stepIdx) {
      case 0: // Step 1: App Request
        setProcessState(prev => ({ ...prev, state: 'REQUESTING' }));
        break;

      case 1: // Step 2: System Call create_process()
        osService.syscallMgr.logCall(pid, 'create_process()', 'SUCCESS', `Dispatched create_process() for ${app.name}`);
        osService.logHistory(pid, 'create_process() Invoked', 'System Calls', 'SUCCESS', `Initiated application ${app.name}`);
        setProcessState(prev => ({ ...prev, state: 'NEW' }));
        break;

      case 2: // Step 3: PCB Created
        setProcessState(prev => ({
          ...prev,
          pid,
          state: 'INITIALIZING',
          cpuTime: '0 ms'
        }));
        osService.logHistory(pid, 'PCB Allocated', 'Process Manager', 'SUCCESS', `Allocated register bank and PC context`);
        break;

      case 3: // Step 4: Ready State
        setProcessState(prev => ({ ...prev, state: 'READY' }));
        osService.logHistory(pid, 'Enqueued in Ready Queue', 'Process Manager', 'SUCCESS', `Priority level ${app.priority}`);
        break;

      case 4: // Step 5: Memory Allocated
        setProcessState(prev => ({ ...prev, memory: `${app.memoryNeeded} MB` }));
        osService.syscallMgr.logCall(pid, 'allocate_memory()', 'SUCCESS', `Allocated ${app.memoryNeeded} MB via First Fit`);
        osService.logHistory(pid, 'Memory Allocated', 'Memory Manager', 'SUCCESS', `${app.memoryNeeded} MB mapped`);
        break;

      case 5: // Step 6: CPU Scheduler Selects
        osService.logHistory('SCHEDULER', 'Process Dispatched', 'Scheduler', 'SUCCESS', `CPU Scheduler assigned core to ${pid}`);
        break;

      case 6: // Step 7: Process Running
        setProcessState(prev => ({ ...prev, state: 'RUNNING', cpuTime: `${Math.floor(app.burstTime / 2)} ms` }));
        osService.logHistory(pid, 'Process Executing', 'CPU Core', 'SUCCESS', `Executing computational tasks`);
        break;

      case 7: // Step 8: I/O Request -> Waiting
        setProcessState(prev => ({ ...prev, state: 'WAITING', io: `${app.ioDevice} (${app.ioType}) In-Flight` }));
        osService.syscallMgr.logCall(pid, 'request_io()', 'SUCCESS', `Enqueued ${app.ioType} request on ${app.ioDevice}`);
        osService.logHistory(pid, 'I/O Request Enqueued', 'I/O Manager', 'SUCCESS', `Process moved to WAITING state`);
        break;

      case 8: // Step 9: Resource Check
        setProcessState(prev => ({ ...prev, resources: `${app.resourceId} (${app.resource}) Granted` }));
        osService.syscallMgr.logCall(pid, 'request_resource()', 'SUCCESS', `Acquired instance of ${app.resource}`);
        osService.logHistory(pid, 'Resource Acquired', 'Resource Manager', 'SUCCESS', `Lock granted on ${app.resource}`);
        break;

      case 9: // Step 10: Deadlock Check
        setProcessState(prev => ({ ...prev, deadlockStatus: 'Safe' }));
        osService.logHistory(pid, "Banker's Safety Verified", 'Deadlock Manager', 'SUCCESS', `System remained in Safe State`);
        break;

      case 10: // Step 11: Process Completion
        setProcessState(prev => ({
          ...prev,
          state: 'RUNNING',
          cpuTime: `${app.burstTime} ms`,
          io: 'Completed ✓'
        }));
        osService.logHistory(pid, 'Work Completed', 'Process Manager', 'SUCCESS', `I/O returned and CPU burst completed`);
        break;

      case 11: // Step 12: Memory & Resource Release
        setProcessState(prev => ({
          ...prev,
          memory: '0 MB (Freed)',
          resources: 'None (Released)'
        }));
        osService.syscallMgr.logCall(pid, 'free_memory()', 'SUCCESS', `Reclaimed ${app.memoryNeeded} MB partition`);
        osService.syscallMgr.logCall(pid, 'release_resource()', 'SUCCESS', `Reclaimed ${app.resource}`);
        osService.logHistory(pid, 'Resources Freed', 'Memory/Resource Manager', 'SUCCESS', `Memory and peripheral locks reclaimed`);
        break;

      case 12: // Step 13: Terminated
        setProcessState(prev => ({ ...prev, state: 'TERMINATED' }));
        osService.syscallMgr.logCall(pid, 'terminate_process()', 'SUCCESS', `Process terminated. PCB reclaimed.`);
        osService.logHistory(pid, 'Process Terminated', 'Process Manager', 'SUCCESS', `Process lifecycle finished successfully`);
        setIsFinished(true);
        setIsRunning(false);
        break;

      default:
        break;
    }

    osService.saveState();
    refreshAll();
  };

  const runSimulationLoop = async () => {
    setIsRunning(true);
    setIsFinished(false);
    const newPid = `P${Math.floor(100 + Math.random() * 900)}`;
    setCurrentPid(newPid);

    for (let i = 0; i < WORKFLOW_STEPS.length; i++) {
      executeStep(i);
      await new Promise(resolve => {
        timerRef.current = setTimeout(resolve, simSpeed);
      });
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex === -1) {
      const newPid = `P${Math.floor(100 + Math.random() * 900)}`;
      setCurrentPid(newPid);
      executeStep(0);
    } else if (currentStepIndex < WORKFLOW_STEPS.length - 1) {
      executeStep(currentStepIndex + 1);
    }
  };

  const getAppIcon = (id) => {
    switch (id) {
      case 'backup': return Database;
      case 'file': return FileText;
      case 'db': return Server;
      case 'report': return BarChart2;
      default: return HardDrive;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Integrated OS Lifecycle Simulation</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Demonstrate the complete, coordinated operating system workflow from application invocation to process termination.
          </p>
        </div>
      </div>

      {/* 1. Application Profile Selector */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Select Simulated Application Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {APPLICATION_PROFILES.map((app) => {
            const Icon = getAppIcon(app.id);
            const isSelected = selectedApp.id === app.id;

            return (
              <div
                key={app.id}
                onClick={() => handleSelectApp(app)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-600/10'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{app.name}</h3>
                    <span className="text-[10px] text-indigo-400 font-mono">Burst: {app.burstTime}ms | Mem: {app.memoryNeeded}MB</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{app.description}</p>
              </div>
            );
          })}
        </div>

        {/* Simulation Execution Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={runSimulationLoop}
              disabled={isRunning || isFinished}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/30 flex items-center disabled:opacity-40"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Simulating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2 fill-current" /> Start Automated Simulation
                </>
              )}
            </button>

            <button
              onClick={handleNextStep}
              disabled={isRunning || isFinished}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-colors border border-slate-700 flex items-center disabled:opacity-40"
            >
              <FastForward className="w-4 h-4 mr-1.5" /> Step Forward
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors border border-slate-800"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Speed:</span>
            {[
              { label: '0.5x', speed: 1800 },
              { label: '1x', speed: 1000 },
              { label: '2x', speed: 500 }
            ].map(s => (
              <button
                key={s.label}
                onClick={() => setSimSpeed(s.speed)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  simSpeed === s.speed
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Workflow Timeline & Subsystem State Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 13-Step Workflow Timeline */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-indigo-400" /> 13-Step Process Lifecycle Workflow
            </h2>
            <span className="text-xs font-mono text-indigo-400 font-bold">
              {currentStepIndex >= 0 ? `Step ${currentStepIndex + 1} of 13` : 'Ready to Launch'}
            </span>
          </div>

          <ExecutionTimeline 
            steps={WORKFLOW_STEPS.map((step, idx) => ({
              ...step,
              status: idx === currentStepIndex 
                ? 'active' 
                : idx < currentStepIndex || isFinished 
                  ? 'completed' 
                  : 'pending'
            }))} 
          />

          {isFinished && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center animate-in fade-in space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Full Process Lifecycle Complete</h3>
              <p className="text-xs text-emerald-300 max-w-md mx-auto">
                The simulated application transitioned through all OS subsystems: System Calls, PCB allocation, Memory mapping, CPU scheduling, I/O handling, Deadlock verification, and final reclamation.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Real-Time Subsystem State Inspector */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 sticky top-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-indigo-400" /> Real-Time Process State
            </h2>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Assigned PID</span>
                <span className="text-base font-bold text-indigo-400">{processState.pid}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">Lifecycle State</span>
                  <span className="text-xs font-bold text-white">{processState.state}</span>
                </div>
                <StatusBadge status={processState.state} size="xs" />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Memory Partition</span>
                <span className="text-xs text-purple-300 font-bold">{processState.memory}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">CPU Time Consumed</span>
                <span className="text-xs text-white font-bold">{processState.cpuTime}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">I/O Operation</span>
                <span className="text-xs text-amber-300 font-bold">{processState.io}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Held Resources</span>
                <span className="text-xs text-emerald-300 font-bold">{processState.resources}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">Banker's Safety</span>
                  <span className="text-xs text-emerald-400 font-bold">{processState.deadlockStatus}</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            <div className="bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-xl text-xs text-indigo-200/90 leading-relaxed">
              <strong className="text-indigo-300 block mb-1">Interactive OS Insight:</strong>
              Notice how the process state changes dynamically as the kernel allocates memory, dispatches CPU bursts, handles I/O traps, and checks deadlock safety matrices.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
