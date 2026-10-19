// System Calls Simulation & Logger Module

export const SYSTEM_CALL_DEFINITIONS = [
  { name: 'create_process()', category: 'Process Control', description: 'Allocates a new PCB and registers process in the kernel scheduler queue' },
  { name: 'terminate_process()', category: 'Process Control', description: 'Terminates process execution and initiates memory/resource reclamation' },
  { name: 'allocate_memory()', category: 'Memory Management', description: 'Requests contiguous virtual/physical memory partition mapping' },
  { name: 'free_memory()', category: 'Memory Management', description: 'Releases assigned memory blocks back to the OS memory pool' },
  { name: 'create_thread()', category: 'Thread Control', description: 'Spawns a new thread sharing the process address space and file descriptors' },
  { name: 'request_resource()', category: 'Resource Management', description: 'Requests exclusive or shared access to an OS managed peripheral/resource' },
  { name: 'release_resource()', category: 'Resource Management', description: 'Relinquishes claimed resource back to the OS resource table' },
  { name: 'request_io()', category: 'Device Management', description: 'Enqueues an asynchronous or synchronous I/O request to the device driver' },
  { name: 'read_file()', category: 'File System', description: 'Reads data from a specified file descriptor into a buffer' },
  { name: 'write_file()', category: 'File System', description: 'Writes buffer content to a storage block via the virtual file system' }
];

export class SystemCallsManager {
  constructor(initialCalls = []) {
    this.calls = JSON.parse(JSON.stringify(initialCalls));
    this.nextCallId = 11;
  }

  getCalls(pidFilter = null) {
    if (pidFilter) {
      return this.calls.filter(c => c.pid === pidFilter);
    }
    return JSON.parse(JSON.stringify(this.calls));
  }

  logCall(pid, systemCall, status = 'SUCCESS', description = '') {
    const callId = `SC-${String(this.nextCallId++).padStart(3, '0')}`;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newCall = {
      id: callId,
      pid: pid || 'KERNEL',
      systemCall,
      time: timeStr,
      status: status || 'SUCCESS',
      description: description || `Executed ${systemCall}`
    };

    this.calls.unshift(newCall);
    return newCall;
  }

  getStats() {
    const total = this.calls.length;
    const successful = this.calls.filter(c => c.status === 'SUCCESS').length;
    const failed = this.calls.filter(c => c.status === 'FAILED').length;
    return {
      totalCalls: total,
      successfulCalls: successful,
      failedCalls: failed
    };
  }
}
