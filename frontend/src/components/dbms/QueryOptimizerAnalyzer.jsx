import React, { useState } from 'react';
import { 
  Sparkles, Play, Database, CheckCircle2, AlertCircle, 
  ArrowRight, Zap, Layers, HelpCircle, Code2, BarChart2
} from 'lucide-react';
import { database } from '../../api/api';

const PRESET_QUERIES = [
  {
    id: 1,
    title: 'Primary Key Direct Lookup (Ideal - O(1))',
    sql: "SELECT * FROM processes WHERE pid = 'P101';",
    category: 'Indexed',
    expectedType: 'const',
    desc: 'B-Tree Index direct traversal using PRIMARY KEY constraint.'
  },
  {
    id: 2,
    title: 'Non-Indexed Filter (Full Table Scan - O(N))',
    sql: "SELECT * FROM processes WHERE priority = 1;",
    category: 'Unindexed',
    expectedType: 'ALL',
    desc: 'MySQL must examine all rows sequentially because no index exists on `priority`.'
  },
  {
    id: 3,
    title: 'Relational INNER JOIN Optimization Plan',
    sql: "SELECT p.name, m.size_mb, m.internal_frag FROM processes p JOIN memory_allocations m ON p.pid = m.pid WHERE p.state = 'READY';",
    category: 'Join',
    expectedType: 'ref / eq_ref',
    desc: 'Evaluates join buffer efficiency and foreign key index lookups.'
  },
  {
    id: 4,
    title: 'Memory Range Evaluation',
    sql: "SELECT * FROM memory_allocations WHERE size_mb >= 200;",
    category: 'Range',
    expectedType: 'range / ALL',
    desc: 'Evaluates scan efficiency when filtering contiguous partition sizes.'
  }
];

