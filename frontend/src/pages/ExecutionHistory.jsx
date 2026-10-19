import React, { useState } from 'react';
import { History, Download, Trash2, Filter, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import StatusBadge from '../components/StatusBadge';
import { formatTimestamp } from '../utils/helpers';

export default function ExecutionHistory() {
  const { executionHistory, processes, osService, refreshAll } = useSimulation();

  const [pidFilter, setPidFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState('');

  const MODULES = [
    'All',
    'Process Manager',
    'Memory Manager',
    'Scheduler',
    'I/O Manager',
    'Resource Manager',
    'Deadlock Manager',
    'File System',
    'System Calls',
    'Synchronization'
  ];

  const filteredHistory = executionHistory.filter((item) => {
    if (pidFilter !== 'All' && item.pid !== pidFilter) return false;
    if (moduleFilter !== 'All' && item.module !== moduleFilter) return false;
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const text = `${item.event} ${item.description} ${item.pid} ${item.module}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredHistory, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `os_execution_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setFeedback('Exported history as JSON file');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'PID', 'Event', 'Module', 'Status', 'Description'];
    const rows = filteredHistory.map(item => [
      `"${item.timestamp}"`,
      `"${item.pid}"`,
      `"${item.event}"`,
      `"${item.module}"`,
      `"${item.status}"`,
      `"${(item.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `os_execution_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setFeedback('Exported history as CSV file');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all execution history logs?')) {
      osService.clearExecutionHistory();
      refreshAll();
      setFeedback('Execution history cleared.');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Execution History & Audit Trail</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Unified chronological audit log of all simulated operating system state transitions, kernel traps, and scheduler events.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl text-xs transition-colors border border-slate-800"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl text-xs transition-colors border border-slate-800"
            title="Export JSON"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export JSON
          </button>
          <button
            onClick={handleClearHistory}
            className="flex items-center px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold rounded-xl text-xs transition-colors border border-rose-500/30"
            title="Clear History"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="font-bold ml-3">✕</button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search events or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* PID Filter */}
          <div>
            <select
              value={pidFilter}
              onChange={e => setPidFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="All">All Processes</option>
              <option value="KERNEL">KERNEL</option>
              <option value="SCHEDULER">SCHEDULER</option>
              {processes.map(p => (
                <option key={p.pid} value={p.pid}>{p.pid} ({p.name})</option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div>
            <select
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            >
              {MODULES.map(m => (
                <option key={m} value={m}>{m === 'All' ? 'All OS Modules' : m}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARNING">WARNING</option>
              <option value="FAILED">FAILED</option>
              <option value="INFO">INFO</option>
            </select>
          </div>
        </div>
      </div>

      {/* Event Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">PID</th>
                <th className="px-4 py-3.5">Event Name</th>
                <th className="px-4 py-3.5">Subsystem Module</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Description & Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-slate-500">
                    No execution events matching current filters.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {formatTimestamp(item.timestamp)}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-indigo-400">
                      {item.pid}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {item.event}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {item.module}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} size="xs" />
                    </td>
                    <td className="px-4 py-3 text-slate-300 leading-relaxed max-w-md">
                      {item.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
