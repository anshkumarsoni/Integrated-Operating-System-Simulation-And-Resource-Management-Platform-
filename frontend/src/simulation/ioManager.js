// I/O Management & Disk Scheduling Simulation Module

export class IOManager {
  constructor(initialRequests = []) {
    this.requests = JSON.parse(JSON.stringify(initialRequests));
    this.nextReqId = 1004;
  }

  getRequests() {
    return JSON.parse(JSON.stringify(this.requests));
  }

  createRequest(pid, device = 'Disk', requestType = 'READ') {
    const id = `IO-${this.nextReqId++}`;
    const newReq = {
      id,
      pid,
      device: device || 'Disk',
      requestType: (requestType || 'READ').toUpperCase(),
      status: 'WAITING',
      timestamp: new Date().toISOString()
    };
    this.requests.unshift(newReq);
    return newReq;
  }

  completeRequest(id) {
    const req = this.requests.find(r => r.id === id);
    if (req) {
      req.status = 'COMPLETED';
      return { success: true, request: req };
    }
    return { success: false, message: 'Request not found' };
  }

  /**
   * Run Disk Head Scheduling Algorithms
   * @param {Array<number>} requests - Array of cylinder request track numbers (e.g. [98, 183, 37, 122, 14, 124, 65, 67])
   * @param {number} head - Initial head position (e.g. 53)
   * @param {string} algorithm - 'FCFS' | 'SJF' | 'SSTF' | 'SCAN' | 'C-SCAN'
   * @param {string} direction - 'Left' | 'Right'
   * @param {number} maxCylinder - Maximum track boundary (default 199)
   */
  static runDiskScheduling(requests, head = 53, algorithm = 'FCFS', direction = 'Right', maxCylinder = 199) {
    const initialHead = Number(head) || 0;
    const cleanRequests = requests.map(r => Number(r)).filter(n => !isNaN(n) && n >= 0);

    if (cleanRequests.length === 0) {
      return {
        sequence: [initialHead],
        totalMovement: 0,
        steps: []
      };
    }

    switch (algorithm) {
      case 'FCFS':
        return this.runFCFS(cleanRequests, initialHead);
      case 'SSTF':
        return this.runSSTF(cleanRequests, initialHead);
      case 'SCAN':
        return this.runSCAN(cleanRequests, initialHead, direction, maxCylinder);
      case 'C-SCAN':
        return this.runCSCAN(cleanRequests, initialHead, direction, maxCylinder);
      default:
        return this.runFCFS(cleanRequests, initialHead);
    }
  }

  // 1. FCFS Disk Scheduling
  static runFCFS(requests, head) {
    const sequence = [head, ...requests];
    let totalMovement = 0;
    const steps = [];

    for (let i = 0; i < requests.length; i++) {
      const from = i === 0 ? head : requests[i - 1];
      const to = requests[i];
      const move = Math.abs(to - from);
      totalMovement += move;
      steps.push({ from, to, movement: move });
    }

    return { sequence, totalMovement, steps };
  }

  // 2. SSTF (Shortest Seek Time First)
  static runSSTF(requests, head) {
    const pending = [...requests];
    const sequence = [head];
    let cur = head;
    let totalMovement = 0;
    const steps = [];

    while (pending.length > 0) {
      // Find nearest cylinder
      let minDiff = Infinity;
      let nextIndex = 0;

      for (let i = 0; i < pending.length; i++) {
        const diff = Math.abs(pending[i] - cur);
        if (diff < minDiff) {
          minDiff = diff;
          nextIndex = i;
        }
      }

      const to = pending[nextIndex];
      const move = Math.abs(to - cur);
      totalMovement += move;
      steps.push({ from: cur, to, movement: move });

      sequence.push(to);
      cur = to;
      pending.splice(nextIndex, 1);
    }

    return { sequence, totalMovement, steps };
  }

  // 3. SCAN (Elevator)
  static runSCAN(requests, head, direction = 'Right', maxCylinder = 199) {
    const left = requests.filter(r => r < head).sort((a, b) => a - b);
    const right = requests.filter(r => r >= head).sort((a, b) => a - b);

    const sequence = [head];
    let orderedTracks = [];

    if (direction === 'Right') {
      orderedTracks = [...right];
      if (left.length > 0) {
        orderedTracks.push(maxCylinder); // go to right end
        orderedTracks.push(...left.reverse());
      }
    } else {
      orderedTracks = [...left.reverse()];
      if (right.length > 0) {
        orderedTracks.push(0); // go to left end
        orderedTracks.push(...right);
      }
    }

    let cur = head;
    let totalMovement = 0;
    const steps = [];

    orderedTracks.forEach(to => {
      const move = Math.abs(to - cur);
      totalMovement += move;
      steps.push({ from: cur, to, movement: move });
      sequence.push(to);
      cur = to;
    });

    return { sequence, totalMovement, steps };
  }

  // 4. C-SCAN (Circular SCAN)
  static runCSCAN(requests, head, direction = 'Right', maxCylinder = 199) {
    const left = requests.filter(r => r < head).sort((a, b) => a - b);
    const right = requests.filter(r => r >= head).sort((a, b) => a - b);

    const sequence = [head];
    let orderedTracks = [];

    if (direction === 'Right') {
      orderedTracks = [...right];
      if (left.length > 0) {
        orderedTracks.push(maxCylinder);
        orderedTracks.push(0); // Wrap around to start
        orderedTracks.push(...left);
      }
    } else {
      orderedTracks = [...left.reverse()];
      if (right.length > 0) {
        orderedTracks.push(0);
        orderedTracks.push(maxCylinder); // Wrap around to end
        orderedTracks.push(...right.reverse());
      }
    }

    let cur = head;
    let totalMovement = 0;
    const steps = [];

    orderedTracks.forEach(to => {
      const move = Math.abs(to - cur);
      totalMovement += move;
      steps.push({ from: cur, to, movement: move });
      sequence.push(to);
      cur = to;
    });

    return { sequence, totalMovement, steps };
  }
}
