// Memory Management Simulation Module (Contiguous Partitioning)

export class MemoryManager {
  constructor(totalMemory = 1024, initialBlocks = null) {
    this.totalMemory = totalMemory;
    if (initialBlocks && initialBlocks.length > 0) {
      this.blocks = JSON.parse(JSON.stringify(initialBlocks));
    } else {
      this.blocks = [
        { id: 1, name: 'Block 1', size: 100, start: 0, status: 'Free', pid: null, internalFrag: 0 },
        { id: 2, name: 'Block 2', size: 200, start: 100, status: 'Free', pid: null, internalFrag: 0 },
        { id: 3, name: 'Block 3', size: 150, start: 300, status: 'Free', pid: null, internalFrag: 0 },
        { id: 4, name: 'Block 4', size: 300, start: 450, status: 'Free', pid: null, internalFrag: 0 },
        { id: 5, name: 'Block 5', size: 274, start: 750, status: 'Free', pid: null, internalFrag: 0 }
      ];
    }
  }

  getMemoryStatus() {
    const usedMemory = this.blocks
      .filter(b => b.status === 'Allocated')
      .reduce((sum, b) => sum + (b.size - (b.internalFrag || 0)), 0);

    const totalAllocatedBlockSize = this.blocks
      .filter(b => b.status === 'Allocated')
      .reduce((sum, b) => sum + b.size, 0);

    const freeMemory = this.totalMemory - totalAllocatedBlockSize;
    const internalFrag = this.blocks.reduce((sum, b) => sum + (b.internalFrag || 0), 0);

    // External fragmentation is total free memory across all free blocks
    const freeBlocks = this.blocks.filter(b => b.status === 'Free');
    const externalFrag = freeBlocks.length > 1 ? freeBlocks.reduce((sum, b) => sum + b.size, 0) : 0;

    const utilization = this.totalMemory > 0 
      ? Math.round((totalAllocatedBlockSize / this.totalMemory) * 100) 
      : 0;

    return {
      totalMemory: this.totalMemory,
      usedMemory,
      freeMemory,
      internalFrag,
      externalFrag,
      utilization,
      blocks: JSON.parse(JSON.stringify(this.blocks))
    };
  }

  /**
   * Allocate memory to a process
   * @param {string} pid - Process ID
   * @param {number} size - Required memory in MB
   * @param {string} algorithm - 'First Fit' | 'Best Fit' | 'Worst Fit'
   */
  allocateMemory(pid, size, algorithm = 'First Fit') {
    const reqSize = Number(size);
    if (isNaN(reqSize) || reqSize <= 0) {
      return { success: false, message: 'Invalid memory size requested.' };
    }

    // Check if PID already has memory allocated
    const existing = this.blocks.find(b => b.pid === pid);
    if (existing) {
      return { success: false, message: `Process ${pid} already has memory allocated in ${existing.name}.` };
    }

    const freeBlocks = this.blocks.filter(b => b.status === 'Free' && b.size >= reqSize);
    if (freeBlocks.length === 0) {
      return { 
        success: false, 
        message: `Allocation failed: No suitable free block found for ${reqSize} MB. External fragmentation may be occurring.` 
      };
    }

    let targetBlock = null;

    if (algorithm === 'First Fit') {
      targetBlock = freeBlocks[0];
    } else if (algorithm === 'Best Fit') {
      // Find the smallest block that is >= reqSize
      targetBlock = [...freeBlocks].sort((a, b) => a.size - b.size)[0];
    } else if (algorithm === 'Worst Fit') {
      // Find the largest block
      targetBlock = [...freeBlocks].sort((a, b) => b.size - a.size)[0];
    } else {
      targetBlock = freeBlocks[0];
    }

    const internalFrag = targetBlock.size - reqSize;
    targetBlock.status = 'Allocated';
    targetBlock.pid = pid;
    targetBlock.internalFrag = Math.max(0, internalFrag);

    const baseAddressHex = '0x' + (targetBlock.start * 1024 * 1024).toString(16).padStart(8, '0');
    const limitAddressHex = '0x' + ((targetBlock.start + reqSize) * 1024 * 1024).toString(16).padStart(8, '0');

    // Synthesize virtual page numbers (4MB per page)
    const numPages = Math.max(1, Math.ceil(reqSize / 32));
    const pages = Array.from({ length: numPages }, (_, i) => targetBlock.id * 10 + i);

    return {
      success: true,
      block: { ...targetBlock },
      allocationInfo: {
        base_address: baseAddressHex,
        limit: limitAddressHex,
        allocated_size: reqSize,
        allocated: true,
        block_id: targetBlock.id,
        pages
      },
      message: `Allocated ${reqSize} MB to ${pid} in ${targetBlock.name} (${algorithm}) with ${internalFrag} MB internal fragmentation.`
    };
  }

  /**
   * Deallocate memory for a process
   * @param {string} pid - Process ID
   */
  deallocateMemory(pid) {
    const targetBlock = this.blocks.find(b => b.pid === pid);
    if (!targetBlock) {
      return { success: false, message: `No memory block currently allocated to process ${pid}.` };
    }

    targetBlock.status = 'Free';
    targetBlock.pid = null;
    targetBlock.internalFrag = 0;

    return {
      success: true,
      blockId: targetBlock.id,
      message: `Memory block ${targetBlock.name} (${targetBlock.size} MB) freed from process ${pid}.`
    };
  }
}
