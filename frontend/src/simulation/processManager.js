// Process Manager Simulation Module

export class ProcessManager {
  constructor(initialProcesses = [], initialPcbs = {}) {
    this.processes = [...initialProcesses];
    this.pcbs = { ...initialPcbs };
    this.nextPidNumber = 106;
  }

  getProcesses() {
    return [...this.processes];
  }

  getProcess(pid) {
    return this.processes.find(p => p.pid === pid) || null;
  }

  getPCB(pid) {
    if (this.pcbs[pid]) {
      return { ...this.pcbs[pid] };
    }
    const proc = this.getProcess(pid);
    if (!proc) return null;

    // Synthesize PCB if missing
    return {
      pid: proc.pid,
      process_name: proc.name,
      state: proc.state,
      arrival_time: proc.arrival_time || 0,
      burst_time: proc.burst_time || 10,
      priority: proc.priority || 5,
      program_counter: '0x0040' + Math.floor(1000 + Math.random() * 9000).toString(16),
      cpu_registers: {
        EAX: '0x00000000',
        EBX: '0x0000' + Math.floor(1000 + Math.random() * 8000).toString(16),
        ECX: '0x0000000' + (proc.burst_time || 5).toString(16),
        EDX: '0x00000000'
      },
      memory_allocation: {
        base_address: '0x00000000',
        limit: '0x00000000',
        allocated_size: proc.memory_required || 100,
        allocated: false,
        block_id: null
      },
      pages: [],
      io_status: { device: proc.io_required ? 'Disk' : 'None', pending: false, completed: false },
      resources_held: proc.resource_required && proc.resource_required !== 'None' ? [] : [],
      resources_requested: [],
      thread_count: 1,
      creation_time: Date.now()
    };
  }

  createProcess({ name, arrival_time = 0, burst_time = 10, priority = 5, memory_required = 100, io_required = false, resource_required = 'None' }) {
    const pid = `P${this.nextPidNumber++}`;
    const newProcess = {
      pid,
      name: name || `Process ${pid}`,
      state: 'READY',
      arrival_time: Number(arrival_time) || 0,
      burst_time: Number(burst_time) || 10,
      priority: Number(priority) || 5,
      memory_required: Number(memory_required) || 100,
      cpu_time_used: 0,
      io_required: Boolean(io_required),
      resource_required: resource_required || 'None'
    };

    const newPcb = {
      pid,
      process_name: newProcess.name,
      state: 'READY',
      arrival_time: newProcess.arrival_time,
      burst_time: newProcess.burst_time,
      priority: newProcess.priority,
      program_counter: '0x0040' + Math.floor(1000 + Math.random() * 9000).toString(16),
      cpu_registers: {
        EAX: '0x00000000',
        EBX: '0x0000' + Math.floor(1000 + Math.random() * 8000).toString(16),
        ECX: '0x0000000' + newProcess.burst_time.toString(16),
        EDX: '0x00000000'
      },
      memory_allocation: {
        base_address: '0x00000000',
        limit: '0x00000000',
        allocated_size: newProcess.memory_required,
        allocated: false,
        block_id: null
      },
      pages: [],
      io_status: { device: io_required ? 'Disk' : 'None', pending: false, completed: false },
      resources_held: [],
      resources_requested: resource_required && resource_required !== 'None' ? [resource_required] : [],
      thread_count: 1,
      creation_time: Date.now()
    };

    this.processes.push(newProcess);
    this.pcbs[pid] = newPcb;

    return { process: newProcess, pcb: newPcb };
  }

  updateProcessState(pid, newState) {
    const proc = this.processes.find(p => p.pid === pid);
    if (proc) {
      proc.state = newState;
    }
    if (this.pcbs[pid]) {
      this.pcbs[pid].state = newState;
    }
    return { process: proc, pcb: this.pcbs[pid] };
  }

  terminateProcess(pid) {
    this.updateProcessState(pid, 'TERMINATED');
    return { pid, state: 'TERMINATED' };
  }

  deleteProcess(pid) {
    this.processes = this.processes.filter(p => p.pid !== pid);
    delete this.pcbs[pid];
    return { pid, deleted: true };
  }

  updatePcbMemory(pid, memoryInfo) {
    if (this.pcbs[pid]) {
      this.pcbs[pid].memory_allocation = {
        ...this.pcbs[pid].memory_allocation,
        ...memoryInfo
      };
      if (memoryInfo.pages) {
        this.pcbs[pid].pages = memoryInfo.pages;
      }
    }
  }

  updatePcbResources(pid, heldResources, requestedResources) {
    if (this.pcbs[pid]) {
      if (heldResources) this.pcbs[pid].resources_held = heldResources;
      if (requestedResources) this.pcbs[pid].resources_requested = requestedResources;
    }
  }

  updatePcbIO(pid, ioStatus) {
    if (this.pcbs[pid]) {
      this.pcbs[pid].io_status = { ...this.pcbs[pid].io_status, ...ioStatus };
    }
  }
}
