// Logical Data Models & Entity Definitions
// Prepared for Phase 2 integration with external database / API

export const SCHEMA_MODELS_METADATA = [
  { table: 'users', description: 'Simulated user accounts & credentials', fields: 'id, username, password, role, created_at' },
  { table: 'processes', description: 'Central process registry with scheduling attributes', fields: 'pid, name, state, arrival_time, burst_time, priority, memory_required, cpu_time_used' },
  { table: 'pcb', description: 'Process Control Block detailed state & architectural registers', fields: 'pid, process_name, state, program_counter, registers, memory_allocation, pages, io_status' },
  { table: 'threads', description: 'Thread entities executing within process address spaces', fields: 'thread_id, pid, name, state, priority, created_at' },
  { table: 'memory_allocations', description: 'Physical simulated memory block layout and fragmentation', fields: 'block_id, name, size_mb, start_address, status, pid, internal_frag' },
  { table: 'pages', description: 'Virtual memory page table entries with validity bits', fields: 'id, pid, page_number, frame_number, is_valid, last_accessed' },
  { table: 'resources', description: 'System resources (Disk, Printer, Locks, DB connections)', fields: 'resource_id, name, total_instances, allocated_instances, available_instances' },
  { table: 'resource_allocations', description: 'Process resource claims, holdings, and max matrices', fields: 'id, pid, resource_id, allocated_count, requested_count, max_demand' },
  { table: 'io_requests', description: 'I/O request queue and device driver status', fields: 'request_id, pid, device, request_type, status, created_at, completed_at' },
  { table: 'directories & files', description: 'Hierarchical virtual file system with permissions', fields: 'file_id, dir_id, name, type, size_bytes, owner, permissions, content' },
  { table: 'system_calls', description: 'Audited log of requests from userland to simulated kernel', fields: 'call_id, pid, system_call, status, description, created_at' },
  { table: 'execution_history', description: 'Unified chronological event stream across all subsystems', fields: 'id, pid, event, module, status, description, created_at' },
  { table: 'scheduling_results', description: 'History of CPU scheduling calculations and Gantt metrics', fields: 'id, algorithm, time_quantum, avg_waiting_time, cpu_utilization, gantt_chart' }
];

export const PHASE_2_ROADMAP = [
  { phase: 'Phase 1 (Current)', title: 'In-Browser OS Simulation Platform', status: 'Completed', details: 'Full reactive pure JavaScript simulation engine with localStorage persistence and interactive React dashboard.' },
  { phase: 'Phase 2 (Final Phase)', title: 'Backend REST API & Database Integration', status: 'Planned', details: 'Connecting Node.js/Python backend API with persistent relational database storage for multi-user session management.' },
  { phase: 'Phase 2 (Final Phase)', title: 'Advanced Network Simulation', status: 'Planned', details: 'Simulating distributed OS network IPC sockets, packet routing, and client-server RPC calls.' }
];
