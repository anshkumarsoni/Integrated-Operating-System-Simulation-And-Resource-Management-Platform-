// Service / API Abstraction Layer
// Routes requests to the in-browser OS simulation engine (osService)
// Prepared with defined MySQL 8.0+ schemas for future relational database connectivity.

import { osService } from '../services/osService.js';
import { StorageService } from '../services/storageService.js';

// Auth
export const auth = {
  login: async (username, password) => {
    const user = StorageService.findUser(username);
    if (user && user.password === password) {
      const { password: _, ...userSafe } = user;
      return { success: true, user: userSafe };
    }
    return { 
      success: false, 
      message: 'Invalid username or password. Check credentials or register a new user account.' 
    };
  },
  register: async (userData) => {
    const result = StorageService.registerUser(userData);
    if (result.success) {
      const { password: _, ...userSafe } = result.user;
      return { success: true, user: userSafe };
    }
    return result;
  },
  getUsers: async () => {
    const users = StorageService.getUsers();
    return users.map(({ password: _, ...safe }) => safe);
  },
  logout: async () => ({ success: true })
};

// Processes
export const processes = {
  getProcesses: async () => osService.getProcesses(),
  createProcess: async (data) => osService.createProcess(data),
  getProcess: async (pid) => osService.getProcess(pid),
  getProcessPCB: async (pid) => osService.getProcessPCB(pid),
  updateProcessState: async (pid, state) => osService.updateProcessState(pid, state),
  terminateProcess: async (pid) => osService.terminateProcess(pid)
};

// CPU Scheduling
export const scheduling = {
  runScheduling: async (algorithm, processList, timeQuantum) =>
    osService.runScheduling(algorithm, processList, timeQuantum)
};

// Memory Management
export const memory = {
  getMemoryStatus: async () => osService.getMemoryStatus(),
  allocateMemory: async (pid, size, algorithm) => osService.allocateMemory(pid, size, algorithm),
  deallocateMemory: async (pid) => osService.deallocateMemory(pid)
};

// Virtual Memory
export const virtualMemory = {
  runPageReplacement: async (pages, frames, algorithm) =>
    osService.runPageReplacement(pages, frames, algorithm)
};

// Threads
export const threads = {
  getThreads: async () => osService.getThreads(),
  getThreadsByProcess: async (pid) => osService.getThreadsByProcess(pid),
  createThread: async (pid, name, priority) => osService.createThread(pid, name, priority),
  runSyncSimulation: async (threadIds, resource, method, permits) =>
    osService.runSyncSimulation(threadIds, resource, method, permits)
};

// I/O Management
export const io = {
  getIORequests: async () => osService.getIORequests(),
  createIORequest: async (pid, device, requestType) => osService.createIORequest(pid, device, requestType),
  completeIORequest: async (requestId) => osService.completeIORequest(requestId),
  runDiskScheduling: async (requests, headPosition, algorithm, direction) =>
    osService.runDiskScheduling(requests, headPosition, algorithm, direction)
};

// Resources
export const resources = {
  getResources: async () => osService.getResources(),
  requestResource: async (pid, resourceId, quantity) => osService.requestResource(pid, resourceId, quantity),
  releaseResource: async (pid, resourceId, quantity) => osService.releaseResource(pid, resourceId, quantity)
};

// Deadlock
export const deadlock = {
  checkBankersAlgorithm: async (processList, allocation, maximum, available) =>
    osService.checkBankersAlgorithm(processList, allocation, maximum, available),
  detectDeadlock: async (processList, allocation, request, available) =>
    osService.checkBankersAlgorithm(processList, allocation, request, available),
  getRAGData: async (processList, resourceList, allocation, request) =>
    osService.getRAGData(processList, resourceList, allocation, request)
};

// File System
export const fileSystem = {
  getFileTree: async () => osService.getFileTree(),
  createFile: async (name, parentDir, content, fileType, permissions) =>
    osService.createFile(name, parentDir, content, fileType, permissions),
  readFile: async (fileId) => osService.readFile(fileId),
  writeFile: async (fileId, content) => osService.writeFile(fileId, content),
  deleteFile: async (fileId) => osService.deleteFile(fileId),
  createDirectory: async (name, parentDir) => osService.createDirectory(name, parentDir),
  deleteDirectory: async (dirId) => osService.deleteDirectory(dirId),
  updatePermissions: async (fileId, permissions) => osService.updateFilePermissions(fileId, permissions)
};

