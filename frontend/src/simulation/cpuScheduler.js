// CPU Scheduling Algorithms Simulation Module - Ultra-Reliable & Scenario-Adaptive Engine

export const PRESET_SCENARIOS = [
  {
    id: 'WORKLOAD_REALTIME',
    title: 'Workload A: Database & Emergency Services',
    workloadType: 'Real-Time & Kernel Services',
    badge: 'Critical Priorities',
    color: 'amber',
    description: 'System services with mission-critical priority (emergency heartbeat, interrupt handlers) mixed with background worker threads.',
    processes: [
      { pid: 'P101', name: 'Background Backup', arrival_time: 0, burst_time: 12, priority: 5, state: 'READY' },
      { pid: 'P102', name: 'Emergency Heartbeat', arrival_time: 1, burst_time: 3, priority: 1, state: 'READY' },
      { pid: 'P103', name: 'Kernel Interrupt Handler', arrival_time: 3, burst_time: 2, priority: 1, state: 'READY' },
      { pid: 'P104', name: 'Disk Logger', arrival_time: 4, burst_time: 8, priority: 4, state: 'READY' },
      { pid: 'P105', name: 'Routine Telemetry', arrival_time: 5, burst_time: 6, priority: 3, state: 'READY' }
    ]
  },
  {
    id: 'WORKLOAD_VIDEO_API',
    title: 'Workload B: Video Encoding & Web API Ping',
    workloadType: 'Dynamic Mixed-Burst Queue',
    badge: 'Convoy Risk Profile',
    color: 'purple',
    description: 'A heavy 24ms video render submitted at t=0, followed immediately by rapid short API requests and auth verifications.',
    processes: [
      { pid: 'P201', name: 'Heavy Video Render', arrival_time: 0, burst_time: 24, priority: 3, state: 'READY' },
      { pid: 'P202', name: 'Fast API Ping', arrival_time: 1, burst_time: 2, priority: 3, state: 'READY' },
      { pid: 'P203', name: 'Cache Lookup', arrival_time: 2, burst_time: 3, priority: 3, state: 'READY' },
      { pid: 'P204', name: 'Auth Check', arrival_time: 3, burst_time: 2, priority: 3, state: 'READY' },
      { pid: 'P205', name: 'Sensor Telemetry', arrival_time: 4, burst_time: 2, priority: 3, state: 'READY' }
    ]
  },
  {
    id: 'WORKLOAD_BATCH_COMPILE',
    title: 'Workload C: Batch Code Compilation',
    workloadType: 'Simultaneous Batch Queue',
    badge: 'High Burst Variance',
    color: 'blue',
    description: 'Multiple batch build scripts and verification tasks submitted simultaneously at t=0 with varied compute burst lengths.',
    processes: [
      { pid: 'P301', name: 'Compilation Job', arrival_time: 0, burst_time: 18, priority: 3, state: 'READY' },
      { pid: 'P302', name: 'Quick Script A', arrival_time: 0, burst_time: 3, priority: 3, state: 'READY' },
      { pid: 'P303', name: 'Data Compression', arrival_time: 0, burst_time: 10, priority: 3, state: 'READY' },
      { pid: 'P304', name: 'Verify Checksum', arrival_time: 0, burst_time: 2, priority: 3, state: 'READY' },
      { pid: 'P305', name: 'Report Generator', arrival_time: 0, burst_time: 6, priority: 3, state: 'READY' }
    ]
  },
  {
    id: 'WORKLOAD_INTERACTIVE_DESKTOP',
    title: 'Workload D: Interactive Desktop Apps',
    workloadType: 'Multi-User Time-Sharing',
    badge: 'Interactive Sessions',
    color: 'cyan',
    description: 'Concurrent user desktop sessions and terminal shells requiring rapid interactive response latency and starvation prevention.',
    processes: [
      { pid: 'P401', name: 'Interactive Shell', arrival_time: 0, burst_time: 14, priority: 3, state: 'READY' },
      { pid: 'P402', name: 'Code Editor UI', arrival_time: 0, burst_time: 6, priority: 3, state: 'READY' },
      { pid: 'P403', name: 'Browser Tab 1', arrival_time: 1, burst_time: 18, priority: 3, state: 'READY' },
      { pid: 'P404', name: 'Music Player', arrival_time: 1, burst_time: 8, priority: 3, state: 'READY' },
      { pid: 'P405', name: 'Chat Client', arrival_time: 2, burst_time: 12, priority: 3, state: 'READY' }
    ]
  },
  {
    id: 'WORKLOAD_HOMOGENEOUS_WORKERS',
    title: 'Workload E: Homogeneous Worker Threads',
    workloadType: 'Uniform Sequential Queue',
    badge: 'Low-Overhead Batch',
    color: 'emerald',
    description: 'Sequential worker tasks of identical burst duration. Evaluates CPU throughput under zero context-switch overhead.',
    processes: [
      { pid: 'P501', name: 'Worker Task 1', arrival_time: 0, burst_time: 6, priority: 3, state: 'READY' },
      { pid: 'P502', name: 'Worker Task 2', arrival_time: 2, burst_time: 6, priority: 3, state: 'READY' },
      { pid: 'P503', name: 'Worker Task 3', arrival_time: 4, burst_time: 6, priority: 3, state: 'READY' },
      { pid: 'P504', name: 'Worker Task 4', arrival_time: 6, burst_time: 6, priority: 3, state: 'READY' },
      { pid: 'P505', name: 'Worker Task 5', arrival_time: 8, burst_time: 6, priority: 3, state: 'READY' }
    ]
  }
];

