/* ===== PROBABILITY MODULE CONTROLLER ===== */

window.ModuleProbability = {

  currentSubTab: 'basic-prob',

  DISTS: {
    'binomial':        { key: 'binomial',         title: 'Binomial Distribution' },
    'neg-binomial':    { key: 'negativeBinomial', title: 'Negative Binomial (Pascal) Distribution' },
    'poisson':         { key: 'poisson',          title: 'Poisson Distribution' },
    'geometric-dist':  { key: 'geometric',        title: 'Geometric Distribution' },
    'hypergeometric':  { key: 'hypergeometric',   title: 'Hypergeometric Distribution' },
    'normal':          { key: 'normal',           title: 'Normal (Gaussian) Distribution' },
    'log-normal':      { key: 'logNormal',        title: 'Log-Normal Distribution' },
    'logistic-dist':   { key: 'logistic',         title: 'Logistic Distribution' },
    'student-t':       { key: 'studentT',         title: "Student's t-Distribution" },
    'exponential-dist':{ key: 'exponential',      title: 'Exponential Distribution' },
    'uniform':         { key: 'uniform',          title: 'Continuous Uniform Distribution' },
    'gamma':           { key: 'gamma',            title: 'Gamma Distribution' },
    'beta-dist':       { key: 'beta',             title: 'Beta Distribution' },
    'chi-square-dist': { key: 'chiSquare',        title: 'Chi-Square Distribution' },
    'f-dist':          { key: 'fDist',            title: 'F-Distribution' },
    'weibull':         { key: 'weibull',          title: 'Weibull Distribution' },
    'inverse-normal':  { key: 'inverseNormal',    title: 'Inverse Normal Distribution' }
  },

  render(container) {
    container.innerHTML = `
      <div class="module-header">
        <h2>Probability</h2>
        <p>Basic probability calculator + 17 discrete and continuous distributions with PDF/PMF, CDF, quantiles, mean, and variance.</p>
      </div>

      <div class="card hyp-layout" style="margin-bottom:20px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
        <aside class="hyp-sidebar" style="flex:0 0 240px;min-width:220px;border-right:1px solid var(--border);padding-right:12px">
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="prob-basic">▾ Basic Probability</button>
            <div class="hyp-cat-list" data-cat-list="prob-basic">
              <button class="hyp-test-btn active" data-tab="basic-prob">Basic Probability Calculator</button>
            </div>
          </div>
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="prob-discrete">▾ Discrete Distributions</button>
            <div class="hyp-cat-list" data-cat-list="prob-discrete">
              <button class="hyp-test-btn" data-tab="binomial">Binomial</button>
              <button class="hyp-test-btn" data-tab="neg-binomial">Negative Binomial</button>
              <button class="hyp-test-btn" data-tab="poisson">Poisson</button>
              <button class="hyp-test-btn" data-tab="geometric-dist">Geometric</button>
              <button class="hyp-test-btn" data-tab="hypergeometric">Hypergeometric</button>
            </div>
          </div>
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="prob-continuous">▾ Continuous Distributions</button>
            <div class="hyp-cat-list" data-cat-list="prob-continuous">
              <button class="hyp-test-btn" data-tab="normal">Normal (Gaussian)</button>
              <button class="hyp-test-btn" data-tab="log-normal">Log-Normal</button>
              <button class="hyp-test-btn" data-tab="logistic-dist">Logistic</button>
              <button class="hyp-test-btn" data-tab="student-t">Student's t</button>
              <button class="hyp-test-btn" data-tab="exponential-dist">Exponential</button>
              <button class="hyp-test-btn" data-tab="uniform">Uniform</button>
              <button class="hyp-test-btn" data-tab="gamma">Gamma</button>
              <button class="hyp-test-btn" data-tab="beta-dist">Beta</button>
              <button class="hyp-test-btn" data-tab="chi-square-dist">Chi-Square</button>
              <button class="hyp-test-btn" data-tab="f-dist">F</button>
              <button class="hyp-test-btn" data-tab="weibull">Weibull</button>
              <button class="hyp-test-btn" data-tab="inverse-normal">Inverse Normal</button>
            </div>
          </div>
        </aside>

        <div class="hyp-content" style="flex:1;min-width:300px" id="probContent">
          <!-- Panels rendered dynamically -->
        </div>
      </div>

      <div class="card" id="probResultsArea" style="display:none">
        <div class="card-header"><h3 id="probTitle">Results</h3></div>
        <div class="card-body">
          <div class="results-grid" id="probGrid"></div>
          <div class="interpretation" id="probInterp"></div>
          <details style="margin-top:12px">
            <summary>Step-by-step</summary>
            <div class="details-content" id="probSteps"></div>
          </details>
        </div>
      </div>
    `;

    container.querySelectorAll('.hyp-test-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.hyp-test-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSubTab = btn.dataset.tab;
        this.renderPanel(btn.dataset.tab);
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

    this.renderPanel(this.currentSubTab);
    if (typeof injectExampleButtons === 'function') injectExampleButtons(container);
  },

  renderPanel(toolId) {
    const c = document.getElementById('probContent');
    if (toolId === 'basic-prob') {
      c.innerHTML = `
        <p class="text-muted" style="font-size:0.85rem">Computes P(¬A), P(A∪B), conditional probabilities, and tests independence.</p>
        <div class="param-row">
          <div class="form-group"><label>P(A)</label><input type="number" id="bpA" value="0.3" min="0" max="1" step="0.01"></div>
          <div class="form-group"><label>P(B)</label><input type="number" id="bpB" value="0.4" min="0" max="1" step="0.01"></div>
          <div class="form-group"><label>P(A ∩ B)</label><input type="number" id="bpAB" value="0.12" min="0" max="1" step="0.01"></div>
          <button class="btn btn-primary" id="basic-probCompute">Compute</button>
        </div>
      `;
      $('#basic-probCompute').addEventListener('click', () => this.runBasic());
      return;
    }
    const info = this.DISTS[toolId];
    if (!info) { c.innerHTML = '<p class="text-muted">Unknown calculator.</p>'; return; }
    const dist = StatsProbability[info.key];
    const isDiscrete = dist.discrete;
    const paramRow = dist.params.map(p =>
      `<div class="form-group"><label>${p.label}</label>
        <input type="number" id="dp-${p.id}" value="${p.default}" ${p.min != null ? `min="${p.min}"` : ''} ${p.max != null ? `max="${p.max}"` : ''} step="${p.step || 'any'}"></div>`
    ).join('');

    c.innerHTML = `
      <p class="text-muted" style="font-size:0.85rem">${info.title} — ${isDiscrete ? 'discrete' : 'continuous'} distribution.</p>
      <div class="param-row">
        ${paramRow}
      </div>
      <div class="param-row" style="margin-top:8px">
        <div class="form-group"><label>${isDiscrete ? 'k (integer)' : 'x'}</label>
          <input type="number" id="dpX" value="${isDiscrete ? 2 : 1}" step="${isDiscrete ? 1 : 'any'}"></div>
        ${dist.quantile ? `<div class="form-group"><label>Quantile q (0–1, optional)</label>
          <input type="number" id="dpQ" value="" min="0" max="1" step="0.01" placeholder="e.g., 0.95"></div>` : ''}
        <button class="btn btn-primary" id="${toolId}Compute">Compute</button>
      </div>
    `;
    $(`#${toolId}Compute`).addEventListener('click', () => this.runDistribution(toolId));
  },

  runBasic() {
    const r = StatsProbability.basicProb({
      pA: parseFloat($('#bpA').value),
      pB: parseFloat($('#bpB').value),
      pAB: parseFloat($('#bpAB').value)
    });
    this.show({
      title: 'Basic Probability',
      metrics: Object.entries(r).map(([k, v]) => ({ label: k, value: typeof v === 'number' ? Utils.fmt(v) : v })),
      interpretation: 'Computes the standard combinations of two events A and B from P(A), P(B), P(A∩B).',
      steps: [
        `P(¬A) = 1 − P(A) = ${Utils.fmt(1 - parseFloat($('#bpA').value))}`,
        `P(A∪B) = P(A) + P(B) − P(A∩B)`,
        `P(A|B) = P(A∩B) / P(B)`,
        `Independent iff P(A∩B) = P(A)·P(B)`
      ]
    });
  },

  runDistribution(toolId) {
    const info = this.DISTS[toolId];
    const dist = StatsProbability[info.key];
    const params = {};
    dist.params.forEach(p => params[p.id] = parseFloat($('#dp-' + p.id).value));
    const x = parseFloat($('#dpX').value);
    const qInput = $('#dpQ');
    const q = qInput && qInput.value !== '' ? parseFloat(qInput.value) : null;

    const pdfLabel = dist.discrete ? 'PMF P(X=k)' : 'PDF f(x)';
    const metrics = [
      { label: pdfLabel, value: Utils.fmt(dist.pdf(x, params)) },
      { label: 'CDF P(X≤x)', value: Utils.fmt(dist.cdf(x, params)) },
      { label: 'P(X>x)', value: Utils.fmt(1 - dist.cdf(x, params)) },
      { label: 'Mean', value: Utils.fmt(dist.mean(params)) },
      { label: 'Variance', value: Utils.fmt(dist.variance(params)) },
      { label: 'SD', value: Utils.fmt(Math.sqrt(dist.variance(params))) }
    ];
    if (q != null && dist.quantile) {
      metrics.push({ label: `Quantile (q=${q})`, value: Utils.fmt(dist.quantile(q, params)) });
    }

    this.show({
      title: info.title,
      metrics,
      interpretation: `Parameters: ${Object.entries(params).map(([k, v]) => `${k}=${Utils.fmt(v)}`).join(', ')}. ${dist.discrete ? `k = ${x}` : `x = ${Utils.fmt(x)}`}.`,
      steps: [
        `Distribution: ${info.title}`,
        `${pdfLabel} at ${dist.discrete ? `k=${x}` : `x=${Utils.fmt(x)}`}: ${Utils.fmt(dist.pdf(x, params))}`,
        `CDF P(X≤${dist.discrete ? x : Utils.fmt(x)}) = ${Utils.fmt(dist.cdf(x, params))}`,
        `Mean = ${Utils.fmt(dist.mean(params))}, Variance = ${Utils.fmt(dist.variance(params))}`
      ]
    });
  },

  show(opts) {
    $('#probResultsArea').style.display = '';
    $('#probTitle').textContent = opts.title || 'Results';
    $('#probGrid').innerHTML = (opts.metrics || []).map(m =>
      `<div class="result-card"><div class="result-value">${m.value}</div><div class="result-label">${m.label}</div></div>`
    ).join('');
    $('#probInterp').innerHTML = (opts.interpretation || '') +
      (typeof renderExplanation === 'function' ? renderExplanation(this.currentSubTab) : '');
    $('#probSteps').innerHTML = (opts.steps || []).map(s =>
      `<div class="step-line">${Utils.escHtml(s)}</div>`).join('');
  }
};
