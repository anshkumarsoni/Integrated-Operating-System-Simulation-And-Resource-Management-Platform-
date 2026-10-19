import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Database, RotateCcw, CheckCircle2, 
  Server, Sliders, Layers, ArrowRight, Sparkles 
} from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import { SCHEMA_MODELS_METADATA, PHASE_2_ROADMAP } from '../data/dataModels';

export default function Settings() {
  const { simSpeed, setSimSpeed, resetAll } = useSimulation();

  const [activeTab, setActiveTab] = useState('Configuration');
  const [message, setMessage] = useState('');

  const handleResetSystem = async () => {
    if (window.confirm('Reset all simulated OS modules (Processes, Memory, I/O, Resources, Files, History) to initial prototype state?')) {
      await resetAll();
      setMessage('System state reset to sample defaults successfully.');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Settings & Architecture</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Configure simulation execution parameters and inspect the modular service layer and logical data models.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        {[
          { id: 'Configuration', label: 'Simulation Controls', icon: Sliders },
          { id: 'DataModels', label: 'Logical Data Models', icon: Database },
          { id: 'Architecture', label: 'Service Layer & Roadmap', icon: Server }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-xs font-bold transition-all border-b-2 ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="font-bold ml-3">✕</button>
        </div>
      )}

      {/* Tab 1: Configuration */}
      {activeTab === 'Configuration' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulation Velocity */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <Sliders className="w-4 h-4 mr-2 text-indigo-400" /> Simulation Execution Velocity
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Control the step delay for the automated 13-step Integrated Simulation engine.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>Fast (300ms)</span>
                <span className="text-indigo-400 font-bold">{simSpeed} ms delay per step</span>
                <span>Slow (2000ms)</span>
              </div>
              <input
                type="range"
                min="300"
                max="2000"
                step="100"
                value={simSpeed}
                onChange={e => setSimSpeed(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Seed Data Reset */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <RotateCcw className="w-4 h-4 mr-2 text-amber-400" /> Reset to Initial Prototype State
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Restore default processes (P101-P105), simulated memory blocks, system resources (R1-R4), file hierarchy, and clean logs.
            </p>

            <div className="pt-2">
              <button
                onClick={handleResetSystem}
                className="px-5 py-2.5 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white font-bold rounded-xl text-xs transition-all border border-amber-500/30 flex items-center shadow-sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset System State to Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Logical Data Models */}
      {activeTab === 'DataModels' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
                  <Database className="w-4 h-4 mr-2 text-indigo-400" /> Logical OS Data Entities (14 Models)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Structured entity schemas currently managed in reactive state & localStorage, ready for backend integration in the final phase.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="min-w-full divide-y divide-slate-800 text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Entity / Model</th>
                    <th className="px-4 py-3">Subsystem Description</th>
                    <th className="px-4 py-3 font-mono">Attributes & Fields</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {SCHEMA_MODELS_METADATA.map((model) => (
                    <tr key={model.table} className="hover:bg-slate-900/60">
                      <td className="px-4 py-2.5 font-mono font-bold text-indigo-400">{model.table}</td>
                      <td className="px-4 py-2.5 text-slate-300">{model.description}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-400 text-[11px]">{model.fields}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Architecture & Phase 2 Roadmap */}
      {activeTab === 'Architecture' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <Server className="w-4 h-4 mr-2 text-indigo-400" /> Service Layer Architecture & Project Phases
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              The project is built with clean separation of concerns. UI components interact exclusively with the service abstraction layer (<code>api.js</code> and <code>osService.js</code>).
            </p>
          </div>

          {/* Architecture diagram */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-indigo-300 uppercase font-mono">Layer 1: UI Presentation (React)</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                React components, Tailwind CSS dark theme layout, Gantt chart, RAG graph, memory visualizer, and live modal inspectors.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-emerald-300 uppercase font-mono">Layer 2: Service / Simulation Engine</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <code>osService.js</code> and <code>api.js</code> coordinating process creation, scheduling, memory partitions, and logging in localStorage.
              </p>
            </div>
          </div>

          {/* Phase Roadmap */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" /> Development Roadmap
            </h3>
            <div className="space-y-2">
              {PHASE_2_ROADMAP.map((item, i) => (
                <div key={i} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{item.title}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{item.details}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase shrink-0 ml-4 ${
                    item.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {item.phase}: {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
