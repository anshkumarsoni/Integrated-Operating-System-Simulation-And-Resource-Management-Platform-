import React from 'react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { Cpu, Database, HardDrive, Layers, Clock, Shield, Hash, Server, Activity } from 'lucide-react';
import { formatTimestamp, formatDateFull } from '../utils/helpers';

const PCBModal = ({ isOpen, onClose, pcb }) => {
  if (!pcb) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Process Control Block (PCB)" size="xl">
      <div className="space-y-6">
        {/* Educational Callout Banner */}
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 flex items-start space-x-3">
          <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400 mt-0.5 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-300">PCB — Process Control Block Definition</h4>
            <p className="text-xs text-indigo-200/80 mt-1 leading-relaxed">
              The PCB is the kernel data structure maintaining the entire execution context for this process. It enables preemptive multitasking, context switching, memory protection, and resource accounting.
            </p>
          </div>
        </div>

        {/* Header Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-mono text-lg font-bold text-blue-400">
              {pcb.pid}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{pcb.process_name || pcb.name}</h2>
              <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Created: {pcb.creation_time ? formatDateFull(pcb.creation_time) : 'Active'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Current State</span>
              <StatusBadge status={pcb.state} size="md" />
            </div>
          </div>
        </div>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: CPU & Scheduling State */}
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                <Cpu className="w-4 h-4 mr-2 text-blue-400" /> CPU Context & Scheduling
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Arrival Time</span>
                  <p className="text-sm font-bold text-white font-mono">{pcb.arrival_time} ms</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Burst Time</span>
                  <p className="text-sm font-bold text-white font-mono">{pcb.burst_time} ms</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Priority Level</span>
                  <p className="text-sm font-bold text-amber-400 font-mono">Level {pcb.priority}</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Program Counter (PC)</span>
                  <p className="text-sm font-bold text-emerald-400 font-mono">{pcb.program_counter || '0x00401000'}</p>
                </div>
              </div>

              {/* Hardware Registers */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-2">Architectural Registers</span>
                <div className="grid grid-cols-4 gap-2">
                  {pcb.cpu_registers && Object.entries(pcb.cpu_registers).map(([reg, val]) => (
                    <div key={reg} className="bg-slate-900 border border-slate-800 p-2 rounded text-center">
                      <span className="text-[10px] text-slate-500 font-mono block">{reg}</span>
                      <span className="text-xs text-emerald-400 font-mono font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Threads info */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-indigo-400" /> Thread Execution
              </h3>
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400">Active Threads</span>
                <span className="text-sm font-bold text-indigo-300 font-mono">{pcb.thread_count || 1} Thread(s)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Memory & Peripherals */}
          <div className="space-y-4">
            {/* Memory Allocation */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                <Database className="w-4 h-4 mr-2 text-purple-400" /> Memory Allocation & Paging
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400">Base Address:</span>
                  <span className="text-white font-mono">{pcb.memory_allocation?.base_address || '0x00000000'}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400">Limit Address:</span>
                  <span className="text-white font-mono">{pcb.memory_allocation?.limit || '0x00000000'}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400">Allocated Partition Size:</span>
                  <span className="text-purple-300 font-bold font-mono">{pcb.memory_allocation?.allocated_size || 0} MB</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400 block mb-1">Assigned Page Frames:</span>
                  <div className="flex flex-wrap gap-1">
                    {pcb.pages && pcb.pages.length > 0 ? (
                      pcb.pages.map(p => (
                        <span key={p} className="px-2 py-0.5 bg-purple-950 border border-purple-800/50 text-purple-300 rounded font-mono text-[10px]">
                          Page #{p}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">No virtual pages allocated</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* I/O & Resources */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                <HardDrive className="w-4 h-4 mr-2 text-amber-400" /> I/O & System Resources
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400">I/O Device Status:</span>
                  <span className="text-amber-300 font-medium font-mono">
                    {pcb.io_status?.device ? `${pcb.io_status.device} (${pcb.io_status.pending ? 'Pending' : 'Idle'})` : 'None'}
                  </span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400 block mb-1">Resources Currently Held:</span>
                  <div className="flex flex-wrap gap-1">
                    {pcb.resources_held && pcb.resources_held.length > 0 ? (
                      pcb.resources_held.map((r, i) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-950 border border-emerald-800/50 text-emerald-300 rounded font-mono text-[10px]">
                          {r}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">No resources currently locked</span>
                    )}
                  </div>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400 block mb-1">Resources Requested / Waiting:</span>
                  <div className="flex flex-wrap gap-1">
                    {pcb.resources_requested && pcb.resources_requested.length > 0 ? (
                      pcb.resources_requested.map((r, i) => (
                        <span key={i} className="px-2 py-0.5 bg-orange-950 border border-orange-800/50 text-orange-300 rounded font-mono text-[10px]">
                          {r}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">None pending</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-sm transition-colors"
          >
            Close PCB Inspector
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PCBModal;
