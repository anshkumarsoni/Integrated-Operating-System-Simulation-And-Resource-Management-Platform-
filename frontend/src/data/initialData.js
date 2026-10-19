// Initial seed data for the OS Simulation Platform

export const INITIAL_PROCESSES = [
  {
    pid: 'P101',
    name: 'Backup Service',
    state: 'READY',
    arrival_time: 0,
    burst_time: 12,
    priority: 3,
    memory_required: 150,
    cpu_time_used: 0,
    io_required: true,
    resource_required: 'Disk'
  },
  {
    pid: 'P102',
    name: 'File Processing Service',
    state: 'READY',
    arrival_time: 1,
    burst_time: 8,
    priority: 2,
    memory_required: 200,
    cpu_time_used: 0,
    io_required: true,
    resource_required: 'File Lock'
  },
  {
    pid: 'P103',
    name: 'Database Service',
    state: 'READY',
    arrival_time: 2,
    burst_time: 16,
    priority: 1,
    memory_required: 300,
    cpu_time_used: 0,
    io_required: false,
    resource_required: 'Database Connection'
  },
  {
    pid: 'P104',
    name: 'Report Generation',
    state: 'READY',
    arrival_time: 3,
    burst_time: 6,
    priority: 4,
    memory_required: 100,
    cpu_time_used: 0,
    io_required: true,
    resource_required: 'Printer'
  },
  {
    pid: 'P105',
    name: 'Log Processing',
    state: 'READY',
    arrival_time: 4,
    burst_time: 10,
    priority: 5,
    memory_required: 120,
    cpu_time_used: 0,
    io_required: false,
    resource_required: 'None'
  }
];

export const INITIAL_PCBS = {
  P101: {
    pid: 'P101',
    process_name: 'Backup Service',
    state: 'READY',
    arrival_time: 0,
    burst_time: 12,
    priority: 3,
    program_counter: '0x00401020',
    cpu_registers: { EAX: '0x00000000', EBX: '0x00001000', ECX: '0x0000000C', EDX: '0x00000001' },
    memory_allocation: { base_address: '0x00100000', limit: '0x00196000', allocated_size: 150, allocated: true, block_id: 3 },
    pages: [0, 1, 2, 3],
    io_status: { device: 'Disk', pending: false, completed: true },
    resources_held: ['R1 (Disk)'],
    resources_requested: [],
    thread_count: 3,
    creation_time: Date.now() - 3600000
  },
  P102: {
    pid: 'P102',
    process_name: 'File Processing Service',
    state: 'READY',
    arrival_time: 1,
    burst_time: 8,
    priority: 2,
    program_counter: '0x00402050',
    cpu_registers: { EAX: '0x00000005', EBX: '0x00002000', ECX: '0x00000008', EDX: '0x00000000' },
    memory_allocation: { base_address: '0x00200000', limit: '0x002C8000', allocated_size: 200, allocated: true, block_id: 2 },
    pages: [4, 5, 6, 7],
    io_status: { device: 'Disk', pending: true, completed: false },
    resources_held: ['R3 (File Lock)'],
    resources_requested: [],
    thread_count: 2,
    creation_time: Date.now() - 3000000
  },
  P103: {
    pid: 'P103',
    process_name: 'Database Service',
    state: 'READY',
    arrival_time: 2,
    burst_time: 16,
    priority: 1,
    program_counter: '0x00403100',
    cpu_registers: { EAX: '0x0000000A', EBX: '0x00003000', ECX: '0x00000010', EDX: '0x00000004' },
    memory_allocation: { base_address: '0x00300000', limit: '0x0042C000', allocated_size: 300, allocated: true, block_id: 4 },
    pages: [8, 9, 10, 11],
    io_status: { device: 'None', pending: false, completed: true },
    resources_held: ['R4 (Database Connection)'],
    resources_requested: [],
    thread_count: 4,
    creation_time: Date.now() - 2400000
  },
  P104: {
    pid: 'P104',
    process_name: 'Report Generation',
    state: 'READY',
    arrival_time: 3,
    burst_time: 6,
    priority: 4,
    program_counter: '0x00404010',
    cpu_registers: { EAX: '0x00000001', EBX: '0x00004000', ECX: '0x00000006', EDX: '0x00000002' },
    memory_allocation: { base_address: '0x00000000', limit: '0x00064000', allocated_size: 100, allocated: true, block_id: 1 },
    pages: [12, 13],
    io_status: { device: 'Printer', pending: false, completed: true },
    resources_held: ['R2 (Printer)'],
    resources_requested: [],
    thread_count: 2,
    creation_time: Date.now() - 1800000
  },
  P105: {
    pid: 'P105',
    process_name: 'Log Processing',
    state: 'READY',
    arrival_time: 4,
    burst_time: 10,
    priority: 5,
    program_counter: '0x00405080',
    cpu_registers: { EAX: '0x00000002', EBX: '0x00005000', ECX: '0x0000000A', EDX: '0x00000000' },
    memory_allocation: { base_address: '0x00000000', limit: '0x00000000', allocated_size: 0, allocated: false, block_id: null },
    pages: [],
    io_status: { device: 'None', pending: false, completed: false },
    resources_held: [],
    resources_requested: [],
    thread_count: 1,
    creation_time: Date.now() - 1200000
  }
};

