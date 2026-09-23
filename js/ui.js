/**
 * Smart Calculator - UI Manager & Theme Controller (Phase 3)
 * Handles display rendering, dynamic font scaling, accessibility announcements, and theme switcher.
 */

export class UIManager {
  constructor() {
    this.primaryDisplay = document.getElementById('primary-display');
    this.secondaryDisplay = document.getElementById('secondary-display');
    this.statusMessage = document.getElementById('status-message');
    this.memoryBadge = document.getElementById('memory-indicator');
    this.ariaLiveRegion = document.getElementById('aria-live-region');
    this.btnMC = document.getElementById('btn-mc');
    this.btnMR = document.getElementById('btn-mr');
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    this.STORAGE_KEY_THEME = 'smart_calc_theme';
    this.initTheme();
  }

  /**
   * Updates the main primary display text with dynamic font size scaling.
   * @param {string} text 
   * @param {boolean} isError 
   */
  updatePrimaryDisplay(text, isError = false) {
    if (!this.primaryDisplay) return;

    this.primaryDisplay.textContent = text;

    if (isError) {
      this.primaryDisplay.style.color = 'var(--btn-clear-bg)';
      this.primaryDisplay.style.fontSize = '1.4rem';
      return;
    }

    this.primaryDisplay.style.color = 'var(--text-primary)';

    // Dynamic Font Scaling based on character count
    const len = text.length;
    if (len > 16) {
      this.primaryDisplay.style.fontSize = '1.1rem';
    } else if (len > 12) {
      this.primaryDisplay.style.fontSize = '1.4rem';
    } else if (len > 9) {
      this.primaryDisplay.style.fontSize = '1.75rem';
    } else {
      this.primaryDisplay.style.fontSize = '2.25rem';
    }
  }

  /**
   * Updates secondary expression preview display.
   * @param {string} expr 
   */
  updateSecondaryDisplay(expr) {
    if (this.secondaryDisplay) {
      this.secondaryDisplay.textContent = expr;
    }
  }

  /**
   * Sets the status bar text message.
   * @param {string} msg 
   */
  setStatusMessage(msg) {
    if (this.statusMessage) {
      this.statusMessage.textContent = msg;
    }
  }

  /**
   * Updates memory visual indicators and button state.
   * @param {boolean} hasMemory 
   */
  updateMemoryIndicator(hasMemory) {
    if (this.memoryBadge) {
      if (hasMemory) {
        this.memoryBadge.classList.remove('hidden');
      } else {
        this.memoryBadge.classList.add('hidden');
      }
    }

    if (this.btnMC) this.btnMC.disabled = !hasMemory;
    if (this.btnMR) this.btnMR.disabled = !hasMemory;
  }

  /**
   * Announces calculation result or message to screen readers via ARIA live region.
   * @param {string} message 
   */
  announceSR(message) {
    if (this.ariaLiveRegion) {
      this.ariaLiveRegion.textContent = '';
      setTimeout(() => {
        this.ariaLiveRegion.textContent = message;
      }, 50);
    }
  }

  /**
   * Flash button visually when pressed via keyboard shortcut.
   * @param {string} selector 
   */
  flashButton(selector) {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.add('btn-pressed');
      setTimeout(() => {
        btn.classList.remove('btn-pressed');
      }, 150);
    }
  }

  /**
   * Theme Initialization
   */
  initTheme() {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY_THEME) || 'system';
    this.setTheme(savedTheme);

    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }

  /**
   * Toggles theme between dark, light, and system.
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'system';
    let nextTheme = 'dark';

    if (currentTheme === 'dark') {
      nextTheme = 'light';
    } else if (currentTheme === 'light') {
      nextTheme = 'system';
    } else {
      nextTheme = 'dark';
    }

    this.setTheme(nextTheme);
  }

  /**
   * Sets document theme attribute and saves preference.
   * @param {string} theme ('dark' | 'light' | 'system')
   */
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY_THEME, theme);
    this.setStatusMessage(`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
  }
}
