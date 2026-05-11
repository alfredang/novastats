/* ===== ANOVA MODULE CONTROLLER ===== */

window.ModuleAnova = {

  currentSubTab: 'one-way',

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
        <h2>ANOVA</h2>
        <p>Compare means across multiple groups: one-way, Welch's, two-way (factorial), and repeated measures.</p>
      </div>
      ${!hasData ? Utils.noDataWarning('anova', 'treatment-groups', 'Treatment Groups') : ''}

      ${!hasData ? Utils.onboardingGuide({
        steps: [
          { title: 'Load group data', desc: 'Each numeric column = one group (one-way / Welch\'s / RM); for two-way, use 2 categorical factors + 1 numeric outcome.' },
          { title: 'Pick an ANOVA variant', desc: 'One-way (equal var), Welch\'s (unequal var), Two-way (factorial with interaction), or Repeated Measures (paired across treatments).' },
          { title: 'Run', desc: 'View ANOVA table, F-statistics, p-values, effect size, and step-by-step computation.' }
        ],
        exampleKey: 'treatment-groups',
        exampleLabel: 'Treatment Groups'
      }) : ''}

      <div class="card hyp-layout" style="margin-bottom:20px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
        <aside class="hyp-sidebar" style="flex:0 0 220px;min-width:200px;border-right:1px solid var(--border);padding-right:12px">
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="anova-types">▾ ANOVA Variants</button>
            <div class="hyp-cat-list" data-cat-list="anova-types">
              <button class="hyp-test-btn active" data-tab="one-way">One-way ANOVA</button>
              <button class="hyp-test-btn" data-tab="welch">Welch's ANOVA</button>
              <button class="hyp-test-btn" data-tab="two-way">Two-way ANOVA</button>
            </div>
          </div>
        </aside>

        <div class="hyp-content" style="flex:1;min-width:300px">
          <div class="sub-panel active" id="panel-one-way">
            <div class="form-group"><label>Groups (select 2+ columns)</label>
              <div id="anovaVars">${hasData ? this.multiVarOptions() : ''}</div>
            </div>
            <button class="btn btn-primary" id="anovaCompute">Run ANOVA</button>
          </div>

          <div class="sub-panel" id="panel-welch">
            <div class="form-group"><label>Groups (select 2+ columns)</label>
              <div id="welchVars">${hasData ? this.multiVarOptions() : ''}</div>
            </div>
            <button class="btn btn-primary" id="welchCompute">Run Welch's ANOVA</button>
          </div>

          <div class="sub-panel" id="panel-two-way">
            <div class="var-selector">
              <div class="form-group"><label>Factor A (categorical)</label>
                <select id="twAvar">${hasData ? this.varOptions() : ''}</select>
              </div>
              <div class="form-group"><label>Factor B (categorical)</label>
                <select id="twBvar">${hasData ? this.varOptionsAt(1) : ''}</select>
              </div>
              <div class="form-group"><label>Outcome Y (numeric)</label>
                <select id="twYvar">${hasData ? this.varOptionsAt(AppState.getColumnCount() - 1) : ''}</select>
              </div>
              <button class="btn btn-primary" id="twCompute">Run Two-way ANOVA</button>
            </div>
          </div>

        </div>
      </div>

      <div class="module-grid" id="anovaResultsArea" style="display:none">
        <div class="card" id="anovaChartCard">
          <div class="card-header"><h3>Visualization</h3></div>
          <div class="card-body">
            <div class="chart-container"><canvas id="anovaChart"></canvas></div>
          </div>
        </div>
        <div class="card full-width">
          <div class="card-header"><h3 id="anovaResultsTitle">ANOVA Results</h3></div>
          <div class="card-body">
            <div id="anovaTableArea"></div>
            <div class="results-grid" id="anovaResultsGrid"></div>
            <div class="decision-box" id="anovaDecision"></div>
            <div class="interpretation" id="anovaInterpretation"></div>
            <details style="margin-top:12px">
              <summary>Step-by-step calculation</summary>
              <div class="details-content" id="anovaSteps"></div>
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
      bind('anovaCompute', this.runOneWay);
      bind('welchCompute', this.runWelch);
      bind('twCompute', this.runTwoWay);
    }

    Utils.bindGuideButtons(container, () => {
      UI.switchModule('anova');
      setTimeout(() => { const btn = $('#anovaCompute'); if (btn) btn.click(); }, 100);
    });
    if (typeof injectExampleButtons === 'function') injectExampleButtons(container);
  },

  getCheckedColumns(containerId) {
    const cbs = document.querySelectorAll(`#${containerId} .multi-var-cb:checked`);
    const indices = Array.from(cbs).map(cb => parseInt(cb.value));
    return {
      indices,
      cols: indices.map(i => AppState.getColumn(i)),
      labels: indices.map(i => AppState.data.headers[i])
    };
  },

  show(opts) {
    $('#anovaResultsArea').style.display = '';
    $('#anovaResultsTitle').textContent = opts.title || 'Results';
    $('#anovaTableArea').innerHTML = opts.tableHTML || '';
    $('#anovaResultsGrid').innerHTML = (opts.metrics || []).map(m =>
      `<div class="result-card"><div class="result-value">${m.value}</div><div class="result-label">${m.label}</div></div>`
    ).join('');
    const dec = $('#anovaDecision');
    dec.textContent = opts.decision || '';
    dec.className = `decision-box ${opts.reject ? 'reject' : 'fail-to-reject'}`;
    $('#anovaInterpretation').innerHTML = (opts.interpretation || '') +
      (typeof renderExplanation === 'function' ? renderExplanation(this.currentSubTab) : '');
    $('#anovaSteps').innerHTML = (opts.steps || []).map(s =>
      `<div class="step-line">${Utils.escHtml(s)}</div>`).join('');

    const card = document.getElementById('anovaChartCard');
    if (opts.chart) {
      card.style.display = '';
      const canvas = document.getElementById('anovaChart');
      const w = canvas.parentElement.clientWidth - 32;
      ChartRenderer.barChart(canvas, opts.chart.labels, opts.chart.values, {
        width: w, height: 280, title: opts.chart.title || '', yLabel: opts.chart.yLabel || ''
      });
    } else {
      card.style.display = 'none';
    }
  },

  anovaTable(rows) {
    return `<table class="data-table" style="width:100%;margin-bottom:12px">
      <thead><tr><th>Source</th><th>SS</th><th>df</th><th>MS</th><th>F</th><th>p</th></tr></thead>
      <tbody>${rows.map(r => `
        <tr>
          <td>${r.name}</td>
          <td>${Utils.fmt(r.SS)}</td>
          <td>${r.df !== undefined ? r.df : '—'}</td>
          <td>${r.MS !== undefined ? Utils.fmt(r.MS) : '—'}</td>
          <td class="${r.sig ? 'significant' : ''}">${r.F !== undefined ? Utils.fmt(r.F) : ''}</td>
          <td class="${r.sig ? 'significant' : ''}">${r.p !== undefined ? Utils.pFmt(r.p) : ''}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  },

  runOneWay() {
    const { cols, labels } = this.getCheckedColumns('anovaVars');
    if (cols.length < 2) return Utils.toast('Select at least 2 groups', 'warning');
    if (cols.some(g => g.length < 2)) return Utils.toast('Each group needs n ≥ 2', 'warning');
    const r = StatsAnova.oneWayAnova(cols);
    if (!r) return Utils.toast('Cannot compute ANOVA', 'error');
    AppState.setResult('anova', r);

    const tbl = this.anovaTable([
      { name: 'Between Groups', SS: r.ssBetween, df: r.dfBetween, MS: r.msBetween, F: r.fStat, p: r.pValue, sig: r.reject },
      { name: 'Within Groups', SS: r.ssWithin, df: r.dfWithin, MS: r.msWithin },
      { name: 'Total', SS: r.ssTotal, df: r.dfTotal }
    ]);

    this.show({
      title: 'One-Way ANOVA', tableHTML: tbl,
      metrics: [
        { label: 'F', value: Utils.fmt(r.fStat) },
        { label: 'p-value', value: Utils.pFmt(r.pValue) },
        { label: 'Critical F', value: Utils.fmt(r.fCrit) },
        { label: 'η²', value: Utils.fmt(r.etaSquared) },
        { label: 'Groups', value: r.k },
        { label: 'N', value: r.N }
      ],
      decision: r.decision, reject: r.reject,
      interpretation: `F(${r.dfBetween}, ${r.dfWithin}) = <strong>${Utils.fmt(r.fStat)}</strong>, p = <strong>${Utils.pFmt(r.pValue)}</strong>. Effect size η² = ${Utils.fmt(r.etaSquared)} (${Utils.fmt(r.etaSquared * 100, 1)}% of variance explained).`,
      steps: r.steps,
      chart: { labels, values: r.means, title: 'Group Means', yLabel: 'Mean' }
    });
  },

  runWelch() {
    const { cols, labels } = this.getCheckedColumns('welchVars');
    if (cols.length < 2) return Utils.toast('Select at least 2 groups', 'warning');
    const r = StatsAnova.welchAnova(cols);
    if (r.error) return Utils.toast(r.error, 'error');
    AppState.setResult('anova', r);

    this.show({
      title: "Welch's ANOVA",
      metrics: [
        { label: 'F*', value: Utils.fmt(r.F) },
        { label: 'p-value', value: Utils.pFmt(r.pValue) },
        { label: 'df₁', value: r.df1 },
        { label: 'df₂', value: Utils.fmt(r.df2, 2) },
        { label: 'Groups', value: r.k }
      ],
      decision: r.decision, reject: r.reject,
      interpretation: `Welch's F*(${r.df1}, ${Utils.fmt(r.df2, 2)}) = <strong>${Utils.fmt(r.F)}</strong>, p = <strong>${Utils.pFmt(r.pValue)}</strong>. Robust to unequal variances.`,
      steps: r.steps,
      chart: { labels, values: r.means, title: 'Group Means', yLabel: 'Mean' }
    });
  },

  runTwoWay() {
    const aIdx = parseInt($('#twAvar').value);
    const bIdx = parseInt($('#twBvar').value);
    const yIdx = parseInt($('#twYvar').value);
    const A = AppState.getColumn(aIdx);
    const B = AppState.getColumn(bIdx);
    const Y = AppState.getColumn(yIdx);
    if (!A.length || !B.length || !Y.length) return Utils.toast('Need data in all three variables', 'warning');
    const r = StatsAnova.twoWayAnova(A, B, Y);
    if (r.error) return Utils.toast(r.error, 'error');
    AppState.setResult('anova', r);

    this.show({
      title: 'Two-Way ANOVA', tableHTML: this.anovaTable(r.effects),
      metrics: r.effects.filter(e => e.F !== undefined).map(e => ({ label: e.name + ' p', value: Utils.pFmt(e.p) })),
      decision: r.decision, reject: r.reject,
      interpretation: `Two-way ANOVA: ${r.a} levels × ${r.b} levels, n = ${r.n}. Significant effects: <strong>${r.decision.replace('Significant: ', '')}</strong>.`,
      steps: r.steps
    });
  },

  runRM() {
    const { cols, labels } = this.getCheckedColumns('rmVars');
    if (cols.length < 2) return Utils.toast('Select at least 2 treatment columns', 'warning');
    const n = Math.min(...cols.map(c => c.length));
    if (n < 2) return Utils.toast('Need at least 2 subjects (rows)', 'warning');
    const matrix = [];
    for (let i = 0; i < n; i++) matrix.push(cols.map(c => c[i]));
    const r = StatsAnova.repeatedMeasuresAnova(matrix);
    if (r.error) return Utils.toast(r.error, 'error');
    AppState.setResult('anova', r);

    const tbl = this.anovaTable([
      { name: 'Treatments', SS: r.ssTrt, df: r.dfBetween, MS: r.ssTrt / r.dfBetween, F: r.F, p: r.pValue, sig: r.reject },
      { name: 'Subjects', SS: r.ssSubj, df: r.n - 1 },
      { name: 'Error', SS: r.ssError, df: r.dfWithin, MS: r.ssError / r.dfWithin },
      { name: 'Total', SS: r.ssTotal, df: r.n * r.k - 1 }
    ]);

    this.show({
      title: 'Repeated Measures ANOVA', tableHTML: tbl,
      metrics: [
        { label: 'F', value: Utils.fmt(r.F) },
        { label: 'p-value', value: Utils.pFmt(r.pValue) },
        { label: 'Critical F', value: Utils.fmt(r.fCrit) },
        { label: 'n (subjects)', value: r.n },
        { label: 'k (treatments)', value: r.k }
      ],
      decision: r.decision, reject: r.reject,
      interpretation: `RM ANOVA: F(${r.dfBetween}, ${r.dfWithin}) = <strong>${Utils.fmt(r.F)}</strong>, p = <strong>${Utils.pFmt(r.pValue)}</strong>.`,
      steps: r.steps,
      chart: { labels, values: r.trtMeans, title: 'Treatment Means', yLabel: 'Mean' }
    });
  }
};
