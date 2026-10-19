// Integrated Simulation Workflow Orchestrator

export const WORKFLOW_STEPS = [
  { id: 1, number: 1, title: 'Application Request', desc: 'Application invokes OS kernel API requesting system service execution' },
  { id: 2, number: 2, title: 'System Call Invocation', desc: 'Kernel intercepts request and executes create_process() system call' },
  { id: 3, number: 3, title: 'PCB Creation', desc: 'Kernel allocates Process Control Block with unique PID, CPU registers, and priority' },
  { id: 4, number: 4, title: 'Ready State Enqueue', desc: 'Process transitions to READY state and is placed into the scheduler Ready Queue' },
  { id: 5, number: 5, title: 'Memory Allocation', desc: 'Memory Manager partitions contiguous memory block using First Fit algorithm' },
  { id: 6, number: 6, title: 'CPU Scheduling Selection', desc: 'CPU Scheduler selects process based on algorithm priority and burst profile' },
  { id: 7, number: 7, title: 'Process Execution (Running)', desc: 'Dispatcher performs context switch; process enters RUNNING state on CPU core' },
  { id: 8, number: 8, title: 'I/O Request (Waiting)', desc: 'Process issues request_io() system call and transitions to WAITING state' },
  { id: 9, number: 9, title: 'Resource Manager Check', desc: 'Resource Manager verifies available instance counts for peripheral claim' },
  { id: 10, number: 10, title: 'Deadlock Safety Check', desc: "Deadlock Manager evaluates Banker's Algorithm to ensure system remains in Safe State" },
  { id: 11, number: 11, title: 'Process Completion', desc: 'I/O finishes, CPU completes remaining burst time, and task completes execution' },
  { id: 12, number: 12, title: 'Resource & Memory Release', desc: 'Memory partition and resource claims are safely released back to the OS pool' },
  { id: 13, number: 13, title: 'Process Termination', desc: 'terminate_process() invoked, PCB updated, process transitions to TERMINATED state' }
];

export const APPLICATION_PROFILES = [
  {
    id: 'backup',
    name: 'Backup Service',
    description: 'Heavy I/O operations, disk read/write requests, and memory partition locks.',
    memoryNeeded: 150,
    burstTime: 12,
    priority: 3,
    resource: 'Disk',
    resourceId: 'R1',
    ioDevice: 'Disk',
    ioType: 'READ'
  },
  {
    id: 'file',
    name: 'File Processing Service',
    description: 'File system calls, directory traversal, parser threads, and memory intensive.',
    memoryNeeded: 200,
    burstTime: 8,
    priority: 2,
    resource: 'File Lock',
    resourceId: 'R3',
    ioDevice: 'Disk',
    ioType: 'WRITE'
  },
  {
    id: 'db',
    name: 'Database Service',
    description: 'Resource locking, multi-client query concurrency, and deadlock safety evaluation.',
    memoryNeeded: 300,
    burstTime: 16,
    priority: 1,
    resource: 'Database Connection',
    resourceId: 'R4',
    ioDevice: 'Network',
    ioType: 'READ'
  },
  {
    id: 'report',
    name: 'Report Generation',
    description: 'CPU intensive calculation, round-robin time slicing, and printer output.',
    memoryNeeded: 100,
    burstTime: 6,
    priority: 4,
    resource: 'Printer',
    resourceId: 'R2',
    ioDevice: 'Printer',
    ioType: 'WRITE'
  }
];
