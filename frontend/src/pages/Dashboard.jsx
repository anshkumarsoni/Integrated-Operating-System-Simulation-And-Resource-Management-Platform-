import React from 'react';
import { 
  ListChecks, Play, Clock, Pause, XCircle,
  Cpu, MemoryStick, Package, HardDrive, 
  Lock, FolderTree, Terminal, AlertTriangle, 
  Activity, ArrowUpRight, Zap, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSimulation } from '../hooks/useSimulation';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { formatTimestamp } from '../utils/helpers';

export default function Dashboard() {
  const { dashboardStats, processes, executionHistory } = useSimulation();
  const stats = dashboardStats;

  return (
    <div className="space-y-8">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Integrated OS Kernel Simulator</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">System State Overview</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time status across Process, CPU Scheduling, Memory Partitioning, I/O, and Concurrency subsystems.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/integrated-simulation"
            className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            Launch 13-Step Simulation
          </Link>
          <Link
            to="/processes"
            className="inline-flex items-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Manage Processes
          </Link>
        </div>
      </div>

      {/* 1. Process Management Subsection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center">
            <ListChecks className="w-4 h-4 mr-2 text-indigo-400" /> Processes Overview
          </h2>
          <Link to="/processes" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center font-medium">
            View table <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="Total Processes" value={stats?.processes?.total ?? 0} icon={ListChecks} color="blue" />
          <StatCard title="Running" value={stats?.processes?.running ?? 0} icon={Play} color="emerald" subtitle="Active on CPU" />
          <StatCard title="Ready" value={stats?.processes?.ready ?? 0} icon={Clock} color="yellow" subtitle="In Ready Queue" />
          <StatCard title="Waiting" value={stats?.processes?.waiting ?? 0} icon={Pause} color="orange" subtitle="Awaiting I/O / Res" />
          <StatCard title="Terminated" value={stats?.processes?.terminated ?? 0} icon={XCircle} color="slate" subtitle="Reclaimed PCB" />
        </div>
      </div>

      {/* 2. CPU & Memory Subsystems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center">
              <Cpu className="w-4 h-4 mr-2 text-blue-400" /> CPU Subsystem
            </h2>
            <Link to="/cpu-scheduling" className="text-xs text-blue-400 hover:text-blue-300 flex items-center font-medium">
              Scheduler <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="Algorithm" value={stats?.cpu?.currentAlgorithm ?? 'Round Robin'} color="blue" />
            <StatCard title="CPU Utilization" value={`${stats?.cpu?.cpuUtilization ?? 45}%`} color="emerald" />
            <StatCard title="Active Process" value={stats?.cpu?.currentProcess ?? 'P101'} color="purple" />
          </div>
        </div>

        {/* Memory Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center">
              <MemoryStick className="w-4 h-4 mr-2 text-purple-400" /> Memory Subsystem
            </h2>
            <Link to="/memory-management" className="text-xs text-purple-400 hover:text-purple-300 flex items-center font-medium">
              Partitions <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard title="Total Memory" value={`${stats?.memory?.totalMemory ?? 1024} MB`} color="slate" />
            <StatCard title="Used Memory" value={`${stats?.memory?.usedMemory ?? 0} MB`} color="purple" />
            <StatCard title="Free Memory" value={`${stats?.memory?.freeMemory ?? 1024} MB`} color="emerald" />
            <StatCard title="Utilization" value={`${stats?.memory?.utilization ?? 0}%`} color="indigo" />
          </div>
        </div>
      </div>

      {/* 3. Resources, I/O, Deadlock, Files, System Calls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Resources */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Resources</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats?.resources?.available ?? 0} / {stats?.resources?.total ?? 0}</div>
          <p className="text-[11px] text-slate-400">Available instances across R1-R4</p>
          <Link to="/resource-management" className="text-[11px] text-emerald-400 hover:underline inline-flex items-center pt-1 font-medium">
            Manage <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* I/O */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">I/O Queue</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats?.io?.pendingRequests ?? 0} Pending</div>
          <p className="text-[11px] text-slate-400">{stats?.io?.completedRequests ?? 0} requests serviced</p>
          <Link to="/io-management" className="text-[11px] text-amber-400 hover:underline inline-flex items-center pt-1 font-medium">
            Queue Details <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* Deadlock */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Deadlock</span>
            <Lock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">{stats?.deadlock?.status ?? 'Safe'}</span>
          </div>
          <p className="text-[11px] text-slate-400">{stats?.deadlock?.blockedCount ?? 0} blocked processes</p>
          <Link to="/deadlock-management" className="text-[11px] text-indigo-400 hover:underline inline-flex items-center pt-1 font-medium">
            Banker's Check <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* Files */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">File System</span>
            <FolderTree className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats?.files?.totalFiles ?? 0} Files</div>
          <p className="text-[11px] text-slate-400">{stats?.files?.directories ?? 0} directories in tree</p>
          <Link to="/file-system" className="text-[11px] text-sky-400 hover:underline inline-flex items-center pt-1 font-medium">
            File Explorer <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* System Calls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">System Calls</span>
            <Terminal className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats?.systemCalls?.total ?? 0} Calls</div>
          <p className="text-[11px] text-slate-400">{stats?.systemCalls?.successful ?? 0} success, {stats?.systemCalls?.failed ?? 0} failed</p>
          <Link to="/system-calls" className="text-[11px] text-purple-400 hover:underline inline-flex items-center pt-1 font-medium">
            Call Logs <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* 4. Recent Activity Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-emerald-400" /> Recent Operating System Events
          </h2>
          <Link to="/execution-history" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center font-medium">
            View Full History <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="min-w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">PID</th>
                <th className="px-4 py-3 font-semibold">Event</th>
                <th className="px-4 py-3 font-semibold">Subsystem Module</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {(stats?.recentActivity || executionHistory.slice(0, 6)).map((act) => (
                <tr key={act.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-400">{formatTimestamp(act.timestamp)}</td>
                  <td className="px-4 py-3 font-mono font-bold text-indigo-400">{act.pid}</td>
                  <td className="px-4 py-3 font-medium text-white">{act.event}</td>
                  <td className="px-4 py-3 text-slate-300">{act.module}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={act.status} size="xs" />
                  </td>
                  <td className="px-4 py-3 text-slate-400 truncate max-w-xs">{act.description}</td>
                </tr>
              ))}
              {(!stats?.recentActivity || stats.recentActivity.length === 0) && executionHistory.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-slate-500">
                    No recent events recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
