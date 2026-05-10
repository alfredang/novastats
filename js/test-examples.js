/* ===== PER-TEST SAMPLE EXAMPLES =====
   Each entry describes how to set up an illustrative example for a test.
   Types:
     'columns'  — load a built-in dataset, then assign column indices to selectors
     'inline'   — load a custom inline dataset (replaces current data)
     'inputs'   — only set form inputs (no data load needed); for tests with direct inputs
     'mixed'    — both load dataset and set additional inputs
*/

window.TestExamples = {

  /* ===== DESCRIPTIVE ===== */
  'all':              { dataset: 'exam-scores',     selects: { 'dAllVar': 0 },                 click: 'dAllCompute' },
  'mean-median-mode': { dataset: 'exam-scores',     selects: { 'dMmmVar': 0 },                 click: 'dMmmCompute' },
  'geometric':        { dataset: 'exam-scores',     selects: { 'dGeoVar': 0 },                 click: 'dGeoCompute' },
  'harmonic':         { dataset: 'exam-scores',     selects: { 'dHarVar': 0 },                 click: 'dHarCompute' },
  'range-var-sd':     { dataset: 'exam-scores',     selects: { 'dRvsVar': 0 },                 click: 'dRvsCompute' },
  'cv':               { dataset: 'exam-scores',     selects: { 'dCvVar': 0 },                  click: 'dCvCompute' },
  'five-num':         { dataset: 'exam-scores',     selects: { 'd5Var': 0 },                   click: 'd5Compute' },
  'mad':              { dataset: 'exam-scores',     selects: { 'dMadVar': 0 },                 click: 'dMadCompute' },
  'median-ad':        { dataset: 'exam-scores',     selects: { 'dMadMVar': 0 },                click: 'dMadMCompute' },
  'percentile':       { dataset: 'exam-scores',     selects: { 'dPctVar': 0 }, inputs: { 'dPctP': 75 }, click: 'dPctCompute' },
  'zscore':           { dataset: 'exam-scores',     selects: { 'dZVar': 0 },                   click: 'dZCompute' },
  'skewness':         { dataset: 'exam-scores',     selects: { 'dSkVar': 0 },                  click: 'dSkCompute' },
  'kurtosis':         { dataset: 'exam-scores',     selects: { 'dKuVar': 0 },                  click: 'dKuCompute' },
  'covariance':       { dataset: 'height-weight',   selects: { 'dCovVar1': 0, 'dCovVar2': 1 }, click: 'dCovCompute' },
  'frequency':        { dataset: 'exam-scores',     selects: { 'dFreqVar': 0 },                click: 'dFreqCompute' },
  'contingency':      { dataset: 'treatment-groups',selects: { 'dContVar1': 0, 'dContVar2': 1 }, click: 'dContCompute' },
  'cronbach':         { dataset: 'likert-scale',    multiCheck: 'dCronVars',                   click: 'dCronCompute' },

  /* ===== HYPOTHESIS ===== */
  'z-one':   { dataset: 'exam-scores',    selects: { 'zOneVar': 0 },   inputs: { 'zOneMu': 80, 'zOneSigma': 8 },  click: 'zOneCompute' },
  'z-two':   { dataset: 'height-weight',  selects: { 'zTwoVar1': 0, 'zTwoVar2': 1 }, inputs: { 'zTwoSigma1': 10, 'zTwoSigma2': 10 }, click: 'zTwoCompute' },
  't-one':   { dataset: 'exam-scores',    selects: { 'tOneVar': 0 },   inputs: { 'tOneMu': 80 },                   click: 'tOneCompute' },
  't-two':   { dataset: 'treatment-groups', selects: { 'tTwoVar1': 0, 'tTwoVar2': 1 }, click: 'tTwoCompute' },
  't-paired':{ dataset: 'height-weight',  selects: { 'tPairedVar1': 0, 'tPairedVar2': 1 }, click: 'tPairedCompute' },
  'prop-one':{ inputs: { 'propOneX': 60, 'propOneN': 100, 'propOneP0': 0.5 }, click: 'propOneCompute' },
  'prop-two':{ inputs: { 'propTwoX1': 40, 'propTwoN1': 100, 'propTwoX2': 55, 'propTwoN2': 100 }, click: 'propTwoCompute' },
  'mwu':     { dataset: 'treatment-groups', selects: { 'mwuVar1': 0, 'mwuVar2': 1 }, click: 'mwuCompute' },
  'wilcoxon':{ dataset: 'height-weight',  selects: { 'wilVar1': 0, 'wilVar2': 1 },   click: 'wilCompute' },
  'kw':      { dataset: 'treatment-groups', multiCheck: 'kwVars',                    click: 'kwCompute' },
  'friedman':{ dataset: 'treatment-groups', multiCheck: 'friedmanVars',              click: 'friedmanCompute' },
  'tukey':   { dataset: 'treatment-groups', multiCheck: 'tukeyVars',                 click: 'tukeyCompute' },
  'dunn':    { dataset: 'treatment-groups', multiCheck: 'dunnVars',                  click: 'dunnCompute' },
  'normality':{ dataset: 'exam-scores',   selects: { 'normVar': 0 },                 click: 'normCompute' },
  'effect':  { dataset: 'treatment-groups', selects: { 'effVar1': 0, 'effVar2': 2 }, click: 'effCompute' },
  'power':   { inputs: { 'powerEffect': 0.5, 'powerN': 30 },                         click: 'powerCompute' },
  'pvalue':  { inputs: { 'pvStat': 1.96, 'pvDf': 10, 'pvDf2': 20 },                  click: 'pvCompute' },
  'se':      { dataset: 'exam-scores',    selects: { 'seVar': 0 },                   click: 'seCompute' },
  'outliers':{ dataset: 'exam-scores',    selects: { 'outVar': 0 },                  click: 'outCompute' },
  'fisher':  { inputs: { 'fishA': 10, 'fishB': 2, 'fishC': 3, 'fishD': 15 },         click: 'fishCompute' },

  /* ===== ANOVA VARIANTS ===== */
  'one-way':  { dataset: 'treatment-groups', multiCheck: 'anovaVars',  click: 'anovaCompute' },
  'welch':    { dataset: 'treatment-groups', multiCheck: 'welchVars',  click: 'welchCompute' },
  'two-way':  { dataset: 'two-factor', selects: { 'twAvar': 0, 'twBvar': 1, 'twYvar': 2 }, click: 'twCompute' },
  'rm':       { dataset: 'treatment-groups', multiCheck: 'rmVars',     click: 'rmCompute' },

  /* ===== CHI-SQUARE VARIANTS ===== */
  'chi-indep': { click: 'chiLoadExample', followUp: 'chiIndepCompute' },
  'chi-gof':   { dataset: 'survey-responses', selects: { 'chiGofObs': 0, 'chiGofExp': 1 }, click: 'chiGofCompute' },

  /* ===== BAYESIAN ===== */
  'bayes':    { inputs: { 'bayesPrior': 0.01, 'bayesLik': 0.95, 'bayesFp': 0.05 }, click: 'bayesCompute' },
  'beta-bin': { inputs: { 'bbAlpha': 2, 'bbBeta': 5, 'bbK': 7, 'bbN': 10 }, click: 'bbCompute' },
  'mle':      { dataset: 'exam-scores', selects: { 'mleVar': 0 }, click: 'mleCompute' },
  'map':      { dataset: 'exam-scores', selects: { 'mapVar': 0 }, inputs: { 'mapAlpha': 2, 'mapBeta': 2 }, click: 'mapCompute' },

  /* ===== REGRESSION ===== */
  'linear':     { dataset: 'height-weight', selects: { 'regVarX': 0, 'regVarY': 1 },             click: 'regCompute' },
  'multiple':   { dataset: 'treatment-groups', multiCheck: 'multiPredictors', selects: { 'multiVarY': 2 }, click: 'multiCompute' },
  'exponential':{ dataset: 'height-weight', selects: { 'expVarX': 0, 'expVarY': 1 },             click: 'expCompute' },
  'quadratic':  { dataset: 'height-weight', selects: { 'quadVarX': 0, 'quadVarY': 1 },           click: 'quadCompute' },
  'logistic':   { dataset: 'logistic-pass', multiCheck: 'logitPredictors', selects: { 'logitVarY': 1 }, click: 'logitCompute' }
};

