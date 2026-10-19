// Local Storage persistence service for OS Simulation Platform

import {
  INITIAL_PROCESSES,
  INITIAL_PCBS,
  INITIAL_MEMORY_BLOCKS,
  INITIAL_RESOURCES,
  INITIAL_THREADS,
  INITIAL_IO_REQUESTS,
  INITIAL_FILESYSTEM,
  INITIAL_SYSTEM_CALLS,
  INITIAL_EXECUTION_HISTORY
} from '../data/initialData.js';

const STORAGE_KEYS = {
  PROCESSES: 'os_sim_processes',
  PCBS: 'os_sim_pcbs',
  MEMORY_BLOCKS: 'os_sim_memory_blocks',
  RESOURCES: 'os_sim_resources',
  THREADS: 'os_sim_threads',
  IO_REQUESTS: 'os_sim_io_requests',
  FILESYSTEM: 'os_sim_filesystem',
  SYSTEM_CALLS: 'os_sim_system_calls',
  EXECUTION_HISTORY: 'os_sim_execution_history',
  AUTH_USER: 'os_sim_auth_user',
  USERS: 'os_sim_registered_users',
  SETTINGS: 'os_sim_settings'
};

const DEFAULT_USERS = [
  {
    username: 'admin',
    password: 'admin123',
    name: 'System Administrator',
    role: 'Administrator',
    email: 'admin@os-sim.local',
    createdAt: new Date().toISOString()
  },
  {
    username: 'student',
    password: 'student123',
    name: 'B.Tech CSE Student',
    role: 'OS Student / Researcher',
    email: 'student@os-sim.local',
    createdAt: new Date().toISOString()
  }
];

export class StorageService {
  static get(key, defaultValue) {
    try {
      const item = localStorage.getItem(key);
      if (item === null || item === undefined) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.warn(`Failed to read ${key} from localStorage`, e);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed to save ${key} to localStorage`, e);
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Failed to remove ${key} from localStorage`, e);
    }
  }

  static loadAll() {
    return {
      processes: this.get(STORAGE_KEYS.PROCESSES, INITIAL_PROCESSES),
      pcbs: this.get(STORAGE_KEYS.PCBS, INITIAL_PCBS),
      memoryBlocks: this.get(STORAGE_KEYS.MEMORY_BLOCKS, INITIAL_MEMORY_BLOCKS),
      resources: this.get(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES),
      threads: this.get(STORAGE_KEYS.THREADS, INITIAL_THREADS),
      ioRequests: this.get(STORAGE_KEYS.IO_REQUESTS, INITIAL_IO_REQUESTS),
      fileSystem: this.get(STORAGE_KEYS.FILESYSTEM, INITIAL_FILESYSTEM),
      systemCalls: this.get(STORAGE_KEYS.SYSTEM_CALLS, INITIAL_SYSTEM_CALLS),
      executionHistory: this.get(STORAGE_KEYS.EXECUTION_HISTORY, INITIAL_EXECUTION_HISTORY),
      settings: this.get(STORAGE_KEYS.SETTINGS, { simSpeed: 1000, theme: 'dark' })
    };
  }

  static resetToDefaults() {
    this.set(STORAGE_KEYS.PROCESSES, INITIAL_PROCESSES);
    this.set(STORAGE_KEYS.PCBS, INITIAL_PCBS);
    this.set(STORAGE_KEYS.MEMORY_BLOCKS, INITIAL_MEMORY_BLOCKS);
    this.set(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    this.set(STORAGE_KEYS.THREADS, INITIAL_THREADS);
    this.set(STORAGE_KEYS.IO_REQUESTS, INITIAL_IO_REQUESTS);
    this.set(STORAGE_KEYS.FILESYSTEM, INITIAL_FILESYSTEM);
    this.set(STORAGE_KEYS.SYSTEM_CALLS, INITIAL_SYSTEM_CALLS);
    this.set(STORAGE_KEYS.EXECUTION_HISTORY, INITIAL_EXECUTION_HISTORY);
    return this.loadAll();
  }

  static getUsers() {
    return this.get(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }

  static findUser(username) {
    const users = this.getUsers();
    return users.find(u => u.username.toLowerCase() === username.trim().toLowerCase()) || null;
  }

  static registerUser({ username, password, name, role = 'OS Student / Researcher', email = '' }) {
    const users = this.getUsers();
    const existing = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (existing) {
      return { success: false, message: `Username "${username}" is already registered. Please choose another or sign in.` };
    }

    const newUser = {
      username: username.trim(),
      password: password.trim(),
      name: name?.trim() || username.trim(),
      role: role || 'OS Student / Researcher',
      email: email?.trim() || `${username.trim()}@os-sim.local`,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.set(STORAGE_KEYS.USERS, users);
    return { success: true, user: newUser };
  }

  static clearAll() {
    Object.values(STORAGE_KEYS).forEach(k => {
      if (k !== STORAGE_KEYS.AUTH_USER && k !== STORAGE_KEYS.USERS) {
        this.remove(k);
      }
    });
    return this.resetToDefaults();
  }
}

export { STORAGE_KEYS, DEFAULT_USERS };