export class CPUScheduler {
  /**
   * Clean and sanitize input process objects to prevent any NaN or infinite loops
   */
  static normalizeProcessList(processList) {
    if (!Array.isArray(processList) || processList.length === 0) return [];
    
    return processList
      .filter(p => p && (p.pid !== undefined && p.pid !== null))
      .map(p => ({
        pid: String(p.pid),
        name: String(p.name || p.process_name || `Process ${p.pid}`),
        arrival: Math.max(0, Math.round(Number(p.arrival_time ?? p.arrival ?? 0)) || 0),
        burst: Math.max(1, Math.round(Number(p.burst_time ?? p.burst ?? 1)) || 1),
        priority: Math.max(1, Math.round(Number(p.priority ?? 5)) || 5)
      }));
  }

  /**
   * Run CPU Scheduling on a list of processes
   * @param {string} algorithm - 'FCFS' | 'SJF' | 'Priority' | 'Round Robin'
   * @param {Array} processList - Array of process objects { pid, name, arrival_time, burst_time, priority }
   * @param {number} timeQuantum - Round Robin time slice (default 2)
   * @param {boolean} preemptive - Preemptive flag for SJF/Priority
   */
  static runScheduling(algorithm = 'FCFS', processList = [], timeQuantum = 2, preemptive = false) {
    const procs = this.normalizeProcessList(processList);

    if (procs.length === 0) {
      return {
        gantt_data: [],
        totalTime: 0,
        metrics: [],
        summary: { avgWaiting: 0, avgTurnaround: 0, avgResponse: 0, cpuUtil: 0 }
      };
    }

    const safeQuantum = Math.max(1, Math.round(Number(timeQuantum)) || 2);

    switch (algorithm) {
      case 'FCFS':
        return this.runFCFS(procs);
      case 'SJF':
        return preemptive ? this.runSRTF(procs) : this.runSJFNonPreemptive(procs);
      case 'Priority':
        return preemptive ? this.runPriorityPreemptive(procs) : this.runPriorityNonPreemptive(procs);
      case 'Round Robin':
        return this.runRoundRobin(procs, safeQuantum);
      default:
        return this.runFCFS(procs);
    }
  }

  // 1. First-Come First-Served (FCFS)
  static runFCFS(rawProcs) {
    const procs = this.normalizeProcessList(rawProcs);
    if (procs.length === 0) return this.calculateSummary([], [], 0, 0);

    const sorted = [...procs].sort((a, b) => a.arrival - b.arrival || a.pid.localeCompare(b.pid));
    const gantt = [];
    const metrics = [];
    let currentTime = 0;
    let totalBusyTime = 0;

    for (const p of sorted) {
      if (currentTime < p.arrival) {
        currentTime = p.arrival;
      }
      const startTime = currentTime;
      const completionTime = startTime + p.burst;
      currentTime = completionTime;
      totalBusyTime += p.burst;

      gantt.push({
        pid: p.pid,
        name: p.name,
        start: startTime,
        end: completionTime
      });

      const turnaround = completionTime - p.arrival;
      const waiting = turnaround - p.burst;
      const response = startTime - p.arrival;

      metrics.push({
        pid: p.pid,
        name: p.name,
        arrival: p.arrival,
        burst: p.burst,
        priority: p.priority,
        completion: completionTime,
        turnaround: Math.max(0, turnaround),
        waiting: Math.max(0, waiting),
        response: Math.max(0, response)
      });
    }

    return this.calculateSummary(gantt, metrics, currentTime, totalBusyTime);
  }