export const INITIAL_MEMORY_BLOCKS = [
  { id: 1, name: 'Block 1', size: 100, start: 0, status: 'Allocated', pid: 'P104', internalFrag: 0 },
  { id: 2, name: 'Block 2', size: 200, start: 100, status: 'Allocated', pid: 'P102', internalFrag: 0 },
  { id: 3, name: 'Block 3', size: 150, start: 300, status: 'Allocated', pid: 'P101', internalFrag: 0 },
  { id: 4, name: 'Block 4', size: 300, start: 450, status: 'Allocated', pid: 'P103', internalFrag: 0 },
  { id: 5, name: 'Block 5', size: 274, start: 750, status: 'Free', pid: null, internalFrag: 0 }
];

export const INITIAL_RESOURCES = [
  { id: 'R1', name: 'Disk', total: 4, allocated: 1, available: 3, waitingProcs: [] },
  { id: 'R2', name: 'Printer', total: 2, allocated: 1, available: 1, waitingProcs: [] },
  { id: 'R3', name: 'File Lock', total: 3, allocated: 1, available: 2, waitingProcs: [] },
  { id: 'R4', name: 'Database Connection', total: 5, allocated: 1, available: 4, waitingProcs: [] }
];

export const INITIAL_THREADS = [
  {
    pid: 'P101',
    threads: [
      { id: 'T101-1', name: 'Backup Reader', state: 'Running', priority: 'High' },
      { id: 'T101-2', name: 'Compressor', state: 'Ready', priority: 'Medium' },
      { id: 'T101-3', name: 'Disk Writer', state: 'Waiting', priority: 'Low' }
    ]
  },
  {
    pid: 'P102',
    threads: [
      { id: 'T102-1', name: 'File Scanner', state: 'Ready', priority: 'Medium' },
      { id: 'T102-2', name: 'Parser', state: 'Ready', priority: 'High' }
    ]
  },
  {
    pid: 'P103',
    threads: [
      { id: 'T103-1', name: 'Query Listener', state: 'Running', priority: 'High' },
      { id: 'T103-2', name: 'Transaction Executor', state: 'Ready', priority: 'High' },
      { id: 'T103-3', name: 'WAL Logger', state: 'Waiting', priority: 'Medium' },
      { id: 'T103-4', name: 'Buffer Pool Cleaner', state: 'Ready', priority: 'Low' }
    ]
  }
];

export const INITIAL_IO_REQUESTS = [
  { id: 'IO-1001', pid: 'P101', device: 'Disk', requestType: 'READ', status: 'COMPLETED', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: 'IO-1002', pid: 'P102', device: 'Disk', requestType: 'WRITE', status: 'PROCESSING', timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: 'IO-1003', pid: 'P104', device: 'Printer', requestType: 'WRITE', status: 'WAITING', timestamp: new Date(Date.now() - 45000).toISOString() }
];

export const INITIAL_FILESYSTEM = [
  {
    id: 'dir-root',
    name: '/',
    type: 'directory',
    owner: 'root',
    permissions: 'rwxr-xr-x',
    parentId: null,
    created: '2026-09-01 08:00:00',
    modified: '2026-09-22 10:30:00',
    size: 4096,
    children: [
      {
        id: 'dir-docs',
        name: 'Documents',
        type: 'directory',
        owner: 'admin',
        permissions: 'rwxr-xr-x',
        parentId: 'dir-root',
        created: '2026-09-05 09:15:00',
        modified: '2026-09-20 14:22:00',
        size: 4096,
        children: [
          {
            id: 'file-report',
            name: 'report.txt',
            type: 'file',
            owner: 'admin',
            permissions: 'rw-r--r--',
            parentId: 'dir-docs',
            created: '2026-09-10 11:00:00',
            modified: '2026-09-21 16:45:00',
            size: 1420,
            content: 'Operating System Performance Report:\nCPU Utilization: Optimal (45%)\nMemory Partitioning: Active\nDeadlock Condition: Safe'
          },
          {
            id: 'file-data',
            name: 'data.txt',
            type: 'file',
            owner: 'admin',
            permissions: 'rw-rw-r--',
            parentId: 'dir-docs',
            created: '2026-09-12 13:30:00',
            modified: '2026-09-22 09:10:00',
            size: 2850,
            content: 'Process metrics raw stream:\nP101: Burst=12, Priority=3, Mem=150MB\nP102: Burst=8, Priority=2, Mem=200MB\nP103: Burst=16, Priority=1, Mem=300MB'
          }
        ]
      },
      {
        id: 'dir-backup',
        name: 'Backup',
        type: 'directory',
        owner: 'admin',
        permissions: 'rwxr-x---',
        parentId: 'dir-root',
        created: '2026-09-08 04:00:00',
        modified: '2026-09-22 03:00:00',
        size: 4096,
        children: [
          {
            id: 'file-backup-zip',
            name: 'backup.zip',
            type: 'file',
            owner: 'admin',
            permissions: 'rw-r-----',
            parentId: 'dir-backup',
            created: '2026-09-22 03:00:00',
            modified: '2026-09-22 03:05:00',
            size: 154800,
            content: '[Simulated Compressed Binary Archive - 154 KB System State Snapshot]'
          }
        ]
      },
      {
        id: 'dir-logs',
        name: 'Logs',
        type: 'directory',
        owner: 'admin',
        permissions: 'rwxrwxr-x',
        parentId: 'dir-root',
        created: '2026-09-01 08:00:00',
        modified: '2026-09-22 16:00:00',
        size: 4096,
        children: [
          {
            id: 'file-system-log',
            name: 'system.log',
            type: 'file',
            owner: 'admin',
            permissions: 'rw-r--r--',
            parentId: 'dir-logs',
            created: '2026-09-01 08:00:00',
            modified: '2026-09-22 16:25:00',
            size: 9840,
            content: '[KERNEL] Boot sequence initiated.\n[SCHED] Multilevel feedback queue initialized.\n[MEM] Paging enabled with 4KB frame size.\n[DEADLOCK] Banker safety verifier armed.'
          }
        ]
      }
    ]
  }
];

