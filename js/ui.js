/* ===== UI CONTROLLER ===== */

window.UI = {

  modules: {
    'data-input': { name: 'Data Input', icon: 'database', render: null },
    'descriptive': { name: 'Descriptive', icon: 'bar-chart', render: () => ModuleDescriptive.render($('#panel-descriptive')) },
    'correlation': { name: 'Correlation', icon: 'trending-up', render: () => ModuleCorrelation.render($('#panel-correlation')) },
    'regression': { name: 'Regression', icon: 'git-commit', render: () => ModuleRegression.render($('#panel-regression')) },
    'hypothesis': { name: 'Hypothesis', icon: 'check-circle', render: () => ModuleHypothesis.render($('#panel-hypothesis')) },
    'chi-square': { name: 'Chi-Square', icon: 'grid', render: () => ModuleChiSquare.render($('#panel-chi-square')) },
    'anova': { name: 'ANOVA', icon: 'layers', render: () => ModuleAnova.render($('#panel-anova')) },
    'bayesian': { name: 'Bayesian', icon: 'cpu', render: () => ModuleBayesian.render($('#panel-bayesian')) },
    'ai-insights': { name: 'AI Insights', icon: 'cpu', render: () => AIInsights.render($('#panel-ai-insights')) }
  },

  switchModule(moduleName) {
    if (!this.modules[moduleName]) return;

    AppState.setModule(moduleName);

    // Update nav
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    $$(`.nav-item[data-module="${moduleName}"]`).forEach(n => n.classList.add('active'));

    // Update mobile tabs
    $$('.mobile-tab').forEach(t => t.classList.remove('active'));
    $$(`.mobile-tab[data-module="${moduleName}"]`).forEach(t => t.classList.add('active'));

    // Show/hide panels
    $$('.module-panel').forEach(p => p.classList.remove('active'));
    const panel = $(`#panel-${moduleName}`);
    if (panel) {
      panel.classList.add('active');
      // Render module content
      const mod = this.modules[moduleName];
      if (mod.render) mod.render();
    }
  },

  renderDataInputPanel() {
    const panel = $('#panel-data-input');
    panel.innerHTML = `
      <div class="module-header">
        <h2>Data Input</h2>
        <p>Enter your data as CSV text or edit the table directly. Load an example dataset to get started.</p>
      </div>

      <div class="card" style="margin-bottom:20px">
        <div class="card-header">
          <h3>Example Datasets</h3>
        </div>
        <div class="card-body">
          <div class="example-datasets" id="exampleDatasets"></div>
        </div>
      </div>

      <div class="module-grid">
        <div class="card">
          <div class="card-header">
            <h3>CSV Input</h3>
            <div>
              <button class="btn btn-sm btn-secondary" id="parseCSVBtn">Parse</button>
            </div>
          </div>
          <div class="card-body">
            <textarea id="csvInput" placeholder="Paste CSV data here...\nHeaders in first row (optional)\n\nExample:\nHeight,Weight\n170,68\n165,62\n180,80">${Utils.escHtml(AppState.data.raw)}</textarea>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Data Grid</h3>
            <div style="display:flex;gap:4px">
              <button class="btn btn-sm btn-ghost" id="addRowBtn" data-tooltip="Add Row">+ Row</button>
              <button class="btn btn-sm btn-ghost" id="addColBtn" data-tooltip="Add Column">+ Col</button>
              <button class="btn btn-sm btn-danger" id="resetDataBtn">Reset</button>
            </div>
          </div>
          <div class="card-body">
            <div class="data-grid-wrapper" id="dataGridWrapper"></div>
          </div>
        </div>

        <div class="card full-width" id="dataSummaryCard" style="display:none">
          <div class="card-header"><h3>Data Summary</h3></div>
          <div class="card-body">
            <div class="results-grid" id="dataSummary"></div>
          </div>
        </div>
      </div>
    `;

    // Example dataset buttons
    const exContainer = $('#exampleDatasets');
    Object.entries(DataManager.EXAMPLES).forEach(([key, ex]) => {
      const btn = Utils.el('button', {
        className: 'example-btn',
        textContent: ex.name,
        'data-tooltip': ex.description,
        onClick: () => {
          DataManager.loadExample(key);
          this.refreshDataUI();
          Utils.toast(`Loaded: ${ex.name}`, 'success');
        }
      });
      exContainer.appendChild(btn);
    });

    // Event handlers
    $('#parseCSVBtn').addEventListener('click', () => {
      DataManager.parseCSV($('#csvInput').value);
      this.refreshDataUI();
    });

    $('#resetDataBtn').addEventListener('click', () => {
      AppState.reset();
      this.refreshDataUI();
      Utils.toast('Data cleared', 'info');
    });

    $('#addRowBtn').addEventListener('click', () => this.addGridRow());
    $('#addColBtn').addEventListener('click', () => this.addGridCol());

    // Auto-parse on paste
    $('#csvInput').addEventListener('paste', () => {
      setTimeout(() => {
        DataManager.parseCSV($('#csvInput').value);
        this.refreshDataUI();
      }, 50);
    });

    this.refreshDataUI();
  },

  refreshDataUI() {
    const gridWrapper = $('#dataGridWrapper');
    if (gridWrapper) {
      gridWrapper.innerHTML = DataManager.buildGridHTML();

      // Attach grid editing listeners
      const grid = $('#dataGrid');
      if (grid) {
        grid.addEventListener('input', Utils.debounce(() => {
          DataManager.syncFromGrid(grid);
          this.updateDataSummary();
        }, 400));
      }
    }

    // Update textarea
    const csvInput = $('#csvInput');
    if (csvInput && AppState.data.raw) {
      csvInput.value = AppState.data.raw;
    }

    this.updateDataSummary();
  },

  updateDataSummary() {
    const card = $('#dataSummaryCard');
    const container = $('#dataSummary');
    if (!card || !container) return;

    if (!AppState.hasData()) {
      card.style.display = 'none';
      return;
    }

    card.style.display = '';
    const { headers, columns } = AppState.data;

    container.innerHTML = headers.map((h, i) => {
      const col = columns[i];
      return `<div class="result-card">
        <div class="result-value">${col.length}</div>
        <div class="result-label">${Utils.escHtml(h)}</div>
      </div>`;
    }).join('');
  },

  addGridRow() {
    if (!AppState.hasData()) return;
    AppState.data.rows.push(new Array(AppState.data.headers.length).fill(''));
    this.refreshDataUI();
  },

  addGridCol() {
    const name = `Var ${AppState.data.headers.length + 1}`;
    AppState.data.headers.push(name);
    AppState.data.columns.push([]);
    AppState.data.rows.forEach(r => r.push(''));
    this.refreshDataUI();
  },

  /* ===== THEME ===== */

  initTheme() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.theme) || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    AppState.theme = saved;
    this.updateThemeIcon();
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(CONFIG.STORAGE_KEYS.theme, next);
    AppState.theme = next;
    this.updateThemeIcon();
  },

  updateThemeIcon() {
    const btn = $('#themeToggle');
    if (!btn) return;
    const isDark = AppState.theme === 'dark';
    btn.innerHTML = isDark
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
  }
};
