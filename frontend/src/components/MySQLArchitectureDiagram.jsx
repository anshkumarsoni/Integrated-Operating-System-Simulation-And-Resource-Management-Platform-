import React, { useState } from 'react';
import { 
  Users, User, FileText, Cpu, Cog, MemoryStick, Layers, 
  Lock, ArrowRight, ArrowLeftRight, Database, Key, 
  BarChart3, Plug, HardDrive, RefreshCw, CheckCircle2,
  GitBranch, Server, Activity, ShieldCheck
} from 'lucide-react';
import { osService } from '../services/osService';
import { StorageService } from '../services/storageService';

export default function MySQLArchitectureDiagram() {
  const [selectedNode, setSelectedNode] = useState(null);

  // Live simulation data
  const processes = osService.getProcesses() || [];
  const memStatus = osService.getMemoryStatus() || { utilization: 0, usedMemory: 0, totalMemory: 1024 };
  const resources = osService.getResources() || [];
  const ioRequests = osService.getIORequests() || [];
  const systemCalls = osService.getSystemCalls() || [];
  const users = StorageService.getUsers() || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 select-none">
      {/* Title Header */}
      <div className="text-center space-y-1.5 pb-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <Server className="w-6 h-6 text-indigo-400 inline" />
          Integrated Operating System Simulator & Resource Manager
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          A platform that models how a server manages processes, CPU, memory and virtual memory, while MySQL persists all data and entities.
        </p>
      </div>

      {/* Main Diagram Canvas */}
      <div className="space-y-6">
        {/* ============================================================== */}
        {/* TOP ROW: USER LAYER | KERNEL ENGINE | DEVICE / I/O LAYER       */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* 1. USER / CLIENT LAYER (Blue Box - 3 Cols) */}
          <div className="lg:col-span-3 bg-sky-950/40 border-2 border-sky-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-sky-400 transition-all shadow-lg shadow-sky-950/30">
            <div className="flex items-center space-x-2 text-sky-300 font-bold text-sm tracking-wide border-b border-sky-500/30 pb-2.5">
              <Users className="w-5 h-5 text-sky-400" />
              <span>User / Client Layer</span>
            </div>

            {/* Sub-box 1: Admin / Operator */}
            <div 
              onClick={() => setSelectedNode({ title: 'Admin / Operator', count: `${users.length} Registered Users`, desc: 'Authenticated system administrator and student users submitting process workloads.' })}
              className="bg-sky-900/30 hover:bg-sky-900/50 border border-sky-500/30 rounded-xl p-3.5 cursor-pointer transition-all space-y-1"
            >
              <div className="flex items-center space-x-2 text-sky-200 font-bold text-xs">
                <User className="w-4 h-4 text-sky-400" />
                <span>Admin / Operator</span>
              </div>
              <p className="text-[11px] text-sky-300/80">Submits jobs & views stats</p>
            </div>

            {/* Sub-box 2: Job / Request Queue */}
            <div 
              onClick={() => setSelectedNode({ title: 'Job / Request Queue', count: `${processes.length} Queued Jobs`, desc: 'Holds incoming process requests, I/O requests, and resource claims before kernel dispatch.' })}
              className="bg-sky-900/30 hover:bg-sky-900/50 border border-sky-500/30 rounded-xl p-3.5 cursor-pointer transition-all space-y-1.5"
            >
              <div className="flex items-center space-x-2 text-sky-200 font-bold text-xs">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Job / Request Queue</span>
              </div>
              <ul className="text-[11px] text-sky-300/80 space-y-0.5 list-disc list-inside">
                <li>New process requests</li>
                <li>I/O requests</li>
                <li>Resource claims</li>
              </ul>
            </div>
          </div>

          {/* 2. SIMULATION KERNEL ENGINE (Purple Box - 6 Cols) */}
          <div className="lg:col-span-6 bg-purple-950/40 border-2 border-purple-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-purple-400 transition-all shadow-lg shadow-purple-950/30">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-2.5">
              <div className="flex items-center space-x-2 text-purple-300 font-bold text-sm tracking-wide">
                <Cog className="w-5 h-5 text-purple-400 animate-spin-slow" />
                <span>Simulation Kernel Engine</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-purple-900/60 rounded text-purple-300 font-mono">Core Dispatcher</span>
            </div>

            {/* 2x2 Grid of Kernel Sub-modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Process Manager */}
              <div 
                onClick={() => setSelectedNode({ title: 'Process Manager', count: `${processes.length} Active PCBs`, desc: 'Allocates Process Control Blocks (PCB), registers CPU contexts, and manages 5-state transitions.' })}
                className="bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 rounded-xl p-3.5 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center space-x-2 text-purple-200 font-bold text-xs">
                  <Cog className="w-4 h-4 text-purple-400" />
                  <span>Process Manager</span>
                </div>
                <p className="text-[11px] text-purple-300/80">PCB table, states, creation & termination</p>
              </div>

              {/* CPU Scheduler */}
              <div 
                onClick={() => setSelectedNode({ title: 'CPU Scheduler', count: '4 Algorithms', desc: 'Schedules ready processes using FCFS, SJF, Priority, and Round Robin with interactive Gantt charts.' })}
                className="bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 rounded-xl p-3.5 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center space-x-2 text-purple-200 font-bold text-xs">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>CPU Scheduler</span>
                </div>
                <p className="text-[11px] text-purple-300/80">FCFS, SJF, Priority, Round Robin</p>
              </div>

              {/* Dotted Feedback Divider Banner */}
              <div className="sm:col-span-2 text-center py-0.5">
                <div className="inline-flex items-center space-x-2 text-[10px] font-mono text-purple-400/90 bg-purple-900/40 px-3 py-0.5 rounded-full border border-dashed border-purple-500/40">
                  <span>◀</span>
                  <span>Feedback & Context Switching Loop</span>
                  <span>▶</span>
                </div>
              </div>

              {/* Memory & Virtual Memory */}
              <div 
                onClick={() => setSelectedNode({ title: 'Memory & Virtual Memory', count: `${memStatus.utilization}% RAM Used`, desc: 'Contiguous partition allocation (First/Best/Worst fit), TLB translation, and FIFO/LRU paging.' })}
                className="bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 rounded-xl p-3.5 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center space-x-2 text-purple-200 font-bold text-xs">
                  <MemoryStick className="w-4 h-4 text-purple-400" />
                  <span>Memory & Virtual Memory</span>
                </div>
                <p className="text-[11px] text-purple-300/80">Paging, page faults, FIFO / LRU replacement</p>
              </div>

              {/* Resource & Deadlock */}
              <div 
                onClick={() => setSelectedNode({ title: 'Resource & Deadlock', count: `${resources.length} Resource Pools`, desc: 'Tracks multi-instance resource matrices and executes Dijkstra\'s Banker\'s Algorithm & RAG cycle detection.' })}
                className="bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 rounded-xl p-3.5 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center space-x-2 text-purple-200 font-bold text-xs">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span>Resource & Deadlock</span>
                </div>
                <p className="text-[11px] text-purple-300/80">Semaphores, allocation, detection & avoidance</p>
              </div>
            </div>
          </div>

          {/* 3. DEVICE / I/O LAYER (Green Box - 3 Cols) */}
          <div className="lg:col-span-3 bg-emerald-950/40 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all shadow-lg shadow-emerald-950/30">
            <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm tracking-wide border-b border-emerald-500/30 pb-2.5">
              <HardDrive className="w-5 h-5 text-emerald-400" />
              <span>Device / I/O Layer</span>
            </div>

            {/* Sub-box 1: I/O Scheduler */}
            <div 
              onClick={() => setSelectedNode({ title: 'I/O Scheduler', count: `${ioRequests.length} I/O Traps`, desc: 'Optimizes disk arm movement across cylinders using FCFS, SSTF, SCAN (Elevator), and C-SCAN.' })}
              className="bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-xl p-3.5 cursor-pointer transition-all space-y-1"
            >
              <div className="flex items-center space-x-2 text-emerald-200 font-bold text-xs">
                <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                <span>I/O Scheduler</span>
              </div>
              <p className="text-[11px] text-emerald-300/80">Disk request ordering, FCFS / SSTF / SCAN</p>
            </div>

            {/* Sub-box 2: Synchronization Unit */}
            <div 
              onClick={() => setSelectedNode({ title: 'Synchronization Unit', count: 'Mutex & Semaphores', desc: 'Provides mutual exclusion, critical section protection, and lock synchronization for concurrent threads.' })}
              className="bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-xl p-3.5 cursor-pointer transition-all space-y-1"
            >
              <div className="flex items-center space-x-2 text-emerald-200 font-bold text-xs">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Synchronization Unit</span>
              </div>
              <p className="text-[11px] text-emerald-300/80">Mutex, critical section, producer-consumer</p>
            </div>
          </div>

        </div>

        {/* Persistence & Reporting Interconnecting Label */}
        <div className="flex items-center justify-center space-x-4 py-1">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent flex-1"></div>
          <span className="text-xs font-mono font-bold text-amber-300/90 bg-amber-950/80 border border-amber-500/40 px-4 py-1.5 rounded-full shadow-md">
            ▼ Persistence & Reporting Pipeline ▼
          </span>
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent flex-1"></div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM ROW: MYSQL DATABASE LAYER & DASHBOARD REPORTS           */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* 4. MYSQL DATABASE LAYER (Warm Gold/Amber Box - 8 Cols) */}
          <div className="lg:col-span-8 bg-amber-950/40 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all shadow-lg shadow-amber-950/30">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5">
              <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm tracking-wide">
                <Database className="w-5 h-5 text-amber-400" />
                <span>MySQL Database Layer (MySQL 8.0+ Engine)</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 bg-amber-900/60 rounded text-amber-300 font-mono">InnoDB Relational Schema</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              
              {/* Sub-box 1: Data Access Layer */}
              <div 
                onClick={() => setSelectedNode({ title: 'Data Access Layer', count: 'ACID Transactions', desc: 'Manages ACID-compliant queries, atomic process state persistence, and connection pooling.' })}
                className="bg-amber-900/30 hover:bg-amber-900/50 border border-amber-500/30 rounded-xl p-4 cursor-pointer transition-all text-center space-y-2 h-full flex flex-col justify-center items-center"
              >
                <div className="p-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Plug className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-200">Data Access Layer</h4>
                  <p className="text-[11px] text-amber-300/80 mt-0.5">Transactions, ACID</p>
                </div>
              </div>

              {/* Sub-box 2: Core Tables (Cylinder Shape) */}
              <div 
                onClick={() => setSelectedNode({ title: 'MySQL Core Tables', count: '10 Normalized Tables', desc: 'Stores processes, PCB registers, resources, memory_pages, filesystem inodes, and system logs in normalized tables.' })}
                className="bg-amber-900/40 hover:bg-amber-900/60 border-2 border-amber-500/40 rounded-2xl p-4 cursor-pointer transition-all text-center space-y-2.5 shadow-md shadow-amber-950/40"
              >
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold font-mono">
                  <Database className="w-3.5 h-3.5" />
                  <span>Core Tables</span>
                </div>
                <ul className="text-[11px] text-amber-200/90 space-y-1 font-mono text-left max-w-[140px] mx-auto list-disc list-inside">
                  <li>processes</li>
                  <li>resources</li>
                  <li>memory_pages</li>
                  <li>files</li>
                  <li>system_logs</li>
                </ul>
              </div>

              {/* Sub-box 3: Indexing & Constraints */}
              <div 
                onClick={() => setSelectedNode({ title: 'Indexing & Constraints', count: 'PK, FK & Indexes', desc: 'Enforces relational integrity via Primary Keys, Foreign Keys (ON DELETE CASCADE), and B-Tree indexes.' })}
                className="bg-amber-900/30 hover:bg-amber-900/50 border border-amber-500/30 rounded-xl p-4 cursor-pointer transition-all text-center space-y-2 h-full flex flex-col justify-center items-center"
              >
                <div className="p-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-200">Indexing & Constraints</h4>
                  <p className="text-[11px] text-amber-300/80 mt-0.5">PK / FK, indexes</p>
                </div>
              </div>

            </div>
          </div>

          {/* 5. DASHBOARD & REPORTS (Blue Box - 4 Cols) */}
          <div 
            onClick={() => setSelectedNode({ title: 'Dashboard & Reports', count: 'Real-Time Analytics', desc: 'Aggregates live simulation metrics, generates Gantt charts, memory partition maps, and execution timelines.' })}
            className="lg:col-span-4 bg-sky-950/40 border-2 border-sky-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-3 cursor-pointer hover:border-sky-400 transition-all shadow-lg shadow-sky-950/30"
          >
            <div className="flex items-center space-x-2 text-sky-300 font-bold text-sm tracking-wide border-b border-sky-500/30 pb-2.5">
              <BarChart3 className="w-5 h-5 text-sky-400" />
              <span>Dashboard & Reports</span>
            </div>

            <div className="p-4 rounded-xl bg-sky-900/30 border border-sky-500/30 text-center space-y-2">
              <div className="p-3 inline-block rounded-full bg-sky-500/10 text-sky-400">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h4 className="text-xs font-bold text-sky-200">Visualization Analytics</h4>
              <p className="text-xs text-sky-300/80 leading-relaxed">
                Gantt charts, CPU/RAM utilization gauges, system logs & execution history.
              </p>
            </div>

            <div className="text-[11px] text-sky-400/90 text-center font-mono">
              Live State Synchronized with MySQL Schema
            </div>
          </div>

        </div>
      </div>

      {/* Node Inspection Popup / Info Box */}
      {selectedNode && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 text-slate-200 flex items-start justify-between space-x-4 animate-in fade-in shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">{selectedNode.title}</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">{selectedNode.count}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.desc}</p>
          </div>
          <button 
            onClick={() => setSelectedNode(null)} 
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-900 rounded-lg border border-slate-800"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
