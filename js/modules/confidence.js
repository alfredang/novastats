/* ===== CONFIDENCE INTERVAL MODULE CONTROLLER ===== */

window.ModuleConfidence = {

  currentSubTab: 'ci-mean',

  varOptions() { return DataManager.getVariableOptions(); },
  varOptionsAt(idx) {
    return AppState.data.headers.map((h, i) =>
      `<option value="${i}" ${i === idx ? 'selected' : ''}>${Utils.escHtml(h)}</option>`
    ).join('');
  },

  confSelect(id) {
    return `<select id="${id}">
      <option value="0.90">90%</option>
      <option value="0.95" selected>95%</option>
      <option value="0.99">99%</option>
    </select>`;
  },

  render(container) {
    const hasData = AppState.hasData();
    container.innerHTML = `
      <div class="module-header">
        <h2>Confidence Intervals</h2>
        <p>Estimate population parameters from sample data with a stated confidence level.</p>
      </div>
      ${!hasData ? Utils.noDataWarning('confidence', 'exam-scores', 'Exam Scores') : ''}

      <div class="card hyp-layout" style="margin-bottom:20px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
        <aside class="hyp-sidebar" style="flex:0 0 220px;min-width:200px;border-right:1px solid var(--border);padding-right:12px">
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="ci-cat">▾ CI Calculators</button>
            <div class="hyp-cat-list" data-cat-list="ci-cat">
              <button class="hyp-test-btn active" data-tab="ci-mean">Mean</button>
              <button class="hyp-test-btn" data-tab="ci-proportion">Proportion</button>
              <button class="hyp-test-btn" data-tab="ci-sd">Standard Deviation</button>
              <button class="hyp-test-btn" data-tab="ci-corr">Correlation Coefficient</button>
              <button class="hyp-test-btn" data-tab="ci-diff-means">Difference in Means</button>
              <button class="hyp-test-btn" data-tab="ci-diff-prop">Difference in Proportions</button>
              <button class="hyp-test-btn" data-tab="ci-moe">Margin of Error</button>
            </div>
          </div>
        </aside>

        <div class="hyp-content" style="flex:1;min-width:300px">
          <div class="sub-panel active" id="panel-ci-mean">
            <div class="param-row">
              <div class="form-group"><label>Variable</label>
                <select id="ciMeanVar">${hasData ? this.varOptions() : ''}</select></div>
              <div class="form-group"><label>Confidence</label>${this.confSelect('ciMeanConf')}</div>
              <div class="form-group"><label>σ known? (blank = t-based)</label>
                <input type="number" id="ciMeanSigma" step="any" placeholder="Leave blank"></div>
              <button class="btn btn-primary" id="ciMeanCompute">Compute</button>
            </div>
          </div>

          <div class="sub-panel" id="panel-ci-proportion">
            <div class="param-row">
              <div class="form-group"><label>Successes (x)</label>
                <input type="number" id="ciPropX" value="60" min="0" step="1"></div>
              <div class="form-group"><label>Sample size (n)</label>
                <input type="number" id="ciPropN" value="100" min="1" step="1"></div>
              <div class="form-group"><label>Confidence</label>${this.confSelect('ciPropConf')}</div>
              <div class="form-group"><label>Method</label>
                <select id="ciPropMethod">
                  <option value="wilson" selected>Wilson (recommended)</option>
                  <option value="wald">Wald (normal approx)</option>
                </select>
              </div>
              <button class="btn btn-primary" id="ciPropCompute">Compute</button>
            </div>
          </div>

          <div class="sub-panel" id="panel-ci-sd">
            <div class="param-row">
              <div class="form-group"><label>Variable</label>
                <select id="ciSdVar">${hasData ? this.varOptions() : ''}</select></div>
              <div class="form-group"><label>Confidence</label>${this.confSelect('ciSdConf')}</div>
              <button class="btn btn-primary" id="ciSdCompute">Compute</button>
            </div>
          </div>

          <div class="sub-panel" id="panel-ci-corr">
            <div class="param-row">
              <div class="form-group"><label>r</label>
                <input type="number" id="ciCorrR" value="0.7" min="-0.999" max="0.999" step="0.01"></div>
              <div class="form-group"><label>n</label>
                <input type="number" id="ciCorrN" value="30" min="4" step="1"></div>
              <div class="form-group"><label>Confidence</label>${this.confSelect('ciCorrConf')}</div>
              <button class="btn btn-primary" id="ciCorrCompute">Compute</button>
            </div>
          </div>

          <div class="sub-panel" id="panel-ci-diff-means">
            <div class="var-selector">
              <div class="form-group"><label>Sample 1</label>
                <select id="ciDmVar1">${hasData ? this.varOptions() : ''}</select></div>
              <div class="form-group"><label>Sample 2</label>
                <select id="ciDmVar2">${hasData ? this.varOptionsAt(1) : ''}</select></div>
              <div class="form-group"><label>Confidence</label>${this.confSelect('ciDmConf')}</div>
              <button class="btn btn-primary" id="ciDmCompute">Compute</button>
            </div>
          </div>

          <div class="sub-panel" id="panel-ci-diff-prop">
            <div class="param-row">
              <div class="form-group"><label>x₁</label><input type="number" id="ciDpX1" value="40" min="0" step="1"></div>
              <div class="form-group"><label>n₁</label><input type="number" id="ciDpN1" value="100" min="1" step="1"></div>
              <div class="form-group"><label>x₂</label><input type="number" id="ciDpX2" value="55" min="0" step="1"></div>
              <div class="form-group"><label>n₂</label><input type="number" id="ciDpN2" value="100" min="1" step="1"></div>
              <div class="form-group"><label>Confidence</label>${this.confSelect('ciDpConf')}</div>
              <button class="btn btn-primary" id="ciDpCompute">Compute</button>
            </div>
          </div>

          <div class="sub-panel" id="panel-ci-moe">
            <div class="param-row">
              <div class="form-group"><label>Parameter</label>
                <select id="moeKind">
                  <option value="mean">Mean (σ known)</option>
                  <option value="proportion">Proportion</option>
                </select>
              </div>
              <div class="form-group"><label>n</label>
                <input type="number" id="moeN" value="100" min="1" step="1"></div>
              <div class="form-group" id="moeSigmaWrap"><label>σ</label>
                <input type="number" id="moeSigma" value="10" min="0.001" step="any"></div>
              <div class="form-group" id="moePWrap" style="display:none"><label>p (default 0.5)</label>
                <input type="number" id="moeP" value="0.5" min="0" max="1" step="0.01"></div>
              <div class="form-group"><label>Target margin</label>
                <input type="number" id="moeTarget" value="2" min="0.001" step="any"></div>
              <div class="form-group"><label>Confidence</label>${this.confSelect('moeConf')}</div>
              <button class="btn btn-primary" id="moeCompute">Compute</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card" id="ciResultsArea" style="display:none">
        <div class="card-header"><h3 id="ciTitle">Results</h3></div>
        <div class="card-body">
          <div class="results-grid" id="ciGrid"></div>
          <div class="interpretation" id="ciInterp"></div>
          <details style="margin-top:12px">
            <summary>Step-by-step</summary>
            <div class="details-content" id="ciSteps"></div>
          </details>
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

    const bind = (id, fn) => { const el = $('#' + id); if (el) el.addEventListener('click', () => fn.call(this)); };
    bind('ciMeanCompute', this.runMean);
    bind('ciPropCompute', this.runProportion);
    bind('ciSdCompute', this.runSD);
    bind('ciCorrCompute', this.runCorr);
    bind('ciDmCompute', this.runDiffMeans);
    bind('ciDpCompute', this.runDiffProp);
    bind('moeCompute', this.runMoE);

    const moeKind = $('#moeKind');
    if (moeKind) moeKind.addEventListener('change', () => {
      const isMean = moeKind.value === 'mean';
      $('#moeSigmaWrap').style.display = isMean ? '' : 'none';
      $('#moePWrap').style.display = isMean ? 'none' : '';
    });

    if (typeof injectExampleButtons === 'function') injectExampleButtons(container);
  },

  show(opts) {
    $('#ciResultsArea').style.display = '';
    $('#ciTitle').textContent = opts.title || 'Results';
    $('#ciGrid').innerHTML = (opts.metrics || []).map(m =>
      `<div class="result-card"><div class="result-value">${m.value}</div><div class="result-label">${m.label}</div></div>`
    ).join('');
    $('#ciInterp').innerHTML = (opts.interpretation || '') +
      (typeof renderExplanation === 'function' ? renderExplanation(this.currentSubTab) : '');
    $('#ciSteps').innerHTML = (opts.steps || []).map(s =>
      `<div class="step-line">${Utils.escHtml(s)}</div>`).join('');
  },

  runMean() {
    const data = AppState.getColumn(parseInt($('#ciMeanVar').value));
    if (!data.length) return Utils.toast('No data', 'warning');
    const conf = parseFloat($('#ciMeanConf').value);
    const sigmaInput = $('#ciMeanSigma').value;
    const sigma = sigmaInput === '' ? null : parseFloat(sigmaInput);
    const r = StatsConfidence.ciMean(data, conf, sigma);
    this.show({
      title: `${Utils.fmt(conf * 100, 0)}% CI for the Mean (${r.type === 'z' ? 'z-based' : 't-based'})`,
      metrics: [
        { label: 'x̄', value: Utils.fmt(r.xbar) },
        { label: 'SE', value: Utils.fmt(r.se) },
        { label: 'Margin', value: Utils.fmt(r.margin) },
        { label: 'Lower', value: Utils.fmt(r.low) },
        { label: 'Upper', value: Utils.fmt(r.high) },
        { label: 'n', value: r.n }
      ],
      interpretation: `We are <strong>${Utils.fmt(conf * 100, 0)}%</strong> confident the population mean lies in <strong>[${Utils.fmt(r.low)}, ${Utils.fmt(r.high)}]</strong>.`,
      steps: r.steps
    });
  },

  runProportion() {
    const x = parseInt($('#ciPropX').value);
    const n = parseInt($('#ciPropN').value);
    if (n <= 0 || x < 0 || x > n) return Utils.toast('Invalid x or n', 'warning');
    const r = StatsConfidence.ciProportion(x, n, parseFloat($('#ciPropConf').value), $('#ciPropMethod').value);
    this.show({
      title: `CI for a Proportion (${r.method})`,
      metrics: [
        { label: 'p̂', value: Utils.fmt(r.p) },
        { label: 'Lower', value: Utils.fmt(r.low) },
        { label: 'Upper', value: Utils.fmt(r.high) },
        { label: 'n', value: r.n },
        { label: 'x', value: r.x }
      ],
      interpretation: `<strong>${Utils.fmt(r.conf * 100, 0)}%</strong> CI for p: <strong>[${Utils.fmt(r.low)}, ${Utils.fmt(r.high)}]</strong>.`,
      steps: r.steps
    });
  },

  runSD() {
    const data = AppState.getColumn(parseInt($('#ciSdVar').value));
    if (!data.length) return Utils.toast('No data', 'warning');
    const r = StatsConfidence.ciStdDev(data, parseFloat($('#ciSdConf').value));
    this.show({
      title: 'CI for Standard Deviation',
      metrics: [
        { label: 'Sample SD', value: Utils.fmt(r.s) },
        { label: 'SD Lower', value: Utils.fmt(r.sdLow) },
        { label: 'SD Upper', value: Utils.fmt(r.sdHigh) },
        { label: 'Variance Lower', value: Utils.fmt(r.varLow) },
        { label: 'Variance Upper', value: Utils.fmt(r.varHigh) },
        { label: 'df', value: r.df }
      ],
      interpretation: `Population SD lies in <strong>[${Utils.fmt(r.sdLow)}, ${Utils.fmt(r.sdHigh)}]</strong> with ${Utils.fmt(r.conf * 100, 0)}% confidence.`,
      steps: r.steps
    });
  },

  runCorr() {
    const r = StatsConfidence.ciCorrelation(
      parseFloat($('#ciCorrR').value),
      parseInt($('#ciCorrN').value),
      parseFloat($('#ciCorrConf').value)
    );
    if (r.error) return Utils.toast(r.error, 'warning');
    this.show({
      title: 'CI for Correlation Coefficient',
      metrics: [
        { label: 'r', value: Utils.fmt(r.r) },
        { label: 'Lower', value: Utils.fmt(r.low) },
        { label: 'Upper', value: Utils.fmt(r.high) },
        { label: 'n', value: r.n }
      ],
      interpretation: `Population ρ lies in <strong>[${Utils.fmt(r.low)}, ${Utils.fmt(r.high)}]</strong> with ${Utils.fmt(r.conf * 100, 0)}% confidence. Uses Fisher z-transform.`,
      steps: r.steps
    });
  },

  runDiffMeans() {
    const d1 = AppState.getColumn(parseInt($('#ciDmVar1').value));
    const d2 = AppState.getColumn(parseInt($('#ciDmVar2').value));
    if (!d1.length || !d2.length) return Utils.toast('Need both samples', 'warning');
    const r = StatsConfidence.ciDiffMeans(d1, d2, parseFloat($('#ciDmConf').value));
    this.show({
      title: 'CI for Difference in Means',
      metrics: [
        { label: 'm₁ − m₂', value: Utils.fmt(r.diff) },
        { label: 'SE', value: Utils.fmt(r.se) },
        { label: 'Lower', value: Utils.fmt(r.low) },
        { label: 'Upper', value: Utils.fmt(r.high) },
        { label: 'df', value: Utils.fmt(r.df, 2) }
      ],
      interpretation: `Difference μ₁ − μ₂ lies in <strong>[${Utils.fmt(r.low)}, ${Utils.fmt(r.high)}]</strong> with ${Utils.fmt(r.conf * 100, 0)}% confidence. Uses Welch's df (unequal variances allowed).`,
      steps: r.steps
    });
  },

  runDiffProp() {
    const r = StatsConfidence.ciDiffProportions(
      parseInt($('#ciDpX1').value), parseInt($('#ciDpN1').value),
      parseInt($('#ciDpX2').value), parseInt($('#ciDpN2').value),
      parseFloat($('#ciDpConf').value)
    );
    this.show({
      title: 'CI for Difference in Proportions',
      metrics: [
        { label: 'p̂₁ − p̂₂', value: Utils.fmt(r.diff) },
        { label: 'SE', value: Utils.fmt(r.se) },
        { label: 'Lower', value: Utils.fmt(r.low) },
        { label: 'Upper', value: Utils.fmt(r.high) }
      ],
      interpretation: `Difference p₁ − p₂ lies in <strong>[${Utils.fmt(r.low)}, ${Utils.fmt(r.high)}]</strong> with ${Utils.fmt(r.conf * 100, 0)}% confidence.`,
      steps: r.steps
    });
  },

  runMoE() {
    const kind = $('#moeKind').value;
    const params = {
      n: parseInt($('#moeN').value),
      conf: parseFloat($('#moeConf').value),
      targetMargin: parseFloat($('#moeTarget').value),
      sigma: parseFloat($('#moeSigma').value),
      p: parseFloat($('#moeP').value)
    };
    const r = StatsConfidence.marginOfError(kind, params);
    this.show({
      title: `Margin of Error — ${r.kind}`,
      metrics: [
        { label: 'Margin', value: Utils.fmt(r.margin) },
        { label: 'n for target', value: r.nForTarget },
        { label: 'Target margin', value: Utils.fmt(r.targetMargin) },
        { label: 'z critical', value: Utils.fmt(r.z) }
      ],
      interpretation: `Current margin = <strong>${Utils.fmt(r.margin)}</strong>. To achieve a margin of ${r.targetMargin}, you would need n ≥ <strong>${r.nForTarget}</strong>.`,
      steps: r.steps
    });
  }
};
