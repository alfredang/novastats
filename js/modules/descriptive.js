/* ===== DESCRIPTIVE STATISTICS MODULE CONTROLLER ===== */

window.ModuleDescriptive = {

  render(container) {
    const hasData = AppState.hasData();
    container.innerHTML = `
      <div class="module-header">
        <h2>Descriptive Statistics</h2>
        <p>Calculate central tendency, dispersion, and distribution measures for your data.</p>
      </div>
      ${!hasData ? Utils.noDataWarning('descriptive', 'exam-scores', 'Exam Scores') : ''}
      <div class="module-grid">
        <div class="card">
          <div class="card-header"><h3>Variable Selection</h3></div>
          <div class="card-body">
            ${hasData ? `
              <div class="var-selector">
                <div class="form-group">
                  <label>Select Variable</label>
                  <select id="descVar">${DataManager.getVariableOptions()}</select>
                </div>
                <button class="btn btn-primary" id="descCompute">Calculate</button>
              </div>
            ` : `<p class="text-muted" style="font-size:0.85rem">Load a dataset to select variables.</p>`}
          </div>
        </div>

        ${!hasData ? Utils.onboardingGuide({
          steps: [
            { title: 'Load or enter data', desc: 'Go to <strong>Data Input</strong> and paste CSV data, or click an example dataset below.' },
            { title: 'Select a variable', desc: 'Choose which column (variable) to analyze from the dropdown.' },
            { title: 'Click Calculate', desc: 'View mean, median, mode, variance, standard deviation, quartiles, histogram, and a plain English interpretation.' }
          ],
          exampleKey: 'exam-scores',
          exampleLabel: 'Exam Scores (30 values)'
        }) : ''}

        <div class="card" id="descChartCard" style="display:none">
          <div class="card-header"><h3>Distribution</h3></div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="descChart"></canvas>
            </div>
          </div>
        </div>

        <div class="card full-width" id="descResultsCard" style="display:none">
          <div class="card-header">
            <h3>Results</h3>
            <span class="badge badge-accent" id="descVarName"></span>
          </div>
          <div class="card-body">
            <div class="results-grid" id="descResultsGrid"></div>
            <div class="interpretation" id="descInterpretation"></div>
            <details style="margin-top:12px">
              <summary>Step-by-step calculation</summary>
              <div class="details-content" id="descSteps"></div>
            </details>
          </div>
        </div>
      </div>
    `;

    const descBtn = $('#descCompute');
    if (descBtn) descBtn.addEventListener('click', () => this.compute());

    Utils.bindGuideButtons(container, () => {
      UI.switchModule('descriptive');
      setTimeout(() => {
        const btn = $('#descCompute');
        if (btn) btn.click();
      }, 100);
    });
  },

  compute() {
    const varIdx = parseInt($('#descVar').value);
    const data = AppState.getColumn(varIdx);
    if (!data || data.length === 0) {
      Utils.toast('No data available for this variable', 'warning');
      return;
    }

    const result = StatsDescriptive.compute(data);
    const varName = AppState.data.headers[varIdx];
    AppState.setResult('descriptive', result);

    // Show results
    $('#descResultsCard').style.display = '';
    $('#descChartCard').style.display = '';
    $('#descVarName').textContent = varName;

    const metrics = [
      { label: 'Count (n)', value: result.n },
      { label: 'Mean', value: Utils.fmt(result.mean) },
      { label: 'Median', value: Utils.fmt(result.median) },
      { label: 'Mode', value: result.mode.text || '—' },
      { label: 'Sample Var', value: Utils.fmt(result.sampleVariance) },
      { label: 'Pop Var', value: Utils.fmt(result.populationVariance) },
      { label: 'Sample SD', value: Utils.fmt(result.sampleStdDev) },
      { label: 'Pop SD', value: Utils.fmt(result.populationStdDev) },
      { label: 'Min', value: Utils.fmt(result.min) },
      { label: 'Max', value: Utils.fmt(result.max) },
      { label: 'Range', value: Utils.fmt(result.range) },
      { label: 'Q1', value: Utils.fmt(result.q1) },
      { label: 'Q3', value: Utils.fmt(result.q3) },
      { label: 'IQR', value: Utils.fmt(result.iqr) }
    ];

    $('#descResultsGrid').innerHTML = metrics.map(m =>
      `<div class="result-card">
        <div class="result-value">${m.value}</div>
        <div class="result-label">${m.label}</div>
      </div>`
    ).join('');

    $('#descInterpretation').innerHTML = `
      The dataset contains <strong>${result.n}</strong> observations with a mean of
      <strong>${Utils.fmt(result.mean)}</strong> and a median of <strong>${Utils.fmt(result.median)}</strong>.
      ${Math.abs(result.mean - result.median) > result.sampleStdDev * 0.2
        ? 'The difference between mean and median suggests the distribution may be skewed.'
        : 'The mean and median are close, suggesting a roughly symmetric distribution.'}
      The data ranges from ${Utils.fmt(result.min)} to ${Utils.fmt(result.max)} with a standard deviation
      of ${Utils.fmt(result.sampleStdDev)}.
    `;

    $('#descSteps').innerHTML = result.steps.map(s =>
      `<div class="step-line">${Utils.escHtml(s)}</div>`
    ).join('');

    // Histogram
    const canvas = document.getElementById('descChart');
    const w = canvas.parentElement.clientWidth - 32;
    ChartRenderer.histogram(canvas, data, {
      width: w, height: 280,
      title: `Distribution of ${varName}`,
      xLabel: varName
    });
  }
};
