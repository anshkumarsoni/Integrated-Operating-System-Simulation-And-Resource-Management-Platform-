import React, { useState, useEffect } from 'react';
import { 
  Database, Play, Terminal, Table as TableIcon, Code2, 
  RotateCcw, CheckCircle2, AlertCircle, Clock, 
  Sparkles, Layers, ChevronRight, HardDrive, ShieldCheck, Server,
  Settings, RefreshCw, Key, Check, X, ArrowUpRight, Lock, Eye
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { osService } from '../services/osService';
import { database } from '../api/api';
import MySQLArchitectureDiagram from '../components/MySQLArchitectureDiagram';
import ACIDTransactionSimulator from '../components/dbms/ACIDTransactionSimulator';
import QueryOptimizerAnalyzer from '../components/dbms/QueryOptimizerAnalyzer';
import ConcurrencyDeadlockViewer from '../components/dbms/ConcurrencyDeadlockViewer';
import DatabaseViewsViewer from '../components/dbms/DatabaseViewsViewer';

const MYSQL_TABLE_DEFINITIONS = [
  {
    tableName: 'users',
    desc: 'User authentication credentials and academic access roles',
    engine: 'InnoDB',
    columns: [
      { name: 'id', type: 'INT AUTO_INCREMENT', pk: true, desc: 'Unique User ID' },
      { name: 'username', type: 'VARCHAR(50) UNIQUE', pk: false, desc: 'Login username' },
      { name: 'password', type: 'VARCHAR(255)', pk: false, desc: 'Hashed/Plain credential' },
      { name: 'name', type: 'VARCHAR(100)', pk: false, desc: 'Full student/admin name' },
      { name: 'role', type: 'VARCHAR(50)', pk: false, desc: 'Administrator / Student' },
      { name: 'email', type: 'VARCHAR(100)', pk: false, desc: 'Contact or Student ID' },
      { name: 'created_at', type: 'DATETIME', pk: false, desc: 'Creation timestamp' }
    ]
  },
  {
    tableName: 'processes',
    desc: 'Simulated process table with burst times, priority, and states',
    engine: 'InnoDB',
    columns: [
      { name: 'pid', type: 'VARCHAR(20)', pk: true, desc: 'Process Identifier (P101)' },
      { name: 'name', type: 'VARCHAR(100)', pk: false, desc: 'Process service name' },
      { name: 'state', type: 'ENUM(READY, RUNNING, ...)', pk: false, desc: 'Process lifecycle state' },
      { name: 'arrival_time', type: 'INT DEFAULT 0', pk: false, desc: 'Arrival in Ready Queue' },
      { name: 'burst_time', type: 'INT NOT NULL', pk: false, desc: 'CPU Burst duration (ms)' },
      { name: 'priority', type: 'INT NOT NULL', pk: false, desc: 'Scheduling Priority (1-10)' },
      { name: 'memory_required', type: 'INT (MB)', pk: false, desc: 'RAM required in MB' },
      { name: 'cpu_time_used', type: 'INT DEFAULT 0', pk: false, desc: 'Accumulated CPU time' },
      { name: 'io_required', type: 'BOOLEAN', pk: false, desc: 'I/O flag' },
      { name: 'resource_required', type: 'VARCHAR(50)', pk: false, desc: 'Resource lock dependency' }
    ]
  },
  {
    tableName: 'pcb',
    desc: 'Process Control Block entries with CPU registers and memory bounds',
    engine: 'InnoDB',
    columns: [
      { name: 'pid', type: 'VARCHAR(20)', pk: true, desc: 'Foreign key to processes.pid' },
      { name: 'process_name', type: 'VARCHAR(100)', pk: false, desc: 'Process name' },
      { name: 'state', type: 'VARCHAR(20)', pk: false, desc: 'Current state' },
      { name: 'program_counter', type: 'VARCHAR(20)', pk: false, desc: 'Hex address (0x0040...)' },
      { name: 'cpu_registers', type: 'JSON', pk: false, desc: 'EAX, EBX, ECX, EDX registers' },
      { name: 'memory_allocation', type: 'JSON', pk: false, desc: 'Base, limit, allocated block' },
      { name: 'thread_count', type: 'INT DEFAULT 1', pk: false, desc: 'Attached threads' },
      { name: 'creation_time', type: 'BIGINT', pk: false, desc: 'Epoch creation millisecond' }
    ]
  },
  {
    tableName: 'memory_allocations',
    desc: 'Simulated 1024 MB RAM physical partitions and fragmentation',
    engine: 'InnoDB',
    columns: [
      { name: 'block_id', type: 'INT', pk: true, desc: 'Block identifier (1-5)' },
      { name: 'name', type: 'VARCHAR(50)', pk: false, desc: 'Partition name (Block 1)' },
      { name: 'size_mb', type: 'INT NOT NULL', pk: false, desc: 'Total partition size in MB' },
      { name: 'start_address', type: 'INT NOT NULL', pk: false, desc: 'RAM offset address' },
      { name: 'status', type: 'ENUM(Allocated, Free)', pk: false, desc: 'Allocation status' },
      { name: 'pid', type: 'VARCHAR(20)', pk: false, desc: 'Allocated Process PID' },
      { name: 'internal_frag', type: 'INT DEFAULT 0', pk: false, desc: 'Unused space in partition' }
    ]
  },
  {
    tableName: 'resources',
    desc: 'Multi-instance hardware & software system resources (R1 - R4)',
    engine: 'InnoDB',
    columns: [
      { name: 'id', type: 'VARCHAR(20)', pk: true, desc: 'Resource ID (R1-R4)' },
      { name: 'name', type: 'VARCHAR(100)', pk: false, desc: 'Resource name (Disk, Lock)' },
      { name: 'total_instances', type: 'INT NOT NULL', pk: false, desc: 'Total available units' },
      { name: 'available_instances', type: 'INT NOT NULL', pk: false, desc: 'Free available units' },
      { name: 'allocated_instances', type: 'INT DEFAULT 0', pk: false, desc: 'Units held by processes' }
    ]
  },
  {
    tableName: 'system_calls',
    desc: 'Audit trail of user-to-kernel mode POSIX system call traps',
    engine: 'InnoDB',
    columns: [
      { name: 'id', type: 'INT AUTO_INCREMENT', pk: true, desc: 'Log ID' },
      { name: 'call_id', type: 'VARCHAR(30)', pk: false, desc: 'Unique Call Identifier' },
      { name: 'pid', type: 'VARCHAR(20)', pk: false, desc: 'Calling Process PID' },
      { name: 'call_name', type: 'VARCHAR(50)', pk: false, desc: 'Trap name (sys_fork, read)' },
      { name: 'status', type: 'VARCHAR(20)', pk: false, desc: 'SUCCESS / FAILED' },
      { name: 'description', type: 'TEXT', pk: false, desc: 'Call parameters & return value' }
    ]
  },
  {
    tableName: 'filesystem_nodes',
    desc: 'Hierarchical Inodes and directory structure',
    engine: 'InnoDB',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', pk: true, desc: 'Inode unique identifier' },
      { name: 'name', type: 'VARCHAR(100)', pk: false, desc: 'File or directory name' },
      { name: 'parent_id', type: 'VARCHAR(50)', pk: false, desc: 'Parent directory ID' },
      { name: 'type', type: 'ENUM(file, directory)', pk: false, desc: 'Node type' },
      { name: 'size_bytes', type: 'INT DEFAULT 0', pk: false, desc: 'File size in bytes' },
      { name: 'permissions', type: 'VARCHAR(10)', pk: false, desc: 'POSIX format (rwxr-xr-x)' }
    ]
  },
  {
    tableName: 'threads',
    desc: 'Lightweight execution threads per process',
    engine: 'InnoDB',
    columns: [
      { name: 'thread_id', type: 'VARCHAR(30)', pk: true, desc: 'Thread ID (T-P101-1)' },
      { name: 'pid', type: 'VARCHAR(20)', pk: false, desc: 'Parent Process PID' },
      { name: 'name', type: 'VARCHAR(100)', pk: false, desc: 'Thread descriptor' },
      { name: 'state', type: 'VARCHAR(20)', pk: false, desc: 'Ready / Running / Waiting' }
    ]
  },
  {
    tableName: 'io_requests',
    desc: 'Device request queue for secondary storage disk scheduling',
    engine: 'InnoDB',
    columns: [
      { name: 'request_id', type: 'VARCHAR(30)', pk: true, desc: 'I/O Request ID' },
      { name: 'pid', type: 'VARCHAR(20)', pk: false, desc: 'Requesting process' },
      { name: 'device', type: 'VARCHAR(50)', pk: false, desc: 'Device (Disk, Printer)' },
      { name: 'request_type', type: 'VARCHAR(20)', pk: false, desc: 'READ / WRITE' },
      { name: 'cylinder', type: 'INT', pk: false, desc: 'Target cylinder track' },
      { name: 'status', type: 'VARCHAR(20)', pk: false, desc: 'Processing / Completed' }
    ]
  },
  {
    tableName: 'execution_history',
    desc: 'Global kernel event log and simulation timeline',
    engine: 'InnoDB',
    columns: [
      { name: 'id', type: 'VARCHAR(30)', pk: true, desc: 'Event ID' },
      { name: 'timestamp', type: 'VARCHAR(30)', pk: false, desc: 'Clock time' },
      { name: 'pid', type: 'VARCHAR(20)', pk: false, desc: 'Originating process' },
      { name: 'event', type: 'VARCHAR(100)', pk: false, desc: 'Event action' },
      { name: 'module', type: 'VARCHAR(50)', pk: false, desc: 'Subsystem component' },
      { name: 'status', type: 'VARCHAR(20)', pk: false, desc: 'Execution status' }
    ]
  }
];