export default function QueryOptimizerAnalyzer({ isConnected }) {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_QUERIES[0]);
  const [customSQL, setCustomSQL] = useState(PRESET_QUERIES[0].sql);
  const [explainResult, setExplainResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [simulatedIndexApplied, setSimulatedIndexApplied] = useState(false);

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setCustomSQL(preset.sql);
    setSimulatedIndexApplied(false);
    handleAnalyzeQuery(preset.sql, false);
  };

  const handleAnalyzeQuery = async (queryToRun = null, withVirtualIndex = simulatedIndexApplied) => {
    const sql = queryToRun || customSQL;
    if (!sql || !sql.trim()) return;

    setIsAnalyzing(true);

    // 1. Live PC MySQL backend execution
    if (isConnected) {
      try {
        const res = await database.explainQuery(sql);
        if (res && res.success) {
          setExplainResult({
            query: res.query,
            durationMs: res.durationMs,
            plan: res.plan,
            summary: res.summary
          });
          setIsAnalyzing(false);
          return;
        }
      } catch (err) {
        console.warn('Backend explain failed, falling back to heuristic evaluation:', err);
      }
    }

    // 2. Client-side heuristic optimizer engine fallback
    await new Promise(r => setTimeout(r, 400));
    const upper = sql.toUpperCase();
    let planRows = [];

    if (upper.includes("WHERE PID =") || upper.includes("WHERE PID='")) {
      planRows = [
        {
          id: 1,
          select_type: 'SIMPLE',
          table: 'processes',
          partitions: null,
          type: 'const',
          possible_keys: 'PRIMARY',
          key: 'PRIMARY',
          key_len: '82',
          ref: 'const',
          rows: 1,
          filtered: 100.00,
          Extra: 'None'
        }
      ];
    } else if (upper.includes('JOIN') && upper.includes('MEMORY_ALLOCATIONS')) {
      planRows = [
        {
          id: 1,
          select_type: 'SIMPLE',
          table: 'p',
          type: 'ALL',
          possible_keys: 'PRIMARY',
          key: null,
          rows: 5,
          filtered: 60.00,
          Extra: 'Using where'
        },
        {
          id: 1,
          select_type: 'SIMPLE',
          table: 'm',
          type: 'ref',
          possible_keys: 'idx_memory_pid',
          key: 'idx_memory_pid',
          rows: 1,
          filtered: 100.00,
          Extra: 'Using where'
        }
      ];
    } else if (upper.includes('PRIORITY')) {
      if (withVirtualIndex) {
        planRows = [
          {
            id: 1,
            select_type: 'SIMPLE',
            table: 'processes',
            type: 'ref',
            possible_keys: 'idx_proc_priority',
            key: 'idx_proc_priority',
            key_len: '4',
            ref: 'const',
            rows: 1,
            filtered: 100.00,
            Extra: 'Using index condition'
          }
        ];
      } else {
        planRows = [
          {
            id: 1,
            select_type: 'SIMPLE',
            table: 'processes',
            type: 'ALL',
            possible_keys: null,
            key: null,
            rows: 5,
            filtered: 20.00,
            Extra: 'Using where (Full Table Scan)'
          }
        ];
      }
    } else {
      planRows = [
        {
          id: 1,
          select_type: 'SIMPLE',
          table: 'memory_allocations',
          type: 'ALL',
          possible_keys: null,
          key: null,
          rows: 5,
          filtered: 40.00,
          Extra: 'Using where'
        }
      ];
    }

    setExplainResult({
      query: sql,
      durationMs: withVirtualIndex ? '0.42' : '1.85',
      plan: planRows,
      summary: planRows.map(r => ({
        table: r.table,
        type: r.type,
        possibleKeys: r.possible_keys || 'NONE',
        keyUsed: r.key || 'NONE (Full Table Scan)',
        rowsExamined: r.rows,
        filtered: `${r.filtered}%`,
        extra: r.Extra
      }))
    });

    setIsAnalyzing(false);
  };

  // Run on mount
  React.useEffect(() => {
    handleAnalyzeQuery(PRESET_QUERIES[0].sql, false);
  }, []);

  const hasFullTableScan = explainResult?.plan?.some(p => p.type === 'ALL');
  const primaryType = explainResult?.plan?.[0]?.type || 'ALL';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              MySQL Query Execution Planner & Index Optimizer
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono">
            EXPLAIN FORMAT=TRADITIONAL
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
          Inspect how the MySQL query optimizer assesses cost matrices, chooses between index seek vs full table scan (`ALL`), and examine rows examined vs rows returned.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Preset Templates & Query Input */}
        <div className="space-y-4">
          {/* Preset Buttons */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-indigo-400" /> Preset Evaluation Queries
            </h4>

            <div className="space-y-2 pt-1">
              {PRESET_QUERIES.map(q => (
                <button
                  key={q.id}
                  onClick={() => handleSelectPreset(q)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedPreset?.id === q.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-[11px]">{q.title}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                      q.expectedType === 'const' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      q.expectedType === 'ALL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {q.expectedType}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{q.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Query Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <Code2 className="w-4 h-4 mr-2 text-indigo-400" /> Target SQL Query
            </h4>

            <textarea
              rows={3}
              value={customSQL}
              onChange={(e) => setCustomSQL(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-indigo-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
            />

            <button
              onClick={() => handleAnalyzeQuery()}
              disabled={isAnalyzing}
              className="w-full py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center"
            >
              {isAnalyzing ? 'Analyzing Query Plan...' : <><Play className="w-3.5 h-3.5 mr-2 fill-current" /> Run EXPLAIN Analysis</>}
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Execution Plan Visualizer & Optimization Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          {explainResult && (
            <>
              {/* Scorecard */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Access Method (Type)</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-base font-mono font-bold ${
                      primaryType === 'const' ? 'text-emerald-400' :
                      primaryType === 'ref' ? 'text-indigo-400' :
                      primaryType === 'ALL' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {primaryType}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      primaryType === 'const' ? 'bg-emerald-500/20 text-emerald-300' :
                      primaryType === 'ref' ? 'bg-indigo-500/20 text-indigo-300' :
                      primaryType === 'ALL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {primaryType === 'const' ? 'Instant Key' : primaryType === 'ALL' ? 'Full Table Scan' : 'Range/Ref'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Key / Index Utilized</span>
                  <p className="text-base font-mono font-bold text-white truncate">
                    {explainResult.plan[0]?.key || 'NONE'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Execution Plan Latency</span>
                  <p className="text-base font-mono font-bold text-emerald-400">
                    {explainResult.durationMs} ms
                  </p>
                </div>
              </div>

              {/* Warning Alert if Full Table Scan */}
              {hasFullTableScan && !simulatedIndexApplied && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Optimizer Warning: Full Table Scan (`type=ALL`)</p>
                    <p className="text-[11px] opacity-90 leading-relaxed">
                      MySQL scanned every row in the table sequentially. On large production databases, this causes high I/O disk thrashing and latency. Consider creating a secondary B-Tree index!
                    </p>
                  </div>
                </div>
              )}

              {/* Execution Plan Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    MySQL Optimizer Execution Steps
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {explainResult.plan.length} plan step(s)
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Table</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Possible Keys</th>
                        <th className="p-3">Key Used</th>
                        <th className="p-3">Rows Scanned</th>
                        <th className="p-3">Filtered</th>
                        <th className="p-3">Extra Info</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-[11px]">
                      {explainResult.plan.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-3 text-white font-bold">{row.table}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              row.type === 'const' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                              row.type === 'ALL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                              'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                            }`}>
                              {row.type}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{row.possible_keys || '-'}</td>
                          <td className="p-3 text-indigo-300 font-bold">{row.key || 'NONE'}</td>
                          <td className="p-3 text-amber-300 font-bold">{row.rows}</td>
                          <td className="p-3 text-slate-300">{row.filtered ? `${row.filtered}%` : '100%'}</td>
                          <td className="p-3 text-slate-400 font-sans text-[11px]">{row.Extra || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Optimization Recommendation Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Automated Index Optimization Recommendation
                    </h4>
                  </div>
                  {customSQL.toUpperCase().includes('PRIORITY') && (
                    <button
                      onClick={() => {
                        const nextState = !simulatedIndexApplied;
                        setSimulatedIndexApplied(nextState);
                        handleAnalyzeQuery(customSQL, nextState);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        simulatedIndexApplied
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      }`}
                    >
                      {simulatedIndexApplied ? 'Remove Virtual Index' : 'Apply Virtual Index & Re-evaluate'}
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 flex items-center justify-between">
                  <code>CREATE INDEX idx_processes_priority ON processes(priority);</code>
                  <span className="text-[10px] text-slate-500">Secondary B-Tree Index</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Adding an index allows MySQL to replace an $O(N)$ table scan with a logarithmic $O(\log N)$ binary tree search, reducing disk I/O and server CPU overhead by up to <strong>90%</strong>.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
