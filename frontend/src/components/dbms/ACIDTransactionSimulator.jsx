import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, Play, RefreshCw, CheckCircle2, 
  XCircle, ArrowRight, Database, Lock, Clock, History, HelpCircle
} from 'lucide-react';
import { database } from '../../api/api';

const INITIAL_ACCOUNTS = [
  { account_id: 1, owner_name: 'Process P101 (Web Daemon)', balance: 1000.00, quota_mb: 512, status: 'ACTIVE' },
  { account_id: 2, owner_name: 'Process P102 (Database Engine)', balance: 500.00, quota_mb: 256, status: 'ACTIVE' },
  { account_id: 3, owner_name: 'Process P103 (Compiler Pool)', balance: 750.00, quota_mb: 384, status: 'ACTIVE' }
];

export default function ACIDTransactionSimulator({ isConnected }) {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [fromId, setFromId] = useState(1);
  const [toId, setToId] = useState(2);
  const [amount, setAmount] = useState(150);
  const [simulateCrash, setSimulateCrash] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [txResult, setTxResult] = useState(null);
  const [txHistory, setTxHistory] = useState([]);

  // Fetch accounts from live PC MySQL if connected
  const loadAccounts = async () => {
    if (isConnected) {
      try {
        const res = await database.getAccounts();
        if (res && res.success && Array.isArray(res.accounts)) {
          setAccounts(res.accounts);
          return;
        }
      } catch (_) {}
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [isConnected]);

  const handleResetAccounts = async () => {
    if (isConnected) {
      try {
        const res = await database.resetAccounts();
        if (res && res.success) {
          setAccounts(res.accounts);
          setTxResult(null);
          return;
        }
      } catch (_) {}
    }
    setAccounts(INITIAL_ACCOUNTS);
    setTxResult(null);
  };

  const handleRunTransaction = async () => {
    if (fromId === toId) {
      alert('Source and destination accounts must be different!');
      return;
    }
    if (amount <= 0) {
      alert('Transfer amount must be greater than 0');
      return;
    }

    setIsExecuting(true);
    setTxResult(null);

    // 1. If connected to Live MySQL, execute real backend transaction
    if (isConnected) {
      try {
        const res = await database.simulateTransaction({
          fromId,
          toId,
          amount,
          simulateCrash
        });

        if (res) {
          setTxResult(res);
          if (res.accounts) setAccounts(res.accounts);
          setTxHistory(prev => [
            {
              id: res.txId,
              status: res.status,
              from: `Account #${fromId}`,
              to: `Account #${toId}`,
              amount: `$${amount.toFixed(2)}`,
              time: `${res.durationMs || '1.2'}ms`,
              reason: res.message || res.error
            },
            ...prev.slice(0, 4)
          ]);
        }
        setIsExecuting(false);
        return;
      } catch (err) {
        console.warn('Backend tx failed, falling back to client-side ACID emulation:', err);
      }
    }

    // 2. Client-side deterministic ACID simulation fallback
    await new Promise(r => setTimeout(r, 600)); // Simulate latency
    const txId = `TX-${Date.now()}`;
    const sender = accounts.find(a => a.account_id === fromId);
    const recipient = accounts.find(a => a.account_id === toId);

    const steps = [
      { step: 'START TRANSACTION', desc: 'Acquiring transaction context and InnoDB Undo/Redo space' },
      { step: 'LOCK & READ (2PL)', desc: `SELECT balance FROM accounts WHERE account_id = ${fromId} FOR UPDATE; (Locked $${sender.balance.toFixed(2)})` }
    ];

    if (sender.balance < amount) {
      steps.push({ step: 'VALIDATION FAILED', desc: `Constraint Violation: Balance ($${sender.balance}) < Transfer ($${amount})` });
      steps.push({ step: 'ROLLBACK TRIGGERED', desc: 'ROLLBACK; -- Undoing changes. Consistency preserved.' });

      const res = {
        success: false,
        status: 'ROLLED_BACK',
        txId,
        steps,
        durationMs: '1.45',
        error: `Insufficient funds in Account #${fromId}`,
        message: 'Transaction rolled back. Consistency invariant preserved (Balance cannot be negative).'
      };
      setTxResult(res);
      setIsExecuting(false);
      return;
    }

    steps.push({ step: 'DEBIT SENDER', desc: `UPDATE accounts SET balance = balance - ${amount} WHERE account_id = ${fromId};` });

    if (simulateCrash) {
      steps.push({ step: 'CRASH INJECTED', desc: '💥 Hardware power loss / unexpected exception occurred before recipient update!' });
      steps.push({ step: 'ROLLBACK TRIGGERED', desc: 'ROLLBACK; -- Undo log safely reversed sender debit. Atomicity verified!' });

      const res = {
        success: false,
        status: 'ROLLED_BACK',
        txId,
        steps,
        durationMs: '2.10',
        error: 'Simulated Crash / Constraint Violation',
        message: 'Transaction rolled back. Atomicity guaranteed: No partial money deduction was saved.'
      };
      setTxResult(res);
      setTxHistory(prev => [
        {
          id: txId,
          status: 'ROLLED_BACK',
          from: `Account #${fromId}`,
          to: `Account #${toId}`,
          amount: `$${amount.toFixed(2)}`,
          time: '2.1ms',
          reason: 'Crash Injected (Rollback)'
        },
        ...prev.slice(0, 4)
      ]);
      setIsExecuting(false);
      return;
    }

    // Normal commit
    steps.push({ step: 'CREDIT RECIPIENT', desc: `UPDATE accounts SET balance = balance + ${amount} WHERE account_id = ${toId};` });
    steps.push({ step: 'WRITE AUDIT LOG', desc: `INSERT INTO transaction_audit_logs ('${txId}', ${fromId}, ${toId}, ${amount}, 'SUCCESS')` });
    steps.push({ step: 'COMMIT', desc: 'Flushing transaction log to InnoDB Redo Log disk buffer (Durability enforced)' });

    const newAccounts = accounts.map(a => {
      if (a.account_id === fromId) return { ...a, balance: a.balance - amount };
      if (a.account_id === toId) return { ...a, balance: a.balance + amount };
      return a;
    });

    setAccounts(newAccounts);
    const res = {
      success: true,
      status: 'COMMITTED',
      txId,
      steps,
      durationMs: '1.80',
      message: 'Transaction committed successfully. All 4 ACID properties satisfied.'
    };
    setTxResult(res);
    setTxHistory(prev => [
      {
        id: txId,
        status: 'COMMITTED',
        from: `Account #${fromId}`,
        to: `Account #${toId}`,
        amount: `$${amount.toFixed(2)}`,
        time: '1.8ms',
        reason: 'Normal Commit'
      },
      ...prev.slice(0, 4)
    ]);
    setIsExecuting(false);
  };

  const totalWealth = accounts.reduce((acc, a) => acc + parseFloat(a.balance), 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            letter: 'A',
            title: 'Atomicity',
            desc: 'All-or-nothing execution. If a crash occurs midway, ROLLBACK restores pre-tx state.',
            badge: 'Rollback Protection',
            color: 'indigo'
          },
          {
            letter: 'C',
            title: 'Consistency',
            desc: 'Preserves database invariants: Balances never drop below 0 and total capital is conserved.',
            badge: 'Invariants Maintained',
            color: 'emerald'
          },
          {
            letter: 'I',
            title: 'Isolation',
            desc: 'Row-level exclusive locks (2PL / FOR UPDATE) prevent dirty reads & concurrency clashes.',
            badge: 'Locking (2PL)',
            color: 'amber'
          },
          {
            letter: 'D',
            title: 'Durability',
            desc: 'Once committed, changes are durably persisted to MySQL disk storage via the Redo Log.',
            badge: 'InnoDB WAL',
            color: 'cyan'
          }
        ].map((prop) => (
          <div key={prop.letter} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-sm text-indigo-400 font-mono">
                {prop.letter}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
                {prop.badge}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{prop.title}</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">{prop.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Balances & Transaction Controls */}
        <div className="space-y-4">
          {/* Account Balances Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  InnoDB Account Table ({accounts.length})
                </h3>
              </div>
              <button
                onClick={handleResetAccounts}
                className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center transition-colors"
                title="Reset account balances"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Reset
              </button>
            </div>

            <div className="space-y-2.5">
              {accounts.map((acc) => (
                <div 
                  key={acc.account_id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between transition-all"
                >
                  <div>
                    <span className="text-xs font-bold text-white flex items-center">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] flex items-center justify-center mr-2">
                        {acc.account_id}
                      </span>
                      {acc.owner_name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Quota: {acc.quota_mb} MB RAM</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      ${parseFloat(acc.balance).toFixed(2)}
                    </span>
                    <div className="text-[10px] text-slate-500 uppercase">{acc.status}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total System Balance (Invariant):</span>
              <span className="font-mono font-bold text-white">${totalWealth.toFixed(2)}</span>
            </div>
          </div>

          {/* Transfer Execution Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2 text-indigo-400" /> Dispatch Transaction
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Debited Process</label>
                <select
                  value={fromId}
                  onChange={(e) => setFromId(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  {accounts.map(a => (
                    <option key={a.account_id} value={a.account_id}>Account #{a.account_id} ({a.owner_name.split(' ')[1]})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Credited Process</label>
                <select
                  value={toId}
                  onChange={(e) => setToId(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  {accounts.map(a => (
                    <option key={a.account_id} value={a.account_id}>Account #{a.account_id} ({a.owner_name.split(' ')[1]})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase text-slate-400">Transfer Amount</label>
                <span className="font-mono text-xs text-indigo-400 font-bold">${amount}</span>
              </div>
              <input
                type="range"
                min={25}
                max={500}
                step={25}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Error Injection Toggle */}
            <div className={`p-3 rounded-xl border transition-all ${
              simulateCrash 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}>
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateCrash}
                  onChange={(e) => setSimulateCrash(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold flex items-center text-white">
                    <AlertTriangle className={`w-3.5 h-3.5 mr-1 ${simulateCrash ? 'text-rose-400' : 'text-slate-500'}`} />
                    Inject Mid-Transaction System Crash
                  </span>
                  <p className="text-[10px] opacity-80 leading-normal">
                    Simulates a power loss / constraint failure right after deducting the sender. Tests whether MySQL performs an automatic ROLLBACK to preserve Atomicity.
                  </p>
                </div>
              </label>
            </div>

            <button
              onClick={handleRunTransaction}
              disabled={isExecuting}
              className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center ${
                simulateCrash
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              } disabled:opacity-50`}
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Executing Transaction...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                  {simulateCrash ? 'Run Crash & Test Rollback' : 'Execute ACID Transaction'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Live Pipeline Stepper & Telemetry */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stepper Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  InnoDB Transaction Execution Pipeline
                </h3>
              </div>
              {txResult && (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                  txResult.status === 'COMMITTED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {txResult.status === 'COMMITTED' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                  )}
                  {txResult.status} ({txResult.durationMs}ms)
                </span>
              )}
            </div>

            {txResult ? (
              <div className="space-y-3">
                <div className={`p-3.5 rounded-xl border text-xs ${
                  txResult.status === 'COMMITTED'
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                }`}>
                  <p className="font-bold">{txResult.message}</p>
                  {txResult.error && (
                    <p className="font-mono text-[11px] mt-1 opacity-90">{txResult.error}</p>
                  )}
                </div>

                {/* Step Trace */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-[11px] font-bold uppercase text-slate-400">Step-by-Step Transaction Trace:</h4>
                  {txResult.steps.map((st, i) => (
                    <div 
                      key={i} 
                      className={`p-3 rounded-xl border flex items-start space-x-3 text-xs transition-all ${
                        st.step.includes('ROLLBACK') || st.step.includes('CRASH')
                          ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                          : st.step.includes('COMMIT')
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold">{st.step}</span>
                        <p className="font-mono text-[11px] text-slate-400">{st.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <Database className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">Select accounts, configure transfer amount, and click <strong>Execute ACID Transaction</strong>.</p>
                <p className="text-[11px] text-slate-600">Toggle "Inject Crash" to observe automatic ROLLBACK restoring account balance!</p>
              </div>
            )}
          </div>

          {/* Recent Audit Log */}
          {txHistory.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Recent Transaction History
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Tx ID</th>
                      <th className="p-2.5">Route</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-[11px]">
                    {txHistory.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-800/30">
                        <td className="p-2.5 text-slate-300">{tx.id}</td>
                        <td className="p-2.5 text-indigo-300">{tx.from} &rarr; {tx.to}</td>
                        <td className="p-2.5 text-white font-bold">{tx.amount}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.status === 'COMMITTED' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-400">{tx.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
