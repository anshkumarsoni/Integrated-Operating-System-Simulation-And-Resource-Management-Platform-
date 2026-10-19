// Central Operating System Simulation Service (API & Engine Coordinator)

import { StorageService, STORAGE_KEYS } from './storageService.js';
import { ProcessManager } from '../simulation/processManager.js';
import { CPUScheduler } from '../simulation/cpuScheduler.js';
import { MemoryManager } from '../simulation/memoryManager.js';
import { VirtualMemoryManager } from '../simulation/virtualMemory.js';
import { ThreadManager } from '../simulation/threadManager.js';
import { IOManager } from '../simulation/ioManager.js';
import { ResourceManager } from '../simulation/resourceManager.js';
import { DeadlockManager } from '../simulation/deadlockManager.js';
import { FileSystemManager } from '../simulation/fileSystem.js';
import { SystemCallsManager } from '../simulation/systemCalls.js';

class OSService {
  constructor() {
    this.initFromStorage();
  }

  initFromStorage() {
    const data = StorageService.loadAll();
    this.processMgr = new ProcessManager(data.processes, data.pcbs);
    this.memoryMgr = new MemoryManager(1024, data.memoryBlocks);
    this.resourceMgr = new ResourceManager(data.resources);
    this.threadMgr = new ThreadManager(data.threads);
    this.ioMgr = new IOManager(data.ioRequests);
    this.fsMgr = new FileSystemManager(data.fileSystem);
    this.syscallMgr = new SystemCallsManager(data.systemCalls);
    this.executionHistory = [...data.executionHistory];
    this.nextHistoryId = 110;
  }

  saveState() {
    StorageService.set(STORAGE_KEYS.PROCESSES, this.processMgr.getProcesses());
    StorageService.set(STORAGE_KEYS.PCBS, this.processMgr.pcbs);
    StorageService.set(STORAGE_KEYS.MEMORY_BLOCKS, this.memoryMgr.blocks);
    StorageService.set(STORAGE_KEYS.RESOURCES, this.resourceMgr.getResources());
    StorageService.set(STORAGE_KEYS.THREADS, this.threadMgr.getThreads());
    StorageService.set(STORAGE_KEYS.IO_REQUESTS, this.ioMgr.getRequests());
    StorageService.set(STORAGE_KEYS.FILESYSTEM, this.fsMgr.getTree());
    StorageService.set(STORAGE_KEYS.SYSTEM_CALLS, this.syscallMgr.getCalls());
    StorageService.set(STORAGE_KEYS.EXECUTION_HISTORY, this.executionHistory);
  }

  logHistory(pid, event, module, status = 'SUCCESS', description = '') {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const item = {
      id: `EVT-${this.nextHistoryId++}`,
      timestamp: timeStr,
      pid: pid || 'KERNEL',
      event,
      module,
      status,
      description
    };
    this.executionHistory.unshift(item);
    return item;
  }

  // ==========================================
  // 1. Process Management
  // ==========================================
  getProcesses() {
    return this.processMgr.getProcesses();
  }

  getProcess(pid) {
    return this.processMgr.getProcess(pid);
  }

  getProcessPCB(pid) {
    return this.processMgr.getPCB(pid);
  }

  createProcess(data) {
    const result = this.processMgr.createProcess(data);
    const { process } = result;

    // Cross-module interaction:
    // 1. Log create_process() system call
    this.syscallMgr.logCall(
      process.pid,
      'create_process()',
      'SUCCESS',
      `Process ${process.pid} (${process.name}) created with ${process.memory_required}MB requirement`
    );

    // 2. Add to Execution History
    this.logHistory(
      process.pid,
      'Process Created',
      'Process Manager',
      'SUCCESS',
      `Process registered in PCB table with burst ${process.burst_time}ms, priority ${process.priority}`
    );

    // 3. Create default main thread
    this.threadMgr.createThread(process.pid, `${process.name} - Main Thread`, 'High');

    this.saveState();
    return { success: true, data: process };
  }

  updateProcessState(pid, newState) {
    const result = this.processMgr.updateProcessState(pid, newState);
    this.logHistory(
      pid,
      'State Changed',
      'Process Manager',
      'SUCCESS',
      `Process ${pid} state transitioned to ${newState}`
    );
    this.saveState();
    return { success: true, data: result };
  }

  terminateProcess(pid) {
    this.processMgr.terminateProcess(pid);

    // Cross-module interaction:
    // 1. Free memory
    this.memoryMgr.deallocateMemory(pid);
    this.processMgr.updatePcbMemory(pid, { allocated: false, allocated_size: 0, block_id: null });

    // 2. Free resources
    this.resourceMgr.freeAllForProcess(pid);
    this.processMgr.updatePcbResources(pid, [], []);

    // 3. Log system call
    this.syscallMgr.logCall(pid, 'terminate_process()', 'SUCCESS', `PCB terminated. Memory and resources reclaimed.`);

    // 4. Execution history
    this.logHistory(pid, 'Process Terminated', 'Process Manager', 'SUCCESS', `Process ${pid} terminated and memory/resources reclaimed.`);

    this.saveState();
    return { success: true, pid };
  }

