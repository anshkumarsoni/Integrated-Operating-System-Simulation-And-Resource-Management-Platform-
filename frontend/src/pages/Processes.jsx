import React, { useState } from 'react';
import { Eye, Trash2, Plus, RefreshCw, Layers, Shield, Cpu, Activity } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import PCBModal from '../components/PCBModal';

export default function Processes() {
  const { 
    processes, 
    createProcess, 
    updateProcessState, 
    terminateProcess, 
    osService, 
    refreshAll 
  } = useSimulation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPcb, setSelectedPcb] = useState(null);
  const [isPcbModalOpen, setIsPcbModalOpen] = useState(false);
  const [notification, setNotification] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    arrival_time: 0,
    burst_time: 10,
    priority: 3,
    memory_required: 120,
    io_required: false,
    resource_required: 'None'
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const res = await createProcess({
      ...formData,
      arrival_time: Number(formData.arrival_time) || 0,
      burst_time: Number(formData.burst_time) || 1,
      priority: Number(formData.priority) || 1,
      memory_required: Number(formData.memory_required) || 50
    });

    setIsCreateModalOpen(false);
    setNotification(`Process ${res.data.pid} (${res.data.name}) created successfully in READY state!`);
    setTimeout(() => setNotification(''), 4000);

    setFormData({
      name: '',
      arrival_time: 0,
      burst_time: 10,
      priority: 3,
      memory_required: 120,
      io_required: false,
      resource_required: 'None'
    });
  };

  const handleViewPcb = (pid) => {
    const pcb = osService.getProcessPCB(pid);
    setSelectedPcb(pcb);
    setIsPcbModalOpen(true);
  };

  const handleStateChange = async (pid, newState) => {
    await updateProcessState(pid, newState);
  };

  const handleTerminate = async (pid) => {
    if (window.confirm(`Terminate process ${pid}? This will deallocate memory and release all claimed resources.`)) {
      await terminateProcess(pid);
      setNotification(`Process ${pid} terminated. All assigned resources reclaimed.`);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Process Management & PCB</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Active kernel process table, state transitions, scheduling attributes, and Process Control Blocks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshAll()}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
            title="Refresh process list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30 text-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Process
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification('')} className="text-emerald-400 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Process Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3.5">PID</th>
                <th className="px-4 py-3.5">Process Name</th>
                <th className="px-4 py-3.5">State</th>
                <th className="px-4 py-3.5">Arrival</th>
                <th className="px-4 py-3.5">Burst</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Memory</th>
                <th className="px-4 py-3.5">CPU Time</th>
                <th className="px-4 py-3.5">Resource</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {processes.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center text-slate-500">
                    No active processes in the system. Click "+ Create Process" to instantiate one.
                  </td>
                </tr>
              ) : (
                processes.map((p) => (
                  <tr key={p.pid} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-indigo-400">
                      {p.pid}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-white">
                      {p.name}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={p.state} size="xs" />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">
                      {p.arrival_time} ms
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">
                      {p.burst_time} ms
                    </td>
                    <td className="px-4 py-3.5 font-mono text-amber-400 font-semibold">
                      {p.priority}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-purple-300">
                      {p.memory_required} MB
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-400">
                      {p.cpu_time_used || 0} ms
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 font-medium">
                      {p.resource_required && p.resource_required !== 'None' ? (
                        <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] text-emerald-400">
                          {p.resource_required}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* View PCB */}
                        <button 
                          onClick={() => handleViewPcb(p.pid)} 
                          className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg transition-colors border border-indigo-500/30 font-medium text-xs flex items-center"
                          title="Inspect Process Control Block"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          PCB
                        </button>

                        {/* State Dropdown */}
                        <select 
                          value={p.state} 
                          onChange={(e) => handleStateChange(p.pid, e.target.value)}
                          className="bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                        >
                          <option value="NEW">NEW</option>
                          <option value="READY">READY</option>
                          <option value="RUNNING">RUNNING</option>
                          <option value="WAITING">WAITING</option>
                          <option value="TERMINATED">TERMINATED</option>
                        </select>

                        {/* Terminate Process */}
                        <button 
                          onClick={() => handleTerminate(p.pid)} 
                          disabled={p.state === 'TERMINATED'}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30"
                          title="Terminate process"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Process Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Simulated Process">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Process Name
            </label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Real-Time Data Pipeline" 
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500" 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Arrival Time (ms)
              </label>
              <input 
                type="number" 
                min="0" 
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500 font-mono" 
                value={formData.arrival_time} 
                onChange={e => setFormData({ ...formData, arrival_time: Number(e.target.value) })} 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Burst Time (ms)
              </label>
              <input 
                type="number" 
                min="1" 
                required 
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500 font-mono" 
                value={formData.burst_time} 
                onChange={e => setFormData({ ...formData, burst_time: Number(e.target.value) })} 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Priority (1 = Highest, 10 = Lowest)
              </label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500 font-mono" 
                value={formData.priority} 
                onChange={e => setFormData({ ...formData, priority: Number(e.target.value) })} 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Memory Required (MB)
              </label>
              <input 
                type="number" 
                min="10" 
                max="1024"
                required 
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500 font-mono" 
                value={formData.memory_required} 
                onChange={e => setFormData({ ...formData, memory_required: Number(e.target.value) })} 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Required Resource Claim
            </label>
            <select 
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500" 
              value={formData.resource_required} 
              onChange={e => setFormData({ ...formData, resource_required: e.target.value })}
            >
              <option value="None">None</option>
              <option value="Disk">Disk (R1)</option>
              <option value="Printer">Printer (R2)</option>
              <option value="File Lock">File Lock (R3)</option>
              <option value="Database Connection">Database Connection (R4)</option>
            </select>
          </div>

          <div>
            <label className="flex items-center text-sm text-slate-300 cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="mr-2.5 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                checked={formData.io_required} 
                onChange={e => setFormData({ ...formData, io_required: e.target.checked })} 
              />
              <span>Requires Asynchronous I/O Device Operation</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button 
              type="button" 
              onClick={() => setIsCreateModalOpen(false)} 
              className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/30"
            >
              Instantiate Process & PCB
            </button>
          </div>
        </form>
      </Modal>

      {/* Detailed Educational PCB Inspector Modal */}
      <PCBModal 
        isOpen={isPcbModalOpen} 
        onClose={() => setIsPcbModalOpen(false)} 
        pcb={selectedPcb} 
      />
    </div>
  );
}
