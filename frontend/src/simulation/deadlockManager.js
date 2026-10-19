// Deadlock Management & Banker's Algorithm Simulation Module

export class DeadlockManager {
  /**
   * Run Banker's Safety Algorithm
   * @param {Array<string>} processes - ['P0', 'P1', 'P2', 'P3', 'P4']
   * @param {Array<Array<number>>} allocation - Allocation matrix [n x m]
   * @param {Array<Array<number>>} maximum - Maximum claim matrix [n x m]
   * @param {Array<number>} available - Available resources vector [m]
   */
  static checkBankersAlgorithm(processes, allocation, maximum, available) {
    const n = processes.length;
    const m = available.length;

    // Calculate Need Matrix: Need[i][j] = Max[i][j] - Alloc[i][j]
    const needMatrix = [];
    for (let i = 0; i < n; i++) {
      needMatrix[i] = [];
      for (let j = 0; j < m; j++) {
        const req = (maximum[i]?.[j] ?? 0) - (allocation[i]?.[j] ?? 0);
        needMatrix[i][j] = Math.max(0, req);
      }
    }

    let work = [...available];
    let finish = new Array(n).fill(false);
    const safeSequence = [];
    const steps = [];

    let count = 0;
    while (count < n) {
      let found = false;

      for (let p = 0; p < n; p++) {
        if (!finish[p]) {
          // Check if Need[p] <= Work
          let canExecute = true;
          for (let j = 0; j < m; j++) {
            if (needMatrix[p][j] > work[j]) {
              canExecute = false;
              break;
            }
          }

          if (canExecute) {
            // Reclaim resources: Work = Work + Allocation[p]
            for (let k = 0; k < m; k++) {
              work[k] += (allocation[p]?.[k] ?? 0);
            }
            safeSequence.push(processes[p]);
            finish[p] = true;
            found = true;
            count++;

            steps.push({
              process: processes[p],
              work: [...work],
              allocated: true,
              explanation: `Process ${processes[p]} finished (Need ≤ Work). Reclaimed resources -> New Work = [${work.join(', ')}]`
            });
          }
        }
      }

      if (!found) {
        break; // Deadlock or unsafe condition detected
      }
    }

    const isSafe = count === n;
    const deadlockedProcesses = isSafe ? [] : processes.filter((_, i) => !finish[i]);

    return {
      isSafe,
      safeSequence: isSafe ? safeSequence : null,
      needMatrix,
      steps,
      deadlockedProcesses,
      summary: isSafe 
        ? `Safe state verified. Safe sequence: <${safeSequence.join(', ')}>`
        : `Unsafe state! Circular wait or deadlock condition detected for: ${deadlockedProcesses.join(', ')}`
    };
  }

  /**
   * Generate Resource Allocation Graph (RAG) data with cycle detection
   */
  static getRAGData(processes, resources, allocation, request) {
    const nodes = [
      ...processes.map(p => ({ id: p, type: 'process', label: p })),
      ...resources.map(r => ({ id: r, type: 'resource', label: r }))
    ];

    const edges = [];

    // Allocation Edges: Resource -> Process
    processes.forEach((p, i) => {
      resources.forEach((r, j) => {
        if (allocation[i]?.[j] > 0) {
          edges.push({
            id: `alloc-${r}-${p}`,
            from: r,
            to: p,
            type: 'allocation',
            weight: allocation[i][j],
            isCycle: false
          });
        }
      });
    });

    // Request Edges: Process -> Resource
    processes.forEach((p, i) => {
      resources.forEach((r, j) => {
        if (request[i]?.[j] > 0) {
          edges.push({
            id: `req-${p}-${r}`,
            from: p,
            to: r,
            type: 'request',
            weight: request[i][j],
            isCycle: false
          });
        }
      });
    });

    // Cycle detection on the directed graph
    const adjacencyList = {};
    nodes.forEach(n => { adjacencyList[n.id] = []; });
    edges.forEach(e => {
      if (adjacencyList[e.from]) adjacencyList[e.from].push(e.to);
    });

    const visited = {};
    const recStack = {};
    const cycleNodes = new Set();

    const isCyclicUtil = (v) => {
      visited[v] = true;
      recStack[v] = true;

      const neighbors = adjacencyList[v] || [];
      for (const neighbor of neighbors) {
        if (!visited[neighbor]) {
          if (isCyclicUtil(neighbor)) {
            cycleNodes.add(v);
            cycleNodes.add(neighbor);
            return true;
          }
        } else if (recStack[neighbor]) {
          cycleNodes.add(v);
          cycleNodes.add(neighbor);
          return true;
        }
      }

      recStack[v] = false;
      return false;
    };

    let hasCycle = false;
    for (const node of nodes) {
      if (!visited[node.id]) {
        if (isCyclicUtil(node.id)) {
          hasCycle = true;
        }
      }
    }

    // Mark cycle edges
    edges.forEach(e => {
      if (cycleNodes.has(e.from) && cycleNodes.has(e.to)) {
        e.isCycle = true;
      }
    });

    return {
      nodes,
      edges,
      hasCycle,
      cycleNodes: Array.from(cycleNodes)
    };
  }
}
