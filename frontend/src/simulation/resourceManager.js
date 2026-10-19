// Resource Management Simulation Module

export class ResourceManager {
  constructor(initialResources = []) {
    this.resources = JSON.parse(JSON.stringify(initialResources));
    this.processAllocations = {}; // { 'P101': { 'R1': 1, 'R3': 0 } }
  }

  getResources() {
    return JSON.parse(JSON.stringify(this.resources));
  }

  getResource(id) {
    return this.resources.find(r => r.id === id) || null;
  }

  /**
   * Process requests a resource
   * @param {string} pid - Process ID
   * @param {string} resourceId - e.g. 'R1'
   * @param {number} quantity - Number of instances requested
   */
  requestResource(pid, resourceId, quantity = 1) {
    const res = this.resources.find(r => r.id === resourceId);
    if (!res) {
      return { success: false, message: `Resource ${resourceId} not found.` };
    }

    const qty = Math.max(1, Number(quantity) || 1);

    if (res.available >= qty) {
      res.available -= qty;
      res.allocated += qty;

      if (!this.processAllocations[pid]) this.processAllocations[pid] = {};
      this.processAllocations[pid][resourceId] = (this.processAllocations[pid][resourceId] || 0) + qty;

      return {
        success: true,
        allocated: true,
        resource: { ...res },
        message: `Allocated ${qty} instance(s) of ${res.name} (${resourceId}) to process ${pid}. Available: ${res.available}`
      };
    } else {
      // Not enough instances available -> Process must wait
      if (!res.waitingProcs.includes(pid)) {
        res.waitingProcs.push(pid);
      }
      return {
        success: true,
        allocated: false,
        resource: { ...res },
        message: `Resource ${res.name} (${resourceId}) unavailable. Requested ${qty}, available ${res.available}. Process ${pid} placed in WAITING state.`
      };
    }
  }

  /**
   * Process releases a resource
   * @param {string} pid - Process ID
   * @param {string} resourceId - e.g. 'R1'
   * @param {number} quantity - Number of instances released
   */
  releaseResource(pid, resourceId, quantity = 1) {
    const res = this.resources.find(r => r.id === resourceId);
    if (!res) {
      return { success: false, message: `Resource ${resourceId} not found.` };
    }

    const qty = Math.max(1, Number(quantity) || 1);
    const releaseCount = Math.min(qty, res.allocated);

    res.allocated -= releaseCount;
    res.available = Math.min(res.total, res.available + releaseCount);

    if (this.processAllocations[pid] && this.processAllocations[pid][resourceId]) {
      this.processAllocations[pid][resourceId] = Math.max(0, this.processAllocations[pid][resourceId] - releaseCount);
    }

    let unblockedProcess = null;
    if (res.waitingProcs.length > 0 && res.available > 0) {
      unblockedProcess = res.waitingProcs.shift();
    }

    return {
      success: true,
      resource: { ...res },
      unblockedProcess,
      message: `Released ${releaseCount} instance(s) of ${res.name} (${resourceId}) from process ${pid}. Available: ${res.available}.`
    };
  }

  /**
   * Free all resources held by a terminating process
   * @param {string} pid - Process ID
   */
  freeAllForProcess(pid) {
    const released = [];
    this.resources.forEach(res => {
      // Remove from waiting
      res.waitingProcs = res.waitingProcs.filter(p => p !== pid);
      if (this.processAllocations[pid] && this.processAllocations[pid][res.id]) {
        const held = this.processAllocations[pid][res.id];
        if (held > 0) {
          res.allocated = Math.max(0, res.allocated - held);
          res.available = Math.min(res.total, res.available + held);
          released.push(`${res.id} (${held})`);
          this.processAllocations[pid][res.id] = 0;
        }
      }
    });

    return {
      success: true,
      releasedResources: released,
      message: `Reclaimed all resources from terminated process ${pid}: ${released.join(', ') || 'None'}`
    };
  }
}
