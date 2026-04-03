/* ===== HYPOTHESIS TESTING MODULE CONTROLLER ===== */

window.ModuleHypothesis = {

  currentSubTab: 'z-one',

  render(container) {
    const hasData = AppState.hasData();
    container.innerHTML = `
      <div class="module-header">
        <h2>Hypothesis Testing</h2>
        <p>Perform z-tests and t-tests to make inferences about population parameters.</p>
      </div>
      ${!hasData ? Utils.noDataWarning('hypothesis', 'exam-scores', 'Exam Scores') : ''}

      ${!hasData ? Utils.onboardingGuide({
        steps: [
          { title: 'Load your sample data', desc: 'You need <strong>one or two numeric variables</strong>. For one-sample tests, one column is enough. For two-sample or paired tests, you need two columns.' },
          { title: 'Choose test type', desc: 'Pick from <strong>Z-Test</strong> (known population SD) or <strong>T-Test</strong> (unknown SD). Then select one-sample, two-sample, or paired.' },
          { title: 'Set parameters', desc: 'Enter the hypothesized mean (\u03BC\u2080), significance level (\u03B1), and tail direction. Then click <strong>Test</strong>.' },
          { title: 'Read the verdict', desc: 'View the test statistic, p-value, critical value, normal curve, and a clear <strong>reject / fail to reject</strong> decision.' }
        ],
        exampleKey: 'exam-scores',
        exampleLabel: 'Exam Scores (30 values)'
      }) : ''}

      <div class="card" style="margin-bottom:20px"${!hasData ? ' hidden' : ''}>
        <div class="sub-tabs" id="hypTabs">
          <button class="sub-tab active" data-tab="z-one">Z-Test (1 Sample)</button>
          <button class="sub-tab" data-tab="z-two">Z-Test (2 Sample)</button>
          <button class="sub-tab" data-tab="t-one">T-Test (1 Sample)</button>
          <button class="sub-tab" data-tab="t-two">T-Test (2 Sample)</button>
          <button class="sub-tab" data-tab="t-paired">T-Test (Paired)</button>
        </div>

        <!-- Z-Test One Sample -->
        <div class="sub-panel active" id="panel-z-one">
          <div class="var-selector">
            <div class="form-group">
              <label>Variable</label>
              <select id="zOneVar">${DataManager.getVariableOptions()}</select>
            </div>
          </div>
          <div class="param-row">
            <div class="form-group">
              <label data-tooltip="Hypothesized population mean">\u03BC\u2080 (Hyp. Mean)</label>
              <input type="number" id="zOneMu" value="0" step="any">
            </div>
            <div class="form-group">
              <label data-tooltip="Known population standard deviation">\u03C3 (Known SD)</label>
              <input type="number" id="zOneSigma" value="1" step="any" min="0.001">
            </div>
            <div class="form-group">
              <label>\u03B1 (Significance)</label>
              <select id="zOneAlpha">
                <option value="0.01">0.01</option>
                <option value="0.05" selected>0.05</option>
                <option value="0.10">0.10</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tails</label>
              <select id="zOneTails">
                <option value="2" selected>Two-tailed</option>
                <option value="1">Right-tailed</option>
              </select>
            </div>
            <button class="btn btn-primary" id="zOneCompute">Test</button>
          </div>
        </div>

        <!-- Z-Test Two Sample -->
        <div class="sub-panel" id="panel-z-two">
          <div class="var-selector">
            <div class="form-group">
              <label>Sample 1</label>
              <select id="zTwoVar1">${DataManager.getVariableOptions()}</select>
            </div>
            <div class="form-group">
              <label>Sample 2</label>
              <select id="zTwoVar2">
                ${AppState.data.headers.map((h, i) =>
                  `<option value="${i}" ${i === 1 ? 'selected' : ''}>${Utils.escHtml(h)}</option>`
                ).join('')}
              </select>
            </div>
          </div>
          <div class="param-row">
            <div class="form-group">
              <label>\u03C3\u2081</label>
              <input type="number" id="zTwoSigma1" value="1" step="any" min="0.001">
            </div>
            <div class="form-group">
              <label>\u03C3\u2082</label>
              <input type="number" id="zTwoSigma2" value="1" step="any" min="0.001">
            </div>
            <div class="form-group">
              <label>\u03B1</label>
              <select id="zTwoAlpha">
                <option value="0.01">0.01</option>
                <option value="0.05" selected>0.05</option>
                <option value="0.10">0.10</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tails</label>
              <select id="zTwoTails">
                <option value="2" selected>Two-tailed</option>
                <option value="1">Right-tailed</option>
              </select>
            </div>
            <button class="btn btn-primary" id="zTwoCompute">Test</button>
          </div>
        </div>

        <!-- T-Test One Sample -->
        <div class="sub-panel" id="panel-t-one">
          <div class="var-selector">
            <div class="form-group">
              <label>Variable</label>
              <select id="tOneVar">${DataManager.getVariableOptions()}</select>
            </div>
          </div>
          <div class="param-row">
            <div class="form-group">
              <label>\u03BC\u2080 (Hyp. Mean)</label>
              <input type="number" id="tOneMu" value="0" step="any">
            </div>
            <div class="form-group">
              <label>\u03B1</label>
              <select id="tOneAlpha">
                <option value="0.01">0.01</option>
                <option value="0.05" selected>0.05</option>
                <option value="0.10">0.10</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tails</label>
              <select id="tOneTails">
                <option value="2" selected>Two-tailed</option>
                <option value="1">Right-tailed</option>
              </select>
            </div>
            <button class="btn btn-primary" id="tOneCompute">Test</button>
          </div>
        </div>

        <!-- T-Test Two Sample -->
        <div class="sub-panel" id="panel-t-two">
          <div class="var-selector">
            <div class="form-group">
              <label>Sample 1</label>
              <select id="tTwoVar1">${DataManager.getVariableOptions()}</select>
            </div>
            <div class="form-group">
              <label>Sample 2</label>
              <select id="tTwoVar2">
                ${AppState.data.headers.map((h, i) =>
                  `<option value="${i}" ${i === 1 ? 'selected' : ''}>${Utils.escHtml(h)}</option>`
                ).join('')}
              </select>
            </div>
          </div>
          <div class="param-row">
            <div class="form-group">
              <label>\u03B1</label>
              <select id="tTwoAlpha">
                <option value="0.01">0.01</option>
                <option value="0.05" selected>0.05</option>
                <option value="0.10">0.10</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tails</label>
              <select id="tTwoTails">
                <option value="2" selected>Two-tailed</option>
                <option value="1">Right-tailed</option>
              </select>
            </div>
            <div class="form-group">
              <label>Variance</label>
              <select id="tTwoEqualVar">
                <option value="0" selected>Unequal (Welch)</option>
                <option value="1">Equal (Pooled)</option>
              </select>
            </div>
            <button class="btn btn-primary" id="tTwoCompute">Test</button>
          </div>
        </div>

        <!-- T-Test Paired -->
        <div class="sub-panel" id="panel-t-paired">
          <div class="var-selector">
            <div class="form-group">
              <label>Before / Group 1</label>
              <select id="tPairedVar1">${DataManager.getVariableOptions()}</select>
            </div>
            <div class="form-group">
              <label>After / Group 2</label>
              <select id="tPairedVar2">
                ${AppState.data.headers.map((h, i) =>
                  `<option value="${i}" ${i === 1 ? 'selected' : ''}>${Utils.escHtml(h)}</option>`
                ).join('')}
              </select>
            </div>
          </div>
          <div class="param-row">
            <div class="form-group">
              <label>\u03B1</label>
              <select id="tPairedAlpha">
                <option value="0.01">0.01</option>
                <option value="0.05" selected>0.05</option>
                <option value="0.10">0.10</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tails</label>
              <select id="tPairedTails">
                <option value="2" selected>Two-tailed</option>
                <option value="1">Right-tailed</option>
              </select>
            </div>
            <button class="btn btn-primary" id="tPairedCompute">Test</button>
          </div>
        </div>
      </div>

      <!-- Results Area -->
      <div id="hypResults" style="display:none">
        <div class="module-grid">
          <div class="card">
            <div class="card-header">
              <h3 id="hypTestType">Test Results</h3>
            </div>
            <div class="card-body">
              <div class="results-grid" id="hypResultsGrid"></div>
              <div class="decision-box" id="hypDecision"></div>
              <div class="interpretation" id="hypInterpretation"></div>
              <details style="margin-top:12px">
                <summary>Step-by-step calculation</summary>
                <div class="details-content" id="hypSteps"></div>
              </details>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h3>Distribution</h3></div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="hypChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (hasData) {
      // Tab switching
      $$('#hypTabs .sub-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          $$('#hypTabs .sub-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          $$('.sub-panel').forEach(p => p.classList.remove('active'));
          const panel = document.getElementById(`panel-${tab.dataset.tab}`);
          if (panel) panel.classList.add('active');
          this.currentSubTab = tab.dataset.tab;
        });
      });

      // Compute buttons
      $('#zOneCompute').addEventListener('click', () => this.runZOne());
      $('#zTwoCompute').addEventListener('click', () => this.runZTwo());
      $('#tOneCompute').addEventListener('click', () => this.runTOne());
      $('#tTwoCompute').addEventListener('click', () => this.runTTwo());
      $('#tPairedCompute').addEventListener('click', () => this.runTPaired());
    }

    Utils.bindGuideButtons(container, () => {
      UI.switchModule('hypothesis');
      setTimeout(() => {
        const tab = document.querySelector('[data-tab="t-one"]');
        if (tab) tab.click();
        setTimeout(() => {
          const mu = $('#tOneMu');
          if (mu) mu.value = '85';
          const btn = $('#tOneCompute');
          if (btn) btn.click();
        }, 100);
      }, 100);
    });
  },

  displayResult(result) {
    $('#hypResults').style.display = '';
    $('#hypTestType').textContent = result.testType;

    const stat = result.z !== undefined ? result.z : result.t;
    const statLabel = result.z !== undefined ? 'z-statistic' : 't-statistic';
    const critVal = result.zCrit !== undefined ? result.zCrit : result.tCrit;

    const metrics = [
      { label: statLabel, value: Utils.fmt(stat) },
      { label: 'p-value', value: Utils.pFmt(result.pValue) },
      { label: 'Critical Value', value: '\u00B1' + Utils.fmt(critVal) },
      { label: 'df', value: result.df !== undefined ? result.df : '—' },
      { label: '\u03B1', value: result.alpha },
      { label: 'Tails', value: result.tails }
    ];

    $('#hypResultsGrid').innerHTML = metrics.map(m =>
      `<div class="result-card">
        <div class="result-value">${m.value}</div>
        <div class="result-label">${m.label}</div>
      </div>`
    ).join('');

    const decBox = $('#hypDecision');
    decBox.textContent = result.decision;
    decBox.className = `decision-box ${result.reject ? 'reject' : 'fail-to-reject'}`;

    $('#hypInterpretation').innerHTML = `
      The ${result.testType.toLowerCase()} yielded a test statistic of <strong>${Utils.fmt(stat)}</strong>
      with a p-value of <strong>${Utils.pFmt(result.pValue)}</strong>.
      At a significance level of \u03B1 = ${result.alpha}, we <strong>${result.reject ? 'reject' : 'fail to reject'}</strong>
      the null hypothesis. ${result.reject
        ? 'There is sufficient evidence to conclude a statistically significant difference.'
        : 'There is not enough evidence to conclude a statistically significant difference.'}
    `;

    $('#hypSteps').innerHTML = result.steps.map(s =>
      `<div class="step-line">${Utils.escHtml(s)}</div>`
    ).join('');

    // Normal curve
    const canvas = document.getElementById('hypChart');
    const w = canvas.parentElement.clientWidth - 32;
    ChartRenderer.normalCurve(canvas, 0, 1, stat, result.alpha, result.tails, {
      width: w, height: 250, title: result.testType
    });

    AppState.setResult('hypothesis', result);
  },

  runZOne() {
    const data = AppState.getColumn(parseInt($('#zOneVar').value));
    if (!data.length) { Utils.toast('No data', 'warning'); return; }
    const mu0 = parseFloat($('#zOneMu').value);
    const sigma = parseFloat($('#zOneSigma').value);
    const alpha = parseFloat($('#zOneAlpha').value);
    const tails = parseInt($('#zOneTails').value);
    this.displayResult(StatsHypothesis.zTestOneSample(data, mu0, sigma, alpha, tails));
  },

  runZTwo() {
    const d1 = AppState.getColumn(parseInt($('#zTwoVar1').value));
    const d2 = AppState.getColumn(parseInt($('#zTwoVar2').value));
    if (!d1.length || !d2.length) { Utils.toast('Need both samples', 'warning'); return; }
    const s1 = parseFloat($('#zTwoSigma1').value);
    const s2 = parseFloat($('#zTwoSigma2').value);
    const alpha = parseFloat($('#zTwoAlpha').value);
    const tails = parseInt($('#zTwoTails').value);
    this.displayResult(StatsHypothesis.zTestTwoSample(d1, d2, s1, s2, alpha, tails));
  },

  runTOne() {
    const data = AppState.getColumn(parseInt($('#tOneVar').value));
    if (!data.length) { Utils.toast('No data', 'warning'); return; }
    const mu0 = parseFloat($('#tOneMu').value);
    const alpha = parseFloat($('#tOneAlpha').value);
    const tails = parseInt($('#tOneTails').value);
    this.displayResult(StatsHypothesis.tTestOneSample(data, mu0, alpha, tails));
  },

  runTTwo() {
    const d1 = AppState.getColumn(parseInt($('#tTwoVar1').value));
    const d2 = AppState.getColumn(parseInt($('#tTwoVar2').value));
    if (!d1.length || !d2.length) { Utils.toast('Need both samples', 'warning'); return; }
    const alpha = parseFloat($('#tTwoAlpha').value);
    const tails = parseInt($('#tTwoTails').value);
    const equalVar = $('#tTwoEqualVar').value === '1';
    this.displayResult(StatsHypothesis.tTestTwoSample(d1, d2, alpha, tails, equalVar));
  },

  runTPaired() {
    const d1 = AppState.getColumn(parseInt($('#tPairedVar1').value));
    const d2 = AppState.getColumn(parseInt($('#tPairedVar2').value));
    if (!d1.length || !d2.length) { Utils.toast('Need both samples', 'warning'); return; }
    const alpha = parseFloat($('#tPairedAlpha').value);
    const tails = parseInt($('#tPairedTails').value);
    this.displayResult(StatsHypothesis.tTestPaired(d1, d2, alpha, tails));
  }
};
