/* ===== CHI-SQUARE MODULE CONTROLLER ===== */

window.ModuleChiSquare = {

  contingencyRows: 2,
  contingencyCols: 2,

  render(container) {
    const hasData = AppState.hasData();
    container.innerHTML = `
      <div class="module-header">
        <h2>Chi-Square Tests</h2>
        <p>Test for independence between categorical variables or goodness-of-fit against expected distributions.</p>
      </div>

      ${!hasData ? Utils.onboardingGuide({
        steps: [
          { title: 'Choose a test type', desc: '<strong>Independence</strong>: tests if two categorical variables are related (uses a contingency table). <strong>Goodness-of-Fit</strong>: tests if observed frequencies match expected frequencies.' },
          { title: 'Enter your data', desc: 'For Independence, fill in the contingency table directly (or click <strong>Load Example</strong>). For Goodness-of-Fit, enter observed and expected values as comma-separated numbers, or load a dataset.' },
          { title: 'Run the test', desc: 'View \u03C7\u00B2 statistic, p-value, expected frequencies table, observed vs expected bar chart, and the reject/fail to reject decision.' }
        ],
        exampleKey: 'survey-responses',
        exampleLabel: 'Survey Data (5 categories)'
      }) : ''}

      <div class="card" style="margin-bottom:20px">
        <div class="sub-tabs" id="chiTabs">
          <button class="sub-tab active" data-tab="chi-indep">Test of Independence</button>
          <button class="sub-tab" data-tab="chi-gof">Goodness-of-Fit</button>
        </div>

        <!-- Independence Test -->
        <div class="sub-panel active" id="panel-chi-indep">
          <div class="contingency-controls">
            <label>Rows:</label>
            <input type="number" id="chiRows" value="2" min="2" max="10">
            <label>Columns:</label>
            <input type="number" id="chiCols" value="2" min="2" max="10">
            <button class="btn btn-secondary btn-sm" id="chiUpdateGrid">Update Grid</button>
            <button class="btn btn-ghost btn-sm" id="chiLoadExample">Load Example</button>
          </div>
          <div class="data-grid-wrapper" style="margin:12px 0">
            <div id="chiGrid"></div>
          </div>
          <button class="btn btn-primary" id="chiIndepCompute">Run Test</button>
        </div>

        <!-- Goodness-of-Fit -->
        <div class="sub-panel" id="panel-chi-gof">
          <p class="text-secondary" style="font-size:0.85rem;margin-bottom:12px">
            Enter observed and expected frequencies. Use variables from your data or enter manually.
          </p>
          <div class="var-selector">
            <div class="form-group">
              <label>Observed (Variable)</label>
              <select id="chiGofObs">
                <option value="-1">-- Enter manually --</option>
                ${DataManager.getVariableOptions()}
              </select>
            </div>
            <div class="form-group">
              <label>Expected (Variable)</label>
              <select id="chiGofExp">
                <option value="-1">-- Enter manually --</option>
                ${AppState.data.headers.map((h, i) =>
                  `<option value="${i}" ${i === 1 ? 'selected' : ''}>${Utils.escHtml(h)}</option>`
                ).join('')}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Observed values (comma-separated)</label>
            <input type="text" id="chiGofObsInput" placeholder="e.g., 45, 35, 20, 50, 30">
          </div>
          <div class="form-group">
            <label>Expected values (comma-separated)</label>
            <input type="text" id="chiGofExpInput" placeholder="e.g., 36, 36, 36, 36, 36">
          </div>
          <button class="btn btn-primary" id="chiGofCompute">Run Test</button>
        </div>
      </div>

      <!-- Results -->
      <div id="chiResults" style="display:none">
        <div class="module-grid">
          <div class="card">
            <div class="card-header"><h3 id="chiTestType">Results</h3></div>
            <div class="card-body">
              <div class="results-grid" id="chiResultsGrid"></div>
              <div class="decision-box" id="chiDecision"></div>
              <div id="chiExpectedTable"></div>
              <div class="interpretation" id="chiInterpretation"></div>
              <details style="margin-top:12px">
                <summary>Step-by-step calculation</summary>
                <div class="details-content" id="chiSteps"></div>
              </details>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h3>Comparison</h3></div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="chiChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Tab switching
    $$('#chiTabs .sub-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('#chiTabs .sub-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        $$('#panel-chi-indep, #panel-chi-gof').forEach(p => p.classList.remove('active'));
        $(`#panel-${tab.dataset.tab}`).classList.add('active');
      });
    });

    // Update GoF inputs from variable selection
    $('#chiGofObs').addEventListener('change', () => {
      const idx = parseInt($('#chiGofObs').value);
      if (idx >= 0) $('#chiGofObsInput').value = AppState.getColumn(idx).join(', ');
    });
    $('#chiGofExp').addEventListener('change', () => {
      const idx = parseInt($('#chiGofExp').value);
      if (idx >= 0) $('#chiGofExpInput').value = AppState.getColumn(idx).join(', ');
    });

    $('#chiUpdateGrid').addEventListener('click', () => this.buildContingencyGrid());
    $('#chiLoadExample').addEventListener('click', () => this.loadContingencyExample());
    $('#chiIndepCompute').addEventListener('click', () => this.runIndependence());
    $('#chiGofCompute').addEventListener('click', () => this.runGoodnessOfFit());

    this.buildContingencyGrid();

    Utils.bindGuideButtons(container, () => {
      UI.switchModule('chi-square');
      setTimeout(() => {
        document.querySelector('[data-tab="chi-gof"]').click();
        setTimeout(() => {
          const obs = $('#chiGofObs');
          if (obs) { obs.value = '0'; obs.dispatchEvent(new Event('change')); }
          const exp = $('#chiGofExp');
          if (exp) { exp.value = '1'; exp.dispatchEvent(new Event('change')); }
          setTimeout(() => { const btn = $('#chiGofCompute'); if (btn) btn.click(); }, 100);
        }, 100);
      }, 100);
    });
  },

  buildContingencyGrid() {
    const rows = parseInt($('#chiRows').value) || 2;
    const cols = parseInt($('#chiCols').value) || 2;
    this.contingencyRows = rows;
    this.contingencyCols = cols;

    let html = '<table class="data-table"><thead><tr><th></th>';
    for (let j = 0; j < cols; j++) html += `<th>Col ${j + 1}</th>`;
    html += '</tr></thead><tbody>';
    for (let i = 0; i < rows; i++) {
      html += `<tr><td class="text-muted" style="font-weight:600">Row ${i + 1}</td>`;
      for (let j = 0; j < cols; j++) {
        html += `<td contenteditable="true" data-row="${i}" data-col="${j}" class="chi-cell">0</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    $('#chiGrid').innerHTML = html;
  },

  loadContingencyExample() {
    $('#chiRows').value = 3;
    $('#chiCols').value = 3;
    this.buildContingencyGrid();
    const data = [[40, 30, 20], [25, 35, 30], [15, 25, 45]];
    const cells = $$('#chiGrid .chi-cell');
    let idx = 0;
    data.forEach(row => {
      row.forEach(val => {
        if (cells[idx]) cells[idx].textContent = val;
        idx++;
      });
    });
  },

  readContingencyTable() {
    const rows = this.contingencyRows;
    const cols = this.contingencyCols;
    const observed = [];
    for (let i = 0; i < rows; i++) {
      observed[i] = [];
      for (let j = 0; j < cols; j++) {
        const cell = $(`#chiGrid td[data-row="${i}"][data-col="${j}"]`);
        observed[i][j] = parseFloat(cell?.textContent) || 0;
      }
    }
    return observed;
  },

  runIndependence() {
    const observed = this.readContingencyTable();
    const result = StatsChiSquare.chiSquareIndependence(observed);
    if (!result) { Utils.toast('Invalid data', 'error'); return; }
    this.displayResult(result, observed);
  },

  runGoodnessOfFit() {
    const obsStr = $('#chiGofObsInput').value;
    const expStr = $('#chiGofExpInput').value;
    const observed = obsStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const expected = expStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

    if (!observed.length || !expected.length) {
      Utils.toast('Enter valid observed and expected values', 'warning');
      return;
    }
    if (observed.length !== expected.length) {
      Utils.toast('Observed and expected must have the same number of categories', 'warning');
      return;
    }

    const result = StatsChiSquare.chiSquareGoodnessOfFit(observed, expected);
    if (!result) { Utils.toast('Invalid data', 'error'); return; }
    this.displayResult(result, null, observed, expected);
  },

  displayResult(result, observed2D, obsArr, expArr) {
    $('#chiResults').style.display = '';
    $('#chiTestType').textContent = result.testType;

    const metrics = [
      { label: '\u03C7\u00B2', value: Utils.fmt(result.chi2) },
      { label: 'df', value: result.df },
      { label: 'p-value', value: Utils.pFmt(result.pValue) },
      { label: 'Critical Value', value: Utils.fmt(result.critValue) }
    ];

    $('#chiResultsGrid').innerHTML = metrics.map(m =>
      `<div class="result-card">
        <div class="result-value">${m.value}</div>
        <div class="result-label">${m.label}</div>
      </div>`
    ).join('');

    const decBox = $('#chiDecision');
    decBox.textContent = result.decision;
    decBox.className = `decision-box ${result.reject ? 'reject' : 'fail-to-reject'}`;

    // Expected frequencies table (independence only)
    if (result.expected && observed2D) {
      let tbl = '<h4 style="margin:12px 0 8px;font-size:0.85rem">Expected Frequencies:</h4>';
      tbl += '<table class="data-table result-table"><thead><tr><th></th>';
      for (let j = 0; j < observed2D[0].length; j++) tbl += `<th>Col ${j+1}</th>`;
      tbl += '</tr></thead><tbody>';
      result.expected.forEach((row, i) => {
        tbl += `<tr><td style="font-weight:600">Row ${i+1}</td>`;
        row.forEach(v => { tbl += `<td class="value">${Utils.fmt(v, 2)}</td>`; });
        tbl += '</tr>';
      });
      tbl += '</tbody></table>';
      $('#chiExpectedTable').innerHTML = tbl;
    } else {
      $('#chiExpectedTable').innerHTML = '';
    }

    $('#chiInterpretation').innerHTML = `
      The ${result.testType.toLowerCase()} yielded \u03C7\u00B2 = <strong>${Utils.fmt(result.chi2)}</strong>
      with <strong>${result.df}</strong> degrees of freedom and a p-value of
      <strong>${Utils.pFmt(result.pValue)}</strong>.
      ${result.reject
        ? 'We <strong>reject the null hypothesis</strong>. There is a statistically significant difference.'
        : 'We <strong>fail to reject the null hypothesis</strong>. No significant difference was found.'}
    `;

    $('#chiSteps').innerHTML = result.steps.map(s =>
      `<div class="step-line">${Utils.escHtml(s)}</div>`
    ).join('');

    // Chart
    const canvas = document.getElementById('chiChart');
    const w = canvas.parentElement.clientWidth - 32;

    if (obsArr && expArr) {
      // GoF: grouped bar
      const labels = obsArr.map((_, i) => `Cat ${i + 1}`);
      ChartRenderer.groupedBarChart(canvas, labels, [obsArr, expArr], ['Observed', 'Expected'], {
        width: w, height: 280, title: 'Observed vs Expected'
      });
    } else if (observed2D && result.expected) {
      // Independence: flatten for comparison
      const obsFlat = observed2D.flat();
      const expFlat = result.expected.flat();
      const labels = [];
      for (let i = 0; i < observed2D.length; i++)
        for (let j = 0; j < observed2D[0].length; j++)
          labels.push(`R${i+1}C${j+1}`);
      ChartRenderer.groupedBarChart(canvas, labels, [obsFlat, expFlat], ['Observed', 'Expected'], {
        width: w, height: 280, title: 'Observed vs Expected'
      });
    }

    AppState.setResult('chi-square', result);
  }
};