  // 2. Shortest Job First (Non-Preemptive)
  static runSJFNonPreemptive(rawProcs) {
    const procs = this.normalizeProcessList(rawProcs);
    if (procs.length === 0) return this.calculateSummary([], [], 0, 0);

    const remaining = [...procs];
    const gantt = [];
    const metrics = [];
    let currentTime = 0;
    let totalBusyTime = 0;
    let loopGuard = remaining.length * 10;

    while (remaining.length > 0 && loopGuard-- > 0) {
      const available = remaining.filter(p => p.arrival <= currentTime);

      if (available.length === 0) {
        const nextArrival = Math.min(...remaining.map(p => p.arrival));
        currentTime = Math.max(currentTime + 1, nextArrival);
        continue;
      }

      // Pick shortest burst time, then arrival
      available.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival || a.pid.localeCompare(b.pid));
      const selected = available[0];

      const startTime = currentTime;
      const completionTime = startTime + selected.burst;
      currentTime = completionTime;
      totalBusyTime += selected.burst;

      gantt.push({
        pid: selected.pid,
        name: selected.name,
        start: startTime,
        end: completionTime
      });

      const turnaround = completionTime - selected.arrival;
      const waiting = turnaround - selected.burst;
      const response = startTime - selected.arrival;

      metrics.push({
        pid: selected.pid,
        name: selected.name,
        arrival: selected.arrival,
        burst: selected.burst,
        priority: selected.priority,
        completion: completionTime,
        turnaround: Math.max(0, turnaround),
        waiting: Math.max(0, waiting),
        response: Math.max(0, response)
      });

      const idx = remaining.findIndex(p => p.pid === selected.pid);
      if (idx !== -1) remaining.splice(idx, 1);
    }