/* Inject "Try with sample data" buttons into every panel after render */
window.injectExampleButtons = function(container) {
  const panels = container.querySelectorAll('.sub-panel[id^="panel-"]');
  panels.forEach(panel => {
    const toolId = panel.id.replace('panel-', '');
    if (!window.TestExamples[toolId]) return;
    if (panel.querySelector('.try-example-btn')) return; // already injected
    const computeBtn = panel.querySelector('.btn-primary');
    if (!computeBtn) return;
    const tryBtn = document.createElement('button');
    tryBtn.type = 'button';
    tryBtn.className = 'btn btn-secondary try-example-btn';
    tryBtn.style.marginLeft = '8px';
    tryBtn.textContent = '▶ Try Example';
    tryBtn.title = 'Load sample data and run this test';
    tryBtn.addEventListener('click', () => window.runTestExample(toolId));
    computeBtn.insertAdjacentElement('afterend', tryBtn);
  });
};

/* Run an example for the given toolId */
window.runTestExample = function(toolId) {
  const ex = window.TestExamples && window.TestExamples[toolId];
  if (!ex) { Utils.toast('No example available for this test', 'warning'); return; }

  const finishAndClick = () => {
    if (ex.selects) {
      for (const [id, val] of Object.entries(ex.selects)) {
        const el = document.getElementById(id);
        if (el) { el.value = String(val); el.dispatchEvent(new Event('change', { bubbles: true })); }
      }
    }
    if (ex.inputs) {
      for (const [id, val] of Object.entries(ex.inputs)) {
        const el = document.getElementById(id);
        if (el) { el.value = String(val); el.dispatchEvent(new Event('input', { bubbles: true })); }
      }
    }
    if (ex.multiCheck) {
      const cbs = document.querySelectorAll(`#${ex.multiCheck} .multi-var-cb`);
      cbs.forEach(cb => { cb.checked = true; });
    }
    if (ex.click) {
      const btn = document.getElementById(ex.click);
      if (btn) btn.click();
    }
    if (ex.followUp) {
      setTimeout(() => {
        const btn = document.getElementById(ex.followUp);
        if (btn) btn.click();
      }, 100);
    }
  };

  if (ex.dataset) {
    DataManager.loadExample(ex.dataset);
    UI.renderDataInputPanel();
    // Need to re-render the active module so newly loaded columns appear in selectors
    const activeModule = AppState.activeModule || 'descriptive';
    UI.switchModule(activeModule);
    // Re-activate the same sub-tab and run example after re-render
    setTimeout(() => {
      const sidebarBtn = document.querySelector(`.hyp-test-btn[data-tab="${toolId}"]`);
      if (sidebarBtn) sidebarBtn.click();
      setTimeout(finishAndClick, 50);
    }, 50);
  } else {
    finishAndClick();
  }
};
