/**
 * Smart Calculator - Keyboard Event Handler (Phase 4)
 * Maps desktop keyboard keys to calculator actions and triggers tactile visual feedback.
 */

export class KeyboardHandler {
  /**
   * Binds global keydown listener.
   * @param {Function} handleAction Callback function passing action type and value
   * @param {UIManager} uiManager Reference to UI manager for button flashing
   */
  constructor(handleAction, uiManager) {
    this.handleAction = handleAction;
    this.uiManager = uiManager;
    this.initListeners();
  }

  initListeners() {
    window.addEventListener('keydown', (e) => {
      // Ignore keyboard shortcuts if user is typing inside an input/textarea element
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      const key = e.key;

      // Digits 0 - 9
      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        this.uiManager.flashButton(`#btn-${key}`);
        this.handleAction('digit', key);
        return;
      }

      // Decimal point
      if (key === '.') {
        e.preventDefault();
        this.uiManager.flashButton('#btn-decimal');
        this.handleAction('decimal', '.');
        return;
      }

      // Basic Operators
      if (key === '+') {
        e.preventDefault();
        this.uiManager.flashButton('#btn-add');
        this.handleAction('op', '+');
        return;
      }
      if (key === '-') {
        e.preventDefault();
        this.uiManager.flashButton('#btn-subtract');
        this.handleAction('op', '-');
        return;
      }
      if (key === '*') {
        e.preventDefault();
        this.uiManager.flashButton('#btn-multiply');
        this.handleAction('op', '*');
        return;
      }
      if (key === '/') {
        e.preventDefault();
        this.uiManager.flashButton('#btn-divide');
        this.handleAction('op', '/');
        return;
      }

      // Advanced Operators
      if (key === '^') {
        e.preventDefault();
        this.uiManager.flashButton('#btn-power');
        this.handleAction('op', '^');
        return;
      }
      if (key === '%') {
        e.preventDefault();
        this.uiManager.flashButton('#btn-percent');
        this.handleAction('percent', '%');
        return;
      }
      if (key === '(' || key === ')') {
        e.preventDefault();
        this.uiManager.flashButton('#btn-parentheses');
        this.handleAction('parentheses', key);
        return;
      }

      // Equals / Evaluate
      if (key === 'Enter' || key === '=') {
        e.preventDefault();
        this.uiManager.flashButton('#btn-equals');
        this.handleAction('equals');
        return;
      }

      // Backspace (Delete last character)
      if (key === 'Backspace') {
        e.preventDefault();
        this.uiManager.flashButton('#btn-backspace');
        this.handleAction('backspace');
        return;
      }

      // Escape (All Clear - AC)
      if (key === 'Escape') {
        e.preventDefault();
        this.uiManager.flashButton('#btn-ac');
        this.handleAction('ac');
        return;
      }

      // Clear (c / C key)
      if (key === 'c' || key === 'C') {
        e.preventDefault();
        this.uiManager.flashButton('#btn-c');
        this.handleAction('c');
        return;
      }

      // Unsupported keys are silently ignored (PRD Section 8)
    });
  }
}
