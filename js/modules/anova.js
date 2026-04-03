/* ===== ANOVA MODULE CONTROLLER ===== */

window.ModuleAnova = {

  render(container) {
    const hasData = AppState.hasData();
    container.innerHTML = `
      <div class="module-header">
        <h2>One-Way ANOVA</h2>
        <p>Compare means across three or more groups to determine if there are statistically significant differences.</p>
      </div>
      ${!hasData ? Utils.noDataWarning('anova', 'treatment-groups', 'Treatment Groups') : ''}
      <div class="module-grid">
        <div class="card">
          <div class="card-header"><h3>Group Selection</h3></div>
          <div class="card-body">
            ${hasData ? `
              <p class="text-secondary" style="font-size:0.85rem;margin-bottom:12px">
                Select 2 or more variables. Each variable represents one group.
              </p>
              <div id="anovaVarList"></div>
              <button class="btn btn-primary" id="anovaCompute" style="margin-top:12px">Run ANOVA</button>
            ` : `<p class="text-muted" style="font-size:0.85rem">Load a dataset with 2+ groups (columns) to compare.</p>`}
          </div>
        </div>

        ${!hasData ? Utils.onboardingGuide({
          steps: [
            { title: 'Load group data', desc: 'You need <strong>2 or more columns</strong>, where each column represents a different group (e.g., Control, Drug A, Drug B).' },
            { title: 'Select groups', desc: 'Check the boxes next to the groups you want to compare. You can select any combination of 2+ groups.' },
            { title: 'Run ANOVA', desc: 'View the full ANOVA table (SS, df, MS, F, p-value), group means bar chart, effect size (\u03B7\u00B2), and interpretation.' }
          ],
          exampleKey: 'treatment-groups',
          exampleLabel: 'Treatment Groups (3 groups)'
        }) : ''}

        <div class="card" id="anovaChartCard" style="display:none">
          <div class="card-header"><h3>Group Comparison</h3></div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="anovaChart"></canvas>
            </div>
          </div>
        </div>

        <div class="card full-width" id="anovaResultsCard" style="display:none">
          <div class="card-header"><h3>ANOVA Table</h3></div>
          <div class="card-body">
            <div class="data-grid-wrapper" style="margin-bottom:12px">
              <table class="data-table anova-table" id="anovaTable"></table>
            </div>
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

    if (hasData) {
      this.buildVarCheckboxes();
      $('#anovaCompute').addEventListener('click', () => this.compute());
    }

    Utils.bindGuideButtons(container, () => {
      UI.switchModule('anova');
      setTimeout(() => {
        const btn = $('#anovaCompute');
        if (btn) btn.click();
      }, 100);
    });
  },

  buildVarCheckboxes() {
    const headers = AppState.data.headers;
    const container = $('#anovaVarList');
    if (!headers.length) {
      container.innerHTML = '<div class="empty-state"><p>Load data first</p></div>';
      return;
    }

    container.innerHTML = headers.map((h, i) => `
      <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:0.9rem">
        <input type="checkbox" class="anova-var-cb" value="${i}" ${i < 3 ? 'checked' : ''}>
        <span>${Utils.escHtml(h)}</span>
        <span class="text-muted" style="font-size:0.78rem">(n=${AppState.getColumn(i).length})</span>
      </label>
    `).join('');
  },

  compute() {
    const checked = $$('.anova-var-cb:checked');
    const indices = Array.from(checked).map(cb => parseInt(cb.value));

    if (indices.length < 2) {
      Utils.toast('Select at least 2 groups for ANOVA', 'warning');
      return;
    }

    const groups = indices.map(i => AppState.getColumn(i));
    const groupNames = indices.map(i => AppState.data.headers[i]);

    // Check each group has data
    if (groups.some(g => g.length < 2)) {
      Utils.toast('Each group needs at least 2 observations', 'warning');
      return;
    }

    const result = StatsAnova.oneWayAnova(groups);
    if (!result) {
      Utils.toast('Cannot compute ANOVA', 'error');
      return;
    }

    AppState.setResult('anova', result);

    // Show results
    $('#anovaResultsCard').style.display = '';
    $('#anovaChartCard').style.display = '';

    // ANOVA table
    $('#anovaTable').innerHTML = `
      <thead>
        <tr>
          <th>Source</th>
          <th>SS</th>
          <th>df</th>
          <th>MS</th>
          <th>F</th>
          <th>p-value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Between Groups</td>
          <td>${Utils.fmt(result.ssBetween)}</td>
          <td>${result.dfBetween}</td>
          <td>${Utils.fmt(result.msBetween)}</td>
          <td class="${result.reject ? 'significant' : ''}">${Utils.fmt(result.fStat)}</td>
          <td class="${result.reject ? 'significant' : ''}">${Utils.pFmt(result.pValue)}</td>
        </tr>
        <tr>
          <td>Within Groups</td>
          <td>${Utils.fmt(result.ssWithin)}</td>
          <td>${result.dfWithin}</td>
          <td>${Utils.fmt(result.msWithin)}</td>
          <td></td>
          <td></td>
        </tr>
        <tr style="font-weight:600">
          <td>Total</td>
          <td>${Utils.fmt(result.ssTotal)}</td>
          <td>${result.dfTotal}</td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    `;

    const metrics = [
      { label: 'F-statistic', value: Utils.fmt(result.fStat) },
      { label: 'p-value', value: Utils.pFmt(result.pValue) },
      { label: 'Critical F', value: Utils.fmt(result.fCrit) },
      { label: '\u03B7\u00B2 (Effect Size)', value: Utils.fmt(result.etaSquared) },
      { label: 'Groups', value: result.k },
      { label: 'Total N', value: result.N }
    ];

    $('#anovaResultsGrid').innerHTML = metrics.map(m =>
      `<div class="result-card">
        <div class="result-value">${m.value}</div>
        <div class="result-label">${m.label}</div>
      </div>`
    ).join('');

    const decBox = $('#anovaDecision');
    decBox.textContent = result.decision;
    decBox.className = `decision-box ${result.reject ? 'reject' : 'fail-to-reject'}`;

    const etaPct = Utils.fmt(result.etaSquared * 100, 1);
    $('#anovaInterpretation').innerHTML = `
      The one-way ANOVA comparing ${result.k} groups (${groupNames.join(', ')}) yielded
      F(${result.dfBetween}, ${result.dfWithin}) = <strong>${Utils.fmt(result.fStat)}</strong>,
      p = <strong>${Utils.pFmt(result.pValue)}</strong>.
      ${result.reject
        ? `There is a <strong>statistically significant difference</strong> between at least two group means. The effect size (\u03B7\u00B2 = ${Utils.fmt(result.etaSquared)}) indicates that ${etaPct}% of the variance is explained by group membership.`
        : 'There is <strong>no statistically significant difference</strong> between the group means.'}
    `;

    $('#anovaSteps').innerHTML = result.steps.map(s =>
      `<div class="step-line">${Utils.escHtml(s)}</div>`
    ).join('');

    // Bar chart of group means
    const canvas = document.getElementById('anovaChart');
    const w = canvas.parentElement.clientWidth - 32;
    ChartRenderer.barChart(canvas, groupNames, result.means, {
      width: w, height: 280,
      title: 'Group Means',
      yLabel: 'Mean'
    });
  }
};