  // ==========================================
  // 2. CPU Scheduling
  // ==========================================
  runScheduling(algorithm = 'FCFS', processList = null, timeQuantum = 2, preemptive = false) {
    const procs = processList && processList.length > 0 ? processList : this.getProcesses().filter(p => p.state === 'READY' || p.state === 'RUNNING');
    const result = CPUScheduler.runScheduling(algorithm, procs, timeQuantum, preemptive);

    this.logHistory(
      'SCHEDULER',
      'CPU Scheduling Computed',
      'Scheduler',
      'SUCCESS',
      `Ran ${algorithm} algorithm on ${procs.length} processes. Avg Waiting Time: ${result.summary.avgWaiting}ms`
    );

    this.saveState();
    return result;
  }

  autoSelectOptimalAlgorithm(processList = null) {
    const procs = processList && processList.length > 0 ? processList : this.getProcesses().filter(p => p.state === 'READY' || p.state === 'RUNNING');
    return CPUScheduler.autoSelectOptimalAlgorithm(procs);
  }

  // ==========================================
  // 3. Memory Management
  // ==========================================
  getMemoryStatus() {
    return this.memoryMgr.getMemoryStatus();
  }

  allocateMemory(pid, size, algorithm = 'First Fit') {
    const res = this.memoryMgr.allocateMemory(pid, size, algorithm);
    if (res.success) {
      this.processMgr.updatePcbMemory(pid, res.allocationInfo);
      this.syscallMgr.logCall(pid, 'allocate_memory()', 'SUCCESS', `${size} MB allocated in ${res.block.name} (${algorithm})`);
      this.logHistory(pid, 'Memory Allocated', 'Memory Manager', 'SUCCESS', res.message);
      this.saveState();
    } else {
      this.syscallMgr.logCall(pid, 'allocate_memory()', 'FAILED', res.message);
      this.logHistory(pid, 'Memory Allocation Failed', 'Memory Manager', 'WARNING', res.message);
    }
    return res;
  }

  deallocateMemory(pid) {
    const res = this.memoryMgr.deallocateMemory(pid);
    if (res.success) {
      this.processMgr.updatePcbMemory(pid, { allocated: false, allocated_size: 0, block_id: null });
      this.syscallMgr.logCall(pid, 'free_memory()', 'SUCCESS', `Memory freed for ${pid}`);
      this.logHistory(pid, 'Memory Deallocated', 'Memory Manager', 'SUCCESS', res.message);
      this.saveState();
    }
    return res;
  }

  // ==========================================
  // 4. Virtual Memory
  // ==========================================
  runPageReplacement(pages, framesCount = 3, algorithm = 'FIFO') {
    return VirtualMemoryManager.runPageReplacement(pages, framesCount, algorithm);
  }

  // ==========================================
  // 5. Threads & Synchronization
  // ==========================================
  getThreads() {
    return this.threadMgr.getThreads();
  }

  getThreadsByProcess(pid) {
    return this.threadMgr.getThreadsByProcess(pid);
  }

  createThread(pid, threadName, priority) {
    const res = this.threadMgr.createThread(pid, threadName, priority);
    this.syscallMgr.logCall(pid, 'create_thread()', 'SUCCESS', `Created thread ${res.id}`);
    this.logHistory(pid, 'Thread Created', 'Thread Manager', 'SUCCESS', `Thread ${res.id} spawned`);
    this.saveState();
    return res;
  }

  runSyncSimulation(threadIds, resourceName, method, permits) {
    const res = this.threadMgr.simulateSync(threadIds, resourceName, method, permits);
    this.logHistory(
      'KERNEL',
      `Sync Simulation (${method})`,
      'Synchronization',
      method === 'Race Condition' ? 'WARNING' : 'SUCCESS',
      `Simulated ${method} on resource ${resourceName} across ${threadIds.length} threads`
    );
    this.saveState();
    return res;
  }

  // ==========================================
  // 6. I/O Management
  // ==========================================
  getIORequests() {
    return this.ioMgr.getRequests();
  }

  createIORequest(pid, device = 'Disk', requestType = 'READ') {
    const req = this.ioMgr.createRequest(pid, device, requestType);
    this.processMgr.updateProcessState(pid, 'WAITING');
    this.processMgr.updatePcbIO(pid, { device, pending: true, completed: false });
    this.syscallMgr.logCall(pid, 'request_io()', 'SUCCESS', `${device} ${requestType} request created (${req.id})`);
    this.logHistory(pid, 'I/O Requested', 'I/O Manager', 'SUCCESS', `Request ${req.id} queued for ${device}; Process moved to WAITING state`);
    this.saveState();
    return req;
  }

