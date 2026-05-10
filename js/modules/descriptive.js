/* ===== DESCRIPTIVE STATISTICS MODULE CONTROLLER ===== */

window.ModuleDescriptive = {

  currentSubTab: 'all',

  varOptions() { return DataManager.getVariableOptions(); },
  varOptionsAt(idx) {
    return AppState.data.headers.map((h, i) =>
      `<option value="${i}" ${i === idx ? 'selected' : ''}>${Utils.escHtml(h)}</option>`
    ).join('');
  },
  multiVarOptions() {
    return AppState.data.headers.map((h, i) =>
      `<label style="display:inline-flex;gap:4px;margin-right:8px;align-items:center">
        <input type="checkbox" class="multi-var-cb" value="${i}" checked>${Utils.escHtml(h)}
      </label>`
    ).join('');
  },

  render(container) {
    const hasData = AppState.hasData();
    container.innerHTML = `
      <div class="module-header">
        <h2>Descriptive Statistics</h2>
        <p>Central tendency, dispersion, position, shape, relationships, and reliability.</p>
      </div>
      ${!hasData ? Utils.noDataWarning('descriptive', 'exam-scores', 'Exam Scores') : ''}

      ${!hasData ? Utils.onboardingGuide({
        steps: [
          { title: 'Load or enter data', desc: 'Numeric column(s) for most tools; categorical works for frequency/contingency tables.' },
          { title: 'Pick a tool', desc: 'Comprehensive summary, central tendency, dispersion, position, shape, relationships, or reliability.' },
          { title: 'View results', desc: 'Statistic, breakdown, plain-language interpretation, and step-by-step calculation.' }
        ],
        exampleKey: 'exam-scores',
        exampleLabel: 'Exam Scores (30 values)'
      }) : ''}

      <div class="card hyp-layout" style="margin-bottom:20px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
        <aside class="hyp-sidebar" style="flex:0 0 220px;min-width:200px;border-right:1px solid var(--border);padding-right:12px">
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="all">▾ Comprehensive</button>
            <div class="hyp-cat-list" data-cat-list="all">
              <button class="hyp-test-btn active" data-tab="all">All-in-One</button>
            </div>
          </div>
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="central">▾ Central Tendency</button>
            <div class="hyp-cat-list" data-cat-list="central">
              <button class="hyp-test-btn" data-tab="mean-median-mode">Mean, Median, Mode</button>
              <button class="hyp-test-btn" data-tab="geometric">Geometric Mean</button>
              <button class="hyp-test-btn" data-tab="harmonic">Harmonic Mean</button>
            </div>
          </div>
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="dispersion">▾ Dispersion</button>
            <div class="hyp-cat-list" data-cat-list="dispersion">
              <button class="hyp-test-btn" data-tab="range-var-sd">Range, Variance, SD</button>
              <button class="hyp-test-btn" data-tab="cv">Coefficient of Variation</button>
              <button class="hyp-test-btn" data-tab="five-num">Five-Number Summary</button>
              <button class="hyp-test-btn" data-tab="mad">Mean Absolute Deviation</button>
              <button class="hyp-test-btn" data-tab="median-ad">Median Absolute Deviation</button>
            </div>
          </div>
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="position">▾ Position</button>
            <div class="hyp-cat-list" data-cat-list="position">
              <button class="hyp-test-btn" data-tab="percentile">Percentile, Quartile, IQR</button>
              <button class="hyp-test-btn" data-tab="zscore">Z-Score</button>
            </div>
          </div>
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="shape">▾ Shape</button>
            <div class="hyp-cat-list" data-cat-list="shape">
              <button class="hyp-test-btn" data-tab="skewness">Skewness</button>
              <button class="hyp-test-btn" data-tab="kurtosis">Kurtosis</button>
            </div>
          </div>
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="relationships">▾ Relationships</button>
            <div class="hyp-cat-list" data-cat-list="relationships">
              <button class="hyp-test-btn" data-tab="covariance">Covariance</button>
              <button type="button" class="hyp-test-btn hyp-link-btn" data-goto="correlation">Correlation Coefficient →</button>
              <button class="hyp-test-btn" data-tab="frequency">Frequency Table</button>
              <button class="hyp-test-btn" data-tab="contingency">Contingency Table</button>
            </div>
          </div>
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="reliability">▾ Reliability</button>
            <div class="hyp-cat-list" data-cat-list="reliability">
              <button class="hyp-test-btn" data-tab="cronbach">Cronbach's Alpha</button>
            </div>
          </div>
        </aside>

        <div class="hyp-content" style="flex:1;min-width:300px">
          <div class="sub-panel active" id="panel-all">
            <div class="var-selector">
              <div class="form-group"><label>Variable</label><select id="dAllVar">${hasData ? this.varOptions() : ''}</select></div>
              <button class="btn btn-primary" id="dAllCompute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-mean-median-mode">
            <div class="var-selector">
              <div class="form-group"><label>Variable</label><select id="dMmmVar">${hasData ? this.varOptions() : ''}</select></div>
              <button class="btn btn-primary" id="dMmmCompute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-geometric">
            <div class="var-selector">
              <div class="form-group"><label>Variable (positive values)</label><select id="dGeoVar">${hasData ? this.varOptions() : ''}</select></div>
              <button class="btn btn-primary" id="dGeoCompute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-harmonic">
            <div class="var-selector">
              <div class="form-group"><label>Variable (no zeros)</label><select id="dHarVar">${hasData ? this.varOptions() : ''}</select></div>
              <button class="btn btn-primary" id="dHarCompute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-range-var-sd">
            <div class="var-selector">
              <div class="form-group"><label>Variable</label><select id="dRvsVar">${hasData ? this.varOptions() : ''}</select></div>
              <button class="btn btn-primary" id="dRvsCompute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-cv">
            <div class="var-selector">
              <div class="form-group"><label>Variable</label><select id="dCvVar">${hasData ? this.varOptions() : ''}</select></div>
              <button class="btn btn-primary" id="dCvCompute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-five-num">
            <div class="var-selector">
              <div class="form-group"><label>Variable</label><select id="d5Var">${hasData ? this.varOptions() : ''}</select></div>
              <button class="btn btn-primary" id="d5Compute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-mad">
            <div class="var-selector">
              <div class="form-group"><label>Variable</label><select id="dMadVar">${hasData ? this.varOptions() : ''}</select></div>
              <button class="btn btn-primary" id="dMadCompute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-median-ad">
            <div class="var-selector">
              <div class="form-group"><label>Variable</label><select id="dMadMVar">${hasData ? this.varOptions() : ''}</select></div>
              <button class="btn btn-primary" id="dMadMCompute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-percentile">
            <div class="param-row">
              <div class="form-group"><label>Variable</label><select id="dPctVar">${hasData ? this.varOptions() : ''}</select></div>
              <div class="form-group"><label>Percentile (0–100)</label><input type="number" id="dPctP" value="75" min="0" max="100" step="any"></div>
              <button class="btn btn-primary" id="dPctCompute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-zscore">
            <div class="var-selector">
              <div class="form-group"><label>Variable</label><select id="dZVar">${hasData ? this.varOptions() : ''}</select></div>
              <button class="btn btn-primary" id="dZCompute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-skewness">
            <div class="var-selector">
              <div class="form-group"><label>Variable</label><select id="dSkVar">${hasData ? this.varOptions() : ''}</select></div>
              <button class="btn btn-primary" id="dSkCompute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-kurtosis">
            <div class="var-selector">
              <div class="form-group"><label>Variable</label><select id="dKuVar">${hasData ? this.varOptions() : ''}</select></div>
              <button class="btn btn-primary" id="dKuCompute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-covariance">
            <div class="var-selector">
              <div class="form-group"><label>Variable X</label><select id="dCovVar1">${hasData ? this.varOptions() : ''}</select></div>
              <div class="form-group"><label>Variable Y</label><select id="dCovVar2">${hasData ? this.varOptionsAt(1) : ''}</select></div>
              <button class="btn btn-primary" id="dCovCompute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-frequency">
            <div class="var-selector">
              <div class="form-group"><label>Variable</label><select id="dFreqVar">${hasData ? this.varOptions() : ''}</select></div>
              <button class="btn btn-primary" id="dFreqCompute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-contingency">
            <div class="var-selector">
              <div class="form-group"><label>Row variable</label><select id="dContVar1">${hasData ? this.varOptions() : ''}</select></div>
              <div class="form-group"><label>Column variable</label><select id="dContVar2">${hasData ? this.varOptionsAt(1) : ''}</select></div>
              <button class="btn btn-primary" id="dContCompute">Calculate</button>
            </div>
          </div>
          <div class="sub-panel" id="panel-cronbach">
            <div class="form-group"><label>Items (select 2+ columns; rows = subjects)</label>
              <div id="dCronVars">${hasData ? this.multiVarOptions() : ''}</div>
            </div>
            <button class="btn btn-primary" id="dCronCompute">Calculate</button>
          </div>
        </div>
      </div>

      <div class="module-grid" id="dResultsArea" style="display:none">
        <div class="card" id="dChartCard">
          <div class="card-header"><h3>Distribution</h3></div>
          <div class="card-body">
            <div class="chart-container"><canvas id="dChart"></canvas></div>
          </div>
        </div>
        <div class="card full-width">
          <div class="card-header">
            <h3 id="dResultsTitle">Results</h3>
            <span class="badge badge-accent" id="dVarName"></span>
          </div>
          <div class="card-body">
            <div class="results-grid" id="dResultsGrid"></div>
            <div id="dExtraTable"></div>
            <div class="interpretation" id="dInterpretation"></div>
            <details style="margin-top:12px">
              <summary>Step-by-step calculation</summary>
              <div class="details-content" id="dSteps"></div>
            </details>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.hyp-test-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.goto) { UI.switchModule(btn.dataset.goto); return; }
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
      bind('dAllCompute', this.runAll);
      bind('dMmmCompute', this.runMeanMedianMode);
      bind('dGeoCompute', this.runGeometric);
      bind('dHarCompute', this.runHarmonic);
      bind('dRvsCompute', this.runRangeVarSD);
      bind('dCvCompute', this.runCV);
      bind('d5Compute', this.runFiveNum);
      bind('dMadCompute', this.runMAD);
      bind('dMadMCompute', this.runMedianAD);
      bind('dPctCompute', this.runPercentile);
      bind('dZCompute', this.runZScore);
      bind('dSkCompute', this.runSkewness);
      bind('dKuCompute', this.runKurtosis);
      bind('dCovCompute', this.runCovariance);
      bind('dFreqCompute', this.runFrequency);
      bind('dContCompute', this.runContingency);
      bind('dCronCompute', this.runCronbach);
    }

    Utils.bindGuideButtons(container, () => {
      UI.switchModule('descriptive');
      setTimeout(() => { const btn = $('#dAllCompute'); if (btn) btn.click(); }, 100);
    });
    if (typeof injectExampleButtons === 'function') injectExampleButtons(container);
  },

  /* ===== display helpers ===== */

  show(opts) {
    $('#dResultsArea').style.display = '';
    $('#dResultsTitle').textContent = opts.title || 'Results';
    $('#dVarName').textContent = opts.varName || '';
    $('#dResultsGrid').innerHTML = (opts.metrics || []).map(m =>
      `<div class="result-card"><div class="result-value">${m.value}</div><div class="result-label">${m.label}</div></div>`
    ).join('');
    $('#dExtraTable').innerHTML = opts.extraHTML || '';
    $('#dInterpretation').innerHTML = (opts.interpretation || '') +
      (opts.toolId ? renderExplanation(opts.toolId) : '');
    $('#dSteps').innerHTML = (opts.steps || []).map(s =>
      `<div class="step-line">${Utils.escHtml(s)}</div>`).join('');
    const card = document.getElementById('dChartCard');
    if (opts.histogram) {
      card.style.display = '';
      const canvas = document.getElementById('dChart');
      const w = canvas.parentElement.clientWidth - 32;
      ChartRenderer.histogram(canvas, opts.histogram.data, {
        width: w, height: 280, title: opts.histogram.title || '', xLabel: opts.histogram.xLabel || ''
      });
    } else {
      card.style.display = 'none';
    }
  },

  getCol(selectId) {
    const idx = parseInt($('#' + selectId).value);
    const data = AppState.getColumn(idx);
    const name = AppState.data.headers[idx];
    return { idx, data, name };
  },
  getNumericCol(selectId) {
    const c = this.getCol(selectId);
    c.data = c.data.filter(v => typeof v === 'number' && !isNaN(v));
    return c;
  },

  /* ===== runners ===== */

  runAll() {
    const { data, name } = this.getNumericCol('dAllVar');
    if (!data.length) return Utils.toast('No numeric data', 'warning');
    const r = StatsDescriptive.compute(data);
    const skew = StatsDescriptive.skewness(data);
    const kurt = StatsDescriptive.kurtosis(data);
    const cv = StatsDescriptive.coefficientOfVariation(data);
    AppState.setResult('descriptive', r);
    this.show({
      toolId: 'all', title: 'Comprehensive Descriptive Statistics',
      varName: name,
      metrics: [
        { label: 'n', value: r.n },
        { label: 'Mean', value: Utils.fmt(r.mean) },
        { label: 'Median', value: Utils.fmt(r.median) },
        { label: 'Mode', value: r.mode.text || '—' },
        { label: 'Sample SD', value: Utils.fmt(r.sampleStdDev) },
        { label: 'Pop SD', value: Utils.fmt(r.populationStdDev) },
        { label: 'Sample Var', value: Utils.fmt(r.sampleVariance) },
        { label: 'Min', value: Utils.fmt(r.min) },
        { label: 'Max', value: Utils.fmt(r.max) },
        { label: 'Range', value: Utils.fmt(r.range) },
        { label: 'Q1', value: Utils.fmt(r.q1) },
        { label: 'Q3', value: Utils.fmt(r.q3) },
        { label: 'IQR', value: Utils.fmt(r.iqr) },
        { label: 'Skewness', value: Utils.fmt(skew) },
        { label: 'Kurtosis', value: Utils.fmt(kurt) },
        { label: 'CV', value: Utils.fmt(cv) }
      ],
      interpretation: `<strong>${r.n}</strong> observations. Mean = ${Utils.fmt(r.mean)}, Median = ${Utils.fmt(r.median)}. ${Math.abs(r.mean - r.median) > r.sampleStdDev * 0.2 ? 'Distribution may be skewed.' : 'Distribution is roughly symmetric.'} Skew = ${Utils.fmt(skew)}, kurtosis = ${Utils.fmt(kurt)}.`,
      steps: r.steps,
      histogram: { data, title: `Distribution of ${name}`, xLabel: name }
    });
  },

  runMeanMedianMode() {
    const { data, name } = this.getNumericCol('dMmmVar');
    if (!data.length) return Utils.toast('No numeric data', 'warning');
    const m = StatsDescriptive.mean(data);
    const med = StatsDescriptive.median(data);
    const mode = StatsDescriptive.mode(data);
    this.show({
      toolId: 'mean-median-mode', title: 'Mean, Median, Mode', varName: name,
      metrics: [
        { label: 'Mean', value: Utils.fmt(m) },
        { label: 'Median', value: Utils.fmt(med) },
        { label: 'Mode', value: mode.text || '—' },
        { label: 'n', value: data.length }
      ],
      interpretation: Math.abs(m - med) < StatsDescriptive.stddev(data, false) * 0.2
        ? 'Mean ≈ Median: distribution looks roughly symmetric.'
        : (m > med ? 'Mean > Median: positive (right) skew.' : 'Mean < Median: negative (left) skew.'),
      steps: [
        `n = ${data.length}, sum = ${Utils.fmt(StatsDescriptive.sum(data))}`,
        `Mean = sum / n = ${Utils.fmt(m)}`,
        `Median (middle value of sorted data) = ${Utils.fmt(med)}`,
        `Mode = ${mode.text || '—'} (frequency ${mode.count})`
      ],
      histogram: { data, title: name, xLabel: name }
    });
  },

  runGeometric() {
    const { data, name } = this.getNumericCol('dGeoVar');
    if (!data.length) return Utils.toast('No data', 'warning');
    const g = StatsDescriptive.geometricMean(data);
    if (isNaN(g)) return Utils.toast('Need positive values', 'warning');
    this.show({
      toolId: 'geometric', title: 'Geometric Mean', varName: name,
      metrics: [
        { label: 'Geometric Mean', value: Utils.fmt(g) },
        { label: 'Arithmetic Mean', value: Utils.fmt(StatsDescriptive.mean(data)) },
        { label: 'n', value: data.length }
      ],
      interpretation: 'Geometric mean is the n-th root of the product. Useful for averaging rates, ratios, or growth factors. Always ≤ arithmetic mean.',
      steps: [
        `n = ${data.length}`,
        `Computed via logs: GM = exp(mean(ln xᵢ))`,
        `mean(ln xᵢ) = ${Utils.fmt(data.reduce((s,v)=>s+Math.log(v),0)/data.length)}`,
        `GM = ${Utils.fmt(g)}`
      ]
    });
  },

  runHarmonic() {
    const { data, name } = this.getNumericCol('dHarVar');
    if (!data.length) return Utils.toast('No data', 'warning');
    const h = StatsDescriptive.harmonicMean(data);
    if (isNaN(h)) return Utils.toast('No zero values allowed', 'warning');
    this.show({
      toolId: 'harmonic', title: 'Harmonic Mean', varName: name,
      metrics: [
        { label: 'Harmonic Mean', value: Utils.fmt(h) },
        { label: 'Arithmetic Mean', value: Utils.fmt(StatsDescriptive.mean(data)) },
        { label: 'n', value: data.length }
      ],
      interpretation: 'Harmonic mean = n / Σ(1/xᵢ). Best for averaging rates (e.g., speeds over equal distances).',
      steps: [
        `n = ${data.length}`,
        `Σ(1/xᵢ) = ${Utils.fmt(data.reduce((s,v)=>s+1/v,0))}`,
        `HM = n / Σ(1/xᵢ) = ${Utils.fmt(h)}`
      ]
    });
  },

  runRangeVarSD() {
    const { data, name } = this.getNumericCol('dRvsVar');
    if (!data.length) return Utils.toast('No data', 'warning');
    const min = StatsDescriptive.min(data), max = StatsDescriptive.max(data);
    const sVar = StatsDescriptive.variance(data, false);
    const pVar = StatsDescriptive.variance(data, true);
    const sSD = StatsDescriptive.stddev(data, false);
    const pSD = StatsDescriptive.stddev(data, true);
    this.show({
      toolId: 'range-var-sd', title: 'Range, Variance, Standard Deviation', varName: name,
      metrics: [
        { label: 'Min', value: Utils.fmt(min) }, { label: 'Max', value: Utils.fmt(max) },
        { label: 'Range', value: Utils.fmt(max - min) },
        { label: 'Sample Variance', value: Utils.fmt(sVar) },
        { label: 'Pop Variance', value: Utils.fmt(pVar) },
        { label: 'Sample SD', value: Utils.fmt(sSD) },
        { label: 'Pop SD', value: Utils.fmt(pSD) }
      ],
      steps: [
        `n = ${data.length}, mean = ${Utils.fmt(StatsDescriptive.mean(data))}`,
        `Range = max − min = ${Utils.fmt(max - min)}`,
        `Sample Variance = Σ(xᵢ−x̄)² / (n−1) = ${Utils.fmt(sVar)}`,
        `Sample SD = √variance = ${Utils.fmt(sSD)}`
      ],
      histogram: { data, title: name, xLabel: name }
    });
  },

  runCV() {
    const { data, name } = this.getNumericCol('dCvVar');
    if (!data.length) return Utils.toast('No data', 'warning');
    const cv = StatsDescriptive.coefficientOfVariation(data);
    const m = StatsDescriptive.mean(data), s = StatsDescriptive.stddev(data, false);
    this.show({
      toolId: 'cv', title: 'Coefficient of Variation', varName: name,
      metrics: [
        { label: 'CV', value: Utils.fmt(cv) },
        { label: 'CV %', value: Utils.fmt(cv * 100, 2) + '%' },
        { label: 'Mean', value: Utils.fmt(m) },
        { label: 'SD', value: Utils.fmt(s) }
      ],
      interpretation: `CV = SD/|mean| = <strong>${Utils.fmt(cv * 100, 2)}%</strong>. Higher CV = greater relative variability.`,
      steps: [
        `Mean = ${Utils.fmt(m)}`,
        `Sample SD = ${Utils.fmt(s)}`,
        `CV = SD / |Mean| = ${Utils.fmt(cv)} (${Utils.fmt(cv * 100, 2)}%)`
      ]
    });
  },

  runFiveNum() {
    const { data, name } = this.getNumericCol('d5Var');
    if (!data.length) return Utils.toast('No data', 'warning');
    const min = StatsDescriptive.min(data), max = StatsDescriptive.max(data);
    const q = StatsDescriptive.quartiles(data);
    this.show({
      toolId: 'five-num', title: 'Five-Number Summary', varName: name,
      metrics: [
        { label: 'Min', value: Utils.fmt(min) },
        { label: 'Q1', value: Utils.fmt(q.q1) },
        { label: 'Median', value: Utils.fmt(q.q2) },
        { label: 'Q3', value: Utils.fmt(q.q3) },
        { label: 'Max', value: Utils.fmt(max) },
        { label: 'IQR', value: Utils.fmt(q.iqr) }
      ],
      steps: [
        `Sorted data, identify min, Q1, median, Q3, max`,
        `IQR = Q3 − Q1 = ${Utils.fmt(q.iqr)}`,
        `Tukey outlier fences: [${Utils.fmt(q.q1 - 1.5 * q.iqr)}, ${Utils.fmt(q.q3 + 1.5 * q.iqr)}]`
      ],
      histogram: { data, title: name, xLabel: name }
    });
  },

  runMAD() {
    const { data, name } = this.getNumericCol('dMadVar');
    if (!data.length) return Utils.toast('No data', 'warning');
    const mad = StatsDescriptive.meanAbsoluteDeviation(data);
    this.show({
      toolId: 'mad', title: 'Mean Absolute Deviation', varName: name,
      metrics: [
        { label: 'MAD (mean)', value: Utils.fmt(mad) },
        { label: 'Mean', value: Utils.fmt(StatsDescriptive.mean(data)) },
        { label: 'n', value: data.length }
      ],
      interpretation: 'MAD = mean of absolute deviations from the mean. Robust alternative to SD; not squared.',
      steps: [
        `Mean = ${Utils.fmt(StatsDescriptive.mean(data))}`,
        `MAD = mean(|xᵢ − mean|) = ${Utils.fmt(mad)}`
      ]
    });
  },

  runMedianAD() {
    const { data, name } = this.getNumericCol('dMadMVar');
    if (!data.length) return Utils.toast('No data', 'warning');
    const mad = StatsDescriptive.medianAbsoluteDeviation(data);
    this.show({
      toolId: 'median-ad', title: 'Median Absolute Deviation', varName: name,
      metrics: [
        { label: 'MAD (median)', value: Utils.fmt(mad) },
        { label: 'Median', value: Utils.fmt(StatsDescriptive.median(data)) },
        { label: 'Robust SD ≈', value: Utils.fmt(mad * 1.4826) }
      ],
      interpretation: 'Median absolute deviation = median(|xᵢ − median|). Highly robust to outliers. Multiply by 1.4826 to estimate SD assuming normality.',
      steps: [
        `Median = ${Utils.fmt(StatsDescriptive.median(data))}`,
        `MAD = median(|xᵢ − median|) = ${Utils.fmt(mad)}`
      ]
    });
  },

  runPercentile() {
    const { data, name } = this.getNumericCol('dPctVar');
    if (!data.length) return Utils.toast('No data', 'warning');
    const p = parseFloat($('#dPctP').value);
    const val = StatsDescriptive.percentile(data, p);
    const q = StatsDescriptive.quartiles(data);
    this.show({
      toolId: 'percentile', title: `Percentile / Quartile / IQR`, varName: name,
      metrics: [
        { label: `P${Utils.fmt(p, 1)}`, value: Utils.fmt(val) },
        { label: 'Q1 (25%)', value: Utils.fmt(q.q1) },
        { label: 'Median (50%)', value: Utils.fmt(q.q2) },
        { label: 'Q3 (75%)', value: Utils.fmt(q.q3) },
        { label: 'IQR', value: Utils.fmt(q.iqr) }
      ],
      steps: [
        `Linear interpolation method`,
        `Index = (p/100) × (n − 1) = ${Utils.fmt((p/100)*(data.length-1))}`,
        `P${p} = ${Utils.fmt(val)}`
      ]
    });
  },

  runZScore() {
    const { data, name } = this.getNumericCol('dZVar');
    if (!data.length) return Utils.toast('No data', 'warning');
    const m = StatsDescriptive.mean(data);
    const s = StatsDescriptive.stddev(data, false);
    const z = StatsDescriptive.zScores(data);
    const rows = z.slice(0, 50).map((zi, i) => ({ idx: i + 1, value: data[i], z: zi }));
    const extra = `
      <h4 style="margin-top:12px">Z-scores (first ${rows.length} rows)</h4>
      <table class="data-table" style="width:100%">
        <thead><tr><th>#</th><th>Value</th><th>z</th></tr></thead>
        <tbody>${rows.map(r => `<tr><td>${r.idx}</td><td>${Utils.fmt(r.value)}</td><td>${Utils.fmt(r.z)}</td></tr>`).join('')}</tbody>
      </table>${data.length > 50 ? `<p class="text-muted" style="font-size:0.8rem">…showing 50 of ${data.length}</p>` : ''}`;
    this.show({
      toolId: 'zscore', title: 'Z-Score', varName: name,
      metrics: [
        { label: 'Mean', value: Utils.fmt(m) },
        { label: 'SD', value: Utils.fmt(s) },
        { label: '|z|>2 count', value: z.filter(zi => Math.abs(zi) > 2).length },
        { label: '|z|>3 count', value: z.filter(zi => Math.abs(zi) > 3).length }
      ],
      extraHTML: extra,
      steps: [`zᵢ = (xᵢ − mean) / SD`, `Mean = ${Utils.fmt(m)}, SD = ${Utils.fmt(s)}`]
    });
  },

  runSkewness() {
    const { data, name } = this.getNumericCol('dSkVar');
    if (!data.length) return Utils.toast('No data', 'warning');
    const sk = StatsDescriptive.skewness(data);
    const interp = Math.abs(sk) < 0.5 ? 'approximately symmetric' :
                   (Math.abs(sk) < 1 ? 'moderately skewed' : 'highly skewed');
    const dir = sk > 0 ? 'right (positive)' : sk < 0 ? 'left (negative)' : 'no';
    this.show({
      toolId: 'skewness', title: 'Skewness', varName: name,
      metrics: [{ label: 'Skewness (g₁)', value: Utils.fmt(sk) }, { label: 'n', value: data.length }],
      interpretation: `Distribution is <strong>${interp}</strong>, ${dir} skew.`,
      steps: [`Sample skewness g₁ = (n/((n−1)(n−2))) · Σ((xᵢ−x̄)/s)³ = ${Utils.fmt(sk)}`],
      histogram: { data, title: name, xLabel: name }
    });
  },

  runKurtosis() {
    const { data, name } = this.getNumericCol('dKuVar');
    if (!data.length) return Utils.toast('No data', 'warning');
    const k = StatsDescriptive.kurtosis(data);
    const interp = Math.abs(k) < 0.5 ? 'approximately mesokurtic (normal-like)' :
                   k > 0 ? 'leptokurtic (heavier tails / sharper peak)' : 'platykurtic (lighter tails / flatter peak)';
    this.show({
      toolId: 'kurtosis', title: 'Kurtosis (Excess)', varName: name,
      metrics: [{ label: 'Excess Kurtosis (g₂)', value: Utils.fmt(k) }, { label: 'n', value: data.length }],
      interpretation: `Distribution is <strong>${interp}</strong>.`,
      steps: [`Excess kurtosis g₂ = bias-corrected fourth moment − 3 = ${Utils.fmt(k)}`],
      histogram: { data, title: name, xLabel: name }
    });
  },

  runCovariance() {
    const c1 = this.getNumericCol('dCovVar1');
    const c2 = this.getNumericCol('dCovVar2');
    if (!c1.data.length || !c2.data.length) return Utils.toast('Need both variables', 'warning');
    const cov = StatsDescriptive.covariance(c1.data, c2.data, false);
    const popCov = StatsDescriptive.covariance(c1.data, c2.data, true);
    this.show({
      toolId: 'covariance', title: 'Covariance', varName: `${c1.name} & ${c2.name}`,
      metrics: [
        { label: 'Sample Cov', value: Utils.fmt(cov) },
        { label: 'Pop Cov', value: Utils.fmt(popCov) },
        { label: 'n', value: Math.min(c1.data.length, c2.data.length) }
      ],
      interpretation: `${cov > 0 ? 'Positive' : cov < 0 ? 'Negative' : 'Zero'} covariance: variables ${cov > 0 ? 'tend to move together' : cov < 0 ? 'move oppositely' : 'are uncorrelated'}.`,
      steps: [`Sample Cov(X,Y) = Σ(xᵢ−x̄)(yᵢ−ȳ)/(n−1) = ${Utils.fmt(cov)}`]
    });
  },

  runFrequency() {
    const { data, name } = this.getCol('dFreqVar');
    if (!data.length) return Utils.toast('No data', 'warning');
    const rows = StatsDescriptive.frequencyTable(data);
    const extra = `
      <table class="data-table" style="width:100%;margin-top:12px">
        <thead><tr><th>Value</th><th>Count</th><th>Relative</th><th>%</th><th>Cum. Count</th><th>Cum. %</th></tr></thead>
        <tbody>${rows.map(r => `
          <tr>
            <td>${Utils.escHtml(String(r.value))}</td>
            <td>${r.count}</td>
            <td>${Utils.fmt(r.relative, 4)}</td>
            <td>${Utils.fmt(r.percent, 2)}%</td>
            <td>${r.cumCount}</td>
            <td>${Utils.fmt(r.cumPercent, 2)}%</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
    this.show({
      toolId: 'frequency', title: 'Frequency Table', varName: name,
      metrics: [
        { label: 'n (total)', value: data.length },
        { label: 'Unique values', value: rows.length },
        { label: 'Most common', value: rows.reduce((a, b) => b.count > a.count ? b : a).value }
      ],
      extraHTML: extra,
      steps: [`Counted occurrences of each unique value`, `Relative = count / n; Cumulative = running sum`]
    });
  },

  runContingency() {
    const c1 = this.getCol('dContVar1');
    const c2 = this.getCol('dContVar2');
    if (!c1.data.length || !c2.data.length) return Utils.toast('Need both variables', 'warning');
    const ct = StatsDescriptive.contingencyTable(c1.data, c2.data);
    const head = `<th></th>${ct.yLevels.map(y => `<th>${Utils.escHtml(String(y))}</th>`).join('')}<th>Total</th>`;
    const body = ct.xLevels.map((xv, i) => `
      <tr>
        <th>${Utils.escHtml(String(xv))}</th>
        ${ct.counts[i].map(c => `<td>${c}</td>`).join('')}
        <td><strong>${ct.rowTotals[i]}</strong></td>
      </tr>`).join('');
    const totalRow = `<tr><th>Total</th>${ct.colTotals.map(c => `<td><strong>${c}</strong></td>`).join('')}<td><strong>${ct.n}</strong></td></tr>`;
    const extra = `
      <table class="data-table" style="width:auto;margin-top:12px">
        <thead><tr>${head}</tr></thead>
        <tbody>${body}${totalRow}</tbody>
      </table>`;
    this.show({
      toolId: 'contingency', title: 'Contingency Table', varName: `${c1.name} × ${c2.name}`,
      metrics: [
        { label: 'n', value: ct.n },
        { label: 'Rows', value: ct.xLevels.length },
        { label: 'Columns', value: ct.yLevels.length }
      ],
      extraHTML: extra,
      interpretation: 'Cross-tabulation of counts. For independence test, use the Chi-Square module.',
      steps: [`Counted joint occurrences across the two variables`]
    });
  },

  runCronbach() {
    const cbs = document.querySelectorAll('#dCronVars .multi-var-cb:checked');
    const indices = Array.from(cbs).map(cb => parseInt(cb.value));
    if (indices.length < 2) return Utils.toast('Select at least 2 items', 'warning');
    const items = indices.map(i => AppState.getColumn(i));
    const r = StatsDescriptive.cronbachsAlpha(items);
    if (r.error) return Utils.toast(r.error, 'error');
    const interp = r.alpha >= 0.9 ? 'excellent' : r.alpha >= 0.8 ? 'good' :
                   r.alpha >= 0.7 ? 'acceptable' : r.alpha >= 0.6 ? 'questionable' :
                   r.alpha >= 0.5 ? 'poor' : 'unacceptable';
    this.show({
      toolId: 'cronbach', title: "Cronbach's Alpha", varName: indices.map(i => AppState.data.headers[i]).join(', '),
      metrics: [
        { label: 'α', value: Utils.fmt(r.alpha) },
        { label: 'k (items)', value: r.k },
        { label: 'n (subjects)', value: r.n }
      ],
      interpretation: `Internal consistency reliability is <strong>${interp}</strong> (α = ${Utils.fmt(r.alpha)}).`,
      steps: [
        `α = (k/(k−1)) · (1 − Σσᵢ² / σ_total²)`,
        `k = ${r.k}, n = ${r.n}`,
        `Σ item variances = ${Utils.fmt(r.sumItemVar)}`,
        `Total variance = ${Utils.fmt(r.totalVar)}`,
        `α = ${Utils.fmt(r.alpha)}`
      ]
    });
  }
};