    metrics.sort((a, b) => a.arrival - b.arrival);
    return this.calculateSummary(gantt, metrics, currentTime, totalBusyTime);
  }

  // 3. Shortest Remaining Time First (SRTF / Preemptive SJF)
  static runSRTF(rawProcs) {
    const procs = this.normalizeProcessList(rawProcs);
    if (procs.length === 0) return this.calculateSummary([], [], 0, 0);

    const n = procs.length;
    const remBurst = {};
    const firstResponse = {};
    procs.forEach(p => {
      remBurst[p.pid] = p.burst;
      firstResponse[p.pid] = -1;
    });

    let completed = 0;
    let currentTime = 0;
    let totalBusyTime = 0;
    const ganttRaw = [];
    const metricsMap = {};

    const totalBurstSum = procs.reduce((sum, p) => sum + p.burst, 0);
    const maxCycles = Math.max(5000, totalBurstSum * 10);
    let cycles = 0;

    while (completed < n && cycles++ < maxCycles) {
      const available = procs.filter(p => p.arrival <= currentTime && remBurst[p.pid] > 0);

      if (available.length === 0) {
        const uncompleted = procs.filter(p => remBurst[p.pid] > 0);
        if (uncompleted.length === 0) break;
        const nextArrival = Math.min(...uncompleted.map(p => p.arrival));
        currentTime = Math.max(currentTime + 1, nextArrival);
        continue;
      }

      available.sort((a, b) => remBurst[a.pid] - remBurst[b.pid] || a.arrival - b.arrival || a.pid.localeCompare(b.pid));
      const cur = available[0];

      if (firstResponse[cur.pid] === -1) {
        firstResponse[cur.pid] = currentTime;
      }

      ganttRaw.push({ pid: cur.pid, name: cur.name, time: currentTime });
      remBurst[cur.pid]--;
      totalBusyTime++;
      currentTime++;

      if (remBurst[cur.pid] <= 0) {
        completed++;
        const completionTime = currentTime;
        const turnaround = completionTime - cur.arrival;
        const waiting = turnaround - cur.burst;
        const response = firstResponse[cur.pid] - cur.arrival;

        metricsMap[cur.pid] = {
          pid: cur.pid,
          name: cur.name,
          arrival: cur.arrival,
          burst: cur.burst,
          priority: cur.priority,
          completion: completionTime,
          turnaround: Math.max(0, turnaround),
          waiting: Math.max(0, waiting),
          response: Math.max(0, response)
        };
      }
    }

    const compressedGantt = this.compressGantt(ganttRaw);
    const metrics = procs.map(p => metricsMap[p.pid] || {
      pid: p.pid,
      name: p.name,
      arrival: p.arrival,
      burst: p.burst,
      priority: p.priority,
      completion: currentTime,
      turnaround: currentTime - p.arrival,
      waiting: Math.max(0, currentTime - p.arrival - p.burst),
      response: 0
    });

    return this.calculateSummary(compressedGantt, metrics, currentTime, totalBusyTime);
  }

  // 4. Priority Scheduling (Non-Preemptive, Lower number = higher priority)
  static runPriorityNonPreemptive(rawProcs) {
    const procs = this.normalizeProcessList(rawProcs);
    if (procs.length === 0) return this.calculateSummary([], [], 0, 0);

    const remaining = [...procs];
    const gantt = [];
    const metrics = [];
    let currentTime = 0;
    let totalBusyTime = 0;
    let loopGuard = remaining.length * 10;

    while (remaining.length > 0 && loopGuard-- > 0) {
      const available = remaining.filter(p => p.arrival <= currentTime);

      if (available.length === 0) {
        const nextArrival = Math.min(...remaining.map(p => p.arrival));
        currentTime = Math.max(currentTime + 1, nextArrival);
        continue;
      }

      // Sort by priority asc, then arrival
      available.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival || a.pid.localeCompare(b.pid));
      const selected = available[0];

      const startTime = currentTime;
      const completionTime = startTime + selected.burst;
      currentTime = completionTime;
      totalBusyTime += selected.burst;

      gantt.push({
        pid: selected.pid,
        name: selected.name,
        start: startTime,
        end: completionTime
      });

      const turnaround = completionTime - selected.arrival;
      const waiting = turnaround - selected.burst;
      const response = startTime - selected.arrival;

      metrics.push({
        pid: selected.pid,
        name: selected.name,
        arrival: selected.arrival,
        burst: selected.burst,
        priority: selected.priority,
        completion: completionTime,
        turnaround: Math.max(0, turnaround),
        waiting: Math.max(0, waiting),
        response: Math.max(0, response)
      });

      const idx = remaining.findIndex(p => p.pid === selected.pid);
      if (idx !== -1) remaining.splice(idx, 1);
    }

    metrics.sort((a, b) => a.arrival - b.arrival);
    return this.calculateSummary(gantt, metrics, currentTime, totalBusyTime);
  }

  // 5. Priority Scheduling (Preemptive)
  static runPriorityPreemptive(rawProcs) {
    const procs = this.normalizeProcessList(rawProcs);
    if (procs.length === 0) return this.calculateSummary([], [], 0, 0);

    const n = procs.length;
    const remBurst = {};
    const firstResponse = {};
    procs.forEach(p => {
      remBurst[p.pid] = p.burst;
      firstResponse[p.pid] = -1;
    });

    let completed = 0;
    let currentTime = 0;
    let totalBusyTime = 0;
    const ganttRaw = [];
    const metricsMap = {};

    const totalBurstSum = procs.reduce((sum, p) => sum + p.burst, 0);
    const maxCycles = Math.max(5000, totalBurstSum * 10);
    let cycles = 0;

    while (completed < n && cycles++ < maxCycles) {
      const available = procs.filter(p => p.arrival <= currentTime && remBurst[p.pid] > 0);

      if (available.length === 0) {
        const uncompleted = procs.filter(p => remBurst[p.pid] > 0);
        if (uncompleted.length === 0) break;
        const nextArrival = Math.min(...uncompleted.map(p => p.arrival));
        currentTime = Math.max(currentTime + 1, nextArrival);
        continue;
      }

      available.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival || a.pid.localeCompare(b.pid));
      const cur = available[0];

      if (firstResponse[cur.pid] === -1) {
        firstResponse[cur.pid] = currentTime;
      }

      ganttRaw.push({ pid: cur.pid, name: cur.name, time: currentTime });
      remBurst[cur.pid]--;
      totalBusyTime++;
      currentTime++;

      if (remBurst[cur.pid] <= 0) {
        completed++;
        const completionTime = currentTime;
        const turnaround = completionTime - cur.arrival;
        const waiting = turnaround - cur.burst;
        const response = firstResponse[cur.pid] - cur.arrival;

        metricsMap[cur.pid] = {
          pid: cur.pid,
          name: cur.name,
          arrival: cur.arrival,
          burst: cur.burst,
          priority: cur.priority,
          completion: completionTime,
          turnaround: Math.max(0, turnaround),
          waiting: Math.max(0, waiting),
          response: Math.max(0, response)
        };
      }
    }

    const compressedGantt = this.compressGantt(ganttRaw);
    const metrics = procs.map(p => metricsMap[p.pid] || {
      pid: p.pid,
      name: p.name,
      arrival: p.arrival,
      burst: p.burst,
      priority: p.priority,
      completion: currentTime,
      turnaround: currentTime - p.arrival,
      waiting: Math.max(0, currentTime - p.arrival - p.burst),
      response: 0
    });

    return this.calculateSummary(compressedGantt, metrics, currentTime, totalBusyTime);
  }

  // 6. Round Robin Scheduling
  static runRoundRobin(rawProcs, quantum = 2) {
    const procs = this.normalizeProcessList(rawProcs);
    if (procs.length === 0) return this.calculateSummary([], [], 0, 0);

    const safeQuantum = Math.max(1, Math.round(Number(quantum)) || 2);
    const sorted = [...procs].sort((a, b) => a.arrival - b.arrival || a.pid.localeCompare(b.pid));
    const remBurst = {};
    const firstResponse = {};
    const completionTimes = {};

    sorted.forEach(p => {
      remBurst[p.pid] = p.burst;
      firstResponse[p.pid] = -1;
    });

    const queue = [];
    let currentTime = 0;
    let totalBusyTime = 0;
    const gantt = [];
    const n = sorted.length;

    // Add first arrived process
    let i = 0;
    while (i < n && sorted[i].arrival <= currentTime) {
      queue.push(sorted[i]);
      i++;
    }

    if (queue.length === 0 && i < n) {
      currentTime = sorted[i].arrival;
      while (i < n && sorted[i].arrival <= currentTime) {
        queue.push(sorted[i]);
        i++;
      }
    }

    const totalBurstSum = procs.reduce((sum, p) => sum + p.burst, 0);
    const maxRRCycles = Math.max(5000, totalBurstSum * 5);
    let cycles = 0;

    while ((queue.length > 0 || i < n) && cycles++ < maxRRCycles) {
      if (queue.length === 0) {
        if (i < n) {
          currentTime = Math.max(currentTime, sorted[i].arrival);
          while (i < n && sorted[i].arrival <= currentTime) {
            queue.push(sorted[i]);
            i++;
          }
        } else {
          break;
        }
      }

      if (queue.length === 0) break;

      const cur = queue.shift();
      const currentRem = remBurst[cur.pid];

      if (currentRem <= 0) continue;

      if (firstResponse[cur.pid] === -1) {
        firstResponse[cur.pid] = currentTime;
      }

      const slice = Math.min(safeQuantum, currentRem);
      if (slice <= 0) continue;

      const startTime = currentTime;
      const endTime = startTime + slice;
      currentTime = endTime;
      remBurst[cur.pid] -= slice;
      totalBusyTime += slice;

      gantt.push({
        pid: cur.pid,
        name: cur.name,
        start: startTime,
        end: endTime
      });

      // Check newly arrived processes during this slice
      while (i < n && sorted[i].arrival <= currentTime) {
        queue.push(sorted[i]);
        i++;
      }

      if (remBurst[cur.pid] > 0) {
        queue.push(cur);
      } else {
        completionTimes[cur.pid] = currentTime;
      }
    }

    const metrics = sorted.map(p => {
      const completionTime = completionTimes[p.pid] || (p.arrival + p.burst);
      const turnaround = completionTime - p.arrival;
      const waiting = turnaround - p.burst;
      const response = (firstResponse[p.pid] !== -1 ? firstResponse[p.pid] : p.arrival) - p.arrival;

      return {
        pid: p.pid,
        name: p.name,
        arrival: p.arrival,
        burst: p.burst,
        priority: p.priority,
        completion: completionTime,
        turnaround: Math.max(0, turnaround),
        waiting: Math.max(0, waiting),
        response: Math.max(0, response)
      };
    });

    return this.calculateSummary(gantt, metrics, currentTime, totalBusyTime);
  }

  // Utility to compress 1ms slices into contiguous Gantt blocks
  static compressGantt(rawSlices) {
    if (!rawSlices || rawSlices.length === 0) return [];
    const result = [];
    let currentBlock = {
      pid: rawSlices[0].pid,
      name: rawSlices[0].name,
      start: rawSlices[0].time,
      end: rawSlices[0].time + 1
    };

    for (let i = 1; i < rawSlices.length; i++) {
      const slice = rawSlices[i];
      if (slice.pid === currentBlock.pid && slice.time === currentBlock.end) {
        currentBlock.end++;
      } else {
        result.push({ ...currentBlock });
        currentBlock = {
          pid: slice.pid,
          name: slice.name,
          start: slice.time,
          end: slice.time + 1
        };
      }
    }
    result.push(currentBlock);
    return result;
  }

  // Calculate averages and CPU utilization
  static calculateSummary(gantt, metrics, totalTime, totalBusyTime) {
    const count = metrics.length || 1;
    const avgWaiting = metrics.reduce((acc, m) => acc + (m.waiting || 0), 0) / count;
    const avgTurnaround = metrics.reduce((acc, m) => acc + (m.turnaround || 0), 0) / count;
    const avgResponse = metrics.reduce((acc, m) => acc + (m.response || 0), 0) / count;
    const cpuUtil = totalTime > 0 ? Math.min(100, Math.max(0, Math.round((totalBusyTime / totalTime) * 100))) : 100;

    return {
      gantt_data: gantt || [],
      totalTime: Math.max(totalTime, 1),
      metrics: metrics || [],
      summary: {
        avgWaiting: Number((avgWaiting || 0).toFixed(2)),
        avgTurnaround: Number((avgTurnaround || 0).toFixed(2)),
        avgResponse: Number((avgResponse || 0).toFixed(2)),
        cpuUtil: isNaN(cpuUtil) ? 100 : cpuUtil
      }
    };
  }

  /**
   * Scenario-Driven Intelligent Scheduling Optimizer
   * Dynamically inspects process characteristics (Burst Variance, Convoy Hazard, Real-time Priorities, Arrival Dispersion, Responsiveness)
   * and automatically selects the optimal algorithm among FCFS, SJF, SRTF, Round Robin, and Priority Scheduling.
   */
  static autoSelectOptimalAlgorithm(processList) {
    const procs = this.normalizeProcessList(processList);

    if (procs.length === 0) {
      return {
        recommendedAlgorithm: 'FCFS',
        recommendedPreemptive: false,
        recommendedTimeQuantum: 2,
        name: 'FCFS (Default)',
        scenarioId: 'EMPTY',
        scenarioName: 'Idle Ready Queue',
        scenarioType: 'Default',
        reason: 'No candidate processes available to analyze. Defaulting to First-Come First-Served.',
        metricsSummary: { cv: 0, arrivalSpread: 0, convoyRisk: 'None', hasCritical: false },
        comparisons: []
      };
    }

    const n = procs.length;
    const bursts = procs.map(p => p.burst);
    const arrivals = procs.map(p => p.arrival);
    const priorities = procs.map(p => p.priority);

    // 1. Calculate Burst Statistics
    const meanBurst = bursts.reduce((a, b) => a + b, 0) / n;
    const burstVariance = bursts.reduce((acc, b) => acc + Math.pow(b - meanBurst, 2), 0) / n;
    const burstStdDev = Math.sqrt(burstVariance);
    const cv = meanBurst > 0 ? Number((burstStdDev / meanBurst).toFixed(2)) : 0; // Coefficient of Variation

    // 2. Calculate Arrival Statistics
    const minArrival = Math.min(...arrivals);
    const maxArrival = Math.max(...arrivals);
    const arrivalSpread = maxArrival - minArrival;
    const isSimultaneousArrival = arrivalSpread === 0;

    // 3. Priority Statistics & Critical Task Detection
    const hasCriticalPriority = procs.some(p => p.priority <= 2) && procs.some(p => p.priority >= 3);
    const hasHighestPriorityDivergence = procs.some(p => p.priority <= 2);
    const prioritySpread = Math.max(...priorities) - Math.min(...priorities);

    // 4. Convoy Effect Hazard Detection: Long burst arriving first at t=min followed by shorter jobs
    const sortedByArrival = [...procs].sort((a, b) => a.arrival - b.arrival || a.burst - b.burst);
    const firstProc = sortedByArrival[0];
    const subsequentProcs = sortedByArrival.slice(1);
    const isConvoyHazard = subsequentProcs.length > 0 && 
      firstProc.burst >= meanBurst * 1.3 && 
      subsequentProcs.some(p => p.burst <= firstProc.burst * 0.45);

    // 5. Optimal Time Quantum for Round Robin (Calibrated based on burst characteristics)
    const sortedBursts = [...bursts].sort((a, b) => a - b);
    const p80Index = Math.min(sortedBursts.length - 1, Math.max(0, Math.floor(sortedBursts.length * 0.8)));
    const optimalQuantum = Math.max(2, Math.min(8, Math.round(sortedBursts[p80Index] * 0.5) || 4));

    // Run simulations across all 5 algorithm candidates safely
    const resFCFS = this.runFCFS(procs);
    const resSJF = this.runSJFNonPreemptive(procs);
    const resSRTF = this.runSRTF(procs);
    const resPriorityNP = this.runPriorityNonPreemptive(procs);
    const resPriorityP = this.runPriorityPreemptive(procs);
    const resRR = this.runRoundRobin(procs, optimalQuantum);

    const candidates = [
      {
        name: 'SJF (Shortest Job First)',
        algo: 'SJF',
        preemptive: false,
        quantum: optimalQuantum,
        avgWaiting: resSJF.summary.avgWaiting,
        avgTurnaround: resSJF.summary.avgTurnaround,
        avgResponse: resSJF.summary.avgResponse,
        rationale: 'Minimizes Average Waiting Time for batch workloads by executing shorter jobs first without preemption overhead.'
      },
      {
        name: 'SRTF (Preemptive SJF)',
        algo: 'SJF',
        preemptive: true,
        quantum: optimalQuantum,
        avgWaiting: resSRTF.summary.avgWaiting,
        avgTurnaround: resSRTF.summary.avgTurnaround,
        avgResponse: resSRTF.summary.avgResponse,
        rationale: 'Context-switches immediately to newly arrived shorter bursts, completely neutralizing the Convoy Effect.'
      },
      {
        name: `Round Robin (q=${optimalQuantum}ms)`,
        algo: 'Round Robin',
        preemptive: false,
        quantum: optimalQuantum,
        avgWaiting: resRR.summary.avgWaiting,
        avgTurnaround: resRR.summary.avgTurnaround,
        avgResponse: resRR.summary.avgResponse,
        rationale: `Guarantees starvation-free interactive time-sharing with minimal initial response latency (RT=${resRR.summary.avgResponse}ms).`
      },
      {
        name: hasCriticalPriority && arrivalSpread > 0 ? 'Priority (Preemptive)' : 'Priority Scheduling',
        algo: 'Priority',
        preemptive: hasCriticalPriority && arrivalSpread > 0,
        quantum: optimalQuantum,
        avgWaiting: hasCriticalPriority && arrivalSpread > 0 ? resPriorityP.summary.avgWaiting : resPriorityNP.summary.avgWaiting,
        avgTurnaround: hasCriticalPriority && arrivalSpread > 0 ? resPriorityP.summary.avgTurnaround : resPriorityNP.summary.avgTurnaround,
        avgResponse: hasCriticalPriority && arrivalSpread > 0 ? resPriorityP.summary.avgResponse : resPriorityNP.summary.avgResponse,
        rationale: 'Dispatches mission-critical and kernel-level tasks (priority ≤ 2) ahead of regular background workloads.'
      },
      {
        name: 'FCFS (First-Come, First-Served)',
        algo: 'FCFS',
        preemptive: false,
        quantum: optimalQuantum,
        avgWaiting: resFCFS.summary.avgWaiting,
        avgTurnaround: resFCFS.summary.avgTurnaround,
        avgResponse: resFCFS.summary.avgResponse,
        rationale: 'Simple FIFO sequential scheduling with zero context-switch overhead for uniform burst queues.'
      }
    ];

    // ==========================================
    // OPERATING SYSTEM SCENARIO CLASSIFIER
    // ==========================================
    let selectedAlgo = 'FCFS';
    let selectedPreemptive = false;
    let scenarioId = 'UNIFORM_BATCH';
    let scenarioName = 'Homogeneous Batch Workload';
    let scenarioType = 'Batch Queue';
    let decisionRationale = '';

    // Scenario 1: Real-Time & Critical Priority Divergence
    if (hasCriticalPriority || (hasHighestPriorityDivergence && prioritySpread >= 3)) {
      scenarioId = 'CRITICAL_REALTIME';
      scenarioName = 'Mission-Critical & Real-Time Task Workload';
      scenarioType = 'Real-Time / Critical';
      selectedAlgo = 'Priority';
      selectedPreemptive = arrivalSpread > 0;
      decisionRationale = `High priority divergence detected (${procs.filter(p => p.priority <= 2).length} critical process(es) with priority ≤ 2). ${selectedPreemptive ? 'Preemptive' : 'Non-Preemptive'} Priority Scheduling is selected to guarantee urgent kernel/system services meet deadline constraints without being blocked by background processes.`;
    }
    // Scenario 2: Convoy Effect Hazard in Dynamic Arrivals -> SRTF
    else if (isConvoyHazard && arrivalSpread > 0) {
      scenarioId = 'CONVOY_HAZARD';
      scenarioName = 'Dynamic Staggered Burst (Convoy Effect Hazard)';
      scenarioType = 'Dynamic Queue';
      selectedAlgo = 'SJF';
      selectedPreemptive = true; // SRTF
      decisionRationale = `Convoy Effect Risk Detected: Process ${firstProc.pid} (${firstProc.burst}ms) arrives at t=${firstProc.arrival}ms and would block subsequent shorter processes. SRTF (Preemptive SJF) is chosen to immediately preempt long tasks when short jobs arrive, drastically reducing Average Turnaround Time to ${resSRTF.summary.avgTurnaround}ms (vs FCFS ${resFCFS.summary.avgTurnaround}ms).`;
    }
    // Scenario 3: Batch Processing with High Burst Variance (Simultaneous Arrivals) -> SJF Non-Preemptive
    else if (cv >= 0.35 && isSimultaneousArrival) {
      scenarioId = 'BATCH_BURST_VARIATION';
      scenarioName = 'Batch Processing with Varied Burst Times';
      scenarioType = 'Throughput Batch';
      selectedAlgo = 'SJF';
      selectedPreemptive = false; // Non-preemptive SJF
      decisionRationale = `Simultaneous batch arrivals (all AT=${minArrival}ms) with high burst variance (CV=${cv}). Non-Preemptive SJF is mathematically proven to minimize Average Waiting Time (${resSJF.summary.avgWaiting}ms) by ordering execution by burst length with zero preemption context-switch penalties.`;
    }
    // Scenario 4: Homogeneous / Uniform Sequential Batch Queue (CV <= 0.15 or zero variance) -> FCFS
    else if (cv <= 0.15 || burstVariance <= 1.0) {
      scenarioId = 'UNIFORM_BATCH';
      scenarioName = 'Homogeneous Sequential Batch Workload';
      scenarioType = 'Low-Overhead Batch';
      selectedAlgo = 'FCFS';
      selectedPreemptive = false;
      decisionRationale = `Burst times are nearly homogeneous with minimal variance (CV=${cv} ≤ 0.15). First-Come First-Served (FCFS) provides optimal CPU throughput with zero preemptive context-switch overhead and simple FIFO queue predictability.`;
    }
    // Scenario 5: Multi-Process Interactive Workload requiring Starvation Prevention & Fast Response -> Round Robin
    else if (n >= 3 && resRR.summary.avgResponse < resFCFS.summary.avgResponse * 0.75) {
      scenarioId = 'INTERACTIVE_TIMESHARING';
      scenarioName = 'Multi-User Interactive Time-Sharing';
      scenarioType = 'Interactive Time-Sharing';
      selectedAlgo = 'Round Robin';
      selectedPreemptive = false;
      decisionRationale = `Multi-process interactive environment requiring fair CPU time allocation and starvation prevention. Round Robin with calibrated quantum (q=${optimalQuantum}ms) slashes initial response latency to ${resRR.summary.avgResponse}ms (vs FCFS ${resFCFS.summary.avgResponse}ms) for fast interactive feedback.`;
    }
    // Scenario 6: Dynamic Staggered Arrivals with High Variance -> SRTF
    else if (cv >= 0.4 && arrivalSpread > 0) {
      scenarioId = 'DYNAMIC_VARIED_ARRIVALS';
      scenarioName = 'Dynamic Submissions with High Burst Dispersion';
      scenarioType = 'Dynamic Interactive';
      selectedAlgo = 'SJF';
      selectedPreemptive = true; // SRTF
      decisionRationale = `Dynamic staggered submissions with high burst variance (CV=${cv}, Arrival Spread=${arrivalSpread}ms). SRTF dynamically allocates CPU to the shortest remaining workload, achieving optimal Average Waiting Time (${resSRTF.summary.avgWaiting}ms).`;
    }
    // Fallback: Default to FCFS
    else {
      scenarioId = 'UNIFORM_BATCH';
      scenarioName = 'Homogeneous Sequential Batch Workload';
      scenarioType = 'Low-Overhead Batch';
      selectedAlgo = 'FCFS';
      selectedPreemptive = false;
      decisionRationale = `Workload exhibits standard sequential properties. First-Come First-Served (FCFS) provides optimal throughput with zero preemption context-switch penalties.`;
    }

    // Find the matching candidate object
    const bestCandidate = candidates.find(c => c.algo === selectedAlgo && c.preemptive === selectedPreemptive) || candidates[0];

    return {
      recommendedAlgorithm: selectedAlgo,
      recommendedPreemptive: selectedPreemptive,
      recommendedTimeQuantum: optimalQuantum,
      name: `${bestCandidate.name}`,
      scenarioId,
      scenarioName,
      scenarioType,
      reason: decisionRationale,
      metricsSummary: {
        cv,
        meanBurst: Number(meanBurst.toFixed(1)),
        arrivalSpread,
        hasCriticalPriority,
        convoyRisk: isConvoyHazard ? 'High' : (cv >= 0.4 ? 'Moderate' : 'Low')
      },
      comparisons: candidates.map(c => ({
        ...c,
        isBest: c.algo === selectedAlgo && c.preemptive === selectedPreemptive
      }))
    };
  }
}
