/**
 * Smart Calculator - Main Controller & State Machine (Complete - Phases 1 to 7)
 * Orchestrates CalcEngine, MemoryManager, UIManager, KeyboardHandler, and HistoryManager.
 */

import { CalcEngine } from './engine.js';
import { MemoryManager } from './memory.js';
import { UIManager } from './ui.js';
import { KeyboardHandler } from './keyboard.js';
import { HistoryManager } from './history.js';

export class CalculatorApp {
  constructor() {
    this.engine = CalcEngine;
    this.memory = new MemoryManager();
    this.ui = new UIManager();
    this.history = new HistoryManager(this.handleHistorySelect.bind(this));
    
    // Core Calculator State
    this.expressionStr = '';
    this.currentInput = '0';
    this.lastResult = null;
    this.lastOp = null;
    this.lastOperand = null;
    this.isEvaluated = false;
    this.errorState = null;

    this.initKeypadListeners();
    this.keyboard = new KeyboardHandler(this.handleAction.bind(this), this.ui);
    this.updateDisplay();
  }

  /**
   * Callback when a history item is tapped/clicked.
   * @param {string} resultVal 
   */
  handleHistorySelect(resultVal) {
    this.expressionStr = resultVal;
    this.currentInput = resultVal;
    this.isEvaluated = false;
    this.errorState = null;
    this.updateDisplay();

    // Close History Drawer
    const historyDrawer = document.getElementById('history-drawer');
    const historyToggleBtn = document.getElementById('history-toggle-btn');
    if (historyDrawer) {
      historyDrawer.classList.remove('open');
      historyDrawer.setAttribute('aria-hidden', 'true');
      if (historyToggleBtn) historyToggleBtn.setAttribute('aria-expanded', 'false');
    }
    this.ui.setStatusMessage('History entry selected');
  }

