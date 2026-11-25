import React, { useState } from 'react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { 
  FileText, Copy, Download, Printer, Check, 
  Cpu, HardDrive, Shield, Layers, Clock, Activity, BarChart3, Database,
  ArrowRight, ArrowLeft, ArrowDown, ArrowUp, Sparkles,
  CheckCircle2, PauseCircle, PlayCircle, Filter, RotateCcw
} from 'lucide-react';
import { formatDateFull } from '../utils/helpers';

export default function ProcessReportModal({ isOpen, onClose, processes = [], osService }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('formatted'); // 'formatted' | 'raw'
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');

  if (!isOpen) return null;

  const isLight = true;

  // Process statistics calculation
  const total = processes.length;
  const newCount = processes.filter(p => p.state === 'NEW').length;
  const running = processes.filter(p => p.state === 'RUNNING').length;
  const ready = processes.filter(p => p.state === 'READY').length;
  const waiting = processes.filter(p => p.state === 'WAITING').length;
  const terminated = processes.filter(p => p.state === 'TERMINATED').length;
  const totalBurst = processes.reduce((sum, p) => sum + (Number(p.burst_time) || 0), 0);
  const totalMemory = processes.reduce((sum, p) => sum + (Number(p.memory_required) || 0), 0);
  const totalCpuUsed = processes.reduce((sum, p) => sum + (Number(p.cpu_time_used) || 0), 0);
  const avgPriority = total > 0 ? (processes.reduce((sum, p) => sum + (Number(p.priority) || 1), 0) / total).toFixed(1) : 0;

  // Build full PCB data map
  const detailedProcesses = processes.map(p => {
    const pcb = osService?.getProcessPCB ? osService.getProcessPCB(p.pid) : null;
    return {
      ...p,
      pcb: pcb || {
        pid: p.pid,
        process_name: p.name,
        state: p.state,
        priority: p.priority,
        arrival_time: p.arrival_time,
        burst_time: p.burst_time,
        program_counter: '0x00401000',
        cpu_registers: { EAX: '0x00000000', EBX: '0x00402000', ECX: '0x00000000', EDX: '0x00000000' },
        memory_allocation: { base_address: '0x00000000', limit: '0x00000000', allocated_size: p.memory_required || 64 },
        resources_held: p.resource_required && p.resource_required !== 'None' ? [p.resource_required] : [],
        resources_requested: []
      }
    };
  });

  // Filtered processes for interactive diagram click
  const displayedProcesses = selectedStateFilter === 'ALL'
    ? detailedProcesses
    : detailedProcesses.filter(p => p.state === selectedStateFilter);

  // Group processes by state for diagram badges
  const processesByState = {
    NEW: detailedProcesses.filter(p => p.state === 'NEW'),
    READY: detailedProcesses.filter(p => p.state === 'READY'),
    RUNNING: detailedProcesses.filter(p => p.state === 'RUNNING'),
    WAITING: detailedProcesses.filter(p => p.state === 'WAITING'),
    TERMINATED: detailedProcesses.filter(p => p.state === 'TERMINATED')
  };

  // Generate plain text report with ASCII process lifecycle diagram
  const generatePlainTextReport = () => {
    const timestamp = new Date().toLocaleString();
    let text = `================================================================================\n`;
    text += `OS KERNEL PROCESS AUDIT & LIFECYCLE EXECUTION REPORT\n`;
    text += `Platform: Integrated OS Simulation and Resource Management Platform\n`;
    text += `Generated At: ${timestamp}\n`;
    text += `================================================================================\n\n`;

    text += `1. EXECUTIVE PROCESS METRICS\n`;
    text += `--------------------------------------------------------------------------------\n`;
    text += `Total Processes Instantiated : ${total}\n`;
    text += `Created / Unadmitted (NEW)   : ${newCount}\n`;
    text += `In Ready Queue (READY)       : ${ready}\n`;
    text += `Active on CPU (RUNNING)      : ${running}\n`;
    text += `Blocked on I/O/Lock (WAITING): ${waiting}\n`;
    text += `Deallocated (TERMINATED)     : ${terminated}\n`;
    text += `Total CPU Burst Workload     : ${totalBurst} ms\n`;
    text += `Cumulative CPU Execution Time: ${totalCpuUsed} ms\n`;
    text += `Total Physical Memory Claimed: ${totalMemory} MB\n`;
    text += `Average Process Priority     : Level ${avgPriority}\n\n`;

    text += `2. OPERATING SYSTEM 5-STATE PROCESS LIFECYCLE DIAGRAM\n`;
    text += `--------------------------------------------------------------------------------\n`;
    text += `\n`;
    text += `  +-------------+      Admitted       +-------------+      Dispatch       +-------------+        Exit       +--------------+\n`;
    text += `  |     NEW     | ------------------> |    READY    | ------------------> |   RUNNING   | ----------------> |  TERMINATED  |\n`;
    text += `  |  (${String(newCount).padStart(2, ' ')} procs)  |                     |  (${String(ready).padStart(2, ' ')} procs)  | <------------------ |  (${String(running).padStart(2, ' ')} procs)  |                   |  (${String(terminated).padStart(2, ' ')} procs)  |\n`;
    text += `  +-------------+                     +-------------+     Time Slice      +-------------+                   +--------------+\n`;
    text += `                                             ^             Interrupt             |                                          \n`;
    text += `                                             |                                   | I/O or Event                             \n`;
    text += `                                             |        I/O / Event Complete       | Wait                                     \n`;
    text += `                                             +-----------------------------------+                                          \n`;
    text += `                                             |              WAITING              |                                          \n`;
    text += `                                             |            (${String(waiting).padStart(2, ' ')} procs)           |                                          \n`;
    text += `                                             +-----------------------------------+                                          \n\n`;

    text += `3. DETAILED PROCESS TABLE & SCHEDULING ATTRIBUTES\n`;
    text += `--------------------------------------------------------------------------------\n`;
    text += `PID   | Name                          | State      | Arr(ms) | Burst(ms) | Prio | Mem(MB) | CPU Time\n`;
    text += `------+-------------------------------+------------+---------+-----------+------+---------+---------\n`;
    detailedProcesses.forEach(p => {
      const pidStr = p.pid.padEnd(5, ' ');
      const nameStr = (p.name || '').substring(0, 29).padEnd(29, ' ');
      const stateStr = (p.state || '').padEnd(10, ' ');
      const arrStr = String(p.arrival_time ?? 0).padStart(7, ' ');
      const burstStr = String(p.burst_time ?? 0).padStart(9, ' ');
      const prioStr = String(p.priority ?? 1).padStart(4, ' ');
      const memStr = String(p.memory_required ?? 0).padStart(7, ' ');
      const cpuStr = String(p.cpu_time_used ?? 0).padStart(8, ' ');
      text += `${pidStr} | ${nameStr} | ${stateStr} | ${arrStr} | ${burstStr} | ${prioStr} | ${memStr} | ${cpuStr}\n`;
    });
    text += `\n`;

    text += `4. KERNEL PROCESS CONTROL BLOCK (PCB) HARDWARE CONTEXTS\n`;
    text += `--------------------------------------------------------------------------------\n`;
    detailedProcesses.forEach((p, idx) => {
      const pcb = p.pcb;
      text += `[#${idx + 1}] PROCESS ${p.pid} - ${p.name}\n`;
      text += `    State: ${p.state} | Priority: Level ${p.priority} | Arrival: ${p.arrival_time}ms | Burst: ${p.burst_time}ms\n`;
      text += `    Hardware PC: ${pcb.program_counter || '0x00401000'}\n`;
      text += `    Registers  : EAX=${pcb.cpu_registers?.EAX || '0x00000000'} EBX=${pcb.cpu_registers?.EBX || '0x00000000'} ECX=${pcb.cpu_registers?.ECX || '0x00000000'} EDX=${pcb.cpu_registers?.EDX || '0x00000000'}\n`;
      text += `    Memory Area: Base=${pcb.memory_allocation?.base_address || '0x00000000'} Limit=${pcb.memory_allocation?.limit || '0x00000000'} Size=${p.memory_required || 64} MB\n`;
      text += `    Resources  : Held=[${pcb.resources_held ? pcb.resources_held.join(', ') : 'None'}] | Requested=[${pcb.resources_requested ? pcb.resources_requested.join(', ') : 'None'}]\n\n`;
    });

    text += `================================================================================\n`;
    text += `END OF PROCESS AUDIT & LIFECYCLE REPORT\n`;
    text += `================================================================================\n`;

    return text;
  };

  // Generate CSV data
  const generateCSV = () => {
    let csv = `PID,Process Name,State,Arrival Time (ms),Burst Time (ms),Priority,Memory (MB),CPU Time Used (ms),Program Counter,EAX,EBX,ECX,EDX,Resource Required\n`;
    detailedProcesses.forEach(p => {
      const pcb = p.pcb;
      csv += `"${p.pid}","${p.name}","${p.state}",${p.arrival_time || 0},${p.burst_time || 0},${p.priority || 1},${p.memory_required || 0},${p.cpu_time_used || 0},"${pcb.program_counter || ''}","${pcb.cpu_registers?.EAX || ''}","${pcb.cpu_registers?.EBX || ''}","${pcb.cpu_registers?.ECX || ''}","${pcb.cpu_registers?.EDX || ''}","${p.resource_required || 'None'}"\n`;
    });
    return csv;
  };

  // Copy to clipboard handler
  const handleCopy = () => {
    const reportText = generatePlainTextReport();
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download TXT
  const handleDownloadTxt = () => {
    const reportText = generatePlainTextReport();
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OS_Process_Report_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download CSV
  const handleDownloadCSV = () => {
    const csvText = generateCSV();
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OS_Process_Data_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Kernel Process Audit & Lifecycle Report" 
      size="2xl"
      theme={isLight ? 'calm' : 'dark'}
    >
      <div className={`space-y-6 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
        
        {/* Top Action & Appearance Bar */}
        <div className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border transition-colors ${
          isLight 
            ? 'bg-white border-slate-200/90 shadow-sm' 
            : 'bg-slate-950 border-slate-800'
        }`}>
          {/* View Tabs */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('formatted')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'formatted' 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' 
                  : 'bg-blue-50 text-blue-600 hover:text-blue-900 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              Visual Audit & Cycle
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'raw' 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' 
                  : 'bg-blue-50 text-blue-600 hover:text-blue-900 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              Plain Text Report
            </button>
          </div>

          {/* Controls: Export Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              title="Copy plain-text report to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5 text-blue-600" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>

            {/* Download TXT */}
            <button
              onClick={handleDownloadTxt}
              className="flex items-center px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              title="Download as .txt file"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              .TXT
            </button>

            {/* Download CSV */}
            <button
              onClick={handleDownloadCSV}
              className="flex items-center px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              title="Download CSV for Excel"
            >
              <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
              CSV
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              title="Print report or save to PDF"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print / PDF
            </button>
          </div>
        </div>

        {/* Tab 1: Formatted Visual Report */}
        {activeTab === 'formatted' ? (
          <div className="space-y-6">
            
            {/* KPI Summary Metric Cards (Calm Light / Soft Theme) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className={`p-4 rounded-2xl border transition-all ${
                isLight 
                  ? 'bg-white border-slate-200/80 shadow-sm shadow-slate-100 hover:shadow-md' 
                  : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Total Processes
                  </span>
                  <div className={`p-1.5 rounded-lg ${isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-950/60 text-indigo-400'}`}>
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className={`text-2xl font-bold font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>{total}</span>
                <span className={`text-[11px] block mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {running} Running · {ready} Ready
                </span>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${
                isLight 
                  ? 'bg-white border-slate-200/80 shadow-sm shadow-slate-100 hover:shadow-md' 
                  : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Total Workload
                  </span>
                  <div className={`p-1.5 rounded-lg ${isLight ? 'bg-sky-50 text-sky-600' : 'bg-sky-950/60 text-sky-400'}`}>
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className={`text-2xl font-bold font-mono ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                  {totalBurst} <span className="text-sm font-sans font-medium">ms</span>
                </span>
                <span className={`text-[11px] block mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Executed: {totalCpuUsed} ms
                </span>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${
                isLight 
                  ? 'bg-white border-slate-200/80 shadow-sm shadow-slate-100 hover:shadow-md' 
                  : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Total Memory
                  </span>
                  <div className={`p-1.5 rounded-lg ${isLight ? 'bg-purple-50 text-purple-600' : 'bg-purple-950/60 text-purple-400'}`}>
                    <HardDrive className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className={`text-2xl font-bold font-mono ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>
                  {totalMemory} <span className="text-sm font-sans font-medium">MB</span>
                </span>
                <span className={`text-[11px] block mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Allocated partitions
                </span>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${
                isLight 
                  ? 'bg-white border-slate-200/80 shadow-sm shadow-slate-100 hover:shadow-md' 
                  : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Avg Priority
                  </span>
                  <div className={`p-1.5 rounded-lg ${isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-950/60 text-amber-400'}`}>
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className={`text-2xl font-bold font-mono ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
                  Level {avgPriority}
                </span>
                <span className={`text-[11px] block mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Scale 1 (High) to 5 (Low)
                </span>
              </div>
            </div>

            {/* PROCESS LIFECYCLE 5-STATE DIAGRAM (Calm Light & Attractive) */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isLight 
                ? 'bg-white border-slate-200/90 shadow-sm' 
                : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200/60 mb-5">
                <div>
                  <h3 className={`text-sm font-bold flex items-center ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    <Activity className="w-4 h-4 mr-2 text-indigo-600" />
                    Operating System 5-State Process Lifecycle Diagram
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Interactive state transition cycle. Click any state node to filter the process table.
                  </p>
                </div>

                {selectedStateFilter !== 'ALL' && (
                  <button
                    onClick={() => setSelectedStateFilter('ALL')}
                    className="flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset Filter ({selectedStateFilter})
                  </button>
                )}
              </div>

              {/* 5-State Cycle Visual Diagram Flow */}
              <div className="space-y-6">
                
                {/* Main Pipeline Row: NEW -> READY <-> RUNNING -> TERMINATED */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-stretch relative">
                  
                  {/* Node 1: NEW */}
                  <div 
                    onClick={() => setSelectedStateFilter(selectedStateFilter === 'NEW' ? 'ALL' : 'NEW')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all text-left relative group ${
                      selectedStateFilter === 'NEW'
                        ? 'ring-2 ring-sky-500 shadow-md'
                        : ''
                    } ${
                      isLight 
                        ? 'bg-sky-50/70 hover:bg-sky-50 border-sky-200/80 shadow-sm' 
                        : 'bg-sky-950/20 hover:bg-sky-950/30 border-sky-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-sky-600" />
                        <span className="font-bold text-xs uppercase tracking-wide text-sky-800 dark:text-sky-300">
                          1. NEW
                        </span>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                        {newCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-sky-700/80 leading-relaxed mb-3">
                      Being instantiated in kernel memory.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {processesByState.NEW.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">No processes</span>
                      ) : (
                        processesByState.NEW.map(p => (
                          <span key={p.pid} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-sky-200/70 text-sky-900 border border-sky-300">
                            {p.pid}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Node 2: READY */}
                  <div 
                    onClick={() => setSelectedStateFilter(selectedStateFilter === 'READY' ? 'ALL' : 'READY')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all text-left relative group ${
                      selectedStateFilter === 'READY'
                        ? 'ring-2 ring-indigo-500 shadow-md'
                        : ''
                    } ${
                      isLight 
                        ? 'bg-indigo-50/70 hover:bg-indigo-50 border-indigo-200/80 shadow-sm' 
                        : 'bg-indigo-950/20 hover:bg-indigo-950/30 border-indigo-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-xs uppercase tracking-wide text-indigo-800 dark:text-indigo-300">
                          2. READY
                        </span>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {ready}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-700/80 leading-relaxed mb-3">
                      Queued in RAM awaiting CPU timeslice.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {processesByState.READY.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">No processes</span>
                      ) : (
                        processesByState.READY.map(p => (
                          <span key={p.pid} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-200/70 text-indigo-900 border border-indigo-300">
                            {p.pid}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Node 3: RUNNING */}
                  <div 
                    onClick={() => setSelectedStateFilter(selectedStateFilter === 'RUNNING' ? 'ALL' : 'RUNNING')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all text-left relative group ${
                      selectedStateFilter === 'RUNNING'
                        ? 'ring-2 ring-emerald-500 shadow-md'
                        : ''
                    } ${
                      isLight 
                        ? 'bg-emerald-50/70 hover:bg-emerald-50 border-emerald-200/80 shadow-sm' 
                        : 'bg-emerald-950/20 hover:bg-emerald-950/30 border-emerald-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="relative flex h-2.5 w-2.5 mr-0.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="font-bold text-xs uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                          3. RUNNING
                        </span>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {running}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700/80 leading-relaxed mb-3">
                      Actively executing instructions on CPU.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {processesByState.RUNNING.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">No processes</span>
                      ) : (
                        processesByState.RUNNING.map(p => (
                          <span key={p.pid} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-200/70 text-emerald-900 border border-emerald-300">
                            {p.pid}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Node 5: TERMINATED */}
                  <div 
                    onClick={() => setSelectedStateFilter(selectedStateFilter === 'TERMINATED' ? 'ALL' : 'TERMINATED')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all text-left relative group ${
                      selectedStateFilter === 'TERMINATED'
                        ? 'ring-2 ring-slate-500 shadow-md'
                        : ''
                    } ${
                      isLight 
                        ? 'bg-slate-100/80 hover:bg-slate-100 border-slate-300/80 shadow-sm' 
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-slate-600" />
                        <span className="font-bold text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">
                          5. TERMINATED
                        </span>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-slate-200 text-slate-800 border border-slate-300">
                        {terminated}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                      Completed execution & memory reclaimed.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {processesByState.TERMINATED.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">No processes</span>
                      ) : (
                        processesByState.TERMINATED.map(p => (
                          <span key={p.pid} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-200 text-slate-800 border border-slate-300">
                            {p.pid}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* Sub-branch Row: WAITING State & Bidirectional Flow */}
                <div className="flex flex-col items-center">
                  
                  {/* Transition Legend between Running and Waiting */}
                  <div className="flex items-center justify-center space-x-6 py-2 text-[11px] font-medium text-slate-500">
                    <span className="flex items-center text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <ArrowDown className="w-3 h-3 mr-1" />
                      I/O or Lock Wait
                    </span>
                    <span className="flex items-center text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      <ArrowUp className="w-3 h-3 mr-1" />
                      I/O Complete (to Ready)
                    </span>
                  </div>

                  {/* Node 4: WAITING (BLOCKED) */}
                  <div 
                    onClick={() => setSelectedStateFilter(selectedStateFilter === 'WAITING' ? 'ALL' : 'WAITING')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all text-left max-w-md w-full relative group ${
                      selectedStateFilter === 'WAITING'
                        ? 'ring-2 ring-amber-500 shadow-md'
                        : ''
                    } ${
                      isLight 
                        ? 'bg-amber-50/70 hover:bg-amber-50 border-amber-200/80 shadow-sm' 
                        : 'bg-amber-950/20 hover:bg-amber-950/30 border-amber-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <PauseCircle className="w-4 h-4 text-amber-600" />
                        <span className="font-bold text-xs uppercase tracking-wide text-amber-800 dark:text-amber-300">
                          4. WAITING / BLOCKED
                        </span>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {waiting}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700/80 leading-relaxed mb-3">
                      Blocked on disk I/O, user keystroke, or mutex lock.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {processesByState.WAITING.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">No processes waiting</span>
                      ) : (
                        processesByState.WAITING.map(p => (
                          <span key={p.pid} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-200/70 text-amber-900 border border-amber-300">
                            {p.pid}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* State Transition Flow Guide (Legend) */}
                <div className={`p-3 rounded-xl border text-[11px] flex flex-wrap items-center justify-around gap-2 ${
                  isLight 
                    ? 'bg-slate-50/80 border-slate-200 text-slate-600' 
                    : 'bg-slate-900/50 border-slate-800 text-slate-400'
                }`}>
                  <span className="flex items-center font-medium">
                    <span className="w-2 h-2 rounded-full bg-sky-500 mr-1.5"></span>
                    <strong>Admitted:</strong> NEW &rarr; READY
                  </span>
                  <span className="flex items-center font-medium">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></span>
                    <strong>Dispatch:</strong> READY &rarr; RUNNING
                  </span>
                  <span className="flex items-center font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
                    <strong>Interrupt:</strong> RUNNING &rarr; READY
                  </span>
                  <span className="flex items-center font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5"></span>
                    <strong>Blocked:</strong> RUNNING &rarr; WAITING
                  </span>
                  <span className="flex items-center font-medium">
                    <span className="w-2 h-2 rounded-full bg-slate-500 mr-1.5"></span>
                    <strong>Terminated:</strong> RUNNING &rarr; EXIT
                  </span>
                </div>

              </div>
            </div>

            {/* Comprehensive Process Details Table (Calm Light Style) */}
            <div className={`rounded-2xl border overflow-hidden transition-all ${
              isLight 
                ? 'bg-white border-slate-200/90 shadow-sm' 
                : 'bg-slate-950 border-slate-800'
            }`}>
              <div className={`p-3.5 border-b flex items-center justify-between ${
                isLight 
                  ? 'bg-slate-50/80 border-slate-200 text-slate-800' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}>
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-2 text-indigo-600" />
                  Kernel Process Table
                  {selectedStateFilter !== 'ALL' && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium">
                      Filter: {selectedStateFilter}
                    </span>
                  )}
                </h3>
                <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Showing {displayedProcesses.length} of {total} processes
                </span>
              </div>

              <div className="overflow-x-auto max-h-[280px]">
                <table className="min-w-full divide-y text-xs text-left">
                  <thead className={`uppercase tracking-wider font-semibold sticky top-0 ${
                    isLight 
                      ? 'bg-slate-100 text-slate-600 divide-slate-200' 
                      : 'bg-slate-900 text-slate-400 divide-slate-800'
                  }`}>
                    <tr>
                      <th className="px-3.5 py-2.5">PID</th>
                      <th className="px-3.5 py-2.5">Name</th>
                      <th className="px-3.5 py-2.5">State</th>
                      <th className="px-3.5 py-2.5">Arrival</th>
                      <th className="px-3.5 py-2.5">Burst</th>
                      <th className="px-3.5 py-2.5">Priority</th>
                      <th className="px-3.5 py-2.5">Memory</th>
                      <th className="px-3.5 py-2.5">Program Counter</th>
                      <th className="px-3.5 py-2.5">Registers</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-900'}`}>
                    {displayedProcesses.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-4 py-8 text-center text-slate-400 italic">
                          No processes found in this category.
                        </td>
                      </tr>
                    ) : (
                      displayedProcesses.map((p) => (
                        <tr 
                          key={p.pid} 
                          className={`transition-colors ${
                            isLight 
                              ? 'hover:bg-slate-50/80 bg-white' 
                              : 'hover:bg-slate-900/40 bg-slate-950'
                          }`}
                        >
                          <td className="px-3.5 py-2.5 font-mono font-bold text-indigo-600">{p.pid}</td>
                          <td className={`px-3.5 py-2.5 font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{p.name}</td>
                          <td className="px-3.5 py-2.5">
                            <StatusBadge status={p.state} size="xs" />
                          </td>
                          <td className={`px-3.5 py-2.5 font-mono ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{p.arrival_time} ms</td>
                          <td className={`px-3.5 py-2.5 font-mono ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{p.burst_time} ms</td>
                          <td className="px-3.5 py-2.5 font-mono text-amber-600 font-semibold">{p.priority}</td>
                          <td className="px-3.5 py-2.5 font-mono text-purple-600">{p.memory_required} MB</td>
                          <td className="px-3.5 py-2.5 font-mono text-emerald-600 text-[11px]">{p.pcb?.program_counter || '0x00401000'}</td>
                          <td className="px-3.5 py-2.5 font-mono text-slate-500 text-[10px]">
                            EAX:{p.pcb?.cpu_registers?.EAX || '0x00'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Individual Process Control Block (PCB) Cards */}
            <div className="space-y-3">
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                <Shield className="w-3.5 h-3.5 mr-2 text-indigo-600" />
                Process Control Block (PCB) Internals & Hardware Registers
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {displayedProcesses.map((p) => {
                  const pcb = p.pcb;
                  return (
                    <div 
                      key={p.pid} 
                      className={`p-3.5 rounded-2xl border transition-all text-xs space-y-2.5 ${
                        isLight 
                          ? 'bg-white border-slate-200/80 shadow-sm' 
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className={`flex items-center justify-between pb-2 border-b ${
                        isLight ? 'border-slate-100' : 'border-slate-850'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                            {p.pid}
                          </span>
                          <span className={`font-semibold truncate max-w-[150px] ${isLight ? 'text-slate-800' : 'text-white'}`}>
                            {p.name}
                          </span>
                        </div>
                        <StatusBadge status={p.state} size="xs" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Priority & Arrival</span>
                          <span className={`font-mono ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Prio {p.priority} · Arr {p.arrival_time}ms
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Burst & CPU Run</span>
                          <span className={`font-mono ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Burst {p.burst_time}ms · Run {p.cpu_time_used || 0}ms
                          </span>
                        </div>
                      </div>

                      <div className={`p-2 rounded-xl border font-mono text-[10px] space-y-1 ${
                        isLight 
                          ? 'bg-slate-50 border-slate-200/70 text-slate-600' 
                          : 'bg-slate-900/80 border-slate-850 text-slate-400'
                      }`}>
                        <div className="text-emerald-600 font-medium">
                          PC: {pcb.program_counter || '0x00401000'} | Mem: {p.memory_required} MB
                        </div>
                        <div>
                          EAX: {pcb.cpu_registers?.EAX || '0x00'} | EBX: {pcb.cpu_registers?.EBX || '0x00'}
                        </div>
                        <div>
                          ECX: {pcb.cpu_registers?.ECX || '0x00'} | EDX: {pcb.cpu_registers?.EDX || '0x00'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          /* Tab 2: Raw / Plain Text for Copying to Documentation & Reports */
          <div className="space-y-3">
            <div className={`flex items-center justify-between text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              <span>Includes complete ASCII process lifecycle diagram, ready to copy into your project report or documentation:</span>
              <button
                onClick={handleCopy}
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copied to Clipboard!' : 'Click to Copy Full Text'}
              </button>
            </div>

            <textarea
              readOnly
              rows={18}
              value={generatePlainTextReport()}
              className={`w-full rounded-2xl p-4 font-mono text-xs border focus:outline-none transition-colors ${
                isLight 
                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500 selection:bg-indigo-100' 
                  : 'bg-slate-950 border-slate-800 text-slate-300 focus:border-indigo-500 selection:bg-indigo-600 selection:text-white'
              }`}
            />
          </div>
        )}

        {/* Modal Footer */}
        <div className={`pt-3 border-t flex justify-between items-center text-xs ${
          isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-500'
        }`}>
          <span>{total} processes evaluated in this kernel audit.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 font-semibold rounded-xl text-xs transition-colors bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-200"
          >
            Close Report
          </button>
        </div>

      </div>
    </Modal>
  );
}
