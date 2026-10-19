// Virtual Memory & Page Replacement Algorithms Simulation Module

export class VirtualMemoryManager {
  /**
   * Run Page Replacement Simulation
   * @param {Array<number>} pages - Reference string of page numbers e.g. [7, 0, 1, 2, 0, 3, 0, 4]
   * @param {number} framesCount - Number of available physical page frames (e.g. 3 or 4)
   * @param {string} algorithm - 'FIFO' | 'LRU' | 'Optimal'
   */
  static runPageReplacement(pages, framesCount = 3, algorithm = 'FIFO') {
    const numFrames = Math.max(1, Number(framesCount) || 3);
    const cleanPages = pages.map(p => Number(p)).filter(n => !isNaN(n));

    if (cleanPages.length === 0) {
      return {
        faults: 0,
        hits: 0,
        faultRate: 0,
        hitRate: 0,
        tlbHits: 0,
        tlbMisses: 0,
        steps: [],
        pageTable: []
      };
    }

    switch (algorithm) {
      case 'FIFO':
        return this.runFIFO(cleanPages, numFrames);
      case 'LRU':
        return this.runLRU(cleanPages, numFrames);
      case 'Optimal':
        return this.runOptimal(cleanPages, numFrames);
      default:
        return this.runFIFO(cleanPages, numFrames);
    }
  }

  // 1. FIFO Page Replacement
  static runFIFO(pages, framesCount) {
    const frames = new Array(framesCount).fill(null);
    const steps = [];
    const fifoQueue = []; // tracks order of insertion
    let faults = 0;
    let hits = 0;
    let tlbHits = 0;
    let tlbMisses = 0;
    const tlb = []; // 4-entry TLB simulation

    pages.forEach((page, stepIndex) => {
      let isHit = frames.includes(page);
      let isTlbHit = tlb.includes(page);

      if (isTlbHit) {
        tlbHits++;
      } else {
        tlbMisses++;
        if (tlb.length >= 4) tlb.shift();
        tlb.push(page);
      }

      if (isHit) {
        hits++;
      } else {
        faults++;
        const emptyIndex = frames.indexOf(null);
        if (emptyIndex !== -1) {
          frames[emptyIndex] = page;
          fifoQueue.push(page);
        } else {
          // Evict oldest page in FIFO queue
          const oldestPage = fifoQueue.shift();
          const frameIndex = frames.indexOf(oldestPage);
          frames[frameIndex] = page;
          fifoQueue.push(page);
        }
      }

      steps.push({
        step: stepIndex + 1,
        page,
        frames: [...frames],
        fault: !isHit,
        tlbHit: isTlbHit
      });
    });

    return this.buildResult(pages, frames, steps, faults, hits, tlbHits, tlbMisses, framesCount);
  }

  // 2. LRU Page Replacement
  static runLRU(pages, framesCount) {
    const frames = new Array(framesCount).fill(null);
    const steps = [];
    const lastUsedMap = {};
    let faults = 0;
    let hits = 0;
    let tlbHits = 0;
    let tlbMisses = 0;
    const tlb = [];

    pages.forEach((page, stepIndex) => {
      let isHit = frames.includes(page);
      let isTlbHit = tlb.includes(page);

      if (isTlbHit) {
        tlbHits++;
      } else {
        tlbMisses++;
        if (tlb.length >= 4) tlb.shift();
        tlb.push(page);
      }

      if (isHit) {
        hits++;
      } else {
        faults++;
        const emptyIndex = frames.indexOf(null);
        if (emptyIndex !== -1) {
          frames[emptyIndex] = page;
        } else {
          // Find page with lowest lastUsed timestamp
          let lruPage = frames[0];
          let minTime = lastUsedMap[lruPage] ?? -1;

          for (let f = 1; f < frames.length; f++) {
            const curPage = frames[f];
            const time = lastUsedMap[curPage] ?? -1;
            if (time < minTime) {
              minTime = time;
              lruPage = curPage;
            }
          }

          const replaceIndex = frames.indexOf(lruPage);
          frames[replaceIndex] = page;
        }
      }

      lastUsedMap[page] = stepIndex;

      steps.push({
        step: stepIndex + 1,
        page,
        frames: [...frames],
        fault: !isHit,
        tlbHit: isTlbHit
      });
    });

    return this.buildResult(pages, frames, steps, faults, hits, tlbHits, tlbMisses, framesCount);
  }

  // 3. Optimal Page Replacement
  static runOptimal(pages, framesCount) {
    const frames = new Array(framesCount).fill(null);
    const steps = [];
    let faults = 0;
    let hits = 0;
    let tlbHits = 0;
    let tlbMisses = 0;
    const tlb = [];

    pages.forEach((page, stepIndex) => {
      let isHit = frames.includes(page);
      let isTlbHit = tlb.includes(page);

      if (isTlbHit) {
        tlbHits++;
      } else {
        tlbMisses++;
        if (tlb.length >= 4) tlb.shift();
        tlb.push(page);
      }

      if (isHit) {
        hits++;
      } else {
        faults++;
        const emptyIndex = frames.indexOf(null);
        if (emptyIndex !== -1) {
          frames[emptyIndex] = page;
        } else {
          // Find the frame page that will NOT be used for the longest period in the future
          let farthestDist = -1;
          let victimFrameIndex = 0;

          for (let f = 0; f < frames.length; f++) {
            const curPage = frames[f];
            let nextUse = -1;

            for (let future = stepIndex + 1; future < pages.length; future++) {
              if (pages[future] === curPage) {
                nextUse = future;
                break;
              }
            }

            if (nextUse === -1) {
              // Never used again - best victim
              victimFrameIndex = f;
              break;
            } else if (nextUse > farthestDist) {
              farthestDist = nextUse;
              victimFrameIndex = f;
            }
          }

          frames[victimFrameIndex] = page;
        }
      }

      steps.push({
        step: stepIndex + 1,
        page,
        frames: [...frames],
        fault: !isHit,
        tlbHit: isTlbHit
      });
    });

    return this.buildResult(pages, frames, steps, faults, hits, tlbHits, tlbMisses, framesCount);
  }

  static buildResult(pages, finalFrames, steps, faults, hits, tlbHits, tlbMisses, framesCount) {
    const total = pages.length || 1;
    const faultRate = Number(((faults / total) * 100).toFixed(1));
    const hitRate = Number(((hits / total) * 100).toFixed(1));

    // Unique pages in reference string
    const uniquePages = Array.from(new Set(pages)).sort((a, b) => a - b);
    const pageTable = uniquePages.map(page => {
      const frameIdx = finalFrames.indexOf(page);
      const inMemory = frameIdx !== -1;
      return {
        id: page,
        frame: inMemory ? frameIdx : null,
        inMemory,
        lastAccessed: `Step ${pages.lastIndexOf(page) + 1}`
      };
    });

    return {
      faults,
      hits,
      faultRate,
      hitRate,
      tlbHits,
      tlbMisses,
      steps,
      pageTable,
      framesCount
    };
  }
}