export const INITIAL_SYSTEM_CALLS = [
  { id: 'SC-001', pid: 'P101', systemCall: 'create_process()', time: '14:20:01', status: 'SUCCESS', description: 'PCB created with PID P101' },
  { id: 'SC-002', pid: 'P101', systemCall: 'allocate_memory()', time: '14:20:02', status: 'SUCCESS', description: '150 MB allocated in Block 3' },
  { id: 'SC-003', pid: 'P101', systemCall: 'request_resource()', time: '14:20:03', status: 'SUCCESS', description: 'Resource R1 (Disk) granted' },
  { id: 'SC-004', pid: 'P102', systemCall: 'create_process()', time: '14:20:04', status: 'SUCCESS', description: 'PCB created with PID P102' },
  { id: 'SC-005', pid: 'P102', systemCall: 'allocate_memory()', time: '14:20:05', status: 'SUCCESS', description: '200 MB allocated in Block 2' },
  { id: 'SC-006', pid: 'P102', systemCall: 'request_io()', time: '14:20:06', status: 'SUCCESS', description: 'Disk WRITE request created' },
  { id: 'SC-007', pid: 'P103', systemCall: 'create_process()', time: '14:20:07', status: 'SUCCESS', description: 'PCB created with PID P103' },
  { id: 'SC-008', pid: 'P103', systemCall: 'allocate_memory()', time: '14:20:08', status: 'SUCCESS', description: '300 MB allocated in Block 4' },
  { id: 'SC-009', pid: 'P104', systemCall: 'create_process()', time: '14:20:09', status: 'SUCCESS', description: 'PCB created with PID P104' },
  { id: 'SC-010', pid: 'P104', systemCall: 'allocate_memory()', time: '14:20:10', status: 'SUCCESS', description: '100 MB allocated in Block 1' }
];

export const INITIAL_EXECUTION_HISTORY = [
  { id: 'EVT-101', timestamp: '14:20:01', pid: 'P101', event: 'Process Created', module: 'Process Manager', status: 'SUCCESS', description: 'Process P101 (Backup Service) registered in PCB table' },
  { id: 'EVT-102', timestamp: '14:20:02', pid: 'P101', event: 'Memory Allocated', module: 'Memory Manager', status: 'SUCCESS', description: '150 MB partitioned in Block 3 via First Fit' },
  { id: 'EVT-103', timestamp: '14:20:03', pid: 'P101', event: 'Resource Acquired', module: 'Resource Manager', status: 'SUCCESS', description: 'Granted 1 unit of R1 (Disk)' },
  { id: 'EVT-104', timestamp: '14:20:04', pid: 'P102', event: 'Process Created', module: 'Process Manager', status: 'SUCCESS', description: 'Process P102 (File Processing Service) registered' },
  { id: 'EVT-105', timestamp: '14:20:05', pid: 'P102', event: 'Memory Allocated', module: 'Memory Manager', status: 'SUCCESS', description: '200 MB partitioned in Block 2' },
  { id: 'EVT-106', timestamp: '14:20:06', pid: 'P102', event: 'I/O Requested', module: 'I/O Manager', status: 'SUCCESS', description: 'Asynchronous WRITE request queued for Disk' },
  { id: 'EVT-107', timestamp: '14:20:07', pid: 'P103', event: 'Process Created', module: 'Process Manager', status: 'SUCCESS', description: 'Process P103 (Database Service) created' },
  { id: 'EVT-108', timestamp: '14:20:08', pid: 'P103', event: 'CPU Assigned', module: 'Scheduler', status: 'SUCCESS', description: 'Dispatched to CPU under Priority algorithm' }
];
