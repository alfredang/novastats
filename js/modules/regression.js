/* ===== REGRESSION MODULE CONTROLLER ===== */

window.ModuleRegression = {

  model: null,
  currentSubTab: 'linear',

  varOptions() { return DataManager.getVariableOptions(); },
  varOptionsAt(idx) {
    return AppState.data.headers.map((h, i) =>
      `<option value="${i}" ${i === idx ? 'selected' : ''}>${Utils.escHtml(h)}</option>`
    ).join('');
  },
  multiVarOptions(defaultChecked) {
    return AppState.data.headers.map((h, i) =>
      `<label style="display:inline-flex;gap:4px;margin-right:8px;align-items:center">
        <input type="checkbox" class="multi-var-cb" value="${i}" ${defaultChecked && defaultChecked.includes(i) ? 'checked' : ''}>${Utils.escHtml(h)}
      </label>`
    ).join('');
  },

  render(container) {
    const hasData = AppState.hasData();
    container.innerHTML = `
      <div class="module-header">
        <h2>Regression Analysis</h2>
        <p>Linear, multiple, exponential, quadratic, and logistic regression.</p>
      </div>
      ${!hasData ? Utils.noDataWarning('regression', 'height-weight', 'Height vs Weight') : ''}

      ${!hasData ? Utils.onboardingGuide({
        steps: [
          { title: 'Load paired data', desc: 'Two or more numeric columns. Predictor(s) X and outcome Y.' },
          { title: 'Pick a regression type', desc: '<strong>Linear</strong> (1 X), <strong>Multiple</strong> (2+ Xs), <strong>Exponential</strong> (y = a·e^bx), <strong>Quadratic</strong> (y = β₀+β₁x+β₂x²), <strong>Logistic</strong> (binary Y).' },
          { title: 'View results', desc: 'Equation, coefficients, R²/pseudo-R², plot, and prediction tool.' }
        ],
        exampleKey: 'height-weight',
        exampleLabel: 'Height vs Weight (25 pairs)'
      }) : ''}

      <div class="card hyp-layout" style="margin-bottom:20px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
        <aside class="hyp-sidebar" style="flex:0 0 220px;min-width:200px;border-right:1px solid var(--border);padding-right:12px">
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="reg-types">▾ Regression Types</button>
            <div class="hyp-cat-list" data-cat-list="reg-types">
              <button class="hyp-test-btn active" data-tab="linear">Simple Linear</button>
              <button class="hyp-test-btn" data-tab="multiple">Multiple Linear</button>
              <button class="hyp-test-btn" data-tab="exponential">Exponential</button>
              <button class="hyp-test-btn" data-tab="quadratic">Quadratic</button>
              <button class="hyp-test-btn" data-tab="logistic">Logistic</button>
            </div>
          </div>
        </aside>

        <div class="hyp-content" style="flex:1;min-width:300px">
          <!-- Simple Linear -->
          <div class="sub-panel active" id="panel-linear">
            <div class="var-selector">
              <div class="form-group"><label>X (Independent)</label>
                <select id="regVarX">${hasData ? this.varOptions() : ''}</select>
              </div>
              <div class="form-group"><label>Y (Dependent)</label>
                <select id="regVarY">${hasData ? this.varOptionsAt(1) : ''}</select>
              </div>
              <button class="btn btn-primary" id="regCompute">Calculate</button>
            </div>
          </div>

          <!-- Multiple Linear -->
          <div class="sub-panel" id="panel-multiple">
            <div class="form-group"><label>Predictors (X) — select 2+ columns</label>
              <div id="multiPredictors">${hasData ? this.multiVarOptions([0]) : ''}</div>
            </div>
            <div class="var-selector">
              <div class="form-group"><label>Outcome (Y)</label>
                <select id="multiVarY">${hasData ? this.varOptionsAt(AppState.getColumnCount() - 1) : ''}</select>
              </div>
              <button class="btn btn-primary" id="multiCompute">Calculate</button>
            </div>
          </div>

          <!-- Exponential -->
          <div class="sub-panel" id="panel-exponential">
            <div class="var-selector">
              <div class="form-group"><label>X</label><select id="expVarX">${hasData ? this.varOptions() : ''}</select></div>
              <div class="form-group"><label>Y (positive values)</label><select id="expVarY">${hasData ? this.varOptionsAt(1) : ''}</select></div>
              <button class="btn btn-primary" id="expCompute">Calculate</button>
            </div>
          </div>

          <!-- Quadratic -->
          <div class="sub-panel" id="panel-quadratic">
            <div class="var-selector">
              <div class="form-group"><label>X</label><select id="quadVarX">${hasData ? this.varOptions() : ''}</select></div>
              <div class="form-group"><label>Y</label><select id="quadVarY">${hasData ? this.varOptionsAt(1) : ''}</select></div>
              <button class="btn btn-primary" id="quadCompute">Calculate</button>
            </div>
          </div>

          <!-- Logistic -->
          <div class="sub-panel" id="panel-logistic">
            <div class="form-group"><label>Predictors (X)</label>
              <div id="logitPredictors">${hasData ? this.multiVarOptions([0]) : ''}</div>
            </div>
            <div class="var-selector">
              <div class="form-group"><label>Outcome (Y, binary 0/1)</label>
                <select id="logitVarY">${hasData ? this.varOptionsAt(AppState.getColumnCount() - 1) : ''}</select>
              </div>
              <button class="btn btn-primary" id="logitCompute">Calculate</button>
            </div>
          </div>
        </div>
      </div>

      <div class="module-grid" id="regResultsArea" style="display:none">
        <div class="card" id="regChartCard">
          <div class="card-header"><h3>Plot</h3></div>
          <div class="card-body">
            <div class="chart-container"><canvas id="regChart"></canvas></div>
          </div>
        </div>
        <div class="card full-width" id="regResultsCard">
          <div class="card-header"><h3 id="regResultsTitle">Results</h3></div>
          <div class="card-body">
            <div class="equation" id="regEquation"></div>
            <div class="results-grid" id="regResultsGrid"></div>
            <div id="regCoefTable"></div>
            <div class="prediction-tool" id="regPrediction" style="display:none">
              <div class="form-group">
                <label id="regPredictLabel">Predict Y for X =</label>
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

    // Sidebar
    container.querySelectorAll('.hyp-test-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.hyp-test-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        container.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
        const panel = container.querySelector(`#panel-${btn.dataset.tab}`);
        if (panel) panel.classList.add('active');
        this.currentSubTab = btn.dataset.tab;
      });
    });
    const setOpen = (toggle, list, open) => {
      list.classList.toggle('collapsed', !open);
      toggle.textContent = (open ? '▾ ' : '▸ ') + toggle.textContent.slice(2);
    };
    container.querySelectorAll('.hyp-cat-toggle').forEach(t => {
      const list = container.querySelector(`[data-cat-list="${t.dataset.cat}"]`);
      if (!list) return;
      const containsActive = !!list.querySelector('.hyp-test-btn.active');
      setOpen(t, list, containsActive);
      t.addEventListener('click', () => setOpen(t, list, list.classList.contains('collapsed')));
    });

    if (hasData) {
      const bind = (id, fn) => { const el = $('#' + id); if (el) el.addEventListener('click', () => fn.call(this)); };
      bind('regCompute', this.computeLinear);
      bind('multiCompute', this.computeMultiple);
      bind('expCompute', this.computeExponential);
      bind('quadCompute', this.computeQuadratic);
      bind('logitCompute', this.computeLogistic);

      const predBtn = $('#regPredictBtn');
      if (predBtn) predBtn.addEventListener('click', () => this.predict());
      const predInput = $('#regPredictX');
      if (predInput) predInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.predict(); });
    }

    Utils.bindGuideButtons(container, () => {
      UI.switchModule('regression');
      setTimeout(() => {
        const btn = $('#regCompute');
        if (btn) btn.click();
      }, 100);
    });
    if (typeof injectExampleButtons === 'function') injectExampleButtons(container);
  },

  getCheckedColumns(containerId) {
    const cbs = document.querySelectorAll(`#${containerId} .multi-var-cb:checked`);
    const indices = Array.from(cbs).map(cb => parseInt(cb.value));
    const cols = indices.map(i => AppState.getColumn(i));
    const labels = indices.map(i => AppState.data.headers[i]);
    return { indices, cols, labels };
  },

  showResults(opts) {
    $('#regResultsArea').style.display = '';
    $('#regResultsTitle').textContent = opts.title || 'Results';
    $('#regEquation').textContent = opts.equation || '';
    $('#regResultsGrid').innerHTML = (opts.metrics || []).map(m =>
      `<div class="result-card"><div class="result-value">${m.value}</div><div class="result-label">${m.label}</div></div>`
    ).join('');
    $('#regCoefTable').innerHTML = opts.coefHTML || '';
    $('#regInterpretation').innerHTML = (opts.interpretation || '') +
      (typeof renderExplanation === 'function' ? renderExplanation(this.currentSubTab) : '');
    $('#regSteps').innerHTML = (opts.steps || []).map(s =>
      `<div class="step-line">${Utils.escHtml(s)}</div>`).join('');
    $('#regPrediction').style.display = opts.prediction ? '' : 'none';
    if (opts.prediction) $('#regPredictLabel').textContent = opts.prediction.label;
    $('#regPredictResult').textContent = '';
  },

  drawChart(xData, yData, opts) {
    const card = document.getElementById('regChartCard');
    if (!xData || !yData) { card.style.display = 'none'; return; }
    card.style.display = '';
    const canvas = document.getElementById('regChart');
    const w = canvas.parentElement.clientWidth - 32;
    ChartRenderer.scatterplot(canvas, xData, yData, { width: w, height: 300, ...opts });
  },

  coefHTML(coefTable, columns) {
    return `
      <h4 style="margin-top:12px">Coefficients</h4>
      <table class="data-table" style="width:100%;margin-top:6px">
        <thead><tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>
          ${coefTable.map(c => `
            <tr>
              <td>${Utils.escHtml(c.name)}</td>
              <td>${Utils.fmt(c.coef)}</td>
              <td>${Utils.fmt(c.se)}</td>
              <td>${Utils.fmt(c.t !== undefined ? c.t : c.z)}</td>
              <td>${Utils.pFmt(c.p)}</td>
              ${c.oddsRatio !== undefined ? `<td>${c.oddsRatio === null ? '—' : Utils.fmt(c.oddsRatio)}</td>` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  },

  /* ===== COMPUTE HANDLERS ===== */

  computeLinear() {
    const xIdx = parseInt($('#regVarX').value);
    const yIdx = parseInt($('#regVarY').value);
    const xData = AppState.getColumn(xIdx);
    const yData = AppState.getColumn(yIdx);
    if (!xData.length || !yData.length) return Utils.toast('Need both variables', 'warning');
    const r = StatsRegression.linearRegression(xData, yData);
    if (!r) return Utils.toast('Cannot compute (variance is zero)', 'error');
    this.model = { ...r, type: 'linear' };
    AppState.setResult('regression', this.model);

    const xName = AppState.data.headers[xIdx], yName = AppState.data.headers[yIdx];
    this.showResults({
      title: 'Simple Linear Regression',
      equation: r.equation,
      metrics: [
        { label: 'Slope (b₁)', value: Utils.fmt(r.slope) },
        { label: 'Intercept (b₀)', value: Utils.fmt(r.intercept) },
        { label: 'R²', value: Utils.fmt(r.rSquared) },
        { label: 'R', value: Utils.fmt(Math.sqrt(r.rSquared)) },
        { label: 'SE (slope)', value: Utils.fmt(r.se) },
        { label: 'n', value: r.n }
      ],
      interpretation: `<strong>${r.equation}</strong> explains <strong>${Utils.fmt(r.rSquared * 100, 1)}%</strong> of variance in ${yName}. Each unit increase in ${xName} → ${yName} ${r.slope > 0 ? 'increases' : 'decreases'} by ~<strong>${Utils.fmt(Math.abs(r.slope))}</strong>.`,
      steps: r.steps,
      prediction: { label: `Predict ${yName} for ${xName} =` }
    });
    this.drawChart(xData, yData, {
      title: `${yName} = f(${xName})`, xLabel: xName, yLabel: yName,
      slope: r.slope, intercept: r.intercept
    });
  },

  computeMultiple() {
    const { cols: xCols, labels } = this.getCheckedColumns('multiPredictors');
    if (xCols.length < 1) return Utils.toast('Select at least 1 predictor', 'warning');
    const yIdx = parseInt($('#multiVarY').value);
    const yData = AppState.getColumn(yIdx);
    const n = Math.min(yData.length, ...xCols.map(c => c.length));
    const X = [];
    for (let i = 0; i < n; i++) X.push(xCols.map(c => c[i]));
    const r = StatsRegression.multipleLinearRegression(X, yData.slice(0, n), labels);
    if (r.error) return Utils.toast(r.error, 'error');
    this.model = r;
    AppState.setResult('regression', r);

    this.showResults({
      title: 'Multiple Linear Regression',
      equation: r.equation,
      metrics: [
        { label: 'R²', value: Utils.fmt(r.rSquared) },
        { label: 'Adj R²', value: Utils.fmt(r.adjR2) },
        { label: 'F', value: Utils.fmt(r.F) },
        { label: 'p (F)', value: Utils.pFmt(r.fP) },
        { label: 'n', value: r.n },
        { label: 'predictors', value: r.p }
      ],
      coefHTML: this.coefHTML(r.coefTable, ['Term', 'Coefficient', 'SE', 't', 'p']),
      interpretation: `Model explains <strong>${Utils.fmt(r.rSquared * 100, 1)}%</strong> (Adj R² = ${Utils.fmt(r.adjR2)}). Overall F-test p = <strong>${Utils.pFmt(r.fP)}</strong>.`,
      steps: r.steps
    });
    this.drawChart(r.yHat, yData.slice(0, n), {
      title: 'Predicted vs Actual', xLabel: 'Predicted ŷ', yLabel: 'Actual y',
      slope: 1, intercept: 0
    });
  },

  computeExponential() {
    const xIdx = parseInt($('#expVarX').value);
    const yIdx = parseInt($('#expVarY').value);
    const xData = AppState.getColumn(xIdx);
    const yData = AppState.getColumn(yIdx);
    const r = StatsRegression.exponentialRegression(xData, yData);
    if (r.error) return Utils.toast(r.error, 'error');
    this.model = r;
    AppState.setResult('regression', r);

    const xName = AppState.data.headers[xIdx], yName = AppState.data.headers[yIdx];
    this.showResults({
      title: 'Exponential Regression',
      equation: r.equation,
      metrics: [
        { label: 'a', value: Utils.fmt(r.a) },
        { label: 'b', value: Utils.fmt(r.b) },
        { label: 'R²', value: Utils.fmt(r.rSquared) },
        { label: 'n', value: r.n }
      ],
      interpretation: `<strong>${r.equation}</strong>. ${r.b > 0 ? 'Growth' : 'Decay'} rate b = <strong>${Utils.fmt(r.b)}</strong>; R² = ${Utils.fmt(r.rSquared)}.`,
      steps: r.steps,
      prediction: { label: `Predict ${yName} for ${xName} =` }
    });
    this.drawChart(xData, yData, {
      title: `${yName} = a·e^(b·${xName})`, xLabel: xName, yLabel: yName,
      curveFn: r.curveFn
    });
  },

  computeQuadratic() {
    const xIdx = parseInt($('#quadVarX').value);
    const yIdx = parseInt($('#quadVarY').value);
    const xData = AppState.getColumn(xIdx);
    const yData = AppState.getColumn(yIdx);
    const r = StatsRegression.quadraticRegression(xData, yData);
    if (r.error) return Utils.toast(r.error, 'error');
    this.model = r;
    AppState.setResult('regression', r);

    const xName = AppState.data.headers[xIdx], yName = AppState.data.headers[yIdx];
    this.showResults({
      title: 'Quadratic Regression',
      equation: r.equation,
      metrics: [
        { label: 'β₀', value: Utils.fmt(r.beta[0]) },
        { label: 'β₁', value: Utils.fmt(r.beta[1]) },
        { label: 'β₂', value: Utils.fmt(r.beta[2]) },
        { label: 'R²', value: Utils.fmt(r.rSquared) },
        { label: 'Adj R²', value: Utils.fmt(r.adjR2) },
        { label: 'n', value: r.n }
      ],
      coefHTML: this.coefHTML(r.coefTable, ['Term', 'Coefficient', 'SE', 't', 'p']),
      interpretation: `Quadratic fit explains <strong>${Utils.fmt(r.rSquared * 100, 1)}%</strong> of variance. Curvature coefficient β₂ = <strong>${Utils.fmt(r.beta[2])}</strong>${r.beta[2] > 0 ? ' (concave up)' : ' (concave down)'}.`,
      steps: r.steps,
      prediction: { label: `Predict ${yName} for ${xName} =` }
    });
    this.drawChart(xData, yData, {
      title: `Quadratic fit`, xLabel: xName, yLabel: yName,
      curveFn: r.curveFn
    });
  },

  computeLogistic() {
    const { cols: xCols, labels } = this.getCheckedColumns('logitPredictors');
    if (xCols.length < 1) return Utils.toast('Select at least 1 predictor', 'warning');
    const yIdx = parseInt($('#logitVarY').value);
    const yData = AppState.getColumn(yIdx);
    const n = Math.min(yData.length, ...xCols.map(c => c.length));
    const X = [];
    for (let i = 0; i < n; i++) X.push(xCols.map(c => c[i]));
    const r = StatsRegression.logisticRegression(X, yData.slice(0, n), labels);
    if (r.error) return Utils.toast(r.error, 'error');
    this.model = r;
    AppState.setResult('regression', r);

    this.showResults({
      title: 'Logistic Regression',
      equation: r.equation,
      metrics: [
        { label: 'Pseudo R²', value: Utils.fmt(r.pseudoR2) },
        { label: 'Accuracy', value: Utils.fmt(r.accuracy * 100, 1) + '%' },
        { label: 'Log-Lik', value: Utils.fmt(r.ll) },
        { label: 'Iterations', value: r.iterations },
        { label: 'n', value: r.n }
      ],
      coefHTML: this.coefHTML(r.coefTable, ['Term', 'Coefficient', 'SE', 'z', 'p', 'Odds Ratio']),
      interpretation: `Pseudo-R² (McFadden) = <strong>${Utils.fmt(r.pseudoR2)}</strong>; classification accuracy = <strong>${Utils.fmt(r.accuracy * 100, 1)}%</strong> at threshold 0.5.`,
      steps: r.steps
    });
    if (r.curveFn && xCols.length === 1) {
      this.drawChart(xCols[0].slice(0, n), yData.slice(0, n), {
        title: `P(Y=1) vs ${labels[0]}`, xLabel: labels[0], yLabel: 'Probability',
        curveFn: r.curveFn
      });
    } else {
      this.drawChart(r.probs, yData.slice(0, n), {
        title: 'Predicted probability vs Actual', xLabel: 'P(Y=1)', yLabel: 'Actual'
      });
    }
  },

  predict() {
    if (!this.model) return Utils.toast('Run regression first', 'warning');
    const xVal = parseFloat($('#regPredictX').value);
    if (isNaN(xVal)) return Utils.toast('Enter a valid number', 'warning');
    let yPred;
    if (this.model.type === 'linear') yPred = this.model.slope * xVal + this.model.intercept;
    else if (this.model.curveFn) yPred = this.model.curveFn(xVal);
    else return Utils.toast('Single-X prediction not available for this model', 'warning');
    $('#regPredictResult').textContent = `ŷ = ${Utils.fmt(yPred)}`;
  }
};
