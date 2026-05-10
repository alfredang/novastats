/* ===== HYPOTHESIS TESTING MODULE CONTROLLER ===== */

window.ModuleHypothesis = {

  currentSubTab: 't-one',

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

  alphaSelect(id) {
    return `<select id="${id}">
      <option value="0.01">0.01</option>
      <option value="0.05" selected>0.05</option>
      <option value="0.10">0.10</option>
    </select>`;
  },

  tailsSelect(id) {
    return `<select id="${id}">
      <option value="2" selected>Two-tailed</option>
      <option value="1">Right-tailed</option>
    </select>`;
  },

  render(container) {
    const hasData = AppState.hasData();
    container.innerHTML = `
      <div class="module-header">
        <h2>Hypothesis Testing</h2>
        <p>Parametric, non-parametric, post-hoc, and effect-size tests for inference.</p>
      </div>
      ${!hasData ? Utils.noDataWarning('hypothesis', 'exam-scores', 'Exam Scores') : ''}

      ${!hasData ? Utils.onboardingGuide({
        steps: [
          { title: 'Load your sample data', desc: 'Numeric columns. Most tests need 1-2 columns; ANOVA-style tests can use 3+.' },
          { title: 'Pick a test category', desc: '<strong>Parametric</strong> (z, t), <strong>Proportion</strong>, <strong>Non-parametric</strong> (Mann-Whitney, Wilcoxon, Kruskal-Wallis, Friedman), <strong>Post-hoc</strong> (Tukey, Dunn), <strong>Tools</strong> (effect size, power, normality, outliers, p-value, SE, Fisher).' },
          { title: 'Configure & test', desc: 'Set α and tails, then click Test to see statistic, p-value, decision, and steps.' }
        ],
        exampleKey: 'exam-scores',
        exampleLabel: 'Exam Scores (30 values)'
      }) : ''}

      <div class="card hyp-layout" style="margin-bottom:20px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
        <aside class="hyp-sidebar" style="flex:0 0 220px;min-width:200px;border-right:1px solid var(--border);padding-right:12px">
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="one-var">▾ One Variable Tests</button>
            <div class="hyp-cat-list" data-cat-list="one-var">
              <button class="hyp-test-btn active" data-tab="t-one">One Sample t-test</button>
              <button class="hyp-test-btn" data-tab="z-one">One Sample Z-Test</button>
              <button class="hyp-test-btn" data-tab="prop-one">One Proportion Z-Test</button>
              <button class="hyp-test-btn" data-tab="normality">Normality Test</button>
              <button class="hyp-test-btn" data-tab="se">Standard Error</button>
              <button class="hyp-test-btn" data-tab="outliers">Outlier Detection</button>
            </div>
          </div>
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="two-var">▾ Two Variable Tests</button>
            <div class="hyp-cat-list" data-cat-list="two-var">
              <button class="hyp-test-btn" data-tab="t-two">Two Sample t-test</button>
              <button class="hyp-test-btn" data-tab="t-paired">Paired Samples t-test</button>
              <button class="hyp-test-btn" data-tab="z-two">Two Sample Z-Test</button>
              <button class="hyp-test-btn" data-tab="prop-two">Two Proportion Z-Test</button>
              <button class="hyp-test-btn" data-tab="mwu">Mann-Whitney U Test</button>
              <button class="hyp-test-btn" data-tab="wilcoxon">Wilcoxon Signed-Rank</button>
              <button class="hyp-test-btn" data-tab="fisher">Fisher's Exact Test</button>
            </div>
          </div>
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="multi-grp">▾ Multiple Groups</button>
            <div class="hyp-cat-list" data-cat-list="multi-grp">
              <button class="hyp-test-btn" data-tab="kw">Kruskal-Wallis Test</button>
              <button class="hyp-test-btn" data-tab="friedman">Friedman Test</button>
              <button type="button" class="hyp-test-btn hyp-link-btn" data-goto="anova:one-way">One-way ANOVA →</button>
              <button type="button" class="hyp-test-btn hyp-link-btn" data-goto="anova:welch">Welch's ANOVA →</button>
              <button type="button" class="hyp-test-btn hyp-link-btn" data-goto="anova:two-way">Two-way ANOVA →</button>
              <button type="button" class="hyp-test-btn hyp-link-btn" data-goto="anova:rm">Repeated Measures ANOVA →</button>
            </div>
          </div>
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="categorical">▾ Categorical Tests</button>
            <div class="hyp-cat-list" data-cat-list="categorical">
              <button type="button" class="hyp-test-btn hyp-link-btn" data-goto="chi-square:chi-indep">Chi-Square Test of Independence →</button>
              <button type="button" class="hyp-test-btn hyp-link-btn" data-goto="chi-square:chi-gof">Chi-Square Goodness-of-Fit →</button>
            </div>
          </div>
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="posthoc">▾ Post-Hoc Tests</button>
            <div class="hyp-cat-list" data-cat-list="posthoc">
              <button class="hyp-test-btn" data-tab="tukey">Tukey's HSD Test</button>
              <button class="hyp-test-btn" data-tab="dunn">Dunn's Test</button>
            </div>
          </div>
          <div class="hyp-cat">
            <button type="button" class="hyp-cat-toggle" data-cat="other">▾ Other</button>
            <div class="hyp-cat-list" data-cat-list="other">
              <button class="hyp-test-btn" data-tab="power">Sample Size & Power</button>
              <button class="hyp-test-btn" data-tab="effect">Effect Size</button>
              <button class="hyp-test-btn" data-tab="pvalue">P-Value Calculator</button>
            </div>
          </div>
        </aside>
        <div class="hyp-content" style="flex:1;min-width:300px">
        <div class="sub-tabs" id="hypTabs" style="display:none">
          <button class="sub-tab active" data-tab="z-one"></button>
        </div>

        <!-- Z-Test One Sample -->
        <div class="sub-panel" id="panel-z-one">
          <div class="var-selector">
            <div class="form-group"><label>Variable</label><select id="zOneVar">${this.varOptions()}</select></div>
          </div>
          <div class="param-row">
            <div class="form-group"><label>μ₀ (Hyp. Mean)</label><input type="number" id="zOneMu" value="0" step="any"></div>
            <div class="form-group"><label>σ (Known SD)</label><input type="number" id="zOneSigma" value="1" step="any" min="0.001"></div>
            <div class="form-group"><label>α</label>${this.alphaSelect('zOneAlpha')}</div>
            <div class="form-group"><label>Tails</label>${this.tailsSelect('zOneTails')}</div>
            <button class="btn btn-primary" id="zOneCompute">Test</button>
          </div>
        </div>

        <!-- Z-Test Two Sample -->
        <div class="sub-panel" id="panel-z-two">
          <div class="var-selector">
            <div class="form-group"><label>Sample 1</label><select id="zTwoVar1">${this.varOptions()}</select></div>
            <div class="form-group"><label>Sample 2</label><select id="zTwoVar2">${this.varOptionsAt(1)}</select></div>
          </div>
          <div class="param-row">
            <div class="form-group"><label>σ₁</label><input type="number" id="zTwoSigma1" value="1" step="any" min="0.001"></div>
            <div class="form-group"><label>σ₂</label><input type="number" id="zTwoSigma2" value="1" step="any" min="0.001"></div>
            <div class="form-group"><label>α</label>${this.alphaSelect('zTwoAlpha')}</div>
            <div class="form-group"><label>Tails</label>${this.tailsSelect('zTwoTails')}</div>
            <button class="btn btn-primary" id="zTwoCompute">Test</button>
          </div>
        </div>

        <!-- T-Test One Sample -->
        <div class="sub-panel active" id="panel-t-one">
          <div class="var-selector">
            <div class="form-group"><label>Variable</label><select id="tOneVar">${this.varOptions()}</select></div>
          </div>
          <div class="param-row">
            <div class="form-group"><label>μ₀</label><input type="number" id="tOneMu" value="0" step="any"></div>
            <div class="form-group"><label>α</label>${this.alphaSelect('tOneAlpha')}</div>
            <div class="form-group"><label>Tails</label>${this.tailsSelect('tOneTails')}</div>
            <button class="btn btn-primary" id="tOneCompute">Test</button>
          </div>
        </div>

        <!-- T-Test Two Sample -->
        <div class="sub-panel" id="panel-t-two">
          <div class="var-selector">
            <div class="form-group"><label>Sample 1</label><select id="tTwoVar1">${this.varOptions()}</select></div>
            <div class="form-group"><label>Sample 2</label><select id="tTwoVar2">${this.varOptionsAt(1)}</select></div>
          </div>
          <div class="param-row">
            <div class="form-group"><label>α</label>${this.alphaSelect('tTwoAlpha')}</div>
            <div class="form-group"><label>Tails</label>${this.tailsSelect('tTwoTails')}</div>
            <div class="form-group"><label>Variance</label>
              <select id="tTwoEqualVar">
                <option value="0" selected>Unequal (Welch)</option>
                <option value="1">Equal (Pooled)</option>
              </select>
            </div>
            <button class="btn btn-primary" id="tTwoCompute">Test</button>
          </div>
        </div>

        <!-- T-Test Paired -->
        <div class="sub-panel" id="panel-t-paired">
          <div class="var-selector">
            <div class="form-group"><label>Before / Group 1</label><select id="tPairedVar1">${this.varOptions()}</select></div>
            <div class="form-group"><label>After / Group 2</label><select id="tPairedVar2">${this.varOptionsAt(1)}</select></div>
          </div>
          <div class="param-row">
            <div class="form-group"><label>α</label>${this.alphaSelect('tPairedAlpha')}</div>
            <div class="form-group"><label>Tails</label>${this.tailsSelect('tPairedTails')}</div>
            <button class="btn btn-primary" id="tPairedCompute">Test</button>
          </div>
        </div>

        <!-- One-Proportion Z -->
        <div class="sub-panel" id="panel-prop-one">
          <div class="param-row">
            <div class="form-group"><label>Successes (x)</label><input type="number" id="propOneX" value="50" min="0" step="1"></div>
            <div class="form-group"><label>Sample size (n)</label><input type="number" id="propOneN" value="100" min="1" step="1"></div>
            <div class="form-group"><label>Hyp. proportion (p₀)</label><input type="number" id="propOneP0" value="0.5" min="0" max="1" step="0.01"></div>
            <div class="form-group"><label>α</label>${this.alphaSelect('propOneAlpha')}</div>
            <div class="form-group"><label>Tails</label>${this.tailsSelect('propOneTails')}</div>
            <button class="btn btn-primary" id="propOneCompute">Test</button>
          </div>
        </div>

        <!-- Two-Proportion Z -->
        <div class="sub-panel" id="panel-prop-two">
          <div class="param-row">
            <div class="form-group"><label>x₁</label><input type="number" id="propTwoX1" value="40" min="0" step="1"></div>
            <div class="form-group"><label>n₁</label><input type="number" id="propTwoN1" value="100" min="1" step="1"></div>
            <div class="form-group"><label>x₂</label><input type="number" id="propTwoX2" value="55" min="0" step="1"></div>
            <div class="form-group"><label>n₂</label><input type="number" id="propTwoN2" value="100" min="1" step="1"></div>
            <div class="form-group"><label>α</label>${this.alphaSelect('propTwoAlpha')}</div>
            <div class="form-group"><label>Tails</label>${this.tailsSelect('propTwoTails')}</div>
            <button class="btn btn-primary" id="propTwoCompute">Test</button>
          </div>
        </div>

        <!-- Mann-Whitney U -->
        <div class="sub-panel" id="panel-mwu">
          <div class="var-selector">
            <div class="form-group"><label>Sample 1</label><select id="mwuVar1">${this.varOptions()}</select></div>
            <div class="form-group"><label>Sample 2</label><select id="mwuVar2">${this.varOptionsAt(1)}</select></div>
          </div>
          <div class="param-row">
            <div class="form-group"><label>α</label>${this.alphaSelect('mwuAlpha')}</div>
            <div class="form-group"><label>Tails</label>${this.tailsSelect('mwuTails')}</div>
            <button class="btn btn-primary" id="mwuCompute">Test</button>
          </div>
        </div>

        <!-- Wilcoxon Signed-Rank -->
        <div class="sub-panel" id="panel-wilcoxon">
          <div class="var-selector">
            <div class="form-group"><label>Group 1 (paired)</label><select id="wilVar1">${this.varOptions()}</select></div>
            <div class="form-group"><label>Group 2 (paired)</label><select id="wilVar2">${this.varOptionsAt(1)}</select></div>
          </div>
          <div class="param-row">
            <div class="form-group"><label>α</label>${this.alphaSelect('wilAlpha')}</div>
            <div class="form-group"><label>Tails</label>${this.tailsSelect('wilTails')}</div>
            <button class="btn btn-primary" id="wilCompute">Test</button>
          </div>
        </div>

        <!-- Kruskal-Wallis -->
        <div class="sub-panel" id="panel-kw">
          <div class="form-group"><label>Groups (select 3+ columns)</label>
            <div id="kwVars">${this.multiVarOptions()}</div>
          </div>
          <div class="param-row">
            <div class="form-group"><label>α</label>${this.alphaSelect('kwAlpha')}</div>
            <button class="btn btn-primary" id="kwCompute">Test</button>
          </div>
        </div>

        <!-- Friedman -->
        <div class="sub-panel" id="panel-friedman">
          <div class="form-group"><label>Treatments (select 3+ paired columns; rows = blocks)</label>
            <div id="friedmanVars">${this.multiVarOptions()}</div>
          </div>
          <div class="param-row">
            <div class="form-group"><label>α</label>${this.alphaSelect('friedmanAlpha')}</div>
            <button class="btn btn-primary" id="friedmanCompute">Test</button>
          </div>
        </div>

        <!-- Tukey HSD -->
        <div class="sub-panel" id="panel-tukey">
          <div class="form-group"><label>Groups (select 3+ columns)</label>
            <div id="tukeyVars">${this.multiVarOptions()}</div>
          </div>
          <div class="param-row">
            <div class="form-group"><label>α</label>${this.alphaSelect('tukeyAlpha')}</div>
            <button class="btn btn-primary" id="tukeyCompute">Test</button>
          </div>
        </div>

        <!-- Dunn's Test -->
        <div class="sub-panel" id="panel-dunn">
          <div class="form-group"><label>Groups (select 3+ columns)</label>
            <div id="dunnVars">${this.multiVarOptions()}</div>
          </div>
          <div class="param-row">
            <div class="form-group"><label>α</label>${this.alphaSelect('dunnAlpha')}</div>
            <button class="btn btn-primary" id="dunnCompute">Test</button>
          </div>
        </div>

        <!-- Normality -->
        <div class="sub-panel" id="panel-normality">
          <div class="var-selector">
            <div class="form-group"><label>Variable</label><select id="normVar">${this.varOptions()}</select></div>
          </div>
          <div class="param-row">
            <div class="form-group"><label>α</label>${this.alphaSelect('normAlpha')}</div>
            <button class="btn btn-primary" id="normCompute">Test</button>
          </div>
        </div>

        <!-- Effect Size -->
        <div class="sub-panel" id="panel-effect">
          <div class="var-selector">
            <div class="form-group"><label>Sample 1</label><select id="effVar1">${this.varOptions()}</select></div>
            <div class="form-group"><label>Sample 2</label><select id="effVar2">${this.varOptionsAt(1)}</select></div>
          </div>
          <div class="param-row">
            <button class="btn btn-primary" id="effCompute">Compute</button>
          </div>
        </div>

        <!-- Power Analysis -->
        <div class="sub-panel" id="panel-power">
          <div class="param-row">
            <div class="form-group"><label>Effect size (Cohen's d)</label><input type="number" id="powerEffect" value="0.5" step="0.01"></div>
            <div class="form-group"><label>n (per group)</label><input type="number" id="powerN" value="30" min="2" step="1"></div>
            <div class="form-group"><label>α</label>${this.alphaSelect('powerAlpha')}</div>
            <div class="form-group"><label>Tails</label>${this.tailsSelect('powerTails')}</div>
            <div class="form-group"><label>Design</label>
              <select id="powerDesign">
                <option value="1">One-sample</option>
                <option value="2" selected>Two-sample</option>
              </select>
            </div>
            <button class="btn btn-primary" id="powerCompute">Compute</button>
          </div>
        </div>

        <!-- P-Value Calculator -->
        <div class="sub-panel" id="panel-pvalue">
          <div class="param-row">
            <div class="form-group"><label>Distribution</label>
              <select id="pvDist">
                <option value="z">Z (Normal)</option>
                <option value="t">t</option>
                <option value="chi2">χ²</option>
                <option value="f">F</option>
              </select>
            </div>
            <div class="form-group"><label>Statistic</label><input type="number" id="pvStat" value="1.96" step="any"></div>
            <div class="form-group"><label>df / df₁</label><input type="number" id="pvDf" value="10" step="1" min="1"></div>
            <div class="form-group"><label>df₂ (F only)</label><input type="number" id="pvDf2" value="20" step="1" min="1"></div>
            <div class="form-group"><label>Tails (Z/t)</label>${this.tailsSelect('pvTails')}</div>
            <div class="form-group"><label>α</label>${this.alphaSelect('pvAlpha')}</div>
            <button class="btn btn-primary" id="pvCompute">Compute</button>
          </div>
        </div>

        <!-- Standard Error -->
        <div class="sub-panel" id="panel-se">
          <div class="var-selector">
            <div class="form-group"><label>Variable</label><select id="seVar">${this.varOptions()}</select></div>
          </div>
          <div class="param-row">
            <button class="btn btn-primary" id="seCompute">Compute</button>
          </div>
        </div>

        <!-- Outliers -->
        <div class="sub-panel" id="panel-outliers">
          <div class="var-selector">
            <div class="form-group"><label>Variable</label><select id="outVar">${this.varOptions()}</select></div>
          </div>
          <div class="param-row">
            <div class="form-group"><label>Method</label>
              <select id="outMethod">
                <option value="iqr" selected>Tukey IQR (1.5×)</option>
                <option value="z">Z-score (|z| &gt; 3)</option>
              </select>
            </div>
            <button class="btn btn-primary" id="outCompute">Detect</button>
          </div>
        </div>

        <!-- Fisher's Exact -->
        <div class="sub-panel" id="panel-fisher">
          <p class="text-muted" style="font-size:0.85rem;margin-bottom:8px">2×2 contingency table cells:</p>
          <div class="param-row">
            <div class="form-group"><label>a (Row1, Col1)</label><input type="number" id="fishA" value="10" min="0" step="1"></div>
            <div class="form-group"><label>b (Row1, Col2)</label><input type="number" id="fishB" value="2" min="0" step="1"></div>
            <div class="form-group"><label>c (Row2, Col1)</label><input type="number" id="fishC" value="3" min="0" step="1"></div>
            <div class="form-group"><label>d (Row2, Col2)</label><input type="number" id="fishD" value="15" min="0" step="1"></div>
            <div class="form-group"><label>α</label>${this.alphaSelect('fishAlpha')}</div>
            <div class="form-group"><label>Tails</label>${this.tailsSelect('fishTails')}</div>
            <button class="btn btn-primary" id="fishCompute">Test</button>
          </div>
        </div>
        </div>
      </div>

      <!-- Results Area -->
      <div id="hypResults" style="display:none">
        <div class="module-grid">
          <div class="card">
            <div class="card-header"><h3 id="hypTestType">Test Results</h3></div>
            <div class="card-body">
              <div class="results-grid" id="hypResultsGrid"></div>
              <div class="decision-box" id="hypDecision"></div>
              <div class="interpretation" id="hypInterpretation"></div>
              <div id="hypPairsTable"></div>
              <details style="margin-top:12px">
                <summary>Step-by-step calculation</summary>
                <div class="details-content" id="hypSteps"></div>
              </details>
            </div>
          </div>
          <div class="card" id="hypChartCard">
            <div class="card-header"><h3>Distribution</h3></div>
            <div class="card-body">
              <div class="chart-container"><canvas id="hypChart"></canvas></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Sidebar test buttons (always available, even without data so users can browse)
    container.querySelectorAll('.hyp-test-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Cross-module link buttons. Format "module" or "module:subtab"
        if (btn.dataset.goto) {
          const [target, sub] = btn.dataset.goto.split(':');
          UI.switchModule(target);
          if (sub) setTimeout(() => {
            const subBtn = document.querySelector(`#panel-${target} .hyp-test-btn[data-tab="${sub}"]`);
            if (subBtn) subBtn.click();
          }, 80);
          return;
        }
        container.querySelectorAll('.hyp-test-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        container.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
        const panel = container.querySelector(`#panel-${btn.dataset.tab}`);
        if (panel) panel.classList.add('active');
        this.currentSubTab = btn.dataset.tab;
      });
    });

    // Collapsible category toggles — collapse all except the one containing the active test
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
      bind('zOneCompute', this.runZOne);
      bind('zTwoCompute', this.runZTwo);
      bind('tOneCompute', this.runTOne);
      bind('tTwoCompute', this.runTTwo);
      bind('tPairedCompute', this.runTPaired);
      bind('propOneCompute', this.runPropOne);
      bind('propTwoCompute', this.runPropTwo);
      bind('mwuCompute', this.runMWU);
      bind('wilCompute', this.runWilcoxon);
      bind('kwCompute', this.runKW);
      bind('friedmanCompute', this.runFriedman);
      bind('tukeyCompute', this.runTukey);
      bind('dunnCompute', this.runDunn);
      bind('normCompute', this.runNormality);
      bind('effCompute', this.runEffect);
      bind('powerCompute', this.runPower);
      bind('pvCompute', this.runPValue);
      bind('seCompute', this.runSE);
      bind('outCompute', this.runOutliers);
      bind('fishCompute', this.runFisher);
    }

    Utils.bindGuideButtons(container, () => {
      UI.switchModule('hypothesis');
      setTimeout(() => {
        const tab = document.querySelector('[data-tab="t-one"]');
        if (tab) tab.click();
        setTimeout(() => {
          const mu = $('#tOneMu');
          if (mu) mu.value = '85';
          const btn = $('#tOneCompute');
          if (btn) btn.click();
        }, 100);
      }, 100);
    });
    if (typeof injectExampleButtons === 'function') injectExampleButtons(container);
  },

  getCheckedColumns(containerId) {
    const cbs = document.querySelectorAll(`#${containerId} .multi-var-cb:checked`);
    const indices = Array.from(cbs).map(cb => parseInt(cb.value));
    const groups = indices.map(i => AppState.getColumn(i));
    const labels = indices.map(i => AppState.data.headers[i]);
    return { groups, labels };
  },

  displayResult(result) {
    if (result.error) { Utils.toast(result.error, 'warning'); return; }
    $('#hypResults').style.display = '';
    $('#hypTestType').textContent = result.testType;
    $('#hypPairsTable').innerHTML = '';

    const stat = result.z !== undefined ? result.z
              : result.t !== undefined ? result.t
              : result.U !== undefined ? result.U
              : result.W !== undefined ? result.W
              : result.H !== undefined ? result.H
              : result.Q !== undefined ? result.Q
              : result.K2 !== undefined ? result.K2
              : result.cohensD !== undefined ? result.cohensD
              : result.power !== undefined ? result.power
              : result.sem !== undefined ? result.sem
              : result.oddsRatio !== undefined ? result.oddsRatio
              : result.stat;

    const statLabel = result.z !== undefined ? 'z'
                   : result.t !== undefined ? 't'
                   : result.U !== undefined ? 'U'
                   : result.W !== undefined ? 'W'
                   : result.H !== undefined ? 'H'
                   : result.Q !== undefined ? 'Q'
                   : result.K2 !== undefined ? 'K²'
                   : result.cohensD !== undefined ? "Cohen's d"
                   : result.power !== undefined ? 'Power'
                   : result.sem !== undefined ? 'SEM'
                   : result.oddsRatio !== undefined ? 'Odds Ratio'
                   : 'statistic';

    const metrics = [];
    if (stat !== undefined && stat !== null) metrics.push({ label: statLabel, value: Utils.fmt(stat) });
    if (result.pValue !== undefined) metrics.push({ label: 'p-value', value: Utils.pFmt(result.pValue) });
    if (result.df !== undefined) metrics.push({ label: 'df', value: result.df });
    if (result.alpha !== undefined) metrics.push({ label: 'α', value: result.alpha });
    if (result.n !== undefined) metrics.push({ label: 'n', value: result.n });
    if (result.hedgesG !== undefined) metrics.push({ label: "Hedges' g", value: Utils.fmt(result.hedgesG) });
    if (result.nForPower80 !== undefined) metrics.push({ label: 'n for 80%', value: result.nForPower80 });

    $('#hypResultsGrid').innerHTML = metrics.map(m =>
      `<div class="result-card">
        <div class="result-value">${m.value}</div>
        <div class="result-label">${m.label}</div>
      </div>`
    ).join('');

    const decBox = $('#hypDecision');
    decBox.textContent = result.decision;
    decBox.className = `decision-box ${result.reject ? 'reject' : 'fail-to-reject'}`;

    if (result.pValue !== undefined && result.alpha !== undefined) {
      $('#hypInterpretation').innerHTML = `
        Test statistic <strong>${Utils.fmt(stat)}</strong>, p = <strong>${Utils.pFmt(result.pValue)}</strong>.
        At α = ${result.alpha}, we <strong>${result.reject ? 'reject' : 'fail to reject'}</strong> H₀.
      `;
    } else {
      $('#hypInterpretation').innerHTML = '';
    }
    // Append explanation card for current test
    if (typeof renderExplanation === 'function') {
      $('#hypInterpretation').innerHTML += renderExplanation(this.currentSubTab);
    }

    // Pairwise table for post-hoc tests
    if (result.pairs && result.pairs.length) {
      const isDunn = result.pairs[0].rankDiff !== undefined;
      $('#hypPairsTable').innerHTML = `
        <h4 style="margin-top:16px">Pairwise Comparisons</h4>
        <table class="data-table" style="margin-top:8px;width:100%">
          <thead><tr>
            <th>Pair</th>
            <th>${isDunn ? 'Rank Diff' : 'Mean Diff'}</th>
            <th>${isDunn ? 'z' : 'q'}</th>
            <th>${isDunn ? 'p (adj)' : 'p'}</th>
            <th>Significant</th>
          </tr></thead>
          <tbody>
            ${result.pairs.map(p => `
              <tr>
                <td>${Utils.escHtml(p.a)} vs ${Utils.escHtml(p.b)}</td>
                <td>${Utils.fmt(isDunn ? p.rankDiff : p.meanDiff)}</td>
                <td>${Utils.fmt(isDunn ? p.z : p.q)}</td>
                <td>${Utils.pFmt(isDunn ? p.pAdj : p.pValue)}</td>
                <td>${p.significant ? '✓' : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    $('#hypSteps').innerHTML = (result.steps || []).map(s =>
      `<div class="step-line">${Utils.escHtml(s)}</div>`
    ).join('');

    // Chart
    const card = document.getElementById('hypChartCard');
    if (result.noChart) {
      card.style.display = 'none';
    } else {
      card.style.display = '';
      const canvas = document.getElementById('hypChart');
      const w = canvas.parentElement.clientWidth - 32;
      const tails = result.tails || 2;
      ChartRenderer.normalCurve(canvas, 0, 1, stat, result.alpha || 0.05, tails, {
        width: w, height: 250, title: result.testType
      });
    }

    AppState.setResult('hypothesis', result);
  },

  /* ===== Run handlers ===== */

  runZOne() {
    const data = AppState.getColumn(parseInt($('#zOneVar').value));
    if (!data.length) return Utils.toast('No data', 'warning');
    this.displayResult(StatsHypothesis.zTestOneSample(
      data,
      parseFloat($('#zOneMu').value),
      parseFloat($('#zOneSigma').value),
      parseFloat($('#zOneAlpha').value),
      parseInt($('#zOneTails').value)
    ));
  },

  runZTwo() {
    const d1 = AppState.getColumn(parseInt($('#zTwoVar1').value));
    const d2 = AppState.getColumn(parseInt($('#zTwoVar2').value));
    if (!d1.length || !d2.length) return Utils.toast('Need both samples', 'warning');
    this.displayResult(StatsHypothesis.zTestTwoSample(
      d1, d2,
      parseFloat($('#zTwoSigma1').value), parseFloat($('#zTwoSigma2').value),
      parseFloat($('#zTwoAlpha').value), parseInt($('#zTwoTails').value)
    ));
  },

  runTOne() {
    const data = AppState.getColumn(parseInt($('#tOneVar').value));
    if (!data.length) return Utils.toast('No data', 'warning');
    this.displayResult(StatsHypothesis.tTestOneSample(
      data, parseFloat($('#tOneMu').value),
      parseFloat($('#tOneAlpha').value), parseInt($('#tOneTails').value)
    ));
  },

  runTTwo() {
    const d1 = AppState.getColumn(parseInt($('#tTwoVar1').value));
    const d2 = AppState.getColumn(parseInt($('#tTwoVar2').value));
    if (!d1.length || !d2.length) return Utils.toast('Need both samples', 'warning');
    this.displayResult(StatsHypothesis.tTestTwoSample(
      d1, d2, parseFloat($('#tTwoAlpha').value),
      parseInt($('#tTwoTails').value), $('#tTwoEqualVar').value === '1'
    ));
  },

  runTPaired() {
    const d1 = AppState.getColumn(parseInt($('#tPairedVar1').value));
    const d2 = AppState.getColumn(parseInt($('#tPairedVar2').value));
    if (!d1.length || !d2.length) return Utils.toast('Need both samples', 'warning');
    this.displayResult(StatsHypothesis.tTestPaired(
      d1, d2, parseFloat($('#tPairedAlpha').value), parseInt($('#tPairedTails').value)
    ));
  },

  runPropOne() {
    const x = parseInt($('#propOneX').value);
    const n = parseInt($('#propOneN').value);
    if (n <= 0 || x < 0 || x > n) return Utils.toast('Invalid x or n', 'warning');
    this.displayResult(StatsHypothesis.oneProportionZ(
      x, n,
      parseFloat($('#propOneP0').value),
      parseFloat($('#propOneAlpha').value),
      parseInt($('#propOneTails').value)
    ));
  },

  runPropTwo() {
    this.displayResult(StatsHypothesis.twoProportionZ(
      parseInt($('#propTwoX1').value), parseInt($('#propTwoN1').value),
      parseInt($('#propTwoX2').value), parseInt($('#propTwoN2').value),
      parseFloat($('#propTwoAlpha').value), parseInt($('#propTwoTails').value)
    ));
  },

  runMWU() {
    const d1 = AppState.getColumn(parseInt($('#mwuVar1').value));
    const d2 = AppState.getColumn(parseInt($('#mwuVar2').value));
    if (!d1.length || !d2.length) return Utils.toast('Need both samples', 'warning');
    this.displayResult(StatsHypothesis.mannWhitneyU(
      d1, d2, parseFloat($('#mwuAlpha').value), parseInt($('#mwuTails').value)
    ));
  },

  runWilcoxon() {
    const d1 = AppState.getColumn(parseInt($('#wilVar1').value));
    const d2 = AppState.getColumn(parseInt($('#wilVar2').value));
    if (!d1.length || !d2.length) return Utils.toast('Need both samples', 'warning');
    this.displayResult(StatsHypothesis.wilcoxonSignedRank(
      d1, d2, parseFloat($('#wilAlpha').value), parseInt($('#wilTails').value)
    ));
  },

  runKW() {
    const { groups } = this.getCheckedColumns('kwVars');
    if (groups.length < 2) return Utils.toast('Select at least 2 groups', 'warning');
    this.displayResult(StatsHypothesis.kruskalWallis(groups, parseFloat($('#kwAlpha').value)));
  },

  runFriedman() {
    const { groups } = this.getCheckedColumns('friedmanVars');
    if (groups.length < 3) return Utils.toast('Friedman needs ≥3 paired columns', 'warning');
    const n = Math.min(...groups.map(g => g.length));
    if (n < 2) return Utils.toast('Need at least 2 blocks', 'warning');
    const matrix = [];
    for (let i = 0; i < n; i++) matrix.push(groups.map(g => g[i]));
    this.displayResult(StatsHypothesis.friedman(matrix, parseFloat($('#friedmanAlpha').value)));
  },

  runTukey() {
    const { groups, labels } = this.getCheckedColumns('tukeyVars');
    if (groups.length < 2) return Utils.toast('Select at least 2 groups', 'warning');
    this.displayResult(StatsHypothesis.tukeyHSD(groups, labels, parseFloat($('#tukeyAlpha').value)));
  },

  runDunn() {
    const { groups, labels } = this.getCheckedColumns('dunnVars');
    if (groups.length < 2) return Utils.toast('Select at least 2 groups', 'warning');
    this.displayResult(StatsHypothesis.dunnTest(groups, labels, parseFloat($('#dunnAlpha').value)));
  },

  runNormality() {
    const data = AppState.getColumn(parseInt($('#normVar').value));
    if (!data.length) return Utils.toast('No data', 'warning');
    this.displayResult(StatsHypothesis.normalityTest(data, parseFloat($('#normAlpha').value)));
  },

  runEffect() {
    const d1 = AppState.getColumn(parseInt($('#effVar1').value));
    const d2 = AppState.getColumn(parseInt($('#effVar2').value));
    if (!d1.length || !d2.length) return Utils.toast('Need both samples', 'warning');
    this.displayResult(StatsHypothesis.effectSize(d1, d2));
  },

  runPower() {
    this.displayResult(StatsHypothesis.powerAnalysis(
      parseFloat($('#powerEffect').value),
      parseInt($('#powerN').value),
      parseFloat($('#powerAlpha').value),
      parseInt($('#powerTails').value),
      $('#powerDesign').value === '2'
    ));
  },

  runPValue() {
    const dist = $('#pvDist').value;
    const stat = parseFloat($('#pvStat').value);
    const params = {
      df: parseInt($('#pvDf').value),
      df1: parseInt($('#pvDf').value),
      df2: parseInt($('#pvDf2').value),
      alpha: parseFloat($('#pvAlpha').value)
    };
    this.displayResult(StatsHypothesis.pValueCalc(stat, dist, params, parseInt($('#pvTails').value)));
  },

  runSE() {
    const data = AppState.getColumn(parseInt($('#seVar').value));
    if (!data.length) return Utils.toast('No data', 'warning');
    this.displayResult(StatsHypothesis.standardError(data));
  },

  runOutliers() {
    const data = AppState.getColumn(parseInt($('#outVar').value));
    if (!data.length) return Utils.toast('No data', 'warning');
    this.displayResult(StatsHypothesis.outlierDetection(data, $('#outMethod').value));
  },

  runFisher() {
    this.displayResult(StatsHypothesis.fishersExact(
      parseInt($('#fishA').value), parseInt($('#fishB').value),
      parseInt($('#fishC').value), parseInt($('#fishD').value),
      parseFloat($('#fishAlpha').value), parseInt($('#fishTails').value)
    ));
  }
};