const SAMPLE_QUERIES = [
  {
    title: '1. All Active & Ready Processes',
    desc: 'Query processes ready for CPU scheduling',
    sql: "SELECT pid, name, state, arrival_time, burst_time, priority, memory_required FROM processes WHERE state IN ('READY', 'RUNNING');"
  },
  {
    title: '2. Process Control Block (PCB) Internals',
    desc: 'Inspect CPU registers, program counters & memory limits',
    sql: "SELECT pid, process_name, state, program_counter, cpu_registers, thread_count FROM pcb;"
  },
  {
    title: '3. RAM Memory Partition Allocations',
    desc: 'List allocated RAM blocks and internal fragmentation',
    sql: "SELECT block_id, name, size_mb, start_address, status, pid, internal_frag FROM memory_allocations;"
  },
  {
    title: '4. Relational JOIN: Processes with RAM Blocks',
    desc: 'Perform an SQL INNER JOIN between processes and memory blocks',
    sql: "SELECT p.pid, p.name AS process_name, p.state, m.name AS ram_block, m.size_mb, m.internal_frag FROM processes p JOIN memory_allocations m ON p.pid = m.pid;"
  },
  {
    title: '5. Resource Pool & Allocation Matrix',
    desc: 'Query multi-instance system resources and availability',
    sql: "SELECT id, name, total_instances, available_instances, allocated_instances FROM resources;"
  },
  {
    title: '6. Recent Kernel System Call Traps',
    desc: 'Audit trail of recent POSIX system calls',
    sql: "SELECT id, call_id, pid, call_name, status, description FROM system_calls;"
  },
  {
    title: '7. Registered OS User Accounts',
    desc: 'Security table containing academic user profiles',
    sql: "SELECT id, username, name, role, email FROM users;"
  }
];

