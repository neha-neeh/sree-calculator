/**
 * Smart Calculator - History Manager & Local Storage (Phase 5)
 * Logs calculation history, persists to localStorage, and powers the History drawer UI.
 */

export class HistoryManager {
  constructor(onSelectEntryCallback) {
    this.STORAGE_KEY = 'smart_calc_history';
    this.MAX_ENTRIES = 100;
    this.history = this.loadHistory();
    this.onSelectEntryCallback = onSelectEntryCallback;

    this.historyListEl = document.getElementById('history-list');
    this.clearBtn = document.getElementById('clear-history-btn');

    this.initUI();
    this.render();
  }

  /**
   * Loads history entries from localStorage.
   * @returns {Array<{id: string, expression: string, result: number|string, timestamp: string}>}
   */
  loadHistory() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to load history from localStorage:', e);
      return [];
    }
  }

  /**
   * Saves current history array to localStorage.
   */
  saveHistory() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
    } catch (e) {
      console.warn('Failed to save history to localStorage:', e);
    }
  }

  /**
   * Adds a new calculation record to history.
   * @param {string} expression 
   * @param {number|string} result 
   */
  addEntry(expression, result) {
    const record = {
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      expression: expression,
      result: result,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Prepend new entry
    this.history.unshift(record);

    // Enforce MAX_ENTRIES FIFO limit
    if (this.history.length > this.MAX_ENTRIES) {
      this.history = this.history.slice(0, this.MAX_ENTRIES);
    }

    this.saveHistory();
    this.render();
  }

  /**
   * Clears all recorded history.
   */
  clearAll() {
    this.history = [];
    this.saveHistory();
    this.render();
  }

  /**
   * Deletes a single entry by ID.
   * @param {string} id 
   */
  deleteEntry(id) {
    this.history = this.history.filter(item => item.id !== id);
    this.saveHistory();
    this.render();
  }

  /**
   * Initializes event listeners for history UI actions.
   */
  initUI() {
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        this.clearAll();
      });
    }

    if (this.historyListEl) {
      this.historyListEl.addEventListener('click', (e) => {
        const item = e.target.closest('.history-item');
        if (!item) return;

        const resultVal = item.dataset.result;
        if (resultVal && typeof this.onSelectEntryCallback === 'function') {
          this.onSelectEntryCallback(resultVal);
        }
      });
    }
  }

  /**
   * Renders history list into the DOM.
   */
  render() {
    if (!this.historyListEl) return;

    if (this.history.length === 0) {
      this.historyListEl.innerHTML = `<li class="history-empty-state">No calculations recorded yet.</li>`;
      return;
    }

    this.historyListEl.innerHTML = this.history.map(item => `
      <li class="history-item" data-id="${item.id}" data-result="${item.result}" role="button" tabindex="0" aria-label="Insert result ${item.result} from calculation ${item.expression}">
        <span class="history-item-expr">${this.escapeHTML(item.expression)} =</span>
        <span class="history-item-result">${this.escapeHTML(item.result.toString())}</span>
      </li>
    `).join('');
  }

  /**
   * Utility to escape HTML strings.
   * @param {string} str 
   * @returns {string}
   */
  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}
