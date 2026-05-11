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

      <div class="module-grid" id="probResultsArea" style="display:none">
        <div class="card" id="probChartCard">
          <div class="card-header"><h3>Distribution Curve</h3></div>
          <div class="card-body">
            <div class="chart-container"><canvas id="probChart"></canvas></div>
          </div>
        </div>
        <div class="card full-width">
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
      ],
      noChart: true
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
      ],
      chart: { dist, params, x, title: info.title }
    });
  },

  drawCurve(canvas, { dist, params, x, title }) {
    const w = canvas.parentElement.clientWidth - 32;
    const h = 280;
    const ctx = ChartRenderer.setupCanvas(canvas, w, h);
    const pad = { ...ChartRenderer.PAD };
    ChartRenderer.clear(ctx, w, h);

    const mean = dist.mean(params);
    const sd = Math.sqrt(dist.variance(params));

    // Choose plot range
    let xMin, xMax;
    if (dist.discrete) {
      // Show 0..mean+4*sd ish, but at least up to x
      xMin = Math.max(0, Math.floor(Math.min(mean - 4 * sd, x - 2)));
      xMax = Math.max(Math.ceil(mean + 4 * sd), x + 2, 10);
      if (params.n) xMax = Math.min(xMax, params.n);
      if (params.N) xMax = Math.min(xMax, params.N);
    } else if (params.a != null && params.b != null) {
      const pad = (params.b - params.a) * 0.1;
      xMin = params.a - pad; xMax = params.b + pad;
    } else {
      xMin = Math.min(mean - 4 * sd, x - sd);
      xMax = Math.max(mean + 4 * sd, x + sd);
      // For strictly positive distributions, clamp
      if (['exponential','gamma','weibull','logNormal','chiSquare','fDist'].some(k => StatsProbability[k] === dist)) xMin = Math.max(0, xMin);
      if (StatsProbability.beta === dist) { xMin = 0; xMax = 1; }
      if (!isFinite(xMin) || !isFinite(xMax) || xMin === xMax) { xMin = -3; xMax = 3; }
    }

    // Build series
    let xs = [], ys = [];
    if (dist.discrete) {
      for (let k = Math.max(0, Math.floor(xMin)); k <= Math.ceil(xMax); k++) {
        xs.push(k); ys.push(dist.pdf(k, params));
      }
    } else {
      const steps = 200;
      for (let i = 0; i <= steps; i++) {
        const xv = xMin + (xMax - xMin) * i / steps;
        xs.push(xv); ys.push(dist.pdf(xv, params));
      }
    }
    const yMax = Math.max(...ys) * 1.1 || 1;

    const xTicks = ChartRenderer.niceRange(xMin, xMax);
    const yTicks = ChartRenderer.niceRange(0, yMax);
    ChartRenderer.drawGrid(ctx, w, h, pad, xTicks, yTicks);
    ChartRenderer.drawAxes(ctx, w, h, pad, { xLabel: 'x', yLabel: dist.discrete ? 'P(X=k)' : 'f(x)' });

    const c = ChartRenderer.getColors();
    if (dist.discrete) {
      // Bar/lollipop
      ctx.strokeStyle = c.colors[0]; ctx.fillStyle = c.colors[0]; ctx.lineWidth = 2;
      xs.forEach((xv, i) => {
        const px = ChartRenderer.mapX(xv, xTicks[0], xTicks[xTicks.length - 1], w, pad);
        const py0 = ChartRenderer.mapY(0, yTicks[0], yTicks[yTicks.length - 1], h, pad);
        const py = ChartRenderer.mapY(ys[i], yTicks[0], yTicks[yTicks.length - 1], h, pad);
        ctx.beginPath(); ctx.moveTo(px, py0); ctx.lineTo(px, py); ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
      });
    } else {
      // PDF line
      ctx.strokeStyle = c.colors[0]; ctx.lineWidth = 2; ctx.beginPath();
      xs.forEach((xv, i) => {
        const px = ChartRenderer.mapX(xv, xTicks[0], xTicks[xTicks.length - 1], w, pad);
        const py = ChartRenderer.mapY(ys[i], yTicks[0], yTicks[yTicks.length - 1], h, pad);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Shade the area to the left of x (CDF region)
      ctx.fillStyle = c.colors[0] + '33';
      ctx.beginPath();
      const py0 = ChartRenderer.mapY(0, yTicks[0], yTicks[yTicks.length - 1], h, pad);
      let first = true;
      xs.forEach((xv, i) => {
        if (xv > x) return;
        const px = ChartRenderer.mapX(xv, xTicks[0], xTicks[xTicks.length - 1], w, pad);
        const py = ChartRenderer.mapY(ys[i], yTicks[0], yTicks[yTicks.length - 1], h, pad);
        if (first) { ctx.moveTo(px, py0); ctx.lineTo(px, py); first = false; }
        else ctx.lineTo(px, py);
      });
      const lastX = ChartRenderer.mapX(Math.min(x, xs[xs.length - 1]), xTicks[0], xTicks[xTicks.length - 1], w, pad);
      ctx.lineTo(lastX, py0);
      ctx.closePath();
      ctx.fill();
    }

    // Vertical line at x
    const px = ChartRenderer.mapX(x, xTicks[0], xTicks[xTicks.length - 1], w, pad);
    ctx.strokeStyle = c.colors[1] || '#ff9f43'; ctx.setLineDash([4, 3]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px, pad.top); ctx.lineTo(px, h - pad.bottom); ctx.stroke();
    ctx.setLineDash([]);

    // Title
    ctx.fillStyle = c.text;
    ctx.font = 'bold 12px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, 16);
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

    const chartCard = $('#probChartCard');
    if (opts.noChart || !opts.chart) {
      chartCard.style.display = 'none';
    } else {
      chartCard.style.display = '';
      requestAnimationFrame(() => this.drawCurve($('#probChart'), opts.chart));
    }
  }
};