// System Calls
export const systemCalls = {
  getSystemCalls: async (pid) => osService.getSystemCalls(pid),
  getSystemCallStats: async () => osService.getSystemCallStats()
};

// Simulation & Dashboard
export const simulation = {
  getDashboardStats: async () => osService.getDashboardStats(),
  resetAll: async () => osService.resetAll()
};

// History
export const history = {
  getExecutionHistory: async (pid, module, status) =>
    osService.getExecutionHistory(pid, module, status),
  clearHistory: async () => osService.clearExecutionHistory()
};

// Export individual functions for convenient flat imports
export const getProcesses = processes.getProcesses;
export const createProcess = processes.createProcess;
export const getProcess = processes.getProcess;
export const getProcessPCB = processes.getProcessPCB;
export const updateProcessState = processes.updateProcessState;
export const terminateProcess = processes.terminateProcess;

export const runScheduling = scheduling.runScheduling;

export const getMemoryStatus = memory.getMemoryStatus;
export const allocateMemory = memory.allocateMemory;
export const deallocateMemory = memory.deallocateMemory;

export const runPageReplacement = virtualMemory.runPageReplacement;

export const getThreads = threads.getThreads;
export const getThreadsByProcess = threads.getThreadsByProcess;
export const createThread = threads.createThread;
export const runSyncSimulation = threads.runSyncSimulation;

export const getIORequests = io.getIORequests;
export const createIORequest = io.createIORequest;
export const completeIORequest = io.completeIORequest;
export const runDiskScheduling = io.runDiskScheduling;

export const getResources = resources.getResources;
export const requestResource = resources.requestResource;
export const releaseResource = resources.releaseResource;

export const checkBankersAlgorithm = deadlock.checkBankersAlgorithm;
export const detectDeadlock = deadlock.detectDeadlock;
export const getRAGData = deadlock.getRAGData;

export const getFileTree = fileSystem.getFileTree;
export const createFile = fileSystem.createFile;
export const readFile = fileSystem.readFile;
export const writeFile = fileSystem.writeFile;
export const deleteFile = fileSystem.deleteFile;
export const createDirectory = fileSystem.createDirectory;
export const deleteDirectory = fileSystem.deleteDirectory;
export const updatePermissions = fileSystem.updatePermissions;

export const getSystemCalls = systemCalls.getSystemCalls;
export const getSystemCallStats = systemCalls.getSystemCallStats;

export const getDashboardStats = simulation.getDashboardStats;
export const resetAllSimulation = simulation.resetAll;

export const getExecutionHistory = history.getExecutionHistory;
// Database (MySQL 8.4 Server Bridge)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const database = {
  getStatus: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/db/status`);
      return await res.json();
    } catch (err) {
      return { connected: false, error: 'Cannot reach backend bridge server' };
    }
  },
  testConnection: async (config) => {
    try {
      const res = await fetch(`${API_BASE}/api/db/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Bridge server unreachable. Ensure "npm run server" is running.' };
    }
  },
  connect: async (config) => {
    try {
      const res = await fetch(`${API_BASE}/api/db/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
  initSchema: async (config) => {
    try {
      const res = await fetch(`${API_BASE}/api/db/init-schema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
  executeSQL: async (sql) => {
    try {
      const res = await fetch(`${API_BASE}/api/db/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
  syncSimulation: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/api/db/sync-simulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
  getAccounts: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/db/accounts`);
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
  resetAccounts: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/db/accounts/reset`, { method: 'POST' });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
  simulateTransaction: async ({ fromId, toId, amount, simulateCrash }) => {
    try {
      const res = await fetch(`${API_BASE}/api/db/transaction/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId, toId, amount, simulateCrash })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
  explainQuery: async (sql) => {
    try {
      const res = await fetch(`${API_BASE}/api/db/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
  getViewsList: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/db/views`);
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
  getViewData: async (viewName) => {
    try {
      const res = await fetch(`${API_BASE}/api/db/views/${viewName}`);
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};

export default {
  auth, processes, scheduling, memory, virtualMemory, threads, io,
  resources, deadlock, fileSystem, systemCalls, simulation, history, database
};
