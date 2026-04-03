/* ===== REGRESSION MODULE CONTROLLER ===== */

window.ModuleRegression = {

  model: null,

  render(container) {
    const hasData = AppState.hasData();
    container.innerHTML = `
      <div class="module-header">
        <h2>Simple Linear Regression</h2>
        <p>Fit a line to your data and make predictions using the regression equation.</p>
      </div>
      ${!hasData ? Utils.noDataWarning('regression', 'height-weight', 'Height vs Weight') : ''}
      <div class="module-grid">
        <div class="card">
          <div class="card-header"><h3>Variable Selection</h3></div>
          <div class="card-body">
            ${hasData ? `
              <div class="var-selector">
                <div class="form-group">
                  <label>X (Independent)</label>
                  <select id="regVarX">${DataManager.getVariableOptions()}</select>
                </div>
                <div class="form-group">
                  <label>Y (Dependent)</label>
                  <select id="regVarY">
                    ${AppState.data.headers.map((h, i) =>
                      `<option value="${i}" ${i === 1 ? 'selected' : ''}>${Utils.escHtml(h)}</option>`
                    ).join('')}
                  </select>
                </div>
                <button class="btn btn-primary" id="regCompute">Calculate</button>
              </div>
            ` : `<p class="text-muted" style="font-size:0.85rem">Load a dataset with at least 2 numeric columns.</p>`}
          </div>
        </div>

        ${!hasData ? Utils.onboardingGuide({
          steps: [
            { title: 'Load paired data', desc: 'You need <strong>two numeric variables</strong> (e.g., Height as X, Weight as Y). Load from Data Input or click below.' },
            { title: 'Select X and Y', desc: 'X is the <strong>independent</strong> (predictor) variable. Y is the <strong>dependent</strong> (outcome) variable.' },
            { title: 'View results', desc: 'Get the regression equation (<code>y = mx + b</code>), R\u00B2, scatterplot with fitted line, and a prediction tool.' }
          ],
          exampleKey: 'height-weight',
          exampleLabel: 'Height vs Weight (25 pairs)'
        }) : ''}

        <div class="card" id="regChartCard" style="display:none">
          <div class="card-header"><h3>Regression Line</h3></div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="regChart"></canvas>
            </div>
          </div>
        </div>

        <div class="card full-width" id="regResultsCard" style="display:none">
          <div class="card-header"><h3>Results</h3></div>
          <div class="card-body">
            <div class="equation" id="regEquation"></div>
            <div class="results-grid" id="regResultsGrid"></div>
            <div class="prediction-tool" id="regPrediction">
              <div class="form-group">
                <label>Predict Y for X =</label>
                <input type="number" id="regPredictX" step="any" placeholder="Enter X value">
              </div>
              <button class="btn btn-secondary" id="regPredictBtn">Predict</button>
              <div class="prediction-result" id="regPredictResult"></div>
            </div>
            <div class="interpretation" id="regInterpretation"></div>
            <details style="margin-top:12px">
              <summary>Step-by-step calculation</summary>
              <div class="details-content" id="regSteps"></div>
            </details>
          </div>
        </div>
      </div>
    `;

    const regBtn = $('#regCompute');
    if (regBtn) regBtn.addEventListener('click', () => this.compute());
    const predBtn = $('#regPredictBtn');
    if (predBtn) predBtn.addEventListener('click', () => this.predict());
    const predInput = $('#regPredictX');
    if (predInput) predInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.predict();
    });

    Utils.bindGuideButtons(container, () => {
      UI.switchModule('regression');
      setTimeout(() => {
        const btn = $('#regCompute');
        if (btn) btn.click();
      }, 100);
    });
  },

  compute() {
    const xIdx = parseInt($('#regVarX').value);
    const yIdx = parseInt($('#regVarY').value);
    const xData = AppState.getColumn(xIdx);
    const yData = AppState.getColumn(yIdx);

    if (!xData.length || !yData.length) {
      Utils.toast('Need data for both variables', 'warning');
      return;
    }

    const result = StatsRegression.linearRegression(xData, yData);
    if (!result) {
      Utils.toast('Cannot compute regression (check data)', 'error');
      return;
    }

    this.model = result;
    AppState.setResult('regression', result);

    const xName = AppState.data.headers[xIdx];
    const yName = AppState.data.headers[yIdx];

    $('#regResultsCard').style.display = '';
    $('#regChartCard').style.display = '';

    $('#regEquation').textContent = result.equation;

    const metrics = [
      { label: 'Slope (b\u2081)', value: Utils.fmt(result.slope) },
      { label: 'Intercept (b\u2080)', value: Utils.fmt(result.intercept) },
      { label: 'R\u00B2', value: Utils.fmt(result.rSquared) },
      { label: 'R', value: Utils.fmt(Math.sqrt(result.rSquared)) },
      { label: 'Std Error', value: Utils.fmt(result.se) },
      { label: 'n', value: result.n }
    ];

    $('#regResultsGrid').innerHTML = metrics.map(m =>
      `<div class="result-card">
        <div class="result-value">${m.value}</div>
        <div class="result-label">${m.label}</div>
      </div>`
    ).join('');

    const r2pct = Utils.fmt(result.rSquared * 100, 1);
    const slopeDir = result.slope > 0 ? 'increases' : 'decreases';

    $('#regInterpretation').innerHTML = `
      The regression equation <strong>${result.equation}</strong> explains <strong>${r2pct}%</strong>
      of the variance in ${yName}. For each unit increase in ${xName}, ${yName} ${slopeDir}
      by approximately <strong>${Utils.fmt(Math.abs(result.slope))}</strong> units.
    `;

    $('#regSteps').innerHTML = result.steps.map(s =>
      `<div class="step-line">${Utils.escHtml(s)}</div>`
    ).join('');

    // Chart
    const canvas = document.getElementById('regChart');
    const w = canvas.parentElement.clientWidth - 32;
    ChartRenderer.scatterplot(canvas, xData, yData, {
      width: w, height: 300,
      title: `${yName} = f(${xName})`,
      xLabel: xName,
      yLabel: yName,
      slope: result.slope,
      intercept: result.intercept
    });
  },

  predict() {
    if (!this.model) {
      Utils.toast('Run regression first', 'warning');
      return;
    }
    const xVal = parseFloat($('#regPredictX').value);
    if (isNaN(xVal)) {
      Utils.toast('Enter a valid number', 'warning');
      return;
    }
    const yPred = StatsRegression.predict(this.model, xVal);
    $('#regPredictResult').textContent = `\u0177 = ${Utils.fmt(yPred)}`;
  }
};