  /**
   * Attach click event listeners to on-screen keypad buttons.
   */
  initKeypadListeners() {
    const grid = document.querySelector('.button-grid');
    if (!grid) return;

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const action = btn.dataset.action;
      const value = btn.dataset.value;

      this.handleAction(action, value);
    });
  }

  /**
   * Central state machine dispatcher handling all calculator actions.
   * @param {string} action 
   * @param {string} [value] 
   */
  handleAction(action, value) {
    // If calculator is in error state, any digit or AC/C resets the error
    if (this.errorState && action !== 'ac' && action !== 'c') {
      if (action === 'digit') {
        this.clearAll();
      } else {
        return; // Block chaining while error is displayed
      }
    }

    switch (action) {
      case 'digit':
        this.appendDigit(value);
        break;
      case 'decimal':
        this.appendDecimal();
        break;
      case 'op':
        this.appendOperator(value);
        break;
      case 'sqrt':
        this.appendSqrt();
        break;
      case 'percent':
        this.appendPercent();
        break;
      case 'parentheses':
        this.appendParentheses(value);
        break;
      case 'negate':
        this.toggleNegate();
        break;
      case 'backspace':
        this.handleBackspace();
        break;
      case 'c':
        this.clearEntry();
        break;
      case 'ac':
        this.clearAll();
        break;
      case 'equals':
        this.evaluateExpression();
        break;
      
      // Memory Actions
      case 'mc':
        this.memory.clear();
        this.ui.updateMemoryIndicator(this.memory.hasValue());
        this.ui.setStatusMessage('Memory Cleared');
        break;
      case 'mr':
        if (this.memory.hasValue()) {
          const memVal = this.memory.recall().toString();
          if (this.isEvaluated) {
            this.expressionStr = memVal;
            this.isEvaluated = false;
          } else {
            this.expressionStr += memVal;
          }
          this.currentInput = memVal;
          this.updateDisplay();
          this.ui.setStatusMessage('Memory Recalled');
        }
        break;
      case 'mplus':
        this.handleMemoryModify('add');
        break;
      case 'mminus':
        this.handleMemoryModify('subtract');
        break;
      default:
        break;
    }
  }

  /**
   * Handles M+ and M- actions.
   * @param {'add'|'subtract'} mode 
   */
  handleMemoryModify(mode) {
    let targetVal = 0;

    if (this.lastResult !== null && this.isEvaluated) {
      targetVal = this.lastResult;
    } else if (this.expressionStr !== '') {
      const evalRes = this.engine.evaluate(this.expressionStr);
      if (evalRes.success) {
        targetVal = evalRes.result;
      } else {
        return; // Ignore if current input is invalid
      }
    } else {
      targetVal = parseFloat(this.currentInput) || 0;
    }

    if (mode === 'add') {
      this.memory.add(targetVal);
      this.ui.setStatusMessage(`Added ${targetVal} to Memory`);
    } else {
      this.memory.subtract(targetVal);
      this.ui.setStatusMessage(`Subtracted ${targetVal} from Memory`);
    }

    this.ui.updateMemoryIndicator(this.memory.hasValue());
  }

  /**
   * Appends digit (0-9) to current expression.
   * @param {string} digit 
   */
  appendDigit(digit) {
    if (this.isEvaluated) {
      this.expressionStr = digit;
      this.currentInput = digit;
      this.isEvaluated = false;
    } else {
      if (this.currentInput === '0' && digit === '0') return; // Prevent multiple leading zeros
      if (this.expressionStr === '0') {
        this.expressionStr = digit;
      } else {
        this.expressionStr += digit;
      }
      this.currentInput += digit;
    }
    this.updateDisplay();
  }

  /**
   * Appends decimal point avoiding duplicates within current number token.
   */
  appendDecimal() {
    if (this.isEvaluated) {
      this.expressionStr = '0.';
      this.currentInput = '0.';
      this.isEvaluated = false;
      this.updateDisplay();
      return;
    }

    // Extract current trailing number token
    const lastNumMatch = this.expressionStr.match(/[0-9.]*$/);
    const currentNumToken = lastNumMatch ? lastNumMatch[0] : '';

    if (!currentNumToken.includes('.')) {
      if (currentNumToken === '' || /[\+\-\*\/÷×\^\(]$/.test(this.expressionStr)) {
        this.expressionStr += '0.';
      } else {
        this.expressionStr += '.';
      }
      this.updateDisplay();
    }
  }

  /**
   * Appends operator (+, -, *, /, ^).
   * @param {string} op 
   */
  appendOperator(op) {
    if (this.isEvaluated && this.lastResult !== null) {
      this.expressionStr = this.lastResult.toString() + op;
      this.isEvaluated = false;
    } else {
      if (this.expressionStr === '' && op === '-') {
        this.expressionStr = '-';
      } else if (this.expressionStr !== '') {
        // Prevent duplicate consecutive operators
        if (/[\+\-\*\/÷×\^]$/.test(this.expressionStr)) {
          this.expressionStr = this.expressionStr.slice(0, -1) + op;
        } else {
          this.expressionStr += op;
        }
      }
    }
    this.currentInput = '';
    this.updateDisplay();
  }

  /**
   * Appends square root symbol (√).
   */
  appendSqrt() {
    if (this.isEvaluated) {
      this.expressionStr = '√';
      this.isEvaluated = false;
    } else {
      // If trailing character is a number, insert multiplication
      if (/[0-9]$/.test(this.expressionStr)) {
        this.expressionStr += '*√';
      } else {
        this.expressionStr += '√';
      }
    }
    this.updateDisplay();
  }

  /**
   * Appends percent symbol (%).
   */
  appendPercent() {
    if (this.expressionStr !== '' && /[0-9\)]$/.test(this.expressionStr)) {
      this.expressionStr += '%';
      this.updateDisplay();
    }
  }

  /**
   * Handles opening or closing parentheses ( ).
   * @param {string} [type] 
   */
  appendParentheses(type) {
    if (type === '(' || type === ')') {
      this.expressionStr += type;
      this.updateDisplay();
      return;
    }

    // Auto-toggle '(' or ')' based on open count
    const openCount = (this.expressionStr.match(/\(/g) || []).length;
    const closeCount = (this.expressionStr.match(/\)/g) || []).length;

    if (openCount > closeCount && /[0-9%]$/.test(this.expressionStr)) {
      this.expressionStr += ')';
    } else {
      if (/[0-9]$/.test(this.expressionStr)) {
        this.expressionStr += '*(';
      } else {
        this.expressionStr += '(';
      }
    }
    this.updateDisplay();
  }

  /**
   * Toggles positive / negative (±) sign.
   */
  toggleNegate() {
    if (this.isEvaluated && this.lastResult !== null) {
      this.lastResult = -this.lastResult;
      this.expressionStr = this.lastResult.toString();
      this.updateDisplay();
      return;
    }

    if (this.expressionStr.startsWith('-')) {
      this.expressionStr = this.expressionStr.slice(1);
    } else {
      this.expressionStr = '-' + this.expressionStr;
    }
    this.updateDisplay();
  }

  /**
   * Deletes last entered character (Backspace).
   */
  handleBackspace() {
    if (this.isEvaluated) {
      this.clearAll();
      return;
    }

    if (this.expressionStr.length > 0) {
      this.expressionStr = this.expressionStr.slice(0, -1);
      this.updateDisplay();
    }
  }

  /**
   * Clear Entry (C) - Resets current input line.
   */
  clearEntry() {
    this.expressionStr = '';
    this.currentInput = '0';
    this.errorState = null;
    this.updateDisplay();
    this.ui.setStatusMessage('Entry Cleared');
  }

  /**
   * All Clear (AC) - Resets state completely.
   */
  clearAll() {
    this.expressionStr = '';
    this.currentInput = '0';
    this.lastResult = null;
    this.lastOp = null;
    this.lastOperand = null;
    this.isEvaluated = false;
    this.errorState = null;
    this.updateDisplay();
    this.ui.setStatusMessage('Ready');
  }

  /**
   * Evaluates the current mathematical expression using CalcEngine and logs to History.
   */
  evaluateExpression() {
    if (!this.expressionStr || this.expressionStr.trim() === '') {
      return;
    }

    const evalRes = this.engine.evaluate(this.expressionStr);

    if (evalRes.success) {
      const formattedResult = evalRes.result;
      this.ui.updateSecondaryDisplay(`${this.expressionStr} =`);
      this.ui.updatePrimaryDisplay(formattedResult.toString());
      this.ui.announceSR(`Equals ${formattedResult}`);

      // Log to history drawer & localStorage
      this.history.addEntry(this.expressionStr, formattedResult);

      this.lastResult = formattedResult;
      this.isEvaluated = true;
      this.errorState = null;
      this.ui.setStatusMessage('Calculation Complete');
    } else {
      // Error handling state (PRD Section 8)
      this.errorState = evalRes.error;
      this.ui.updateSecondaryDisplay(this.expressionStr);
      this.ui.updatePrimaryDisplay(evalRes.message, true);
      this.ui.announceSR(evalRes.message);
      this.ui.setStatusMessage('Error');
    }
  }

  /**
   * Updates display elements based on current expression state.
   */
  updateDisplay() {
    const displayText = this.expressionStr === '' ? '0' : this.expressionStr;
    this.ui.updateSecondaryDisplay('');
    this.ui.updatePrimaryDisplay(displayText);
  }
}

// Instantiate App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.calcApp = new CalculatorApp();
});
