// Threads & Synchronization Simulation Module

export class ThreadManager {
  constructor(initialThreads = []) {
    this.processThreads = JSON.parse(JSON.stringify(initialThreads));
  }

  getThreads() {
    return JSON.parse(JSON.stringify(this.processThreads));
  }

  getThreadsByProcess(pid) {
    const entry = this.processThreads.find(pt => pt.pid === pid);
    return entry ? [...entry.threads] : [];
  }

  createThread(pid, threadName, priority = 'Medium') {
    let procEntry = this.processThreads.find(pt => pt.pid === pid);
    if (!procEntry) {
      procEntry = { pid, threads: [] };
      this.processThreads.push(procEntry);
    }

    const threadId = `T${pid.replace('P', '')}-${procEntry.threads.length + 1}`;
    const newThread = {
      id: threadId,
      name: threadName || `Thread ${threadId}`,
      state: 'Ready',
      priority: priority || 'Medium'
    };

    procEntry.threads.push(newThread);
    return newThread;
  }

  /**
   * Run Synchronization Simulation
   * @param {Array<string>} threadIds - List of selected thread IDs
   * @param {string} resourceName - Name of shared critical section resource
   * @param {string} method - 'Mutex' | 'Semaphore' | 'Race Condition'
   * @param {number} permits - Semaphore capacity
   */
  simulateSync(threadIds, resourceName = 'Shared Counter', method = 'Mutex', permits = 2) {
    if (!threadIds || threadIds.length === 0) {
      return { timeline: [], states: [] };
    }

    const timeline = [];
    let currentTime = 0;
    const states = [];

    if (method === 'Race Condition') {
      // Unsynchronized concurrent writes
      timeline.push({ time: `${currentTime}ms`, thread: threadIds[0], event: 'Enter Critical Section without Lock', status: 'Pending' });
      currentTime += 5;
      timeline.push({ time: `${currentTime}ms`, thread: threadIds[1] || threadIds[0], event: 'Enter Critical Section concurrently', status: 'Pending' });
      currentTime += 10;
      timeline.push({ time: `${currentTime}ms`, thread: threadIds[0], event: `Read ${resourceName} (Value = 100)`, status: 'Success' });
      currentTime += 5;
      timeline.push({ time: `${currentTime}ms`, thread: threadIds[1] || threadIds[0], event: `Read ${resourceName} (Stale Value = 100)`, status: 'Pending' });
      currentTime += 15;
      timeline.push({ time: `${currentTime}ms`, thread: threadIds[0], event: `Write ${resourceName} (Value = 101)`, status: 'Success' });
      currentTime += 10;
      timeline.push({
        time: `${currentTime}ms`,
        thread: threadIds[1] || threadIds[0],
        event: `Overwrite ${resourceName} (Lost Update Conflict: overwrote 101 with 101)`,
        status: 'Conflict'
      });
      currentTime += 15;
      timeline.push({ time: `${currentTime}ms`, thread: 'System', event: 'Data Inconsistency Detected: Race Condition confirmed', status: 'Conflict' });

      threadIds.forEach(t => {
        states.push({
          thread: t,
          state: 'Finished (Unsynchronized)',
          resource: resourceName,
          lock: 'None (Corrupted)'
        });
      });
    } else if (method === 'Mutex') {
      // Mutual exclusion lock
      const t1 = threadIds[0];
      const t2 = threadIds[1] || `${t1}-clone`;
      const t3 = threadIds[2];

      timeline.push({ time: `${currentTime}ms`, thread: t1, event: `pthread_mutex_lock(&lock_${resourceName})`, status: 'Success' });
      currentTime += 8;
      timeline.push({ time: `${currentTime}ms`, thread: t1, event: 'Entered Critical Section (Lock Acquired)', status: 'Success' });
      currentTime += 12;
      timeline.push({ time: `${currentTime}ms`, thread: t2, event: `pthread_mutex_lock(&lock_${resourceName})`, status: 'Pending' });
      currentTime += 2;
      timeline.push({ time: `${currentTime}ms`, thread: t2, event: 'Lock Busy -> Thread Blocked in Mutex Wait Queue', status: 'Blocked' });
      currentTime += 20;
      timeline.push({ time: `${currentTime}ms`, thread: t1, event: `Modified ${resourceName} atomically: Value = 101`, status: 'Success' });
      currentTime += 10;
      timeline.push({ time: `${currentTime}ms`, thread: t1, event: `pthread_mutex_unlock(&lock_${resourceName})`, status: 'Success' });
      currentTime += 5;
      timeline.push({ time: `${currentTime}ms`, thread: t2, event: 'Unblocked & Woken up by Kernel Scheduler', status: 'Success' });
      currentTime += 8;
      timeline.push({ time: `${currentTime}ms`, thread: t2, event: 'Entered Critical Section with exclusive ownership', status: 'Success' });
      currentTime += 18;
      timeline.push({ time: `${currentTime}ms`, thread: t2, event: `Modified ${resourceName} safely: Value = 102`, status: 'Success' });
      currentTime += 8;
      timeline.push({ time: `${currentTime}ms`, thread: t2, event: 'Released Mutex Lock', status: 'Success' });

      if (t3) {
        currentTime += 5;
        timeline.push({ time: `${currentTime}ms`, thread: t3, event: 'Acquired Mutex Lock and executed cleanly', status: 'Success' });
      }

      threadIds.forEach(t => {
        states.push({
          thread: t,
          state: 'Finished',
          resource: resourceName,
          lock: 'Released (Safe)'
        });
      });
    } else if (method === 'Semaphore') {
      // Counting Semaphore
      const capacity = Math.max(1, permits);
      timeline.push({ time: `${currentTime}ms`, thread: 'System', event: `sem_init(&sem, 0, ${capacity}) - Initial permits: ${capacity}`, status: 'Success' });
      
      threadIds.forEach((t, i) => {
        currentTime += 10;
        if (i < capacity) {
          timeline.push({ time: `${currentTime}ms`, thread: t, event: `sem_wait(&sem) -> Acquired Permit (${capacity - i - 1} remaining)`, status: 'Success' });
          currentTime += 5;
          timeline.push({ time: `${currentTime}ms`, thread: t, event: `Executing in Critical Section slot ${i + 1}`, status: 'Success' });
        } else {
          timeline.push({ time: `${currentTime}ms`, thread: t, event: `sem_wait(&sem) -> No permits available (Count = 0)`, status: 'Pending' });
          currentTime += 2;
          timeline.push({ time: `${currentTime}ms`, thread: t, event: 'Thread Blocked in Semaphore Queue', status: 'Blocked' });
        }
      });

      // Release first permit
      currentTime += 25;
      timeline.push({ time: `${currentTime}ms`, thread: threadIds[0], event: `sem_post(&sem) -> Released Permit (Count incremented)`, status: 'Success' });

      if (threadIds.length > capacity) {
        const waitingThread = threadIds[capacity];
        currentTime += 5;
        timeline.push({ time: `${currentTime}ms`, thread: waitingThread, event: `sem_wait() succeeded -> Granted Permit`, status: 'Success' });
        currentTime += 15;
        timeline.push({ time: `${currentTime}ms`, thread: waitingThread, event: 'Completed work and called sem_post()', status: 'Success' });
      }

      threadIds.forEach(t => {
        states.push({
          thread: t,
          state: 'Finished',
          resource: resourceName,
          lock: `Permit Returned (${capacity}/${capacity})`
        });
      });
    }

    return { timeline, states };
  }
}
