/**
 * Smart Calculator - Memory Manager (Phase 4)
 * Manages memory store (MC, MR, M+, M-) and visual indicator state.
 */

export class MemoryManager {
  constructor() {
    this.memoryValue = 0;
  }

  /**
   * Memory Clear (MC) - Resets memory value to 0.
   */
  clear() {
    this.memoryValue = 0;
  }

  /**
   * Memory Recall (MR) - Returns current memory value.
   * @returns {number}
   */
  recall() {
    return this.memoryValue;
  }

  /**
   * Memory Add (M+) - Adds value to memory.
   * @param {number} val 
   */
  add(val) {
    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      this.memoryValue = this.stripPrecision(this.memoryValue + val);
    }
  }

  /**
   * Memory Subtract (M-) - Subtracts value from memory.
   * @param {number} val 
   */
  subtract(val) {
    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      this.memoryValue = this.stripPrecision(this.memoryValue - val);
    }
  }

  /**
   * Checks if memory holds a non-zero value.
   * @returns {boolean}
   */
  hasValue() {
    return this.memoryValue !== 0;
  }

  /**
   * Rounds precision to avoid floating-point inaccuracies.
   * @param {number} num 
   * @returns {number}
   */
  stripPrecision(num) {
    return parseFloat(num.toFixed(12));
  }
}