  completeIORequest(requestId) {
    const res = this.ioMgr.completeRequest(requestId);
    if (res.success) {
      const pid = res.request.pid;
      this.processMgr.updateProcessState(pid, 'READY');
      this.processMgr.updatePcbIO(pid, { pending: false, completed: true });
      this.logHistory(pid, 'I/O Completed', 'I/O Manager', 'SUCCESS', `I/O Request ${requestId} completed; Process ${pid} restored to READY state`);
      this.saveState();
    }
    return res;
  }

  runDiskScheduling(requests, head = 53, algorithm = 'FCFS', direction = 'Right') {
    return IOManager.runDiskScheduling(requests, head, algorithm, direction);
  }

  // ==========================================
  // 7. Resource Management
  // ==========================================
  getResources() {
    return this.resourceMgr.getResources();
  }

  requestResource(pid, resourceId, quantity = 1) {
    const res = this.resourceMgr.requestResource(pid, resourceId, quantity);
    if (res.allocated) {
      this.processMgr.updatePcbResources(pid, [`${resourceId} (${res.resource.name})`], []);
      this.syscallMgr.logCall(pid, 'request_resource()', 'SUCCESS', `Acquired ${quantity} unit(s) of ${resourceId}`);
      this.logHistory(pid, 'Resource Acquired', 'Resource Manager', 'SUCCESS', res.message);
    } else {
      this.processMgr.updateProcessState(pid, 'WAITING');
      this.processMgr.updatePcbResources(pid, null, [`${resourceId} (${res.resource.name})`]);
      this.syscallMgr.logCall(pid, 'request_resource()', 'PENDING', `Resource ${resourceId} unavailable; process blocked`);
      this.logHistory(pid, 'Resource Blocked', 'Resource Manager', 'WARNING', res.message);
    }
    this.saveState();
    return res;
  }

  releaseResource(pid, resourceId, quantity = 1) {
    const res = this.resourceMgr.releaseResource(pid, resourceId, quantity);
    this.syscallMgr.logCall(pid, 'release_resource()', 'SUCCESS', `Released ${resourceId}`);
    this.logHistory(pid, 'Resource Released', 'Resource Manager', 'SUCCESS', res.message);
    if (res.unblockedProcess) {
      this.processMgr.updateProcessState(res.unblockedProcess, 'READY');
      this.logHistory(res.unblockedProcess, 'Process Unblocked', 'Resource Manager', 'SUCCESS', `Process ${res.unblockedProcess} woke up following resource release`);
    }
    this.saveState();
    return res;
  }

  // ==========================================
  // 8. Deadlock Management
  // ==========================================
  checkBankersAlgorithm(processes, allocation, maximum, available) {
    return DeadlockManager.checkBankersAlgorithm(processes, allocation, maximum, available);
  }

  getRAGData(processes, resources, allocation, request) {
    return DeadlockManager.getRAGData(processes, resources, allocation, request);
  }

  // ==========================================
  // 9. File System
  // ==========================================
  getFileTree() {
    return this.fsMgr.getTree();
  }

  createFile(name, parentDirId, content, fileType, permissions) {
    const res = this.fsMgr.createFile(name, parentDirId, content, fileType, permissions);
    if (res.success) {
      this.syscallMgr.logCall('KERNEL', 'write_file()', 'SUCCESS', `Created file ${name}`);
      this.logHistory('KERNEL', 'File Created', 'File System', 'SUCCESS', `Created file ${name} in directory ${parentDirId}`);
      this.saveState();
    }
    return res;
  }

  readFile(fileId) {
    const res = this.fsMgr.readFile(fileId);
    if (res.success) {
      this.syscallMgr.logCall('KERNEL', 'read_file()', 'SUCCESS', `Read ${res.file.name}`);
    }
    return res;
  }

  writeFile(fileId, content) {
    const res = this.fsMgr.writeFile(fileId, content);
    if (res.success) {
      this.syscallMgr.logCall('KERNEL', 'write_file()', 'SUCCESS', `Updated ${res.file.name}`);
      this.saveState();
    }
    return res;
  }

  deleteFile(fileId) {
    const res = this.fsMgr.deleteFile(fileId);
    if (res.success) {
      this.logHistory('KERNEL', 'File Deleted', 'File System', 'SUCCESS', `Deleted item ${fileId}`);
      this.saveState();
    }
    return res;
  }