export default function SQLDatabase() {
  const [activeTab, setActiveTab] = useState('architecture'); // 'architecture' | 'console' | 'tables'
  const [sqlQuery, setSqlQuery] = useState(SAMPLE_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState('');
  const [selectedTable, setSelectedTable] = useState(MYSQL_TABLE_DEFINITIONS[0]);

  // Local PC MySQL Connection States
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    checking: true,
    host: 'localhost',
    port: 3306,
    user: 'root',
    database: 'os_simulation_db',
    version: null,
    tableCount: 0
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'os_simulation_db'
  });
  const [modalFeedback, setModalFeedback] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  const checkStatus = async () => {
    try {
      const res = await database.getStatus();
      if (res && res.connected) {
        setConnectionStatus({
          connected: true,
          checking: false,
          host: res.config?.host || 'localhost',
          port: res.config?.port || 3306,
          user: res.config?.user || 'root',
          database: res.database || 'os_simulation_db',
          version: res.version || 'MySQL 8.4',
          tableCount: res.tableCount || 0
        });
      } else {
        setConnectionStatus(prev => ({ ...prev, connected: false, checking: false }));
      }
    } catch (_) {
      setConnectionStatus(prev => ({ ...prev, connected: false, checking: false }));
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // In-browser SQL Evaluation against live OS State
  const executeClientSQL = (queryStr) => {
    const raw = queryStr.trim();
    const upper = raw.toUpperCase();
    const t0 = performance.now();

    // Data Sources
    const processes = osService.getProcesses() || [];
    const memoryBlocks = osService.getMemoryStatus()?.blocks || [];
    const resources = osService.getResources() || [];
    const systemCalls = osService.getSystemCalls() || [];
    const history = osService.getExecutionHistory() || [];
    const users = StorageService.getUsers() || [];
    const threads = osService.getThreads() || [];
    const ioRequests = osService.getIORequests() || [];

    // Synthesize PCB dataset
    const pcbs = processes.map(p => {
      const pcb = osService.getProcessPCB(p.pid);
      return {
        pid: p.pid,
        process_name: p.name,
        state: p.state,
        program_counter: pcb?.program_counter || '0x00401000',
        cpu_registers: JSON.stringify(pcb?.cpu_registers || { EAX: '0x00000000' }),
        memory_allocation: JSON.stringify(pcb?.memory_allocation || {}),
        thread_count: pcb?.thread_count || 1,
        creation_time: pcb?.creation_time || Date.now()
      };
    });

    let resultRows = [];
    let columns = [];

    // 1. JOIN query
    if (upper.includes('JOIN') && upper.includes('PROCESSES') && upper.includes('MEMORY_ALLOCATIONS')) {
      resultRows = processes
        .filter(p => memoryBlocks.some(m => m.pid === p.pid))
        .map(p => {
          const m = memoryBlocks.find(b => b.pid === p.pid);
          return {
            pid: p.pid,
            process_name: p.name,
            state: p.state,
            ram_block: m?.name || 'Block 1',
            size_mb: m?.size_mb || p.memory_required,
            internal_frag: m?.internal_frag || 0
          };
        });
    }
    // 2. Processes table
    else if (upper.includes('FROM PROCESSES')) {
      resultRows = processes.map(p => ({
        pid: p.pid,
        name: p.name,
        state: p.state,
        arrival_time: p.arrival_time,
        burst_time: p.burst_time,
        priority: p.priority,
        memory_required: p.memory_required,
        cpu_time_used: p.cpu_time_used || 0
      }));
      if (upper.includes("STATE IN ('READY', 'RUNNING')") || upper.includes("STATE = 'READY'")) {
        resultRows = resultRows.filter(r => r.state === 'READY' || r.state === 'RUNNING');
      }
    }
    // 3. PCB table
    else if (upper.includes('FROM PCB')) {
      resultRows = pcbs;
    }
    // 4. Memory Allocations
    else if (upper.includes('FROM MEMORY_ALLOCATIONS') || upper.includes('FROM MEMORY')) {
      resultRows = memoryBlocks.map(b => ({
        block_id: b.block_id || b.id,
        name: b.name,
        size_mb: b.size_mb,
        start_address: b.start_address || 0,
        status: b.status,
        pid: b.pid || 'Free',
        internal_frag: b.internal_frag || 0
      }));
    }
    // 5. Resources table
    else if (upper.includes('FROM RESOURCES')) {
      resultRows = resources.map(r => ({
        id: r.id,
        name: r.name,
        total_instances: r.total_instances,
        available_instances: r.available_instances,
        allocated_instances: r.allocated_instances || (r.total_instances - r.available_instances)
      }));
    }
    // 6. System Calls
    else if (upper.includes('FROM SYSTEM_CALLS')) {
      resultRows = systemCalls.map((s, idx) => ({
        id: idx + 1,
        call_id: s.callId || `SC-${100 + idx}`,
        pid: s.pid || 'KERNEL',
        call_name: s.callName || s.type || 'sys_fork()',
        status: s.status || 'SUCCESS',
        description: s.description || 'System call executed successfully'
      }));
    }
    // 7. Users table
    else if (upper.includes('FROM USERS')) {
      resultRows = users.map((u, idx) => ({
        id: idx + 1,
        username: u.username,
        name: u.name || u.username,
        role: u.role || 'Administrator',
        email: u.email || `${u.username}@os-sim.local`
      }));
    }
    // 8. Threads table
    else if (upper.includes('FROM THREADS')) {
      resultRows = threads.map(t => ({
        thread_id: t.id || t.thread_id,
        pid: t.pid,
        name: t.name,
        state: t.state || 'Ready',
        priority: t.priority || 'Medium'
      }));
    }
    // 9. I/O Requests table
    else if (upper.includes('FROM IO_REQUESTS') || upper.includes('FROM IO')) {
      resultRows = ioRequests.map(io => ({
        request_id: io.id || io.request_id,
        pid: io.pid,
        device: io.device || 'Disk',
        request_type: io.requestType || 'READ',
        cylinder: io.cylinder || 50,
        status: io.status || 'Processing'
      }));
    }
    // 10. Execution History
    else if (upper.includes('FROM EXECUTION_HISTORY') || upper.includes('FROM HISTORY')) {
      resultRows = history.map(h => ({
        id: h.id,
        timestamp: h.timestamp,
        pid: h.pid,
        event: h.event,
        module: h.module,
        status: h.status
      }));
    }
    else {
      // Generic fallback
      resultRows = processes.map(p => ({
        pid: p.pid,
        name: p.name,
        state: p.state,
        burst_time: p.burst_time,
        priority: p.priority
      }));
    }

    if (resultRows.length > 0) {
      columns = Object.keys(resultRows[0]);
    }

    const t1 = performance.now();
    const executionTimeMs = (t1 - t0).toFixed(2);

    return {
      success: true,
      query: raw,
      columns,
      data: resultRows,
      rowCount: resultRows.length,
      executionTimeMs,
      database: 'MySQL 8.0+ Dialect (In-Memory Engine)'
    };
  };

  const handleExecuteQuery = async (customQuery = null) => {
    const q = customQuery !== null ? customQuery : sqlQuery;
    if (!q || !q.trim()) return;

    setIsExecuting(true);
    setError('');

    // If connected to PC MySQL, execute via bridge API
    if (connectionStatus.connected) {
      try {
        const res = await database.executeSQL(q);
        if (res.success) {
          if (res.isQuery) {
            setQueryResult({
              success: true,
              query: q,
              columns: res.columns || [],
              data: res.rows || [],
              rowCount: res.rowCount ?? res.rows?.length ?? 0,
              executionTimeMs: res.durationMs ?? '1.20',
              database: `PC MySQL 8.4 (${connectionStatus.database || 'os_simulation_db'})`
            });
          } else {
            setQueryResult({
              success: true,
              query: q,
              columns: ['Status', 'Affected Rows', 'Info'],
              data: [{ Status: 'Success', 'Affected Rows': res.affectedRows, Info: res.message }],
              rowCount: res.affectedRows ?? 1,
              executionTimeMs: res.durationMs ?? '1.10',
              database: `PC MySQL 8.4 (${connectionStatus.database || 'os_simulation_db'})`
            });
          }
        } else {
          setError(res.error || 'SQL execution failed');
          setQueryResult(null);
        }
      } catch (err) {
        setError(err.message || 'Error communicating with MySQL bridge server');
        setQueryResult(null);
      } finally {
        setIsExecuting(false);
      }
      return;
    }

    // Otherwise fallback to client-side emulation
    try {
      const res = executeClientSQL(q);
      setQueryResult(res);
    } catch (err) {
      setError(err.message || 'Error executing query');
      setQueryResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    handleExecuteQuery(SAMPLE_QUERIES[0].sql);
  }, [connectionStatus.connected]);

  const handleSelectTable = (table) => {
    setSelectedTable(table);
    const quickSql = `SELECT * FROM ${table.tableName};`;
    setSqlQuery(quickSql);
    handleExecuteQuery(quickSql);
  };

  // MySQL Connection Actions
  const handleTestConnection = async () => {
    setIsTesting(true);
    setModalFeedback(null);
    try {
      const res = await database.testConnection(configForm);
      if (res.success) {
        setModalFeedback({
          type: 'success',
          message: `Connected successfully to ${res.version} on port ${configForm.port}! Credentials are valid.`
        });
      } else {
        setModalFeedback({
          type: 'error',
          message: res.error || 'Connection failed. Check host, port, username, and password.'
        });
      }
    } catch (err) {
      setModalFeedback({
        type: 'error',
        message: 'Could not connect. Ensure the backend bridge server is running (npm run server).'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setModalFeedback(null);
    try {
      const res = await database.connect(configForm);
      if (res.success) {
        await checkStatus();
        setModalFeedback({
          type: 'success',
          message: 'Connected to MySQL! Now using your PC database for SQL queries.'
        });
        setTimeout(() => setShowConfigModal(false), 800);
      } else {
        setModalFeedback({
          type: 'error',
          message: res.error || 'Failed to connect pool.'
        });
      }
    } catch (err) {
      setModalFeedback({
        type: 'error',
        message: err.message || 'Failed to connect to MySQL.'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInitSchema = async () => {
    setIsInitializing(true);
    setModalFeedback(null);
    try {
      const res = await database.initSchema(configForm);
      if (res.success) {
        await checkStatus();
        setModalFeedback({
          type: 'success',
          message: `Database '${res.database}' initialized with ${res.tableCount} tables and seed records!`
        });
        setTimeout(() => setShowConfigModal(false), 1200);
      } else {
        setModalFeedback({
          type: 'error',
          message: res.error || 'Failed to initialize database tables.'
        });
      }
    } catch (err) {
      setModalFeedback({
        type: 'error',
        message: err.message || 'Schema initialization failed.'
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSyncState = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const processes = osService.getProcesses() || [];
      const memoryBlocks = osService.getMemoryStatus()?.blocks || [];
      const resources = osService.getResources() || [];
      const res = await database.syncSimulation({ processes, memoryBlocks, resources });
      if (res.success) {
        setSyncFeedback('OS state synced to MySQL!');
        setTimeout(() => setSyncFeedback(null), 3000);
        handleExecuteQuery();
      }
    } catch (err) {
      setSyncFeedback('Sync failed');
      setTimeout(() => setSyncFeedback(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">MySQL Database Architecture & Schema Explorer</h1>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-3.5 h-3.5 mr-1.5" />
              MySQL 8.0+ Relational Schema
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Structured MySQL 8.0+ relational data models, schema definitions, and interactive SQL query evaluation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExecuteQuery()}
            className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Refresh State
          </button>
        </div>
      </div>

      {/* MySQL Connection Status Banner */}
      <div className={`p-4 rounded-2xl border transition-all ${
        connectionStatus.connected 
          ? 'bg-emerald-950/20 border-emerald-500/30' 
          : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className={`p-2.5 rounded-xl border ${
              connectionStatus.connected 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
            }`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  {connectionStatus.connected ? 'Connected to Local PC MySQL' : 'PC MySQL Integration'}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  connectionStatus.connected 
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' 
                    : 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${connectionStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  {connectionStatus.connected ? `MySQL ${connectionStatus.version || '8.4'} Active` : 'In-Memory Emulation'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {connectionStatus.connected 
                  ? `Live database active on ${connectionStatus.host}:${connectionStatus.port} / Schema: ${connectionStatus.database} (${connectionStatus.tableCount} tables ready)`
                  : 'MySQL 8.4 is detected on your PC. Connect with your root password to execute queries directly on your PC MySQL database.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {syncFeedback && (
              <span className="text-xs text-emerald-400 font-semibold px-2.5 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                {syncFeedback}
              </span>
            )}
            {connectionStatus.connected && (
              <button
                onClick={handleSyncState}
                disabled={isSyncing}
                className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-emerald-500/50 transition-all shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync OS State'}
              </button>
            )}
            <button
              onClick={() => {
                setModalFeedback(null);
                setShowConfigModal(true);
              }}
              className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                connectionStatus.connected
                  ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              {connectionStatus.connected ? 'Connection Config' : 'Connect to PC MySQL'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        {[
          { id: 'architecture', label: 'Architecture Model', icon: Layers },
          { id: 'console', label: 'Interactive SQL Console', icon: Terminal },
          { id: 'acid', label: 'ACID Simulator', icon: ShieldCheck },
          { id: 'optimizer', label: 'Query Optimizer (EXPLAIN)', icon: Sparkles },
          { id: 'concurrency', label: 'Concurrency & Deadlocks', icon: Lock },
          { id: 'views', label: 'Database Views', icon: Eye },
          { id: 'tables', label: `Relational Tables (${MYSQL_TABLE_DEFINITIONS.length})`, icon: TableIcon }
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

      {/* ========================================================= */}
      {/* TAB 0: SYSTEM ARCHITECTURE CHART                          */}
      {/* ========================================================= */}
      {activeTab === 'architecture' && (
        <MySQLArchitectureDiagram />
      )}

      {/* ========================================================= */}
      {/* TAB 1: INTERACTIVE SQL QUERY CONSOLE                      */}
      {/* ========================================================= */}
      {activeTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: SQL Editor & Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Editor Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">MySQL Query Editor</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Simulates MySQL 8.0+ Execution</span>
              </div>

              <div className="relative">
                <textarea
                  rows={4}
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="Enter MySQL query, e.g. SELECT * FROM processes;"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-indigo-300 font-mono text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y"
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'Enter') {
                      handleExecuteQuery();
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Tip: <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-400 font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-400 font-mono">Enter</kbd> to execute
                </span>

                <button
                  onClick={() => handleExecuteQuery()}
                  disabled={isExecuting}
                  className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/30"
                >
                  {isExecuting ? (
                    'Executing SQL...'
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 mr-1.5 fill-current" /> Run MySQL Query
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2.5 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">SQL Execution Error</p>
                  <p className="font-mono text-[11px] opacity-90">{error}</p>
                </div>
              </div>
            )}

            {/* Query Results Table */}
            {queryResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Query Results ({queryResult.rowCount} {queryResult.rowCount === 1 ? 'row' : 'rows'})
                    </span>
                  </div>
                  <span className="inline-flex items-center text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    <Clock className="w-3 h-3 mr-1 text-emerald-400" /> {queryResult.executionTimeMs} ms
                  </span>
                </div>

                {queryResult.data && queryResult.data.length > 0 ? (
                  <div className="overflow-x-auto max-h-[420px] rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-950 text-slate-400 font-semibold sticky top-0 border-b border-slate-800">
                        <tr>
                          {queryResult.columns.map((col) => (
                            <th key={col} className="p-3 font-mono text-indigo-300 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                        {queryResult.data.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            {queryResult.columns.map((col) => {
                              const val = row[col];
                              return (
                                <td key={col} className="p-3 text-slate-300 font-mono text-[11px] whitespace-nowrap max-w-[240px] truncate" title={typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}>
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '-')}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    Query executed successfully with 0 rows returned.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Col: Quick Sample OS Queries */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Preset MySQL Queries</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click any preset below to load and run sample queries:
              </p>

              <div className="space-y-2 pt-1">
                {SAMPLE_QUERIES.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSqlQuery(sq.sql);
                      handleExecuteQuery(sq.sql);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {sq.title}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{sq.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ACID TRANSACTION SIMULATOR                         */}
      {/* ========================================================= */}
      {activeTab === 'acid' && (
        <ACIDTransactionSimulator isConnected={connectionStatus.connected} />
      )}

      {/* ========================================================= */}
      {/* TAB 3: QUERY OPTIMIZER & INDEX ANALYZER                   */}
      {/* ========================================================= */}
      {activeTab === 'optimizer' && (
        <QueryOptimizerAnalyzer isConnected={connectionStatus.connected} />
      )}

      {/* ========================================================= */}
      {/* TAB 4: CONCURRENCY CONTROL & DEADLOCKS                    */}
      {/* ========================================================= */}
      {activeTab === 'concurrency' && (
        <ConcurrencyDeadlockViewer />
      )}

      {/* ========================================================= */}
      {/* TAB 5: DATABASE VIEWS & SUMMARY TABLES                    */}
      {/* ========================================================= */}
      {activeTab === 'views' && (
        <DatabaseViewsViewer isConnected={connectionStatus.connected} />
      )}

      {/* ========================================================= */}
      {/* TAB 6: SCHEMA EXPLORER & TABLE BROWSER                     */}
      {/* ========================================================= */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <TableIcon className="w-4 h-4 mr-2 text-indigo-400" /> MySQL Relational Tables
            </h2>

            <div className="space-y-1.5 pt-2">
              {MYSQL_TABLE_DEFINITIONS.map((t) => (
                <button
                  key={t.tableName}
                  onClick={() => handleSelectTable(t)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-mono transition-all border ${
                    selectedTable?.tableName === t.tableName
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center">
                    <Database className="w-3.5 h-3.5 mr-2 text-slate-500" />
                    {t.tableName}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-900 rounded-md text-[10px] text-slate-400 border border-slate-800 font-sans">
                    {t.engine}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table Details */}
          {selectedTable && (
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono flex items-center">
                    <TableIcon className="w-4 h-4 mr-2 text-indigo-400" />
                    Table: <span className="text-indigo-300 ml-1.5">{selectedTable.tableName}</span>
                    <span className="ml-2.5 text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-sans">
                      ENGINE={selectedTable.engine}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedTable.desc}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const q = `SELECT * FROM ${selectedTable.tableName};`;
                    setSqlQuery(q);
                    setActiveTab('console');
                    handleExecuteQuery(q);
                  }}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
                >
                  <Terminal className="w-3.5 h-3.5 mr-1.5" /> View Live Data
                </button>
              </div>

              {/* Column Schema Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Column Name</th>
                      <th className="p-3">MySQL Data Type</th>
                      <th className="p-3">Constraint</th>
                      <th className="p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {selectedTable.columns?.map((col) => (
                      <tr key={col.name} className="hover:bg-slate-800/30">
                        <td className="p-3 text-slate-200 font-semibold">{col.name}</td>
                        <td className="p-3 text-indigo-300">{col.type}</td>
                        <td className="p-3">
                          {col.pk ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold">
                              PRIMARY KEY
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400 text-[11px] font-sans">{col.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PC MYSQL CONNECTION & SCHEMA INITIALIZATION       */}
      {/* ========================================================= */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Connect to PC's MySQL</h3>
                  <p className="text-xs text-slate-400">Target MySQL 8.4 Server on localhost:3306</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Host</label>
                  <input
                    type="text"
                    value={configForm.host}
                    onChange={(e) => setConfigForm({ ...configForm, host: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Port</label>
                  <input
                    type="number"
                    value={configForm.port}
                    onChange={(e) => setConfigForm({ ...configForm, port: parseInt(e.target.value, 10) || 3306 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Username</label>
                  <input
                    type="text"
                    value={configForm.user}
                    onChange={(e) => setConfigForm({ ...configForm, user: e.target.value })}
                    placeholder="root"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    value={configForm.password}
                    onChange={(e) => setConfigForm({ ...configForm, password: e.target.value })}
                    placeholder="Your MySQL root password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Database Name</label>
                <input
                  type="text"
                  value={configForm.database}
                  onChange={(e) => setConfigForm({ ...configForm, database: e.target.value })}
                  placeholder="os_simulation_db"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Status/Feedback Alert */}
              {modalFeedback && (
                <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${
                  modalFeedback.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  {modalFeedback.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <p className="leading-relaxed">{modalFeedback.message}</p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1">
                <p className="font-semibold text-slate-300">💡 Step-by-Step Instructions:</p>
                <p>1. Enter your PC's MySQL root password above.</p>
                <p>2. Click <strong>"1. Test Connection"</strong> to verify credentials.</p>
                <p>3. Click <strong>"2. Initialize / Create Tables"</strong> to automatically create the database and all 10 simulation tables with seed data!</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 transition-all"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Key className="w-3.5 h-3.5 mr-1.5 text-amber-400" />}
                1. Test Connection
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleInitSchema}
                  disabled={isInitializing}
                  className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-md shadow-indigo-600/30 transition-all"
                >
                  {isInitializing ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Database className="w-3.5 h-3.5 mr-1.5" />}
                  2. Initialize & Create Tables
                </button>

                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 shadow-md shadow-emerald-600/30 transition-all"
                >
                  {isConnecting ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
