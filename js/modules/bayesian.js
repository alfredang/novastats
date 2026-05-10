/* ===== BAYESIAN INFERENCE & ESTIMATION MODULE ===== */

window.ModuleBayesian = {

  currentSubTab: 'bayes',

  varOptions() { return DataManager.getVariableOptions(); },

  render(container) {
    const hasData = AppState.hasData();
    container.innerHTML = `
      <div class="module-header">
        <h2>Bayesian Inference & Parameter Estimation</h2>
        <p>Bayes' theorem, conjugate posterior updates, and Maximum-Likelihood / Maximum-A-Posteriori estimation.</p>
      </div>

      <div class="card hyp-layout" style="margin-bottom:20px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
        <aside class="hyp-sidebar" style="flex:0 0 220px;min-width:200px;border-right:1px solid var(--border);padding-right:12px">
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="bayes-cat">▾ Bayesian Inference</button>
            <div class="hyp-cat-list" data-cat-list="bayes-cat">
              <button class="hyp-test-btn active" data-tab="bayes">Bayes' Theorem</button>
              <button class="hyp-test-btn" data-tab="beta-bin">Beta-Binomial Posterior</button>
            </div>
          </div>
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="estim-cat">▾ Parameter Estimation</button>
            <div class="hyp-cat-list" data-cat-list="estim-cat">
              <button class="hyp-test-btn" data-tab="mle">Maximum Likelihood (MLE)</button>
              <button class="hyp-test-btn" data-tab="map">Maximum A Posteriori (MAP)</button>
            </div>
          </div>
        </aside>

        <div class="hyp-content" style="flex:1;min-width:300px">
          <!-- Bayes' Theorem -->
          <div class="sub-panel active" id="panel-bayes">
            <p class="text-muted" style="font-size:0.85rem">Classic example: P(disease | positive test).</p>
            <div class="param-row">
              <div class="form-group"><label>P(H) — Prior</label>
                <input type="number" id="bayesPrior" value="0.01" min="0" max="1" step="0.001"></div>
              <div class="form-group"><label>P(E|H) — True positive (sensitivity)</label>
                <input type="number" id="bayesLik" value="0.95" min="0" max="1" step="0.01"></div>
              <div class="form-group"><label>P(E|¬H) — False positive (1−specificity)</label>
                <input type="number" id="bayesFp" value="0.05" min="0" max="1" step="0.01"></div>
              <button class="btn btn-primary" id="bayesCompute">Compute</button>
            </div>
          </div>

          <!-- Beta-Binomial -->
          <div class="sub-panel" id="panel-beta-bin">
            <p class="text-muted" style="font-size:0.85rem">Conjugate Bayesian update of a proportion p ~ Beta(α, β).</p>
            <div class="param-row">
              <div class="form-group"><label>Prior α</label>
                <input type="number" id="bbAlpha" value="1" min="0.001" step="0.1"></div>
              <div class="form-group"><label>Prior β</label>
                <input type="number" id="bbBeta" value="1" min="0.001" step="0.1"></div>
              <div class="form-group"><label>Successes (k)</label>
                <input type="number" id="bbK" value="7" min="0" step="1"></div>
              <div class="form-group"><label>Trials (n)</label>
                <input type="number" id="bbN" value="10" min="1" step="1"></div>
              <button class="btn btn-primary" id="bbCompute">Compute</button>
            </div>
          </div>

          <!-- MLE -->
          <div class="sub-panel" id="panel-mle">
            <div class="param-row">
              <div class="form-group"><label>Distribution</label>
                <select id="mleDist">
                  <option value="normal">Normal</option>
                  <option value="exponential">Exponential</option>
                  <option value="poisson">Poisson</option>
                  <option value="bernoulli">Bernoulli (0/1 data)</option>
                </select>
              </div>
              <div class="form-group"><label>Variable</label>
                <select id="mleVar">${hasData ? this.varOptions() : ''}</select>
              </div>
              <button class="btn btn-primary" id="mleCompute">Estimate</button>
            </div>
          </div>

          <!-- MAP -->
          <div class="sub-panel" id="panel-map">
            <div class="param-row">
              <div class="form-group"><label>Model</label>
                <select id="mapModel">
                  <option value="beta-binomial">Bernoulli + Beta prior (proportion)</option>
                  <option value="normal-known-var">Normal mean (known σ²) + Normal prior</option>
                </select>
              </div>
              <div class="form-group"><label>Variable</label>
                <select id="mapVar">${hasData ? this.varOptions() : ''}</select>
              </div>
            </div>
            <div class="param-row" id="mapBetaParams">
              <div class="form-group"><label>Prior α</label>
                <input type="number" id="mapAlpha" value="1" min="0.001" step="0.1"></div>
              <div class="form-group"><label>Prior β</label>
                <input type="number" id="mapBeta" value="1" min="0.001" step="0.1"></div>
            </div>
            <div class="param-row" id="mapNormalParams" style="display:none">
              <div class="form-group"><label>Known σ²</label>
                <input type="number" id="mapSigma2" value="1" min="0.001" step="0.1"></div>
              <div class="form-group"><label>Prior μ₀</label>
                <input type="number" id="mapMu0" value="0" step="any"></div>
              <div class="form-group"><label>Prior τ²</label>
                <input type="number" id="mapTau2" value="100" min="0.001" step="0.1"></div>
            </div>
            <button class="btn btn-primary" id="mapCompute">Estimate</button>
          </div>
        </div>
      </div>

      <div class="card" id="bayesResultsArea" style="display:none">
        <div class="card-header"><h3 id="bayesTitle">Results</h3></div>
        <div class="card-body">
          <div class="results-grid" id="bayesGrid"></div>
          <div class="interpretation" id="bayesInterp"></div>
          <details style="margin-top:12px">
            <summary>Step-by-step</summary>
            <div class="details-content" id="bayesSteps"></div>
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
    bind('bayesCompute', this.runBayes);
    bind('bbCompute', this.runBetaBin);
    bind('mleCompute', this.runMLE);
    bind('mapCompute', this.runMAP);

    const mapModel = $('#mapModel');
    if (mapModel) mapModel.addEventListener('change', () => {
      const isBeta = mapModel.value === 'beta-binomial';
      $('#mapBetaParams').style.display = isBeta ? '' : 'none';
      $('#mapNormalParams').style.display = isBeta ? 'none' : '';
    });

    if (typeof injectExampleButtons === 'function') injectExampleButtons(container);
  },

  show(opts) {
    $('#bayesResultsArea').style.display = '';
    $('#bayesTitle').textContent = opts.title || 'Results';
    $('#bayesGrid').innerHTML = (opts.metrics || []).map(m =>
      `<div class="result-card"><div class="result-value">${m.value}</div><div class="result-label">${m.label}</div></div>`
    ).join('');
    $('#bayesInterp').innerHTML = (opts.interpretation || '') +
      (typeof renderExplanation === 'function' ? renderExplanation(this.currentSubTab) : '');
    $('#bayesSteps').innerHTML = (opts.steps || []).map(s =>
      `<div class="step-line">${Utils.escHtml(s)}</div>`).join('');
  },

  runBayes() {
    const r = StatsBayesian.bayesTheorem(
      parseFloat($('#bayesPrior').value),
      parseFloat($('#bayesLik').value),
      parseFloat($('#bayesFp').value)
    );
    if (r.error) return Utils.toast(r.error, 'error');
    this.show({
      title: "Bayes' Theorem",
      metrics: [
        { label: 'P(H)', value: Utils.fmt(r.prior) },
        { label: 'P(E|H)', value: Utils.fmt(r.likelihood) },
        { label: 'P(E|¬H)', value: Utils.fmt(r.falsePositive) },
        { label: 'P(E)', value: Utils.fmt(r.pE) },
        { label: 'P(H|E) (posterior)', value: Utils.fmt(r.posterior) },
        { label: 'Bayes Factor', value: Utils.fmt(r.bayesFactor) }
      ],
      interpretation: `Posterior P(H|E) = <strong>${Utils.fmt(r.posterior)}</strong>. The classic medical-test intuition: even with a 95% sensitive test, a low base rate gives a low posterior probability of disease.`,
      steps: r.steps
    });
  },

  runBetaBin() {
    const r = StatsBayesian.betaBinomialPosterior(
      parseFloat($('#bbAlpha').value),
      parseFloat($('#bbBeta').value),
      parseInt($('#bbK').value),
      parseInt($('#bbN').value)
    );
    this.show({
      title: 'Beta-Binomial Posterior',
      metrics: [
        { label: 'Prior mean', value: Utils.fmt(r.priorMean) },
        { label: 'MLE p̂', value: Utils.fmt(r.mle) },
        { label: 'Posterior mean', value: Utils.fmt(r.postMean) },
        { label: 'Posterior SD', value: Utils.fmt(r.postSD) },
        { label: 'α posterior', value: Utils.fmt(r.aPost) },
        { label: 'β posterior', value: Utils.fmt(r.bPost) }
      ],
      interpretation: `Posterior mean = <strong>${Utils.fmt(r.postMean)}</strong>, balancing the prior (${Utils.fmt(r.priorMean)}) and the data (${r.k}/${r.n} = ${Utils.fmt(r.mle)}).`,
      steps: r.steps
    });
  },

  runMLE() {
    const dist = $('#mleDist').value;
    const data = AppState.getColumn(parseInt($('#mleVar').value));
    if (!data.length) return Utils.toast('No data', 'warning');
    const r = StatsBayesian.mle(dist, data);
    if (r.error) return Utils.toast(r.error, 'error');
    this.show({
      title: `Maximum Likelihood: ${r.distribution}`,
      metrics: Object.entries(r.params).map(([k, v]) => ({ label: k, value: Utils.fmt(v) })).concat([
        { label: 'log-likelihood', value: Utils.fmt(r.loglik) },
        { label: 'n', value: data.length }
      ]),
      interpretation: `MLE chooses parameters that maximize the likelihood of the observed data.`,
      steps: r.steps
    });
  },

  runMAP() {
    const model = $('#mapModel').value;
    const data = AppState.getColumn(parseInt($('#mapVar').value));
    if (!data.length) return Utils.toast('No data', 'warning');
    let prior;
    if (model === 'beta-binomial') {
      prior = { alpha: parseFloat($('#mapAlpha').value), beta: parseFloat($('#mapBeta').value) };
    } else {
      prior = { sigma2: parseFloat($('#mapSigma2').value), mu0: parseFloat($('#mapMu0').value), tau2: parseFloat($('#mapTau2').value) };
    }
    const r = StatsBayesian.map(model, data, prior);
    if (r.error) return Utils.toast(r.error, 'error');
    this.show({
      title: `MAP: ${r.model}`,
      metrics: Object.entries(r.params).map(([k, v]) => ({ label: k, value: Utils.fmt(v) })),
      interpretation: `MAP combines the prior and likelihood to estimate the most likely parameter value given the data.`,
      steps: r.steps
    });
  }
};