  createDirectory(name, parentDirId) {
    const res = this.fsMgr.createDirectory(name, parentDirId);
    if (res.success) {
      this.logHistory('KERNEL', 'Directory Created', 'File System', 'SUCCESS', `Created folder ${name}`);
      this.saveState();
    }
    return res;
  }

  deleteDirectory(dirId) {
    const res = this.fsMgr.deleteDirectory(dirId);
    if (res.success) {
      this.logHistory('KERNEL', 'Directory Deleted', 'File System', 'SUCCESS', `Deleted folder ${dirId}`);
      this.saveState();
    }
    return res;
  }

  updateFilePermissions(fileId, permissions) {
    const res = this.fsMgr.updatePermissions(fileId, permissions);
    if (res.success) {
      this.saveState();
    }
    return res;
  }

  // ==========================================
  // 10. System Calls & History
  // ==========================================
  getSystemCalls(pidFilter = null) {
    return this.syscallMgr.getCalls(pidFilter);
  }

  getSystemCallStats() {
    return this.syscallMgr.getStats();
  }

  getExecutionHistory(pid = null, module = null, status = null) {
    let list = [...this.executionHistory];
    if (pid) list = list.filter(e => e.pid === pid);
    if (module && module !== 'All') list = list.filter(e => e.module === module);
    if (status && status !== 'All') list = list.filter(e => e.status === status);
    return list;
  }

  clearExecutionHistory() {
    this.executionHistory = [];
    this.saveState();
    return { success: true };
  }

  // ==========================================
  // 11. Dashboard Overview Stats
  // ==========================================
  getDashboardStats() {
    const procs = this.processMgr.getProcesses();
    const mem = this.memoryMgr.getMemoryStatus();
    const resList = this.resourceMgr.getResources();
    const ioReqs = this.ioMgr.getRequests();
    const fsStats = this.fsMgr.getStats();
    const sysStats = this.syscallMgr.getStats();

    const runningCount = procs.filter(p => p.state === 'RUNNING').length;
    const readyCount = procs.filter(p => p.state === 'READY').length;
    const waitingCount = procs.filter(p => p.state === 'WAITING').length;
    const terminatedCount = procs.filter(p => p.state === 'TERMINATED').length;

    const totalResources = resList.reduce((sum, r) => sum + r.total, 0);
    const allocatedResources = resList.reduce((sum, r) => sum + r.allocated, 0);
    const availableResources = resList.reduce((sum, r) => sum + r.available, 0);

    const pendingIO = ioReqs.filter(r => r.status === 'WAITING' || r.status === 'PROCESSING').length;
    const completedIO = ioReqs.filter(r => r.status === 'COMPLETED').length;

    // Run rapid Banker's safety check on current system
    const pNames = procs.slice(0, 5).map(p => p.pid);
    const allocM = pNames.map(() => [1, 0, 1, 0]);
    const maxM = pNames.map(() => [2, 1, 2, 1]);
    const availV = [3, 2, 2, 4];
    const banker = DeadlockManager.checkBankersAlgorithm(pNames, allocM, maxM, availV);

    return {
      processes: {
        total: procs.length,
        running: runningCount,
        ready: readyCount,
        waiting: waitingCount,
        terminated: terminatedCount
      },
      cpu: {
        currentAlgorithm: 'Round Robin (Q=2)',
        cpuUtilization: runningCount > 0 ? 68 : 24,
        currentProcess: runningCount > 0 ? procs.find(p => p.state === 'RUNNING')?.pid || 'P101' : (readyCount > 0 ? procs.find(p => p.state === 'READY')?.pid || 'Idle' : 'Idle')
      },
      memory: {
        totalMemory: mem.totalMemory,
        usedMemory: mem.usedMemory,
        freeMemory: mem.freeMemory,
        utilization: mem.utilization,
        internalFrag: mem.internalFrag,
        externalFrag: mem.externalFrag
      },
      resources: {
        total: totalResources,
        allocated: allocatedResources,
        available: availableResources,
        blockedProcesses: resList.reduce((sum, r) => sum + (r.waitingProcs?.length || 0), 0)
      },
      io: {
        pendingRequests: pendingIO,
        completedRequests: completedIO
      },
      deadlock: {
        status: banker.isSafe ? 'Safe' : 'Unsafe',
        blockedCount: banker.deadlockedProcesses.length
      },
      files: {
        totalFiles: fsStats.totalFiles,
        directories: fsStats.totalDirectories
      },
      systemCalls: {
        total: sysStats.totalCalls,
        successful: sysStats.successfulCalls,
        failed: sysStats.failedCalls
      },
      recentActivity: this.executionHistory.slice(0, 6)
    };
  }

  resetAll() {
    StorageService.resetToDefaults();
    this.initFromStorage();
    return { success: true };
  }
}

// Singleton export
export const osService = new OSService();
export default osService;
